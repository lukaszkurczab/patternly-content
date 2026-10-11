import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createCandidateAdmissionV3 } from "../scripts/review/candidate-admission-v3.mjs";
import { CANDIDATE_PATH } from "../scripts/review/candidate-readiness-v2.mjs";
const root = path.resolve(import.meta.dirname, "..");
// Post-sync integration: requires the reviewed candidate installed and committed
// in the consumer. Repository tests deliberately run before candidate readiness.

test("current admission verifies committed app projections and rejects dirty verifiers or tampered bundles", async (t) => {
  const appSource = process.env.PATTERNLY_ADMISSION_APP_ROOT ?? path.resolve(root, "../patternly");
  const temporaryRoot = await mkdtemp(path.join(process.platform === "darwin" ? "/private/tmp" : os.tmpdir(), "saa-admission-current-"));
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }));
  const appRoot = path.join(temporaryRoot, "patternly");
  execFileSync("git", ["clone", "--quiet", "--shared", appSource, appRoot]);
  await symlink(path.join(appSource, "node_modules"), path.join(appRoot, "node_modules"));
  await symlink(root, path.join(temporaryRoot, "patternly-content"));
  const options = { root, appRoot, taskId: "AWS-02/ADMISSION" };
  const result = await createCandidateAdmissionV3(options);
  assert.equal(result.admission.runtimeAdmission, "granted");
  assert.equal(result.admission.taskId, "AWS-02/ADMISSION");
  assert.equal(result.admission.candidateId, JSON.parse(await readFile(path.join(root, CANDIDATE_PATH))).candidateId);
  for (const relativePath of ["scripts/candidateContentReleaseLock.mjs", "scripts/syncBundledContentRelease.mjs"]) {
    const file = path.join(appRoot, relativePath);
    const original = await readFile(file);
    await writeFile(file, Buffer.concat([original, Buffer.from("\n// dirty verifier fixture\n")]));
    await assert.rejects(createCandidateAdmissionV3(options), /paths differ from the application HEAD/u);
    await writeFile(file, original);
  }
  const commitFixture = () => {
    execFileSync("git", ["add", "src/content/generated/canonical-content", "integration/contracts/content-release/release.lock.json"], { cwd: appRoot });
    execFileSync("git", ["-c", "user.name=QA fixture", "-c", "user.email=qa@example.invalid", "commit", "--quiet", "-m", "tamper fixture"], { cwd: appRoot });
  };
  const lockPath = path.join(appRoot, "integration/contracts/content-release/release.lock.json");
  const lockBytes = await readFile(lockPath);
  const lock = JSON.parse(lockBytes);
  lock.artifacts[0].checksumSha256 = "0".repeat(64);
  await writeFile(lockPath, JSON.stringify(lock));
  commitFixture();
  await assert.rejects(createCandidateAdmissionV3(options), /differs from verified bundled training projections/u);
  await writeFile(lockPath, lockBytes);
  const artifactPath = path.join(appRoot, "src/content/generated/canonical-content/aws-certified-solutions-architect-associate.json");
  const artifact = JSON.parse(await readFile(artifactPath));
  artifact.questions[0].prompt += " tamper";
  await writeFile(artifactPath, JSON.stringify(artifact));
  commitFixture();
  await assert.rejects(createCandidateAdmissionV3(options), /checksum|hash|SHA|differs/u);
});
