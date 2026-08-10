import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { TARGET_TRACK_FAMILIES, loadCanonicalTrackBriefs } from "../product/track-briefs.mjs";
import { isCalendarDate, loadCertificationObjectiveRegistries } from "./certification-objective-registries.mjs";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const CURRICULA_DIRECTORY = join(ROOT, "config", "curricula");
export const CURRICULUM_VERSION = "2026.08.09";

const blockKindByFamily = Object.freeze({ coding_interview: "coding_mental_unit", certification: "certification_competency_block", design_interview: "design_decision_block" });
const requiredTrack = ["schemaVersion", "curriculumVersion", "trackId", "familyId", "trackBriefReference", "freeNodeId", "entryPrerequisites", "learnerOutcome", "sourceBasis", "nodes", "crossNodeRelationships", "modePoolPlans", "simulationOrCasePoolPlans", "contentOwnershipRules", "crossTrackOverlapRules", "targetItemCount"];
const requiredNode = ["nodeId", "trackId", "stableLabel", "learnerFacingOutcome", "packageOwnership", "freeOrPremiumRole", "prerequisiteNodeIds", "includedDecisionScope", "explicitExclusions", "officialObjectiveRefs", "learningBlockRefs", "modeRoles", "crossNodeTransferRefs", "sourceAndMaintenancePolicy", "learningBlocks"];
const requiredBlock = ["blockId", "blockKind", "nodeId", "primaryDecisionModel", "learningObjective", "entryKnowledge", "decisiveSignals", "preconditions", "governingMechanismOrInvariant", "legalAndIllegalDecisions", "failureBoundaries", "falseHeuristicsOrMisconceptions", "transferBoundary", "skillOrDecisionAtoms", "supportedLearningOperations", "coverageTargets", "targetItemCount", "countRationale", "modeRoles", "overlapExclusions", "sourceRequirements", "maintenanceRisk"];
const requiredTarget = ["coverageTargetId", "blockId", "primarySkillOrDecisionAtomId", "directSkillOrDecisionAtomIds", "diagnosticDecision", "learningObjective", "decisiveBoundary", "misconceptionOrCompetingDecision", "transferBoundary", "learningOperation", "preferredInteractionContract", "interactionContractStatus", "difficultyIntent", "modeRoles", "scenarioOrSurfaceVariationAxes", "requiredVariantCount", "variantCountRationale", "sourceRequirements", "overlapExclusions"];
const supportedInteractions = Object.freeze({ coding_interview: new Set(["choice", "ordering", "complexity"]), certification: new Set(["choice"]), design_interview: new Set() });
const codingBlockOperations = Object.freeze(["recognition", "selection", "boundary"]);

export class CurriculumValidationError extends Error {
  constructor(code, message) { super(`${code}: ${message}`); this.code = code; }
}
const fail = (code, message) => { throw new CurriculumValidationError(code, message); };
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const assertKeys = (value, keys, label) => { for (const key of keys) if (!Object.hasOwn(value, key)) fail("MISSING_CURRICULUM_FIELD", `${label}.${key} is required.`); };
const assertText = (value, label) => { if (typeof value !== "string" || !value.trim()) fail("INVALID_CURRICULUM_TEXT", `${label} must be non-empty.`); };
const fingerprint = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const status = new Set(["planned_coverage_sufficient", "planned_coverage_insufficient", "blocked_by_contract", "blocked_by_source", "not_applicable"]);

function assertUnique(values, label) { if (new Set(values).size !== values.length) fail("DUPLICATE_CURRICULUM_ID", `${label} must be unique.`); }
const sameRefs = (left, right) => JSON.stringify([...new Set(left)].sort()) === JSON.stringify([...new Set(right)].sort());
function assertCertificationObjectiveBindings(curriculum, registry) {
  if (curriculum.familyId !== "certification" || !registry) return;
  if (curriculum.officialObjectiveRegistryRef !== registry.__registryPath) fail("MISSING_CERTIFICATION_OBJECTIVE_REGISTRY", `${curriculum.trackId} must name its exact repo-relative objective registry.`);
  const objectiveIds = new Set(registry.objectives.map((objective) => objective.objectiveId));
  const sharedPrefix = registry.objectives[0].objectiveId.replace(/\d+(?:\.\d+)?$/, "");
  const assertRefs = (refs, label) => {
    if (!Array.isArray(refs) || !refs.length) fail("UNKNOWN_CERTIFICATION_OBJECTIVE", `${label} requires one or more exact objective refs.`);
    for (const ref of refs) {
      if (ref.startsWith("section-")) fail("REMOVED_CERTIFICATION_OBJECTIVE", `${label} references removed historical objective ${ref}.`);
      if (!ref.startsWith(sharedPrefix)) fail("CERTIFICATION_OBJECTIVE_TRACK_MISMATCH", `${label} references objective ${ref} from another track.`);
      if (!objectiveIds.has(ref)) fail("UNKNOWN_CERTIFICATION_OBJECTIVE", `${label} references unknown objective ${ref}.`);
    }
  };
  const covered = new Set();
  for (const node of curriculum.nodes) {
    const nodeRefs = [];
    for (const block of node.learningBlocks) {
      const blockRefs = [];
      for (const atom of block.skillOrDecisionAtoms) assertRefs(atom.officialObjectiveRefs, `${curriculum.trackId}/${atom.atomId}`);
      for (const target of block.coverageTargets) {
        assertRefs(target.officialObjectiveRefs, `${curriculum.trackId}/${target.coverageTargetId}`);
        const atomRefs = target.directSkillOrDecisionAtomIds.flatMap((atomId) => block.skillOrDecisionAtoms.find((atom) => atom.atomId === atomId).officialObjectiveRefs);
        if (!sameRefs(target.officialObjectiveRefs, atomRefs)) fail("OBJECTIVE_BINDING_DERIVATION_MISMATCH", `${target.coverageTargetId} must equal its direct atom union.`);
        const requirements = target.sourceRequirements;
        const official = requirements?.requirements?.find((requirement) => requirement.requirementType === "official_exam_objective");
        const product = requirements?.requirements?.find((requirement) => requirement.requirementType === "direct_first_party_product_documentation");
        const sourceById = new Map(curriculum.sourceBasis.map((source) => [source.sourceId, source]));
        const productRefs = product?.directFirstPartySourceRefs;
        if (!sameRefs(official?.objectiveRefs ?? [], target.officialObjectiveRefs) || official?.resolvedAtCurriculumStage !== true || !product || product.mustResolveBefore !== "authoring" || !Array.isArray(product.testedMechanismOrProductProperties) || !product.testedMechanismOrProductProperties.length || !Array.isArray(productRefs) || new Set(productRefs).size !== productRefs.length) fail("MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE", `${target.coverageTargetId} has an invalid direct first-party source requirement.`);
        if (product.resolvedAtCurriculumStage === false) { if (requirements.authoringGate !== "blocked_until_all_requirements_resolve" || productRefs.length) fail("MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE", `${target.coverageTargetId} must remain blocked with no unresolved product-source refs.`); }
        else if (product.resolvedAtCurriculumStage === true) {
          if (requirements.authoringGate !== "resolved_for_authoring" || !productRefs.length) fail("MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE", `${target.coverageTargetId} cannot claim authoring readiness without direct product sources.`);
          const coveredMechanisms = new Set();
          for (const sourceId of productRefs) {
            const source = sourceById.get(sourceId); let parsed;
            try { parsed = new URL(source?.url); } catch { fail("MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE", `${target.coverageTargetId} has an unresolved direct product source.`); }
            if (source.sourceKind !== "direct_first_party_product_documentation" || parsed.protocol !== "https:" || !registry.firstPartyDocumentationHosts.includes(parsed.hostname) || !isCalendarDate(source.checkedDate) || !source.version?.trim() || !source.volatility?.trim() || !source.title?.trim() || !Array.isArray(source.mechanismOrProductProperties)) fail("MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE", `${target.coverageTargetId} has an invalid direct product source.`);
            source.mechanismOrProductProperties.forEach((property) => coveredMechanisms.add(property));
          }
          if (product.testedMechanismOrProductProperties.some((property) => !coveredMechanisms.has(property))) fail("MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE", `${target.coverageTargetId} lacks direct documentation for every tested mechanism.`);
        } else fail("MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE", `${target.coverageTargetId} has an invalid direct-product resolution state.`);
        if (target.interactionContractStatus === "existing_supported" && /faithful.*(provider|exam)|provider.*faithful/i.test(JSON.stringify(target))) fail("UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED", `${target.coverageTargetId} cannot claim a provider-faithful simulation.`);
        target.officialObjectiveRefs.forEach((ref) => { covered.add(ref); blockRefs.push(ref); });
      }
      if (!sameRefs(block.officialObjectiveRefs, blockRefs)) fail("OBJECTIVE_BINDING_DERIVATION_MISMATCH", `${block.blockId} must equal its target union.`);
      nodeRefs.push(...blockRefs);
    }
    if (!sameRefs(node.officialObjectiveRefs, nodeRefs)) fail("OBJECTIVE_BINDING_DERIVATION_MISMATCH", `${node.nodeId} must equal its block union.`);
  }
  const exclusions = curriculum.objectiveExclusions ?? [];
  const sourceIds = new Set(registry.sources.map((source) => source.sourceId)); const exclusionReasons = new Set(["provider_scope_removed", "provider_scope_not_assessable", "duplicate_provider_objective"]);
  for (const exclusion of exclusions) { const objective = registry.objectives.find((candidate) => candidate.objectiveId === exclusion.objectiveId); if (!objective || !exclusionReasons.has(exclusion.reasonCode) || !Array.isArray(exclusion.evidenceSourceRefs) || !exclusion.evidenceSourceRefs.length || exclusion.evidenceSourceRefs.some((sourceId) => !sourceIds.has(sourceId)) || typeof exclusion.evidenceBackedRationale !== "string" || exclusion.evidenceBackedRationale.length < 80 || (!exclusion.evidenceBackedRationale.includes(objective.providerLabel) && !exclusion.evidenceBackedRationale.includes(objective.providerObjectiveNumber)) || exclusion.evidenceSourceRefs.some((sourceId) => !exclusion.evidenceBackedRationale.includes(sourceId))) fail("INVALID_OBJECTIVE_EXCLUSION", `${curriculum.trackId} has an invalid objective exclusion.`); }
  for (const objectiveId of objectiveIds) if (!covered.has(objectiveId) && !exclusions.some((exclusion) => exclusion.objectiveId === objectiveId)) fail("UNCOVERED_CERTIFICATION_OBJECTIVE", `${curriculum.trackId} does not cover ${objectiveId}.`);
  if (curriculum.simulationOrCasePoolPlans.some((pool) => pool.simulationClaim !== "patternly_practice_not_provider_faithful")) fail("UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED", `${curriculum.trackId} may offer only a Patternly practice simulation while provider behavior remains undocumented.`);
}
function nodeCount(node) { return node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0); }
function assertVolumeAccounting(value, targetItemCount, label) {
  const existing = value.existingVerifiedItemCount ?? 0;
  const authoring = value.authoringItemCount ?? targetItemCount - existing;
  if (!Number.isInteger(existing) || !Number.isInteger(authoring) || existing < 0 || authoring < 0 || existing + authoring !== targetItemCount) fail("INVALID_VOLUME_ACCOUNTING", `${label} must reconcile verified existing and authoring items to its target.`);
}
function walkAcyclic(nodes) {
  const byId = new Map(nodes.map((node) => [node.nodeId, node])); const visiting = new Set(); const visited = new Set();
  const visit = (id) => { if (visiting.has(id)) fail("CURRICULUM_PREREQUISITE_CYCLE", `Cycle includes ${id}.`); if (visited.has(id)) return; const node = byId.get(id); if (!node) fail("MISSING_CURRICULUM_REFERENCE", `Prerequisite ${id} is absent.`); visiting.add(id); node.prerequisiteNodeIds.forEach(visit); visiting.delete(id); visited.add(id); };
  nodes.forEach((node) => visit(node.nodeId));
}

function assertCertificationRelationshipGraph(curriculum, nodes, order) {
  if (curriculum.familyId !== "certification") return;
  const relationships = curriculum.crossNodeRelationships;
  if (!Array.isArray(relationships)) fail("INVALID_CERTIFICATION_RELATIONSHIP", `${curriculum.trackId} must declare certification relationships.`);
  const nodesById = new Map(nodes.map((node) => [node.nodeId, node]));
  const nodeIds = new Set(nodesById.keys());
  const expectedEdges = new Set(nodes.flatMap((node) => node.prerequisiteNodeIds.map((fromNodeId) => `${fromNodeId}→${node.nodeId}`)));
  const actualEdges = new Set(); const reasons = [];
  for (const relationship of relationships) {
    for (const field of ["relationshipId", "fromNodeId", "toNodeId", "fromBlockId", "toBlockId", "fromAtomId", "toAtomId", "bridgeType", "kind", "reason"]) if (!Object.hasOwn(relationship, field)) fail("MISSING_CERTIFICATION_RELATIONSHIP_FIELD", `${curriculum.trackId} relationship.${field} is required.`);
    assertText(relationship.relationshipId, `${curriculum.trackId} relationshipId`); assertText(relationship.fromNodeId, `${curriculum.trackId} fromNodeId`); assertText(relationship.toNodeId, `${curriculum.trackId} toNodeId`); assertText(relationship.fromBlockId, `${curriculum.trackId} fromBlockId`); assertText(relationship.toBlockId, `${curriculum.trackId} toBlockId`); assertText(relationship.fromAtomId, `${curriculum.trackId} fromAtomId`); assertText(relationship.toAtomId, `${curriculum.trackId} toAtomId`); assertText(relationship.bridgeType, `${curriculum.trackId} bridgeType`); assertText(relationship.kind, `${curriculum.trackId} kind`); assertText(relationship.reason, `${curriculum.trackId} reason`);
    if (!nodeIds.has(relationship.fromNodeId) || !nodeIds.has(relationship.toNodeId)) fail("STALE_CERTIFICATION_RELATIONSHIP_NODE", `${curriculum.trackId}/${relationship.relationshipId} references an absent node.`);
    if (relationship.fromNodeId === relationship.toNodeId) fail("SELF_CERTIFICATION_RELATIONSHIP", `${curriculum.trackId}/${relationship.relationshipId} may not be self-referential.`);
    const edge = `${relationship.fromNodeId}→${relationship.toNodeId}`;
    if (relationship.relationshipId !== edge) fail("NONCANONICAL_CERTIFICATION_RELATIONSHIP_ID", `${curriculum.trackId}/${relationship.relationshipId} must equal ${edge}.`);
    if (relationship.kind !== "prerequisite_and_transfer") fail("INVALID_CERTIFICATION_RELATIONSHIP_KIND", `${curriculum.trackId}/${relationship.relationshipId} must be prerequisite_and_transfer.`);
    if (order.get(relationship.fromNodeId) >= order.get(relationship.toNodeId)) fail("INVALID_CERTIFICATION_RELATIONSHIP_ORDER", `${curriculum.trackId}/${relationship.relationshipId} must point forward.`);
    const fromBlock = nodesById.get(relationship.fromNodeId).learningBlocks.find((block) => block.blockId === relationship.fromBlockId);
    const toBlock = nodesById.get(relationship.toNodeId).learningBlocks.find((block) => block.blockId === relationship.toBlockId);
    if (!fromBlock || !toBlock) fail("INVALID_CERTIFICATION_RELATIONSHIP_ANCHOR", `${curriculum.trackId}/${relationship.relationshipId} anchors must be owned by their declared endpoints.`);
    if (!fromBlock.skillOrDecisionAtoms.some((atom) => atom.atomId === relationship.fromAtomId) || !toBlock.skillOrDecisionAtoms.some((atom) => atom.atomId === relationship.toAtomId)) fail("INVALID_CERTIFICATION_RELATIONSHIP_ATOM", `${curriculum.trackId}/${relationship.relationshipId} atoms must be owned by their declared block anchors.`);
    if (!["enables", "constrains", "supplies_evidence_for", "transfers_into"].includes(relationship.bridgeType)) fail("INVALID_CERTIFICATION_RELATIONSHIP_BRIDGE_TYPE", `${curriculum.trackId}/${relationship.relationshipId} bridgeType is invalid.`);
    const canonicalReason = `${relationship.fromNodeId}/${relationship.fromBlockId}/${relationship.fromAtomId} ${relationship.bridgeType.replaceAll("_", " ")} ${relationship.toNodeId}/${relationship.toBlockId}/${relationship.toAtomId}.`;
    if (relationship.reason !== canonicalReason) fail("NONCANONICAL_CERTIFICATION_RELATIONSHIP_REASON", `${curriculum.trackId}/${relationship.relationshipId} reason must equal its canonical atom bridge.`);
    actualEdges.add(edge); reasons.push(relationship.reason);
  }
  assertUnique(relationships.map((relationship) => relationship.relationshipId), `${curriculum.trackId} relationship IDs`);
  assertUnique(reasons, `${curriculum.trackId} relationship reasons`);
  if (actualEdges.size !== relationships.length || actualEdges.size !== expectedEdges.size || [...expectedEdges].some((edge) => !actualEdges.has(edge))) fail("CERTIFICATION_PREREQUISITE_GRAPH_MISMATCH", `${curriculum.trackId} relationships must exactly reconcile prerequisite edges.`);
}

function assertSemanticMatrix(target, curriculum) {
  if (curriculum.familyId === "coding_interview") return;
  const requiredClasses = curriculum.familyId === "certification" ? ["SIG", "DEC", "BND", "XFR"] : ["S", "D", "F", "T"];
  const allowedClasses = new Set([...requiredClasses, ...(curriculum.familyId === "design_interview" ? ["I"] : [])]);
  const operations = target.operationVariantCounts;
  const operationKeys = Object.keys(operations ?? {});
  if (!operations || requiredClasses.some((key) => !operationKeys.includes(key)) || operationKeys.some((key) => !allowedClasses.has(key))) fail("INVALID_TARGET_CLASS", `${target.coverageTargetId} has no family-appropriate operation counts.`);
  if (operationKeys.includes("I") && !/(synthesis|end_to_end|case_integration)/.test(target.blockId)) fail("INVALID_TARGET_CLASS", `${target.coverageTargetId} uses integrated-case variants outside a synthesis block.`);
  const computed = Object.values(operations).reduce((sum, operation) => {
    if (!Number.isInteger(operation.requiredVariantCount) || operation.requiredVariantCount < 1 || !operation.countRationale?.trim()) fail("INVALID_VARIANT_DERIVATION", `${target.coverageTargetId} has no accountable operation count.`);
    if (operation.derivation) fail("FALSE_PRECISION_VARIANT_MATRIX", `${target.coverageTargetId} enumerates unwritten item cells instead of an authoring coverage contract.`);
    return sum + operation.requiredVariantCount;
  }, 0);
  if (computed !== target.requiredVariantCount) fail("SEMANTIC_MATRIX_COUNT_FAILURE", `${target.coverageTargetId} operation counts do not reconcile.`);
}

function assertTargetAtomSemantics(target, block, curriculum) {
  const directAtoms = target.directSkillOrDecisionAtomIds;
  if (!Array.isArray(directAtoms) || !directAtoms.length || new Set(directAtoms).size !== directAtoms.length) fail("INVALID_DIRECT_ATOM_OWNERSHIP", `${target.coverageTargetId} must declare a non-empty unique direct atom set.`);
  const blockAtomIds = new Set(block.skillOrDecisionAtoms.map((atom) => atom.atomId));
  if (directAtoms.some((atomId) => !blockAtomIds.has(atomId))) fail("MISSING_TARGET_ATOM", `${target.coverageTargetId} references an atom outside its block.`);
  if (!directAtoms.includes(target.primarySkillOrDecisionAtomId)) fail("PRIMARY_ATOM_NOT_DIRECT", `${target.coverageTargetId} primary atom must belong to its direct atom set.`);
  if (curriculum.familyId === "coding_interview") {
    if (!codingBlockOperations.includes(target.learningOperation)) fail("INVALID_CODING_BLOCK_OPERATION", `${target.coverageTargetId} must use recognition, selection, or boundary block-operation semantics.`);
  } else if (target.learningOperation !== "decision_diagnosis" || directAtoms.length !== 1 || directAtoms[0] !== target.primarySkillOrDecisionAtomId) {
    fail("INVALID_ATOMIC_DECISION_TARGET", `${target.coverageTargetId} must remain one atomic decision owned by its primary atom.`);
  }
  return directAtoms;
}

const fillerPattern = /(governing context|familiar product or pattern|retained semantic cells|product-name similarity|this boundary is specific to|ownership boundary must remain intact|superficially similar|named mechanism|mechanism of .*|evidence that selects .*|\bevidence supporting\b|\bcondition that reverses the classification\b|failure boundary for .*|transfer condition for .*|\b(primary|secondary|tertiary|quaternary|quinary)-case\b|\bprimary case\b|\bcompeting case\b|\blifecycle change\b|\boperational consequence\b|\bin the same diagnosis\b|block orremediate|verified node floor|allocated from[^.]*\bfloor\b)/i;
function assertNoCurriculumFiller(value, label) {
  if (fillerPattern.test(value)) fail("QUOTA_DRIVEN_CURRICULUM_ARTIFACT", `${label} contains mechanical or false-precision curriculum language.`);
}

function assertPoolScope(pool, nodes, label, inheritedScope) {
  const declaredScope = pool.declaredScope ?? inheritedScope;
  if (!Array.isArray(declaredScope) || !declaredScope.length || new Set(declaredScope).size !== declaredScope.length) fail("MODE_POOL_SCOPE_MISMATCH", `${label} must declare a non-empty unique node scope.`);
  const nodeIds = new Set(nodes.map((node) => node.nodeId));
  if (declaredScope.some((nodeId) => !nodeIds.has(nodeId))) fail("MODE_POOL_SCOPE_MISMATCH", `${label} references an absent node.`);
  return new Set(declaredScope);
}

function assertRequiredPoolSize(pool, field, label) {
  const required = pool[field];
  if (pool.status === "planned_coverage_sufficient" && (!Number.isInteger(required) || required < 1)) fail("INVALID_MODE_POOL_SIZE", `${label}.${field} must be a positive integer when coverage is sufficient.`);
  if (required !== undefined && (!Number.isInteger(required) || required < 1)) fail("INVALID_MODE_POOL_SIZE", `${label}.${field} must be a positive integer.`);
  return required;
}

function eligibleVariantCount(nodes, scope, modeId) {
  return nodes
    .filter((node) => scope.has(node.nodeId))
    .flatMap((node) => node.learningBlocks)
    .flatMap((block) => block.coverageTargets)
    .filter((target) => target.interactionContractStatus === "existing_supported" && target.modeRoles.includes(modeId))
    .reduce((sum, target) => sum + target.requiredVariantCount, 0);
}

function simulationModePlan(pool, curriculum) {
  if (pool.modeId) return curriculum.modePoolPlans.find((plan) => plan.modeId === pool.modeId);
  const poolKind = pool.poolId?.split(":").at(-1);
  const candidates = curriculum.modePoolPlans.filter((plan) => poolKind === "simulation" && plan.modeId.endsWith("-simulation"));
  if (candidates.length !== 1) fail("MODE_POOL_CONTRACT_MISMATCH", `${curriculum.trackId}/${pool.poolId ?? "simulation-or-case"} cannot be mapped to exactly one declared mode.`);
  return candidates[0];
}

export function validateCurriculum(curriculum, brief, registry) {
  assertKeys(curriculum, requiredTrack, "curriculum");
  if (curriculum.schemaVersion !== "patternly-track-curriculum-v1" || curriculum.curriculumVersion !== CURRICULUM_VERSION) fail("INVALID_CURRICULUM_VERSION", `${curriculum.trackId} has a noncanonical curriculum version.`);
  if (curriculum.trackId !== brief.trackId || curriculum.familyId !== brief.internalFamily || curriculum.freeNodeId !== brief.freeNodeId) fail("CURRICULUM_BRIEF_MISMATCH", `${curriculum.trackId} differs from its canonical track brief.`);
  for (const field of ["trackBriefReference", "learnerOutcome"]) assertText(curriculum[field], `curriculum.${field}`);
  if (!Array.isArray(curriculum.nodes) || !curriculum.nodes.length || !Array.isArray(curriculum.sourceBasis) || !curriculum.sourceBasis.length) fail("INVALID_CURRICULUM_SHAPE", `${curriculum.trackId} needs nodes and source basis.`);
  const sourceIds = curriculum.sourceBasis.map((source) => source.sourceId); assertUnique(sourceIds, `${curriculum.trackId} source IDs`);
  if (curriculum.familyId === "design_interview" && sourceIds.length < 5) fail("INSUFFICIENT_DESIGN_SOURCE_BASIS", `${curriculum.trackId} cannot ground all design mechanisms in a single generic source.`);
  for (const source of curriculum.sourceBasis) {
    for (const field of ["sourceId", "url", "title", "guideVersion", "checkedDate", "volatility"]) assertText(source[field], `source.${field}`);
    if (curriculum.familyId === "certification" && !/^https:\/\//.test(source.url)) fail("INVALID_CERTIFICATION_SOURCE", `${curriculum.trackId} must use a public official source URL.`);
  }
  const nodes = curriculum.nodes; assertUnique(nodes.map((node) => node.nodeId), `${curriculum.trackId} node IDs`); walkAcyclic(nodes);
  const order = new Map(nodes.map((node, index) => [node.nodeId, index]));
  assertCertificationRelationshipGraph(curriculum, nodes, order);
  const blockIds = []; const atomIds = []; const targetIds = [];
  for (const node of nodes) {
    assertKeys(node, requiredNode, `node ${node.nodeId}`);
    if (node.trackId !== curriculum.trackId || !["free", "premium"].includes(node.freeOrPremiumRole) || node.packageOwnership !== "whole_node_package") fail("INVALID_NODE_OWNERSHIP", `${curriculum.trackId}/${node.nodeId} has invalid ownership.`);
    if (!node.learnerFacingOutcome?.trim() || !node.includedDecisionScope?.trim() || !node.explicitExclusions?.length) fail("INCOHERENT_NODE", `${curriculum.trackId}/${node.nodeId} lacks outcome, scope, or explicit exclusion.`);
    if (node.freeOrPremiumRole === "free" && node.nodeId !== curriculum.freeNodeId) fail("FREE_NODE_OUTSIDE_BRIEF", `${curriculum.trackId}/${node.nodeId} is not the brief free node.`);
    if (node.freeOrPremiumRole === "premium" && node.nodeId === curriculum.freeNodeId) fail("FREE_NODE_ROLE_MISMATCH", `${curriculum.trackId}/${node.nodeId} must be free.`);
    if (node.prerequisiteNodeIds.some((id) => !order.has(id) || order.get(id) >= order.get(node.nodeId))) fail("INVALID_PREREQUISITE_ORDER", `${curriculum.trackId}/${node.nodeId} prerequisite must be an earlier canonical node.`);
    if (curriculum.familyId === "certification" && registry && !node.officialObjectiveRefs?.length) fail("MISSING_OFFICIAL_OBJECTIVE_SOURCE", `${curriculum.trackId}/${node.nodeId} has no exact provider objective keys.`);
    if (!Array.isArray(node.learningBlocks) || node.learningBlocks.length < 2 || new Set(node.learningBlockRefs).size !== node.learningBlocks.length) fail("INCOMPLETE_NODE_BLOCKS", `${curriculum.trackId}/${node.nodeId} lacks coherent block ownership.`);
    for (const block of node.learningBlocks) {
      assertKeys(block, requiredBlock, `block ${block.blockId}`); blockIds.push(block.blockId);
      if (block.nodeId !== node.nodeId || block.blockKind !== blockKindByFamily[curriculum.familyId]) fail("INVALID_FAMILY_BLOCK_KIND", `${curriculum.trackId}/${block.blockId} has invalid family block kind.`);
      if (!block.decisiveSignals?.length || !block.failureBoundaries?.length || !block.falseHeuristicsOrMisconceptions?.length || !block.transferBoundary?.trim()) fail("INCOMPLETE_DECISION_BLOCK", `${curriculum.trackId}/${block.blockId} lacks boundary diagnosis.`);
      if (!block.sourceRequirements.every((requirement) => sourceIds.includes(requirement.sourceId))) fail("MISSING_BLOCK_SOURCE", `${curriculum.trackId}/${block.blockId} references an undeclared source.`);
      if (!block.countRationale?.trim() || !Array.isArray(block.coverageTargets) || !block.coverageTargets.length) fail("INVALID_BLOCK_COUNT", `${curriculum.trackId}/${block.blockId} lacks a count rationale or targets.`);
      const calculated = block.coverageTargets.reduce((sum, target) => sum + target.requiredVariantCount, 0);
      if (block.targetItemCount !== calculated) fail("COUNT_RECONCILIATION_FAILURE", `${curriculum.trackId}/${block.blockId} target count does not equal coverage variants.`);
      assertVolumeAccounting(block, block.targetItemCount, `${curriculum.trackId}/${block.blockId}`);
      for (const atom of block.skillOrDecisionAtoms) { assertText(atom.atomId, `atom in ${block.blockId}`); assertText(atom.observableAction, `atom ${atom.atomId}.observableAction`); assertNoCurriculumFiller(`${atom.atomId} ${atom.observableAction}`, `atom ${atom.atomId}`); atomIds.push(atom.atomId); }
      for (const target of block.coverageTargets) {
        assertKeys(target, requiredTarget, `target ${target.coverageTargetId}`); targetIds.push(target.coverageTargetId);
        if (target.blockId !== block.blockId) fail("MISSING_TARGET_ATOM", `${target.coverageTargetId} belongs to a different block.`);
        assertTargetAtomSemantics(target, block, curriculum);
        if (!target.decisiveBoundary?.trim() || !target.misconceptionOrCompetingDecision?.trim() || !target.transferBoundary?.trim()) fail("INCOMPLETE_COVERAGE_TARGET", `${target.coverageTargetId} lacks decisive coverage fields.`);
        if (!Number.isInteger(target.requiredVariantCount) || target.requiredVariantCount < 1 || target.scenarioOrSurfaceVariationAxes.length < 2 || target.scenarioOrSurfaceVariationAxes.length > 5 || new Set(target.scenarioOrSurfaceVariationAxes).size !== target.scenarioOrSurfaceVariationAxes.length) fail("INVALID_VARIANT_PLAN", `${target.coverageTargetId} has ungrounded or duplicate variants.`);
        if (!target.variantCountRationale?.trim() || !target.modeRoles?.length) fail("INVALID_VARIANT_RATIONALE", `${target.coverageTargetId} lacks variant rationale or mode role.`);
        assertNoCurriculumFiller([target.diagnosticDecision, target.decisiveBoundary, target.misconceptionOrCompetingDecision, target.transferBoundary, target.variantCountRationale, ...target.scenarioOrSurfaceVariationAxes].join(" "), target.coverageTargetId);
        assertSemanticMatrix(target, curriculum);
        if (target.interactionContractStatus === "existing_supported" && !supportedInteractions[curriculum.familyId].has(target.preferredInteractionContract)) fail("UNSUPPORTED_ACTIVE_INTERACTION", `${target.coverageTargetId} claims unsupported ${target.preferredInteractionContract}.`);
        if (!["existing_supported", "family_contract_required", "blocked_by_contract"].includes(target.interactionContractStatus)) fail("INVALID_INTERACTION_STATUS", `${target.coverageTargetId} has invalid interaction status.`);
      }
      const directlyOwnedAtomIds = new Set(block.coverageTargets.flatMap((target) => target.directSkillOrDecisionAtomIds));
      if (block.skillOrDecisionAtoms.some((atom) => !directlyOwnedAtomIds.has(atom.atomId))) fail("UNOWNED_BLOCK_ATOM", `${curriculum.trackId}/${block.blockId} contains an atom outside its direct coverage contract.`);
      if (curriculum.familyId === "coding_interview") {
        const operations = block.coverageTargets.map((target) => target.learningOperation).sort();
        if (operations.length !== codingBlockOperations.length || new Set(operations).size !== operations.length || codingBlockOperations.some((operation) => !operations.includes(operation))) fail("INCOMPLETE_CODING_BLOCK_OPERATIONS", `${curriculum.trackId}/${block.blockId} must expose exactly one recognition, selection, and boundary operation.`);
      }
    }
    assertVolumeAccounting(node, nodeCount(node), `${curriculum.trackId}/${node.nodeId}`);
  }
  assertUnique(blockIds, `${curriculum.trackId} block IDs`); assertUnique(atomIds, `${curriculum.trackId} atom IDs`); assertUnique(targetIds, `${curriculum.trackId} coverage target IDs`);
  if (curriculum.familyId !== "coding_interview") {
    const fingerprints = nodes.flatMap((node) => node.learningBlocks.flatMap((block) => block.coverageTargets.map((target) => `${target.diagnosticDecision}|${target.decisiveBoundary}|${target.misconceptionOrCompetingDecision}|${target.transferBoundary}`)));
    assertUnique(fingerprints, `${curriculum.trackId} diagnostic fingerprints`);
    const blocks = nodes.flatMap((node) => node.learningBlocks);
    if (blocks.length > 1 && new Set(blocks.map((block) => block.coverageTargets.length)).size === 1) fail("UNIFORM_TARGET_COUNT_SIGNATURE", `${curriculum.trackId} repeats one target-count template across every block.`);
    const multiTargetBlocks = blocks.filter((block) => block.coverageTargets.length > 1);
    const hasMirroredPair = (block) => block.coverageTargets.some((target, index, targets) => targets.slice(index + 1).some((candidate) => target.requiredVariantCount === candidate.requiredVariantCount && JSON.stringify([...target.scenarioOrSurfaceVariationAxes].sort()) === JSON.stringify([...candidate.scenarioOrSurfaceVariationAxes].sort())));
    if (multiTargetBlocks.length > 1 && multiTargetBlocks.every(hasMirroredPair)) fail("MIRRORED_TARGET_PAIR_SIGNATURE", `${curriculum.trackId} repeats equal-count targets with identical variation axes across every multi-target block.`);
  }
  if (nodes.filter((node) => node.nodeId === curriculum.freeNodeId).length !== 1) fail("MISSING_FREE_NODE", `${curriculum.trackId} must own exactly one free node.`);
  const total = nodes.reduce((sum, node) => sum + nodeCount(node), 0); if (total !== curriculum.targetItemCount) fail("TRACK_COUNT_RECONCILIATION_FAILURE", `${curriculum.trackId} total does not equal node totals.`); assertVolumeAccounting(curriculum, total, curriculum.trackId);
  if (curriculum.trackId === "google-cloud-associate-cloud-engineer" && JSON.stringify(curriculum).match(/ace-q-\d+/)) fail("GCP_ZERO_RETENTION_FAILURE", "GCP curriculum may not retain old instructional item identities.");
  if (nodes.some((node) => nodeCount(node) < 120)) fail("NODE_POOL_INSUFFICIENT", `${curriculum.trackId} has a node below the canonical 120-item floor.`);
  const simulationNeeded = curriculum.familyId === "certification" ? 50 : curriculum.familyId === "coding_interview" ? 40 : 0;
  if (simulationNeeded && total < simulationNeeded) fail("SIMULATION_POOL_INSUFFICIENT", `${curriculum.trackId} lacks a unique simulation pool.`);
  const modeIds = curriculum.modePoolPlans.map((pool) => pool.modeId);
  assertUnique(modeIds, `${curriculum.trackId} mode pool IDs`);
  if (modeIds.length !== brief.validModes.length || brief.validModes.some((modeId) => !modeIds.includes(modeId))) fail("MODE_POOL_CONTRACT_MISMATCH", `${curriculum.trackId} must account for every declared user mode.`);
  if (curriculum.familyId === "design_interview" && ![...curriculum.modePoolPlans, ...curriculum.simulationOrCasePoolPlans].every((pool) => pool.status === "blocked_by_contract")) fail("DESIGN_CONTRACT_INVENTED", `${curriculum.trackId} must not claim an unsupported design runtime.`);
  for (const pool of curriculum.modePoolPlans) {
    const label = `${curriculum.trackId}/${pool.modeId}`;
    if (!status.has(pool.status)) fail("INVALID_MODE_FEASIBILITY_STATUS", `${curriculum.trackId} pool has invalid status.`);
    if (pool.status === "blocked_by_contract" && !pool.missingContractOwner) fail("MISSING_CONTRACT_GAP_OWNER", `${label} blocked pool lacks owner.`);
    const scope = assertPoolScope(pool, nodes, label);
    const required = assertRequiredPoolSize(pool, "requiredUniqueItems", label);
    if (pool.status === "planned_coverage_sufficient" && required > eligibleVariantCount(nodes, scope, pool.modeId)) fail("MODE_POOL_INSUFFICIENT", `${label} exceeds eligible planned variants in its declared scope.`);
  }
  for (const pool of curriculum.simulationOrCasePoolPlans) {
    const label = `${curriculum.trackId}/${pool.poolId ?? "simulation-or-case"}`;
    if (!status.has(pool.status)) fail("INVALID_MODE_FEASIBILITY_STATUS", `${label} has invalid status.`);
    if (pool.status === "blocked_by_contract" && !pool.missingContractOwner) fail("MISSING_CONTRACT_GAP_OWNER", `${label} blocked pool lacks owner.`);
    if (pool.status !== "planned_coverage_sufficient") {
      assertPoolScope(pool, nodes, label);
      assertRequiredPoolSize(pool, "uniqueItemCount", label);
      continue;
    }
    const modePlan = simulationModePlan(pool, curriculum);
    if (!modePlan || modePlan.status !== "planned_coverage_sufficient") fail("MODE_POOL_CONTRACT_MISMATCH", `${label} claims coverage without a feasible declared mode.`);
    const modeScope = assertPoolScope(modePlan, nodes, `${curriculum.trackId}/${modePlan.modeId}`);
    const scope = assertPoolScope(pool, nodes, label, modePlan.declaredScope);
    if ([...scope].some((nodeId) => !modeScope.has(nodeId))) fail("MODE_POOL_SCOPE_MISMATCH", `${label} expands beyond its declared mode scope.`);
    const required = assertRequiredPoolSize(pool, "uniqueItemCount", label);
    if (required < modePlan.requiredUniqueItems) fail("MODE_POOL_INSUFFICIENT", `${label} does not satisfy ${modePlan.modeId}.requiredUniqueItems.`);
    if (required > eligibleVariantCount(nodes, scope, modePlan.modeId)) fail("MODE_POOL_INSUFFICIENT", `${label} exceeds eligible planned variants in its declared scope.`);
  }
  assertCertificationObjectiveBindings(curriculum, registry);
  return curriculum;
}

export async function loadCurricula({ root = ROOT } = {}) {
  const briefs = await loadCanonicalTrackBriefs({ root }); const registries = await loadCertificationObjectiveRegistries({ root }); const directory = join(root, "config", "curricula"); const names = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  if (names.length !== Object.keys(TARGET_TRACK_FAMILIES).length) fail("CURRICULUM_CATALOGUE_DENSITY", "Curriculum directory must contain exactly the ten release tracks.");
  const curricula = [];
  for (const name of names) { const curriculum = await readJson(join(directory, name)); if (name !== `${curriculum.trackId}.json`) fail("CURRICULUM_FILENAME_MISMATCH", `${name} must match track ID.`); const brief = briefs.find((entry) => entry.trackId === curriculum.trackId); if (!brief) fail("UNKNOWN_CURRICULUM_TRACK", `${curriculum.trackId} lacks a canonical brief.`); curricula.push(validateCurriculum(curriculum, brief, registries.get(curriculum.trackId))); }
  const ids = curricula.map((curriculum) => curriculum.trackId); assertUnique(ids, "track IDs"); if (Object.keys(TARGET_TRACK_FAMILIES).some((id) => !ids.includes(id))) fail("CURRICULUM_TRACK_SET_MISMATCH", "Curricula must represent the exact ten-track catalogue.");
  return Object.freeze(curricula);
}

export function catalogueFingerprint(curricula) { return fingerprint(curricula); }

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const curricula = await loadCurricula(); process.stdout.write(`Validated ${curricula.length} curricula; catalogue fingerprint ${catalogueFingerprint(curricula)}.\n`); } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
