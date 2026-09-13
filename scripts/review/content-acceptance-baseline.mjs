import { execFile as execFileCallback } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { join, resolve } from "node:path";

import { validateSchema } from "../authoring/lib/model.mjs";
import {
  HUMAN_APPROVAL_MANIFEST_PATH,
  canonicalJson,
  summarizeSource,
  validateHumanApprovalManifest
} from "./content-approval.mjs";

const execFile = promisify(execFileCallback);

export const ACC01_BASELINE_SCHEMA_VERSION = "patternly-content-acceptance-baseline-v1";
export const ACC01_BASELINE_PATH = "evidence/content-acceptance/acc-01-baseline-v1.json";
export const ACC01_BASELINE_SCHEMA_PATH = "schemas/review/content-acceptance-baseline.schema.json";
export const ACC01_CANONICAL_REPRESENTATION = Object.freeze({
  canonicalJsonVersion: "canonical-json-v1",
  trackOrder: "ascending-track-id",
  sourceManifest: "sha256(canonicalJson(sorted [{path,sha256}]))",
  itemManifest: "sha256(canonicalJson(sorted [{id,fingerprint}]))"
});

export const ACC01_TRACK_SOURCE_COMMITS = Object.freeze({
  "aws-certified-solutions-architect-associate": "1e35906ccea0f3abbed6814fd828bdc6467318be",
  "backend-system-design-interview": "1e35906ccea0f3abbed6814fd828bdc6467318be",
  "claude-certified-architect-professional-certification": "846b75fafa1fa0a35590622bebd7b1789c95adf7",
  "coding-interview-dsa-problem-solving": "1e35906ccea0f3abbed6814fd828bdc6467318be",
  "frontend-system-design-interview": "1e35906ccea0f3abbed6814fd828bdc6467318be",
  "google-cloud-associate-cloud-engineer": "1e35906ccea0f3abbed6814fd828bdc6467318be",
  "microsoft-azure-administrator-associate-az-104": "1e35906ccea0f3abbed6814fd828bdc6467318be",
  "microsoft-azure-ai-fundamentals-ai-901": "1e35906ccea0f3abbed6814fd828bdc6467318be",
  "object-oriented-design-interview": "1e35906ccea0f3abbed6814fd828bdc6467318be"
});

export const ACC01_TRACK_IDS = Object.freeze(Object.keys(ACC01_TRACK_SOURCE_COMMITS).sort());
export const ACC01_NON_CLAUDE_TRACK_IDS = Object.freeze(ACC01_TRACK_IDS.filter((trackId) => trackId !== "claude-certified-architect-professional-certification"));
export const ACC01_APPROVAL_BINDING_KEYS = Object.freeze([
  "sourceCommit",
  "sourceRoot",
  "sourceFileCount",
  "canonicalItemCount",
  "sourceManifestSha256",
  "itemManifestSha256"
]);
export const ACC01_SUMMARY_KEYS = Object.freeze([
  "sourceRoot",
  "sourceFileCount",
  "canonicalItemCount",
  "sourceManifestSha256",
  "itemManifestSha256"
]);

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const COMMIT_PATTERN = /^[a-f0-9]{40}$/;

export function normalizeBaselineTracks(tracks) {
  return [...(tracks ?? [])].sort((left, right) => left.trackId.localeCompare(right.trackId));
}

export function validateBaselineMetadata(baseline) {
  if (!baseline || typeof baseline !== "object" || Array.isArray(baseline)) throw new Error("ACC-01 baseline must be an object.");
  if (baseline.schemaVersion !== ACC01_BASELINE_SCHEMA_VERSION) throw new Error(`ACC-01 baseline schema version is ${baseline.schemaVersion ?? "missing"}.`);
  if (!baseline.baselineId) throw new Error("ACC-01 baseline ID is required.");
  const provenance = baseline.provenance;
  if (provenance?.kind !== "human_owner" || !provenance.id || provenance.confirmationDate !== "2026-09-10" || provenance.confirmationSource !== "owner_confirmation_in_active_conversation") {
    throw new Error("ACC-01 baseline must contain only the 2026-09-10 human-owner provenance.");
  }
  if (canonicalJson(baseline.canonicalRepresentation) !== canonicalJson(ACC01_CANONICAL_REPRESENTATION)) throw new Error("ACC-01 baseline canonical representation is not the pinned contract.");
  if (!Array.isArray(baseline.tracks) || baseline.tracks.length !== ACC01_TRACK_IDS.length) throw new Error(`ACC-01 baseline must contain exactly ${ACC01_TRACK_IDS.length} tracks.`);
  const tracks = normalizeBaselineTracks(baseline.tracks);
  const trackIds = tracks.map((track) => track.trackId);
  if (new Set(trackIds).size !== trackIds.length || canonicalJson(trackIds) !== canonicalJson(ACC01_TRACK_IDS)) throw new Error("ACC-01 baseline does not cover exactly the nine canonical tracks.");
  for (const track of tracks) {
    const expectedCommit = ACC01_TRACK_SOURCE_COMMITS[track.trackId];
    if (track.sourceCommit !== expectedCommit) throw new Error(`ACC-01 source commit mismatch for ${track.trackId}.`);
    if (track.sourceRoot !== `manual/source/${track.trackId}`) throw new Error(`ACC-01 source root mismatch for ${track.trackId}.`);
    if (!COMMIT_PATTERN.test(track.sourceCommit)) throw new Error(`ACC-01 source commit is invalid for ${track.trackId}.`);
    if (!Number.isInteger(track.sourceFileCount) || track.sourceFileCount < 1) throw new Error(`ACC-01 source file count is invalid for ${track.trackId}.`);
    if (!Number.isInteger(track.canonicalItemCount) || track.canonicalItemCount < 1) throw new Error(`ACC-01 item count is invalid for ${track.trackId}.`);
    if (!SHA256_PATTERN.test(track.sourceManifestSha256 ?? "") || !SHA256_PATTERN.test(track.itemManifestSha256 ?? "")) throw new Error(`ACC-01 manifest hash is invalid for ${track.trackId}.`);
    if (track.trackId === "claude-certified-architect-professional-certification" && track.contentVersion !== "ccarp-2026.09.03") throw new Error("ACC-01 Claude content version is not ccarp-2026.09.03.");
  }
  return baseline;
}

export function compareTrackSummary(expected, actual) {
  for (const key of ACC01_SUMMARY_KEYS) if (expected[key] !== actual[key]) throw new Error(`ACC-01 ${key} differs for ${expected.trackId}: expected ${expected[key]}, got ${actual[key]}.`);
  return true;
}

async function verifySourceRootPin(root, track) {
  try {
    await execFile("git", ["cat-file", "-e", `${track.sourceCommit}^{commit}`], { cwd: root });
  } catch (error) {
    throw new Error(`ACC-01 pinned source commit is unavailable for ${track.trackId}: ${error.message}`);
  }
  try {
    await execFile("git", ["diff", "--quiet", `${track.sourceCommit}..HEAD`, "--", track.sourceRoot], { cwd: root });
  } catch (error) {
    if (Number(error.code) === 1) throw new Error(`ACC-01 source root differs from pinned commit for ${track.trackId}.`);
    throw new Error(`ACC-01 could not compare pinned source root for ${track.trackId}: ${error.message}`);
  }
}

export async function loadAcc01Baseline(root = process.cwd()) {
  return JSON.parse(await readFile(join(root, ACC01_BASELINE_PATH), "utf8"));
}

async function validateCommittedBaselineSchema(root, baseline) {
  const schema = JSON.parse(await readFile(join(root, ACC01_BASELINE_SCHEMA_PATH), "utf8"));
  await validateSchema(baseline, schema, ACC01_BASELINE_PATH);
}

async function verifyHumanApprovalBindings(root, tracks) {
  const approvalManifest = JSON.parse(await readFile(join(root, HUMAN_APPROVAL_MANIFEST_PATH), "utf8"));
  try {
    const approvalSchema = JSON.parse(await readFile(join(root, "schemas/review/human-content-approval-manifest.schema.json"), "utf8"));
    await validateSchema(approvalManifest, approvalSchema, HUMAN_APPROVAL_MANIFEST_PATH);
    validateHumanApprovalManifest(approvalManifest, {
      trackIds: ACC01_TRACK_IDS
    });
  } catch (error) {
    throw new Error(`ACC-01 human approval manifest is not a valid candidate-bound owner decision: ${error.message}`);
  }
  const approvalByTrack = new Map(approvalManifest.tracks.map((entry) => [entry.trackId, entry]));
  const baselineByTrack = new Map(tracks.map((entry) => [entry.trackId, entry]));
  for (const trackId of ACC01_NON_CLAUDE_TRACK_IDS) {
    const baseline = baselineByTrack.get(trackId);
    const approval = approvalByTrack.get(trackId);
    if (!approval) throw new Error(`ACC-01 human approval manifest is missing ${trackId}.`);
    const source = approval.source;
    for (const key of ACC01_APPROVAL_BINDING_KEYS) {
      const approvalValue = key === "sourceCommit" ? source?.sourceCommit
        : key === "sourceRoot" ? source?.sourceRoot
          : key === "sourceFileCount" ? source?.sourceFileCount
            : key === "canonicalItemCount" ? source?.canonicalItemCount
              : source?.[key];
      if (baseline[key] !== approvalValue) throw new Error(`ACC-01 ${key} differs from human approval for ${trackId}.`);
    }
  }
}

export async function verifyAcc01Baseline({ root = process.cwd(), baseline, verifyCurrentSource = true } = {}) {
  const candidateBaseline = baseline ?? await loadAcc01Baseline(root);
  await validateCommittedBaselineSchema(root, candidateBaseline);
  const checkedBaseline = validateBaselineMetadata(candidateBaseline);
  const tracks = normalizeBaselineTracks(checkedBaseline.tracks);
  await verifyHumanApprovalBindings(root, tracks);
  if (!verifyCurrentSource) {
    return { schemaVersion: ACC01_BASELINE_SCHEMA_VERSION, trackIds: tracks.map(({ trackId }) => trackId), summaries: tracks };
  }
  const summaries = [];
  for (const track of tracks) {
    const actual = await summarizeSource({ root, trackId: track.trackId });
    compareTrackSummary(track, actual);
    await verifySourceRootPin(root, track);
    summaries.push({ trackId: track.trackId, ...actual });
  }
  return { schemaVersion: ACC01_BASELINE_SCHEMA_VERSION, trackIds: summaries.map(({ trackId }) => trackId), summaries };
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try {
    const result = await verifyAcc01Baseline();
    console.log(JSON.stringify({ result: "passed", ...result }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
