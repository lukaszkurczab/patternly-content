import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { TARGET_TRACK_FAMILIES, loadCanonicalTrackBriefs } from "../product/track-briefs.mjs";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const CURRICULA_DIRECTORY = join(ROOT, "config", "curricula");
export const CURRICULUM_VERSION = "2026.08.09";

const blockKindByFamily = Object.freeze({ coding_interview: "coding_mental_unit", certification: "certification_competency_block", design_interview: "design_decision_block" });
const requiredTrack = ["schemaVersion", "curriculumVersion", "trackId", "familyId", "trackBriefReference", "freeNodeId", "entryPrerequisites", "learnerOutcome", "sourceBasis", "nodes", "crossNodeRelationships", "modePoolPlans", "simulationOrCasePoolPlans", "contentOwnershipRules", "crossTrackOverlapRules", "targetItemCount"];
const requiredNode = ["nodeId", "trackId", "stableLabel", "learnerFacingOutcome", "packageOwnership", "freeOrPremiumRole", "prerequisiteNodeIds", "includedDecisionScope", "explicitExclusions", "officialObjectiveRefs", "learningBlockRefs", "modeRoles", "crossNodeTransferRefs", "sourceAndMaintenancePolicy", "learningBlocks"];
const requiredBlock = ["blockId", "blockKind", "nodeId", "primaryDecisionModel", "learningObjective", "entryKnowledge", "decisiveSignals", "preconditions", "governingMechanismOrInvariant", "legalAndIllegalDecisions", "failureBoundaries", "falseHeuristicsOrMisconceptions", "transferBoundary", "skillOrDecisionAtoms", "supportedLearningOperations", "coverageTargets", "targetItemCount", "countRationale", "modeRoles", "overlapExclusions", "sourceRequirements", "maintenanceRisk"];
const requiredTarget = ["coverageTargetId", "blockId", "primarySkillOrDecisionAtomId", "diagnosticDecision", "learningObjective", "decisiveBoundary", "misconceptionOrCompetingDecision", "transferBoundary", "learningOperation", "preferredInteractionContract", "interactionContractStatus", "difficultyIntent", "modeRoles", "scenarioOrSurfaceVariationAxes", "requiredVariantCount", "variantCountRationale", "sourceRequirements", "overlapExclusions"];
const supportedInteractions = Object.freeze({ coding_interview: new Set(["choice", "ordering", "complexity"]), certification: new Set(["choice"]), design_interview: new Set() });

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

export function validateCurriculum(curriculum, brief) {
  assertKeys(curriculum, requiredTrack, "curriculum");
  if (curriculum.schemaVersion !== "patternly-track-curriculum-v1" || curriculum.curriculumVersion !== CURRICULUM_VERSION) fail("INVALID_CURRICULUM_VERSION", `${curriculum.trackId} has a noncanonical curriculum version.`);
  if (curriculum.trackId !== brief.trackId || curriculum.familyId !== brief.internalFamily || curriculum.freeNodeId !== brief.freeNodeId) fail("CURRICULUM_BRIEF_MISMATCH", `${curriculum.trackId} differs from its canonical track brief.`);
  for (const field of ["trackBriefReference", "learnerOutcome"]) assertText(curriculum[field], `curriculum.${field}`);
  if (!Array.isArray(curriculum.nodes) || !curriculum.nodes.length || !Array.isArray(curriculum.sourceBasis) || !curriculum.sourceBasis.length) fail("INVALID_CURRICULUM_SHAPE", `${curriculum.trackId} needs nodes and source basis.`);
  const sourceIds = curriculum.sourceBasis.map((source) => source.sourceId); assertUnique(sourceIds, `${curriculum.trackId} source IDs`);
  for (const source of curriculum.sourceBasis) {
    for (const field of ["sourceId", "url", "title", "guideVersion", "checkedDate", "volatility"]) assertText(source[field], `source.${field}`);
    if (curriculum.familyId === "certification" && !/^https:\/\//.test(source.url)) fail("INVALID_CERTIFICATION_SOURCE", `${curriculum.trackId} must use a public official source URL.`);
  }
  const nodes = curriculum.nodes; assertUnique(nodes.map((node) => node.nodeId), `${curriculum.trackId} node IDs`); walkAcyclic(nodes);
  const blockIds = []; const atomIds = []; const targetIds = [];
  for (const node of nodes) {
    assertKeys(node, requiredNode, `node ${node.nodeId}`);
    if (node.trackId !== curriculum.trackId || !["free", "premium"].includes(node.freeOrPremiumRole) || node.packageOwnership !== "whole_node_package") fail("INVALID_NODE_OWNERSHIP", `${curriculum.trackId}/${node.nodeId} has invalid ownership.`);
    if (!node.learnerFacingOutcome?.trim() || !node.includedDecisionScope?.trim() || !node.explicitExclusions?.length) fail("INCOHERENT_NODE", `${curriculum.trackId}/${node.nodeId} lacks outcome, scope, or explicit exclusion.`);
    if (node.freeOrPremiumRole === "free" && node.nodeId !== curriculum.freeNodeId) fail("FREE_NODE_OUTSIDE_BRIEF", `${curriculum.trackId}/${node.nodeId} is not the brief free node.`);
    if (node.freeOrPremiumRole === "premium" && node.nodeId === curriculum.freeNodeId) fail("FREE_NODE_ROLE_MISMATCH", `${curriculum.trackId}/${node.nodeId} must be free.`);
    if (curriculum.familyId === "certification" && (!node.officialObjectiveRefs.length || node.officialObjectiveRefs.some((ref) => !sourceIds.some((sourceId) => ref.startsWith(`${sourceId}:`))))) fail("MISSING_OFFICIAL_OBJECTIVE_SOURCE", `${curriculum.trackId}/${node.nodeId} has an unregistered official objective reference.`);
    if (!Array.isArray(node.learningBlocks) || node.learningBlocks.length < 2 || new Set(node.learningBlockRefs).size !== node.learningBlocks.length) fail("INCOMPLETE_NODE_BLOCKS", `${curriculum.trackId}/${node.nodeId} lacks coherent block ownership.`);
    for (const block of node.learningBlocks) {
      assertKeys(block, requiredBlock, `block ${block.blockId}`); blockIds.push(block.blockId);
      if (block.nodeId !== node.nodeId || block.blockKind !== blockKindByFamily[curriculum.familyId]) fail("INVALID_FAMILY_BLOCK_KIND", `${curriculum.trackId}/${block.blockId} has invalid family block kind.`);
      if (!block.decisiveSignals?.length || !block.failureBoundaries?.length || !block.falseHeuristicsOrMisconceptions?.length || !block.transferBoundary?.trim()) fail("INCOMPLETE_DECISION_BLOCK", `${curriculum.trackId}/${block.blockId} lacks boundary diagnosis.`);
      if (!block.countRationale?.trim() || !Array.isArray(block.coverageTargets) || !block.coverageTargets.length) fail("INVALID_BLOCK_COUNT", `${curriculum.trackId}/${block.blockId} lacks a count rationale or targets.`);
      const calculated = block.coverageTargets.reduce((sum, target) => sum + target.requiredVariantCount, 0);
      if (block.targetItemCount !== calculated) fail("COUNT_RECONCILIATION_FAILURE", `${curriculum.trackId}/${block.blockId} target count does not equal coverage variants.`);
      assertVolumeAccounting(block, block.targetItemCount, `${curriculum.trackId}/${block.blockId}`);
      for (const atom of block.skillOrDecisionAtoms) { assertText(atom.atomId, `atom in ${block.blockId}`); atomIds.push(atom.atomId); }
      for (const target of block.coverageTargets) {
        assertKeys(target, requiredTarget, `target ${target.coverageTargetId}`); targetIds.push(target.coverageTargetId);
        if (target.blockId !== block.blockId || !block.skillOrDecisionAtoms.some((atom) => atom.atomId === target.primarySkillOrDecisionAtomId)) fail("MISSING_TARGET_ATOM", `${target.coverageTargetId} has no block-owned atom.`);
        if (!target.decisiveBoundary?.trim() || !target.misconceptionOrCompetingDecision?.trim() || !target.transferBoundary?.trim()) fail("INCOMPLETE_COVERAGE_TARGET", `${target.coverageTargetId} lacks decisive coverage fields.`);
        if (!Number.isInteger(target.requiredVariantCount) || target.requiredVariantCount < 1 || target.scenarioOrSurfaceVariationAxes.length < 2 || new Set(target.scenarioOrSurfaceVariationAxes).size !== target.scenarioOrSurfaceVariationAxes.length) fail("INVALID_VARIANT_PLAN", `${target.coverageTargetId} has ungrounded or duplicate variants.`);
        if (!target.variantCountRationale?.trim() || !target.modeRoles?.length) fail("INVALID_VARIANT_RATIONALE", `${target.coverageTargetId} lacks variant rationale or mode role.`);
        if (target.interactionContractStatus === "existing_supported" && !supportedInteractions[curriculum.familyId].has(target.preferredInteractionContract)) fail("UNSUPPORTED_ACTIVE_INTERACTION", `${target.coverageTargetId} claims unsupported ${target.preferredInteractionContract}.`);
        if (!["existing_supported", "family_contract_required", "blocked_by_contract"].includes(target.interactionContractStatus)) fail("INVALID_INTERACTION_STATUS", `${target.coverageTargetId} has invalid interaction status.`);
      }
    }
    assertVolumeAccounting(node, nodeCount(node), `${curriculum.trackId}/${node.nodeId}`);
  }
  assertUnique(blockIds, `${curriculum.trackId} block IDs`); assertUnique(atomIds, `${curriculum.trackId} atom IDs`); assertUnique(targetIds, `${curriculum.trackId} coverage target IDs`);
  if (nodes.filter((node) => node.nodeId === curriculum.freeNodeId).length !== 1) fail("MISSING_FREE_NODE", `${curriculum.trackId} must own exactly one free node.`);
  const total = nodes.reduce((sum, node) => sum + nodeCount(node), 0); if (total !== curriculum.targetItemCount) fail("TRACK_COUNT_RECONCILIATION_FAILURE", `${curriculum.trackId} total does not equal node totals.`); assertVolumeAccounting(curriculum, total, curriculum.trackId);
  if (curriculum.trackId === "google-cloud-associate-cloud-engineer" && JSON.stringify(curriculum).match(/ace-q-\d+/)) fail("GCP_ZERO_RETENTION_FAILURE", "GCP curriculum may not retain old instructional item identities.");
  if (nodes.some((node) => nodeCount(node) < 120)) fail("NODE_POOL_INSUFFICIENT", `${curriculum.trackId} has a node below the canonical 120-item floor.`);
  const simulationNeeded = curriculum.familyId === "certification" ? 50 : curriculum.familyId === "coding_interview" ? 40 : 0;
  if (simulationNeeded && total < simulationNeeded) fail("SIMULATION_POOL_INSUFFICIENT", `${curriculum.trackId} lacks a unique simulation pool.`);
  const modeIds = curriculum.modePoolPlans.map((pool) => pool.modeId);
  assertUnique(modeIds, `${curriculum.trackId} mode pool IDs`);
  if (modeIds.length !== brief.validModes.length || brief.validModes.some((modeId) => !modeIds.includes(modeId))) fail("MODE_POOL_CONTRACT_MISMATCH", `${curriculum.trackId} must account for every declared user mode.`);
  for (const pool of [...curriculum.modePoolPlans, ...curriculum.simulationOrCasePoolPlans]) {
    if (!status.has(pool.status)) fail("INVALID_MODE_FEASIBILITY_STATUS", `${curriculum.trackId} pool has invalid status.`);
    if (pool.status === "blocked_by_contract" && !pool.missingContractOwner) fail("MISSING_CONTRACT_GAP_OWNER", `${curriculum.trackId} blocked pool lacks owner.`);
    if (pool.status === "planned_coverage_sufficient" && pool.requiredUniqueItems && pool.requiredUniqueItems > total) fail("MODE_POOL_INSUFFICIENT", `${curriculum.trackId}/${pool.modeId} exceeds unique planned coverage.`);
    if (pool.declaredScope?.some((nodeId) => !nodes.some((node) => node.nodeId === nodeId))) fail("MODE_POOL_SCOPE_MISMATCH", `${curriculum.trackId}/${pool.modeId} references an absent node.`);
  }
  if (curriculum.familyId === "design_interview" && !curriculum.modePoolPlans.every((pool) => pool.status === "blocked_by_contract")) fail("DESIGN_CONTRACT_INVENTED", `${curriculum.trackId} must not claim an unsupported design runtime.`);
  return curriculum;
}

export async function loadCurricula({ root = ROOT } = {}) {
  const briefs = await loadCanonicalTrackBriefs({ root }); const directory = join(root, "config", "curricula"); const names = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  if (names.length !== Object.keys(TARGET_TRACK_FAMILIES).length) fail("CURRICULUM_CATALOGUE_DENSITY", "Curriculum directory must contain exactly the ten release tracks.");
  const curricula = [];
  for (const name of names) { const curriculum = await readJson(join(directory, name)); if (name !== `${curriculum.trackId}.json`) fail("CURRICULUM_FILENAME_MISMATCH", `${name} must match track ID.`); const brief = briefs.find((entry) => entry.trackId === curriculum.trackId); if (!brief) fail("UNKNOWN_CURRICULUM_TRACK", `${curriculum.trackId} lacks a canonical brief.`); curricula.push(validateCurriculum(curriculum, brief)); }
  const ids = curricula.map((curriculum) => curriculum.trackId); assertUnique(ids, "track IDs"); if (Object.keys(TARGET_TRACK_FAMILIES).some((id) => !ids.includes(id))) fail("CURRICULUM_TRACK_SET_MISMATCH", "Curricula must represent the exact ten-track catalogue.");
  return Object.freeze(curricula);
}

export function catalogueFingerprint(curricula) { return fingerprint(curricula); }

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const curricula = await loadCurricula(); process.stdout.write(`Validated ${curricula.length} curricula; catalogue fingerprint ${catalogueFingerprint(curricula)}.\n`); } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
