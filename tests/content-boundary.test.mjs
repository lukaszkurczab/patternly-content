import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

async function files(directory) {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? files(path.join(directory, entry.name))
    : [path.join(directory, entry.name)]))).flat();
}

async function retainedTests() {
  return (await files("tests")).filter((relativePath) => relativePath.endsWith(".test.mjs")
    && relativePath !== "tests/content-boundary.test.mjs");
}

test("normal source and test entrypoints have no dependency on evidence or artifact archives", async () => {
  const paths = ["package.json", ...await files("scripts"), ...await files(".github/workflows"), ...await retainedTests()];
  const references = [];
  for (const relativePath of paths) {
    const source = await readFile(path.join(root, relativePath), "utf8");
    if (/(?:^|[/\\])(?:evidence|artifacts)(?:[/\\]|$)/u.test(source) || /reports\/candidate-reconciliation/u.test(source)) references.push(relativePath);
  }
  assert.deepEqual(references, []);
});

test("retired archive validators and admission workflows are absent from public entrypoints", async () => {
  const obsolete = [
    "scripts/content/verify-migration.mjs",
    "scripts/content/verify-gcp-attribution-history.mjs",
    "scripts/review/candidate-draft-v2.mjs",
    "scripts/review/candidate-readiness-v2.mjs",
    "scripts/review/candidate-release-gate-v2.mjs",
    "scripts/review/candidate-admission-v3.mjs",
    "scripts/review/candidate-manifest.mjs",
    "scripts/product/validate-bundled-free-nodes.mjs",
  ];
  for (const relativePath of obsolete) {
    await assert.rejects(readFile(path.join(root, relativePath)), { code: "ENOENT" }, relativePath);
  }
});


test("retired producer archive roots remain absent", async () => {
  for (const directory of ["evidence", "artifacts"]) {
    await assert.rejects(readdir(path.join(root, directory)), { code: "ENOENT" }, directory);
  }
});
