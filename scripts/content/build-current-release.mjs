import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { lstat, mkdir, mkdtemp, open, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { buildAll, canonicalJson } from "../build.mjs";
import { assertCurrentSourceFingerprint, deriveCurrentSourceIdentity } from "./current-source-identity.mjs";

const execFileAsync = promisify(execFile);
const DEFAULT_ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const DEFAULT_OUTPUT_ROOT = path.join(DEFAULT_ROOT, "dist/current");
const HASH = /^[a-f0-9]{64}$/u;
const RELEASE_ID = /^patternly-local-[a-f0-9]{20}$/u;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function fail(message) { throw new Error(`current_release_invalid: ${message}`); }

async function inspectCurrentOutput(outputRoot) {
  const pointerPath = path.join(outputRoot, "current.json");
  let pointerInfo;
  try { pointerInfo = await lstat(pointerPath); }
  catch (error) { if (error?.code === "ENOENT") return undefined; fail("current pointer cannot be inspected"); }
  if (!pointerInfo.isFile() || pointerInfo.isSymbolicLink()) fail("current pointer is not a regular file");
  let pointer;
  try { pointer = JSON.parse(await readFile(pointerPath, "utf8")); } catch { fail("current pointer is malformed"); }
  if (!pointer || Object.keys(pointer).sort().join(",") !== "releaseId,releasePath"
      || !RELEASE_ID.test(pointer.releaseId ?? "")
      || pointer.releasePath !== `releases/${pointer.releaseId}/release.json`) fail("current pointer is not owned by this generator");
  const releasesRoot = path.join(outputRoot, "releases");
  let releasesInfo;
  try { releasesInfo = await lstat(releasesRoot); } catch { fail("current release directory is missing"); }
  if (!releasesInfo.isDirectory() || releasesInfo.isSymbolicLink()) fail("current release directory is not a regular directory");
  const releaseDirectory = path.join(releasesRoot, pointer.releaseId);
  let directoryInfo;
  try { directoryInfo = await lstat(releaseDirectory); } catch { fail("pointed release directory is missing"); }
  if (!directoryInfo.isDirectory() || directoryInfo.isSymbolicLink()) fail("pointed release directory is not a regular directory");
  const entries = await readdir(releaseDirectory);
  if (entries.length !== 1 || entries[0] !== "release.json") fail("pointed release directory contains unmanaged files");
  const releasePath = path.join(releaseDirectory, "release.json");
  const releaseInfo = await lstat(releasePath);
  if (!releaseInfo.isFile() || releaseInfo.isSymbolicLink()) fail("pointed release is not a regular file");
  let release;
  try { release = JSON.parse(await readFile(releasePath, "utf8")); } catch { fail("pointed release is malformed"); }
  const manifest = release?.manifest;
  if (manifest?.releaseId !== pointer.releaseId || manifest.status !== "current_source"
      || !manifest.currentIdentity || !Array.isArray(release.artifacts) || release.artifacts.length !== 9) {
    fail("pointed release does not match the current-source output contract");
  }
  for (const artifact of release.artifacts) {
    if (typeof artifact.artifactBytes !== "string" || !HASH.test(artifact.checksumSha256 ?? "")
        || sha256(artifact.artifactBytes) !== artifact.checksumSha256) fail("pointed release artifact bytes are not intact");
  }
  return {
    ...pointer,
    releaseDirectory,
    pointerBytesSha256: sha256(await readFile(pointerPath)),
    releaseBytesSha256: sha256(await readFile(releasePath)),
  };
}

async function sourceCommit(rootDirectory) {
  const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: rootDirectory });
  const commit = stdout.trim();
  if (!/^[a-f0-9]{40}$/u.test(commit)) fail("the source checkout has no valid Git commit identity");
  return commit;
}

/**
 * Build a backend-readable current-source release from the same canonical source
 * identity consumed by APP. This writes generated local output only.
 */
export async function buildCurrentRelease({ rootDirectory = DEFAULT_ROOT, outputRoot = DEFAULT_OUTPUT_ROOT } = {}) {
  const root = path.resolve(rootDirectory);
  const resolvedOutputRoot = path.resolve(outputRoot);
  await mkdir(resolvedOutputRoot, { recursive: true });
  const lockPath = path.join(resolvedOutputRoot, ".current-release.lock");
  let lockHandle;
  try { lockHandle = await open(lockPath, "wx", 0o600); }
  catch { fail("another current-release writer may be active or its lock needs recovery"); }
  try {
  const previous = await inspectCurrentOutput(resolvedOutputRoot);
  const sourceRepositoryCommit = await sourceCommit(root);
  const temporaryBuildRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-current-release-build-"));
  let temporaryOutputRoot;
  try {
    const built = await buildAll({ rootDirectory: root, outputRoot: temporaryBuildRoot });
    const currentIdentity = await deriveCurrentSourceIdentity({ contentRoot: root, built, sourceRepositoryCommit });
    const artifacts = [];
    for (const track of built.catalog.tracks) {
      const builtTrack = built.artifacts.find((entry) => entry.trackId === track.trackId);
      if (!builtTrack) fail(`canonical build omitted ${track.trackId}`);
      const familyId = builtTrack.binding.familyId;
      if (typeof familyId !== "string") fail(`canonical runtime binding omitted ${track.trackId}`);
      const items = builtTrack.artifact.questions.map((question) => {
        const id = question.id ?? question.questionId;
        if (typeof id !== "string" || id.length === 0) fail(`canonical question identity is missing for ${track.trackId}`);
        const item = { ...question, id };
        if (question.interaction?.type === "choice_single" || question.interaction?.type === "choice_multiple") {
          const options = question.interaction.options;
          const acceptedOptionIds = question.answer?.optionIds ?? (question.answer?.optionId === undefined ? undefined : [question.answer.optionId]);
          if (!Array.isArray(options) || !Array.isArray(acceptedOptionIds) || acceptedOptionIds.length === 0) {
            fail(`choice inspection data is incomplete for ${track.trackId}/${id}`);
          }
          const normalizedOptions = options.map((option) => {
            const optionId = option.id ?? option.optionId;
            if (typeof optionId !== "string" || typeof option.text !== "string") fail(`choice option identity is invalid for ${track.trackId}/${id}`);
            return { ...option, id: optionId };
          });
          item.interaction = { ...question.interaction, type: "choice", options: normalizedOptions, acceptedOptionIds };
        }
        return item;
      });
      const artifactEnvelope = {
        envelopeVersion: 1,
        schemaVersion: "published-bank-v1",
        contentVersion: track.contentVersion,
        bank: {
          trackId: track.trackId,
          familyId,
          items,
        },
      };
      const artifactBytes = canonicalJson(artifactEnvelope);
      const checksumSha256 = sha256(artifactBytes);
      if (!HASH.test(checksumSha256)) fail(`generated artifact digest is invalid for ${track.trackId}`);
      const declaredModes = [...new Set((builtTrack.artifact.simulationProfiles ?? [])
        .map((profile) => profile?.modeId)
        .filter((modeId) => typeof modeId === "string" && modeId.length > 0))].sort();
      artifacts.push({
        trackId: track.trackId,
        familyId,
        contentVersion: track.contentVersion,
        schemaVersion: "published-bank-v1",
        checksumSha256,
        sourceRepositoryCommit,
        declaredModes,
        artifactBytes,
      });
    }
    artifacts.sort((left, right) => left.trackId.localeCompare(right.trackId));
    const releaseDigest = currentIdentity.sourceInputFingerprint;
    const releaseId = `patternly-local-${releaseDigest.slice(0, 20)}`;
    const release = {
      manifest: {
        envelopeVersion: 1,
        releaseId,
        sourceRepositoryCommit,
        status: "current_source",
        currentIdentity,
      },
      artifacts,
    };
    const releaseBytes = canonicalJson(release);
    const releasesRoot = path.join(resolvedOutputRoot, "releases");
    await mkdir(releasesRoot, { recursive: true });
    const existingReleases = await readdir(releasesRoot);
    const allowedReleases = new Set([previous?.releaseId, releaseId].filter(Boolean));
    if (existingReleases.some((entry) => !allowedReleases.has(entry))) fail("unreferenced release output exists; refusing to accumulate or delete it");
    const releaseDirectory = path.join(resolvedOutputRoot, "releases", releaseId);
    const releasePath = path.join(releaseDirectory, "release.json");
    temporaryOutputRoot = await mkdtemp(path.join(resolvedOutputRoot, ".current-release-pending-"));
    const temporaryReleasePath = path.join(temporaryOutputRoot, "release.json");
    await writeFile(temporaryReleasePath, releaseBytes, { flag: "wx" });
    const relativeReleasePath = path.posix.join("releases", releaseId, "release.json");
    const pointerPath = path.join(resolvedOutputRoot, "current.json");
    const temporaryPointerPath = path.join(temporaryOutputRoot, "current.json");
    await writeFile(temporaryPointerPath, canonicalJson({ releaseId, releasePath: relativeReleasePath }), { flag: "wx" });
    await assertCurrentSourceFingerprint({ contentRoot: root, expectedFingerprint: currentIdentity.sourceInputFingerprint });
    const latest = await inspectCurrentOutput(resolvedOutputRoot);
    if ((latest?.releaseId ?? null) !== (previous?.releaseId ?? null)
      || latest?.pointerBytesSha256 !== previous?.pointerBytesSha256
      || latest?.releaseBytesSha256 !== previous?.releaseBytesSha256) fail("current release pointer changed during build");
    let existingTarget;
    try { existingTarget = await lstat(releaseDirectory); }
    catch (error) { if (error?.code !== "ENOENT") fail("new release destination cannot be inspected"); }
    if (existingTarget && (!previous || previous.releaseId !== releaseId || !existingTarget.isDirectory() || existingTarget.isSymbolicLink())) {
      fail("new release destination is not the validated current release");
    }
    if (!existingTarget) await mkdir(releaseDirectory);
    await rename(temporaryReleasePath, releasePath);
    try {
      await rename(temporaryPointerPath, pointerPath);
    } catch (error) {
      if (!previous || previous.releaseId !== releaseId) await rm(releaseDirectory, { recursive: true, force: true });
      throw error;
    }
    let prunedReleaseId;
    if (previous && previous.releaseId !== releaseId) {
      await rm(previous.releaseDirectory, { recursive: true, force: false });
      prunedReleaseId = previous.releaseId;
    }
    return { releaseId, releasePath, pointerPath, relativeReleasePath, release, currentIdentity, ...(prunedReleaseId ? { prunedReleaseId } : {}) };
  } finally {
    await rm(temporaryBuildRoot, { recursive: true, force: true });
    if (temporaryOutputRoot) await rm(temporaryOutputRoot, { recursive: true, force: true });
  }
  } finally {
    await lockHandle.close();
    await rm(lockPath, { force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outputRoot = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_OUTPUT_ROOT;
  try {
    const result = await buildCurrentRelease({ outputRoot });
    process.stdout.write(`CURRENT_SOURCE_BUILT status=current_source; releaseId=${result.releaseId}; fingerprint=${result.currentIdentity.sourceInputFingerprint}; tracks=${result.currentIdentity.tracks.length}; path=${result.releasePath}${result.prunedReleaseId ? `; prunedPrevious=${result.prunedReleaseId}` : ""}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
