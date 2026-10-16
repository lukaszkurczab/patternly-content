import assert from "node:assert/strict";
import { mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { canonicalJson, sha256 } from "../scripts/build.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";
import { loadCandidateManifest, verifyCandidateCurrentSource } from "../scripts/review/candidate-manifest.mjs";
import { copyCurrentMigrationFixture } from "./helpers/current-migration-fixture.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proofPath = "evidence/business-quality/bizq-05-gcp-question-relations-01.json";

test("BIZQ-05 evidence extraction preserves accepted migration and the real candidate consumer", async (t) => {
  const fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "patternly-m05-bizq05-")));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  await copyCurrentMigrationFixture(root, fixtureRoot);
  const candidate = await loadCandidateManifest(root);
  const verify = () => verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  const consume = () => verifyCandidateCurrentSource({ root: fixtureRoot, candidate });
  const accepted = await verify();
  assert.equal(accepted.result, "passed");
  assert.deepEqual(accepted.counts, { tracks: 9, nodes: 117, mentalUnits: 958, questions: 16695 });
  assert.deepEqual(accepted.historicalCounts, { tracks: 9, nodes: 117, mentalUnits: 932, questions: 16041 });
  const consumed = await consume();
  assert.equal(consumed.length, 9);
  assert.ok(consumed.every(entry => entry.migratedToCanonicalContent === true));
  assert.equal(consumed.find(entry => entry.trackId === "google-cloud-associate-cloud-engineer").canonicalItemCount, 2981);
  // Exclude only the random temporary root from the complete output fingerprint.
  const { contentRoot: _temporaryRoot, ...stableAccepted } = accepted;
  t.diagnostic(`accepted sha256=${sha256(canonicalJson(stableAccepted))}; candidate consumer sha256=${sha256(canonicalJson(consumed))}`);

  const proofFile = path.join(fixtureRoot, proofPath);
  const originalProof = await readFile(proofFile);
  const proof = JSON.parse(originalProof);
  const sourceFile = path.join(fixtureRoot, proof.sourcePath);
  const originalSource = await readFile(sourceFile);
  const source = JSON.parse(originalSource);

  async function rejectsBoth(relativePath, bytes, expectedCode) {
    const target = path.join(fixtureRoot, relativePath);
    const original = await readFile(target);
    try {
      await writeFile(target, bytes);
      for (const action of [verify, consume]) {
        await assert.rejects(action(), error => {
          assert.ok(error instanceof MigrationVerificationError);
          assert.equal(error.code, expectedCode);
          return true;
        });
      }
    } finally {
      await writeFile(target, original);
    }
  }

  const changedPin = structuredClone(proof);
  changedPin.historicalQuestionSetSha256 = "0".repeat(64);
  const reorderedIds = structuredClone(proof);
  reorderedIds.questionIds.reverse();
  const reorderedRelations = structuredClone(proof);
  reorderedRelations.relations.reverse();
  const changedQuestion = structuredClone(source);
  changedQuestion[0].prompt += " Changed.";

  for (const [name, relativePath, bytes, code] of [
    ["changed historical hash", proofPath, JSON.stringify(changedPin), "EVIDENCE_VALUE"],
    ["corrupt proof JSON", proofPath, "{", "INVALID_JSON"],
    ["question ID order", proofPath, JSON.stringify(reorderedIds), "EVIDENCE_VALUE"],
    ["relation order", proofPath, JSON.stringify(reorderedRelations), "EVIDENCE_VALUE"],
    ["changed source hash", proof.sourcePath, JSON.stringify(changedQuestion), "HASH_MISMATCH"],
    ["corrupt source bytes", proof.sourcePath, "{", "INVALID_JSON"],
    ["source question order", proof.sourcePath, JSON.stringify([...source].reverse()), "CANONICAL_ORDER"]
  ]) {
    await t.test(name, () => rejectsBoth(relativePath, bytes, code));
  }
  assert.deepEqual(await readFile(proofFile), originalProof);
  assert.deepEqual(await readFile(sourceFile), originalSource);
});
