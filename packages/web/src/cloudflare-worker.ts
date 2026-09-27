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

export default {
  async fetch(request: Request, env: CloudflareEnv, executionCtx: unknown) {
    configureCloudflareStorage(env.APP_STORAGE);
    await ensureSeedContent(env);

    const url = new URL(request.url);

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
