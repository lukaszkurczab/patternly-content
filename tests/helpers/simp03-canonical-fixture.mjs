import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, realpath, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { canonicalJson, sha256 } from "../../scripts/build.mjs";
import {
  ACCEPTED_TRACK_IDS,
  validateCatalog,
  validateQuestion
} from "../../scripts/content/question-contract.mjs";
import {
  EXPECTED_GLOBAL_COUNTS,
  EXPECTED_GLOBAL_INTERACTIONS,
  SIMP03_EVIDENCE_SCHEMA_VERSION
} from "../../scripts/content/verify-migration.mjs";

export { ACCEPTED_TRACK_IDS };

export const TRACK_COUNTS = Object.freeze({
  "aws-certified-solutions-architect-associate": Object.freeze({ nodes: 21, mentalUnits: 134, questions: 2568 }),
  "backend-system-design-interview": Object.freeze({ nodes: 10, mentalUnits: 89, questions: 1569 }),
  "claude-certified-architect-professional-certification": Object.freeze({ nodes: 7, mentalUnits: 38, questions: 300 }),
  "coding-interview-dsa-problem-solving": Object.freeze({ nodes: 26, mentalUnits: 213, questions: 3404 }),
  "frontend-system-design-interview": Object.freeze({ nodes: 10, mentalUnits: 88, questions: 1766 }),
  "google-cloud-associate-cloud-engineer": Object.freeze({ nodes: 20, mentalUnits: 152, questions: 2981 }),
  "microsoft-azure-administrator-associate-az-104": Object.freeze({ nodes: 9, mentalUnits: 75, questions: 1288 }),
  "microsoft-azure-ai-fundamentals-ai-901": Object.freeze({ nodes: 5, mentalUnits: 64, questions: 752 }),
  "object-oriented-design-interview": Object.freeze({ nodes: 9, mentalUnits: 79, questions: 1413 })
});

export const TRACK_INTERACTIONS = Object.freeze({
  "aws-certified-solutions-architect-associate": Object.freeze({ choice_multiple: 0, choice_single: 2568, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "backend-system-design-interview": Object.freeze({ choice_multiple: 0, choice_single: 1569, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "claude-certified-architect-professional-certification": Object.freeze({ choice_multiple: 63, choice_single: 237, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "coding-interview-dsa-problem-solving": Object.freeze({ choice_multiple: 377, choice_single: 2450, complexity: 279, decision_matrix: 0, ordering: 298 }),
  "frontend-system-design-interview": Object.freeze({ choice_multiple: 0, choice_single: 601, complexity: 0, decision_matrix: 147, ordering: 1018 }),
  "google-cloud-associate-cloud-engineer": Object.freeze({ choice_multiple: 0, choice_single: 2981, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "microsoft-azure-administrator-associate-az-104": Object.freeze({ choice_multiple: 0, choice_single: 1288, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "microsoft-azure-ai-fundamentals-ai-901": Object.freeze({ choice_multiple: 0, choice_single: 752, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "object-oriented-design-interview": Object.freeze({ choice_multiple: 0, choice_single: 1413, complexity: 0, decision_matrix: 0, ordering: 0 })
});

export const ENVELOPE_COUNTS = Object.freeze({
  "backend-system-design-interview-candidate-source-v1": 89,
  "certification-manual-source-v2": 402,
  "certification-node-manual-source-v1": 5,
  "coding-interview-manual-source-v2": 213,
  "frontend-system-design-interview-candidate-source-v1": 88,
  "object-oriented-design-interview-candidate-source-v1": 79
});

const INTERACTION_TYPES = Object.freeze(Object.keys(EXPECTED_GLOBAL_INTERACTIONS));
const AGGREGATE_KEYS = Object.freeze([
  "canonicalQuestionSha256",
  "projectionSha256",
  "sourceFileSha256",
  "sourceItemSha256"
]);

function padded(value, width) {
  return String(value).padStart(width, "0");
}

function distribute(total, buckets) {
  const base = Math.floor(total / buckets);
  const remainder = total % buckets;
  return Array.from({ length: buckets }, (_, index) => base + (index < remainder ? 1 : 0));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, canonicalJson(value), "utf8");
}

function makeQuestion({ trackId, nodeId, mentalUnitId, questionId, type }) {
  const question = {
    questionId,
    trackId,
    nodeId,
    mentalUnitId,
    prompt: `Select the canonical answer for ${questionId}.`,
    interaction: undefined,
    answer: undefined,
    feedback: {
      type,
      reason: `The accepted ${type} answer is encoded in the canonical contract.`,
      details: { note: `Deterministic verifier fixture for ${questionId}.` }
    },
    difficulty: null
  };

  if (type === "choice_single" || type === "choice_multiple") {
    const optionIds = type === "choice_single" ? ["option-a", "option-b"] : ["option-a", "option-b", "option-c"];
    question.interaction = {
      type,
      scoringMethod: "exact_selected_set",
      options: optionIds.map((optionId) => ({ optionId, text: `Option ${optionId}.` }))
    };
    question.answer = type === "choice_single"
      ? { type, optionId: optionIds[0] }
      : { type, optionIds: optionIds.slice(0, 2) };
    return question;
  }

  if (type === "ordering") {
    const elementIds = ["element-a", "element-b", "element-c"];
    question.interaction = {
      type,
      scoringMethod: "adjacent_relations",
      elements: elementIds.map((elementId) => ({ elementId, text: `Element ${elementId}.` }))
    };
    question.answer = { type, orderedElementIds: elementIds };
    return question;
  }

  const dimensions = type === "complexity"
    ? [
      {
        dimensionId: "time",
        label: "Time complexity",
        values: [
          { valueId: "linear", text: "Linear." },
          { valueId: "quadratic", text: "Quadratic." }
        ],
        acceptedValueIds: ["linear"]
      },
      {
        dimensionId: "space",
        label: "Space complexity",
        values: [
          { valueId: "constant", text: "Constant." },
          { valueId: "linear", text: "Linear." }
        ],
        acceptedValueIds: ["constant"]
      }
    ]
    : [
      {
        dimensionId: "authority",
        label: "Authority boundary",
        values: [
          { valueId: "client", text: "Client." },
          { valueId: "service", text: "Service." }
        ],
        acceptedValueIds: ["service"]
      },
      {
        dimensionId: "failure",
        label: "Failure handling",
        values: [
          { valueId: "retry", text: "Retry." },
          { valueId: "deny", text: "Deny." }
        ],
        acceptedValueIds: ["retry"]
      }
    ];
  question.interaction = { type, scoringMethod: "dimension_exact", dimensions };
  question.answer = {
    type,
    selectedValueIdsByDimension: Object.fromEntries(dimensions.map((dimension) => [dimension.dimensionId, dimension.acceptedValueIds]))
  };
  return question;
}

function projectionOf(question) {
  return {
    prompt: question.prompt,
    ...(Object.hasOwn(question, "constraints") ? { constraints: question.constraints } : {}),
    interaction: question.interaction,
    answer: question.answer,
    feedback: question.feedback,
    difficulty: question.difficulty,
    ...(Object.hasOwn(question, "sourceRefs") ? { sourceRefs: question.sourceRefs } : {})
  };
}

function evidenceRow(question, sourcePath) {
  return {
    trackId: question.trackId,
    nodeId: question.nodeId,
    mentalUnitId: question.mentalUnitId,
    questionId: question.questionId,
    sourcePath,
    sourceFileSha256: sha256({ sourcePath }),
    sourceItemSha256: sha256({ questionId: question.questionId }),
    canonicalQuestionSha256: sha256(question),
    projectionSha256: sha256(projectionOf(question))
  };
}

function aggregate(rows, key) {
  return sha256(
    [...rows]
      .sort((left, right) => left.questionId.localeCompare(right.questionId))
      .map((row) => ({ questionId: row.questionId, [key]: row[key] }))
  );
}

export async function buildCanonicalFixture(root) {
  await mkdir(root, { recursive: true });
  const catalog = {
    schemaVersion: "patternly-content-catalog-v1",
    tracks: ACCEPTED_TRACK_IDS.map((trackId, index) => ({
      trackId,
      contentVersion: `test-content-v${padded(index + 1, 2)}`
    }))
  };
  const catalogResult = validateCatalog(catalog);
  assertValid(catalogResult.valid, catalogResult.errors);
  await writeJson(path.join(root, "catalog.json"), catalog);

  const manifestTracks = [];
  for (const [trackIndex, trackId] of ACCEPTED_TRACK_IDS.entries()) {
    const expectedCounts = TRACK_COUNTS[trackId];
    const expectedInteractions = TRACK_INTERACTIONS[trackId];
    const nodeIds = Array.from({ length: expectedCounts.nodes }, (_, index) => `node-${padded(index + 1, 3)}`);
    const mentalUnitCounts = distribute(expectedCounts.mentalUnits, expectedCounts.nodes);
    const mentalUnits = [];
    nodeIds.forEach((nodeId, nodeIndex) => {
      for (let mentalUnitIndex = 0; mentalUnitIndex < mentalUnitCounts[nodeIndex]; mentalUnitIndex += 1) {
        mentalUnits.push({
          nodeId,
          mentalUnitId: `mu-${padded(mentalUnitIndex + 1, 3)}`
        });
      }
    });
    const questionTypes = INTERACTION_TYPES.flatMap((type) => Array.from({ length: expectedInteractions[type] }, () => type));
    assert.equal(questionTypes.length, expectedCounts.questions);
    const questionCounts = distribute(expectedCounts.questions, mentalUnits.length);
    const rows = [];
    let questionNumber = 0;
    for (const [unitIndex, mentalUnit] of mentalUnits.entries()) {
      const fileQuestions = [];
      for (let unitQuestionIndex = 0; unitQuestionIndex < questionCounts[unitIndex]; unitQuestionIndex += 1) {
        questionNumber += 1;
        const questionId = `${trackId}-q-${padded(questionNumber, 5)}`;
        const question = makeQuestion({
          trackId,
          nodeId: mentalUnit.nodeId,
          mentalUnitId: mentalUnit.mentalUnitId,
          questionId,
          type: questionTypes[questionNumber - 1]
        });
        const validation = validateQuestion(question, { catalogTrackIds: ACCEPTED_TRACK_IDS });
        assertValid(validation.valid, validation.errors);
        fileQuestions.push(question);
        rows.push(evidenceRow(question, `manual/source/${trackId}/${mentalUnit.nodeId}/${mentalUnit.mentalUnitId}.json`));
      }
      await writeJson(path.join(root, trackId, mentalUnit.nodeId, `${mentalUnit.mentalUnitId}.json`), fileQuestions);
      mentalUnits[unitIndex] = { ...mentalUnit, questionCount: fileQuestions.length };
    }

    const counts = {
      nodes: nodeIds.length,
      mentalUnits: mentalUnits.length,
      questions: rows.length
    };
    const interactions = Object.fromEntries(INTERACTION_TYPES.map((type) => [
      type,
      rows.filter((row, index) => questionTypes[index] === type).length
    ]));
    const aggregates = Object.fromEntries(AGGREGATE_KEYS.map((key) => [key, aggregate(rows, key)]));
    const catalogTrack = catalog.tracks[trackIndex];
    manifestTracks.push({
      trackId,
      counts,
      nodes: nodeIds,
      mentalUnits,
      interactions,
      aggregates,
      source: {
        artifact: {
          trackId,
          contentVersion: catalogTrack.contentVersion,
          releaseId: "test-release",
          releasePath: `artifacts/releases/test-release-${padded(trackIndex + 1, 2)}.json`,
          taxonomyVersion: "test-taxonomy-v1",
          checksumSha256: sha256({ trackId, kind: "artifact" }),
          sourceRepositoryCommit: "2".repeat(40)
        },
        canonicalItemCount: expectedCounts.questions,
        itemManifestSha256: sha256({ trackId, kind: "items" }),
        sourceCommit: "1".repeat(40),
        sourceFileCount: mentalUnits.length,
        sourceManifestSha256: sha256({ trackId, kind: "manifest" }),
        sourceRoot: `manual/source/${trackId}`
      }
    });
    await writeJson(path.join(root, "migration-evidence", "items", `${trackId}.json`), rows);
  }

  await writeJson(path.join(root, "migration-evidence", "manifest.json"), {
    schemaVersion: SIMP03_EVIDENCE_SCHEMA_VERSION,
    candidateId: sha256("test-candidate"),
    candidateManifestPath: "evidence/content-acceptance/candidate-manifest-v1.json",
    baseline: {
      path: "evidence/content-acceptance/acc-01-baseline-v1.json",
      sha256: sha256("test-baseline")
    },
    envelopeCounts: ENVELOPE_COUNTS,
    global: {
      counts: EXPECTED_GLOBAL_COUNTS,
      interactions: EXPECTED_GLOBAL_INTERACTIONS
    },
    tracks: manifestTracks
  });
}

export async function createCanonicalFixture(prefix = "simp03-canonical-fixture-") {
  const parent = await realpath(await mkdtemp(path.join(os.tmpdir(), prefix)));
  const root = path.join(parent, "content");
  await buildCanonicalFixture(root);
  return { parent, root };
}

export async function copyCanonicalFixture(templateRoot, destinationRoot) {
  await cp(templateRoot, destinationRoot, { recursive: true });
}

function assertValid(valid, errors = []) {
  if (!valid) throw new Error(errors.join("\n"));
}
