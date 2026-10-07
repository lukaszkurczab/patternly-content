import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, symlink, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import {
  MigrationVerificationError,
  verifyMigration
} from "../scripts/content/verify-migration.mjs";
import { copyCurrentMigrationFixture } from "./helpers/current-migration-fixture.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let fixtureRoot;
let fixtureParent;
let claudeQuestionPath;

async function assertRejectedAny(codes, action) {
  await assert.rejects(action, (error) => {
    assert.ok(error instanceof MigrationVerificationError);
    assert.ok(codes.includes(error.code), `unexpected failure code ${error.code}`);
    return true;
  });
}

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

async function withCurrentQuestionMutation(mutate, action) {
  await withJsonMutation(claudeQuestionPath, mutate, action);
}

before(async () => {
  fixtureParent = await realpath(await mkdtemp(path.join(os.tmpdir(), "simp03-verifier-current-")));
  fixtureRoot = path.join(fixtureParent, "repo");
  await copyCurrentMigrationFixture(repositoryRoot, fixtureRoot);
  const claudeRoot = path.join(fixtureRoot, "content/claude-certified-architect-professional-certification");
  const nodeNames = await readdir(claudeRoot);
  for (const nodeName of nodeNames) {
    const nodeRoot = path.join(claudeRoot, nodeName);
    const entries = await readdir(nodeRoot);
    if (entries.length > 0) {
      claudeQuestionPath = path.relative(fixtureRoot, path.join(nodeRoot, entries[0]));
      break;
    }
  }
});

after(async () => {
  await rm(fixtureParent, { recursive: true, force: true });
});

test("verifies the current -bizq02-v2 package banks against immutable producer evidence", async () => {
  const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  assert.deepEqual(result.counts, { tracks: 9, nodes: 117, mentalUnits: 943, questions: 16622 });
  assert.deepEqual(result.historicalCounts, { tracks: 9, nodes: 117, mentalUnits: 932, questions: 16041 });
  assert.equal(result.tracks.length, 9);
  assert.equal(result.tracks.find(({ trackId }) => trackId === "claude-certified-architect-professional-certification").currentCounts.questions, 845);
});

test("accepts package policy version changes only while each fixed current bank remains exact", async () => {
  await withJsonMutation("content/catalog.json", (catalog) => {
    for (const track of catalog.tracks) {
      if ([
        "aws-certified-solutions-architect-associate",
        "backend-system-design-interview",
        "claude-certified-architect-professional-certification",
        "coding-interview-dsa-problem-solving",
        "object-oriented-design-interview"
      ].includes(track.trackId)) track.contentVersion += "-policy-fixture";
    }
    return catalog;
  }, async () => {
    const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
    assert.equal(result.result, "passed");
  });
});

test("rejects current prompt, ID, count, node, unit, and path drift", async () => {
  await withCurrentQuestionMutation((questions) => {
    questions[0].prompt += " changed";
    return questions;
  }, () => assertRejectedAny(["HASH_MISMATCH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));

  await withCurrentQuestionMutation((questions) => {
    questions[0].questionId += "-changed";
    return questions;
  }, () => assertRejectedAny(["CANONICAL_ORDER", "CANONICAL_MEMBERSHIP", "HASH_MISMATCH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));

  await withCurrentQuestionMutation((questions) => {
    questions.pop();
    return questions;
  }, () => assertRejectedAny(["EVIDENCE_VALUE", "HASH_MISMATCH", "CANONICAL_MEMBERSHIP"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));

  for (const field of ["nodeId", "mentalUnitId"]) {
    await withCurrentQuestionMutation((questions) => {
      questions[0][field] += "-changed";
      return questions;
    }, () => assertRejectedAny(["CANONICAL_MEMBERSHIP", "HASH_MISMATCH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));
  }

  const absolutePath = path.join(fixtureRoot, claudeQuestionPath);
  const movedPath = `${absolutePath}.moved`;
  await rename(absolutePath, movedPath);
  try {
    await assertRejectedAny(["UNSAFE_PATH", "MISSING_PATH", "CANONICAL_MEMBERSHIP"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") }));
  } finally {
    await rename(movedPath, absolutePath);
  }
});

test("rejects mutation of the frozen Claude historical question proof", async () => {
  await withJsonMutation("evidence/canonical-content-approvals/claude-20261007-historical-questions.json", (baseline) => {
    baseline.questions[0].prompt += " changed";
    return baseline;
  }, () => assertRejectedAny(["HASH_MISMATCH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));
});

test("rejects the historical 300-question bank even when its package version has a new suffix", async () => {
  const trackId = "claude-certified-architect-professional-certification";
  const trackRoot = path.join(fixtureRoot, "content", trackId);
  const backupRoot = path.join(fixtureRoot, "claude-current-backup");
  await rename(trackRoot, backupRoot);
  try {
    const baselinePath = path.join(fixtureRoot, "evidence/canonical-content-approvals/claude-20261007-historical-questions.json");
    const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
    const questionsByUnit = new Map();
    for (const question of baseline.questions) {
      const key = `${question.nodeId}/${question.mentalUnitId}`;
      questionsByUnit.set(key, [...(questionsByUnit.get(key) ?? []), question]);
    }
    for (const [unitPath, questions] of questionsByUnit) {
      const target = path.join(trackRoot, `${unitPath}.json`);
      await mkdir(path.dirname(target), { recursive: true });
      questions.sort((left, right) => left.questionId < right.questionId ? -1 : left.questionId > right.questionId ? 1 : 0);
      await writeFile(target, `${JSON.stringify(questions)}\n`, "utf8");
    }
    await withJsonMutation("content/catalog.json", (catalog) => {
      catalog.tracks.find((track) => track.trackId === trackId).contentVersion = "ccarp-2026.09.03-policy-fixture";
      return catalog;
    }, () => assertRejectedAny(["EVIDENCE_VALUE", "HASH_MISMATCH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));
  } finally {
    await rm(trackRoot, { recursive: true, force: true });
    await rename(backupRoot, trackRoot);
  }
});

test("rejects the old 2,568-question AWS bank under a new package suffix", async () => {
  const trackId = "aws-certified-solutions-architect-associate";
  const trackRoot = path.join(fixtureRoot, "content", trackId);
  const backupRoot = path.join(fixtureRoot, "aws-current-backup");
  await rename(trackRoot, backupRoot);
  try {
    await cp(backupRoot, trackRoot, { recursive: true });
    const approvalPath = path.join(fixtureRoot, "evidence/canonical-content-approvals/odk-096-aws-free-node-v1.json");
    const approval = JSON.parse(await readFile(approvalPath, "utf8"));
    const additions = new Set(approval.questionSet.newQuestionIds);
    let remainingCount = 0;
    for (const nodeName of await readdir(trackRoot)) {
      const nodeRoot = path.join(trackRoot, nodeName);
      for (const fileName of await readdir(nodeRoot)) {
        const target = path.join(nodeRoot, fileName);
        const questions = JSON.parse(await readFile(target, "utf8")).filter((question) => !additions.has(question.questionId));
        remainingCount += questions.length;
        if (questions.length === 0) await rm(target);
        else await writeFile(target, `${JSON.stringify(questions)}\n`, "utf8");
      }
      if ((await readdir(nodeRoot)).length === 0) await rm(nodeRoot, { recursive: true });
    }
    assert.equal(remainingCount, 2568);
    await withJsonMutation("content/catalog.json", (catalog) => {
      catalog.tracks.find((track) => track.trackId === trackId).contentVersion += "-policy-fixture";
      return catalog;
    }, () => assertRejectedAny(["HASH_MISMATCH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));
  } finally {
    await rm(trackRoot, { recursive: true, force: true });
    await rename(backupRoot, trackRoot);
  }
});

test("rejects ODK-096 approval question-count and full-bank hash drift", async () => {
  const approvalPath = "evidence/canonical-content-approvals/odk-096-aws-free-node-v1.json";
  await withJsonMutation(approvalPath, (approval) => {
    approval.canonicalIdentity.track.questionCount += 1;
    return approval;
  }, () => assertRejectedAny(["HASH_MISMATCH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));

  await withJsonMutation(approvalPath, (approval) => {
    approval.canonicalIdentity.track.sha256 = "0".repeat(64);
    return approval;
  }, () => assertRejectedAny(["HASH_MISMATCH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));
});

test("rejects the pre-correction Coding bank under a new package suffix", async () => {
  const questionPath = "content/coding-interview-dsa-problem-solving/contrast_binary_search_vs_linear_scan/correctness_before_asymptotic_speed.json";
  const correctionPath = path.join(fixtureRoot, "evidence/business-quality/bizq-01-coding-source-copy-04.json");
  const correction = JSON.parse(await readFile(correctionPath, "utf8"));
  await withJsonMutation(questionPath, (questions) => {
    const index = questions.findIndex((question) => question.questionId === correction.questionId);
    assert.notEqual(index, -1);
    questions[index] = correction.beforeQuestion;
    return questions;
  }, async () => {
    await withJsonMutation("content/catalog.json", (catalog) => {
      catalog.tracks.find((track) => track.trackId === "coding-interview-dsa-problem-solving").contentVersion += "-policy-fixture";
      return catalog;
    }, () => assertRejectedAny(["HASH_MISMATCH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));
  });
});

test("rejects migration evidence hash tampering and missing membership", async () => {
  const evidencePath = "content/migration-evidence/items/aws-certified-solutions-architect-associate.json";
  await withJsonMutation(evidencePath, (rows) => {
    rows[0].projectionSha256 = "0".repeat(64);
    return rows;
  }, () => assertRejectedAny(["HASH_MISMATCH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));

  await withJsonMutation(evidencePath, (rows) => {
    rows.pop();
    return rows;
  }, () => assertRejectedAny(["EVIDENCE_MEMBERSHIP", "HASH_MISMATCH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })));
});

test("rejects symlinked canonical paths before following them", async () => {
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const original = path.join(fixtureRoot, "content/catalog.json.original");
  await rename(catalogPath, original);
  await symlink(original, catalogPath);
  try {
    await assertRejectedAny(["SYMLINK_PATH"], verifyMigration({ contentRoot: path.join(fixtureRoot, "content") }));
  } finally {
    await unlink(catalogPath);
    await rename(original, catalogPath);
  }
});

test("rejects a content root reached through a symlinked ancestor", async () => {
  const alias = path.join(fixtureParent, "ancestor-alias");
  await symlink(fixtureParent, alias);
  try {
    await assertRejectedAny(["SYMLINK_PATH"], verifyMigration({ contentRoot: path.join(alias, "repo/content") }));
  } finally {
    await unlink(alias);
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
