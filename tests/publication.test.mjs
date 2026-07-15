import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ROOT, validatePublication } from "../scripts/validate.mjs";

test("the published content validates", async () => {
  const root = await validatePublication();
  assert.deepEqual(root.tracks.map((track) => track.trackId), ["algorithms", "cloud-certification"]);
});

test("published bank manifests have the authoritative counts", async () => {
  const algorithms = JSON.parse(await readFile(resolve(ROOT, "tracks/algorithms/manifest.json"), "utf8"));
  const certification = JSON.parse(await readFile(resolve(ROOT, "tracks/cloud-certification/manifest.json"), "utf8"));
  assert.equal(algorithms.itemCount, 1683);
  assert.equal(certification.itemCount, 360);
});
