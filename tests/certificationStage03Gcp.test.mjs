import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { dedupeFingerprint } from "../scripts/curriculum/certification-planned-slots.mjs";
import { artifactFingerprintForPlan, loadAndValidateStage03GcpCandidatePlan, loadStage03GcpCandidatePlan, loadStage03GcpSourceAnchors, validateStage03GcpCandidatePlan } from "../scripts/curriculum/certification-stage03-gcp.mjs";
import { discoverSourceBatches } from "../scripts/publishing/pipeline.mjs";

const root = process.cwd();
const plan = await loadStage03GcpCandidatePlan(root);
const candidate = (mutate) => { const copy = structuredClone(plan); mutate(copy); return validateStage03GcpCandidatePlan(copy, { root }); };
const rehashedCandidate = (mutate) => { const copy = structuredClone(plan); mutate(copy); copy.artifactFingerprint = artifactFingerprintForPlan(copy); return validateStage03GcpCandidatePlan(copy, { root }); };

test("CERT-CORR-03-GCP is a concrete two-node non-runtime plan", async () => {
  const result = await loadAndValidateStage03GcpCandidatePlan({ root });
  assert.equal(result.slotCount, 361); assert.equal(result.targetCount, 66); assert.equal(result.blockCount, 36); assert.equal(result.sourceCount, 113);
  assert.deepEqual(result.nodeCounts, { setup_environment: 124, compute_engine_delivery_and_operations: 237 });
  assert.equal(result.runtimeReachability.admitted, false);
});

test("Stage03 protects the full candidate artifact against content or anchor co-mutation", async () => {
  await assert.rejects(candidate((copy) => { copy.slots[30].questionIntent = "generic scenario"; copy.slots[30].dedupeFingerprint = dedupeFingerprint(copy.slots[30]); }), /STAGE03_GCP_ARTIFACT_FINGERPRINT_MISMATCH/);
  await assert.rejects(candidate((copy) => { copy.sourceRecords[0].authoritativeFor.push("co-mutated"); }), /STAGE03_GCP_ARTIFACT_FINGERPRINT_MISMATCH/);
  await assert.rejects(rehashedCandidate((copy) => { copy.sourceRecords[0].checkedDate = "2020-01-01"; }), /STAGE03_GCP_SOURCE_ANCHOR_MISMATCH/);
  const fixture = await mkdtemp(join(tmpdir(), "stage03-gcp-anchor-"));
  try { const file = "schemas/curriculum/certification-planned-slot-stage03-gcp-source-anchors.json"; await mkdir(join(fixture, "schemas/curriculum"), { recursive: true }); await cp(file, join(fixture, file)); const payload = JSON.parse(await readFile(join(fixture, file), "utf8")); payload.sourceRecords[0].checkedDate = "2020-01-01"; await writeFile(join(fixture, file), JSON.stringify(payload)); await assert.rejects(loadStage03GcpSourceAnchors(fixture), /STAGE03_GCP_SOURCE_ANCHOR_DIGEST_MISMATCH/); } finally { await rm(fixture, { recursive: true, force: true }); }
});

test("Stage03 rejects DAG, source date, and simulation ownership drift", async () => {
  await assert.rejects(rehashedCandidate((copy) => { copy.candidateNodes[1].prerequisiteNodeIds = []; }), /STAGE03_GCP_PREREQUISITE_DAG_DRIFT/);
  await assert.rejects(rehashedCandidate((copy) => { copy.simulationDomainOwnership[copy.slots[0].slotId].objectiveRef = "gcp-ace-standard-1.1"; }), /STAGE03_GCP_INVALID_SIMULATION_OWNERSHIP/);
  await assert.rejects(rehashedCandidate((copy) => { copy.examSimulationBlueprint.candidatePracticeForm.activeInteractionType = "multiple_select"; }), /STAGE03_GCP_INVALID_BLUEPRINT_PROFILE|STAGE03_GCP_UNSUPPORTED_INTERACTION/);
  await assert.rejects(rehashedCandidate((copy) => { copy.boundaryRelationshipRemap.retainedAsCrossNodeEvidence[0].toBlockId = "vpc_subnet_shared_vpc"; }), /STAGE03_GCP_INVALID_RELATIONSHIP_REMAP/);
  await assert.rejects(rehashedCandidate((copy) => { const nonpilot = copy.slots.find((slot) => slot.currentNodeId === "data_solution_delivery_and_operations"); nonpilot.transferBoundary = null; }), /STAGE03_GCP_INVALID_SLOT_SEMANTICS/);
  await assert.rejects(rehashedCandidate((copy) => { const nonpilot = copy.slots.find((slot) => slot.currentNodeId === "data_solution_delivery_and_operations"); nonpilot.questionIntent = "Resolve node from this concrete evidence"; }), /STAGE03_GCP_INVALID_SLOT_SEMANTICS/);
  await assert.rejects(rehashedCandidate((copy) => { const nonpilot = copy.slots.find((slot) => slot.currentNodeId === "compute_engine_delivery_and_operations"); nonpilot.transferBoundary = "Leave this operation; transfer to the neighboring same-target decision using the changed evidence and source property."; }), /STAGE03_GCP_INVALID_SLOT_SEMANTICS/);
});

test("Stage03 evidence is not runtime publishing input", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "stage03-gcp-runtime-"));
  try { await mkdir(join(fixture, "manual/source/candidate-track"), { recursive: true }); await mkdir(join(fixture, "evidence/certification/planned-item-slot-track-plans"), { recursive: true }); await writeFile(join(fixture, "manual/source/candidate-track/source.json"), "{}"); await writeFile(join(fixture, "evidence/certification/planned-item-slot-track-plans/candidate.json"), JSON.stringify(plan)); assert.deepEqual((await discoverSourceBatches(fixture, "candidate-track")).map((entry) => entry.path), [join(fixture, "manual/source/candidate-track/source.json")]); } finally { await rm(fixture, { recursive: true, force: true }); }
});
