import { CANONICAL_CERTIFICATION_REGISTRY_TRACK_IDS } from "./certification-objective-registries.mjs";

const expectedTrackIds = CANONICAL_CERTIFICATION_REGISTRY_TRACK_IDS;

export const firstSafeSlotIds = [
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:scenario-decision-01",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:scenario-decision-02",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:scenario-decision-03",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:scenario-decision-04",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:scenario-decision-05",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:scenario-decision-06",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:configuration-sequence-07",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:configuration-sequence-08",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:troubleshooting-effective-state-09",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:troubleshooting-effective-state-10",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:tool-or-iac-11",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:boundary-or-contrast-12",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:boundary-or-contrast-13",
  "microsoft-azure-administrator-associate-az-104:AZ104-N01-B01:identity-and-directory-foundations:slot:boundary-or-contrast-14"
];

const fail = (code, message) => { const error = new Error(`${code}: ${message}`); error.code = code; throw error; };
const unique = (values, code, label) => { if (new Set(values).size !== values.length) fail(code, label); };
const sameSet = (left, right) => left.length === right.length && left.every((value) => right.includes(value));
const sourceIds = (slots, sourceRecords = []) => {
  const idsByUrl = new Map(sourceRecords.map((source) => [source.url, source.sourceId]));
  return [...new Set(slots.flatMap((slot) => slot.sourceRequirements.directFirstPartyDocumentation.flatMap((requirement) => requirement.sourceRefs).map((reference) => idsByUrl.get(reference) ?? reference)))].sort();
};
const referencedSourceIds = (value) => Array.isArray(value) ? value.flatMap(referencedSourceIds) : value && typeof value === "object" ? Object.entries(value).flatMap(([key, entry]) => key === "sourceRef" ? [entry] : key === "sourceRefs" ? entry : referencedSourceIds(entry)) : [];
const supportedModes = new Set(["certification-diagnostic-baseline", "certification-focus-practice", "certification-scenario-practice", "certification-weak-area-review", "certification-mixed-practice", "certification-quick-review", "certification-exam-simulation"]);
const validationCommands = Object.freeze(["npm run validate:curricula", "npm run audit:curricula", "npm test"]);
const humanReviewHandoff = "Later authoring requires factual and editorial approval for every independently authored choice question, complete feedback, content versioning, and immutable publication evidence before package or release work.";

function rejectRetiredDeclarations(value, path = "curriculum") {
  if (Array.isArray(value)) return value.forEach((entry, index) => rejectRetiredDeclarations(entry, `${path}[${index}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value)) {
    if (["candidateNodeSlotCounts", "candidatePracticeForm", "candidateChoiceOnlyPracticeForm", "patternlyPracticeForm", "sourceRefsNeeded", "discardedOrMergedCandidates", "noAggregateOperationAccounting", "requiredVariantCount", "operationVariantCounts", "candidateNodes", "boundaryRelationshipRemap", "derivedCounts"].includes(key)) fail("CERTIFICATION_PROMOTION_RETIRED_DECLARATION", `${path}.${key}`);
    rejectRetiredDeclarations(entry, `${path}.${key}`);
  }
}

function assertAcyclicPrerequisites(curriculum, nodesById) {
  const visiting = new Set(), visited = new Set();
  const visit = (nodeId) => {
    if (visiting.has(nodeId)) fail("CERTIFICATION_PROMOTION_CYCLIC_PREREQUISITES", `${curriculum.trackId}/${nodeId}`);
    if (visited.has(nodeId)) return;
    const node = nodesById.get(nodeId);
    if (!node || !Array.isArray(node.prerequisiteNodeIds) || node.prerequisiteNodeIds.some((id) => !nodesById.has(id))) fail("CERTIFICATION_PROMOTION_PREREQUISITE_REFERENCE", `${curriculum.trackId}/${nodeId}`);
    visiting.add(nodeId); node.prerequisiteNodeIds.forEach(visit); visiting.delete(nodeId); visited.add(nodeId);
  };
  curriculum.nodes.forEach((node) => visit(node.nodeId));
}

function validateTrack(curriculum, registry) {
  rejectRetiredDeclarations(curriculum);
  const slotsById = new Map(curriculum.slots.map((slot) => [slot.slotId, slot]));
  const blocksById = new Map(curriculum.blockPlans.map((block) => [block.blockId, block]));
  const targetsById = new Map(curriculum.targetPlans.map((target) => [target.coverageTargetId, target]));
  const nodesById = new Map(curriculum.nodes.map((node) => [node.nodeId, node]));
  const sourceRecordIds = new Set(curriculum.sourceRecords.map((source) => source.sourceId));
  const officialSourceIds = new Set(registry.sources.map((source) => source.sourceId));
  const domainIds = new Set(registry.domains.map((domain) => domain.domainId));
  assertAcyclicPrerequisites(curriculum, nodesById);

  for (const node of curriculum.nodes) {
    const actualBlocks = curriculum.blockPlans.filter((block) => block.nodeId === node.nodeId).map((block) => block.blockId).sort();
    if (!sameSet([...node.blockIds].sort(), actualBlocks)) fail("CERTIFICATION_PROMOTION_NODE_BLOCK_OWNERSHIP", `${curriculum.trackId}/${node.nodeId}`);
  }
  for (const block of curriculum.blockPlans) {
    const slots = curriculum.slots.filter((slot) => slot.blockId === block.blockId);
    const targets = curriculum.targetPlans.filter((target) => target.blockId === block.blockId);
    if (!nodesById.has(block.nodeId) || !sameSet([...block.coverageTargetIds].sort(), targets.map((target) => target.coverageTargetId).sort()) || !sameSet([...block.slotIds].sort(), slots.map((slot) => slot.slotId).sort()) || block.slotCount !== slots.length) fail("CERTIFICATION_PROMOTION_BLOCK_RECONCILIATION", `${curriculum.trackId}/${block.blockId}`);
  }
  for (const target of curriculum.targetPlans) {
    const slots = curriculum.slots.filter((slot) => slot.coverageTargetId === target.coverageTargetId);
    const declaredSources = target.sourceRefs;
    const slotObjectives = [...new Set(slots.flatMap((slot) => slot.officialObjectiveRefs))].sort();
    if (!blocksById.has(target.blockId) || !nodesById.has(target.nodeId) || !sameSet([...target.slotIds].sort(), slots.map((slot) => slot.slotId).sort()) || target.slotCount !== slots.length || !sameSet([...target.officialObjectiveRefs].sort(), slotObjectives) || slots.some((slot) => slot.nodeId !== target.nodeId || slot.blockId !== target.blockId || slot.directSkillOrDecisionAtomId !== target.directSkillOrDecisionAtomId || slot.officialObjectiveRefs.some((objective) => !target.officialObjectiveRefs.includes(objective)))) fail("CERTIFICATION_PROMOTION_TARGET_RECONCILIATION", `${curriculum.trackId}/${target.coverageTargetId}`);
    const slotSources = sourceIds(slots, curriculum.sourceRecords);
    if (!Array.isArray(declaredSources) || !declaredSources.length || declaredSources.some((id) => !sourceRecordIds.has(id)) || declaredSources.some((id) => !slotSources.includes(id))) fail("CERTIFICATION_PROMOTION_TARGET_SOURCE_OWNERSHIP", `${curriculum.trackId}/${target.coverageTargetId}`);
  }
  for (const slot of curriculum.slots) {
    if (!blocksById.has(slot.blockId) || !targetsById.has(slot.coverageTargetId) || !nodesById.has(slot.nodeId) || slot.deliveryInteraction?.familyContract !== "certification" || slot.deliveryInteraction?.interactionType !== "choice" || slot.deliveryInteraction?.status !== "existing_supported_but_not_runtime_admitted" || !slot.eligibleModes?.length || slot.eligibleModes.some((mode) => !supportedModes.has(mode)) || !slot.sourceRequirements?.directFirstPartyDocumentation?.length) fail("CERTIFICATION_PROMOTION_SLOT_CONTRACT", `${curriculum.trackId}/${slot.slotId}`);
  }
  const activeSourceIds = new Set([...sourceIds(curriculum.slots, curriculum.sourceRecords), ...referencedSourceIds(curriculum.examSimulationBlueprint)]);
  if (curriculum.sourceRecords.some((source) => !Array.isArray(source.authoritativeFor) || !source.authoritativeFor.length || !activeSourceIds.has(source.sourceId))) fail("CERTIFICATION_PROMOTION_UNUSED_OR_EMPTY_SOURCE_AUTHORITY", curriculum.trackId);
  if (!Array.isArray(curriculum.objectiveAndDomainOwnership) || curriculum.objectiveAndDomainOwnership.length !== curriculum.slots.length) fail("CERTIFICATION_PROMOTION_OWNERSHIP_COUNT", curriculum.trackId);
  unique(curriculum.objectiveAndDomainOwnership.map((entry) => entry.slotId), "CERTIFICATION_PROMOTION_OWNERSHIP_DUPLICATE", curriculum.trackId);
  for (const entry of curriculum.objectiveAndDomainOwnership) {
    const slot = slotsById.get(entry.slotId);
    if (!slot || !slot.officialObjectiveRefs.includes(entry.objectiveRef) || !domainIds.has(entry.domainId) || slot.primarySimulationObjectiveRef !== entry.objectiveRef || slot.primarySimulationDomainId !== entry.domainId || !entry.rationale) fail("CERTIFICATION_PROMOTION_OBJECTIVE_OWNERSHIP", `${curriculum.trackId}/${entry.slotId}`);
  }
  const mode = curriculum.modeFeasibility;
  const premiumNodeIds = mode?.premiumNodeIds ?? [mode?.premiumNodeId];
  if (!mode || nodesById.get(mode.freeNodeId)?.freeOrPremiumRole !== "free" || !premiumNodeIds.length || premiumNodeIds.some((nodeId) => nodesById.get(nodeId)?.freeOrPremiumRole !== "premium") || curriculum.slots.some((slot) => !slot.eligibleModes?.length)) fail("CERTIFICATION_PROMOTION_MODE_FEASIBILITY", curriculum.trackId);
  const blueprint = curriculum.examSimulationBlueprint;
  const form = blueprint?.practiceForm;
  const allocation = form?.domainAllocation ?? [];
  const allocationCount = (entry) => entry.itemCount ?? entry.patternlyPracticeAllocation;
  const selectedIds = form?.selectedSlotIds ?? allocation.flatMap((entry) => entry.selectedSlotIds ?? []);
  const expectedCount = form?.itemCount ?? blueprint?.itemCount;
  const activeChoice = form?.activeInteractionType ?? blueprint?.activeInteractionType;
  const profileEvidence = blueprint?.standardExamEvidence ?? blueprint?.officialProfileEvidence ?? Object.entries(blueprint ?? {}).find(([key]) => /^official.+Evidence$|^official.+Profile$/u.test(key))?.[1];
  if (!blueprint?.claim?.includes("provider_faithful") || activeChoice !== "choice" || !Number.isInteger(expectedCount) || expectedCount < 1 || !Array.isArray(allocation) || !allocation.length || allocation.reduce((sum, entry) => sum + allocationCount(entry), 0) !== expectedCount || allocation.some((entry) => !Number.isInteger(allocationCount(entry)) || allocationCount(entry) < 1 || curriculum.objectiveAndDomainOwnership.filter((ownership) => ownership.domainId === entry.domainId).length < allocationCount(entry)) || !profileEvidence || !referencedSourceIds(profileEvidence).length || !referencedSourceIds(profileEvidence).every((id) => sourceRecordIds.has(id) || officialSourceIds.has(id)) || (selectedIds.length && (!sameSet([...selectedIds].sort(), [...new Set(selectedIds)].sort()) || selectedIds.length !== expectedCount || selectedIds.some((id) => !slotsById.has(id))))) fail("CERTIFICATION_PROMOTION_BLUEPRINT", curriculum.trackId);
  if (curriculum.targetItemCount !== curriculum.slots.length || curriculum.authoringItemCount !== curriculum.slots.length || curriculum.existingVerifiedItemCount !== 0 || curriculum.admission?.learnerFacingContentIncluded !== false || curriculum.admission?.runtimeAdmission !== "not_admitted" || curriculum.admission?.publishingAdmission !== "not_admitted" || curriculum.admission?.questionsAuthored !== 0) fail("CERTIFICATION_PROMOTION_NON_RUNTIME_ACCOUNTING", curriculum.trackId);
}

export function buildCertificationAuthoringBacklog(curricula) {
  const batches = [];
  for (const curriculum of [...curricula].sort((left, right) => expectedTrackIds.indexOf(left.trackId) - expectedTrackIds.indexOf(right.trackId))) {
    const reserved = new Set(curriculum.trackId === "microsoft-azure-administrator-associate-az-104" ? firstSafeSlotIds : []);
    const append = (slots, batchId, reviewBoundary = `One subject-matter reviewer validates the complete ${slots[0].blockId} slot group against its direct first-party sources and target-specific decision boundaries.`, batchSizeReason = slots.length >= 8 && slots.length <= 20 ? "The complete canonical block is a reviewable authoring group without padding or cross-boundary merging." : `The complete canonical ${slots[0].blockId} decision group has ${slots.length} slots; it cannot be padded or merged without weakening its factual review boundary.`) => batches.push({ batchId, trackId: curriculum.trackId, nodeId: slots[0].nodeId, blockIds: [...new Set(slots.map((slot) => slot.blockId))].sort(), slotIds: slots.map((slot) => slot.slotId), coverageTargetIds: [...new Set(slots.map((slot) => slot.coverageTargetId))].sort(), objectiveRefs: [...new Set(slots.flatMap((slot) => slot.officialObjectiveRefs))].sort(), sourceRefs: sourceIds(slots, curriculum.sourceRecords), forbiddenOverlap: [...new Set(slots.flatMap((slot) => slot.overlapExclusions))].sort(), reviewBoundary, plannedItemCount: slots.length, batchSizeStatus: slots.length >= 8 && slots.length <= 20 ? "normal_coherent_slot_group" : "semantic_exception", batchSizeReason, executionStatus: "planned_not_authorable_until_track_taxonomy_source_release_contract", validationCommands, humanReviewHandoff });
    if (reserved.size) { const slots = firstSafeSlotIds.map((id) => curriculum.slots.find((slot) => slot.slotId === id)); if (slots.some((slot) => !slot)) fail("CERTIFICATION_PROMOTION_FIRST_BATCH_MISSING", curriculum.trackId); append(slots, "microsoft-azure-administrator-associate-az-104:azure-administration-scope-and-control-surfaces", "One Azure administration reviewer verifies resource hierarchy and provider/region/API boundaries together with the supported management surface and control-plane/data-plane distinctions against the seven named Microsoft sources.", "Thirteen resolved Free-node slots form one reviewable Azure administration foundation without filler or a whole-block quota."); }
    for (const block of curriculum.blockPlans) {
      const slots = curriculum.slots.filter((slot) => slot.blockId === block.blockId && !reserved.has(slot.slotId));
      for (let index = 0; index < slots.length; index += 20) append(slots.slice(index, index + 20), `${curriculum.trackId}:${block.blockId}:${Math.floor(index / 20) + 1}`);
    }
  }
  const ids = batches.flatMap((batch) => batch.slotIds);
  const canonicalSlotIds = curricula.flatMap((curriculum) => curriculum.slots.map((slot) => slot.slotId));
  if (ids.length !== canonicalSlotIds.length || !sameSet([...ids].sort(), canonicalSlotIds.sort())) fail("CERTIFICATION_PROMOTION_BACKLOG_PARTITION", "all canonical slots must appear once");
  return batches;
}

export function validateCertificationPromotion(curricula, registries) {
  const certifications = curricula.filter((curriculum) => curriculum.familyId === "certification");
  if (!sameSet(certifications.map((curriculum) => curriculum.trackId).sort(), [...expectedTrackIds].sort())) fail("CERTIFICATION_PROMOTION_TRACK_SET", `exactly ${expectedTrackIds.length} direct canonical certification configs are required`);
  const slots = certifications.flatMap((curriculum) => curriculum.slots);
  unique(slots.map((slot) => slot.slotId), "CERTIFICATION_PROMOTION_DUPLICATE_SLOT_ID", "cross-track slot identity");
  unique(slots.map((slot) => slot.dedupeFingerprint), "CERTIFICATION_PROMOTION_DUPLICATE_SEMANTIC_IDENTITY", "cross-track semantic identity");
  for (const curriculum of certifications) { const registry = registries.get(curriculum.trackId); if (!registry) fail("CERTIFICATION_PROMOTION_MISSING_OBJECTIVE_REGISTRY", curriculum.trackId); validateTrack(curriculum, registry); }
  const authoringBatches = buildCertificationAuthoringBacklog(certifications);
  return Object.freeze({ trackCount: certifications.length, slotCount: slots.length, authoringBatches, firstSafeBatch: authoringBatches.find((batch) => batch.batchId === "microsoft-azure-administrator-associate-az-104:azure-administration-scope-and-control-surfaces") });
}
