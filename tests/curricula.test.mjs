import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { catalogueFingerprint, loadCurricula, validateCurriculum } from "../scripts/curriculum/curricula.mjs";
import { loadCertificationObjectiveRegistries, validateCertificationObjectiveRegistry } from "../scripts/curriculum/certification-objective-registries.mjs";
import { buildExistingContentInventories } from "../scripts/curriculum/curriculum-inventory.mjs";
import { loadCanonicalTrackBriefs } from "../scripts/product/track-briefs.mjs";
import { validateDesignInterviewCurriculum } from "../scripts/curriculum/design-interview-curricula.mjs";

const curricula = await loadCurricula();
const briefs = await loadCanonicalTrackBriefs();
const certificationRegistries = await loadCertificationObjectiveRegistries({ root: process.cwd() });
const clone = (value) => structuredClone(value);
const certificationCurricula = curricula.filter((curriculum) => curriculum.familyId === "certification");
const certificationByTrackId = (trackId) => certificationCurricula.find((curriculum) => curriculum.trackId === trackId);
const RETIRED_CERTIFICATION_FIELDS = ["candidateNodeSlotCounts", "candidatePracticeForm", "candidateChoiceOnlyPracticeForm", "patternlyPracticeForm", "sourceRefsNeeded", "discardedOrMergedCandidates", "noAggregateOperationAccounting", "learningBlocks", "sourceBasis", "modePoolPlans", "simulationOrCasePoolPlans"];

function assertNoRetiredCertificationFields(value, path = "curriculum") {
  if (Array.isArray(value)) return value.forEach((entry, index) => assertNoRetiredCertificationFields(entry, `${path}[${index}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value)) {
    assert.ok(!RETIRED_CERTIFICATION_FIELDS.includes(key), `${path}.${key} is retired from the direct certification slot contract`);
    assertNoRetiredCertificationFields(entry, `${path}.${key}`);
  }
}

function assertCanonicalCertificationSlots(curriculum) {
  assert.equal(curriculum.schemaVersion, "patternly-certification-curriculum-v1");
  assert.ok(["2026.08.11", "2026.08.15"].includes(curriculum.curriculumVersion));
  assert.equal(curriculum.targetItemCount, curriculum.slots.length);
  assert.equal(curriculum.authoringItemCount, curriculum.slots.length);
  assert.equal(curriculum.existingVerifiedItemCount, 0);
  assert.deepEqual(curriculum.admission, { learnerFacingContentIncluded: false, runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", questionsAuthored: 0 });
  assertNoRetiredCertificationFields(curriculum);
  assert.equal(new Set(curriculum.slots.map((slot) => slot.slotId)).size, curriculum.slots.length, "duplicate slot IDs");
  for (const slot of curriculum.slots) {
    assert.equal(slot.trackId, curriculum.trackId);
    assert.ok(slot.slotId.includes(":slot:"));
    assert.ok(slot.officialObjectiveRefs.length);
    assert.equal(slot.deliveryInteraction.familyContract, "certification");
    assert.equal(slot.deliveryInteraction.interactionType, "choice", `${slot.slotId} interaction type`);
    assert.equal(slot.deliveryInteraction.status, "existing_supported_but_not_runtime_admitted");
    assert.ok(slot.eligibleModes.length);
    assert.ok(slot.sourceRequirements.directFirstPartyDocumentation.length);
    assert.deepEqual(slot.sourceRequirements.unresolvedRequirements, []);
  }
}

function assertDirectCertificationSlotContract(curriculum, registry) {
  const objectiveIds = new Set(registry.objectives.map((objective) => objective.objectiveId));
  const registrySourceRefs = new Set(registry.sources.flatMap((source) => [source.sourceId, source.url]));
  const sourceRefs = new Set(curriculum.sourceRecords.flatMap((source) => [source.sourceId, source.url]));
  for (const slot of curriculum.slots) {
    const node = curriculum.nodes.find((entry) => entry.nodeId === slot.nodeId);
    const blockPlan = curriculum.blockPlans.find((entry) => entry.blockId === slot.blockId);
    const targetPlan = curriculum.targetPlans.find((entry) => entry.coverageTargetId === slot.coverageTargetId);
    assert.ok(node, `${slot.slotId} node owner`);
    assert.ok(blockPlan, `${slot.slotId} block-plan owner`);
    assert.ok(targetPlan, `${slot.slotId} target-plan owner`);
    assert.equal(blockPlan.nodeId, slot.nodeId, `${slot.slotId} block-plan node`);
    assert.equal(targetPlan.nodeId, slot.nodeId, `${slot.slotId} target-plan node`);
    assert.equal(targetPlan.blockId, slot.blockId, `${slot.slotId} target-plan block`);
    assert.ok(slot.officialObjectiveRefs.every((objectiveId) => targetPlan.officialObjectiveRefs.includes(objectiveId)), `${slot.slotId} objective binding`);
    assert.ok(slot.officialObjectiveRefs.every((objectiveId) => objectiveIds.has(objectiveId)), `${slot.slotId} known objectives`);
    assert.equal(slot.sourceRequirements.officialObjective.registryRef, curriculum.officialObjectiveRegistryRef, `${slot.slotId} registry ref`);
    assert.deepEqual(slot.sourceRequirements.officialObjective.objectiveRefs, slot.officialObjectiveRefs, `${slot.slotId} source objective refs`);
    assert.ok(slot.sourceRequirements.officialObjective.sourceRefs.every((sourceRef) => registrySourceRefs.has(sourceRef)), `${slot.slotId} objective sources`);
    assert.ok(slot.sourceRequirements.directFirstPartyDocumentation.every((documentation) => documentation.sourceRefs.every((sourceRef) => sourceRefs.has(sourceRef) || /^https:\/\//.test(sourceRef))), `${slot.slotId} direct documentation`);
  }
}

test("curriculum catalogue represents every release track without admitting active content", () => {
  assert.equal(curricula.length, 10);
  assert.equal(new Set(curricula.map((entry) => entry.trackId)).size, 10);
  assert.match(catalogueFingerprint(curricula), /^[a-f0-9]{64}$/);
  for (const curriculum of curricula) {
    assert.ok(curriculum.nodes.some((node) => node.nodeId === curriculum.freeNodeId && node.freeOrPremiumRole === "free"));
    if (curriculum.familyId === "certification") assertCanonicalCertificationSlots(curriculum);
    else assert.ok(curriculum.nodes.every((node) => node.packageOwnership === "whole_node_package"));
  }
});

test("certification curricula bind every canonical slot directly to its registry, ownership plan, and delivery contract", () => {
  for (const curriculum of certificationCurricula) {
    const brief = briefs.find((entry) => entry.trackId === curriculum.trackId);
    const registry = certificationRegistries.get(curriculum.trackId);
    assertDirectCertificationSlotContract(curriculum, registry);
  }
});

test("certification slot contract rejects unknown objectives, ownership drift, unsupported delivery, and duplicate slots", () => {
  const curriculum = certificationByTrackId("google-cloud-associate-cloud-engineer");
  const registry = certificationRegistries.get(curriculum.trackId);
  const unknownObjective = clone(curriculum);
  unknownObjective.slots[0].officialObjectiveRefs = ["gcp-ace-standard-9.9"];
  assert.throws(() => assertDirectCertificationSlotContract(unknownObjective, registry), /objective binding/);
  const ownershipDrift = clone(curriculum);
  ownershipDrift.slots[0].nodeId = ownershipDrift.nodes.find((node) => node.nodeId !== ownershipDrift.slots[0].nodeId).nodeId;
  assert.throws(() => assertDirectCertificationSlotContract(ownershipDrift, registry), /block-plan node/);
  const unsupportedDelivery = clone(curriculum);
  unsupportedDelivery.slots[0].deliveryInteraction.interactionType = "ordering";
  assert.throws(() => assertCanonicalCertificationSlots(unsupportedDelivery), /interaction type/);
  const duplicateSlot = clone(curriculum);
  duplicateSlot.slots[1].slotId = duplicateSlot.slots[0].slotId;
  assert.throws(() => assertCanonicalCertificationSlots(duplicateSlot), /duplicate slot IDs/);
});

test("Coding Interview preserves its 26-node canonical target while source-derived inventory owns the current count", () => {
  const coding = curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving");
  assert.equal(coding.nodes.length, 26);
  assert.equal(coding.targetItemCount, 3404);
  assert.equal(coding.authoringItemCount, coding.targetItemCount - coding.existingVerifiedItemCount);
  assert.ok(coding.nodes.every((node) => node.existingVerifiedItemCount + node.authoringItemCount === node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0)));
  assert.ok(coding.nodes.every((node) => node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0) >= 120));
});

test("Coding and Design validators retain their independent count, ownership, and mode guards", () => {
  const coding = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  const codingBrief = briefs.find((entry) => entry.trackId === coding.trackId);
  coding.nodes[0].learningBlocks[0].targetItemCount += 1;
  assert.throws(() => validateCurriculum(coding, codingBrief), /COUNT_RECONCILIATION_FAILURE/);
  const missingDirect = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  delete missingDirect.nodes[0].learningBlocks[0].coverageTargets[0].directSkillOrDecisionAtomIds;
  assert.throws(() => validateCurriculum(missingDirect, codingBrief), /MISSING_CURRICULUM_FIELD/);
  const design = clone(curricula.find((entry) => entry.trackId === "backend-system-design-interview"));
  const designBrief = briefs.find((entry) => entry.trackId === design.trackId);
  design.slots[0].sourceRequirements.sourceBindingId = "injected-binding";
  assert.throws(() => validateDesignInterviewCurriculum(design, { brief: designBrief }), /INVALID_DESIGN_RESOLVED_SLOT/);
});

test("coverage-target schema exposes direct ownership and the atomic decision boundary", async () => {
  const schema = JSON.parse(await readFile("schemas/curriculum/curriculum-coverage-target.schema.json", "utf8"));
  assert.ok(schema.required.includes("directSkillOrDecisionAtomIds"));
  assert.deepEqual(schema.properties.learningOperation.enum, ["recognition", "selection", "boundary", "decision_diagnosis"]);
  assert.equal(schema.allOf[0].then.properties.directSkillOrDecisionAtomIds.maxItems, 1);
});

test("Coding existing inventory maps every verified item without inventing per-item operations", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "patternly-coding-inventory-"));
  try {
    const { codingInventory } = await buildExistingContentInventories({ outputDirectory });
    assert.equal(codingInventory.itemCount, 3404);
    assert.deepEqual(codingInventory.classifications, { aligned: 3404 });
    assert.ok(codingInventory.items.every((item) => item.primaryCurriculumNodeId && item.primaryCurriculumBlockId && item.primarySkillOrDecisionAtomId));
    assert.ok(codingInventory.items.every((item) => !Object.hasOwn(item, "learningOperation") && !Object.hasOwn(item, "operation")));
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
});

test("curriculum specifications are separate from publishing discovery", async () => {
  const pipeline = await readFile("scripts/publishing/pipeline.mjs", "utf8");
  const publishingScripts = await readFile("scripts/publishing/cli.mjs", "utf8");
  assert.doesNotMatch(`${pipeline}\n${publishingScripts}`, /config\/curricula/);
  const gcp = certificationByTrackId("google-cloud-associate-cloud-engineer");
  assert.doesNotMatch(JSON.stringify(gcp), /ace-q-\d+/);
});

test("canonical certification registries cannot redefine their provider or trusted host roots", () => {
  for (const registry of certificationRegistries.values()) assert.doesNotThrow(() => validateCertificationObjectiveRegistry(clone(registry)));
  const gcp = certificationRegistries.get("google-cloud-associate-cloud-engineer");
  const providerMutation = clone(gcp);
  providerMutation.provider = "Example Cloud";
  assert.throws(() => validateCertificationObjectiveRegistry(providerMutation), /UNTRUSTED_CERTIFICATION_REGISTRY_ROOT/);
});
