import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildManifest, canonical, canonicalJson, compare, loadAuthoringModel, readJson, repoFiles, validateSchema, AuthoringFailure, sourceHashEntries } from "./model.mjs";

const GENERIC_FEEDBACK = new Set(["correct answer", "incorrect", "see explanation", "n/a", "not applicable"]);
const asArray = (value, label) => { if (!Array.isArray(value)) throw new AuthoringFailure("INVALID_CONTRACT", `${label} must be an array.`); return value; };
const text = (value, label) => { if (typeof value !== "string" || !value.trim()) throw new AuthoringFailure("INVALID_CONTRACT", `${label} must be a non-empty string.`); return value; };
const exact = (left, right) => canonicalJson([...left].sort(compare)) === canonicalJson([...right].sort(compare));
const unique = (values, label) => { if (new Set(values).size !== values.length) throw new AuthoringFailure("DUPLICATE_ID", `${label} contains duplicates.`); };

async function schemaFor(root, familyId) {
  const path = familyId === "certification" ? "schemas/publishing/certification-manual-source.schema.json" : familyId === "design_interview" ? "schemas/publishing/design-interview-manual-source.schema.json" : null;
  if (!path) throw new AuthoringFailure("UNSUPPORTED_AUTHORING_FAMILY", `No authoring source contract exists for ${familyId}.`);
  return { path, schema: await readJson(root, path) };
}

function expectedTaxonomy(slot, familyId) {
  if (familyId === "certification") return {
    examDomainId: slot.raw.primarySimulationDomainId,
    competencyAreaId: slot.nodeId,
    topicId: slot.learningBlockId,
    skillAtomId: slot.raw.directSkillOrDecisionAtomId
  };
  return { nodeId: slot.nodeId, learningBlockId: slot.learningBlockId, skillAtomId: slot.raw.directSkillOrDecisionAtomId };
}

function checkFeedback(item, slot) {
  const feedback = item.feedback;
  if (GENERIC_FEEDBACK.has(feedback.Reason.trim().toLocaleLowerCase())) throw new AuthoringFailure("INVALID_FEEDBACK", `${item.itemId} uses generic Reason feedback.`);
  const optionIds = item.interaction.options.map((option) => option.optionId);
  const accepted = item.interaction.acceptedOptionIds;
  const wrong = optionIds.filter((id) => !accepted.includes(id));
  const wrongKeys = Object.keys(feedback.wrongOptionExplanationsByOptionId ?? {});
  if (!exact(wrongKeys, wrong) || wrongKeys.some((id) => !text(feedback.wrongOptionExplanationsByOptionId[id], `${item.itemId} wrong-option feedback ${id}`))) throw new AuthoringFailure("INCOMPLETE_FEEDBACK", `${item.itemId} must explain every active wrong option and no unknown option.`);
  const omitted = Object.keys(feedback.omittedCorrectElementExplanationsByOptionId ?? {});
  const expectedOmitted = item.interaction.selectionMode === "multiple" ? accepted : [];
  if (!exact(omitted, expectedOmitted) || omitted.some((id) => !text(feedback.omittedCorrectElementExplanationsByOptionId[id], `${item.itemId} omitted-correct feedback ${id}`))) throw new AuthoringFailure("INCOMPLETE_FEEDBACK", `${item.itemId} omitted-correct feedback does not match the selection model.`);
  for (const key of ["mechanismOrProperty", "scenarioApplication", "errorCorrection", "boundaryOrTradeoff"]) text(feedback.Details[key], `${item.itemId} Details.${key}`);
  if (slot.transferBoundary && !text(feedback.Details.transfer, `${item.itemId} Details.transfer`)) throw new AuthoringFailure("INCOMPLETE_DETAILS", `${item.itemId} must author transfer feedback for its transfer boundary.`);
}

function checkInteraction(item, family, slot) {
  const interaction = item.interaction;
  const supportedInteractions = family.supportedAuthoringInteractions.map((entry) => typeof entry === "string" ? entry : entry.interactionType);
  if (!supportedInteractions.includes(interaction.type)) throw new AuthoringFailure("UNSUPPORTED_INTERACTION", `${item.itemId} uses ${interaction.type}, which is not supported by ${family.familyId}.`);
  unique(interaction.options.map((option) => option.optionId), `${item.itemId} option IDs`);
  unique(interaction.acceptedOptionIds, `${item.itemId} accepted option IDs`);
  const optionIds = new Set(interaction.options.map((option) => option.optionId));
  if (interaction.acceptedOptionIds.some((id) => !optionIds.has(id))) throw new AuthoringFailure("UNKNOWN_ANSWER_ID", `${item.itemId} accepts an option that is not present.`);
  if (interaction.selectionMode === "single" && interaction.acceptedOptionIds.length !== 1) throw new AuthoringFailure("INVALID_SCORING", `${item.itemId} single choice must have exactly one accepted option.`);
  if (interaction.selectionMode === "multiple" && interaction.acceptedOptionIds.length < 2) throw new AuthoringFailure("INVALID_SCORING", `${item.itemId} multiple choice must have at least two accepted options.`);
  if (item.scoringContract.type !== "choice" || item.scoringContract.resultSemantics !== "exact_selected_set_with_partial_v1" || item.scoringContract.selectionMode !== interaction.selectionMode) throw new AuthoringFailure("INVALID_SCORING", `${item.itemId} scoring does not match its interaction selection model.`);
  if (slot.interaction?.type !== interaction.type || slot.interaction?.selectionMode !== interaction.selectionMode) throw new AuthoringFailure("INTERACTION_DRIFT", `${item.itemId} interaction differs from the canonical slot contract.`);
}

function checkProvenance(provenance, batchId, label) {
  if (provenance.authoringMethod !== "manual" || provenance.approvalStatus !== "unapproved") throw new AuthoringFailure("INVALID_PROVENANCE", `${label} must be manual and unapproved.`);
  for (const key of ["author", "createdAt", "contentBatchId"]) text(provenance[key], `${label}.${key}`);
  if (provenance.contentBatchId !== batchId) throw new AuthoringFailure("INVALID_PROVENANCE", `${label}.contentBatchId must equal ${batchId}.`);
}

function checkSourceBinding(item, slot, familyId) {
  if (!slot.sourceBinding || slot.sourceStatus !== "exact_direct") throw new AuthoringFailure("SOURCE_BLOCKED", `${item.itemId} is bound to a slot without exact direct source admission.`);
  const binding = item.sourceBinding;
  const expected = slot.sourceBinding;
  if (binding.bindingId !== expected.bindingId || !exact(binding.claimIds, expected.claimIds) || !exact(binding.anchorIds, expected.anchorIds) || !exact(binding.sourceRefs, expected.sourceRefs)) throw new AuthoringFailure("SOURCE_BINDING_MISMATCH", `${item.itemId} source binding is not exact for its slot.`);
  if (familyId === "design_interview" && !binding.bindingId.startsWith("design-binding:")) throw new AuthoringFailure("SOURCE_BINDING_MISMATCH", `${item.itemId} Design source binding is not a direct registry binding.`);
}

export async function validateManualBatch(root, batch, { manifestResult } = {}) {
  const model = manifestResult?.model ?? await loadAuthoringModel(root);
  const manifest = manifestResult?.manifest ?? (await buildManifest(root)).manifest;
  const track = model.curricula.get(batch.trackId);
  if (!track) throw new AuthoringFailure("UNKNOWN_TRACK", `Manual batch references unknown track ${batch.trackId}.`);
  if (batch.familyId !== track.familyId) throw new AuthoringFailure("FAMILY_MISMATCH", `${batch.batchId} family does not match its track.`);
  if (track.familyId === "coding_interview") throw new AuthoringFailure("CODING_SOURCE_CONTRACT", "Coding Interview source must continue through its existing publisher contract.");
  const { schema } = await schemaFor(root, track.familyId);
  await validateSchema(batch, schema, `${batch.trackId}/${batch.batchId}`);
  checkProvenance(batch.authoringProvenance, batch.batchId, `${batch.batchId}.authoringProvenance`);
  const trackManifest = manifest.tracks.find((entry) => entry.trackId === batch.trackId);
  if (!trackManifest || batch.nodeId === undefined || batch.learningBlockId === undefined) throw new AuthoringFailure("INVALID_ENVELOPE", `${batch.batchId} lacks a canonical node/block binding.`);
  const block = trackManifest.learningBlocks.find((entry) => entry.learningBlockId === batch.learningBlockId && entry.nodeId === batch.nodeId);
  if (!block) throw new AuthoringFailure("INVALID_REFERENCE", `${batch.batchId} references an unknown node/block.`);
  const expectedSlots = trackManifest.slots.filter((slot) => slot.learningBlockId === batch.learningBlockId && slot.authoringAdmitted).map((slot) => slot.slotId);
  if (!exact(batch.slotIds, expectedSlots)) throw new AuthoringFailure("INCOMPLETE_BATCH", `${batch.batchId} must declare exactly the authoring-admitted slots for its learning block.`);
  if (batch.items.length !== expectedSlots.length) throw new AuthoringFailure("INCOMPLETE_BATCH", `${batch.batchId} must contain one item per declared slot.`);
  unique(batch.slotIds, `${batch.batchId} slot IDs`); unique(batch.items.map((item) => item.itemId), `${batch.batchId} item IDs`);
  const slots = new Map(trackManifest.slots.map((slot) => [slot.slotId, slot]));
  const family = model.families.get(track.familyId);
  for (const item of batch.items) {
    const slot = slots.get(item.slotId);
    if (!slot || !batch.slotIds.includes(item.slotId)) throw new AuthoringFailure("INVALID_REFERENCE", `${item.itemId} references an unknown or undeclared slot.`);
    if (item.nodeId !== batch.nodeId || item.learningBlockId !== batch.learningBlockId || item.nodeId !== slot.nodeId || item.learningBlockId !== slot.learningBlockId) throw new AuthoringFailure("CROSS_BLOCK_ITEM", `${item.itemId} crosses its batch node/block.`);
    if (canonical(item.taxonomy) !== canonical(expectedTaxonomy(track.normalized.slots.find((entry) => entry.slotId === item.slotId), track.familyId))) throw new AuthoringFailure("INVALID_TAXONOMY", `${item.itemId} taxonomy does not equal its canonical slot taxonomy.`);
    checkInteraction(item, family, slot);
    if (!exact(item.modeEligibility, slot.modeEligibility)) throw new AuthoringFailure("MODE_DRIFT", `${item.itemId} mode eligibility differs from the canonical slot contract.`);
    checkFeedback(item, track.normalized.slots.find((entry) => entry.slotId === item.slotId));
    checkSourceBinding(item, slot, track.familyId);
    checkProvenance(item.authoringProvenance, batch.batchId, `${item.itemId}.authoringProvenance`);
  }
  if (new Set(batch.items.map((item) => item.slotId)).size !== expectedSlots.length) throw new AuthoringFailure("INCOMPLETE_BATCH", `${batch.batchId} must represent each declared slot exactly once.`);
  return { trackId: batch.trackId, familyId: batch.familyId, batchId: batch.batchId, itemCount: batch.items.length, slotIds: [...batch.slotIds].sort(compare) };
}

export async function validateAuthoringRegistrations(root) {
  const model = await loadAuthoringModel(root);
  const familySchema = await readJson(root, "schemas/authoring/family-authoring-registration.schema.json");
  const trackSchema = await readJson(root, "schemas/authoring/track-authoring-registration.schema.json");
  for (const family of model.families.values()) { const { path, ...registration } = family; await validateSchema(registration, familySchema, path); }
  for (const registration of model.registrations.values()) {
    const { path, ...registrationValue } = registration;
    await validateSchema(registrationValue, trackSchema, path);
    const copiedKeys = ["nodes", "learningBlocks", "slots", "counts", "readiness"];
    if (copiedKeys.some((key) => Object.hasOwn(registration, key))) throw new AuthoringFailure("REGISTRY_DUPLICATION", `${registration.trackId} registration copies derived curriculum data.`);
  }
  return model;
}

export function validateManifest(manifest, model) {
  if (manifest.schemaVersion !== "patternly-authoring-scaffold-manifest-v1" || manifest.gateResult !== "READY_FOR_SCAFFOLDING_WITH_EXPLICIT_BLOCKS") throw new AuthoringFailure("INVALID_MANIFEST", "Scaffold manifest identity or gate result is invalid.");
  if (manifest.trackCount !== 10 || canonicalJson(manifest.trackIds) !== canonicalJson([...model.curricula.keys()].sort(compare))) throw new AuthoringFailure("INVALID_MANIFEST", "Scaffold manifest must cover exactly the ten current tracks.");
  const allWritablePaths = [];
  for (const track of manifest.tracks) {
    const canonicalTrack = model.curricula.get(track.trackId);
    if (!canonicalTrack) throw new AuthoringFailure("INVALID_MANIFEST", `Unknown manifest track ${track.trackId}.`);
    const currentSlots = canonicalTrack.normalized.slots;
    if (track.plannedNodeCount !== canonicalTrack.normalized.nodes.length || track.plannedLearningBlockCount !== canonicalTrack.normalized.blocks.length) throw new AuthoringFailure("INVALID_MANIFEST", `${track.trackId} node/block counts drift from canonical curriculum.`);
    if (track.slots.length !== currentSlots.length || new Set(track.slots.map((slot) => slot.slotId)).size !== currentSlots.length) throw new AuthoringFailure("SLOT_COVERAGE", `${track.trackId} does not map every current slot exactly once.`);
    const blockIds = new Set(track.learningBlocks.map((block) => block.learningBlockId));
    const paths = [];
    for (const slot of track.slots) {
      if (!blockIds.has(slot.learningBlockId)) throw new AuthoringFailure("SLOT_COVERAGE", `${track.trackId}/${slot.slotId} references an unknown manifest block.`);
      if (slot.authoringAdmitted && !slot.plannedSourcePath) throw new AuthoringFailure("PATH_MAPPING", `${track.trackId}/${slot.slotId} is admitted without a planned source path.`);
      if (!slot.authoringAdmitted && (slot.writableSourcePaths?.length ?? 0) !== 0) throw new AuthoringFailure("PATH_MAPPING", `${track.trackId}/${slot.slotId} is blocked but has a writable source path.`);
      if (slot.plannedSourcePath) paths.push(slot.plannedSourcePath);
    }
    const sourcePaths = [...new Set(track.learningBlocks.flatMap((block) => block.sourcePaths ?? []))].sort(compare);
    if (track.plannedFutureSourceFileCount !== sourcePaths.length) throw new AuthoringFailure("PATH_MAPPING", `${track.trackId} future source file count does not equal its mapped source paths.`);
    allWritablePaths.push(...track.learningBlocks.filter((block) => block.plannedAuthoringBriefPath).map((block) => block.plannedSourcePath).filter(Boolean));
    if (new Set(paths).size > sourcePaths.length && canonicalTrack.familyId !== "coding_interview") throw new AuthoringFailure("PATH_MAPPING", `${track.trackId} maps more future paths than its learning blocks.`);
  }
  if (new Set(allWritablePaths).size !== allWritablePaths.length) throw new AuthoringFailure("PATH_COLLISION", "A future source path is owned by more than one track/node/block.");
  return true;
}

export async function validateAuthoringContracts(root) {
  const model = await validateAuthoringRegistrations(root);
  const result = await buildManifest(root);
  validateManifest(result.manifest, model);
  for (const familyId of ["certification", "design_interview"]) {
    const paths = (await repoFiles(root, [`manual/source`])).filter((path) => path.endsWith(".json") && path.includes(`/source/`));
    for (const path of paths) {
      if (!path.startsWith("manual/source/") || path.includes("coding-interview-dsa-problem-solving/")) continue;
      const batch = JSON.parse(await readFile(join(root, path), "utf8"));
      if (batch.familyId === familyId) await validateManualBatch(root, batch, { manifestResult: result });
    }
  }
  const codingSchema = await readJson(root, "schemas/publishing/coding-interview-manual-source.schema.json");
  const codingPaths = (await repoFiles(root, ["manual/source/coding-interview-dsa-problem-solving"])).filter((path) => path.endsWith(".json"));
  for (const path of codingPaths) await validateSchema(JSON.parse(await readFile(join(root, path), "utf8")), codingSchema, path);
  return { ...result, sourceHashes: await sourceHashEntries(root) };
}
