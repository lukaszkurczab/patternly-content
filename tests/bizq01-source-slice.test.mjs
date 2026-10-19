import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { createContentReviewConsole } from "../scripts/review/content-review-console.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const trackId = "backend-system-design-interview";
const { byId, artifact } = await loadCurrentQuestionBank(trackId);
// Independent current regression identities, answers and source references; no historical question copies.
const expected = [
  {
    "questionId": "besd-n02-b01-i018",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i018_asset_resource_read",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://spec.openapis.org/oas/v3.1.1.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i001"
  },
  {
    "questionId": "besd-n02-b01-i019",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i019_shipment_event_identity_revision",
    "sourceRefs": [
      "https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md"
    ],
    "beforeQuestionId": "besd-n02-b01-i003"
  },
  {
    "questionId": "besd-n02-b01-i020",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i020_conditional_document_update",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://spec.openapis.org/oas/v3.1.1.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i004"
  },
  {
    "questionId": "besd-n02-b01-i021",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i021_atomic_stock_reservation",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9110.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i005"
  },
  {
    "questionId": "besd-n02-b01-i022",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i022_completion_state_resource",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://spec.openapis.org/oas/v3.1.1.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i006"
  },
  {
    "questionId": "besd-n02-b01-i023",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i023_quote_pinned_price_revision",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://spec.openapis.org/oas/v3.1.1.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i007"
  },
  {
    "questionId": "besd-n02-b01-i024",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i024_revocation_epoch_contract",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://spec.openapis.org/oas/v3.1.1.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i008"
  },
  {
    "questionId": "besd-n02-b01-i025",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i025_propagated_route_deadline",
    "sourceRefs": [
      "https://grpc.io/docs/guides/deadlines/"
    ],
    "beforeQuestionId": "besd-n02-b01-i009"
  },
  {
    "questionId": "besd-n02-b01-i026",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i026_server_evaluated_feature_decision",
    "sourceRefs": [
      "https://spec.openapis.org/oas/v3.1.1.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i010"
  },
  {
    "questionId": "besd-n02-b01-i027",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i027_half_open_offset_interval",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://www.rfc-editor.org/rfc/rfc3339.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i011"
  },
  {
    "questionId": "besd-n02-b01-i028",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i028_snapshot_bound_search_cursor",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9110.html",
      "https://spec.openapis.org/oas/v3.1.1.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i012"
  },
  {
    "questionId": "besd-n02-b01-i029",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i029_bounded_tenant_admission",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc6585.html#section-4",
      "https://www.rfc-editor.org/rfc/rfc9457.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i013"
  },
  {
    "questionId": "besd-n02-b01-i030",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i030_typed_payment_problem",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9457.html",
      "https://www.rfc-editor.org/rfc/rfc9110.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i014"
  },
  {
    "questionId": "besd-n02-b01-i031",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i031_additive_case_schema",
    "sourceRefs": [
      "https://spec.openapis.org/oas/v3.1.1.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i015"
  },
  {
    "questionId": "besd-n02-b01-i032",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "besd-n02-b01-i032_pinned_payroll_export_snapshot",
    "sourceRefs": [
      "https://spec.openapis.org/oas/v3.1.1.html"
    ],
    "beforeQuestionId": "besd-n02-b01-i016"
  },
  {
    "questionId": "besd-n04-b01-i020",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i020_private_client_preference_cache",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i001"
  },
  {
    "questionId": "besd-n04-b01-i021",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i021_revision_fence",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i003"
  },
  {
    "questionId": "besd-n04-b01-i022",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i022_content_version_tenant_cache",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i004"
  },
  {
    "questionId": "besd-n04-b01-i023",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i023_versioned_layout_live_availability",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i005"
  },
  {
    "questionId": "besd-n04-b01-i024",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i024_candidate_cache_reauthorize_content",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i006"
  },
  {
    "questionId": "besd-n04-b01-i025",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i025_short_cache_validator_recheck",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i007"
  },
  {
    "questionId": "besd-n04-b01-i026",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i026_firmware_manifest_shared_cache",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i008"
  },
  {
    "questionId": "besd-n04-b01-i027",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i027_local_draft_with_base_revision",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html",
      "https://www.rfc-editor.org/rfc/rfc9110.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i009"
  },
  {
    "questionId": "besd-n04-b01-i028",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i028_versioned_graph_separate_closures",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i010"
  },
  {
    "questionId": "besd-n04-b01-i029",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i029_scoped_versioned_forecast_cache",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i011"
  },
  {
    "questionId": "besd-n04-b01-i030",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i030_versioned_catalog_private_progress",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i012"
  },
  {
    "questionId": "besd-n04-b01-i031",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i031_edge_price_revision_checkout_revalidate",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i013"
  },
  {
    "questionId": "besd-n04-b01-i032",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i032_bounded_fail_closed_auth_cache",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i014"
  },
  {
    "questionId": "besd-n04-b01-i033",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i033_content_addressed_transcode_cache",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i015"
  },
  {
    "questionId": "besd-n04-b01-i034",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i034_bounded_edge_config_ttl",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i016"
  },
  {
    "questionId": "besd-n04-b01-i035",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i035_provider_window_availability_cache",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i017"
  },
  {
    "questionId": "besd-n04-b01-i036",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "besd-n04-b01-i036_per_key_refresh_coalescing",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ],
    "beforeQuestionId": "besd-n04-b01-i018"
  }
];
const preserved = [
  {
    "questionId": "besd-n02-b01-i017",
    "mentalUnitId": "BESD-N02-B01",
    "acceptedOptionId": "command_status_completion",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.1",
      "https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2",
      "https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply",
      "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/"
    ],
    "beforeQuestionId": "besd-n02-b01-i002"
  },
  {
    "questionId": "besd-n04-b01-i019",
    "mentalUnitId": "BESD-N04-B01",
    "acceptedOptionId": "service_scoped_derived_cache",
    "sourceRefs": [
      "https://www.rfc-editor.org/rfc/rfc9111.html#section-4",
      "https://www.rfc-editor.org/rfc/rfc9111.html#section-4.2",
      "https://www.rfc-editor.org/rfc/rfc9111.html#section-3.5"
    ],
    "beforeQuestionId": "besd-n04-b01-i002"
  }
];

function assertCase(entry, { constraints = false } = {}) {
  const question = byId.get(entry.questionId);
  assert.ok(question, entry.questionId);
  assert.equal(byId.has(entry.beforeQuestionId), false, `${entry.questionId}: removed identity is not an alias`);
  const validation = validateQuestion(question);
  assert.equal(validation.valid, true, validation.errors.join("\n"));
  assert.equal(question.mentalUnitId, entry.mentalUnitId);
  assert.equal(question.answer.optionId, entry.acceptedOptionId);
  assert.deepEqual(question.sourceRefs, entry.sourceRefs);
  assert.deepEqual(artifact.questions.find(item => item.questionId === entry.questionId), question);
  const wrongIds = question.interaction.options.filter(option => option.optionId !== entry.acceptedOptionId).map(option => option.optionId);
  assert.deepEqual(question.feedback.messages.map(message => message.targetId).sort(), wrongIds.toSorted());
  if (constraints) {
    assert.ok(question.constraints.every(constraint => !/^\s*the\s+primary\s+decision\s+is\b/i.test(constraint)));
    const answerText = question.interaction.options.find(option => option.optionId === entry.acceptedOptionId).text;
    assert.ok(question.constraints.every(constraint => !constraint.includes(answerText)));
    assert.equal(new Set(question.feedback.messages.map(message => message.text)).size, wrongIds.length);
    assert.equal(typeof question.feedback.details, "string");
    assert.ok(question.feedback.details.includes("\n\n"), "Details explain mechanism and boundary");
  }
  for (const options of [question.interaction.options, [...question.interaction.options].reverse()]) {
    const candidate = { ...question, interaction: { ...question.interaction, options } };
    for (const option of options) {
      const result = scoreQuestion(candidate, { type: "choice_single", optionId: option.optionId });
      assert.equal(result.status, option.optionId === entry.acceptedOptionId ? "correct" : "incorrect");
      assert.equal(result.earnedPoints, option.optionId === entry.acceptedOptionId ? 1 : 0);
    }
  }
}

test("two current source cases retain independently expected answers, sources and built behavior", () => {
  assert.equal(preserved.length, 2);
  for (const entry of preserved) assertCase(entry);
});

test("32 current cases retain constraints, diagnostic feedback, meaningful Details and option-stable scoring", () => {
  assert.equal(expected.length, 32);
  for (const entry of expected) assertCase(entry, { constraints: true });
});

test("review console exposes current cases without inventing approvals or hiding remaining warnings", async t => {
  const directory = await mkdtemp(join(tmpdir(), "patternly-bizq01-current-review-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const service = await createContentReviewConsole({ reviewPath: join(directory, "outcomes.json") });
  for (const entry of [...preserved, ...expected]) {
    const item = service.getItem(trackId, entry.questionId);
    assert.ok(item);
    assert.equal(item.review.status, "unreviewed");
    assert.ok(!item.riskFlags.includes("author_instruction_in_constraints"));
  }
  const visible = service.listItems({ trackId });
  const flagged = service.listItems({ trackId, riskOnly: true });
  assert.deepEqual(flagged.map(item => item.questionId).sort(), visible.filter(item => item.riskFlags.length > 0).map(item => item.questionId).sort());
});
