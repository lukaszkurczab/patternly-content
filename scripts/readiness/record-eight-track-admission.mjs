import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";
import { join, resolve, relative } from "node:path";
import { verifyArtifactRecord } from "../publishing/pipeline.mjs";

const exec = promisify(execFile);
const root = process.cwd();
const frontendRoot = resolve(process.env.PATTERNLY_FRONTEND_ROOT ?? join(root, "..", "patternly"));
const releaseId = "patternly-launch-2026-08-25-01";
const trackIds = [
  "aws-certified-solutions-architect-associate",
  "backend-system-design-interview",
  "coding-interview-dsa-problem-solving",
  "frontend-system-design-interview",
  "google-cloud-associate-cloud-engineer",
  "microsoft-azure-administrator-associate-az-104",
  "microsoft-azure-ai-fundamentals-ai-901",
  "object-oriented-design-interview",
];

const canonical = (value) => {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
};
const hash = (value) => createHash("sha256").update(value).digest("hex");
const jsonBytes = (value) => `${canonical(value)}\n`;
const git = async (cwd, args) => (await exec("git", args, { cwd })).stdout.trim();

const frontendCommit = await git(frontendRoot, ["rev-parse", "HEAD"]);
if (!/^[a-f0-9]{40}$/.test(frontendCommit)) throw new Error("Frontend HEAD is not a full commit SHA.");
const frontendStatus = await git(frontendRoot, ["status", "--porcelain", "--untracked-files=all"]);
if (frontendStatus) throw new Error("Frontend worktree must be clean before recording admission evidence.");

const testCommand = "node --import tsx --test tests/runtimeAdmissionEightTrack.test.ts";
const test = await exec(process.execPath, ["--import", "tsx", "--test", "tests/runtimeAdmissionEightTrack.test.ts"], {
  cwd: frontendRoot,
  maxBuffer: 16 * 1024 * 1024,
});
const output = `${test.stdout}${test.stderr}`;
if (!/# pass 1\b/u.test(output) || !/runtime admission proves exact package resolution/u.test(output)) {
  throw new Error("Runtime admission test did not produce the expected passing result.");
}
const verifiedAt = new Date().toISOString();
const runtimeEvidence = {
  frontendCommit,
  command: testCommand,
  outputSha256: hash(output),
  schemaVersion: "patternly-runtime-admission-evidence-v1",
  status: "passed",
  testName: "runtime admission proves exact package resolution and one valid lifecycle step for all eight tracks",
  verifiedAt,
};
const runtimeEvidenceBytes = jsonBytes(runtimeEvidence);
const runtimeEvidencePath = `evidence/admissions/runtime/${frontendCommit}.json`;
await mkdir(join(root, "evidence/admissions/runtime"), { recursive: true });
await writeFile(join(root, runtimeEvidencePath), runtimeEvidenceBytes);

const releasePath = join(root, "artifacts/releases", releaseId, "release.json");
const release = JSON.parse(readFileSync(releasePath, "utf8"));
if (release?.manifest?.releaseId !== releaseId || typeof release?.manifest?.sourceRepositoryCommit !== "string") throw new Error("Release manifest identity is invalid.");
const artifacts = new Map();
for (const artifact of release.artifacts ?? []) {
  verifyArtifactRecord(artifact);
  artifacts.set(artifact.trackId, artifact);
}
if (artifacts.size !== trackIds.length || trackIds.some((trackId) => !artifacts.has(trackId))) throw new Error("Release does not contain exactly the eight launch artifacts.");

const contentSourceCommit = await git(root, ["log", "-1", "--format=%H", "--", "manual/source", "config/authoring", "config/curricula", "docs/track-briefs"]);
const manifest = {
  frontendCommit,
  contentSourceCommit,
  releaseId,
  schemaVersion: "eight-track-launch-admission-v1",
  tracks: trackIds.map((trackId) => {
    const artifact = artifacts.get(trackId);
    return {
      publishing: { checksumSha256: artifact.checksumSha256, releaseId, status: "admitted" },
      runtime: {
        frontendCommit,
        evidencePath: runtimeEvidencePath,
        evidenceSha256: hash(runtimeEvidenceBytes),
        status: "admitted",
        testCommand,
        testResult: "passed",
      },
      trackId,
    };
  }),
  verifiedAt,
  verifiedBy: "owner-authorized-launch-agent",
};
await mkdir(join(root, "evidence/admissions"), { recursive: true });
await writeFile(join(root, "evidence/admissions/eight-track-launch-admission.json"), jsonBytes(manifest));
console.log(JSON.stringify({
  frontendCommit,
  contentSourceCommit,
  manifest: relative(root, join(root, "evidence/admissions/eight-track-launch-admission.json")),
  runtimeEvidence: runtimeEvidencePath,
  tracks: trackIds.length,
}, null, 2));
