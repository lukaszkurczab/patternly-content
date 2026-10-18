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
const manifestPath = "content/migration-evidence/manifest.json";
const rowsPath = "content/migration-evidence/items/aws-certified-solutions-architect-associate.json";
const sourcePath = "content/google-cloud-associate-cloud-engineer/organization_projects_policies_services_quotas_and_assets/GCPACE-N01-B04.json";

test("SIMP03 snapshot extraction preserves accepted migration and the real candidate consumer", async (t) => {
  const fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "patternly-m05-simp03-")));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
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
  // Exclude only the random temporary root from the complete output fingerprint.
  const { contentRoot: _temporaryRoot, ...stableAccepted } = accepted;
  assert.equal(sha256(canonicalJson(stableAccepted)), "5f01f7726b209ec2c461d069587dac77ba5fb9d6962ec060a215f43f16ab5783");
  assert.equal(sha256(canonicalJson(consumed)), "d368bc9b6f0993223b9109a7805597533f8cdffda0b8480e25aa9c31b71c43d1");
  t.diagnostic(`accepted sha256=${sha256(canonicalJson(stableAccepted))}; candidate consumer sha256=${sha256(canonicalJson(consumed))}`);

  const originalManifest = await readFile(path.join(fixtureRoot, manifestPath));
  const originalRows = await readFile(path.join(fixtureRoot, rowsPath));
  const manifest = JSON.parse(originalManifest);
  const rows = JSON.parse(originalRows);
  const source = JSON.parse(await readFile(path.join(fixtureRoot, sourcePath)));

  await t.test("evidence row order remains set-based", async () => {
    try {
      await writeFile(path.join(fixtureRoot, rowsPath), JSON.stringify([...rows].reverse()));
      assert.deepEqual(await verify(), accepted);
      assert.deepEqual(await consume(), consumed);
    } finally {
      await writeFile(path.join(fixtureRoot, rowsPath), originalRows);
    }
  });

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

  for (const [name, mutate] of [
    ["global counts", value => { value.global.counts.questions += 1; }],
    ["global interactions", value => { value.global.interactions.choice_single += 1; }],
    ["track counts", value => { value.tracks[0].counts.questions += 1; }],
    ["track interactions", value => { value.tracks[0].interactions.choice_single += 1; }],
    ["envelope counts", value => { value.envelopeCounts[Object.keys(value.envelopeCounts)[0]] += 1; }]
  ]) {
    const changed = structuredClone(manifest);
    mutate(changed);
    await t.test(name, () => rejectsBoth(manifestPath, JSON.stringify(changed), "EVIDENCE_VALUE"));
  }

  const changedHash = structuredClone(rows);
  changedHash[0].projectionSha256 = "0".repeat(64);
  for (const [name, relativePath, bytes, code] of [
    ["changedhash evidence row", rowsPath, JSON.stringify(changedHash), "HASH_MISMATCH"],
    ["corrupt manifest JSON", manifestPath, "{", "INVALID_JSON"],
    ["canonical question order", sourcePath, JSON.stringify([...source].reverse()), "CANONICAL_ORDER"]
  ]) {
    await t.test(name, () => rejectsBoth(relativePath, bytes, code));
  }
  assert.deepEqual(await readFile(path.join(fixtureRoot, manifestPath)), originalManifest);
  assert.deepEqual(await readFile(path.join(fixtureRoot, rowsPath)), originalRows);
});
