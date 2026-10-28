import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAll, buildTrack, canonicalJson, sha256 } from "../build.mjs";

const repository = fileURLToPath(new URL("../../", import.meta.url));
const taskId = "PAT-CODE-018.1";
const scopeId = "PAT-CODE-018-S01";
// First registered shipping track; one question and no optional simulation profile.
const trackId = "aws-certified-solutions-architect-associate";
const questionPath = `content/${trackId}/node-001/mental-unit-001.json`;
const artifactName = `${trackId}.json`;
const cases = [
  ["C01", "valid v1 baseline", "accept v1; lock SHA and artifact version agree"],
  ["C02", "valid v2 into empty output", "accept v2; lock SHA and artifact version agree"],
  ["C03", "v1 to v2, same output, buildTrack", "accept v2; replace intact v1 pair"],
  ["C04", "v1 to v2, same output, buildAll", "accept v2; replace intact v1 pair"],
  ["C05", "malformed old lock", "reject invalid lock shape before output mutation"],
  ["C06", "old artifact checksum mismatch", "reject checksum mismatch before output mutation"],
  ["C07", "old artifact version mismatch with recomputed SHA", "reject artifact/lock version mismatch before output mutation"],
  ["C08", "same-version buildTrack second rename failure", "report failure; restore old pair; remove temporary files"],
  ["C09", "same-version buildAll second rename failure", "report failure; restore old pair; remove temporary files"]
].map(([id, name, expected]) => ({ id, name, expected }));

async function json(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
}

async function workspace(root, contentVersion) {
  const fixtureBytes = await readFile(path.join(repository, "tests/fixtures/shared-contract-fixture.json"));
  const question = JSON.parse(fixtureBytes).questions.find(({ interaction }) => interaction.type === "choice_single");
  assert.ok(question, "shared fixture must contain choice_single");
  Object.assign(question, { trackId, questionId: "018-q-001", nodeId: "node-001", mentalUnitId: "mental-unit-001" });
  const planningPolicy = {
    schemaVersion: "patternly-learning-planning-policy-v1", policyVersion: "fixture-v1",
    workEstimates: [{
      estimateId: "018-fixture", modeId: "fixture-mode",
      scopeRefs: [{ nodeId: question.nodeId, mentalUnitId: question.mentalUnitId }],
      minMinutesPerResponse: 1, typicalMinutesPerResponse: 2, maxMinutesPerResponse: 3,
      provenance: "authored", observationCount: 0, rationale: "Bounded builder fixture.",
      reviewReserve: {
        kind: "authored_estimate", minAdditionalResponsesPerNewResponse: 0,
        typicalAdditionalResponsesPerNewResponse: 0.5, maxAdditionalResponsesPerNewResponse: 4,
        provenance: "authored", observationCount: 0, rationale: "Fixture estimate."
      }
    }], unavailableScopes: []
  };
  const files = {
    "content/catalog.json": { schemaVersion: "patternly-content-catalog-v1", tracks: [{ trackId, contentVersion }] },
    "config/track-runtime-bindings.json": {
      schemaVersion: "patternly-track-runtime-bindings-v1", tracks: [{ trackId, familyId: "certification", profileLoaderKey: null }]
    },
    "config/families/certification.json": { schemaVersion: "family-config-v1", familyId: "certification" },
    [`config/tracks/${trackId}.json`]: { schemaVersion: "track-config-v1", trackId, familyId: "certification" },
    [`config/curricula/${trackId}.json`]: { trackId, planningPolicy },
    [questionPath]: [question]
  };
  for (const [name, value] of Object.entries(files)) await json(path.join(root, name), value);
}

async function outputSnapshot(root) {
  const files = {};
  try {
    for (const name of (await readdir(root)).sort()) files[name] = sha256(await readFile(path.join(root, name)));
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  return files;
}

async function updateVersion(root, version) {
  const file = path.join(root, "content/catalog.json");
  const catalog = JSON.parse(await readFile(file, "utf8"));
  catalog.tracks[0].contentVersion = version;
  await writeFile(file, canonicalJson(catalog));
}

async function assertPair(outputRoot, version) {
  const bytes = await readFile(path.join(outputRoot, artifactName));
  const artifact = JSON.parse(bytes);
  const lock = JSON.parse(await readFile(path.join(outputRoot, "content-lock.json"), "utf8"));
  assert.equal(artifact.contentVersion, version);
  assert.equal(lock.tracks[0].contentVersion, version);
  assert.equal(lock.tracks[0].sha256, sha256(bytes));
  assert.equal(lock.tracks[0].questionCount, artifact.questions.length);
}

// Always create a new directory: reruns cannot overwrite an earlier observation.
const evidenceRoot = path.join(repository, ".local/pat-code-018-1-20261027");
await mkdir(evidenceRoot, { recursive: true });
const runRoot = await mkdtemp(path.join(evidenceRoot, "run-"));
const environment = { node: process.version, platform: process.platform, arch: process.arch, runRoot };
const sourceFiles = ["scripts/build.mjs", "scripts/content/question-contract.mjs", "scripts/content/planning-policy.mjs",
  "scripts/content/track-runtime-bindings.mjs", "scripts/content/reproduce-content-version-transition.mjs",
  "tests/content-builder.test.mjs", "tests/currentRelease.test.mjs", "tests/fixtures/shared-contract-fixture.json"];
const candidate = {
  head: execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository, encoding: "utf8" }).trim(),
  files: Object.fromEntries(await Promise.all(sourceFiles.map(async name => [name, sha256(await readFile(path.join(repository, name)))])))
};
await json(path.join(runRoot, "scope.json"), {
  task_id: taskId, scope_id: scopeId, candidate, environment, cases,
  selection: "first shipping track in runtime-binding order; minimal registered single-track fixture",
  limits: "synthetic builder fixture; no shipping banks, optional profiles, APP, provider, publication or power-loss guarantee",
  probe: "Real builder accepted minimal one-track filesystem fixture on Node 22.22.3 before tool creation.",
  assessment: { fit: 1, simplicity: 0.95, risk: 0.98, maintainability: 0.9, minimum: 0.9,
    reason: "One diagnostic entry point uses production builder and real temporary filesystem; no product change." }
});
const results = [];
for (const spec of cases) {
  const caseRoot = path.join(runRoot, spec.id);
  const rootDirectory = path.join(caseRoot, "input");
  const outputRoot = path.join(caseRoot, "output");
  await workspace(rootDirectory, spec.id === "C02" ? "fixture-v2" : "fixture-v1");
  const options = { rootDirectory, outputRoot, trackId };
  if (spec.id !== "C01" && spec.id !== "C02") {
    await buildTrack(options);
    await assertPair(outputRoot, "fixture-v1");
    await cp(outputRoot, path.join(caseRoot, "intact-v1"), { recursive: true });
  }
  if (["C03", "C04"].includes(spec.id)) await updateVersion(rootDirectory, "fixture-v2");
  const lockPath = path.join(outputRoot, "content-lock.json");
  const artifactPath = path.join(outputRoot, artifactName);
  if (spec.id === "C05") {
    const lock = JSON.parse(await readFile(lockPath, "utf8"));
    delete lock.tracks[0].sha256;
    await writeFile(lockPath, canonicalJson(lock));
  }
  if (spec.id === "C06") await writeFile(artifactPath, `${await readFile(artifactPath, "utf8")}\n`);
  if (spec.id === "C07") {
    const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
    artifact.contentVersion = "tampered-version";
    const bytes = canonicalJson(artifact);
    await writeFile(artifactPath, bytes);
    const lock = JSON.parse(await readFile(lockPath, "utf8"));
    lock.tracks[0].sha256 = sha256(bytes);
    await writeFile(lockPath, canonicalJson(lock));
  }
  let renameCalls = 0;
  if (["C08", "C09"].includes(spec.id)) {
    const file = path.join(rootDirectory, questionPath);
    const questions = JSON.parse(await readFile(file, "utf8"));
    questions[0].prompt = "Changed fixture prompt for rollback.";
    await writeFile(file, canonicalJson(questions));
    options.fileOps = { rename: async (...args) => {
      renameCalls += 1;
      if (renameCalls === 2) throw new Error("PAT-CODE-018 injected second rename failure");
      return rename(...args);
    } };
  }
  const before = await outputSnapshot(outputRoot);
  await json(path.join(caseRoot, "before.json"), { files: before });
  let error;
  try {
    if (["C04", "C09"].includes(spec.id)) await buildAll(options);
    else await buildTrack(options);
  } catch (caught) { error = { name: caught.name, message: caught.message, details: caught.details, stack: caught.stack }; }
  const after = await outputSnapshot(outputRoot);
  const preserved = canonicalJson(before) === canonicalJson(after);
  let result;
  if (["C01", "C02", "C03", "C04"].includes(spec.id)) {
    if (!error) await assertPair(outputRoot, spec.id === "C01" ? "fixture-v1" : "fixture-v2");
    result = error ? "FAIL" : "PASS";
    if (error) assert.ok(preserved, "rejected transition must leave previous outputs intact");
  } else {
    const pattern = { C05: /invalid shape/u, C06: /checksum mismatch/u, C07: /Artifact contentVersion mismatch/u,
      C08: /previous outputs were restored/u, C09: /previous outputs were restored/u }[spec.id];
    result = error && pattern.test(error.message) && preserved ? "PASS" : "FAIL";
    if (["C08", "C09"].includes(spec.id)) assert.equal(renameCalls, 2, "fault must reach second rename");
  }
  const actual = { status: error ? "rejected" : "accepted", error, before, after, preserved, renameCalls };
  await json(path.join(caseRoot, "actual.json"), actual);
  results.push({ ...spec, result, method: ["C04", "C09"].includes(spec.id) ? "buildAll" : "buildTrack",
    actual, evidence: caseRoot });
}
const report = {
  task_id: taskId, scope_id: scopeId, candidate, environment,
  frozen_scope_sha256: sha256(await readFile(path.join(runRoot, "scope.json"))),
  case_results: results, wykonanie: "DONE", werdykt_zakresu: results.every(({ result }) => result === "PASS") ? "PASS" : "FAIL",
  operation_state: { state: "terminal", effects: "isolated fixture writes only", checkpoint: runRoot,
    safe_next_read: "read scope.json, report.json and case directories; reruns always allocate a new directory" },
  cleanup: "No processes left running. Fixture inputs, old v1 pairs, output and logs retained for review. No product output written.",
  next_action: "PAT-CODE-018.2 after separate authorization; PAT-CODE-018.3 verifies fixed candidate and .4 provides independent acceptance."
};
await json(path.join(runRoot, "report.json"), report);
process.stdout.write(`${JSON.stringify({ report: path.join(runRoot, "report.json"), scope_id: scopeId,
  wykonanie: report.wykonanie, werdykt_zakresu: report.werdykt_zakresu,
  results: results.map(({ id, result, actual }) => ({ id, result, status: actual.status, message: actual.error?.message })) }, null, 2)}\n`);
