import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import { bundledFreeNodeFromInputs, canonicalBundledFreeNodePath, generateBundledFreeNode, payloadFromBundledFreeNode, prepareBundledFreeNodeSession, validateBundledFreeNode, verifyBundledFreeNodeRecord, writeBundledFreeNode } from "../scripts/product/bundled-free-node.mjs";
import { validateFreeNodeExperienceProfile } from "../scripts/product/free-node-experience-profile.mjs";
import { inventoryFromPinnedRelease } from "../scripts/product/free-node-inventory.mjs";
import { canonicalJson, PublishingFailure, validateCanonicalJsonSchema } from "../scripts/publishing/pipeline.mjs";

const COMMIT = "a".repeat(40);
const TRACKS = ["coding-interview-dsa-problem-solving"];
const fails = (code) => (error) => error instanceof PublishingFailure && error.code === code;
const clone = structuredClone;
const load = async (path) => JSON.parse(await readFile(path, "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const exec = promisify(execFile);
const git = (root, ...args) => exec("git", args, { cwd: root });
const CERTIFICATION_TRACK = "google-cloud-associate-cloud-engineer";

async function inputs(trackId) {
  const [brief, pins, profile, profileSchema, track, packageConfiguration, packageConfigurationSchema] = await Promise.all([
    load(`docs/track-briefs/${trackId}.json`), load("config/free-node-inventory-pins.json"), load(`config/free-node-experience-profiles/${trackId}.json`), load("schemas/product/free-node-experience-profile.schema.json"), load(`config/tracks/${trackId}.json`), load("config/bundled-free-node-packages.json"), load("schemas/product/bundled-free-node-packages.schema.json")
  ]);
  const pin = pins.pins.find((entry) => entry.trackId === trackId); const releaseId = pin.releaseId;
  const [release, inventory, family, taxonomy, technicalEvidenceBytes, buildReport] = await Promise.all([load(`artifacts/releases/${releaseId}/release.json`), load(`artifacts/free-node-inventories/${releaseId}/${trackId}.json`), load(`config/families/${profile.familyId}.json`), load(`config/taxonomy/${trackId}.json`), readFile(pin.technicalEvidencePath), load(pin.buildReportPath)]);
  const artifact = release.artifacts.find((entry) => entry.trackId === trackId); const bank = JSON.parse(artifact.artifactBytes).bank; const assetBytesById = {};
  for (const asset of bank.feedbackAssets ?? []) assetBytesById[asset.id] = (await readFile(asset.sourcePath)).toString("base64");
  return { release, releaseId, brief, inventory, pin, profile, profileSchema, track, family, taxonomy, packageConfiguration, packageConfigurationSchema, profileSourceRepositoryCommit: COMMIT, assetBytesById, technicalEvidenceBytes, buildReport };
}

async function fixtureRoot() {
  const root = await mkdtemp(join(tmpdir(), "patternly-free-package-"));
  for (const path of ["docs", "config", "schemas", "manual/assets", "evidence", "artifacts/releases", "artifacts/tracks", "artifacts/free-node-inventories"]) await cp(path, join(root, path), { recursive: true });
  return root;
}

async function committedFixtureRoot() {
  const root = await fixtureRoot();
  await git(root, "init"); await git(root, "config", "user.email", "tests@patternly.local"); await git(root, "config", "user.name", "Patternly Tests");
  await git(root, "add", "."); await git(root, "commit", "-m", "fixture");
  return root;
}

test("actual pinned inventories build deterministic compressed v2 packages with exact provenance", async () => {
  const schema = await load("schemas/product/bundled-free-node.schema.json");
  for (const trackId of TRACKS) {
    const first = await generateBundledFreeNode({ trackId, profileSourceRepositoryCommit: COMMIT });
    const second = await generateBundledFreeNode({ trackId, profileSourceRepositoryCommit: COMMIT });
    assert.equal(canonicalJson(first), canonicalJson(second));
    assert.doesNotThrow(() => validateCanonicalJsonSchema(first, schema, "bundled Free node"));
    assert.doesNotThrow(() => verifyBundledFreeNodeRecord(first));
    const { payload, compressed, bytes } = payloadFromBundledFreeNode(first);
    assert.equal(first.manifest.payloadCompressedSize, compressed.byteLength);
    assert.equal(first.manifest.payloadUncompressedSize, bytes.byteLength);
    assert.equal(first.manifest.payloadCompressedSha256, sha256(compressed));
    assert.equal(first.manifest.payloadCanonicalSha256, sha256(bytes));
    assert.equal(first.manifest.itemCount, 158);
    assert.equal(first.manifest.provenance.profileSourceRepositoryCommit, COMMIT);
    assert.equal(first.manifest.provenance.freeNodeExperienceProfileCanonicalSha256, sha256(canonicalJson(payload.freeNodeExperienceProfile)));
    const source = await inputs(trackId);
    assert.equal(first.manifest.provenance.technicalEvidencePath, source.pin.technicalEvidencePath);
    assert.equal(first.manifest.provenance.technicalEvidenceFileSha256, source.pin.technicalEvidenceFileSha256);
    assert.equal(first.manifest.provenance.technicalEvidenceIdentitySha256, source.pin.technicalEvidenceIdentitySha256);
    assert.equal(first.manifest.provenance.technicalInputFingerprint, source.pin.technicalInputFingerprint);
    assert.equal(first.manifest.minimumAppVersion, "0.1.0");
  }
});

test("historical package validation ignores provenance-only commit drift but rejects dirty and material inputs", async () => {
  const root = await committedFixtureRoot();
  const trackId = TRACKS[0];
  const recordedCommit = "b".repeat(40);
  try {
    const record = await generateBundledFreeNode({ root, trackId, profileSourceRepositoryCommit: recordedCommit });
    const bundledFreeNodePath = canonicalBundledFreeNodePath(record);
    await mkdir(join(root, "artifacts", "bundled-free-nodes", trackId, record.manifest.packageVersion), { recursive: true });
    await writeFile(join(root, bundledFreeNodePath), canonicalJson(record));

    await assert.doesNotReject(() => validateBundledFreeNode({ root, bundledFreeNodePath }));

    const profilePath = join(root, "config", "free-node-experience-profiles", `${trackId}.json`);
    const originalProfileBytes = await readFile(profilePath, "utf8");
    await writeFile(profilePath, `${originalProfileBytes}\n`);
    await assert.rejects(() => validateBundledFreeNode({ root, bundledFreeNodePath }), fails("DIRTY_BUNDLED_FREE_NODE_SOURCE"));
    await writeFile(profilePath, originalProfileBytes);

    const trackPath = join(root, "config", "tracks", `${trackId}.json`); const track = await load(trackPath);
    track.modeConfiguration.practiceBlueprints[0].minimumActualLength = 4;
    await writeFile(trackPath, canonicalJson(track));
    await git(root, "add", "config/tracks"); await git(root, "commit", "-m", "material track change");
    await assert.rejects(() => validateBundledFreeNode({ root, bundledFreeNodePath }), fails("BUNDLED_FREE_NODE_MISMATCH"));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("Coding package prepares every approved immediate mode and excludes full-track-only structures", async () => {
  const record = await generateBundledFreeNode({ trackId: TRACKS[0], profileSourceRepositoryCommit: COMMIT });
  const { payload } = payloadFromBundledFreeNode(record);
  assert.deepEqual(record.manifest.modeIds, ["coding-interview-custom-practice", "coding-interview-guided-practice", "coding-interview-learn-approach", "coding-interview-weak-area-review"]);
  assert.deepEqual(Object.keys(payload.modeStructures).sort(), ["compatibilitySets", "configurations", "userModeMappings"]);
  assert.deepEqual(payload.modeStructures.userModeMappings.find((entry) => entry.userModeId === "coding-interview-custom-practice"), { userModeId: "coding-interview-custom-practice", blueprintModeId: "coding-interview-guided-practice" });
  for (const requestedLength of [10]) assert.equal(prepareBundledFreeNodeSession(record, { modeId: "coding-interview-learn-approach", requestedLength }).actualLength, requestedLength);
  for (const requestedLength of [10, 20, 40]) {
    const session = prepareBundledFreeNodeSession(record, { modeId: "coding-interview-guided-practice", requestedLength });
    assert.equal(session.actualLength, requestedLength); assert.equal(new Set(session.itemIds).size, requestedLength);
  }
  const mentalUnits = [...new Set(payload.items.map((item) => item.taxonomy.primaryMentalUnitId))];
  for (const mentalUnitId of mentalUnits) for (const feedbackOption of ["afterEachAnswer", "atSessionEnd"]) {
    const session = prepareBundledFreeNodeSession(record, { modeId: "coding-interview-custom-practice", requestedLength: 10, mentalUnitId, feedbackOption });
    assert.equal(session.actualLength, 10); assert.equal(session.feedbackOption, feedbackOption); assert.ok(session.itemIds.every((id) => payload.items.find((item) => item.id === id).taxonomy.primaryMentalUnitId === mentalUnitId));
  }
  for (const excluded of ["recognize", "contrast", "independent", "simulation", "recognitionSets", "contrastSets", "interleavedScopes", "simulationPools", "simulationProfiles"]) assert.equal(JSON.stringify(payload.modeStructures).includes(excluded), false);
  assert.ok(payload.items.every((item) => item.taxonomy.roadmapNodeId === "complexity_and_constraints"));
});

test("GCP Diagnostic Baseline packages and prepares the exact canonical 40-item blueprint", async () => {
  const source = await inputs(CERTIFICATION_TRACK);
  const record = await generateBundledFreeNode({ trackId: CERTIFICATION_TRACK, profileSourceRepositoryCommit: COMMIT });
  const { payload } = payloadFromBundledFreeNode(record);
  const diagnostic = payload.freeNodeExperienceProfile.modes.find((entry) => entry.modeId === "certification-diagnostic-baseline");
  const blueprint = source.track.modeConfiguration.diagnosticBaseline;

  assert.equal(record.manifest.packageVersion, `${CERTIFICATION_TRACK}-free-node-0005`);
  assert.equal(record.manifest.itemCount, 136);
  assert.equal(payload.freeNodeExperienceProfile.profileId, `${CERTIFICATION_TRACK}-free-node-v2`);
  assert.equal(payload.freeNodeExperienceProfile.profileVersion, "2");
  assert.equal(diagnostic.selection.itemIds.length, 40);
  assert.equal(new Set(diagnostic.selection.itemIds).size, 40);
  assert.deepEqual(diagnostic.selection.itemIds, blueprint.itemIds);

  const session = prepareBundledFreeNodeSession(record, { modeId: diagnostic.modeId, requestedLength: 40 });
  assert.equal(session.status, "ready");
  assert.equal(session.actualLength, 40);
  assert.equal(session.shortened, false);
  assert.deepEqual(session.itemIds, blueprint.itemIds);
  assert.throws(() => prepareBundledFreeNodeSession(record, { modeId: diagnostic.modeId, requestedLength: 20 }), fails("UNSUPPORTED_FREE_NODE_SESSION"));
});

test("GCP Diagnostic Baseline rejects reordered, shortened, duplicate, or unknown blueprint items", async () => {
  const source = await inputs(CERTIFICATION_TRACK);
  const validate = (profile) => validateFreeNodeExperienceProfile({ ...source, schema: source.profileSchema, profile });
  const invalid = (mutate) => {
    const profile = clone(source.profile);
    mutate(profile.modes.find((entry) => entry.modeId === "certification-diagnostic-baseline").selection.itemIds);
    assert.throws(() => validate(profile), (error) => ["INVALID_SCHEMA", "INVALID_FREE_NODE_MODE_CONFIGURATION"].includes(error.code));
  };

  invalid((itemIds) => { [itemIds[0], itemIds[1]] = [itemIds[1], itemIds[0]]; });
  invalid((itemIds) => { itemIds.pop(); });
  invalid((itemIds) => { itemIds[39] = itemIds[0]; });
  invalid((itemIds) => { itemIds[39] = "gcp-item-outside-blueprint"; });
});

test("Coding Weak Area Review is package-local, evidence-conditioned, unique, and truthfully shortened", async () => {
  const record = await generateBundledFreeNode({ trackId: TRACKS[0], profileSourceRepositoryCommit: COMMIT }); const { payload } = payloadFromBundledFreeNode(record);
  assert.equal(prepareBundledFreeNodeSession(record, { modeId: "coding-interview-weak-area-review", requestedLength: 10 }).status, "unavailable");
  const ids = payload.items.slice(0, 7).map((item) => item.id);
  const evidence = [...ids.map((itemId) => ({ itemId, source: "due_queue", due: true })), { itemId: ids[0], source: "due_queue", due: true }, { itemId: payload.items[7].id, source: "session_misses", committed: false }, { itemId: payload.items[8].id, source: "session_misses", committed: true }];
  const session = prepareBundledFreeNodeSession(record, { modeId: "coding-interview-weak-area-review", requestedLength: 10, evidence });
  assert.equal(session.actualLength, 8); assert.equal(new Set(session.itemIds).size, 8); assert.equal(session.shortened, true); assert.match(session.disclosure, /Only 8 eligible/);
  assert.throws(() => prepareBundledFreeNodeSession(record, { modeId: "coding-interview-weak-area-review", requestedLength: 10, evidence: [{ itemId: "premium-item", source: "due_queue", due: true }] }), fails("REVIEW_ITEM_OUTSIDE_PACKAGE"));
});

test("profile semantic validation rejects all-modes Free, invented IDs, excluded modes, bad Custom mapping, and unbounded reviews", async () => {
  for (const trackId of TRACKS) {
    const value = await inputs(trackId); const validate = (profile) => validateFreeNodeExperienceProfile({ ...value, schema: value.profileSchema, profile });
    const all = clone(value.profile); all.modes = value.brief.validModes.map((modeId, index) => ({ ...clone(value.profile.modes[0]), configurationId: `all-${index}`, modeId, blueprintModeId: modeId }));
    assert.throws(() => validate(all), (error) => ["ALL_VALID_MODES_TREATED_AS_FREE", "UNSUPPORTED_FREE_NODE_MODE"].includes(error.code));
    const invented = clone(value.profile); invented.modes[0].modeId = `${trackId}-free-mode`; assert.throws(() => validate(invented), fails("FREE_ONLY_MODE_ID"));
    const absent = clone(value.profile); absent.modes[0].modeId = "not-a-track-mode"; assert.throws(() => validate(absent), fails("FREE_NODE_MODE_OUTSIDE_TRACK"));
    const duplicate = clone(value.profile); duplicate.modes.push(clone(duplicate.modes[0])); assert.throws(() => validate(duplicate), fails("DUPLICATE_FREE_NODE_MODE_OWNER"));
    const outside = clone(value.profile); outside.modes[0].selection.freeNodeId = "premium-node"; assert.throws(() => validate(outside), fails("FREE_NODE_POLICY_NOT_CLOSED"));
    const noImmediate = clone(value.profile); noImmediate.modes.find((entry) => entry.modeId === noImmediate.primaryEntry.modeId).availability = "evidence_conditioned"; assert.throws(() => validate(noImmediate), (error) => ["INVALID_FREE_NODE_MODE_CONFIGURATION", "MISSING_IMMEDIATE_FREE_NODE_PRIMARY"].includes(error.code));
    const unbounded = clone(value.profile); const review = unbounded.modes.find((entry) => entry.availability === "evidence_conditioned"); delete review.selection.freeNodeId; assert.throws(() => validate(unbounded), fails("INVALID_SCHEMA"));
    const lifecycle = clone(value.profile); lifecycle.runnerId = "second-runner"; assert.throws(() => validate(lifecycle), fails("INVALID_SCHEMA"));
  }
  const coding = await inputs(TRACKS[0]);
  const longCustom = clone(coding.profile); longCustom.modes.find((entry) => entry.modeId === "coding-interview-custom-practice").requestedLengths = [20]; assert.throws(() => validateFreeNodeExperienceProfile({ ...coding, schema: coding.profileSchema, profile: longCustom }), fails("INVALID_FREE_NODE_MODE_CONFIGURATION"));
  const wrongMapping = clone(coding.profile); wrongMapping.modes.find((entry) => entry.modeId === "coding-interview-custom-practice").blueprintModeId = "coding-interview-custom-practice"; assert.throws(() => validateFreeNodeExperienceProfile({ ...coding, schema: coding.profileSchema, profile: wrongMapping }), fails("INVALID_FREE_NODE_MODE_CONFIGURATION"));
  const excludedCoding = clone(coding.profile); excludedCoding.modes[0].modeId = "coding-interview-simulation"; assert.throws(() => validateFreeNodeExperienceProfile({ ...coding, schema: coding.profileSchema, profile: excludedCoding }), fails("INVALID_FREE_NODE_MODE_SET"));
});

test("builder rejects mixed inventories and compatibility sets crossing into Premium", async () => {
  const mixed = await inputs(TRACKS[0]); const envelope = JSON.parse(mixed.release.artifacts.find((entry) => entry.trackId === TRACKS[0]).artifactBytes); const outside = envelope.bank.items.find((item) => item.taxonomy.roadmapNodeId !== mixed.brief.freeNodeId);
  mixed.inventory = clone(mixed.inventory); mixed.inventory.items.push({ id: outside.id, itemFingerprint: outside.itemFingerprint }); mixed.inventory.itemCount += 1;
  assert.throws(() => bundledFreeNodeFromInputs(mixed), fails("MIXED_FREE_NODE"));

  const crossing = await inputs(TRACKS[0]); const artifact = crossing.release.artifacts.find((entry) => entry.trackId === TRACKS[0]); const bankEnvelope = JSON.parse(artifact.artifactBytes); const selected = bankEnvelope.bank.items.find((item) => item.taxonomy.roadmapNodeId === crossing.brief.freeNodeId); const crossSet = bankEnvelope.bank.compatibilitySets.find((entry) => [...(entry.itemIds ?? []), ...(entry.sourceItemIds ?? []), ...(entry.targetItemIds ?? [])].some((id) => !crossing.inventory.items.some((inventoryItem) => inventoryItem.id === id)));
  assert.ok(crossSet); selected.compatibilityMemberships.push(crossSet.id); artifact.artifactBytes = canonicalJson(bankEnvelope); artifact.checksumSha256 = sha256(artifact.artifactBytes); crossing.pin = { ...crossing.pin, artifactChecksumSha256: artifact.checksumSha256 }; crossing.buildReport = { ...crossing.buildReport, checksumSha256: artifact.checksumSha256 };
  crossing.inventory = inventoryFromPinnedRelease({ release: crossing.release, releaseId: crossing.releaseId, brief: crossing.brief, trackId: crossing.brief.trackId, pin: crossing.pin });
  assert.throws(() => bundledFreeNodeFromInputs(crossing), fails("FREE_NODE_COMPATIBILITY_NOT_CLOSED"));
});

test("technical evidence pins are loaded, byte-verified, identity-verified, and matched to the immutable build", async () => {
  const canonical = await inputs(TRACKS[0]);
  const missing = { ...canonical, technicalEvidenceBytes: undefined };
  assert.throws(() => bundledFreeNodeFromInputs(missing), fails("TECHNICAL_EVIDENCE_CHECKSUM_MISMATCH"));

  const tampered = { ...canonical, technicalEvidenceBytes: Buffer.from(`${canonical.technicalEvidenceBytes.toString("utf8")} `) };
  assert.throws(() => bundledFreeNodeFromInputs(tampered), fails("TECHNICAL_EVIDENCE_CHECKSUM_MISMATCH"));

  const wrongPath = { ...canonical, pin: { ...canonical.pin, technicalEvidencePath: "evidence/other-track/technical/copied.json" } };
  assert.throws(() => bundledFreeNodeFromInputs(wrongPath), fails("INVALID_FREE_NODE_INVENTORY_PINS"));

  const wrongIdentity = { ...canonical, pin: { ...canonical.pin, technicalEvidenceIdentitySha256: "0".repeat(64) } };
  assert.throws(() => bundledFreeNodeFromInputs(wrongIdentity), fails("TECHNICAL_EVIDENCE_IDENTITY_MISMATCH"));

  const wrongFingerprint = { ...canonical, pin: { ...canonical.pin, technicalInputFingerprint: "0".repeat(64) } };
  assert.throws(() => bundledFreeNodeFromInputs(wrongFingerprint), fails("TECHNICAL_EVIDENCE_PROVENANCE_MISMATCH"));

  const wrongBuild = { ...canonical, buildReport: { ...canonical.buildReport, technicalInputFingerprint: "0".repeat(64) } };
  assert.throws(() => bundledFreeNodeFromInputs(wrongBuild), fails("TECHNICAL_EVIDENCE_PROVENANCE_MISMATCH"));
});

test("checksum mutation, immutable overwrite, and failed generation are fail-closed", async () => {
  const record = await generateBundledFreeNode({ trackId: TRACKS[0], profileSourceRepositoryCommit: COMMIT }); const mutated = clone(record); mutated.payloadGzipBase64 = `${mutated.payloadGzipBase64.slice(0, -4)}AAAA`; assert.throws(() => verifyBundledFreeNodeRecord(mutated));
  const root = await fixtureRoot();
  try {
    const first = await writeBundledFreeNode({ root, trackId: TRACKS[0], profileSourceRepositoryCommit: COMMIT });
    assert.equal(canonicalBundledFreeNodePath(first.record), `artifacts/bundled-free-nodes/${TRACKS[0]}/${TRACKS[0]}-free-node-0004/package.json`);
    await assert.rejects(() => writeBundledFreeNode({ root, trackId: TRACKS[0], profileSourceRepositoryCommit: COMMIT }), fails("IMMUTABLE_BUNDLED_FREE_NODE"));
    const before = await readFile(first.path, "utf8"); assert.equal(before, canonicalJson(first.record));
  } finally { await rm(root, { recursive: true, force: true }); }
});
