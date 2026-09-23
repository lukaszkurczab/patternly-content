import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const historicalEvidenceValidators = [
  "scripts/content/verify-migration.mjs",
  "scripts/review/candidate-manifest.mjs",
  "scripts/review/content-acceptance-baseline.mjs",
];

async function files(directory) {
  const entries = await readdir(join(root, directory), { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? files(join(directory, entry.name))
    : [join(directory, entry.name)]))).flat();
}

test("active canonical ingress has no legacy publisher and historical references are verifier-only", async () => {
  await assert.rejects(stat(join(root, "manual", "source")), { code: "ENOENT" });
  await assert.rejects(access(join(root, "scripts", "publishing", "pipeline.mjs")), { code: "ENOENT" });
  await assert.rejects(access(join(root, "scripts", "authoring", "lib", "model.mjs")), { code: "ENOENT" });
  await assert.rejects(access(join(root, "schemas", "publishing")), { code: "ENOENT" });

  const executablePaths = ["package.json", ...await files(join("scripts", "content")), ...await files(join("scripts", "review"))];
  const references = [];
  for (const relativePath of executablePaths) {
    const source = await readFile(join(root, relativePath), "utf8");
    if (source.includes("manual/source")) references.push(relativePath);
  }

  assert.deepEqual(references, historicalEvidenceValidators);
  const evidenceValidator = await readFile(join(root, "scripts/content/verify-migration.mjs"), "utf8");
  assert.match(evidenceValidator, /EVIDENCE_VALUE/);
  assert.doesNotMatch(evidenceValidator, /join\([^\n]*manual["']\s*,\s*["']source/);
  const historicalArtifactValidator = await readFile(join(root, "scripts/review/historical-artifact-evidence.mjs"), "utf8");
  assert.match(historicalArtifactValidator, /verifyHistoricalArtifactEvidence/);
  assert.doesNotMatch(historicalArtifactValidator, /discoverSourceBatches|buildTrack|publishRelease|readdir|readFile/);
  for (const relativePath of ["scripts/review/candidate-manifest.mjs", "scripts/review/content-acceptance-baseline.mjs", "scripts/review/content-approval.mjs"]) {
    const source = await readFile(join(root, relativePath), "utf8");
    assert.doesNotMatch(source, /summarizeSource|verifyCurrentSource|legacySourceAvailable/);
  }
});
