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
