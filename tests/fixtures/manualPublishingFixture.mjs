import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { inspectTrack } from "../../scripts/publishing/pipeline.mjs";

const write = async (root, path, value) => { const target = join(root, path); await mkdir(join(target, ".."), { recursive: true }); await writeFile(target, `${JSON.stringify(value, null, 2)}\n`); };
const item = (index, overrides = {}) => ({
  id: `fixture-algorithm-${index + 1}`,
  prompt: "Choose all valid fixture invariants.",
  interaction: { type: "choice", selectionMode: "multiple", options: [{ id: "keep", text: "Keep invariant" }, { id: "discard", text: "Discard invariant" }], acceptedOptionIds: ["keep"] },
  scoringContract: { type: "choice", resultSemantics: "exact_selected_set_with_partial_v1" },
  feedback: { reason: "Fixture reason.", details: "Fixture details.", wrongOptionExplanationsByOptionId: { discard: "Fixture wrong-option explanation." }, omittedCorrectExplanationsByOptionId: { keep: "Fixture omitted-correct explanation." } },
  taxonomy: { patternVariantId: "forward_scan", problemArchetypeId: "single_pass_lookup", primarySkillAtomId: "maintain_invariant", secondarySkillAtomIds: [], learningStage: "simulation" },
  ...overrides
});
export function algorithmsBatch({ count = 40, duplicate = false, badTaxonomy = false, invalidChoice = false, declaredModes = ["interview_simulation"], poolIds, profile, modeStructures } = {}) {
  const items = Array.from({ length: count }, (_, index) => item(index, duplicate && index === count - 1 ? { id: "fixture-algorithm-1" } : invalidChoice && index === 0 ? { interaction: { type: "choice", selectionMode: "single", options: [{ id: "keep", text: "Keep" }, { id: "discard", text: "Discard" }], acceptedOptionIds: ["keep", "discard"] } } : {}));
  const simulationPoolIds = poolIds ?? items.map((entry) => entry.id);
  const simulationProfile = profile ?? { profileId: "fixture-simulation", profileVersion: "v1", profileKind: "internal_learning_profile", totalOccurrences: 40, poolId: "fixture-pool", distributions: [{ dimension: "learningStage", buckets: [{ valueId: "simulation", minimum: 40, target: 40, maximum: 40 }] }], selectionPolicy: { uniqueItems: true, replacement: false, deterministic: true, algorithmVersion: "sha256-ranked-constraints-v1" }, provenance: { authority: "patternly_product", approvedBy: "fixture reviewer", approvedAt: "2026-07-16", rationale: "Technical fixture only." } };
  return {
    schemaVersion: "algorithms-manual-source-v2", batchId: "fixture-algorithms-batch", trackId: "algorithms", familyId: "algorithms", contentVersion: "algorithms-fixture-v2", taxonomyVersion: "algorithms-taxonomy-v2", declaredModes,
    taxonomy: badTaxonomy ? { roadmapNodeId: "unknown", primaryMentalUnitId: "array_traversal", patternFamilyId: "linear_scan" } : { roadmapNodeId: "arrays_and_strings", primaryMentalUnitId: "array_traversal", patternFamilyId: "linear_scan" },
    batchKind: "standard", authoringProvenance: { author: "fixture author", createdAt: "2026-07-16", contentBatchId: "fixture-algorithms-batch", authoringMethod: "independently_authored" }, items,
    modeStructures: modeStructures ?? { practiceBlueprints: [{ blueprintId: "fixture-simulation-blueprint", blueprintVersion: "v1", modeId: "interview_simulation", requestedLengths: [40], defaultRequestedLength: 40, shortening: "prohibited", minimumActualLength: 40, composition: { kind: "simulation_pool", ids: ["fixture-pool"] } }], recognitionSets: [], contrastSets: [], interleavedScopes: [], compatibilitySets: [], simulationPools: [{ poolId: "fixture-pool", poolVersion: "v1", itemIds: simulationPoolIds }], simulationProfiles: [simulationProfile] }
  };
}
export function certificationBatch({ count = 50 } = {}) { return { schemaVersion: "certification-manual-source-v1", batchId: "fixture-certification-batch", trackId: "cloud-certification", familyId: "certification", contentVersion: "certification-fixture-v1", taxonomyVersion: "cloud-certification-taxonomy-v1", declaredModes: ["cloud-practice"], items: Array.from({ length: count }, (_, index) => ({ id: `fixture-certification-${index + 1}` })) }; }
async function writeApprovalsAndActivation(root, trackId, commit) {
  const inspected = await inspectTrack({ root, trackId, sourceRepositoryCommit: commit });
  const approvalIds = new Map();
  for (const evidence of inspected.source.technicalEvidence) {
    const approvalId = `fixture-approval-${evidence.batchId}`; approvalIds.set(evidence.batchId, approvalId);
    await write(root, `manual/approvals/${trackId}/${evidence.batchId}.json`, { approvalSchemaVersion: 1, approvalId, reviewKind: "editorial", batchId: evidence.batchId, familyId: inspected.track.familyId, trackId, primaryTaxonomyReference: inspected.track.familyId === "algorithms" ? "array_traversal" : "fixture", includedItems: Object.entries(evidence.itemFingerprints).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([itemId, itemFingerprint]) => ({ itemId, itemFingerprint })), targetContentVersion: inspected.source.contentVersion, reviewer: "fixture reviewer", reviewDate: "2026-07-16", technicalValidationEvidenceId: evidence.evidenceId, factualAndEditorialDefectsFound: [], requiredCorrections: [], finalDisposition: "approved" });
  }
  const coverage = inspected.source.items.map((entry) => { const batch = inspected.source.batches.find((candidate) => candidate.items.some((item) => item.id === entry.id)); return { itemId: entry.id, itemFingerprint: entry.itemFingerprint, approvalId: approvalIds.get(batch.batchId) }; });
  await write(root, `manual/activations/${trackId}/fixture-activation.json`, { activationSchemaVersion: 1, activationId: `fixture-activation-${trackId}`, trackId, familyId: inspected.track.familyId, contentVersion: inspected.source.contentVersion, taxonomyVersion: inspected.source.taxonomyVersion, itemCoverage: coverage });
}
export async function fixtureRoot(root, { algorithms, certification, approvals = true, legacy = false } = {}) {
  await write(root, "config/families/algorithms.json", { schemaVersion: "algorithms-family-config-v2", familyId: "algorithms", supportedInteractions: ["choice", "ordering", "complexity"], modeBlueprintRequirements: [{ modeId: "interview_simulation", defaultRequestedLength: 40, supportedRequestedLengths: [40], shortening: "prohibited", minimumActualLength: 40, compositionKind: "simulation_pool" }] });
  await write(root, "config/families/certification.json", { schemaVersion: "family-config-v1", familyId: "certification", supportedInteractions: ["choice"], modes: [{ id: "cloud-practice", minimumPool: 10 }] });
  await write(root, "config/tracks/algorithms.json", { schemaVersion: "track-config-v1", trackId: "algorithms", familyId: "algorithms", taxonomyVersion: "algorithms-taxonomy-v2", taxonomyPath: "config/taxonomy/algorithms.json" });
  await write(root, "config/tracks/cloud-certification.json", { schemaVersion: "track-config-v1", trackId: "cloud-certification", familyId: "certification", taxonomyVersion: "cloud-certification-taxonomy-v1", taxonomyPath: "config/taxonomy/cloud-certification.json" });
  await write(root, "config/taxonomy/algorithms.json", { schemaVersion: "algorithms-taxonomy-v2", trackId: "algorithms", taxonomyVersion: "algorithms-taxonomy-v2", roadmapNodes: [{ id: "arrays_and_strings" }], mentalUnits: [{ id: "array_traversal", roadmapNodeId: "arrays_and_strings" }], patternFamilies: [{ id: "linear_scan", primaryMentalUnitId: "array_traversal" }], patternVariants: [{ id: "forward_scan", patternFamilyId: "linear_scan" }], problemArchetypes: [{ id: "single_pass_lookup", patternFamilyId: "linear_scan" }], skillAtoms: [{ id: "maintain_invariant", primaryMentalUnitId: "array_traversal" }], falseHeuristics: [{ id: "sort_before_scanning", primaryMentalUnitId: "array_traversal" }] });
  await write(root, "config/taxonomy/cloud-certification.json", { schemaVersion: "taxonomy-config-v1", trackId: "cloud-certification", taxonomyVersion: "cloud-certification-taxonomy-v1", axes: [] });
  if (algorithms) await write(root, "manual/source/algorithms/fixture.json", algorithms); if (certification) await write(root, "manual/source/cloud-certification/fixture.json", certification); if (legacy) await write(root, "tracks/algorithms/banks/legacy.json", algorithmsBatch());
  if (approvals && algorithms) await writeApprovalsAndActivation(root, "algorithms", "fixture-source-commit"); if (approvals && certification) await writeApprovalsAndActivation(root, "cloud-certification", "fixture-source-commit");
}
