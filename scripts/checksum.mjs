import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export async function sha256File(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const path = process.argv[2];
  if (!path) throw new Error("Usage: node scripts/checksum.mjs <file>");
  console.log(await sha256File(path));
}
