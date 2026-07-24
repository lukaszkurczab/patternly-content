import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { emitTechnicalEvidence, inspectTrack } from "../../scripts/publishing/pipeline.mjs";

const write = async (root, path, value) => { const target = join(root, path); await mkdir(join(target, ".."), { recursive: true }); await writeFile(target, `${JSON.stringify(value, null, 2)}\n`); };
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
async function copyPublishingSchemas(root) {
  for (const name of ["algorithms-manual-source.schema.json", "certification-manual-source.schema.json", "technical-validation-evidence.schema.json", "editorial-approval-record.schema.json", "content-activation-record.schema.json"]) {
    const value = await readFile(join(PROJECT_ROOT, "schemas", "publishing", name), "utf8");
    const target = join(root, "schemas", "publishing", name);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, value);
  }
}
const item = (index, overrides = {}) => ({
  id: `fixture-algorithm-${index + 1}`,
  prompt: "Choose all valid fixture invariants.",
  interaction: { type: "choice", selectionMode: "multiple", options: [{ id: "keep", text: "Keep invariant" }, { id: "discard", text: "Discard invariant" }], acceptedOptionIds: ["keep"] },
  scoringContract: { type: "choice", resultSemantics: "exact_selected_set_with_partial_v1" },
  feedback: { reason: "Fixture reason.", details: "Fixture details.", wrongOptionExplanationsByOptionId: { discard: "Fixture wrong-option explanation." }, omittedCorrectExplanationsByOptionId: { keep: "Fixture omitted-correct explanation." } },
  taxonomy: { primarySkillAtomId: "track_index_boundary", secondarySkillAtomIds: [], learningStage: "foundations" },
  ...overrides
});
const fixtureModeConfiguration = {
  schemaVersion: "algorithms-track-mode-config-v1",
  practiceBlueprints: [
    { blueprintId: "fixture-learn", blueprintVersion: "1", modeId: "algorithms-learn-approach", requestedLengths: [10], defaultRequestedLength: 10, shortening: "allowed", minimumActualLength: 1, selectionBoundary: "one_primary_mental_unit", reinsertPolicy: "disabled", learningStages: ["approach_model"] },
    { blueprintId: "fixture-guided", blueprintVersion: "1", modeId: "algorithms-guided-practice", requestedLengths: [10, 20, 40], defaultRequestedLength: 20, shortening: "allowed", minimumActualLength: 1, selectionBoundary: "one_primary_mental_unit", reinsertPolicy: "enabled", learningStages: ["guided_application"] },
    { blueprintId: "fixture-recognition", blueprintVersion: "1", modeId: "algorithms-recognize-patterns", requestedLengths: [10, 20, 40], defaultRequestedLength: 20, shortening: "allowed", minimumActualLength: 1, selectionBoundary: "explicit_recognition_scope", reinsertPolicy: "disabled", learningStages: ["recognition"] },
    { blueprintId: "fixture-contrast", blueprintVersion: "1", modeId: "algorithms-contrast-practice", requestedLengths: [10, 20, 40], defaultRequestedLength: 20, shortening: "allowed", minimumActualLength: 1, selectionBoundary: "explicit_contrast_set", reinsertPolicy: "disabled", learningStages: ["contrast"] },
    { blueprintId: "fixture-review", blueprintVersion: "1", modeId: "algorithms-weak-area-review", requestedLengths: [10, 20], defaultRequestedLength: 10, shortening: "allowed", minimumActualLength: 1, selectionBoundary: "eligible_review_evidence", reinsertPolicy: "enabled", reviewSources: ["due_queue", "session_misses"], learningStages: ["spaced_review"] },
    { blueprintId: "fixture-independent", blueprintVersion: "1", modeId: "algorithms-independent-practice", requestedLengths: [10, 20, 40], defaultRequestedLength: 20, shortening: "blueprint_controlled", minimumActualLength: 1, selectionBoundary: "explicit_interleaved_scope", reinsertPolicy: "disabled", learningStages: ["independent_transfer"] },
  ],
  simulationBlueprint: { blueprintId: "fixture-interview-simulation", blueprintVersion: "1", modeId: "algorithms-interview-simulation", profileId: "algorithms-interview-simulation-v1", profileVersion: "1", requestedLength: 40, actualLength: 40, shorteningPolicy: "prohibited", uniqueItemsRequired: 40, timerKind: "foreground_countdown", durationMinutes: 45, navigationPolicy: "free_navigation", answerChangePolicy: "editable_until_finalization", reinsertPolicy: "disabled", feedbackTiming: "after_verified_finalization", learningStages: ["simulation"], selectionPolicy: { requireUniqueItemIds: true, requireDeclaredSimulationEligibility: true, requireMultipleMentalUnits: true, requireMultiplePatternFamilies: true, requireEveryActiveInteractionTypeRepresented: true, prohibitConsecutiveSameMentalUnitWhenAlternativeExists: true, prohibitDuplicateContentIdentity: true, prohibitTaxonomyWidening: true, prohibitFallbackItems: true } },
};
export function algorithmsBatch({ count = 40, duplicate = false, badTaxonomy = false, invalidChoice = false, declaredModes = ["algorithms-interview-simulation"], poolIds, profile, modeStructures } = {}) {
  const items = Array.from({ length: count }, (_, index) => item(index, duplicate && index === count - 1 ? { id: "fixture-algorithm-1" } : invalidChoice && index === 0 ? { interaction: { type: "choice", selectionMode: "single", options: [{ id: "keep", text: "Keep" }, { id: "discard", text: "Discard" }], acceptedOptionIds: ["keep", "discard"] } } : {}));
  const simulationPoolIds = poolIds ?? items.map((entry) => entry.id);
  const simulationProfile = profile ?? { profileId: "algorithms-interview-simulation-v1", profileVersion: "1", profileKind: "internal_learning_profile", totalOccurrences: 40, foregroundDurationMs: 2700000, poolId: "fixture-pool", distributions: [{ dimension: "learningStage", buckets: [{ valueId: "foundations", minimum: 40, target: 40, maximum: 40 }] }], selectionPolicy: { uniqueItems: true, replacement: false, deterministic: true, algorithmVersion: "sha256-ranked-constraints-v1" }, provenance: { authority: "patternly_product", approvedBy: "fixture reviewer", approvedAt: "2026-07-16", rationale: "Technical fixture only." } };
  return {
    schemaVersion: "algorithms-manual-source-v2", batchId: "fixture-algorithms-batch", trackId: "algorithms", familyId: "algorithms", contentVersion: "algorithms-fixture-v2", taxonomyVersion: "algorithms-taxonomy-v2", declaredModes,
    taxonomy: badTaxonomy ? { roadmapNodeId: "unknown", primaryMentalUnitId: "unknown", patternFamilyId: "unknown" } : { roadmapNodeId: "arrays_and_strings", primaryMentalUnitId: "arrays_and_strings", patternFamilyId: "arrays_and_strings" },
    batchKind: "standard", authoringProvenance: { author: "fixture author", createdAt: "2026-07-16", contentBatchId: "fixture-algorithms-batch", authoringMethod: "independently_authored" }, items,
    modeStructures: modeStructures ?? { recognitionSets: [], contrastSets: [], interleavedScopes: [], compatibilitySets: [], simulationPools: [{ poolId: "fixture-pool", poolVersion: "v1", itemIds: simulationPoolIds }], simulationProfiles: [simulationProfile] }
  };
}
export const certificationExamExperienceProfile = {
  schemaVersion: "exam-experience-profile-v1", profileId: "fixture-certification-standard-v1", profileVersion: "1",
  source: { url: "https://example.test/certification", checkedDate: "2026-07-24", guideVersion: "fixture" },
  durationMinutes: 120, questionCount: { kind: "range", minimum: 50, maximum: 60 },
  blueprint: { kind: "weighted_sections", sections: [{ id: "fixture-section", weightPercent: 100 }] },
  navigation: "not_documented", answerChanges: "not_documented", flagging: "not_documented", navigator: "not_documented", sections: "not_documented", timeout: "not_documented"
};
export const certificationDiagnosticBaseline = {
  blueprintId: "gcp-ace-diagnostic-baseline-v1", blueprintVersion: "1", modeId: "certification-diagnostic-baseline", requestedLength: 40, actualLength: 40,
  shortening: "prohibited", uniqueItemsRequired: 40, timerKind: "elapsed_foreground", feedbackTiming: "after_each_durable_submit", reinsertPolicy: "disabled",
  itemIds: Array.from({ length: 40 }, (_, index) => `fixture-certification-${index + 1}`),
};
export const certificationFocusPractice = { blueprintId: "gcp-ace-focus-practice-v1", blueprintVersion: "1", modeId: "certification-focus-practice", requestedLengths: [10, 20, 40], shortening: "allowed_within_topic", selectionScope: "cloud_domain", topicIds: ["setup_environment"] };
export const certificationScenarioPractice = { blueprintId: "gcp-ace-scenario-practice-v1", blueprintVersion: "1", modeId: "certification-scenario-practice", requestedLengths: [10, 20, 40], shortening: "allowed_within_competency", selectionScope: "explicit_tag_competency", competencies: [{ id: "fixture", label: "Fixture competency", scenarioItemIds: Array.from({ length: 10 }, (_, index) => `fixture-certification-${index + 1}`) }] };
export const certificationWeakAreaReview = { blueprintId: "gcp-ace-weak-area-review-v1", blueprintVersion: "1", modeId: "certification-weak-area-review", requestedLengths: [10, 20], shortening: "allowed_within_eligible_review_evidence", selectionScope: "eligible_due_review_evidence", persistentResolutionPolicy: "two_consecutive_due_review_successes" };
export function certificationBatch({ count = 50 } = {}) { return { schemaVersion: "certification-manual-source-v1", batchId: "fixture-certification-batch", trackId: "cloud-certification", familyId: "certification", contentVersion: "certification-fixture-v1", taxonomyVersion: "cloud-certification-taxonomy-v1", declaredModes: ["cloud-practice"], items: Array.from({ length: count }, (_, index) => ({ id: `fixture-certification-${index + 1}`, domain: "setup_environment", type: "single", difficulty: "easy", question: `Fixture certification question ${index + 1}?`, options: [{ id: "A", text: `Correct ${index + 1}` }, { id: "B", text: `Wrong B ${index + 1}` }, { id: "C", text: `Wrong C ${index + 1}` }, { id: "D", text: `Wrong D ${index + 1}` }], correctOptionIds: ["A"], explanation: "Fixture explanation.", whyOthersAreWrong: { B: "Wrong B.", C: "Wrong C.", D: "Wrong D." }, watchOutFor: "Fixture watch-out.", tags: ["fixture"], examSignals: ["fixture"] })) }; }
async function writeApprovalsAndActivation(root, trackId, commit) {
  await emitTechnicalEvidence({ root, trackId, sourceRepositoryCommit: commit });
  const inspected = await inspectTrack({ root, trackId, sourceRepositoryCommit: commit });
  const approvalIds = new Map();
  for (const evidence of inspected.source.technicalEvidence) {
    const approvalId = `fixture-approval-${evidence.batchId}`; approvalIds.set(evidence.batchId, approvalId);
    await write(root, `manual/approvals/${trackId}/${evidence.batchId}.json`, { approvalSchemaVersion: 1, approvalId, reviewKind: "editorial", batchId: evidence.batchId, familyId: inspected.track.familyId, trackId, primaryTaxonomyReference: inspected.track.familyId === "algorithms" ? "arrays_and_strings" : "fixture", includedItems: Object.entries(evidence.itemFingerprints).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([itemId, itemFingerprint]) => ({ itemId, itemFingerprint })), targetContentVersion: inspected.source.contentVersion, reviewer: "fixture reviewer", reviewDate: "2026-07-16", technicalValidationEvidenceId: evidence.evidenceId, factualAndEditorialDefectsFound: [], requiredCorrections: [], finalDisposition: "approved" });
  }
  const coverage = inspected.source.items.map((entry) => { const batch = inspected.source.batches.find((candidate) => candidate.items.some((item) => item.id === entry.id)); return { itemId: entry.id, itemFingerprint: entry.itemFingerprint, approvalId: approvalIds.get(batch.batchId) }; });
  await write(root, `manual/activations/${trackId}/fixture-activation.json`, { activationSchemaVersion: 1, activationId: `fixture-activation-${trackId}`, trackId, familyId: inspected.track.familyId, contentVersion: inspected.source.contentVersion, taxonomyVersion: inspected.source.taxonomyVersion, itemCoverage: coverage });
}
export async function fixtureRoot(root, { algorithms, certification, approvals = true, legacy = false } = {}) {
  await copyPublishingSchemas(root);
  await write(root, "config/families/algorithms.json", { schemaVersion: "algorithms-family-config-v2", familyId: "algorithms", supportedInteractions: ["choice", "ordering", "complexity"] });
  await write(root, "config/families/certification.json", { schemaVersion: "family-config-v1", familyId: "certification", supportedInteractions: ["choice"], modes: [{ id: "certification-diagnostic-baseline", minimumPool: 40 }, { id: "certification-focus-practice", minimumPool: 10 }, { id: "certification-scenario-practice", minimumPool: 10 }, { id: "certification-weak-area-review", minimumPool: 1 }, { id: "cloud-practice", minimumPool: 10 }] });
  await write(root, "config/tracks/algorithms.json", { schemaVersion: "track-config-v1", trackId: "algorithms", familyId: "algorithms", taxonomyVersion: "algorithms-taxonomy-v2", taxonomyPath: "config/taxonomy/algorithms.json", modeConfiguration: fixtureModeConfiguration });
  await write(root, "config/tracks/cloud-certification.json", { schemaVersion: "track-config-v1", trackId: "cloud-certification", familyId: "certification", taxonomyVersion: "cloud-certification-taxonomy-v1", taxonomyPath: "config/taxonomy/cloud-certification.json", modeConfiguration: { schemaVersion: "certification-track-mode-config-v1", diagnosticBaseline: certificationDiagnosticBaseline, focusPractice: certificationFocusPractice, scenarioPractice: certificationScenarioPractice, weakAreaReview: certificationWeakAreaReview }, profile: certificationExamExperienceProfile });
  await write(root, "config/taxonomy/algorithms.json", { schemaVersion: "algorithms-taxonomy-v2", trackId: "algorithms", taxonomyVersion: "algorithms-taxonomy-v2", learningStages: ["foundations"], roadmapNodes: [{ id: "arrays_and_strings" }], mentalUnits: [{ id: "arrays_and_strings", roadmapNodeId: "arrays_and_strings", unitKind: "direct", primaryPatternFamilyId: "arrays_and_strings", legalPatternFamilyIds: ["arrays_and_strings"], primarySkillAtomId: "track_index_boundary", secondarySkillAtomIds: [], learningStage: "foundations", patternVariantIds: [], problemArchetypeIds: [] }], patternFamilies: [{ id: "arrays_and_strings", primaryMentalUnitId: "arrays_and_strings" }], patternVariants: [], problemArchetypes: [], skillAtoms: [{ id: "track_index_boundary", primaryMentalUnitId: "arrays_and_strings" }], falseHeuristics: [] });
  await write(root, "config/taxonomy/cloud-certification.json", { schemaVersion: "taxonomy-config-v1", trackId: "cloud-certification", taxonomyVersion: "cloud-certification-taxonomy-v1", axes: ["cloud-domain", "tag"], cloudDomains: ["setup_environment"] });
  if (algorithms) await write(root, "manual/source/algorithms/fixture.json", algorithms); if (certification) await write(root, "manual/source/cloud-certification/fixture.json", certification); if (legacy) await write(root, "tracks/algorithms/banks/legacy.json", algorithmsBatch());
  if (approvals && algorithms) await writeApprovalsAndActivation(root, "algorithms", "fixture-source-commit"); if (approvals && certification) await writeApprovalsAndActivation(root, "cloud-certification", "fixture-source-commit");
}
