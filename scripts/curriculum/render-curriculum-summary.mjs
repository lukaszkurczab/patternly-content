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
  "| Track | Family | Nodes | Blocks | Total target | Verified existing | New authoring | Free | Premium | Mode state |",
  "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |"
];
for (const entry of result.trackVolumes) {
  const curriculum = result.curricula.find((item) => item.trackId === entry.trackId);
  const state = curriculum.familyId === "design_interview" ? "blocked_by_contract" : "planned_coverage_sufficient";
  lines.push(`| ${entry.trackId} | ${entry.familyId} | ${entry.nodes.length} | ${entry.nodes.reduce((sum, node) => sum + node.blockCount, 0)} | ${entry.targetItemCount} | ${entry.existingVerifiedItemCount} | ${entry.authoringItemCount} | ${entry.freeTargetItemCount} | ${entry.premiumTargetItemCount} | ${state} |`);
}
lines.push("", "## Contract gaps", "", "Design Interview authoring remains blocked by the application-owned selection/scoring interaction contract. Certification and Coding figures are planning coverage, not shipping admission or authored-item readiness.", "", "## Audit", "", `Second-pass audit: ${result.defects.status}. Resolved defects: ${result.defects.defects.filter((defect) => defect.resolution === "resolved").map((defect) => defect.defectId).join(", ")}.`, "", `Completion boundary: ${result.defects.completionBoundary}`, "", "## Authoring handoff", "");
for (const curriculum of result.curricula) for (const node of curriculum.nodes) for (const block of node.learningBlocks) {
  const authoringItemCount = block.authoringItemCount ?? block.targetItemCount;
  if (authoringItemCount === 0) continue;
  lines.push(`- \`${curriculum.trackId}/${node.nodeId}/${block.blockId}\`: author ${authoringItemCount} additions against a total block target of ${block.targetItemCount} for ${block.coverageTargets.map((target) => `\`${target.coverageTargetId}\``).join(", ")}; interactions ${[...new Set(block.coverageTargets.map((target) => `${target.preferredInteractionContract} (${target.interactionContractStatus})`))].join(", ")}; validate with \`npm run validate:curricula && npm run audit:curricula\`. Human review: source fidelity, diagnostic distinctness, and forbidden-overlap check.`);
}
await mkdir(join(ROOT, "reports"), { recursive: true });
await writeFile(join(ROOT, "reports", "curriculum-summary.md"), `${lines.join("\n")}\n`);
const finalAuditLines = lines.slice(0, lines.indexOf("## Authoring handoff"));
while (finalAuditLines.at(-1) === "") finalAuditLines.pop();
await writeFile(join(ROOT, "evidence", "curriculum", "2026.08.09", "final-audit.md"), `${finalAuditLines.join("\n")}\n`);
process.stdout.write("Rendered reports/curriculum-summary.md.\n");
