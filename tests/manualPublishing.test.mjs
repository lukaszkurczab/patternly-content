import assert from "node:assert/strict";
import test from "node:test";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { buildTrack, emitTechnicalEvidence, inspectTrack, PublishingFailure, publishRelease, selectSimulationItems, selectSimulationPlan, validateTrack, verifyArtifact } from "../scripts/publishing/pipeline.mjs";
import { algorithmsBatch, certificationBatch, fixtureRoot } from "./fixtures/manualPublishingFixture.mjs";
import { APPLICATION_ALGORITHMS_BANK_KEYS, APPLICATION_ALGORITHMS_ITEM_KEYS, APPLICATION_ALGORITHM_MODE_IDS } from "./fixtures/applicationContractSnapshot.mjs";

const COMMIT = "fixture-source-commit";
const exec = promisify(execFile);
async function root(input = {}) { const path = await mkdtemp(join(tmpdir(), "patternly-publishing-")); await fixtureRoot(path, input); return path; }
const fails = (code) => (error) => error instanceof PublishingFailure && error.code === code;

test("canonical discovery is deterministic and ignores legacy content", async () => {
  const first = await root({ algorithms: algorithmsBatch() }); const second = await root({ algorithms: algorithmsBatch(), legacy: true });
  try {
    const a = await buildTrack({ root: first, trackId: "algorithms", outputRoot: join(first, "out"), sourceRepositoryCommit: COMMIT });
    const b = await buildTrack({ root: second, trackId: "algorithms", outputRoot: join(second, "out"), sourceRepositoryCommit: COMMIT });
    assert.equal(a.artifact.artifactBytes, b.artifact.artifactBytes);
    assert.equal(JSON.parse(a.artifact.artifactBytes).bank.items[0].taxonomy.roadmapNodeId, "arrays_and_strings");
    const bank = JSON.parse(a.artifact.artifactBytes).bank;
    assert.deepEqual(Object.keys(bank).sort(), [...APPLICATION_ALGORITHMS_BANK_KEYS].sort());
    assert.deepEqual(Object.keys(bank.items[0]).sort(), [...APPLICATION_ALGORITHMS_ITEM_KEYS].sort());
    assert.doesNotMatch(JSON.stringify(bank), /resolvedModeDeclarations|technicalValidationEvidence|sourceOverrides|relationMetadata/);
  } finally { await rm(first, { recursive: true }); await rm(second, { recursive: true }); }
});

test("publisher accepts only exact application Algorithms mode IDs", async () => {
  assert.deepEqual(JSON.parse(await readFile("config/families/algorithms.json", "utf8")).modeBlueprintRequirements.map((entry) => entry.modeId), APPLICATION_ALGORITHM_MODE_IDS);
  const path = await root({ algorithms: algorithmsBatch({ declaredModes: ["retired-local-mode-id"] }), approvals: false });
  try { await assert.rejects(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("INVALID_MODE")); } finally { await rm(path, { recursive: true }); }
});

test("empty canonical ingress is explicit even with a legacy bank", async () => {
  const path = await root({ legacy: true }); try { await assert.rejects(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("EMPTY_INGRESS")); } finally { await rm(path, { recursive: true }); }
});

test("technical evidence is emitted before human approval and current evidence is mandatory", async () => {
  const path = await root({ algorithms: algorithmsBatch(), approvals: false });
  try {
    await emitTechnicalEvidence({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT });
    await assert.rejects(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("MISSING_APPROVAL"));
  } finally { await rm(path, { recursive: true }); }
});

test("validation is read-only and cannot create approvals or publish a subset", async () => {
  const path = await root({ algorithms: algorithmsBatch() });
  try {
    const source = join(path, "manual/source/algorithms/fixture.json"); const before = await readFile(source, "utf8");
    await validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }); assert.equal(await readFile(source, "utf8"), before);
    const invalid = algorithmsBatch({ invalidChoice: true }); await writeFile(source, JSON.stringify(invalid));
    await assert.rejects(() => buildTrack({ root: path, trackId: "algorithms", outputRoot: join(path, "out"), sourceRepositoryCommit: COMMIT }), fails("INVALID_RESPONSE"));
  } finally { await rm(path, { recursive: true }); }
});

test("taxonomy is batch-owned and fully resolved on each item", async () => {
  for (const [batch, code] of [[algorithmsBatch({ badTaxonomy: true }), "INVALID_REFERENCE"], [algorithmsBatch({ duplicate: true }), "DUPLICATE_ID"]]) {
    const path = await root({ algorithms: batch, approvals: false }); try { await assert.rejects(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails(code)); } finally { await rm(path, { recursive: true }); }
  }
  const overriding = algorithmsBatch(); overriding.items[0].taxonomy.roadmapNodeId = "arrays_and_strings";
  const path = await root({ algorithms: overriding, approvals: false }); try { await assert.rejects(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("INVALID_SCHEMA")); } finally { await rm(path, { recursive: true }); }
});

test("choice scoring rejects isCorrect-era incomplete contracts", async () => {
  const batch = algorithmsBatch(); delete batch.items[0].feedback.omittedCorrectExplanationsByOptionId;
  const path = await root({ algorithms: batch, approvals: false }); try { await assert.rejects(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("INVALID_RESPONSE")); } finally { await rm(path, { recursive: true }); }
});

test("simulation has an explicit pool, profile, deterministic legal selector, and no truncation", async () => {
  const tooSmall = await root({ algorithms: algorithmsBatch({ count: 39 }), approvals: false }); try { await assert.rejects(() => validateTrack({ root: tooSmall, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("INSUFFICIENT_POOL")); } finally { await rm(tooSmall, { recursive: true }); }
  const batch = algorithmsBatch({ count: 41 }); const path = await root({ algorithms: batch });
  try {
    const inspected = await validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: "fixture-source-commit" }); const pool = inspected.source.modeStructures.simulationPools[0]; const profile = inspected.source.modeStructures.simulationProfiles[0];
    const one = selectSimulationItems({ profile, pool, items: inspected.source.items, selectionSeed: "a" }); const two = selectSimulationItems({ profile, pool, items: [...inspected.source.items].reverse(), selectionSeed: "a" });
    assert.equal(one.length, 40); assert.equal(new Set(one).size, 40); assert.deepEqual(one, two); assert.ok(one.every((id) => pool.itemIds.includes(id))); assert.notDeepEqual(one, pool.itemIds.slice(0, 40));
  } finally { await rm(path, { recursive: true }); }
});

test("approvals and activations bind exact immutable fingerprints", async () => {
  const path = await root({ algorithms: algorithmsBatch() });
  try {
    const source = join(path, "manual/source/algorithms/fixture.json"); const batch = JSON.parse(await readFile(source, "utf8")); batch.items[0].prompt = "Select all changed learner-visible invariants."; await writeFile(source, JSON.stringify(batch));
    await emitTechnicalEvidence({ root: path, trackId: "algorithms", sourceRepositoryCommit: "fixture-source-commit" });
    await assert.rejects(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: "fixture-source-commit" }), fails("MISSING_APPROVAL"));
  } finally { await rm(path, { recursive: true }); }
});

test("an unchanged item approval is reusable across a later content version with new exact activation", async () => {
  const path = await root({ algorithms: algorithmsBatch() });
  try {
    const sourcePath = join(path, "manual/source/algorithms/fixture.json"); const source = JSON.parse(await readFile(sourcePath, "utf8")); source.contentVersion = "algorithms-fixture-v3"; await writeFile(sourcePath, JSON.stringify(source));
    await emitTechnicalEvidence({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT });
    const activationPath = join(path, "manual/activations/algorithms/fixture-activation.json"); const activation = JSON.parse(await readFile(activationPath, "utf8")); activation.contentVersion = source.contentVersion; await writeFile(activationPath, JSON.stringify(activation));
    await assert.doesNotReject(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }));
  } finally { await rm(path, { recursive: true }); }
});

test("symmetric compatibility accepts overlap and bounded solver exposes its limit", async () => {
  const batch = algorithmsBatch(); batch.modeStructures.compatibilitySets = [{ id: "fixture-symmetric", version: "v1", relation: "same_mechanism", direction: "symmetric", sourceItemIds: ["fixture-algorithm-1", "fixture-algorithm-2"], targetItemIds: ["fixture-algorithm-2", "fixture-algorithm-1"], relationMetadata: { mechanismBoundary: "arrays_and_strings" } }];
  const path = await root({ algorithms: batch, approvals: false });
  try {
    const inspected = await inspectTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }); const pool = inspected.source.modeStructures.simulationPools[0]; const profile = inspected.source.modeStructures.simulationProfiles[0];
    assert.deepEqual(inspected.source.items[0].compatibilityMemberships, ["fixture-symmetric"]);
    assert.throws(() => selectSimulationPlan({ profile, pool, items: inspected.source.items, selectionSeed: "limit", stateLimit: 1 }), fails("SIMULATION_SOLVER_LIMIT"));
  } finally { await rm(path, { recursive: true }); }
});

test("real source without canonical Algorithms taxonomy stops after ingress discovery", async () => {
  const path = await root({ algorithms: algorithmsBatch(), approvals: false });
  try {
    await writeFile(join(path, "config/taxonomy/algorithms.json"), JSON.stringify({ schemaVersion: "algorithms-taxonomy-v1", trackId: "algorithms", taxonomyVersion: "algorithms-taxonomy-v2" }));
    await assert.rejects(() => inspectTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("MISSING_CANONICAL_TAXONOMY"));
  } finally { await rm(path, { recursive: true }); }
});

test("build refuses dirty or untracked canonical inputs before emitting an artifact", async () => {
  const path = await root({ algorithms: algorithmsBatch() });
  try {
    await exec("git", ["init", "-q"], { cwd: path }); await exec("git", ["config", "user.email", "fixture@example.test"], { cwd: path }); await exec("git", ["config", "user.name", "Fixture"], { cwd: path }); await exec("git", ["add", "."], { cwd: path }); await exec("git", ["commit", "-qm", "fixture"], { cwd: path });
    await writeFile(join(path, "manual/source/algorithms/untracked.json"), "{}\n");
    await assert.rejects(() => buildTrack({ root: path, trackId: "algorithms", outputRoot: join(path, "out") }), fails("DIRTY_SOURCE"));
  } finally { await rm(path, { recursive: true }); }
});

test("build checks every immutable target before making an artifact visible", async () => {
  const path = await root({ algorithms: algorithmsBatch() });
  try {
    const out = join(path, "out"); const report = join(path, "reports/publishing/algorithms-algorithms-fixture-v2.json"); await mkdir(dirname(report), { recursive: true }); await writeFile(report, "existing\n");
    await assert.rejects(() => buildTrack({ root: path, trackId: "algorithms", outputRoot: out, sourceRepositoryCommit: COMMIT }), fails("IMMUTABLE_VERSION"));
    await assert.rejects(() => stat(join(out, "tracks/algorithms/algorithms-fixture-v2/track-artifact.json")), (error) => error?.code === "ENOENT");
  } finally { await rm(path, { recursive: true }); }
});

test("artifact and release are immutable, exact-byte checked, and tracks remain independent", async () => {
  const path = await root({ algorithms: algorithmsBatch(), certification: certificationBatch() });
  try {
    const out = join(path, "out"); const algorithm = await buildTrack({ root: path, trackId: "algorithms", outputRoot: out, sourceRepositoryCommit: "fixture-source-commit" });
    assert.deepEqual(Object.keys(algorithm.artifact).sort(), ["approvalCoverage", "artifactBytes", "checksumSha256", "contentVersion", "declaredModes", "familyId", "schemaVersion", "sourceRepositoryCommit", "taxonomyVersion", "trackId"]);
    await assert.rejects(() => buildTrack({ root: path, trackId: "algorithms", outputRoot: out, sourceRepositoryCommit: "fixture-source-commit" }), fails("IMMUTABLE_VERSION"));
    const release = await publishRelease({ root: path, releaseId: "algorithms-only", artifactPaths: [algorithm.path], outputRoot: out, sourceRepositoryCommit: "fixture-source-commit" }); assert.deepEqual(release.release.artifacts.map((entry) => entry.trackId), ["algorithms"]);
    const raw = JSON.parse(await readFile(algorithm.path, "utf8")); raw.artifactBytes += " "; await writeFile(algorithm.path, JSON.stringify(raw)); await assert.rejects(() => verifyArtifact(algorithm.path), fails("CHECKSUM_MISMATCH"));
  } finally { await rm(path, { recursive: true }); }
});

test("fixtures and legacy paths cannot enter production publishing code", async () => {
  const source = await readFile("scripts/publishing/pipeline.mjs", "utf8"); assert.doesNotMatch(source, /tests\/fixtures|tracks\/algorithms|tracks\/cloud-certification|slice\(0, 40\)|Math\.random/);
  const workflow = await readFile(".github/workflows/real-content-release.yml", "utf8"); assert.match(workflow, /algorithms-real-content/); assert.match(workflow, /certification-real-content/); assert.doesNotMatch(workflow, /continue-on-error/);
});
