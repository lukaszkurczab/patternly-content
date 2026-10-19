import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createInventory } from "../model-evaluation/inventory.mjs";
import { buildAll, canonicalJson, validateTrack } from "../build.mjs";
import { computeCurrentSourceFingerprint } from "../content/current-source-identity.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const CONTRACT_PATH = path.join(ROOT, "config/current-content-audit-contract.json");
const keyFor = (track, itemId) => `${track}:${itemId}`;
const CERTIFICATION_TRACKS = new Set([
  "aws-certified-solutions-architect-associate",
  "claude-certified-architect-professional-certification",
  "google-cloud-associate-cloud-engineer",
  "microsoft-azure-administrator-associate-az-104",
  "microsoft-azure-ai-fundamentals-ai-901",
]);

function fail(category) { throw new Error(`current_audit_invalid:${category}`); }

function parseArgs(args) {
  const options = { batchSize: 20 };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--intensive") options.batchSize = 12;
    else if (argument === "--input" && args[index + 1]) options.input = args[++index];
    else if (argument === "--output" && args[index + 1]) options.output = args[++index];
    else throw new Error("Usage: node scripts/content-audit/reconcile.mjs [--input <current-audit.json>] --output <current-state.json> [--intensive]");
  }
  if (!options.output) throw new Error("Usage: node scripts/content-audit/reconcile.mjs [--input <current-audit.json>] --output <current-state.json> [--intensive]");
  return options;
}

function currentEntries(inventory, questions) {
  const entries = [];
  for (const track of inventory.tracks) for (const node of track.nodes) for (const unit of node.mentalUnits) {
    for (const item of unit.items) {
      const file = `content/${unit.sourcePath}`;
      const question = questions.get(keyFor(track.trackId, item.questionId));
      if (!question) fail(`inventory_question_missing:${track.trackId}:${item.questionId}`);
      entries.push({
        track: track.trackId,
        contentVersion: track.contentVersion,
        file,
        batch: `${track.trackId}/${node.nodeId}/${unit.mentalUnitId}`,
        taxonomy: { nodeId: node.nodeId, mentalUnitId: unit.mentalUnitId },
        itemId: item.questionId,
        itemSha256: item.itemSha256,
        question,
      });
    }
  }
  return entries;
}

function matchesCurrentIdentity(record, item) {
  return record.contentVersion === item.contentVersion
    && record.file === item.file
    && record.itemSha256 === item.itemSha256
    && record.taxonomy?.nodeId === item.taxonomy.nodeId
    && record.taxonomy?.mentalUnitId === item.taxonomy.mentalUnitId;
}

function validateCurrentReview(review, question, contract, family) {
  if (!review || typeof review !== "object" || Array.isArray(review)) fail("review_missing");
  if (!contract.verdicts.includes(review.verdict) || !contract.severities.includes(review.severity)) fail("review_verdict_or_severity_invalid");
  if (!review.dimensions || typeof review.dimensions !== "object" || Array.isArray(review.dimensions)) fail("review_dimensions_missing");
  const keys = Object.keys(review.dimensions).sort();
  if (canonicalJson(keys) !== canonicalJson([...contract.dimensions].sort())) fail("review_dimensions_incomplete_or_unknown");
  for (const dimension of contract.dimensions) {
    const result = review.dimensions[dimension];
    if (!result || !contract.dimensionStatuses.includes(result.status) || typeof result.evidence !== "string" || !result.evidence.trim()) {
      fail(`review_dimension_evidence_missing:${dimension}`);
    }
  }
  if (review.verdict === "PASS" && contract.dimensions.some((dimension) => !["PASS", "NOT_APPLICABLE"].includes(review.dimensions[dimension].status))) fail("pass_contains_nonpassing_dimension");
  if (!Array.isArray(review.findings) || (review.verdict !== "PASS" && review.findings.length === 0)) fail("review_findings_missing");
  for (const finding of review.findings) {
    if (!finding?.code || !Array.isArray(finding.dimensions) || finding.dimensions.length === 0 || !finding.problem || !finding.evidence || !finding.remediation) fail("review_finding_incomplete");
  }
  if (!review.interactionReview || !review.reviewer || !review.reviewedAt || !Array.isArray(review.duplicatePeers) || !Array.isArray(review.factChecks)) fail("review_metadata_missing");

  const interaction = question.interaction;
  const answerIds = new Set(interaction.type === "choice_single"
    ? [question.answer.optionId]
    : interaction.type === "choice_multiple" ? question.answer.optionIds : []);
  const activeWrongOptionIds = ["choice_single", "choice_multiple"].includes(interaction.type)
    ? interaction.options.map(({ optionId }) => optionId).filter((id) => !answerIds.has(id)).sort()
    : [];
  if (!Array.isArray(review.distractors) || canonicalJson(review.distractors.map(({ optionId }) => optionId).sort()) !== canonicalJson(activeWrongOptionIds)) fail("review_distractor_coverage_invalid");
  for (const distractor of review.distractors) {
    if (!contract.dimensionStatuses.includes(distractor.status) || !distractor.misconception || !distractor.evidence || !distractor.explanationStatus || !distractor.explanationEvidence) fail("review_distractor_evidence_missing");
  }
  if (family === "certification" && review.dimensions.technical_correctness.status === "PASS"
    && !review.factChecks.some((factCheck) => factCheck?.url && factCheck.checkedDate && factCheck.claim && factCheck.evidence)) fail("certification_fact_check_missing");
}

/** Reuse only exact current-source audit rows; all absent or stale items remain pending. */
export function reconcileCurrentAudit({ inventory, currentQuestions, auditInput, contract, sourceInputFingerprint, sourceRepositoryCommit, sourceTree, batchSize = 20 }) {
  if (![12, 20].includes(batchSize)) fail("batch_size_invalid");
  const entries = currentEntries(inventory, currentQuestions);
  const current = new Map(entries.map((entry) => [keyFor(entry.track, entry.itemId), entry]));
  const inputReviews = auditInput?.reviews ?? [];
  if (!Array.isArray(inputReviews)) fail("input_reviews_invalid");
  const seen = new Set();
  for (const record of inputReviews) {
    if (!record || typeof record.track !== "string" || typeof record.itemId !== "string") fail("input_identity_missing");
    const key = keyFor(record.track, record.itemId);
    if (seen.has(key)) fail(`duplicate_input_review:${key}`);
    seen.add(key);
  }

  const currentReviews = [];
  const currentKeys = new Set();
  let staleReviewCount = 0;
  for (const record of inputReviews) {
    const key = keyFor(record.track, record.itemId);
    const item = current.get(key);
    if (!item || !matchesCurrentIdentity(record, item)) {
      staleReviewCount += 1;
      continue;
    }
    const family = CERTIFICATION_TRACKS.has(item.track) ? "certification" : "other";
    validateCurrentReview(record.review, item.question, contract, family);
    currentReviews.push({
      track: item.track,
      contentVersion: item.contentVersion,
      file: item.file,
      batch: item.batch,
      taxonomy: item.taxonomy,
      itemId: item.itemId,
      itemSha256: item.itemSha256,
      review: record.review,
    });
    currentKeys.add(key);
  }

  const pendingByTrack = Object.create(null);
  for (const item of entries) if (!currentKeys.has(keyFor(item.track, item.itemId))) pendingByTrack[item.track] = (pendingByTrack[item.track] ?? 0) + 1;
  const firstPending = entries.find((item) => !currentKeys.has(keyFor(item.track, item.itemId)));
  const nextBatch = firstPending ? entries.filter((item) => item.batch === firstPending.batch && !currentKeys.has(keyFor(item.track, item.itemId))) : [];
  const dimensionReviewLimit = batchSize;
  return {
    schemaVersion: "patternly-current-content-audit-state-v1",
    status: Object.values(pendingByTrack).some(Boolean) ? "IN_PROGRESS" : "COMPLETE",
    sourceInputFingerprint,
    sourceRepositoryCommit,
    sourceTree,
    boundary: "Current source-bound semantic review only. This state does not grant bank admission, human editorial approval, publication, deployment, or device acceptance.",
    observed: inventory.observed,
    counts: {
      currentReviewCount: currentReviews.length,
      pendingCount: Object.values(pendingByTrack).reduce((sum, count) => sum + count, 0),
      staleReviewCount,
      pendingByTrack,
      currentByVerdict: Object.fromEntries(contract.verdicts.map((verdict) => [verdict, currentReviews.filter(({ review }) => review.verdict === verdict).length])),
    },
    currentReviews: currentReviews.sort((left, right) => `${left.track}/${left.taxonomy.nodeId}/${left.taxonomy.mentalUnitId}/${left.itemId}`.localeCompare(`${right.track}/${right.taxonomy.nodeId}/${right.taxonomy.mentalUnitId}/${right.itemId}`)),
    nextBatch: firstPending ? {
      track: firstPending.track,
      nodeId: firstPending.taxonomy.nodeId,
      mentalUnitId: firstPending.taxonomy.mentalUnitId,
      questionIds: nextBatch.slice(0, dimensionReviewLimit).map(({ itemId }) => itemId),
      remainingInUnit: Math.max(0, nextBatch.length - dimensionReviewLimit),
    } : null,
  };
}

export async function buildCurrentAuditState({ rootDirectory = ROOT, auditInput, batchSize = 20 } = {}) {
  const root = path.resolve(rootDirectory);
  const contract = JSON.parse(await readFile(path.join(root, "config/current-content-audit-contract.json"), "utf8"));
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-current-audit-build-"));
  try {
    const built = await buildAll({ rootDirectory: root, outputRoot });
    const sourceInputFingerprint = computeCurrentSourceFingerprint({ built });
    const inventory = await createInventory({ rootDirectory: root });
    const questionMap = new Map();
    for (const track of inventory.tracks) {
      const validated = await validateTrack({ rootDirectory: root, trackId: track.trackId });
      for (const question of validated.questions) questionMap.set(keyFor(track.trackId, question.questionId), question);
    }
    const sourceCheckRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-current-audit-recheck-"));
    let freshFingerprint;
    try {
      freshFingerprint = computeCurrentSourceFingerprint({ built: await buildAll({ rootDirectory: root, outputRoot: sourceCheckRoot }) });
    } finally {
      await rm(sourceCheckRoot, { recursive: true, force: true });
    }
    if (freshFingerprint !== sourceInputFingerprint) fail("source_changed_during_reconciliation");
    const sourceRepositoryCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
    const sourceTree = execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim() ? "dirty" : "clean";
    return reconcileCurrentAudit({ inventory, currentQuestions: questionMap, auditInput, contract, sourceInputFingerprint, sourceRepositoryCommit, sourceTree, batchSize });
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const auditInput = options.input ? JSON.parse(await readFile(path.resolve(options.input), "utf8")) : {
      schemaVersion: "patternly-current-content-audit-input-v1",
      rubricVersion: "user-exhaustive-content-audit-2026-10-02-v1",
      reviews: [],
    };
    if (auditInput.schemaVersion !== "patternly-current-content-audit-input-v1" || !Array.isArray(auditInput.reviews)
      || auditInput.rubricVersion !== "user-exhaustive-content-audit-2026-10-02-v1") fail("input_schema_invalid");
    const report = await buildCurrentAuditState({ auditInput, batchSize: options.batchSize });
    const output = path.resolve(options.output);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, { flag: "w" });
    process.stdout.write(`${JSON.stringify({ status: report.status, observed: report.observed, counts: report.counts, nextBatch: report.nextBatch?.questionIds.length ?? 0, sourceInputFingerprint: report.sourceInputFingerprint })}\n`);
  } catch (error) {
    console.error(`Current content reconciliation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
