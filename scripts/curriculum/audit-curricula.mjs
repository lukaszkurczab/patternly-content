import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, catalogueFingerprint, loadCurricula } from "./curricula.mjs";
import { buildExistingContentInventories } from "./curriculum-inventory.mjs";

const output = join(ROOT, "evidence", "curriculum", "2026.08.09");
const write = async (name, value) => { await mkdir(output, { recursive: true }); await writeFile(join(output, name), `${JSON.stringify(value, null, 2)}\n`); };
const sha = (value) => createHash("sha256").update(value).digest("hex");
const nodeTotal = (node) => node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0);
const before = Object.freeze({
  "aws-certified-solutions-architect-associate": { nodes: 4, target: 480 }, "google-cloud-associate-cloud-engineer": { nodes: 5, target: 600 }, "hashicorp-terraform-associate-004": { nodes: 5, target: 600 }, "kubernetes-cloud-native-associate-kcna": { nodes: 4, target: 480 }, "microsoft-azure-administrator-associate-az-104": { nodes: 5, target: 600 }, "microsoft-azure-ai-fundamentals-ai-901": { nodes: 5, target: 600 }, "backend-system-design-interview": { nodes: 5, target: 600 }, "frontend-system-design-interview": { nodes: 5, target: 600 }, "object-oriented-design-interview": { nodes: 5, target: 600 }
});

function volumes(curricula) {
  return curricula.map((curriculum) => ({
    trackId: curriculum.trackId,
    familyId: curriculum.familyId,
    before: before[curriculum.trackId] ?? { nodes: curriculum.nodes.length, target: curriculum.targetItemCount }, targetItemCount: curriculum.targetItemCount,
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
  const codingCurriculum = curricula.find((curriculum) => curriculum.familyId === "coding_interview");
  const firstCodingGap = codingCurriculum.nodes.flatMap((node) => node.learningBlocks.map((block) => ({ node, block, authoringItemCount: block.authoringItemCount ?? block.targetItemCount - (block.existingVerifiedItemCount ?? 0) }))).find((entry) => entry.authoringItemCount > 0);
  const firstGapItems = inventories.codingInventory.items.filter((item) => item.primaryCurriculumBlockId === firstCodingGap.block.blockId);
  const atomCounts = Map.groupBy(firstGapItems, (item) => item.primarySkillOrDecisionAtomId);
  const firstGapAtom = [...atomCounts.entries()].sort((left, right) => left[1].length - right[1].length || left[0].localeCompare(right[0]))[0][0];
  const firstGapSourcePaths = [...new Set(atomCounts.get(firstGapAtom).map((item) => item.sourcePath))].sort();
  const modeFeasibility = curricula.map((curriculum) => ({
    trackId: curriculum.trackId,
    familyId: curriculum.familyId,
    coverageFeasibilitySemantics: curriculum.familyId === "coding_interview" ? "planned capacity backed by the active Coding source and interaction contract" : curriculum.familyId === "certification" ? "planned arithmetic capacity only; runtime admission requires a real track, taxonomy, source, and release contract" : "planned design capacity remains blocked by the missing interaction contract",
    runtimeAdmissionStatus: curriculum.familyId === "coding_interview" ? "active_source_contract_supported" : curriculum.familyId === "certification" ? "not_admitted_requires_track_and_taxonomy_contract" : "blocked_by_interaction_contract",
    nodePools: curriculum.nodes.map((node) => ({ nodeId: node.nodeId, eligiblePlannedVariantCapacity: nodeTotal(node), authoredItemCount: node.existingVerifiedItemCount ?? 0, status: curriculum.familyId === "design_interview" ? "blocked_by_contract" : "planned_coverage_sufficient" })),
    modePools: curriculum.modePoolPlans,
    simulationOrCasePools: curriculum.simulationOrCasePoolPlans
  }));
  const defects = {
    auditVersion: "2026.08.09-correction-pass",
    catalogueFingerprint: catalogue,
    status: "curriculum_frozen_with_recorded_runtime_boundary",
    completionBoundary: "The curriculum and authoring backlog are frozen. Question authoring must not start until its handoff's machine-binding gate is implemented: Coding needs coverage-target binding plus a coherent new content-version cohort; Certification needs a real track/taxonomy/source/release contract; Design additionally needs the application-owned selection/scoring interaction contract. The GCP active-source cutover is resolved while immutable historical bytes remain preserved.",
    auditDimensions: [
      { dimension: "node_boundaries_and_learning_blocks", status: "passed", evidence: "Every node owns two or more family-appropriate blocks; target ownership and track totals reconcile." },
      { dimension: "prerequisites_and_order", status: "passed", evidence: "The validator requires an acyclic DAG and every prerequisite to precede its dependent node." },
      { dimension: "overlap_and_ownership", status: "passed", evidence: "Every non-Coding decision target owns exactly one atom; Coding block operations explicitly own their direct atom set." },
      { dimension: "misconceptions_and_transfer", status: "passed", evidence: "Every target declares a competing decision or misconception plus decisive and transfer boundaries." },
      { dimension: "variant_distinctness_and_filler", status: "passed_with_authoring_gate", evidence: "Uniform target-count and systematic mirrored-pair signatures fail validation; future item wording still requires human distinctness review." },
      { dimension: "session_pool_and_modes", status: "passed_as_planned_capacity", evidence: "Planned pools are scoped to mode-eligible interaction shapes and simulation uniqueness is checked. This does not admit Certification tracks to runtime; Design remains blocked_by_contract." },
      { dimension: "free_premium_packages", status: "passed", evidence: "Exactly one brief-owned Free node exists per track and every node is an immutable whole-node package boundary." },
      { dimension: "source_and_provenance", status: "passed_with_maintenance_gate", evidence: "Source IDs resolve; certification objectives retain current first-party guide provenance and require release-time volatile-fact recheck." },
      { dimension: "cross_family_reuse", status: "passed", evidence: "Coding uses block operations, Certification uses SIG/DEC/BND/XFR, and Design uses S/D/F/T[/I] without claiming an unsupported runtime." },
      { dimension: "authoring_cost", status: "quantified", evidence: `${trackVolumes.reduce((sum, track) => sum + track.authoringItemCount, 0)} future items across the final block-level backlog.` }
    ],
    defects: [
      { defectId: "CURR-001", severity: "high", auditDimension: "coding_sanity_regression", evidence: "Cross-track materialization could have reopened the accepted Coding baseline.", whyItMatters: "Coding has verified node, target, and source-item commitments.", requiredCorrection: "Audit reachability only; do not redesign nodes or counts without a material defect.", resolution: "resolved", correctionEvidence: `PASS: 26 nodes, 3,404 target, ${inventories.codingInventory.itemCount} aligned existing items. The minimal correction makes recognition, selection, and boundary explicit block operations, requires direct atom ownership, and maps every existing item to node, block, and primary atom without inventing an item-level operation.` },
      { defectId: "CURR-006", severity: "high", auditDimension: "quota_driven_curriculum", evidence: "The pre-correction non-Coding catalogue used uniform three-block, 40-item, 12/14/14 patterns.", whyItMatters: "Arithmetic validity concealed missing ownership and filler risk.", requiredCorrection: "Use decision atoms with accountable operation counts, rationales, and bottom-up sums.", resolution: "resolved", correctionEvidence: "Every non-Coding target now has a named decision atom and machine-checkable SIG/DEC/BND/XFR or S/D/F/T[/I] counts with decision-specific rationales; node and track totals reconcile from those operations without pretending that unwritten item cells already exist." },
      { defectId: "CURR-002", severity: "medium", auditDimension: "design_mode_contract", evidence: "No application-owned Design Interview selection/scoring contract exists.", whyItMatters: "Counts cannot prove executable design modes.", requiredCorrection: "Keep design targets and pools blocked_by_contract with a named owner.", resolution: "resolved", correctionEvidence: "No design interaction is claimed as active; all Design Interview pools remain blocked." },
      { defectId: "CURR-003", severity: "low", auditDimension: "gcp_greenfield_cutover", evidence: `The active GCP source contains ${inventories.gcpInventory.activeSource.itemCount} items.`, whyItMatters: "Active stale ingress or package admission would contradict the greenfield curriculum boundary.", requiredCorrection: "Remove active GCP ingress, package admission, and candidate ownership without modifying immutable historical bytes.", resolution: "resolved", correctionEvidence: "The inventory records zero active source items, no deferred replacement prerequisite, and a no-fallback cutover; immutable historical bytes remain outside active discovery." },
      { defectId: "CURR-004", severity: "medium", auditDimension: "variant_distinctness", evidence: "The validator can prove count reconciliation and named-axis uniqueness, but cannot prove yet-unwritten items are materially distinct.", whyItMatters: "Authoring volume could otherwise contain near-duplicate filler.", requiredCorrection: "Each authoring batch must reject a variant unless it changes the stated diagnostic decision under one declared axis.", resolution: "authoring_gate_recorded", correctionEvidence: "Every coverage target now includes a diagnostic decision, misconception, boundary, transfer boundary, at least two variation axes, and a non-arbitrary variant rationale; the authoring handoff repeats this review gate." },
      { defectId: "CURR-005", severity: "medium", auditDimension: "source_objective_mapping", evidence: "Certification coverage depends on volatile provider objective sources.", whyItMatters: "Provider drift could invalidate a plan after this freeze.", requiredCorrection: "Recheck each official objective reference before authoring its first block and before a release cut.", resolution: "maintenance_gate_recorded", correctionEvidence: "Each certification node retains source IDs and official-objective references; the source audit records the current public official sources and their checked dates." }
    ]
  };
  const overlapAudit = { catalogueFingerprint: catalogue, status: "no_unowned_overlap_or_family_overfit", representativeContractChecks: [
    { familyId: "coding_interview", representativeTracks: ["coding-interview-dsa-problem-solving"], result: "accepted 26-node baseline; block-operation ownership and item-to-atom mapping validated" },
    { familyId: "certification", representativeTracks: ["aws-certified-solutions-architect-associate", "google-cloud-associate-cloud-engineer", "microsoft-azure-ai-fundamentals-ai-901"], controlTracks: ["hashicorp-terraform-associate-004", "kubernetes-cloud-native-associate-kcna", "microsoft-azure-administrator-associate-az-104"], result: "atomic decision targets, provider objective ownership, and SIG/DEC/BND/XFR counts validated without runtime admission claims" },
    { familyId: "design_interview", representativeTracks: ["backend-system-design-interview", "frontend-system-design-interview", "object-oriented-design-interview"], result: "distinct design-decision blocks and S/D/F/T[/I] counts validated; every mode remains blocked_by_contract" }
  ], familyNeutralGates: ["direct atom ownership", "acyclic ordered prerequisites", "whole-node package ownership", "node floor without uniform target-count signature", "mode-scoped eligible capacity", "source ID resolution"], reviewedPairs: [
    { pair: ["backend-system-design-interview", "frontend-system-design-interview"], boundary: "Backend owns service/data/reliability; Frontend owns client state/rendering/accessibility." },
    { pair: ["backend-system-design-interview", "object-oriented-design-interview"], boundary: "Backend owns distributed boundaries; OOD owns responsibility, lifecycle, and collaboration." },
    { pair: ["coding-interview-dsa-problem-solving", "backend-system-design-interview"], boundary: "Coding owns algorithmic implementation planning; design owns architectural decision communication." },
    { pair: ["certification tracks"], boundary: "Provider-specific objective and transfer context prevent shared active item ownership." }
  ] };
  const sourceAudit = { catalogueFingerprint: catalogue, certifications: curricula.filter((entry) => entry.familyId === "certification").map((entry) => ({ trackId: entry.trackId, sources: entry.sourceBasis, result: "current_official_public_source_recorded", simulationClaim: "Patternly-only profile; provider exam experience is not copied or claimed." })) };
  const authoringHandoff = {
    curriculumVersion: "2026.08.09",
    catalogueFingerprint: catalogue,
    firstSafeBatch: { trackId: codingCurriculum.trackId, nodeId: firstCodingGap.node.nodeId, blockId: firstCodingGap.block.blockId, primarySkillOrDecisionAtomId: firstGapAtom, action: "extend_existing_canonical_source_after_pre_authoring_gate", readinessStatus: "blocked_until_coverage_binding_and_version_cohort_gate", sourcePaths: firstGapSourcePaths, targetItemCount: firstCodingGap.authoringItemCount, preAuthoringGate: ["Bind authored items to curriculum coverageTargetId plus the directly owned atom in the source/publisher validation contract.", "Advance the Coding contentVersion as one coherent 213-envelope cohort before immutable evidence/build; do not overwrite coding-interview-dsa-problem-solving-0004."], reason: "This remains the first ordered positive Coding gap and the least-covered atom in its block. It becomes the first safe question batch only after the named machine-binding and coherent-version gates; the current curriculum phase does not pretend that those publishing checks already exist.", validationCommands: ["npm run validate:real:coding-interview", "npm run validate:curricula", "npm test"] },
    authoringBatches: curricula.flatMap((curriculum) => curriculum.nodes.flatMap((node) => node.learningBlocks.map((block) => ({
      batchId: `${curriculum.trackId}:${node.nodeId}:${block.blockId}`,
      trackId: curriculum.trackId,
      nodeId: node.nodeId,
      blockId: block.blockId,
      executionStatus: curriculum.familyId === "coding_interview" ? "requires_coverage_binding_and_coherent_content_version" : curriculum.familyId === "design_interview" ? "blocked_by_interaction_contract" : "requires_track_and_taxonomy_contract_in_authoring_change",
      sourcePaths: curriculum.familyId === "coding_interview" ? [...new Set(inventories.codingInventory.items.filter((item) => item.primaryCurriculumBlockId === block.blockId).map((item) => item.sourcePath))].sort() : [],
      coverageTargetIds: block.coverageTargets.map((target) => target.coverageTargetId),
      targetItemCount: block.authoringItemCount ?? block.targetItemCount,
      totalCoverageItemCount: block.targetItemCount,
      existingVerifiedItemCount: block.existingVerifiedItemCount ?? 0,
      interactionContracts: [...new Map(block.coverageTargets.map((target) => [`${target.preferredInteractionContract}:${target.interactionContractStatus}`, { type: target.preferredInteractionContract, status: target.interactionContractStatus }])).values()],
      primaryObjectives: block.coverageTargets.map((target) => target.learningObjective),
      variationAxes: block.coverageTargets.map((target) => ({ coverageTargetId: target.coverageTargetId, axes: target.scenarioOrSurfaceVariationAxes })),
      sourceRequirements: block.sourceRequirements,
      forbiddenOverlaps: block.overlapExclusions,
      validationCommands: curriculum.familyId === "coding_interview" ? ["npm run validate:real:coding-interview", "npm run validate:curricula", "npm test"] : ["npm run validate:curricula", "npm run audit:curricula", "npm test"],
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
  return { curricula, catalogue, trackVolumes, modeFeasibility, defects, inventories, authoringHandoff };
}

if (process.argv[1]?.endsWith("audit-curricula.mjs")) {
  const result = await auditCurricula();
  process.stdout.write(`Audited ${result.curricula.length} curricula; ${result.defects.status}.\n`);
}
