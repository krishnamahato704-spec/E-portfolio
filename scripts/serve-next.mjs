import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { brotliCompressSync, gzipSync } from "node:zlib";

const root = path.resolve(import.meta.dirname, "..", "dist");
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

http
  .createServer(async (request, response) => {
    try {
      if (!["GET", "HEAD"].includes(request.method)) {
        response.writeHead(405, { Allow: "GET, HEAD" }).end();
        return;
      }
      const url = new URL(request.url, "http://localhost");
      const pathname = decodeURIComponent(url.pathname).replace(
        /^\/E-portfolio(?=\/|$)/,
        "",
      );
      let target = path.resolve(root, `.${pathname || "/"}`);
      if (
        (target !== root && !target.startsWith(root + path.sep)) ||
        pathname.includes("/.")
      ) {
        response.writeHead(403).end();
        return;
      }
      if ((await stat(target)).isDirectory()) {
        if (!url.pathname.endsWith("/")) {
          response
            .writeHead(301, { Location: `${url.pathname}/${url.search}` })
            .end();
          return;
        }
        target = path.join(target, "index.html");
      }
      let body = await readFile(target);
      const type = types[path.extname(target)] || "application/octet-stream";
      const headers = {
        "Content-Type": type,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": pathname.includes("/_next/static/")
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      };
      if (/^(text\/|application\/(json|xml))/.test(type)) {
        headers.Vary = "Accept-Encoding";
        const accept = request.headers["accept-encoding"] || "";
        if (accept.includes("br")) {
          body = brotliCompressSync(body);
          headers["Content-Encoding"] = "br";
        } else if (accept.includes("gzip")) {
          body = gzipSync(body);
          headers["Content-Encoding"] = "gzip";
        }
      }
      headers["Content-Length"] = body.length;
      response
        .writeHead(200, headers)
        .end(request.method === "HEAD" ? undefined : body);
    } catch {
      const body = await readFile(path.join(root, "404.html")).catch(
        () => "Not found",
      );
      response
        .writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
        .end(request.method === "HEAD" ? undefined : body);
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Portfolio preview: http://127.0.0.1:${port}/E-portfolio/`),
  );
