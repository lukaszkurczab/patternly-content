import { execFileSync } from "node:child_process";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { canonicalJson, sha256, validateTrack } from "../build.mjs";
import { ACCEPTED_TRACK_IDS, QUESTION_INTERACTION_TYPES } from "../content/question-contract.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const BASELINE = Object.freeze({ tracks: 9, nodes: 117, mentalUnits: 932, questions: 16041 });
const BANK_BASELINE = Object.freeze({
  "aws-certified-solutions-architect-associate": { nodes: 21, mentalUnits: 134, questions: 2568 },
  "backend-system-design-interview": { nodes: 10, mentalUnits: 89, questions: 1569 },
  "claude-certified-architect-professional-certification": { nodes: 7, mentalUnits: 38, questions: 300 },
  "coding-interview-dsa-problem-solving": { nodes: 26, mentalUnits: 213, questions: 3404 },
  "frontend-system-design-interview": { nodes: 10, mentalUnits: 88, questions: 1766 },
  "google-cloud-associate-cloud-engineer": { nodes: 20, mentalUnits: 152, questions: 2981 },
  "microsoft-azure-administrator-associate-az-104": { nodes: 9, mentalUnits: 75, questions: 1288 },
  "microsoft-azure-ai-fundamentals-ai-901": { nodes: 5, mentalUnits: 64, questions: 752 },
  "object-oriented-design-interview": { nodes: 9, mentalUnits: 79, questions: 1413 },
});
export const INVENTORY_REPORT_PATH = "reports/model-evaluation/09-a-inventory.json";
export const CURRENT_AUDIT_STATE_PATH = "config/current-content-audit-state.json";
const AUDIT_CONTRACT_PATH = "config/current-content-audit-contract.json";
const compare = (left, right) => left < right ? -1 : left > right ? 1 : 0;

const countsFor = (items) => Object.fromEntries(QUESTION_INTERACTION_TYPES.map((type) => [type, items.filter((item) => item.interactionType === type).length]));
const same = (left, right) => canonicalJson(left) === canonicalJson(right);
function fail(message) { throw new Error(`model_inventory_invalid: ${message}`); }

async function inputManifest(rootDirectory) {
  const files = ["content/catalog.json", "schemas/content/question.schema.json"];
  async function collect(relative) {
    for (const entry of await readdir(path.join(rootDirectory, relative), { withFileTypes: true })) {
      const file = `${relative}/${entry.name}`;
      if (file === CURRENT_AUDIT_STATE_PATH) continue;
      if (entry.isDirectory()) await collect(file);
      else if (entry.isFile() && entry.name.endsWith(".json")) files.push(file);
      else fail(`Unsupported input path: ${file}`);
    }
  }
  await collect("config");
  for (const trackId of [...ACCEPTED_TRACK_IDS].sort(compare)) await collect(`content/${trackId}`);
  const records = await Promise.all(files.sort(compare).map(async (file) => ({ file, sha256: sha256(await readFile(path.join(rootDirectory, file))) })));
  return { sha256: sha256(records), files: records };
}

function repositoryProvenance(rootDirectory) {
  const sourceRepositoryCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: rootDirectory, encoding: "utf8" }).trim();
  // The current output is derived evidence, not an input. Exclude this exact file
  // even before it is tracked, so its first write cannot change the manifest.
  const status = execFileSync("git", ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ".", `:(exclude,literal)${INVENTORY_REPORT_PATH}`], { cwd: rootDirectory, encoding: "utf8" });
  return { sourceRepositoryCommit, sourceTree: status ? "dirty" : "clean", excludedOutputPath: INVENTORY_REPORT_PATH };
}

function sourceProjection(inventory) {
  return inventory.tracks.map((track) => ({ trackId: track.trackId, contentVersion: track.contentVersion,
    nodes: track.nodes.map((node) => ({ nodeId: node.nodeId, mentalUnits: node.mentalUnits.map((unit) => ({
      mentalUnitId: unit.mentalUnitId, sourcePath: unit.sourcePath, sourceSha256: unit.sourceSha256,
      items: unit.items.map(({ questionId, interactionType, itemSha256 }) => ({ questionId, interactionType, itemSha256 })),
    })) })),
  }));
}

async function attachCurrentAudit(inventory, rootDirectory, auditStatePath) {
  if (auditStatePath !== CURRENT_AUDIT_STATE_PATH) fail("Only the canonical current audit state is supported");
  const stateBytes = await readFile(path.join(rootDirectory, auditStatePath));
  const contractBytes = await readFile(path.join(rootDirectory, AUDIT_CONTRACT_PATH));
  const state = JSON.parse(stateBytes);
  const contract = JSON.parse(contractBytes);
  if (state.schemaVersion !== "patternly-current-content-audit-state-v2" || !/^[a-f0-9]{64}$/u.test(state.sourceInputFingerprint)
    || !Array.isArray(state.unitCoverage) || !state.inventory || !same(sourceProjection(state.inventory), sourceProjection(inventory))) fail("Current audit source identity mismatch");
  const minimum = contract.chapterMinimum;
  if (minimum?.trackId !== "claude-certified-architect-professional-certification" || minimum.minimumActiveQuestionsPerNode !== 120) fail("Invalid Claude chapter minimum contract");
  const coverage = new Map();
  for (const [index, row] of state.unitCoverage.entries()) {
    const key = `${row.track}/${row.nodeId}/${row.mentalUnitId}`;
    if (coverage.has(key) || !["NOT_ASSESSED", "PARTIAL", "COMPLETE"].includes(row.status)) fail(`Invalid or duplicate audit coverage: ${key}`);
    coverage.set(key, { row, pointer: `/unitCoverage/${index}` });
  }
  let units = 0;
  for (const track of inventory.tracks) for (const node of track.nodes) {
    for (const unit of node.mentalUnits) {
      const key = `${track.trackId}/${node.nodeId}/${unit.mentalUnitId}`;
      const binding = coverage.get(key);
      if (!binding || !same(binding.row.assignedItemIds, unit.items.map(({ questionId }) => questionId))) fail(`Audit coverage assignment mismatch: ${key}`);
      unit.auditCoverage = { statePath: auditStatePath, pointer: binding.pointer, status: binding.row.status };
      units += 1;
    }
    if (track.trackId === minimum.trackId) node.chapterMinimum = {
      minimum: minimum.minimumActiveQuestionsPerNode,
      currentCount: node.observed.questions,
      deficit: Math.max(0, minimum.minimumActiveQuestionsPerNode - node.observed.questions),
      met: node.observed.questions >= minimum.minimumActiveQuestionsPerNode,
      boundary: "Question count only; no semantic assessment.",
    };
  }
  if (units !== coverage.size) fail("Unassigned audit coverage rows");
  inventory.currentAudit = { statePath: auditStatePath, stateSha256: sha256(stateBytes),
    contractPath: AUDIT_CONTRACT_PATH, contractSha256: sha256(contractBytes),
    sourceInputFingerprint: state.sourceInputFingerprint,
    coverageByStatus: Object.fromEntries(["NOT_ASSESSED", "PARTIAL", "COMPLETE"].map((status) => [status, [...coverage.values()].filter(({ row }) => row.status === status).length])),
    boundary: "Read-only reference to the current audit; inventory neither performs nor grants semantic assessment.",
  };
  if (sha256(await readFile(path.join(rootDirectory, auditStatePath))) !== sha256(stateBytes)
    || sha256(await readFile(path.join(rootDirectory, AUDIT_CONTRACT_PATH))) !== sha256(contractBytes)) fail("Audit snapshot changed during inventory");
}

export async function createInventory({ rootDirectory = ROOT, auditStatePath } = {}) {
  const before = await inputManifest(rootDirectory);
  const tracks = [];
  const allIds = new Set();
  const bankDifferences = [];
  const interactionCounts = Object.fromEntries(QUESTION_INTERACTION_TYPES.map((type) => [type, 0]));
  let nodeCount = 0;
  let mentalUnitCount = 0;
  let questionCount = 0;

  for (const trackId of [...ACCEPTED_TRACK_IDS].sort(compare)) {
    const validated = await validateTrack({ rootDirectory, trackId });
    const nodes = new Map();
    let bankQuestions = 0;
    const assigned = new Set();
    for (const filePath of validated.sourceFiles) {
      const relative = path.relative(path.join(rootDirectory, "content"), filePath).split(path.sep);
      if (relative.length !== 3 || relative[0] !== trackId || !relative[2].endsWith(".json")) throw new Error(`Invalid canonical source path: ${filePath}`);
      const nodeId = relative[1];
      const mentalUnitId = relative[2].slice(0, -5);
      const sourcePath = relative.join("/");
      const sourceBytes = await readFile(filePath);
      const sourceSha256 = sha256(sourceBytes);
      if (before.files.find(({ file }) => file === `content/${sourcePath}`)?.sha256 !== sourceSha256) fail(`Source changed during validation: ${sourcePath}`);
      const questions = validated.questions.filter((question) => question.nodeId === nodeId && question.mentalUnitId === mentalUnitId);
      if (questions.length === 0) throw new Error(`Unassigned canonical source: ${sourcePath}`);
      const authored = JSON.parse(sourceBytes).sort((left, right) => compare(left.questionId, right.questionId));
      if (!same(authored, questions)) fail(`Validated questions differ from captured source: ${sourcePath}`);
      const items = questions.map((question) => {
        if (allIds.has(question.questionId)) throw new Error(`Duplicate global questionId: ${question.questionId}`);
        allIds.add(question.questionId);
        if (assigned.has(question.questionId)) fail(`Multiply assigned question: ${question.questionId}`);
        assigned.add(question.questionId);
        const interactionType = question.interaction.type;
        if (!(interactionType in interactionCounts)) throw new Error(`Unknown interaction: ${question.questionId}`);
        interactionCounts[interactionType] += 1;
        questionCount += 1;
        bankQuestions += 1;
        return { questionId: question.questionId, interactionType, itemSha256: sha256(question) };
      }).sort((left, right) => compare(left.questionId, right.questionId));
      if (!nodes.has(nodeId)) nodes.set(nodeId, []);
      nodes.get(nodeId).push({ mentalUnitId, sourcePath, sourceSha256, observed: { questions: items.length }, interactionCounts: countsFor(items), items });
      mentalUnitCount += 1;
    }
    if (assigned.size !== validated.questions.length) fail(`Unassigned questions in ${trackId}`);
    nodeCount += nodes.size;
    const bankObserved = { nodes: nodes.size, mentalUnits: [...nodes.values()].reduce((sum, units) => sum + units.length, 0), questions: bankQuestions };
    for (const key of Object.keys(BANK_BASELINE[trackId])) {
      if (bankObserved[key] !== BANK_BASELINE[trackId][key]) bankDifferences.push({ trackId, key, expected: BANK_BASELINE[trackId][key], observed: bankObserved[key] });
    }
    tracks.push({
      trackId,
      contentVersion: validated.track.contentVersion,
      observed: bankObserved,
      interactionCounts: countsFor([...nodes.values()].flatMap((units) => units.flatMap((unit) => unit.items))),
      nodes: [...nodes].sort(([left], [right]) => compare(left, right)).map(([nodeId, units]) => ({
        nodeId,
        observed: { mentalUnits: units.length, questions: units.reduce((sum, unit) => sum + unit.items.length, 0) },
        interactionCounts: countsFor(units.flatMap((unit) => unit.items)),
        mentalUnits: units.sort((left, right) => compare(left.mentalUnitId, right.mentalUnitId)),
      })),
    });
  }
  const observed = { tracks: tracks.length, nodes: nodeCount, mentalUnits: mentalUnitCount, questions: questionCount };
  const differences = [
    ...Object.keys(BASELINE).filter((key) => observed[key] !== BASELINE[key]).map((key) => ({ key, expected: BASELINE[key], observed: observed[key] })),
    ...bankDifferences,
  ];
  const inventory = {
    schemaVersion: "patternly-model-evaluation-inventory-v2",
    status: "structurally_valid",
    repository: repositoryProvenance(rootDirectory),
    sourceManifest: before,
    structuralValidation: { status: "PASS", validator: "scripts/build.mjs:validateTrack", duplicateQuestions: 0, unassignedQuestions: 0, multiplyAssignedQuestions: 0 },
    baselineComparison: {
      status: differences.length ? "differences" : "matches",
      boundary: "Immutable historical migration baseline; differences are not structural validation errors or release gates.",
      explanations: bankDifferences.map((difference) => ({ ...difference, delta: difference.observed - difference.expected,
        context: difference.trackId === "aws-certified-solutions-architect-associate"
          ? "Historical AWS ODK-096 additions and repartitioning introduced +11 units/+36 questions; the current measured delta is reported separately."
          : difference.trackId === "claude-certified-architect-professional-certification"
            ? `Current Claude QLE bank has ${tracks.find(({ trackId }) => trackId === difference.trackId).observed.mentalUnits} units/${tracks.find(({ trackId }) => trackId === difference.trackId).observed.questions} questions; its historical bank had 38 units/300 questions.`
            : "Current canonical source differs from the historical bank; no source is rewritten to restore historical counts.",
        reference: "vault:patternly-content/docs/planning/EPIC-09-MODEL-BASED-EVALUATION-DRAFT.md#Historyczny baseline migracji",
      })),
    },
    baseline: BASELINE,
    observed,
    differences,
    interactionCounts,
    tracks,
    claims: { semanticAssessment: "NOT_PERFORMED", contentApproval: "NOT_GRANTED", publication: "NOT_PERFORMED", modelCalls: 0 },
  };
  if (auditStatePath) await attachCurrentAudit(inventory, rootDirectory, auditStatePath);
  const after = await inputManifest(rootDirectory);
  if (!same(before, after)) fail("Canonical inputs changed during inventory");
  return inventory;
}

export function inventoryBytes(inventory) { return `${canonicalJson(inventory)}\n`; }

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) throw new Error("Usage: node scripts/model-evaluation/inventory.mjs");
  const output = path.join(ROOT, INVENTORY_REPORT_PATH);
  const inventory = await createInventory({ auditStatePath: CURRENT_AUDIT_STATE_PATH });
  const bytes = inventoryBytes(inventory);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, bytes);
  process.stdout.write(`${inventory.status} ${JSON.stringify(inventory.observed)} sha256=${sha256(bytes)}\n`);
}
