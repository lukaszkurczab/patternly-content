import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { ADMISSION_PATH, createCandidateAdmissionV3, validateCandidateAdmissionV3 } from "../scripts/review/candidate-admission-v3.mjs";

const root = path.resolve(import.meta.dirname, "..");
const appRoot = path.resolve(root, "../patternly");

test("admission binds verified local publishing bytes, app lock, and runtime test", async () => {
  const { admission, runtimeEvidence } = await createCandidateAdmissionV3({ root, appRoot });
  assert.equal(admission.publishingAdmission, "granted");
  assert.equal(admission.runtimeAdmission, "granted");
  assert.equal(admission.appReleaseLockUpdated, true);
  assert.equal(admission.release.boundary, "local_verified_artifacts_no_deployment");
  assert.equal(admission.tracks.length, 9);
  assert.equal(runtimeEvidence.status, "passed");
});

test("committed admission and runtime evidence remain hash-bound", async () => {
  const admission = JSON.parse(await readFile(path.join(root, ADMISSION_PATH), "utf8"));
  await validateCandidateAdmissionV3(admission, { root });
  const changed = structuredClone(admission);
  changed.release.boundary = "deployed";
  await assert.rejects(validateCandidateAdmissionV3(changed, { root }), /no-deployment boundary/);
  const wrongArtifact = structuredClone(admission);
  wrongArtifact.tracks[0].artifactSha256 = "0".repeat(64);
  await assert.rejects(validateCandidateAdmissionV3(wrongArtifact, { root }), /artifact binding is invalid/);
});
