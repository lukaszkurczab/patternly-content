import test from "node:test";
import assert from "node:assert/strict";
import { main } from "../scripts/frontend/validate-candidate-bank.mjs";
import { scoreFrontendInteraction } from "../scripts/frontend/frontend-interactions.mjs";
import { readFile } from "node:fs/promises";

const BANK_ROOT = new URL("../manual/source/frontend-system-design-interview/candidate-bank/", import.meta.url);
async function readNode(nodeId) { return JSON.parse(await readFile(new URL(`${nodeId}.content.json`, BANK_ROOT), "utf8")); }

test("Frontend System Design candidate bank satisfies the workbook contract", async () => {
  const result = await main();
  assert.equal(result.nodes.length, 10);
  assert.ok(result.nodes.every((node) => node.exceedsFloor));
  assert.equal(result.mentalUnits, 88);
  assert.equal(result.competencies, 40);
  assert.equal(result.questions, 1766);
  assert.equal(result.richInteractionItems, 1165);
  assert.equal(result.choiceProxyItems, 0);
  assert.equal(result.semanticDuplicates, 0);
  assert.equal(result.fillerQuestions, 0);
  assert.equal(result.structuralValidation, "PASS");
  assert.equal(result.coverageGapAudit, "PASS");
  assert.equal(result.saturationAudit, "PASS");
});

test("Frontend rich interactions have executable ordering and decision-matrix scoring", async () => {
  const [browser, cache] = await Promise.all([
    readNode("browser_runtime_rendering_pipeline_and_execution_models"),
    readNode("api_integration_data_fetching_client_caching_and_consistency")
  ]);
  const ordering = browser.items.find((item) => item.interaction.type === "ordering");
  const matrix = cache.items.find((item) => item.interaction.type === "decision_matrix");
  assert.ok(ordering);
  assert.ok(matrix);
  const orderingScore = scoreFrontendInteraction(ordering, { kind: "ordering", orderedElementIds: ordering.interaction.canonicalOrder });
  assert.deepEqual(orderingScore, { status: "correct", earnedPoints: orderingScore.maxPoints, maxPoints: orderingScore.maxPoints, brokenRelations: [] });
  const matrixResponse = Object.fromEntries(matrix.interaction.dimensions.map((dimension) => [dimension.dimensionId, dimension.acceptedValueIds[0]]));
  const matrixScore = scoreFrontendInteraction(matrix, { kind: "decision_matrix", selectedValueIdsByDimension: matrixResponse });
  assert.deepEqual(matrixScore, { status: "correct", earnedPoints: matrixScore.maxPoints, maxPoints: matrixScore.maxPoints, incorrectDimensions: [] });
});
