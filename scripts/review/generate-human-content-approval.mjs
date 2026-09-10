import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validateSchema } from "../authoring/lib/model.mjs";
import {
  CANDIDATE_MANIFEST_PATH,
  CANDIDATE_TRACK_IDS,
  canonicalJson,
  loadCandidateManifest,
  validateCandidateManifest,
} from "./candidate-manifest.mjs";
import { HUMAN_APPROVAL_MANIFEST_PATH, loadHumanApprovalManifest, validateHumanApprovalManifest } from "./content-approval.mjs";

const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const schemaPath = join(root, "schemas/review/human-content-approval-manifest.schema.json");

async function readPreviousManifest(candidate, baseRoot) {
  try { return await loadHumanApprovalManifest({ root: baseRoot, candidate, trackIds: CANDIDATE_TRACK_IDS }); }
  catch (error) { if (error?.code === "ENOENT") return null; throw error; }
}

function sourceFor(entry) {
  return {
    sourceCommit: entry.source.sourceCommit,
    sourceRoot: entry.source.sourceRoot,
    ...(entry.source.contentVersion ? { contentVersion: entry.source.contentVersion } : {}),
    sourceFileCount: entry.source.sourceFileCount,
    canonicalItemCount: entry.source.canonicalItemCount,
    sourceManifestSha256: entry.source.sourceManifestSha256,
    itemManifestSha256: entry.source.itemManifestSha256,
  };
}

export async function buildHumanContentApprovalManifest({ root: baseRoot = root } = {}) {
  const candidate = await loadCandidateManifest(baseRoot);
  validateCandidateManifest(candidate);
  const previous = await readPreviousManifest(candidate, baseRoot);
  const previousByTrack = new Map((previous?.tracks ?? []).map((entry) => [entry.trackId, entry]));
  const tracks = candidate.tracks.map((entry) => {
    const prior = previousByTrack.get(entry.trackId);
    const reviewPerformed = entry.trackId !== "claude-certified-architect-professional-certification";
    const sampleCount = reviewPerformed ? prior?.reviewPacketSampleCount ?? prior?.reviewPacket?.sampleCount ?? 1 : 0;
    return {
      approvalId: `human-content-approval:${entry.trackId}:${candidate.candidateId}`,
      candidateId: candidate.candidateId,
      trackId: entry.trackId,
      familyId: entry.familyId,
      source: sourceFor(entry),
      reviewPacket: {
        path: `evidence/review-packets/${entry.trackId}.json`,
        candidateId: candidate.candidateId,
        status: reviewPerformed ? "performed" : "not_performed",
        sampleCount,
      },
    };
  });
  const manifest = {
    schemaVersion: "patternly-human-content-approval-manifest-v2",
    decisionId: `human-content-approval:2026-09-10:${candidate.candidateId}`,
    candidateManifestPath: CANDIDATE_MANIFEST_PATH,
    candidateId: candidate.candidateId,
    approver: {
      kind: "human_owner",
      id: "lukaszkurczab",
      confirmationSource: "owner_confirmation_in_active_conversation",
    },
    confirmationDate: "2026-09-10",
    reviewScope: ["factual", "technical", "editorial", "provenance", "interaction-contract"],
    tracks,
    acceptedLimitations: [
      "This owner decision covers only the exact candidate manifest, source identities, and item identities it names.",
      "It does not grant runtime admission, publishing admission, package delivery, entitlement, provider, store, signing, or device evidence.",
      "Official-source freshness is bound to the recorded source identities and source URLs; no live provider mutation or affiliation is implied.",
    ],
    finalDisposition: "approved",
  };
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  await validateSchema(manifest, schema, HUMAN_APPROVAL_MANIFEST_PATH);
  validateHumanApprovalManifest(manifest, { candidate, trackIds: CANDIDATE_TRACK_IDS });
  return manifest;
}

export async function writeHumanContentApprovalManifest({ root: baseRoot = root } = {}) {
  const manifest = await buildHumanContentApprovalManifest({ root: baseRoot });
  const path = join(baseRoot, HUMAN_APPROVAL_MANIFEST_PATH);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${canonicalJson(manifest)}\n`);
  return { manifest, path };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { manifest, path } = await writeHumanContentApprovalManifest();
    console.log(JSON.stringify({ result: "passed", path: path.replace(`${root}/`, ""), candidateId: manifest.candidateId, tracks: manifest.tracks.length }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
