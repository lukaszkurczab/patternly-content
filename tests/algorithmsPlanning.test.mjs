import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";
import { generateAlgorithmsPlanning } from "../scripts/taxonomy/generate-algorithms-planning.mjs";

const ROOT = resolve(new URL("..", import.meta.url).pathname);

test("Algorithms planning is an exact projection of the canonical taxonomy", async () => {
  const result = await generateAlgorithmsPlanning();
  assert.deepEqual(result, { nodePlanCount: 26, stubCount: 213, outputCount: 243 });
  const nodeIndex = JSON.parse(await readFile(join(ROOT, "planning/algorithms/node-authoring-index.json"), "utf8"));
  const stubIndex = JSON.parse(await readFile(join(ROOT, "planning/algorithms/question-stub-index.json"), "utf8"));
  assert.equal(nodeIndex.taxonomyVersion, "algorithms-taxonomy-v2");
  assert.equal(nodeIndex.nodes.length, 26);
  assert.equal(stubIndex.stubs.length, 213);
  assert.deepEqual(stubIndex.stubs.reduce((counts, stub) => ({ ...counts, [stub.unitKind]: (counts[stub.unitKind] ?? 0) + 1 }), {}), { direct: 165, strategy: 8, contrast: 40 });
});

test("Algorithms planning creates no canonical source batches", async () => {
  const entries = await readdir(join(ROOT, "manual/source/algorithms"), { withFileTypes: true });
  assert.deepEqual(entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json")).map((entry) => entry.name), []);
});
