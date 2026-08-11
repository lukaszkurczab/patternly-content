import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { loadAndValidateStage03TerraformCandidatePlan } from "../curriculum/certification-stage03-terraform.mjs";

const findings = [{ severity: "High", status: "resolved_by_candidate", dimension: "aggregate_node_shape", code: "NINE_NODE_AGGREGATE_MODEL", message: "The current nine-node aggregate model has no explicit slot coverage and several nodes are below the floor; the candidate uses whole-block two-node ownership." }];
let result;
try { result = await loadAndValidateStage03TerraformCandidatePlan({ root: process.cwd() }); } catch (error) { findings.push({ severity: "Critical", status: "unresolved", dimension: "candidate_contract", code: error.code ?? "STAGE03_TERRAFORM_INVALID", message: error.message }); }
const independentQa = JSON.parse(await readFile("evidence/certification/stage03-terraform-independent-qa.json", "utf8"));
const unresolved = findings.filter((finding) => finding.status === "unresolved");
const contractVerdict = unresolved.length ? "FAIL" : "PASS";
const independentQaVerdict = independentQa.status === "passed_independent_qa" && independentQa.criticalFindings === 0 && independentQa.highFindings === 0 ? "PASS" : "PENDING";
const overallVerdict = contractVerdict === "FAIL" ? "FAIL" : independentQaVerdict === "PASS" ? "PASS" : "PENDING";
const report = { stageId: "CERT-CORR-03-TERRAFORM", artifactStatus: "candidate_non_runtime_evidence", overallVerdict, contractVerdict, independentQaVerdict, criticalFindings: unresolved.filter((finding) => finding.severity === "Critical").length, highFindings: unresolved.filter((finding) => finding.severity === "High").length, findings, automatedContract: result ? { status: "passed", ...result } : { status: "failed" }, independentQa, auditDimensions: { automatedContract: result ? "automated_pass" : "automated_fail", independentSemanticQa: "requires_independent_qa", runtimeReachability: result?.runtimeReachability?.admitted === false ? "automated_pass" : "automated_fail" } };
const output = process.argv.find((argument) => argument !== "--validate" && argument !== process.argv[0] && argument !== process.argv[1]);
await writeFile(output ? resolve(output) : "evidence/certification/stage03-terraform-audit.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(`CERTIFICATION_STAGE03_TERRAFORM_AUDIT_${overallVerdict}: ${result?.slotCount ?? 0} slots; contract ${contractVerdict}; independent QA ${independentQaVerdict}.`);
if (process.argv.includes("--validate") && contractVerdict !== "PASS") process.exitCode = 1;
if (!process.argv.includes("--validate") && overallVerdict !== "PASS") process.exitCode = 1;
