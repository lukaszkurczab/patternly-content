import assert from "node:assert/strict";
import { readFile, readdir, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { buildTrack, canonicalJson, sha256 } from "../scripts/build.mjs";
import { reconstructApprovedAwsPredecessor } from "../scripts/content/verify-migration.mjs";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proof = JSON.parse(await readFile(path.join(root, "evidence/business-quality/saa-20261010-aws-targeted-corrections.json"), "utf8"));
const sourceQuestions = [];
for (const node of await readdir(path.join(root, "content", proof.trackId), { withFileTypes: true })) {
  if (!node.isDirectory()) continue;
  for (const name of await readdir(path.join(root, "content", proof.trackId, node.name))) {
    if (name.endsWith(".json")) sourceQuestions.push(...JSON.parse(await readFile(path.join(root, "content", proof.trackId, node.name, name), "utf8")));
  }
}

test("the 28 exact AWS source corrections preserve scoring and reconstruct the immutable predecessor", async () => {
  assert.equal(proof.items.length, 28);
  assert.equal(new Set(proof.items.map(({ beforeQuestionId }) => beforeQuestionId)).size, 28);
  assert.equal(proof.items.filter(({ identityAction }) => identityAction === "preserve_question_id").length, 27);
  assert.deepEqual(proof.items.filter(({ identityAction }) => identityAction === "new_question_id").map(({ beforeQuestionId, questionId }) => [beforeQuestionId, questionId]), [
    ["aws-saa-c03-AWSSAA-N07-B05-005", "aws-saa-c03-AWSSAA-N07-B05-005-saa20261011"]
  ]);

  const byId = new Map(sourceQuestions.map((question) => [question.questionId, question]));
  for (const item of proof.items) {
    const question = byId.get(item.questionId);
    assert.ok(question, item.questionId);
    assert.deepEqual(question, item.currentQuestion, item.questionId);
    assert.equal(validateQuestion(question).valid, true, item.questionId);
    const optionIds = question.interaction.options.map(({ optionId }) => optionId);
    assert.equal(new Set(optionIds).size, optionIds.length, item.questionId);
    const wrongIds = optionIds.filter((optionId) => optionId !== question.answer.optionId).sort();
    assert.deepEqual(question.feedback.messages.map(({ targetId }) => targetId).sort(), wrongIds, item.questionId);
    for (const optionId of optionIds) {
      const score = scoreQuestion(question, { type: "choice_single", optionId });
      assert.equal(score.status, optionId === question.answer.optionId ? "correct" : "incorrect", `${item.questionId}/${optionId}`);
      assert.equal(score.earnedPoints, optionId === question.answer.optionId ? 1 : 0, `${item.questionId}/${optionId}`);
    }
  }

  const transition = await reconstructApprovedAwsPredecessor({ rootDirectory: root, questions: sourceQuestions });
  assert.equal(transition.predecessorQuestions.length, 2604);
  assert.equal(transition.replacements.length, 1);
  assert.equal(transition.sameIdCorrections.length, 27);
  assert.equal(sha256(canonicalJson(transition.predecessorQuestions)), proof.beforeQuestionSetSha256);
  assert.equal(transition.predecessorQuestions.some(({ questionId }) => questionId.endsWith("-005-saa20261011")), false);

  const outputRoot = await mkdtemp(path.join(tmpdir(), "saa-targeted-corrections-build-"));
  try {
    const built = await buildTrack({ root, trackId: proof.trackId, outputRoot });
    assert.equal(built.artifact.contentVersion, proof.contentVersion);
    assert.equal(built.artifact.questions.length, 2604);
    for (const item of proof.items) assert.deepEqual(built.artifact.questions.find(({ questionId }) => questionId === item.questionId), item.currentQuestion);
    assert.equal(built.lockEntry.sha256, sha256(built.artifactBytes));
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

test("AWS predecessor proof rejects unproven content drift and edited evidence", async (t) => {
  const drifted = structuredClone(sourceQuestions);
  drifted.find(({ questionId }) => questionId === proof.items[0].questionId).prompt += " unreviewed";
  await assert.rejects(
    reconstructApprovedAwsPredecessor({ rootDirectory: root, questions: drifted }),
    { code: "HASH_MISMATCH" }
  );

  const temporaryRoot = await mkdtemp(path.join("/private/tmp", "saa-targeted-proof-tamper-"));
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }));
  const temporaryProof = path.join(temporaryRoot, "evidence/business-quality/saa-20261010-aws-targeted-corrections.json");
  await mkdir(path.dirname(temporaryProof), { recursive: true });
  await writeFile(temporaryProof, `${JSON.stringify({ ...proof, scope: "tampered" })}\n`);
  await assert.rejects(
    reconstructApprovedAwsPredecessor({ rootDirectory: temporaryRoot, questions: sourceQuestions }),
    { code: "HASH_MISMATCH" }
  );
});
