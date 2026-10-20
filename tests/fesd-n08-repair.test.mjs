import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { buildTrack, validateTrack } from "../scripts/build.mjs";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const trackId = "frontend-system-design-interview";
const nodeId = "accessibility_internationalization_responsive_and_input_design";
const predecessor = "0f4e6912d7d0cdb1a1c41b9d7885d7e867f80f34";
const sizes = [19, 21, 20, 20, 21, 19, 20, 22];
const files = sizes.map((_, index) => `content/${trackId}/${nodeId}/FESD-N08-B${String(index + 1).padStart(2, "0")}.json`);
const read = async (file) => JSON.parse(await readFile(path.join(root, file), "utf8"));
const selected = async () => (await Promise.all(files.map(read))).flat();
const feedback = (q, kind, targetId) => q.feedback.messages.find((message) => message.kind === kind && message.targetId === targetId);

test("exact 162 N08 replacements retain their identity and unrelated historical source remains unchanged", async () => {
  const sourceFiles = execFileSync("git", ["ls-tree", "-r", "--name-only", predecessor, `content/${trackId}`], { cwd: root, encoding: "utf8" }).trim().split("\n");
  let unchanged = 0;
  const originalInteractions = { choice_single: 0, ordering: 0, decision_matrix: 0 };
  for (const file of sourceFiles) {
    const before = JSON.parse(execFileSync("git", ["show", `${predecessor}:${file}`], { cwd: root, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }));
    const after = await read(file);
    const index = files.indexOf(file);
    if (index < 0) {
      // N09 has its own bounded repair and baseline-preservation regression.
      // This historical N08 test must not freeze that subsequently repaired unit.
      if (file.includes("/security_privacy_authentication_and_untrusted_content/")) continue;
      assert.deepEqual(after, before, file);
      unchanged += before.length;
      continue;
    }
    assert.equal(after.length, sizes[index], file);
    for (let offset = 0; offset < after.length; offset += 1) {
      const old = before[offset];
      originalInteractions[old.interaction.type] += 1;
      const q = after[offset];
      assert.equal(q.questionId, old.questionId.replace(/i(\d+)$/, (_, n) => `i${Number(n) + 100}`));
      assert.equal(q.nodeId, old.nodeId);
      assert.equal(q.mentalUnitId, old.mentalUnitId);
      assert.equal(validateQuestion(q).valid, true, JSON.stringify(validateQuestion(q).errors));
      assert.ok(q.constraints.length > 0, q.questionId);
      assert.doesNotMatch(JSON.stringify(q), /Do not reduce|The accepted design must name|The the |This unit owns the primary|The client-authority, global-state, framework-first/);
    }
  }
  assert.equal(unchanged, 1445);
  assert.deepEqual(originalInteractions, { choice_single: 46, ordering: 83, decision_matrix: 33 });
});

test("every changed answer and rejected alternative reaches the canonical scorer with bound feedback", async () => {
  const counts = { choice_single: 0, ordering: 0, decision_matrix: 0 };
  let longestCorrect = 0;
  let longestOriginalFifteen = 0;
  const originalFifteen = new Set([
    ...[101, 102, 105, 106, 109, 110, 113, 114, 117, 118].map((n) => `fesd-n08-b01-i${n}`),
    ...[102, 106, 110, 114, 118].map((n) => `fesd-n08-b02-i${n}`),
  ]);
  for (const q of await selected()) {
    counts[q.interaction.type] += 1;
    const full = scoreQuestion(q, q.answer);
    assert.equal(full.status, "correct", q.questionId);
    const shuffled = structuredClone(q);
    if (q.interaction.type === "choice_single") {
      shuffled.interaction.options.reverse();
      const accepted = q.interaction.options.find((o) => o.optionId === q.answer.optionId);
      if (accepted.text.length === Math.max(...q.interaction.options.map((o) => o.text.length))) {
        longestCorrect += 1;
        if (originalFifteen.has(q.questionId)) longestOriginalFifteen += 1;
      }
      for (const option of q.interaction.options.filter((o) => o.optionId !== q.answer.optionId)) {
        assert.equal(scoreQuestion(shuffled, { type: "choice_single", optionId: option.optionId }).earnedPoints, 0);
        assert.ok(feedback(q, "wrong_option", option.optionId), `${q.questionId}: ${option.optionId}`);
      }
    } else if (q.interaction.type === "ordering") {
      shuffled.interaction.elements.reverse();
      const ids = q.answer.orderedElementIds;
      for (let i = 0; i < ids.length - 1; i += 1) {
        assert.ok(feedback(q, "broken_relation", `${ids[i]}->${ids[i + 1]}`), q.questionId);
        const swapped = [...ids];
        [swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]];
        assert.ok(scoreQuestion(q, { type: "ordering", orderedElementIds: swapped }).earnedPoints < full.maxPoints);
      }
      for (const id of ids) assert.ok(feedback(q, "wrong_element", id), `${q.questionId}: ${id}`);
    } else {
      shuffled.interaction.dimensions.reverse();
      for (const d of shuffled.interaction.dimensions) d.values.reverse();
      for (const dimension of q.interaction.dimensions) {
        assert.ok(feedback(q, "omitted_dimension", dimension.dimensionId), q.questionId);
        const omitted = structuredClone(q.answer);
        delete omitted.selectedValueIdsByDimension[dimension.dimensionId];
        assert.equal(scoreQuestion(q, omitted).earnedPoints, full.maxPoints - 1);
        for (const value of dimension.values.filter((v) => !dimension.acceptedValueIds.includes(v.valueId))) {
          const wrong = structuredClone(q.answer);
          wrong.selectedValueIdsByDimension[dimension.dimensionId] = [value.valueId];
          assert.equal(scoreQuestion(shuffled, wrong).earnedPoints, full.maxPoints - 1);
          assert.ok(feedback(q, "wrong_value", `${dimension.dimensionId}|${value.valueId}`), q.questionId);
        }
      }
    }
    assert.equal(scoreQuestion(shuffled, q.answer).status, "correct", q.questionId);
  }
  assert.equal(Object.values(counts).reduce((sum, n) => sum + n, 0), 162);
  // Bounded regression for the demonstrated universal cue, not a product length rule.
  assert.ok(longestCorrect < counts.choice_single, "Every correct choice is still the longest");
  assert.ok(longestOriginalFifteen < 15, "The original bounded fifteen still all reveal the key by length");
});

test("one-track builder preserves all source questions in the actual artifact", async () => {
  const outputRoot = await mkdtemp(path.join(tmpdir(), "fesd-n08-build-"));
  try {
    const validated = await validateTrack({ rootDirectory: root, trackId });
    const built = await buildTrack({ rootDirectory: root, trackId, outputRoot });
    const artifact = JSON.parse(await readFile(built.artifactPath, "utf8"));
    assert.deepEqual(artifact.questions, validated.artifactQuestions);
    assert.equal(artifact.questions.length, 1766);
    assert.equal(built.lock.tracks.length, 1);
    assert.equal(artifact.questions.filter((q) => q.nodeId === nodeId).length, 162);
  } finally { await rm(outputRoot, { recursive: true }); }
});

test("real application scorer and presentation consume rebuilt questions without changing the app pin", { skip: !process.env.PATTERNLY_FRONTEND_ROOT }, async () => {
  const app = path.resolve(process.env.PATTERNLY_FRONTEND_ROOT);
  const require = createRequire(path.join(app, "package.json"));
  require("tsx/cjs");
  const { scoreCanonicalQuestion } = require(path.join(app, "src/content/canonical/questionScoring.ts"));
  const { buildCanonicalInteractionViewModel, composeCanonicalFeedback, projectCanonicalOrderingFeedbackMessages } = require(path.join(app, "src/application/canonical/canonicalInteractionPresentation.ts"));
  const outputRoot = await mkdtemp(path.join(tmpdir(), "fesd-n08-consumer-"));
  try {
    const built = await buildTrack({ rootDirectory: root, trackId, outputRoot });
    const artifact = JSON.parse(await readFile(built.artifactPath, "utf8"));
    for (const q of artifact.questions.filter((q) => q.nodeId === nodeId)) {
      assert.equal(scoreCanonicalQuestion(q, q.answer).kind, "correct", q.questionId);
      const order = q.interaction.options?.map((o) => o.optionId).reverse() ?? q.interaction.elements?.map((e) => e.elementId).reverse() ?? [];
      const presented = buildCanonicalInteractionViewModel(q, null, order);
      assert.equal(presented.interactionType, q.interaction.type);
      const view = presented.model;
      assert.ok(view && typeof view === "object", q.questionId);
      assert.equal(view.accessibility.label, q.prompt);
      assert.equal(Object.hasOwn(view, "answer"), false);
      assert.equal(Object.hasOwn(view, "feedback"), false);
      if (q.interaction.type === "choice_single") {
        assert.deepEqual(view.renderer.options.map((o) => o.id), order);
        for (const option of q.interaction.options) {
          const response = { type: "choice_single", optionId: option.optionId };
          const correct = option.optionId === q.answer.optionId;
          assert.equal(scoreCanonicalQuestion(q, response).earnedPoints, correct ? 1 : 0);
          const messages = composeCanonicalFeedback(q, response, scoreCanonicalQuestion(q, response)).messages;
          assert.deepEqual(messages, correct ? [] : [feedback(q, "wrong_option", option.optionId)]);
          assert.equal(view.accessibility.controls.find((c) => c.id === option.optionId).label, option.text);
        }
      } else if (q.interaction.type === "ordering") {
        const response = { type: "ordering", orderedElementIds: [...q.answer.orderedElementIds].reverse() };
        assert.notEqual(scoreCanonicalQuestion(q, response).kind, "correct");
        assert.ok(projectCanonicalOrderingFeedbackMessages(q, response).length > 0);
        assert.deepEqual(projectCanonicalOrderingFeedbackMessages(q, q.answer), []);
      } else {
        for (const d of q.interaction.dimensions) {
          for (const value of d.values.filter((v) => !d.acceptedValueIds.includes(v.valueId))) {
            const wrong = structuredClone(q.answer);
            wrong.selectedValueIdsByDimension[d.dimensionId] = [value.valueId];
            assert.equal(scoreCanonicalQuestion(q, wrong).earnedPoints, q.interaction.dimensions.length - 1);
          }
        }
      }
    }
  } finally { await rm(outputRoot, { recursive: true }); }
});
