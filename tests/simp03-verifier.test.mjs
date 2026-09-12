import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, realpath, rm, symlink, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import {
  ACCEPTED_TRACK_IDS,
  copyCanonicalFixture,
  createCanonicalFixture
} from "./helpers/simp03-canonical-fixture.mjs";
import {
  MigrationVerificationError,
  verifyMigration
} from "../scripts/content/verify-migration.mjs";

let fixture;

async function withFixture(callback) {
  const parent = await realpath(await mkdtemp(path.join(os.tmpdir(), "simp03-verifier-copy-")));
  const root = path.join(parent, "content");
  await copyCanonicalFixture(fixture.root, root);
  try {
    return await callback(root);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
}

async function assertRejected(code, action) {
  await assert.rejects(action, (error) => {
    assert.ok(error instanceof MigrationVerificationError);
    assert.equal(error.code, code);
    return true;
  });
}

before(async () => {
  fixture = await createCanonicalFixture("simp03-verifier-fixture-");
});

after(async () => {
  await rm(fixture.parent, { recursive: true, force: true });
});

test("verifies the complete canonical tree and durable evidence without external inputs", async () => {
  const result = await verifyMigration({ contentRoot: fixture.root });
  assert.deepEqual(result.counts, { tracks: 9, nodes: 117, mentalUnits: 932, questions: 16041 });
  assert.deepEqual(result.interactions, { choice_multiple: 440, choice_single: 13859, complexity: 279, decision_matrix: 147, ordering: 1316 });
  assert.equal(result.tracks.length, 9);
});

test("rejects canonical question tampering without changing evidence", async () => {
  await withFixture(async (fixtureRoot) => {
    const questionPath = path.join(fixtureRoot, ACCEPTED_TRACK_IDS[0], "node-001", "mu-001.json");
    const questions = JSON.parse(await readFile(questionPath, "utf8"));
    questions[0].prompt += " tampered";
    await writeFile(questionPath, JSON.stringify(questions), "utf8");
    await assertRejected("HASH_MISMATCH", verifyMigration({ contentRoot: fixtureRoot }));
  });
});

test("rejects evidence hash tampering and missing membership", async () => {
  await withFixture(async (fixtureRoot) => {
    const evidencePath = path.join(fixtureRoot, "migration-evidence", "items", `${ACCEPTED_TRACK_IDS[0]}.json`);
    const original = await readFile(evidencePath);
    const rows = JSON.parse(original.toString("utf8"));
    rows[0].projectionSha256 = "0".repeat(64);
    await writeFile(evidencePath, JSON.stringify(rows), "utf8");
    await assertRejected("HASH_MISMATCH", verifyMigration({ contentRoot: fixtureRoot }));

    await writeFile(evidencePath, original);
    const missing = JSON.parse(original.toString("utf8"));
    missing.pop();
    await writeFile(evidencePath, JSON.stringify(missing), "utf8");
    await assertRejected("EVIDENCE_MEMBERSHIP", verifyMigration({ contentRoot: fixtureRoot }));
  });
});

test("rejects symlinked canonical paths before following them", async () => {
  await withFixture(async (fixtureRoot) => {
    const catalogPath = path.join(fixtureRoot, "catalog.json");
    await rm(catalogPath);
    await symlink(path.join(fixture.root, "catalog.json"), catalogPath);
    await assertRejected("SYMLINK_PATH", verifyMigration({ contentRoot: fixtureRoot }));
  });
});

test("rejects a content root reached through a symlinked ancestor", async () => {
  const parent = await realpath(await mkdtemp(path.join(os.tmpdir(), "simp03-verifier-ancestor-")));
  const nested = path.join(parent, "content");
  const alias = path.join(parent, "ancestor-alias");
  await cp(fixture.root, nested, { recursive: true });
  await symlink(parent, alias);
  try {
    await assertRejected("SYMLINK_PATH", verifyMigration({ contentRoot: path.join(alias, "content") }));
  } finally {
    await unlink(alias);
    await rm(parent, { recursive: true, force: true });
  }
});

test("has no dependency on ephemeral output or the migration writer", async () => {
  const source = await readFile(fileURLToPath(import.meta.url), "utf8");
  const ephemeralOutputToken = [".simp03", "staging"].join("-");
  const writerImportToken = ["scripts", "migration"].join("/");
  const oldFixtureExpression = ["path.resolve(\".simp03", "-staging/content\")"].join("");
  const oldFixtureVariable = ["VERIFIED_CONTENT", "_TEMPLATE"].join("");
  assert.equal(source.includes(ephemeralOutputToken), false);
  assert.equal(source.includes(writerImportToken), false);
  assert.equal(source.includes(oldFixtureExpression), false);
  assert.equal(source.includes(oldFixtureVariable), false);
});
