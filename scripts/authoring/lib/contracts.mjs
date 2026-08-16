import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildManifest, canonical, canonicalJson, compare, FAMILY_IDS, loadAuthoringModel, readJson, repoFiles, validateSchema, AuthoringFailure, sourceHashEntries } from "./model.mjs";

const GENERIC_FEEDBACK = new Set(["correct answer", "incorrect", "see explanation", "n/a", "not applicable"]);
const asArray = (value, label) => { if (!Array.isArray(value)) throw new AuthoringFailure("INVALID_CONTRACT", `${label} must be an array.`); return value; };
const text = (value, label) => { if (typeof value !== "string" || !value.trim()) throw new AuthoringFailure("INVALID_CONTRACT", `${label} must be a non-empty string.`); return value; };
const exact = (left, right) => canonicalJson([...left].sort(compare)) === canonicalJson([...right].sort(compare));
const unique = (values, label) => { if (new Set(values).size !== values.length) throw new AuthoringFailure("DUPLICATE_ID", `${label} contains duplicates.`); };

async function schemaFor(root, familyId, track) {
  const path = familyId === "certification" ? (track?.registration?.familySourceSchemaPath ?? "schemas/publishing/certification-manual-source.schema.json") : familyId === "design_interview" ? "schemas/publishing/design-interview-manual-source.schema.json" : null;
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

function checkFeedback(item, slot, trackId, familyId) {
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
  if (familyId === "certification") {
    text(feedback.Details.url, `${item.itemId} Details.url`);
    let url;
    try { url = new URL(feedback.Details.url); } catch { throw new AuthoringFailure("INVALID_SOURCE_URL", `${item.itemId} Details.url must be an absolute HTTPS URL.`); }
    if (url.protocol !== "https:") throw new AuthoringFailure("INVALID_SOURCE_URL", `${item.itemId} Details.url must use HTTPS.`);
    if (trackId === "microsoft-azure-administrator-associate-az-104" && !(url.hostname === "learn.microsoft.com" || url.hostname.endsWith(".learn.microsoft.com"))) throw new AuthoringFailure("INVALID_SOURCE_URL", `${item.itemId} AZ-104 Details.url must point to Microsoft Learn.`);
  }
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
  if (!binding || !binding.bindingId || !Array.isArray(binding.claimIds) || !binding.claimIds.length || !Array.isArray(binding.anchorIds) || !binding.anchorIds.length || !Array.isArray(binding.sourceRefs) || !binding.sourceRefs.length) throw new AuthoringFailure("SOURCE_BINDING_MISMATCH", `${item.itemId} must carry non-empty exact claim, anchor, and source references.`);
  if (binding.bindingId !== expected.bindingId || !exact(binding.claimIds, expected.claimIds) || !exact(binding.anchorIds, expected.anchorIds) || !exact(binding.sourceRefs, expected.sourceRefs)) throw new AuthoringFailure("SOURCE_BINDING_MISMATCH", `${item.itemId} source binding is not exact for its slot.`);
  if (familyId === "design_interview" && !binding.bindingId.startsWith("design-binding:")) throw new AuthoringFailure("SOURCE_BINDING_MISMATCH", `${item.itemId} Design source binding is not a direct registry binding.`);
}

function checkFeedbackSourceUrl(item, track) {
  if (track.trackId !== "microsoft-azure-administrator-associate-az-104") return;
  const sourceUrls = new Set(item.sourceBinding.sourceRefs.map((sourceRef) => track.sourceRecords.find((source) => source.sourceId === sourceRef)?.url ?? sourceRef));
  if (!sourceUrls.has(item.feedback.Details.url)) throw new AuthoringFailure("FEEDBACK_SOURCE_MISMATCH", `${item.itemId} Details.url must resolve to one of its bound AZ-104 Microsoft Learn sources.`);
}

function expectedSourcePath(track, nodeId, learningBlockId) {
  return track.registration.sourceLayout === "node"
    ? `manual/source/${track.trackId}/${nodeId}/content.json`
    : `manual/source/${track.trackId}/${nodeId}/${learningBlockId}.json`;
}

export async function validateManualBatch(root, batch, { manifestResult, actualPath } = {}) {
  const model = manifestResult?.model ?? await loadAuthoringModel(root);
  const manifest = manifestResult?.manifest ?? (await buildManifest(root)).manifest;
  if (!batch || typeof batch !== "object" || Array.isArray(batch)) throw new AuthoringFailure("INVALID_SOURCE_JSON", "Manual source must be a JSON object.");
  if (!FAMILY_IDS.includes(batch.familyId)) throw new AuthoringFailure("UNKNOWN_FAMILY", `Manual source declares unsupported family ${batch.familyId ?? "(missing)"}.`);
  const track = model.curricula.get(batch.trackId);
  if (!track) throw new AuthoringFailure("UNKNOWN_TRACK", `Manual batch references unknown track ${batch.trackId}.`);
  if (batch.familyId !== track.familyId) throw new AuthoringFailure("FAMILY_MISMATCH", `${batch.batchId} family does not match its track.`);
  if (track.familyId === "coding_interview") throw new AuthoringFailure("CODING_SOURCE_CONTRACT", "Coding Interview source must continue through its existing publisher contract.");
  const nodeLayout = track.registration.sourceLayout === "node";
  const { schema } = await schemaFor(root, track.familyId, track);
  await validateSchema(batch, schema, `${batch.trackId}/${batch.batchId}`);
  checkProvenance(batch.authoringProvenance, batch.batchId, `${batch.batchId}.authoringProvenance`);
  const trackManifest = manifest.tracks.find((entry) => entry.trackId === batch.trackId);
  if (!trackManifest || batch.nodeId === undefined || (!nodeLayout && batch.learningBlockId === undefined)) throw new AuthoringFailure("INVALID_ENVELOPE", `${batch.batchId} lacks a canonical node/block binding.`);
  const block = nodeLayout
    ? trackManifest.learningBlocks.find((entry) => entry.nodeId === batch.nodeId)
    : trackManifest.learningBlocks.find((entry) => entry.learningBlockId === batch.learningBlockId && entry.nodeId === batch.nodeId);
  if (!block) throw new AuthoringFailure("INVALID_REFERENCE", `${batch.batchId} references an unknown node/block.`);
  if (batch.taxonomyVersion !== trackManifest.taxonomyVersion || batch.contentVersion !== trackManifest.contentVersion) throw new AuthoringFailure("VERSION_IDENTITY", `${batch.batchId} taxonomy/content version does not equal the canonical track authoring identity.`);
  const expectedPath = expectedSourcePath(track, batch.nodeId, batch.learningBlockId);
  if (actualPath && actualPath !== expectedPath) throw new AuthoringFailure("PATH_MISMATCH", `${actualPath} is not the exact canonical path ${expectedPath}.`);
  if (!block.authoringAdmittedItemCount || block.plannedSourcePath !== expectedPath) throw new AuthoringFailure("BLOCKED_SOURCE_PATH", `${batch.batchId} references a learning block without an authoring-admitted writable source path.`);
  const expectedSlots = trackManifest.slots.filter((slot) => (nodeLayout ? slot.nodeId === batch.nodeId : slot.learningBlockId === batch.learningBlockId) && slot.authoringAdmitted).map((slot) => slot.slotId);
  if (!exact(batch.slotIds, expectedSlots)) throw new AuthoringFailure("INCOMPLETE_BATCH", `${batch.batchId} must declare exactly the authoring-admitted slots for its learning block.`);
  if (batch.items.length !== expectedSlots.length) throw new AuthoringFailure("INCOMPLETE_BATCH", `${batch.batchId} must contain one item per declared slot.`);
  if (nodeLayout && !exact(batch.learningBlockIds, [...new Set(trackManifest.slots.filter((slot) => slot.nodeId === batch.nodeId && slot.authoringAdmitted).map((slot) => slot.learningBlockId))])) throw new AuthoringFailure("INCOMPLETE_BATCH", `${batch.batchId} must declare every authoring-admitted learning block owned by its node.`);
  unique(batch.slotIds, `${batch.batchId} slot IDs`); unique(batch.items.map((item) => item.itemId), `${batch.batchId} item IDs`);
  const slots = new Map(trackManifest.slots.map((slot) => [slot.slotId, slot]));
  const family = model.families.get(track.familyId);
  for (const item of batch.items) {
    const slot = slots.get(item.slotId);
    if (!slot || !batch.slotIds.includes(item.slotId)) throw new AuthoringFailure("INVALID_REFERENCE", `${item.itemId} references an unknown or undeclared slot.`);
    const crossesBatch = nodeLayout
      ? item.nodeId !== batch.nodeId || item.learningBlockId !== slot.learningBlockId
      : item.nodeId !== batch.nodeId || item.learningBlockId !== batch.learningBlockId;
    if (crossesBatch || item.nodeId !== slot.nodeId || item.learningBlockId !== slot.learningBlockId) throw new AuthoringFailure("CROSS_BLOCK_ITEM", `${item.itemId} crosses its batch node/block.`);
    if (canonical(item.taxonomy) !== canonical(expectedTaxonomy(track.normalized.slots.find((entry) => entry.slotId === item.slotId), track.familyId))) throw new AuthoringFailure("INVALID_TAXONOMY", `${item.itemId} taxonomy does not equal its canonical slot taxonomy.`);
    checkInteraction(item, family, slot);
    if (!exact(item.modeEligibility, slot.modeEligibility)) throw new AuthoringFailure("MODE_DRIFT", `${item.itemId} mode eligibility differs from the canonical slot contract.`);
    checkFeedback(item, track.normalized.slots.find((entry) => entry.slotId === item.slotId), batch.trackId, track.familyId);
    checkSourceBinding(item, slot, track.familyId);
    checkFeedbackSourceUrl(item, track);
    if (batch.trackId === "aws-certified-solutions-architect-associate" && !item.sourceBinding.sourceRefs.includes(item.feedback.Details.url)) throw new AuthoringFailure("FEEDBACK_SOURCE_MISMATCH", `${item.itemId} Details.url must match one of its bound source references.`);
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
  if (manifest.schemaVersion !== "patternly-authoring-scaffold-manifest-v1" || manifest.gateResult !== "READY_FOR_FIRST_REAL_BOUNDED_AUTHORING_BATCH" || manifest.planningGateResult !== "READY_FOR_SCAFFOLDING_WITH_EXPLICIT_BLOCKS") throw new AuthoringFailure("INVALID_MANIFEST", "Scaffold manifest identity or gate result is invalid.");
  if (manifest.trackCount !== 10 || canonicalJson(manifest.trackIds) !== canonicalJson([...model.curricula.keys()].sort(compare))) throw new AuthoringFailure("INVALID_MANIFEST", "Scaffold manifest must cover exactly the ten current tracks.");
  if (!manifest.firstRealAuthoringBatch?.trackId || !manifest.firstRealAuthoringBatch?.path) throw new AuthoringFailure("FIRST_BATCH", "Manifest must select one explicit first real authoring batch.");
  const allWritablePaths = [];
  for (const track of manifest.tracks) {
    const canonicalTrack = model.curricula.get(track.trackId);
    if (!canonicalTrack) throw new AuthoringFailure("INVALID_MANIFEST", `Unknown manifest track ${track.trackId}.`);
    const expectedTaxonomyVersion = canonicalTrack.familyId === "coding_interview" ? null : canonicalTrack.curriculumVersion;
    const expectedContentVersion = canonicalTrack.familyId === "coding_interview" ? null : canonicalTrack.registration.authoringVersion.contentVersion;
    if (track.taxonomyVersion !== expectedTaxonomyVersion || track.contentVersion !== expectedContentVersion) throw new AuthoringFailure("VERSION_IDENTITY", `${track.trackId} has a non-canonical taxonomy/content version.`);
    const currentSlots = canonicalTrack.normalized.slots;
    if (track.plannedNodeCount !== canonicalTrack.normalized.nodes.length || track.plannedLearningBlockCount !== canonicalTrack.normalized.blocks.length) throw new AuthoringFailure("INVALID_MANIFEST", `${track.trackId} node/block counts drift from canonical curriculum.`);
    if (track.slots.length !== currentSlots.length || new Set(track.slots.map((slot) => slot.slotId)).size !== currentSlots.length) throw new AuthoringFailure("SLOT_COVERAGE", `${track.trackId} does not map every current slot exactly once.`);
    const blockIds = new Set(track.learningBlocks.map((block) => block.learningBlockId));
    const paths = [];
    for (const slot of track.slots) {
      if (!blockIds.has(slot.learningBlockId)) throw new AuthoringFailure("SLOT_COVERAGE", `${track.trackId}/${slot.slotId} references an unknown manifest block.`);
      if (slot.authoringAdmitted && !slot.plannedSourcePath) throw new AuthoringFailure("PATH_MAPPING", `${track.trackId}/${slot.slotId} is admitted without a planned source path.`);
      if (!slot.authoringAdmitted && (slot.writableSourcePaths?.length ?? 0) !== 0) throw new AuthoringFailure("PATH_MAPPING", `${track.trackId}/${slot.slotId} is blocked but has a writable source path.`);
      if (canonicalTrack.familyId !== "coding_interview" && slot.plannedSourcePath !== (slot.authoringAdmitted ? expectedSourcePath(canonicalTrack, slot.nodeId, slot.learningBlockId) : null)) throw new AuthoringFailure("PATH_MAPPING", `${track.trackId}/${slot.slotId} does not have the exact stable source path.`);
      if (slot.plannedSourcePath) paths.push(slot.plannedSourcePath);
    }
    const sourcePaths = [...new Set(track.learningBlocks.flatMap((block) => block.sourcePaths ?? []))].sort(compare);
    if (track.plannedFutureSourceFileCount !== sourcePaths.length) throw new AuthoringFailure("PATH_MAPPING", `${track.trackId} future source file count does not equal its mapped source paths.`);
    if (track.authoringAdmittedItemCount !== track.learningBlocks.reduce((sum, block) => sum + block.authoringAdmittedItemCount, 0) || track.blockedItemCount !== track.learningBlocks.reduce((sum, block) => sum + block.blockedItemCount, 0)) throw new AuthoringFailure("COUNT_RECONCILIATION", `${track.trackId} block counts do not reconcile to its track authoring counts.`);
    const expectedSourceReadyBlocks = canonicalTrack.familyId === "coding_interview" ? track.learningBlocks.filter((block) => (block.sourcePaths?.length ?? 0) > 0).length : track.learningBlocks.filter((block) => block.authoringAdmittedItemCount > 0).length;
    const expectedFreeNodeSourceReadyBlocks = canonicalTrack.familyId === "coding_interview" ? track.learningBlocks.filter((block) => block.isFreeNode && (block.sourcePaths?.length ?? 0) > 0).length : track.learningBlocks.filter((block) => block.authoringAdmittedItemCount > 0 && block.isFreeNode).length;
    if (track.sourceReadyBlockCount !== expectedSourceReadyBlocks || track.freeNodeSourceReadyBlockCount !== expectedFreeNodeSourceReadyBlocks) throw new AuthoringFailure("PRIORITY_MAPPING", `${track.trackId} source-ready block counts drift from its blocks.`);
    const blockPaths = [];
    for (const block of track.learningBlocks) {
      if (!/^T[0-6]$/.test(block.priorityTier) || !Array.isArray(block.priorityReasons) || !block.priorityReasons.length) throw new AuthoringFailure("PRIORITY_MAPPING", `${track.trackId}/${block.learningBlockId} lacks a semantic priority tier.`);
      if (canonicalTrack.familyId !== "coding_interview") {
        const expected = expectedSourcePath(canonicalTrack, block.nodeId, block.learningBlockId);
        if (block.authoringAdmittedItemCount > 0 && (block.plannedSourcePath !== expected || sourcePaths.filter((path) => path === expected).length !== 1)) throw new AuthoringFailure("PATH_MAPPING", `${track.trackId}/${block.learningBlockId} does not map to its node-owned source file.`);
        if (block.authoringAdmittedItemCount === 0 && (block.plannedSourcePath !== null || (block.sourcePaths?.length ?? 0) !== 0 || block.plannedAuthoringBriefPath !== null)) throw new AuthoringFailure("PATH_MAPPING", `${track.trackId}/${block.learningBlockId} is blocked but retains a writable identity.`);
      }
      if (block.sourcePaths?.length) blockPaths.push(...block.sourcePaths);
    }
    allWritablePaths.push(...new Set(blockPaths));
    if (new Set(paths).size > sourcePaths.length && canonicalTrack.familyId !== "coding_interview") throw new AuthoringFailure("PATH_MAPPING", `${track.trackId} maps more future paths than its learning blocks.`);
  }
  if (new Set(allWritablePaths).size !== allWritablePaths.length) throw new AuthoringFailure("PATH_COLLISION", "A future source path is owned by more than one track/node/block.");
  const first = manifest.firstRealAuthoringBatch;
  const firstTrack = manifest.tracks.find((track) => track.trackId === first.trackId);
  const firstBlock = firstTrack?.learningBlocks.find((block) => block.learningBlockId === first.learningBlockId && block.nodeId === first.nodeId);
  if (!firstTrack || firstTrack.familyId === "coding_interview" || !firstBlock || firstBlock.plannedSourcePath !== first.path || firstBlock.authoringAdmittedItemCount !== first.authoringAdmittedItemCount || canonicalJson(first.slotIds) !== canonicalJson(firstTrack.slots.filter((slot) => slot.learningBlockId === first.learningBlockId && slot.authoringAdmitted).map((slot) => slot.slotId))) throw new AuthoringFailure("FIRST_BATCH", "Manifest firstRealAuthoringBatch is not owned by its selected source-ready block.");
  return true;
}

export async function validateAuthoringContracts(root) {
  const model = await validateAuthoringRegistrations(root);
  const result = await buildManifest(root);
  validateManifest(result.manifest, model);
  const paths = (await repoFiles(root, ["manual/source"])).filter((path) => path.endsWith(".json"));
  const codingSchema = await readJson(root, "schemas/publishing/coding-interview-manual-source.schema.json");
  const codingRoot = "manual/source/coding-interview-dsa-problem-solving/";
  const candidateSourceTracks = new Set([
    "aws-certified-solutions-architect-associate",
    "google-cloud-associate-cloud-engineer",
    "microsoft-azure-ai-fundamentals-ai-901"
  ]);
  const designCandidateSourceTracks = new Set(["backend-system-design-interview", "frontend-system-design-interview", "object-oriented-design-interview"]);
  for (const path of paths) {
    let batch;
    try { batch = JSON.parse(await readFile(join(root, path), "utf8")); } catch (error) { throw new AuthoringFailure("INVALID_SOURCE_JSON", `${path} is not valid JSON: ${error.message}`); }
    if (designCandidateSourceTracks.has(batch.trackId)) {
      if (batch.activationState !== "inactive_candidate" || batch.runtimeAdmission !== "not_admitted" || batch.publishingAdmission !== "not_admitted" || batch.authoringProvenance?.approvalStatus !== "unapproved") throw new AuthoringFailure("CANDIDATE_ADMISSION_BOUNDARY", `${path} crosses the candidate admission boundary.`);
      continue;
    }
    if (candidateSourceTracks.has(batch.trackId)) {
      const track = model.curricula.get(batch.trackId);
      if (!track || batch.familyId !== track.familyId) throw new AuthoringFailure("FAMILY_MISMATCH", `${path} does not match its registered candidate track.`);
      const { schema } = await schemaFor(root, batch.familyId, track);
      await validateSchema(batch, schema, path);
      continue;
    }
    if (path.startsWith(codingRoot)) {
      if (batch.familyId !== "coding_interview") throw new AuthoringFailure("FAMILY_PATH_MISMATCH", `${path} is under the Coding source root but does not declare coding_interview.`);
      await validateSchema(batch, codingSchema, path);
      continue;
    }
    if (batch.familyId === "coding_interview") throw new AuthoringFailure("FAMILY_PATH_MISMATCH", `${path} declares Coding Interview outside the canonical Coding source root.`);
    await validateManualBatch(root, batch, { manifestResult: result, actualPath: path });
  }
  return { ...result, sourceHashes: await sourceHashEntries(root) };
}
