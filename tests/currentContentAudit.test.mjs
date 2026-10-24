import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import test from "node:test";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { canonicalJson, sha256 } from "../scripts/build.mjs";

import { assertAuditInputsUnchanged, captureAuditInputs, currentReviewBinding, projectUnitReviewContext, reconcileCurrentAudit, writeCurrentAuditState } from "../scripts/content-audit/reconcile.mjs";

const contract = JSON.parse(await readFile(new URL("../config/current-content-audit-contract.json", import.meta.url), "utf8"));
const context = Object.fromEntries(["unitSha256", "contextSha256", "sourceSha256", "scoringSha256", "rubricSha256"].map((key, index) => [key, String(index + 1).repeat(64)]));
const binding = (itemSha256 = "a".repeat(64), overrides = {}) => ({ schemaVersion: "patternly-current-audit-review-binding-v1", itemSha256, ...context, peerContextSha256: sha256([]), ...overrides });
const trackId = "object-oriented-design-interview";
const inventory = {
  observed: { tracks: 1, nodes: 1, mentalUnits: 1, questions: 2 },
  tracks: [{
    trackId,
    contentVersion: "current-v1",
    observed: { nodes: 1, mentalUnits: 1, questions: 2 },
    nodes: [{ nodeId: "node-a", mentalUnits: [{
      mentalUnitId: "unit-a",
      reviewContext: context,
      sourcePath: `${trackId}/node-a/unit-a.json`,
      items: [{ questionId: "q1", itemSha256: "a".repeat(64) }, { questionId: "q2", itemSha256: "b".repeat(64) }],
    }] }],
  }],
};
const currentQuestions = new Map([
  [`${trackId}:q1`, { questionId: "q1", interaction: { type: "choice_single", options: [{ optionId: "a" }, { optionId: "b" }] }, answer: { optionId: "a" } }],
  [`${trackId}:q2`, { questionId: "q2", interaction: { type: "free_response" }, answer: { type: "free_response" } }],
]);
const review = () => ({
  verdict: "PASS",
  severity: "none",
  dimensions: Object.fromEntries(contract.dimensions.map((dimension) => [dimension, { status: "PASS", evidence: `Reviewed ${dimension} for q1.` }])),
  findings: [],
  distractors: [{ optionId: "b", status: "PASS", misconception: "A specific mistaken choice.", evidence: "The option encodes that mistake.", explanationStatus: "PASS", explanationEvidence: "The explanation corrects that mistake." }],
  interactionReview: { evidence: "The selected response and exact scoring rule were checked." },
  reviewer: { model: "reviewer", reasoningEffort: "high", method: "individual review" },
  reviewedAt: "2026-10-19T12:00:00Z",
  duplicatePeers: [],
  factChecks: [],
});
const record = (overrides = {}) => ({
  track: trackId,
  contentVersion: "current-v1",
  file: `content/${trackId}/node-a/unit-a.json`,
  batch: `${trackId}/node-a/unit-a`,
  taxonomy: { nodeId: "node-a", mentalUnitId: "unit-a" },
  itemId: "q1",
  itemSha256: "a".repeat(64),
  review: review(),
  sourceBinding: binding(),
  ...overrides,
});
const common = { inventory, currentQuestions, contract, sourceInputFingerprint: "f".repeat(64), sourceRepositoryCommit: "a".repeat(40), sourceTree: "dirty", selectedTrack: trackId,
  auditInputManifest: { schemaVersion: "patternly-current-audit-input-manifest-v1", sha256: sha256([]), files: [] } };

test("reconciles exact current review and queues only unreviewed current IDs", () => {
  const result = reconcileCurrentAudit({ ...common, auditInput: { reviews: [record()] } });
  assert.equal(result.status, "IN_PROGRESS");
  assert.equal(result.counts.currentReviewCount, 1);
  assert.equal(result.counts.pendingCount, 1);
  assert.equal(result.counts.staleReviewCount, 0);
  assert.equal(result.nextBatch.track, trackId);
  assert.deepEqual(result.nextBatch.questionIds, ["q2"]);
  assert.deepEqual(result.nextBatch.unitItemIds, ["q1", "q2"]);
  assert.equal(result.nextBatch.remainingInUnit, 0);
  assert.equal(result.currentReviews[0].itemId, "q1");
});

test("stale exact-source identity is discarded and returned to pending", () => {
  const result = reconcileCurrentAudit({ ...common, auditInput: { reviews: [record({ itemSha256: "c".repeat(64) })] } });
  assert.equal(result.counts.currentReviewCount, 0);
  assert.equal(result.counts.pendingCount, 2);
  assert.equal(result.counts.staleReviewCount, 1);
  assert.deepEqual(result.nextBatch.questionIds, ["q1", "q2"]);
});

test("rejects duplicate current audit identities and incomplete 13-dimension evidence", () => {
  assert.throws(() => reconcileCurrentAudit({ ...common, auditInput: { reviews: [record(), record()] } }), /duplicate_input_review/u);
  const incomplete = review();
  delete incomplete.dimensions.learning_objective;
  assert.throws(() => reconcileCurrentAudit({ ...common, auditInput: { reviews: [record({ review: incomplete })] } }), /review_dimensions_incomplete_or_unknown/u);
});

test("intensive batches cap a large current unit at twelve items", () => {
  const largeInventory = structuredClone(inventory);
  largeInventory.tracks[0].observed.questions = 25;
  largeInventory.observed.questions = 25;
  largeInventory.tracks[0].nodes[0].mentalUnits[0].items = Array.from({ length: 25 }, (_, index) => ({ questionId: `q${String(index).padStart(2, "0")}`, itemSha256: String(index).padStart(64, "0") }));
  const questions = new Map(largeInventory.tracks[0].nodes[0].mentalUnits[0].items.map(({ questionId }) => [`${trackId}:${questionId}`, { questionId, interaction: { type: "free_response" }, answer: { type: "free_response" } }]));
  const result = reconcileCurrentAudit({ ...common, inventory: largeInventory, currentQuestions: questions, batchSize: 12, auditInput: { reviews: [] } });
  assert.equal(result.nextBatch.questionIds.length, 12);
  assert.equal(result.nextBatch.remainingInUnit, 13);
});

const completeRecords = () => [record(), record({
  itemId: "q2", itemSha256: "b".repeat(64), sourceBinding: binding("b".repeat(64)), review: { ...review(), distractors: [] },
})];

const invalidMetadataCases = [];
for (const field of ["reviewer", "interactionReview"]) {
  for (const value of [undefined, null, {}, [], "text", 1, true]) {
    invalidMetadataCases.push([`${field}=${JSON.stringify(value)}`, (item) => { item[field] = value; },
      field === "reviewer" ? (value && !Array.isArray(value) && typeof value === "object" ? "review_reviewer_field_invalid:model" : "review_reviewer_invalid")
        : (value && !Array.isArray(value) && typeof value === "object" ? "review_interaction_evidence_invalid" : "review_interaction_invalid")]);
  }
}
for (const field of ["model", "reasoningEffort", "method"]) {
  for (const value of [undefined, null, "", " \n\t", 1, true, [], {}]) {
    invalidMetadataCases.push([`reviewer.${field}=${JSON.stringify(value)}`, (item) => { item.reviewer[field] = value; }, `review_reviewer_field_invalid:${field}`]);
  }
}
for (const value of [undefined, null, "", " \n\t", 1, true, [], {}]) {
  invalidMetadataCases.push([`interactionReview.evidence=${JSON.stringify(value)}`, (item) => { item.interactionReview.evidence = value; }, "review_interaction_evidence_invalid"]);
}
for (const value of [undefined, null, "", " ", 1, true, [], {}, "not-a-date", "2026-10-19", "2026-10-19T12:00:00",
  "2026-02-30T12:00:00Z", "2025-02-29T12:00:00Z", "2026-04-31T12:00:00Z", "2026-13-01T12:00:00Z",
  "2026-00-01T12:00:00Z", "2026-01-00T12:00:00Z", "2026-10-19T24:00:00Z", "2026-10-19T12:60:00Z",
  "2026-10-19T12:00:60Z", "2026-10-19T12:00:00+24:00", "2026-10-19T12:00:00+02:60"]) {
  invalidMetadataCases.push([`reviewedAt=${JSON.stringify(value)}`, (item) => { item.reviewedAt = value; }, "review_reviewed_at_invalid"]);
}
for (const field of ["duplicatePeers", "factChecks"]) {
  for (const value of [undefined, null, {}, "text", 1, true]) {
    invalidMetadataCases.push([`${field}=${JSON.stringify(value)}`, (item) => { item[field] = value; }, "review_metadata_missing"]);
  }
}
for (const [label, mutate, category] of invalidMetadataCases) {
  test(`rejects incomplete metadata before returning counts or COMPLETE: ${label}`, () => {
    const records = completeRecords();
    // The final row would otherwise complete this entire synthetic inventory.
    mutate(records[1].review);
    let result;
    assert.throws(() => { result = reconcileCurrentAudit({ ...common, auditInput: { reviews: records } }); },
      { message: `current_audit_invalid:${category}` });
    assert.equal(result, undefined, "invalid input must not publish counters or COMPLETE");
  });
}

test("accepts complete metadata without inventing values and completes the synthetic inventory", () => {
  for (const reviewedAt of ["2026-10-19T12:00:00Z", "2024-02-29T12:00:00.123Z", "2026-10-19T14:00:00+02:00", "2026-10-19T07:00:00-05:00", "2024-01-02t03:04:05.123z"]) {
    const records = completeRecords();
    records[1].review.reviewedAt = reviewedAt;
    records[1].review.reviewer = { model: "any-recorded-model", reasoningEffort: "recorded-effort", method: "manual item review" };
    const before = structuredClone(records);
    const result = reconcileCurrentAudit({ ...common, auditInput: { reviews: records } });
    assert.equal(result.questionReviewStatus, "COMPLETE");
    assert.equal(result.status, "IN_PROGRESS", "individual reviews do not assess whole-unit coverage");
    assert.equal(result.counts.currentReviewCount, 2);
    assert.equal(result.counts.currentByVerdict.PASS, 2);
    assert.equal(result.counts.pendingCount, 0);
    assert.equal(result.nextBatch, null);
    assert.deepEqual(result.currentReviews.map(({ review }) => review), records.map(({ review }) => review));
    assert.deepEqual(records, before);
  }
});

test("rejects the original combined empty-metadata counterexample", () => {
  const records = completeRecords();
  for (const item of records) Object.assign(item.review, { reviewer: {}, interactionReview: {}, reviewedAt: "not-a-date" });
  assert.throws(() => reconcileCurrentAudit({ ...common, auditInput: { reviews: records } }), /review_reviewer_field_invalid:model/u);
});

test("preserves distractor, fact-check, dimension and batch guards", () => {
  const missingDistractor = review();
  missingDistractor.distractors = [];
  assert.throws(() => reconcileCurrentAudit({ ...common, auditInput: { reviews: [record({ review: missingDistractor })] } }), /review_distractor_coverage_invalid/u);
  const failingDimension = review();
  failingDimension.dimensions.technical_correctness.status = "FAIL";
  assert.throws(() => reconcileCurrentAudit({ ...common, auditInput: { reviews: [record({ review: failingDimension })] } }), /pass_contains_nonpassing_dimension/u);
  const certTrack = "aws-certified-solutions-architect-associate";
  const certInventory = structuredClone(inventory);
  certInventory.tracks[0].trackId = certTrack;
  const questions = new Map([...currentQuestions].map(([key, value]) => [key.replace(trackId, certTrack), value]));
  const certRecord = record({ track: certTrack, batch: `${certTrack}/node-a/unit-a` });
  assert.throws(() => reconcileCurrentAudit({ ...common, inventory: certInventory, selectedTrack: certTrack, currentQuestions: questions, auditInput: { reviews: [certRecord] } }), /certification_fact_check_missing/u);
  certRecord.review.factChecks = [{ url: "https://example.com/official", checkedDate: "2026-10-19", claim: "Synthetic claim", evidence: "Synthetic source evidence" }];
  assert.equal(reconcileCurrentAudit({ ...common, inventory: certInventory, selectedTrack: certTrack, currentQuestions: questions, auditInput: { reviews: [certRecord] } }).counts.currentReviewCount, 1);
  assert.throws(() => reconcileCurrentAudit({ ...common, batchSize: 21 }), /batch_size_invalid/u);
});

for (const overrides of [{ contentVersion: "old" }, { file: "old.json" }, { taxonomy: { nodeId: "old", mentalUnitId: "unit-a" } }, { taxonomy: { nodeId: "node-a", mentalUnitId: "old" } }]) {
  test(`preserves exact identity guard: ${JSON.stringify(overrides)}`, () => {
    const result = reconcileCurrentAudit({ ...common, auditInput: { reviews: [record(overrides)] } });
    assert.equal(result.counts.currentReviewCount, 0);
    assert.equal(result.counts.currentByVerdict.PASS, 0);
    assert.equal(result.counts.staleReviewCount, 1);
    assert.equal(result.status, "IN_PROGRESS");
  });
}

const v2Input = (reviews, extra = {}) => ({ schemaVersion: contract.inputSchemaVersion, rubricVersion: contract.rubricVersion, reviews, ...extra });
const reconcile = (auditInput, extra = {}) => reconcileCurrentAudit({ ...common, auditInput, asOf: "2026-10-23T10:00:00Z", ...extra });
const freshness = (row, overrides = {}) => ({ fromContentVersion: row.contentVersion, toContentVersion: "current-v1",
  bindingSha256: sha256(row.sourceBinding), checkedAt: "2026-10-22T12:00:00Z", evidence: "Synthetic regression evidence: relevant facts checked against the target binding.",
  reviewer: { model: "fixture-reviewer", reasoningEffort: "high", method: "test fixture only" }, factChecks: [], ...overrides });

test("current state JSON roundtrip retains every supplied review and exact original attribution", () => {
  const first = reconcile(v2Input(completeRecords()));
  const second = reconcile(JSON.parse(JSON.stringify(first)));
  assert.deepEqual(second.currentReviews, first.currentReviews);
  assert.deepEqual(second.unitCoverage, first.unitCoverage);
  assert.deepEqual(second.counts, first.counts);
  assert.equal(second.counts.currentReviewCount, 2);
  assert.equal(second.questionReviewStatus, "COMPLETE");
  assert.equal(second.status, "IN_PROGRESS");
  assert.equal(second.unitCoverage[0].status, "NOT_ASSESSED");
  assert.equal(second.unitCoverage[0].requiredDecisions, null);
  assert.equal(second.unitCoverage[0].gaps, null);
});

test("version-only reuse needs explicit binding and relevant freshness; original review is unchanged", () => {
  const original = record({ contentVersion: "old-v0" });
  const withoutProof = reconcile(v2Input([original]));
  assert.equal(withoutProof.counts.pendingCount, 2);
  assert.equal(withoutProof.counts.discardedReviewReasons.version_reuse_evidence_missing_or_invalid, 1);
  const proven = { ...original, reuseEvidence: freshness(original) };
  const result = reconcile(v2Input([proven]));
  assert.equal(result.counts.currentReviewCount, 1);
  assert.equal(result.currentReviews[0].contentVersion, "current-v1");
  assert.equal(result.currentReviews[0].originContentVersion, "old-v0");
  assert.deepEqual(result.currentReviews[0].review, original.review);
  assert.deepEqual(reconcile(JSON.parse(JSON.stringify(result))).currentReviews, result.currentReviews);
  const noBinding = { ...proven, sourceBinding: undefined };
  assert.equal(reconcile(v2Input([noBinding])).counts.currentReviewCount, 0);
});

for (const field of ["unitSha256", "contextSha256", "sourceSha256", "scoringSha256", "rubricSha256", "peerContextSha256"]) {
  test(`same version and version-only evidence cannot conceal changed ${field}`, () => {
    const row = record({ sourceBinding: binding(undefined, { [field]: "e".repeat(64) }) });
    assert.equal(reconcile(v2Input([row])).counts.currentReviewCount, 0);
    row.contentVersion = "old-v0";
    row.reuseEvidence = freshness(row);
    assert.equal(reconcile(v2Input([row])).counts.currentReviewCount, 0);
  });
}

for (const override of [
  { checkedAt: "not-a-date" }, { checkedAt: "2026-10-24T12:00:00Z" }, { checkedAt: "2026-10-18T12:00:00Z" },
  { fromContentVersion: "another-origin" }, { toContentVersion: "another-target" }, { bindingSha256: "0".repeat(64) },
  { evidence: "" }, { reviewer: {} }, { factChecks: null },
]) {
  test(`version reuse fails closed for invalid freshness: ${JSON.stringify(override)}`, () => {
    const row = record({ contentVersion: "old-v0" });
    row.reuseEvidence = freshness(row, override);
    assert.equal(reconcile(v2Input([row])).counts.currentReviewCount, 0);
  });
}

test("freshness evidence must cover the original relevant fact claims with current dated evidence", () => {
  const row = record({ contentVersion: "old-v0" });
  row.review.factChecks = [{ url: "https://example.com/official", claim: "Test claim only", checkedDate: "2026-10-19", evidence: "Synthetic initial evidence" }];
  row.reuseEvidence = freshness(row);
  assert.equal(reconcile(v2Input([row])).counts.currentReviewCount, 0);
  row.reuseEvidence.factChecks = [{ url: row.review.factChecks[0].url, claim: "Wrong claim", checkedAt: "2026-10-22T11:00:00Z", evidence: "Synthetic recheck" }];
  assert.equal(reconcile(v2Input([row])).counts.currentReviewCount, 0);
  row.reuseEvidence.factChecks[0].claim = row.review.factChecks[0].claim;
  assert.equal(reconcile(v2Input([row])).counts.currentReviewCount, 1);
  row.reuseEvidence.factChecks[0].checkedAt = "2026-10-18T11:00:00Z";
  assert.equal(reconcile(v2Input([row])).counts.currentReviewCount, 0);
});

test("legacy missing binding or incomplete review stays pending with reasons; current malformed review fails", () => {
  const noBinding = record({ sourceBinding: undefined });
  const incomplete = record();
  delete incomplete.review.dimensions.technical_correctness;
  const legacy = (reviews) => ({ schemaVersion: "patternly-current-content-audit-input-v1", rubricVersion: contract.rubricVersion, reviews });
  assert.equal(reconcile(legacy([noBinding])).counts.currentReviewCount, 0);
  const result = reconcile(legacy([incomplete]));
  assert.equal(result.counts.currentReviewCount, 0);
  assert.equal(result.counts.pendingCount, 2);
  assert.equal(result.counts.discardedReviewReasons["current_audit_invalid:review_dimensions_incomplete_or_unknown"], 1);
  assert.throws(() => reconcile(v2Input([incomplete])), /review_dimensions_incomplete_or_unknown/u);
  const malformedState = reconcile(v2Input([record()]));
  delete malformedState.currentReviews[0].review.dimensions.learning_objective;
  assert.throws(() => reconcile(malformedState), /review_dimensions_incomplete_or_unknown/u);
});

for (const [label, mutate, expected] of [
  ["ambiguous aliases", (state) => { state.reviews = []; }, /ambiguous_review_collections/u],
  ["missing currentReviews", (state) => { delete state.currentReviews; }, /state_current_reviews_missing/u],
  ["wrong schema", (state) => { state.schemaVersion = "unknown"; }, /input_schema_invalid/u],
  ["wrong counts", (state) => { state.counts.pendingCount = 0; }, /state_counts_invalid/u],
  ["wrong chapter count", (state) => { state.nodeCounts[0].currentCount = 999; }, /state_node_counts_invalid/u],
  ["detached findings queue", (state) => { state.findings.push({ code: "UNBOUND" }); }, /state_findings_invalid/u],
  ["cursor skipping pending", (state) => { state.nextBatch = null; }, /state_cursor_invalid/u],
  ["bad binding", (state) => { state.currentReviews[0].sourceBinding = {}; }, /state_review_identity_invalid/u],
  ["bad manifest", (state) => { state.auditInputManifest.sha256 = "0".repeat(64); }, /state_manifest_invalid/u],
  ["unknown cursor track", (state) => { state.nextBatch.track = "unknown"; }, /state_cursor_invalid/u],
  ["unknown coverage scope", (state) => { state.unitCoverage[0].mentalUnitId = "unknown"; }, /state_coverage_scope_invalid/u],
  ["unread reviewed scope", (state) => { state.unitCoverage[0].readItemIds = ["q2"]; }, /state_coverage_read_without_review/u],
]) {
  test(`malformed stored state rejected safely: ${label}`, () => {
    const state = structuredClone(reconcile(v2Input([record()])));
    mutate(state);
    assert.throws(() => reconcile(state), expected);
  });
}

test("coverage persists partial read scope across20/12 batches and completes assessment with recorded gaps", () => {
  let state = reconcile(v2Input([record()]));
  const staged = reconcile(v2Input([record()], { unitCoverage: [{ ...state.unitCoverage[0], readItemIds: ["q1"], status: "PARTIAL" }] }));
  const partial = reconcile(JSON.parse(JSON.stringify(staged)), { batchSize: 12 });
  assert.equal(partial.unitCoverage[0].status, "PARTIAL");
  assert.deepEqual(partial.unitCoverage[0].assignedItemIds, ["q1", "q2"]);
  assert.deepEqual(partial.unitCoverage[0].readItemIds, ["q1"]);
  assert.deepEqual(partial.nextBatch.questionIds, ["q2"]);
  const assessment = { ...partial.unitCoverage[0], readItemIds: ["q1", "q2"], status: "COMPLETE",
    requiredDecisions: [{ decisionId: "fixture-decision", description: "Test-only decision", itemIds: ["q1", "q2"], evidence: "Synthetic coverage evidence", sourceEvidence: ["Synthetic source check"] }],
    gaps: [{ code: "TEST_ONLY", problem: "Synthetic gap", evidence: "Fixture only", remediation: "No production action", itemIds: ["q2"] }],
    evidence: "Test-only whole-unit assessment", reviewer: review().reviewer, assessedAt: "2026-10-22T12:00:00Z" };
  const complete = reconcile(v2Input(completeRecords(), { unitCoverage: [assessment] }));
  assert.equal(complete.status, "COMPLETE", "completed assessment may contain findings for repair");
  assert.equal(complete.findings.length, 1);
  assert.equal(complete.findings[0].origin, "unit-coverage");
  assert.deepEqual(reconcile(JSON.parse(JSON.stringify(complete))).unitCoverage, complete.unitCoverage);
  const unfinished = { ...assessment, readItemIds: ["q1"] };
  assert.throws(() => reconcile(v2Input(completeRecords(), { unitCoverage: [unfinished] })), /coverage_complete_without_evidence/u);
});

test("stale reviews reset dependent coverage without carrying old complete claims", () => {
  const state = reconcile(v2Input([record()]));
  const staged = reconcile(v2Input([record()], { unitCoverage: [{ ...state.unitCoverage[0], readItemIds: ["q1"], status: "PARTIAL" }] }));
  const changed = structuredClone(inventory);
  changed.tracks[0].nodes[0].mentalUnits[0].reviewContext.unitSha256 = "e".repeat(64);
  const result = reconcile(staged, { inventory: changed });
  assert.equal(result.counts.currentReviewCount, 0);
  assert.equal(result.unitCoverage[0].status, "NOT_ASSESSED");
  assert.deepEqual(result.unitCoverage[0].readItemIds, []);
});

test("default Claude cursor uses product node order, stable unit/item IDs and keeps other banks pending", () => {
  const claude = contract.defaultTrack;
  const fixture = structuredClone(inventory);
  const unit = fixture.tracks[0].nodes[0].mentalUnits[0];
  const claudeTrack = { trackId: claude, contentVersion: "current-v1", observed: { nodes: 2, mentalUnits: 2, questions: 4 },
    nodeOrder: ["z-first-in-product", "a-second-in-product"], nodes: [
      { nodeId: "a-second-in-product", mentalUnits: [{ ...structuredClone(unit), mentalUnitId: "Z-unit" }] },
      { nodeId: "z-first-in-product", mentalUnits: [{ ...structuredClone(unit), items: [...unit.items].reverse() }] },
    ] };
  fixture.tracks.unshift({ ...structuredClone(fixture.tracks[0]), trackId: "aws-certified-solutions-architect-associate" });
  fixture.tracks.push(claudeTrack);
  const questions = new Map(currentQuestions);
  for (const track of fixture.tracks) for (const node of track.nodes) for (const unit of node.mentalUnits) {
    for (const item of unit.items) questions.set(`${track.trackId}:${item.questionId}`, { questionId: item.questionId, interaction: { type: "free_response" }, answer: {} });
  }
  // Use distinct item IDs between Claude nodes; real inventory enforces global uniqueness.
  claudeTrack.nodes[0].mentalUnits[0].items = claudeTrack.nodes[0].mentalUnits[0].items.map((item) => ({ ...item, questionId: `${item.questionId}-second` }));
  for (const item of claudeTrack.nodes[0].mentalUnits[0].items) questions.set(`${claude}:${item.questionId}`, { questionId: item.questionId, interaction: { type: "free_response" }, answer: {} });
  const result = reconcileCurrentAudit({ ...common, inventory: fixture, currentQuestions: questions, selectedTrack: undefined });
  assert.equal(result.nextBatch.track, claude);
  assert.equal(result.nextBatch.nodeId, "z-first-in-product");
  assert.deepEqual(result.nextBatch.questionIds, ["q1", "q2"]);
  assert.equal(result.counts.pendingByTrack[trackId], 2);
  assert.equal(result.counts.pendingByTrack["aws-certified-solutions-architect-associate"], 2);
  assert.deepEqual(result.nodeCounts.filter(({ track }) => track === claude).map(({ minimum, deficit }) => ({ minimum, deficit })), [{ minimum: 120, deficit: 118 }, { minimum: 120, deficit: 118 }]);
  assert.equal(result.nodeCounts.find(({ track }) => track === trackId).minimum, null);
  assert.throws(() => reconcileCurrentAudit({ ...common, selectedTrack: "unknown" }), /selected_track_not_in_inventory/u);
});

for (const batchSize of [12, 20]) {
  test(`exact ${batchSize}-item subbatch residual does not cross unit boundary`, () => {
    const fixture = structuredClone(inventory);
    const unit = fixture.tracks[0].nodes[0].mentalUnits[0];
    unit.items = Array.from({ length: 25 }, (_, index) => ({ questionId: `q${String(index).padStart(2, "0")}`, itemSha256: sha256(String(index)) }));
    fixture.observed.questions = 25;
    fixture.tracks[0].observed.questions = 25;
    const questions = new Map(unit.items.map(({ questionId }) => [`${trackId}:${questionId}`, { questionId, interaction: { type: "free_response" }, answer: {} }]));
    const first = reconcile(undefined, { inventory: fixture, currentQuestions: questions, batchSize });
    assert.deepEqual(first.nextBatch.questionIds, unit.items.slice(0, batchSize).map(({ questionId }) => questionId));
    assert.deepEqual(first.nextBatch.residualItemIds, unit.items.slice(batchSize).map(({ questionId }) => questionId));
    assert.equal(first.nextBatch.startItemId, "q00");
    const reviews = unit.items.slice(0, batchSize).map(({ questionId, itemSha256 }) => record({ itemId: questionId, itemSha256, sourceBinding: binding(itemSha256), review: { ...review(), distractors: [] } }));
    const second = reconcile(v2Input(reviews), { inventory: fixture, currentQuestions: questions, batchSize });
    assert.deepEqual(second.nextBatch.questionIds, unit.items.slice(batchSize, batchSize * 2).map(({ questionId }) => questionId));
    assert.equal(second.nextBatch.remainingInUnit, Math.max(0, unit.items.length - batchSize * 2));
  });
}

test("an empty or partial context cannot manufacture a complete review binding", () => {
  const item = { track: trackId, itemId: "q1", itemSha256: "a".repeat(64), reviewContext: {} };
  const current = new Map([[`${trackId}:q1`, item]]);
  assert.equal(currentReviewBinding(item, review(), current), null);
  item.reviewContext = { ...context };
  delete item.reviewContext.scoringSha256;
  assert.equal(currentReviewBinding(item, review(), current), null);
});

test("declared external peer changes invalidate only reviews that depend on that peer", () => {
  const q1 = { track: trackId, itemId: "q1", itemSha256: "a".repeat(64), file: "unit-a.json", taxonomy: {}, reviewContext: context };
  const q2 = { ...q1, itemId: "q2", itemSha256: "b".repeat(64) };
  const entries = new Map([[`${trackId}:q1`, q1], [`${trackId}:q2`, q2]]);
  const withPeer = { ...review(), duplicatePeers: ["q2"] };
  const bound = currentReviewBinding(q1, withPeer, entries);
  const noPeer = currentReviewBinding(q1, review(), entries);
  entries.get(`${trackId}:q2`).itemSha256 = "c".repeat(64);
  assert.notDeepEqual(currentReviewBinding(q1, withPeer, entries), bound);
  assert.deepEqual(currentReviewBinding(q1, review(), entries), noPeer);
  assert.equal(currentReviewBinding(q1, { ...review(), duplicatePeers: ["missing"] }, entries), null);
});

test("actual filesystem mutation changes broad manifest and trips both source/write-stage guards", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "audit-mutation-test-"));
  try {
    for (const dir of ["content", "config", "schemas", "docs/track-briefs", "scripts/content", "scripts/content-audit"]) await mkdir(path.join(root, dir), { recursive: true });
    await writeFile(path.join(root, "scripts/build.mjs"), "// test-only source\n");
    await writeFile(path.join(root, "scripts/content-audit/reconcile.mjs"), "// test-only source\n");
    await writeFile(path.join(root, "config/relevant.json"), JSON.stringify({ source: "before" }));
    const before = await captureAuditInputs(root);
    await writeFile(path.join(root, "config/relevant.json"), JSON.stringify({ source: "after" }));
    const after = await captureAuditInputs(root);
    assert.throws(() => assertAuditInputsUnchanged(before, after), /source_changed_during_reconciliation/u);
    assert.throws(() => assertAuditInputsUnchanged(before, after, "source_changed_before_write"), /source_changed_before_write/u);
    await writeFile(path.join(root, "config/current-content-audit-state.json"), "{}\n");
    const lookalike = path.join(root, "config/.current-audit-write-test");
    await mkdir(lookalike);
    await writeFile(path.join(lookalike, "state.json"), "{}\n");
    const withLookalike = await captureAuditInputs(root);
    assert.throws(() => assertAuditInputsUnchanged(after, withLookalike), /source_changed_during_reconciliation/u);
    await rm(lookalike, { recursive: true });
    assertAuditInputsUnchanged(after, await captureAuditInputs(root));
    const report = { auditInputManifest: after.manifest, syntheticFixtureOnly: true };
    const canonicalPath = path.join(root, "config/current-content-audit-state.json");
    await writeCurrentAuditState(report, canonicalPath, { rootDirectory: root });
    assert.deepEqual(JSON.parse(await readFile(canonicalPath, "utf8")), report);
    assertAuditInputsUnchanged(after, await captureAuditInputs(root));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("real unit projection preserves reviews after unrelated metadata/source/routing changes and invalidates actual dependencies", async () => {
  const root = new URL("../", import.meta.url).pathname;
  const snapshot = await captureAuditInputs(root);
  const claude = contract.defaultTrack;
  const curriculumPath = `config/curricula/${claude}.json`;
  const registryPath = `config/certification-source-registries/${claude}.json`;
  const objectivesPath = `config/certification-objective-registries/${claude}.json`;
  const curriculum = snapshot.values.get(curriculumPath);
  const firstNode = curriculum.nodes[0].nodeId;
  const unitId = "CCARP-D01-O01";
  const sourcePath = `${claude}/${firstNode}/${unitId}.json`;
  const questions = snapshot.values.get(`content/${sourcePath}`);
  const sortedQuestions = [...questions].sort((left, right) => left.questionId < right.questionId ? -1 : 1);
  const scoringSha256 = "a".repeat(64);
  const project = (values = snapshot.values, rubric = contract, scoring = scoringSha256) => projectUnitReviewContext({
    trackId: claude, nodeId: firstNode, mentalUnitId: unitId, questions: sortedQuestions, values, scoringSha256: scoring, contract: rubric,
  });
  const baseline = project();
  assert.deepEqual(baseline.resolution.unresolvedRefs, []);
  assert.ok(baseline.resolution.resolvedRecordRefs.some((key) => key.endsWith("/ccarp-1.1")));
  const q = sortedQuestions[0];
  const syntheticReview = { ...review(), dimensions: Object.fromEntries(contract.dimensions.map((dimension) => [dimension,
    { status: "NOT_APPLICABLE", evidence: "SYNTHETIC dependency regression only; not semantic assessment." }])),
    distractors: q.interaction.options.filter(({ optionId }) => optionId !== q.answer.optionId).map(({ optionId }) => ({
      optionId, status: "NOT_APPLICABLE", misconception: "Synthetic", evidence: "Synthetic", explanationStatus: "NOT_APPLICABLE", explanationEvidence: "Synthetic",
    })),
  };
  const fixtureInventory = { observed: { tracks: 1, nodes: 1, mentalUnits: 1, questions: questions.length }, tracks: [{
    trackId: claude, contentVersion: "current-v1", observed: { nodes: 1, mentalUnits: 1, questions: questions.length }, nodes: [{
      nodeId: firstNode, mentalUnits: [{ mentalUnitId: unitId, sourcePath, reviewContext: baseline.reviewContext,
        items: sortedQuestions.map((question) => ({ questionId: question.questionId, itemSha256: sha256(question) })) }],
    }],
  }] };
  const questionMap = new Map(sortedQuestions.map((question) => [`${claude}:${question.questionId}`, question]));
  const row = record({ track: claude, file: `content/${sourcePath}`, batch: `${claude}/${firstNode}/${unitId}`,
    taxonomy: { nodeId: firstNode, mentalUnitId: unitId }, itemId: q.questionId, itemSha256: sha256(q), review: syntheticReview,
    sourceBinding: { schemaVersion: "patternly-current-audit-review-binding-v1", itemSha256: sha256(q), ...baseline.reviewContext, peerContextSha256: sha256([]) } });
  const retained = (projection, rubric = contract) => {
    const inventory = structuredClone(fixtureInventory);
    inventory.tracks[0].nodes[0].mentalUnits[0].reviewContext = projection.reviewContext;
    return reconcileCurrentAudit({ ...common, selectedTrack: claude, inventory, currentQuestions: questionMap, contract: rubric, auditInput: { reviews: [row] } }).counts.currentReviewCount;
  };
  assert.equal(retained(baseline), 1);
  const changedValues = (...paths) => {
    const values = new Map(snapshot.values);
    for (const file of paths) values.set(file, structuredClone(values.get(file)));
    return values;
  };
  const unrelated = changedValues(curriculumPath, registryPath, objectivesPath);
  unrelated.get(curriculumPath).blockPlans.find(({ blockId }) => blockId !== unitId).learningObjective += " unrelated test change";
  unrelated.get(objectivesPath).objectives.find(({ objectiveId }) => objectiveId !== "ccarp-1.1").providerLabel += " unrelated test change";
  const unusedSource = unrelated.get(registryPath).sources.find(({ sourceId }) => !baseline.resolution.resolvedRecordRefs.some((key) => key.endsWith(`/${sourceId}`)));
  assert.ok(unusedSource, "real first unit has at least one unrelated source record");
  unusedSource.title += " unrelated test change";
  const routingContract = structuredClone(contract);
  routingContract.defaultTrack = "unrelated-selected-track";
  routingContract.batchSizes.normal = 99;
  routingContract.chapterMinimum.minimumActiveQuestionsPerNode = 999;
  routingContract.currentStatePath = "test-only-storage-location";
  assert.deepEqual(project(unrelated, routingContract).reviewContext, baseline.reviewContext);
  assert.equal(retained(project(unrelated, routingContract), routingContract), 1);
  const relevantObjective = changedValues(objectivesPath);
  relevantObjective.get(objectivesPath).objectives.find(({ objectiveId }) => objectiveId === "ccarp-1.1").providerLabel += " relevant test change";
  assert.equal(retained(project(relevantObjective)), 0);
  const relevantUnit = changedValues(curriculumPath);
  relevantUnit.get(curriculumPath).blockPlans.find(({ blockId }) => blockId === unitId).learningObjective += " relevant test change";
  assert.equal(retained(project(relevantUnit)), 0);
  const sharedNode = changedValues(curriculumPath);
  sharedNode.get(curriculumPath).nodes.find(({ nodeId }) => nodeId === firstNode).learnerFacingOutcome += " shared policy change";
  assert.equal(retained(project(sharedNode)), 0);
  const relevantSource = changedValues(registryPath);
  relevantSource.get(registryPath).sources.find(({ sourceId }) => sourceId === q.sourceRefs[0]).title += " relevant test change";
  assert.equal(retained(project(relevantSource)), 0);
  assert.equal(retained(project(snapshot.values, contract, "b".repeat(64))), 0);
  const changedRubric = { ...contract, rubricVersion: "synthetic-next-review-criteria" };
  assert.equal(retained(project(snapshot.values, changedRubric), changedRubric), 0);
  const directUrl = changedValues(curriculumPath);
  directUrl.get(curriculumPath).targetPlans.find(({ blockId }) => blockId === unitId).sourceRefs.push("https://example.com/test-only-unregistered-source#section");
  const directProjection = project(directUrl);
  assert.deepEqual(directProjection.resolution.unresolvedRefs, []);
  assert.ok(directProjection.reviewContext, "canonical direct URL is declared input identity, not missing registry ID");
  assert.ok(directProjection.resolution.declaredUrlRefs.includes("https://example.com/test-only-unregistered-source#section"));
  assert.equal(retained(directProjection), 0, "adding a relevant declared source still invalidates the old binding");
  const unknownObjective = changedValues(curriculumPath);
  unknownObjective.get(curriculumPath).slots.find(({ blockId }) => blockId === unitId)
    .sourceRequirements.officialObjective.objectiveRefs = ["unknown-declared-objective"];
  const unknownObjectiveProjection = project(unknownObjective);
  assert.deepEqual(unknownObjectiveProjection.resolution.unresolvedRefs, ["unknown-declared-objective"]);
  assert.equal(unknownObjectiveProjection.reviewContext, null);
  assert.equal(retained(unknownObjectiveProjection), 0);
  // All recognized declared evidence-ID aliases share the same fail-safe,
  // including IDs found in nested arrays. Local slot identity is separate.
  for (const key of ["sourceRef", "sourceRefs", "sourceId", "sourceIds", "anchorRef", "anchorRefs", "anchorId", "anchorIds",
    "conceptAnchorId", "conceptAnchorIds", "officialObjectiveRef", "officialObjectiveRefs", "objectiveRef", "objectiveRefs",
    "parentDomainId", "domainId", "claimId", "claimIds", "captureId", "captureIds", "captureRef", "sourceCaptureRef", "sourceCaptureId"]) {
    const values = changedValues(curriculumPath);
    values.get(curriculumPath).slots.find(({ blockId }) => blockId === unitId).sourceRequirements.regressionNested = [{ [key]: ["unknown-declared-evidence-id"] }];
    const projection = project(values);
    assert.deepEqual(projection.resolution.unresolvedRefs, ["unknown-declared-evidence-id"], key);
    assert.equal(projection.reviewContext, null, key);
    assert.equal(retained(projection), 0, key);
  }
  const optionalSlot = changedValues(curriculumPath);
  optionalSlot.get(curriculumPath).slots.find(({ blockId }) => blockId === unitId).sourceRequirements.regressionNested = [{ slotId: "local-slot-without-registry-binding" }];
  assert.deepEqual(project(optionalSlot).resolution.unresolvedRefs, []);
  const unknown = changedValues(curriculumPath);
  unknown.get(curriculumPath).targetPlans.find(({ blockId }) => blockId === unitId).sourceRefs.push("unknown-declared-source-test-only");
  const unknownProjection = project(unknown);
  assert.deepEqual(unknownProjection.resolution.unresolvedRefs, ["unknown-declared-source-test-only"]);
  assert.equal(unknownProjection.reviewContext, null);
  assert.equal(retained(unknownProjection), 0);
});

test("real CLI write-read-reconcile preserves a matching synthetic review; actual inventory deterministic", { timeout: 120_000 }, async () => {
  const output = await mkdtemp(path.join(os.tmpdir(), "audit-cli-roundtrip-test-"));
  const script = new URL("../scripts/content-audit/reconcile.mjs", import.meta.url).pathname;
  const run = (args) => JSON.parse(execFileSync(process.execPath, [script, ...args], { encoding: "utf8", timeout: 60_000 }));
  try {
    const firstPath = path.join(output, "first.json");
    const emptyPath = path.join(output, "empty-input.json");
    await writeFile(emptyPath, JSON.stringify({ schemaVersion: contract.inputSchemaVersion, rubricVersion: contract.rubricVersion, reviews: [], unitCoverage: [] }));
    run(["--input", emptyPath, "--output", firstPath]);
    const first = JSON.parse(await readFile(firstPath, "utf8"));
    assert.deepEqual(first.observed, { tracks: 9, nodes: 117, mentalUnits: 958, questions: 16749 });
    assert.equal(first.counts.currentReviewCount, 0);
    assert.equal(first.counts.pendingCount, 16749);
    assert.equal(first.selection.trackId, contract.defaultTrack);
    assert.equal(first.nextBatch.nodeId, "solution_design_and_architecture");
    assert.equal(first.nextBatch.mentalUnitId, "CCARP-D01-O01");
    assert.equal(first.nextBatch.questionIds.length, 20);
    assert.equal(first.nextBatch.remainingInUnit, 3);
    assert.equal(first.unitCoverage.every(({ status, gaps, requiredDecisions }) => status === "NOT_ASSESSED" && gaps === null && requiredDecisions === null), true);
    assert.equal(first.findings.length, 0);
    assert.equal(first.nodeCounts.filter(({ track }) => track === contract.defaultTrack).length, 7);
    const claudeTrack = first.inventory.tracks.find(({ trackId }) => trackId === contract.defaultTrack);
    assert.deepEqual(claudeTrack.observed, { nodes: 7, mentalUnits: 53, questions: 972 });
    const claudeUnits = claudeTrack.nodes.flatMap(({ mentalUnits }) => mentalUnits);
    assert.equal(claudeUnits.every((unit) => unit.reviewContext !== null && unit.objectiveInputs.sourceResolution.unresolvedRefs.length === 0), true);
    assert.ok(new Set(claudeUnits.map((unit) => unit.reviewContext.contextSha256)).size > 1);
    assert.ok(new Set(claudeUnits.map((unit) => unit.reviewContext.sourceSha256)).size > 1);
    const samePath = path.join(output, "same.json");
    run(["--input", firstPath, "--output", samePath]);
    const second = JSON.parse(await readFile(samePath, "utf8"));
    assert.equal(canonicalJson(first.inventory), canonicalJson(second.inventory));
    assert.equal(first.auditInputManifest.sha256, second.auditInputManifest.sha256);
    const track = first.inventory.tracks.find(({ trackId }) => trackId === "object-oriented-design-interview");
    const node = track.nodes[0];
    const unit = node.mentalUnits[0];
    const item = unit.items[0];
    const source = JSON.parse(await readFile(new URL(`../content/${unit.sourcePath}`, import.meta.url), "utf8"));
    const question = source.find(({ questionId }) => questionId === item.questionId);
    const rightIds = question.interaction.type === "choice_single" ? [question.answer.optionId] : question.answer.optionIds ?? [];
    const synthetic = { ...review(), verdict: "FIX_MINOR", severity: "minor",
      dimensions: Object.fromEntries(contract.dimensions.map((dimension) => [dimension, { status: dimension === "prompt_quality" ? "FAIL" : "NOT_APPLICABLE", evidence: "SYNTHETIC CLI REGRESSION FIXTURE ONLY; not a semantic assessment." }])),
      findings: [{ code: "SYNTHETIC_TEST_ONLY", dimensions: ["prompt_quality"], problem: "Test-only fixture", evidence: "No real content judgment", remediation: "No production action" }],
      distractors: (question.interaction.options ?? []).filter(({ optionId }) => !rightIds.includes(optionId)).map(({ optionId }) => ({ optionId, status: "NOT_APPLICABLE", misconception: "Synthetic", evidence: "Synthetic", explanationStatus: "NOT_APPLICABLE", explanationEvidence: "Synthetic" })),
    };
    const row = { track: track.trackId, contentVersion: track.contentVersion, file: `content/${unit.sourcePath}`, batch: `${track.trackId}/${node.nodeId}/${unit.mentalUnitId}`,
      taxonomy: { nodeId: node.nodeId, mentalUnitId: unit.mentalUnitId }, itemId: item.questionId, itemSha256: item.itemSha256,
      sourceBinding: { schemaVersion: "patternly-current-audit-review-binding-v1", itemSha256: item.itemSha256, ...unit.reviewContext, peerContextSha256: sha256([]) }, review: synthetic };
    const fixturePath = path.join(output, "synthetic-input.json");
    const reviewedPath = path.join(output, "synthetic-current.json");
    await writeFile(fixturePath, JSON.stringify(v2Input([row])));
    run(["--input", fixturePath, "--output", reviewedPath]);
    const reviewed = JSON.parse(await readFile(reviewedPath, "utf8"));
    assert.equal(reviewed.counts.currentReviewCount, 1);
    run(["--input", reviewedPath, "--output", reviewedPath, "--intensive"]);
    const reread = JSON.parse(await readFile(reviewedPath, "utf8"));
    assert.deepEqual(reread.currentReviews, reviewed.currentReviews);
    assert.equal(reread.currentReviews[0].review.reviewedAt, synthetic.reviewedAt);
    assert.equal(reread.currentReviews[0].review.verdict, "FIX_MINOR");
    assert.equal(reread.nextBatch.questionIds.length, 12);
    assert.equal(reread.nextBatch.remainingInUnit, 11);
    assert.equal(reread.counts.pendingByTrack[track.trackId], track.observed.questions - 1);
  } finally { await rm(output, { recursive: true, force: true }); }
});
