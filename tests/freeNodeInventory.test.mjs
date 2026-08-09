import assert from "node:assert/strict";
import test from "node:test";
import { readFile, rm, writeFile } from "node:fs/promises";
import { generateFreeNodeInventory, inventoryFromPinnedRelease, loadCanonicalFreeNodeInventoryPins, validateFreeNodeInventory, writeFreeNodeInventory } from "../scripts/product/free-node-inventory.mjs";
import { loadCanonicalTrackBriefs } from "../scripts/product/track-briefs.mjs";
import { PublishingFailure } from "../scripts/publishing/pipeline.mjs";

const fails = (code) => (error) => error instanceof PublishingFailure && error.code === code;
const clone = (value) => JSON.parse(JSON.stringify(value));
const release = async (id) => JSON.parse(await readFile(`artifacts/releases/${id}/release.json`, "utf8"));
const briefFor = async (trackId) => (await loadCanonicalTrackBriefs()).find((brief) => brief.trackId === trackId);
const pinFor = async (trackId) => (await loadCanonicalFreeNodeInventoryPins()).find((pin) => pin.trackId === trackId);

test("free-node inventories are deterministic, sorted, and pin the current verified release artifacts", async () => {
  const [coding, gcp] = await Promise.all([
    generateFreeNodeInventory({ releaseId: "patternly-core-0017", trackId: "coding-interview-dsa-problem-solving" }),
    generateFreeNodeInventory({ releaseId: "patternly-core-0016", trackId: "google-cloud-associate-cloud-engineer" })
  ]);
  assert.deepEqual({ trackId: coding.trackId, familyId: coding.familyId, freeNodeId: coding.freeNodeId, selector: coding.selector, release: coding.producer.releaseId, contentVersion: coding.producer.contentVersion, count: coding.itemCount }, { trackId: "coding-interview-dsa-problem-solving", familyId: "coding_interview", freeNodeId: "complexity_and_constraints", selector: { field: "taxonomy.roadmapNodeId", equals: "complexity_and_constraints" }, release: "patternly-core-0017", contentVersion: "coding-interview-dsa-problem-solving-0003", count: 158 });
  assert.deepEqual({ trackId: gcp.trackId, familyId: gcp.familyId, freeNodeId: gcp.freeNodeId, selector: gcp.selector, release: gcp.producer.releaseId, contentVersion: gcp.producer.contentVersion, count: gcp.itemCount }, { trackId: "google-cloud-associate-cloud-engineer", familyId: "certification", freeNodeId: "setup_environment", selector: { field: "domain", equals: "setup_environment" }, release: "patternly-core-0016", contentVersion: "gcp-ace-0015", count: 82 });
  for (const inventory of [coding, gcp]) {
    assert.deepEqual(inventory.items.map((item) => item.id), [...inventory.items.map((item) => item.id)].sort());
    assert.equal(new Set(inventory.items.map((item) => item.id)).size, inventory.itemCount);
  }
});

test("free-node inventory rejects a wrong node, a release-track mismatch, and a brief-track mismatch", async () => {
  const codingRelease = await release("patternly-core-0017");
  const codingBrief = await briefFor("coding-interview-dsa-problem-solving");
  const gcpBrief = await briefFor("google-cloud-associate-cloud-engineer");
  const codingPin = await pinFor("coding-interview-dsa-problem-solving");
  const gcpPin = await pinFor("google-cloud-associate-cloud-engineer");
  const missingNodeBrief = { ...codingBrief, freeNodeId: "not_a_real_node", packageContentPlan: { ...codingBrief.packageContentPlan, bundledFreeNodeId: "not_a_real_node" } };
  assert.throws(() => inventoryFromPinnedRelease({ release: codingRelease, releaseId: "patternly-core-0017", brief: missingNodeBrief, trackId: codingBrief.trackId, pin: codingPin }), fails("EMPTY_FREE_NODE"));
  assert.throws(() => inventoryFromPinnedRelease({ release: codingRelease, releaseId: "patternly-core-0017", brief: codingBrief, trackId: "google-cloud-associate-cloud-engineer", pin: codingPin }), fails("BRIEF_TRACK_MISMATCH"));
  assert.throws(() => inventoryFromPinnedRelease({ release: codingRelease, releaseId: "patternly-core-0017", brief: gcpBrief, trackId: "google-cloud-associate-cloud-engineer", pin: gcpPin }), fails("RELEASE_TRACK_MISMATCH"));
});

test("free-node inventory refuses checksum-tampered pinned artifacts", async () => {
  const sourceRelease = await release("patternly-core-0017");
  const codingBrief = await briefFor("coding-interview-dsa-problem-solving");
  const codingPin = await pinFor("coding-interview-dsa-problem-solving");
  const tamperedRelease = clone(sourceRelease);
  tamperedRelease.artifacts[0].checksumSha256 = "0".repeat(64);
  assert.throws(() => inventoryFromPinnedRelease({ release: tamperedRelease, releaseId: "patternly-core-0017", brief: codingBrief, trackId: "coding-interview-dsa-problem-solving", pin: codingPin }), fails("CHECKSUM_MISMATCH"));
});

test("free-node inventory allows only the exact canonical release pins", async () => {
  await assert.rejects(() => generateFreeNodeInventory({ releaseId: "patternly-core-0016", trackId: "coding-interview-dsa-problem-solving" }), fails("FREE_NODE_INVENTORY_PIN_MISMATCH"));
  const gcpBrief = await briefFor("google-cloud-associate-cloud-engineer");
  const gcpPin = await pinFor("google-cloud-associate-cloud-engineer");
  const mismatchedRelease = clone(await release("patternly-core-0016")); mismatchedRelease.manifest.releaseId = "patternly-core-0017";
  assert.throws(() => inventoryFromPinnedRelease({ release: mismatchedRelease, releaseId: "patternly-core-0017", brief: gcpBrief, trackId: gcpBrief.trackId, pin: gcpPin }), fails("FREE_NODE_INVENTORY_PIN_MISMATCH"));
});

test("free-node inventory validation detects fingerprint tampering and exact-set drift", async () => {
  const directory = "artifacts/free-node-inventories/test-free-node-inventory";
  try {
    const output = `${directory}/coding.json`;
    const created = await writeFreeNodeInventory({ releaseId: "patternly-core-0017", trackId: "coding-interview-dsa-problem-solving", outputPath: output });
    await assert.doesNotReject(() => validateFreeNodeInventory({ inventoryPath: output }));
    const fingerprintTamper = clone(created.inventory); fingerprintTamper.items[0].itemFingerprint = "0".repeat(64); await writeFile(output, JSON.stringify(fingerprintTamper));
    await assert.rejects(() => validateFreeNodeInventory({ inventoryPath: output }), fails("FREE_NODE_INVENTORY_MISMATCH"));
    const setTamper = clone(created.inventory); setTamper.items.pop(); setTamper.itemCount -= 1; await writeFile(output, JSON.stringify(setTamper));
    await assert.rejects(() => validateFreeNodeInventory({ inventoryPath: output }), fails("FREE_NODE_INVENTORY_MISMATCH"));
    const schemaTamper = clone(created.inventory); schemaTamper.unapprovedField = true; await writeFile(output, JSON.stringify(schemaTamper));
    await assert.rejects(() => validateFreeNodeInventory({ inventoryPath: output }), fails("INVALID_SCHEMA"));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
