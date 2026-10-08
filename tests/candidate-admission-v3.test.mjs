import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { ADMISSION_PATH, validateCandidateAdmissionV3 } from "../scripts/review/candidate-admission-v3.mjs";
import { CANDIDATE_PATH, DECISION_PATH, READINESS_PATH, RELEASE_PATH, buildCandidateReadinessV2 } from "../scripts/review/candidate-readiness-v2.mjs";
import { runCandidateReleaseGate } from "../scripts/review/candidate-release-gate-v2.mjs";

const root = path.resolve(import.meta.dirname, "..");
const HISTORICAL_COMMIT = "eb92726efe583f646ce503f6215101d42528e08d";
const DRAFT_ROOT = "reports/candidate-reconciliation/AWS-02-DRAFT";
const OLD_CANDIDATE_ID = "946d3589abf9bfb205b382e7ebb9205786c3e42e18fe733c3607ad836a6a80a4";

function historicalBlob(relativePath) {
  return execFileSync("git", ["show", `${HISTORICAL_COMMIT}:${relativePath}`], {
    cwd: root,
    maxBuffer: 64 * 1024 * 1024,
  });
}

async function writeHistoricalBlob(fixtureRoot, relativePath) {
  const destination = path.join(fixtureRoot, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, historicalBlob(relativePath));
}

async function historicalCandidateFixture() {
  try {
    execFileSync("git", ["cat-file", "-e", `${HISTORICAL_COMMIT}^{commit}`], { cwd: root, stdio: "ignore" });
  } catch {
    throw new Error(`Historical candidate fixture unavailable: fetch full content history containing ${HISTORICAL_COMMIT}.`);
  }

  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-historical-candidate-test-"));
  try {
    for (const relativePath of [
      CANDIDATE_PATH,
      RELEASE_PATH,
      "evidence/candidate-decisions/aws-02-codex-decision-v2.json",
      "evidence/readiness/candidate-readiness-v2.json",
      ADMISSION_PATH,
    ]) await writeHistoricalBlob(fixtureRoot, relativePath);

    const candidate = JSON.parse(await readFile(path.join(fixtureRoot, CANDIDATE_PATH), "utf8"));
    const release = JSON.parse(await readFile(path.join(fixtureRoot, RELEASE_PATH), "utf8"));
    const admission = JSON.parse(await readFile(path.join(fixtureRoot, ADMISSION_PATH), "utf8"));
    for (const artifact of release.artifacts) {
      await writeHistoricalBlob(fixtureRoot, path.join(DRAFT_ROOT, "release", artifact.artifactPath));
    }
    await writeHistoricalBlob(fixtureRoot, admission.runtimeEvidence.path);
    return { fixtureRoot, candidate, release, admission };
  } catch (error) {
    await rm(fixtureRoot, { recursive: true, force: true });
    throw error;
  }
}

async function historicalReleaseGateFixture() {
  const fixture = await historicalCandidateFixture();
  try {
    for (const relativePath of [
      "schemas/review/content-candidate-decision-v2.schema.json",
      "schemas/review/content-candidate-readiness-v2.schema.json",
    ]) {
      const destination = path.join(fixture.fixtureRoot, relativePath);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(path.join(root, relativePath), destination);
    }

    const historicalDecisionPath = path.join(fixture.fixtureRoot, "evidence/candidate-decisions/aws-02-codex-decision-v2.json");
    const currentDecisionPath = path.join(fixture.fixtureRoot, DECISION_PATH);
    await mkdir(path.dirname(currentDecisionPath), { recursive: true });
    await writeFile(currentDecisionPath, await readFile(historicalDecisionPath));
    await mkdir(path.dirname(path.join(fixture.fixtureRoot, READINESS_PATH)), { recursive: true });
    await buildCandidateReadinessV2({ root: fixture.fixtureRoot });
    return fixture;
  } catch (error) {
    await rm(fixture.fixtureRoot, { recursive: true, force: true });
    throw error;
  }
}

test("the old AWS grant cannot authorize the current BIZQ-02 candidate", async () => {
  const currentCandidate = JSON.parse(await readFile(path.join(root, CANDIDATE_PATH), "utf8"));
  const oldAdmission = JSON.parse(await readFile(path.join(root, ADMISSION_PATH), "utf8"));
  assert.equal(oldAdmission.candidateId, OLD_CANDIDATE_ID);
  assert.notEqual(currentCandidate.candidateId, oldAdmission.candidateId);
  await assert.rejects(validateCandidateAdmissionV3(oldAdmission, { root }), /Candidate admission release binding is stale/u);

  const attemptedBIZQ02Grant = { ...oldAdmission, taskId: "BIZQ-02/ADMISSION" };
  await assert.rejects(validateCandidateAdmissionV3(attemptedBIZQ02Grant, { root }), /identity is invalid/u);
});

test("historical admission and runtime evidence remain hash-bound to their exact 946d candidate", async (t) => {
  const { fixtureRoot, candidate, release, admission } = await historicalCandidateFixture();
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));

  assert.equal(candidate.candidateId, OLD_CANDIDATE_ID);
  assert.equal(release.manifest.releaseId, "patternly-candidate-f00041eda3ca");
  await validateCandidateAdmissionV3(admission, { root: fixtureRoot });

  const unsupported = { ...admission, taskId: "BIZQ-02/ADMISSION" };
  await assert.rejects(validateCandidateAdmissionV3(unsupported, { root: fixtureRoot }), /identity is invalid/u);
  const changed = structuredClone(admission);
  changed.release.boundary = "deployed";
  await assert.rejects(validateCandidateAdmissionV3(changed, { root: fixtureRoot }), /no-deployment boundary/u);
  const wrongArtifact = structuredClone(admission);
  wrongArtifact.tracks[0].artifactSha256 = "0".repeat(64);
  await assert.rejects(validateCandidateAdmissionV3(wrongArtifact, { root: fixtureRoot }), /artifact binding is invalid/u);
});

test("the exact historical BIZQ-01 grant passes the full release gate and rejects a task mismatch", async (t) => {
  const { fixtureRoot, candidate, admission } = await historicalReleaseGateFixture();
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));

  assert.equal(candidate.candidateId, OLD_CANDIDATE_ID);
  assert.equal(admission.taskId, "BIZQ-01/ADMISSION");
  const historicalDecision = await readFile(path.join(fixtureRoot, "evidence/candidate-decisions/aws-02-codex-decision-v2.json"));
  assert.deepEqual(await readFile(path.join(fixtureRoot, DECISION_PATH)), historicalDecision);
  assert.equal((await runCandidateReleaseGate({ root: fixtureRoot })).candidateId, OLD_CANDIDATE_ID);

  const admissionPath = path.join(fixtureRoot, ADMISSION_PATH);
  const taskMismatch = { ...admission, taskId: "AWS-02/ADMISSION" };
  await writeFile(admissionPath, `${JSON.stringify(taskMismatch)}\n`);
  await assert.rejects(runCandidateReleaseGate({ root: fixtureRoot }), /Candidate admission task differs from its decision/u);
});
