import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const architectureWorkflow = readFileSync(".github/workflows/content-publishing.yml", "utf8");
const realReleaseWorkflow = readFileSync(".github/workflows/real-content-release.yml", "utf8");

test("content workflows retain full technical-input history and clean locked installs", () => {
  assert.match(architectureWorkflow, /uses: actions\/checkout@v4\n        with:\n          fetch-depth: 0/);
  assert.equal((realReleaseWorkflow.match(/uses: actions\/checkout@v4\n        with:\n          fetch-depth: 0/g) ?? []).length, 2);
  assert.equal((realReleaseWorkflow.match(/cache-dependency-path: package-lock\.json/g) ?? []).length, 2);
  assert.equal((realReleaseWorkflow.match(/- run: npm ci/g) ?? []).length, 2);
  assert.ok(realReleaseWorkflow.indexOf("- run: npm ci") < realReleaseWorkflow.indexOf("Algorithms validate hard gate"));
  assert.ok(realReleaseWorkflow.lastIndexOf("- run: npm ci") < realReleaseWorkflow.indexOf("Certification validate hard gate"));
});
