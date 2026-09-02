import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import app from "./api";

const distDir = resolve(process.cwd(), "dist");
const indexPath = resolve(distDir, "index.html");

app.use("/*", serveStatic({ root: distDir }));

app.get("*", async (c) => {
  if (c.req.path.startsWith("/api/")) return c.notFound();

  try {
    const html = await readFile(indexPath, "utf8");
    return c.html(html);
  } catch {
    return c.text("Build output not found. Run `npm run build` first.", 500);
  }
});

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOST || "127.0.0.1";

serve(
  {
    fetch: app.fetch,
    port,
    hostname,
  },
  (info) => {
    console.log(`Web server listening on http://${info.address}:${info.port}`);
  },
);
