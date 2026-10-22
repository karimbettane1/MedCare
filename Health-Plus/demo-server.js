const http = require("http");
const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "build");
const prefix = "/MedCare";
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (!urlPath.startsWith(prefix)) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    urlPath = urlPath.slice(prefix.length) || "/";
    if (urlPath === "/") urlPath = "/index.html";
    const filePath = path.join(buildDir, urlPath);
    if (!filePath.startsWith(buildDir)) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        fs.readFile(path.join(buildDir, "index.html"), (e2, html) => {
          if (e2) {
            res.writeHead(404);
            res.end("not found");
            return;
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(html);
        });
        return;
      }
      res.writeHead(200, { "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(3210, () => console.log("serveur démo sur http://localhost:3210/MedCare/"));
