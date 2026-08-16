import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

export const APPROVAL_SCHEMA_VERSION = "patternly-content-approval-v1";
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

export function validateApprovalRecord(record, { sourceCommit, trackId, sourceSummary } = {}) {
  if (record?.schemaVersion !== APPROVAL_SCHEMA_VERSION || record.finalDisposition !== "approved") throw new Error("Approval record is not an approved Patternly content record.");
  if (trackId && record.trackId !== trackId) throw new Error(`Approval record track mismatch: ${record.trackId}.`);
  if (sourceCommit && record.sourceCommit !== sourceCommit) throw new Error(`Approval record source commit mismatch for ${record.trackId}.`);
  if (record.reviewPacketSourceCommit !== record.sourceCommit) throw new Error(`Approval packet source commit mismatch for ${record.trackId}.`);
  if (record.reviewer?.kind !== "owner_authorized_agent" || record.reviewer.authorizationBasis !== "explicit_user_authorization_in_active_task") throw new Error(`Approval reviewer authority is not explicit for ${record.trackId}.`);
  for (const check of record.automatedChecks ?? []) if (check.result !== "passed") throw new Error(`Approval check did not pass for ${record.trackId}: ${check.id}.`);
  if (sourceSummary) {
    for (const [key, expected] of Object.entries(sourceSummary)) if (record[key] !== expected) throw new Error(`Approval ${key} differs from current source for ${record.trackId}.`);
  }
  return record;
}
