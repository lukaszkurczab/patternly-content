import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canonicalJson, sha256 } from "../scripts/build.mjs";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";
import registryModule from "../../patternly/src/content/canonical/interactions/registry.ts";
import optionOrderModule from "../../patternly/src/application/canonical/canonicalOptionOrder.ts";

const { canonicalInteractionRegistry: runtime } = registryModule;
const { prepareCanonicalOptionOrder, isCanonicalOptionOrder } = optionOrderModule;
const cases = JSON.parse(readFileSync(new URL("./fixtures/gcp-ace-20261025-cases.json", import.meta.url), "utf8"));
const bank = await loadCurrentQuestionBank("google-cloud-associate-cloud-engineer");
const emitted = new Map(bank.artifact.questions.map(question => [question.questionId, question]));
const get = suffix => {
  const id = suffix.startsWith("gcp-") ? suffix : `gcp-ace-gcpace-n03-${suffix}`;
  assert.ok(emitted.has(id), id);
  return emitted.get(id);
};
const pin = { contentVersion: bank.artifact.contentVersion, artifactSha256: sha256(canonicalJson(bank.artifact)) };
const prose = question => Object.values(question.feedback.details).join(" ");
// The GCP builder adds contentDomainId only to emitted questions. The source
// validator/scorer takes authored questions; runtime consumes emitted questions.
const authored = question => bank.byId.get(question.questionId);
const permutations = ids => ids.length ? ids.flatMap((id, index) => permutations(ids.filter((_, i) => i !== index)).map(tail => [id, ...tail])) : [[]];

for (const [id, expected] of Object.entries(cases)) {
  test(`${expected.package} ${id}: authored correction reaches the emitted artifact`, () => {
    const question = get(id);
    if (expected.prompt != null) assert.equal(question.prompt, expected.prompt);
    if (expected.answerText != null) assert.equal(question.interaction.options.find(option => option.optionId === "A").text, expected.answerText);
    if (expected.reason != null) assert.equal(question.feedback.reason, expected.reason);
    for (const [key, text] of Object.entries(expected.details ?? {})) assert.equal(question.feedback.details[key], text);
    for (const [targetId, text] of Object.entries(expected.messages ?? {})) assert.equal(question.feedback.messages.find(message => message.targetId === targetId)?.text, text);
    if (expected.options) assert.deepEqual(question.interaction.options.filter(option => option.optionId !== "A"), expected.options);
  });

  test(`${expected.package} ${id}: every option scores and selects its own feedback through all 24 display orders`, () => {
    const question = get(id);
    assert.equal(validateQuestion(authored(question)).valid, true);
    assert.deepEqual(runtime.validate(question), []);
    assert.equal(question.answer.optionId, "A");
    assert.equal(question.interaction.type, "choice_single");
    assert.equal(question.interaction.scoringMethod, "exact_selected_set");
    assert.equal(question.nodeId, "billing_accounts_budgets_exports_costs_and_visibility");
    const wrong = question.interaction.options.filter(option => option.optionId !== "A").map(option => option.optionId).sort();
    assert.deepEqual(question.feedback.messages.map(message => message.targetId).sort(), wrong);
    for (const order of permutations(question.interaction.options.map(option => option.optionId))) {
      const shuffled = { ...question, interaction: { ...question.interaction, options: order.map(id => question.interaction.options.find(option => option.optionId === id)) } };
      for (const optionId of order) {
        const response = { type: "choice_single", optionId };
        assert.equal(runtime.isComplete(shuffled, response), true);
        assert.equal(scoreQuestion({ ...authored(question), interaction: shuffled.interaction }, response).earnedPoints, optionId === "A" ? 1 : 0);
        assert.equal(runtime.score(shuffled, response).earnedPoints, optionId === "A" ? 1 : 0);
        assert.deepEqual(runtime.projectFeedback(shuffled, response).messages, optionId === "A" ? [] : question.feedback.messages.filter(message => message.targetId === optionId));
      }
    }
    const orders = Array.from({ length: 8 }, (_, i) => {
      const occurrence = `${id}/occurrence/${i}`;
      const order = prepareCanonicalOptionOrder(question, occurrence, pin);
      assert.equal(isCanonicalOptionOrder(question, order), true);
      assert.deepEqual(order, prepareCanonicalOptionOrder(question, occurrence, pin));
      assert.deepEqual(runtime.present(question, null, order).model.renderer.options.map(option => option.id), order);
      return order.join("/");
    });
    assert.ok(new Set(orders).size > 1, "the fixed seeds exercise more than one legal display order");
  });
}

test("P01: alerts-only is learner-visible; native Cloud Run caps do not imply a VM blocker or zero overage", () => {
  for (const suffix of ["b04-004", "b04-007", "b04-013", "b05-003"]) {
    const question = get(suffix);
    assert.match(question.prompt, /alerts-only/);
    assert.match(prose(question), /Cloud Run/);
    assert.match(prose(question), /spend.cap/i);
    assert.match(prose(question), /overage/i);
  }
  assert.match(prose(get("b04-004")), /no response automation.*does not stop VMs/i);
  assert.match(prose(get("b04-013")), /does not extend to every project resource/);
  assert.match(prose(get("b05-003")), /do not act as a Compute Engine VM blocker/);
});

test("P02: all four explanations distinguish periodic status from threshold email and consumer success", () => {
  for (const suffix of ["b04-020", "b05-004", "b05-010", "b05-022"]) {
    const text = prose(get(suffix));
    assert.match(text, /periodic|multiple times per day/);
    assert.match(text, /at-least-once/);
    assert.match(text, /out.of.order/);
    assert.match(text, /duplicat/);
  }
  assert.match(prose(get("b04-020")), /alertThresholdExceeded=0.8/);
  assert.match(prose(get("b05-004")), /Without publisher authorization/);
  assert.match(prose(get("b05-010")), /no forecastThresholdExceeded causes only the actual escalation/);
  assert.match(prose(get("b05-022")), /correctly suppressed.*already handled/);
});

test("P03: retired B/C/D cannot be completed or mapped to a replacement answer", () => {
  const question = get("b02-015");
  for (const optionId of ["B", "C", "D"]) {
    assert.ok(!question.interaction.options.some(option => option.optionId === optionId));
    assert.ok(!question.feedback.messages.some(message => message.targetId === optionId));
    const old = { type: "choice_single", optionId };
    assert.equal(runtime.isComplete(question, old), false);
    assert.equal(runtime.score(question, old).earnedPoints, 0);
    assert.equal(scoreQuestion(authored(question), old).earnedPoints, 0);
    assert.equal(runtime.projectFeedback(question, old), null);
  }
  assert.match(prose(question), /one billing account and invoice.*distinct project IAM and project-level cost attribution/);
  assert.match(prose(question), /Moving all VMs into one shared project breaks/);
  assert.ok(!question.feedback.messages.some(message => /because it would keep the projects separate/.test(message.text)));
});

test("P04: first enablement differs from a destination switch and never promises all history", () => {
  const initial = get("b06-005"), replacement = get("b06-006");
  assert.match(prose(initial), /first enablement.*US\/EU.*current and previous month/i);
  assert.match(prose(initial), /regional cost exports start on activation.*pricing exports do not backfill/i);
  assert.match(prose(initial), /Do not promise.*complete historical ledger/);
  assert.match(prose(replacement), /previously exported rows are not automatically copied or backfilled/);
  assert.match(prose(replacement), /queries or views rather than inserting rows into managed export tables/);
});

test("P05: each wrong identity has a mechanism-specific explanation", () => {
  const messages = get("gcp-ace-n03-b01-001").feedback.messages;
  assert.match(messages.find(message => message.targetId === "B").text, /hierarchy.*not represent a payment relationship/);
  assert.match(messages.find(message => message.targetId === "C").text, /IAM permissions.*not a Cloud Billing account/);
  assert.match(messages.find(message => message.targetId === "D").text, /workload identity.*not the account responsible for paying/);
  assert.ok(messages.every(message => !message.text.includes("because it would")));
});

// Authored scenario only: CONTENT has no deployed budget consumer. This models
// the decisions taught by P02; it does not establish Cloud delivery or runtime.
function interpretStatusScenario(messages) {
  const handled = new Set(), actions = [];
  for (const { budgetId, costIntervalStart, alertThresholdExceeded, forecastThresholdExceeded } of messages) {
    for (const [kind, exceeded, threshold] of [["actual", alertThresholdExceeded, 0.8], ["forecast", forecastThresholdExceeded, 1]]) {
      const key = JSON.stringify([budgetId, costIntervalStart, kind, threshold]);
      if (exceeded >= threshold && !handled.has(key)) {
        handled.add(key);
        actions.push(`${budgetId}/${costIntervalStart}/${kind}`);
      }
    }
  }
  return actions;
}
const status = (fields = {}) => ({ budgetId: "finance", costIntervalStart: "2026-10-01", ...fields });
const scenarios = [
  ["below threshold (including no usage) has no exceedance fields", [status()], []],
  ["actual-only threshold triggers only the actual escalation", [status({ alertThresholdExceeded: 0.8 })], ["finance/2026-10-01/actual"]],
  ["duplicate or higher actual status does not repeat the configured 80% action", [status({ alertThresholdExceeded: 0.8 }), status({ alertThresholdExceeded: 0.8 }), status({ alertThresholdExceeded: 1 })], ["finance/2026-10-01/actual"]],
  ["out-of-order lower status does not reset deduplication", [status({ alertThresholdExceeded: 0.8 }), status(), status({ alertThresholdExceeded: 0.8, forecastThresholdExceeded: 1 })], ["finance/2026-10-01/actual", "finance/2026-10-01/forecast"]],
  ["a new period or a different budget has independent escalation state", [status({ alertThresholdExceeded: 0.8 }), status({ costIntervalStart: "2026-11-01", alertThresholdExceeded: 0.8 }), status({ budgetId: "sandbox", alertThresholdExceeded: 0.8 })], ["finance/2026-10-01/actual", "finance/2026-11-01/actual", "sandbox/2026-10-01/actual"]],
];
for (const [name, messages, expected] of scenarios) test(`P02 authored scenario: ${name}`, () => assert.deepEqual(interpretStatusScenario(messages), expected));
