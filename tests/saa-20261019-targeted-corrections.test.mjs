import assert from "node:assert/strict";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const bank = await loadCurrentQuestionBank("aws-certified-solutions-architect-associate");
const id = suffix => `aws-saa-c03-AWSSAA-N07-${suffix}`;
const packages = {
  P01: ["B04-004", "B04-014"],
  P02: ["B02-011", "B07-014"],
  P03: ["B01-004"],
  P04: ["B04-001", "B04-005", "B04-006", "B04-007", "B04-008", "B04-018"],
  P05: ["B01-007", "B05-013", "B05-017", "B07-012"],
};
const get = suffix => { const question = bank.byId.get(id(suffix)); assert.ok(question, suffix); return question; };
const details = suffix => JSON.stringify(get(suffix).feedback.details);
const correctText = suffix => get(suffix).interaction.options.find(option => option.optionId === "A").text;

function permutations(values) {
  return values.length === 0 ? [[]] : values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map(rest => [value, ...rest]));
}

for (const [group, suffixes] of Object.entries(packages)) for (const suffix of suffixes) {
  test(`${group} ${suffix}: serialized source/artifact scoring and ID feedback survive all 24 option orders`, () => {
    const question = get(suffix);
    assert.deepEqual(bank.artifact.questions.find(entry => entry.questionId === question.questionId), question);
    assert.equal(validateQuestion(question).valid, true);
    assert.deepEqual(question.answer, { optionId: "A", type: "choice_single" });
    assert.equal(question.interaction.scoringMethod, "exact_selected_set");
    const wrongIds = question.interaction.options.filter(option => option.optionId !== "A").map(option => option.optionId).sort();
    assert.deepEqual(question.feedback.messages.map(message => message.targetId).sort(), wrongIds);
    const orders = permutations(question.interaction.options);
    assert.equal(orders.length, 24);
    for (const options of orders) {
      const shuffled = JSON.parse(JSON.stringify({ ...question, interaction: { ...question.interaction, options } }));
      for (const option of options) {
        const response = JSON.parse(JSON.stringify({ type: "choice_single", optionId: option.optionId }));
        const result = scoreQuestion(shuffled, response);
        assert.equal(result.earnedPoints, option.optionId === "A" ? 1 : 0);
        assert.equal(result.maxPoints, 1);
        const messages = shuffled.feedback.messages.filter(message => message.targetId === option.optionId);
        assert.equal(messages.length, option.optionId === "A" ? 0 : 1);
        assert.ok(messages.every(message => message.kind === "wrong_option" && message.text.length > 25));
      }
    }
  });
}

test("P01: domain isolation uses Classic resources; Custom FIFO remains a legal per-group counterexample", () => {
  assert.match(get("B04-004").prompt, /Custom Event Bus - Classic.*isolate.*restrict publishers/);
  assert.match(correctText("B04-004"), /Classic.*scoped policies.*rules and targets/);
  assert.match(details("B04-004"), /AWS::Events::EventBus.*AWS::Events::Rule/);
  assert.match(details("B04-004"), /AWS::EventsV2::EventBus.*AWS::EventsV2::Subscriber/);
  assert.match(details("B04-004"), /cannot configure.*bus/);
  assert.match(get("B04-014").prompt, /default.*Classic.*global publication order/);
  assert.match(details("B04-014"), /FIFO subscriber.*shared EventGroupId.*different EventGroupId.*not.*global/);
  assert.match(get("B04-014").feedback.reason, /per-event-group FIFO.*not global ordering/);
});

test("P02: authored Standard example reports two failures; FIFO stops at record 3 and includes unprocessed 4–10; throw fails the batch", () => {
  for (const suffix of packages.P02) {
    const question = get(suffix);
    assert.match(question.prompt, /SQS Standard queue/);
    assert.match(correctText(suffix), /ReportBatchItemFailures.*batchItemFailures.*two failed message IDs.*idempotent/);
    assert.match(question.feedback.reason, /ReportBatchItemFailures/);
    const example = question.feedback.details.mechanismOrProperty.match(/Return (\{.*?\}) when/);
    assert.ok(example, "learner sees the actual response contract, not an invented handler API");
    assert.deepEqual(JSON.parse(example[1]), { batchItemFailures: [{ itemIdentifier: "id9" }, { itemIdentifier: "id10" }] });
    assert.match(details(suffix), /FIFO.*stop after the first failure.*all failed and unprocessed/);
    assert.match(details(suffix), /position 3.*stop and report IDs 3 through 10.*unprocessed/);
    assert.match(details(suffix), /uncaught exception fails the entire batch/);
    assert.match(question.feedback.details.scenarioApplication, /do not process id4 through id10 and include them/);
  }
  // These checks establish the authored AWS contract, not a deployment of a Lambda handler.
});

test("P03: private REST ingress is distinct from HTTP/Regional private backend integration", () => {
  assert.match(get("B01-004").prompt, /REST API.*only from approved VPCs.*no publicly reachable/);
  assert.match(correctText("B01-004"), /private REST API endpoint.*execute-api interface VPC endpoint.*resource and VPC endpoint access policies/);
  assert.match(details("B01-004"), /aws:SourceVpce/);
  const wrong = get("B01-004").feedback.messages;
  assert.match(wrong.find(message => message.targetId === "regional_private_backend").text, /remains public.*VPC Link/);
  assert.match(wrong.find(message => message.targetId === "http_private_integration").text, /do not provide the private endpoint type/);
  assert.match(wrong.find(message => message.targetId === "C").text, /cannot isolate/);
});

test("P04: six exercises keep Classic rule/archive boundaries and distinct Custom retention/retry/DLQ contracts", () => {
  for (const suffix of packages.P04) {
    assert.match(get(suffix).prompt, /Classic/);
    assert.match(get(suffix).feedback.reason, /Classic/);
    assert.match(get(suffix).feedback.details.boundaryOrTradeoff, /Custom/);
  }
  assert.match(details("B04-005"), /same source bus/);
  assert.match(details("B04-006"), /same bus.*selected rules/);
  assert.match(get("B04-007").feedback.reason, /24 hours and 185 attempts.*300 seconds and 5 retries/);
  assert.match(correctText("B04-007"), /SQS target DLQ.*required permissions/);
  assert.match(get("B04-007").feedback.details.mechanismOrProperty, /dropped unless.*DLQ.*alarm alone does not retain/);
  assert.match(get("B04-008").feedback.details.boundaryOrTradeoff, /subscriber DLQs.*delivery-role.*failure records.*retained events/);
});

test("P05: four realistic alternatives remove the longest-correct cue and explain the actual rejected IDs", () => {
  for (const suffix of packages.P05) {
    const question = get(suffix);
    const a = correctText(suffix);
    assert.ok(question.interaction.options.some(option => option.optionId !== "A" && option.text.length > a.length));
    assert.doesNotMatch(JSON.stringify(question.feedback), /S3 Inventory|S3 lifecycle|flow log|network ACL/i);
  }
  assert.match(get("B01-007").feedback.reason, /best-effort.*API keys are not authentication.*not hard cost caps/);
  assert.match(get("B05-013").feedback.reason, /separate failure domains/);
  assert.match(correctText("B05-017"), /bounded.*backoff with jitter.*fleet connection budget/);
  assert.match(correctText("B07-012"), /provider-supported deduplication or outcome lookup/);
  assert.match(details("B07-012"), /crash.*before saving.*uncertain outcome.*same idempotency key/);
});
