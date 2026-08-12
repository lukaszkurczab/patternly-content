import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const load = (path) => JSON.parse(readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8"));
const designSchema = load("../../schemas/curriculum/design-interview-curriculum.schema.json");
const registrySchema = load("../../schemas/curriculum/design-interview-source-registry.schema.json");
const registry = load("../../config/design-interview-source-registry.json");
const family = load("../../config/families/design_interview.json");
const fail = (code, message) => { const error = new Error(`${code}: ${message}`); error.code = code; throw error; };
const unique = (values, label) => { if (new Set(values).size !== values.length) fail("DUPLICATE_DESIGN_CANONICAL_ID", label); };
const fingerprint = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const canonical = (value) => Array.isArray(value) ? `[${value.map(canonical).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}` : JSON.stringify(value);
const digest = (value) => createHash("sha256").update(canonical(value)).digest("hex");
const DESIGN_TRUST_ROOT_SHA256 = "a48612489b5f7b1ed654a76d322a8fdf191405c99b5196ef19a2799c17727cf2";
const DESIGN_FAMILY_CONTRACT_SHA256 = "e95bbec32ff298068a9d1ff1030280513a60a8ab47cb06f1dd0e14f094552df8";
const TRACK_IDS = Object.freeze(["backend-system-design-interview", "frontend-system-design-interview", "object-oriented-design-interview"]);
const EXPECTED_RESOLVED_BY_TRACK = Object.freeze({
  "backend-system-design-interview": 28,
  "frontend-system-design-interview": 43,
  "object-oriented-design-interview": 30
});
const EXPECTED_BATCH_SIZE_BY_TRACK = Object.freeze({
  "backend-system-design-interview": 8,
  "frontend-system-design-interview": 10,
  "object-oriented-design-interview": 9
});
const batchPairKey = ({ bindingId, slotId }) => `${bindingId}\u0000${slotId}`;
const sameSet = (left, right) => left.size === right.size && [...left].every((value) => right.has(value));
const ADMISSION_KEYS_BY_TRACK = Object.freeze({
  "backend-system-design-interview": ["learnerFacingContentIncluded", "questionsAuthored", "runtimeAdmission", "publishingAdmission", "packageAdmission", "releaseAdmission"],
  "frontend-system-design-interview": ["learnerFacingContentIncluded", "questionsAuthored", "runtimeAdmission", "publishingAdmission", "packageAdmission", "releaseAdmission"],
  "object-oriented-design-interview": ["learnerFacingContentIncluded", "runtimeAdmission", "publishingAdmission", "packageAdmission", "manualSourceAdmission", "releaseAdmission", "questionsAuthored"]
});
const ownKeys = (value, keys) => Object.keys(value).sort().join("\u0000") === [...keys].sort().join("\u0000");
const trustRoot = (value) => ({
  sourceRecords: value.sourceRecords,
  anchorRecords: value.anchorRecords,
  claims: value.claims,
  slotBindings: value.slotBindings
});
const slotFingerprint = (slot) => fingerprint({ trackId: slot.trackId, nodeId: slot.nodeId, blockId: slot.blockId, coverageTargetId: slot.coverageTargetId, directSkillOrDecisionAtomId: slot.directSkillOrDecisionAtomId, expectedOutcome: slot.expectedOutcome, decisiveBoundary: slot.decisiveBoundary, transferBoundary: slot.transferBoundary, materialEvidenceOrConstraintChanged: slot.materialEvidenceOrConstraintChanged });

function closed(schema, path = "schema") { if (!schema || typeof schema !== "object") return; if (schema.type === "object" && schema.additionalProperties !== false) fail("INVALID_DESIGN_SCHEMA_CONTRACT", path); if (schema.properties) Object.entries(schema.properties).forEach(([key, value]) => closed(value, `${path}.${key}`)); if (schema.items) closed(schema.items, `${path}[]`); }
function assertRegistry(value = registry) {
  closed(registrySchema, "registry schema");
  for (const key of registrySchema.required) if (!Object.hasOwn(value, key)) fail("INVALID_DESIGN_SOURCE_REGISTRY", `missing ${key}`);
  if (Object.keys(value).some((key) => !Object.hasOwn(registrySchema.properties, key))) fail("INVALID_DESIGN_SOURCE_REGISTRY", "undeclared root field");
  const payload = { ...value }; delete payload.registryFingerprintSha256;
  if (fingerprint(payload) !== value.registryFingerprintSha256) fail("DESIGN_SOURCE_REGISTRY_FINGERPRINT_MISMATCH", "registry identity drift");
  if (value.trustRootSha256 !== DESIGN_TRUST_ROOT_SHA256 || digest(trustRoot(value)) !== DESIGN_TRUST_ROOT_SHA256) fail("DESIGN_SOURCE_TRUST_ROOT_MISMATCH", "frozen source, anchor, claim, or binding roster drift");
  for (const collection of [value.sourceRecords, value.anchorRecords, value.claims, value.slotBindings]) if (!Array.isArray(collection) || !collection.length) fail("INVALID_DESIGN_SOURCE_REGISTRY", "empty collection");
  unique(value.sourceRecords.map((x) => x.sourceId), "registry source IDs"); unique(value.anchorRecords.map((x) => x.anchorId), "registry anchor IDs"); unique(value.claims.map((x) => x.claimId), "registry claim IDs"); unique(value.slotBindings.map((x) => x.bindingId), "registry binding IDs"); unique(value.slotBindings.map((x) => x.slotId), "registry binding slot IDs");
  const sources = new Set(value.sourceRecords.map((x) => x.sourceId)); const claims = new Set(value.claims.map((x) => x.claimId)); const anchors = new Map(value.anchorRecords.map((x) => [x.anchorId, x]));
  for (const source of value.sourceRecords) if (!source.publisher.trim() || !source.sourceType.trim() || !source.title.trim() || !source.canonicalUrl.startsWith("https://") || !source.immutableVersionUrl.startsWith("https://") || !source.versionContext.trim() || !source.publicationStatus.trim() || !source.checkedDate.trim() || !source.volatility.trim()) fail("INVALID_DESIGN_SOURCE_IDENTITY", source.sourceId);
  for (const anchor of value.anchorRecords) if (!sources.has(anchor.sourceId) || !anchor.locator.trim() || !anchor.url.startsWith("https://") || !["normative", "informative"].includes(anchor.authorityClass) || anchor.claimIds.some((id) => !claims.has(id))) fail("INVALID_DESIGN_SOURCE_ANCHOR", anchor.anchorId);
  const usedAnchors = new Set(); const usedSources = new Set();
  for (const binding of value.slotBindings) {
    const trackId = TRACK_IDS.find((id) => binding.slotId.startsWith(`${id}:`));
    if (!trackId || binding.resolutionState !== "resolved_exact_direct" || !binding.anchorIds.length || binding.claimIds.some((id) => !claims.has(id)) || binding.anchorIds.some((id) => !anchors.has(id))) fail("INVALID_DESIGN_SOURCE_BINDING", binding.bindingId);
    const covered = new Set(binding.anchorIds.flatMap((id) => anchors.get(id).claimIds)); if (binding.claimIds.some((id) => !covered.has(id))) fail("UNCOVERED_DESIGN_SOURCE_CLAIM", binding.bindingId);
    binding.anchorIds.forEach((id) => { usedAnchors.add(id); usedSources.add(anchors.get(id).sourceId); });
  }
  if (usedAnchors.size !== anchors.size || usedSources.size !== sources.size || value.claims.some((claim) => !value.anchorRecords.some((anchor) => anchor.claimIds.includes(claim.claimId)))) fail("DEAD_DESIGN_SOURCE_INVENTORY", "unbound source, anchor, or claim");
  if (value.sourceRecords.length !== 28 || value.anchorRecords.length !== 116 || value.claims.length !== 93 || value.slotBindings.length !== 101) fail("INVALID_DESIGN_SOURCE_REGISTRY_TOTAL", "frozen round-five totals");
  return value;
}
export function validateDesignInterviewFamilyConfig(value = family) {
  if (!value || typeof value !== "object" || digest(value) !== DESIGN_FAMILY_CONTRACT_SHA256) fail("INVALID_DESIGN_FAMILY_CONTRACT", "family configuration drift");
  if (!ownKeys(value, ["schemaVersion", "familyId", "sourceRegistryRef", "supportedInteractions", "choicePolicyId", "choiceResultSemantics", "authoringHandoffs", "modes", "selectionRules", "sessionFeasibility"]) || value.schemaVersion !== "design-interview-family-config-v1" || value.familyId !== "design_interview" || value.sourceRegistryRef !== "config/design-interview-source-registry.json" || JSON.stringify(value.supportedInteractions) !== JSON.stringify(["choice"]) || value.choicePolicyId !== "design-single-choice-diagnostic-v1" || value.choiceResultSemantics !== "exact_selected_set_with_partial_v1") fail("INVALID_DESIGN_FAMILY_CONTRACT", "root policy");
  const verified = assertRegistry(); const bindings = new Map(verified.slotBindings.map((binding) => [binding.bindingId, binding]));
  const invalidBatch = !Array.isArray(value.authoringHandoffs) || value.authoringHandoffs.length !== TRACK_IDS.length || value.authoringHandoffs.some((batch) => {
    const keys = ["trackId", "batchId", "scope", "plannedItemCount", "slotBindings", "deferredResolvedSlotBindings", "humanReviewRequired", "sourceChecksRequired", "questionsAuthored", "runtimeAdmission"];
    keys.push("deferredResolvedReason", "deferredResolvedReviewBoundary");
    if (!ownKeys(batch, keys) || !TRACK_IDS.includes(batch.trackId) || batch.scope !== "authoring_feasibility_only" || batch.plannedItemCount !== EXPECTED_BATCH_SIZE_BY_TRACK[batch.trackId] || batch.humanReviewRequired !== true || batch.sourceChecksRequired !== true || batch.questionsAuthored !== 0 || batch.runtimeAdmission !== "not_admitted" || !Array.isArray(batch.slotBindings) || !Array.isArray(batch.deferredResolvedSlotBindings) || batch.slotBindings.length !== batch.plannedItemCount || !batch.deferredResolvedSlotBindings.length || typeof batch.deferredResolvedReason !== "string" || !batch.deferredResolvedReason.trim() || typeof batch.deferredResolvedReviewBoundary !== "string" || !batch.deferredResolvedReviewBoundary.trim() || new Set(batch.slotBindings.map(batchPairKey)).size !== batch.slotBindings.length || new Set(batch.slotBindings.map((entry) => entry.bindingId)).size !== batch.slotBindings.length || new Set(batch.slotBindings.map((entry) => entry.slotId)).size !== batch.slotBindings.length) return true;
    const batchPairs = new Set(batch.slotBindings.map(batchPairKey)); const deferredPairs = new Set(batch.deferredResolvedSlotBindings.map(batchPairKey));
    if (new Set(batch.deferredResolvedSlotBindings.map((entry) => entry.bindingId)).size !== batch.deferredResolvedSlotBindings.length || new Set(batch.deferredResolvedSlotBindings.map((entry) => entry.slotId)).size !== batch.deferredResolvedSlotBindings.length || [...batchPairs].some((entry) => deferredPairs.has(entry))) return true;
    const expectedPairs = new Set(verified.slotBindings.filter((binding) => binding.slotId.startsWith(`${batch.trackId}:`)).map(batchPairKey));
    if (!sameSet(new Set([...batchPairs, ...deferredPairs]), expectedPairs)) return true;
    return [...batch.slotBindings, ...batch.deferredResolvedSlotBindings].some((entry) => !entry || typeof entry.bindingId !== "string" || typeof entry.slotId !== "string" || !bindings.has(entry.bindingId) || bindings.get(entry.bindingId).slotId !== entry.slotId || !entry.slotId.startsWith(`${batch.trackId}:`));
  });
  if (invalidBatch || new Set(value.authoringHandoffs.map((batch) => batch.trackId)).size !== TRACK_IDS.length) fail("INVALID_DESIGN_FAMILY_CONTRACT", "authoring batch roster");
  const invalidMode = !Array.isArray(value.modes) || value.modes.length !== 7 || value.modes.some((mode) => !ownKeys(mode, ["modeId", "contractStatus", "firstBatchEligibleItemCapacityAfterAuthoringByTrack", "currentExecutableCapacity", "boundary"]) || mode.currentExecutableCapacity !== 0 || !ownKeys(mode.firstBatchEligibleItemCapacityAfterAuthoringByTrack, TRACK_IDS) || TRACK_IDS.some((trackId) => ![0, EXPECTED_BATCH_SIZE_BY_TRACK[trackId]].includes(mode.firstBatchEligibleItemCapacityAfterAuthoringByTrack[trackId])));
  if (!ownKeys(value.sessionFeasibility, ["current", "afterAuthoringButBeforeRuntime", "sessionLengthClaim", "freeNodeClaim"]) || invalidMode || !Array.isArray(value.selectionRules) || value.selectionRules.length !== 5) fail("INVALID_DESIGN_FAMILY_CONTRACT", "mode, session, or selection contract");
  return value;
}
function assertDerivedAdmissionAndAuthoring(curriculum, verified, familyContract) {
  const expectedAdmissionKeys = ADMISSION_KEYS_BY_TRACK[curriculum.trackId];
  const expectedAdmission = { learnerFacingContentIncluded: false, questionsAuthored: 0, runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", packageAdmission: "not_admitted", releaseAdmission: "not_admitted" };
  if (expectedAdmissionKeys?.includes("manualSourceAdmission")) expectedAdmission.manualSourceAdmission = "not_admitted";
  if (!expectedAdmissionKeys || !ownKeys(curriculum.admission, expectedAdmissionKeys) || Object.entries(expectedAdmission).some(([key, value]) => curriculum.admission[key] !== value)) fail("INVALID_DESIGN_ADMISSION", curriculum.trackId);
  const batch = familyContract.authoringHandoffs.find((entry) => entry.trackId === curriculum.trackId);
  const admittedSlots = curriculum.slots.filter((slot) => slot.authoringStatus === "authoring_admitted");
  const batchSlotIds = batch.slotBindings.map((binding) => binding.slotId).sort();
  const hasCanonicalBatch = JSON.stringify(admittedSlots.map((slot) => slot.slotId).sort()) === JSON.stringify(batchSlotIds);
  const expectedAuthoring = { status: "authoring_feasibility_only", questionsAuthored: 0, firstSafeBatch: hasCanonicalBatch ? batch.batchId : null, backlog: "exact_source_binding_required" };
  if (!ownKeys(curriculum.authoring, Object.keys(expectedAuthoring)) || Object.entries(expectedAuthoring).some(([key, value]) => curriculum.authoring[key] !== value)) fail("INVALID_DESIGN_AUTHORING_STATE", curriculum.trackId);
  if (!Array.isArray(curriculum.modeFeasibility) || curriculum.modeFeasibility.length !== familyContract.modes.length) fail("INVALID_DESIGN_MODE_FEASIBILITY", curriculum.trackId);
  for (const [index, mode] of curriculum.modeFeasibility.entries()) { const canonicalMode = familyContract.modes[index]; const expectedCapacity = hasCanonicalBatch ? canonicalMode.firstBatchEligibleItemCapacityAfterAuthoringByTrack[curriculum.trackId] : 0; if (!ownKeys(mode, ["modeId", "contractStatus", "firstBatchEligibleItemCapacityAfterAuthoring", "executableCapacity", "boundary"]) || mode.modeId !== canonicalMode.modeId || mode.contractStatus !== canonicalMode.contractStatus || mode.firstBatchEligibleItemCapacityAfterAuthoring !== expectedCapacity || mode.executableCapacity !== canonicalMode.currentExecutableCapacity || mode.boundary !== canonicalMode.boundary) fail("INVALID_DESIGN_MODE_FEASIBILITY", mode.modeId); }
}
export function validateDesignInterviewCurriculum(curriculum, { brief, sourceRegistry = registry } = {}) {
  closed(designSchema); const verified = assertRegistry(sourceRegistry); const familyContract = validateDesignInterviewFamilyConfig();
  if (Object.hasOwn(curriculum, "sourceRecords") || Object.hasOwn(curriculum, "sourcePolicy")) fail("DESIGN_LOCAL_SOURCE_INVENTORY_RETIRED", curriculum.trackId);
  for (const field of ["schemaVersion", "curriculumVersion", "trackId", "familyId", "nodes", "blockPlans", "targetPlans", "slots", "modeFeasibility", "admission", "authoring"]) if (!Object.hasOwn(curriculum, field)) fail("MISSING_DESIGN_CURRICULUM_FIELD", field);
  if (curriculum.schemaVersion !== "patternly-design-interview-curriculum-v1" || curriculum.curriculumVersion !== "2026.08.11" || curriculum.familyId !== "design_interview" || curriculum.trackId !== brief.trackId || !TRACK_IDS.includes(curriculum.trackId)) fail("INVALID_DESIGN_CURRICULUM_VERSION", curriculum.trackId);
  const bindings = new Map(verified.slotBindings.map((x) => [x.bindingId, x])); unique(curriculum.slots.map((x) => x.slotId), "slot IDs"); unique(curriculum.slots.map((x) => x.dedupeFingerprint), "slot fingerprints"); let resolved = 0;
  const batch = familyContract.authoringHandoffs.find((entry) => entry.trackId === curriculum.trackId);
  const admittedBindingIds = new Set(batch.slotBindings.map((entry) => entry.bindingId)); const deferredBindingIds = new Set(batch.deferredResolvedSlotBindings.map((entry) => entry.bindingId));
  for (const slot of curriculum.slots) { if (slot.trackId !== curriculum.trackId || slot.dedupeFingerprint !== slotFingerprint(slot)) fail("DESIGN_SLOT_FINGERPRINT_MISMATCH", slot.slotId); const req = slot.sourceRequirements; const interaction = slot.deliveryInteraction; if (req.resolutionState === "resolved_exact_direct") { const binding = bindings.get(req.sourceBindingId); const admitted = admittedBindingIds.has(req.sourceBindingId); const deferred = deferredBindingIds.has(req.sourceBindingId); if (!ownKeys(req, ["resolutionState", "sourceBindingId"]) || !ownKeys(interaction, ["familyContract", "interactionType", "selectionMode", "scoringContract", "status"]) || !binding || binding.slotId !== slot.slotId || interaction.familyContract !== "design_interview" || interaction.interactionType !== "choice" || interaction.selectionMode !== "single" || interaction.scoringContract !== "exact_selected_set_with_partial_v1" || (!admitted && !deferred) || (admitted && (interaction.status !== "authoring_admitted_runtime_not_admitted" || slot.authoringStatus !== "authoring_admitted")) || (deferred && (interaction.status !== "provenance_resolved_authoring_deferred_runtime_not_admitted" || slot.authoringStatus !== "provenance_resolved_authoring_deferred"))) fail("INVALID_DESIGN_RESOLVED_SLOT", slot.slotId); resolved++; } else if (req.resolutionState === "blocked_unresolved") { if (!ownKeys(req, ["resolutionState", "sourceRequirementIds", "unresolvedRequirements"]) || !ownKeys(interaction, ["familyContract", "interactionType", "status"]) || !Array.isArray(req.sourceRequirementIds) || !req.sourceRequirementIds.length || !Array.isArray(req.unresolvedRequirements) || !req.unresolvedRequirements.length || interaction.familyContract !== "design_interview" || interaction.interactionType !== null || interaction.status !== "blocked_by_source_or_interaction_contract") fail("INVALID_DESIGN_BLOCKED_SLOT", slot.slotId); } else fail("INVALID_DESIGN_SOURCE_RESOLUTION", slot.slotId); }
  if (resolved !== EXPECTED_RESOLVED_BY_TRACK[curriculum.trackId]) fail("INVALID_DESIGN_SLOT_RECONCILIATION", curriculum.trackId);
  assertDerivedAdmissionAndAuthoring(curriculum, verified, familyContract); return curriculum;
}
export { assertRegistry as validateDesignInterviewSourceRegistry };
