import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const archivalEvidenceValidator = "scripts/content/verify-migration.mjs";

async function files(directory) {
  const entries = await readdir(join(root, directory), { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? files(join(directory, entry.name))
    : [join(directory, entry.name)]))).flat();
}

test("active canonical ingress cannot read the retired manual source tree", async () => {
  await assert.rejects(stat(join(root, "manual", "source")), { code: "ENOENT" });

  const executablePaths = ["package.json", ...await files("scripts")];
  const references = [];
  for (const relativePath of executablePaths) {
    const source = await readFile(join(root, relativePath), "utf8");
    if (source.includes("manual/source")) references.push(relativePath);
  }

  assert.deepEqual(references, [archivalEvidenceValidator]);
  const evidenceValidator = await readFile(join(root, archivalEvidenceValidator), "utf8");
  assert.match(evidenceValidator, /EVIDENCE_VALUE/);
  assert.doesNotMatch(evidenceValidator, /join\([^\n]*manual["']\s*,\s*["']source/);
});
