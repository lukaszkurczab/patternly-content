import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT } from "./curricula.mjs";
import { auditCurricula } from "./audit-curricula.mjs";

const result = await auditCurricula();
const lines = [
  "# Curriculum coverage specification",
  "",
  `Machine-readable source: \`config/curricula/*.json\`. Catalogue fingerprint: \`${result.catalogue}\`.`,
  "",
  "## Release tracks",
  "",
  "| Track | Family | Before nodes/target | After nodes/target | Blocks | Verified existing | New authoring | Free | Premium | Mode state |",
  "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |"
];
for (const entry of result.trackVolumes) {
  const curriculum = result.curricula.find((item) => item.trackId === entry.trackId);
  const registryVerified = result.objectiveCoverage.certifications.some((entry) => entry.trackId === curriculum.trackId && entry.registryStatus === "exact_current_registry_verified");
  const state = curriculum.familyId === "design_interview" ? "blocked_by_contract" : curriculum.familyId === "certification" && registryVerified ? "exact_objectives_verified_volume_unverified_authoring_blocked_pending_mechanism_docs_and_CERT-CORR-02_to_CERT-CORR-04" : curriculum.familyId === "certification" ? "registry_pending_authoring_blocked" : "active_contract_and_planned_coverage";
  lines.push(`| ${entry.trackId} | ${entry.familyId} | ${entry.before.nodes}/${entry.before.target} | ${entry.nodes.length}/${entry.targetItemCount} | ${entry.nodes.reduce((sum, node) => sum + node.blockCount, 0)} | ${entry.existingVerifiedItemCount} | ${entry.authoringItemCount} | ${entry.freeTargetItemCount} | ${entry.premiumTargetItemCount} | ${state} |`);
}
lines.push("", "## Node targets", "");
for (const entry of result.trackVolumes) {
  const curriculum = result.curricula.find((item) => item.trackId === entry.trackId);
  lines.push(`### ${entry.trackId}`, "", "| Order | Node | Target | Existing | Authoring | Package |", "| ---: | --- | ---: | ---: | ---: | --- |");
  entry.nodes.forEach((node, index) => {
    const curriculumNode = curriculum.nodes.find((item) => item.nodeId === node.nodeId);
    lines.push(`| ${index + 1} | ${node.nodeId} | ${node.targetItemCount} | ${node.existingVerifiedItemCount} | ${node.authoringItemCount} | ${curriculumNode.freeOrPremiumRole} |`);
  });
  lines.push("");
}
lines.push("", "## Certification graph reconciliation", "");
for (const graph of result.certificationGraphReconciliation) lines.push(`- ${graph.trackId}: ${graph.relationshipEdgeCount}/${graph.prerequisiteEdgeCount} prerequisite edges reconciled; ${graph.status}.`);
lines.push("", "## Certification objective registry", "");
for (const entry of result.objectiveCoverage.certifications) {
  if (entry.registryStatus === "registry_pending") lines.push(`- ${entry.trackId}: registry_pending; authoring_blocked.`);
  else lines.push(`- ${entry.trackId}: exact current registry verified; ${entry.objectives.covered}/${entry.objectives.total} objectives covered, ${entry.objectives.exclusions} exclusions; mappings ${entry.entityMappings.nodes}/${entry.entityMappings.blocks}/${entry.entityMappings.atoms}/${entry.entityMappings.targets}; direct first-party mechanism documentation remains unresolved, volume unverified, and authoring blocked. New-guide gaps remain later slot/content work: ${entry.unresolvedGuideGaps.join("; ")}.`);
}
const certificationRegistryProgress = result.objectiveCoverage.certifications.reduce((progress, entry) => {
  progress[entry.registryStatus === "exact_current_registry_verified" ? "complete" : "pending"].push(entry.trackId);
  return progress;
}, { complete: [], pending: [] });
lines.push("", "## Contract gaps", "", `${certificationRegistryProgress.complete.length} of ${result.objectiveCoverage.certifications.length} certification tracks completed CERT-CORR-01 exact-registry work (${certificationRegistryProgress.complete.join(", ") || "none"}), but direct first-party mechanism documentation is unresolved; their volumes remain unverified and authoring is blocked pending CERT-CORR-02_to_CERT-CORR-04. ${certificationRegistryProgress.pending.length} certification tracks remain registry_pending in their named CERT-CORR-01 stages (${certificationRegistryProgress.pending.join(", ") || "none"}). All certification rows and counts are planning values, not an accepted backlog or feasibility claim. Design Interview remains blocked by its application-owned selection/scoring interaction contract. Coding remains an accepted baseline with its active source pipeline and existing pre-authoring gates.`, "", "## Audit", "", `Second-pass audit: ${result.defects.status}. Resolved defects: ${result.defects.defects.filter((defect) => defect.resolution === "resolved").map((defect) => defect.defectId).join(", ")}.`, "");
for (const audit of result.defects.auditDimensions) lines.push(`- ${audit.dimension}: ${audit.status} — ${audit.evidence}`);
lines.push("", `Completion boundary: ${result.defects.completionBoundary}`, "", "## First safe authoring batch", "", `Candidate after mandatory pre-authoring gate — \`${result.authoringHandoff.firstSafeBatch.trackId}/${result.authoringHandoff.firstSafeBatch.nodeId}/${result.authoringHandoff.firstSafeBatch.blockId}\`: ${result.authoringHandoff.firstSafeBatch.targetItemCount} additions for atom \`${result.authoringHandoff.firstSafeBatch.primarySkillOrDecisionAtomId}\` in ${result.authoringHandoff.firstSafeBatch.sourcePaths.map((path) => `\`${path}\``).join(", ")}. Gates: ${result.authoringHandoff.firstSafeBatch.preAuthoringGate.join(" ")} ${result.authoringHandoff.firstSafeBatch.reason}`, "", "## Authoring handoff", "");
for (const batch of result.authoringHandoff.authoringBatches) {
  if (batch.executionStatus.endsWith("_not_an_authoring_batch")) {
    lines.push(`- \`${batch.trackId}/${batch.nodeId}/${batch.blockId}\`: ${batch.executionStatus}; reported count ${batch.targetItemCount} is unverified and this record must not be used for authoring.`);
    continue;
  }
  lines.push(`- \`${batch.trackId}/${batch.nodeId}/${batch.blockId}\`: ${batch.executionStatus}; author ${batch.targetItemCount} additions against total ${batch.totalCoverageItemCount}; targets ${batch.coverageTargetIds.map((targetId) => `\`${targetId}\``).join(", ")}; sources ${batch.sourcePaths.length ? batch.sourcePaths.map((path) => `\`${path}\``).join(", ") : "must be created atomically with the track/taxonomy contract"}; validate with ${batch.validationCommands.map((command) => `\`${command}\``).join(", ")}. Human review: source fidelity, diagnostic distinctness, and forbidden-overlap check.`);
}
await mkdir(join(ROOT, "reports"), { recursive: true });
await writeFile(join(ROOT, "reports", "curriculum-summary.md"), `${lines.join("\n")}\n`);
const finalAuditLines = lines.slice(0, lines.indexOf("## Authoring handoff"));
while (finalAuditLines.at(-1) === "") finalAuditLines.pop();
await writeFile(join(ROOT, "evidence", "curriculum", "2026.08.09", "final-audit.md"), `${finalAuditLines.join("\n")}\n`);
process.stdout.write("Rendered reports/curriculum-summary.md.\n");
