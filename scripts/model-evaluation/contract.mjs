import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, sha256, validateTrack } from "../build.mjs";
import { captureAuditInputs, assertAuditInputsUnchanged, projectUnitReviewContext } from "../content-audit/reconcile.mjs";
import { assertValidQuestion, scoreQuestion } from "../content/question-contract.mjs";
import { validateSchema } from "../review/schema-validation.mjs";

const DIRECTORY = fileURLToPath(new URL("./", import.meta.url));
export const ROOT = path.resolve(DIRECTORY, "../..");
export const STATUSES = Object.freeze(["PASS", "FAIL", "INSUFFICIENT_EVIDENCE", "DISAGREEMENT", "ADJUDICATION_REQUIRED"]);
export const EMPTY_HASH = sha256([]);
const same = (a, b) => canonicalJson(a) === canonicalJson(b);
const sorted = (values) => [...new Set(values)].sort();
export function fail(category) { throw new Error(`model_evaluation:${category}`); }
export function integer(value, label) { if (!Number.isSafeInteger(value) || value < 0) fail(`invalid_${label}`); return value; }
function bounded(value) { if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) fail("invalid_score_or_confidence"); }
function digest(value) { if (typeof value !== "string" || !/^[a-f0-9]{64}$/u.test(value)) fail("invalid_digest"); }
function json(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (Array.isArray(value)) { value.forEach(json); return; }
  if (value && Object.getPrototypeOf(value) === Object.prototype) { Object.values(value).forEach(json); return; }
  fail("non_json_value");
}

export async function loadContract({ model = { provider: "offline", id: "fixture-judge", version: "1", parameters: { temperature: 0 } }, limits = { maxInputTokens: 100, maxOutputTokens: 100 }, pricing = { inputMicroUsdPerToken: 1, outputMicroUsdPerToken: 2, requestFeeMicroUsd: 1 } } = {}) {
  const files = ["contracts/rubric-v1.json", "contracts/prompt-v1.json", "contracts/result.schema.json", "contract.mjs", "runner.mjs", "../review/schema-validation.mjs", "../build.mjs", "../content-audit/reconcile.mjs", "../content/question-contract.mjs", "../content/current-source-identity.mjs", "../content/track-runtime-bindings.mjs", "../content/case-recipe.mjs", "../content/planning-policy.mjs"];
  const bytes = await Promise.all(files.map((file) => readFile(path.join(DIRECTORY, file))));
  const [rubric, prompt, schema] = bytes.slice(0, 3).map((value) => JSON.parse(value));
  await validateSchema(model, schema.$defs.model); json(model);
  const manifest = files.map((file, index) => ({ file, sha256: sha256(bytes[index]) }));
  return { rubric, prompt, schema, model, limits, pricing, manifest, sha256: sha256({ manifest, model, limits, pricing }) };
}

export function requiredDimensions(input, contract) {
  const { scope, interactionType } = input.subject;
  const base = contract.rubric.dimensions[scope];
  if (!base) fail("unknown_scope");
  const interaction = scope === "item" ? contract.rubric.interactions[interactionType] : [];
  if (!interaction) fail("unknown_interaction");
  return [...base, ...interaction].map(({ id }) => id);
}

export async function validateInput(input, contract) {
  json(input); await validateSchema(input, contract.schema.$defs.input);
  Object.values(input.fingerprints).forEach(digest);
  if (input.fingerprints.evidence !== sha256(input.payload)) fail("payload_fingerprint_mismatch");
  if (new Set(input.currentItemIds).size !== input.currentItemIds.length || new Set(input.requiredDecisions.map(({ id }) => id)).size !== input.requiredDecisions.length) fail("duplicate_input_identity");
  if ((input.subject.scope === "item") !== (input.subject.questionId.length > 0) || (input.subject.scope === "item") !== (input.subject.interactionType !== "none")) fail("subject_scope_mismatch");
  if (input.subject.scope === "item" && !input.currentItemIds.includes(input.subject.questionId)) fail("unassigned_subject");
  if (input.subject.scope === "item") {
    const question = input.payload.question; assertValidQuestion(question);
    if (["trackId", "nodeId", "mentalUnitId", "questionId"].some((field) => question[field] !== input.subject[field])
      || question.interaction.type !== input.subject.interactionType || sha256(question) !== input.fingerprints.item
      || scoreQuestion(question, question.answer).status !== "correct") fail("deterministic_question_control_failed");
  }
  requiredDimensions(input, contract);
}
export function cacheKey(input, contract) {
  const { auditRef, subject: { contentVersion, ...subject }, ...binding } = input;
  return sha256({ schemaVersion: "patternly-evaluation-cache-key-v1", input: { ...binding, subject }, contractSha256: contract.sha256 });
}

export async function validateResponse(response, contract) {
  json(response); await validateSchema(response, contract.schema.$defs.response);
  const judges = new Set();
  for (const assessment of response.assessments) {
    if (judges.has(assessment.judgeId)) fail("duplicate_judge"); judges.add(assessment.judgeId);
    bounded(assessment.confidence);
    const dimensions = new Set();
    for (const dimension of assessment.dimensions) {
      if (dimensions.has(dimension.id)) fail("duplicate_dimension"); dimensions.add(dimension.id);
      bounded(dimension.score); bounded(dimension.confidence);
    }
    for (const hardFail of assessment.hardFails) if (!contract.rubric.hardFailCodes.includes(hardFail.code)) fail("unknown_hard_fail");
    for (const action of assessment.recommendedActions) if (!contract.rubric.actionCodes.includes(action)) fail("unknown_action");
    for (const child of assessment.children) { bounded(child.score); digest(child.cacheKey); digest(child.rawArtifactSha256); }
  }
  integer(response.usage.inputTokens, "usage"); integer(response.usage.outputTokens, "usage"); integer(response.costMicroUsd, "cost");
}

function textLeaves(value, pointer = "") {
  if (typeof value === "string") return [{ value, pointer }];
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, entry]) => textLeaves(entry, `${pointer}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`));
}

// These pointers attest only where a quote/reference came from. They do not
// establish truth, source adequacy, current remote content or semantic quality.
function referenceIndexes(input, children) {
  const leaves = textLeaves(input.payload, "/payload");
  const sourcePointer = (pointer) => /^\/payload\/question\/sourceRefs\/\d+$/u.test(pointer)
    || /^\/payload\/sourceResolution\/(?:declaredUrlRefs|resolvedRecordRefs)\/\d+$/u.test(pointer)
    || /^\/payload\/resolvedSourceRecords\/\d+\/(?:ref|record\/(?:sourceId|url|canonicalUrl))$/u.test(pointer);
  const objectivePointer = (pointer) => /^\/payload\/unitMetadata\/\d+\/(?:id|mentalUnitId|objectiveId)$/u.test(pointer)
    || /^\/payload\/objectiveInputs\/(?:blockPlans|targetPlans)\/\d+\/(?:objectiveId|objectiveRefs\/\d+|officialObjectiveRefs\/\d+)$/u.test(pointer)
    || /^\/payload\/resolvedSourceRecords\/\d+\/record\/objectiveId$/u.test(pointer);
  const evidencePointer = (pointer) => /^\/payload\/(?:question\/(?:prompt|constraints|interaction|answer|feedback)|unitMetadata|objectiveInputs|resolvedSourceRecords\/\d+\/record|node\/learnerFacingOutcome)(?:\/|$)/u.test(pointer)
    && !/(?:\/(?:[^/]*(?:Id|Ids|Refs|Sha256)|id|ref|url|canonicalUrl|type|scoringMethod|sourceId|version)(?:\/|$))/u.test(pointer);
  const indexes = { evidence: leaves.filter(({ pointer }) => evidencePointer(pointer)), sources: leaves.filter(({ pointer }) => sourcePointer(pointer)), objectives: leaves.filter(({ pointer }) => objectivePointer(pointer)) };
  if (input.subject.scope !== "item") for (const child of children.filter((entry) => entry.input.subject.scope === "item")) {
    for (const binding of child.evidenceBindings ?? []) for (const field of Object.keys(indexes)) {
      indexes[field].push(...binding[field].map((entry) => ({ value: entry.value, pointer: `child:${child.cacheKey}:${child.rawArtifactSha256}#${entry.pointer}` })));
    }
  }
  return indexes;
}
function bindAssessment(assessment, input, children) {
  const indexes = referenceIndexes(input, children);
  const rows = [...assessment.dimensions.map((dimension) => ({ id: dimension.id, evidence: dimension.evidence, sources: dimension.sourceRefs, objectives: dimension.objectiveRefs })),
    ...assessment.hardFails.map((entry, index) => ({ id: `hardFail:${index}:${entry.code}`, evidence: entry.evidence, sources: entry.sourceRefs, objectives: [] }))];
  let complete = true;
  const bindings = rows.map((row) => {
    const binding = { judgeId: assessment.judgeId, dimensionId: row.id };
    for (const field of Object.keys(indexes)) binding[field] = row[field].flatMap((value) => {
      const match = indexes[field].find((entry) => entry.value === value);
      if (!match) { complete = false; return []; }
      return [match];
    });
    return binding;
  });
  return { complete, bindings };
}

function currentSet(input, childEvidence) {
  if (input.subject.scope !== "unit") return null;
  return childEvidence.find((entry) => entry.input.subject.scope === "set"
    && ["trackId", "nodeId", "mentalUnitId"].every((field) => entry.input.subject[field] === input.subject[field])
    && ["unit", "context", "sources", "scoring", "peers", "partition"].every((field) => entry.input.fingerprints[field] === input.fingerprints[field])
    && same(entry.input.currentItemIds, input.currentItemIds) && same(entry.input.requiredDecisions, input.requiredDecisions)
    && same(entry.input.payload.currentItemKeys, input.payload.currentItemKeys)) ?? null;
}

function assessmentBlockers(assessment, input, contract, childEvidence) {
  const required = requiredDimensions(input, contract);
  if (assessment.dimensions.some(({ id }) => !required.includes(id))) fail("non_applicable_dimension");
  const blockers = [];
  if (!bindAssessment(assessment, input, childEvidence).complete) blockers.push("INSUFFICIENT_EVIDENCE");
  const dims = new Map(assessment.dimensions.map((dimension) => [dimension.id, dimension]));
  if (!assessment.evidenceComplete || !input.sourceResolutionComplete || required.some((id) => !dims.has(id))) blockers.push("INSUFFICIENT_EVIDENCE");
  if (assessment.hardFails.length || assessment.dimensions.some(({ score }) => score < contract.rubric.thresholds.minimumScore)) blockers.push("FAIL");
  const { nearThresholdInclusive: [lower, upper], minimumConfidence } = contract.rubric.thresholds;
  if (assessment.confidence < minimumConfidence || assessment.dimensions.some(({ score, confidence }) => confidence < minimumConfidence || (score >= lower && score <= upper))) blockers.push("ADJUDICATION_REQUIRED");
  if (input.subject.scope !== "item") {
    const requiredDecisions = new Map(input.requiredDecisions.map((decision) => [decision.id, decision]));
    const covered = new Set(); const mapped = new Set();
    if (!requiredDecisions.size || assessment.coverage.gaps.length) blockers.push("INSUFFICIENT_EVIDENCE");
    for (const mapping of assessment.coverage.mappings) {
      if (!input.currentItemIds.includes(mapping.itemId) || mapped.has(mapping.itemId)) fail("unknown_or_duplicate_coverage_item");
      mapped.add(mapping.itemId);
      const child = childEvidence.find((entry) => entry.input.subject.questionId === mapping.itemId);
      // A quoted evidence span must be present in that item's auditable assessment,
      // not merely an opaque ID/hash/score or a fabricated coverage summary.
      const actualEvidence = child?.assessments.flatMap((entry) => entry.dimensions.flatMap((dimension) => dimension.evidence)) ?? [];
      const currentKey = input.payload.currentItemKeys?.find((entry) => entry.itemId === mapping.itemId)?.cacheKey;
      const actualSources = child?.assessments.flatMap((entry) => entry.dimensions.flatMap((dimension) => dimension.sourceRefs)) ?? [];
      const actualObjectives = child?.assessments.flatMap((entry) => entry.dimensions.flatMap((dimension) => dimension.objectiveRefs)) ?? [];
      if (!child || currentKey !== child.cacheKey || !mapping.evidence.every((span) => actualEvidence.includes(span))
        || !mapping.sourceRefs.every((ref) => actualSources.includes(ref)) || !mapping.objectiveRefs.every((ref) => actualObjectives.includes(ref))) blockers.push("INSUFFICIENT_EVIDENCE");
      for (const id of mapping.decisionIds) {
        const decision = requiredDecisions.get(id);
        if (!decision) fail("unknown_coverage_decision");
        if (!decision.objectiveRefs.some((ref) => mapping.objectiveRefs.includes(ref)) || !decision.sourceRefs.some((ref) => mapping.sourceRefs.includes(ref))) blockers.push("INSUFFICIENT_EVIDENCE");
        else covered.add(id);
      }
    }
    if (input.currentItemIds.some((id) => !mapped.has(id)) || [...requiredDecisions.keys()].some((id) => !covered.has(id))) blockers.push("INSUFFICIENT_EVIDENCE");
    const children = new Set();
    for (const child of assessment.children) {
      const actual = childEvidence.find((entry) => entry.input.subject.questionId === child.itemId);
      if (children.has(child.itemId) || !input.currentItemIds.includes(child.itemId)) fail("unknown_or_duplicate_child"); children.add(child.itemId);
      if (!actual || actual.cacheKey !== child.cacheKey || actual.status !== child.status || actual.score !== child.score || actual.rawArtifactSha256 !== child.rawArtifactSha256) blockers.push("INSUFFICIENT_EVIDENCE");
      if (child.status !== "PASS") blockers.push(child.status);
    }
    if (input.currentItemIds.some((id) => !children.has(id))) blockers.push("INSUFFICIENT_EVIDENCE");
  } else if (assessment.children.length || assessment.coverage.mappings.length || assessment.coverage.gaps.length) fail("item_has_set_evidence");
  if (input.subject.scope === "unit") {
    const set = currentSet(input, childEvidence);
    if (!set) blockers.push("INSUFFICIENT_EVIDENCE");
    else if (set.status !== "PASS") blockers.push(set.status);
  }
  return sorted(blockers);
}

export async function normalizeResponse({ response, input, contract, evaluationRunId, requestId, rawArtifactSha256, rawArtifactPath, completedAt, childEvidence = [] }) {
  await validateInput(input, contract); await validateResponse(response, contract);
  const required = requiredDimensions(input, contract);
  const blockers = response.assessments.flatMap((assessment) => assessmentBlockers(assessment, input, contract, childEvidence));
  const first = response.assessments[0];
  for (const other of response.assessments.slice(1)) {
    const disposition = (assessment) => assessmentBlockers(assessment, input, contract, childEvidence).filter((status) => status !== "ADJUDICATION_REQUIRED");
    if (!same(disposition(first), disposition(other)) || !same(first.hardFails.map(({ code }) => code).sort(), other.hardFails.map(({ code }) => code).sort())
      ) blockers.push("DISAGREEMENT");
  }
  const allDimensions = response.assessments.flatMap(({ dimensions }) => dimensions);
  if (required.some((id) => {
    const scores = allDimensions.filter((dimension) => dimension.id === id).map((dimension) => dimension.score);
    return scores.length > 1 && Math.max(...scores) - Math.min(...scores) > contract.rubric.thresholds.maximumJudgeDelta + Number.EPSILON * 4;
  })) blockers.push("DISAGREEMENT");
  const dimensions = required.filter((id) => allDimensions.some((d) => d.id === id)).map((id) => allDimensions.filter((d) => d.id === id).reduce((left, right) => left.score <= right.score ? left : right));
  const set = currentSet(input, childEvidence);
  const score = Math.min(set?.score ?? 1, ...dimensions.map((d) => d.score), ...response.assessments.flatMap((a) => a.children.map((child) => child.score)), 1);
  const uniqueBlockers = sorted(blockers);
  const status = contract.rubric.semantics.precedence.find((candidate) => uniqueBlockers.includes(candidate)) ?? "PASS";
  return { schemaVersion: "patternly-evaluation-result-v1", accountingBasis: "SIMULATED_OFFLINE", evaluationRunId, requestId, cacheKey: cacheKey(input, contract), input,
    contractSha256: contract.sha256, model: contract.model, promptVersion: contract.prompt.version, rubricVersion: contract.rubric.version,
    assessments: response.assessments, dimensions, score, status, blockers: uniqueBlockers,
    evidenceBindings: response.assessments.flatMap((assessment) => bindAssessment(assessment, input, childEvidence).bindings),
    setEvidence: { cacheKey: set?.cacheKey ?? EMPTY_HASH, rawArtifactSha256: set?.rawArtifactSha256 ?? EMPTY_HASH,
      status: set?.status ?? (input.subject.scope === "unit" ? "INSUFFICIENT_EVIDENCE" : "NOT_APPLICABLE"), score: set?.score ?? 1 },
    recommendedActions: sorted([...response.assessments.flatMap((a) => a.recommendedActions), ...(uniqueBlockers.includes("ADJUDICATION_REQUIRED") || uniqueBlockers.includes("DISAGREEMENT") ? ["ADJUDICATE"] : [])]),
    confidence: Math.min(set?.confidence ?? 1, ...response.assessments.flatMap((a) => [a.confidence, ...a.dimensions.map((d) => d.confidence)])),
    sources: sorted(allDimensions.flatMap((d) => d.sourceRefs)), rationale: response.assessments.map((a) => `${a.judgeId}: ${a.rationale}`).join("\n"),
    usage: response.usage, costMicroUsd: response.costMicroUsd, rawArtifactSha256, rawArtifactPath, completedAt };
}

export async function validateResult(result, { input, contract, rawBytes, childEvidence = [] }) {
  json(result); await validateSchema(result, contract.schema);
  for (const field of ["cacheKey", "contractSha256", "rawArtifactSha256"]) digest(result[field]);
  bounded(result.score); bounded(result.confidence);
  if (!same(result.input, input) || result.contractSha256 !== contract.sha256 || result.cacheKey !== cacheKey(input, contract) || sha256(rawBytes) !== result.rawArtifactSha256) fail("result_binding_mismatch");
  const expected = await normalizeResponse({ response: JSON.parse(rawBytes), input, contract, evaluationRunId: result.evaluationRunId,
    requestId: result.requestId, rawArtifactSha256: result.rawArtifactSha256, rawArtifactPath: result.rawArtifactPath, completedAt: result.completedAt, childEvidence });
  if (!same(result, expected)) fail("result_normalization_mismatch");
  return result;
}

// One validated track; existing inventory and FCA provide identities/references,
// never verdicts. Broad snapshots guard races only, not selective cache keys.
export async function prepareTrack({ rootDirectory = ROOT, trackId }) {
  const before = await captureAuditInputs(rootDirectory);
  const inventory = JSON.parse(await readFile(path.join(rootDirectory, "reports/model-evaluation/09-a-inventory.json")));
  const audit = JSON.parse(await readFile(path.join(rootDirectory, "config/current-content-audit-state.json")));
  const validated = await validateTrack({ rootDirectory, trackId });
  if (validated.questions.some((question) => scoreQuestion(question, question.answer).status !== "correct")) fail("deterministic_scoring_failed");
  const track = inventory.tracks.find((row) => row.trackId === trackId);
  const auditTrack = audit.inventory?.tracks.find((row) => row.trackId === trackId);
  if (inventory.schemaVersion !== "patternly-model-evaluation-inventory-v2" || audit.schemaVersion !== "patternly-current-content-audit-state-v2" || !track || !auditTrack || track.contentVersion !== validated.track.contentVersion) fail("stale_inventory");
  const scoringSha256 = sha256(before.manifest.files.filter(({ file }) => file === "scripts/build.mjs" || file.startsWith("scripts/content/") || file === "schemas/content/question.schema.json"));
  const units = [];
  for (const node of track.nodes) for (const unit of node.mentalUnits) {
    const questions = validated.questions.filter((q) => q.nodeId === node.nodeId && q.mentalUnitId === unit.mentalUnitId);
    const actual = questions.map((q) => ({ questionId: q.questionId, interactionType: q.interaction.type, itemSha256: sha256(q) })).sort((a, b) => a.questionId < b.questionId ? -1 : a.questionId > b.questionId ? 1 : 0);
    const auditUnit = auditTrack.nodes.find((row) => row.nodeId === node.nodeId)?.mentalUnits.find((row) => row.mentalUnitId === unit.mentalUnitId);
    if (!same(actual, unit.items) || !same(actual, auditUnit?.items) || sha256(await readFile(path.join(rootDirectory, "content", unit.sourcePath))) !== unit.sourceSha256) fail("stale_item_or_source_identity");
    const projected = projectUnitReviewContext({ trackId, nodeId: node.nodeId, mentalUnitId: unit.mentalUnitId, questions,
      values: before.values, scoringSha256, contract: before.values.get("config/current-content-audit-contract.json") });
    const pointer = audit.unitCoverage.findIndex((row) => row.track === trackId && row.nodeId === node.nodeId && row.mentalUnitId === unit.mentalUnitId);
    if (pointer < 0 || !same(audit.unitCoverage[pointer].assignedItemIds, actual.map((q) => q.questionId))) fail("missing_audit_reference");
    units.push({ nodeId: node.nodeId, mentalUnitId: unit.mentalUnitId, questions, projected, auditRef: { statePath: "config/current-content-audit-state.json", pointer: `/unitCoverage/${pointer}` } });
  }
  if (units.flatMap((u) => u.questions).length !== validated.questions.length) fail("incomplete_track_inventory");
  const after = await captureAuditInputs(rootDirectory); assertAuditInputsUnchanged(before, after);
  return { trackId, contentVersion: track.contentVersion, units, values: before.values, raceGuard: before.manifest.sha256, structuralValidation: { status: "PASS", validator: "validateTrack+scoreQuestion", scope: trackId, questions: validated.questions.length, boundary: "Schema/relations/self-scoring only, not semantic key correctness." } };
}

export function createTask({ prepared, nodeId, mentalUnitId, scope, questionId = "", requiredDecisions = [], evidence = {}, contract }) {
  const unit = prepared.units.find((row) => row.nodeId === nodeId && row.mentalUnitId === mentalUnitId);
  if (!unit) fail("unknown_unit");
  const question = unit.questions.find((q) => q.questionId === questionId);
  if (scope === "item" && !question) fail("unknown_question");
  const peerIds = sorted((scope === "item" ? [question] : unit.questions).flatMap((q) => [q.questionRelation?.counterpartQuestionId, ...(q.caseRecipe?.steps ?? []).map((step) => step.questionId)]).filter(Boolean));
  const allQuestions = prepared.units.flatMap((row) => row.questions);
  const peers = peerIds.map((id) => { const peer = allQuestions.find((q) => q.questionId === id); if (!peer) fail("unresolved_peer"); return { questionId: id, sha256: sha256(peer) }; });
  const curriculum = prepared.values.get(`config/curricula/${prepared.trackId}.json`);
  const node = curriculum?.nodes?.find((row) => row.nodeId === nodeId);
  const taxonomy = prepared.values.get(`config/taxonomy/${prepared.trackId}.json`);
  const unitMetadata = (taxonomy?.mentalUnits ?? []).filter((row) => row.id === mentalUnitId || row.mentalUnitId === mentalUnitId);
  const siblingPartition = prepared.units.filter((row) => row.nodeId === nodeId).map((row) => ({ mentalUnitId: row.mentalUnitId,
    items: row.questions.map((q) => ({ questionId: q.questionId, itemSha256: sha256(q) })).sort((a, b) => a.questionId < b.questionId ? -1 : 1), context: row.projected.reviewContext?.contextSha256 ?? EMPTY_HASH }));
  const context = unit.projected.reviewContext;
  const currentItemKeys = scope === "item" ? [] : unit.questions.map((q) => {
    if (!contract) fail("unit_requires_evaluation_contract");
    return { itemId: q.questionId, cacheKey: cacheKey(createTask({ prepared, nodeId, mentalUnitId, scope: "item", questionId: q.questionId, requiredDecisions }), contract) };
  });
  const resolvedSourceRecords = unit.projected.resolution.resolvedRecordRefs.map((ref) => {
    const match = /^(.*\.json)\/([^/]+)\/(.+)$/u.exec(ref);
    return { ref, record: match ? (prepared.values.get(match[1])?.[match[2]] ?? []).find((row) => Object.values(row).includes(match[3])) ?? null : null };
  });
  const payload = { ...(scope === "item" ? { question } : { itemEvidence: evidence, siblingPartition, currentItemKeys }), unitMetadata, resolvedSourceRecords,
    node: node ? { nodeId, learnerFacingOutcome: node.learnerFacingOutcome ?? null, prerequisiteNodeIds: node.prerequisiteNodeIds ?? [] } : null,
    objectiveInputs: { blockPlans: (curriculum?.blockPlans ?? []).filter((row) => row.nodeId === nodeId && JSON.stringify(row).includes(mentalUnitId)),
      targetPlans: (curriculum?.targetPlans ?? []).filter((row) => row.nodeId === nodeId && JSON.stringify(row).includes(mentalUnitId)) },
    sourceResolution: unit.projected.resolution, peers, requiredDecisions };
  return { subject: { scope, trackId: prepared.trackId, nodeId, mentalUnitId, questionId, interactionType: question?.interaction.type ?? "none", contentVersion: prepared.contentVersion },
    fingerprints: { item: question ? sha256(question) : EMPTY_HASH, unit: scope === "item" ? context?.contextSha256 ?? EMPTY_HASH : context?.unitSha256 ?? sha256(unit.questions), context: context?.contextSha256 ?? EMPTY_HASH,
      sources: context?.sourceSha256 ?? EMPTY_HASH, scoring: context?.scoringSha256 ?? EMPTY_HASH, peers: sha256(peers), partition: scope === "item" ? EMPTY_HASH : sha256(siblingPartition), evidence: sha256(payload) },
    auditRef: unit.auditRef, sourceResolutionComplete: Boolean(context), currentItemIds: scope === "item" ? [questionId] : unit.questions.map((q) => q.questionId).sort(), requiredDecisions, payload };
}

export function chapterMinimumReport(prepared, contract) {
  if (prepared.trackId !== contract.rubric.claudeMinimum.trackId) return [];
  const nodeIds = sorted(prepared.units.map((u) => u.nodeId));
  return nodeIds.map((nodeId) => { const count = prepared.units.filter((u) => u.nodeId === nodeId).reduce((n, u) => n + u.questions.length, 0);
    return { nodeId, count, minimum: 120, deficit: Math.max(0, 120 - count), recommendation: count < 120 ? "FCA_EDIT" : "NONE", qualityScore: null }; });
}
