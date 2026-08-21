import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

export const AGENT_REVIEW_RECORD_SCHEMA_VERSION = "patternly-content-approval-v1";
export const HUMAN_APPROVAL_MANIFEST_SCHEMA_VERSION = "patternly-human-content-approval-manifest-v1";
export const HUMAN_APPROVAL_MANIFEST_PATH = "evidence/human-content-approvals/manifest.json";
export const canonicalJson = (value) => {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
};
export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export async function walkJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => entry.isDirectory() ? walkJsonFiles(join(directory, entry.name)) : entry.name.endsWith(".json") ? [join(directory, entry.name)] : []));
  return nested.flat().sort();
}

function itemId(item) {
  const value = item?.id ?? item?.itemId;
  if (typeof value !== "string" || !value.trim()) throw new Error("Every approved item must have an id or itemId.");
  return value;
}

export async function summarizeSource({ root, trackId }) {
  const sourceRoot = join(root, "manual", "source", trackId);
  const files = await walkJsonFiles(sourceRoot);
  const fileRecords = [];
  const items = [];
  for (const file of files) {
    const bytes = await readFile(file);
    const batch = JSON.parse(bytes);
    fileRecords.push({ path: relative(root, file), sha256: sha256(bytes) });
    for (const item of batch.items ?? []) items.push({ id: itemId(item), fingerprint: item.itemFingerprint ?? sha256(canonicalJson(item)) });
  }
  const sortedItems = items.sort((left, right) => left.id.localeCompare(right.id));
  if (new Set(sortedItems.map((item) => item.id)).size !== sortedItems.length) throw new Error(`Duplicate item identity in ${trackId}.`);
  return {
    sourceRoot: relative(root, sourceRoot),
    sourceFileCount: files.length,
    canonicalItemCount: sortedItems.length,
    sourceManifestSha256: sha256(canonicalJson(fileRecords)),
    itemManifestSha256: sha256(canonicalJson(sortedItems)),
  };
}

export function validateAgentReviewRecord(record, { sourceCommit, trackId, sourceSummary } = {}) {
  if (record?.schemaVersion !== AGENT_REVIEW_RECORD_SCHEMA_VERSION || record.finalDisposition !== "approved") throw new Error("Record is not an approved Patternly agent review record.");
  if (trackId && record.trackId !== trackId) throw new Error(`Approval record track mismatch: ${record.trackId}.`);
  if (sourceCommit && record.sourceCommit !== sourceCommit) throw new Error(`Approval record source commit mismatch for ${record.trackId}.`);
  if (record.reviewPacketSourceCommit !== record.sourceCommit) throw new Error(`Approval packet source commit mismatch for ${record.trackId}.`);
  if (record.reviewer?.kind !== "owner_authorized_agent" || record.reviewer.authorizationBasis !== "explicit_user_authorization_in_active_task") throw new Error(`Agent review authority is not explicit for ${record.trackId}.`);
  for (const check of record.automatedChecks ?? []) if (check.result !== "passed") throw new Error(`Approval check did not pass for ${record.trackId}: ${check.id}.`);
  if (sourceSummary) {
    for (const [key, expected] of Object.entries(sourceSummary)) if (record[key] !== expected) throw new Error(`Approval ${key} differs from current source for ${record.trackId}.`);
  }
  return record;
}

export function validateHumanApprovalManifest(manifest, { sourceCommit, trackIds } = {}) {
  if (manifest?.schemaVersion !== HUMAN_APPROVAL_MANIFEST_SCHEMA_VERSION || manifest.finalDisposition !== "approved") throw new Error("Human content approval manifest is not an approved Patternly owner decision.");
  if (manifest.approver?.kind !== "human_owner" || !manifest.approver.id || manifest.approver.confirmationSource !== "owner_confirmation_in_active_conversation") throw new Error("Human content approval requires an explicit owner confirmation.");
  if (sourceCommit && manifest.sourceCommit !== sourceCommit) throw new Error(`Human approval source commit mismatch: ${manifest.sourceCommit}.`);
  const entries = Array.isArray(manifest.tracks) ? manifest.tracks : [];
  const entryIds = entries.map((entry) => entry?.trackId).sort();
  if (new Set(entryIds).size !== entryIds.length) throw new Error("Human approval manifest contains duplicate track identities.");
  if (trackIds && JSON.stringify(entryIds) !== JSON.stringify([...trackIds].sort())) throw new Error("Human approval manifest does not cover the exact required track scope.");
  for (const entry of entries) {
    if (entry.sourceCommit !== manifest.sourceCommit || entry.reviewPacketSourceCommit !== entry.sourceCommit) throw new Error(`Human approval provenance mismatch for ${entry.trackId}.`);
    for (const key of ["sourceManifestSha256", "itemManifestSha256"]) if (!/^[a-f0-9]{64}$/.test(entry[key] ?? "")) throw new Error(`Human approval ${key} is invalid for ${entry.trackId}.`);
  }
  return manifest;
}

export function validateHumanApprovalEntry(entry, { sourceCommit, trackId, sourceSummary } = {}) {
  if (!entry || (trackId && entry.trackId !== trackId)) throw new Error(`Human approval track mismatch: ${entry?.trackId ?? "missing"}.`);
  if (sourceCommit && entry.sourceCommit !== sourceCommit) throw new Error(`Human approval source commit mismatch for ${entry.trackId}.`);
  if (sourceSummary) {
    for (const [key, expected] of Object.entries(sourceSummary)) if (entry[key] !== expected) throw new Error(`Human approval ${key} differs from current source for ${entry.trackId}.`);
  }
  return entry;
}
