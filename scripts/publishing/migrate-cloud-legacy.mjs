import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, hash } from "./pipeline.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const legacyCommit = "d8f94a6^";
const legacyPath = "tracks/cloud-certification/banks/gcp-ace-0001.json";
const output = join(root, "manual/source/cloud-certification/gcp-ace-0001.json");

function gitShow() {
  return new Promise((resolve, reject) => execFile("git", ["show", `${legacyCommit}:${legacyPath}`], { cwd: root }, (error, stdout) => error ? reject(error) : resolve(stdout)));
}

const legacy = JSON.parse(await gitShow());
if (legacy.trackId !== "cloud-certification" || legacy.familyId !== "certification" || legacy.contentVersion !== "gcp-ace-0001" || !Array.isArray(legacy.items) || legacy.items.length !== 360) throw new Error("Historical Cloud bank identity is not the expected 360-item release.");
const source = {
  schemaVersion: "certification-manual-source-v1",
  batchId: "gcp-ace-0001",
  trackId: legacy.trackId,
  familyId: legacy.familyId,
  contentVersion: legacy.contentVersion,
  taxonomyVersion: "cloud-certification-taxonomy-v1",
  declaredModes: ["cloud-practice", "cloud-exam-simulation", "cloud-review"],
  items: legacy.items,
};
await mkdir(dirname(output), { recursive: true });
await writeFile(output, canonicalJson(source));
console.log(JSON.stringify({ output, itemCount: source.items.length, legacySha256: hash(JSON.stringify(legacy.items)), sourceSha256: hash(canonicalJson(source)) }, null, 2));
