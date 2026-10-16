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
const proofPath = "evidence/business-quality/bizq-01-besd-slice-01.json";

function reverseKeys(value) {
  if (Array.isArray(value)) return value.map(reverseKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [key, reverseKeys(item)]));
  }
  return value;
}

test("BESD source01 extraction preserves the historical chain and real candidate consumer", async (t) => {
  const fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "patternly-m05-besd-slice-")));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  // Eight actual banks plus fixed historical Claude918; not current candidate acceptance.
  await copyCurrentMigrationFixture(root, fixtureRoot);
  const candidate = await loadCandidateManifest(root);
  const verify = () => verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  const consume = () => verifyCandidateCurrentSource({ root: fixtureRoot, candidate });
  const accepted = await verify();
  const consumed = await consume();
  assert.equal(accepted.result, "passed");
  // Complete outputs captured before production extraction; omit only the random root.
  const { contentRoot: _temporaryRoot, ...stableAccepted } = accepted;
  assert.equal(sha256(canonicalJson(stableAccepted)), "396b2ef6f9dcc50222afeccf48d73b8a85082101a4b14c043298fd9ad828304f");
  assert.equal(sha256(canonicalJson(consumed)), "d368bc9b6f0993223b9109a7805597533f8cdffda0b8480e25aa9c31b71c43d1");

  const proof = JSON.parse(await readFile(path.join(fixtureRoot, proofPath)));
  const cohort14 = JSON.parse(await readFile(path.join(fixtureRoot, "evidence/business-quality/bizq-01-besd-seed-cohort-14.json")));
  assert.equal(proof.items.length, 2);
  assert.deepEqual(accepted.replacementProof.replacements.slice(0, 2), proof.items.map(({ beforeQuestionId, questionId }) => ({ beforeQuestionId, questionId })));
  for (const entry of proof.items) {
    const successor = cohort14.replacements.find(item => item.sourceFile === entry.sourceFile);
    assert.equal(entry.sourceSha256, successor.beforeSourceSha256);
    const currentBytes = await readFile(path.join(fixtureRoot, entry.sourceFile));
    assert.equal(sha256(currentBytes), successor.sourceSha256);
    // source01 pins apply to reconstructed private overrides, never active cohort14 bytes.
    assert.notEqual(sha256(currentBytes), entry.sourceSha256);
    const current = JSON.parse(currentBytes);
    assert.ok(current.some(question => question.questionId === entry.questionId));
    assert.ok(!current.some(question => question.questionId === entry.beforeQuestionId));
  }

  async function withBytes(relativePath, bytes, action) {
    const target = path.join(fixtureRoot, relativePath);
    const original = await readFile(target);
    try {
      await writeFile(target, bytes);
      await action();
    } finally {
      await writeFile(target, original);
    }
  }

  async function rejected(relativePath, bytes, code, message) {
    await withBytes(relativePath, bytes, async () => {
      for (const action of [verify, consume]) {
        await assert.rejects(action(), error => {
          assert.ok(error instanceof MigrationVerificationError);
          assert.equal(error.code, code);
          // Distinguish source01 from earlier current-bank/cohort/parser/order validation.
          assert.match(error.message, message);
          return true;
        });
      }
    });
  }

  for (const index of [0, 1]) {
    const changed = structuredClone(proof);
    changed.items[index].beforeQuestion.prompt += " changed";
    await t.test(`source01 old object ${index} changedhash`, () => rejected(proofPath, JSON.stringify(changed), "HASH_MISMATCH",
      new RegExp(`BIZQ-01 replacement proof\\.items\\[${index}\\]\\.beforeQuestion\\.canonicalQuestionSha256`)));
    const oldIdentity = structuredClone(proof);
    oldIdentity.items[index].beforeQuestion.questionId = "besd-n02-b01-i999";
    await t.test(`source01 old identity ${index}`, () => rejected(proofPath, JSON.stringify(oldIdentity), "EVIDENCE_MEMBERSHIP",
      new RegExp(`BIZQ-01 replacement proof\\.items\\[${index}\\]\\.beforeQuestion identity does not match`)));
    const pin = structuredClone(proof);
    pin.items[index].sourceSha256 = "0".repeat(64);
    await t.test(`source01 source pin ${index}`, () => rejected(proofPath, JSON.stringify(pin), "EVIDENCE_VALUE",
      new RegExp(`BIZQ-01 replacement proof\\.items\\[${index}\\]\\.sourceSha256 does not match`)));
  }
  const identity = structuredClone(proof);
  identity.questionSetSha256 = "0".repeat(64);
  await t.test("source01 identity", () => rejected(proofPath, JSON.stringify(identity), "EVIDENCE_VALUE", /BIZQ-01 replacement proof does not match the accepted bounded batch identity/u));
  await t.test("source01 items order is positional", () => rejected(proofPath, JSON.stringify({ ...proof, items: [...proof.items].reverse() }), "EVIDENCE_VALUE", /BIZQ-01 replacement proof\.items\[0\]\.sourceFile does not match/u));
  await t.test("source01 corrupt JSON is a parser refusal", () => rejected(proofPath, "{", "INVALID_JSON", /BIZQ-01 replacement proof is not valid JSON/u));
  await t.test("proof JSON keys including beforeQuestion are unordered", () => withBytes(proofPath, JSON.stringify(reverseKeys(proof)), async () => {
    assert.deepEqual(await verify(), accepted);
    assert.deepEqual(await consume(), consumed);
  }));

  for (const [index, entry] of proof.items.entries()) {
    const source = JSON.parse(await readFile(path.join(fixtureRoot, entry.sourceFile)));
    const changed = structuredClone(source);
    changed.find(question => question.questionId === entry.questionId).prompt += " changed";
    for (const [name, bytes, code, message] of [
      ["current prompt", JSON.stringify(changed), "HASH_MISMATCH", /Current backend-system-design-interview bank differs from its fixed accepted 1569-question bank/u],
      ["corrupt canonical JSON", "{", "INVALID_JSON", /content\/backend-system-design-interview\/.*is not valid JSON/u],
      ["canonical question order", JSON.stringify([...source].reverse()), "CANONICAL_ORDER", /content\/backend-system-design-interview\/.*question IDs must be sorted/u],
      ["current source whitespace", JSON.stringify(source) + "\n", "HASH_MISMATCH", /BIZQ-01 BESD source14.*sourceFile does not match its fixed current hash/u]
    ]) {
      await t.test(`source ${index}: ${name}`, () => rejected(entry.sourceFile, bytes, code, message));
    }
  }
  assert.deepEqual(await verify(), accepted);
  assert.deepEqual(await consume(), consumed);
});
