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
// This digest is deliberately independent from the registry's self-fingerprint.
// It freezes the exact first authoring batch provenance contract.
const DESIGN_TRUST_ROOT_SHA256 = "19a7499861d54e4ea9abcfa1ad56739300915a70837d916d1d38038948a94835";
const DESIGN_FAMILY_CONTRACT_SHA256 = "88118165795b354432e1187e51975ba0aa96839abcb9cea43465518e4ff7801e";
const EXPECTED_SOURCE_IDS = Object.freeze(["w3c-wcag-2.2-rec-2024", "w3c-wai-aria-1.2-rec-2023", "w3c-accname-1.1-rec-2018"]);
const EXPECTED_ANCHOR_IDS = Object.freeze(["wcag22-sc-4.1.2-name-role-value", "wcag22-sc-2.5.3-label-in-name", "wcag22-sc-2.4.3-focus-order", "wcag22-sc-1.4.3-contrast-minimum", "wcag22-sc-1.4.11-non-text-contrast", "wcag22-sc-1.4.4-resize-text", "wcag22-sc-1.4.10-reflow", "wai-aria-1.2-role-definitions", "wai-aria-1.2-states-and-properties", "accname-1.1-name-computation"]);
const EXPECTED_CLAIM_IDS = Object.freeze(["ui-component-name-role-value-and-change-notification", "visible-label-text-contained-in-accessible-name", "sequential-focus-preserves-meaning-and-operability", "text-contrast-thresholds-and-exceptions", "non-text-ui-state-contrast-thresholds-and-exceptions", "text-resize-without-loss", "reflow-without-loss-or-two-dimensional-scrolling", "aria-role-must-match-defined-role-semantics", "aria-current-state-and-value-properties", "accessible-name-source-precedence-and-computation"]);
const EXPECTED_BINDING_IDS = Object.freeze(["design-binding:frontend:visible-label-name", "design-binding:frontend:programmatic-name", "design-binding:frontend:custom-role", "design-binding:frontend:current-value", "design-binding:frontend:state-change-notification", "design-binding:frontend:logical-focus-order", "design-binding:frontend:contrast-outcome", "design-binding:frontend:zoom-reflow-outcome"]);
const FIRST_SAFE_BATCH_ID = "frontend-system-design-interview:accessible-interaction-standards:1";
const ADMISSION_KEYS_BY_TRACK = Object.freeze({
  "backend-system-design-interview": ["learnerFacingContentIncluded", "questionsAuthored", "runtimeAdmission", "publishingAdmission", "packageAdmission", "releaseAdmission"],
  "frontend-system-design-interview": ["learnerFacingContentIncluded", "questionsAuthored", "runtimeAdmission", "publishingAdmission", "packageAdmission", "releaseAdmission"],
  "object-oriented-design-interview": ["learnerFacingContentIncluded", "runtimeAdmission", "publishingAdmission", "packageAdmission", "manualSourceAdmission", "releaseAdmission", "questionsAuthored"]
});
const ownKeys = (value, keys) => Object.keys(value).sort().join("\u0000") === [...keys].sort().join("\u0000");
const trustRoot = (value) => ({
  sourceRecords: value.sourceRecords.map(({ sourceId, canonicalUrl, immutableVersionUrl }) => ({ sourceId, canonicalUrl, immutableVersionUrl })),
  anchorRecords: value.anchorRecords.map(({ anchorId, sourceId, locator, url, authorityClass, claimIds }) => ({ anchorId, sourceId, locator, url, authorityClass, claimIds })),
  claims: value.claims.map(({ claimId, statement, scope, exclusions }) => ({ claimId, statement, scope, exclusions })),
  slotBindings: value.slotBindings.map(({ bindingId, slotId, claimIds, anchorIds, resolutionState }) => ({ bindingId, slotId, claimIds, anchorIds, resolutionState }))
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
  const expectedSources = new Set(EXPECTED_SOURCE_IDS);
  if (sources.size !== expectedSources.size || [...expectedSources].some((id) => !sources.has(id))) fail("INVALID_DESIGN_SOURCE_IDENTITY", "unexpected trust root");
  if (value.anchorRecords.map((anchor) => anchor.anchorId).join("\u0000") !== EXPECTED_ANCHOR_IDS.join("\u0000") || value.claims.map((claim) => claim.claimId).join("\u0000") !== EXPECTED_CLAIM_IDS.join("\u0000")) fail("INVALID_DESIGN_SOURCE_TRUST_ROSTER", "anchor or scoped claim IDs");
  for (const source of value.sourceRecords) if (source.publisher !== "World Wide Web Consortium" || source.sourceType !== "normative_standard" || source.publicationStatus !== "recommendation" || !source.canonicalUrl.startsWith("https://www.w3.org/TR/") || !/^https:\/\/www\.w3\.org\/TR\/\d{4}\/REC-/.test(source.immutableVersionUrl)) fail("INVALID_DESIGN_SOURCE_IDENTITY", source.sourceId);
  for (const anchor of value.anchorRecords) if (!sources.has(anchor.sourceId) || !anchor.locator.trim() || !anchor.url.includes("#") || anchor.claimIds.some((id) => !claims.has(id))) fail("INVALID_DESIGN_SOURCE_ANCHOR", anchor.anchorId);
  const usedAnchors = new Set(); const usedSources = new Set();
  for (const binding of value.slotBindings) { if (binding.resolutionState !== "resolved_exact_direct" || !binding.slotId.startsWith("frontend-system-design-interview:") || !binding.anchorIds.length || binding.claimIds.some((id) => !claims.has(id)) || binding.anchorIds.some((id) => !anchors.has(id))) fail("INVALID_DESIGN_SOURCE_BINDING", binding.bindingId); const covered = new Set(binding.anchorIds.flatMap((id) => anchors.get(id).claimIds)); if (binding.claimIds.some((id) => !covered.has(id))) fail("UNCOVERED_DESIGN_SOURCE_CLAIM", binding.bindingId); binding.anchorIds.forEach((id) => { usedAnchors.add(id); usedSources.add(anchors.get(id).sourceId); }); }
  if (value.slotBindings.map((binding) => binding.bindingId).join("\u0000") !== EXPECTED_BINDING_IDS.join("\u0000")) fail("INVALID_DESIGN_SOURCE_BINDING_ROSTER", "resolved binding IDs");
  if (usedAnchors.size !== anchors.size || usedSources.size !== sources.size) fail("DEAD_DESIGN_SOURCE_INVENTORY", "unbound source or anchor");
  if (value.sourceRecords.length !== 3 || value.anchorRecords.length !== 10 || value.claims.length !== 10 || value.slotBindings.length !== 8) fail("INVALID_DESIGN_SOURCE_REGISTRY_TOTAL", "first batch totals");
  return value;
}
export function validateDesignInterviewFamilyConfig(value = family) {
  if (!value || typeof value !== "object" || digest(value) !== DESIGN_FAMILY_CONTRACT_SHA256) fail("INVALID_DESIGN_FAMILY_CONTRACT", "family configuration drift");
  if (!ownKeys(value, ["schemaVersion", "familyId", "sourceRegistryRef", "supportedInteractions", "choicePolicyId", "choiceResultSemantics", "authoringHandoff", "modes", "selectionRules", "sessionFeasibility"]) || value.schemaVersion !== "design-interview-family-config-v1" || value.familyId !== "design_interview" || value.sourceRegistryRef !== "config/design-interview-source-registry.json" || JSON.stringify(value.supportedInteractions) !== JSON.stringify(["choice"]) || value.choicePolicyId !== "design-single-choice-diagnostic-v1" || value.choiceResultSemantics !== "exact_selected_set_with_partial_v1") fail("INVALID_DESIGN_FAMILY_CONTRACT", "root policy");
  if (!ownKeys(value.authoringHandoff, ["batchId", "scope", "plannedItemCount", "humanReviewRequired", "sourceChecksRequired", "questionsAuthored", "runtimeAdmission"]) || value.authoringHandoff.batchId !== FIRST_SAFE_BATCH_ID || value.authoringHandoff.scope !== "authoring_feasibility_only" || value.authoringHandoff.plannedItemCount !== EXPECTED_BINDING_IDS.length || value.authoringHandoff.humanReviewRequired !== true || value.authoringHandoff.sourceChecksRequired !== true || value.authoringHandoff.questionsAuthored !== 0 || value.authoringHandoff.runtimeAdmission !== "not_admitted") fail("INVALID_DESIGN_FAMILY_CONTRACT", "authoring batch");
  if (!ownKeys(value.sessionFeasibility, ["current", "afterEightItemsAuthoredButBeforeRuntime", "sessionLengthClaim", "freeNodeClaim"]) || !Array.isArray(value.modes) || value.modes.length !== 7 || value.modes.some((mode) => !ownKeys(mode, ["modeId", "contractStatus", "firstBatchEligibleItemCapacityAfterAuthoring", "currentExecutableCapacity", "boundary"]) || mode.currentExecutableCapacity !== 0 || ![0, value.authoringHandoff.plannedItemCount].includes(mode.firstBatchEligibleItemCapacityAfterAuthoring)) || !Array.isArray(value.selectionRules) || value.selectionRules.length !== 5) fail("INVALID_DESIGN_FAMILY_CONTRACT", "mode, session, or selection contract");
  return value;
}
function assertDerivedAdmissionAndAuthoring(curriculum, verified, familyContract) {
  const expectedAdmissionKeys = ADMISSION_KEYS_BY_TRACK[curriculum.trackId];
  const expectedAdmission = { learnerFacingContentIncluded: false, questionsAuthored: 0, runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", packageAdmission: "not_admitted", releaseAdmission: "not_admitted" };
  if (expectedAdmissionKeys?.includes("manualSourceAdmission")) expectedAdmission.manualSourceAdmission = "not_admitted";
  if (!expectedAdmissionKeys || !ownKeys(curriculum.admission, expectedAdmissionKeys) || Object.entries(expectedAdmission).some(([key, value]) => curriculum.admission[key] !== value)) fail("INVALID_DESIGN_ADMISSION", curriculum.trackId);

  const resolvedSlots = curriculum.slots.filter((slot) => slot.sourceRequirements.resolutionState === "resolved_exact_direct");
  const expectedResolvedSlotIds = verified.slotBindings.map((binding) => binding.slotId).sort();
  const resolvedSlotIds = resolvedSlots.map((slot) => slot.slotId).sort();
  const hasCanonicalFirstBatch = curriculum.trackId === "frontend-system-design-interview" && JSON.stringify(resolvedSlotIds) === JSON.stringify(expectedResolvedSlotIds);
  const expectedFirstSafeBatch = hasCanonicalFirstBatch ? familyContract.authoringHandoff.batchId : null;
  const expectedAuthoring = { status: "authoring_feasibility_only", questionsAuthored: 0, firstSafeBatch: expectedFirstSafeBatch, backlog: "exact_source_binding_required" };
  if (!ownKeys(curriculum.authoring, Object.keys(expectedAuthoring)) || Object.entries(expectedAuthoring).some(([key, value]) => curriculum.authoring[key] !== value)) fail("INVALID_DESIGN_AUTHORING_STATE", curriculum.trackId);

  if (!Array.isArray(curriculum.modeFeasibility) || curriculum.modeFeasibility.length !== familyContract.modes.length) fail("INVALID_DESIGN_MODE_FEASIBILITY", curriculum.trackId);
  for (const [index, mode] of curriculum.modeFeasibility.entries()) {
    const canonicalMode = familyContract.modes[index];
    const expectedCapacity = hasCanonicalFirstBatch ? canonicalMode.firstBatchEligibleItemCapacityAfterAuthoring : 0;
    if (!ownKeys(mode, ["modeId", "contractStatus", "firstBatchEligibleItemCapacityAfterAuthoring", "executableCapacity", "boundary"]) || mode.modeId !== canonicalMode.modeId || mode.contractStatus !== canonicalMode.contractStatus || mode.firstBatchEligibleItemCapacityAfterAuthoring !== expectedCapacity || mode.executableCapacity !== canonicalMode.currentExecutableCapacity || mode.boundary !== canonicalMode.boundary) fail("INVALID_DESIGN_MODE_FEASIBILITY", mode.modeId);
  }
}
export function validateDesignInterviewCurriculum(curriculum, { brief, sourceRegistry = registry } = {}) {
  closed(designSchema); const verified = assertRegistry(sourceRegistry); const familyContract = validateDesignInterviewFamilyConfig();
  if (Object.hasOwn(curriculum, "sourceRecords") || Object.hasOwn(curriculum, "sourcePolicy")) fail("DESIGN_LOCAL_SOURCE_INVENTORY_RETIRED", curriculum.trackId);
  for (const field of ["schemaVersion", "curriculumVersion", "trackId", "familyId", "nodes", "blockPlans", "targetPlans", "slots", "modeFeasibility", "admission", "authoring"]) if (!Object.hasOwn(curriculum, field)) fail("MISSING_DESIGN_CURRICULUM_FIELD", field);
  if (curriculum.schemaVersion !== "patternly-design-interview-curriculum-v1" || curriculum.curriculumVersion !== "2026.08.11" || curriculum.familyId !== "design_interview" || curriculum.trackId !== brief.trackId) fail("INVALID_DESIGN_CURRICULUM_VERSION", curriculum.trackId);
  const bindings = new Map(verified.slotBindings.map((x) => [x.bindingId, x])); unique(curriculum.slots.map((x) => x.slotId), "slot IDs"); unique(curriculum.slots.map((x) => x.dedupeFingerprint), "slot fingerprints");
  let resolved = 0;
  for (const slot of curriculum.slots) {
    if (slot.trackId !== curriculum.trackId || slot.dedupeFingerprint !== slotFingerprint(slot)) fail("DESIGN_SLOT_FINGERPRINT_MISMATCH", slot.slotId);
    const req = slot.sourceRequirements; const interaction = slot.deliveryInteraction;
    if (req.resolutionState === "resolved_exact_direct") { const binding = bindings.get(req.sourceBindingId); if (!ownKeys(req, ["resolutionState", "sourceBindingId"]) || !ownKeys(interaction, ["familyContract", "interactionType", "selectionMode", "scoringContract", "status"]) || !binding || binding.slotId !== slot.slotId || interaction.familyContract !== "design_interview" || interaction.interactionType !== "choice" || interaction.selectionMode !== "single" || interaction.scoringContract !== "exact_selected_set_with_partial_v1" || interaction.status !== "authoring_admitted_runtime_not_admitted" || slot.authoringStatus !== "authoring_admitted") fail("INVALID_DESIGN_RESOLVED_SLOT", slot.slotId); resolved++; }
    else if (req.resolutionState === "blocked_unresolved") { if (!ownKeys(req, ["resolutionState", "sourceRequirementIds", "unresolvedRequirements"]) || !ownKeys(interaction, ["familyContract", "interactionType", "status"]) || !Array.isArray(req.sourceRequirementIds) || !req.sourceRequirementIds.length || !Array.isArray(req.unresolvedRequirements) || !req.unresolvedRequirements.length || interaction.familyContract !== "design_interview" || interaction.interactionType !== null || interaction.status !== "blocked_by_source_or_interaction_contract") fail("INVALID_DESIGN_BLOCKED_SLOT", slot.slotId); }
    else fail("INVALID_DESIGN_SOURCE_RESOLUTION", slot.slotId);
  }
  if (resolved !== (curriculum.trackId === "frontend-system-design-interview" ? 8 : 0) || curriculum.slots.length - resolved < 0) fail("INVALID_DESIGN_SLOT_RECONCILIATION", curriculum.trackId);
  if (!familyContract.supportedInteractions?.includes("choice") || familyContract.choiceResultSemantics !== "exact_selected_set_with_partial_v1") fail("INVALID_DESIGN_ADMISSION", curriculum.trackId);
  assertDerivedAdmissionAndAuthoring(curriculum, verified, familyContract);
  return curriculum;
}
export { assertRegistry as validateDesignInterviewSourceRegistry };
