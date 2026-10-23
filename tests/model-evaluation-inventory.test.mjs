import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { sha256, ContentBuildError } from "../scripts/build.mjs";
import { QUESTION_INTERACTION_TYPES } from "../scripts/content/question-contract.mjs";
import { createInventory, inventoryBytes, INVENTORY_REPORT_PATH, CURRENT_AUDIT_STATE_PATH } from "../scripts/model-evaluation/inventory.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const allUnits = (inventory) => inventory.tracks.flatMap((track) => track.nodes.flatMap((node) => node.mentalUnits));
const countInteractions = (items) => Object.fromEntries(QUESTION_INTERACTION_TYPES.map((type) => [type, items.filter((item) => item.interactionType === type).length]));
async function copyInputs() {
  const root = await mkdtemp(path.join(os.tmpdir(), "patternly-09a-"));
  for (const directory of ["content", "config", "schemas/content"]) await cp(path.join(ROOT, directory), path.join(root, directory), { recursive: true, filter: (file) => file !== path.join(ROOT, CURRENT_AUDIT_STATE_PATH) });
  return root;
}

test("nine real canonical banks are deterministic and structurally valid despite historical differences", { timeout: 120_000 }, async () => {
  const stateBefore = await readFile(path.join(ROOT, CURRENT_AUDIT_STATE_PATH));
  const first = await createInventory({ auditStatePath: CURRENT_AUDIT_STATE_PATH });
  const second = await createInventory({ auditStatePath: CURRENT_AUDIT_STATE_PATH });
  assert.equal(inventoryBytes(first), inventoryBytes(second));
  assert.equal(sha256(inventoryBytes(first)), sha256(inventoryBytes(second)));
  assert.equal(first.schemaVersion, "patternly-model-evaluation-inventory-v2");
  assert.deepEqual(first.observed, { tracks: 9, nodes: 117, mentalUnits: 958, questions: 16749 });
  assert.equal(first.status, "structurally_valid");
  assert.deepEqual(first.structuralValidation, { status: "PASS", validator: "scripts/build.mjs:validateTrack", duplicateQuestions: 0, unassignedQuestions: 0, multiplyAssignedQuestions: 0 });
  assert.deepEqual(first.baseline, { tracks: 9, nodes: 117, mentalUnits: 932, questions: 16041 });
  assert.equal(first.baselineComparison.status, "differences");
  assert.deepEqual(first.differences, [
    { key: "mentalUnits", expected: 932, observed: 958 }, { key: "questions", expected: 16041, observed: 16749 },
    { trackId: "aws-certified-solutions-architect-associate", key: "mentalUnits", expected: 134, observed: 145 },
    { trackId: "aws-certified-solutions-architect-associate", key: "questions", expected: 2568, observed: 2604 },
    { trackId: "claude-certified-architect-professional-certification", key: "mentalUnits", expected: 38, observed: 53 },
    { trackId: "claude-certified-architect-professional-certification", key: "questions", expected: 300, observed: 972 },
  ]);
  assert.equal(first.baselineComparison.explanations.length, 4);
  for (const key of ["mentalUnits", "questions"]) {
    const total = first.differences.find((row) => !row.trackId && row.key === key);
    assert.equal(first.baselineComparison.explanations.filter((row) => row.key === key).reduce((sum, row) => sum + row.delta, 0), total.observed - total.expected);
  }
  const ids = new Set();
  for (const track of first.tracks) {
    const trackItems = [];
    for (const node of track.nodes) {
      const nodeItems = [];
      for (const unit of node.mentalUnits) {
        const bytes = await readFile(path.join(ROOT, "content", unit.sourcePath));
        assert.equal(sha256(bytes), unit.sourceSha256);
        const questions = JSON.parse(bytes);
        assert.equal(questions.length, unit.observed.questions);
        assert.deepEqual(unit.interactionCounts, countInteractions(unit.items));
        assert.equal(unit.auditCoverage.status, "NOT_ASSESSED");
        for (const question of questions) {
          assert.equal(question.trackId, track.trackId);
          assert.equal(question.nodeId, node.nodeId);
          assert.equal(question.mentalUnitId, unit.mentalUnitId);
          assert.ok(!ids.has(question.questionId)); ids.add(question.questionId);
          assert.deepEqual(unit.items.find(({ questionId }) => questionId === question.questionId), { questionId: question.questionId, interactionType: question.interaction.type, itemSha256: sha256(question) });
        }
        nodeItems.push(...unit.items);
      }
      assert.deepEqual(node.interactionCounts, countInteractions(nodeItems));
      assert.deepEqual(node.observed, { mentalUnits: node.mentalUnits.length, questions: nodeItems.length });
      trackItems.push(...nodeItems);
    }
    assert.deepEqual(track.interactionCounts, countInteractions(trackItems));
    assert.equal(track.observed.questions, trackItems.length);
  }
  assert.equal(ids.size, first.observed.questions);
  assert.deepEqual(first.interactionCounts, { choice_single: 14695, choice_multiple: 445, ordering: 1173, complexity: 279, decision_matrix: 157 });
  assert.deepEqual(first.interactionCounts, countInteractions(allUnits(first).flatMap((unit) => unit.items)));
  assert.equal(first.sourceManifest.sha256, sha256(first.sourceManifest.files));
  assert.ok(!first.sourceManifest.files.some(({ file }) => [CURRENT_AUDIT_STATE_PATH, INVENTORY_REPORT_PATH].includes(file)));
  for (const record of first.sourceManifest.files) assert.equal(record.sha256, sha256(await readFile(path.join(ROOT, record.file))));
  assert.match(first.repository.sourceRepositoryCommit, /^[a-f0-9]{40}$/u);
  assert.equal(first.currentAudit.stateSha256, sha256(stateBefore));
  assert.deepEqual(first.currentAudit.coverageByStatus, { NOT_ASSESSED: 958, PARTIAL: 0, COMPLETE: 0 });
  const claude = first.tracks.find(({ trackId }) => trackId.startsWith("claude-"));
  assert.equal(claude.observed.questions, 972); assert.ok(claude.observed.questions > 7 * 120);
  assert.deepEqual(claude.nodes.map((node) => [node.nodeId, node.chapterMinimum.currentCount, node.chapterMinimum.deficit, node.chapterMinimum.met]), [
    ["enterprise_tools_retrieval_and_integration", 175, 0, true], ["evaluation_diagnosis_and_optimization", 136, 0, true],
    ["governance_safety_and_risk_controls", 150, 0, true], ["model_prompt_and_context_decisions", 115, 5, false],
    ["solution_design_and_architecture", 168, 0, true], ["stakeholder_decisions_and_delivery_lifecycle", 127, 0, true],
    ["team_workflows_and_operational_enablement", 101, 19, false],
  ]);
  assert.deepEqual(await readFile(path.join(ROOT, CURRENT_AUDIT_STATE_PATH)), stateBefore);
  assert.deepEqual(first.claims, { semanticAssessment: "NOT_PERFORMED", contentApproval: "NOT_GRANTED", publication: "NOT_PERFORMED", modelCalls: 0 });
});

test("real shared validator rejects unknown schema, legacy input, duplicates and wrong assignments", { timeout: 120_000 }, async (t) => {
  const root = await copyInputs();
  try {
    const source = path.join(root, "content", allUnits(await createInventory())[0].sourcePath);
    const original = await readFile(source); const questions = JSON.parse(original);
    const catalogPath = path.join(root, "content/catalog.json"); const catalogBytes = await readFile(catalogPath);
    for (const [name, file, bytes] of [
      ["unknown catalog schema", catalogPath, JSON.stringify({ ...JSON.parse(catalogBytes), schemaVersion: "unsupported-v999" })],
      ["legacy wrapped source", source, JSON.stringify({ schemaVersion: "legacy-candidate-source-v1", questions })],
      ["legacy question fields", source, JSON.stringify(questions.map((question, index) => index ? question : { ...question, learningBlockId: "legacy" }))],
      ["duplicate question ID", source, JSON.stringify([...questions, questions[0]])],
      ["unassigned taxonomy", source, JSON.stringify(questions.map((question, index) => index ? question : { ...question, nodeId: "unassigned-node" }))],
    ]) await t.test(name, async () => {
      await writeFile(file, bytes);
      try { await assert.rejects(createInventory({ rootDirectory: root }), (error) => error instanceof ContentBuildError, "must reject through the actual shared validator"); }
      finally { await writeFile(file, file === source ? original : catalogBytes); }
    });
    await cp(path.join(ROOT, CURRENT_AUDIT_STATE_PATH), path.join(root, CURRENT_AUDIT_STATE_PATH));
    const state = JSON.parse(await readFile(path.join(root, CURRENT_AUDIT_STATE_PATH)));
    state.inventory.tracks[0].nodes[0].mentalUnits[0].sourceSha256 = "0".repeat(64);
    await writeFile(path.join(root, CURRENT_AUDIT_STATE_PATH), JSON.stringify(state));
    // Give the valid fixture a real HEAD; this is an isolated temporary repository.
    const git = (args) => execFileSync("git", args, { cwd: root, stdio: "pipe" });
    git(["init", "--quiet"]); git(["add", "."]);
    git(["-c", "user.name=Inventory Fixture", "-c", "user.email=inventory-fixture@example.invalid", "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Temporary inventory regression fixture"]);
    await assert.rejects(createInventory({ rootDirectory: root, auditStatePath: CURRENT_AUDIT_STATE_PATH }), /Current audit source identity mismatch/u);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("first report write in a real clean Git repository preserves bytes and unrelated dirt remains visible", { timeout: 120_000 }, async () => {
  const root = await copyInputs();
  const git = (args) => execFileSync("git", args, { cwd: root, stdio: "pipe" });
  try {
    git(["init", "--quiet"]); git(["add", "."]);
    git(["-c", "user.name=Inventory Fixture", "-c", "user.email=inventory-fixture@example.invalid", "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Temporary inventory regression fixture"]);
    const first = await createInventory({ rootDirectory: root }); assert.equal(first.repository.sourceTree, "clean");
    const output = path.join(root, INVENTORY_REPORT_PATH); await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, inventoryBytes(first));
    const second = await createInventory({ rootDirectory: root }); assert.equal(second.repository.sourceTree, "clean");
    assert.equal(inventoryBytes(first), inventoryBytes(second));
    assert.equal(sha256(await readFile(output)), sha256(inventoryBytes(second)));
    await writeFile(path.join(path.dirname(output), "unrelated.json"), "{}\n");
    assert.equal((await createInventory({ rootDirectory: root })).repository.sourceTree, "dirty", "exclude only the exact current report");
  } finally { await rm(root, { recursive: true, force: true }); }
});
