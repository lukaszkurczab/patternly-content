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
const trackId = "claude-certified-architect-professional-certification";
const historicalPath = "evidence/canonical-content-approvals/claude-20261007-historical-questions.json";
const sourcePath = `content/${trackId}/team_workflows_and_operational_enablement/CCARP-D07-O01.json`;
const coveragePath = "docs/evidence/content-audits/2026-10-11-cc02-content-coverage.json";

test("Claude evidence extraction preserves accepted migration and the real candidate consumer", async (t) => {
  const fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "patternly-m05-claude-")));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  // Fixed historical Claude918 and the actual other eight banks; not current candidate acceptance.
  await copyCurrentMigrationFixture(root, fixtureRoot);
  const candidate = await loadCandidateManifest(root);
  const verify = () => verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  const consume = () => verifyCandidateCurrentSource({ root: fixtureRoot, candidate });
  const accepted = await verify();
  assert.equal(accepted.result, "passed");
  assert.deepEqual(accepted.historicalCounts, { tracks: 9, nodes: 117, mentalUnits: 932, questions: 16041 });
  assert.equal(accepted.tracks.find(entry => entry.trackId === trackId).currentCounts.questions, 918);
  const consumed = await consume();
  assert.equal(consumed.length, 9);
  assert.ok(consumed.every(entry => entry.migratedToCanonicalContent === true));
  // Exclude only the random temporary root from the complete baseline output fingerprint.
  const { contentRoot: _temporaryRoot, ...stableAccepted } = accepted;
  assert.equal(sha256(canonicalJson(stableAccepted)), "396b2ef6f9dcc50222afeccf48d73b8a85082101a4b14c043298fd9ad828304f");
  assert.equal(sha256(canonicalJson(consumed)), "d368bc9b6f0993223b9109a7805597533f8cdffda0b8480e25aa9c31b71c43d1");
  t.diagnostic(`accepted sha256=${sha256(canonicalJson(stableAccepted))}; candidate consumer sha256=${sha256(canonicalJson(consumed))}`);

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

  async function rejectsBoth(relativePath, bytes, expectedCode) {
    await withBytes(relativePath, bytes, async () => {
      for (const action of [verify, consume]) {
        await assert.rejects(action(), error => {
          assert.ok(error instanceof MigrationVerificationError);
          assert.equal(error.code, expectedCode);
          return true;
        });
      }
    });
  }

  const historical = JSON.parse(await readFile(path.join(fixtureRoot, historicalPath)));
  const source = JSON.parse(await readFile(path.join(fixtureRoot, sourcePath)));
  const catalog = JSON.parse(await readFile(path.join(fixtureRoot, "content/catalog.json")));
  const changedHistorical = structuredClone(historical);
  changedHistorical.questions[0].prompt += " changed";
  const changedIdentity = structuredClone(historical);
  changedIdentity.contentVersion += "-changed";
  const changedSource = structuredClone(source);
  changedSource[0].prompt += " changed";
  const changedCatalog = structuredClone(catalog);
  changedCatalog.tracks.find(entry => entry.trackId === trackId).contentVersion += "-changed";

  await t.test("historical question order remains set-based", async () => {
    const reversed = { ...historical, questions: [...historical.questions].reverse() };
    await withBytes(historicalPath, JSON.stringify(reversed), async () => {
      assert.deepEqual(await verify(), accepted);
      assert.deepEqual(await consume(), consumed);
    });
  });

  for (const [name, relativePath, bytes, code] of [
    ["changedhash historical questions", historicalPath, JSON.stringify(changedHistorical), "HASH_MISMATCH"],
    ["historical identity", historicalPath, JSON.stringify(changedIdentity), "EVIDENCE_VALUE"],
    ["corrupt historical JSON", historicalPath, "{", "INVALID_JSON"],
    ["changedhash successor questions", sourcePath, JSON.stringify(changedSource), "HASH_MISMATCH"],
    ["successor identity", "content/catalog.json", JSON.stringify(changedCatalog), "EVIDENCE_VALUE"],
    ["corrupt successor JSON", sourcePath, "{", "INVALID_JSON"],
    ["canonical successor question order", sourcePath, JSON.stringify([...source].reverse()), "CANONICAL_ORDER"],
    // Pinned evidence is checked by bytes before JSON parsing, including corrupt JSON.
    ["corrupt pinned coverage JSON", coveragePath, "{", "HASH_MISMATCH"]
  ]) {
    await t.test(name, () => rejectsBoth(relativePath, bytes, code));
  }

  for (const relativePath of [
    coveragePath,
    "evidence/canonical-content-approvals/claude-cc02-historical-before.json",
    "evidence/canonical-content-approvals/claude-cc03-question-baseline.json"
  ]) {
    const bytes = await readFile(path.join(fixtureRoot, relativePath));
    await t.test(`changedhash pinned bytes: ${path.basename(relativePath)}`, () =>
      rejectsBoth(relativePath, Buffer.concat([bytes, Buffer.from("\n")]), "HASH_MISMATCH"));
  }
  assert.deepEqual(await verify(), accepted);
  assert.deepEqual(await consume(), consumed);
});
