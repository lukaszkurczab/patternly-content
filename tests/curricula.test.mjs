import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { catalogueFingerprint, loadCurricula, validateCurriculum } from "../scripts/curriculum/curricula.mjs";
import { loadCertificationObjectiveRegistries, validateCertificationObjectiveRegistry } from "../scripts/curriculum/certification-objective-registries.mjs";
import { buildExistingContentInventories } from "../scripts/curriculum/curriculum-inventory.mjs";
import { loadCanonicalTrackBriefs } from "../scripts/product/track-briefs.mjs";

const curricula = await loadCurricula();
const briefs = await loadCanonicalTrackBriefs();
const certificationRegistries = await loadCertificationObjectiveRegistries({ root: process.cwd() });
const clone = (value) => structuredClone(value);

test("curriculum catalogue represents every release track without admitting active content", () => {
  assert.equal(curricula.length, 10);
  assert.equal(new Set(curricula.map((entry) => entry.trackId)).size, 10);
  assert.match(catalogueFingerprint(curricula), /^[a-f0-9]{64}$/);
  for (const curriculum of curricula) {
    assert.ok(curriculum.nodes.some((node) => node.nodeId === curriculum.freeNodeId && node.freeOrPremiumRole === "free"));
    assert.ok(curriculum.nodes.every((node) => node.packageOwnership === "whole_node_package"));
  }
});

test("family-specific blocks, count reconciliation, and mode feasibility remain explicit", () => {
  for (const curriculum of curricula) {
    const expected = curriculum.familyId === "coding_interview" ? "coding_mental_unit" : curriculum.familyId === "certification" ? "certification_competency_block" : "design_decision_block";
    assert.ok(curriculum.nodes.flatMap((node) => node.learningBlocks).every((block) => block.blockKind === expected));
    assert.equal(curriculum.targetItemCount, curriculum.nodes.flatMap((node) => node.learningBlocks).reduce((sum, block) => sum + block.targetItemCount, 0));
    if (curriculum.familyId === "design_interview") assert.ok(curriculum.modePoolPlans.every((pool) => pool.status === "blocked_by_contract"));
    assert.ok(curriculum.nodes.every((node) => node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0) >= 120));
    const brief = briefs.find((entry) => entry.trackId === curriculum.trackId);
    assert.deepEqual(new Set(curriculum.modePoolPlans.map((pool) => pool.modeId)), new Set(brief.validModes));
  }
});

test("Coding Interview preserves its verified 26-node, 2,375-item base while every node meets the 120-item floor", () => {
  const coding = curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving");
  assert.equal(coding.nodes.length, 26);
  assert.equal(coding.existingVerifiedItemCount, 2375);
  assert.equal(coding.authoringItemCount, coding.targetItemCount - coding.existingVerifiedItemCount);
  assert.ok(coding.nodes.every((node) => node.existingVerifiedItemCount + node.authoringItemCount === node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0)));
  assert.ok(coding.nodes.every((node) => node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0) >= 120));
  const blocks = coding.nodes.flatMap((node) => node.learningBlocks);
  assert.equal(blocks.length, 78);
  assert.equal(blocks.flatMap((block) => block.coverageTargets).length, 234);
  for (const block of blocks) {
    assert.deepEqual(new Set(block.coverageTargets.map((target) => target.learningOperation)), new Set(["recognition", "selection", "boundary"]));
    assert.deepEqual(new Set(block.coverageTargets.flatMap((target) => target.directSkillOrDecisionAtomIds)), new Set(block.skillOrDecisionAtoms.map((atom) => atom.atomId)));
    assert.ok(block.coverageTargets.every((target) => target.directSkillOrDecisionAtomIds.includes(target.primarySkillOrDecisionAtomId)));
  }
});

test("coverage-target schema exposes direct ownership and the atomic decision boundary", async () => {
  const schema = JSON.parse(await readFile("schemas/curriculum/curriculum-coverage-target.schema.json", "utf8"));
  assert.ok(schema.required.includes("directSkillOrDecisionAtomIds"));
  assert.deepEqual(schema.properties.learningOperation.enum, ["recognition", "selection", "boundary", "decision_diagnosis"]);
  assert.equal(schema.allOf[0].if.properties.learningOperation.const, "decision_diagnosis");
  assert.equal(schema.allOf[0].then.properties.directSkillOrDecisionAtomIds.maxItems, 1);
});

test("Coding existing inventory maps every verified item without inventing per-item operations", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "patternly-coding-inventory-"));
  try {
    const { codingInventory } = await buildExistingContentInventories({ outputDirectory });
    assert.equal(codingInventory.itemCount, 2375);
    assert.deepEqual(codingInventory.classifications, { aligned: 2375 });
    assert.equal(codingInventory.coverageOwnershipContract.plannedTargetSemantics, "block_operation_across_direct_atoms");
    assert.equal(codingInventory.coverageOwnershipContract.itemOperationAttribution, "not_claimed_without_source_evidence");
    assert.ok(codingInventory.items.every((item) => item.primaryCurriculumNodeId && item.primaryCurriculumBlockId && item.primarySkillOrDecisionAtomId));
    assert.ok(codingInventory.items.every((item) => !Object.hasOwn(item, "learningOperation") && !Object.hasOwn(item, "operation")));
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
});

test("validator rejects missing boundaries, stale GCP identities, unsupported interactions, and count drift", () => {
  const gcp = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  const coding = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  const gcpBrief = briefs.find((entry) => entry.trackId === gcp.trackId);
  const codingBrief = briefs.find((entry) => entry.trackId === coding.trackId);
  gcp.nodes[0].learningBlocks[0].coverageTargets[0].coverageTargetId = "ace-q-0001";
  assert.throws(() => validateCurriculum(gcp, gcpBrief), /GCP_ZERO_RETENTION_FAILURE/);
  coding.nodes[0].learningBlocks[0].targetItemCount += 1;
  assert.throws(() => validateCurriculum(coding, codingBrief), /COUNT_RECONCILIATION_FAILURE/);
  const accounting = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  accounting.nodes[0].authoringItemCount += 1;
  assert.throws(() => validateCurriculum(accounting, codingBrief), /INVALID_VOLUME_ACCOUNTING/);
  const interaction = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  interaction.nodes[0].learningBlocks[0].coverageTargets[0].preferredInteractionContract = "ordering";
  assert.throws(() => validateCurriculum(interaction, gcpBrief), /UNSUPPORTED_ACTIVE_INTERACTION/);
  const boundary = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  boundary.nodes[0].learningBlocks[0].coverageTargets[0].decisiveBoundary = "";
  assert.throws(() => validateCurriculum(boundary, codingBrief), /INCOMPLETE_COVERAGE_TARGET/);
  const operationCount = clone(curricula.find((entry) => entry.trackId === "aws-certified-solutions-architect-associate"));
  const operationCountBrief = briefs.find((entry) => entry.trackId === operationCount.trackId);
  operationCount.nodes[0].learningBlocks[0].coverageTargets[0].operationVariantCounts.SIG.requiredVariantCount -= 1;
  assert.throws(() => validateCurriculum(operationCount, operationCountBrief), /SEMANTIC_MATRIX_COUNT_FAILURE/);
  const falsePrecision = clone(curricula.find((entry) => entry.trackId === "aws-certified-solutions-architect-associate"));
  falsePrecision.nodes[0].learningBlocks[0].coverageTargets[0].operationVariantCounts.SIG.derivation = { combinationRule: "sum", axes: [{ axisId: "fake", members: ["case"] }] };
  assert.throws(() => validateCurriculum(falsePrecision, operationCountBrief), /FALSE_PRECISION_VARIANT_MATRIX/);
  const quotaLanguage = clone(curricula.find((entry) => entry.trackId === "backend-system-design-interview"));
  const quotaLanguageBrief = briefs.find((entry) => entry.trackId === quotaLanguage.trackId);
  quotaLanguage.nodes[0].learningBlocks[0].coverageTargets[0].scenarioOrSurfaceVariationAxes[0] = "primary case";
  assert.throws(() => validateCurriculum(quotaLanguage, quotaLanguageBrief), /QUOTA_DRIVEN_CURRICULUM_ARTIFACT/);
  const floorLanguage = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  floorLanguage.nodes[0].learningBlocks[0].coverageTargets[0].variantCountRationale = "Variants are allocated from the verified node floor.";
  assert.throws(() => validateCurriculum(floorLanguage, codingBrief), /QUOTA_DRIVEN_CURRICULUM_ARTIFACT/);
  const compoundDiagnosis = clone(curricula.find((entry) => entry.trackId === "hashicorp-terraform-associate-004"));
  const compoundDiagnosisBrief = briefs.find((entry) => entry.trackId === compoundDiagnosis.trackId);
  compoundDiagnosis.nodes[0].learningBlocks[0].coverageTargets[0].diagnosticDecision += " In the same diagnosis, perform another decision.";
  assert.throws(() => validateCurriculum(compoundDiagnosis, compoundDiagnosisBrief), /QUOTA_DRIVEN_CURRICULUM_ARTIFACT/);
  const metaAxis = clone(curricula.find((entry) => entry.trackId === "hashicorp-terraform-associate-004"));
  metaAxis.nodes[0].learningBlocks[0].coverageTargets[0].scenarioOrSurfaceVariationAxes[0] = "evidence supporting branch A";
  assert.throws(() => validateCurriculum(metaAxis, compoundDiagnosisBrief), /QUOTA_DRIVEN_CURRICULUM_ARTIFACT/);
  const reachability = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  const reachabilityBrief = briefs.find((entry) => entry.trackId === reachability.trackId);
  const firstBlock = reachability.nodes[0].learningBlocks[0];
  for (const target of firstBlock.coverageTargets) target.directSkillOrDecisionAtomIds = [target.primarySkillOrDecisionAtomId];
  assert.throws(() => validateCurriculum(reachability, reachabilityBrief), /UNOWNED_BLOCK_ATOM/);

  const missingDirect = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  delete missingDirect.nodes[0].learningBlocks[0].coverageTargets[0].directSkillOrDecisionAtomIds;
  assert.throws(() => validateCurriculum(missingDirect, codingBrief), /MISSING_CURRICULUM_FIELD/);

  const primaryOutsideDirect = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  const selection = primaryOutsideDirect.nodes[0].learningBlocks[0].coverageTargets.find((target) => target.learningOperation === "selection");
  selection.directSkillOrDecisionAtomIds = selection.directSkillOrDecisionAtomIds.filter((atomId) => atomId !== selection.primarySkillOrDecisionAtomId);
  assert.throws(() => validateCurriculum(primaryOutsideDirect, codingBrief), /PRIMARY_ATOM_NOT_DIRECT/);

  const incompleteOperations = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  incompleteOperations.nodes[0].learningBlocks[0].coverageTargets.find((target) => target.learningOperation === "boundary").learningOperation = "recognition";
  assert.throws(() => validateCurriculum(incompleteOperations, codingBrief), /INCOMPLETE_CODING_BLOCK_OPERATIONS/);

  const nonCodingGroupTarget = clone(curricula.find((entry) => entry.trackId === "aws-certified-solutions-architect-associate"));
  const nonCodingBlock = nonCodingGroupTarget.nodes.flatMap((node) => node.learningBlocks).find((block) => block.skillOrDecisionAtoms.length > 1);
  nonCodingBlock.coverageTargets[0].directSkillOrDecisionAtomIds.push(nonCodingBlock.skillOrDecisionAtoms[1].atomId);
  assert.throws(() => validateCurriculum(nonCodingGroupTarget, operationCountBrief), /INVALID_ATOMIC_DECISION_TARGET/);
});

test("certification relationship graphs exactly reconcile prerequisite edges", () => {
  const gcp = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  const brief = briefs.find((entry) => entry.trackId === gcp.trackId);
  assert.doesNotThrow(() => validateCurriculum(gcp, brief));
  delete gcp.crossNodeRelationships[0].reason;
  assert.throws(() => validateCurriculum(gcp, brief), /MISSING_CERTIFICATION_RELATIONSHIP_FIELD/);
  const missingAnchor = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  delete missingAnchor.crossNodeRelationships[0].fromBlockId;
  assert.throws(() => validateCurriculum(missingAnchor, brief), /MISSING_CERTIFICATION_RELATIONSHIP_FIELD/);
  const missingAtom = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  delete missingAtom.crossNodeRelationships[0].fromAtomId;
  assert.throws(() => validateCurriculum(missingAtom, brief), /MISSING_CERTIFICATION_RELATIONSHIP_FIELD/);
  const absentAnchor = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  absentAnchor.crossNodeRelationships[0].fromBlockId = "absent_block";
  assert.throws(() => validateCurriculum(absentAnchor, brief), /INVALID_CERTIFICATION_RELATIONSHIP_ANCHOR/);
  const wrongEndpointAnchor = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  wrongEndpointAnchor.crossNodeRelationships[0].fromBlockId = wrongEndpointAnchor.crossNodeRelationships[0].toBlockId;
  assert.throws(() => validateCurriculum(wrongEndpointAnchor, brief), /INVALID_CERTIFICATION_RELATIONSHIP_ANCHOR/);
  const copiedAnchors = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  copiedAnchors.crossNodeRelationships[0].toBlockId = copiedAnchors.crossNodeRelationships[0].fromBlockId;
  assert.throws(() => validateCurriculum(copiedAnchors, brief), /INVALID_CERTIFICATION_RELATIONSHIP_ANCHOR/);
  const wrongAtom = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  wrongAtom.crossNodeRelationships[0].fromAtomId = wrongAtom.crossNodeRelationships[0].toAtomId;
  assert.throws(() => validateCurriculum(wrongAtom, brief), /INVALID_CERTIFICATION_RELATIONSHIP_ATOM/);
  const copiedAtom = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  copiedAtom.crossNodeRelationships[0].toAtomId = copiedAtom.crossNodeRelationships[0].fromAtomId;
  assert.throws(() => validateCurriculum(copiedAtom, brief), /INVALID_CERTIFICATION_RELATIONSHIP_ATOM/);
  const invalidBridgeType = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  invalidBridgeType.crossNodeRelationships[0].bridgeType = "supports";
  assert.throws(() => validateCurriculum(invalidBridgeType, brief), /INVALID_CERTIFICATION_RELATIONSHIP_BRIDGE_TYPE/);
  const stale = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  stale.crossNodeRelationships[0].toNodeId = "compute_and_workload_selection";
  assert.throws(() => validateCurriculum(stale, brief), /STALE_CERTIFICATION_RELATIONSHIP_NODE/);
  const self = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  self.crossNodeRelationships[0].toNodeId = self.crossNodeRelationships[0].fromNodeId;
  assert.throws(() => validateCurriculum(self, brief), /SELF_CERTIFICATION_RELATIONSHIP/);
  const duplicate = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  duplicate.crossNodeRelationships[1] = clone(duplicate.crossNodeRelationships[0]);
  assert.throws(() => validateCurriculum(duplicate, brief), /DUPLICATE_CURRICULUM_ID/);
  const noncanonical = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  noncanonical.crossNodeRelationships[0].relationshipId = "wrong-id";
  assert.throws(() => validateCurriculum(noncanonical, brief), /NONCANONICAL_CERTIFICATION_RELATIONSHIP_ID/);
  const reverse = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  reverse.crossNodeRelationships[0] = { relationshipId: "identity_and_service_accounts→setup_environment", fromNodeId: "identity_and_service_accounts", toNodeId: "setup_environment", fromBlockId: "principals_roles_policies", toBlockId: "resource_hierarchy_org_policy_apis", fromAtomId: "classify_principals_roles_policies_evidence", toAtomId: "organization_policy_organization_folder_project_scope", bridgeType: "constrains", kind: "prerequisite_and_transfer", reason: "identity_and_service_accounts/principals_roles_policies/classify_principals_roles_policies_evidence constrains setup_environment/resource_hierarchy_org_policy_apis/organization_policy_organization_folder_project_scope." };
  assert.throws(() => validateCurriculum(reverse, brief), /INVALID_CERTIFICATION_RELATIONSHIP_ORDER/);
  const missingEdge = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  missingEdge.crossNodeRelationships.pop();
  assert.throws(() => validateCurriculum(missingEdge, brief), /CERTIFICATION_PREREQUISITE_GRAPH_MISMATCH/);
  const extraEdge = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  extraEdge.crossNodeRelationships.push({ relationshipId: "setup_environment→compute_engine_delivery_and_operations", fromNodeId: "setup_environment", toNodeId: "compute_engine_delivery_and_operations", fromBlockId: "resource_hierarchy_org_policy_apis", toBlockId: "instance_disks_availability_os_login", fromAtomId: "organization_policy_organization_folder_project_scope", toAtomId: "login_instance_access_through_iam_unmanaged_ssh_keys", bridgeType: "constrains", kind: "prerequisite_and_transfer", reason: "setup_environment/resource_hierarchy_org_policy_apis/organization_policy_organization_folder_project_scope constrains compute_engine_delivery_and_operations/instance_disks_availability_os_login/login_instance_access_through_iam_unmanaged_ssh_keys." });
  assert.throws(() => validateCurriculum(extraEdge, brief), /CERTIFICATION_PREREQUISITE_GRAPH_MISMATCH/);
  const shortGeneric = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  shortGeneric.crossNodeRelationships[0].reason = "setup_environment/resource_hierarchy_org_policy_apis uses identity_and_service_accounts/principals_roles_policies.";
  assert.throws(() => validateCurriculum(shortGeneric, brief), /NONCANONICAL_CERTIFICATION_RELATIONSHIP_REASON/);
  const qaBypass = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  qaBypass.crossNodeRelationships[0].reason = "setup_environment/resource_hierarchy_org_policy_apis depends on identity_and_service_accounts/principals_roles_policies because it is needed.";
  assert.throws(() => validateCurriculum(qaBypass, brief), /NONCANONICAL_CERTIFICATION_RELATIONSHIP_REASON/);
  const generic = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  generic.crossNodeRelationships[0].reason = "setup_environment/resource_hierarchy_org_policy_apis and identity_and_service_accounts/principals_roles_policies use the later node's preceding decision model under a distinct boundary.";
  assert.throws(() => validateCurriculum(generic, brief), /NONCANONICAL_CERTIFICATION_RELATIONSHIP_REASON/);
  const verboseGeneric = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  verboseGeneric.crossNodeRelationships[0].reason = "setup_environment/resource_hierarchy_org_policy_apis supports identity_and_service_accounts/principals_roles_policies because the later node transfers preceding knowledge across this relationship.";
  assert.throws(() => validateCurriculum(verboseGeneric, brief), /NONCANONICAL_CERTIFICATION_RELATIONSHIP_REASON/);
  const verboseVague = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  verboseVague.crossNodeRelationships[0].reason = "setup_environment/resource_hierarchy_org_policy_apis supports identity_and_service_accounts/principals_roles_policies because it is necessary for this relationship and is required before the next node.";
  assert.throws(() => validateCurriculum(verboseVague, brief), /NONCANONICAL_CERTIFICATION_RELATIONSHIP_REASON/);
  const omittedAnchors = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  omittedAnchors.crossNodeRelationships[0].reason = "setup_environment supplies organization policy; identity_and_service_accounts applies it to principals.";
  assert.throws(() => validateCurriculum(omittedAnchors, brief), /NONCANONICAL_CERTIFICATION_RELATIONSHIP_REASON/);
  const qualityVague = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  qualityVague.crossNodeRelationships[0].reason = "setup_environment/resource_hierarchy_org_policy_apis supports identity_and_service_accounts/principals_roles_policies because this progression is important and useful for the next capability.";
  assert.throws(() => validateCurriculum(qualityVague, brief), /NONCANONICAL_CERTIFICATION_RELATIONSHIP_REASON/);
});

test("validator rejects systematic non-Coding quota signatures without rejecting one local equal pair", () => {
  const aws = curricula.find((entry) => entry.trackId === "aws-certified-solutions-architect-associate");
  const awsBrief = briefs.find((entry) => entry.trackId === aws.trackId);

  const uniformTargetCounts = clone(aws);
  let cloneIndex = 0;
  for (const block of uniformTargetCounts.nodes.flatMap((node) => node.learningBlocks).filter((candidate) => candidate.coverageTargets.length === 1)) {
    const original = block.coverageTargets[0];
    const duplicate = clone(original);
    duplicate.coverageTargetId = `${original.coverageTargetId}:distinct-quota-copy-${cloneIndex++}`;
    for (const field of ["diagnosticDecision", "decisiveBoundary", "misconceptionOrCompetingDecision", "transferBoundary"]) duplicate[field] = `${duplicate[field]} Distinct systematic-copy evidence ${cloneIndex}.`;
    duplicate.requiredVariantCount = 4;
    for (const operation of Object.values(duplicate.operationVariantCounts)) operation.requiredVariantCount = 1;
    original.requiredVariantCount -= 4;
    for (const operation of Object.values(original.operationVariantCounts)) operation.requiredVariantCount -= 1;
    block.coverageTargets.push(duplicate);
  }
  assert.throws(() => validateCurriculum(uniformTargetCounts, awsBrief), /UNIFORM_TARGET_COUNT_SIGNATURE/);

  const mirroredPairs = clone(aws);
  for (const node of mirroredPairs.nodes) {
    for (const block of node.learningBlocks.filter((candidate) => candidate.coverageTargets.length > 1)) {
      const [source, ...targets] = block.coverageTargets;
      for (const target of targets) {
        target.scenarioOrSurfaceVariationAxes = [...source.scenarioOrSurfaceVariationAxes];
        target.requiredVariantCount = source.requiredVariantCount;
        target.operationVariantCounts = clone(source.operationVariantCounts);
      }
      block.targetItemCount = block.coverageTargets.reduce((sum, target) => sum + target.requiredVariantCount, 0);
      block.existingVerifiedItemCount = 0;
      block.authoringItemCount = block.targetItemCount;
    }
    node.existingVerifiedItemCount = 0;
    node.authoringItemCount = node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0);
  }
  assert.throws(() => validateCurriculum(mirroredPairs, awsBrief), /MIRRORED_TARGET_PAIR_SIGNATURE/);

  const oneLocalPair = clone(aws);
  const localBlock = oneLocalPair.nodes.flatMap((node) => node.learningBlocks).find((block) => block.coverageTargets.length > 1);
  const [source, target] = localBlock.coverageTargets;
  target.scenarioOrSurfaceVariationAxes = [...source.scenarioOrSurfaceVariationAxes];
  target.requiredVariantCount = source.requiredVariantCount;
  target.operationVariantCounts = clone(source.operationVariantCounts);
  localBlock.targetItemCount = localBlock.coverageTargets.reduce((sum, entry) => sum + entry.requiredVariantCount, 0);
  localBlock.existingVerifiedItemCount = 0;
  localBlock.authoringItemCount = localBlock.targetItemCount;
  const localNode = oneLocalPair.nodes.find((node) => node.nodeId === localBlock.nodeId);
  localNode.existingVerifiedItemCount = 0;
  localNode.authoringItemCount = localNode.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0);
  oneLocalPair.existingVerifiedItemCount = 0;
  oneLocalPair.targetItemCount = oneLocalPair.nodes.flatMap((node) => node.learningBlocks).reduce((sum, block) => sum + block.targetItemCount, 0);
  oneLocalPair.authoringItemCount = oneLocalPair.targetItemCount;
  assert.doesNotThrow(() => validateCurriculum(oneLocalPair, awsBrief));
});

test("mode feasibility counts only legal scoped target variants and validates simulation uniqueness", () => {
  const coding = curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving");
  const codingBrief = briefs.find((entry) => entry.trackId === coding.trackId);
  const firstNode = coding.nodes[0];
  const scopedCount = (curriculum, modeId, nodeId) => curriculum.nodes
    .filter((node) => node.nodeId === nodeId)
    .flatMap((node) => node.learningBlocks)
    .flatMap((block) => block.coverageTargets)
    .filter((target) => target.interactionContractStatus === "existing_supported" && target.modeRoles.includes(modeId))
    .reduce((sum, target) => sum + target.requiredVariantCount, 0);

  const crossScope = clone(coding);
  const guided = crossScope.modePoolPlans.find((pool) => pool.modeId === "coding-interview-guided-practice");
  guided.declaredScope = [firstNode.nodeId];
  guided.requiredUniqueItems = scopedCount(crossScope, guided.modeId, firstNode.nodeId) + 1;
  assert.ok(guided.requiredUniqueItems < crossScope.targetItemCount);
  assert.throws(() => validateCurriculum(crossScope, codingBrief), /MODE_POOL_INSUFFICIENT/);

  const undeclaredMode = clone(coding);
  const learn = undeclaredMode.modePoolPlans.find((pool) => pool.modeId === "coding-interview-learn-approach");
  learn.declaredScope = [firstNode.nodeId];
  for (const target of undeclaredMode.nodes[0].learningBlocks.flatMap((block) => block.coverageTargets)) target.modeRoles = target.modeRoles.filter((modeId) => modeId !== learn.modeId);
  assert.throws(() => validateCurriculum(undeclaredMode, codingBrief), /MODE_POOL_INSUFFICIENT/);

  const unsupportedInteraction = clone(coding);
  const review = unsupportedInteraction.modePoolPlans.find((pool) => pool.modeId === "coding-interview-weak-area-review");
  review.declaredScope = [firstNode.nodeId];
  for (const target of unsupportedInteraction.nodes[0].learningBlocks.flatMap((block) => block.coverageTargets)) target.interactionContractStatus = "family_contract_required";
  assert.throws(() => validateCurriculum(unsupportedInteraction, codingBrief), /MODE_POOL_INSUFFICIENT/);

  const simulation = clone(coding);
  const simulationPlan = simulation.simulationOrCasePoolPlans[0];
  const simulationModeId = simulation.modePoolPlans.find((pool) => pool.modeId.endsWith("-simulation")).modeId;
  simulationPlan.declaredScope = [firstNode.nodeId];
  simulationPlan.uniqueItemCount = scopedCount(simulation, simulationModeId, firstNode.nodeId) + 1;
  assert.ok(simulationPlan.uniqueItemCount < simulation.targetItemCount);
  assert.throws(() => validateCurriculum(simulation, codingBrief), /MODE_POOL_INSUFFICIENT/);

  const undersizedSimulation = clone(coding);
  const requiredSimulationItems = undersizedSimulation.modePoolPlans.find((pool) => pool.modeId.endsWith("-simulation")).requiredUniqueItems;
  undersizedSimulation.simulationOrCasePoolPlans[0].uniqueItemCount = requiredSimulationItems - 1;
  assert.throws(() => validateCurriculum(undersizedSimulation, codingBrief), /MODE_POOL_INSUFFICIENT/);
});

test("curriculum specifications are separate from publishing discovery", async () => {
  const pipeline = await readFile("scripts/publishing/pipeline.mjs", "utf8");
  const publishingScripts = await readFile("scripts/publishing/cli.mjs", "utf8");
  assert.doesNotMatch(`${pipeline}\n${publishingScripts}`, /config\/curricula/);
  const gcp = curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer");
  assert.doesNotMatch(JSON.stringify(gcp), /ace-q-\d+/);
});

test("GCP exact objective registry governs every nested binding and blocks authoring", () => {
  const gcp = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  const brief = briefs.find((entry) => entry.trackId === gcp.trackId);
  const registry = certificationRegistries.get(gcp.trackId);
  assert.equal(registry.domains.length, 4);
  assert.equal(registry.objectives.length, 12);
  assert.equal(registry.objectives.flatMap((objective) => objective.scopeStatements).length, 94);
  assert.doesNotThrow(() => validateCurriculum(gcp, brief, registry));
  const crossTrack = clone(gcp); crossTrack.nodes[0].learningBlocks[0].coverageTargets[0].officialObjectiveRefs = ["aws-saa-1.1"];
  assert.throws(() => validateCurriculum(crossTrack, brief, registry), /CERTIFICATION_OBJECTIVE_TRACK_MISMATCH/);
  const removed = clone(gcp); removed.nodes[0].learningBlocks[0].coverageTargets[0].officialObjectiveRefs = ["section-5-configure-access-and-security"];
  assert.throws(() => validateCurriculum(removed, brief, registry), /REMOVED_CERTIFICATION_OBJECTIVE/);
  const misspelled = clone(gcp); misspelled.nodes[0].learningBlocks[0].coverageTargets[0].officialObjectiveRefs = ["gcp-ace-standard-9.9"];
  assert.throws(() => validateCurriculum(misspelled, brief, registry), /UNKNOWN_CERTIFICATION_OBJECTIVE/);
  const missing = clone(gcp); missing.nodes[0].learningBlocks[0].coverageTargets[0].officialObjectiveRefs = [];
  assert.throws(() => validateCurriculum(missing, brief, registry), /UNKNOWN_CERTIFICATION_OBJECTIVE/);
  const nestedMismatch = clone(gcp); nestedMismatch.nodes[0].learningBlocks[0].officialObjectiveRefs = ["gcp-ace-standard-1.2"];
  assert.throws(() => validateCurriculum(nestedMismatch, brief, registry), /OBJECTIVE_BINDING_DERIVATION_MISMATCH/);
  const uncovered = clone(gcp); const objective = "gcp-ace-standard-4.2"; const replaceObjective = (refs) => [...new Set(refs.map((ref) => ref === objective ? "gcp-ace-standard-4.1" : ref))]; for (const node of uncovered.nodes) { node.officialObjectiveRefs = replaceObjective(node.officialObjectiveRefs); for (const block of node.learningBlocks) { block.officialObjectiveRefs = replaceObjective(block.officialObjectiveRefs); for (const atom of block.skillOrDecisionAtoms) atom.officialObjectiveRefs = replaceObjective(atom.officialObjectiveRefs); for (const target of block.coverageTargets) { target.officialObjectiveRefs = replaceObjective(target.officialObjectiveRefs); target.sourceRequirements.requirements[0].objectiveRefs = replaceObjective(target.sourceRequirements.requirements[0].objectiveRefs); } } }
  assert.throws(() => validateCurriculum(uncovered, brief, registry), /UNCOVERED_CERTIFICATION_OBJECTIVE/);
  const authoringReady = clone(gcp); authoringReady.nodes[0].learningBlocks[0].coverageTargets[0].sourceRequirements.requirements[1].resolvedAtCurriculumStage = true;
  assert.throws(() => validateCurriculum(authoringReady, brief, registry), /MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE/);
  const unresolvedFakeRef = clone(gcp); unresolvedFakeRef.nodes[0].learningBlocks[0].coverageTargets[0].sourceRequirements.requirements[1].directFirstPartySourceRefs = ["pretend-doc"];
  assert.throws(() => validateCurriculum(unresolvedFakeRef, brief, registry), /MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE/);
  const resolvedWrongHost = clone(gcp); const resolvedTarget = resolvedWrongHost.nodes[0].learningBlocks[0].coverageTargets[0]; resolvedWrongHost.sourceBasis.push({ sourceId: "wrong-host-doc", sourceKind: "direct_first_party_product_documentation", url: "https://example.com/product", title: "Wrong host", checkedDate: "2026-08-10", guideVersion: "not_documented", version: "not_documented", volatility: "high", mechanismOrProductProperties: [resolvedTarget.primarySkillOrDecisionAtomId] }); resolvedTarget.sourceRequirements.authoringGate = "resolved_for_authoring"; resolvedTarget.sourceRequirements.requirements[1].resolvedAtCurriculumStage = true; resolvedTarget.sourceRequirements.requirements[1].directFirstPartySourceRefs = ["wrong-host-doc"];
  assert.throws(() => validateCurriculum(resolvedWrongHost, brief, registry), /MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE/);
  const resolvedMissingMechanism = clone(gcp); const missingMechanismTarget = resolvedMissingMechanism.nodes[0].learningBlocks[0].coverageTargets[0]; resolvedMissingMechanism.sourceBasis.push({ sourceId: "gcp-doc", sourceKind: "direct_first_party_product_documentation", url: "https://cloud.google.com/docs/product", title: "Product documentation", checkedDate: "2026-08-10", guideVersion: "not_documented", version: "not_documented", volatility: "high", mechanismOrProductProperties: ["another-mechanism"] }); missingMechanismTarget.sourceRequirements.authoringGate = "resolved_for_authoring"; missingMechanismTarget.sourceRequirements.requirements[1].resolvedAtCurriculumStage = true; missingMechanismTarget.sourceRequirements.requirements[1].directFirstPartySourceRefs = ["gcp-doc"];
  assert.throws(() => validateCurriculum(resolvedMissingMechanism, brief, registry), /MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE/);
  const resolvedSource = clone(gcp); const resolvedSourceTarget = resolvedSource.nodes[0].learningBlocks[0].coverageTargets[0]; resolvedSource.sourceBasis.push({ sourceId: "gcp-direct-doc", sourceKind: "direct_first_party_product_documentation", url: "https://docs.cloud.google.com/product", title: "Product documentation", checkedDate: "2026-08-10", guideVersion: "not_documented", version: "not_documented", volatility: "high", mechanismOrProductProperties: [resolvedSourceTarget.primarySkillOrDecisionAtomId] }); resolvedSourceTarget.sourceRequirements.authoringGate = "resolved_for_authoring"; resolvedSourceTarget.sourceRequirements.requirements[1].resolvedAtCurriculumStage = true; resolvedSourceTarget.sourceRequirements.requirements[1].directFirstPartySourceRefs = ["gcp-direct-doc"];
  assert.doesNotThrow(() => validateCurriculum(resolvedSource, brief, registry));
  const badProfile = clone(registry); badProfile.examProfile.navigation.value = { enabled: true };
  assert.throws(() => validateCertificationObjectiveRegistry(badProfile), /UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED/);
  const badDate = clone(registry); badDate.sources[0].checkedDate = "tomorrow";
  assert.throws(() => validateCertificationObjectiveRegistry(badDate), /INVALID_SOURCE_CHECKED_DATE/);
  const rolloverDate = clone(registry); rolloverDate.sources[0].checkedDate = "2026-99-99";
  assert.throws(() => validateCertificationObjectiveRegistry(rolloverDate), /INVALID_SOURCE_CHECKED_DATE/);
  const badGuideVersion = clone(registry); badGuideVersion.guideVersion = "";
  assert.throws(() => validateCertificationObjectiveRegistry(badGuideVersion), /INVALID_GUIDE_VERSION_STATE/);
  const inventedSimulation = clone(registry); inventedSimulation.examProfile.faithfulSimulationEligibility.allowedPatternlyClaim = "faithful_google_standard_exam_simulation";
  assert.throws(() => validateCertificationObjectiveRegistry(inventedSimulation), /UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED/);
  const unsupportedExclusion = clone(gcp); unsupportedExclusion.objectiveExclusions = [{ objectiveId: "gcp-ace-standard-1.1", reasonCode: "provider_scope_removed", evidenceSourceRefs: ["google-ace-standard-exam-guide"], evidenceBackedRationale: "Setting up cloud projects and accounts. is excluded because it is no longer a valid provider scope despite this deliberately generic explanation." }];
  assert.throws(() => validateCurriculum(unsupportedExclusion, brief, registry), /INVALID_OBJECTIVE_EXCLUSION/);
});

test("Terraform 004 exact objective registry governs alphanumeric objective bindings and profile provenance", () => {
  const terraform = clone(curricula.find((entry) => entry.trackId === "hashicorp-terraform-associate-004"));
  const brief = briefs.find((entry) => entry.trackId === terraform.trackId);
  const registry = certificationRegistries.get(terraform.trackId);
  assert.equal(registry.domains.length, 8);
  assert.equal(registry.objectives.length, 37);
  assert.deepEqual(registry.officialSourceHosts, ["developer.hashicorp.com"]);
  assert.doesNotThrow(() => validateCurriculum(terraform, brief, registry));
  assert.equal(terraform.nodes.length, 9);
  assert.equal(terraform.nodes.flatMap((node) => node.learningBlocks).length, 32);
  assert.equal(terraform.nodes.flatMap((node) => node.learningBlocks.flatMap((block) => block.coverageTargets)).length, 55);
  assert.equal(terraform.targetItemCount, 1695);
  assert.equal(terraform.existingVerifiedItemCount, 0);
  assert.equal(terraform.authoringItemCount, 1695);
  const dependencyTarget = terraform.nodes.flatMap((node) => node.learningBlocks).find((block) => block.blockId === "references_implicit_explicit_dependencies").coverageTargets.find((target) => target.primarySkillOrDecisionAtomId === "select_explicit_dependency_or_replacement_lifecycle_rule");
  assert.deepEqual(dependencyTarget.officialObjectiveRefs, ["terraform-associate-004-4f"]);
  const sensitiveTarget = terraform.nodes.flatMap((node) => node.learningBlocks).find((block) => block.blockId === "sensitive_data_and_secrets_vault").coverageTargets.find((target) => target.primarySkillOrDecisionAtomId === "select_sensitive_ephemeral_or_write_only_value_handling");
  assert.deepEqual(sensitiveTarget.officialObjectiveRefs, ["terraform-associate-004-4h"]);
  const crossTrack = clone(terraform); crossTrack.nodes[0].learningBlocks[0].coverageTargets[0].officialObjectiveRefs = ["gcp-ace-standard-1.1"];
  assert.throws(() => validateCurriculum(crossTrack, brief, registry), /CERTIFICATION_OBJECTIVE_TRACK_MISMATCH/);
  const removed = clone(terraform); removed.nodes[0].learningBlocks[0].coverageTargets[0].officialObjectiveRefs = ["objective-1a"];
  assert.throws(() => validateCurriculum(removed, brief, registry), /REMOVED_CERTIFICATION_OBJECTIVE/);
  const misspelled = clone(terraform); misspelled.nodes[0].learningBlocks[0].coverageTargets[0].officialObjectiveRefs = ["terraform-associate-004-9z"];
  assert.throws(() => validateCurriculum(misspelled, brief, registry), /UNKNOWN_CERTIFICATION_OBJECTIVE/);
  const uncovered = clone(terraform); const objective = "terraform-associate-004-8d"; const replaceObjective = (refs) => [...new Set(refs.map((ref) => ref === objective ? "terraform-associate-004-8b" : ref))]; for (const node of uncovered.nodes) { node.officialObjectiveRefs = replaceObjective(node.officialObjectiveRefs); for (const block of node.learningBlocks) { block.officialObjectiveRefs = replaceObjective(block.officialObjectiveRefs); for (const atom of block.skillOrDecisionAtoms) atom.officialObjectiveRefs = replaceObjective(atom.officialObjectiveRefs); for (const target of block.coverageTargets) { target.officialObjectiveRefs = replaceObjective(target.officialObjectiveRefs); target.sourceRequirements.requirements[0].objectiveRefs = replaceObjective(target.sourceRequirements.requirements[0].objectiveRefs); } } }
  assert.throws(() => validateCurriculum(uncovered, brief, registry), /UNCOVERED_CERTIFICATION_OBJECTIVE/);
  const badProfile = clone(registry); badProfile.examProfile.duration.checkedDate = "2026-02-30";
  assert.throws(() => validateCertificationObjectiveRegistry(badProfile), /INVALID_EXAM_PROFILE_PROVENANCE/);
  const inventedSimulation = clone(registry); inventedSimulation.examProfile.faithfulSimulationEligibility.allowedPatternlyClaim = "faithful_terraform_exam_simulation";
  assert.throws(() => validateCertificationObjectiveRegistry(inventedSimulation), /UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED/);
  const unownedRegistrySource = clone(terraform); const target = unownedRegistrySource.nodes[0].learningBlocks[0].coverageTargets[0]; unownedRegistrySource.sourceBasis.push({ sourceId: "unowned-registry-doc", sourceKind: "direct_first_party_product_documentation", url: "https://registry.terraform.io/v1/attacker/provider", title: "Attacker Registry provider", checkedDate: "2026-08-10", guideVersion: "associate-004", version: "1", volatility: "high", mechanismOrProductProperties: [target.primarySkillOrDecisionAtomId] }); target.sourceRequirements.authoringGate = "resolved_for_authoring"; target.sourceRequirements.requirements[1].resolvedAtCurriculumStage = true; target.sourceRequirements.requirements[1].directFirstPartySourceRefs = ["unowned-registry-doc"];
  assert.throws(() => validateCurriculum(unownedRegistrySource, brief, registry), /MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE/);
  const badSource = clone(registry); delete badSource.sources[0].authoritativeFor;
  assert.throws(() => validateCertificationObjectiveRegistry(badSource), /MISSING_CERTIFICATION_SOURCE_FIELD/);
  const badSourceUrl = clone(registry); badSourceUrl.sources[0].url = "http://developer.hashicorp.com/not-secure";
  assert.throws(() => validateCertificationObjectiveRegistry(badSourceUrl), /INVALID_CERTIFICATION_SOURCE_PROVENANCE/);
  const untrustedOfficialSource = clone(registry); untrustedOfficialSource.sources[0].url = "https://example.invalid/terraform-associate-004";
  assert.throws(() => validateCertificationObjectiveRegistry(untrustedOfficialSource), /INVALID_CERTIFICATION_SOURCE_PROVENANCE/);
  const badDomain = clone(registry); badDomain.domains[0].sourceRefs = [];
  assert.throws(() => validateCertificationObjectiveRegistry(badDomain), /INVALID_CERTIFICATION_DOMAIN_PROVENANCE/);
  const badObjective = clone(registry); badObjective.objectives[0].sourceRefs = ["missing-source"];
  assert.throws(() => validateCertificationObjectiveRegistry(badObjective), /INVALID_CERTIFICATION_OBJECTIVE_PROVENANCE/);
  const scoped = clone(registry); const scopedObjective = scoped.objectives.find((objective) => objective.scopeStatements.length); scopedObjective.scopeStatements[0].checkedDate = "2026-02-30";
  assert.throws(() => validateCertificationObjectiveRegistry(scoped), /INVALID_CERTIFICATION_SCOPE_PROVENANCE/);
  const badEligibility = clone(registry); badEligibility.examProfile.faithfulSimulationEligibility.undocumentedFields = [];
  assert.throws(() => validateCertificationObjectiveRegistry(badEligibility), /UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED/);
  const dependencyRationales = Object.values(dependencyTarget.operationVariantCounts).map((entry) => entry.countRationale).join(" ");
  for (const term of ["implicit", "depends_on", "create_before_destroy", "replacement ordering"]) assert.match(dependencyRationales, new RegExp(term));
  assert.doesNotMatch(dependencyRationales, /add depends, hidden dependency, depends_on scope/);
  const sensitiveRationales = Object.values(sensitiveTarget.operationVariantCounts).map((entry) => entry.countRationale).join(" ");
  for (const term of ["sensitive redaction", "plan\/state persistence", "ephemeral", "write-only", "reference-only"]) assert.match(sensitiveRationales, new RegExp(term));
  assert.doesNotMatch(sensitiveRationales, /mark sensitive values plaintext exposure, input modality, output contract/);
});

test("AI-901 exact objective registry governs seven current objectives, source gates, and practice-only simulation", () => {
  const ai901 = clone(curricula.find((entry) => entry.trackId === "microsoft-azure-ai-fundamentals-ai-901"));
  const brief = briefs.find((entry) => entry.trackId === ai901.trackId);
  const registry = certificationRegistries.get(ai901.trackId);
  assert.equal(registry.domains.length, 2);
  assert.deepEqual(registry.domains.map((domain) => domain.weight.value), ["40–45%", "55–60%"]);
  assert.equal(registry.objectives.length, 7);
  assert.equal(registry.objectives.flatMap((objective) => objective.scopeStatements).length, 29);
  const registrySources = new Map(registry.sources.map((source) => [source.sourceId, source.url]));
  assert.equal(registrySources.get("microsoft-exam-scoring-reports"), "https://learn.microsoft.com/en-us/credentials/certifications/exam-scoring-reports");
  assert.equal(registrySources.get("microsoft-register-schedule-exam"), "https://learn.microsoft.com/en-us/credentials/certifications/register-schedule-exam");
  const curriculumSources = new Map(ai901.sourceBasis.map((source) => [source.sourceId, source.url]));
  assert.equal(curriculumSources.get("microsoft-exam-scoring-reports"), registrySources.get("microsoft-exam-scoring-reports"));
  assert.equal(curriculumSources.get("microsoft-register-schedule-exam"), registrySources.get("microsoft-register-schedule-exam"));
  assert.equal(ai901.nodes.length, 8);
  assert.equal(ai901.nodes.flatMap((node) => node.learningBlocks).length, 27);
  assert.equal(ai901.nodes.flatMap((node) => node.learningBlocks.flatMap((block) => block.coverageTargets)).length, 44);
  assert.equal(ai901.targetItemCount, 1363);
  assert.equal(ai901.existingVerifiedItemCount, 0);
  assert.equal(ai901.authoringItemCount, 1363);
  assert.deepEqual(ai901.entryPrerequisites, ["Foundational Python syntax and programming techniques.", "Familiarity with Azure resources."]);
  assert.match(ai901.learnerOutcome, /implement Azure AI solutions/i);
  assert.doesNotThrow(() => validateCurriculum(ai901, brief, registry));
  const target = ai901.nodes[0].learningBlocks[0].coverageTargets[0];
  assert.deepEqual(target.officialObjectiveRefs, ["ai-901-2026-04-15-1.3"]);
  const crossTrack = clone(ai901); crossTrack.nodes[0].learningBlocks[0].coverageTargets[0].officialObjectiveRefs = ["gcp-ace-standard-1.1"];
  assert.throws(() => validateCurriculum(crossTrack, brief, registry), /CERTIFICATION_OBJECTIVE_TRACK_MISMATCH/);
  const removed = clone(ai901); removed.nodes[0].learningBlocks[0].coverageTargets[0].officialObjectiveRefs = ["section-concepts-and-capabilities"];
  assert.throws(() => validateCurriculum(removed, brief, registry), /REMOVED_CERTIFICATION_OBJECTIVE/);
  const unknown = clone(ai901); unknown.nodes[0].learningBlocks[0].coverageTargets[0].officialObjectiveRefs = ["ai-901-2026-04-15-9.9"];
  assert.throws(() => validateCurriculum(unknown, brief, registry), /UNKNOWN_CERTIFICATION_OBJECTIVE/);
  const uncovered = clone(ai901); const objective = "ai-901-2026-04-15-2.4"; const replaceObjective = (refs) => [...new Set(refs.map((ref) => ref === objective ? "ai-901-2026-04-15-2.3" : ref))]; for (const node of uncovered.nodes) { node.officialObjectiveRefs = replaceObjective(node.officialObjectiveRefs); for (const block of node.learningBlocks) { block.officialObjectiveRefs = replaceObjective(block.officialObjectiveRefs); for (const atom of block.skillOrDecisionAtoms) atom.officialObjectiveRefs = replaceObjective(atom.officialObjectiveRefs); for (const coverageTarget of block.coverageTargets) { coverageTarget.officialObjectiveRefs = replaceObjective(coverageTarget.officialObjectiveRefs); coverageTarget.sourceRequirements.requirements[0].objectiveRefs = replaceObjective(coverageTarget.sourceRequirements.requirements[0].objectiveRefs); } } }
  assert.throws(() => validateCurriculum(uncovered, brief, registry), /UNCOVERED_CERTIFICATION_OBJECTIVE/);
  const fakeMechanism = clone(ai901); fakeMechanism.nodes[0].learningBlocks[0].coverageTargets[0].sourceRequirements.requirements[1].directFirstPartySourceRefs = ["microsoft-ai-901-study-guide"];
  assert.throws(() => validateCurriculum(fakeMechanism, brief, registry), /MISSING_DIRECT_FIRST_PARTY_MECHANISM_SOURCE/);
  const badHost = clone(registry); badHost.sources[0].url = "https://example.invalid/ai-901";
  assert.throws(() => validateCertificationObjectiveRegistry(badHost), /INVALID_CERTIFICATION_SOURCE_PROVENANCE/);
  const badProfile = clone(registry); badProfile.examProfile.itemCountOrRange.value = 50;
  assert.throws(() => validateCertificationObjectiveRegistry(badProfile), /UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED/);
  const faithfulClaim = clone(registry); faithfulClaim.examProfile.faithfulSimulationEligibility.allowedPatternlyClaim = "provider_faithful_ai901_simulation";
  assert.throws(() => validateCertificationObjectiveRegistry(faithfulClaim), /UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED/);
  const simulatedClaim = clone(ai901); simulatedClaim.simulationOrCasePoolPlans[0].simulationClaim = "provider_faithful_ai901_simulation";
  assert.throws(() => validateCurriculum(simulatedClaim, brief, registry), /UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED/);
});

test("registry schema and validation constrain official exam source hosts independently from mechanism documentation hosts", async () => {
  const schema = JSON.parse(await readFile("schemas/curriculum/certification-objective-registry.schema.json", "utf8"));
  assert.ok(schema.required.includes("officialSourceHosts"));
  assert.equal(schema.properties.officialSourceHosts.minItems, 1);
  const gcp = certificationRegistries.get("google-cloud-associate-cloud-engineer");
  assert.deepEqual(gcp.officialSourceHosts, ["cloud.google.com", "services.google.com", "support.google.com"]);
  const badHost = clone(gcp); badHost.officialSourceHosts = ["cloud.google.com/"];
  assert.throws(() => validateCertificationObjectiveRegistry(badHost), /INVALID_OFFICIAL_SOURCE_HOST/);
});
