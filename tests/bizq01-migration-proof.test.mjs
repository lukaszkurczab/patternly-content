import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import { createCanonicalFixture } from "./helpers/simp03-canonical-fixture.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";

const contentRepositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendTrack = "backend-system-design-interview";
const proofRelativePath = "evidence/business-quality/bizq-01-besd-slice-01.json";
const oldSourcePath = "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json";
const newQuestionId = "besd-n02-b01-i017";

let fixtureRoot;
let fixtureParent;
let noProofFixture;
let noProofFixtureParent;

async function writeJsonAt(root, relativePath, value) {
  await writeFile(path.join(root, relativePath), `${JSON.stringify(value)}\n`, "utf8");
}

async function withJsonMutation(relativePath, mutate, action) {
  const target = path.join(fixtureRoot, relativePath);
  const original = await readFile(target);
  try {
    const value = JSON.parse(original.toString("utf8"));
    await writeJsonAt(fixtureRoot, relativePath, mutate(value));
    await action();
  } finally {
    await writeFile(target, original);
  }
}

async function assertRejected(code) {
  await assert.rejects(verifyMigration({ contentRoot: path.join(fixtureRoot, "content") }), (error) => {
    assert.ok(error instanceof MigrationVerificationError);
    assert.equal(error.code, code);
    return true;
  });
}

before(async () => {
  fixtureParent = await realpath(await mkdtemp(path.join(os.tmpdir(), "bizq01-migration-proof-")));
  fixtureRoot = path.join(fixtureParent, "repo");
  await cp(path.join(contentRepositoryRoot, "content"), path.join(fixtureRoot, "content"), { recursive: true });
  await mkdir(path.join(fixtureRoot, "evidence", "business-quality"), { recursive: true });
  await cp(path.join(contentRepositoryRoot, "evidence", "business-quality", path.basename(proofRelativePath)), path.join(fixtureRoot, proofRelativePath), { recursive: true });
  await cp(path.join(contentRepositoryRoot, "evidence", "canonical-content-approvals"), path.join(fixtureRoot, "evidence", "canonical-content-approvals"), { recursive: true });
  noProofFixture = await createCanonicalFixture("bizq01-no-proof-");
  noProofFixtureParent = noProofFixture.parent;
});

after(async () => {
  await rm(fixtureParent, { recursive: true, force: true });
  await rm(noProofFixtureParent, { recursive: true, force: true });
});

test("accepts the real BIZQ-01 replacement proof while preserving current and historical counts", async () => {
  const result = await verifyMigration({ contentRoot: path.join(contentRepositoryRoot, "content") });
  assert.equal(result.result, "passed");
  assert.deepEqual(result.counts, { tracks: 9, nodes: 117, mentalUnits: 943, questions: 16077 });
  assert.deepEqual(result.historicalCounts, { tracks: 9, nodes: 117, mentalUnits: 932, questions: 16041 });
  assert.equal(result.approvedAdditionCount, 36);
  assert.deepEqual(result.replacementProof.replacements, [
    { beforeQuestionId: "besd-n02-b01-i002", questionId: "besd-n02-b01-i017" },
    { beforeQuestionId: "besd-n04-b01-i002", questionId: "besd-n04-b01-i019" }
  ]);
});

test("keeps the original migration verifier behavior when no BIZQ proof is present", async () => {
  const result = await verifyMigration({ contentRoot: noProofFixture.root });
  assert.equal(result.result, "passed");
  assert.equal(result.replacementProof, undefined);
});

test("rejects changes to a current replacement and its frozen old object", async () => {
  const currentRelativePath = "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json";
  await withJsonMutation(currentRelativePath, (questions) => {
    questions.find((question) => question.questionId === newQuestionId).prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));

  await withJsonMutation(proofRelativePath, (proof) => {
    proof.items[0].beforeQuestion.prompt += " changed";
    return proof;
  }, () => assertRejected("HASH_MISMATCH"));
});

test("rejects stale batch identity, duplicate mappings, and a missing replacement", async () => {
  await withJsonMutation("content/catalog.json", (catalog) => {
    catalog.tracks.find((track) => track.trackId === backendTrack).contentVersion = "stale-version";
    return catalog;
  }, () => assertRejected("EVIDENCE_VALUE"));

  await withJsonMutation(proofRelativePath, (proof) => {
    proof.questionSetSha256 = "0".repeat(64);
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));

  await withJsonMutation(proofRelativePath, (proof) => {
    proof.items[1] = structuredClone(proof.items[0]);
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));

  await withJsonMutation(oldSourcePath, (questions) => questions.filter((question) => question.questionId !== newQuestionId),
    () => assertRejected("HASH_MISMATCH"));
});

test("rejects changes to an unrelated item in the proven current track", async () => {
  const relativePath = "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json";
  await withJsonMutation(relativePath, (questions) => {
    questions.find((question) => question.questionId === "besd-n02-b01-i001").prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));
});
