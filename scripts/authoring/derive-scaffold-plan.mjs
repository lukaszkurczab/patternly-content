import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildManifest, canonicalJson, ROOT } from "./lib/model.mjs";
import { validateManifest } from "./lib/contracts.mjs";

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const result = await buildManifest(ROOT, { generatedAt: process.env.AUTHORING_AUDIT_DATE ?? new Date().toISOString().slice(0, 10) });
validateManifest(result.manifest, result.model);
const output = option("--out", join(ROOT, "evidence", "authoring", `${result.manifest.generatedAt.replaceAll("-", ".")}-${result.manifest.startingSha.slice(0, 8)}`, "scaffold-manifest.json"));
await mkdir(join(output, ".."), { recursive: true });
await writeFile(output, canonicalJson(result.manifest));
console.log(`Wrote ${output}`);
console.log(`Gate: ${result.manifest.gateResult}; tracks=${result.manifest.trackCount}; input=${result.auditInputFingerprint}`);
