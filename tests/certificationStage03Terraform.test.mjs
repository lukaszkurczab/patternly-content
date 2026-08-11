import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { dedupeFingerprint } from "../scripts/curriculum/certification-planned-slots.mjs";
import { artifactFingerprintForPlan, loadAndValidateStage03TerraformCandidatePlan, loadStage03TerraformCandidatePlan, loadStage03TerraformSourceAnchors, validateStage03TerraformCandidatePlan } from "../scripts/curriculum/certification-stage03-terraform.mjs";
import { discoverSourceBatches } from "../scripts/publishing/pipeline.mjs";

const root = process.cwd();
const plan = await loadStage03TerraformCandidatePlan(root);
const candidate = (mutate) => { const copy = structuredClone(plan); mutate(copy); return validateStage03TerraformCandidatePlan(copy, { root }); };
const rehashedCandidate = (mutate) => { const copy = structuredClone(plan); mutate(copy); copy.artifactFingerprint = artifactFingerprintForPlan(copy); return validateStage03TerraformCandidatePlan(copy, { root }); };

test("CERT-CORR-03-TERRAFORM is an explicit two-node non-runtime plan", async () => {
  const result = await loadAndValidateStage03TerraformCandidatePlan({ root });
  assert.equal(result.slotCount, 285); assert.equal(result.targetCount, 55); assert.equal(result.blockCount, 32); assert.equal(result.sourceCount, 60);
  assert.deepEqual(result.nodeCounts, { terraform_configuration_foundations: 127, terraform_delivery_state_and_hcp_operations: 158 });
  assert.equal(result.runtimeReachability.admitted, false);
});

test("Terraform artifact and anchors fail closed on co-mutation", async () => {
  await assert.rejects(candidate((copy) => { copy.slots[40].questionIntent = "generic scenario"; }), /STAGE03_TERRAFORM_ARTIFACT_FINGERPRINT_MISMATCH/);
  await assert.rejects(rehashedCandidate((copy) => { copy.slots[40].materialEvidenceOrConstraintChanged[0] = "materially changed Terraform evidence"; }), /STAGE03_TERRAFORM_FINGERPRINT_MISMATCH/);
  await assert.rejects(rehashedCandidate((copy) => { const slot = copy.slots[40]; slot.materialEvidenceOrConstraintChanged[0] = "distinct persisted Terraform evidence"; slot.questionIntent = "generic scenario"; slot.dedupeFingerprint = dedupeFingerprint(slot); }), /STAGE03_TERRAFORM_INVALID_SLOT_SEMANTICS/);
  await assert.rejects(rehashedCandidate((copy) => { const source = copy.slots[40], target = copy.slots[41]; for (const key of ["learningOperation", "questionIntent", "materialEvidenceOrConstraintChanged", "expectedOutcome", "errorModelOrFailureMode", "decisiveBoundary", "transferBoundary"]) target[key] = structuredClone(source[key]); target.dedupeFingerprint = dedupeFingerprint(target); }), /STAGE03_TERRAFORM_INVALID_SLOT_SEMANTICS/);
  await assert.rejects(candidate((copy) => { copy.pilotTransferBoundaries[Object.keys(copy.pilotTransferBoundaries)[0]] = "Changed external transfer boundary with meaningful semantics."; }), /STAGE03_TERRAFORM_ARTIFACT_FINGERPRINT_MISMATCH/);
  await assert.rejects(rehashedCandidate((copy) => { copy.sourceRecords[0].checkedDate = "2020-01-01"; }), /STAGE03_TERRAFORM_SOURCE_ANCHOR_MISMATCH/);
  const fixture = await mkdtemp(join(tmpdir(), "stage03-terraform-anchor-"));
  try { const file = "schemas/curriculum/certification-planned-slot-stage03-terraform-source-anchors.json"; await mkdir(join(fixture, "schemas/curriculum"), { recursive: true }); await cp(file, join(fixture, file)); const payload = JSON.parse(await readFile(join(fixture, file), "utf8")); payload.sourceRecords[0].url = "https://example.com"; await writeFile(join(fixture, file), JSON.stringify(payload)); await assert.rejects(loadStage03TerraformSourceAnchors(fixture), /STAGE03_TERRAFORM_SOURCE_ANCHOR_DIGEST_MISMATCH/); } finally { await rm(fixture, { recursive: true, force: true }); }
});

test("Terraform rejects ownership, floor, source, mode and provider-fidelity drift", async () => {
  await assert.rejects(rehashedCandidate((copy) => { copy.candidateNodeOwnership[copy.slots[0].slotId] = "terraform_configuration_foundations"; }), /STAGE03_TERRAFORM_DERIVED_COUNT_DRIFT|STAGE03_TERRAFORM_INVALID_TARGET/);
  await assert.rejects(rehashedCandidate((copy) => { copy.candidateNodes[1].prerequisiteNodeIds = []; }), /STAGE03_TERRAFORM_PREREQUISITE_DAG/);
  await assert.rejects(rehashedCandidate((copy) => { copy.candidateCrossNodeRelationships[0].fromBlockId = "not_a_real_block"; }), /STAGE03_TERRAFORM_INVALID_RELATIONSHIPS/);
  await assert.rejects(rehashedCandidate((copy) => { copy.freePremiumAndModeFeasibility.eligibleModeCounts["certification-exam-simulation"] += 1; }), /STAGE03_TERRAFORM_MODE_FEASIBILITY/);
  await assert.rejects(rehashedCandidate((copy) => { copy.slots[40].deliveryInteraction.interactionType = "multiple_select"; }), /STAGE03_TERRAFORM_INVALID_SLOT_MODE/);
  await assert.rejects(rehashedCandidate((copy) => { const slot = copy.slots[40]; slot.sourceRequirements.directFirstPartyDocumentation[0].testedProperties = ["declarative_iac_unsupported"]; slot.dedupeFingerprint = dedupeFingerprint(slot); }), /STAGE03_TERRAFORM_INVALID_SLOT_SOURCE/);
  await assert.rejects(rehashedCandidate((copy) => { const slot = copy.slots[40]; slot.sourceRequirements.directFirstPartyDocumentation[0].sourceRefs = ["terraform-iac-intro"]; slot.dedupeFingerprint = dedupeFingerprint(slot); }), /STAGE03_TERRAFORM_INVALID_SLOT_SOURCE/);
  await assert.rejects(rehashedCandidate((copy) => { const slot = copy.slots[40]; slot.sourceRequirements.directFirstPartyDocumentation[0].testedProperties = []; slot.dedupeFingerprint = dedupeFingerprint(slot); }), /STAGE03_TERRAFORM_INVALID_SLOT_SOURCE|STAGE03_TERRAFORM_INVALID_SLOT_SEMANTICS/);
  await assert.rejects(rehashedCandidate((copy) => { copy.examSimulationBlueprint.candidatePracticeForm.unsupportedProviderFormat.status = "supported"; }), /STAGE03_TERRAFORM_INVALID_BLUEPRINT/);
  await assert.rejects(rehashedCandidate((copy) => { copy.simulationDomainOwnership[copy.slots[40].slotId].objectiveRef = "terraform-associate-004-not-an-objective"; }), /STAGE03_TERRAFORM_INVALID_DOMAIN_OWNERSHIP/);
});

test("Terraform reconciled provenance covers every tested property and preserves the pilot", async () => {
  const pilot = JSON.parse(await readFile("evidence/certification/planned-item-slots/hashicorp-terraform-associate-004--state_backends_and_drift.json", "utf8"));
  assert.deepEqual(plan.slots.slice(0, pilot.slots.length), pilot.slots);
  const sources = new Map(plan.sourceRecords.map((source) => [source.sourceId, source]));
  const uncovered = plan.slots.flatMap((slot) => slot.sourceRequirements.directFirstPartyDocumentation.flatMap((requirement) => requirement.testedProperties.filter((property) => !requirement.sourceRefs.some((sourceId) => sources.get(sourceId)?.authoritativeFor.includes(property))).map((property) => `${slot.slotId}/${property}`)));
  assert.deepEqual(uncovered, []);
});

test("Terraform stage03 evidence is not publishing input", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "stage03-terraform-runtime-"));
  try { await mkdir(join(fixture, "manual/source/candidate-track"), { recursive: true }); await mkdir(join(fixture, "evidence/certification/planned-item-slot-track-plans"), { recursive: true }); await writeFile(join(fixture, "manual/source/candidate-track/source.json"), "{}"); await writeFile(join(fixture, "evidence/certification/planned-item-slot-track-plans/candidate.json"), JSON.stringify(plan)); assert.deepEqual((await discoverSourceBatches(fixture, "candidate-track")).map((entry) => entry.path), [join(fixture, "manual/source/candidate-track/source.json")]); } finally { await rm(fixture, { recursive: true, force: true }); }
});
