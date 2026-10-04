import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { createContentReviewConsole, startContentReviewConsole, CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION, LAUNCH_TRACK_IDS } from "../scripts/review/content-review-console.mjs";
import { validateSchema } from "../scripts/review/schema-validation.mjs";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const AUTHOR_CONSTRAINT_RISK = "author_instruction_in_constraints";
const BESD_UNIT_COHORT14_URL = new URL("../evidence/business-quality/bizq-01-besd-seed-cohort-14.json", import.meta.url);

test("review console surfaces a remaining BESD constraint disclosure without recording an outcome", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "bizq-review-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const reviewPath = join(directory, "outcomes.json");
  const service = await createContentReviewConsole({ reviewPath });
  const item = service.getItem("backend-system-design-interview", "besd-n04-b02-i001");
  assert.ok(item.item.constraints.some((constraint) => constraint.startsWith("The primary decision is")));
  assert.ok(item.riskFlags.includes(AUTHOR_CONSTRAINT_RISK));
  assert.equal(item.review.status, "unreviewed");
  assert.ok(service.listItems({ trackId: item.trackId, riskOnly: true }).some((candidate) => candidate.questionId === item.questionId));
  await assert.rejects(readFile(reviewPath), { code: "ENOENT" });

  const cohort = JSON.parse(await readFile(BESD_UNIT_COHORT14_URL, "utf8"));
  for (const replacement of cohort.replacements) {
    const repaired = service.getItem(cohort.trackId, replacement.questionId);
    assert.ok(!repaired.riskFlags.includes(AUTHOR_CONSTRAINT_RISK), replacement.questionId);
    assert.ok(repaired.item.constraints.every((constraint) => !constraint.startsWith("The primary decision is")), replacement.questionId);
  }
});

test("constraint warning is advisory across interactions and does not flag ordinary worked examples or feedback", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "bizq-review-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const source = await createContentReviewConsole({ reviewPath: join(directory, "unused.json") });
  const records = source.listItems();
  const files = new Map();
  const add = (record, suffix, constraints, feedbackOnly = false) => {
    const question = structuredClone(record.item);
    question.questionId += suffix;
    if (constraints === undefined) delete question.constraints;
    else question.constraints = constraints;
    if (feedbackOnly) question.feedback.reason = "The primary decision is explained after submission.";
    const valid = validateQuestion(question);
    assert.equal(valid.valid, true, valid.errors.join("\n"));
    const path = join(directory, record.sourceFile);
    files.set(path, [...(files.get(path) ?? []), question]);
    return { trackId: record.trackId, questionId: question.questionId };
  };
  // Tiny real-shape fixture: one item per registered track and each interaction.
  const clean = LAUNCH_TRACK_IDS.map((trackId) => add(records.find((record) => record.trackId === trackId), "-clean", ["Use binary search on the sorted array; identify the lower bound."], true));
  const warned = [...new Set(records.map((record) => record.item.interaction.type))].map((type) => add(records.find((record) => record.item.interaction.type === type), "-warning", ["  tHe\n PRIMARY   decision IS to choose the accepted mechanism."]));
  const repeated = add(records[0], "-repeated", ["The primary decision is x.", "The primary decision is y."]);
  const absent = add(records[0], "-absent", undefined);
  for (const [path, questions] of files) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(questions));
  }
  const service = await createContentReviewConsole({ root: directory });
  for (const item of [...clean, absent]) assert.ok(!service.getItem(item.trackId, item.questionId).riskFlags.includes(AUTHOR_CONSTRAINT_RISK));
  for (const item of [...warned, repeated]) {
    const projected = service.getItem(item.trackId, item.questionId);
    assert.equal(projected.riskFlags.filter((flag) => flag === AUTHOR_CONSTRAINT_RISK).length, 1);
    assert.equal(projected.review.status, "unreviewed");
  }
  assert.equal(service.listItems({ riskOnly: true }).filter((item) => item.riskFlags.includes(AUTHOR_CONSTRAINT_RISK)).length, warned.length + 1);
});

test("Q14 flags a valid sole-longest correct choice for human review without changing scoring", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "bizq-q14-review-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const source = await createContentReviewConsole({ reviewPath: join(directory, "unused.json") });
  const records = source.listItems();
  const files = new Map();
  for (const trackId of LAUNCH_TRACK_IDS) {
    const record = records.find((candidate) => candidate.trackId === trackId && candidate.item.interaction.type === "choice_single" && candidate.item.answer.type === "choice_single");
    assert.ok(record, `single-choice fixture available for ${trackId}`);
    const question = structuredClone(record.item);
    question.questionId = `q14-fixture-${trackId}`;
    if (trackId === "coding-interview-dsa-problem-solving") {
      const correctId = question.answer.optionId;
      question.prompt = "A sorted random-access list is searched for the first value meeting a threshold. The search must use O(log n) comparisons without re-sorting the list. Which algorithm satisfies these requirements?";
      question.constraints = [];
      question.interaction.options = question.interaction.options.map((option) => ({
        ...option,
        text: option.optionId === correctId
          ? "Use binary search to find the lower bound, preserving the sorted-order invariant and narrowing the candidate interval at each comparison until the first qualifying position is identified."
          : ["Scan from the start.", "Sort the list again.", "Return the final element."][question.interaction.options.findIndex((candidate) => candidate.optionId === option.optionId) % 3],
      }));
      question.answer = { type: "choice_single", optionId: correctId };
      assert.equal(validateQuestion(question).valid, true);
    }
    const path = join(directory, record.sourceFile);
    files.set(path, [...(files.get(path) ?? []), question]);
  }
  const codingRecord = records.find((candidate) => candidate.trackId === "coding-interview-dsa-problem-solving" && candidate.item.interaction.type === "choice_single" && candidate.item.answer.type === "choice_single");
  const addSingleControl = (suffix, correctText, wrongTexts, malformed = false) => {
    const question = structuredClone(codingRecord.item);
    question.questionId = `q14-fixture-${suffix}`;
    question.constraints = [];
    if (malformed) question.interaction.options = null;
    else {
      let wrongIndex = 0;
      question.interaction.options = question.interaction.options.map((option) => ({
        ...option,
        text: option.optionId === question.answer.optionId ? correctText : wrongTexts[wrongIndex++ % wrongTexts.length],
      }));
    }
    if (!malformed) assert.equal(validateQuestion(question).valid, true);
    const path = join(directory, codingRecord.sourceFile);
    files.set(path, [...(files.get(path) ?? []), question]);
    return question.questionId;
  };
  const tiedId = addSingleControl("tied", "Keep the current valid state", ["Keep the prior valid state", "Use a cache", "Retry later"]);
  const longWrongId = addSingleControl("long-wrong", "Use binary search", ["This incorrect alternative is intentionally much longer than the keyed choice so it must not produce the correct-option length advisory.", "Sort again", "Read the first value"]);
  const malformedId = addSingleControl("malformed", "Ignored malformed text", [], true);
  const missingKey = structuredClone(codingRecord.item);
  missingKey.questionId = "q14-fixture-missing-key";
  missingKey.constraints = [];
  missingKey.answer.optionId = "not-an-authored-option";
  const duplicateOption = structuredClone(codingRecord.item);
  duplicateOption.questionId = "q14-fixture-duplicate-option-id";
  duplicateOption.constraints = [];
  duplicateOption.interaction.options[1].optionId = duplicateOption.interaction.options[0].optionId;
  const invalidKeyControls = ["", "   ", " padded-key "].map((invalidId, index) => {
    const question = structuredClone(codingRecord.item);
    question.questionId = `q14-fixture-invalid-key-${index}`;
    question.constraints = [];
    const oldKey = question.answer.optionId;
    question.answer.optionId = invalidId;
    question.interaction.options = question.interaction.options.map((option) => ({
      ...option,
      optionId: option.optionId === oldKey ? invalidId : option.optionId,
      text: option.optionId === oldKey ? "This keyed text is intentionally much longer than every other short alternative in this schema-invalid identity control." : "Short alternative",
    }));
    assert.equal(validateQuestion(question).valid, false, `invalid authored ID ${index}`);
    return question;
  });
  const codingPath = join(directory, codingRecord.sourceFile);
  files.set(codingPath, [...(files.get(codingPath) ?? []), missingKey, duplicateOption, ...invalidKeyControls]);
  const multiRecord = records.find((candidate) => candidate.item.interaction.type === "choice_multiple" && candidate.item.answer.type === "choice_multiple");
  assert.ok(multiRecord, "multi-choice control available");
  const multi = structuredClone(multiRecord.item);
  multi.questionId = "q14-fixture-multi-control";
  multi.constraints = [];
  assert.equal(validateQuestion(multi).valid, true);
  const multiPath = join(directory, multiRecord.sourceFile);
  files.set(multiPath, [...(files.get(multiPath) ?? []), multi]);
  for (const [path, questions] of files) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(questions));
  }

  const syntheticTrack = "coding-interview-dsa-problem-solving";
  const syntheticId = `q14-fixture-${syntheticTrack}`;
  const service = await createContentReviewConsole({ root: directory, reviewPath: join(directory, "outcomes.json") });
  const question = service.getItem(syntheticTrack, syntheticId);
  assert.equal(question.riskFlags.filter((flag) => flag === "correct_option_sole_longest").length, 1);
  assert.equal(question.review.status, "unreviewed");
  assert.ok(service.listItems({ trackId: syntheticTrack, riskOnly: true }).some((item) => item.questionId === syntheticId));
  for (const controlRef of [
    { trackId: syntheticTrack, questionId: tiedId },
    { trackId: syntheticTrack, questionId: longWrongId },
    { trackId: syntheticTrack, questionId: malformedId },
    { trackId: syntheticTrack, questionId: missingKey.questionId },
    { trackId: syntheticTrack, questionId: duplicateOption.questionId },
    ...invalidKeyControls.map((control) => ({ trackId: syntheticTrack, questionId: control.questionId })),
    { trackId: multiRecord.trackId, questionId: multi.questionId },
  ]) {
    const control = service.getItem(controlRef.trackId, controlRef.questionId);
    assert.ok(!control.riskFlags.includes("correct_option_sole_longest"), controlRef.questionId);
  }
  await assert.rejects(readFile(join(directory, "outcomes.json")), { code: "ENOENT" });

  const correctId = question.item.answer.optionId;
  const options = question.item.interaction.options;
  assert.equal(validateQuestion(question.item).valid, true);
  for (const candidate of [question.item, { ...question.item, interaction: { ...question.item.interaction, options: [...options].reverse() } }]) {
    for (const option of options) {
      const score = scoreQuestion(candidate, { type: "choice_single", optionId: option.optionId });
      assert.equal(score.earnedPoints, option.optionId === correctId ? 1 : 0, option.optionId);
      assert.equal(score.status, option.optionId === correctId ? "correct" : "incorrect", option.optionId);
    }
  }
});

test("review console exposes exactly nine launch tracks, navigable coverage, and advisory signals", async () => {
  const service = await createContentReviewConsole({ reviewPath: join(await mkdtemp("patternly-review-console-"), "outcomes.json") });
  const catalog = service.catalog();
  assert.equal(catalog.launchTrackCount, 9);
  assert.deepEqual(catalog.tracks.map((track) => track.trackId), LAUNCH_TRACK_IDS);
  assert.ok(catalog.tracks.every((track) => track.itemCount > 0 && track.nodes.length > 0));
  const items = service.listItems({ trackId: LAUNCH_TRACK_IDS[0] });
  assert.ok(items.length > 0);
  assert.ok(items[0].coverage.nodeItemCount > 0);
  assert.equal(service.listItems({ trackId: LAUNCH_TRACK_IDS[0], riskOnly: true }).every((item) => item.riskFlags.length > 0), true);
});

test("review console records one current explicit outcome and invalidates it when source identity changes", async () => {
  const directory = await mkdtemp("patternly-review-console-");
  const reviewPath = join(directory, "outcomes.json");
  const service = await createContentReviewConsole({ reviewPath, now: () => "2026-08-24T12:00:00.000Z" });
  const item = service.listItems({ trackId: "google-cloud-associate-cloud-engineer" })[0];
  const reviewed = await service.recordOutcome({ trackId: item.trackId, questionId: item.questionId, outcome: "needs_change", note: "Clarify the boundary between the two alternatives.", reviewerId: "owner-local" });
  assert.equal(reviewed.review.status, "needs_change");
  assert.match(await readFile(reviewPath, "utf8"), new RegExp(CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION));
  const current = service.getItem(item.trackId, item.questionId);
  assert.equal(current.review.status, "needs_change");
  assert.equal(current.review.changedFields.length, 0);
  const second = await service.recordOutcome({ trackId: item.trackId, questionId: item.questionId, outcome: "approved", note: "Rechecked the current source question.", reviewerId: "owner-local" });
  assert.equal(second.review.status, "approved");
  const store = JSON.parse(await readFile(reviewPath, "utf8"));
  const schema = JSON.parse(await readFile(new URL("../schemas/review/content-review-outcome.schema.json", import.meta.url), "utf8"));
  await validateSchema(store, schema, "content review outcomes");
  assert.equal(store.reviews.length, 1);
  assert.equal(store.reviews[0].questionId, item.questionId);
  assert.equal(store.reviews[0].mentalUnitId, item.mentalUnitId);
  assert.equal(Object.hasOwn(store.reviews[0], "itemId"), false);
  assert.equal(Object.hasOwn(store.reviews[0], "learningBlockId"), false);
  await rm(directory, { recursive: true, force: true });
});

test("review console serves a local UI and bounded JSON API without fabricating approval", async () => {
  const directory = await mkdtemp("patternly-review-console-");
  const running = await startContentReviewConsole({ reviewPath: join(directory, "outcomes.json"), port: 0 });
  const address = running.server.address();
  const page = await fetch(`http://127.0.0.1:${address.port}/`);
  assert.equal(page.status, 200);
  const pageHtml = await page.text();
  assert.match(pageHtml, /Patternly Content Review Console/);
  assert.match(pageHtml, /questionId/);
  assert.match(pageHtml, /<textarea id="note" required><\/textarea><\/label><button>Record current outcome<\/button>/);
  assert.doesNotMatch(pageHtml, /itemId/);
  const detail = await fetch(`http://127.0.0.1:${address.port}/api/items/backend-system-design-interview/besd-n04-b02-i001`);
  assert.equal(detail.status, 200);
  const item = await detail.json();
  assert.ok(item.riskFlags.includes(AUTHOR_CONSTRAINT_RISK));
  assert.ok(item.item.constraints.some((constraint) => constraint.startsWith("The primary decision is")));
  assert.match(pageHtml, /\['Constraints',/);
  const risks = await fetch(`http://127.0.0.1:${address.port}/api/items?trackId=backend-system-design-interview&riskOnly=true`);
  assert.equal(risks.status, 200);
  assert.ok((await risks.json()).items.some((candidate) => candidate.questionId === item.questionId));
  await assert.rejects(readFile(join(directory, "outcomes.json")), { code: "ENOENT" });
  const catalog = await fetch(`http://127.0.0.1:${address.port}/api/catalog`);
  assert.equal(catalog.status, 200);
  assert.equal((await catalog.json()).launchTrackCount, 9);
  const response = await fetch(`http://127.0.0.1:${address.port}/api/reviews/batch`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: [], outcome: "approved", note: "No-op", reviewerId: "owner-local" }) });
  assert.equal(response.status, 400);
  await new Promise((resolve) => running.server.close(resolve));
  await rm(directory, { recursive: true, force: true });
});
