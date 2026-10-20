import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const app = path.resolve(process.env.PATTERNLY_FRONTEND_ROOT ?? path.join(root, "../patternly"));
const require = createRequire(path.join(app, "package.json"));
require("tsx/cjs");
const { prepareCanonicalOptionOrder, isCanonicalOptionOrder } = require(path.join(app, "src/application/canonical/canonicalOptionOrder.ts"));
const { buildCanonicalInteractionViewModel, composeCanonicalFeedback } = require(path.join(app, "src/application/canonical/canonicalInteractionPresentation.ts"));
const { toCanonicalQuestionViewModel, canonicalResponseToPracticeLocalResponse } = require(path.join(app, "src/features/practice/canonicalQuestionViewModel.ts"));
const { canonicalInteractionRegistry } = require(path.join(app, "src/content/canonical/interactions/registry.ts"));
const { scoreCanonicalQuestion } = require(path.join(app, "src/content/canonical/questionScoring.ts"));
const baseline = "86a5870a63ecfa37757246dee2b4d3b03bf00131";
const track = "frontend-system-design-interview";
const node = "security_privacy_authentication_and_untrusted_content";
const files = Array.from({ length: 8 }, (_, i) => `content/${track}/${node}/FESD-N09-B${String(i + 1).padStart(2, "0")}.json`);
const read = async (file) => JSON.parse(await readFile(path.join(root, file), "utf8"));
const original = (file) => JSON.parse(execFileSync("git", ["show", `${baseline}:${file}`], { cwd: root, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }));
const questions = async () => (await Promise.all(files.map(read))).flat();
const pin = { contentVersion: "n09-regression", artifactSha256: "a".repeat(64) };
const retainedIntents = new Set(["fesd-n09-b05-i002", "fesd-n09-b05-i017", "fesd-n09-b07-i014"]);
const displayIds = (view) => view.model.renderer.elements.map((e) => e.id);

function assertInitialDoesNotRevealAnswer(q) {
  const order = prepareCanonicalOptionOrder(q, "n09-occurrence", pin);
  assert.notDeepEqual(displayIds(buildCanonicalInteractionViewModel(q, null, order)), q.answer.orderedElementIds, q.questionId);
}

test("N09 repairs account for exactly 159 source slots and preserve the other 1607 source objects", async () => {
  const sourceFiles = execFileSync("git", ["ls-tree", "-r", "--name-only", baseline, `content/${track}`], { cwd: root, encoding: "utf8" }).trim().split("\n");
  let outside = 0, changed = 0;
  for (const file of sourceFiles) {
    const before = original(file), after = await read(file);
    if (!files.includes(file)) {
      assert.deepEqual(after, before, file);
      outside += before.length;
      continue;
    }
    assert.equal(after.length, before.length, file);
    for (let i = 0; i < before.length; i++) {
      const q = after[i], old = before[i];
      const successor = old.questionId.replace(/i(\d+)$/, (_, n) => `i${Number(n) + 100}`);
      assert.equal(q.questionId, retainedIntents.has(old.questionId) ? old.questionId : successor, old.questionId);
      assert.equal(q.mentalUnitId, old.mentalUnitId);
      assert.equal(q.nodeId, old.nodeId);
      assert.equal(validateQuestion(q).valid, true, JSON.stringify(validateQuestion(q).errors));
      assert.doesNotMatch(JSON.stringify(q), /Do not reduce|The accepted design must name|undefined evidence|The client-authority, global-state, framework-first/);
      changed++;
    }
  }
  assert.equal(changed, 159);
  assert.equal(outside, 1607);
});

test("P01 regression detects all 88 old source-order answer leaks using the real APP presenter", () => {
  const oldOrderings = files.flatMap(original).filter((q) => q.interaction.type === "ordering");
  assert.equal(oldOrderings.length, 88);
  for (const q of oldOrderings) {
    assert.throws(() => assertInitialDoesNotRevealAnswer(q), { name: "AssertionError" }, q.questionId);
    assert.equal(scoreCanonicalQuestion(q, { type: "ordering", orderedElementIds: [q.answer.orderedElementIds[1], q.answer.orderedElementIds[0], ...q.answer.orderedElementIds.slice(2)] }).earnedPoints, 1);
  }
});

test("every retained ordering starts unsolved, scores causally ordered responses, and preserves serialized submitted answers", async () => {
  for (const q of (await questions()).filter((q) => q.interaction.type === "ordering")) {
    assertInitialDoesNotRevealAnswer(q);
    const order = prepareCanonicalOptionOrder(q, "n09-occurrence", pin);
    assert.equal(isCanonicalOptionOrder(q, order), true);
    assert.deepEqual(prepareCanonicalOptionOrder(q, "other-occurrence", pin), order);
    const initialFeatureView = toCanonicalQuestionViewModel(q);
    assert.notDeepEqual(displayIds(initialFeatureView.interaction), q.answer.orderedElementIds);
    assert.equal(Object.hasOwn(initialFeatureView, "answer"), false);
    assert.equal(Object.hasOwn(initialFeatureView, "feedback"), false);
    const response = JSON.parse(JSON.stringify(q.answer));
    const evaluated = canonicalInteractionRegistry.evaluate(q, response);
    assert.equal(evaluated.complete, true);
    assert.equal(scoreCanonicalQuestion(q, response).earnedPoints, 3);
    assert.equal(scoreQuestion(q, response).earnedPoints, 3);
    assert.deepEqual(displayIds(buildCanonicalInteractionViewModel(q, response, order)), response.orderedElementIds);
    assert.deepEqual(canonicalResponseToPracticeLocalResponse(response), { kind: "ordering", orderedSubgoalIds: response.orderedElementIds });
    const review = canonicalInteractionRegistry.presentReview(q, response, order);
    assert.deepEqual(displayIds(review), response.orderedElementIds);
    assert.deepEqual(review.diagnostics, []);
    assert.deepEqual(composeCanonicalFeedback(q, response, scoreCanonicalQuestion(q, response)).messages, []);
    const wrong = { type: "ordering", orderedElementIds: [response.orderedElementIds[1], response.orderedElementIds[0], ...response.orderedElementIds.slice(2)] };
    assert.equal(scoreCanonicalQuestion(q, wrong).earnedPoints, 1);
    const wrongMessages = composeCanonicalFeedback(q, wrong, scoreCanonicalQuestion(q, wrong)).messages;
    assert.ok(wrongMessages.length > 0);
    assert.ok(wrongMessages.every((m) => m.kind === "broken_relation"));
    assert.deepEqual(displayIds(buildCanonicalInteractionViewModel(q, JSON.parse(JSON.stringify(wrong)), order)), wrong.orderedElementIds);
    assert.deepEqual(displayIds(canonicalInteractionRegistry.presentReview(q, null, order)), response.orderedElementIds);
  }
});

test("all revised single choices bind score and feedback to stable IDs after actual occurrence shuffling", async () => {
  for (const q of (await questions()).filter((q) => q.interaction.type === "choice_single")) {
    const order = prepareCanonicalOptionOrder(q, "n09-occurrence", pin);
    assert.equal(isCanonicalOptionOrder(q, order), true);
    const view = buildCanonicalInteractionViewModel(q, null, order);
    assert.deepEqual(view.model.renderer.options.map((o) => o.id), order);
    for (const option of q.interaction.options) {
      const response = { type: "choice_single", optionId: option.optionId };
      const result = scoreCanonicalQuestion(q, response);
      const correct = option.optionId === q.answer.optionId;
      assert.equal(result.earnedPoints, correct ? 1 : 0, q.questionId);
      const messages = composeCanonicalFeedback(q, response, result).messages;
      assert.deepEqual(messages, correct ? [] : q.feedback.messages.filter((m) => m.kind === "wrong_option" && m.targetId === option.optionId));
      if (!correct) assert.equal(messages.length, 1);
    }
  }
});

test("N09 matrices retain partial credit and project only feedback for the actual wrong selected value", async () => {
  for (const q of (await questions()).filter((q) => q.interaction.type === "decision_matrix")) {
    const full = scoreCanonicalQuestion(q, q.answer);
    assert.equal(full.kind, "correct", q.questionId);
    assert.deepEqual(composeCanonicalFeedback(q, q.answer, full).messages, [], q.questionId);
    for (const dimension of q.interaction.dimensions) {
      for (const value of dimension.values.filter((v) => !dimension.acceptedValueIds.includes(v.valueId))) {
        const wrong = structuredClone(q.answer);
        wrong.selectedValueIdsByDimension[dimension.dimensionId] = [value.valueId];
        const result = scoreCanonicalQuestion(q, wrong);
        assert.equal(result.earnedPoints, full.maxPoints - 1, q.questionId);
        const messages = composeCanonicalFeedback(q, wrong, result).messages;
        assert.deepEqual(messages.filter((m) => m.kind === "wrong_value").map((m) => m.targetId), [`${dimension.dimensionId}|${value.valueId}`], q.questionId);
      }
      const missing = structuredClone(q.answer);
      delete missing.selectedValueIdsByDimension[dimension.dimensionId];
      assert.equal(canonicalInteractionRegistry.isComplete(q, missing), false);
      assert.equal(scoreCanonicalQuestion(q, missing).earnedPoints, full.maxPoints - 1);
      assert.equal(canonicalInteractionRegistry.evaluate(q, missing).feedback, null);
      const invalid = structuredClone(q.answer);
      invalid.selectedValueIdsByDimension[dimension.dimensionId] = ["unknown_value"];
      assert.equal(canonicalInteractionRegistry.isComplete(q, invalid), false);
      assert.equal(scoreCanonicalQuestion(q, invalid).earnedPoints, 0);
      assert.equal(canonicalInteractionRegistry.evaluate(q, invalid).feedback, null);
    }
  }
});
