import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { buildTrack, canonicalJson, sha256 } from "../scripts/build.mjs";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proof = JSON.parse(readFileSync(path.join(root, "evidence/business-quality/bizq-01-coding-source-copy-04.json")));
const sourceBytes = readFileSync(path.join(root, proof.sourceFile));
const questions = JSON.parse(sourceBytes);
const question = questions.find((question) => question.questionId === proof.questionId);

test("same-ID source correction changes only the three reviewed texts and preserves all other mental-unit items", () => {
  const beforeBytes = execFileSync("git", ["show", `${proof.beforeProducerCommit}:${proof.sourceFile}`], { cwd: root });
  assert.equal(sha256(beforeBytes), proof.beforeSourceSha256);
  assert.equal(sha256(sourceBytes), proof.sourceSha256);
  const before = JSON.parse(beforeBytes);
  const restored = structuredClone(questions);
  const current = restored.find((question) => question.questionId === proof.questionId);
  assert.notEqual(current.prompt, proof.beforeQuestion.prompt);
  assert.notEqual(current.feedback.details.blocks[1].text, proof.beforeQuestion.feedback.details.blocks[1].text);
  assert.notEqual(current.feedback.details.blocks[3].text, proof.beforeQuestion.feedback.details.blocks[3].text);
  current.prompt = proof.beforeQuestion.prompt;
  current.feedback.details.blocks[1].text = proof.beforeQuestion.feedback.details.blocks[1].text;
  current.feedback.details.blocks[3].text = proof.beforeQuestion.feedback.details.blocks[3].text;
  assert.deepEqual(restored, before);
  assert.deepEqual(proof.beforeQuestion, before.find((item) => item.questionId === proof.questionId));
  assert.equal(questions.length, 18);
  const validated = validateQuestion(question);
  assert.equal(validated.valid, true, validated.errors.join("\n"));
  assert.doesNotMatch(question.prompt + JSON.stringify(question.feedback.details), /\b(?:Option|Strategy)\s+[AB]\b/);
  assert.match(question.prompt, /one-time lookup.*linear scan.*sorts a copy.*single query/);
  assert.match(question.feedback.details.blocks[1].text, /copying.*comparison sorting.*lookup/);
  for (const option of question.interaction.options) {
    const score = scoreQuestion(question, { type: "choice_single", optionId: option.optionId });
    assert.equal(score.status, option.optionId === "scan" ? "correct" : "incorrect");
    assert.equal(score.earnedPoints, option.optionId === "scan" ? 1 : 0);
    if (option.optionId !== "scan") assert.equal(question.feedback.messages.filter((message) => message.targetId === option.optionId).length, 1);
  }
});

test("canonical single-track builder carries the exact corrected object and new immutable content identity", async (t) => {
  const outputRoot = await mkdtemp(path.join(tmpdir(), "bizq01-source-copy-build-"));
  t.after(() => rm(outputRoot, { recursive: true, force: true }));
  const built = await buildTrack({ root, trackId: proof.trackId, outputRoot });
  assert.equal(built.artifact.contentVersion, proof.contentVersion);
  assert.equal(built.artifact.questions.length, 3404);
  assert.equal(sha256(canonicalJson(built.questions)), proof.questionSetSha256);
  assert.deepEqual(built.artifact.questions.find((item) => item.questionId === proof.questionId), question);
  assert.equal(built.lockEntry.sha256, sha256(built.artifactBytes));
});
