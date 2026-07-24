import assert from "node:assert/strict";
import test from "node:test";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { buildTrack, CANONICAL_SERIALIZATION_VERSION, emitTechnicalEvidence, hash, inspectTrack, PublishingFailure, publishRelease, selectSimulationItems, selectSimulationPlan, validateTrack, verifyArtifact } from "../scripts/publishing/pipeline.mjs";
import { algorithmsBatch, certificationBatch, certificationDiagnosticBaseline, certificationExamExperienceProfile, fixtureRoot } from "./fixtures/manualPublishingFixture.mjs";
import { APPLICATION_ALGORITHMS_BANK_KEYS, APPLICATION_ALGORITHMS_ITEM_KEYS, APPLICATION_ALGORITHMS_ITEM_OPTIONAL_KEYS, APPLICATION_ALGORITHM_MODE_IDS } from "./fixtures/applicationContractSnapshot.mjs";
import { generatedTypeScript, structuralPayload, taxonomyFingerprint } from "../scripts/taxonomy/export-algorithms-taxonomy.mjs";

const COMMIT = "fixture-source-commit";
const exec = promisify(execFile);
async function root(input = {}) { const path = await mkdtemp(join(tmpdir(), "patternly-publishing-")); await fixtureRoot(path, input); return path; }
const fails = (code) => (error) => error instanceof PublishingFailure && error.code === code;
function simulationInput({ items, distributions = [], profileId = "solver-profile", seed = "solver-seed" }) {
  const itemIds = items.map((item) => item.id);
  return {
    profile: { profileId, profileVersion: "v1", poolId: "solver-pool", distributions },
    pool: { poolId: "solver-pool", poolVersion: "v1", itemIds },
    items,
    selectionSeed: seed,
  };
}
function solverItem(id, { difficulty = "neutral", mentalUnit = "unit", interactionType = "choice" } = {}) { return { id, difficulty, interactionType, resolvedTaxonomy: { learningStage: "foundations", primaryMentalUnitId: mentalUnit } }; }
function shaRank(input, itemId) { return hash(`${CANONICAL_SERIALIZATION_VERSION}\n${JSON.stringify([input.profile.profileId, input.profile.profileVersion, input.pool.poolId, input.pool.poolVersion, input.selectionSeed, itemId])}`); }
function simulationValue(item, dimension) { return dimension === "interactionType" ? item.interactionType : dimension === "difficulty" ? item.difficulty : item.resolvedTaxonomy[dimension]; }
function legacyLocalGreedyPlan(input) {
  const compareText = (left, right) => left === right ? 0 : left < right ? -1 : 1; const buckets = input.profile.distributions.flatMap((distribution) => distribution.buckets.map((bucket) => ({ ...bucket, dimension: distribution.dimension }))); const ranked = input.items.map((item) => ({ item, rank: shaRank(input, item.id) })).sort((left, right) => compareText(left.rank, right.rank) || compareText(left.item.id, right.item.id)); const selected = [];
  while (selected.length < 40) { const count = (bucket) => selected.filter((item) => simulationValue(item, bucket.dimension) === bucket.valueId).length; const choices = ranked.filter(({ item }) => !selected.includes(item)).filter(({ item }) => buckets.every((bucket) => count(bucket) + (simulationValue(item, bucket.dimension) === bucket.valueId ? 1 : 0) <= bucket.maximum)).sort((left, right) => { const penalty = (candidate) => buckets.reduce((total, bucket) => Math.abs(count(bucket) + (simulationValue(candidate.item, bucket.dimension) === bucket.valueId ? 1 : 0) - bucket.target) - Math.abs(count(bucket) - bucket.target), 0); return penalty(left) - penalty(right) || compareText(left.rank, right.rank) || compareText(left.item.id, right.item.id); }); selected.push(choices[0].item); }
  return selected;
}
function targetDeviation(items, profile) { return profile.distributions.flatMap((distribution) => distribution.buckets.map((bucket) => Math.abs(items.filter((item) => simulationValue(item, distribution.dimension) === bucket.valueId).length - bucket.target))).reduce((total, value) => total + value, 0); }
async function fixtureGit(root, ...args) { return exec("git", args, { cwd: root }); }
async function commitFixtureInputs(root, message) { await fixtureGit(root, "add", "-A"); await fixtureGit(root, "commit", "-m", message); return (await fixtureGit(root, "rev-parse", "HEAD")).stdout.trim(); }
async function writeFixtureApprovalAndActivation(root, inspected, evidence) {
  const approvalId = "fixture-cycle-approval";
  await mkdir(join(root, "manual/approvals/algorithms"), { recursive: true });
  await writeFile(join(root, "manual/approvals/algorithms/fixture-cycle-approval.json"), JSON.stringify({ approvalSchemaVersion: 1, approvalId, reviewKind: "editorial", batchId: evidence.batchId, familyId: "algorithms", trackId: "algorithms", primaryTaxonomyReference: "arrays_and_strings", includedItems: Object.entries(evidence.itemFingerprints).map(([itemId, itemFingerprint]) => ({ itemId, itemFingerprint })), reviewer: "fixture reviewer", reviewDate: "2026-07-17", technicalValidationEvidenceId: evidence.evidenceId, factualAndEditorialDefectsFound: [], requiredCorrections: [], finalDisposition: "approved" }));
  await mkdir(join(root, "manual/activations/algorithms"), { recursive: true });
  await writeFile(join(root, "manual/activations/algorithms/fixture-cycle-activation.json"), JSON.stringify({ activationSchemaVersion: 1, activationId: "fixture-cycle-activation", trackId: "algorithms", familyId: "algorithms", contentVersion: inspected.source.contentVersion, taxonomyVersion: inspected.source.taxonomyVersion, itemCoverage: inspected.source.items.map((item) => ({ itemId: item.id, itemFingerprint: item.itemFingerprint, approvalId })) }));
}
async function cleanGitReleaseFixture(path) {
  await fixtureGit(path, "init"); await fixtureGit(path, "config", "user.email", "fixture@example.test"); await fixtureGit(path, "config", "user.name", "Fixture Test"); await commitFixtureInputs(path, "technical inputs");
  const evidence = await emitTechnicalEvidence({ root: path, trackId: "algorithms" }); await commitFixtureInputs(path, "technical evidence"); const inspected = await inspectTrack({ root: path, trackId: "algorithms" }); await writeFixtureApprovalAndActivation(path, inspected, evidence.evidence[0]); await commitFixtureInputs(path, "approvals and activation");
  return evidence;
}

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
    const simulation = bank.practiceBlueprints.find((entry) => entry.modeId === "algorithms-interview-simulation");
    assert.deepEqual({ ...simulation, resolvedItemIds: undefined }, { blueprintId: "fixture-interview-simulation", blueprintVersion: "1", modeId: "algorithms-interview-simulation", requestedLengths: [40], defaultRequestedLength: 40, shortening: "prohibited", minimumActualLength: 40, composition: { kind: "simulation_pool", ids: ["fixture-pool"] }, resolvedItemIds: undefined });
    assert.equal(simulation.resolvedItemIds.length, 40); assert.equal(new Set(simulation.resolvedItemIds).size, 40); assert.ok(simulation.resolvedItemIds.every((id) => bank.simulationPools[0].itemIds.includes(id)));
    assert.doesNotMatch(JSON.stringify(bank), /resolvedModeDeclarations|technicalValidationEvidence|sourceOverrides|relationMetadata/);
  } finally { await rm(first, { recursive: true }); await rm(second, { recursive: true }); }
});

test("publisher accepts only exact application Algorithms mode IDs", async () => {
  const track = JSON.parse(await readFile("config/tracks/algorithms.json", "utf8")); assert.deepEqual([...track.modeConfiguration.practiceBlueprints.map((entry) => entry.modeId), track.modeConfiguration.simulationBlueprint.modeId], APPLICATION_ALGORITHM_MODE_IDS);
  const path = await root({ algorithms: algorithmsBatch({ declaredModes: ["retired-local-mode-id"] }), approvals: false });
  try { await assert.rejects(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("INVALID_MODE")); } finally { await rm(path, { recursive: true }); }
});

test("Algorithms track configuration owns six practice blueprints and rejects batch-owned blueprints", async () => {
  const path = await root({ algorithms: algorithmsBatch(), approvals: false });
  try {
    const trackPath = join(path, "config/tracks/algorithms.json"); const track = JSON.parse(await readFile(trackPath, "utf8")); assert.equal(track.modeConfiguration.practiceBlueprints.length, 6); assert.equal(track.modeConfiguration.simulationBlueprint.modeId, "algorithms-interview-simulation");
    delete track.modeConfiguration; await writeFile(trackPath, JSON.stringify(track)); await assert.rejects(() => inspectTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("MISSING_TRACK_MODE_CONFIGURATION"));
    await fixtureRoot(path, { algorithms: algorithmsBatch(), approvals: false }); const sourcePath = join(path, "manual/source/algorithms/fixture.json"); const source = JSON.parse(await readFile(sourcePath, "utf8")); source.modeStructures.practiceBlueprints = []; await writeFile(sourcePath, JSON.stringify(source)); await assert.rejects(() => inspectTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("INVALID_SCHEMA"));
  } finally { await rm(path, { recursive: true }); }
});

test("constraints and difficulty compile as the application contract's legal optional fields", async () => {
  const batch = algorithmsBatch(); batch.items[0].constraints = ["fixture constraint"]; batch.items[0].difficulty = "foundational";
  const path = await root({ algorithms: batch });
  try {
    const built = await buildTrack({ root: path, trackId: "algorithms", outputRoot: join(path, "out"), sourceRepositoryCommit: COMMIT }); const item = JSON.parse(built.artifact.artifactBytes).bank.items.find((entry) => entry.id === "fixture-algorithm-1");
    assert.deepEqual(Object.keys(item).filter((key) => APPLICATION_ALGORITHMS_ITEM_OPTIONAL_KEYS.includes(key)).sort(), [...APPLICATION_ALGORITHMS_ITEM_OPTIONAL_KEYS].sort()); assert.deepEqual(item.constraints, ["fixture constraint"]); assert.equal(item.difficulty, "foundational");
  } finally { await rm(path, { recursive: true }); }
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

test("technical evidence survives the clean multi-commit approval and activation cycle", async () => {
  const path = await root({ algorithms: algorithmsBatch(), approvals: false });
  try {
    await fixtureGit(path, "init"); await fixtureGit(path, "config", "user.email", "fixture@example.test"); await fixtureGit(path, "config", "user.name", "Fixture Test");
    const technicalCommit = await commitFixtureInputs(path, "technical inputs"); const initial = await inspectTrack({ root: path, trackId: "algorithms" }); const emitted = await emitTechnicalEvidence({ root: path, trackId: "algorithms" }); const evidence = emitted.evidence[0];
    assert.equal(evidence.validatedAtSourceCommit, technicalCommit); assert.equal(evidence.technicalInputFingerprint, initial.source.technicalInputFingerprint);
    const evidenceCommit = await commitFixtureInputs(path, "technical evidence"); const reused = await emitTechnicalEvidence({ root: path, trackId: "algorithms" }); assert.deepEqual(reused.evidence, emitted.evidence);
    const approved = await inspectTrack({ root: path, trackId: "algorithms" }); await writeFixtureApprovalAndActivation(path, approved, evidence); const releaseCommit = await commitFixtureInputs(path, "approvals and activation");
    const validated = await validateTrack({ root: path, trackId: "algorithms" }); const built = await buildTrack({ root: path, trackId: "algorithms", outputRoot: join(path, "out") });
    assert.equal(validated.source.technicalInputFingerprint, evidence.technicalInputFingerprint); assert.equal(built.artifact.sourceRepositoryCommit, releaseCommit); assert.notEqual(evidenceCommit, releaseCommit);
    const approvalPath = join(path, "manual/approvals/algorithms/fixture-cycle-approval.json"); const approval = JSON.parse(await readFile(approvalPath, "utf8")); approval.reviewDate = "2026-07-18"; await writeFile(approvalPath, JSON.stringify(approval)); const approvalCommit = await commitFixtureInputs(path, "approval metadata"); await assert.doesNotReject(() => validateTrack({ root: path, trackId: "algorithms" })); assert.notEqual(approvalCommit, releaseCommit);
    const sourcePath = join(path, "manual/source/algorithms/fixture.json"); const source = JSON.parse(await readFile(sourcePath, "utf8")); source.items[0].prompt = "Choose all changed technical invariants."; await writeFile(sourcePath, JSON.stringify(source)); await commitFixtureInputs(path, "changed source"); const changed = await inspectTrack({ root: path, trackId: "algorithms" }); assert.notEqual(changed.source.technicalInputFingerprint, evidence.technicalInputFingerprint); await assert.rejects(() => validateTrack({ root: path, trackId: "algorithms" }), fails("MISSING_TECHNICAL_EVIDENCE"));
  } finally { await rm(path, { recursive: true }); }
});

test("build rejects modified and untracked technical evidence outside the committed release candidate", async () => {
  for (const kind of ["modified", "untracked"]) {
    const path = await root({ algorithms: algorithmsBatch(), approvals: false });
    try {
      const evidence = await cleanGitReleaseFixture(path);
      if (kind === "modified") await writeFile(evidence.path, `${await readFile(evidence.path, "utf8")} `);
      else { const untracked = join(path, "evidence/algorithms/technical/untracked.json"); await mkdir(dirname(untracked), { recursive: true }); await writeFile(untracked, "{}\n"); }
      await assert.rejects(() => buildTrack({ root: path, trackId: "algorithms", outputRoot: join(path, "out") }), fails("DIRTY_SOURCE"));
    } finally { await rm(path, { recursive: true }); }
  }
});

test("technical input fingerprint includes config, taxonomy, and source schema", async () => {
  const path = await root({ algorithms: algorithmsBatch(), approvals: false });
  try {
    await fixtureGit(path, "init"); await fixtureGit(path, "config", "user.email", "fixture@example.test"); await fixtureGit(path, "config", "user.name", "Fixture Test"); await commitFixtureInputs(path, "technical inputs");
    const baseline = (await inspectTrack({ root: path, trackId: "algorithms" })).source.technicalInputFingerprint;
    const familyPath = join(path, "config/families/algorithms.json"); const family = JSON.parse(await readFile(familyPath, "utf8")); family.technicalRevision = 1; await writeFile(familyPath, JSON.stringify(family)); assert.notEqual((await inspectTrack({ root: path, trackId: "algorithms" })).source.technicalInputFingerprint, baseline);
    const taxonomyPath = join(path, "config/taxonomy/algorithms.json"); const taxonomy = JSON.parse(await readFile(taxonomyPath, "utf8")); taxonomy.roadmapNodes.push({ id: "unused_valid_node" }); await writeFile(taxonomyPath, JSON.stringify(taxonomy)); assert.notEqual((await inspectTrack({ root: path, trackId: "algorithms" })).source.technicalInputFingerprint, baseline);
    const schemaPath = join(path, "schemas/publishing/algorithms-manual-source.schema.json"); const schema = JSON.parse(await readFile(schemaPath, "utf8")); schema.title = "Changed technical schema"; await writeFile(schemaPath, JSON.stringify(schema)); assert.notEqual((await inspectTrack({ root: path, trackId: "algorithms" })).source.technicalInputFingerprint, baseline);
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

test("simulation selection prefers declared targets without weakening fixed-40 constraints", async () => {
  const batch = algorithmsBatch({ count: 41 }); batch.items.forEach((entry, index) => { entry.difficulty = index === 40 ? "other" : "target"; });
  const path = await root({ algorithms: batch });
  try {
    const inspected = await validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }); const pool = inspected.source.modeStructures.simulationPools[0]; const profile = { ...inspected.source.modeStructures.simulationProfiles[0], distributions: [{ dimension: "difficulty", buckets: [{ valueId: "target", minimum: 0, target: 40, maximum: 40 }, { valueId: "other", minimum: 0, target: 0, maximum: 40 }] }] };
    const selected = selectSimulationPlan({ profile, pool, items: inspected.source.items, selectionSeed: "targets" }); assert.equal(selected.itemIds.length, 40); assert.equal(selected.diagnostics.targetDeviation, 0); assert.ok(selected.itemIds.every((id) => id !== "fixture-algorithm-41"));
  } finally { await rm(path, { recursive: true }); }
});

test("simulation branch-and-bound finds the global multi-dimensional target optimum", () => {
  const items = [
    ...Array.from({ length: 20 }, (_, index) => solverItem(`ax-${index}`, { difficulty: "a", mentalUnit: "x" })),
    ...Array.from({ length: 20 }, (_, index) => solverItem(`by-${index}`, { difficulty: "b", mentalUnit: "y" })),
    solverItem("ay", { difficulty: "a", mentalUnit: "y" }),
    solverItem("bx", { difficulty: "b", mentalUnit: "x" }),
  ];
  const input = simulationInput({ items, distributions: [
    { dimension: "difficulty", buckets: [{ valueId: "a", minimum: 0, target: 20, maximum: 40 }, { valueId: "b", minimum: 0, target: 20, maximum: 40 }] },
    { dimension: "primaryMentalUnitId", buckets: [{ valueId: "x", minimum: 0, target: 20, maximum: 40 }, { valueId: "y", minimum: 0, target: 20, maximum: 40 }] },
  ] });
  const result = selectSimulationPlan(input);
  assert.equal(result.itemIds.length, 40); assert.equal(new Set(result.itemIds).size, 40); assert.equal(result.diagnostics.totalTargetDeviation, 0); assert.equal(result.diagnostics.optimalityProven, true);
});

test("simulation rejects the previous local-target greedy counterexample", () => {
  const shapes = ["011", "100", "001", "100", "011", "001", "010", "111", "110", "111", "001", "000", "101", "000", "111", "110", "001", "110", "000", "100", "101", "100", "101", "100", "010", "001", "001", "101", "010", "000", "011", "100", "010", "100", "111", "110", "000", "010", "101", "010", "111", "110"];
  const items = shapes.map((shape, index) => solverItem(`counterexample-${String(index + 1).padStart(2, "0")}`, { difficulty: shape[0] === "0" ? "a" : "b", mentalUnit: shape[1] === "0" ? "unit-a" : "unit-b", interactionType: shape[2] === "0" ? "choice" : "ordering" }));
  const input = simulationInput({ items, profileId: "global-counterexample", seed: "counterexample", distributions: [
    { dimension: "difficulty", buckets: [{ valueId: "a", minimum: 0, target: 20, maximum: 40 }] },
    { dimension: "primaryMentalUnitId", buckets: [{ valueId: "unit-a", minimum: 0, target: 20, maximum: 40 }] },
    { dimension: "interactionType", buckets: [{ valueId: "choice", minimum: 0, target: 20, maximum: 40 }] },
  ] });
  const legacy = legacyLocalGreedyPlan(input); const global = selectSimulationPlan(input);
  assert.equal(legacy.length, 40); assert.equal(global.diagnostics.totalTargetDeviation, 2); assert.equal(targetDeviation(legacy, input.profile), 4); assert.ok(global.diagnostics.totalTargetDeviation < targetDeviation(legacy, input.profile));
});

test("simulation tie-break is SHA-ranked, seed-dependent only on ties, and input-order independent", () => {
  const items = Array.from({ length: 41 }, (_, index) => solverItem(`tie-${String(index + 1).padStart(2, "0")}`));
  const input = simulationInput({ items }); const first = selectSimulationPlan(input); const reversed = selectSimulationPlan({ ...input, items: [...items].reverse() }); const alternateSeed = selectSimulationPlan({ ...input, selectionSeed: "alternate-seed" }); const compareText = (left, right) => left === right ? 0 : left < right ? -1 : 1; const expected = [...items].sort((left, right) => compareText(shaRank(input, left.id), shaRank(input, right.id)) || compareText(left.id, right.id)).slice(0, 40).map((item) => item.id);
  assert.equal(first.diagnostics.totalTargetDeviation, 0); assert.deepEqual(first.itemIds, expected); assert.deepEqual(first.itemIds, reversed.itemIds); assert.equal(first.itemIds.length, 40); assert.equal(new Set(first.itemIds).size, 40); assert.notDeepEqual(first.itemIds, alternateSeed.itemIds);
});

test("simulation treats minima and maxima as hard constraints and distinguishes infeasibility from a limit", () => {
  const items = [...Array.from({ length: 20 }, (_, index) => solverItem(`a-${index}`, { difficulty: "a" })), ...Array.from({ length: 21 }, (_, index) => solverItem(`b-${index}`, { difficulty: "b" }))];
  const constrained = simulationInput({ items, distributions: [{ dimension: "difficulty", buckets: [{ valueId: "a", minimum: 20, target: 20, maximum: 20 }, { valueId: "b", minimum: 20, target: 20, maximum: 20 }] }] });
  const selected = selectSimulationPlan(constrained); assert.equal(selected.itemIds.length, 40); assert.equal(selected.itemIds.filter((id) => id.startsWith("a-")).length, 20); assert.equal(selected.itemIds.filter((id) => id.startsWith("b-")).length, 20);
  const impossible = simulationInput({ items, distributions: [{ dimension: "difficulty", buckets: [{ valueId: "a", minimum: 21, target: 21, maximum: 40 }] }] });
  assert.throws(() => selectSimulationPlan(impossible), fails("SIMULATION_INFEASIBLE"));
  assert.throws(() => selectSimulationPlan({ ...constrained, stateLimit: 1 }), fails("SIMULATION_SOLVER_LIMIT"));
});

test("approvals and activations bind exact immutable fingerprints", async () => {
  const path = await root({ algorithms: algorithmsBatch() });
  try {
    const source = join(path, "manual/source/algorithms/fixture.json"); const batch = JSON.parse(await readFile(source, "utf8")); batch.items[0].prompt = "Select all changed learner-visible invariants."; await writeFile(source, JSON.stringify(batch));
    await emitTechnicalEvidence({ root: path, trackId: "algorithms", sourceRepositoryCommit: "fixture-source-commit-changed" });
    await assert.rejects(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: "fixture-source-commit-changed" }), fails("MISSING_APPROVAL"));
  } finally { await rm(path, { recursive: true }); }
});

test("approval item identities must exactly match the cited technical evidence", async () => {
  const path = await root({ algorithms: algorithmsBatch() });
  try {
    const approvalPath = join(path, "manual/approvals/algorithms/fixture-algorithms-batch.json"); const approval = JSON.parse(await readFile(approvalPath, "utf8")); approval.includedItems.pop(); await writeFile(approvalPath, JSON.stringify(approval));
    await assert.rejects(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("INVALID_APPROVAL"));
  } finally { await rm(path, { recursive: true }); }
});

test("an unchanged item approval is reusable across a later content version with new exact activation", async () => {
  const path = await root({ algorithms: algorithmsBatch() });
  try {
    const sourcePath = join(path, "manual/source/algorithms/fixture.json"); const source = JSON.parse(await readFile(sourcePath, "utf8")); source.contentVersion = "algorithms-fixture-v3"; await writeFile(sourcePath, JSON.stringify(source));
    await emitTechnicalEvidence({ root: path, trackId: "algorithms", sourceRepositoryCommit: "fixture-source-commit-v3" });
    const activationPath = join(path, "manual/activations/algorithms/fixture-activation.json"); const activation = JSON.parse(await readFile(activationPath, "utf8")); activation.contentVersion = source.contentVersion; await writeFile(activationPath, JSON.stringify(activation));
    await assert.doesNotReject(() => validateTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: "fixture-source-commit-v3" }));
  } finally { await rm(path, { recursive: true }); }
});

test("symmetric compatibility accepts overlap and bounded solver exposes its limit", async () => {
  const batch = algorithmsBatch(); batch.modeStructures.compatibilitySets = [{ id: "fixture-symmetric", version: "v1", relation: "same_mechanism", direction: "symmetric", sourceItemIds: ["fixture-algorithm-1", "fixture-algorithm-2"], targetItemIds: ["fixture-algorithm-2", "fixture-algorithm-1"], relationMetadata: { mechanismBoundary: "arrays_and_strings" } }];
  const path = await root({ algorithms: batch, approvals: false });
  try {
    const inspected = await inspectTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }); const pool = inspected.source.modeStructures.simulationPools[0]; const profile = inspected.source.modeStructures.simulationProfiles[0];
    assert.deepEqual(inspected.source.items[0].compatibilityMemberships, ["fixture-symmetric"]);
    assert.throws(() => selectSimulationPlan({ profile, pool, items: inspected.source.items, selectionSeed: "limit", stateLimit: 1 }), (error) => fails("SIMULATION_SOLVER_LIMIT")(error) && /visitedStates/.test(error.message) && /stateLimit/.test(error.message) && /bestSolutionFound/.test(error.message) && /optimalityProven":false/.test(error.message));
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
    const out = join(path, "out"); const report = join(out, "tracks/algorithms/algorithms-fixture-v2/build-report.json"); await mkdir(dirname(report), { recursive: true }); await writeFile(report, "existing\n");
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
    await assert.rejects(() => publishRelease({ root: path, releaseId: "--help", artifactPaths: [algorithm.path], outputRoot: out, sourceRepositoryCommit: "fixture-source-commit" }), fails("INVALID_RELEASE"));
    await assert.rejects(() => publishRelease({ root: path, releaseId: "empty-release", artifactPaths: [], outputRoot: out, sourceRepositoryCommit: "fixture-source-commit" }), fails("INVALID_RELEASE"));
    await assert.rejects(() => stat(join(out, "releases/--help")), (error) => error?.code === "ENOENT");
    const release = await publishRelease({ root: path, releaseId: "algorithms-only", artifactPaths: [algorithm.path], outputRoot: out, sourceRepositoryCommit: "fixture-source-commit" }); assert.deepEqual(release.release.artifacts.map((entry) => entry.trackId), ["algorithms"]); assert.match(await readFile(release.exportPath, "utf8"), /GENERATED_BUNDLED_CONTENT_RELEASE/);
    const raw = JSON.parse(await readFile(algorithm.path, "utf8")); raw.artifactBytes += " "; await writeFile(algorithm.path, JSON.stringify(raw)); await assert.rejects(() => verifyArtifact(algorithm.path), fails("CHECKSUM_MISMATCH"));
  } finally { await rm(path, { recursive: true }); }
});

test("certification publishes a validated, explicit exam experience profile", async () => {
  const path = await root({ certification: certificationBatch() });
  try {
    const inspected = await inspectTrack({ root: path, trackId: "cloud-certification", sourceRepositoryCommit: COMMIT });
    assert.deepEqual(inspected.source.examExperienceProfile, certificationExamExperienceProfile);
    assert.deepEqual(inspected.source.diagnosticBaseline, certificationDiagnosticBaseline);
    const output = await buildTrack({ root: path, trackId: "cloud-certification", outputRoot: join(path, "out"), sourceRepositoryCommit: COMMIT });
    assert.deepEqual(JSON.parse(output.artifact.artifactBytes).bank.examExperienceProfile, certificationExamExperienceProfile);
    assert.deepEqual(JSON.parse(output.artifact.artifactBytes).bank.diagnosticBaseline, certificationDiagnosticBaseline);
    const profilePath = join(path, "config/tracks/cloud-certification.json"); const track = JSON.parse(await readFile(profilePath, "utf8")); track.profile.navigation = "free_navigation"; await writeFile(profilePath, JSON.stringify(track));
    await assert.rejects(() => inspectTrack({ root: path, trackId: "cloud-certification", sourceRepositoryCommit: COMMIT }), fails("INVALID_EXAM_EXPERIENCE_PROFILE"));
  } finally { await rm(path, { recursive: true }); }
});

test("Certification Diagnostic Baseline rejects a shortened, duplicated, or out-of-bank fixed selection", async () => {
  const path = await root({ certification: certificationBatch() });
  try {
    const trackPath = join(path, "config/tracks/cloud-certification.json");
    const track = JSON.parse(await readFile(trackPath, "utf8"));
    track.modeConfiguration.diagnosticBaseline.itemIds[39] = track.modeConfiguration.diagnosticBaseline.itemIds[0];
    await writeFile(trackPath, JSON.stringify(track));
    await assert.rejects(() => inspectTrack({ root: path, trackId: "cloud-certification", sourceRepositoryCommit: COMMIT }), fails("INVALID_TRACK_MODE_CONFIGURATION"));
  } finally { await rm(path, { recursive: true }); }
});

test("fixtures and legacy paths cannot enter production publishing code", async () => {
  const source = await readFile("scripts/publishing/pipeline.mjs", "utf8"); assert.doesNotMatch(source, /tests\/fixtures|tracks\/algorithms|tracks\/cloud-certification|slice\(0, 40\)|Math\.random/);
  const workflow = await readFile(".github/workflows/real-content-release.yml", "utf8"); assert.match(workflow, /algorithms-real-content/); assert.match(workflow, /certification-real-content/); assert.doesNotMatch(workflow, /continue-on-error/);
});

test("Algorithms batch taxonomy uses mental-unit legal families, not family entry-unit equality", async () => {
  const path = await root({ algorithms: algorithmsBatch(), approvals: false });
  try {
    const taxonomyPath = join(path, "config/taxonomy/algorithms.json"); const taxonomy = JSON.parse(await readFile(taxonomyPath, "utf8"));
    taxonomy.mentalUnits.push({ id: "later_arrays_unit", roadmapNodeId: "arrays_and_strings", unitKind: "direct", primaryPatternFamilyId: "arrays_and_strings", legalPatternFamilyIds: ["arrays_and_strings"], primarySkillAtomId: "later_arrays_skill", secondarySkillAtomIds: [], learningStage: "foundations", patternVariantIds: [], problemArchetypeIds: [] });
    taxonomy.skillAtoms.push({ id: "later_arrays_skill", primaryMentalUnitId: "later_arrays_unit" }); await writeFile(taxonomyPath, JSON.stringify(taxonomy));
    const batch = algorithmsBatch(); batch.taxonomy.primaryMentalUnitId = "later_arrays_unit"; batch.items.forEach((item) => { item.taxonomy.primarySkillAtomId = "later_arrays_skill"; }); await writeFile(join(path, "manual/source/algorithms/fixture.json"), JSON.stringify(batch));
    await assert.doesNotReject(() => inspectTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }));
    batch.taxonomy.patternFamilyId = "unknown_family"; await writeFile(join(path, "manual/source/algorithms/fixture.json"), JSON.stringify(batch));
    await assert.rejects(() => inspectTrack({ root: path, trackId: "algorithms", sourceRepositoryCommit: COMMIT }), fails("INVALID_REFERENCE"));
  } finally { await rm(path, { recursive: true }); }
});

test("taxonomy exporter fingerprints exactly the generated structural payload", () => {
  const taxonomy = { taxonomyVersion: "algorithms-taxonomy-v2", learningStages: ["foundations"], roadmapNodes: [{ id: "arrays" }], mentalUnits: [], patternFamilies: [], patternVariants: [], problemArchetypes: [], skillAtoms: [], falseHeuristics: [] };
  const output = generatedTypeScript(taxonomy); assert.match(output, /GENERATED FILE — DO NOT EDIT MANUALLY/); assert.match(output, /patternly-content\/config\/taxonomy\/algorithms\.json/); assert.match(output, new RegExp(taxonomyFingerprint(structuralPayload(taxonomy))));
});

test("Algorithms structural SOT has the resolved node, family, and cross-family unit contract", async () => {
  const taxonomy = JSON.parse(await readFile("config/taxonomy/algorithms.json", "utf8"));
  assert.equal(taxonomy.taxonomyVersion, "algorithms-taxonomy-v2"); assert.deepEqual(taxonomy.roadmapNodes.map((node) => node.order), Array.from({ length: 26 }, (_, index) => index + 1));
  assert.equal(taxonomy.roadmapNodes.filter((node) => node.contentOwnership === "direct").length, 20); assert.equal(taxonomy.roadmapNodes.filter((node) => node.contentOwnership === "cross_family").length, 6); assert.equal(taxonomy.patternFamilies.length, 21);
  const units = new Map(taxonomy.mentalUnits.map((unit) => [unit.id, unit])); assert.equal(units.size, taxonomy.mentalUnits.length); assert.equal(units.get("recursion_base_case_and_result_contract").roadmapNodeId, "recursion_basics"); assert.equal(units.get("backtracking_base_case_and_result_contract").roadmapNodeId, "backtracking"); assert.equal(units.has("base_case_and_result_contract"), false);
  assert.equal(taxonomy.mentalUnits.filter((unit) => unit.unitKind === "strategy").length, 8); const contrast = taxonomy.mentalUnits.filter((unit) => unit.unitKind === "contrast"); assert.equal(contrast.length, 40); assert.ok(contrast.every((unit) => unit.learningStage === "contrast_practice" && unit.contrastedMentalUnitIds.length > 0));
  assert.equal(taxonomy.falseHeuristics.filter((entry) => entry.relevantRoadmapNodeIds.some((id) => id.startsWith("contrast_"))).length, 7);
});
