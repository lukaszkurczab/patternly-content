import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildManifest, canonicalJson, ROOT, AuthoringFailure } from "../scripts/authoring/lib/model.mjs";
import { validateAuthoringContracts, validateManualBatch } from "../scripts/authoring/lib/contracts.mjs";

const fixed = { generatedAt: "2026-08-14", startingSha: "bde084111a66a1e08e94dcec9c9871c3af666ccb" };

function itemFor(track, slot, familyId) {
  const isCertification = familyId === "certification";
  return {
    itemId: `fixture-${slot.slotId.slice(-24)}`,
    slotId: slot.slotId,
    nodeId: slot.nodeId,
    learningBlockId: slot.learningBlockId,
    taxonomy: isCertification
      ? { examDomainId: slot.sourceBinding ? slot.sourceBinding.claimIds[0] ? track.normalized.slots.find((entry) => entry.slotId === slot.slotId).raw.primarySimulationDomainId : "unknown" : "unknown", competencyAreaId: slot.nodeId, topicId: slot.learningBlockId, skillAtomId: track.normalized.slots.find((entry) => entry.slotId === slot.slotId).raw.directSkillOrDecisionAtomId }
      : { nodeId: slot.nodeId, learningBlockId: slot.learningBlockId, skillAtomId: track.normalized.slots.find((entry) => entry.slotId === slot.slotId).raw.directSkillOrDecisionAtomId },
    prompt: "Which decision follows from all stated constraints?",
    constraints: ["All material constraints are stated before submission."],
    interaction: { type: "choice", selectionMode: "single", options: [{ optionId: "correct", text: "Apply the canonical decision." }, { optionId: "wrong", text: "Apply a keyword-only shortcut." }], acceptedOptionIds: ["correct"] },
    scoringContract: { type: "choice", resultSemantics: "exact_selected_set_with_partial_v1", selectionMode: "single" },
    feedback: { Reason: "The accepted decision follows the slot-owned constraint boundary.", Details: { mechanismOrProperty: "The mechanism is explicit.", scenarioApplication: "It applies to the stated scenario.", errorCorrection: "The shortcut ignores the decisive constraint.", boundaryOrTradeoff: "The decision changes when the boundary changes.", transfer: "Transfer when the decisive boundary changes." }, wrongOptionExplanationsByOptionId: { wrong: "This shortcut ignores the decisive constraint." }, omittedCorrectElementExplanationsByOptionId: {} },
    modeEligibility: slot.modeEligibility,
    sourceBinding: slot.sourceBinding,
    authoringProvenance: { authoringMethod: "manual", approvalStatus: "unapproved", author: "fixture-author", createdAt: "2026-08-14", contentBatchId: "fixture-authoring-batch" }
  };
}

function batchFor(result, familyId) {
  const track = result.manifest.tracks.find((entry) => entry.familyId === familyId && entry.slots.some((slot) => slot.authoringAdmitted));
  const firstSlot = track.slots.find((entry) => entry.authoringAdmitted);
  const slots = track.slots.filter((entry) => entry.learningBlockId === firstSlot.learningBlockId && entry.authoringAdmitted);
  const canonicalTrack = result.model.curricula.get(track.trackId);
  const items = slots.map((slot) => itemFor(canonicalTrack, slot, familyId));
  return {
    schemaVersion: familyId === "certification" ? "certification-manual-source-v2" : "design-interview-manual-source-v1",
    batchId: "fixture-authoring-batch",
    trackId: track.trackId,
    familyId,
    contentVersion: `${track.trackId}-authoring-v1`,
    taxonomyVersion: canonicalTrack.curriculumVersion,
    nodeId: firstSlot.nodeId,
    learningBlockId: firstSlot.learningBlockId,
    slotIds: slots.map((slot) => slot.slotId),
    items,
    authoringProvenance: { authoringMethod: "manual", approvalStatus: "unapproved", author: "fixture-author", createdAt: "2026-08-14", contentBatchId: "fixture-authoring-batch" }
  };
}

test("authoring catalogue covers ten tracks and derives current counts", async () => {
  const result = await validateAuthoringContracts(ROOT);
  assert.equal(result.manifest.trackCount, 10);
  assert.equal(result.manifest.tracks.find((track) => track.trackId === "coding-interview-dsa-problem-solving").plannedFutureSourceFileCount, 213);
  assert.equal(result.manifest.tracks.filter((track) => track.familyId === "certification").reduce((sum, track) => sum + track.authoringAdmittedItemCount, 0), 1931);
  assert.deepEqual(result.manifest.tracks.filter((track) => track.familyId === "design_interview").map((track) => track.authoringAdmittedItemCount).sort((a, b) => a - b), [8, 9, 10]);
  assert.equal(result.manifest.tracks.filter((track) => track.familyId === "design_interview").reduce((sum, track) => sum + track.blockedItemCount, 0), 296);
});

test("Certification and Design authoring batches validate their exact slot, source, feedback, and mode contracts", async () => {
  const result = await buildManifest(ROOT, fixed);
  await assert.doesNotReject(() => validateManualBatch(ROOT, batchFor(result, "certification"), { manifestResult: result }));
  await assert.doesNotReject(() => validateManualBatch(ROOT, batchFor(result, "design_interview"), { manifestResult: result }));
});

test("authoring validator rejects incomplete feedback, mode expansion, and indirect source binding", async () => {
  const result = await buildManifest(ROOT, fixed);
  const base = batchFor(result, "certification");
  const missingWrong = structuredClone(base); delete missingWrong.items[0].feedback.wrongOptionExplanationsByOptionId.wrong;
  await assert.rejects(() => validateManualBatch(ROOT, missingWrong, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "INCOMPLETE_FEEDBACK");
  const expandedMode = structuredClone(base); expandedMode.items[0].modeEligibility.push("invented-mode");
  await assert.rejects(() => validateManualBatch(ROOT, expandedMode, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "MODE_DRIFT");
  const indirect = structuredClone(base); indirect.items[0].sourceBinding.bindingId = "inferred-from-url";
  await assert.rejects(() => validateManualBatch(ROOT, indirect, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "SOURCE_BINDING_MISMATCH");
  const unknownAnswer = structuredClone(base); unknownAnswer.items[0].interaction.acceptedOptionIds = ["missing"];
  await assert.rejects(() => validateManualBatch(ROOT, unknownAnswer, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "UNKNOWN_ANSWER_ID");
  const missingReason = structuredClone(base); delete missingReason.items[0].feedback.Reason;
  await assert.rejects(() => validateManualBatch(ROOT, missingReason, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "INVALID_SCHEMA");
});

test("Design rejects productive case payloads and blocked slots instead of falling through to Certification", async () => {
  const result = await buildManifest(ROOT, fixed);
  const batch = batchFor(result, "design_interview");
  const productive = structuredClone(batch); productive.items[0].interaction.type = "free_form";
  await assert.rejects(() => validateManualBatch(ROOT, productive, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "INVALID_SCHEMA");
  const designTrack = result.manifest.tracks.find((track) => track.familyId === "design_interview");
  const blocked = designTrack.slots.find((slot) => !slot.authoringAdmitted);
  const blockedBatch = structuredClone(batch); blockedBatch.slotIds = [blocked.slotId]; blockedBatch.learningBlockId = blocked.learningBlockId; blockedBatch.nodeId = blocked.nodeId; blockedBatch.items[0].slotId = blocked.slotId; blockedBatch.items[0].learningBlockId = blocked.learningBlockId; blockedBatch.items[0].nodeId = blocked.nodeId;
  await assert.rejects(() => validateManualBatch(ROOT, blockedBatch, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "INCOMPLETE_BATCH");
});

test("planning is byte-deterministic and the runtime publisher has explicit family boundaries", async () => {
  const first = await buildManifest(ROOT, fixed);
  const second = await buildManifest(ROOT, fixed);
  assert.equal(canonicalJson(first.manifest), canonicalJson(second.manifest));
  const pipeline = await readFile("scripts/publishing/pipeline.mjs", "utf8");
  assert.match(pipeline, /FAMILY_RUNTIME_DISPATCH/);
  assert.match(pipeline, /UNSUPPORTED_RUNTIME_FAMILY/);
  assert.match(pipeline, /design_interview/);
  assert.doesNotMatch(pipeline, /familyId === "coding_interview" \? "coding-interview-manual-source\.schema\.json" : "certification-manual-source\.schema\.json"/);
});
