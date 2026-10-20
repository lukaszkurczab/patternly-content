import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { reconcileCurrentAudit } from "../scripts/content-audit/reconcile.mjs";

const contract = JSON.parse(await readFile(new URL("../config/current-content-audit-contract.json", import.meta.url), "utf8"));
const trackId = "object-oriented-design-interview";
const inventory = {
  observed: { tracks: 1, nodes: 1, mentalUnits: 1, questions: 2 },
  tracks: [{
    trackId,
    contentVersion: "current-v1",
    observed: { nodes: 1, mentalUnits: 1, questions: 2 },
    nodes: [{ nodeId: "node-a", mentalUnits: [{
      mentalUnitId: "unit-a",
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
  ...overrides,
});
const common = { inventory, currentQuestions, contract, sourceInputFingerprint: "fingerprint", sourceRepositoryCommit: "a".repeat(40), sourceTree: "dirty" };

test("reconciles exact current review and queues only unreviewed current IDs", () => {
  const result = reconcileCurrentAudit({ ...common, auditInput: { reviews: [record()] } });
  assert.equal(result.status, "IN_PROGRESS");
  assert.equal(result.counts.currentReviewCount, 1);
  assert.equal(result.counts.pendingCount, 1);
  assert.equal(result.counts.staleReviewCount, 0);
  assert.deepEqual(result.nextBatch, { track: trackId, nodeId: "node-a", mentalUnitId: "unit-a", questionIds: ["q2"], remainingInUnit: 0 });
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
  largeInventory.tracks[0].nodes[0].mentalUnits[0].items = Array.from({ length: 25 }, (_, index) => ({ questionId: `q${String(index).padStart(2, "2")}`, itemSha256: String(index).padStart(64, "0") }));
  const questions = new Map(largeInventory.tracks[0].nodes[0].mentalUnits[0].items.map(({ questionId }) => [`${trackId}:${questionId}`, { questionId, interaction: { type: "free_response" }, answer: { type: "free_response" } }]));
  const result = reconcileCurrentAudit({ ...common, inventory: largeInventory, currentQuestions: questions, batchSize: 12, auditInput: { reviews: [] } });
  assert.equal(result.nextBatch.questionIds.length, 12);
  assert.equal(result.nextBatch.remainingInUnit, 13);
});

const completeRecords = () => [record(), record({
  itemId: "q2", itemSha256: "b".repeat(64), review: { ...review(), distractors: [] },
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
    assert.equal(result.status, "COMPLETE");
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
  const certRecord = record({ track: certTrack });
  assert.throws(() => reconcileCurrentAudit({ ...common, inventory: certInventory, currentQuestions: questions, auditInput: { reviews: [certRecord] } }), /certification_fact_check_missing/u);
  certRecord.review.factChecks = [{ url: "https://example.com/official", checkedDate: "2026-10-19", claim: "Synthetic claim", evidence: "Synthetic source evidence" }];
  assert.equal(reconcileCurrentAudit({ ...common, inventory: certInventory, currentQuestions: questions, auditInput: { reviews: [certRecord] } }).counts.currentReviewCount, 1);
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
