import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const trackId = "microsoft-azure-ai-fundamentals-ai-901";
const units = ["B01", "B02", "B03"];
const successorIds = units.flatMap((unit) => Array.from({ length: 12 }, (_, i) => `AI901-N01-${unit}-Q${String(i + 13).padStart(3, "0")}`));
const scenarioAnchors = {
  B01: [/applicant appeals/i, /required fields are missing/i, /unsupported/i, /wrong queue/i, /sensor replacement/i, /client application/i, /patient messages/i, /approved source/i, /false positives/i, /language variety/i, /find compliant/i, /form change/i],
  B02: [/20%/, /18%/, /91%/, /61%/, /16%/, /accessibility pathway/i, /93%/, /11 of 100/, /15%/, /91%/, /12%/, /14%/],
  B03: [/low-confidence/i, /missing the required eligibility field/i, /unsupported by its transcription operation/i, /no complaint text/i, /low quality/i, /times out/i, /duration of symptoms/i, /cannot be verified/i, /queue capacity/i, /confidence falls below/i, /becomes unavailable/i, /omits the required claim-status field/i]
};

const bank = await loadCurrentQuestionBank(trackId);
const activeConfig = JSON.parse(await readFile(path.join(root, "config/tracks", `${trackId}.json`), "utf8"));

test("AI-901 current bank contains the explicit successor inventory and active diagnostic selection", () => {
  assert.equal(successorIds.length, 36);
  assert.equal(new Set(successorIds).size, 36);
  for (const id of successorIds) assert.ok(bank.byId.has(id), `${id} is in the current built bank`);
  const activeIds = activeConfig.modeConfiguration.diagnosticBaseline.itemIds;
  assert.equal(activeIds.length, 40);
  for (const id of successorIds) assert.ok(activeIds.includes(id), `${id} is selected for the active diagnostic`);
});

test("each current successor presents its distinct case facts, conceals the key, and scores by option ID after shuffle", () => {
  for (const id of successorIds) {
    const question = bank.byId.get(id);
    assert.ok(question, id);
    assert.equal(question.questionId, id);
    const unit = id.slice("AI901-N01-".length, "AI901-N01-".length + 3);
    const ordinal = Number(id.slice(-3)) - 13;
    assert.match(question.prompt, scenarioAnchors[unit][ordinal], id);
    assert.equal(question.questionRelation, undefined, `${id}: identity does not expose lineage in the learner question`);
    assert.equal(question.constraints.some((constraint) => /primary mental unit/i.test(constraint)), false, id);
    assert.equal(question.feedback.details.mechanismOrProperty.includes("Primary mental unit"), false, id);
    assert.deepEqual(Object.keys(question.feedback.details).sort(), ["boundaryOrTradeoff", "errorCorrection", "mechanismOrProperty", "scenarioApplication", "transfer", "url"].sort(), id);
    assert.equal(validateQuestion(question).valid, true, id);

    const accepted = question.interaction.options.find(({ optionId }) => optionId === question.answer.optionId);
    assert.ok(accepted, id);
    assert.equal(question.prompt.includes(accepted.text), false, `${id}: key is not repeated in prompt`);
    assert.equal(question.constraints.some((constraint) => constraint.toLowerCase() === accepted.text.toLowerCase()), false, id);
    assert.equal(question.feedback.reason.includes(accepted.text), false, id);
    assert.doesNotMatch(question.feedback.reason, /The accepted choice applies|In this scenario/i, id);
    assert.ok(!["a", "b", "c", "d"].includes(accepted.optionId), `${id}: fresh option identity`);

    if (id === "AI901-N01-B01-Q013") {
      assert.match(accepted.text, /protected case records/i);
      assert.match(accepted.text, /model evidence/i);
      assert.match(accepted.text, /reviewer and decision/i);
      assert.match(accepted.text, /appeals.*escalation/i);
    }
    if (id === "AI901-N01-B01-Q014") {
      assert.match(accepted.text, /each rejected case/i);
      assert.match(accepted.text, /sustained increases/i);
    }
    if (id === "AI901-N01-B01-Q022") {
      assert.match(accepted.text, /owner/i);
      assert.match(accepted.text, /monitor/i);
      assert.match(accepted.text, /escalate/i);
    }
    if (id === "AI901-N01-B01-Q024") {
      assert.match(accepted.text, /threshold/i);
      assert.match(accepted.text, /recover/i);
      assert.match(accepted.text, /escalate|rollback/i);
    }

    const wrongIds = question.interaction.options.filter(({ optionId }) => optionId !== question.answer.optionId).map(({ optionId }) => optionId).sort();
    const wrongFeedback = question.feedback.messages.filter(({ kind }) => kind === "wrong_option");
    assert.deepEqual(wrongFeedback.map(({ targetId }) => targetId).sort(), wrongIds, id);
    assert.equal(new Set(wrongFeedback.map(({ text }) => text)).size, wrongIds.length, id);
    for (const candidate of [question, { ...question, interaction: { ...question.interaction, options: [...question.interaction.options].reverse() } }]) {
      for (const { optionId } of candidate.interaction.options) {
        const result = scoreQuestion(candidate, { type: "choice_single", optionId });
        const correct = optionId === question.answer.optionId;
        assert.equal(result.status, correct ? "correct" : "incorrect", `${id}/${optionId}`);
        assert.equal(result.earnedPoints, correct ? 1 : 0, `${id}/${optionId}`);
      }
    }
  }
});

test("the accepted option is not the uniquely longest choice in most repaired questions", () => {
  for (const unit of units) {
    const questions = successorIds.filter((id) => id.includes(`-${unit}-`)).map((id) => bank.byId.get(id));
    const acceptedLongest = questions.filter((question) => {
      const accepted = question.interaction.options.find(({ optionId }) => optionId === question.answer.optionId);
      return accepted.text.length >= Math.max(...question.interaction.options.map(({ text }) => text.length));
    }).length;
    assert.ok(acceptedLongest <= 6, `${unit}: accepted option longest or tied in ${acceptedLongest}/12 current items`);
  }
});
