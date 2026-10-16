import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { canonicalJson, sha256 } from "../scripts/build.mjs";
import { MigrationVerificationError, reconstructApprovedAwsPredecessor, verifyMigration } from "../scripts/content/verify-migration.mjs";
import { loadCandidateManifest, verifyCandidateCurrentSource } from "../scripts/review/candidate-manifest.mjs";
import { copyCurrentMigrationFixture } from "./helpers/current-migration-fixture.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proofPath = "evidence/business-quality/saa-20261010-aws-targeted-corrections.json";

test("AWS evidence extraction preserves accepted migration and the real candidate consumer", async (t) => {
  const fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "patternly-m05-aws-")));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  // Actual eight banks plus fixed historical Claude918; not current candidate acceptance.
  await copyCurrentMigrationFixture(root, fixtureRoot);
  const candidate = await loadCandidateManifest(root);
  const verify = () => verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  const consume = () => verifyCandidateCurrentSource({ root: fixtureRoot, candidate });
  const accepted = await verify();
  assert.equal(accepted.result, "passed");
  assert.deepEqual(accepted.historicalCounts, { tracks: 9, nodes: 117, mentalUnits: 932, questions: 16041 });
  const consumed = await consume();
  assert.equal(consumed.length, 9);
  assert.ok(consumed.every(entry => entry.migratedToCanonicalContent === true));
  // Exclude only the random temporary root from the complete pre-extraction fingerprint.
  const { contentRoot: _temporaryRoot, ...stableAccepted } = accepted;
  assert.equal(sha256(canonicalJson(stableAccepted)), "396b2ef6f9dcc50222afeccf48d73b8a85082101a4b14c043298fd9ad828304f");
  assert.equal(sha256(canonicalJson(consumed)), "d368bc9b6f0993223b9109a7805597533f8cdffda0b8480e25aa9c31b71c43d1");
  t.diagnostic(`accepted sha256=${sha256(canonicalJson(stableAccepted))}; candidate consumer sha256=${sha256(canonicalJson(consumed))}`);

  const proofBytes = await readFile(path.join(fixtureRoot, proofPath));
  assert.equal(sha256(proofBytes), "6d1545d9de8438600acc338bb9a53227b57d86f76345b63c8f6b141491196745");
  const proof = JSON.parse(proofBytes);
  assert.equal(accepted.tracks.find(entry => entry.trackId === proof.trackId).currentCounts.questions, 2604);
  // Check every pinned canonical input, retaining its original bytes for reconstruction.
  for (const source of proof.sourceFiles) {
    assert.equal(sha256(await readFile(path.join(fixtureRoot, source.sourceFile))), source.sourceSha256, source.sourceFile);
  }
  const questions = [];
  const trackRoot = path.join(fixtureRoot, "content", proof.trackId);
  for (const node of await readdir(trackRoot, { withFileTypes: true })) {
    if (!node.isDirectory()) continue;
    for (const file of await readdir(path.join(trackRoot, node.name))) {
      if (file.endsWith(".json")) questions.push(...JSON.parse(await readFile(path.join(trackRoot, node.name, file))));
    }
  }
  const reconstruct = (input = questions) => reconstructApprovedAwsPredecessor({ rootDirectory: fixtureRoot, questions: input });
  const transition = await reconstruct();
  await t.test("direct reconstruction treats input question order as a set", async () => {
    assert.deepEqual(await reconstruct([...questions].reverse()), transition);
  });

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

  async function rejectsWith(action, code) {
    await assert.rejects(action(), error => {
      assert.ok(error instanceof MigrationVerificationError);
      assert.equal(error.code, code);
      return true;
    });
  }

  const sourcePath = proof.sourceFiles[0].sourceFile;
  const source = JSON.parse(await readFile(path.join(fixtureRoot, sourcePath)));
  const changedSource = structuredClone(source);
  changedSource[0].prompt += " changed";
  for (const [name, relativePath, bytes, code] of [
    ["changedhash pinned proof bytes", proofPath, Buffer.concat([proofBytes, Buffer.from("\n")]), "HASH_MISMATCH"],
    ["corrupt pinned proof JSON", proofPath, "{", "HASH_MISMATCH"],
    ["pinned proof item order", proofPath, JSON.stringify({ ...proof, items: [...proof.items].reverse() }), "HASH_MISMATCH"],
    ["changedhash canonical AWS source", sourcePath, JSON.stringify(changedSource), "HASH_MISMATCH"],
    ["corrupt canonical AWS source JSON", sourcePath, "{", "INVALID_JSON"],
    ["canonical AWS question order", sourcePath, JSON.stringify([...source].reverse()), "CANONICAL_ORDER"]
  ]) {
    await t.test(name, () => withBytes(relativePath, bytes, async () => {
      await rejectsWith(verify, code);
      await rejectsWith(consume, code);
      // Direct reconstruction receives the unchanged in-memory questions, then checks
      // proof/source bytes first; parsing and canonical order have different precedence.
      await rejectsWith(reconstruct, "HASH_MISMATCH");
    }));
  }
  assert.deepEqual(await verify(), accepted);
  assert.deepEqual(await consume(), consumed);
  assert.deepEqual(await reconstruct(), transition);
});
