import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(repositoryRoot, "content");
const proofPath = "evidence/business-quality/bizq-01-besd-seed-cohort-14.json";
const sourcePaths = [
  "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json",
  "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json"
];
let fixtureRoot;
let fixtureParent;

async function withJsonMutation(relativePath, mutate, action) {
  const target = path.join(fixtureRoot, relativePath);
  const original = await readFile(target);
  try {
    const value = JSON.parse(original.toString("utf8"));
    await writeFile(target, `${JSON.stringify(mutate(value))}\n`, "utf8");
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
  fixtureParent = await realpath(await mkdtemp(path.join(os.tmpdir(), "bizq01-besd-cohort-14-")));
  fixtureRoot = path.join(fixtureParent, "repo");
  await cp(path.join(repositoryRoot, "content"), path.join(fixtureRoot, "content"), { recursive: true });
  await mkdir(path.join(fixtureRoot, "evidence", "business-quality"), { recursive: true });
  for (const name of [
    "bizq-01-besd-slice-01.json",
    "bizq-01-besd-seed-cohort-14.json",
    "bizq-01-coding-source-copy-04.json",
    "bizq-01-ood-source-11.json",
    "bizq-01-ood-source-12.json",
    "bizq-01-ood-unit-cohort-13.json",
    "bizq-01-ood-node-closure-16.json",
    "bizq-01-ood-node-closure-17.json",
    "bizq-01-ood-node-closure-19.json"
  ]) {
    await cp(path.join(repositoryRoot, "evidence/business-quality", name), path.join(fixtureRoot, "evidence/business-quality", name));
  }
  await cp(path.join(repositoryRoot, "evidence/canonical-content-approvals"), path.join(fixtureRoot, "evidence/canonical-content-approvals"), { recursive: true });
});

after(async () => {
  await rm(fixtureParent, { recursive: true, force: true });
});

test("accepts the fixed two-unit cohort and source01 predecessor chain", async () => {
  const result = await verifyMigration({ contentRoot });
  const cohort = JSON.parse(await readFile(path.join(repositoryRoot, proofPath), "utf8"));
  assert.equal(result.result, "passed");
  assert.equal(cohort.replacements.length, 32);
  assert.equal(result.replacementProof.replacements.length, 34);
  assert.deepEqual(result.replacementProof.replacements.slice(2), cohort.replacements.map(({ beforeQuestionId, questionId }) => ({ beforeQuestionId, questionId })));
});

test("requires both the new fixed proof and unchanged source01 proof", async () => {
  const cohortFile = path.join(fixtureRoot, proofPath);
  const cohortBytes = await readFile(cohortFile);
  try {
    await rm(cohortFile);
    await assertRejected("EVIDENCE_MEMBERSHIP");
  } finally { await writeFile(cohortFile, cohortBytes); }

  const oldFile = path.join(fixtureRoot, "evidence/business-quality/bizq-01-besd-slice-01.json");
  const oldBytes = await readFile(oldFile);
  try {
    await rm(oldFile);
    await assertRejected("EVIDENCE_MEMBERSHIP");
  } finally { await writeFile(oldFile, oldBytes); }
});

test("rejects changed current source items, old/current proof objects, source bytes, and versions", async () => {
  await withJsonMutation(sourcePaths[0], (questions) => {
    questions.find((question) => question.questionId === "besd-n02-b01-i018").prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));

  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[0].beforeQuestion.prompt += " changed";
    return proof;
  }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[0].currentQuestion.prompt += " changed";
    return proof;
  }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[0].sourceSha256 = "0".repeat(64);
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation("content/catalog.json", (catalog) => {
    catalog.tracks.find((track) => track.trackId === "backend-system-design-interview").contentVersion = "stale-version";
    return catalog;
  }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[0].identityAction = "keep_question_id";
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[0].questionId = "besd-n02-b01-i099";
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[0].sourceFile = "../outside/BESD-N02-B01.json";
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
});

test("rejects missing, duplicate, extra and unrelated replacement/source membership", async () => {
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements.pop();
    return proof;
  }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[1] = structuredClone(proof.replacements[0]);
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements.push(structuredClone(proof.replacements[0]));
    return proof;
  }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(sourcePaths[1], (questions) => {
    const extra = structuredClone(questions[0]);
    extra.questionId = "besd-n04-b01-i099";
    questions.push(extra);
    return questions.sort((left, right) => left.questionId.localeCompare(right.questionId));
  }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(proofPath, (proof) => {
    proof.unexpected = true;
    return proof;
  }, () => assertRejected("EVIDENCE_SHAPE"));
});

test("rejects canonical source moved behind a symlink", async () => {
  const source = path.join(fixtureRoot, sourcePaths[0]);
  const moved = `${source}.moved`;
  await rename(source, moved);
  await symlink(moved, source);
  try { await assertRejected("SYMLINK_PATH"); }
  finally {
    await rm(source);
    await rename(moved, source);
  }
});
