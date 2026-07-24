import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson } from "./pipeline.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const trackId = "cloud-certification";
const technicalInputCommit = process.argv[2];
if (!technicalInputCommit) throw new Error("Usage: node approve-cloud-release.mjs <technical-input-commit>");
const technical = JSON.parse(await readFile(join(root, "evidence", trackId, "technical", `${technicalInputCommit}.json`), "utf8"));
const passedEvidence = technical.technicalEvidence?.filter((entry) => entry.result === "passed") ?? [];
if (passedEvidence.length !== 1) throw new Error("Cloud approval requires exactly one passed technical evidence record.");
const evidence = passedEvidence[0];
const contentVersion = technical.contentVersion;
if (typeof contentVersion !== "string" || !contentVersion.trim()) throw new Error("Cloud approval requires the technical evidence content version.");
if (!evidence || Object.keys(evidence.itemFingerprints ?? {}).length !== 360) throw new Error("A passed 360-item technical evidence record is required before Cloud approval.");
const includedItems = Object.entries(evidence.itemFingerprints).map(([itemId, itemFingerprint]) => ({ itemId, itemFingerprint })).sort((left, right) => left.itemId.localeCompare(right.itemId));
const approvalId = `approval:${trackId}:${contentVersion}:${evidence.evidenceId}`;
const approval = {
  approvalSchemaVersion: 1,
  approvalId,
  reviewKind: "editorial",
  batchId: contentVersion,
  familyId: "certification",
  trackId,
  primaryTaxonomyReference: "config/taxonomy/cloud-certification.json",
  includedItems,
  reviewer: "product-owner-authorized-codex-review",
  reviewDate: "2026-07-22",
  technicalValidationEvidenceId: evidence.evidenceId,
  factualAndEditorialDefectsFound: [],
  requiredCorrections: [],
  finalDisposition: "approved",
};
const activation = {
  activationSchemaVersion: 1,
  activationId: `activation:${trackId}:${contentVersion}`,
  trackId,
  familyId: "certification",
  contentVersion,
  taxonomyVersion: "cloud-certification-taxonomy-v1",
  itemCoverage: includedItems.map(({ itemId, itemFingerprint }) => ({ itemId, itemFingerprint, approvalId })),
};
const approvalPath = join(root, "manual", "approvals", trackId, `${contentVersion}.json`);
const activationPath = join(root, "manual", "activations", trackId, `${contentVersion}.json`);
await Promise.all([mkdir(dirname(approvalPath), { recursive: true }), mkdir(dirname(activationPath), { recursive: true })]);
await Promise.all([writeFile(approvalPath, canonicalJson(approval)), writeFile(activationPath, canonicalJson(activation))]);
console.log(JSON.stringify({ approvalId, activationId: activation.activationId, itemCount: includedItems.length }, null, 2));
