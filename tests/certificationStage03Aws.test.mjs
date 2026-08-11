import assert from "node:assert/strict";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { artifactFingerprintForPlan, loadAndValidateStage03AwsCandidatePlan, loadStage03AwsCandidatePlan, loadStage03AwsSourceEvidence, loadStage03AwsTrustRoot, validateStage03AwsCandidatePlan } from "../scripts/curriculum/certification-stage03-aws.mjs";
import { discoverSourceBatches } from "../scripts/publishing/pipeline.mjs";

const root = process.cwd(), plan = await loadStage03AwsCandidatePlan(root);
const candidate = (mutate, rehash = true) => { const copy = structuredClone(plan); mutate(copy); if (rehash) copy.artifactFingerprint = artifactFingerprintForPlan(copy); return validateStage03AwsCandidatePlan(copy, { root }); };
const rejects = async (cases) => { for (const [name, mutate, code, raw] of cases) await test(name, async () => assert.rejects(candidate(mutate, !raw), new RegExp(code))); };

test("AWS closes the reconciled evidence-only three-node candidate", async () => {
  const result = await loadAndValidateStage03AwsCandidatePlan({ root });
  assert.deepEqual({ slots: result.slotCount, targets: result.targetCount, blocks: result.blockCount, sources: result.sourceCount }, { slots: 446, targets: 76, blocks: 39, sources: 71 });
  assert.deepEqual(result.nodeCounts, { aws_secure_architecture_foundations: 134, aws_resilient_and_high_performance_systems: 169, aws_network_data_and_cost_optimization: 143 });
  assert.deepEqual(result.runtimeReachability, { admitted: false, proof: "discoverSourceBatches only reads manual/source/<trackId>; this candidate is evidence-only." });
});

await rejects([
  ["semantic identity tampering fails", (p) => { p.slots[0].questionIntent = "generic AWS scenario"; }, "SEMANTIC_OR_SOURCE_FORGERY"],
  ["direct source property tampering fails", (p) => { p.slots[0].sourceRequirements.directFirstPartyDocumentation[0].sourceRefs = [p.sourceRecords[1].sourceId]; }, "INVALID_SOURCE_PROPERTY_OWNERSHIP|SEMANTIC_OR_SOURCE_FORGERY"],
  ["source roster tampering fails", (p) => { p.sourceRecords[0].authoritativeFor.push("forged"); }, "SOURCE_ANCHOR_MISMATCH"],
  ["objective ownership tampering fails", (p) => { p.slots[0].primarySimulationObjectiveRef = "forged"; }, "INVALID_SLOT_CONTRACT|SEMANTIC_OR_SOURCE_FORGERY"],
  ["official objective source reference forgery fails", (p) => { p.slots[0].sourceRequirements.officialObjective.sourceRefs[0] = "forged"; }, "INVALID_SLOT_CONTRACT"],
  ["whole block ownership tampering fails", (p) => { p.blockPlans[0].candidateNodeId = "aws_resilient_and_high_performance_systems"; }, "BLOCK_DRIFT"],
  ["node prerequisite tampering fails", (p) => { p.candidateNodes[2].prerequisiteNodeIds = []; }, "NODE_OR_DAG_DRIFT"],
  ["cross-node edge endpoint tampering fails", (p) => { p.candidateCrossNodeRelationships[0].fromBlockId = "forged"; }, "EDGE_DRIFT"],
  ["candidate edge roster deletion fails", (p) => { p.candidateCrossNodeRelationships.pop(); }, "EDGE_DRIFT"],
  ["mode capacity tampering fails", (p) => { p.freePremiumAndModeFeasibility.requiredUniqueItems["certification-focus-practice"] = 0; }, "MODE_FEASIBILITY"],
  ["practice form fidelity tampering fails", (p) => { p.examSimulationBlueprint.patternlyPracticeForm.providerFaithful = true; }, "DECLARATION_SURFACE_MISMATCH|SIMULATION_PROFILE_DRIFT"],
  ["learner content tampering fails", (p) => { p.questions = ["forged"]; }, "DECLARATION_SURFACE_MISMATCH|LEARNER_FIELD"],
  ["nested approval declaration fails", (p) => { p.auditEvidence.review = { humanApproval: "granted" }; }, "DECLARATION_SURFACE_MISMATCH"],
  ["nested runtime admission declaration fails", (p) => { p.auditEvidence.review = { runtimeAdmission: "admitted" }; }, "DECLARATION_SURFACE_MISMATCH"],
  ["nested learner choice and answer injection fails", (p) => { p.auditEvidence.review = { choices: [{ correctAnswer: "forged" }] }; }, "LEARNER_FIELD"],
  ["non-repository evidence artifact fails", (p) => { p.sourceVerification.evidenceArtifact = "/tmp/forged.json"; }, "SOURCE_EVIDENCE_MISMATCH"],
  ["fixed corrected fingerprint rejects recomputation", (p) => { p.artifactFingerprint = "0".repeat(64); }, "BOUNDARY_OR_FINGERPRINT_DRIFT", true],
]);

test("AWS evidence candidate is never publishing discovery input", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "stage03-aws-discovery-"));
  try {
    const track = "candidate-track", source = join(fixture, "manual/source", track, "source.json"), evidence = join(fixture, "evidence/certification/planned-item-slot-track-plans", "candidate.json");
    await mkdir(join(fixture, "manual/source", track), { recursive: true }); await mkdir(join(fixture, "evidence/certification/planned-item-slot-track-plans"), { recursive: true });
    await writeFile(source, "{}"); await writeFile(evidence, JSON.stringify(plan));
    const found = await discoverSourceBatches(fixture, track);
    assert.deepEqual(found.map((entry) => entry.path), [source]); assert.equal(found.some((entry) => entry.path === evidence), false);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});

test("AWS durable HTTP evidence fails closed on missing, wrong-host, and duplicate rows", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "stage03-aws-evidence-"));
  try {
    const path = join(fixture, "evidence/certification/stage03-aws-source-http-check.json"); await mkdir(join(fixture, "evidence/certification"), { recursive: true });
    await assert.rejects(loadStage03AwsSourceEvidence(fixture, plan)); await copyFile(join(root, "evidence/certification/stage03-aws-source-http-check.json"), path);
    const evidence = JSON.parse(await (await import("node:fs/promises")).readFile(path, "utf8")); evidence.results[0].finalHost = "evil.example"; await writeFile(path, JSON.stringify(evidence)); await assert.rejects(loadStage03AwsSourceEvidence(fixture, plan), /SOURCE_EVIDENCE_MISMATCH/);
    evidence.results[0].finalHost = "docs.aws.amazon.com"; evidence.results[1].sourceId = evidence.results[0].sourceId; await writeFile(path, JSON.stringify(evidence)); await assert.rejects(loadStage03AwsSourceEvidence(fixture, plan), /SOURCE_EVIDENCE_MISMATCH/);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});

test("AWS trust-root co-mutation fails against the executable digest", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "stage03-aws-trust-"));
  try {
    const path = join(fixture, "schemas/curriculum/certification-planned-slot-stage03-aws-trust-root.json"); await mkdir(join(fixture, "schemas/curriculum"), { recursive: true }); await copyFile(join(root, "schemas/curriculum/certification-planned-slot-stage03-aws-trust-root.json"), path);
    const trust = JSON.parse(await (await import("node:fs/promises")).readFile(path, "utf8")); trust.sourceRecords[0].provenance.verificationState = "forged"; await writeFile(path, JSON.stringify(trust)); await assert.rejects(loadStage03AwsTrustRoot(fixture), /TRUST_ROOT_DIGEST_MISMATCH/);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});
