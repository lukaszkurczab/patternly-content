import { createHash } from "node:crypto";
import { validateSchema } from "./schema-validation.mjs";

export const AGENT_REVIEW_RECORD_SCHEMA_VERSION = "patternly-content-approval-v2";
export const HUMAN_APPROVAL_MANIFEST_SCHEMA_VERSION = "patternly-human-content-approval-manifest-v2";
export const HUMAN_APPROVAL_MANIFEST_PATH = "evidence/human-content-approvals/manifest.json";
export const HUMAN_APPROVAL_MANIFEST_SCHEMA_PATH = "schemas/review/human-content-approval-manifest.schema.json";
export const canonicalJson = (value) => {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
};
export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export function validateAgentReviewRecord(record, { sourceCommit, candidateId, candidate, trackId, sourceSummary } = {}) {
  if (record?.schemaVersion !== AGENT_REVIEW_RECORD_SCHEMA_VERSION || record.finalDisposition !== "approved") throw new Error("Record is not an approved Patternly agent review record.");
  if (Object.hasOwn(record ?? {}, "sourceCommit") || Object.hasOwn(record ?? {}, "releaseId")) throw new Error("Agent approval rejects legacy global sourceCommit/releaseId fields.");
  if (trackId && record.trackId !== trackId) throw new Error(`Approval record track mismatch: ${record.trackId}.`);
  if (sourceCommit) throw new Error("Agent approval sourceCommit validation is retired; validate the candidate source identity instead.");
  if (record.candidateManifestPath !== "evidence/content-acceptance/candidate-manifest-v1.json" || !/^[a-f0-9]{64}$/.test(record.candidateId ?? "") || (candidateId && record.candidateId !== candidateId)) throw new Error(`Approval candidate binding is invalid for ${record.trackId}.`);
  if (!record.source || record.reviewPacket?.candidateId !== record.candidateId || record.reviewPacket?.sourceCommit !== record.source.sourceCommit) throw new Error(`Approval packet source identity mismatch for ${record.trackId}.`);
  const candidateEntry = candidate?.tracks?.find((entry) => entry.trackId === record.trackId);
  if (candidateEntry) compareSourceIdentity(record.source, candidateEntry.source, record.trackId);
  if (record.reviewer?.kind !== "owner_authorized_agent" || record.reviewer.authorizationBasis !== "explicit_user_authorization_in_active_task") throw new Error(`Agent review authority is not explicit for ${record.trackId}.`);
  for (const check of record.automatedChecks ?? []) if (check.result !== "passed") throw new Error(`Approval check did not pass for ${record.trackId}: ${check.id}.`);
  if (sourceSummary) {
    compareSourceIdentity(record.source, sourceSummary, record.trackId);
  }
  return record;
}

function sourceIdentity(entry) {
  return entry?.source ?? null;
}

function compareSourceIdentity(source, expected, label) {
  for (const key of ["sourceCommit", "sourceRoot", "sourceFileCount", "canonicalItemCount", "sourceManifestSha256", "itemManifestSha256"]) {
    if (expected?.[key] !== undefined && source?.[key] !== expected[key]) throw new Error(`Human approval ${label} ${key} differs.`);
  }
  if (expected?.contentVersion !== undefined && source?.contentVersion !== expected.contentVersion) throw new Error(`Human approval ${label} contentVersion differs.`);
}

export function validateHumanApprovalManifest(manifest, { sourceCommit, candidateId, candidate, trackIds } = {}) {
  if (Object.hasOwn(manifest ?? {}, "sourceCommit") || Object.hasOwn(manifest ?? {}, "releaseId")) throw new Error("Human content approval rejects legacy global sourceCommit/releaseId fields.");
  if (manifest?.schemaVersion !== HUMAN_APPROVAL_MANIFEST_SCHEMA_VERSION || manifest.finalDisposition !== "approved") throw new Error("Human content approval manifest is not an approved Patternly owner decision.");
  if (manifest.approver?.kind !== "human_owner" || !manifest.approver.id || manifest.approver.confirmationSource !== "owner_confirmation_in_active_conversation") throw new Error("Human content approval requires an explicit owner confirmation.");
  if (manifest.candidateManifestPath !== "evidence/content-acceptance/candidate-manifest-v1.json") throw new Error("Human content approval must name the canonical candidate manifest.");
  if (!/^[a-f0-9]{64}$/.test(manifest.candidateId ?? "")) throw new Error("Human content approval candidateId is invalid.");
  if (candidateId && manifest.candidateId !== candidateId) throw new Error(`Human approval candidateId mismatch: ${manifest.candidateId}.`);
  if (sourceCommit) throw new Error("Human approval sourceCommit validation is retired; validate the candidate source identity instead.");
  const entries = Array.isArray(manifest.tracks) ? manifest.tracks : [];
  const entryIds = entries.map((entry) => entry?.trackId).sort();
  if (new Set(entryIds).size !== entryIds.length) throw new Error("Human approval manifest contains duplicate track identities.");
  if (trackIds && JSON.stringify(entryIds) !== JSON.stringify([...trackIds].sort())) throw new Error("Human approval manifest does not cover the exact required track scope.");
  const candidateByTrack = new Map((candidate?.tracks ?? []).map((entry) => [entry.trackId, entry]));
  for (const entry of entries) {
    if (entry.candidateId !== manifest.candidateId) throw new Error(`Human approval candidate binding mismatch for ${entry.trackId}.`);
    if (!entry.source || typeof entry.source !== "object" || Array.isArray(entry.source)) throw new Error(`Human approval source identity is missing for ${entry.trackId}.`);
    if (!entry.reviewPacket || typeof entry.reviewPacket !== "object" || Array.isArray(entry.reviewPacket)) throw new Error(`Human approval review packet identity is missing for ${entry.trackId}.`);
    if (entry.reviewPacket.candidateId !== manifest.candidateId) throw new Error(`Human approval review packet candidate mismatch for ${entry.trackId}.`);
    if (![["performed", true], ["not_performed", false]].some(([status, positive]) => entry.reviewPacket.status === status && (entry.reviewPacket.sampleCount > 0) === positive)) throw new Error(`Human approval review packet status is inconsistent for ${entry.trackId}.`);
    if (candidateByTrack.has(entry.trackId)) {
      const candidateEntry = candidateByTrack.get(entry.trackId);
      if (candidateEntry.familyId !== entry.familyId) throw new Error(`Human approval family mismatch for ${entry.trackId}.`);
      compareSourceIdentity(entry.source, candidateEntry.source, entry.trackId);
    }
    for (const key of ["sourceManifestSha256", "itemManifestSha256"]) if (!/^[a-f0-9]{64}$/.test(entry.source[key] ?? "")) throw new Error(`Human approval ${key} is invalid for ${entry.trackId}.`);
  }
  return manifest;
}

export async function loadHumanApprovalManifest({ root, candidate, trackIds }) {
  const manifest = JSON.parse(await readFile(join(root, HUMAN_APPROVAL_MANIFEST_PATH), "utf8"));
  const schema = JSON.parse(await readFile(join(root, HUMAN_APPROVAL_MANIFEST_SCHEMA_PATH), "utf8"));
  await validateSchema(manifest, schema, HUMAN_APPROVAL_MANIFEST_PATH);
  return validateHumanApprovalManifest(manifest, { candidate, trackIds });
}

export function validateHumanApprovalEntry(entry, { sourceCommit, candidateId, candidate, trackId, sourceSummary } = {}) {
  if (!entry || (trackId && entry.trackId !== trackId)) throw new Error(`Human approval track mismatch: ${entry?.trackId ?? "missing"}.`);
  if (sourceCommit) throw new Error("Human approval sourceCommit validation is retired; validate the candidate source identity instead.");
  if (!entry.candidateId || (candidateId && entry.candidateId !== candidateId)) throw new Error(`Human approval candidateId mismatch for ${entry.trackId}.`);
  if (!entry.source || !entry.reviewPacket || entry.reviewPacket.candidateId !== entry.candidateId) throw new Error(`Human approval candidate bindings are incomplete for ${entry.trackId}.`);
  const candidateEntry = candidate?.tracks?.find((candidateTrack) => candidateTrack.trackId === entry.trackId);
  if (candidateEntry) {
    if (candidateEntry.familyId !== entry.familyId) throw new Error(`Human approval family mismatch for ${entry.trackId}.`);
    compareSourceIdentity(entry.source, candidateEntry.source, entry.trackId);
  }
  if (sourceSummary) {
    compareSourceIdentity(entry.source, sourceSummary, entry.trackId);
  }
  return entry;
}
