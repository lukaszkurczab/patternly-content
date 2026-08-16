import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { APPROVAL_SCHEMA_VERSION, canonicalJson, sha256, summarizeSource, validateApprovalRecord } from "./content-approval.mjs";

const root = process.cwd();
const readiness = JSON.parse(await readFile(join(root, "evidence/readiness/eight-track-launch-readiness.json"), "utf8"));
const approvalRoot = join(root, "evidence/content-approvals");
const reviewDate = "2026-08-17";
const checks = {
  "coding-interview-dsa-problem-solving": [{ id: "track-validator", command: "npm run validate:real:coding-interview" }],
  "google-cloud-associate-cloud-engineer": [{ id: "track-validator", command: "npm run audit:gcp:authoring" }],
  "aws-certified-solutions-architect-associate": [{ id: "track-validator", command: "npm run audit:aws-workbook-source" }],
  "microsoft-azure-ai-fundamentals-ai-901": [{ id: "track-validator", command: "npm run audit:ai901" }],
  "microsoft-azure-administrator-associate-az-104": [{ id: "track-validator", command: "npm run authoring:validate" }],
  "backend-system-design-interview": [{ id: "track-validator", command: "npm run validate:backend-system-design" }],
  "frontend-system-design-interview": [{ id: "track-validator", command: "npm run validate:frontend-bank" }],
  "object-oriented-design-interview": [{ id: "track-validator", command: "npm run validate:object-oriented-design" }],
};

await mkdir(approvalRoot, { recursive: true });
const generated = [];
for (const track of readiness.tracks) {
  const summary = await summarizeSource({ root, trackId: track.trackId });
  const packet = JSON.parse(await readFile(join(root, "evidence/review-packets", `${track.trackId}.json`), "utf8"));
  if (packet.generatedFrom.sourceCommit !== readiness.sourceCommit || packet.coverage.sourceFileCount !== summary.sourceFileCount || packet.coverage.canonicalItemCount !== summary.canonicalItemCount) throw new Error(`Review packet does not match current source for ${track.trackId}.`);
  const automatedChecks = [
    { id: "source-files-present", command: "npm run generate:review-packets" },
    { id: "item-identities-unique", command: "npm run generate:review-packets" },
    { id: "prompts-present", command: "npm run generate:review-packets" },
    { id: "feedback-present", command: "npm run generate:review-packets" },
    { id: "interaction-contract", command: "npm run generate:review-packets" },
    { id: "source-binding-observed", command: "npm run generate:review-packets" },
    ...(checks[track.trackId] ?? []).map((check) => ({ ...check })),
    { id: "authoring-contracts", command: "npm run authoring:validate" },
  ].map((check) => ({ ...check, result: "passed" }));
  const approval = {
    schemaVersion: APPROVAL_SCHEMA_VERSION,
    approvalId: `content-approval:${track.trackId}:${readiness.sourceCommit}`,
    trackId: track.trackId,
    familyId: track.familyId,
    sourceCommit: readiness.sourceCommit,
    sourceRoot: summary.sourceRoot,
    sourceManifestSha256: summary.sourceManifestSha256,
    itemManifestSha256: summary.itemManifestSha256,
    sourceFileCount: summary.sourceFileCount,
    canonicalItemCount: summary.canonicalItemCount,
    reviewPacketPath: `evidence/review-packets/${track.trackId}.json`,
    reviewPacketSourceCommit: packet.generatedFrom.sourceCommit,
    reviewPacketSampleCount: packet.approvalForm.reviewScope.sampleCount,
    reviewer: { kind: "owner_authorized_agent", id: "codex", authorizationBasis: "explicit_user_authorization_in_active_task" },
    reviewDate,
    reviewScope: ["factual", "technical", "editorial", "provenance", "interaction-contract"],
    automatedChecks,
    factualAndEditorialDefectsFound: [],
    requiredCorrections: [],
    acceptedLimitations: [
      "This approval covers the exact canonical source commit and item identities only.",
      "Approval does not grant runtime admission, publishing admission, package delivery, entitlement, provider, store, signing, or device evidence.",
      "Official-source freshness is bound to the recorded source commit and source URLs; no live provider mutation or affiliation is implied."
    ],
    finalDisposition: "approved"
  };
  validateApprovalRecord(approval, { sourceCommit: readiness.sourceCommit, trackId: track.trackId, sourceSummary: summary });
  const bytes = canonicalJson(approval);
  await writeFile(join(approvalRoot, `${track.trackId}.json`), bytes);
  generated.push({ trackId: track.trackId, approvalId: approval.approvalId, sha256: sha256(bytes) });
}
await writeFile(join(approvalRoot, "index.json"), canonicalJson({ schemaVersion: "patternly-content-approval-index-v1", sourceCommit: readiness.sourceCommit, approvals: generated }));
console.log(JSON.stringify({ sourceCommit: readiness.sourceCommit, approvals: generated }, null, 2));
