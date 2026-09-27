import app from "./api";
import seedContent from "../data/site-content.json";
import {
  configureCloudflareStorage,
  type R2BucketLike,
} from "./api/cloudflare-storage";

type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type CloudflareEnv = {
  APP_STORAGE: R2BucketLike;
  ASSETS: AssetsBinding;
};

type LegacyLead = {
  id?: string;
  [key: string]: unknown;
};

type LegacyOrder = {
  orderReference?: string;
  [key: string]: unknown;
};

type LegacyPayload = {
  content?: unknown;
  leads?: LegacyLead[];
  orders?: LegacyOrder[];
};

const CONTENT_KEY = "content/site-content.json";
let seedPromise: Promise<void> | null = null;

function ensureSeedContent(env: CloudflareEnv) {
  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await env.APP_STORAGE.head(CONTENT_KEY);
      if (!existing) {
        await env.APP_STORAGE.put(
          CONTENT_KEY,
          `${JSON.stringify(seedContent, null, 2)}\n`,
          { httpMetadata: { contentType: "application/json; charset=utf-8" } },
        );
      }
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  return seedPromise;
}

function stripTrackingFromAdmin(html: string) {
  return html
    .replace(/\s*<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->\s*/g, "\n")
    .replace(/\s*<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->\s*/g, "\n")
    .replace(/\s*<!-- Meta Pixel Code -->[\s\S]*?<!-- End Meta Pixel Code -->\s*/g, "\n")
    .replace(/\s*<!-- Meta Pixel Code \(noscript\) -->[\s\S]*?<!-- End Meta Pixel Code \(noscript\) -->\s*/g, "\n");
}

function migrationAuthorized(request: Request) {
  const expected = process.env.MIGRATION_SECRET?.trim();
  const provided = request.headers.get("x-migration-secret")?.trim();
  return Boolean(expected && provided && expected === provided);
}

async function putJson(env: CloudflareEnv, key: string, value: unknown) {
  await env.APP_STORAGE.put(key, `${JSON.stringify(value, null, 2)}\n`, {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
  });
}

async function writeInBatches(tasks: Array<() => Promise<void>>, batchSize = 40) {
  for (let index = 0; index < tasks.length; index += batchSize) {
    await Promise.all(tasks.slice(index, index + batchSize).map((task) => task()));
  }
}

async function handleLegacyImport(request: Request, env: CloudflareEnv) {
  if (!migrationAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as LegacyPayload | null;
  if (!payload || typeof payload !== "object") {
    return Response.json({ error: "Invalid migration payload" }, { status: 400 });
  }

  if (payload.content && typeof payload.content === "object") {
    await putJson(env, CONTENT_KEY, payload.content);
  }

  const leads = Array.isArray(payload.leads) ? payload.leads : [];
  const orders = Array.isArray(payload.orders) ? payload.orders : [];
  const tasks: Array<() => Promise<void>> = [];

  for (const lead of leads) {
    if (!lead?.id || !/^[a-zA-Z0-9._-]+$/.test(lead.id)) continue;
    tasks.push(() => putJson(env, `leads/${lead.id}.json`, lead));
  }

  for (const order of orders) {
    if (!order?.orderReference || !/^[a-zA-Z0-9._-]+$/.test(order.orderReference)) continue;
    tasks.push(() => putJson(env, `orders/${order.orderReference}.json`, order));
  }

  await writeInBatches(tasks);

  return Response.json({
    ok: true,
    content: Boolean(payload.content),
    leads: leads.length,
    orders: orders.length,
  });
}

async function handleLegacyMediaImport(request: Request, env: CloudflareEnv) {
  if (!migrationAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const requestedName = String(form.get("name") || (file instanceof File ? file.name : ""));

  if (!(file instanceof File) || !/^[a-zA-Z0-9._-]+$/.test(requestedName)) {
    return Response.json({ error: "Invalid file" }, { status: 400 });
  }

  if (file.size > 8_000_000) {
    return Response.json({ error: "File is too large" }, { status: 413 });
  }

  await env.APP_STORAGE.put(`media/${requestedName}`, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type || "application/octet-stream",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return Response.json({ ok: true, name: requestedName });
}

export default {
  async fetch(request: Request, env: CloudflareEnv, executionCtx: unknown) {
    configureCloudflareStorage(env.APP_STORAGE);
    await ensureSeedContent(env);

    const url = new URL(request.url);

    if (url.pathname === "/api/_migration/import" && request.method === "POST") {
      return handleLegacyImport(request, env);
    }

    if (url.pathname === "/api/_migration/media" && request.method === "POST") {
      return handleLegacyMediaImport(request, env);
    }

    if (url.pathname.startsWith("/api/")) {
      return app.fetch(request, env, executionCtx);
    }

    if (url.pathname.startsWith("/admin")) {
      const response = await env.ASSETS.fetch(request);
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) return response;

      const headers = new Headers(response.headers);
      headers.set("Content-Type", "text/html; charset=utf-8");
      headers.set("Cache-Control", "no-store");

      return new Response(stripTrackingFromAdmin(await response.text()), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
