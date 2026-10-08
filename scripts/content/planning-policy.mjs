const SCHEMA_VERSION = "patternly-learning-planning-policy-v1";
const UNAVAILABLE_REASONS = new Set(["missing_authored_estimate", "unsupported_app_mode", "unknown_runtime_scope"]);

export class PlanningPolicyError extends Error {
  constructor(message) {
    super(message);
    this.name = "PlanningPolicyError";
  }
}

/** Validate authored planning costs against the canonical questions that ship in the same artifact. */
export function validatePlanningPolicy(policy, questions) {
  exactKeys(policy, ["schemaVersion", "policyVersion", "workEstimates", "unavailableScopes"], "planningPolicy");
  if (policy.schemaVersion !== SCHEMA_VERSION || !nonEmpty(policy.policyVersion)) fail("planningPolicy version is invalid.");
  if (!Array.isArray(policy.workEstimates) || !Array.isArray(policy.unavailableScopes) || !Array.isArray(questions)) fail("planningPolicy arrays or canonical questions are invalid.");

  const sourceScopes = new Set();
  for (const question of questions) {
    if (!isRecord(question) || !nonEmpty(question.nodeId) || !nonEmpty(question.mentalUnitId)) fail("Canonical question has invalid planning scope identity.");
    sourceScopes.add(scopeKey(question.nodeId, question.mentalUnitId));
  }

  const coveredModes = new Set();
  const estimateIds = new Set();
  for (const [index, estimate] of policy.workEstimates.entries()) {
    const label = `planningPolicy.workEstimates[${index}]`;
    exactKeys(estimate, ["estimateId", "modeId", "scopeRefs", "minMinutesPerResponse", "typicalMinutesPerResponse", "maxMinutesPerResponse", "provenance", "observationCount", "rationale", "reviewReserve"], label);
    if (!nonEmpty(estimate.estimateId) || estimateIds.has(estimate.estimateId)) fail(`${label}.estimateId must be non-empty and unique.`);
    estimateIds.add(estimate.estimateId);
    if (!nonEmpty(estimate.modeId) || !Array.isArray(estimate.scopeRefs) || estimate.scopeRefs.length === 0) fail(`${label} mode or scopeRefs are invalid.`);
    const times = [estimate.minMinutesPerResponse, estimate.typicalMinutesPerResponse, estimate.maxMinutesPerResponse];
    if (!times.every(positiveInteger) || times[0] > times[1] || times[1] > times[2]) fail(`${label} time bounds are invalid.`);
    if (estimate.provenance !== "authored" || estimate.observationCount !== 0 || !nonEmpty(estimate.rationale)) fail(`${label} must be an authored, unobserved estimate with rationale.`);
    validateReviewReserve(estimate.reviewReserve, `${label}.reviewReserve`);

    const seenRefs = new Set();
    for (const [refIndex, ref] of estimate.scopeRefs.entries()) {
      validateScopeRef(ref, `${label}.scopeRefs[${refIndex}]`);
      const scope = scopeKey(ref.nodeId, ref.mentalUnitId);
      const key = `${scope}\u0000${estimate.modeId}`;
      if (!sourceScopes.has(scope)) fail(`${label} contains a scope absent from canonical questions.`);
      if (seenRefs.has(scope) || coveredModes.has(key)) fail(`${label} has a duplicate or overlapping scope/mode estimate.`);
      seenRefs.add(scope);
      coveredModes.add(key);
    }
  }

  for (const [index, entry] of policy.unavailableScopes.entries()) {
    const label = `planningPolicy.unavailableScopes[${index}]`;
    exactKeys(entry, ["scopeRef", "modeIds", "reason"], label);
    validateScopeRef(entry.scopeRef, `${label}.scopeRef`);
    if (!sourceScopes.has(scopeKey(entry.scopeRef.nodeId, entry.scopeRef.mentalUnitId))) fail(`${label} contains a scope absent from canonical questions.`);
    if (!Array.isArray(entry.modeIds) || entry.modeIds.length === 0 || entry.modeIds.some((modeId) => !nonEmpty(modeId)) || new Set(entry.modeIds).size !== entry.modeIds.length || !UNAVAILABLE_REASONS.has(entry.reason)) fail(`${label} modeIds or reason are invalid.`);
    for (const modeId of entry.modeIds) {
      const key = `${scopeKey(entry.scopeRef.nodeId, entry.scopeRef.mentalUnitId)}\u0000${modeId}`;
      if (coveredModes.has(key)) fail(`${label} overlaps an estimate or another unavailable scope.`);
      coveredModes.add(key);
    }
  }

  const representedScopes = new Set([...coveredModes].map((key) => key.slice(0, key.indexOf("\u0000"))));
  for (const scope of sourceScopes) if (!representedScopes.has(scope)) fail(`planningPolicy omits canonical question scope ${scope}.`);
  return structuredClone(policy);
}

function validateReviewReserve(value, label) {
  if (!isRecord(value)) fail(`${label} must be an object.`);
  if (value.kind === "unavailable") {
    exactKeys(value, ["kind", "reason"], label);
    if (!nonEmpty(value.reason)) fail(`${label} unavailable reason is required.`);
    return;
  }
  exactKeys(value, ["kind", "minAdditionalResponsesPerNewResponse", "typicalAdditionalResponsesPerNewResponse", "maxAdditionalResponsesPerNewResponse", "provenance", "observationCount", "rationale"], label);
  const bounds = [value.minAdditionalResponsesPerNewResponse, value.typicalAdditionalResponsesPerNewResponse, value.maxAdditionalResponsesPerNewResponse];
  if (value.kind !== "authored_estimate" || !bounds.every(finiteNonNegative) || bounds[0] > bounds[1] || bounds[1] > bounds[2] || value.provenance !== "authored" || value.observationCount !== 0 || !nonEmpty(value.rationale)) fail(`${label} is invalid.`);
}

function validateScopeRef(ref, label) {
  exactKeys(ref, ["nodeId", "mentalUnitId"], label);
  if (!nonEmpty(ref.nodeId) || !nonEmpty(ref.mentalUnitId)) fail(`${label} identity is invalid.`);
}

function scopeKey(nodeId, mentalUnitId) { return JSON.stringify([nodeId, mentalUnitId]); }
function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function exactKeys(value, expected, label) {
  if (!isRecord(value) || Object.keys(value).sort().join("|") !== [...expected].sort().join("|")) fail(`${label} has an invalid shape.`);
}
function nonEmpty(value) { return typeof value === "string" && value.trim().length > 0 && value === value.trim(); }
function positiveInteger(value) { return Number.isSafeInteger(value) && value > 0; }
function finiteNonNegative(value) { return typeof value === "number" && Number.isFinite(value) && value >= 0; }
function fail(message) { throw new PlanningPolicyError(message); }
