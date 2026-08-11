import { readFile } from "node:fs/promises";
import { loadCurricula } from "../curriculum/curricula.mjs";
import { loadCertificationObjectiveRegistries } from "../curriculum/certification-objective-registries.mjs";
import { validateCertificationPromotion } from "../curriculum/certification-promotion.mjs";

const root = process.cwd();
const independentQa = JSON.parse(await readFile("evidence/certification/stage04-independent-qa.json", "utf8"));
const curricula = await loadCurricula({ root });
const registries = await loadCertificationObjectiveRegistries({ root });
const promotion = validateCertificationPromotion(curricula, registries);
const independentQaVerdict = independentQa.status === "passed_independent_qa" && independentQa.criticalFindings === 0 && independentQa.highFindings === 0 ? "PASS" : "PENDING";
const report = { stageId: "CERT-CORR-04", contractVerdict: "PASS", independentQaVerdict, overallVerdict: independentQaVerdict === "PASS" ? "PASS" : "PENDING", directCanonicalTracks: promotion.trackCount, directCanonicalSlots: promotion.slotCount, batchCount: promotion.authoringBatches.length, independentQa };
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (report.overallVerdict !== "PASS") process.exitCode = 1;
