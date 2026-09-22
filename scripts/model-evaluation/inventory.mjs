import { readFile, mkdir, writeFile } from "node:fs/promises";
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
const compare = (left, right) => left < right ? -1 : left > right ? 1 : 0;

export async function createInventory({ rootDirectory = ROOT, validate = validateTrack } = {}) {
  const tracks = [];
  const allIds = new Set();
  const bankDifferences = [];
  const interactionCounts = Object.fromEntries(QUESTION_INTERACTION_TYPES.map((type) => [type, 0]));
  let nodeCount = 0;
  let mentalUnitCount = 0;
  let questionCount = 0;

  for (const trackId of [...ACCEPTED_TRACK_IDS].sort(compare)) {
    const validated = await validate({ rootDirectory, trackId });
    const nodes = new Map();
    let bankQuestions = 0;
    for (const filePath of validated.sourceFiles) {
      const relative = path.relative(path.join(rootDirectory, "content"), filePath).split(path.sep);
      if (relative.length !== 3 || relative[0] !== trackId || !relative[2].endsWith(".json")) throw new Error(`Invalid canonical source path: ${filePath}`);
      const nodeId = relative[1];
      const mentalUnitId = relative[2].slice(0, -5);
      const sourcePath = relative.join("/");
      const sourceSha256 = sha256(await readFile(filePath));
      const questions = validated.questions.filter((question) => question.nodeId === nodeId && question.mentalUnitId === mentalUnitId);
      if (questions.length === 0) throw new Error(`Unassigned canonical source: ${sourcePath}`);
      const items = questions.map((question) => {
        if (allIds.has(question.questionId)) throw new Error(`Duplicate global questionId: ${question.questionId}`);
        allIds.add(question.questionId);
        const interactionType = question.interaction.type;
        if (!(interactionType in interactionCounts)) throw new Error(`Unknown interaction: ${question.questionId}`);
        interactionCounts[interactionType] += 1;
        questionCount += 1;
        bankQuestions += 1;
        return { questionId: question.questionId, interactionType, itemSha256: sha256(question) };
      }).sort((left, right) => compare(left.questionId, right.questionId));
      if (!nodes.has(nodeId)) nodes.set(nodeId, []);
      nodes.get(nodeId).push({ mentalUnitId, sourcePath, sourceSha256, items });
      mentalUnitCount += 1;
    }
    nodeCount += nodes.size;
    const bankObserved = { nodes: nodes.size, mentalUnits: [...nodes.values()].reduce((sum, units) => sum + units.length, 0), questions: bankQuestions };
    for (const key of Object.keys(BANK_BASELINE[trackId])) {
      if (bankObserved[key] !== BANK_BASELINE[trackId][key]) bankDifferences.push({ trackId, key, expected: BANK_BASELINE[trackId][key], observed: bankObserved[key] });
    }
    tracks.push({
      trackId,
      contentVersion: validated.track.contentVersion,
      observed: bankObserved,
      nodes: [...nodes].sort(([left], [right]) => compare(left, right)).map(([nodeId, units]) => ({
        nodeId,
        mentalUnits: units.sort((left, right) => compare(left.mentalUnitId, right.mentalUnitId)),
      })),
    });
  }
  const observed = { tracks: tracks.length, nodes: nodeCount, mentalUnits: mentalUnitCount, questions: questionCount };
  const differences = [
    ...Object.keys(BASELINE).filter((key) => observed[key] !== BASELINE[key]).map((key) => ({ key, expected: BASELINE[key], observed: observed[key] })),
    ...bankDifferences,
  ];
  return {
    schemaVersion: "patternly-model-evaluation-inventory-v1",
    status: differences.length ? "blocked_baseline" : "structurally_valid",
    baseline: BASELINE,
    observed,
    differences,
    interactionCounts,
    tracks,
  };
}

export function inventoryBytes(inventory) { return `${canonicalJson(inventory)}\n`; }

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) throw new Error("Usage: node scripts/model-evaluation/inventory.mjs");
  const output = path.join(ROOT, "reports/model-evaluation/09-a-inventory.json");
  const inventory = await createInventory();
  const bytes = inventoryBytes(inventory);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, bytes);
  process.stdout.write(`${inventory.status} ${JSON.stringify(inventory.observed)} sha256=${sha256(bytes)}\n`);
  if (inventory.status !== "structurally_valid") process.exitCode = 2;
}
