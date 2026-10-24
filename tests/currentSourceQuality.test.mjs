import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildAll } from "../scripts/build.mjs";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

test("all nine current source banks build, validate and score without historical fixtures", async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-current-source-quality-"));
  try {
    const built = await buildAll({ outputRoot });
    assert.equal(built.artifacts.length, 9);
    assert.equal(built.lock.tracks.length, 9);
    let questionCount = 0;

    for (const track of built.artifacts) {
      assert.equal(track.artifact.trackId, track.trackId);
      assert.equal(track.artifact.contentVersion, track.track.contentVersion);
      assert.match(track.artifact.contentVersion, /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u,
        `${track.trackId}: contentVersion must satisfy the APP successor-ledger identity contract (1–128 safe characters)`);
      assert.ok(track.questions.length > 0, track.trackId);
      questionCount += track.questions.length;

      for (const question of track.questions) {
        const validation = validateQuestion(question);
        assert.equal(validation.valid, true, `${question.questionId}: ${validation.errors.join("; ")}`);
        const correct = scoreQuestion(question, question.answer);
        assert.equal(correct.status, "correct", question.questionId);
        assert.equal(correct.earnedPoints, correct.maxPoints, question.questionId);

        if (question.interaction.type === "choice_single") {
          const options = question.interaction.options;
          const expectedWrongIds = options.filter(({ optionId }) => optionId !== question.answer.optionId).map(({ optionId }) => optionId).sort();
          const authoredWrongIds = (question.feedback.messages ?? []).filter(({ kind }) => kind === "wrong_option").map(({ targetId }) => targetId).sort();
          if (authoredWrongIds.length) assert.deepEqual(authoredWrongIds, expectedWrongIds, `${question.questionId}: wrong-answer feedback targets`);
          const shuffled = structuredClone(question);
          shuffled.interaction.options.reverse();
          assert.equal(scoreQuestion(shuffled, shuffled.answer).status, "correct", question.questionId);
          for (const { optionId } of options) {
            const result = scoreQuestion(shuffled, { type: "choice_single", optionId });
            assert.equal(result.status, optionId === question.answer.optionId ? "correct" : "incorrect", question.questionId);
          }
        }

        if (question.interaction.type === "choice_multiple") {
          const wrongOption = question.interaction.options.find(({ optionId }) => !question.answer.optionIds.includes(optionId));
          if (wrongOption) {
            const result = scoreQuestion(question, { type: "choice_multiple", optionIds: [...question.answer.optionIds, wrongOption.optionId] });
            assert.equal(result.status, "incorrect", question.questionId);
          }
        }
      }
    }
    assert.equal(questionCount, built.lock.tracks.reduce((sum, track) => sum + track.questionCount, 0));
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
