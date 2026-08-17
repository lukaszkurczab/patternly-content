import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stat } from "node:fs/promises";
import test from "node:test";

const architectureWorkflow = readFileSync(".github/workflows/content-publishing.yml", "utf8");
const realReleaseWorkflow = readFileSync(".github/workflows/real-content-release.yml", "utf8");
const freeNodeInventory = readFileSync("scripts/product/free-node-inventory.mjs", "utf8");
const freeNodePins = readFileSync("config/free-node-inventory-pins.json", "utf8");
const bundledPackages = readFileSync("config/bundled-free-node-packages.json", "utf8");
const readiness = JSON.parse(readFileSync("evidence/readiness/eight-track-launch-readiness.json", "utf8"));

test("content workflows retain full technical-input history and clean locked installs", () => {
  assert.match(architectureWorkflow, /uses: actions\/checkout@v4\n        with:\n          fetch-depth: 0/);
  assert.equal((realReleaseWorkflow.match(/uses: actions\/checkout@v4\n        with:\n          fetch-depth: 0/g) ?? []).length, 1);
  assert.equal((realReleaseWorkflow.match(/cache-dependency-path: package-lock\.json/g) ?? []).length, 1);
  assert.equal((realReleaseWorkflow.match(/- run: npm ci/g) ?? []).length, 1);
  assert.ok(realReleaseWorkflow.indexOf("- run: npm ci") < realReleaseWorkflow.indexOf("Coding Interview validate hard gate"));
  assert.ok(realReleaseWorkflow.indexOf("Coding Interview validate hard gate") < realReleaseWorkflow.indexOf("Build isolated release candidate"));
  assert.doesNotMatch(realReleaseWorkflow, /build:real:(coding_interview|certification)/);
  assert.match(realReleaseWorkflow, /node scripts\/publishing\/ci-release-gate\.mjs/);
  assert.match(architectureWorkflow, /validate:bundled-free-node -- --input artifacts\/bundled-free-nodes\/coding-interview-dsa-problem-solving\/coding-interview-dsa-problem-solving-free-node-0001\/package\.json/);
  assert.doesNotMatch(`${architectureWorkflow}\n${realReleaseWorkflow}`, /google-cloud-associate-cloud-engineer|gcp-ace/);
  assert.doesNotMatch(`${freeNodeInventory}\n${freeNodePins}\n${bundledPackages}`, /google-cloud-associate-cloud-engineer|gcp-ace/);
});

test("GCP authoring ingress is canonical while runtime selectors and old paths remain absent", async () => {
  await assert.doesNotReject(() => stat("manual/source/google-cloud-associate-cloud-engineer/compute_platform_selection_and_accelerator_fit/GCPACE-N06-B01.json"));
  for (const path of [
    "manual/source/google-cloud-associate-cloud-engineer/gcp-ace-0001.json",
    "manual/source/google-cloud-associate-cloud-engineer/README.md",
    "config/tracks/google-cloud-associate-cloud-engineer.json",
    "config/taxonomy/google-cloud-associate-cloud-engineer.json",
    "config/free-node-experience-profiles/google-cloud-associate-cloud-engineer.json",
    "evidence/curriculum/2026.08.09/gcp-old-source-inventory.json",
    "manual/source/google-cloud-associate-cloud-engineer/setup_environment/compute_execution_model_selection.json",
  ]) await assert.rejects(() => stat(path), (error) => error?.code === "ENOENT");
  await assert.doesNotReject(() => stat("artifacts/releases/patternly-core-0018/release.json"));
  await assert.doesNotReject(() => stat("artifacts/tracks/google-cloud-associate-cloud-engineer/gcp-ace-0016/track-artifact.json"));
});

test("readiness reports only a current immutable artifact whose inputs still match HEAD", () => {
  const az = readiness.tracks.find((track) => track.trackId === "microsoft-azure-administrator-associate-az-104");
  const gcp = readiness.tracks.find((track) => track.trackId === "google-cloud-associate-cloud-engineer");
  assert.deepEqual(az?.immutableArtifact, {
    checksumSha256: "968386e75c9abd4b54401e9876dadba6c0dbd01003aea8cfcad3a8d7027569ec",
    presence: "verified",
    releaseId: "patternly-az104-0001",
    sourceRepositoryCommit: "67437fa377b4021fb1a4764095fa16e6048641a2",
    version: "microsoft-azure-administrator-associate-az-104-authoring-v2026.08.15",
  });
  assert.equal(gcp?.immutableArtifact?.presence, "not_verified_by_source-only-report");
});

test("readiness records the result of every canonical technical validator", () => {
  for (const track of readiness.tracks) {
    assert.equal(track.structuralValidation?.result, "passed", track.trackId);
    assert.match(track.structuralValidation?.command ?? "", /^npm run /u);
  }
});
