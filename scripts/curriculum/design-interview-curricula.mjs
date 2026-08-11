import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const required = ["schemaVersion", "curriculumVersion", "trackId", "familyId", "trackBriefReference", "freeNodeId", "sourceRecords", "sourcePolicy", "nodes", "blockPlans", "targetPlans", "slots", "crossNodeRelationships", "modeFeasibility", "admission", "authoring"];
const retired = new Set(["learningBlocks", "sourceBasis", "targetItemCount", "authoringItemCount", "existingVerifiedItemCount", "requiredVariantCount", "operationVariantCounts", "variantCountRationale", "scenarioOrSurfaceVariationAxes", "modePoolPlans", "simulationOrCasePoolPlans", "candidateNodeSlotCounts", "aggregateProjection", "retiredAggregateCount", "candidatePedagogicalRoles", "candidateTechnicalSourceRefs", "directSourceAnchorRefs", "sourceRefs"]);
const designSchema = JSON.parse(readFileSync(fileURLToPath(new URL("../../schemas/curriculum/design-interview-curriculum.schema.json", import.meta.url)), "utf8"));
const fail = (code, message) => { const error = new Error(`${code}: ${message}`); error.code = code; throw error; };
const unique = (values, label) => { if (new Set(values).size !== values.length) fail("DUPLICATE_DESIGN_CANONICAL_ID", label); };
const text = (value, label) => { if (typeof value !== "string" || !value.trim()) fail("INVALID_DESIGN_TEXT", label); };
const semanticFingerprint = (slot) => createHash("sha256").update(JSON.stringify({ trackId: slot.trackId, nodeId: slot.nodeId, blockId: slot.blockId, coverageTargetId: slot.coverageTargetId, directSkillOrDecisionAtomId: slot.directSkillOrDecisionAtomId, expectedOutcome: slot.expectedOutcome, decisiveBoundary: slot.decisiveBoundary, transferBoundary: slot.transferBoundary, materialEvidenceOrConstraintChanged: slot.materialEvidenceOrConstraintChanged })).digest("hex");

function assertClosedSchema(schema, path = "schema") {
  if (!schema || typeof schema !== "object") return;
  if (schema.type === "object" && schema.additionalProperties !== false) fail("INVALID_DESIGN_SCHEMA_CONTRACT", `${path} must close its declaration surface.`);
  if (schema.properties) for (const [key, child] of Object.entries(schema.properties)) assertClosedSchema(child, `${path}.properties.${key}`);
  if (schema.items) assertClosedSchema(schema.items, `${path}.items`);
}

function validateSchema(value, schema, path = "curriculum") {
  if (Array.isArray(schema.type)) {
    const alternatives = schema.type.map((type) => ({ ...schema, type }));
    let lastError;
    for (const alternative of alternatives) try { validateSchema(value, alternative, path); return; } catch (error) { lastError = error; }
    throw lastError;
  }
  if (schema.const !== undefined && value !== schema.const) fail("INVALID_DESIGN_SCHEMA", `${path} must equal ${JSON.stringify(schema.const)}.`);
  if (schema.enum && !schema.enum.includes(value)) fail("INVALID_DESIGN_SCHEMA", `${path} must be one of ${schema.enum.join(", ")}.`);
  if (schema.type === "object") {
    if (!value || Array.isArray(value) || typeof value !== "object") fail("INVALID_DESIGN_SCHEMA", `${path} must be an object.`);
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) fail("INVALID_DESIGN_SCHEMA", `${path}.${key} is required.`);
    if (schema.additionalProperties === false) for (const key of Object.keys(value)) if (!Object.hasOwn(schema.properties ?? {}, key)) fail("INVALID_DESIGN_SCHEMA", `${path}.${key} is not declared by the Design schema.`);
    for (const [key, child] of Object.entries(schema.properties ?? {})) if (Object.hasOwn(value, key)) validateSchema(value[key], child, `${path}.${key}`);
  }
  if (schema.type === "array") {
    if (!Array.isArray(value)) fail("INVALID_DESIGN_SCHEMA", `${path} must be an array.`);
    if (schema.minItems !== undefined && value.length < schema.minItems) fail("INVALID_DESIGN_SCHEMA", `${path} must contain at least ${schema.minItems} entries.`);
    if (schema.items) value.forEach((entry, index) => validateSchema(entry, schema.items, `${path}[${index}]`));
  }
  if (schema.type === "string" && (typeof value !== "string" || (schema.minLength && value.length < schema.minLength))) fail("INVALID_DESIGN_SCHEMA", `${path} must be a non-empty string.`);
  if (schema.type === "number" && (typeof value !== "number" || !Number.isFinite(value))) fail("INVALID_DESIGN_SCHEMA", `${path} must be a finite number.`);
  if (schema.type === "boolean" && typeof value !== "boolean") fail("INVALID_DESIGN_SCHEMA", `${path} must be a boolean.`);
  if (schema.type === "null" && value !== null) fail("INVALID_DESIGN_SCHEMA", `${path} must be null.`);
  if (schema.not && schema.not.anyOf?.some((condition) => condition.required?.every((key) => Object.hasOwn(value, key)))) fail("INVALID_DESIGN_SCHEMA", `${path} contains a retired declaration surface.`);
  if (schema.not?.const !== undefined && value === schema.not.const) fail("INVALID_DESIGN_SCHEMA", `${path} contains a prohibited value.`);
}

function rejectRetired(value, path = "curriculum") {
  if (Array.isArray(value)) return value.forEach((entry, index) => rejectRetired(entry, `${path}[${index}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value)) { if (retired.has(key) || /^candidate/i.test(key)) fail("RETIRED_DESIGN_DECLARATION_SURFACE", `${path}.${key}`); rejectRetired(entry, `${path}.${key}`); }
}

function rejectUnanchoredDirectProvenance(curriculum) {
  for (const source of curriculum.sourceRecords ?? []) if (source?.verificationStatus === "exact_direct_verified") fail("DESIGN_DIRECT_SOURCE_PROVENANCE_NOT_ADMITTED", `${source.sourceId ?? "unknown-source"} self-attests exact direct verification without a separately anchored Design family source registry.`);
  for (const slot of curriculum.slots ?? []) if (slot?.sourceRequirements && Object.hasOwn(slot.sourceRequirements, "directSourceRefs")) fail("DESIGN_DIRECT_SOURCE_PROVENANCE_NOT_ADMITTED", `${slot.slotId ?? "unknown-slot"} declares directSourceRefs before a separately anchored Design family source registry exists.`);
}

export function validateDesignInterviewCurriculum(curriculum, { brief }) {
  assertClosedSchema(designSchema);
  rejectUnanchoredDirectProvenance(curriculum);
  validateSchema(curriculum, designSchema);
  required.forEach((field) => { if (!Object.hasOwn(curriculum, field)) fail("MISSING_DESIGN_CURRICULUM_FIELD", `${curriculum.trackId}.${field}`); });
  rejectRetired(curriculum);
  if (curriculum.schemaVersion !== "patternly-design-interview-curriculum-v1" || curriculum.curriculumVersion !== "2026.08.11" || curriculum.familyId !== "design_interview") fail("INVALID_DESIGN_CURRICULUM_VERSION", curriculum.trackId);
  if (curriculum.trackId !== brief.trackId || curriculum.trackBriefReference !== `docs/track-briefs/${brief.trackId}.json` || curriculum.freeNodeId !== brief.freeNodeId) fail("DESIGN_CURRICULUM_BRIEF_MISMATCH", curriculum.trackId);
  for (const collection of [curriculum.nodes, curriculum.blockPlans, curriculum.targetPlans, curriculum.slots, curriculum.crossNodeRelationships, curriculum.modeFeasibility]) if (!Array.isArray(collection)) fail("INVALID_DESIGN_CURRICULUM_SHAPE", curriculum.trackId);
  unique(curriculum.nodes.map((node) => node.nodeId), "node IDs"); unique(curriculum.blockPlans.map((block) => block.blockId), "block IDs"); unique(curriculum.targetPlans.map((target) => target.coverageTargetId), "target IDs"); unique(curriculum.slots.map((slot) => slot.slotId), "slot IDs"); unique(curriculum.slots.map((slot) => slot.dedupeFingerprint), "slot fingerprints");
  const nodes = new Map(curriculum.nodes.map((node) => [node.nodeId, node])); const blocks = new Map(curriculum.blockPlans.map((block) => [block.blockId, block])); const targets = new Map(curriculum.targetPlans.map((target) => [target.coverageTargetId, target]));
  if (curriculum.nodes.filter((node) => node.nodeId === curriculum.freeNodeId && node.freeOrPremiumRole === "free").length !== 1 || curriculum.nodes.filter((node) => node.freeOrPremiumRole === "free").length !== 1) fail("INVALID_DESIGN_FREE_NODE", curriculum.trackId);
  for (const node of curriculum.nodes) {
    if (node.packageOwnership !== "whole_node_package" || !["free", "premium"].includes(node.freeOrPremiumRole) || !Array.isArray(node.blockIds) || node.slotCount !== curriculum.slots.filter((slot) => slot.nodeId === node.nodeId).length || node.blockIds.some((id) => blocks.get(id)?.nodeId !== node.nodeId)) fail("INVALID_DESIGN_NODE_OWNERSHIP", node.nodeId);
    if (!Array.isArray(node.prerequisiteNodeIds) || node.prerequisiteNodeIds.some((id) => !nodes.has(id))) fail("INVALID_DESIGN_NODE_PREREQUISITE", node.nodeId);
  }
  for (const block of curriculum.blockPlans) if (!nodes.has(block.nodeId) || block.blockKind !== "design_decision_block" || !Array.isArray(block.coverageTargetIds) || !Array.isArray(block.slotIds) || block.slotCount !== curriculum.slots.filter((slot) => slot.blockId === block.blockId).length || block.coverageTargetIds.some((id) => targets.get(id)?.blockId !== block.blockId)) fail("INVALID_DESIGN_BLOCK_OWNERSHIP", block.blockId);
  for (const target of curriculum.targetPlans) if (!nodes.has(target.nodeId) || !blocks.has(target.blockId) || blocks.get(target.blockId).nodeId !== target.nodeId || !Array.isArray(target.slotIds) || target.slotCount !== curriculum.slots.filter((slot) => slot.coverageTargetId === target.coverageTargetId).length || target.slotIds.some((id) => !curriculum.slots.some((slot) => slot.slotId === id))) fail("INVALID_DESIGN_TARGET_OWNERSHIP", target.coverageTargetId);
  const sources = new Map(curriculum.sourceRecords.map((source) => [source.sourceId, source])); const sourceIds = new Set(sources.keys()); unique([...sourceIds], "source IDs");
  for (const slot of curriculum.slots) {
    if (slot.trackId !== curriculum.trackId || !nodes.has(slot.nodeId) || !blocks.has(slot.blockId) || !targets.has(slot.coverageTargetId) || blocks.get(slot.blockId).nodeId !== slot.nodeId || targets.get(slot.coverageTargetId).nodeId !== slot.nodeId || targets.get(slot.coverageTargetId).blockId !== slot.blockId || targets.get(slot.coverageTargetId).directSkillOrDecisionAtomId !== slot.directSkillOrDecisionAtomId) fail("INVALID_DESIGN_SLOT_OWNERSHIP", slot.slotId);
    text(slot.slotId, "slotId"); text(slot.directSkillOrDecisionAtomId, "atom"); if (!slot.expectedOutcome || !Array.isArray(slot.materialEvidenceOrConstraintChanged) || !slot.materialEvidenceOrConstraintChanged.length || slot.deliveryInteraction?.familyContract !== "design_interview" || slot.deliveryInteraction?.interactionType !== null || !String(slot.deliveryInteraction?.status ?? "").startsWith("blocked_")) fail("INVALID_DESIGN_SLOT_ADMISSION", slot.slotId);
    const inventoryRefs = slot.sourceRequirements?.sourceInventoryRefs ?? [];
    if (!Array.isArray(inventoryRefs) || inventoryRefs.some((id) => !sourceIds.has(id) || sources.get(id).verificationStatus === "exact_direct_verified")) fail("INVALID_DESIGN_SLOT_SOURCE_INVENTORY", slot.slotId);
    if (slot.authoringStatus && slot.authoringStatus !== "not_admitted") fail("INVALID_DESIGN_SLOT_AUTHORING", slot.slotId);
    if (slot.dedupeFingerprint !== semanticFingerprint(slot)) fail("DESIGN_SLOT_FINGERPRINT_MISMATCH", slot.slotId);
  }
  const expectedEdges = new Set(curriculum.nodes.flatMap((node) => node.prerequisiteNodeIds.map((from) => `${from}→${node.nodeId}`))); const actualEdges = new Set(curriculum.crossNodeRelationships.map((edge) => `${edge.fromNodeId}→${edge.toNodeId}`));
  if (actualEdges.size !== curriculum.crossNodeRelationships.length || actualEdges.size !== expectedEdges.size || [...expectedEdges].some((edge) => !actualEdges.has(edge))) fail("DESIGN_PREREQUISITE_GRAPH_MISMATCH", curriculum.trackId);
  for (const edge of curriculum.crossNodeRelationships) {
    if (edge.relationshipId !== `${edge.fromNodeId}→${edge.toNodeId}` || !nodes.has(edge.fromNodeId) || !nodes.has(edge.toNodeId) || edge.fromNodeId === edge.toNodeId || (edge.kind !== undefined && edge.kind !== "prerequisite_and_transfer")) fail("INVALID_DESIGN_RELATIONSHIP", edge.relationshipId ?? curriculum.trackId);
    const hasAnchors = [edge.fromBlockId, edge.fromAtomId, edge.toBlockId, edge.toAtomId].some((value) => value !== undefined);
    if (!hasAnchors) continue;
    if (![edge.fromBlockId, edge.fromAtomId, edge.toBlockId, edge.toAtomId].every((value) => typeof value === "string" && value.trim())) fail("INVALID_DESIGN_RELATIONSHIP_ANCHOR", edge.relationshipId);
    const fromBlock = blocks.get(edge.fromBlockId); const toBlock = blocks.get(edge.toBlockId);
    if (!fromBlock || !toBlock || fromBlock.nodeId !== edge.fromNodeId || toBlock.nodeId !== edge.toNodeId) fail("INVALID_DESIGN_RELATIONSHIP_ANCHOR", edge.relationshipId);
    const fromTarget = curriculum.targetPlans.find((target) => target.blockId === edge.fromBlockId && target.directSkillOrDecisionAtomId === edge.fromAtomId);
    const toTarget = curriculum.targetPlans.find((target) => target.blockId === edge.toBlockId && target.directSkillOrDecisionAtomId === edge.toAtomId);
    if (!fromTarget || !toTarget) fail("INVALID_DESIGN_RELATIONSHIP_ATOM", edge.relationshipId);
  }
  for (const mode of curriculum.modeFeasibility) if (!brief.validModes.includes(mode.modeId) || (mode.executableCapacity !== undefined && mode.executableCapacity !== 0) || (mode.runtimeAdmittedItemCount !== undefined && mode.runtimeAdmittedItemCount !== 0)) fail("INVALID_DESIGN_MODE_FEASIBILITY", mode.modeId);
  if (curriculum.admission.learnerFacingContentIncluded !== false || curriculum.admission.questionsAuthored !== 0 || curriculum.admission.runtimeAdmission !== "not_admitted" || curriculum.admission.publishingAdmission !== "not_admitted" || curriculum.authoring.status !== "not_admitted" || curriculum.authoring.firstSafeBatch !== null) fail("INVALID_DESIGN_ADMISSION", curriculum.trackId);
  return curriculum;
}
