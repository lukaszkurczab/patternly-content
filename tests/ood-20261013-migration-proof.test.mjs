import assert from "node:assert/strict";
import { mkdtemp, readFile, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";
import { copyOodCorrectionMigrationFixture } from "./helpers/ood-correction-migration-fixture.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proofPath = "evidence/business-quality/ood-20261013-explanation-corrections.json";
const contentRoot = "content";
const trackId = "object-oriented-design-interview";
const version = "object-oriented-design-interview-authoring-v2026.10.05-bizq01-24-bizq02-v2-bizq03-planning-v2-ood-20261013-01-03";
let fixtureRoot;

async function assertRejected(code) {
  await assert.rejects(verifyMigration({ contentRoot: path.join(fixtureRoot, contentRoot) }), (error) => {
    assert.ok(error instanceof MigrationVerificationError);
    assert.equal(error.code, code);
    return true;
  });
}

async function withJsonMutation(relativePath, mutate, action) {
  const target = path.join(fixtureRoot, relativePath);
  const original = await readFile(target);
  try {
    await writeFile(target, `${JSON.stringify(mutate(JSON.parse(original.toString("utf8"))))}\n`, "utf8");
    await action();
  } finally {
    await writeFile(target, original);
  }
}

before(async () => {
  fixtureRoot = await realpath(await mkdtemp(path.join(await realpath(os.tmpdir()), "ood-20261013-proof-")));
  await copyOodCorrectionMigrationFixture(repositoryRoot, fixtureRoot);
});

after(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

test("accepts the fixed explanation correction proof and preserves the OOD24 predecessor report", async () => {
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, proofPath), "utf8"));
  assert.equal(proof.contentVersion, version);
  assert.equal(proof.items.length, 39);
  const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, contentRoot) });
  assert.equal(result.result, "passed");
  assert.equal(result.sameIdCorrectionProof.questionIds.length, 749);
  assert.deepEqual(result.explanationCorrectionProof.questionIds, proof.items.map(({ questionId }) => questionId));
  assert.equal(result.tracks.find((track) => track.trackId === trackId).currentCounts.questions, 1413);
});

test("requires the immutable explanation proof and rejects tampered proof or source bytes", async () => {
  const target = path.join(fixtureRoot, proofPath);
  const original = await readFile(target);
  try {
    await rm(target);
    await assertRejected("EVIDENCE_MEMBERSHIP");
  } finally {
    await writeFile(target, original);
  }
  await withJsonMutation(proofPath, (proof) => { proof.items[0].currentQuestion.feedback.reason += " changed"; return proof; }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation("content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", (questions) => {
    questions[0].feedback.reason += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));
});

test("accepts policy-only OOD content-version changes while the fixed source and proof hashes match", async () => {
  await withJsonMutation("content/catalog.json", (catalog) => {
    catalog.tracks.find((track) => track.trackId === trackId).contentVersion = `${version}-wrong`;
    return catalog;
  }, async () => {
    const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, contentRoot) });
    assert.equal(result.result, "passed");
    assert.equal(result.explanationCorrectionProof.questionIds.length, 39);
  });
});


test("rejects symlink substitution on correction-specific proof and source paths", async () => {
  const sourcePath = "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json";
  for (const relativePath of [proofPath, sourcePath]) {
    const target = path.join(fixtureRoot, relativePath);
    const held = `${target}.held`;
    await rename(target, held);
    try {
      await symlink(path.basename(held), target);
      await assertRejected("SYMLINK_PATH");
    } finally {
      await rm(target, { force: true });
      await rename(held, target);
    }
  }
});
