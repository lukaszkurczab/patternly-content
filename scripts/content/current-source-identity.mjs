import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { buildAll, canonicalJson, testTrack } from "../build.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const execFileAsync = promisify(execFile);
const TRACK_IDS = Object.freeze([
  "aws-certified-solutions-architect-associate",
  "backend-system-design-interview",
  "claude-certified-architect-professional-certification",
  "coding-interview-dsa-problem-solving",
  "frontend-system-design-interview",
  "google-cloud-associate-cloud-engineer",
  "microsoft-azure-administrator-associate-az-104",
  "microsoft-azure-ai-fundamentals-ai-901",
  "object-oriented-design-interview",
]);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function fail(message) { throw new Error(`current_source_invalid: ${message}`); }

function sortedTracks(built) {
  const tracks = [...built.artifacts].sort((left, right) => left.trackId.localeCompare(right.trackId));
  if (tracks.length !== TRACK_IDS.length || tracks.some((track, index) => track.trackId !== TRACK_IDS[index])) {
    fail("the canonical build did not produce the exact nine-track set");
  }
  return tracks;
}

/** Cheap freshness check over an already staged buildAll result; runs no QA. */
export function computeCurrentSourceFingerprint({ built } = {}) {
  if (!built?.catalog || !Array.isArray(built.artifacts) || !Array.isArray(built.lock?.tracks)) {
    fail("a complete staged buildAll result is required to compute a source fingerprint");
  }
  const tracks = sortedTracks(built).map((track) => {
    const bytes = Buffer.from(track.artifactBytes, "utf8");
    const digest = sha256(bytes);
    const lockEntry = built.lock.tracks.find((entry) => entry.trackId === track.trackId);
    if (lockEntry?.sha256 !== digest || lockEntry?.questionCount !== track.questions.length) {
      fail(`canonical artifact/lock mismatch for ${track.trackId}`);
    }
    return {
      trackId: track.trackId,
      contentVersion: track.track.contentVersion,
      artifactSha256: digest,
      artifactBytes: bytes.length,
      questionCount: track.questions.length,
    };
  });
  return sha256(canonicalJson({ schemaVersion: "patternly-current-source-fingerprint-v1", catalog: built.catalog, tracks }));
}

/** Rebuild canonical artifacts for an external freshness comparison without rerunning scoring QA. */
export async function buildCurrentSourceSnapshot({ contentRoot = ROOT, outputRoot } = {}) {
  if (!outputRoot) fail("an isolated outputRoot is required for a current-source snapshot");
  const built = await buildAll({ rootDirectory: path.resolve(contentRoot), outputRoot: path.resolve(outputRoot) });
  return { built, sourceInputFingerprint: computeCurrentSourceFingerprint({ built }) };
}

/** Fail closed if canonical inputs drifted after a staged build or review. */
export async function assertCurrentSourceFingerprint({ contentRoot = ROOT, expectedFingerprint } = {}) {
  if (typeof expectedFingerprint !== "string" || !/^[a-f0-9]{64}$/u.test(expectedFingerprint)) fail("a valid expected current-source fingerprint is required");
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-current-source-freshness-"));
  try {
    const snapshot = await buildCurrentSourceSnapshot({ contentRoot, outputRoot });
    if (snapshot.sourceInputFingerprint !== expectedFingerprint) fail("canonical source changed after it was staged or verified");
    return snapshot.sourceInputFingerprint;
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
}

/**
 * Derive current identity only after canonical source validation and answer scoring
 * have actually completed. This records technical checks, not semantic approval,
 * publication, deployment, or device acceptance.
 */
export async function deriveCurrentSourceIdentity({ contentRoot = ROOT, built, sourceRepositoryCommit } = {}) {
  const root = path.resolve(contentRoot);
  const ownedOutputRoot = built ? undefined : await mkdtemp(path.join(os.tmpdir(), "patternly-current-identity-output-"));
  try {
    const result = built ?? await buildAll({ rootDirectory: root, outputRoot: ownedOutputRoot });
    let scoredQuestionCount = 0;
    for (const trackId of TRACK_IDS) {
      const tested = await testTrack({ rootDirectory: root, trackId, outputRoot: result.outputRoot });
      const stagedTrack = result.artifacts.find((track) => track.trackId === trackId);
      const inputs = ({ catalog, bindings, binding, track, sourceFiles, questions, artifactQuestions, planningPolicy, simulationProfiles }) => Object.fromEntries(
        Object.entries({ catalog, bindings, binding, track, sourceFiles, questions, artifactQuestions, planningPolicy, simulationProfiles })
          .filter(([, value]) => value !== undefined),
      );
      if (!stagedTrack || canonicalJson(inputs(tested)) !== canonicalJson(inputs(stagedTrack))) {
        fail(`answer scoring did not validate the exact staged inputs for ${trackId}`);
      }
      scoredQuestionCount += tested.questions.length;
    }
    const tracks = sortedTracks(result).map((track) => ({
      trackId: track.trackId,
      contentVersion: track.track.contentVersion,
      artifactSha256: sha256(Buffer.from(track.artifactBytes, "utf8")),
      artifactBytes: Buffer.byteLength(track.artifactBytes, "utf8"),
      questionCount: track.questions.length,
    }));
    const sourceInputFingerprint = computeCurrentSourceFingerprint({ built: result });
    const { stdout: gitStatus } = await execFileAsync("git", ["status", "--porcelain"], { cwd: root });
    const runtimeProfileCount = tracks.reduce((total, { trackId }) => {
      const artifact = result.artifacts.find((entry) => entry.trackId === trackId)?.artifact;
      return total + (artifact?.simulationProfiles?.length ?? 0);
    }, 0);
    return {
      schemaVersion: "patternly-current-content-identity-v1",
      ownerPolicy: "standing-owner-decision-2026-10-19-current-source",
      sourceInputFingerprint,
      ...(sourceRepositoryCommit ? { sourceRepositoryCommit } : {}),
      sourceTree: gitStatus.trim() ? "dirty" : "clean",
      tracks,
      verificationCategories: [
        {
          id: "canonical-source-contract",
          status: "passed",
          verifier: "scripts/build.mjs:buildAll/validateTrack",
          trackCount: tracks.length,
          questionCount: tracks.reduce((total, track) => total + track.questionCount, 0),
        },
        {
          id: "canonical-answer-scoring",
          status: "passed",
          verifier: "scripts/build.mjs:testTrack/scoreQuestion",
          trackCount: tracks.length,
          scoredQuestionCount,
        },
        {
          id: "planning-completion-and-runtime-bindings",
          status: "passed",
          verifier: "scripts/build.mjs:validatePlanningPolicy/validatePackageCompletionRule/loadTrackProfileData",
          trackCount: tracks.length,
          runtimeProfileCount,
        },
        {
          id: "canonical-artifact-integrity",
          status: "passed",
          verifier: "scripts/build.mjs:content-lock-v1",
          trackCount: tracks.length,
          exactByteDigests: tracks.length,
        },
      ],
      claims: {
        semanticReview: "not_claimed",
        publication: "not_performed",
        deployment: "not_performed",
        deviceAcceptance: "not_claimed",
      },
    };
  } finally {
    if (ownedOutputRoot) await rm(ownedOutputRoot, { recursive: true, force: true });
  }
}

/** Rebuild current canonical source in temporary output and return its identity. */
export async function computeCurrentSourceIdentity({ contentRoot = ROOT, sourceRepositoryCommit } = {}) {
  const root = path.resolve(contentRoot);
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-current-identity-"));
  try {
    const built = await buildAll({ rootDirectory: root, outputRoot });
    return await deriveCurrentSourceIdentity({ contentRoot: root, built, sourceRepositoryCommit });
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
}

export const CURRENT_SOURCE_TRACK_IDS = TRACK_IDS;
