import assert from "node:assert/strict";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const bank = await loadCurrentQuestionBank("backend-system-design-interview");
const blocks = ["B01", "B02", "B03", "B04"];
const questions = bank.questions.filter((question) => /^besd-n03-b0[1-4]-/.test(question.questionId));
const get = (id) => {
  const question = bank.byId.get(id);
  assert.ok(question, `current bank includes ${id}`);
  return question;
};
const domainMechanisms = new Map([
  ["besd-n03-b01-i001", /operation|extraction/i], ["besd-n03-b01-i002", /allocation|ticket|pending|seat/i], ["besd-n03-b01-i004", /metadata|asset|watermark/i],
  ["besd-n03-b01-i005", /command|device/i], ["besd-n03-b01-i007", /revision|ETag|conditional/i], ["besd-n03-b01-i009", /progress|event|completion/i],
  ["besd-n03-b01-i010", /price|version|revision/i], ["besd-n03-b01-i011", /revocation|epoch|credential/i], ["besd-n03-b01-i012", /job|worker/i],
  ["besd-n03-b01-i013", /flag|rollout|version/i], ["besd-n03-b01-i015", /source|watermark|search/i], ["besd-n03-b01-i016", /route|urgent|dispatch/i],
  ["besd-n03-b01-i018", /fraud|risk|case|priority/i], ["besd-n03-b01-i019", /tenant/i], ["besd-n03-b01-i020", /event|partner/i],
  ["besd-n03-b01-i021", /stock|quantity|inventory/i], ["besd-n03-b01-i022", /overlap|exclusion/i], ["besd-n03-b01-i023", /payment|intent|charge/i],
  ["besd-n03-b02-i001", /stock|inventory|reservation|conditional/i], ["besd-n03-b02-i002", /progress|event|completion/i], ["besd-n03-b02-i003", /price|version|merchant/i],
  ["besd-n03-b02-i004", /revocation|epoch|session/i], ["besd-n03-b02-i005", /job|transcod/i], ["besd-n03-b02-i006", /flag|rollout|version/i],
  ["besd-n03-b02-i008", /search|watermark|projection/i], ["besd-n03-b02-i009", /route|urgent|priority/i], ["besd-n03-b02-i011", /risk|case|priority/i],
  ["besd-n03-b02-i012", /payroll|period|snapshot/i], ["besd-n03-b02-i013", /report|cutoff|aggregate/i], ["besd-n03-b02-i014", /telemetry|time.series|raw|rollup/i],
  ["besd-n03-b02-i015", /preference|notification|delivery/i], ["besd-n03-b02-i017", /parcel|sequence|carrier/i], ["besd-n03-b02-i018", /extraction|operation|billable/i],
  ["besd-n03-b02-i019", /overlap|exclusion/i], ["besd-n03-b02-i020", /intent|provider key|idempotenc/i], ["besd-n03-b02-i021", /audit|append|checkpoint/i],
  ["besd-n03-b03-i001", /outbox|watermark|source.version/i], ["besd-n03-b03-i004", /case|queue/i], ["besd-n03-b03-i007", /raw|telemetry|rollup/i],
  ["besd-n03-b03-i009", /audit/i], ["besd-n03-b03-i010", /carrier|parcel|sequence/i], ["besd-n03-b03-i012", /allocation/i],
  ["besd-n03-b03-i014", /metadata|catalog/i], ["besd-n03-b03-i016", /webhook|event.*intent|delivery.*status/i], ["besd-n03-b03-i017", /document|revision|conflict/i],
  ["besd-n03-b03-i018", /inventory|stock|reservation/i], ["besd-n03-b03-i020", /route|snapshot/i], ["besd-n03-b03-i021", /intent|reconcil/i],
  ["besd-n03-b03-i023", /payroll|period|export/i], ["besd-n03-b03-i024", /cutoff|aggregate|report/i], ["besd-n03-b03-i026", /preference/i],
  ["besd-n03-b03-i029", /extraction|operation|billable|job/i], ["besd-n03-b03-i031", /tenant|authoriz|ACL/i], ["besd-n03-b03-i033", /command|device/i]
]);

const invariantCases = [
  { id: "besd-n03-b01-i019", accepted: "i019_tenant_owner_authorization", required: [/tenant/i, /server|authoriz|access.*boundary/i], positive: "authorized tenant result", negative: "cross-tenant result must be denied" },
  { id: "besd-n03-b01-i020", accepted: "i020_unique_event_atomic_commit", required: [/partnerId|partner/i, /eventId|event.*key/i, /atomic|transaction/i], positive: "original event commits", negative: "same event replay must not apply another business effect" },
  { id: "besd-n03-b01-i021", accepted: "i021_guarded_stock_decrement", required: [/atomic|transaction/i, /available|quantity|stock/i, /conditional|only when|positive|greater than|at least|>=/i], positive: "last available unit is reserved once", negative: "competing stale reservation must not oversell" },
  { id: "besd-n03-b01-i022", accepted: "i022_booking_interval_exclusion", required: [/overlap|exclusion/i, /atomic|exclusion|guarded|serializ|transaction/i, /resource|room/i], positive: "two different resources book concurrently", negative: "overlapping same-resource confirmation is rejected" },
  { id: "besd-n03-b01-i023", accepted: "i023_provider_idempotent_intent", required: [/intent/i, /idempotenc/i, /reconcil/i], positive: "first provider authorization succeeds", negative: "ambiguous timeout reuses the same intent without another charge" },
  { id: "besd-n03-b02-i019", accepted: "i019_booking_exclusion_store", required: [/overlap|exclusion/i, /atomic|exclusion|serializ/i, /resource|room/i], positive: "nonoverlapping booking is stored", negative: "overlapping same-resource confirmation is rejected" },
  { id: "besd-n03-b02-i020", accepted: "i020_intent_reconcile_after_retention", required: [/intent/i, /provider key|idempotenc/i, /reconcil/i], positive: "timeout reconciles against the existing charge", negative: "new intent on an ambiguous timeout is rejected" },
  { id: "besd-n03-b02-i021", accepted: "i021_checkpointed_audit_append", required: [/append|immutable/i, /actor|attribut|author/i, /retention|retain/i, /sequence.*hash|hash.*chain/i, /independent.*checkpoint/i], positive: "attributable immutable evidence is appended", negative: "overwrite or silent loss is rejected" }
];

function assertNoAnswerLeak(question) {
  const visible = [question.prompt, ...question.constraints].join("\n");
  assert.doesNotMatch(visible, /the primary decision is/i, question.questionId);
  const accepted = question.interaction.options.find((option) => option.optionId === question.answer.optionId);
  assert.ok(accepted, question.questionId);
  assert.equal(visible.includes(accepted.text), false, `${question.questionId}: accepted text is not a visible hint`);
  assert.equal(visible.includes(question.feedback.reason), false, `${question.questionId}: feedback reason is not copied into the prompt`);
}

test("all 72 current cases retain a concrete business invariant, hide the key, and validate", () => {
  assert.equal(questions.length, 72);
  for (const block of blocks) {
    const group = questions.filter((question) => question.questionId.includes(`-${block.toLowerCase()}-`));
    assert.equal(group.length, 18, `${block} case count`);
  }
  for (const question of questions) {
    assert.ok(question.prompt.length > 60, `${question.questionId}: concrete scenario`);
    assert.ok(question.constraints.length >= 1 && question.constraints.every((constraint) => constraint.length > 20), question.questionId);
    assertNoAnswerLeak(question);
    assert.equal(validateQuestion(question).valid, true, question.questionId);
  }
  assert.equal(domainMechanisms.size, 54);
  for (const [id, mechanism] of domainMechanisms) {
    const question = get(id);
    const accepted = question.interaction.options.find((option) => option.optionId === question.answer.optionId);
    assert.match(accepted.text, mechanism, id);
    assert.doesNotMatch(question.prompt, /^\s*Access path and guard:/, id);
  }

  const leaked = structuredClone(get("besd-n03-b01-i019"));
  leaked.constraints.push(leaked.interaction.options.find((option) => option.optionId === leaked.answer.optionId).text);
  assert.throws(() => assertNoAnswerLeak(leaked), assert.AssertionError, "negative control catches a visible answer leak");
});

test("eight independently specified business cases retain their positive and negative outcomes", () => {
  for (const fixture of invariantCases) {
    const question = get(fixture.id);
    assert.equal(question.answer.optionId, fixture.accepted, `${fixture.id}: expected decision`);
    const accepted = question.interaction.options.find((option) => option.optionId === fixture.accepted);
    for (const pattern of fixture.required) assert.match(accepted.text, pattern, fixture.id);
    assert.ok(fixture.positive.length > 0 && fixture.negative.length > 0);
    assert.equal(scoreQuestion(question, { type: "choice_single", optionId: fixture.accepted }).earnedPoints, 1);
    const wrong = question.interaction.options.find((option) => option.optionId !== fixture.accepted);
    assert.ok(wrong, fixture.id);
    assert.equal(scoreQuestion(question, { type: "choice_single", optionId: wrong.optionId }).earnedPoints, 0);
    assert.ok(question.feedback.messages.some((message) => message.targetId === wrong.optionId));
    const mutated = structuredClone(question);
    mutated.answer.optionId = wrong.optionId;
    assert.equal(scoreQuestion(mutated, { type: "choice_single", optionId: fixture.accepted }).earnedPoints, 0, `${fixture.id}: negative control rejects a re-keyed near miss`);
  }
});

test("all 18 measured index choices state both query work and write or storage tradeoffs", () => {
  const indexed = questions.filter((question) => question.questionId.includes("-b04-"));
  assert.equal(indexed.length, 18);
  for (const question of indexed) {
    assert.match(question.prompt, /query|lookup|filter|SELECT|scan|EXPLAIN/i, question.questionId);
    assert.match([question.prompt, ...question.constraints].join(" "), /write|maintenance|update|insert|storage|index/i, question.questionId);
    const accepted = question.interaction.options.find((option) => option.optionId === question.answer.optionId);
    assert.match(accepted.text, /index|scan|access path|b-tree|\([a-z_]+(?:,|\))|resource\/time-range/i, question.questionId);
    assert.match(question.prompt, /\d|measured|plan|scan|rows|latency|selectivity|EXPLAIN (?:shows|reports)|existing .* lookup (?:meets|already uses)/i, `${question.questionId}: observed workload or plan evidence`);
    const wrong = question.interaction.options.filter((option) => option.optionId !== question.answer.optionId);
    assert.equal(question.feedback.messages.length, wrong.length, question.questionId);
    for (const option of wrong) {
      assert.equal(scoreQuestion(question, { type: "choice_single", optionId: option.optionId }).earnedPoints, 0, `${question.questionId}/${option.optionId}`);
      assert.ok(question.feedback.messages.some((message) => message.targetId === option.optionId && message.text.length > 30), question.questionId);
    }
    assert.equal(scoreQuestion(question, question.answer).earnedPoints, 1, question.questionId);
  }
});

test("all alternatives have their own matching diagnostic ID and scenario-specific explanation", () => {
  for (const question of questions) {
    const options = question.interaction.options;
    const wrong = options.filter((option) => option.optionId !== question.answer.optionId);
    assert.equal(wrong.length, 4, question.questionId);
    assert.equal(question.feedback.messages.length, 4, question.questionId);
    assert.equal(new Set(question.feedback.messages.map((message) => message.targetId)).size, 4, question.questionId);
    assert.doesNotMatch(question.feedback.details.errorCorrection, /^The distractors either/);
    assert.doesNotMatch(question.feedback.reason, /through an explicit mechanism/);
    for (const option of wrong) {
      const matching = question.feedback.messages.filter((message) => message.kind === "wrong_option" && message.targetId === option.optionId);
      assert.equal(matching.length, 1, `${question.questionId}/${option.optionId}`);
      assert.ok(matching[0].text.length > 30, `${question.questionId}/${option.optionId}`);
      assert.notEqual(scoreQuestion(question, { type: "choice_single", optionId: option.optionId }).earnedPoints, 1);
    }
    assert.equal(scoreQuestion(question, question.answer).earnedPoints, 1, question.questionId);
  }
});
