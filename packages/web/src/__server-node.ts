import { chmod, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { createAdaptorServer } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import app from "./api";

const distDir = resolve(process.cwd(), "dist");
const indexPath = resolve(distDir, "index.html");

function stripTrackingFromAdmin(html: string) {
  return html
    .replace(/\s*<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->\s*/g, "\n")
    .replace(/\s*<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->\s*/g, "\n")
    .replace(/\s*<!-- Meta Pixel Code -->[\s\S]*?<!-- End Meta Pixel Code -->\s*/g, "\n")
    .replace(/\s*<!-- Meta Pixel Code \(noscript\) -->[\s\S]*?<!-- End Meta Pixel Code \(noscript\) -->\s*/g, "\n");
}

app.use("/*", serveStatic({ root: distDir }));

app.get("*", async (c) => {
  if (c.req.path.startsWith("/api/")) return c.notFound();

  try {
    const html = await readFile(indexPath, "utf8");
    const responseHtml = c.req.path.startsWith("/admin") ? stripTrackingFromAdmin(html) : html;
    return c.html(responseHtml);
  } catch {
    return c.text("Build output not found. Run `npm run build` first.", 500);
  }
});

const listenTarget = process.env.PORT || "3000";
const server = createAdaptorServer({ fetch: app.fetch });

if (/^\d+$/.test(listenTarget)) {
  const port = Number(listenTarget);
  const hostname = process.env.HOST || "127.0.0.1";

  server.listen(port, hostname, () => {
    console.log(`Web server listening on http://${hostname}:${port}`);
  });
} else {
  await rm(listenTarget, { force: true });

  server.listen(listenTarget, async () => {
    await chmod(listenTarget, 0o777);
    console.log(`Web server listening on socket ${listenTarget}`);
  });
}
