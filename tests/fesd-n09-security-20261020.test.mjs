import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const trackId = "frontend-system-design-interview";
const nodeId = "security_privacy_authentication_and_untrusted_content";
const base = `content/${trackId}/${nodeId}`;
const baselineCommit = "86a5870a63ecfa37757246dee2b4d3b03bf00131";
const read = async (filename) => JSON.parse(await readFile(path.join(root, filename), "utf8"));
const questions = async () => (await Promise.all([
  read(`${base}/FESD-N09-B06.json`),
  read(`${base}/FESD-N09-B08.json`),
])).flat();
const feedback = (question, kind, targetId) => question.feedback.messages.find((message) => message.kind === kind && message.targetId === targetId);

test("B06 and B08 replace exactly their 40 source items with +100 security items", async () => {
  const all = await questions();
  assert.equal(all.length, 40);
  assert.equal(new Set(all.map((q) => q.questionId)).size, 40);
  const counts = { choice_single: 0, ordering: 0, decision_matrix: 0 };
  for (const filename of [`${base}/FESD-N09-B06.json`, `${base}/FESD-N09-B08.json`]) {
    const original = JSON.parse(execFileSync("git", ["show", `${baselineCommit}:${filename}`], { cwd: root, encoding: "utf8" }));
    const updated = await read(filename);
    assert.equal(updated.length, original.length, filename);
    for (let index = 0; index < updated.length; index += 1) {
      const previous = original[index].questionId;
      const number = Number(previous.match(/i(\d+)$/)[1]);
      assert.equal(updated[index].questionId, previous.replace(/i\d+$/, `i${String(number + 100).padStart(3, "0")}`), filename);
    }
  }
  for (const q of all) {
    counts[q.interaction.type] += 1;
    const number = Number(q.questionId.match(/i(\d+)$/)[1]);
    assert.ok(number >= 101 && number <= 120, q.questionId);
    assert.equal(q.nodeId, nodeId);
    assert.equal(validateQuestion(q).valid, true, `${q.questionId}: ${JSON.stringify(validateQuestion(q).errors)}`);
    assert.ok(q.sourceRefs.length > 0, q.questionId);
    assert.doesNotMatch(JSON.stringify(q), /Do not reduce|The accepted design must name|undefined evidence|Test the task with distinct input modalities/);
  }
  assert.deepEqual(counts, { choice_single: 23, ordering: 7, decision_matrix: 10 });
});

test("every B06 and B08 interaction scores its full answer and exposes scenario-bound errors", async () => {
  const all = await questions();
  let correctOptionsThatAreLongest = 0;
  let singleChoiceCount = 0;
  for (const q of all) {
    const full = scoreQuestion(q, q.answer);
    assert.equal(full.status, "correct", q.questionId);
    assert.equal(full.earnedPoints, full.maxPoints, q.questionId);

    const presented = structuredClone(q);
    if (q.interaction.type === "choice_single") {
      singleChoiceCount += 1;
      presented.interaction.options.reverse();
      assert.equal(scoreQuestion(presented, q.answer).status, "correct", `${q.questionId}: option order`);
      const correctText = q.interaction.options.find((option) => option.optionId === q.answer.optionId).text;
      if (correctText.length === Math.max(...q.interaction.options.map((option) => option.text.length))) correctOptionsThatAreLongest += 1;
      for (const option of q.interaction.options.filter((option) => option.optionId !== q.answer.optionId)) {
        const result = scoreQuestion(presented, { type: "choice_single", optionId: option.optionId });
        assert.equal(result.earnedPoints, 0, `${q.questionId}/${option.optionId}`);
        const message = feedback(q, "wrong_option", option.optionId);
        assert.ok(message, `${q.questionId}/${option.optionId}`);
        assert.ok(message.text.length >= 70, `${q.questionId}/${option.optionId}: corrective explanation`);
        assert.doesNotMatch(message.text, /^This choice does not satisfy the scenario because /, `${q.questionId}/${option.optionId}`);
      }
      assert.equal(scoreQuestion(q, { type: "choice_single" }).earnedPoints, 0, `${q.questionId}: omitted`);
      assert.equal(scoreQuestion(q, { type: "choice_single", optionId: "unknown-option" }).earnedPoints, 0, `${q.questionId}: unknown ID`);
    } else if (q.interaction.type === "ordering") {
      const answerIds = q.answer.orderedElementIds;
      const displayedIds = presented.interaction.elements.map((element) => element.elementId);
      presented.interaction.elements.reverse();
      assert.notDeepEqual(displayedIds, answerIds, `${q.questionId}: initial source order must not disclose answer`);
      assert.deepEqual(presented.interaction.elements.map((element) => element.elementId), [...displayedIds].reverse());
      assert.equal(scoreQuestion(presented, q.answer).status, "correct", `${q.questionId}: presentation order`);
      for (let index = 0; index < answerIds.length - 1; index += 1) {
        const relation = `${answerIds[index]}->${answerIds[index + 1]}`;
        assert.ok(feedback(q, "broken_relation", relation), `${q.questionId}/${relation}`);
        const swapped = [...answerIds];
        [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
        assert.ok(scoreQuestion(q, { type: "ordering", orderedElementIds: swapped }).earnedPoints < full.maxPoints, `${q.questionId}/${relation}`);
      }
      assert.equal(scoreQuestion(q, { type: "ordering", orderedElementIds: answerIds.slice(0, -1) }).earnedPoints < full.maxPoints, true, `${q.questionId}: omitted element`);
      assert.equal(scoreQuestion(q, { type: "ordering", orderedElementIds: [answerIds[0], "unknown-step", ...answerIds.slice(2)] }).invalidResponse, true, `${q.questionId}: invalid ID`);
      const relationMessages = q.feedback.messages.filter((message) => message.kind === "broken_relation");
      assert.equal(relationMessages.length, 3, `${q.questionId}: relation explanations`);
      for (const message of relationMessages) assert.ok(message.text.length > 35, `${q.questionId}/${message.targetId}`);
    } else {
      presented.interaction.dimensions.reverse();
      for (const dimension of presented.interaction.dimensions) dimension.values.reverse();
      assert.equal(scoreQuestion(presented, q.answer).status, "correct", `${q.questionId}: dimension/value order`);
      for (const dimension of q.interaction.dimensions) {
        const accepted = q.answer.selectedValueIdsByDimension[dimension.dimensionId];
        assert.ok(feedback(q, "omitted_dimension", dimension.dimensionId), `${q.questionId}/${dimension.dimensionId}`);
        const omitted = structuredClone(q.answer);
        delete omitted.selectedValueIdsByDimension[dimension.dimensionId];
        assert.equal(scoreQuestion(q, omitted).earnedPoints, full.maxPoints - 1, `${q.questionId}/${dimension.dimensionId}: omitted`);
        for (const value of dimension.values.filter((value) => !dimension.acceptedValueIds.includes(value.valueId))) {
          const wrong = structuredClone(q.answer);
          wrong.selectedValueIdsByDimension[dimension.dimensionId] = [value.valueId];
          assert.equal(scoreQuestion(presented, wrong).earnedPoints, full.maxPoints - 1, `${q.questionId}/${dimension.dimensionId}/${value.valueId}`);
          const message = feedback(q, "wrong_value", `${dimension.dimensionId}|${value.valueId}`);
          assert.ok(message, `${q.questionId}/${value.valueId}`);
          assert.match(message.text, /does not satisfy the scenario because/, `${q.questionId}/${value.valueId}`);
        }
        assert.match(feedback(q, "omitted_dimension", dimension.dimensionId).text, /dimension is required because/, `${q.questionId}/${dimension.dimensionId}: omission explanation`);
        const invalid = structuredClone(q.answer);
        invalid.selectedValueIdsByDimension[dimension.dimensionId] = ["unknown-value"];
        assert.equal(scoreQuestion(q, invalid).invalidResponse, true, `${q.questionId}/${dimension.dimensionId}: invalid ID`);
        assert.equal(accepted.length, 1, `${q.questionId}/${dimension.dimensionId}: one decision`);
      }
    }
  }
  assert.ok(correctOptionsThatAreLongest < singleChoiceCount, "correct choices must not all reveal themselves by length");
});

test("retained ordering questions encode three causal prerequisites each, with a scrambled visible source order", async () => {
  const ordered = (await questions()).filter((q) => q.interaction.type === "ordering");
  assert.equal(ordered.length, 7);
  for (const q of ordered) {
    const ids = q.answer.orderedElementIds;
    const positions = q.interaction.elements.map((element) => ids.indexOf(element.elementId));
    assert.deepEqual(positions, [2, 0, 3, 1], q.questionId);
    const relationMessages = q.feedback.messages.filter((message) => message.kind === "broken_relation");
    assert.deepEqual(relationMessages.map((message) => message.targetId), ids.slice(0, -1).map((id, index) => `${id}->${ids[index + 1]}`), q.questionId);
    assert.equal(new Set(relationMessages.map((message) => message.text)).size, 3, q.questionId);
  }
});

test("13 blind-reviewed ambiguous orderings are represented as scenario-specific decisions", async () => {
  const converted = [
    "fesd-n09-b06-i103", "fesd-n09-b06-i104", "fesd-n09-b06-i107", "fesd-n09-b06-i111",
    "fesd-n09-b06-i112", "fesd-n09-b06-i115", "fesd-n09-b06-i119", "fesd-n09-b08-i108",
    "fesd-n09-b08-i111", "fesd-n09-b08-i115", "fesd-n09-b08-i116", "fesd-n09-b08-i119",
    "fesd-n09-b08-i120",
  ];
  const all = await questions();
  for (const questionId of converted) {
    const q = all.find((item) => item.questionId === questionId);
    assert.ok(q, questionId);
    assert.equal(q.interaction.type, "choice_single", questionId);
    assert.equal(q.answer.type, "choice_single", questionId);
    assert.equal(q.interaction.options.length, 4, questionId);
    assert.equal(new Set(q.interaction.options.map((option) => option.optionId)).size, 4, questionId);
    for (const option of q.interaction.options.filter((option) => option.optionId !== q.answer.optionId)) {
      assert.ok(feedback(q, "wrong_option", option.optionId), `${questionId}/${option.optionId}`);
    }
    assert.equal(q.feedback.messages.some((message) => message.kind === "broken_relation"), false, questionId);
    assert.equal(scoreQuestion(q, q.answer).status, "correct", questionId);
  }
});
