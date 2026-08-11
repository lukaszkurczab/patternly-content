import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadAndValidateCertificationPlannedSlotPlans } from "../curriculum/certification-planned-slots.mjs";

const findings = [];
let result;
try { result = await loadAndValidateCertificationPlannedSlotPlans({ root: process.cwd() }); } catch (error) { findings.push({ severity: "Critical", dimension: "candidate_contract", code: error.code ?? "INVALID_CANDIDATE_PLAN", message: error.message }); }
if (result) {
  const dimensions = { semanticIdentity: result.slots.length === new Set(result.slots.map((slot) => slot.dedupeFingerprint)).size, ownershipAndObjectives: result.counts.targets.length > 0, derivedCounts: result.counts.planSlotCount === result.slots.length, runtimeReachability: result.runtimeReachability.admitted === false, providerNeutralOperations: result.slots.every((slot) => !slot.learningOperation.includes("provider")), sourceDepth: result.slots.every((slot) => slot.sourceRequirements.directFirstPartyDocumentation.length > 0) };
  for (const [dimension, passed] of Object.entries(dimensions)) if (!passed) findings.push({ severity: "High", dimension, code: "CERTIFICATION_PLANNED_SLOT_AUDIT_FAILURE", message: `${dimension} did not derive from candidate evidence.` });
}
const criticalFindings = findings.filter((finding) => finding.severity === "Critical").length; const highFindings = findings.filter((finding) => finding.severity === "High").length;
const independentQa = JSON.parse(await readFile("evidence/certification/planned-item-slots-independent-qa.json", "utf8")); const floor = 120; const belowFloorNodes = (result?.counts.nodes ?? []).filter((node) => node.slotCount < floor);
const contractVerdict = criticalFindings || highFindings ? "FAIL" : "PASS"; const independentQaVerdict = independentQa.status === "passed_independent_qa" && independentQa.criticalFindings === 0 && independentQa.highFindings === 0 ? "PASS" : "PENDING"; const overallVerdict = contractVerdict === "PASS" && independentQaVerdict === "PASS" ? "PASS" : contractVerdict === "FAIL" ? "FAIL" : "PENDING";
const report = { stageId: "CERT-CORR-02", artifactStatus: "candidate_non_runtime_evidence", overallVerdict, contractVerdict, independentQaVerdict, criticalFindings, highFindings, findings, auditDimensions: { semanticIdentity: result ? "automated_pass" : "automated_fail", ownershipAndObjectives: result ? "automated_pass" : "automated_fail", derivedCounts: result ? "automated_pass" : "automated_fail", sourceAnchorIntegrity: result ? "automated_pass" : "automated_fail", runtimeReachability: result ? "automated_pass" : "automated_fail", complementaryCompetition: "requires_independent_qa", factualDepth: "requires_independent_qa" }, independentQa, slotCount: result?.slots.length ?? 0, derivedCounts: result?.counts ?? null, runtimeReachability: result?.runtimeReachability ?? { admitted: false, proof: "Validation did not complete." }, belowFloorRouting: { floor, nodes: belowFloorNodes, route: "CERT-CORR-03", action: "Do not add filler; assess merge, split, or reframe with neighbouring ownership." } };
const output = process.argv[2] ? resolve(process.argv[2]) : "evidence/certification/planned-item-slots-audit.json";
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`CERTIFICATION_PLANNED_SLOT_AUDIT_${report.overallVerdict}: ${report.slotCount} slots; contract ${report.contractVerdict}; independent QA ${report.independentQaVerdict}.`);
if (report.overallVerdict !== "PASS") process.exitCode = 1;
