import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proofPath = "evidence/business-quality/ai901-20261018-repairs.json";
const proof = JSON.parse(await readFile(path.join(root, proofPath), "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonicalQuestion = (question) => JSON.stringify(question);
const unitPath = (unit) => `content/microsoft-azure-ai-fundamentals-ai-901/responsible_ai_model_foundations_and_deployment_choices/AI901-N01-${unit}.json`;
const units = ["B01", "B02", "B03"];
const expected = units.flatMap((unit) => Array.from({ length: 12 }, (_, index) => ({
  unit,
  beforeQuestionId: `AI901-N01-${unit}-Q${String(index + 1).padStart(3, "0")}`,
  questionId: `AI901-N01-${unit}-Q${String(index + 13).padStart(3, "0")}`
})));
const markers = {
  B01: ["applicant appeals", "required fields are missing", "unsupported", "wrong queue", "sensor replacement", "client application", "patient messages", "approved source", "false positives", "language variety", "find compliant", "form change"],
  B02: ["20%", "18%", "91%", "61%", "16%", "accessibility pathway", "93%", "11 of 100", "15%", "91%", "12%", "14%"],
  B03: ["low-confidence", "missing the required eligibility field", "unsupported by its transcription operation", "no complaint text", "low quality", "times out", "duration of symptoms", "cannot be verified", "queue capacity", "confidence falls below", "becomes unavailable", "omits the required claim-status field"]
};

function readBeforeCommit(relativePath) {
  return execFileSync("git", ["show", `${proof.beforeProducerCommit}:${relativePath}`], { cwd: root });
}

const sources = new Map();
for (const sourceFile of proof.sourceFiles) {
  sources.set(sourceFile.sourceFile, JSON.parse(await readFile(path.join(root, sourceFile.sourceFile), "utf8")));
}

test("AI-901 proof binds all 36 retired IDs to fresh successors and only the three authorized units", async () => {
  assert.equal(proof.schemaVersion, "patternly-bizq-semantic-replacement-v1");
  assert.equal(proof.trackId, "microsoft-azure-ai-fundamentals-ai-901");
  assert.equal(proof.contentVersion, "microsoft-azure-ai-fundamentals-ai-901-authoring-v2026.10.18-b01-b03-repairs-v1");
  assert.equal(proof.replacements.length, 36);
  assert.deepEqual(proof.replacements.map(({ beforeQuestionId, questionId }) => ({ beforeQuestionId, questionId })), expected.map(({ beforeQuestionId, questionId }) => ({ beforeQuestionId, questionId })));
  assert.deepEqual(proof.sourceFiles.map(({ sourceFile }) => sourceFile), units.map(unitPath));
  assert.equal(proof.scopeBoundary.replacedQuestions, 36);
  assert.equal(proof.scopeBoundary.unchangedTrackQuestions, 716);
  assert.equal(proof.scopeBoundary.outsideUnitSourcesUnchanged, true);
  assert.equal(proof.scopeBoundary.frozenHistoricalReadinessManifestUnchanged, true);
  assert.equal(proof.sourceChecks.length, 3);
  assert.ok(proof.sourceChecks.every(({ checkedDate }) => checkedDate === "2026-10-18"));

  for (const sourceFile of proof.sourceFiles) {
    const currentBytes = await readFile(path.join(root, sourceFile.sourceFile));
    assert.equal(sha256(currentBytes), sourceFile.sourceSha256, sourceFile.sourceFile);
    assert.equal(sha256(readBeforeCommit(sourceFile.sourceFile)), sourceFile.beforeSourceSha256, sourceFile.sourceFile);
    assert.deepEqual(sourceFile.beforeQuestionIds, expected.filter((entry) => sourceFile.mentalUnitId === `AI901-N01-${entry.unit}`).map(({ beforeQuestionId }) => beforeQuestionId));
    assert.deepEqual(sourceFile.questionIds, expected.filter((entry) => sourceFile.mentalUnitId === `AI901-N01-${entry.unit}`).map(({ questionId }) => questionId));
  }

  const changedUnits = new Set(units.map(unitPath));
  const trackRoot = path.join(root, "content/microsoft-azure-ai-fundamentals-ai-901");
  const nodes = await import("node:fs/promises").then(({ readdir }) => readdir(trackRoot, { withFileTypes: true }));
  for (const node of nodes.filter((entry) => entry.isDirectory())) {
    const directory = path.join(trackRoot, node.name);
    const files = await import("node:fs/promises").then(({ readdir }) => readdir(directory));
    for (const name of files.filter((entry) => entry.endsWith(".json"))) {
      const relativePath = `content/microsoft-azure-ai-fundamentals-ai-901/${node.name}/${name}`;
      const current = await readFile(path.join(root, relativePath));
      if (!changedUnits.has(relativePath)) assert.deepEqual(current, readBeforeCommit(relativePath), relativePath);
    }
  }
  assert.deepEqual(
    await readFile(path.join(root, "config/primary-strata-readiness.json")),
    readBeforeCommit("config/primary-strata-readiness.json"),
    "the historical readiness pin remains unchanged"
  );
  assert.deepEqual(
    await readFile(path.join(root, "config/certification-objective-registries/microsoft-azure-ai-fundamentals-ai-901.json")),
    readBeforeCommit("config/certification-objective-registries/microsoft-azure-ai-fundamentals-ai-901.json"),
    "the objective registry contains no item-ID bindings and remains unchanged"
  );
});

test("active selection lists use successors while historical selectors remain outside this change", async () => {
  const before = JSON.parse(readBeforeCommit("config/tracks/microsoft-azure-ai-fundamentals-ai-901.json"));
  const current = JSON.parse(await readFile(path.join(root, "config/tracks/microsoft-azure-ai-fundamentals-ai-901.json"), "utf8"));
  const oldToNew = new Map(expected.map(({ beforeQuestionId, questionId }) => [beforeQuestionId, questionId]));
  let beforeCount = 0;
  let currentCount = 0;
  const replaceExpected = (value) => {
    if (Array.isArray(value)) return value.map((entry) => {
      if (typeof entry === "string" && oldToNew.has(entry)) { beforeCount += 1; return oldToNew.get(entry); }
      return replaceExpected(entry);
    });
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, replaceExpected(entry)]));
    return value;
  };
  const countCurrent = (value) => {
    if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countCurrent(entry), 0);
    if (typeof value === "string") return expected.some(({ questionId }) => questionId === value) ? 1 : 0;
    if (value && typeof value === "object") return Object.values(value).reduce((sum, entry) => sum + countCurrent(entry), 0);
    return 0;
  };
  const expectedCurrent = replaceExpected(before);
  currentCount = countCurrent(current);
  assert.deepEqual(current, expectedCurrent);
  assert.equal(beforeCount, 82);
  assert.equal(currentCount, beforeCount);
});

test("the accepted option ties for longest no more than half the time in each repaired unit", () => {
  for (const unit of units) {
    const questions = sources.get(unitPath(unit));
    const acceptedLongest = questions.filter((question) => {
      const accepted = question.interaction.options.find(({ optionId }) => optionId === question.answer.optionId);
      return accepted.text.length >= Math.max(...question.interaction.options.map(({ text }) => text.length));
    }).length;
    assert.ok(acceptedLongest <= 6, `${unit}: accepted option is longest or tied in ${acceptedLongest}/12 items`);
  }
});

for (const item of proof.replacements) {
  test(`${item.questionId}: concrete scenario, hidden answer before submission, and option-ID scoring survive shuffle`, () => {
    const sourceFile = proof.sourceFiles.find(({ mentalUnitId }) => mentalUnitId === item.mentalUnitId).sourceFile;
    const question = sources.get(sourceFile).find(({ questionId }) => questionId === item.questionId);
    assert.ok(question, item.questionId);
    assert.deepEqual(question, item.currentQuestion, item.questionId);
    assert.equal(sha256(canonicalQuestion(item.beforeQuestion)), item.beforeQuestionCanonicalSha256, `${item.questionId} predecessor hash`);
    assert.equal(sha256(canonicalQuestion(question)), item.currentQuestionCanonicalSha256, `${item.questionId} successor hash`);
    assert.equal(item.identityAction, "replace_question_with_new_id", item.questionId);
    assert.ok(item.identityReason.includes("assessed decision"), item.questionId);
    assert.equal(question.questionId, item.questionId);
    assert.equal(question.questionRelation, undefined, "lineage is provenance only, not a learner-facing question relation");
    assert.ok(question.prompt.toLowerCase().includes(markers[item.mentalUnitId.slice(-3)][Number(item.questionId.slice(-3)) - 13].toLowerCase()), item.questionId);
    assert.equal(question.constraints.some((constraint) => /primary mental unit/i.test(constraint)), false, item.questionId);
    assert.equal(question.feedback.details.mechanismOrProperty.includes("Primary mental unit"), false, item.questionId);
    assert.deepEqual(Object.keys(question.feedback.details).sort(), ["boundaryOrTradeoff", "errorCorrection", "mechanismOrProperty", "scenarioApplication", "transfer", "url"].sort(), item.questionId);

    const options = question.interaction.options;
    const accepted = options.find(({ optionId }) => optionId === question.answer.optionId);
    assert.ok(accepted, item.questionId);
    if (item.questionId === "AI901-N01-B01-Q013") {
      assert.match(accepted.text, /protected case records/i);
      assert.match(accepted.text, /model evidence/i);
      assert.match(accepted.text, /reviewer and decision/i);
      assert.match(accepted.text, /appeals.*escalation/i);
    }
    if (item.questionId === "AI901-N01-B01-Q014") {
      assert.match(accepted.text, /each rejected case/i);
      assert.match(accepted.text, /sustained increases/i);
    }
    if (item.questionId === "AI901-N01-B01-Q022") {
      assert.match(accepted.text, /owner/i);
      assert.match(accepted.text, /monitor/i);
      assert.match(accepted.text, /escalate/i);
    }
    if (item.questionId === "AI901-N01-B01-Q024") {
      assert.match(accepted.text, /threshold/i);
      assert.match(accepted.text, /recover/i);
      assert.match(accepted.text, /escalate|rollback/i);
    }
    assert.ok(!["a", "b", "c", "d"].includes(accepted.optionId), "successor uses a fresh option identity");
    assert.equal(question.prompt.includes(accepted.text), false, item.questionId);
    assert.equal(question.constraints.some((constraint) => constraint.toLowerCase() === accepted.text.toLowerCase()), false, item.questionId);
    assert.equal(question.feedback.reason.includes(accepted.text), false, item.questionId);
    assert.doesNotMatch(question.feedback.reason, /The accepted choice applies|In this scenario/i, item.questionId);
    assert.equal(validateQuestion(question).valid, true, item.questionId);

    const wrongIds = options.filter(({ optionId }) => optionId !== question.answer.optionId).map(({ optionId }) => optionId).sort();
    const messages = question.feedback.messages.filter(({ kind }) => kind === "wrong_option");
    assert.deepEqual(messages.map(({ targetId }) => targetId).sort(), wrongIds, item.questionId);
    assert.equal(new Set(messages.map(({ text }) => text)).size, 3, item.questionId);
    for (const message of messages) {
      assert.ok(message.text.split(/\s+/).length >= 8, `${item.questionId}/${message.targetId} gives a substantive explanation`);
      assert.doesNotMatch(message.text, /It can look plausible|It would become appropriate only if/i, item.questionId);
      assert.notEqual(message.text, question.feedback.reason, item.questionId);
    }

    for (const candidate of [question, { ...question, interaction: { ...question.interaction, options: [...options].reverse() } }]) {
      assert.equal(validateQuestion(candidate).valid, true, item.questionId);
      for (const { optionId } of candidate.interaction.options) {
        const result = scoreQuestion(candidate, { type: "choice_single", optionId });
        const isCorrect = optionId === candidate.answer.optionId;
        assert.equal(result.status, isCorrect ? "correct" : "incorrect", `${item.questionId}/${optionId}`);
        assert.equal(result.earnedPoints, isCorrect ? 1 : 0, `${item.questionId}/${optionId}`);
      }
    }
  });
}
