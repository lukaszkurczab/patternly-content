import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const architectureWorkflow = readFileSync(".github/workflows/content-publishing.yml", "utf8");
const realReleaseWorkflow = readFileSync(".github/workflows/real-content-release.yml", "utf8");

test("content workflows retain full technical-input history and clean locked installs", () => {
  assert.match(architectureWorkflow, /uses: actions\/checkout@v4\n        with:\n          fetch-depth: 0/);
  assert.equal((realReleaseWorkflow.match(/uses: actions\/checkout@v4\n        with:\n          fetch-depth: 0/g) ?? []).length, 1);
  assert.equal((realReleaseWorkflow.match(/cache-dependency-path: package-lock\.json/g) ?? []).length, 1);
  assert.equal((realReleaseWorkflow.match(/- run: npm ci/g) ?? []).length, 1);
  assert.ok(realReleaseWorkflow.indexOf("- run: npm ci") < realReleaseWorkflow.indexOf("Coding Interview validate hard gate"));
  assert.ok(realReleaseWorkflow.indexOf("Coding Interview validate hard gate") < realReleaseWorkflow.indexOf("Certification validate hard gate"));
  assert.ok(realReleaseWorkflow.indexOf("Certification validate hard gate") < realReleaseWorkflow.indexOf("Build isolated release candidate"));
  assert.doesNotMatch(realReleaseWorkflow, /build:real:(coding_interview|certification)/);
  assert.match(realReleaseWorkflow, /node scripts\/publishing\/ci-release-gate\.mjs/);
  assert.match(architectureWorkflow, /validate:bundled-free-node -- --input artifacts\/bundled-free-nodes\/coding-interview-dsa-problem-solving\/coding-interview-dsa-problem-solving-free-node-0001\/package\.json/);
  assert.match(architectureWorkflow, /validate:bundled-free-node -- --input artifacts\/bundled-free-nodes\/google-cloud-associate-cloud-engineer\/google-cloud-associate-cloud-engineer-free-node-0001\/package\.json/);
});
