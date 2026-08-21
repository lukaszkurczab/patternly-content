import assert from "node:assert/strict";
import test from "node:test";
import { readFile, rm, writeFile } from "node:fs/promises";
import { generateFreeNodeInventory, inventoryFromPinnedRelease, loadCanonicalFreeNodeInventoryPins, validateFreeNodeInventory, verifyPinnedTechnicalEvidence, writeFreeNodeInventory } from "../scripts/product/free-node-inventory.mjs";
import { loadCanonicalTrackBriefs } from "../scripts/product/track-briefs.mjs";
import { PublishingFailure } from "../scripts/publishing/pipeline.mjs";

const fails = (code) => (error) => error instanceof PublishingFailure && error.code === code;
const clone = (value) => JSON.parse(JSON.stringify(value));
const release = async (id) => JSON.parse(await readFile(`artifacts/releases/${id}/release.json`, "utf8"));
const briefFor = async (trackId) => (await loadCanonicalTrackBriefs()).find((brief) => brief.trackId === trackId);
const pinFor = async (trackId) => (await loadCanonicalFreeNodeInventoryPins()).find((pin) => pin.trackId === trackId);

test("the active free-node inventory is deterministic, sorted, and pinned to its verified release artifact", async () => {
  const coding = await generateFreeNodeInventory({ releaseId: "patternly-launch-2026-08-21-01", trackId: "coding-interview-dsa-problem-solving" });
  assert.deepEqual({ trackId: coding.trackId, familyId: coding.familyId, freeNodeId: coding.freeNodeId, selector: coding.selector, release: coding.producer.releaseId, contentVersion: coding.producer.contentVersion, count: coding.itemCount }, { trackId: "coding-interview-dsa-problem-solving", familyId: "coding_interview", freeNodeId: "complexity_and_constraints", selector: { field: "taxonomy.roadmapNodeId", equals: "complexity_and_constraints" }, release: "patternly-launch-2026-08-21-01", contentVersion: "coding-interview-dsa-problem-solving-0004", count: 158 });
  assert.deepEqual(coding.items.map((item) => item.id), [...coding.items.map((item) => item.id)].sort());
  assert.equal(new Set(coding.items.map((item) => item.id)).size, coding.itemCount);
});

test("free-node inventory rejects a wrong node, a release-track mismatch, and a brief-track mismatch", async () => {
  const codingRelease = await release("patternly-launch-2026-08-21-01");
  const codingBrief = await briefFor("coding-interview-dsa-problem-solving");
  const codingPin = await pinFor("coding-interview-dsa-problem-solving");
  const missingNodeBrief = { ...codingBrief, freeNodeId: "not_a_real_node", packageContentPlan: { ...codingBrief.packageContentPlan, bundledFreeNodeId: "not_a_real_node" } };
  assert.throws(() => inventoryFromPinnedRelease({ release: codingRelease, releaseId: "patternly-launch-2026-08-21-01", brief: missingNodeBrief, trackId: codingBrief.trackId, pin: codingPin }), fails("EMPTY_FREE_NODE"));
  assert.throws(() => inventoryFromPinnedRelease({ release: codingRelease, releaseId: "patternly-launch-2026-08-21-01", brief: codingBrief, trackId: "google-cloud-associate-cloud-engineer", pin: codingPin }), fails("BRIEF_TRACK_MISMATCH"));
});

test("free-node inventory refuses checksum-tampered pinned artifacts", async () => {
  const sourceRelease = await release("patternly-launch-2026-08-21-01");
  const codingBrief = await briefFor("coding-interview-dsa-problem-solving");
  const codingPin = await pinFor("coding-interview-dsa-problem-solving");
  const tamperedRelease = clone(sourceRelease);
  tamperedRelease.artifacts.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving").checksumSha256 = "0".repeat(64);
  assert.throws(() => inventoryFromPinnedRelease({ release: tamperedRelease, releaseId: "patternly-launch-2026-08-21-01", brief: codingBrief, trackId: "coding-interview-dsa-problem-solving", pin: codingPin }), fails("CHECKSUM_MISMATCH"));
});

test("free-node inventory allows only the exact canonical release pins", async () => {
  await assert.rejects(() => generateFreeNodeInventory({ releaseId: "patternly-core-0016", trackId: "coding-interview-dsa-problem-solving" }), fails("FREE_NODE_INVENTORY_PIN_MISMATCH"));
  const backend = await generateFreeNodeInventory({ releaseId: "patternly-launch-2026-08-21-01", trackId: "backend-system-design-interview" });
  assert.equal(backend.itemCount, 145);
});

test("free-node inventory pins verify exact owned technical-evidence bytes and internal identity", async () => {
  for (const trackId of ["coding-interview-dsa-problem-solving"]) {
    const pin = await pinFor(trackId); const bytes = await readFile(pin.technicalEvidencePath);
    const verified = verifyPinnedTechnicalEvidence({ pin, bytes });
    assert.equal(verified.fileSha256, pin.technicalEvidenceFileSha256);
    assert.equal(verified.identitySha256, pin.technicalEvidenceIdentitySha256);
    assert.ok(verified.evidence.technicalEvidence.every((entry) => entry.result === "passed" && entry.technicalInputFingerprint === pin.technicalInputFingerprint));
    assert.throws(() => verifyPinnedTechnicalEvidence({ pin, bytes: Buffer.concat([bytes, Buffer.from(" ")]) }), fails("TECHNICAL_EVIDENCE_CHECKSUM_MISMATCH"));
    assert.throws(() => verifyPinnedTechnicalEvidence({ pin: { ...pin, technicalEvidencePath: `evidence/other-track/technical/${trackId}.json` }, bytes }), fails("INVALID_FREE_NODE_INVENTORY_PINS"));
    assert.throws(() => verifyPinnedTechnicalEvidence({ pin: { ...pin, technicalEvidenceFileSha256: "0".repeat(64) }, bytes }), fails("TECHNICAL_EVIDENCE_CHECKSUM_MISMATCH"));
  }
});

test("free-node inventory validation detects fingerprint tampering and exact-set drift", async () => {
  const directory = "artifacts/free-node-inventories/test-free-node-inventory";
  try {
    const output = `${directory}/coding.json`;
    const created = await writeFreeNodeInventory({ releaseId: "patternly-launch-2026-08-21-01", trackId: "coding-interview-dsa-problem-solving", outputPath: output });
    await assert.doesNotReject(() => validateFreeNodeInventory({ inventoryPath: output }));
    const fingerprintTamper = clone(created.inventory); fingerprintTamper.items[0].itemFingerprint = "0".repeat(64); await writeFile(output, JSON.stringify(fingerprintTamper));
    await assert.rejects(() => validateFreeNodeInventory({ inventoryPath: output }), fails("FREE_NODE_INVENTORY_MISMATCH"));
    const setTamper = clone(created.inventory); setTamper.items.pop(); setTamper.itemCount -= 1; await writeFile(output, JSON.stringify(setTamper));
    await assert.rejects(() => validateFreeNodeInventory({ inventoryPath: output }), fails("FREE_NODE_INVENTORY_MISMATCH"));
    const schemaTamper = clone(created.inventory); schemaTamper.unapprovedField = true; await writeFile(output, JSON.stringify(schemaTamper));
    await assert.rejects(() => validateFreeNodeInventory({ inventoryPath: output }), fails("INVALID_SCHEMA"));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
