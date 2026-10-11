import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import { sha256 } from "../scripts/build.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";
import { copyCurrentMigrationFixture } from "./helpers/current-migration-fixture.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proofPath = "evidence/business-quality/fesd-n08-20261011.json";
const sourcePath = "content/frontend-system-design-interview/accessibility_internationalization_responsive_and_input_design/FESD-N08-B01.json";
const predecessor = "0f4e6912d7d0cdb1a1c41b9d7885d7e867f80f34";
let fixtureRoot;

async function assertRejected(code) {
  await assert.rejects(verifyMigration({ contentRoot: path.join(fixtureRoot, "content") }), (error) => {
    assert.ok(error instanceof MigrationVerificationError);
    assert.equal(error.code, code);
    return true;
  });
}

before(async () => {
  fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "fesd-n08-migration-")));
  await copyCurrentMigrationFixture(repositoryRoot, fixtureRoot);
});

after(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

test("reconstructs the exact pre-N08 FESD bank without changing historical membership", async () => {
  const proofBytes = await readFile(path.join(repositoryRoot, proofPath));
  const proof = JSON.parse(proofBytes.toString("utf8"));
  assert.equal(sha256(proofBytes), "edc2e517adcbbf55a5aa1612868c3da7c1a83c653bb984de829a526a76ec2204");
  assert.equal(proof.replacements.length, 162);
  assert.equal(proof.sourceFiles.length, 8);
  assert.equal(proof.beforeProducerCommit, predecessor);
  const beforeByFile = new Map();
  for (const source of proof.sourceFiles) {
    const bytes = execFileSync("git", ["show", `${predecessor}:${source.sourceFile}`], { cwd: repositoryRoot, maxBuffer: 4 * 1024 * 1024 });
    assert.equal(sha256(bytes), source.beforeSourceSha256, source.sourceFile);
    beforeByFile.set(source.sourceFile, new Map(JSON.parse(bytes).map((question) => [question.questionId, question])));
  }
  for (const replacement of proof.replacements) {
    assert.deepEqual(replacement.beforeQuestion, beforeByFile.get(replacement.sourceFile).get(replacement.beforeQuestionId), replacement.beforeQuestionId);
  }

  const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  assert.equal(result.result, "passed");
  assert.equal(result.historicalCounts.questions, 16041);
  const fesd = result.tracks.find((track) => track.trackId === "frontend-system-design-interview");
  assert.equal(fesd.historicalCounts.questions, 1766);
  assert.equal(fesd.currentCounts.questions, 1766);
});

test("rejects proof/source tampering and missing proof", async () => {
  const localProofPath = path.join(fixtureRoot, proofPath);
  const originalProof = await readFile(localProofPath);
  try {
    await writeFile(localProofPath, Buffer.concat([originalProof, Buffer.from(" ")]));
    await assertRejected("HASH_MISMATCH");
  } finally {
    await writeFile(localProofPath, originalProof);
  }

  const localSourcePath = path.join(fixtureRoot, sourcePath);
  const originalSource = await readFile(localSourcePath);
  try {
    const questions = JSON.parse(originalSource.toString("utf8"));
    questions[0].prompt += " changed";
    await writeFile(localSourcePath, `${JSON.stringify(questions)}\n`, "utf8");
    await assertRejected("HASH_MISMATCH");
  } finally {
    await writeFile(localSourcePath, originalSource);
  }

  try {
    await rm(localProofPath);
    await assertRejected("EVIDENCE_MEMBERSHIP");
  } finally {
    await writeFile(localProofPath, originalProof);
  }
});

test("rejects symlink substitution for the fixed proof and canonical source", async () => {
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
