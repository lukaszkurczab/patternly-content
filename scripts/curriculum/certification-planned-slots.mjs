import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { loadCertificationObjectiveRegistries } from "./certification-objective-registries.mjs";
import { loadCurricula } from "./curricula.mjs";
import { loadCanonicalTrackBriefs } from "../product/track-briefs.mjs";
import { validateCanonicalJsonSchema } from "../publishing/pipeline.mjs";

const fail = (code, message) => { const error = new Error(`${code}: ${message}`); error.code = code; throw error; };
const text = (value) => typeof value === "string" && value.trim();
const own = (value, key) => Object.hasOwn(value, key);
const required = ["slotId", "trackId", "nodeId", "blockId", "coverageTargetId", "officialObjectiveRefs", "directSkillOrDecisionAtomId", "learningOperation", "questionIntent", "materialEvidenceOrConstraintChanged", "expectedOutcome", "errorModelOrFailureMode", "decisiveBoundary", "transferBoundary", "intendedSurface", "difficultyIntent", "eligibleModes", "deliveryInteraction", "sourceRequirements", "overlapExclusions", "maintenanceRisk", "neighborDistinctness", "dedupeFingerprint"];
const learningOperations = new Set(["concept_classification", "capability_recognition", "decision_selection", "procedure_ordering", "configuration_diagnosis", "failure_diagnosis", "boundary_testing", "transfer_under_changed_constraints"]);
const outcomeKinds = new Set(["decision", "classification", "procedure", "diagnosis"]);
const surfaces = new Set(["scenario", "CLI", "configuration", "code", "HCL", "log", "architecture", "portal", "conceptual_classification"]);
const difficulties = new Set(["foundation_discrimination", "applied_mechanism", "constraint_reversal"]);
const forbiddenFields = new Set(["question", "stem", "prompt", "options", "correctOptionIds", "correctResponse", "feedback", "feedbackReason", "details", "distractors", "explanation", "whyOthersAreWrong"]);
const pilotPairs = new Set(["google-cloud-associate-cloud-engineer/setup_environment", "hashicorp-terraform-associate-004/state_backends_and_drift", "microsoft-azure-ai-fundamentals-ai-901/foundry_prompts_and_model_clients"]);
const candidateSourceAnchorSha256 = "e63df42e385a699ba18d577d3ad581cf0156d8d4a0df5c32813f6786e816aaff";
const stable = (value) => Array.isArray(value) ? value.map(stable) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])) : value;
const sourcePropertyIds = (slot) => slot.sourceRequirements.directFirstPartyDocumentation.flatMap((requirement) => requirement.testedProperties).sort();
export const fingerprintInput = (slot) => stable({ ownershipPath: { trackId: slot.trackId, nodeId: slot.nodeId, blockId: slot.blockId, coverageTargetId: slot.coverageTargetId }, atom: slot.directSkillOrDecisionAtomId, operation: slot.learningOperation, changedEvidence: [...slot.materialEvidenceOrConstraintChanged].sort(), expectedOutcome: slot.expectedOutcome, decisiveBoundary: slot.decisiveBoundary, surface: slot.intendedSurface, testedProperties: sourcePropertyIds(slot) });
export const dedupeFingerprint = (slot) => createHash("sha256").update(JSON.stringify(fingerprintInput(slot))).digest("hex");
// Stage03 trust roots need a representation-independent identity for planned
// (not learner-facing) slots.  These helpers deliberately exclude the mutable
// dedupe/artifact fingerprints and normalize only set-like planning fields.
const normalizedText = (value) => typeof value === "string" ? value.normalize("NFKC").replace(/\s+/gu, " ").trim() : value;
const normalizedPlanning = (value) => Array.isArray(value)
  ? value.map(normalizedPlanning)
  : value && typeof value === "object"
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalizedPlanning(value[key])]))
    : normalizedText(value);
const sorted = (values) => [...values].sort();
export const plannedSlotDirectSourceBindingInput = (slot) => normalizedPlanning(slot.sourceRequirements.directFirstPartyDocumentation.map((requirement) => ({
  testedProperties: sorted(requirement.testedProperties), sourceRefs: sorted(requirement.sourceRefs), resolutionState: requirement.resolutionState
})).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))));
export const plannedSlotDirectSourceBindingSha256 = (slot) => createHash("sha256").update(JSON.stringify(plannedSlotDirectSourceBindingInput(slot))).digest("hex");
export const plannedSlotSemanticIdentityInput = (slot) => normalizedPlanning({
  identity: { trackId: slot.trackId, currentNodeId: slot.currentNodeId ?? slot.nodeId, candidateNodeId: slot.nodeId, blockId: slot.blockId, coverageTargetId: slot.coverageTargetId, atomId: slot.directSkillOrDecisionAtomId, slotId: slot.slotId },
  diagnosticContract: { learningOperation: slot.learningOperation, questionIntent: slot.questionIntent, materialEvidenceOrConstraintChanged: sorted(slot.materialEvidenceOrConstraintChanged), expectedOutcome: slot.expectedOutcome, errorModelOrFailureMode: slot.errorModelOrFailureMode, decisiveBoundary: slot.decisiveBoundary, transferBoundary: slot.transferBoundary, intendedSurface: slot.intendedSurface, difficultyIntent: slot.difficultyIntent },
  deliveryAndOverlap: { eligibleModes: sorted(slot.eligibleModes), deliveryInteraction: slot.deliveryInteraction, overlapExclusions: sorted(slot.overlapExclusions), maintenanceRisk: slot.maintenanceRisk, neighborDistinctness: [...slot.neighborDistinctness].sort((left, right) => left.neighborSlotId.localeCompare(right.neighborSlotId)) },
  provenance: { officialObjectiveRefs: sorted(slot.officialObjectiveRefs), officialObjective: slot.sourceRequirements.officialObjective, directSourceBinding: plannedSlotDirectSourceBindingInput(slot), unresolvedRequirements: slot.sourceRequirements.unresolvedRequirements }
});
export const plannedSlotSemanticIdentitySha256 = (slot) => createHash("sha256").update(JSON.stringify(plannedSlotSemanticIdentityInput(slot))).digest("hex");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
export async function loadCandidateSourceAnchors(root = process.cwd()) { const path = join(root, "schemas/curriculum/certification-planned-slot-source-anchors.json"); const bytes = await readFile(path, "utf8"); if (createHash("sha256").update(bytes).digest("hex") !== candidateSourceAnchorSha256) fail("CERTIFICATION_PLANNED_SLOT_SOURCE_ANCHOR_DIGEST_MISMATCH", "Candidate source anchors differ from the executable CERT-CORR-02 trust anchor."); return new Map(JSON.parse(bytes).anchors.map((source) => [source.sourceId, source])); }
const planDirectory = (root) => join(root, "evidence", "certification", "planned-item-slots");
export async function loadCertificationPlannedSlotPlans({ root = process.cwd(), directory = planDirectory(root) } = {}) {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".json") && name.includes("--")).sort();
  if (!names.length) fail("MISSING_CERTIFICATION_PLANNED_SLOT_PLANS", "No candidate planned-slot plans exist.");
  const schema = await readJson(join(root, "schemas/curriculum/certification-planned-slot.schema.json"));
  return Promise.all(names.map(async (name) => { const plan = await readJson(join(directory, name)); validateCanonicalJsonSchema(plan, schema, `planned-slot ${name}`); return { ...plan, __planPath: join(directory, name) }; }));
}
function collectCurriculumRefs(curricula) {
  const refs = new Map();
  for (const curriculum of curricula) for (const node of curriculum.nodes) for (const block of node.learningBlocks) for (const target of block.coverageTargets) refs.set(`${curriculum.trackId}/${node.nodeId}/${block.blockId}/${target.coverageTargetId}`, { curriculum, node, block, target });
  return refs;
}
const sourceHost = (url) => { try { return new URL(url).hostname; } catch { return null; } };
function assertNoLearnerFields(value, path = "slot", allowPlanningExplanation = false) { if (Array.isArray(value)) return value.forEach((entry, index) => assertNoLearnerFields(entry, `${path}[${index}]`, allowPlanningExplanation)); if (value && typeof value === "object") for (const [key, entry] of Object.entries(value)) { if (forbiddenFields.has(key) && !(allowPlanningExplanation && key === "explanation")) fail("LEARNER_FACING_CONTENT_FIELD", `${path}.${key} is not allowed in a candidate plan.`); assertNoLearnerFields(entry, `${path}.${key}`, allowPlanningExplanation || key === "neighborDistinctness"); } }
function derived(slots) {
  const count = (keys) => [...new Map([...slots.reduce((map, slot) => { const entry = keys.reduce((result, key) => ({ ...result, [key]: slot[key] }), {}); const signature = JSON.stringify(entry); map.set(signature, { ...entry, slotCount: (map.get(signature)?.slotCount ?? 0) + 1 }); return map; }, new Map())].map(([, value]) => [JSON.stringify(value), value])).values()];
  return { planSlotCount: slots.length, targets: count(["trackId", "nodeId", "blockId", "coverageTargetId"]), blocks: count(["trackId", "nodeId", "blockId"]), nodes: count(["trackId", "nodeId"]), tracks: count(["trackId"]) };
}
export async function validateCertificationPlannedSlotPlans(plans, { root = process.cwd() } = {}) {
  const curricula = await loadCurricula({ root }); const briefs = await loadCanonicalTrackBriefs({ root }); const registries = await loadCertificationObjectiveRegistries({ root }); const refs = collectCurriculumRefs(curricula); const anchors = await loadCandidateSourceAnchors(root);
  if (plans.length !== 3) fail("INVALID_CERTIFICATION_PLANNED_SLOT_PLAN_COUNT", "Exactly three pilot plans are required.");
  const slots = plans.flatMap((plan) => plan.slots ?? []); const ids = new Set(), fingerprints = new Set(); const sourceRecords = new Map();
  for (const plan of plans) {
    if (plan.schemaVersion !== "patternly-certification-planned-item-slot-pilot-v1" || plan.artifactStatus !== "candidate_non_runtime_evidence" || plan.stageId !== "CERT-CORR-02" || plan.scope?.runtimeAdmission !== "not_admitted" || plan.scope?.learnerFacingContentIncluded !== false) fail("INVALID_CANDIDATE_RUNTIME_BOUNDARY", `${plan.__planPath ?? "plan"} is not candidate-only.`);
    if (!Array.isArray(plan.slots) || !plan.slots.length) fail("MISSING_CERTIFICATION_PLANNED_SLOT", "Each pilot plan needs explicit slots.");
    const pair = `${plan.slots[0].trackId}/${plan.slots[0].nodeId}`; if (!pilotPairs.has(pair) || plan.slots.some((slot) => `${slot.trackId}/${slot.nodeId}` !== pair)) fail("INVALID_CERTIFICATION_PLANNED_SLOT_PILOT", `${plan.__planPath ?? "plan"} is not one exact pilot node.`);
    if (plan.derivedCounts && JSON.stringify(stable(plan.derivedCounts)) !== JSON.stringify(stable(derived(plan.slots)))) fail("CERTIFICATION_PLANNED_SLOT_COUNT_DRIFT", `${plan.__planPath ?? "plan"} declared counts differ from its explicit slots.`);
    for (const source of plan.sourceRecords ?? []) { if (sourceRecords.has(source.sourceId) || JSON.stringify(source) !== JSON.stringify(anchors.get(source.sourceId))) fail("INVALID_CERTIFICATION_PLANNED_SLOT_SOURCE_ANCHOR", `${source.sourceId} must exactly match its candidate trust anchor.`); sourceRecords.set(source.sourceId, source); }
  }
  for (const slot of slots) {
    for (const field of required) if (!own(slot, field)) fail("MISSING_CERTIFICATION_PLANNED_SLOT_FIELD", `${field} is required.`);
    assertNoLearnerFields(slot); if (!text(slot.slotId) || !slot.slotId.startsWith(`${slot.coverageTargetId}:slot:`) || !/^[a-z0-9_:-]+$/.test(slot.slotId)) fail("INVALID_CERTIFICATION_PLANNED_SLOT_ID", slot.slotId);
    if (ids.has(slot.slotId)) fail("DUPLICATE_CERTIFICATION_PLANNED_SLOT_ID", slot.slotId); ids.add(slot.slotId);
    const ref = refs.get(`${slot.trackId}/${slot.nodeId}/${slot.blockId}/${slot.coverageTargetId}`); if (!ref || ref.target.primarySkillOrDecisionAtomId !== slot.directSkillOrDecisionAtomId) fail("INVALID_CERTIFICATION_PLANNED_SLOT_REFERENCE", slot.slotId);
    if (!Array.isArray(slot.officialObjectiveRefs) || !slot.officialObjectiveRefs.length || slot.officialObjectiveRefs.some((objective) => !ref.target.officialObjectiveRefs.includes(objective))) fail("INVALID_CERTIFICATION_PLANNED_SLOT_OBJECTIVES", slot.slotId);
    const registry = registries.get(slot.trackId); if (!registry || slot.officialObjectiveRefs.some((id) => !registry.objectives.some((objective) => objective.objectiveId === id))) fail("FOREIGN_CERTIFICATION_PLANNED_SLOT_OBJECTIVE", slot.slotId);
    if (!learningOperations.has(slot.learningOperation) || !outcomeKinds.has(slot.expectedOutcome?.kind) || !text(slot.expectedOutcome?.resolution) || !surfaces.has(slot.intendedSurface) || !difficulties.has(slot.difficultyIntent)) fail("INVALID_CERTIFICATION_PLANNED_SLOT_SEMANTICS", slot.slotId);
    if (!Array.isArray(slot.materialEvidenceOrConstraintChanged) || !slot.materialEvidenceOrConstraintChanged.length || !slot.materialEvidenceOrConstraintChanged.every((value) => text(value) && value.length > 3) || !text(slot.questionIntent) || slot.questionIntent.length < 18 || !text(slot.decisiveBoundary) || slot.decisiveBoundary.length < 20 || !Array.isArray(slot.overlapExclusions) || !slot.overlapExclusions.length || !["high_provider_documentation_volatility", "medium_product_version_drift"].includes(slot.maintenanceRisk) || (slot.errorModelOrFailureMode !== null && (!text(slot.errorModelOrFailureMode) || slot.errorModelOrFailureMode.length < 18)) || (slot.transferBoundary !== null && (!text(slot.transferBoundary) || slot.transferBoundary.length < 18)) || (["transfer_under_changed_constraints"].includes(slot.learningOperation) && slot.transferBoundary === null)) fail("INCOMPLETE_CERTIFICATION_PLANNED_SLOT", slot.slotId);
    const brief = briefs.find((entry) => entry.trackId === slot.trackId); if (!brief || !Array.isArray(slot.eligibleModes) || !slot.eligibleModes.length || slot.eligibleModes.some((mode) => !brief.validModes.includes(mode)) || slot.deliveryInteraction?.familyContract !== "certification" || slot.deliveryInteraction?.interactionType !== "choice" || slot.deliveryInteraction?.status !== "existing_supported_but_not_runtime_admitted") fail("UNSUPPORTED_CERTIFICATION_PLANNED_SLOT_MODE", slot.slotId);
    const official = slot.sourceRequirements?.officialObjective; const direct = slot.sourceRequirements?.directFirstPartyDocumentation; if (!official || official.registryRef !== `config/certification-objective-registries/${slot.trackId}.json` || JSON.stringify([...official.objectiveRefs].sort()) !== JSON.stringify([...slot.officialObjectiveRefs].sort()) || !Array.isArray(direct) || !direct.length || (slot.sourceRequirements.unresolvedRequirements ?? []).length) fail("UNRESOLVED_CERTIFICATION_PLANNED_SLOT_SOURCE", slot.slotId);
    for (const requirement of direct) { if (requirement.resolutionState !== "resolved_checked_2026_08_11" || !Array.isArray(requirement.testedProperties) || !requirement.testedProperties.length || !Array.isArray(requirement.sourceRefs) || !requirement.sourceRefs.length) fail("INVALID_CERTIFICATION_PLANNED_SLOT_SOURCE", slot.slotId); for (const sourceId of requirement.sourceRefs) { const source = sourceRecords.get(sourceId); if (!source || source.sourceType !== "direct_first_party_product_documentation" || !text(source.title) || !text(source.url) || !/^https:\/\//.test(source.url) || !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedDate) || source.checkedDate !== "2026-08-11" || !text(source.sourceVolatility) || !text(source.versionContext) || source.resolutionState !== "resolved_exact_first_party" || !registry.firstPartyDocumentationHosts.includes(sourceHost(source.url)) || !Array.isArray(source.authoritativeFor) || requirement.testedProperties.some((property) => !source.authoritativeFor.includes(property))) fail("INVALID_CERTIFICATION_PLANNED_SLOT_SOURCE", `${slot.slotId}/${sourceId}`); } }
    const expected = dedupeFingerprint(slot); if (slot.dedupeFingerprint !== expected) fail("CERTIFICATION_PLANNED_SLOT_FINGERPRINT_MISMATCH", slot.slotId); if (fingerprints.has(expected)) fail("DUPLICATE_CERTIFICATION_PLANNED_SLOT_FINGERPRINT", slot.slotId); fingerprints.add(expected);
    if (!Array.isArray(slot.neighborDistinctness) || !slot.neighborDistinctness.length || slot.neighborDistinctness.some((neighbor) => !text(neighbor.neighborSlotId) || !text(neighbor.explanation) || neighbor.explanation.length < 70 || !/changes|changed/i.test(neighbor.explanation) || !/resolves|outcome|decision|classification|procedure|diagnosis/i.test(neighbor.explanation))) fail("INVALID_CERTIFICATION_PLANNED_SLOT_NEIGHBOR", slot.slotId);
  }
  for (const slot of slots) for (const neighbor of slot.neighborDistinctness) { const target = slots.find((candidate) => candidate.slotId === neighbor.neighborSlotId); if (neighbor.neighborSlotId === slot.slotId || !target || target.coverageTargetId !== slot.coverageTargetId || !slot.materialEvidenceOrConstraintChanged.some((evidence) => neighbor.explanation.includes(evidence)) || !target.materialEvidenceOrConstraintChanged.some((evidence) => neighbor.explanation.includes(evidence)) || !neighbor.explanation.includes(slot.expectedOutcome.kind) || !neighbor.explanation.includes(target.expectedOutcome.kind)) fail("INVALID_CERTIFICATION_PLANNED_SLOT_NEIGHBOR", slot.slotId); }
  for (const [key, ref] of refs) { const owned = slots.filter((slot) => `${slot.trackId}/${slot.nodeId}/${slot.blockId}/${slot.coverageTargetId}` === key); if (owned.length) { const covered = [...new Set(owned.flatMap((slot) => slot.officialObjectiveRefs))].sort(); if (JSON.stringify(covered) !== JSON.stringify([...ref.target.officialObjectiveRefs].sort())) fail("INVALID_CERTIFICATION_PLANNED_SLOT_OBJECTIVES", `${ref.target.coverageTargetId} lacks exact objective coverage.`); } }
  for (const pair of pilotPairs) for (const ref of refs.values()) if (`${ref.curriculum.trackId}/${ref.node.nodeId}` === pair && !slots.some((slot) => slot.coverageTargetId === ref.target.coverageTargetId)) fail("MISSING_CERTIFICATION_PLANNED_SLOT_TARGET", ref.target.coverageTargetId);
  const counts = derived(slots);
  return { slots, counts, sourceRecordCount: sourceRecords.size, runtimeReachability: { admitted: false, proof: "Candidate plans are confined to evidence/certification/planned-item-slots and are not discovered by publishing or runtime loaders." } };
}
export async function loadAndValidateCertificationPlannedSlotPlans(options = {}) { const plans = await loadCertificationPlannedSlotPlans(options); return validateCertificationPlannedSlotPlans(plans, options); }
