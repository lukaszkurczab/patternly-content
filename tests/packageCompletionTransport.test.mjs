import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { ACCEPTED_TRACK_IDS, loadCanonicalCatalog, loadCanonicalFixture, validateCatalog } from "../scripts/content/question-contract.mjs";
import { ContentBuildError, buildTrack, canonicalJson, sha256 } from "../scripts/build.mjs";

const rule = Object.freeze({
  ruleVersion: 2,
  chapters: Object.freeze([{ nodeId: "node-001", mentalUnitCount: 1, minimumAttemptCount: 20, rollingWindowSize: 20, qualityThreshold: 0.8 }])
});
const trackId = "aws-certified-solutions-architect-associate";
const CONTENT_ROOT = path.resolve(fileURLToPath(new URL("../", import.meta.url)));

const completionCsvUrl = new URL("../../patternly/docs/specs/business-quality/02-BIZQ-02-CHAPTER-COMPLETION.csv", import.meta.url);
const candidateArtifactsUrl = new URL("../reports/candidate-reconciliation/AWS-02-DRAFT/release/artifacts/", import.meta.url);
const completionCsvHeader = ["trackId", "nodeId", "baselineContentVersion", "baselineArtifactSha256", "mentalUnitCount", "minimumAttemptCount", "rollingWindowSize", "qualityThreshold"];

function parseCompletionCsv(source) {
  const lines = source.trimEnd().split(/\r?\n/u);
  assert.deepEqual(lines[0]?.split(","), completionCsvHeader, "approved chapter CSV header must stay exact");
  const rows = lines.slice(1).map((line, index) => {
    const fields = line.split(",");
    assert.equal(fields.length, completionCsvHeader.length, `approved chapter CSV row ${index + 2} must have all fields`);
    const [rowTrackId, nodeId, baselineContentVersion, baselineArtifactSha256, units, minimum, window, threshold] = fields;
    assert.ok(rowTrackId && nodeId && baselineContentVersion && /^[a-f0-9]{64}$/u.test(baselineArtifactSha256), `approved chapter CSV row ${index + 2} must have valid identity fields`);
    const mentalUnitCount = Number(units);
    const minimumAttemptCount = Number(minimum);
    const rollingWindowSize = Number(window);
    const qualityThreshold = Number(threshold);
    assert.ok(Number.isSafeInteger(mentalUnitCount) && mentalUnitCount > 0, `approved chapter CSV row ${index + 2} must have a positive unit count`);
    assert.ok(Number.isSafeInteger(minimumAttemptCount) && Number.isSafeInteger(rollingWindowSize) && Number.isFinite(qualityThreshold), `approved chapter CSV row ${index + 2} must have numeric policy values`);
    return { trackId: rowTrackId, nodeId, mentalUnitCount, minimumAttemptCount, rollingWindowSize, qualityThreshold };
  });
  const keys = rows.map(({ trackId: rowTrackId, nodeId }) => `${rowTrackId}/${nodeId}`);
  assert.equal(new Set(keys).size, keys.length, "approved chapter CSV must not repeat track/node rows");
  return rows;
}

function assertChapterInventoryMatches(rows, artifacts) {
  const byTrack = new Map();
  for (const row of rows) {
    const chapters = byTrack.get(row.trackId) ?? new Map();
    assert.equal(chapters.has(row.nodeId), false, `duplicate approved chapter ${row.trackId}/${row.nodeId}`);
    chapters.set(row.nodeId, row);
    byTrack.set(row.trackId, chapters);
  }
  assert.deepEqual([...byTrack.keys()].sort(), [...ACCEPTED_TRACK_IDS].sort(), "approved chapter CSV must cover every accepted track exactly");
  assert.equal(rows.length, 117, "approved chapter CSV must contain all 117 chapters");

  const artifactIds = artifacts.map(({ trackId: artifactTrackId }) => artifactTrackId).sort();
  assert.deepEqual(artifactIds, [...ACCEPTED_TRACK_IDS].sort(), "candidate artifact set must contain every accepted track exactly once");
  assert.equal(new Set(artifactIds).size, artifactIds.length, "candidate artifact set must not repeat tracks");
  let unitTotal = 0;
  let questionTotal = 0;
  const sourceCatalog = loadCanonicalCatalog();
  for (const artifact of artifacts) {
    const expected = byTrack.get(artifact.trackId);
    assert.ok(expected, `missing approved rows for ${artifact.trackId}`);
    const actualChapters = artifact.completionRule.chapters;
    if (artifact.trackId === "claude-certified-architect-professional-certification") {
      const sourceTrack = sourceCatalog.tracks.find(({ trackId: sourceTrackId }) => sourceTrackId === artifact.trackId);
      assert.equal(artifact.completionRule.ruleVersion, 3, "Claude must use its current required-unit rule v3");
      assert.deepEqual(artifact.completionRule, sourceTrack.completionRule, "Claude artifact must transport the exact current catalog rule");
      assert.equal(artifact.questions.length, 918, "Claude candidate artifact must contain the current accepted bank");
      unitTotal += actualChapters.reduce((sum, chapter) => sum + chapter.mentalUnitCount, 0);
      questionTotal += artifact.questions.length;
      continue;
    }
    assert.equal(artifact.completionRule.ruleVersion, 2, `${artifact.trackId} must retain chapter rule v2`);
    assert.equal(new Set(actualChapters.map(({ nodeId }) => nodeId)).size, actualChapters.length, `${artifact.trackId} artifact must not repeat chapters`);
    assert.equal(actualChapters.length, expected.size, `${artifact.trackId} artifact must contain its complete approved chapter inventory`);
    assert.deepEqual(actualChapters.map(({ nodeId }) => nodeId).sort(), [...expected.keys()].sort(), `${artifact.trackId} artifact must not omit or add chapters`);
    for (const chapter of actualChapters) {
      const approved = expected.get(chapter.nodeId);
      assert.equal(chapter.mentalUnitCount, approved.mentalUnitCount, `${artifact.trackId}/${chapter.nodeId} mental unit count`);
      assert.equal(chapter.minimumAttemptCount, approved.minimumAttemptCount, `${artifact.trackId}/${chapter.nodeId} approved minimum`);
      assert.equal(chapter.minimumAttemptCount, Math.max(20, Math.ceil((4 * approved.mentalUnitCount) / 20) * 20), `${artifact.trackId}/${chapter.nodeId} minimum formula`);
      assert.equal(chapter.rollingWindowSize, 20, `${artifact.trackId}/${chapter.nodeId} rolling window`);
      assert.equal(chapter.rollingWindowSize, approved.rollingWindowSize, `${artifact.trackId}/${chapter.nodeId} approved window`);
      assert.equal(chapter.qualityThreshold, 0.8, `${artifact.trackId}/${chapter.nodeId} quality threshold`);
      assert.equal(chapter.qualityThreshold, approved.qualityThreshold, `${artifact.trackId}/${chapter.nodeId} approved threshold`);
      unitTotal += chapter.mentalUnitCount;
    }
    questionTotal += artifact.questions.length;
  }
  assert.equal(unitTotal, 958, "candidate artifacts must cover all 958 current mental units");
  assert.equal(questionTotal, 16695, "candidate artifacts must contain all 16,695 current accepted questions");
}

async function workspace(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "patternly-bizq02-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "content", trackId, "node-001"), { recursive: true });
  const catalog = loadCanonicalCatalog();
  await writeFile(path.join(root, "content", "catalog.json"), `${canonicalJson(catalog)}\n`);
  await writeRuntimeBindingConfig(root, catalog);
  const question = structuredClone(loadCanonicalFixture().fixture.questions[0]);
  question.questionId = `${trackId}-q-001`;
  question.trackId = trackId;
  question.nodeId = "node-001";
  question.mentalUnitId = "unit-001";
  await writeFile(path.join(root, "content", trackId, "node-001", "unit-001.json"), `${JSON.stringify([question], null, 2)}\n`);
  await writePlanningCurriculum(root);
  return { root, catalog };
}

async function writeRuntimeBindingConfig(root, catalog) {
  const registry = JSON.parse(readFileSync(path.join(CONTENT_ROOT, "config/track-runtime-bindings.json"), "utf8"));
  for (const binding of registry.tracks) binding.profileLoaderKey = null;
  const catalogIds = new Set(catalog.tracks.map(({ trackId: id }) => id));
  registry.tracks = registry.tracks.filter(({ trackId: id }) => catalogIds.has(id));
  await mkdir(path.join(root, "config", "families"), { recursive: true });
  await mkdir(path.join(root, "config", "tracks"), { recursive: true });
  await writeFile(path.join(root, "config/track-runtime-bindings.json"), `${canonicalJson(registry)}\n`);
  const families = new Set();
  for (const binding of registry.tracks) {
    if (!families.has(binding.familyId)) {
      families.add(binding.familyId);
      await writeFile(path.join(root, `config/families/${binding.familyId}.json`), `${JSON.stringify({ schemaVersion: "fixture-family-v1", familyId: binding.familyId })}\n`);
    }
    await writeFile(path.join(root, `config/tracks/${binding.trackId}.json`), `${JSON.stringify({ schemaVersion: "track-config-v1", trackId: binding.trackId, familyId: binding.familyId })}\n`);
  }
}

async function writePlanningCurriculum(root) {
  await mkdir(path.join(root, "config", "curricula"), { recursive: true });
  const curriculum = {
    trackId,
    planningPolicy: {
      schemaVersion: "patternly-learning-planning-policy-v1",
      policyVersion: "fixture-v1",
      workEstimates: [{
        estimateId: `${trackId}:fixture-mode`,
        modeId: "fixture-mode",
        scopeRefs: [{ nodeId: "node-001", mentalUnitId: "unit-001" }],
        minMinutesPerResponse: 1,
        typicalMinutesPerResponse: 2,
        maxMinutesPerResponse: 3,
        provenance: "authored",
        observationCount: 0,
        rationale: "Fixture estimate includes question reading, response work and feedback reading.",
        reviewReserve: {
          kind: "authored_estimate",
          minAdditionalResponsesPerNewResponse: 0,
          typicalAdditionalResponsesPerNewResponse: 1,
          maxAdditionalResponsesPerNewResponse: 3,
          provenance: "authored",
          observationCount: 0,
          rationale: "Fixture reserve covers up to three spaced recall checks."
        }
      }],
      unavailableScopes: []
    }
  };
  await writeFile(path.join(root, "config", "curricula", `${trackId}.json`), `${JSON.stringify(curriculum, null, 2)}\n`);
}

test("catalog accepts a valid chapter rule and rejects malformed rules", () => {
  const catalog = loadCanonicalCatalog();
  const track = catalog.tracks.find((entry) => entry.trackId === trackId);
  track.completionRule = { ...rule };
  assert.equal(validateCatalog(catalog).valid, true);
  for (const invalid of [null, { ...rule, ruleVersion: 1 }, { ...rule, chapters: [] }, { ...rule, chapters: [{ ...rule.chapters[0], minimumAttemptCount: 40 }] }, { ...rule, chapters: [{ ...rule.chapters[0], nodeId: "" }] }, { ...rule, extra: true }]) {
    track.completionRule = invalid;
    assert.equal(validateCatalog(catalog).valid, false);
  }
});

test("candidate artifacts retain approved v2 chapters and transport the current Claude v3 rule", () => {
  const csv = readFileSync(completionCsvUrl, "utf8");
  const rows = parseCompletionCsv(csv);
  const artifacts = ACCEPTED_TRACK_IDS.map((id) => JSON.parse(readFileSync(new URL(`${id}.json`, candidateArtifactsUrl), "utf8")));
  assertChapterInventoryMatches(rows, artifacts);

  const lines = csv.trimEnd().split(/\r?\n/u);
  const extraChapter = lines[1].split(",");
  extraChapter[1] = `${extraChapter[1]}-extra`;
  for (const [label, changedLines] of [
    ["missing chapter", lines.slice(0, -1)],
    ["extra chapter", [...lines, extraChapter.join(",")]],
    ["duplicate chapter", [...lines, lines[1]]]
  ]) {
    assert.throws(() => {
      const changedRows = parseCompletionCsv(changedLines.join("\n"));
      assertChapterInventoryMatches(changedRows, artifacts);
    }, undefined, `${label} in the approved input must fail closed`);
  }
});

test("builder transports the exact complete chapter rule, hashes it, and omits it when absent", async (t) => {
  const { root, catalog } = await workspace(t);
  const track = catalog.tracks.find((entry) => entry.trackId === trackId);
  track.completionRule = { ...rule };
  await writeFile(path.join(root, "content", "catalog.json"), `${canonicalJson(catalog)}\n`);
  const built = await buildTrack({ rootDirectory: root, trackId });
  assert.deepEqual(built.artifact.completionRule, rule);
  assert.equal(built.lockEntry.sha256, sha256(built.artifactBytes));

  for (const invalid of [
    { ...rule, chapters: [{ ...rule.chapters[0], nodeId: "foreign-node" }] },
    { ...rule, chapters: [{ ...rule.chapters[0], mentalUnitCount: 2 }] },
    { ...rule, chapters: [rule.chapters[0], rule.chapters[0]] }
  ]) {
    track.completionRule = invalid;
    await writeFile(path.join(root, "content", "catalog.json"), `${canonicalJson(catalog)}\n`);
    await assert.rejects(buildTrack({ rootDirectory: root, trackId }), (error) => {
      assert.ok(error instanceof ContentBuildError);
      assert.match(error.message, /completionRule|canonical (catalog )?contract|chapter completion rule/i);
      return true;
    });
  }
  track.completionRule = { ...rule, chapters: [{ ...rule.chapters[0], mentalUnitCount: Number.MAX_SAFE_INTEGER }] };
  await writeFile(path.join(root, "content", "catalog.json"), `${canonicalJson(catalog)}\n`);
  await assert.rejects(buildTrack({ rootDirectory: root, trackId }), /completionRule|canonical (catalog )?contract|chapter completion rule/i);

  const absentRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-bizq02-absent-"));
  t.after(() => rm(absentRoot, { recursive: true, force: true }));
  await mkdir(path.join(absentRoot, "content", trackId, "node-001"), { recursive: true });
  const absentCatalog = loadCanonicalCatalog();
  delete absentCatalog.tracks.find((entry) => entry.trackId === trackId).completionRule;
  await writeFile(path.join(absentRoot, "content", "catalog.json"), `${canonicalJson(absentCatalog)}\n`);
  await writeRuntimeBindingConfig(absentRoot, absentCatalog);
  const absentQuestion = structuredClone(loadCanonicalFixture().fixture.questions[0]);
  absentQuestion.questionId = `${trackId}-q-001`;
  absentQuestion.trackId = trackId;
  absentQuestion.nodeId = "node-001";
  absentQuestion.mentalUnitId = "unit-001";
  await writeFile(path.join(absentRoot, "content", trackId, "node-001", "unit-001.json"), `${JSON.stringify([absentQuestion])}\n`);
  await writePlanningCurriculum(absentRoot);
  const absent = await buildTrack({ rootDirectory: absentRoot, trackId });
  assert.equal(Object.hasOwn(absent.artifact, "completionRule"), false);
});

test("existing artifact rule must agree with catalog even after checksum is recomputed", async (t) => {
  const { root, catalog } = await workspace(t);
  const track = catalog.tracks.find((entry) => entry.trackId === trackId);
  track.completionRule = { ...rule };
  await writeFile(path.join(root, "content", "catalog.json"), `${canonicalJson(catalog)}\n`);
  const first = await buildTrack({ rootDirectory: root, trackId });
  const artifactPath = first.artifactPath;
  const lockPath = first.lockPath;
  for (const tamper of [
    (artifact) => { delete artifact.completionRule; },
    (artifact) => { artifact.completionRule = null; },
    (artifact) => { artifact.completionRule = { ...rule, chapters: [{ ...rule.chapters[0], qualityThreshold: 0.7 }] }; }
  ]) {
    const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
    tamper(artifact);
    const bytes = canonicalJson(artifact);
    await writeFile(artifactPath, bytes);
    const lock = JSON.parse(await readFile(lockPath, "utf8"));
    lock.tracks[0].sha256 = sha256(bytes);
    await writeFile(lockPath, canonicalJson(lock));
    await assert.rejects(buildTrack({ rootDirectory: root, trackId }), (error) => {
      assert.ok(error instanceof ContentBuildError);
      assert.match(error.message, /completionRule/);
      return true;
    });
  }
});

test("v3 requires the exact required-unit inventory and four distinct reachable questions", async (t) => {
  const { validatePackageCompletionRule } = await import("../scripts/content/question-contract.mjs");
  const v3 = { ...rule, ruleVersion: 3, chapters: [{ ...rule.chapters[0], units: [{ mentalUnitId: "unit-001", requiredCorrectQuestionCount: 4 }] }] };
  const questions = Array.from({ length: 4 }, (_, index) => ({ nodeId: "node-001", mentalUnitId: "unit-001", questionId: `q-${index}` }));
  assert.equal(validatePackageCompletionRule(v3, "rule", questions).valid, true);
  for (const invalid of [
    { ...v3, chapters: [{ ...v3.chapters[0], units: [] }] },
    { ...v3, chapters: [{ ...v3.chapters[0], units: [{ mentalUnitId: "foreign-unit", requiredCorrectQuestionCount: 4 }] }] },
    { ...v3, chapters: [{ ...v3.chapters[0], units: [{ mentalUnitId: "unit-001", requiredCorrectQuestionCount: 3 }] }] },
    { ...v3, chapters: [{ ...v3.chapters[0], units: [{ ...v3.chapters[0].units[0], extra: true }] }] },
  ]) assert.equal(validatePackageCompletionRule(invalid, "rule", questions).valid, false);
  assert.equal(validatePackageCompletionRule(v3, "rule", questions.slice(1)).valid, false);
  assert.equal(validatePackageCompletionRule(v3, "rule", [...questions.slice(0, 3), questions[0]]).valid, false);
  assert.equal(validatePackageCompletionRule(v3, "rule", [...questions, { ...questions[0], mentalUnitId: "supplement" }]).valid, false);
  const { root, catalog } = await workspace(t);
  const entry = catalog.tracks.find((value) => value.trackId === trackId);
  entry.completionRule = v3;
  await writeFile(path.join(root, "content", "catalog.json"), `${canonicalJson(catalog)}\n`);
  const file = path.join(root, "content", trackId, "node-001", "unit-001.json");
  const [question] = JSON.parse(await readFile(file, "utf8"));
  const complete = Array.from({ length: 4 }, (_, index) => ({ ...question, questionId: `${trackId}-v3-${index}` }));
  await writeFile(file, JSON.stringify(complete));
  const built = await buildTrack({ rootDirectory: root, trackId });
  assert.deepEqual(built.artifact.completionRule, v3);
  assert.equal(built.lockEntry.sha256, sha256(built.artifactBytes));
});

test("Claude v3 covers all final exam units while other tracks keep v2", async () => {
  const catalog = loadCanonicalCatalog();
  const claude = catalog.tracks.find((entry) => entry.trackId === "claude-certified-architect-professional-certification");
  assert.equal(claude.completionRule.ruleVersion, 3);
  assert.equal(claude.completionRule.chapters.flatMap((chapter) => chapter.units).length, 53);
  for (const track of catalog.tracks.filter((entry) => entry !== claude)) assert.equal(track.completionRule.ruleVersion, 2);
  const { validateTrack } = await import("../scripts/build.mjs");
  const result = await validateTrack({ trackId: claude.trackId });
  assert.equal(result.questions.length, 972);
  assert.equal(result.questions.some((question) => question.mentalUnitId.toLowerCase().includes("cowork")), false);
});

test("CC04 native fixture uses the exact final source rule and real exam question identities", async () => {
  const { validateTrack } = await import("../scripts/build.mjs");
  const trackId = "claude-certified-architect-professional-certification";
  const source = await validateTrack({ trackId });
  const fixture = JSON.parse(readFileSync(new URL("../../patternly/src/testing/claudeCoverageFixtureData.json", import.meta.url), "utf8"));
  assert.equal(fixture.trackId, trackId);
  assert.equal(fixture.contentVersion, "ccarp-2026.10.11-capacity-v1-bizq02-v2-bizq03-planning-v2-cc02-v1-cc03-v1-cc04-v3");
  assert.equal(source.track.contentVersion, "ccarp-2026.10.14-qle-v2-full-path-identity-v2");
  assert.deepEqual(fixture.completionRule, source.track.completionRule);
  const actual = new Map(source.questions.map((question) => [question.questionId, question]));
  assert.equal(fixture.questions.length, 53 * 4);
  assert.equal(new Set(fixture.questions.map((question) => question.questionId)).size, 53 * 4);
  for (const question of fixture.questions) {
    const sourceQuestion = actual.get(question.questionId);
    assert.ok(sourceQuestion, question.questionId);
    assert.equal(question.nodeId, sourceQuestion.nodeId);
    assert.equal(question.mentalUnitId, sourceQuestion.mentalUnitId);
  }
});

test("Claude V3 planning policy costs every required Focus unit and retains review availability boundaries", async () => {
  const { validateTrack } = await import("../scripts/build.mjs");
  const source = await validateTrack({ trackId: "claude-certified-architect-professional-certification" });
  const policy = JSON.parse(readFileSync(new URL("../config/curricula/claude-certified-architect-professional-certification.json", import.meta.url), "utf8")).planningPolicy;
  const scopes = source.track.completionRule.chapters.flatMap((chapter) => chapter.units.map((unit) => `${chapter.nodeId}/${unit.mentalUnitId}`)).sort();
  const focus = policy.workEstimates.filter((estimate) => estimate.modeId === "certification-focus-practice");
  assert.deepEqual(focus.flatMap((estimate) => estimate.scopeRefs.map((scope) => `${scope.nodeId}/${scope.mentalUnitId}`)).sort(), scopes);
  assert.equal(policy.unavailableScopes.some((entry) => entry.modeIds.includes("certification-focus-practice")), false);
  for (const modeId of ["certification-weak-area-review", "certification-quick-review"]) {
    const estimates = policy.workEstimates.filter((estimate) => estimate.modeId === modeId).flatMap((estimate) => estimate.scopeRefs);
    assert.equal(estimates.length, 9);
    assert.ok(estimates.every((scope) => scope.nodeId === "solution_design_and_architecture"));
    const unavailable = policy.unavailableScopes.filter((entry) => entry.modeIds.includes(modeId));
    assert.equal(unavailable.length, 44);
    assert.ok(unavailable.every((entry) => entry.reason === "unknown_runtime_scope" && entry.scopeRef.nodeId !== "solution_design_and_architecture"));
  }
});
