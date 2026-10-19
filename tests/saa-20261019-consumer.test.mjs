import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { createHash } from "node:crypto";
import { scoreQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const app = path.resolve(process.env.PATTERNLY_FRONTEND_ROOT ?? fileURLToPath(new URL("../../patternly", import.meta.url)));
const production = relative => import(pathToFileURL(path.join(app, relative)).href);
const { createCanonicalQuestionCatalog } = await production("src/content/canonical/questionCatalog.ts");
const { scoreCanonicalQuestion } = await production("src/content/canonical/questionScoring.ts");
const { projectCanonicalQuestionInSessionOrder, prepareCanonicalOptionOrder } = await production("src/application/canonical/canonicalOptionOrder.ts");
const { buildCanonicalInteractionViewModel, projectCanonicalChoiceFeedbackMessages } = await production("src/application/canonical/canonicalInteractionPresentation.ts");
const { toCanonicalQuestionViewModel } = await production("src/features/practice/canonicalQuestionViewModel.ts");
const sha256 = value => createHash("sha256").update(value).digest("hex");
const trackId = "aws-certified-solutions-architect-associate";
const bank = await loadCurrentQuestionBank(trackId);
const directory = path.join(app, "src/content/generated/canonical-content");
const artifactBytes = await readFile(path.join(directory, `${trackId}.json`));
const artifact = JSON.parse(artifactBytes);
const lockBytes = await readFile(path.join(directory, "content-lock.json"));
const lock = JSON.parse(lockBytes).tracks.find(row => row.trackId === trackId);
const catalog = await createCanonicalQuestionCatalog(artifact, lock, trackId, async text => sha256(text));
const pin = { contentVersion: lock.contentVersion, artifactSha256: lock.sha256 };
const suffixes = ["B04-004", "B04-014", "B02-011", "B07-014", "B01-004", "B04-001", "B04-005", "B04-006", "B04-007", "B04-008", "B04-018", "B01-007", "B05-013", "B05-017", "B07-012"];
function permutations(values) {
  return values.length === 0 ? [[]] : values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map(rest => [value, ...rest]));
}

test("AWS source → canonical build → APP payload/current lock → consumer catalog is exact", async () => {
  assert.deepEqual(artifact.questions, bank.artifact.questions);
  assert.equal(lock.contentVersion, bank.artifact.contentVersion);
  assert.equal(lock.sha256, sha256(artifactBytes));
  assert.equal(lock.questionCount, 2604);
  const release = JSON.parse(await readFile(path.join(app, "integration/contracts/content-release/release.lock.json")));
  const entry = release.artifacts.find(row => row.trackId === trackId);
  assert.ok(entry, "release metadata includes AWS");
  assert.equal(entry.checksumSha256, lock.sha256);
  assert.equal(release.bundledContentLockSha256, sha256(lockBytes));
  assert.equal(release.currentIdentity.ownerPolicy, "standing-owner-decision-2026-10-19-current-source");
});

for (const suffix of suffixes) test(`${suffix}: APP scorer, renderer, saved shuffled order and diagnostic feedback match producer across all 24 permutations`, () => {
  const questionId = `aws-saa-c03-AWSSAA-N07-${suffix}`;
  const question = catalog.getQuestionById(questionId);
  assert.ok(question, questionId);
  assert.deepEqual(question, bank.byId.get(questionId));
  const snapshot = JSON.stringify(question);
  const ids = question.interaction.options.map(option => option.optionId);
  const seeded = prepareCanonicalOptionOrder(question, `aws-repairs:${questionId}`, pin);
  assert.deepEqual(seeded, prepareCanonicalOptionOrder(question, `aws-repairs:${questionId}`, pin));
  assert.deepEqual([...seeded].sort(), [...ids].sort());
  const positions = new Set();
  for (const order of permutations(ids)) {
    // Exercise the same persisted ID order that the session restores.
    const displayed = projectCanonicalQuestionInSessionOrder(question, JSON.parse(JSON.stringify(order)));
    positions.add(order.indexOf("A"));
    const view = buildCanonicalInteractionViewModel(displayed, null).model;
    assert.deepEqual(Object.keys(view).sort(), ["accessibility", "renderer"]);
    assert.deepEqual(view.renderer.options.map(option => option.id), order);
    assert.ok(view.accessibility.controls.every(control => !control.checked));
    for (const option of view.renderer.options) {
      assert.deepEqual(Object.keys(option).sort(), ["id", "selected", "text"]);
      assert.equal(option.selected, false);
      assert.equal(option.text, question.interaction.options.find(authored => authored.optionId === option.id).text);
    }
    assert.equal(toCanonicalQuestionViewModel(displayed).prompt, question.prompt);
    for (const optionId of order) {
      const response = JSON.parse(JSON.stringify({ type: "choice_single", optionId }));
      const scored = scoreCanonicalQuestion(displayed, response);
      assert.equal(scored.earnedPoints, optionId === "A" ? 1 : 0);
      assert.equal(scored.earnedPoints, scoreQuestion(displayed, response).earnedPoints);
      const expectedMessages = question.feedback.messages.filter(message => message.targetId === optionId);
      assert.equal(expectedMessages.length, optionId === "A" ? 0 : 1);
      assert.deepEqual(projectCanonicalChoiceFeedbackMessages(displayed, response), expectedMessages);
    }
  }
  assert.equal(positions.size, 4);
  assert.equal(JSON.stringify(question), snapshot);
});
