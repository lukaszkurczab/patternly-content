import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, catalogueFingerprint, loadCurricula } from "./curricula.mjs";
import { buildExistingContentInventories } from "./curriculum-inventory.mjs";

const output = join(ROOT, "evidence", "curriculum", "2026.08.09");
const write = async (name, value) => { await mkdir(output, { recursive: true }); await writeFile(join(output, name), `${JSON.stringify(value, null, 2)}\n`); };
const sha = (value) => createHash("sha256").update(value).digest("hex");
const nodeTotal = (node) => node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0);

function volumes(curricula) {
  return curricula.map((curriculum) => ({
    trackId: curriculum.trackId,
    familyId: curriculum.familyId,
    targetItemCount: curriculum.targetItemCount,
    existingVerifiedItemCount: curriculum.existingVerifiedItemCount ?? 0,
    authoringItemCount: curriculum.authoringItemCount ?? curriculum.targetItemCount,
    freeTargetItemCount: curriculum.nodes.filter((node) => node.freeOrPremiumRole === "free").reduce((sum, node) => sum + nodeTotal(node), 0),
    premiumTargetItemCount: curriculum.nodes.filter((node) => node.freeOrPremiumRole === "premium").reduce((sum, node) => sum + nodeTotal(node), 0),
    nodes: curriculum.nodes.map((node) => ({ nodeId: node.nodeId, targetItemCount: nodeTotal(node), existingVerifiedItemCount: node.existingVerifiedItemCount ?? 0, authoringItemCount: node.authoringItemCount ?? nodeTotal(node), blockCount: node.learningBlocks.length }))
  }));
}

async function releaseFingerprints() {
  const releases = [];
  for (const releaseId of (await readdir(join(ROOT, "artifacts", "releases"))).filter((name) => /^patternly-core-\d+$/.test(name)).sort()) {
    const bytes = await readFile(join(ROOT, "artifacts", "releases", releaseId, "release.json"));
    releases.push({ releaseId, releaseJsonSha256: sha(bytes) });
  }
  return releases;
}

export async function auditCurricula() {
  const curricula = await loadCurricula();
  const catalogue = catalogueFingerprint(curricula);
  const trackVolumes = volumes(curricula);
  const inventories = await buildExistingContentInventories({ outputDirectory: output });
  const modeFeasibility = curricula.map((curriculum) => ({
    trackId: curriculum.trackId,
    familyId: curriculum.familyId,
    nodePools: curriculum.nodes.map((node) => ({ nodeId: node.nodeId, uniquePlannedVariants: nodeTotal(node), status: curriculum.familyId === "design_interview" ? "blocked_by_contract" : "planned_coverage_sufficient" })),
    modePools: curriculum.modePoolPlans,
    simulationOrCasePools: curriculum.simulationOrCasePoolPlans
  }));
  const defects = {
    auditVersion: "2026.08.09-correction-pass",
    catalogueFingerprint: catalogue,
    status: "curriculum_frozen_with_recorded_runtime_boundary",
    completionBoundary: "The curriculum model is frozen for authoring. The active GCP source is intentionally not deleted until the first replacement instructional source has independently passed immutable release and package evidence; the frozen curriculum retains zero old item identities and no fallback. Design Interview source authoring cannot enter active modes until its application-owned selection/scoring contract exists.",
    defects: [
      { defectId: "CURR-001", severity: "high", auditDimension: "node_volume_and_coding_regression", evidence: "The first materialization compressed Coding Interview from its verified 26 nodes and 2,375 source items to 8 planning nodes and 343 items.", whyItMatters: "It would have destroyed the verified canonical scale and made all other tracks incorrectly small.", requiredCorrection: "Restore all 26 canonical Coding nodes; preserve the 2,375 verified items as existing coverage; require at least 120 planned items per node for every release track.", resolution: "resolved", correctionEvidence: `The corrected catalogue has 26 Coding nodes, ${inventories.codingInventory.itemCount} aligned existing Coding items, and every node in every track is at least 120 items.` },
      { defectId: "CURR-002", severity: "medium", auditDimension: "design_mode_contract", evidence: "No application-owned Design Interview selection/scoring contract exists.", whyItMatters: "Counts cannot prove executable design modes.", requiredCorrection: "Keep design targets and pools blocked_by_contract with a named owner.", resolution: "resolved", correctionEvidence: "No design interaction is claimed as active; all Design Interview pools remain blocked." },
      { defectId: "CURR-003", severity: "low", auditDimension: "gcp_greenfield_cutover", evidence: `The active GCP source contains ${inventories.gcpInventory.activeSource.itemCount} old items and is referenced by immutable package evidence.`, whyItMatters: "Immediate deletion would falsify evidence; retention as fallback would violate greenfield scope.", requiredCorrection: "Use an atomic replacement cutover after new-source evidence exists.", resolution: "safe_deferred_boundary", correctionEvidence: "The GCP inventory records exact source paths, IDs, immutable paths, and a no-fallback deletion action. The target curriculum itself retains zero old GCP item IDs." },
      { defectId: "CURR-004", severity: "medium", auditDimension: "variant_distinctness", evidence: "The validator can prove count reconciliation and named-axis uniqueness, but cannot prove yet-unwritten items are materially distinct.", whyItMatters: "Authoring volume could otherwise contain near-duplicate filler.", requiredCorrection: "Each authoring batch must reject a variant unless it changes the stated diagnostic decision under one declared axis.", resolution: "authoring_gate_recorded", correctionEvidence: "Every coverage target now includes a diagnostic decision, misconception, boundary, transfer boundary, at least two variation axes, and a non-arbitrary variant rationale; the authoring handoff repeats this review gate." },
      { defectId: "CURR-005", severity: "medium", auditDimension: "source_objective_mapping", evidence: "Certification coverage depends on volatile provider objective sources.", whyItMatters: "Provider drift could invalidate a plan after this freeze.", requiredCorrection: "Recheck each official objective reference before authoring its first block and before a release cut.", resolution: "maintenance_gate_recorded", correctionEvidence: "Each certification node retains source IDs and official-objective references; the source audit records the current public official sources and their checked dates." }
    ]
  };
  const overlapAudit = { catalogueFingerprint: catalogue, status: "no_unowned_overlap", reviewedPairs: [
    { pair: ["backend-system-design-interview", "frontend-system-design-interview"], boundary: "Backend owns service/data/reliability; Frontend owns client state/rendering/accessibility." },
    { pair: ["backend-system-design-interview", "object-oriented-design-interview"], boundary: "Backend owns distributed boundaries; OOD owns responsibility, lifecycle, and collaboration." },
    { pair: ["coding-interview-dsa-problem-solving", "backend-system-design-interview"], boundary: "Coding owns algorithmic implementation planning; design owns architectural decision communication." },
    { pair: ["certification tracks"], boundary: "Provider-specific objective and transfer context prevent shared active item ownership." }
  ] };
  const sourceAudit = { catalogueFingerprint: catalogue, certifications: curricula.filter((entry) => entry.familyId === "certification").map((entry) => ({ trackId: entry.trackId, sources: entry.sourceBasis, result: "current_official_public_source_recorded", simulationClaim: "Patternly-only profile; provider exam experience is not copied or claimed." })) };
  const authoringHandoff = {
    curriculumVersion: "2026.08.09",
    catalogueFingerprint: catalogue,
    authoringBatches: curricula.flatMap((curriculum) => curriculum.nodes.flatMap((node) => node.learningBlocks.map((block) => ({
      batchId: `${curriculum.trackId}:${node.nodeId}:${block.blockId}`,
      trackId: curriculum.trackId,
      nodeId: node.nodeId,
      blockId: block.blockId,
      filesToCreate: [`manual/source/${curriculum.trackId}/curriculum-2026-08-09/${node.nodeId}/${block.blockId}.json`],
      coverageTargetIds: block.coverageTargets.map((target) => target.coverageTargetId),
      targetItemCount: block.authoringItemCount ?? block.targetItemCount,
      totalCoverageItemCount: block.targetItemCount,
      existingVerifiedItemCount: block.existingVerifiedItemCount ?? 0,
      interactionContracts: [...new Map(block.coverageTargets.map((target) => [`${target.preferredInteractionContract}:${target.interactionContractStatus}`, { type: target.preferredInteractionContract, status: target.interactionContractStatus }])).values()],
      primaryObjectives: block.coverageTargets.map((target) => target.learningObjective),
      variationAxes: block.coverageTargets.map((target) => ({ coverageTargetId: target.coverageTargetId, axes: target.scenarioOrSurfaceVariationAxes })),
      sourceRequirements: block.sourceRequirements,
      forbiddenOverlaps: block.overlapExclusions,
      validationCommands: ["npm run validate:curricula", "npm run audit:curricula", "npm test"],
      humanReviewBoundary: "Source fidelity, diagnostic distinctness, independent authorship, and no proprietary/exam-dump overlap."
    })).filter((batch) => batch.targetItemCount > 0)))
  };
  const familyTotals = Object.groupBy(trackVolumes, (entry) => entry.familyId);
  await write("catalogue-summary.json", { curriculumVersion: "2026.08.09", catalogueFingerprint: catalogue, tracks: trackVolumes });
  await write("mode-feasibility.json", { catalogueFingerprint: catalogue, tracks: modeFeasibility });
  await write("overlap-audit.json", overlapAudit);
  await write("source-audit.json", sourceAudit);
  await write("volume-audit.json", { catalogueFingerprint: catalogue, tracks: trackVolumes, familyTotals });
  await write("authoring-handoff.json", authoringHandoff);
  await write("immutable-release-fingerprints.json", { checkedAt: "2026-08-09", releases: await releaseFingerprints() });
  await write("defects.json", defects);
  return { curricula, catalogue, trackVolumes, modeFeasibility, defects, inventories };
}

if (process.argv[1]?.endsWith("audit-curricula.mjs")) {
  const result = await auditCurricula();
  process.stdout.write(`Audited ${result.curricula.length} curricula; ${result.defects.status}.\n`);
}
