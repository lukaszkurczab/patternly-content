import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { buildAll } from "../build.mjs";
import { CANDIDATE_TRACK_FAMILIES, CANDIDATE_TRACK_IDS, canonicalJson, canonicalJsonBytes, candidateIdFor } from "./candidate-manifest.mjs";
import { validateSchema } from "./schema-validation.mjs";

const exec = promisify(execFile);
const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
export const CANDIDATE_DRAFT_SCHEMA_VERSION = "patternly-content-candidate-draft-v2";
export const CANDIDATE_RELEASE_SCHEMA_VERSION = "patternly-content-release-envelope-v2";
export const CANDIDATE_DRAFT_SCHEMA_PATH = "schemas/review/content-candidate-draft-v2.schema.json";
export const CANDIDATE_RELEASE_SCHEMA_PATH = "schemas/review/content-release-envelope-v2.schema.json";
export const ODK096_APPROVAL_PATH = "evidence/canonical-content-approvals/odk-096-aws-free-node-v1.json";
export const QUARANTINE_OUTPUT_PATH = "reports/candidate-reconciliation/AWS-02-DRAFT";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const awsTrackId = "aws-certified-solutions-architect-associate";
const awsNodeId = "aws_secure_architecture_foundations";

async function canonicalSourceCommit(root) {
  const { stdout } = await exec("git", ["log", "-1", "--format=%H", "--", "content"], { cwd: root });
  return stdout.trim();
}

export async function assertCanonicalSourceSnapshot(root, sourceCommit) {
  const contentRoot = path.join(root, "content");
  const { stdout: treeOutput } = await exec("git", ["ls-tree", "-r", "-z", sourceCommit, "--", "content"], { cwd: root });
  const treeEntries = new Map();
  for (const record of treeOutput.split("\0").filter(Boolean)) {
    const tab = record.indexOf("\t");
    const [mode, type, objectId] = record.slice(0, tab).split(" ");
    treeEntries.set(record.slice(tab + 1), { mode, type, objectId });
  }

  const { stdout: objectFormat } = await exec("git", ["rev-parse", "--show-object-format"], { cwd: root });
  const digestName = objectFormat.trim();
  if (!["sha1", "sha256"].includes(digestName)) throw new Error(`Unsupported Git object format: ${digestName}.`);
  const workingEntries = new Map();
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      const relativePath = path.relative(root, absolutePath).split(path.sep).join("/");
      const info = await lstat(absolutePath);
      if (info.isSymbolicLink()) throw new Error(`Canonical content contains a symlink: ${relativePath}.`);
      if (info.isDirectory()) {
        await visit(absolutePath);
        continue;
      }
      if (!info.isFile()) throw new Error(`Canonical content contains a non-file entry: ${relativePath}.`);
      const bytes = await readFile(absolutePath);
      const mode = (info.mode & 0o111) === 0 ? "100644" : "100755";
      const objectId = createHash(digestName).update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
      workingEntries.set(relativePath, { mode, objectId });
    }
  }

  try {
    await visit(contentRoot);
  } catch (error) {
    if (error?.code === "ENOENT") throw new Error("Canonical content differs from its committed source snapshot: content directory is missing.");
    throw error;
  }

  const samePaths = treeEntries.size === workingEntries.size && [...treeEntries.keys()].every((relativePath) => workingEntries.has(relativePath));
  const sameObjects = samePaths && [...treeEntries].every(([relativePath, committed]) => {
    const working = workingEntries.get(relativePath);
    return committed.type === "blob" && committed.mode === working.mode && committed.objectId === working.objectId;
  });
  if (!sameObjects) throw new Error("Canonical content paths or bytes differ from the committed source snapshot; commit or reconcile content before drafting.");
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function assertCanonicalTrackSet(entries, label) {
  const ids = entries.map((entry) => entry?.trackId);
  if (canonicalJson(ids) !== canonicalJson(CANDIDATE_TRACK_IDS)) {
    throw new Error(`${label} must contain exactly the nine sorted canonical track IDs.`);
  }
}

function assertCandidateReleaseBinding(manifest, release) {
  assertCanonicalTrackSet(release.artifacts, "Release envelope");
  assertCanonicalTrackSet(manifest.tracks, "Candidate draft");
  const expectedTracks = release.artifacts.map((entry) => ({
    trackId: entry.trackId,
    familyId: entry.familyId,
    sourcePath: entry.sourcePath,
    contentVersion: entry.contentVersion,
    questionCount: entry.questionCount,
    questionSetSha256: entry.questionSetSha256,
    artifactPath: entry.artifactPath,
    artifactBytes: entry.artifactBytes,
    checksumSha256: entry.checksumSha256,
    ...(entry.canonicalApprovalBinding ? { canonicalApprovalBinding: entry.canonicalApprovalBinding } : {}),
  }));
  if (canonicalJson(expectedTracks) !== canonicalJson(manifest.tracks)) {
    throw new Error("Candidate draft track bindings differ from the release envelope.");
  }
}

export async function buildCandidateDraft({ root = ROOT, outputDirectory } = {}) {
  const sourceRoot = path.resolve(root);
  if (!outputDirectory) throw new Error("An explicit quarantined outputDirectory is required.");
  const outputRoot = path.resolve(outputDirectory);
  const allowedQuarantineRoot = path.join(sourceRoot, QUARANTINE_OUTPUT_PATH);
  if (outputRoot !== allowedQuarantineRoot && (outputRoot === sourceRoot || outputRoot.startsWith(`${sourceRoot}${path.sep}`))) {
    throw new Error(`Candidate draft output inside the repository is limited to ${QUARANTINE_OUTPUT_PATH}.`);
  }

  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-candidate-build-"));
  try {
    const sourceRepositoryCommit = await canonicalSourceCommit(sourceRoot);
    if (!/^[a-f0-9]{40}$/.test(sourceRepositoryCommit)) throw new Error("Canonical content source snapshot commit is unavailable.");
    await assertCanonicalSourceSnapshot(sourceRoot, sourceRepositoryCommit);
    const built = await buildAll({ rootDirectory: sourceRoot, outputRoot: tmpRoot });
    const approval = await readJson(path.join(sourceRoot, ODK096_APPROVAL_PATH));
    const releaseId = `patternly-candidate-${sourceRepositoryCommit.slice(0, 12)}`;
    const artifacts = [];
    const outputArtifacts = [];

    for (const trackId of CANDIDATE_TRACK_IDS) {
      const artifact = built.artifacts.find((entry) => entry.trackId === trackId);
      if (!artifact) throw new Error(`Canonical build is missing ${trackId}.`);
      const bytes = Buffer.from(artifact.artifactBytes);
      const artifactPath = `artifacts/${trackId}.json`;
      const entry = {
        trackId,
        familyId: CANDIDATE_TRACK_FAMILIES[trackId],
        sourcePath: `content/${trackId}`,
        contentVersion: artifact.track.contentVersion,
        questionCount: artifact.questions.length,
        questionSetSha256: sha256(canonicalJson(artifact.questions)),
        artifactPath,
        artifactBytes: bytes.length,
        checksumSha256: sha256(bytes),
      };
      if (trackId === awsTrackId) {
        const expected = approval.canonicalIdentity;
        const approvedNodeQuestions = artifact.questions.filter((question) => question.nodeId === awsNodeId);
        if (artifact.track.contentVersion !== expected.contentVersion || artifact.questions.length !== expected.track.questionCount || sha256(canonicalJson(artifact.questions)) !== expected.track.sha256) {
          throw new Error("Current AWS source does not match the exact ODK-096 track binding.");
        }
        if (approvedNodeQuestions.length !== expected.node.questionCount || sha256(canonicalJson(approvedNodeQuestions)) !== expected.node.sha256) {
          throw new Error("Current AWS free node does not match the exact ODK-096 node binding.");
        }
        const ids = new Set(artifact.questions.map((question) => question.questionId));
        for (const id of approval.questionSet.newQuestionIds) if (!ids.has(id)) throw new Error(`ODK-096 question is missing from current AWS source: ${id}`);
        entry.canonicalApprovalBinding = {
          addendumId: approval.addendumId,
          approvalPath: ODK096_APPROVAL_PATH,
          scope: "aws_local_canonical_producer_only",
          trackSha256: expected.track.sha256,
          nodeId: awsNodeId,
          nodeSha256: expected.node.sha256,
          newQuestionIds: [...approval.questionSet.newQuestionIds].sort(),
        };
      }
      artifacts.push(entry);
      outputArtifacts.push({ path: artifactPath, bytes });
    }

    const release = {
      schemaVersion: CANDIDATE_RELEASE_SCHEMA_VERSION,
      manifest: { envelopeVersion: 2, releaseId, sourceRepositoryCommit },
      artifacts,
    };
    const releaseBytes = Buffer.from(canonicalJsonBytes(release));
    const manifest = {
      schemaVersion: CANDIDATE_DRAFT_SCHEMA_VERSION,
      candidateId: "pending",
      status: "draft_not_admitted",
      release: {
        releaseId,
        releasePath: "release/release.json",
        checksumSha256: sha256(releaseBytes),
        sourceRepositoryCommit,
      },
      review: {
        candidateApproval: "not_granted",
        publishingAdmission: "not_granted",
        runtimeAdmission: "not_granted",
        appReleaseLockUpdated: false,
      },
      tracks: artifacts.map((entry) => ({
        trackId: entry.trackId,
        familyId: entry.familyId,
        sourcePath: entry.sourcePath,
        contentVersion: entry.contentVersion,
        questionCount: entry.questionCount,
        questionSetSha256: entry.questionSetSha256,
        artifactPath: entry.artifactPath,
        artifactBytes: entry.artifactBytes,
        checksumSha256: entry.checksumSha256,
        ...(entry.canonicalApprovalBinding ? { canonicalApprovalBinding: entry.canonicalApprovalBinding } : {}),
      })),
    };
    manifest.candidateId = candidateIdFor(manifest);

    assertCandidateReleaseBinding(manifest, release);
    const schema = await readJson(path.join(sourceRoot, CANDIDATE_DRAFT_SCHEMA_PATH));
    await validateSchema(manifest, schema, "candidate draft");
    const releaseSchema = await readJson(path.join(sourceRoot, CANDIDATE_RELEASE_SCHEMA_PATH));
    await validateSchema(release, releaseSchema, "candidate release envelope");
    if (candidateIdFor(manifest) !== manifest.candidateId) throw new Error("Candidate ID does not match the canonical draft identity.");

    await mkdir(path.join(outputRoot, "release", "artifacts"), { recursive: true });
    await mkdir(path.join(outputRoot, "candidate"), { recursive: true });
    for (const item of outputArtifacts) await writeFile(path.join(outputRoot, "release", item.path), item.bytes);
    await writeFile(path.join(outputRoot, "release", "release.json"), releaseBytes);
    await writeFile(path.join(outputRoot, "candidate", "manifest.json"), canonicalJsonBytes(manifest));
    return { manifest, release, outputRoot };
  } finally {
    await rm(tmpRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outputDirectory = process.argv[2];
  if (!outputDirectory) {
    process.stderr.write("Usage: node scripts/review/candidate-draft-v2.mjs <quarantined-output-directory>\n");
    process.exitCode = 2;
  } else {
    buildCandidateDraft({ outputDirectory }).then(({ manifest, outputRoot }) => {
      process.stdout.write(`Draft ${manifest.candidateId} written to ${outputRoot}; status=${manifest.status}; admission=not_granted\n`);
    }).catch((error) => {
      process.stderr.write(`${error.stack ?? error.message}\n`);
      process.exitCode = 1;
    });
  }
}
