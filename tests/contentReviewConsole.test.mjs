import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chmod, link, mkdir, mkdtemp, open, readFile, realpath, rename, rm, stat, lstat, symlink, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { createContentReviewConsole, startContentReviewConsole, CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION, LAUNCH_TRACK_IDS } from "../scripts/review/content-review-console.mjs";
import { validateSchema } from "../scripts/review/schema-validation.mjs";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const AUTHOR_CONSTRAINT_RISK = "author_instruction_in_constraints";
const BESD_UNIT_COHORT14_URL = new URL("../evidence/business-quality/bizq-01-besd-seed-cohort-14.json", import.meta.url);
const reviewFs = { mkdir, open, readFile, realpath, rename, stat, lstat, unlink };

async function temporaryReviewPath(t, prefix = "patternly-review-console-") {
  const directory = await mkdtemp(join(tmpdir(), prefix));
  t.after(() => rm(directory, { recursive: true, force: true }));
  // Production canonicalizes the parent before lock and rename operations.
  // Use that same identity in injected-fs assertions on macOS, where /var is
  // an alias for /private/var.
  const canonicalDirectory = await realpath(directory);
  return { directory, reviewPath: join(canonicalDirectory, "outcomes.json") };
}

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

test("review console exposes exactly nine launch tracks, navigable coverage, and advisory signals", async (t) => {
  const { reviewPath } = await temporaryReviewPath(t);
  const service = await createContentReviewConsole({ reviewPath });
  const catalog = service.catalog();
  assert.equal(catalog.launchTrackCount, 9);
  assert.deepEqual(catalog.tracks.map((track) => track.trackId), LAUNCH_TRACK_IDS);
  assert.ok(catalog.tracks.every((track) => track.itemCount > 0 && track.nodes.length > 0));
  const items = service.listItems({ trackId: LAUNCH_TRACK_IDS[0] });
  assert.ok(items.length > 0);
  assert.ok(items[0].coverage.nodeItemCount > 0);
  assert.equal(service.listItems({ trackId: LAUNCH_TRACK_IDS[0], riskOnly: true }).every((item) => item.riskFlags.length > 0), true);
});

test("review console records one current explicit outcome and invalidates it when source identity changes", async (t) => {
  const { directory, reviewPath } = await temporaryReviewPath(t);
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
});

test("review console serves a local UI and bounded JSON API without fabricating approval", async (t) => {
  const { directory, reviewPath } = await temporaryReviewPath(t);
  const running = await startContentReviewConsole({ reviewPath, port: 0 });
  t.after(() => new Promise((resolveServer) => running.server.close(resolveServer)));
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
  assert.ok(pageHtml.indexOf("if(result.warning)alert(result.warning)") < pageHtml.indexOf("await refresh();await show(trackId,questionId)"));
  const risks = await fetch(`http://127.0.0.1:${address.port}/api/items?trackId=backend-system-design-interview&riskOnly=true`);
  assert.equal(risks.status, 200);
  assert.ok((await risks.json()).items.some((candidate) => candidate.questionId === item.questionId));
  await assert.rejects(readFile(join(directory, "outcomes.json")), { code: "ENOENT" });
  const catalog = await fetch(`http://127.0.0.1:${address.port}/api/catalog`);
  assert.equal(catalog.status, 200);
  assert.equal((await catalog.json()).launchTrackCount, 9);
  const response = await fetch(`http://127.0.0.1:${address.port}/api/reviews/batch`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: [], outcome: "approved", note: "No-op", reviewerId: "owner-local" }) });
  assert.equal(response.status, 400);
});

test("review outcomes serialize stale service snapshots and survive a fresh service instance", async (t) => {
  const { reviewPath } = await temporaryReviewPath(t);
  const first = await createContentReviewConsole({ reviewPath });
  const second = await createContentReviewConsole({ reviewPath });
  const firstItem = first.listItems()[0];
  const secondItem = second.listItems().find((item) => item.questionKey !== firstItem.questionKey);
  const record = (item, outcome, note) => first.recordOutcome({ trackId: item.trackId, questionId: item.questionId, outcome, note, reviewerId: "temporary-owner" });
  const distinctResults = await Promise.all([
    record(firstItem, "approved", "Temporary concurrent outcome one."),
    second.recordOutcome({ trackId: secondItem.trackId, questionId: secondItem.questionId, outcome: "needs_change", note: "Temporary concurrent outcome two.", reviewerId: "temporary-owner" }),
  ]);
  assert.deepEqual(distinctResults.map((result) => result.review.status).sort(), ["approved", "needs_change"]);
  let store = JSON.parse(await readFile(reviewPath, "utf8"));
  assert.equal(store.reviews.length, 2);

  await Promise.all([
    first.recordOutcome({ trackId: firstItem.trackId, questionId: firstItem.questionId, outcome: "needs_change", note: "Temporary same-item outcome A.", reviewerId: "temporary-owner" }),
    second.recordOutcome({ trackId: firstItem.trackId, questionId: firstItem.questionId, outcome: "rejected", note: "Temporary same-item outcome B.", reviewerId: "temporary-owner" }),
  ]);
  store = JSON.parse(await readFile(reviewPath, "utf8"));
  assert.equal(store.reviews.length, 2);
  assert.ok(["Temporary same-item outcome A.", "Temporary same-item outcome B."].includes(store.reviews.find((review) => review.questionId === firstItem.questionId).note));
  const reopened = await createContentReviewConsole({ reviewPath });
  assert.equal(reopened.getItem(firstItem.trackId, firstItem.questionId).review.status, store.reviews.find((review) => review.questionId === firstItem.questionId).outcome);
  assert.equal(reopened.getItem(secondItem.trackId, secondItem.questionId).review.status, "needs_change");
});

test("review-store write and rename failures retain prior bytes and memory state", async (t) => {
  const { reviewPath } = await temporaryReviewPath(t);
  const seeded = await createContentReviewConsole({ reviewPath });
  const priorItem = seeded.listItems()[0];
  await seeded.recordOutcome({ trackId: priorItem.trackId, questionId: priorItem.questionId, outcome: "approved", note: "Temporary preserved outcome.", reviewerId: "temporary-owner" });
  const priorBytes = await readFile(reviewPath);
  const secondItem = seeded.listItems().find((item) => item.questionKey !== priorItem.questionKey);
  const cases = [
    ["temp write", {
      open: async (path, ...args) => {
        const handle = await open(path, ...args);
        if (!path.endsWith(".tmp")) return handle;
        writeFailures += 1;
        return { writeFile: async () => { throw Object.assign(new Error("injected temp write failure"), { code: "EIO" }); }, close: () => handle.close() };
      },
    }],
    ["rename", {
      rename: async (source, destination) => {
        if (destination === reviewPath) { renameFailures += 1; throw Object.assign(new Error("injected rename failure"), { code: "EIO" }); }
        return rename(source, destination);
      },
    }],
  ];
  let writeFailures = 0;
  let renameFailures = 0;
  for (const [stage, overrides] of cases) {
    const service = await createContentReviewConsole({ reviewPath, reviewStoreFs: { ...reviewFs, ...overrides } });
    await assert.rejects(service.recordOutcome({ trackId: secondItem.trackId, questionId: secondItem.questionId, outcome: "rejected", note: `Temporary ${stage} failure.`, reviewerId: "temporary-owner" }), { code: "EIO" });
    assert.deepEqual(await readFile(reviewPath), priorBytes, `${stage} leaves the previous complete file intact`);
    assert.equal(service.getItem(priorItem.trackId, priorItem.questionId).review.status, "approved");
    assert.equal(service.getItem(secondItem.trackId, secondItem.questionId).review.status, "unreviewed");
    assert.equal(stage === "temp write" ? writeFailures : renameFailures, 1, `${stage} injector was reached`);
  }
});

test("review batch keeps sequential per-item commit semantics against a concurrent single write", async (t) => {
  const { reviewPath } = await temporaryReviewPath(t);
  const batchService = await createContentReviewConsole({ reviewPath });
  const singleService = await createContentReviewConsole({ reviewPath });
  const items = batchService.listItems().slice(0, 3);
  const batch = batchService.recordBatchOutcomes({ items: items.slice(0, 2), outcome: "approved", note: "Temporary batch outcome.", reviewerId: "temporary-owner" });
  const single = singleService.recordOutcome({ trackId: items[2].trackId, questionId: items[2].questionId, outcome: "needs_change", note: "Temporary concurrent single outcome.", reviewerId: "temporary-owner" });
  const [batchResult] = await Promise.all([batch, single]);
  assert.equal(batchResult.length, 2);
  const persisted = JSON.parse(await readFile(reviewPath, "utf8"));
  assert.equal(persisted.reviews.length, 3);
  assert.deepEqual(persisted.reviews.map((review) => review.outcome).sort(), ["approved", "approved", "needs_change"]);

  const partialPath = join(dirname(reviewPath), "partial.json");
  let partialRenameCalls = 0;
  const partialService = await createContentReviewConsole({ reviewPath: partialPath, reviewStoreFs: {
    ...reviewFs,
    rename: async (source, destination) => {
      if (destination === partialPath && ++partialRenameCalls === 2) throw Object.assign(new Error("injected second-item failure"), { code: "EIO" });
      return rename(source, destination);
    },
  } });
  const partialItems = partialService.listItems().slice(0, 2);
  await assert.rejects(partialService.recordBatchOutcomes({ items: partialItems, outcome: "rejected", note: "Temporary partial batch.", reviewerId: "temporary-owner" }), { code: "EIO" });
  const partialStore = JSON.parse(await readFile(partialPath, "utf8"));
  assert.equal(partialStore.reviews.length, 1);
  assert.equal(partialStore.reviews[0].questionId, partialItems[0].questionId);
  assert.equal(partialService.getItem(partialItems[0].trackId, partialItems[0].questionId).review.status, "rejected");
  assert.equal(partialService.getItem(partialItems[1].trackId, partialItems[1].questionId).review.status, "unreviewed");
  assert.equal(partialRenameCalls, 2, "second-item rename injector was reached");
});

test("review-store lock is cross-process, owner-safe, and never reclaims a stale sidecar automatically", async (t) => {
  const { reviewPath } = await temporaryReviewPath(t);
  let acquired;
  const lockCreated = new Promise((resolveLock) => { acquired = resolveLock; });
  let allowLockOperation;
  const waitToReturnHandle = new Promise((resolveLock) => { allowLockOperation = resolveLock; });
  let gatedOnce = false;
  let lockOpenCalls = 0;
  const holdingFs = {
    ...reviewFs,
    open: async (path, ...args) => {
      const handle = await open(path, ...args);
      if (!gatedOnce && path === `${reviewPath}.lock` && args[0] === "wx") {
        gatedOnce = true;
        lockOpenCalls += 1;
        acquired();
        await waitToReturnHandle;
      }
      return handle;
    },
  };
  const first = await createContentReviewConsole({ reviewPath, reviewStoreFs: holdingFs });
  const item = first.listItems()[0];
  const pendingWrite = first.recordOutcome({ trackId: item.trackId, questionId: item.questionId, outcome: "approved", note: "Temporary live-lock owner.", reviewerId: "temporary-owner" });
  await lockCreated;

  const moduleUrl = pathToFileURL(fileURLToPath(new URL("../scripts/review/content-review-console.mjs", import.meta.url))).href;
  const childSource = `import {createContentReviewConsole} from ${JSON.stringify(moduleUrl)};const s=await createContentReviewConsole({reviewPath:process.env.CH01_PATH});try{await s.recordOutcome(JSON.parse(process.env.CH01_OUTCOME));process.stdout.write("unexpected-commit");process.exitCode=2;}catch(e){process.stdout.write(JSON.stringify({code:e.code}));if(e.code!=="review_store_busy")process.exitCode=1;}`;
  const child = spawn(process.execPath, ["--input-type=module", "-e", childSource], {
    env: { ...process.env, CH01_PATH: reviewPath, CH01_OUTCOME: JSON.stringify({ trackId: item.trackId, questionId: item.questionId, outcome: "rejected", note: "Temporary competing process.", reviewerId: "temporary-owner" }) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let childStdout = ""; let childStderr = "";
  child.stdout.setEncoding("utf8").on("data", (chunk) => { childStdout += chunk; });
  child.stderr.setEncoding("utf8").on("data", (chunk) => { childStderr += chunk; });
  let childResult;
  try {
    childResult = await new Promise((resolveChild, rejectChild) => {
      const timeout = setTimeout(() => { child.kill("SIGKILL"); rejectChild(new Error("child lock probe timed out")); }, 15_000);
      child.once("error", (error) => { clearTimeout(timeout); rejectChild(error); });
      child.once("exit", (code) => { clearTimeout(timeout); resolveChild(code); });
    });
    assert.equal(childResult, 0, childStderr);
    assert.deepEqual(JSON.parse(childStdout), { code: "review_store_busy" });
    await assert.rejects(readFile(reviewPath), { code: "ENOENT" });
  } finally {
    allowLockOperation();
    await pendingWrite;
  }
  assert.equal(lockOpenCalls, 1, "gated lock acquisition was reached");
  assert.equal(JSON.parse(await readFile(reviewPath, "utf8")).reviews.length, 1);

  const staleLockPath = `${reviewPath}.lock`;
  await writeFile(staleLockPath, JSON.stringify({ hostname: "temporary-stale-owner", pid: 0, token: "temporary" }));
  await assert.rejects(first.recordOutcome({ trackId: item.trackId, questionId: item.questionId, outcome: "needs_change", note: "Temporary stale lock attempt.", reviewerId: "temporary-owner" }), { code: "review_store_busy" });
  assert.equal(JSON.parse(await readFile(staleLockPath, "utf8")).hostname, "temporary-stale-owner");
  await unlink(staleLockPath); // isolated test simulates verified manual recovery
  const retry = await first.recordOutcome({ trackId: item.trackId, questionId: item.questionId, outcome: "needs_change", note: "Temporary post-recovery outcome.", reviewerId: "temporary-owner" });
  assert.equal(retry.review.status, "needs_change");
});

test("review-store path aliases share a lock key; hard links and dangling file symlinks fail closed", async (t) => {
  const { directory, reviewPath } = await temporaryReviewPath(t);
  const aliasDirectory = join(directory, "alias");
  await symlink(directory, aliasDirectory, "dir");
  const first = await createContentReviewConsole({ reviewPath });
  const second = await createContentReviewConsole({ reviewPath: join(aliasDirectory, "outcomes.json") });
  const one = first.listItems()[0]; const two = second.listItems().find((item) => item.questionKey !== one.questionKey);
  await Promise.all([
    first.recordOutcome({ trackId: one.trackId, questionId: one.questionId, outcome: "approved", note: "Temporary real path outcome.", reviewerId: "temporary-owner" }),
    second.recordOutcome({ trackId: two.trackId, questionId: two.questionId, outcome: "needs_change", note: "Temporary aliased path outcome.", reviewerId: "temporary-owner" }),
  ]);
  assert.equal(JSON.parse(await readFile(reviewPath, "utf8")).reviews.length, 2);

  const leafAlias = join(directory, "outcomes-alias.json");
  await symlink(reviewPath, leafAlias, "file");
  const leafAliasService = await createContentReviewConsole({ reviewPath: leafAlias });
  const leafItem = leafAliasService.listItems().find((item) => ![one.questionKey, two.questionKey].includes(item.questionKey));
  await leafAliasService.recordOutcome({ trackId: leafItem.trackId, questionId: leafItem.questionId, outcome: "approved", note: "Temporary leaf symlink target write.", reviewerId: "temporary-owner" });
  assert.equal((await lstat(leafAlias)).isSymbolicLink(), true, "atomic replacement updates the target without replacing the symlink itself");
  assert.equal(JSON.parse(await readFile(reviewPath, "utf8")).reviews.length, 3);

  const hardlinkPath = join(directory, "hardlinked-outcomes.json");
  await link(reviewPath, hardlinkPath);
  const hardlinked = await createContentReviewConsole({ reviewPath: hardlinkPath });
  const third = hardlinked.listItems().find((item) => ![one.questionKey, two.questionKey].includes(item.questionKey));
  await assert.rejects(hardlinked.recordOutcome({ trackId: third.trackId, questionId: third.questionId, outcome: "rejected", note: "Temporary hardlink attempt.", reviewerId: "temporary-owner" }), { code: "review_store_hardlink_unsupported" });

  const danglingPath = join(directory, "dangling-outcomes.json");
  await symlink(join(directory, "missing-target.json"), danglingPath);
  const dangling = await createContentReviewConsole({ reviewPath: danglingPath });
  const fourth = dangling.listItems()[0];
  await assert.rejects(dangling.recordOutcome({ trackId: fourth.trackId, questionId: fourth.questionId, outcome: "rejected", note: "Temporary dangling-link attempt.", reviewerId: "temporary-owner" }), { code: "review_store_dangling_symlink" });
});

test("review store preserves a private mode and never removes another owner's temp or lock file", async (t) => {
  const { reviewPath } = await temporaryReviewPath(t);
  const modeService = await createContentReviewConsole({ reviewPath });
  const first = modeService.listItems()[0];
  await modeService.recordOutcome({ trackId: first.trackId, questionId: first.questionId, outcome: "approved", note: "Temporary private mode seed.", reviewerId: "temporary-owner" });
  await chmod(reviewPath, 0o640);
  const second = modeService.listItems().find((item) => item.questionKey !== first.questionKey);
  await modeService.recordOutcome({ trackId: second.trackId, questionId: second.questionId, outcome: "needs_change", note: "Temporary private mode update.", reviewerId: "temporary-owner" });
  assert.equal((await stat(reviewPath)).mode & 0o777, 0o640, "replacement preserves the existing file mode");

  let collidedTempPath;
  let collisionCount = 0;
  const collidingService = await createContentReviewConsole({ reviewPath, reviewStoreFs: {
    ...reviewFs,
    open: async (path, ...args) => {
      if (path.endsWith(".tmp")) {
        collidedTempPath = path;
        collisionCount += 1;
        const foreign = await open(path, "wx", 0o600);
        await foreign.writeFile("foreign temp owner\n", "utf8");
        await foreign.close();
      }
      return open(path, ...args);
    },
  } });
  const third = collidingService.listItems().find((item) => ![first.questionKey, second.questionKey].includes(item.questionKey));
  await assert.rejects(collidingService.recordOutcome({ trackId: third.trackId, questionId: third.questionId, outcome: "rejected", note: "Temporary temp collision.", reviewerId: "temporary-owner" }), { code: "EEXIST" });
  assert.equal(collisionCount, 1, "exclusive temp-open collision was injected");
  assert.equal(await readFile(collidedTempPath, "utf8"), "foreign temp owner\n", "failed wx open never unlinks a foreign temp file");
  assert.equal(JSON.parse(await readFile(reviewPath, "utf8")).reviews.length, 2);

  let replacementLockPath;
  let replacementCount = 0;
  const ownerReplacingService = await createContentReviewConsole({ reviewPath, reviewStoreFs: {
    ...reviewFs,
    rename: async (source, destination) => {
      await rename(source, destination);
      if (destination === reviewPath && !replacementCount) {
        replacementCount += 1;
        replacementLockPath = `${reviewPath}.lock`;
        await unlink(replacementLockPath);
        await writeFile(replacementLockPath, "replacement owner lock\n", { flag: "wx", mode: 0o600 });
      }
    },
  } });
  const fourth = ownerReplacingService.listItems().find((item) => ![first.questionKey, second.questionKey, third.questionKey].includes(item.questionKey));
  const committed = await ownerReplacingService.recordOutcome({ trackId: fourth.trackId, questionId: fourth.questionId, outcome: "approved", note: "Temporary owner replacement.", reviewerId: "temporary-owner" });
  assert.equal(replacementCount, 1, "replacement was installed at the commit boundary");
  assert.match(committed.warning, /lock remains/u);
  assert.equal(await readFile(replacementLockPath, "utf8"), "replacement owner lock\n", "owner-safe release preserves a replacement lock");
});

test("new review stores use a private mode", async (t) => {
  const { directory } = await temporaryReviewPath(t);
  const reviewPath = join(directory, "missing-parent", "outcomes.json");
  const service = await createContentReviewConsole({ reviewPath });
  const item = service.listItems()[0];
  await service.recordOutcome({ trackId: item.trackId, questionId: item.questionId, outcome: "approved", note: "Temporary private new store.", reviewerId: "temporary-owner" });
  assert.equal(await realpath(dirname(reviewPath)), join(await realpath(directory), "missing-parent"), "the missing parent is created and canonicalized when mutation begins");
  assert.equal((await stat(reviewPath)).mode & 0o777, 0o600);
});

test("latest malformed review stores reject read-modify-write without changing disk or memory", async (t) => {
  const { reviewPath: seedPath } = await temporaryReviewPath(t, "patternly-review-schema-seed-");
  const source = await createContentReviewConsole({ reviewPath: seedPath });
  const seedItem = source.listItems()[0];
  await source.recordOutcome({ trackId: seedItem.trackId, questionId: seedItem.questionId, outcome: "approved", note: "Temporary schema seed.", reviewerId: "temporary-owner" });
  const validOutcome = JSON.parse(await readFile(seedPath, "utf8")).reviews[0];
  const cases = [
    ["numeric identity", { ...validOutcome, trackId: 9 }],
    ["missing required field", Object.fromEntries(Object.entries(validOutcome).filter(([key]) => key !== "note"))],
    ["bad fingerprint", { ...validOutcome, itemFingerprint: "g".repeat(64) }],
    ["invalid date-time", { ...validOutcome, reviewedAt: "2026-02-30T12:00:00Z" }],
    ["hour 24 date-time", { ...validOutcome, reviewedAt: "2026-10-04T24:00:00Z" }],
    ["unknown field", { ...validOutcome, unrecognized: true }],
    ["duplicate identity", [validOutcome, validOutcome]],
  ];
  for (const [label, invalid] of cases) {
    const { reviewPath } = await temporaryReviewPath(t, `patternly-review-invalid-${label.replaceAll(" ", "-")}-`);
    const service = await createContentReviewConsole({ reviewPath });
    const raw = JSON.stringify({ schemaVersion: CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION, reviews: Array.isArray(invalid) ? invalid : [invalid] });
    await writeFile(reviewPath, raw);
    const attempt = service.listItems().find((item) => item.questionKey !== `${validOutcome.trackId}:${validOutcome.questionId}`);
    await assert.rejects(service.recordOutcome({ trackId: attempt.trackId, questionId: attempt.questionId, outcome: "rejected", note: `Temporary ${label} mutation.`, reviewerId: "temporary-owner" }));
    assert.equal(await readFile(reviewPath, "utf8"), raw);
    assert.equal(service.getItem(attempt.trackId, attempt.questionId).review.status, "unreviewed");
  }

  const { reviewPath: validTimestampPath } = await temporaryReviewPath(t, "patternly-review-valid-timestamp-");
  await writeFile(validTimestampPath, JSON.stringify({
    schemaVersion: CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION,
    reviews: [{ ...validOutcome, reviewedAt: "2024-01-02t03:04:05.123z" }],
  }));
  const validTimestampService = await createContentReviewConsole({ reviewPath: validTimestampPath });
  assert.equal(validTimestampService.getItem(validOutcome.trackId, validOutcome.questionId).review.status, "approved", "RFC3339 lowercase T/Z, fraction, and UTC timestamp remain valid");

  const { reviewPath: validOffsetPath } = await temporaryReviewPath(t, "patternly-review-valid-offset-");
  await writeFile(validOffsetPath, JSON.stringify({
    schemaVersion: CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION,
    reviews: [{ ...validOutcome, reviewedAt: "2024-01-02T03:04:05.123+02:30" }],
  }));
  const validOffsetService = await createContentReviewConsole({ reviewPath: validOffsetPath });
  assert.equal(validOffsetService.getItem(validOutcome.trackId, validOutcome.questionId).review.status, "approved", "RFC3339 fractional numeric offsets remain valid");
});

test("post-commit lock-release warnings stay visible through the HTTP API", async (t) => {
  const { reviewPath } = await temporaryReviewPath(t);
  const fileSystem = {
    ...reviewFs,
    unlink: async (path) => {
      if (path === `${reviewPath}.lock`) throw Object.assign(new Error("injected lock release failure"), { code: "EACCES" });
      return unlink(path);
    },
  };
  const running = await startContentReviewConsole({ reviewPath, port: 0, reviewStoreFs: fileSystem });
  t.after(() => new Promise((resolveServer) => running.server.close(resolveServer)));
  const response = await fetch(`http://127.0.0.1:${running.address.port}/api/reviews`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ trackId: "backend-system-design-interview", questionId: "besd-n04-b02-i001", outcome: "approved", note: "Temporary API commit warning.", reviewerId: "temporary-owner" }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.review.status, "approved");
  assert.match(result.warning, /store lock remains/u);
  assert.equal(JSON.parse(await readFile(reviewPath, "utf8")).reviews.length, 1);
  await assert.rejects(running.service.recordOutcome({ trackId: "backend-system-design-interview", questionId: "besd-n04-b02-i001", outcome: "needs_change", note: "Temporary busy after committed warning.", reviewerId: "temporary-owner" }), { code: "review_store_busy" });
});
