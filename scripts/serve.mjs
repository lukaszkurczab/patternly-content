import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "0.0.0.0";

function fileFor(url) {
  const rawPathname = (url.split("?", 1)[0] || "/").split("#", 1)[0];
  const pathname = decodeURIComponent(rawPathname);
  if (pathname.split("/").includes("..")) return null;
  const target = resolve(root, `.${pathname}`);
  const rel = relative(root, target);
  if (rel === "" || rel.startsWith(`..${sep}`) || rel === "..") return null;
  return target;
}

createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405).end();
    return;
  }
  const path = fileFor(request.url ?? "/");
  try {
    if (!path || !(await stat(path)).isFile()) throw new Error("not found");
    const headers = { "Content-Type": path.endsWith(".json") ? "application/json; charset=utf-8" : "application/octet-stream", "Cache-Control": "no-store" };
    response.writeHead(200, headers);
    if (request.method === "HEAD") response.end(); else response.end(await readFile(path));
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(port, host, () => console.log(`Patternly content root manifest: http://127.0.0.1:${port}/manifest.json`));
