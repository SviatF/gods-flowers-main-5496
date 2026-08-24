import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Context, Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

const SESSION_COOKIE = "gf_admin";
const MAX_CONTENT_BYTES = 2_000_000;
const MAX_IMAGE_BYTES = 8_000_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const defaultContentPath = fileURLToPath(
  new URL("../../data/site-content.json", import.meta.url),
);
const defaultUploadDir = fileURLToPath(new URL("../../data/uploads", import.meta.url));

const contentPath = process.env.CONTENT_FILE_PATH || defaultContentPath;
const uploadDir = process.env.UPLOAD_DIR || defaultUploadDir;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function passwordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function createSession() {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

function validSession(token?: string) {
  if (!token || !passwordConfigured()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}

async function readContent() {
  const raw = await readFile(contentPath, "utf8");
  return JSON.parse(raw) as unknown;
}

async function saveContent(content: unknown) {
  const raw = JSON.stringify(content, null, 2);
  if (Buffer.byteLength(raw) > MAX_CONTENT_BYTES) {
    throw new Error("Content payload is too large");
  }
  await mkdir(dirname(contentPath), { recursive: true });
  await writeFile(contentPath, `${raw}\n`, "utf8");
}

function auth(c: Context) {
  return validSession(getCookie(c, SESSION_COOKIE));
}

function extensionFor(file: File) {
  const byType: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  return byType[file.type] || extname(file.name).toLowerCase() || ".bin";
}

export function registerAdminContentRoutes(app: Hono) {
  app.get("/api/site-content", async (c) => {
    try {
      return c.json(await readContent(), 200, { "Cache-Control": "no-store" });
    } catch {
      return c.json({ error: "Site content file is unavailable" }, 500);
    }
  });

  app.get("/api/admin/session", (c) => {
    if (!passwordConfigured()) {
      return c.json({ authenticated: false, configured: false }, 503);
    }
    return c.json({
      authenticated: validSession(getCookie(c, SESSION_COOKIE)),
      configured: true,
    });
  });

  app.post("/api/admin/login", async (c) => {
    if (!passwordConfigured()) {
      return c.json({ error: "ADMIN_PASSWORD is not configured" }, 503);
    }

    const body = await c.req.json<{ password?: string }>().catch(() => ({}));
    if (!body.password || !safeEqual(body.password, process.env.ADMIN_PASSWORD!)) {
      return c.json({ error: "Невірний пароль" }, 401);
    }

    setCookie(c, SESSION_COOKIE, createSession(), {
      httpOnly: true,
      sameSite: "Lax",
      secure: new URL(c.req.url).protocol === "https:",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return c.json({ authenticated: true });
  });

  app.post("/api/admin/logout", (c) => {
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
    return c.json({ ok: true });
  });

  app.put("/api/admin/content", async (c) => {
    if (!auth(c)) return c.json({ error: "Unauthorized" }, 401);

    const content = await c.req.json().catch(() => null);
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return c.json({ error: "Invalid content payload" }, 400);
    }

    const required = ["brand", "nav", "hero", "advantages", "courses", "cases", "consultation", "lead"];
    if (required.some((key) => !(key in content))) {
      return c.json({ error: "Content payload is incomplete" }, 400);
    }

    try {
      await saveContent(content);
      return c.json({ ok: true, savedAt: new Date().toISOString() });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Save failed" }, 500);
    }
  });

  app.post("/api/admin/upload", async (c) => {
    if (!auth(c)) return c.json({ error: "Unauthorized" }, 401);

    const form = await c.req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return c.json({ error: "File is required" }, 400);
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) return c.json({ error: "Unsupported image type" }, 400);
    if (file.size > MAX_IMAGE_BYTES) return c.json({ error: "Image must be smaller than 8 MB" }, 400);

    await mkdir(uploadDir, { recursive: true });
    const name = `${Date.now()}-${crypto.randomUUID()}${extensionFor(file)}`;
    await writeFile(join(uploadDir, name), Buffer.from(await file.arrayBuffer()));
    return c.json({ path: `/api/media/${name}` });
  });

  app.get("/api/media/:name", async (c) => {
    const name = c.req.param("name");
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) return c.notFound();

    try {
      const data = await readFile(join(uploadDir, name));
      const ext = extname(name).toLowerCase();
      const type = ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".gif"
            ? "image/gif"
            : "image/jpeg";
      return new Response(data, {
        headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
      });
    } catch {
      return c.notFound();
    }
  });
}
