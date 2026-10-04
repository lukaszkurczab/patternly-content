import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { sha256 } from "../scripts/build.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";
import { restoreOodSource21Fixture } from "./ood-cohort16-historical-fixture.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(repositoryRoot, "content");
const trackId = "object-oriented-design-interview";
const version = "object-oriented-design-interview-authoring-v2026.10.04-bizq01-21";
const proofPath = "evidence/business-quality/bizq-01-ood-node-closure-21.json";
const sourceDirectory = "content/object-oriented-design-interview/object_creation_configuration_and_structural_patterns";
const requiredProofs = [
  proofPath,
  "evidence/business-quality/bizq-01-ood-node-closure-20.json",
  "evidence/business-quality/bizq-01-ood-reason-amendment-19a.json",
  "evidence/business-quality/bizq-01-ood-node-closure-19.json",
  "evidence/business-quality/bizq-01-ood-node-closure-17.json",
  "evidence/business-quality/bizq-01-ood-node-closure-16.json",
  "evidence/business-quality/bizq-01-ood-unit-cohort-13.json",
  "evidence/business-quality/bizq-01-ood-source-12.json",
  "evidence/business-quality/bizq-01-ood-source-11.json"
];
let fixtureRoot;

async function copyProofs(destination) {
  await mkdir(path.join(destination, "evidence/business-quality"), { recursive: true });
  for (const name of [
    "bizq-01-besd-slice-01.json",
    "bizq-01-besd-seed-cohort-14.json",
    "bizq-01-coding-source-copy-04.json",
    "bizq-01-ood-source-11.json",
    "bizq-01-ood-source-12.json",
    "bizq-01-ood-unit-cohort-13.json",
    "bizq-01-ood-node-closure-16.json",
    "bizq-01-ood-node-closure-17.json",
    "bizq-01-ood-node-closure-19.json",
    "bizq-01-ood-reason-amendment-19a.json",
    "bizq-01-ood-node-closure-20.json",
    "bizq-01-ood-node-closure-21.json",
    "bizq-01-ood-node-closure-22.json"
  ]) {
    await cp(path.join(repositoryRoot, "evidence/business-quality", name), path.join(destination, "evidence/business-quality", name));
  }
  await cp(path.join(repositoryRoot, "evidence/canonical-content-approvals"), path.join(destination, "evidence/canonical-content-approvals"), { recursive: true });
}

async function withJsonMutation(relativePath, mutate, action) {
  const target = path.join(fixtureRoot, relativePath);
  const original = await readFile(target);
  try {
    await writeFile(target, `${JSON.stringify(mutate(JSON.parse(original.toString("utf8"))))}\n`, "utf8");
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
  fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "bizq01-ood-closure-21-")));
  await cp(contentRoot, path.join(fixtureRoot, "content"), { recursive: true });
  await copyProofs(fixtureRoot);
  await restoreOodSource21Fixture(repositoryRoot, fixtureRoot);
});

after(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

test("accepts the fixed N05 same-ID package and reconstructs 20→19a→19→17→16→13→12→11", async () => {
  const proofBytes = await readFile(path.join(repositoryRoot, proofPath));
  const proof = JSON.parse(proofBytes.toString("utf8"));
  assert.equal(sha256(proofBytes), "4a216a75e8fbce5bb88e828d8dce420ffd1fbb349cc176af07fd5924492bc56f");
  assert.equal(proof.contentVersion, version);
  assert.equal(proof.replacements.length, 0);
  assert.equal(proof.sameIdCorrections.length, 153);

  const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  assert.equal(result.result, "passed");
  assert.equal(result.counts.questions, 16077);
  assert.equal(result.historicalCounts.questions, 16041);
  assert.equal(result.semanticReplacementProof.replacements.length, 594);
  assert.equal(result.sameIdCorrectionProof.questionIds.length, 171);
  assert.deepEqual(result.sameIdCorrectionProof.questionIds.slice(-153), proof.sameIdCorrections.map(({ questionId }) => questionId));
  assert.equal(result.reasonAmendmentProof.questionIds.length, 25);
  assert.equal(result.tracks.find((track) => track.trackId === trackId).currentCounts.questions, 1413);

  let scoredCases = 0;
  for (const source of proof.sourceFiles) {
    const bytes = await readFile(path.join(fixtureRoot, source.sourceFile));
    assert.equal(sha256(bytes), source.sourceSha256, `${source.mentalUnitId} exact raw source hash`);
    const questions = JSON.parse(bytes.toString("utf8"));
    assert.equal(questions.length, 17, source.mentalUnitId);
    const expected = proof.sameIdCorrections.filter((item) => item.sourceFile === source.sourceFile).map((item) => item.questionId);
    assert.deepEqual(questions.map(({ questionId }) => questionId), expected, `${source.mentalUnitId} fixed source membership`);
    for (const question of questions) {
      assert.equal(validateQuestion(question).valid, true, question.questionId);
      assert.equal(question.answer.optionId, proof.sameIdCorrections.find((item) => item.questionId === question.questionId).acceptedOptionId);
      const optionIds = question.interaction.options.map(({ optionId }) => optionId);
      assert.equal(optionIds.length, 4, question.questionId);
      assert.equal(new Set(optionIds).size, optionIds.length, question.questionId);
      const expectedWrong = optionIds.filter((optionId) => optionId !== question.answer.optionId).sort();
      assert.deepEqual(question.feedback.messages.filter((message) => message.kind === "wrong_option").map(({ targetId }) => targetId).sort(), expectedWrong, question.questionId);
      assert.equal(question.feedback.messages.some((message) => message.targetId === question.answer.optionId), false, question.questionId);
      for (const optionId of optionIds) {
        const accepted = optionId === question.answer.optionId;
        for (const candidate of [question, { ...question, interaction: { ...question.interaction, options: [...question.interaction.options].reverse() } }]) {
          const scored = scoreQuestion(candidate, { type: "choice_single", optionId });
          assert.equal(scored.status, accepted ? "correct" : "incorrect", `${question.questionId}/${optionId}`);
          assert.equal(scored.earnedPoints, accepted ? 1 : 0, `${question.questionId}/${optionId}`);
          scoredCases += 1;
        }
      }
    }
  }
  assert.equal(scoredCases, 1224);
});

test("requires every fixed proof in the source21 predecessor chain", async () => {
  for (const relativePath of requiredProofs) {
    const target = path.join(fixtureRoot, relativePath);
    const original = await readFile(target);
    try {
      await rm(target);
      await assertRejected("EVIDENCE_MEMBERSHIP");
    } finally {
      await writeFile(target, original);
    }
  }
});

test("rejects tampered proof identity, objects, membership, source hashes, and accepted keys", async () => {
  const cases = [
    ["extra field", (proof) => { proof.extra = true; }],
    ["before object", (proof) => { proof.sameIdCorrections[0].beforeQuestion.prompt += " changed"; }],
    ["current object", (proof) => { proof.sameIdCorrections[0].currentQuestion.prompt += " changed"; }],
    ["missing item", (proof) => { proof.sameIdCorrections.pop(); }],
    ["duplicate item", (proof) => { proof.sameIdCorrections[1] = structuredClone(proof.sameIdCorrections[0]); }],
    ["changed question identity", (proof) => { proof.sameIdCorrections[0].questionId = "ood-n05-b01-i099"; }],
    ["wrong accepted option", (proof) => { proof.sameIdCorrections[0].acceptedOptionId = "n05b01_02_choice"; }],
    ["source hash", (proof) => { proof.sourceFiles[0].sourceSha256 = "0".repeat(64); }],
    ["source path", (proof) => { proof.sourceFiles[0].sourceFile = "../outside.json"; }]
  ];
  for (const [label, mutate] of cases) {
    await withJsonMutation(proofPath, (proof) => { mutate(proof); return proof; }, () => assertRejected("HASH_MISMATCH"));
  }
});

test("rejects current-source, catalog-version, and missing-v20-predecessor changes", async () => {
  const sourcePath = `${sourceDirectory}/OOD-N05-B01.json`;
  await withJsonMutation(sourcePath, (questions) => { questions.pop(); return questions; }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(sourcePath, (questions) => { questions[0].prompt += " changed"; return questions; }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation("content/catalog.json", (catalog) => {
    catalog.tracks.find((track) => track.trackId === trackId).contentVersion += "-wrong";
    return catalog;
  }, () => assertRejected("EVIDENCE_VALUE"));

  const predecessorPath = path.join(fixtureRoot, "evidence/business-quality/bizq-01-ood-node-closure-20.json");
  const predecessor = await readFile(predecessorPath);
  try {
    await rm(predecessorPath);
    await assertRejected("EVIDENCE_MEMBERSHIP");
  } finally {
    await writeFile(predecessorPath, predecessor);
  }
});

test("rejects symlink substitution for fixed proof and source paths", async () => {
  const sourcePath = `${sourceDirectory}/OOD-N05-B01.json`;
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
