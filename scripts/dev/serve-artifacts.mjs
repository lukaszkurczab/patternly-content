import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import { ROOT } from "../publishing/pipeline.mjs";
const base = resolve(ROOT, "artifacts"); const port = Number(process.env.PORT ?? 4173);
createServer(async (request, response) => { const raw = decodeURIComponent((request.url ?? "/").split("?", 1)[0]); const target = resolve(base, `.${raw}`); const rel = relative(base, target); try { if (request.method !== "GET" || rel === "" || rel === ".." || rel.startsWith(`..${sep}`) || !(await stat(target)).isFile()) throw new Error("not found"); response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }).end(await readFile(target)); } catch { response.writeHead(404).end("Not found"); } }).listen(port, "127.0.0.1", () => console.log(`Dev artifact preview: http://127.0.0.1:${port}`));
