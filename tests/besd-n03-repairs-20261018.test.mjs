import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const trackId = "backend-system-design-interview";
const directory = `content/${trackId}/data_models_storage_selection_indexing_and_transactions`;
const files = [1, 2, 3, 4].map(unit => `${directory}/BESD-N03-B0${unit}.json`);
const sources = new Map(await Promise.all(files.map(async file => [file, JSON.parse(await readFile(path.join(root, file), "utf8"))])));
const before = new Map(files.map(file => [file, JSON.parse(execFileSync("git", ["show", `d7d4e5545f7ce618286c075e751dafaa61aeb937:${file}`], { cwd: root, encoding: "utf8" }))]));
const proof = JSON.parse(await readFile(path.join(root, "evidence/business-quality/besd-n03-20261018-repairs.json"), "utf8"));
const byCurrentId = new Map(proof.items.map(item => [item.questionId, item]));
const byBeforeId = new Map(proof.items.map(item => [item.beforeQuestionId, item]));
const sha256 = value => createHash("sha256").update(value).digest("hex");

function assertNoAnswerLeak(question) {
  const visible = [question.prompt, ...question.constraints].join("\n");
  assert.doesNotMatch(visible, /the primary decision is/i, question.questionId);
  const accepted = question.interaction.options.find(option => option.optionId === question.answer.optionId);
  assert.ok(accepted, question.questionId);
  assert.equal(visible.includes(accepted.text), false, `${question.questionId}: accepted text is not a visible hint`);
  assert.equal(visible.includes(question.feedback.reason), false, `${question.questionId}: feedback Reason was not copied into the prompt`);
}

test("PKG-01: all 72 visible scenarios retain their business invariant without disclosing the answer", () => {
  let count = 0;
  for (const [file, questions] of sources) {
    assert.equal(questions.length, 18, file);
    for (const question of questions) {
      assertNoAnswerLeak(question);
      assert.equal(question.constraints[0], byCurrentId.get(question.questionId).beforeQuestion.constraints[0], `${question.questionId}: business invariant`);
      assert.deepEqual(validateQuestion(question), { valid: true, errors: [] }, question.questionId);
      count++;
    }
  }
  assert.equal(count, 72);
});

test("PKG-01 negative control: the old constraint is detected while option-ID scoring survives reordering", () => {
  for (const questions of sources.values()) for (const authored of questions) {
    const question = structuredClone(authored);
    question.constraints.push(byCurrentId.get(question.questionId).beforeQuestion.constraints[2]);
    assert.throws(() => assertNoAnswerLeak(question), { code: "ERR_ASSERTION" });
    question.interaction.options.reverse();
    const result = scoreQuestion(question, question.answer);
    assert.equal(result.earnedPoints, result.maxPoints, question.questionId);
  }
});

test("immutable before/after evidence accounts for exactly the four FCA units and all 72 original identities", async () => {
  assert.equal(proof.trackId, trackId);
  assert.equal(proof.beforeProducerCommit, "d7d4e5545f7ce618286c075e751dafaa61aeb937");
  assert.equal(proof.items.length, 72);
  assert.equal(byCurrentId.size, 72);
  assert.equal(byBeforeId.size, 72);
  assert.deepEqual([...byBeforeId.keys()].sort(), [...before.values()].flat().map(question => question.questionId).sort());
  assert.deepEqual(proof.sourceFiles.map(file => file.sourceFile), files);
  for (const file of proof.sourceFiles) {
    assert.equal(sha256(await readFile(path.join(root, file.sourceFile))), file.sourceSha256);
    assert.equal(sha256(execFileSync("git", ["show", `${proof.beforeProducerCommit}:${file.sourceFile}`], { cwd: root })), file.beforeSourceSha256);
    const questions = sources.get(file.sourceFile);
    assert.deepEqual(questions.map(question => question.questionId), questions.map(question => question.questionId).sort());
    for (const question of questions) {
      const item = byCurrentId.get(question.questionId);
      assert.deepEqual(item.currentQuestion, question);
      assert.deepEqual(item.beforeQuestion, before.get(file.sourceFile).find(old => old.questionId === item.beforeQuestionId));
      assert.equal(item.beforeQuestionCanonicalSha256, sha256(JSON.stringify(item.beforeQuestion)));
      assert.equal(item.currentQuestionCanonicalSha256, sha256(JSON.stringify(question)));
      assert.ok(item.identityReason.length > 30);
      assert.equal(item.identityAction, item.questionId === item.beforeQuestionId ? "preserve_question_id" : "replace_question_with_new_id");
      if (item.questionId !== item.beforeQuestionId) {
        assert.ok(Number(item.questionId.slice(-3)) > 18, "a replacement has a fresh identity outside the retired range");
        assert.equal(item.questionId.slice(0, -3), item.beforeQuestionId.slice(0, -3));
        assert.equal([...sources.values()].flat().some(current => current.questionId === item.beforeQuestionId), false);
      }
      assert.equal(item.optionIdMapping.length, 5);
      assert.deepEqual(item.optionIdMapping.map(entry => entry.beforeOptionId).sort(), item.beforeQuestion.interaction.options.map(option => option.optionId).sort());
      assert.deepEqual(item.optionIdMapping.map(entry => entry.optionId).sort(), question.interaction.options.map(option => option.optionId).sort());
      assert.ok(item.optionIdMapping.every(entry => entry.reason.length > 0));
      assert.ok(item.changedFields.length > 0);
    }
  }
  const catalog = JSON.parse(await readFile(path.join(root, "content/catalog.json"), "utf8"));
  const oldCatalog = JSON.parse(execFileSync("git", ["show", `${proof.beforeProducerCommit}:content/catalog.json`], { cwd: root, encoding: "utf8" }));
  assert.equal(catalog.tracks.find(track => track.trackId === trackId).contentVersion, proof.contentVersion);
  assert.notEqual(proof.beforeContentVersion, proof.contentVersion);
  for (const track of catalog.tracks.filter(track => track.trackId !== trackId)) {
    assert.deepEqual(track, oldCatalog.tracks.find(old => old.trackId === track.trackId));
  }
  const changedContent = execFileSync("git", ["diff", proof.beforeProducerCommit, "--name-only", "--", "content"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  assert.deepEqual(changedContent.sort(), ["content/catalog.json", ...files].sort());
});

const invariantCases = [
  { id: "besd-n03-b01-i003", accepted: "i019_tenant_owner_authorization", required: [/tenant/i, /server|authoriz|access.*boundary/i], positive: "authorized tenant result", negative: "cross-tenant result must be denied" },
  { id: "besd-n03-b01-i006", accepted: "i020_unique_event_atomic_commit", required: [/partnerId|partner/i, /eventId|event.*key/i, /atomic|transaction/i], positive: "original event commits", negative: "same event replay must not apply a second business effect" },
  { id: "besd-n03-b01-i008", accepted: "i021_guarded_stock_decrement", required: [/atomic|transaction/i, /available|quantity|stock/i, /conditional|only when|positive|greater than|at least|>=/i], positive: "reserve the last available unit", negative: "competing stale reservation must not oversell" },
  { id: "besd-n03-b01-i014", accepted: "i022_booking_interval_exclusion", required: [/overlap|exclusion/i, /atomic|exclusion|guarded|serializ|transaction/i, /resource|room/i], positive: "two different resources can be booked concurrently", negative: "overlapping confirmation for the same resource is rejected" },
  { id: "besd-n03-b01-i017", accepted: "i023_provider_idempotent_intent", required: [/intent/i, /idempotenc/i, /reconcil/i], positive: "first authorization succeeds", negative: "delayed acknowledgement reuses the same intent without another charge" },
  { id: "besd-n03-b02-i007", accepted: "i019_booking_exclusion_store", required: [/overlap|exclusion/i, /atomic|exclusion|serializ/i, /resource|room/i], positive: "nonoverlapping booking is stored", negative: "overlapping confirmation for the same resource is rejected" },
  { id: "besd-n03-b02-i010", accepted: "i020_intent_reconcile_after_retention", required: [/intent/i, /provider key|idempotenc/i, /reconcil/i], positive: "timeout is reconciled against the existing charge", negative: "new intent on an ambiguous timeout is rejected" },
  { id: "besd-n03-b02-i016", accepted: "i021_checkpointed_audit_append", required: [/append|immutable/i, /actor|attribut|author/i, /retention|retain/i, /sequence.*hash|hash.*chain/i, /independent.*checkpoint/i], positive: "attributable immutable evidence is appended", negative: "overwrite or silent loss is rejected" },
];

// Independent scenario anchors detect a valid-looking option shifted onto the
// neighbouring record when a mixed old/new-ID unit is sorted. These are semantic
// content regressions, not claims about a running database or provider.
const scenarioMechanisms = {
  B01: [/operation|extraction/i, /allocation|ticket|pending|seat/i, /tenant/i, /metadata|asset|watermark/i, /command|device/i, /event|partner/i, /revision|ETag|conditional/i, /stock|quantity|inventory/i, /progress|event|completion/i, /price|version|revision/i, /revocation|epoch|credential/i, /job|worker/i, /flag|rollout|version/i, /overlap|exclusion/i, /source|watermark|search/i, /route|urgent|dispatch/i, /payment|intent|charge/i, /fraud|risk|case|priority/i],
  B02: [/stock|inventory|reservation|conditional/i, /progress|event|completion/i, /price|version|merchant/i, /revocation|epoch|session/i, /job|transcod/i, /flag|rollout|version/i, /overlap|exclusion/i, /search|watermark|projection/i, /route|urgent|priority/i, /payment|intent|charge/i, /risk|case|priority/i, /payroll|period|snapshot/i, /report|cutoff|aggregate/i, /telemetry|time.series|raw|rollup/i, /preference|notification|delivery/i, /audit|ledger|append/i, /parcel|sequence|carrier/i, /extraction|operation|billable/i],
  B03: [/outbox|watermark|source.version/i, /input|snapshot|route/i, /intent|reconcil/i, /case|queue/i, /period|payroll|export|rules/i, /cutoff|aggregate|report/i, /raw|telemetry|rollup/i, /preference/i, /audit/i, /carrier|parcel|sequence/i, /extraction|operation|billable|job/i, /allocation/i, /tenant|authoriz|ACL/i, /metadata|catalog/i, /command|device/i, /webhook|event.*intent|delivery.*status/i, /document|revision|conflict/i, /inventory|stock|reservation/i],
};

test("all 54 model/storage/projection decisions remain attached to their original domain after identity changes", () => {
  for (const [unit, patterns] of Object.entries(scenarioMechanisms)) for (let index = 0; index < patterns.length; index++) {
    const item = byBeforeId.get(`besd-n03-${unit.toLowerCase()}-i${String(index + 1).padStart(3, "0")}`);
    const question = item.currentQuestion;
    const accepted = question.interaction.options.find(option => option.optionId === question.answer.optionId);
    assert.match(accepted.text, patterns[index], item.beforeQuestionId);
    assert.doesNotMatch(question.prompt, /^\s*Access path and guard:/, "a feedback sentence must not replace the actual scenario");
  }
});

for (const fixture of invariantCases) {
  test(`PKG-03 semantic fixture ${fixture.id}: ${fixture.positive} / ${fixture.negative}`, () => {
    const item = byBeforeId.get(fixture.id);
    const question = item.currentQuestion;
    const expected = proof.invariantRegressionMatrix.find(entry => entry.beforeQuestionId === fixture.id);
    assert.ok(expected, fixture.id);
    assert.equal(question.answer.optionId, fixture.accepted, "the independent regression fixture pins the accepted mechanism");
    assert.equal(expected.acceptedOptionId, fixture.accepted, "proof agrees with the independent regression fixture");
    const accepted = question.interaction.options.find(option => option.optionId === expected.acceptedOptionId);
    for (const pattern of fixture.required) assert.match(accepted.text, pattern, fixture.id);
    assert.ok(item.positiveCase.length > 0 && item.negativeCase.length > 0);
    assert.equal(scoreQuestion(question, { type: "choice_single", optionId: expected.acceptedOptionId }).earnedPoints, 1);
    assert.ok(expected.rejectedOptionIds.length >= 1);
    for (const optionId of expected.rejectedOptionIds) {
      assert.ok(question.interaction.options.some(option => option.optionId === optionId));
      assert.equal(scoreQuestion(question, { type: "choice_single", optionId }).earnedPoints, 0);
      assert.ok(question.feedback.messages.some(message => message.targetId === optionId));
      const mutated = structuredClone(question);
      mutated.answer.optionId = optionId;
      assert.notEqual(mutated.answer.optionId, expected.acceptedOptionId, "negative control rejects a re-keyed near-miss");
      assert.equal(scoreQuestion(mutated, { type: "choice_single", optionId: expected.acceptedOptionId }).earnedPoints, 0);
    }
  });
}

test("PKG-02: every indexing item has an explicit measured query, maintenance tradeoff and independent domain guarantee", () => {
  for (let ordinal = 1; ordinal <= 18; ordinal++) {
    const item = byBeforeId.get(`besd-n03-b04-i${String(ordinal).padStart(3, "0")}`);
    const question = item.currentQuestion;
    assert.equal(item.identityAction, "replace_question_with_new_id");
    assert.ok(item.queryWorkload.length > 15, item.beforeQuestionId);
    assert.ok(item.indexTradeoff.length > 15, item.beforeQuestionId);
    assert.ok(item.separateDomainGuarantee.length > 15, item.beforeQuestionId);
    assert.match(question.prompt, /query|lookup|filter|SELECT|scan|EXPLAIN/i, item.beforeQuestionId);
    assert.match([question.prompt, ...question.constraints].join(" "), /write|maintenance|update|insert|storage/i, item.beforeQuestionId);
    const accepted = question.interaction.options.find(option => option.optionId === question.answer.optionId);
    assert.match(accepted.text, /index|scan|access path|b-tree|\([a-z_]+(?:,|\))|resource\/time-range/i, item.beforeQuestionId);
    const strongestWrong = question.interaction.options.find(option => option.optionId === item.strongestWrongOptionId);
    assert.ok(strongestWrong, item.beforeQuestionId);
    const wrongScore = scoreQuestion(question, { type: "choice_single", optionId: strongestWrong.optionId });
    assert.equal(wrongScore.earnedPoints, 0);
  }
});

test("PKG-04: all alternatives have their own matching diagnostic ID and scenario-specific explanation", () => {
  for (const questions of sources.values()) for (const question of questions) {
    const options = question.interaction.options;
    const wrong = options.filter(option => option.optionId !== question.answer.optionId);
    assert.equal(wrong.length, 4);
    assert.equal(question.feedback.messages.length, 4);
    assert.equal(new Set(question.feedback.messages.map(message => message.targetId)).size, 4);
    assert.doesNotMatch(question.feedback.details.errorCorrection, /^The distractors either/);
    assert.doesNotMatch(question.feedback.reason, /through an explicit mechanism/);
    for (const option of wrong) {
      const messages = question.feedback.messages.filter(message => message.kind === "wrong_option" && message.targetId === option.optionId);
      assert.equal(messages.length, 1, `${question.questionId}/${option.optionId}`);
      assert.ok(messages[0].text.length > 30);
      assert.doesNotMatch(messages[0].text, /^The architecture decision should survive a provider change/);
      assert.equal(scoreQuestion(question, { type: "choice_single", optionId: option.optionId }).earnedPoints, 0);
    }
    for (const message of question.feedback.messages) assert.ok(wrong.some(option => option.optionId === message.targetId));
    assert.equal(scoreQuestion(question, question.answer).earnedPoints, 1);
  }
});
