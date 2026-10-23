import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createInventory } from "../model-evaluation/inventory.mjs";
import { buildAll, canonicalJson, sha256, validateTrack } from "../build.mjs";
import { computeCurrentSourceFingerprint } from "../content/current-source-identity.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const keyFor = (track, itemId) => `${track}:${itemId}`;
const CERTIFICATION_TRACKS = new Set([
  "aws-certified-solutions-architect-associate",
  "claude-certified-architect-professional-certification",
  "google-cloud-associate-cloud-engineer",
  "microsoft-azure-administrator-associate-az-104",
  "microsoft-azure-ai-fundamentals-ai-901",
]);

function fail(category) { throw new Error(`current_audit_invalid:${category}`); }

const STATE_SCHEMA = "patternly-current-content-audit-state-v2";
const INPUT_SCHEMA = "patternly-current-content-audit-input-v2";
const BINDING_SCHEMA = "patternly-current-audit-review-binding-v1";
const CONTEXT_FIELDS = ["unitSha256", "contextSha256", "sourceSha256", "scoringSha256", "rubricSha256"];
const BINDING_FIELDS = ["itemSha256", ...CONTEXT_FIELDS, "peerContextSha256"];
const DEFAULT_TRACK = "claude-certified-architect-professional-certification";
const compare = (left, right) => left < right ? -1 : left > right ? 1 : 0;
const digest = (value) => sha256(canonicalJson(value));
const same = (left, right) => {
  if (left === undefined || right === undefined) return left === right;
  try { return canonicalJson(left) === canonicalJson(right); } catch { return false; }
};
const isDigest = (value) => typeof value === "string" && /^[a-f0-9]{64}$/u.test(value);
const usage = "Usage: node scripts/content-audit/reconcile.mjs [--input <current-audit.json>] --output <current-state.json> [--track <trackId>] [--intensive]";

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--intensive") options.batchSize = 12;
    else if (argument === "--input" && args[index + 1]) options.input = args[++index];
    else if (argument === "--output" && args[index + 1]) options.output = args[++index];
    else if (argument === "--track" && args[index + 1]) options.selectedTrack = args[++index];
    else throw new Error(usage);
  }
  if (!options.output) throw new Error(usage);
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
        reviewContext: unit.reviewContext,
      });
    }
  }
  return entries;
}

function matchesQuestionIdentity(record, item) {
  return record.batch === item.batch && record.file === item.file && record.itemSha256 === item.itemSha256
    && record.taxonomy?.nodeId === item.taxonomy.nodeId
    && record.taxonomy?.mentalUnitId === item.taxonomy.mentalUnitId;
}

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isNonemptyText = (value) => typeof value === "string" && value.trim().length > 0;

function isReviewTimestamp(value) {
  if (typeof value !== "string") return false;
  // Require an unambiguous timestamp; Date.parse alone normalizes impossible dates.
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-](\d{2}):(\d{2}))$/iu.exec(value);
  if (!match) return false;
  const [year, month, day, hour, minute, second, offsetHour, offsetMinute] = match.slice(1).map((part) => Number(part ?? 0));
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1]
    && hour <= 23 && minute <= 59 && second <= 59 && offsetHour <= 23 && offsetMinute <= 59
    && Number.isFinite(Date.parse(value));
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
  if (!isRecord(review.reviewer)) fail("review_reviewer_invalid");
  for (const field of ["model", "reasoningEffort", "method"]) {
    if (!isNonemptyText(review.reviewer[field])) fail(`review_reviewer_field_invalid:${field}`);
  }
  if (!isRecord(review.interactionReview)) fail("review_interaction_invalid");
  if (!isNonemptyText(review.interactionReview.evidence)) fail("review_interaction_evidence_invalid");
  if (!isReviewTimestamp(review.reviewedAt)) fail("review_reviewed_at_invalid");
  if (!Array.isArray(review.duplicatePeers) || !Array.isArray(review.factChecks)) fail("review_metadata_missing");

  const interaction = question?.interaction;
  const answerIds = new Set(interaction?.type === "choice_single"
    ? [question.answer.optionId]
    : interaction?.type === "choice_multiple" ? question.answer.optionIds : []);
  const activeWrongOptionIds = ["choice_single", "choice_multiple"].includes(interaction?.type)
    ? interaction.options.map(({ optionId }) => optionId).filter((id) => !answerIds.has(id)).sort()
    : [];
  if (!Array.isArray(review.distractors) || (question && canonicalJson(review.distractors.map(({ optionId }) => optionId).sort()) !== canonicalJson(activeWrongOptionIds))) fail("review_distractor_coverage_invalid");
  for (const distractor of review.distractors) {
    if (!contract.dimensionStatuses.includes(distractor.status) || !distractor.misconception || !distractor.evidence || !distractor.explanationStatus || !distractor.explanationEvidence) fail("review_distractor_evidence_missing");
  }
  if (family === "certification" && review.dimensions.technical_correctness.status === "PASS"
    && !review.factChecks.some((factCheck) => factCheck?.url && factCheck.checkedDate && factCheck.claim && factCheck.evidence)) fail("certification_fact_check_missing");
}

// The broad manifest detects races. Per-review bindings below deliberately exclude
// unrelated banks and include only declared external duplicate peers.
export async function captureAuditInputs(rootDirectory = ROOT, { excludedDirectories = [] } = {}) {
  const root = path.resolve(rootDirectory);
  const files = [];
  async function collect(relative) {
    for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
      const name = `${relative}/${entry.name}`;
      if (name === "config/current-content-audit-state.json") continue;
      // Only an invocation's own freshly created staging directory is excluded.
      if (entry.isDirectory() && excludedDirectories.includes(name)) continue;
      if (entry.isSymbolicLink()) fail(`input_symlink:${name}`);
      if (entry.isDirectory()) await collect(name);
      else if (entry.isFile()) files.push(name);
    }
  }
  for (const directory of ["content", "config", "schemas", "docs/track-briefs", "scripts/content"]) await collect(directory);
  files.push("scripts/build.mjs", "scripts/content-audit/reconcile.mjs");
  const entries = [];
  const values = new Map();
  for (const file of files.sort(compare)) {
    const bytes = await readFile(path.join(root, file));
    entries.push({ file, sha256: sha256(bytes) });
    if (file.endsWith(".json")) values.set(file, JSON.parse(bytes));
  }
  return { manifest: { schemaVersion: "patternly-current-audit-input-manifest-v1", sha256: digest(entries), files: entries }, values };
}

export function assertAuditInputsUnchanged(before, after, stage = "source_changed_during_reconciliation") {
  if (before.manifest.sha256 !== after.manifest.sha256) fail(stage);
}

const selectFields = (value, fields) => Object.fromEntries(fields.filter((field) => value?.[field] !== undefined).map((field) => [field, value[field]]));
const containsId = (value, id) => value === id || (Array.isArray(value) ? value.some((entry) => containsId(entry, id))
  : isRecord(value) && Object.values(value).some((entry) => containsId(entry, id)));
const REFERENCE_KEYS = /^(?:sourceRefs?|sourceIds?|anchorRefs?|anchorIds?|conceptAnchorIds?|officialObjectiveRefs?|objectiveRefs?|parentDomainId|domainId|claimIds?|captureIds?|captureRef|sourceCaptureRef|sourceCaptureId|slotId)$/u;
// slotId identifies local authored metadata; a source-registry slot binding is
// included when present, but canonical slots do not all require one.
const OPTIONAL_REFERENCE_KEYS = new Set(["slotId"]);

function referencesIn(value, result = []) {
  if (Array.isArray(value)) for (const entry of value) referencesIn(entry, result);
  else if (isRecord(value)) for (const [key, entry] of Object.entries(value)) {
    if (REFERENCE_KEYS.test(key)) {
      for (const id of Array.isArray(entry) ? entry : [entry]) if (typeof id === "string") result.push({ id, required: !OPTIONAL_REFERENCE_KEYS.has(key) });
    }
    referencesIn(entry, result);
  }
  return result;
}

/** Actual dependencies of a unit, never the full track's unrelated row sets. */
export function projectUnitReviewContext({ trackId, nodeId, mentalUnitId, questions, values, scoringSha256, contract }) {
  const curriculum = values.get(`config/curricula/${trackId}.json`);
  const node = curriculum?.nodes?.find((record) => record.nodeId === nodeId);
  const unitPlans = {};
  for (const field of ["blockPlans", "targetPlans", "slots"]) unitPlans[field] = (curriculum?.[field] ?? [])
    .filter((record) => record.nodeId === nodeId && containsId(record, mentalUnitId));
  const slotIds = new Set(unitPlans.slots.map(({ slotId }) => slotId));
  unitPlans.objectiveAndDomainOwnership = (curriculum?.objectiveAndDomainOwnership ?? []).filter(({ slotId }) => slotIds.has(slotId));
  // Some families nest authored blocks under the node. Only blocks naming this
  // current unit apply; a neighboring unit's row is not a dependency.
  unitPlans.nestedBlocks = (node?.learningBlocks ?? []).filter((record) => containsId(record, mentalUnitId));
  const taxonomy = values.get(`config/taxonomy/${trackId}.json`);
  const unitTaxonomy = (taxonomy?.mentalUnits ?? []).filter((record) => record.id === mentalUnitId || record.mentalUnitId === mentalUnitId);
  const family = values.get(`config/families/${curriculum?.familyId}.json`);
  const sharedContext = {
    node: selectFields(node, ["nodeId", "label", "stableLabel", "learnerFacingOutcome", "prerequisiteNodeIds", "includedDecisionScope", "explicitExclusions", "sourceAndMaintenancePolicy"]),
    track: selectFields(curriculum, ["trackId", "familyId", "entryPrerequisites", "contentOwnershipRules", "crossTrackOverlapRules"]),
    family: selectFields(family, ["familyId", "supportedInteractions", "choicePolicyId", "choiceResultSemantics", "scoringPolicy"]),
    runtimeBinding: values.get("config/track-runtime-bindings.json")?.tracks?.find((record) => record.trackId === trackId) ?? null,
  };
  const registryFiles = [
    `config/certification-source-registries/${trackId}.json`, `config/certification-objective-registries/${trackId}.json`,
    `config/curricula/${trackId}.json`, ...(curriculum?.familyId === "design_interview" ? ["config/design-interview-source-registry.json"] : []),
  ];
  const index = new Map();
  for (const file of registryFiles) {
    const registry = values.get(file);
    for (const collection of ["sources", "sourceRecords", "sourceBasis", "anchorRecords", "objectives", "domains", "claims", "sourceCaptures", "slotBindings"]) {
      for (const record of registry?.[collection] ?? []) {
        const idField = { sources: "sourceId", sourceRecords: "sourceId", sourceBasis: "sourceId", anchorRecords: "anchorId",
          objectives: "objectiveId", domains: "domainId", claims: "claimId", sourceCaptures: "captureId", slotBindings: "bindingId" }[collection];
        const id = record[idField];
        if (!id) continue;
        const row = { file, collection, id, record };
        for (const alias of [id, record.slotId, record.url, record.canonicalUrl].filter(Boolean)) {
          if (!index.has(alias)) index.set(alias, []);
          index.get(alias).push(row);
        }
      }
    }
  }
  const required = referencesIn({ questions, unitPlans, unitTaxonomy, sharedContext });
  const visited = new Set();
  const selected = new Map();
  const unresolved = new Set();
  const declaredUrls = new Set();
  for (let cursor = 0; cursor < required.length; cursor += 1) {
    const reference = required[cursor];
    if (visited.has(reference.id)) continue;
    visited.add(reference.id);
    let url;
    try {
      const parsed = new URL(reference.id);
      if (["https:", "http:"].includes(parsed.protocol) && !parsed.username && !parsed.password) url = parsed;
    } catch { /* Registry identifiers are resolved below, never guessed. */ }
    if (url) {
      declaredUrls.add(url.href);
      selected.set(`declared-url:${url.href}`, { record: { normalizedUrl: url.href, evidenceKind: "declared-source-identity-only" } });
    }
    const withoutFragment = url ? new URL(url.href) : null;
    if (withoutFragment) withoutFragment.hash = "";
    const rows = index.get(reference.id) ?? (url ? index.get(url.href) ?? index.get(withoutFragment.href) : undefined);
    if (!rows) { if (reference.required && !url) unresolved.add(reference.id); continue; }
    for (const row of rows) {
      const key = `${row.file}/${row.collection}/${row.id}`;
      if (selected.has(key)) continue;
      selected.set(key, row);
      required.push(...referencesIn(row.record));
    }
  }
  const sources = [...selected].sort(([left], [right]) => compare(left, right)).map(([key, row]) => ({ key,
    record: { ...row.record, ...(Array.isArray(row.record.authoritativeFor)
      ? { authoritativeFor: row.record.authoritativeFor.filter((id) => !index.has(id) || visited.has(id)) } : {}) } }));
  const resolution = { unresolvedRefs: [...unresolved].sort(compare), declaredUrlRefs: [...declaredUrls].sort(compare),
    resolvedRecordRefs: sources.filter(({ key }) => !key.startsWith("declared-url:")).map(({ key }) => key),
    boundary: "Declared URLs identify source dependencies; no remote fact check or factual approval is performed by reconciliation." };
  // Unknown declared evidence is explicit and cannot produce a reusable binding.
  const reviewContext = unresolved.size ? null : {
    unitSha256: digest(questions), contextSha256: digest({ projection: "unit-dependencies-v1", unitPlans, unitTaxonomy, sharedContext }),
    sourceSha256: digest(sources), scoringSha256,
    rubricSha256: digest(selectFields(contract, ["rubricVersion", "dimensions", "dimensionStatuses", "verdicts", "severities"])),
  };
  return { reviewContext, resolution };
}

function enrichInventory(inventory, snapshot, currentQuestions, contract) {
  const { values, manifest } = snapshot;
  const scoringFiles = manifest.files.filter(({ file }) => file === "scripts/build.mjs"
    || ["question-contract.mjs", "planning-policy.mjs", "case-recipe.mjs", "track-runtime-bindings.mjs"].some((name) => file === `scripts/content/${name}`)
    || file === "schemas/content/question.schema.json");
  const scoringSha256 = digest(scoringFiles);
  for (const track of inventory.tracks) {
    const curriculumPath = `config/curricula/${track.trackId}.json`;
    const curriculum = values.get(curriculumPath);
    const actualNodes = new Set(track.nodes.map(({ nodeId }) => nodeId));
    const declaredOrder = curriculum?.nodes?.map(({ nodeId }) => nodeId);
    // Claude's authored curriculum order is the product order, unlike taxonomy's
    // alphabetical nodeIds. Other tracks retain their actual inventory if absent.
    const currentDeclaredOrder = declaredOrder?.filter((id) => actualNodes.has(id));
    const completeOrder = currentDeclaredOrder?.length === actualNodes.size && new Set(currentDeclaredOrder).size === actualNodes.size;
    if (track.trackId === DEFAULT_TRACK && !completeOrder) fail(`node_order_incomplete:${track.trackId}`);
    track.nodeOrder = completeOrder ? currentDeclaredOrder : track.nodes.map(({ nodeId }) => nodeId);
    track.nodeOrderSource = completeOrder ? `${curriculumPath}#nodes` : "current-inventory";
    for (const node of track.nodes) for (const unit of node.mentalUnits) {
      const questions = unit.items.map(({ questionId }) => currentQuestions.get(keyFor(track.trackId, questionId)));
      const projection = projectUnitReviewContext({ trackId: track.trackId, nodeId: node.nodeId, mentalUnitId: unit.mentalUnitId,
        questions, values, scoringSha256, contract });
      unit.reviewContext = projection.reviewContext;
      unit.objectiveInputs = {
        // These are existing authored inputs, not a new coverage assessment.
        curriculumRef: curriculumPath,
        sourceResolution: projection.resolution,
        blockPlans: (curriculum?.blockPlans ?? []).filter(({ blockId, nodeId }) => blockId === unit.mentalUnitId && nodeId === node.nodeId),
        targetPlans: (curriculum?.targetPlans ?? []).filter(({ blockId, nodeId }) => blockId === unit.mentalUnitId && nodeId === node.nodeId),
        sourceRefs: [...new Set(questions.flatMap((question) => question.sourceRefs ?? []))].sort(compare),
        courseSections: [...new Set(questions.flatMap((question) => question.feedback?.course?.section ? [question.feedback.course.section] : []))].sort(compare),
      };
    }
  }
  return inventory;
}

/** A review records this binding from the current inventory, including its peers. */
export function currentReviewBinding(item, review, current) {
  if (!isRecord(item.reviewContext) || !CONTEXT_FIELDS.every((field) => isDigest(item.reviewContext[field]))) return null;
  const peers = [];
  for (const peer of review?.duplicatePeers ?? []) {
    const peerId = typeof peer === "string" ? peer : peer?.itemId ?? peer?.questionId;
    const peerTrack = typeof peer === "string" ? item.track : peer?.track ?? item.track;
    const entry = current.get(keyFor(peerTrack, peerId));
    if (!entry) return null;
    peers.push({ track: entry.track, itemId: entry.itemId, itemSha256: entry.itemSha256, file: entry.file, taxonomy: entry.taxonomy, reviewContext: entry.reviewContext });
  }
  peers.sort((left, right) => compare(keyFor(left.track, left.itemId), keyFor(right.track, right.itemId)));
  return { schemaVersion: BINDING_SCHEMA, itemSha256: item.itemSha256, ...item.reviewContext, peerContextSha256: digest(peers) };
}

function readInput(input, contract, { requireSchema = false } = {}) {
  if (input === undefined) return { reviews: [], coverage: [], legacy: false };
  if (!isRecord(input)) fail("input_schema_invalid");
  const schema = input.schemaVersion;
  const legacy = schema === "patternly-current-content-audit-input-v1" || schema === "patternly-current-content-audit-state-v1";
  const state = schema === STATE_SCHEMA;
  if (schema !== undefined && !legacy && !state && schema !== INPUT_SCHEMA) fail("input_schema_invalid");
  if (requireSchema && schema === undefined) fail("input_schema_invalid");
  if (Object.hasOwn(input, "reviews") && Object.hasOwn(input, "currentReviews")) fail("ambiguous_review_collections");
  if ((state || schema === "patternly-current-content-audit-state-v1") && !Object.hasOwn(input, "currentReviews")) fail("state_current_reviews_missing");
  const reviews = state || schema === "patternly-current-content-audit-state-v1" ? input.currentReviews : input.reviews;
  if (!Array.isArray(reviews)) fail("input_reviews_invalid");
  if ((schema !== undefined && !legacy && input.rubricVersion !== contract.rubricVersion)
    || (schema === "patternly-current-content-audit-input-v1" && input.rubricVersion !== contract.rubricVersion)) fail("input_rubric_invalid");
  const coverage = input.unitCoverage ?? [];
  if (!Array.isArray(coverage)) fail("input_coverage_invalid");
  if (!legacy) for (const record of reviews) {
    if (!isRecord(record) || !["track", "itemId", "file", "batch", "contentVersion"].every((field) => isNonemptyText(record[field]))
      || !isDigest(record.itemSha256) || !isNonemptyText(record.taxonomy?.nodeId) || !isNonemptyText(record.taxonomy?.mentalUnitId)) fail("input_identity_missing");
    validateCurrentReview(record.review, undefined, contract, CERTIFICATION_TRACKS.has(record.track) ? "certification" : "other");
  }
  if (state) validateStoredState(input, contract);
  return { reviews, coverage, legacy, selection: input.selection };
}

function nodeCountsFor(inventory, currentKeys, contract) {
  return inventory.tracks.flatMap((track) => track.nodes.map((node) => {
    const items = node.mentalUnits.flatMap((unit) => unit.items);
    const currentCount = items.length;
    const minimum = track.trackId === contract.chapterMinimum?.trackId ? contract.chapterMinimum.minimumActiveQuestionsPerNode : null;
    return { track: track.trackId, nodeId: node.nodeId, currentCount, minimum,
      deficit: minimum === null ? null : Math.max(0, minimum - currentCount),
      reviewedCount: items.filter(({ questionId }) => currentKeys.has(keyFor(track.trackId, questionId))).length,
      pendingCount: items.filter(({ questionId }) => !currentKeys.has(keyFor(track.trackId, questionId))).length };
  }));
}

function findingsFor(currentReviews, unitCoverage) {
  return [
    ...currentReviews.flatMap((record) => record.review.findings.map((finding) => ({ ...finding, track: record.track, nodeId: record.taxonomy.nodeId,
      mentalUnitId: record.taxonomy.mentalUnitId, itemIds: [record.itemId], origin: "item-review" }))),
    ...unitCoverage.flatMap((unit) => (unit.gaps ?? []).map((gap) => ({ ...gap, track: unit.track, nodeId: unit.nodeId, mentalUnitId: unit.mentalUnitId, origin: "unit-coverage" }))),
  ];
}

function validateStoredState(state, contract) {
  if (!isDigest(state.sourceInputFingerprint) || !isDigest(state.auditInputManifest?.sha256)
    || !Array.isArray(state.auditInputManifest.files) || !/^[a-f0-9]{40}$/u.test(state.sourceRepositoryCommit ?? "")
    || !["clean", "dirty"].includes(state.sourceTree)) fail("state_source_identity_invalid");
  if (!isRecord(state.selection) || !isNonemptyText(state.selection.trackId) || ![12, 20].includes(state.selection.batchSize)
    || !Array.isArray(state.selection.nodeOrder)) fail("state_selection_invalid");
  if (!isRecord(state.inventory) || !Array.isArray(state.inventory.tracks) || !Array.isArray(state.unitCoverage)
    || !isRecord(state.counts) || !Array.isArray(state.findings)) fail("state_structure_invalid");
  if (state.auditInputManifest.files.some((entry) => !isNonemptyText(entry?.file) || !isDigest(entry?.sha256))
    || digest(state.auditInputManifest.files) !== state.auditInputManifest.sha256) fail("state_manifest_invalid");
  const ids = new Set();
  const unitItems = new Map();
  let units = 0;
  let nodes = 0;
  for (const track of state.inventory.tracks) {
    if (!isNonemptyText(track.trackId) || !isNonemptyText(track.contentVersion) || !Array.isArray(track.nodes)) fail("state_inventory_invalid");
    nodes += track.nodes.length;
    for (const node of track.nodes) {
      if (!isNonemptyText(node.nodeId) || !Array.isArray(node.mentalUnits)) fail("state_inventory_invalid");
      for (const unit of node.mentalUnits) {
        units += 1;
        unitItems.set(`${track.trackId}/${node.nodeId}/${unit.mentalUnitId}`, unit.items?.map(({ questionId }) => questionId).sort(compare));
        if (!isNonemptyText(unit.mentalUnitId) || !Array.isArray(unit.items) || (unit.reviewContext !== null && (!isRecord(unit.reviewContext) || !CONTEXT_FIELDS.every((field) => isDigest(unit.reviewContext[field]))))) fail("state_inventory_invalid");
        for (const item of unit.items) {
          const key = keyFor(track.trackId, item.questionId);
          if (!isNonemptyText(item.questionId) || !isDigest(item.itemSha256) || ids.has(key)) fail("state_inventory_identity_invalid");
          ids.add(key);
        }
      }
    }
  }
  const observed = { tracks: state.inventory.tracks.length, nodes, mentalUnits: units, questions: ids.size };
  if (!same(observed, state.observed) || !same(observed, state.inventory.observed)) fail("state_inventory_counts_invalid");
  if (state.counts.currentReviewCount !== state.currentReviews.length || state.counts.pendingCount !== ids.size - state.currentReviews.length
    || state.unitCoverage.length !== units || !Array.isArray(state.nodeCounts) || state.nodeCounts.length !== nodes) fail("state_counts_invalid");
  if (!["IN_PROGRESS", "COMPLETE"].includes(state.status) || !["IN_PROGRESS", "COMPLETE"].includes(state.questionReviewStatus)
    || (state.questionReviewStatus === "COMPLETE") !== (state.counts.pendingCount === 0)
    || (state.status === "COMPLETE") !== (state.counts.pendingCount === 0 && state.unitCoverage.every(({ status }) => status === "COMPLETE"))) fail("state_status_invalid");
  for (const record of state.currentReviews) {
    if (!isRecord(record) || !ids.has(keyFor(record.track, record.itemId)) || !isRecord(record.sourceBinding) || record.sourceBinding.schemaVersion !== BINDING_SCHEMA
      || !BINDING_FIELDS.every((field) => isDigest(record.sourceBinding[field]))) fail("state_review_identity_invalid");
  }
  const reviewed = new Set();
  const pendingByTrack = Object.fromEntries(state.inventory.tracks.map(({ trackId }) => [trackId, 0]));
  const byVerdict = Object.fromEntries(contract.verdicts.map((verdict) => [verdict, 0]));
  for (const record of state.currentReviews) {
    const key = keyFor(record.track, record.itemId);
    if (reviewed.has(key)) fail("state_duplicate_review");
    reviewed.add(key);
    byVerdict[record.review.verdict] += 1;
  }
  for (const key of ids) if (!reviewed.has(key)) {
    const separator = key.indexOf(":");
    pendingByTrack[key.slice(0, separator)] += 1;
  }
  if (!same(state.nodeCounts, nodeCountsFor(state.inventory, reviewed, contract))) fail("state_node_counts_invalid");
  if (!same(state.findings, findingsFor(state.currentReviews, state.unitCoverage))) fail("state_findings_invalid");
  const coverageByStatus = Object.fromEntries(["NOT_ASSESSED", "PARTIAL", "COMPLETE"].map((status) => [status, state.unitCoverage.filter((row) => row.status === status).length]));
  if (!same(pendingByTrack, state.counts.pendingByTrack) || !same(byVerdict, state.counts.currentByVerdict)
    || !same(coverageByStatus, state.counts.coverageByStatus)) fail("state_counts_invalid");
  const coverageUnits = new Set();
  for (const row of state.unitCoverage) {
    const key = `${row.track}/${row.nodeId}/${row.mentalUnitId}`;
    if (coverageUnits.has(key) || !unitItems.has(key) || !same(row.assignedItemIds, unitItems.get(key))) fail("state_coverage_scope_invalid");
    if (!Array.isArray(row.readItemIds) || row.readItemIds.some((id) => !reviewed.has(keyFor(row.track, id)))) fail("state_coverage_read_without_review");
    coverageUnits.add(key);
  }
  const storedEntries = state.inventory.tracks.flatMap((track) => track.nodes.flatMap((node) => node.mentalUnits.flatMap((unit) => unit.items.map((item) => ({
    track: track.trackId, taxonomy: { nodeId: node.nodeId, mentalUnitId: unit.mentalUnitId }, itemId: item.questionId,
    batch: `${track.trackId}/${node.nodeId}/${unit.mentalUnitId}`, reviewContext: unit.reviewContext,
  })))));
  if (!same(reconcileCoverage(storedEntries, state.unitCoverage, reviewed), state.unitCoverage)) fail("state_coverage_binding_or_status_invalid");
  const selected = state.inventory.tracks.find(({ trackId }) => trackId === state.selection.trackId);
  if (!selected || !same([...state.selection.nodeOrder].sort(compare), selected.nodes.map(({ nodeId }) => nodeId).sort(compare))) fail("state_selection_invalid");
  const ordered = storedEntries.filter(({ track }) => track === state.selection.trackId).sort((left, right) =>
    state.selection.nodeOrder.indexOf(left.taxonomy.nodeId) - state.selection.nodeOrder.indexOf(right.taxonomy.nodeId)
    || compare(left.taxonomy.mentalUnitId, right.taxonomy.mentalUnitId) || compare(left.itemId, right.itemId));
  const first = ordered.find((item) => !reviewed.has(keyFor(item.track, item.itemId)));
  const unit = first ? ordered.filter(({ batch }) => batch === first.batch) : [];
  const pending = unit.filter((item) => !reviewed.has(keyFor(item.track, item.itemId)));
  const limit = state.selection.batchSize;
  const expectedCursor = first ? { track: first.track, nodeId: first.taxonomy.nodeId, mentalUnitId: first.taxonomy.mentalUnitId,
    questionIds: pending.slice(0, limit).map(({ itemId }) => itemId), startItemId: pending[0].itemId,
    endItemId: pending[Math.min(limit, pending.length) - 1].itemId, unitItemIds: unit.map(({ itemId }) => itemId),
    residualItemIds: pending.slice(limit).map(({ itemId }) => itemId), remainingInUnit: Math.max(0, pending.length - limit), reviewContext: first.reviewContext } : null;
  if (!same(state.nextBatch, expectedCursor)) fail("state_cursor_invalid");
}

function validFreshness(record, item, binding, asOf) {
  const proof = record.reuseEvidence;
  if (!isRecord(proof) || proof.fromContentVersion !== record.contentVersion || proof.toContentVersion !== item.contentVersion
    || proof.bindingSha256 !== digest(binding) || !isReviewTimestamp(proof.checkedAt)
    || Date.parse(proof.checkedAt) > Date.parse(asOf)
    || Date.parse(proof.checkedAt) < Date.parse(record.review.reviewedAt) || !isNonemptyText(proof.evidence)
    || !isRecord(proof.reviewer) || !["model", "reasoningEffort", "method"].every((field) => isNonemptyText(proof.reviewer[field]))
    || !Array.isArray(proof.factChecks)) return false;
  // No blanket TTL: freshness is a recorded assessment of each relevant fact.
  const facts = record.review.factChecks;
  if (proof.factChecks.length !== facts.length) return false;
  return facts.every((fact) => proof.factChecks.some((check) => check.url === fact.url && check.claim === fact.claim
    && isReviewTimestamp(check.checkedAt) && Date.parse(check.checkedAt) >= Date.parse(record.review.reviewedAt)
    && Date.parse(check.checkedAt) <= Date.parse(proof.checkedAt) && isNonemptyText(check.evidence)));
}

function reconcileCoverage(entries, inputCoverage, currentKeys) {
  const input = new Map();
  for (const row of inputCoverage) {
    if (!isRecord(row) || !isNonemptyText(row.track) || !isNonemptyText(row.nodeId) || !isNonemptyText(row.mentalUnitId)) fail("coverage_identity_invalid");
    const key = `${row.track}/${row.nodeId}/${row.mentalUnitId}`;
    if (input.has(key)) fail("coverage_duplicate_unit");
    input.set(key, row);
  }
  const groups = new Map();
  for (const entry of entries) {
    if (!groups.has(entry.batch)) groups.set(entry.batch, []);
    groups.get(entry.batch).push(entry);
  }
  return [...groups].map(([batch, items]) => {
    const item = items[0];
    const assignedItemIds = items.map(({ itemId }) => itemId).sort(compare);
    const previous = input.get(batch);
    const base = { track: item.track, nodeId: item.taxonomy.nodeId, mentalUnitId: item.taxonomy.mentalUnitId,
      sourceBinding: item.reviewContext ?? null, assignedItemIds, readItemIds: [], requiredDecisions: null,
      gaps: null, evidence: null, reviewer: null, assessedAt: null, status: "NOT_ASSESSED" };
    if (!previous) return base;
    if (!Array.isArray(previous.assignedItemIds) || !Array.isArray(previous.readItemIds)
      || new Set(previous.readItemIds).size !== previous.readItemIds.length
      || !["NOT_ASSESSED", "PARTIAL", "COMPLETE"].includes(previous.status)
      || (previous.requiredDecisions !== null && !Array.isArray(previous.requiredDecisions))
      || (previous.gaps !== null && !Array.isArray(previous.gaps))) fail("coverage_shape_invalid");
    if (!same(previous.sourceBinding, base.sourceBinding) || !same(previous.assignedItemIds, assignedItemIds)) return base;
    if (previous.readItemIds.some((id) => !assignedItemIds.includes(id))) fail("coverage_read_scope_invalid");
    for (const decision of previous.requiredDecisions ?? []) {
      if (!isRecord(decision) || !isNonemptyText(decision.decisionId) || !isNonemptyText(decision.description)
        || !Array.isArray(decision.itemIds) || decision.itemIds.length === 0 || decision.itemIds.some((id) => !assignedItemIds.includes(id))
        || !isNonemptyText(decision.evidence) || !Array.isArray(decision.sourceEvidence) || decision.sourceEvidence.length === 0
        || decision.sourceEvidence.some((value) => !isNonemptyText(value))) fail("coverage_decision_invalid");
    }
    for (const gap of previous.gaps ?? []) {
      if (!isRecord(gap) || !["code", "problem", "evidence", "remediation"].every((field) => isNonemptyText(gap[field]))
        || !Array.isArray(gap.itemIds) || gap.itemIds.some((id) => !assignedItemIds.includes(id))) fail("coverage_gap_invalid");
    }
    const readItemIds = previous.readItemIds.filter((id) => currentKeys.has(keyFor(item.track, id))).sort(compare);
    if (readItemIds.length !== previous.readItemIds.length) return base;
    const hasAssessment = isNonemptyText(previous.evidence) && isReviewTimestamp(previous.assessedAt) && isRecord(previous.reviewer)
      && ["model", "reasoningEffort", "method"].every((field) => isNonemptyText(previous.reviewer[field]));
    if (previous.status === "NOT_ASSESSED" && (readItemIds.length || previous.requiredDecisions !== null || previous.gaps !== null || previous.evidence !== null || previous.assessedAt !== null || previous.reviewer !== null)) fail("coverage_unassessed_contains_assessment");
    const complete = readItemIds.length === assignedItemIds.length && hasAssessment && previous.requiredDecisions?.length > 0 && previous.gaps !== null;
    if (previous.status === "COMPLETE" && !complete) fail("coverage_complete_without_evidence");
    return { ...base, readItemIds, requiredDecisions: previous.requiredDecisions, gaps: previous.gaps,
      evidence: previous.evidence, reviewer: previous.reviewer, assessedAt: previous.assessedAt,
      status: complete ? "COMPLETE" : readItemIds.length || hasAssessment ? "PARTIAL" : "NOT_ASSESSED" };
  });
}

/** Reconciliation validates evidence shape and identity; it never assesses meaning. */
export function reconcileCurrentAudit({ inventory, currentQuestions, auditInput, contract, sourceInputFingerprint,
  sourceRepositoryCommit, sourceTree, auditInputManifest, selectedTrack, batchSize, asOf = new Date().toISOString() } = {}) {
  const input = readInput(auditInput, contract);
  batchSize ??= input.selection?.batchSize ?? 20;
  selectedTrack ??= input.selection?.trackId ?? contract.defaultTrack ?? DEFAULT_TRACK;
  if (![12, 20].includes(batchSize)) fail("batch_size_invalid");
  const selected = inventory.tracks.find(({ trackId }) => trackId === selectedTrack);
  if (!selected) fail("selected_track_not_in_inventory");
  const entries = currentEntries(inventory, currentQuestions);
  const current = new Map();
  for (const entry of entries) {
    const key = keyFor(entry.track, entry.itemId);
    if (current.has(key)) fail(`duplicate_inventory_item:${key}`);
    current.set(key, entry);
  }
  const seen = new Set();
  const currentReviews = [];
  const currentKeys = new Set();
  const discardedReviewReasons = {};
  const discard = (reason) => { discardedReviewReasons[reason] = (discardedReviewReasons[reason] ?? 0) + 1; };
  for (const record of input.reviews) {
    if (!isRecord(record) || !isNonemptyText(record.track) || !isNonemptyText(record.itemId)) fail("input_identity_missing");
    const key = keyFor(record.track, record.itemId);
    if (seen.has(key)) fail(`duplicate_input_review:${key}`);
    seen.add(key);
    const item = current.get(key);
    if (!item || !matchesQuestionIdentity(record, item)) { discard("question_identity_changed_or_removed"); continue; }
    const family = CERTIFICATION_TRACKS.has(item.track) ? "certification" : "other";
    try { validateCurrentReview(record.review, item.question, contract, family); }
    catch (error) { if (!input.legacy) throw error; discard(error.message); continue; }
    const binding = currentReviewBinding(item, record.review, current);
    if (!binding || !same(record.sourceBinding, binding)) { discard("relevant_input_binding_missing_or_changed"); continue; }
    if (record.contentVersion !== item.contentVersion && !validFreshness(record, item, binding, asOf)) { discard("version_reuse_evidence_missing_or_invalid"); continue; }
    currentReviews.push({ track: item.track, contentVersion: item.contentVersion, originContentVersion: record.originContentVersion ?? record.contentVersion,
      file: item.file, batch: item.batch, taxonomy: item.taxonomy, itemId: item.itemId, itemSha256: item.itemSha256,
      sourceBinding: binding, review: record.review, ...(record.reuseEvidence ? { reuseEvidence: record.reuseEvidence } : {}) });
    currentKeys.add(key);
  }
  currentReviews.sort((left, right) => compare(`${left.batch}/${left.itemId}`, `${right.batch}/${right.itemId}`));
  const pendingByTrack = Object.fromEntries(inventory.tracks.map(({ trackId }) => [trackId, 0]));
  for (const item of entries) if (!currentKeys.has(keyFor(item.track, item.itemId))) pendingByTrack[item.track] += 1;
  const nodeOrder = selected.nodeOrder ?? selected.nodes.map(({ nodeId }) => nodeId);
  const selectedEntries = entries.filter(({ track }) => track === selectedTrack).sort((left, right) =>
    nodeOrder.indexOf(left.taxonomy.nodeId) - nodeOrder.indexOf(right.taxonomy.nodeId)
    || compare(left.taxonomy.mentalUnitId, right.taxonomy.mentalUnitId) || compare(left.itemId, right.itemId));
  const firstPending = selectedEntries.find((item) => !currentKeys.has(keyFor(item.track, item.itemId)));
  const unitItems = firstPending ? selectedEntries.filter((item) => item.batch === firstPending.batch) : [];
  const pendingItems = unitItems.filter((item) => !currentKeys.has(keyFor(item.track, item.itemId)));
  const unitCoverage = reconcileCoverage(entries, input.coverage, currentKeys);
  const nodeCounts = nodeCountsFor(inventory, currentKeys, contract);
  const findings = findingsFor(currentReviews, unitCoverage);
  const pendingCount = Object.values(pendingByTrack).reduce((sum, count) => sum + count, 0);
  return {
    schemaVersion: STATE_SCHEMA, rubricVersion: contract.rubricVersion,
    status: pendingCount || unitCoverage.some(({ status }) => status !== "COMPLETE") ? "IN_PROGRESS" : "COMPLETE",
    questionReviewStatus: pendingCount ? "IN_PROGRESS" : "COMPLETE",
    sourceInputFingerprint, sourceRepositoryCommit, sourceTree, auditInputManifest,
    boundary: "Current source-bound review register. Evidence shape and inventory do not grant semantic approval, bank admission, publication, deployment, or device acceptance.",
    selection: { trackId: selectedTrack, batchSize, nodeOrder, nodeOrderSource: selected.nodeOrderSource ?? "current-inventory",
      unitOrder: "mentalUnitId/codepoint", itemOrder: "itemId/codepoint" },
    observed: inventory.observed, inventory, nodeCounts,
    trackProgress: inventory.tracks.map((track) => {
      const coverage = unitCoverage.filter((unit) => unit.track === track.trackId);
      const pending = pendingByTrack[track.trackId];
      return { track: track.trackId, reviewedCount: track.observed.questions - pending, pendingCount: pending,
        questionReviewStatus: pending ? "IN_PROGRESS" : "COMPLETE",
        coverageByStatus: Object.fromEntries(["NOT_ASSESSED", "PARTIAL", "COMPLETE"].map((status) => [status, coverage.filter((unit) => unit.status === status).length])),
        status: pending || coverage.some(({ status }) => status !== "COMPLETE") ? "IN_PROGRESS" : "COMPLETE" };
    }),
    counts: { currentReviewCount: currentReviews.length, pendingCount,
      staleReviewCount: Object.values(discardedReviewReasons).reduce((sum, count) => sum + count, 0), discardedReviewReasons, pendingByTrack,
      coverageByStatus: Object.fromEntries(["NOT_ASSESSED", "PARTIAL", "COMPLETE"].map((status) => [status, unitCoverage.filter((unit) => unit.status === status).length])),
      currentByVerdict: Object.fromEntries(contract.verdicts.map((verdict) => [verdict, currentReviews.filter(({ review }) => review.verdict === verdict).length])) },
    currentReviews, unitCoverage, findings,
    nextBatch: firstPending ? { track: firstPending.track, nodeId: firstPending.taxonomy.nodeId, mentalUnitId: firstPending.taxonomy.mentalUnitId,
      questionIds: pendingItems.slice(0, batchSize).map(({ itemId }) => itemId),
      startItemId: pendingItems[0].itemId, endItemId: pendingItems[Math.min(batchSize, pendingItems.length) - 1].itemId,
      unitItemIds: unitItems.map(({ itemId }) => itemId), residualItemIds: pendingItems.slice(batchSize).map(({ itemId }) => itemId),
      remainingInUnit: Math.max(0, pendingItems.length - batchSize), reviewContext: firstPending.reviewContext ?? null } : null,
  };
}

export async function buildCurrentAuditState({ rootDirectory = ROOT, auditInput, batchSize, selectedTrack } = {}) {
  const root = path.resolve(rootDirectory);
  const before = await captureAuditInputs(root);
  const contract = before.values.get("config/current-content-audit-contract.json");
  readInput(auditInput, contract);
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
    enrichInventory(inventory, before, questionMap, contract);
    const after = await captureAuditInputs(root);
    assertAuditInputsUnchanged(before, after);
    const sourceRepositoryCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
    const sourceTree = execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim() ? "dirty" : "clean";
    return reconcileCurrentAudit({ inventory, currentQuestions: questionMap, auditInput, contract, sourceInputFingerprint,
      sourceRepositoryCommit, sourceTree, auditInputManifest: before.manifest, selectedTrack, batchSize });
  } finally { await rm(outputRoot, { recursive: true, force: true }); }
}

export async function writeCurrentAuditState(report, outputPath, { rootDirectory = ROOT } = {}) {
  const output = path.resolve(outputPath);
  const relativeOutput = path.relative(rootDirectory, output).split(path.sep).join("/");
  if (report.auditInputManifest.files.some(({ file }) => file === relativeOutput)) fail("output_overlaps_source_input");
  await mkdir(path.dirname(output), { recursive: true });
  const temporary = await mkdtemp(path.join(path.dirname(output), ".current-audit-write-"));
  try {
    const staged = path.join(temporary, "state.json");
    await writeFile(staged, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
    // Recheck immediately before replacing the one current file, including when
    // --input and --output name that same file.
    assertAuditInputsUnchanged({ manifest: report.auditInputManifest }, await captureAuditInputs(rootDirectory, { excludedDirectories: [path.relative(rootDirectory, temporary).split(path.sep).join("/")] }), "source_changed_before_write");
    await rename(staged, output);
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

export async function runCurrentAuditCli(args) {
  const options = parseArgs(args);
  let auditInput;
  const inputPath = options.input ? path.resolve(options.input) : path.join(ROOT, "config/current-content-audit-state.json");
  try { auditInput = JSON.parse(await readFile(inputPath, "utf8")); }
  catch (error) { if (options.input || error.code !== "ENOENT") throw error; }
  const contract = JSON.parse(await readFile(path.join(ROOT, "config/current-content-audit-contract.json"), "utf8"));
  if (auditInput !== undefined) readInput(auditInput, contract, { requireSchema: true });
  const report = await buildCurrentAuditState({ auditInput, batchSize: options.batchSize, selectedTrack: options.selectedTrack });
  await writeCurrentAuditState(report, options.output);
  process.stdout.write(`${JSON.stringify({ status: report.status, observed: report.observed, counts: report.counts,
    selectedTrack: report.selection.trackId, nextBatch: report.nextBatch?.questionIds.length ?? 0,
    sourceInputFingerprint: report.sourceInputFingerprint, auditInputFingerprint: report.auditInputManifest.sha256 })}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await runCurrentAuditCli(process.argv.slice(2)); }
  catch (error) { console.error(`Current content reconciliation failed: ${error.message}`); process.exitCode = 1; }
}
