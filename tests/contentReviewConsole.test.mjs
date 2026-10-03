import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { createContentReviewConsole, startContentReviewConsole, CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION, LAUNCH_TRACK_IDS } from "../scripts/review/content-review-console.mjs";
import { validateSchema } from "../scripts/review/schema-validation.mjs";
import { validateQuestion } from "../scripts/content/question-contract.mjs";

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
  assert.equal(service.listItems({ riskOnly: true }).length, warned.length + 1);
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
