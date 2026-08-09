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
  const state = curriculum.familyId === "design_interview" ? "blocked_by_contract" : curriculum.familyId === "certification" ? "planned_coverage_only_not_admitted" : "active_contract_and_planned_coverage";
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
lines.push("", "## Contract gaps", "", "Design Interview authoring remains blocked by the application-owned selection/scoring interaction contract. Certification curricula are frozen planning contracts, not runtime admission; each authoring change must add its real track/taxonomy/source/release contract atomically. Coding retains an active source pipeline, but new authoring must first bind items to coverage targets and advance the full source cohort to a new immutable content version.", "", "## Audit", "", `Second-pass audit: ${result.defects.status}. Resolved defects: ${result.defects.defects.filter((defect) => defect.resolution === "resolved").map((defect) => defect.defectId).join(", ")}.`, "");
for (const audit of result.defects.auditDimensions) lines.push(`- ${audit.dimension}: ${audit.status} — ${audit.evidence}`);
lines.push("", `Completion boundary: ${result.defects.completionBoundary}`, "", "## First safe authoring batch", "", `Candidate after mandatory pre-authoring gate — \`${result.authoringHandoff.firstSafeBatch.trackId}/${result.authoringHandoff.firstSafeBatch.nodeId}/${result.authoringHandoff.firstSafeBatch.blockId}\`: ${result.authoringHandoff.firstSafeBatch.targetItemCount} additions for atom \`${result.authoringHandoff.firstSafeBatch.primarySkillOrDecisionAtomId}\` in ${result.authoringHandoff.firstSafeBatch.sourcePaths.map((path) => `\`${path}\``).join(", ")}. Gates: ${result.authoringHandoff.firstSafeBatch.preAuthoringGate.join(" ")} ${result.authoringHandoff.firstSafeBatch.reason}`, "", "## Authoring handoff", "");
for (const batch of result.authoringHandoff.authoringBatches) {
  lines.push(`- \`${batch.trackId}/${batch.nodeId}/${batch.blockId}\`: ${batch.executionStatus}; author ${batch.targetItemCount} additions against total ${batch.totalCoverageItemCount}; targets ${batch.coverageTargetIds.map((targetId) => `\`${targetId}\``).join(", ")}; sources ${batch.sourcePaths.length ? batch.sourcePaths.map((path) => `\`${path}\``).join(", ") : "must be created atomically with the track/taxonomy contract"}; validate with ${batch.validationCommands.map((command) => `\`${command}\``).join(", ")}. Human review: source fidelity, diagnostic distinctness, and forbidden-overlap check.`);
}
await mkdir(join(ROOT, "reports"), { recursive: true });
await writeFile(join(ROOT, "reports", "curriculum-summary.md"), `${lines.join("\n")}\n`);
const finalAuditLines = lines.slice(0, lines.indexOf("## Authoring handoff"));
while (finalAuditLines.at(-1) === "") finalAuditLines.pop();
await writeFile(join(ROOT, "evidence", "curriculum", "2026.08.09", "final-audit.md"), `${finalAuditLines.join("\n")}\n`);
process.stdout.write("Rendered reports/curriculum-summary.md.\n");
