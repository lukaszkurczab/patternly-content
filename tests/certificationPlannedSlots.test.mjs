import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { dedupeFingerprint, loadAndValidateCertificationPlannedSlotPlans, loadCandidateSourceAnchors, loadCertificationPlannedSlotPlans, validateCertificationPlannedSlotPlans } from "../scripts/curriculum/certification-planned-slots.mjs";
import { discoverSourceBatches, validateCanonicalJsonSchema } from "../scripts/publishing/pipeline.mjs";

const root = process.cwd();
const clone = (value) => structuredClone(value);
const plans = await loadCertificationPlannedSlotPlans({ root });
const valid = async (mutate) => { const copy = clone(plans); mutate(copy); return validateCertificationPlannedSlotPlans(copy, { root }); };

test("CERT-CORR-02 candidate plans contain the exact three pilots and are not runtime admitted", async () => {
  const result = await loadAndValidateCertificationPlannedSlotPlans({ root });
  assert.equal(result.slots.length, 94);
  assert.deepEqual(result.counts.nodes.map(({ trackId, nodeId, slotCount }) => [trackId, nodeId, slotCount]), [["google-cloud-associate-cloud-engineer", "setup_environment", 28], ["hashicorp-terraform-associate-004", "state_backends_and_drift", 31], ["microsoft-azure-ai-fundamentals-ai-901", "foundry_prompts_and_model_clients", 35]]);
  assert.equal(result.runtimeReachability.admitted, false);
});

test("planned-slot validation rejects duplicate and wording-only semantic identities", async () => {
  await assert.rejects(valid((copy) => { copy[0].slots[1].slotId = copy[0].slots[0].slotId; }), /DUPLICATE_CERTIFICATION_PLANNED_SLOT_ID/);
  await assert.rejects(valid((copy) => { copy[0].slots[1].dedupeFingerprint = copy[0].slots[0].dedupeFingerprint; }), /CERTIFICATION_PLANNED_SLOT_FINGERPRINT_MISMATCH/);
  await assert.rejects(valid((copy) => { const slot = copy[0].slots[1]; Object.assign(slot, clone(copy[0].slots[0]), { slotId: slot.slotId, questionIntent: "Wording only changed." }); slot.dedupeFingerprint = dedupeFingerprint(slot); }), /DUPLICATE_CERTIFICATION_PLANNED_SLOT_FINGERPRINT/);
});

test("planned-slot validation rejects invalid ownership, source, interaction, learner fields, fingerprint and count drift", async () => {
  await assert.rejects(valid((copy) => { const slot = copy[0].slots[0]; slot.coverageTargetId = "absent"; slot.slotId = "absent:slot:semantic-key"; }), /INVALID_CERTIFICATION_PLANNED_SLOT_REFERENCE/);
  await assert.rejects(valid((copy) => { copy[0].slots[0].officialObjectiveRefs = ["foreign-objective"]; }), /INVALID_CERTIFICATION_PLANNED_SLOT_OBJECTIVES/);
  await assert.rejects(valid((copy) => { copy[0].slots[0].sourceRequirements.directFirstPartyDocumentation[0].sourceRefs = ["google-ace-standard-exam-guide"]; }), /INVALID_CERTIFICATION_PLANNED_SLOT_SOURCE/);
  await assert.rejects(valid((copy) => { copy[0].slots[0].sourceRequirements.directFirstPartyDocumentation[0].testedProperties = []; }), /INVALID_CERTIFICATION_PLANNED_SLOT_SOURCE/);
  await assert.rejects(valid((copy) => { copy[0].sourceRecords[0].checkedDate = "2026-08-10"; }), /INVALID_CERTIFICATION_PLANNED_SLOT_SOURCE/);
  await assert.rejects(valid((copy) => { copy[0].sourceRecords[0].resolutionState = "resolved"; }), /INVALID_CERTIFICATION_PLANNED_SLOT_SOURCE/);
  await assert.rejects(valid((copy) => { copy[0].sourceRecords[0].url = "https://docs.cloud.google.com.evil.example/path"; }), /INVALID_CERTIFICATION_PLANNED_SLOT_SOURCE/);
  await assert.rejects(valid((copy) => { copy[0].sourceRecords[0].url = "https://docs.cloud.google.com/"; }), /INVALID_CERTIFICATION_PLANNED_SLOT_SOURCE_ANCHOR/);
  await assert.rejects(valid((copy) => { copy[0].sourceRecords[0].url = `${copy[0].sourceRecords[0].url}?x=1`; }), /INVALID_CERTIFICATION_PLANNED_SLOT_SOURCE_ANCHOR/);
  await assert.rejects(valid((copy) => { copy[0].sourceRecords[0].authoritativeFor.push("invented"); }), /INVALID_CERTIFICATION_PLANNED_SLOT_SOURCE_ANCHOR/);
  await assert.rejects(valid((copy) => { copy[0].slots[0].deliveryInteraction.interactionType = "ordering"; }), /UNSUPPORTED_CERTIFICATION_PLANNED_SLOT_MODE/);
  await assert.rejects(valid((copy) => { copy[0].slots[0].question = "forbidden"; }), /LEARNER_FACING_CONTENT_FIELD/);
  await assert.rejects(valid((copy) => { copy[0].slots[0].dedupeFingerprint = "0".repeat(64); }), /CERTIFICATION_PLANNED_SLOT_FINGERPRINT_MISMATCH/);
  await assert.rejects(valid((copy) => { copy[0].slots[0].neighborDistinctness = [{ neighborSlotId: "missing", explanation: "changed evidence resolves a decision" }]; }), /INVALID_CERTIFICATION_PLANNED_SLOT_NEIGHBOR/);
  await assert.rejects(valid((copy) => { const slot = copy[0].slots[0]; slot.neighborDistinctness = [{ neighborSlotId: slot.slotId, explanation: "This slot changes attachment scope and resolves classification; the neighbouring slot owns attachment scope and resolves classification." }]; }), /INVALID_CERTIFICATION_PLANNED_SLOT_NEIGHBOR/);
  await assert.rejects(valid((copy) => { copy[0].derivedCounts = { planSlotCount: 1 }; }), /CERTIFICATION_PLANNED_SLOT_COUNT_DRIFT/);
});

test("declarative schema rejects an incomplete candidate plan", async () => {
  const schema = JSON.parse(await readFile("schemas/curriculum/certification-planned-slot.schema.json", "utf8")); const copy = clone(plans[0]); delete copy.slots[0].dedupeFingerprint;
  assert.throws(() => validateCanonicalJsonSchema(copy, schema, "candidate"), /INVALID_SCHEMA/);
});

test("candidate source anchors are executable trust roots, not co-mutable plan metadata", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "planned-slot-anchor-"));
  try { await mkdir(join(fixture, "schemas/curriculum"), { recursive: true }); const anchor = "schemas/curriculum/certification-planned-slot-source-anchors.json"; await cp(anchor, join(fixture, anchor)); const data = JSON.parse(await readFile(join(fixture, anchor), "utf8")); data.anchors[0].url = "https://docs.cloud.google.com/"; await writeFile(join(fixture, anchor), JSON.stringify(data)); await assert.rejects(loadCandidateSourceAnchors(fixture), /SOURCE_ANCHOR_DIGEST_MISMATCH/); } finally { await rm(fixture, { recursive: true, force: true }); }
});

test("candidate plans are absent from actual publishing source discovery", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "planned-slot-runtime-"));
  try {
    await mkdir(join(fixture, "manual/source/candidate-track"), { recursive: true }); await mkdir(join(fixture, "evidence/certification"), { recursive: true });
    await writeFile(join(fixture, "manual/source/candidate-track/source.json"), "{}"); await writeFile(join(fixture, "evidence/certification/candidate.json"), JSON.stringify(plans[0]));
    assert.deepEqual((await discoverSourceBatches(fixture, "candidate-track")).map((entry) => entry.path), [join(fixture, "manual/source/candidate-track/source.json")]);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});
