import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadCanonicalCatalog, loadCanonicalFixture, validateCatalog } from "../scripts/content/question-contract.mjs";
import { ContentBuildError, buildAll, buildTrack, canonicalJson, sha256 } from "../scripts/build.mjs";

const rule = Object.freeze({
  ruleVersion: 2,
  chapters: Object.freeze([{ nodeId: "node-001", mentalUnitCount: 1, minimumAttemptCount: 20, rollingWindowSize: 20, qualityThreshold: 0.8 }])
});
const trackId = "aws-certified-solutions-architect-associate";
const CONTENT_ROOT = path.resolve(fileURLToPath(new URL("../", import.meta.url)));

function assertCurrentCompletionRulesMatchSource({ artifacts, catalog }) {
  const catalogTracks = new Map(catalog.tracks.map((track) => [track.trackId, track]));
  assert.deepEqual(artifacts.map(({ trackId }) => trackId).sort(), [...catalogTracks.keys()].sort(), "current build must contain every canonical track exactly once");
  for (const { trackId: builtTrackId, artifact } of artifacts) {
    const sourceTrack = catalogTracks.get(builtTrackId);
    assert.equal(Object.hasOwn(artifact, "completionRule"), Object.hasOwn(sourceTrack, "completionRule"), `${builtTrackId}: completion rule presence follows current catalog`);
    if (Object.hasOwn(sourceTrack, "completionRule")) assert.deepEqual(artifact.completionRule, sourceTrack.completionRule, `${builtTrackId}: current artifact transports exact source completion rule`);
    assert.ok(artifact.questions.length > 0, `${builtTrackId}: current artifact has authored questions`);
  }
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

test("current artifacts transport their exact catalog completion rules", async (t) => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-current-completion-rules-"));
  t.after(() => rm(outputRoot, { recursive: true, force: true }));
  const { catalog, artifacts } = await buildAll({ outputRoot });
  assertCurrentCompletionRulesMatchSource({ artifacts, catalog });
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
