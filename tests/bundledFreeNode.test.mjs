import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { bundledFreeNodeFromInputs, generateBundledFreeNode, verifyBundledFreeNodeRecord, writeBundledFreeNode } from "../scripts/product/bundled-free-node.mjs";
import { inventoryFromPinnedRelease } from "../scripts/product/free-node-inventory.mjs";
import { canonicalJson, PublishingFailure, validateCanonicalJsonSchema } from "../scripts/publishing/pipeline.mjs";

const fails = (code) => (error) => error instanceof PublishingFailure && error.code === code;
const clone = (value) => JSON.parse(JSON.stringify(value));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const load = async (path) => JSON.parse(await readFile(path, "utf8"));

async function fixture(trackId, releaseId, modeId) {
  const release = clone(await load(`artifacts/releases/${releaseId}/release.json`));
  release.manifest.releaseId = `fixture-${releaseId}-${modeId}`;
  release.artifacts = [release.artifacts.find((entry) => entry.trackId === trackId)];
  const artifact = release.artifacts[0];
  const envelope = JSON.parse(artifact.artifactBytes);
  const brief = clone(await load(`docs/track-briefs/${trackId}.json`));
  brief.validModes = [modeId];
  artifact.declaredModes = [modeId];
  if (artifact.familyId === "coding_interview") {
    const selectedIds = new Set(envelope.bank.items.filter((item) => item.taxonomy.roadmapNodeId === brief.freeNodeId).map((item) => item.id));
    const blueprint = envelope.bank.practiceBlueprints.find((entry) => entry.modeId === modeId);
    const itemIds = blueprint.resolvedItemIds.filter((id) => selectedIds.has(id));
    envelope.bank.practiceBlueprints = [{ ...blueprint, composition: { kind: "item_ids", ids: itemIds }, resolvedItemIds: itemIds }];
    envelope.bank.recognitionSets = [];
    envelope.bank.contrastSets = [];
    envelope.bank.interleavedScopes = [];
    envelope.bank.compatibilitySets = [];
    envelope.bank.simulationPools = [];
    envelope.bank.simulationProfiles = [];
  } else {
    envelope.bank.focusPractice = { ...envelope.bank.focusPractice, topicIds: [brief.freeNodeId] };
  }
  artifact.artifactBytes = canonicalJson(envelope);
  artifact.checksumSha256 = sha256(artifact.artifactBytes);
  const pin = {
    trackId,
    releaseId: release.manifest.releaseId,
    contentVersion: artifact.contentVersion,
    sourceRepositoryCommit: artifact.sourceRepositoryCommit,
    artifactChecksumSha256: artifact.checksumSha256
  };
  const inventory = inventoryFromPinnedRelease({ release, releaseId: pin.releaseId, brief, trackId, pin });
  return { release, releaseId: pin.releaseId, brief, inventory, pin };
}

function refresh(inputs) {
  const artifact = inputs.release.artifacts[0];
  artifact.checksumSha256 = sha256(artifact.artifactBytes);
  inputs.pin.artifactChecksumSha256 = artifact.checksumSha256;
  inputs.inventory = inventoryFromPinnedRelease({ release: inputs.release, releaseId: inputs.releaseId, brief: inputs.brief, trackId: inputs.brief.trackId, pin: inputs.pin });
  return inputs;
}

async function canonicalFixtureRoot(inputs) {
  const root = await mkdtemp(join(tmpdir(), "patternly-bundled-free-node-"));
  await mkdir(join(root, "docs"), { recursive: true });
  await cp("docs/track-briefs", join(root, "docs", "track-briefs"), { recursive: true });
  await mkdir(join(root, "schemas", "product"), { recursive: true });
  for (const filename of ["track-brief.schema.json", "free-node-inventory-pins.schema.json", "free-node-inventory.schema.json"]) await cp(join("schemas", "product", filename), join(root, "schemas", "product", filename));
  await writeFile(join(root, "docs", "track-briefs", `${inputs.brief.trackId}.json`), canonicalJson(inputs.brief));
  await mkdir(join(root, "config"), { recursive: true });
  const pins = await load("config/free-node-inventory-pins.json");
  pins.pins = pins.pins.map((pin) => pin.trackId === inputs.pin.trackId ? inputs.pin : pin);
  await writeFile(join(root, "config", "free-node-inventory-pins.json"), canonicalJson(pins));
  await mkdir(join(root, "artifacts", "releases", inputs.releaseId), { recursive: true });
  await writeFile(join(root, "artifacts", "releases", inputs.releaseId, "release.json"), canonicalJson(inputs.release));
  await mkdir(join(root, "artifacts", "free-node-inventories", inputs.releaseId), { recursive: true });
  await writeFile(join(root, "artifacts", "free-node-inventories", inputs.releaseId, `${inputs.brief.trackId}.json`), canonicalJson(inputs.inventory));
  return root;
}

test("bundled free-node builder emits deterministic canonical payload identity without remote-package claims", async () => {
  const schema = await load("schemas/product/bundled-free-node.schema.json");
  const codingInputs = await fixture("coding-interview-dsa-problem-solving", "patternly-core-0017", "coding-interview-guided-practice");
  const gcpInputs = await fixture("google-cloud-associate-cloud-engineer", "patternly-core-0016", "certification-focus-practice");
  for (const inputs of [codingInputs, gcpInputs]) {
    const first = bundledFreeNodeFromInputs(inputs);
    const second = bundledFreeNodeFromInputs(clone(inputs));
    assert.equal(canonicalJson(first), canonicalJson(second));
    assert.equal(first.manifest.payloadCanonicalSha256, sha256(canonicalJson(first.payload)));
    assert.equal(first.manifest.itemCount, inputs.inventory.itemCount);
    assert.deepEqual(first.payload.items.map((item) => item.id), inputs.inventory.items.map((item) => item.id));
    assert.equal(first.manifest.provenance.releaseId, inputs.releaseId);
    assert.equal(first.manifest.provenance.sourceArtifactChecksumSha256, inputs.pin.artifactChecksumSha256);
    assert.doesNotThrow(() => validateCanonicalJsonSchema(first, schema, "bundled free node"));
    assert.doesNotThrow(() => verifyBundledFreeNodeRecord(first));
    const manifestText = canonicalJson(first.manifest).toLowerCase();
    for (const prohibited of ["objectidentity", "generation", "compressed", "premium", "cloudstorage"]) assert.equal(manifestText.includes(prohibited), false);
  }
  const coding = bundledFreeNodeFromInputs(codingInputs);
  assert.equal(coding.manifest.assetCount, 1);
  assert.equal(coding.payload.assets[0].id, "algorithms/complexity-linear-vs-nested");
  assert.deepEqual(Object.keys(coding.payload.modeStructures).sort(), ["compatibilitySets", "contrastSets", "interleavedScopes", "practiceBlueprints", "recognitionSets", "simulationPools", "simulationProfiles"].sort());
  const gcp = bundledFreeNodeFromInputs(gcpInputs);
  assert.deepEqual(Object.keys(gcp.payload.modeStructures), ["focusPractice"]);
  const remoteClaim = clone(gcp);
  remoteClaim.manifest.objectGeneration = "unverified";
  assert.throws(() => validateCanonicalJsonSchema(remoteClaim, schema, "bundled free node"), fails("INVALID_SCHEMA"));
});

test("actual pinned releases stop because their published modes still escape the Free node", async () => {
  for (const trackId of ["coding-interview-dsa-problem-solving", "google-cloud-associate-cloud-engineer"]) {
    await assert.rejects(() => generateBundledFreeNode({ trackId }), (error) => fails("FREE_NODE_MODE_NOT_CLOSED")(error) && /outside|global|published mode owner/.test(error.message));
  }
});

test("builder rejects source tampering, inventory provenance drift, empty and mixed-node inventories", async () => {
  const sourceTamper = await fixture("coding-interview-dsa-problem-solving", "patternly-core-0017", "coding-interview-guided-practice");
  sourceTamper.release.artifacts[0].artifactBytes += " ";
  assert.throws(() => bundledFreeNodeFromInputs(sourceTamper), fails("CHECKSUM_MISMATCH"));

  const provenance = await fixture("coding-interview-dsa-problem-solving", "patternly-core-0017", "coding-interview-guided-practice");
  provenance.inventory = clone(provenance.inventory);
  provenance.inventory.producer.contentVersion = "not-the-pinned-version";
  assert.throws(() => bundledFreeNodeFromInputs(provenance), fails("BUNDLED_FREE_NODE_PROVENANCE_MISMATCH"));

  const empty = await fixture("coding-interview-dsa-problem-solving", "patternly-core-0017", "coding-interview-guided-practice");
  empty.inventory = clone(empty.inventory);
  empty.inventory.items = [];
  empty.inventory.itemCount = 0;
  assert.throws(() => bundledFreeNodeFromInputs(empty), fails("EMPTY_FREE_NODE"));

  const mixed = await fixture("coding-interview-dsa-problem-solving", "patternly-core-0017", "coding-interview-guided-practice");
  mixed.inventory = clone(mixed.inventory);
  const bank = JSON.parse(mixed.release.artifacts[0].artifactBytes).bank;
  const outside = bank.items.find((item) => item.taxonomy.roadmapNodeId !== mixed.brief.freeNodeId);
  mixed.inventory.items.push({ id: outside.id, itemFingerprint: outside.itemFingerprint });
  mixed.inventory.itemCount += 1;
  assert.throws(() => bundledFreeNodeFromInputs(mixed), fails("MIXED_FREE_NODE"));
});

test("builder rejects dangling item and asset references and detects payload mutation", async () => {
  const danglingMode = await fixture("coding-interview-dsa-problem-solving", "patternly-core-0017", "coding-interview-guided-practice");
  const modeEnvelope = JSON.parse(danglingMode.release.artifacts[0].artifactBytes);
  modeEnvelope.bank.practiceBlueprints[0].composition.ids.push("missing-item");
  modeEnvelope.bank.practiceBlueprints[0].resolvedItemIds.push("missing-item");
  danglingMode.release.artifacts[0].artifactBytes = canonicalJson(modeEnvelope);
  refresh(danglingMode);
  assert.throws(() => bundledFreeNodeFromInputs(danglingMode), fails("DANGLING_FREE_NODE_REFERENCE"));

  const danglingAsset = await fixture("coding-interview-dsa-problem-solving", "patternly-core-0017", "coding-interview-guided-practice");
  const assetEnvelope = JSON.parse(danglingAsset.release.artifacts[0].artifactBytes);
  const item = assetEnvelope.bank.items.find((entry) => entry.id === "alg-complexity-time-001");
  item.feedback.details.blocks.find((block) => block.type === "image").assetId = "missing/asset";
  danglingAsset.release.artifacts[0].artifactBytes = canonicalJson(assetEnvelope);
  refresh(danglingAsset);
  assert.throws(() => bundledFreeNodeFromInputs(danglingAsset), fails("DANGLING_FREE_NODE_REFERENCE"));

  const valid = bundledFreeNodeFromInputs(await fixture("google-cloud-associate-cloud-engineer", "patternly-core-0016", "certification-focus-practice"));
  const mutated = clone(valid);
  mutated.payload.items.pop();
  assert.throws(() => verifyBundledFreeNodeRecord(mutated), fails("BUNDLED_FREE_NODE_CHECKSUM_MISMATCH"));
});

test("exclusive create maps a write-time collision and never overwrites the existing bytes", async () => {
  const inputs = await fixture("coding-interview-dsa-problem-solving", "patternly-core-0017", "coding-interview-guided-practice");
  const root = await canonicalFixtureRoot(inputs);
  const outputPath = "artifacts/bundled-free-nodes/race/coding.json";
  const target = join(root, outputPath);
  try {
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, "other-writer-won");
    await assert.rejects(() => writeBundledFreeNode({ root, trackId: inputs.brief.trackId, outputPath }), fails("IMMUTABLE_BUNDLED_FREE_NODE"));
    assert.equal(await readFile(target, "utf8"), "other-writer-won");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("failed actual builds leave no artifacts", async () => {
  const directory = "artifacts/bundled-free-nodes/test-bundled-free-node";
  const codingOutput = `${directory}/coding.json`;
  const gcpOutput = `${directory}/gcp.json`;
  try {
    await mkdir(directory, { recursive: true });
    await assert.rejects(() => writeBundledFreeNode({ trackId: "coding-interview-dsa-problem-solving", outputPath: codingOutput }), fails("FREE_NODE_MODE_NOT_CLOSED"));
    await assert.rejects(() => writeBundledFreeNode({ trackId: "google-cloud-associate-cloud-engineer", outputPath: gcpOutput }), fails("FREE_NODE_MODE_NOT_CLOSED"));
    for (const path of [codingOutput, gcpOutput]) await assert.rejects(() => stat(path), (error) => error?.code === "ENOENT");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
