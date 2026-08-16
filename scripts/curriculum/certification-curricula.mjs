import { createHash } from "node:crypto";

const required = ["schemaVersion", "curriculumVersion", "trackId", "familyId", "trackBriefReference", "officialObjectiveRegistryRef", "freeNodeId", "sourceRecords", "nodes", "crossNodeRelationships", "blockPlans", "targetPlans", "slots", "objectiveAndDomainOwnership", "modeFeasibility", "examSimulationBlueprint", "targetItemCount", "existingVerifiedItemCount", "authoringItemCount", "admission", "promotionProvenance", "contentFingerprint"];
const fail = (code, message) => { const error = new Error(`${code}: ${message}`); error.code = code; throw error; };
const unique = (values, label) => { if (new Set(values).size !== values.length) fail("DUPLICATE_CERTIFICATION_CANONICAL_ID", label); };
const fingerprint = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export function validateCertificationCurriculum(curriculum, { brief, registry }) {
  for (const field of required) if (!Object.hasOwn(curriculum, field)) fail("MISSING_CERTIFICATION_CURRICULUM_FIELD", `${curriculum.trackId}.${field}`);
  const allowedVersion = curriculum.curriculumVersion === "2026.08.11" || (["microsoft-azure-ai-fundamentals-ai-901", "microsoft-azure-administrator-associate-az-104"].includes(curriculum.trackId) && curriculum.curriculumVersion === "2026.08.15");
  if (curriculum.schemaVersion !== "patternly-certification-curriculum-v1" || !allowedVersion || curriculum.familyId !== "certification") fail("INVALID_CERTIFICATION_CURRICULUM_VERSION", curriculum.trackId);
  if (curriculum.trackId !== brief.trackId || curriculum.freeNodeId !== brief.freeNodeId || curriculum.officialObjectiveRegistryRef !== registry.__registryPath) fail("CERTIFICATION_CURRICULUM_BRIEF_MISMATCH", curriculum.trackId);
  if (!Array.isArray(curriculum.slots) || !curriculum.slots.length || curriculum.targetItemCount !== curriculum.slots.length || curriculum.existingVerifiedItemCount !== 0 || curriculum.authoringItemCount !== curriculum.slots.length) fail("INVALID_CERTIFICATION_SLOT_ACCOUNTING", curriculum.trackId);
  unique(curriculum.sourceRecords.map((source) => source.sourceId), `${curriculum.trackId} source IDs`); unique(curriculum.nodes.map((node) => node.nodeId), `${curriculum.trackId} nodes`); unique(curriculum.blockPlans.map((block) => block.blockId), `${curriculum.trackId} blocks`); unique(curriculum.targetPlans.map((target) => target.coverageTargetId), `${curriculum.trackId} targets`); unique(curriculum.slots.map((slot) => slot.slotId), `${curriculum.trackId} slots`); unique(curriculum.slots.map((slot) => slot.dedupeFingerprint), `${curriculum.trackId} fingerprints`);
  const nodeIds = new Set(curriculum.nodes.map((node) => node.nodeId)); const blocks = new Map(curriculum.blockPlans.map((block) => [block.blockId, block])); const targets = new Map(curriculum.targetPlans.map((target) => [target.coverageTargetId, target])); const objectives = new Set(registry.objectives.map((objective) => objective.objectiveId)); const domains = new Set(registry.domains.map((domain) => domain.domainId)); const sources = new Map(curriculum.sourceRecords.map((source) => [source.sourceId, source]));
  for (const node of curriculum.nodes) if (!nodeIds.has(node.nodeId) || !["free", "premium"].includes(node.freeOrPremiumRole) || !Array.isArray(node.blockIds) || node.slotCount !== curriculum.slots.filter((slot) => slot.nodeId === node.nodeId).length) fail("INVALID_CERTIFICATION_NODE_OWNERSHIP", node.nodeId);
  if (curriculum.nodes.filter((node) => node.nodeId === curriculum.freeNodeId && node.freeOrPremiumRole === "free").length !== 1) fail("INVALID_CERTIFICATION_FREE_NODE", curriculum.trackId);
  for (const target of curriculum.targetPlans) if (!nodeIds.has(target.nodeId) || !blocks.has(target.blockId) || !Array.isArray(target.slotIds) || target.slotCount !== target.slotIds.length) fail("INVALID_CERTIFICATION_TARGET_PLAN", target.coverageTargetId);
  for (const slot of curriculum.slots) {
    if (!nodeIds.has(slot.nodeId) || !blocks.has(slot.blockId) || !targets.has(slot.coverageTargetId) || !slot.officialObjectiveRefs?.length || slot.officialObjectiveRefs.some((id) => !objectives.has(id)) || !domains.has(slot.primarySimulationDomainId) || !slot.officialObjectiveRefs.includes(slot.primarySimulationObjectiveRef) || slot.deliveryInteraction?.interactionType !== "choice" || !slot.sourceRequirements?.directFirstPartyDocumentation?.length || slot.sourceRequirements.unresolvedRequirements?.length) fail("INVALID_CERTIFICATION_SLOT", slot.slotId);
    for (const requirement of slot.sourceRequirements.directFirstPartyDocumentation) {
      for (const sourceRef of requirement.sourceRefs ?? []) {
        const source = sources.get(sourceRef) ?? [...sources.values()].find((candidate) => candidate.url === sourceRef);
        if (!source) {
          try {
            const url = new URL(sourceRef);
            if (url.protocol !== "https:" || !registry.firstPartyDocumentationHosts?.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) fail("INVALID_CERTIFICATION_SLOT_SOURCE", slot.slotId);
          } catch { fail("INVALID_CERTIFICATION_SLOT_SOURCE", slot.slotId); }
        }
      }
    }
  }
  if (curriculum.admission.learnerFacingContentIncluded !== false || curriculum.admission.runtimeAdmission !== "not_admitted" || curriculum.admission.publishingAdmission !== "not_admitted" || curriculum.admission.questionsAuthored !== 0) fail("INVALID_CERTIFICATION_ADMISSION", curriculum.trackId);
  const { promotionProvenance, contentFingerprint, ...payload } = curriculum; if (contentFingerprint !== fingerprint(payload)) fail("CERTIFICATION_CONTENT_FINGERPRINT_MISMATCH", curriculum.trackId);
  return curriculum;
}

export function indexCertificationCurriculum(curriculum) { return Object.freeze({ byNodeId: new Map(curriculum.nodes.map((value) => [value.nodeId, value])), byBlockId: new Map(curriculum.blockPlans.map((value) => [value.blockId, value])), byCoverageTargetId: new Map(curriculum.targetPlans.map((value) => [value.coverageTargetId, value])), bySlotId: new Map(curriculum.slots.map((value) => [value.slotId, value])) }); }
