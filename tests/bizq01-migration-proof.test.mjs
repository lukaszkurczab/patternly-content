import assert from "node:assert/strict";
import { mkdtemp, readFile, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import { createCanonicalFixture } from "./helpers/simp03-canonical-fixture.mjs";
import { copyCurrentMigrationFixture } from "./helpers/current-migration-fixture.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";

const contentRepositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendTrack = "backend-system-design-interview";
const proofRelativePath = "evidence/business-quality/bizq-01-besd-slice-01.json";
const cohort14ProofPath = "evidence/business-quality/bizq-01-besd-seed-cohort-14.json";
const oodReasonAmendment19aProofPath = "evidence/business-quality/bizq-01-ood-reason-amendment-19a.json";
const oldSourcePath = "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json";
const newQuestionId = "besd-n02-b01-i017";

let fixtureRoot;
let fixtureParent;
let noProofFixture;
let noProofFixtureParent;

async function writeJsonAt(root, relativePath, value) {
  await writeFile(path.join(root, relativePath), `${JSON.stringify(value)}\n`, "utf8");
}

async function withJsonMutation(relativePath, mutate, action) {
  const target = path.join(fixtureRoot, relativePath);
  const original = await readFile(target);
  try {
    const value = JSON.parse(original.toString("utf8"));
    await writeJsonAt(fixtureRoot, relativePath, mutate(value));
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
  fixtureParent = await realpath(await mkdtemp(path.join(os.tmpdir(), "bizq01-migration-proof-")));
  fixtureRoot = path.join(fixtureParent, "repo");
  await copyCurrentMigrationFixture(contentRepositoryRoot, fixtureRoot);
  noProofFixture = await createCanonicalFixture("bizq01-no-proof-");
  noProofFixtureParent = noProofFixture.parent;
});

after(async () => {
  await rm(fixtureParent, { recursive: true, force: true });
  await rm(noProofFixtureParent, { recursive: true, force: true });
});

test("accepts the real BIZQ-01 replacement proof while preserving current and historical counts", async () => {
  const result = await verifyMigration({ contentRoot: path.join(contentRepositoryRoot, "content") });
  assert.equal(result.result, "passed");
  assert.deepEqual(result.counts, { tracks: 9, nodes: 117, mentalUnits: 943, questions: 16622 });
  assert.deepEqual(result.historicalCounts, { tracks: 9, nodes: 117, mentalUnits: 932, questions: 16041 });
  assert.equal(result.approvedAdditionCount, 36);
  const claude = result.tracks.find(({ trackId }) => trackId === "claude-certified-architect-professional-certification");
  assert.equal(claude.historicalCounts.questions, 300);
  assert.equal(claude.currentCounts.questions, 845);
  assert.equal(Object.values(claude.historicalInteractions).reduce((sum, count) => sum + count, 0), 300);
  const cohort14 = JSON.parse(await readFile(path.join(contentRepositoryRoot, cohort14ProofPath), "utf8"));
  assert.deepEqual(result.replacementProof.replacements, [
    { beforeQuestionId: "besd-n02-b01-i002", questionId: "besd-n02-b01-i017" },
    { beforeQuestionId: "besd-n04-b01-i002", questionId: "besd-n04-b01-i019" },
    ...cohort14.replacements.map(({ beforeQuestionId, questionId }) => ({ beforeQuestionId, questionId }))
  ]);
  assert.equal(result.replacementProof.replacements.length, 34);
});

test("rejects a changed frozen Claude predecessor object", async () => {
  const baselinePath = "evidence/canonical-content-approvals/claude-20261007-historical-questions.json";
  await withJsonMutation(baselinePath, (baseline) => {
    baseline.questions[0].prompt += " changed";
    return baseline;
  }, () => assertRejected("HASH_MISMATCH"));
});

test("rejects a changed Claude item from the exact accepted current bank", async () => {
  const currentRelativePath = "content/claude-certified-architect-professional-certification/solution_design_and_architecture/CCARP-D01-O01.json";
  await withJsonMutation(currentRelativePath, (questions) => {
    questions[0].prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));
});

test("rejects a synthetic bank without the fixed accepted producer proofs", async () => {
  await assert.rejects(verifyMigration({ contentRoot: noProofFixture.root }), (error) => {
    assert.ok(error instanceof MigrationVerificationError);
    assert.equal(error.code, "HASH_MISMATCH");
    return true;
  });
});

test("rejects changes to a current replacement and its frozen old object", async () => {
  const currentRelativePath = "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json";
  await withJsonMutation(currentRelativePath, (questions) => {
    questions.find((question) => question.questionId === newQuestionId).prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));

  await withJsonMutation(proofRelativePath, (proof) => {
    proof.items[0].beforeQuestion.prompt += " changed";
    return proof;
  }, () => assertRejected("HASH_MISMATCH"));
});

test("requires and binds the fixed 19a reason-only amendment proof", async () => {
  const proofFile = path.join(fixtureRoot, oodReasonAmendment19aProofPath);
  const original = await readFile(proofFile);
  try {
    await rm(proofFile);
    await assertRejected("EVIDENCE_MEMBERSHIP");
  } finally {
    await writeFile(proofFile, original);
  }
  await withJsonMutation(oodReasonAmendment19aProofPath, (proof) => {
    proof.replacements[0].reason += " changed";
    return proof;
  }, () => assertRejected("HASH_MISMATCH"));
});

test("binds 19a to exact IDs, before/current Reasons, hashes, and closed membership", async () => {
  const cases = [
    ["before Reason", (proof) => { proof.replacements[0].beforeReason += " changed"; }],
    ["current Reason", (proof) => { proof.replacements[0].reason += " changed"; }],
    ["predecessor object hash", (proof) => { proof.replacements[0].beforeQuestionSha256 = "0".repeat(64); }],
    ["current object hash", (proof) => { proof.replacements[0].questionSha256 = "0".repeat(64); }],
    ["current version", (proof) => { proof.contentVersion += "-stale"; }],
    ["source path", (proof) => { proof.sourceFiles[0].sourceFile = "../outside.json"; }],
    ["duplicate ID", (proof) => { proof.replacements[1] = structuredClone(proof.replacements[0]); }],
    ["missing ID", (proof) => { proof.replacements.pop(); }],
    ["extra ID", (proof) => { proof.replacements.push(structuredClone(proof.replacements[0])); }],
    ["out-of-scope ID", (proof) => { proof.replacements[0].questionId = "ood-n03-b02-i999"; }]
  ];
  for (const [label, mutate] of cases) {
    await withJsonMutation(oodReasonAmendment19aProofPath, (proof) => { mutate(proof); return proof; }, () =>
      assert.rejects(verifyMigration({ contentRoot: path.join(fixtureRoot, "content") }), (error) => {
        assert.ok(error instanceof MigrationVerificationError, label);
        assert.equal(error.code, "HASH_MISMATCH", label);
        return true;
      })
    );
  }
});

test("rejects every non-Reason edit in an amended source object", async () => {
  const proof = JSON.parse(await readFile(path.join(fixtureRoot, oodReasonAmendment19aProofPath), "utf8"));
  const changed = proof.replacements[0];
  const sourcePath = changed.sourceFile;
  const cases = [
    ["prompt", "HASH_MISMATCH", (question) => { question.prompt += " changed"; }],
    ["answer", "HASH_MISMATCH", (question) => { question.answer.optionId = question.interaction.options[1].optionId; }],
    ["option text", "HASH_MISMATCH", (question) => { question.interaction.options[0].text += " changed"; }],
    ["Details", "HASH_MISMATCH", (question) => { question.feedback.details.mechanismOrProperty += " changed"; }],
    ["feedback message", "HASH_MISMATCH", (question) => { question.feedback.messages[0].text += " changed"; }],
    ["scoring contract", "CANONICAL_INVALID", (question) => { question.interaction.scoringMethod = "different"; }],
    ["taxonomy", "CANONICAL_MEMBERSHIP", (question) => { question.mentalUnitId = "OOD-N03-B09"; }],
    ["Reason", "HASH_MISMATCH", (question) => { question.feedback.reason += " changed"; }]
  ];
  for (const [label, expectedCode, mutate] of cases) {
    await withJsonMutation(sourcePath, (questions) => {
      mutate(questions.find((question) => question.questionId === changed.questionId));
      return questions;
    }, () => assert.rejects(verifyMigration({ contentRoot: path.join(fixtureRoot, "content") }), (error) => {
      assert.ok(error instanceof MigrationVerificationError, label);
      assert.equal(error.code, expectedCode, label);
      return true;
    }));
  }
});

test("accepts a policy-only OOD version change and rejects symlink substitution for the 19a proof and source", async () => {
  await withJsonMutation("content/catalog.json", (catalog) => {
    catalog.tracks.find((track) => track.trackId === "object-oriented-design-interview").contentVersion += "-stale";
    return catalog;
  }, async () => {
    const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
    assert.equal(result.result, "passed");
  });

  for (const relativePath of [oodReasonAmendment19aProofPath, JSON.parse(await readFile(path.join(fixtureRoot, oodReasonAmendment19aProofPath), "utf8")).sourceFiles[0].sourceFile]) {
    const target = path.join(fixtureRoot, relativePath);
    const backup = `${target}.held`;
    await rename(target, backup);
    try {
      await symlink(path.basename(backup), target);
      await assertRejected("SYMLINK_PATH");
    } finally {
      await rm(target, { force: true });
      await rename(backup, target);
    }
  }
});

test("accepts a policy-only BESD version change and rejects stale proof identity, duplicate mappings, and missing replacement", async () => {
  await withJsonMutation("content/catalog.json", (catalog) => {
    catalog.tracks.find((track) => track.trackId === backendTrack).contentVersion = "stale-version";
    return catalog;
  }, async () => {
    const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
    assert.equal(result.result, "passed");
  });

  await withJsonMutation(proofRelativePath, (proof) => {
    proof.questionSetSha256 = "0".repeat(64);
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));

  await withJsonMutation(proofRelativePath, (proof) => {
    proof.items[1] = structuredClone(proof.items[0]);
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));

  await withJsonMutation(oldSourcePath, (questions) => questions.filter((question) => question.questionId !== newQuestionId),
    () => assertRejected("HASH_MISMATCH"));
});

test("rejects changes to an unrelated item in the proven current track", async () => {
  const relativePath = "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json";
  await withJsonMutation(relativePath, (questions) => {
    questions.find((question) => question.questionId === "besd-n02-b01-i017").prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));
});

const wordingProofPath = "evidence/business-quality/bizq-01-coding-source-copy-04.json";
const wordingSourcePath = "content/coding-interview-dsa-problem-solving/contrast_binary_search_vs_linear_scan/correctness_before_asymptotic_speed.json";
const wordingQuestionId = "alg-contrast-binary-scan-correctness-006";

test("accepts only the real same-ID Coding wording correction alongside the unchanged BESD proof", async () => {
  const result = await verifyMigration({ contentRoot: path.join(contentRepositoryRoot, "content") });
  assert.deepEqual(result.wordingCorrectionProof, { trackId: "coding-interview-dsa-problem-solving", questionIds: [wordingQuestionId] });
  assert.equal(result.replacementProof.replacements.length, 34);
  assert.equal(result.counts.questions, 16622);
  assert.equal(result.historicalCounts.questions, 16041);
});

test("rejects the same-ID correction without its proof and rejects tampered frozen old objects", async () => {
  const target = path.join(fixtureRoot, wordingProofPath), bytes = await readFile(target);
  try {
    await rm(target);
    await assertRejected("HASH_MISMATCH");
  } finally { await writeFile(target, bytes); }
  await withJsonMutation(wordingProofPath, (proof) => {
    proof.beforeQuestion.feedback.reason += " changed";
    return proof;
  }, () => assertRejected("HASH_MISMATCH"));
});

test("rejects unapproved wording, answer, options, feedback and taxonomy changes in the corrected source", async () => {
  for (const mutate of [
    (question) => { question.prompt += " changed"; },
    (question) => { question.answer.optionId = "sort_binary"; },
    (question) => { question.interaction.options[0].text += " changed"; },
    (question) => { question.feedback.reason += " changed"; },
    (question) => { question.feedback.messages[0].text += " changed"; },
    (question) => { question.feedback.details.blocks[4].text += " changed"; },
  ]) await withJsonMutation(wordingSourcePath, (questions) => {
    mutate(questions.find((question) => question.questionId === wordingQuestionId));
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(wordingProofPath, (proof) => {
    proof.mentalUnitId = "other_unit"; return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
});

test("accepts a policy-only Coding version and rejects proof identity/hashes/source location and unexpected fields", async () => {
  await withJsonMutation("content/catalog.json", (catalog) => {
    catalog.tracks.find((track) => track.trackId === "coding-interview-dsa-problem-solving").contentVersion = "stale-version";
    return catalog;
  }, async () => assert.equal((await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })).result, "passed"));
  await withJsonMutation(wordingProofPath, (proof) => { proof.contentVersion += "-stale"; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  for (const field of ["questionSetSha256", "sourceSha256", "beforeSourceSha256", "sourceFile", "questionId"]) {
    await withJsonMutation(wordingProofPath, (proof) => { proof[field] = "unapproved"; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  }
  await withJsonMutation(wordingProofPath, (proof) => {
    proof.wording.detailsParagraph3 += " changed"; return proof;
  }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(wordingProofPath, (proof) => {
    proof.wording.extraText = "unexpected"; return proof;
  }, () => assertRejected("EVIDENCE_SHAPE"));
});

test("rejects a corrected source moved away from its canonical mental-unit filename", async () => {
  const original = path.join(fixtureRoot, wordingSourcePath);
  const moved = path.join(path.dirname(original), "unapproved_location.json");
  await rename(original, moved);
  try { await assertRejected("CANONICAL_MEMBERSHIP"); }
  finally { await rename(moved, original); }
});

test("rejects unreviewed primary-source pages even under the same publisher domain", async () => {
  await withJsonMutation(wordingProofPath, (proof) => {
    proof.sources[0] = "https://algs4.cs.princeton.edu/code/javadoc/edu/princeton/cs/algs4/Unrelated.html";
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
});
