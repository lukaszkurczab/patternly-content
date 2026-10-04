import {
  lstat,
  readFile,
  readdir,
  realpath
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { canonicalJson, sha256 } from "../build.mjs";
import {
  ACCEPTED_TRACK_IDS,
  validateCatalog,
  validateQuestion
} from "./question-contract.mjs";

export const SIMP03_EVIDENCE_SCHEMA_VERSION = "patternly-simp03-migration-evidence-v1";

export const EXPECTED_GLOBAL_COUNTS = Object.freeze({
  tracks: 9,
  nodes: 117,
  mentalUnits: 932,
  questions: 16041
});

export const EXPECTED_GLOBAL_INTERACTIONS = Object.freeze({
  choice_multiple: 440,
  choice_single: 13859,
  complexity: 279,
  decision_matrix: 147,
  ordering: 1316
});

const EXPECTED_TRACK_COUNTS = Object.freeze({
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

const EXPECTED_TRACK_INTERACTIONS = Object.freeze({
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

const EXPECTED_ENVELOPE_COUNTS = Object.freeze({
  "backend-system-design-interview-candidate-source-v1": 89,
  "certification-manual-source-v2": 402,
  "certification-node-manual-source-v1": 5,
  "coding-interview-manual-source-v2": 213,
  "frontend-system-design-interview-candidate-source-v1": 88,
  "object-oriented-design-interview-candidate-source-v1": 79
});

const INTERACTION_TYPES = Object.freeze(Object.keys(EXPECTED_GLOBAL_INTERACTIONS));
const HASH256 = /^[a-f0-9]{64}$/u;
const HASH160 = /^[a-f0-9]{40}$/u;
const UNSAFE_PATH_SEGMENT = /(?:[\\/]|\.\.|\||\u0000)/u;
const EVIDENCE_ROOT_KEYS = ["baseline", "candidateId", "candidateManifestPath", "envelopeCounts", "global", "schemaVersion", "tracks"];
const EVIDENCE_ROW_KEYS = ["canonicalQuestionSha256", "mentalUnitId", "nodeId", "projectionSha256", "questionId", "sourceFileSha256", "sourceItemSha256", "sourcePath", "trackId"];
const TRACK_EVIDENCE_KEYS = ["aggregates", "counts", "interactions", "mentalUnits", "nodes", "source", "trackId"];
const AGGREGATE_KEYS = ["canonicalQuestionSha256", "projectionSha256", "sourceFileSha256", "sourceItemSha256"];
const COUNT_KEYS = ["mentalUnits", "nodes", "questions"];
const SOURCE_KEYS = ["artifact", "canonicalItemCount", "itemManifestSha256", "sourceCommit", "sourceFileCount", "sourceManifestSha256", "sourceRoot"];
const ARTIFACT_KEYS = ["checksumSha256", "contentVersion", "releaseId", "releasePath", "sourceRepositoryCommit", "taxonomyVersion", "trackId"];
const BASELINE_KEYS = ["path", "sha256"];
const BIZQ01_PROOF = Object.freeze({
  path: "evidence/business-quality/bizq-01-besd-slice-01.json",
  schemaVersion: "patternly-bizq-source-batch-v1",
  trackId: "backend-system-design-interview",
  beforeProducerCommit: "78ba999098ea12704b74fe9de2eecdf89578e885",
  beforeContentVersion: "backend-system-design-interview-candidate-v2026.08.15",
  contentVersion: "backend-system-design-interview-authoring-v2026.10.02-bizq01-01",
  questionSetSha256: "e4bdc6e7d213d03ad079d8c21b552fe89946e15a2ee99560512067c2c60c5d41",
  replacements: Object.freeze([
    Object.freeze({
      beforeQuestionId: "besd-n02-b01-i002",
      questionId: "besd-n02-b01-i017",
      mentalUnitId: "BESD-N02-B01",
      sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json",
      beforeSourceSha256: "690a75db38ddc7c80166a29a6c7122e80598c7c283e78d392812bc80940972dd",
      sourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d"
    }),
    Object.freeze({
      beforeQuestionId: "besd-n04-b01-i002",
      questionId: "besd-n04-b01-i019",
      mentalUnitId: "BESD-N04-B01",
      sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json",
      beforeSourceSha256: "58ebf8c3db902f382ec42a419b966fe1ab96cb13a2b8a9b64b0ebfb1aeb1d888",
      sourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15"
    })
  ])
});
const BIZQ01_BESD_COHORT14_PROOF = Object.freeze({
  path: "evidence/business-quality/bizq-01-besd-seed-cohort-14.json",
  schemaVersion: "patternly-bizq-semantic-replacement-v1",
  scope: "BIZQ-01 BESD source14, fixed two-unit cohort of 32 semantic replacements; not full-unit or full-bank acceptance",
  trackId: "backend-system-design-interview",
  beforeProducerCommit: "c272a4bfdcd419d5185e5b00e1fd3022772f073c",
  beforeContentVersion: "backend-system-design-interview-authoring-v2026.10.02-bizq01-01",
  contentVersion: "backend-system-design-interview-authoring-v2026.10.03-bizq01-14",
  questionSetSha256: "1d19b932b4552fa65e37640bba63f0e0c8f52ba42f10259edca808cb265ef7ef",
  identityAction: "replace_question_with_new_id",
  identityReason: "The replacement changes the item’s primary learning objective and the meanings of its answer choices; the historical question and its options remain only in immutable migration evidence.",
  confirmedDefects: Object.freeze(["The source01 preflight identified a learner-visible primary-decision instruction in the original constraints.","The original option and feedback template did not test the replacement’s distinct declared learning objective."]),
  sources: Object.freeze([
    Object.freeze({ sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", preservedQuestionId: "besd-n02-b01-i017" }),
    Object.freeze({ sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", preservedQuestionId: "besd-n04-b01-i019" })
  ]),
  replacements: Object.freeze([
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i001", questionId: "besd-n02-b01-i018", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Choose a resource representation that exposes bounded freshness and distinguishes an absent asset from a temporarily unavailable metadata read.", acceptedOptionId: "besd-n02-b01-i018_asset_resource_read", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9110.html","https://spec.openapis.org/oas/v3.1.1.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i003", questionId: "besd-n02-b01-i019", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Define an event identity and application ordering field so receivers can suppress redelivery and reject older shipment state without treating delivery order as guaranteed.", acceptedOptionId: "besd-n02-b01-i019_shipment_event_identity_revision", sourceRefs: Object.freeze(["https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i004", questionId: "besd-n02-b01-i020", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Use a representation version as a write precondition so concurrent document edits produce a visible conflict rather than silent last-write-wins.", acceptedOptionId: "besd-n02-b01-i020_conditional_document_update", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9110.html","https://spec.openapis.org/oas/v3.1.1.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i005", questionId: "besd-n02-b01-i021", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Place the stock invariant in one atomic reserve command at the inventory authority, not in a preceding availability query.", acceptedOptionId: "besd-n02-b01-i021_atomic_stock_reservation", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9110.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i006", questionId: "besd-n02-b01-i022", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Model one-time module completion as an idempotent desired-state resource rather than an incrementing submission counter.", acceptedOptionId: "besd-n02-b01-i022_completion_state_resource", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9110.html","https://spec.openapis.org/oas/v3.1.1.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i007", questionId: "besd-n02-b01-i023", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Pin each checkout quote to an immutable price revision so a retry cannot silently substitute a newer price.", acceptedOptionId: "besd-n02-b01-i023_quote_pinned_price_revision", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9110.html","https://spec.openapis.org/oas/v3.1.1.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i008", questionId: "besd-n02-b01-i024", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Define when a credential revocation response is success, given that copied credentials may still be presented to the service.", acceptedOptionId: "besd-n02-b01-i024_revocation_epoch_contract", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9110.html","https://spec.openapis.org/oas/v3.1.1.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i009", questionId: "besd-n02-b01-i025", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Propagate a caller deadline through synchronous route computation and stop work when the caller no longer needs the result.", acceptedOptionId: "besd-n02-b01-i025_propagated_route_deadline", sourceRefs: Object.freeze(["https://grpc.io/docs/guides/deadlines/"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i010", questionId: "besd-n02-b01-i026", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Return a rollout decision without requiring each mobile client to implement the changing cohort rule.", acceptedOptionId: "besd-n02-b01-i026_server_evaluated_feature_decision", sourceRefs: Object.freeze(["https://spec.openapis.org/oas/v3.1.1.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i011", questionId: "besd-n02-b01-i027", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Specify time-window boundaries and timezone offsets in the appointment search contract so adjacent slots are not duplicated or skipped.", acceptedOptionId: "besd-n02-b01-i027_half_open_offset_interval", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9110.html","https://www.rfc-editor.org/rfc/rfc3339.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i012", questionId: "besd-n02-b01-i028", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Bind search pagination to one query snapshot so records changing between page requests do not create duplicates or gaps.", acceptedOptionId: "besd-n02-b01-i028_snapshot_bound_search_cursor", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9110.html","https://spec.openapis.org/oas/v3.1.1.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i013", questionId: "besd-n02-b01-i029", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Apply per-tenant concurrency admission to expensive route solves and return a retryable capacity outcome instead of silently queueing unbounded work.", acceptedOptionId: "besd-n02-b01-i029_bounded_tenant_admission", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc6585.html#section-4","https://www.rfc-editor.org/rfc/rfc9457.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i014", questionId: "besd-n02-b01-i030", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Define machine-readable problem types for invalid payment input, a definitive issuer decline, and temporary capacity rejection without making clients parse human text.", acceptedOptionId: "besd-n02-b01-i030_typed_payment_problem", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9457.html","https://www.rfc-editor.org/rfc/rfc9110.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i015", questionId: "besd-n02-b01-i031", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Evolve the fraud-case response additively while old and new workers coexist, preserving existing enum meanings and required fields.", acceptedOptionId: "besd-n02-b01-i031_additive_case_schema", sourceRefs: Object.freeze(["https://spec.openapis.org/oas/v3.1.1.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n02-b01-i016", questionId: "besd-n02-b01-i032", sourceFile: "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json", beforeSourceSha256: "164b3221fe641c16353339c0ef99772793f8866e195ea3cff976a633344e7e6d", sourceSha256: "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89", nodeId: "api_contracts_service_boundaries_and_request_flows", mentalUnitId: "BESD-N02-B01", learningObjective: "Address an export by an immutable snapshot that pins the payroll period, source watermark, and rules revision used to produce it.", acceptedOptionId: "besd-n02-b01-i032_pinned_payroll_export_snapshot", sourceRefs: Object.freeze(["https://spec.openapis.org/oas/v3.1.1.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i001", questionId: "besd-n04-b01-i020", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Keep a short-lived copy of low-sensitivity notification preferences in the signed-in client because local reuse is sufficient and cross-device sharing is not required.", acceptedOptionId: "besd-n04-b01-i020_private_client_preference_cache", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i003", questionId: "besd-n04-b01-i021", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Prevent a pre-update cache fill from restoring stale parcel state after an acknowledged update.", acceptedOptionId: "besd-n04-b01-i021_revision_fence", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i004", questionId: "besd-n04-b01-i022", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Reuse immutable extraction output by a key that includes the input digest and extractor version, while keeping tenant-private documents isolated.", acceptedOptionId: "besd-n04-b01-i022_content_version_tenant_cache", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i005", questionId: "besd-n04-b01-i023", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Cache immutable venue layout separately from exact seat availability so static traffic does not freeze a changing inventory fact.", acceptedOptionId: "besd-n04-b01-i023_versioned_layout_live_availability", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i006", questionId: "besd-n04-b01-i024", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Cache only tenant-scoped candidate case IDs and recheck each case’s current per-agent authorization before returning case content.", acceptedOptionId: "besd-n04-b01-i024_candidate_cache_reauthorize_content", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i007", questionId: "besd-n04-b01-i025", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Use conditional revalidation for frequently updated public metadata so edge copies can be reused briefly without presenting a representation beyond its freshness bound.", acceptedOptionId: "besd-n04-b01-i025_short_cache_validator_recheck", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i008", questionId: "besd-n04-b01-i026", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Cache immutable device capability manifests by model and firmware build, while fetching each device’s current operational state from its owning service.", acceptedOptionId: "besd-n04-b01-i026_firmware_manifest_shared_cache", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i009", questionId: "besd-n04-b01-i027", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Keep unsent document edits in a client-local draft cache, but identify the server revision they were based on before attempting to publish them.", acceptedOptionId: "besd-n04-b01-i027_local_draft_with_base_revision", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html","https://www.rfc-editor.org/rfc/rfc9110.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i010", questionId: "besd-n04-b01-i028", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Keep immutable topology and changing restrictions separately identified, with response provenance that lets a route reviewer verify both inputs.", acceptedOptionId: "besd-n04-b01-i028_versioned_graph_separate_closures", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i011", questionId: "besd-n04-b01-i029", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Meet the planner response bound by reusing a forecast keyed to its dimensions and rules revision, while exposing its source watermark.", acceptedOptionId: "besd-n04-b01-i029_scoped_versioned_forecast_cache", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i012", questionId: "besd-n04-b01-i030", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Cache a course outline under its immutable release identity, while resolving the current course alias and reading learner progress separately.", acceptedOptionId: "besd-n04-b01-i030_versioned_catalog_private_progress", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i013", questionId: "besd-n04-b01-i031", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Publish public prices under immutable revision URLs and keep checkout on the authoritative current-price path for final acceptance.", acceptedOptionId: "besd-n04-b01-i031_edge_price_revision_checkout_revalidate", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i014", questionId: "besd-n04-b01-i032", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Bound any authorization cache from a non-lagging identity source by the five-second revocation objective, and fail closed when current state cannot be established.", acceptedOptionId: "besd-n04-b01-i032_bounded_fail_closed_auth_cache", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i015", questionId: "besd-n04-b01-i033", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Cache transcoded artifacts by immutable input digest and complete encoding recipe so a changed source or codec setting cannot reuse the wrong output.", acceptedOptionId: "besd-n04-b01-i033_content_addressed_transcode_cache", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i016", questionId: "besd-n04-b01-i034", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Use a bounded edge cache for rollout configuration and make the emergency disable path meet the same 15-second staleness limit under failed invalidation.", acceptedOptionId: "besd-n04-b01-i034_bounded_edge_config_ttl", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i017", questionId: "besd-n04-b01-i035", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Cache read-only appointment availability by provider and time window, but invalidate on schedule changes and recheck the authoritative slot when confirming a booking.", acceptedOptionId: "besd-n04-b01-i035_provider_window_availability_cache", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) }),
    Object.freeze({ beforeQuestionId: "besd-n04-b01-i018", questionId: "besd-n04-b01-i036", sourceFile: "content/backend-system-design-interview/caching_read_scaling_search_and_content_delivery/BESD-N04-B01.json", beforeSourceSha256: "b8d9874fe7ff4dbcecf05519857aa57e9b828ec1eb4ba37a7ff8f789e2829c15", sourceSha256: "95196e344ef05a68b1b0ee2a8c27271a753edda62ec64b0b31bf9ae58a67e223", nodeId: "caching_read_scaling_search_and_content_delivery", mentalUnitId: "BESD-N04-B01", learningObjective: "Coalesce concurrent refreshes for the same expensive public query while serving a bounded stale result during one refresh.", acceptedOptionId: "besd-n04-b01-i036_per_key_refresh_coalescing", sourceRefs: Object.freeze(["https://www.rfc-editor.org/rfc/rfc9111.html"]) })
  ])
});
const BIZQ01_BESD_COHORT14_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256", "replacements"];
const BIZQ01_BESD_COHORT14_ITEM_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "confirmedDefects", "identityAction", "identityReason", "acceptedOptionId", "sourceRefs", "beforeQuestion", "currentQuestion"];

const BIZQ01_COPY_PROOF = Object.freeze({
  path: "evidence/business-quality/bizq-01-coding-source-copy-04.json",
  schemaVersion: "patternly-bizq-wording-correction-v1",
  scope: "BIZQ-01 source-copy04, not full bank acceptance",
  trackId: "coding-interview-dsa-problem-solving",
  nodeId: "contrast_binary_search_vs_linear_scan",
  mentalUnitId: "correctness_before_asymptotic_speed",
  questionId: "alg-contrast-binary-scan-correctness-006",
  sourceFile: "content/coding-interview-dsa-problem-solving/contrast_binary_search_vs_linear_scan/correctness_before_asymptotic_speed.json",
  beforeProducerCommit: "ddd45c83f47a77d425dd016f949f58e9dad0d3a9",
  beforeContentVersion: "coding-interview-dsa-problem-solving-0004",
  contentVersion: "coding-interview-dsa-problem-solving-authoring-v2026.10.02-bizq01-04",
  questionSetSha256: "cf941d1ea96f24110ea67dc7a112b2a1093848086ef5f14840ef0bf5da50d9ab",
  beforeSourceSha256: "55f0d7cb8974bdf9a30389646b9af8c90184c91d2fe6f31376a7295686ec8d52",
  sourceSha256: "192843ea43e1a2ed6a1b2963f9521c505c7614ddc73ed896a20ce13624a28e64"
});
const BIZQ01_COPY_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256", "sourceFile", "sourceSha256", "beforeSourceSha256", "questionId", "mentalUnitId", "beforeQuestion", "wording", "sources"];
const BIZQ01_OOD_PROOF = Object.freeze({
  path: "evidence/business-quality/bizq-01-ood-source-11.json",
  schemaVersion: "patternly-bizq-semantic-replacement-v1",
  scope: "BIZQ-01 OOD source11, single semantic replacement; not full-unit acceptance",
  trackId: "object-oriented-design-interview",
  beforeProducerCommit: "570eb490eaf194fa61ad380155cfd16c0377aaf2",
  beforeContentVersion: "object-oriented-design-interview-candidate-v2026.08.15",
  contentVersion: "object-oriented-design-interview-authoring-v2026.10.03-bizq01-11",
  questionSetSha256: "b63ff169d69d5271f9f32f0155cbd0a6401c6b4443d4d4f3132c31273d3dd5a3",
  replacement: Object.freeze({
    beforeQuestionId: "ood-n01-b01-i001",
    questionId: "ood-n01-b01-i018",
    nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries",
    mentalUnitId: "OOD-N01-B01",
    sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B01.json",
    beforeSourceSha256: "402e3bf668d0dbcfee94a65e09be8772d3c4e101e6af9d01827f1c8c15e13fce",
    sourceSha256: "276dd399625cf56c95bbd6c595cd08f21d387742ff44650bc1c35de70e11d6ad",
    learningObjective: "Given an explicit system scope, identify the primary external business actor, its observable goal and system subject, and distinguish internal collaborators or passive domain assets from external actors relative to that subject.",
    confirmedDefects: Object.freeze([
      "The former answer combines actor-goal classification with invariant ownership rather than asking the stated actor/goal/subject decision.",
      "The former prompt and feedback include an editorial constraint and expose a malformed coordinator-option explanation.",
      "The former generic distractors do not distinguish the primary actor, observable goal and subject boundary."
    ]),
    identityAction: "replace_question_with_new_id",
    identityReason: "The accepted primary decision changes to explicit external actor, observable goal and system-subject classification; all five option meanings also change.",
    acceptedOptionId: "operator_requests_reservation",
    sourceRefs: Object.freeze([
      "https://www.omg.org/spec/UML/2.5.1/PDF",
      "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
    ])
  })
});
const BIZQ01_OOD_SUCCESSOR_PROOF = Object.freeze({
  path: "evidence/business-quality/bizq-01-ood-source-12.json",
  schemaVersion: "patternly-bizq-semantic-replacement-v1",
  scope: "BIZQ-01 OOD source12, single semantic successor; not full-unit acceptance",
  trackId: "object-oriented-design-interview",
  beforeProducerCommit: "237c14349d8bbe26aaed6d83ce58103b20761dd0",
  beforeContentVersion: "object-oriented-design-interview-authoring-v2026.10.03-bizq01-11",
  contentVersion: "object-oriented-design-interview-authoring-v2026.10.03-bizq01-12",
  questionSetSha256: "9731d76b930d3882958d89ea188cad9bcbc4eb3c51284b39765b38b0a788399f",
  replacement: Object.freeze({
    beforeQuestionId: "ood-n01-b01-i002",
    questionId: "ood-n01-b01-i019",
    nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries",
    mentalUnitId: "OOD-N01-B01",
    sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B01.json",
    beforeSourceSha256: "276dd399625cf56c95bbd6c595cd08f21d387742ff44650bc1c35de70e11d6ad",
    sourceSha256: "46e72823ccc000657a4070193c4ef0bf7604f6508d9432208237471395657379",
    learningObjective: "Identify an actor-facing use case’s completed success and explicit retryable failure, distinguishing them from request acceptance, provider readiness, and an exposed internal protocol.",
    confirmedDefects: Object.freeze([
      "The accepted answer combines actor-goal/system-boundary classification with invariant ownership rather than defining the completed actor-facing use-case outcome.",
      "The caption-provider switch scenario omits a clear distinction between request acceptance, provider readiness, and completed activation.",
      "The coordinator distractor feedback is malformed, and the constraints contain a duplicated article.",
      "The generic coordinator, inheritance, representation-leak, and speculative-indirection distractors do not diagnose the decision about completed success and retryable failure."
    ]),
    identityAction: "replace_question_with_new_id",
    identityReason: "The primary decision changes to defining the use case’s observable completed success and retryable failure rather than the former mixed owner-preserves-contract decision; all four option meanings change.",
    acceptedOptionId: "completed_switch_outcomes",
    sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"])
  })
});
const BIZQ01_OOD_COHORT13_PROOF = Object.freeze({
  path: "evidence/business-quality/bizq-01-ood-unit-cohort-13.json",
  schemaVersion: "patternly-bizq-semantic-replacement-v1",
  scope: "BIZQ-01 OOD source13, fixed fifteen-question unit cohort; not full-unit or full-bank acceptance",
  trackId: "object-oriented-design-interview",
  beforeProducerCommit: "cc47728b33d8c4c531cd130ca5dba29887fb26bd",
  beforeContentVersion: "object-oriented-design-interview-authoring-v2026.10.03-bizq01-12",
  contentVersion: "object-oriented-design-interview-authoring-v2026.10.03-bizq01-13",
  questionSetSha256: "d2d7c6fa93658a8f38d18bb3fd65c0ca192dc04ded9a8f19aeda25f9cf576edc",
  sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B01.json",
  beforeSourceSha256: "46e72823ccc000657a4070193c4ef0bf7604f6508d9432208237471395657379",
  sourceSha256: "224c0d2d9fd5c367a0c8a7a8c0e139ca827d308d7d60fdce7d18c627ba1dbfa0",
  nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries",
  mentalUnitId: "OOD-N01-B01",
  confirmedDefects: Object.freeze([
    "The current item repeats the unit-wide owner/invariant answer instead of testing a distinct actor, goal, use-case, or subject-boundary decision.",
    "Its distractors and feedback do not diagnose credible alternative models for the scenario."
  ]),
  identityAction: "replace_question_with_new_id",
  identityReason: "The primary instructional decision and answer meanings change; the replacement uses a new question identity and new option identities.",
  replacements: Object.freeze([
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i003", questionId: "ood-n01-b01-i020", learningObjective: "Distinguish the initiating business role from the individual person/account that happens to occupy that role.", acceptedOptionId: "coordinator_exchange_subject" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i004", questionId: "ood-n01-b01-i021", learningObjective: "Model one person acting in two distinct external roles with separate goals as two actor-goal/use-case mappings, rather than treating one account as one actor goal.", acceptedOptionId: "sam_two_roles_two_goals" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i005", questionId: "ood-n01-b01-i022", learningObjective: "Separate the actor whose goal defines a clerk-facing request from its beneficiary and a responding external participant.", acceptedOptionId: "clerk_requests_interlibrary" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i006", questionId: "ood-n01-b01-i023", learningObjective: "Express a use case as the actor’s meaningful outcome rather than a sequence of interface operations.", acceptedOptionId: "end_subscription_at_boundary" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i007", questionId: "ood-n01-b01-i024", learningObjective: "Classify an external scheduler as an actor when it sends a signal across the stated subject boundary.", acceptedOptionId: "calendar_service_actor" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i008", questionId: "ood-n01-b01-i025", learningObjective: "Choose the actor by the external role interacting with a system, not by the human operator behind an external organization.", acceptedOptionId: "gateway_reconcile_actor" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i009", questionId: "ood-n01-b01-i026", learningObjective: "Keep an external payment provider outside the booking subject when modeling a customer-facing booking outcome.", acceptedOptionId: "traveler_book_staybook" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i010", questionId: "ood-n01-b01-i027", learningObjective: "Select the use-case goal that expresses a user-visible domain result rather than a hidden implementation action.", acceptedOptionId: "issue_certified_copy" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i011", questionId: "ood-n01-b01-i028", learningObjective: "Recognize when different external actor roles share one use-case goal and contract, rather than splitting the use case by person or channel.", acceptedOptionId: "shared_fault_report_roles" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i012", questionId: "ood-n01-b01-i029", learningObjective: "Distinguish a stakeholder who sets a requirement from an actor who actually interacts with the subject.", acceptedOptionId: "supervisor_readiness_stakeholder" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i013", questionId: "ood-n01-b01-i030", learningObjective: "Identify the primary actor from the role whose goal the use case is scoped to, while recognizing a supporting external participant.", acceptedOptionId: "dispatcher_publish_plan" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i014", questionId: "ood-n01-b01-i031", learningObjective: "Re-evaluate actor status when the modeled subject boundary changes, even if the external service name stays the same.", acceptedOptionId: "boundary_relative_roles" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i015", questionId: "ood-n01-b01-i032", learningObjective: "Model a policy-dependent request around the actor’s goal and stated decision outcome, not around an internal authorization mechanism.", acceptedOptionId: "registrar_request_access" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i016", questionId: "ood-n01-b01-i033", learningObjective: "Recognize an external actor that only receives a one-way notification from the subject, even though it sends no command.", acceptedOptionId: "dispatch_receives_warning" }),
    Object.freeze({ beforeQuestionId: "ood-n01-b01-i017", questionId: "ood-n01-b01-i034", learningObjective: "Scope a use case to one coherent actor goal instead of bundling adjacent administrative capabilities into a feature list.", acceptedOptionId: "reschedule_appointment" })
  ])
});
const BIZQ01_OOD_COHORT16_PROOF = Object.freeze({
  path: "evidence/business-quality/bizq-01-ood-node-closure-16.json",
  schemaVersion: "patternly-bizq-semantic-replacement-v1",
  scope: "BIZQ-01 OOD source16, fixed seven-unit cohort of 119 semantic replacements; not full-bank acceptance",
  trackId: "object-oriented-design-interview",
  beforeProducerCommit: "fada384746dfdfeb3f3153e1ebdeddc9fea0a672",
  beforeContentVersion: "object-oriented-design-interview-authoring-v2026.10.03-bizq01-13",
  contentVersion: "object-oriented-design-interview-authoring-v2026.10.03-bizq01-16",
  beforeQuestionSetSha256: "d2d7c6fa93658a8f38d18bb3fd65c0ca192dc04ded9a8f19aeda25f9cf576edc",
  questionSetSha256: "533d11db8cbbe0a314359eb08c38b78193415da51d7594486f8082fcd485ecfe",
  sourceFiles: Object.freeze([
    Object.freeze({"sourceFile":"content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json","beforeSourceSha256":"bc53d9c2d7fc8b2e0a9274631a361388d0d7ab6760bda056313b6dc52fedccf2","sourceSha256":"215397c1609b3f058dee249c6ef54c43a4a0696e9aa94c80c673a046b6b8b5a9","nodeId":"requirements_use_cases_domain_vocabulary_and_model_boundaries","mentalUnitId":"OOD-N01-B02"}),
    Object.freeze({"sourceFile":"content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json","beforeSourceSha256":"efa44667c786f80bfebd3917587926195f2acae6d441617b5d299801f7559c1f","sourceSha256":"3fe8c393ee1d336cd1ea2fb39ceae7c9eb891184ab0e4dc26b07285a26b70575","nodeId":"requirements_use_cases_domain_vocabulary_and_model_boundaries","mentalUnitId":"OOD-N01-B03"}),
    Object.freeze({"sourceFile":"content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json","beforeSourceSha256":"424ec18bf68b57525f7d93cdd9e16e1a644a65b5fde887d0e18a6ea35e6a598a","sourceSha256":"24ff127bcf9b1a1e9eae5e0ac51e048a590661ff16e67c3469fee78cd8e153a5","nodeId":"requirements_use_cases_domain_vocabulary_and_model_boundaries","mentalUnitId":"OOD-N01-B04"}),
    Object.freeze({"sourceFile":"content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json","beforeSourceSha256":"65172ac03dbb8031559ead806b9daa13a49954416f8f35e5a22af3750796a2bd","sourceSha256":"9a8bc00943bf65ea36223f9d5513c7cfa26df7357e77e99848faf3c88235556d","nodeId":"requirements_use_cases_domain_vocabulary_and_model_boundaries","mentalUnitId":"OOD-N01-B05"}),
    Object.freeze({"sourceFile":"content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json","beforeSourceSha256":"121a15ea3d9722f799e1b304ba6f1ddca78b81164c5dfc52f1f99ecc5e31370d","sourceSha256":"d09097dc78773ac03587b649e4d4e78f672208ef554b21eb76dfb801d7393c7b","nodeId":"requirements_use_cases_domain_vocabulary_and_model_boundaries","mentalUnitId":"OOD-N01-B06"}),
    Object.freeze({"sourceFile":"content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json","beforeSourceSha256":"9682c0899c63b266a55e9d72175c5973520b7d93177d48c5724a024990882468","sourceSha256":"a3e7964e959f710e2d2029e8b98c7f3b9135deaee7f98ada02f3862fa60a5e43","nodeId":"requirements_use_cases_domain_vocabulary_and_model_boundaries","mentalUnitId":"OOD-N01-B07"}),
    Object.freeze({"sourceFile":"content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json","beforeSourceSha256":"87ecea40979495a0144dcec6b74ba4603e4aadc86be57172cacb970ceebddaea","sourceSha256":"0c1053f6c6e722dc6954c4dc56cfbeed407d9ad9082ed3550129acb565612319","nodeId":"requirements_use_cases_domain_vocabulary_and_model_boundaries","mentalUnitId":"OOD-N01-B08"})
  ]),
  identityAction: "replace_question_with_new_id",
  identityReason: "The primary learning decision and answer meanings change; each retired item remains only in immutable migration evidence, and the authored replacement receives new question and option identities.",
  confirmedDefects: Object.freeze([
    "The former learner-facing constraints stated the primary decision directly instead of presenting it as a question to infer.",
    "The former repeated invariant-owner answer and generic coordinator feedback failed to assess the distinct declared objective of each mental unit."
  ]),
  replacements: Object.freeze([
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i001", questionId: "ood-n01-b02-i018", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i018_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i002", questionId: "ood-n01-b02-i019", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i019_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i003", questionId: "ood-n01-b02-i020", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i020_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i004", questionId: "ood-n01-b02-i021", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i021_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i005", questionId: "ood-n01-b02-i022", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i022_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i006", questionId: "ood-n01-b02-i023", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i023_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i007", questionId: "ood-n01-b02-i024", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i024_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i008", questionId: "ood-n01-b02-i025", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i025_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i009", questionId: "ood-n01-b02-i026", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i026_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i010", questionId: "ood-n01-b02-i027", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i027_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i011", questionId: "ood-n01-b02-i028", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i028_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i012", questionId: "ood-n01-b02-i029", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i029_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i013", questionId: "ood-n01-b02-i030", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i030_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i014", questionId: "ood-n01-b02-i031", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i031_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i015", questionId: "ood-n01-b02-i032", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i032_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i016", questionId: "ood-n01-b02-i033", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i033_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b02-i017", questionId: "ood-n01-b02-i034", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B02.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B02", learningObjective: "Model caller-visible results for alternate, failed, duplicate, and uncertain outcomes so callers can distinguish accepted effects, rejected commands, and recoverable work.", acceptedOptionId: "b02_i034_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i001", questionId: "ood-n01-b03-i018", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i018_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i002", questionId: "ood-n01-b03-i019", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i019_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i003", questionId: "ood-n01-b03-i020", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i020_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i004", questionId: "ood-n01-b03-i021", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i021_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i005", questionId: "ood-n01-b03-i022", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i022_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i006", questionId: "ood-n01-b03-i023", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i023_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i007", questionId: "ood-n01-b03-i024", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i024_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i008", questionId: "ood-n01-b03-i025", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i025_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i009", questionId: "ood-n01-b03-i026", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i026_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i010", questionId: "ood-n01-b03-i027", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i027_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i011", questionId: "ood-n01-b03-i028", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i028_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i012", questionId: "ood-n01-b03-i029", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i029_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i013", questionId: "ood-n01-b03-i030", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i030_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i014", questionId: "ood-n01-b03-i031", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i031_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i015", questionId: "ood-n01-b03-i032", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i032_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i016", questionId: "ood-n01-b03-i033", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i033_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b03-i017", questionId: "ood-n01-b03-i034", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B03.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B03", learningObjective: "Classify domain concepts from explicit identity, continuity, equality, and lifecycle facts, and place a domain operation where the required decision spans concepts.", acceptedOptionId: "b03_i034_a", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i001", questionId: "ood-n01-b04-i018", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i018_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i002", questionId: "ood-n01-b04-i019", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i019_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i003", questionId: "ood-n01-b04-i020", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i020_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i004", questionId: "ood-n01-b04-i021", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i021_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i005", questionId: "ood-n01-b04-i022", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i022_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i006", questionId: "ood-n01-b04-i023", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i023_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i007", questionId: "ood-n01-b04-i024", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i024_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i008", questionId: "ood-n01-b04-i025", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i025_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i009", questionId: "ood-n01-b04-i026", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i026_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i010", questionId: "ood-n01-b04-i027", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i027_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i011", questionId: "ood-n01-b04-i028", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i028_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i012", questionId: "ood-n01-b04-i029", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i029_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i013", questionId: "ood-n01-b04-i030", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i030_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i014", questionId: "ood-n01-b04-i031", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i031_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i015", questionId: "ood-n01-b04-i032", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i032_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i016", questionId: "ood-n01-b04-i033", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i033_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b04-i017", questionId: "ood-n01-b04-i034", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B04.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B04", learningObjective: "Evaluate proposed state transitions against explicit invariants, preconditions, and permitted histories; preserve the last legal state when a transition would violate them.", acceptedOptionId: "b04_i034_a", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i001", questionId: "ood-n01-b05-i018", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "issue_account_credit", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i002", questionId: "ood-n01-b05-i019", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "conversation_escalated", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i003", questionId: "ood-n01-b05-i020", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "retire_lesson", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i004", questionId: "ood-n01-b05-i021", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "maintenance_mode", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i005", questionId: "ood-n01-b05-i022", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "close_board_session", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i006", questionId: "ood-n01-b05-i023", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "publish_listing", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i007", questionId: "ood-n01-b05-i024", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "allocate_request_lines", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i008", questionId: "ood-n01-b05-i025", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "transfer_reservation", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i009", questionId: "ood-n01-b05-i026", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "quoted_bundle_price", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i010", questionId: "ood-n01-b05-i027", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "reserved_then_occupied", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i011", questionId: "ood-n01-b05-i028", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "merge_metadata_records", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i012", questionId: "ood-n01-b05-i029", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "territory_clearance_granted", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i013", questionId: "ood-n01-b05-i030", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "dispatch_and_confirmation_distinct", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i014", questionId: "ood-n01-b05-i031", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "disclose_consented_referral", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i015", questionId: "ood-n01-b05-i032", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "attempt_and_completion_events", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i016", questionId: "ood-n01-b05-i033", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "exception_approved_order_authorized", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b05-i017", questionId: "ood-n01-b05-i034", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B05.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B05", learningObjective: "Use explicit scenario definitions to choose domain vocabulary that distinguishes business meaning, scope, and lifecycle without conflating outcomes.", acceptedOptionId: "grant_approved_temporary_role", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i001", questionId: "ood-n01-b06-i018", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "inspection_rule", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i002", questionId: "ood-n01-b06-i019", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "app_reissue", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i003", questionId: "ood-n01-b06-i020", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "door_adapter_maps", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i004", questionId: "ood-n01-b06-i021", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "carrier_adapter_maps", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i005", questionId: "ood-n01-b06-i022", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "domain_service_capacity", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i006", questionId: "ood-n01-b06-i023", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "exhibit_guard", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i007", questionId: "ood-n01-b06-i024", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "repository_maps_by_id", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i008", questionId: "ood-n01-b06-i025", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "infra_file_io", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i009", questionId: "ood-n01-b06-i026", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "app_escalation", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i010", questionId: "ood-n01-b06-i027", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "repository_translates_query", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i011", questionId: "ood-n01-b06-i028", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "allocation_service", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i012", questionId: "ood-n01-b06-i029", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "app_transfer", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i013", questionId: "ood-n01-b06-i030", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "clearance_domain_service", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i014", questionId: "ood-n01-b06-i031", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "db_unique_write", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i015", questionId: "ood-n01-b06-i032", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "app_consent_send", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i016", questionId: "ood-n01-b06-i033", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "bundle_domain_calc", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b06-i017", questionId: "ood-n01-b06-i034", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B06.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B06", learningObjective: "Assign a decision or technical responsibility to the domain object/service, application coordinator, or infrastructure boundary as justified by the scenario facts.", acceptedOptionId: "approval_adapter_maps", sourceRefs: Object.freeze(["https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i001", questionId: "ood-n01-b07-i018", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "query_seat_inventory", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i002", questionId: "ood-n01-b07-i019", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "calendar_windows", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i003", questionId: "ood-n01-b07-i020", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "check_coverage", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i004", questionId: "ood-n01-b07-i021", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "find_ready_room", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i005", questionId: "ood-n01-b07-i022", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "filtered_layout_to_renderer", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i006", questionId: "ood-n01-b07-i023", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "calculate_renewal", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i007", questionId: "ood-n01-b07-i024", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "lookup_specialist", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i008", questionId: "ood-n01-b07-i025", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "compare_records", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i009", questionId: "ood-n01-b07-i026", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "compute_fee", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i010", questionId: "ood-n01-b07-i027", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "apply_reservation_transfer", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i011", questionId: "ood-n01-b07-i028", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "score_attempt", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i012", questionId: "ood-n01-b07-i029", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "resolve_catalog_items", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i013", questionId: "ood-n01-b07-i030", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "evaluate_capacity", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i014", questionId: "ood-n01-b07-i031", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "load_session", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i015", questionId: "ood-n01-b07-i032", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "query_badges", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i016", questionId: "ood-n01-b07-i033", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "load_deployment_history", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b07-i017", questionId: "ood-n01-b07-i034", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B07.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B07", learningObjective: "Select the next collaborator message or value in an interaction trace from the current inputs, returned results, and stated participant responsibilities.", acceptedOptionId: "evaluate_refund", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i001", questionId: "ood-n01-b08-i018", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "use_case_scope", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i002", questionId: "ood-n01-b08-i019", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "sequence_checkout", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i003", questionId: "ood-n01-b08-i020", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "class_relations", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i004", questionId: "ood-n01-b08-i021", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "deployment_view", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i005", questionId: "ood-n01-b08-i022", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "component_dependencies", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i006", questionId: "ood-n01-b08-i023", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "activity_handoffs", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i007", questionId: "ood-n01-b08-i024", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "returns_context", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i008", questionId: "ood-n01-b08-i025", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "courier_contract", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i009", questionId: "ood-n01-b08-i026", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "stable_id_assumption", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i010", questionId: "ood-n01-b08-i027", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "consent_open", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i011", questionId: "ood-n01-b08-i028", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "service_split_tradeoff", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i012", questionId: "ood-n01-b08-i029", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "bounded_client_fact", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i013", questionId: "ood-n01-b08-i030", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "read_write_tradeoff", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i014", questionId: "ood-n01-b08-i031", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "diagram_not_atomic", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i015", questionId: "ood-n01-b08-i032", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "sku_cutover_scope", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i016", questionId: "ood-n01-b08-i033", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "latency_unknown", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) }),
    Object.freeze({ beforeQuestionId: "ood-n01-b08-i017", questionId: "ood-n01-b08-i034", sourceFile: "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B08.json", nodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries", mentalUnitId: "OOD-N01-B08", learningObjective: "Choose communication views and review statements appropriate to the audience, scope, assumptions, and evidence without inferring unstated runtime guarantees.", acceptedOptionId: "provider_assumption", sourceRefs: Object.freeze(["https://www.omg.org/spec/UML/2.5.1/PDF","https://www.omg.org/uml/what-is-uml.htm","https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"]) })
  ])
});
const BIZQ01_OOD_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256", "replacements"];
const BIZQ01_OOD_ITEM_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "confirmedDefects", "identityAction", "identityReason", "acceptedOptionId", "sourceRefs", "beforeQuestion", "currentQuestion"];

const BIZQ01_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "items", "questionSetSha256"];
const BIZQ01_ITEM_KEYS = ["sourceFile", "beforeQuestionId", "questionId", "mentalUnitId", "learningObjective", "confirmedDefects", "identityAction", "identityReason", "acceptedOptionId", "sourceRefs", "beforeSourceSha256", "sourceSha256", "beforeQuestion"];

export class MigrationVerificationError extends Error {
  constructor(code, message, details = []) {
    super(`${code}: ${message}`);
    this.name = "MigrationVerificationError";
    this.code = code;
    this.details = details;
  }
}

function fail(code, message, details = []) {
  throw new MigrationVerificationError(code, message, details);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function compare(left, right) {
  return left === right ? 0 : left < right ? -1 : 1;
}

function exactKeys(value, expected, label) {
  if (!isRecord(value)) fail("EVIDENCE_SHAPE", `${label} must be an object.`);
  const actual = Object.keys(value).sort(compare);
  const wanted = [...expected].sort(compare);
  if (canonicalJson(actual) !== canonicalJson(wanted)) {
    fail("EVIDENCE_SHAPE", `${label} has an unsupported key set.`, [`expected=${wanted.join(",")}`, `actual=${actual.join(",")}`]);
  }
}

function assertHash(value, label, { kind = "sha256" } = {}) {
  const pattern = kind === "sha1" ? HASH160 : HASH256;
  if (typeof value !== "string" || !pattern.test(value)) fail("MALFORMED_HASH", `${label} must be a lowercase ${kind} hash.`);
  return value;
}

function assertInteger(value, label, { min = 0 } = {}) {
  if (!Number.isInteger(value) || value < min) fail("EVIDENCE_VALUE", `${label} must be an integer >= ${min}.`);
  return value;
}

function assertText(value, label) {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim() || value.includes("\u0000")) {
    fail("EVIDENCE_VALUE", `${label} must be a non-empty trim-clean string.`);
  }
  return value;
}

function assertPathSegment(value, label) {
  assertText(value, label);
  if (value === "." || UNSAFE_PATH_SEGMENT.test(value)) fail("UNSAFE_PATH", `${label} contains an unsafe path segment.`);
  return value;
}

function assertRelativePath(value, label, { suffix } = {}) {
  assertText(value, label);
  if (path.posix.isAbsolute(value) || /^[A-Za-z]:[\\/]/u.test(value) || value.includes("\\") || value.split("/").some((segment) => segment === "" || segment === "." || segment === ".." || UNSAFE_PATH_SEGMENT.test(segment))) {
    fail("UNSAFE_PATH", `${label} must be a safe relative path.`);
  }
  if (suffix && !value.endsWith(suffix)) fail("EVIDENCE_VALUE", `${label} must end with ${suffix}.`);
  return value;
}

function assertExactObject(actual, expected, label) {
  exactKeys(actual, Object.keys(expected), label);
  for (const [key, value] of Object.entries(expected)) {
    if (actual[key] !== value) fail("EVIDENCE_VALUE", `${label}.${key} does not match the accepted baseline.`);
  }
}

function assertExactSet(actual, expected, label) {
  if (!Array.isArray(actual)) fail("EVIDENCE_SHAPE", `${label} must be an array.`);
  const actualSorted = [...actual].sort(compare);
  const expectedSorted = [...expected].sort(compare);
  if (actualSorted.length !== actual.length || new Set(actual).size !== actual.length) fail("EVIDENCE_VALUE", `${label} must contain unique values.`);
  if (canonicalJson(actualSorted) !== canonicalJson(expectedSorted)) {
    fail("EVIDENCE_MEMBERSHIP", `${label} does not match the canonical membership.`, [`expected=${expectedSorted.join(",")}`, `actual=${actualSorted.join(",")}`]);
  }
}

function assertUniqueValues(actual, label) {
  if (!Array.isArray(actual) || new Set(actual).size !== actual.length) fail("EVIDENCE_VALUE", `${label} must contain unique values.`);
}

async function regularPath(target, label, kind) {
  const info = await lstat(target).catch((error) => {
    if (error?.code === "ENOENT") fail("MISSING_PATH", `${label} is missing: ${target}`);
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (info.isSymbolicLink()) fail("SYMLINK_PATH", `Symbolic links are not allowed in ${label}: ${target}`);
  if (kind === "directory" && !info.isDirectory()) fail("UNSAFE_PATH", `${label} is not a directory: ${target}`);
  if (kind === "file" && !info.isFile()) fail("UNSAFE_PATH", `${label} is not a regular file: ${target}`);
  return info;
}

async function rejectSymlinkAncestors(target, label) {
  const resolved = path.resolve(target);
  const filesystemRoot = path.parse(resolved).root;
  const relative = path.relative(filesystemRoot, resolved);
  let current = filesystemRoot;
  const segments = relative ? relative.split(path.sep) : [];
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    const info = await lstat(current).catch((error) => fail("PATH_ERROR", `Cannot inspect ${label} ancestor ${current}: ${error.message}`));
    if (info.isSymbolicLink()) fail("SYMLINK_PATH", `${label} is reached through a symbolic-link ancestor: ${current}`);
    if (index < segments.length - 1 && !info.isDirectory()) fail("UNSAFE_PATH", `${label} has a non-directory ancestor: ${current}`);
  }
}

async function secureRoot(root) {
  const resolved = path.resolve(root);
  await regularPath(resolved, "content root", "directory");
  await rejectSymlinkAncestors(resolved, "content root");
  const canonical = await realpath(resolved).catch((error) => fail("PATH_ERROR", `Cannot resolve content root: ${error.message}`));
  if (canonical !== resolved) fail("SYMLINK_PATH", "Content root must resolve to its lexical path without ancestor aliases.");
  return resolved;
}

async function listEntries(directory, label) {
  await regularPath(directory, label, "directory");
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries.sort((left, right) => compare(left.name, right.name))) {
    assertPathSegment(entry.name, `${label} entry`);
    const entryPath = path.join(directory, entry.name);
    const info = await regularPath(entryPath, `${label} entry ${entry.name}`);
    result.push({ name: entry.name, path: entryPath, info });
  }
  return result;
}

function assertEntryNames(entries, expected, label) {
  const actual = entries.map((entry) => entry.name);
  assertExactSet(actual, expected, label);
}

async function readJson(filePath, label) {
  await regularPath(filePath, label, "file");
  let text;
  try {
    text = await readFile(filePath, "utf8");
  } catch (error) {
    fail("READ_ERROR", `Cannot read ${label}: ${error.message}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`);
  }
}

function assertCanonicalQuestion(question, label, catalogTrackIds) {
  const result = validateQuestion(question, { catalogTrackIds });
  if (!result.valid) fail("CANONICAL_INVALID", `${label} does not satisfy the canonical question contract.`, result.errors);
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

function assertCanonicalHash(row, question, label) {
  const expectedQuestionHash = sha256(question);
  const expectedProjectionHash = sha256(projectionOf(question));
  if (row.canonicalQuestionSha256 !== expectedQuestionHash) {
    fail("HASH_MISMATCH", `${label}.canonicalQuestionSha256 does not match the canonical question.`);
  }
  if (row.projectionSha256 !== expectedProjectionHash) {
    fail("HASH_MISMATCH", `${label}.projectionSha256 does not match the canonical projection.`);
  }
}

function validateSourceDescriptor(source, trackId) {
  exactKeys(source, SOURCE_KEYS, `evidence.tracks[${trackId}].source`);
  assertInteger(source.canonicalItemCount, `${trackId}.source.canonicalItemCount`, { min: 1 });
  if (source.canonicalItemCount !== EXPECTED_TRACK_COUNTS[trackId].questions) fail("EVIDENCE_VALUE", `${trackId}.source.canonicalItemCount does not match the accepted baseline.`);
  assertInteger(source.sourceFileCount, `${trackId}.source.sourceFileCount`, { min: 1 });
  assertHash(source.itemManifestSha256, `${trackId}.source.itemManifestSha256`);
  assertHash(source.sourceManifestSha256, `${trackId}.source.sourceManifestSha256`);
  assertHash(source.sourceCommit, `${trackId}.source.sourceCommit`, { kind: "sha1" });
  assertRelativePath(source.sourceRoot, `${trackId}.source.sourceRoot`);
  if (source.sourceRoot !== `manual/source/${trackId}`) fail("EVIDENCE_VALUE", `${trackId}.source.sourceRoot does not match the track.`);

  exactKeys(source.artifact, ARTIFACT_KEYS, `${trackId}.source.artifact`);
  assertHash(source.artifact.checksumSha256, `${trackId}.source.artifact.checksumSha256`);
  assertText(source.artifact.contentVersion, `${trackId}.source.artifact.contentVersion`);
  assertText(source.artifact.releaseId, `${trackId}.source.artifact.releaseId`);
  assertRelativePath(source.artifact.releasePath, `${trackId}.source.artifact.releasePath`);
  assertHash(source.artifact.sourceRepositoryCommit, `${trackId}.source.artifact.sourceRepositoryCommit`, { kind: "sha1" });
  assertText(source.artifact.taxonomyVersion, `${trackId}.source.artifact.taxonomyVersion`);
  assertText(source.artifact.trackId, `${trackId}.source.artifact.trackId`);
  if (source.artifact.trackId !== trackId) fail("EVIDENCE_VALUE", `${trackId}.source.artifact.trackId does not match the track.`);
}

function validateEvidenceManifestShape(manifest) {
  exactKeys(manifest, EVIDENCE_ROOT_KEYS, "evidence.manifest");
  if (manifest.schemaVersion !== SIMP03_EVIDENCE_SCHEMA_VERSION) fail("EVIDENCE_VALUE", "evidence.manifest.schemaVersion is unsupported.");
  assertHash(manifest.candidateId, "evidence.manifest.candidateId");
  assertRelativePath(manifest.candidateManifestPath, "evidence.manifest.candidateManifestPath");
  if (manifest.candidateManifestPath !== "evidence/content-acceptance/candidate-manifest-v1.json") fail("EVIDENCE_VALUE", "evidence.manifest.candidateManifestPath is not the accepted candidate manifest.");

  exactKeys(manifest.baseline, BASELINE_KEYS, "evidence.manifest.baseline");
  assertRelativePath(manifest.baseline.path, "evidence.manifest.baseline.path");
  assertHash(manifest.baseline.sha256, "evidence.manifest.baseline.sha256");
  if (manifest.baseline.path !== "evidence/content-acceptance/acc-01-baseline-v1.json") fail("EVIDENCE_VALUE", "evidence.manifest.baseline.path is not the accepted baseline.");

  assertExactObject(manifest.envelopeCounts, EXPECTED_ENVELOPE_COUNTS, "evidence.manifest.envelopeCounts");
  for (const [key, value] of Object.entries(manifest.envelopeCounts)) assertInteger(value, `evidence.manifest.envelopeCounts.${key}`, { min: 1 });

  exactKeys(manifest.global, ["counts", "interactions"], "evidence.manifest.global");
  assertExactObject(manifest.global.counts, EXPECTED_GLOBAL_COUNTS, "evidence.manifest.global.counts");
  for (const [key, value] of Object.entries(manifest.global.counts)) assertInteger(value, `evidence.manifest.global.counts.${key}`, { min: 0 });
  assertExactObject(manifest.global.interactions, EXPECTED_GLOBAL_INTERACTIONS, "evidence.manifest.global.interactions");
  for (const [key, value] of Object.entries(manifest.global.interactions)) assertInteger(value, `evidence.manifest.global.interactions.${key}`, { min: 0 });

  if (!Array.isArray(manifest.tracks)) fail("EVIDENCE_SHAPE", "evidence.manifest.tracks must be an array.");
  const trackIds = manifest.tracks.map((track) => track?.trackId);
  assertExactSet(trackIds, ACCEPTED_TRACK_IDS, "evidence.manifest.tracks");
  const byTrack = new Map();
  for (const track of manifest.tracks) {
    if (!isRecord(track)) fail("EVIDENCE_SHAPE", "evidence.manifest.tracks entries must be objects.");
    if (byTrack.has(track.trackId)) fail("EVIDENCE_MEMBERSHIP", `evidence.manifest.tracks contains duplicate ${track.trackId}.`);
    byTrack.set(track.trackId, track);
  }
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const track = byTrack.get(trackId);
    exactKeys(track, TRACK_EVIDENCE_KEYS, `evidence.manifest.tracks.${trackId}`);
    exactKeys(track.aggregates, AGGREGATE_KEYS, `${trackId}.aggregates`);
    for (const key of AGGREGATE_KEYS) assertHash(track.aggregates[key], `${trackId}.aggregates.${key}`);
    exactKeys(track.counts, COUNT_KEYS, `${trackId}.counts`);
    for (const key of COUNT_KEYS) assertInteger(track.counts[key], `${trackId}.counts.${key}`, { min: 1 });
    if (canonicalJson(track.counts) !== canonicalJson(EXPECTED_TRACK_COUNTS[trackId])) fail("EVIDENCE_VALUE", `${trackId}.counts do not match the accepted baseline.`);
    exactKeys(track.interactions, INTERACTION_TYPES, `${trackId}.interactions`);
    for (const key of INTERACTION_TYPES) assertInteger(track.interactions[key], `${trackId}.interactions.${key}`, { min: 0 });
    if (canonicalJson(track.interactions) !== canonicalJson(EXPECTED_TRACK_INTERACTIONS[trackId])) fail("EVIDENCE_VALUE", `${trackId}.interactions do not match the accepted baseline.`);

    if (!Array.isArray(track.nodes)) fail("EVIDENCE_SHAPE", `${trackId}.nodes must be an array.`);
    track.nodes.forEach((nodeId, index) => assertPathSegment(nodeId, `${trackId}.nodes[${index}]`));
    assertUniqueValues(track.nodes, `${trackId}.nodes`);
    if (!Array.isArray(track.mentalUnits)) fail("EVIDENCE_SHAPE", `${trackId}.mentalUnits must be an array.`);
    for (const [index, mentalUnit] of track.mentalUnits.entries()) {
      exactKeys(mentalUnit, ["mentalUnitId", "nodeId", "questionCount"], `${trackId}.mentalUnits[${index}]`);
      assertPathSegment(mentalUnit.nodeId, `${trackId}.mentalUnits[${index}].nodeId`);
      assertPathSegment(mentalUnit.mentalUnitId, `${trackId}.mentalUnits[${index}].mentalUnitId`);
      assertInteger(mentalUnit.questionCount, `${trackId}.mentalUnits[${index}].questionCount`, { min: 1 });
    }
    const mentalUnitKeys = track.mentalUnits.map((entry) => `${entry.nodeId}|${entry.mentalUnitId}`);
    if (new Set(mentalUnitKeys).size !== mentalUnitKeys.length) fail("EVIDENCE_MEMBERSHIP", `${trackId}.mentalUnits contains duplicates.`);
    validateSourceDescriptor(track.source, trackId);
  }
  return byTrack;
}

function validateEvidenceRowShape(row, trackId, index) {
  const label = `evidence.items.${trackId}[${index}]`;
  exactKeys(row, EVIDENCE_ROW_KEYS, label);
  for (const key of ["questionId", "trackId", "nodeId", "mentalUnitId"]) assertPathSegment(row[key], `${label}.${key}`);
  if (row.trackId !== trackId) fail("EVIDENCE_MEMBERSHIP", `${label}.trackId does not match its evidence file.`);
  for (const key of ["canonicalQuestionSha256", "projectionSha256", "sourceFileSha256", "sourceItemSha256"]) assertHash(row[key], `${label}.${key}`);
  assertRelativePath(row.sourcePath, `${label}.sourcePath`, { suffix: ".json" });
  if (!row.sourcePath.startsWith(`manual/source/${trackId}/`)) fail("EVIDENCE_VALUE", `${label}.sourcePath does not belong to its track.`);
  return row;
}

function computedTrackAggregate(trackId, questions, rows) {
  const sortedQuestions = [...questions].sort((left, right) => compare(left.questionId, right.questionId));
  const sortedRows = [...rows].sort((left, right) => compare(left.questionId, right.questionId));
  const nodes = [...new Set(sortedQuestions.map((question) => question.nodeId))].sort(compare);
  const mentalUnitMap = new Map();
  for (const question of sortedQuestions) {
    const key = `${question.nodeId}|${question.mentalUnitId}`;
    const existing = mentalUnitMap.get(key) ?? { nodeId: question.nodeId, mentalUnitId: question.mentalUnitId, questionCount: 0 };
    existing.questionCount += 1;
    mentalUnitMap.set(key, existing);
  }
  const mentalUnits = [...mentalUnitMap.values()].sort((left, right) => compare(`${left.nodeId}|${left.mentalUnitId}`, `${right.nodeId}|${right.mentalUnitId}`));
  const interactions = Object.fromEntries(INTERACTION_TYPES.map((type) => [type, sortedQuestions.filter((question) => question.interaction.type === type).length]));
  const aggregates = Object.fromEntries(AGGREGATE_KEYS.map((key) => [key, sha256(sortedRows.map((row) => ({ questionId: row.questionId, [key]: row[key] })))]));
  return {
    trackId,
    counts: { nodes: nodes.length, mentalUnits: mentalUnits.length, questions: sortedQuestions.length },
    nodes,
    mentalUnits,
    interactions,
    aggregates
  };
}

function compareComputedTrack(trackId, manifestTrack, computed) {
  if (canonicalJson(manifestTrack.counts) !== canonicalJson(computed.counts)) fail("AGGREGATE_MISMATCH", `${trackId}.counts does not match canonical content.`);
  if (canonicalJson(manifestTrack.interactions) !== canonicalJson(computed.interactions)) fail("AGGREGATE_MISMATCH", `${trackId}.interactions does not match canonical content.`);
  assertExactSet(manifestTrack.nodes, computed.nodes, `${trackId}.nodes`);
  const manifestMentalUnits = manifestTrack.mentalUnits.map((entry) => ({ ...entry })).sort((left, right) => compare(`${left.nodeId}|${left.mentalUnitId}`, `${right.nodeId}|${right.mentalUnitId}`));
  if (canonicalJson(manifestMentalUnits) !== canonicalJson(computed.mentalUnits)) fail("AGGREGATE_MISMATCH", `${trackId}.mentalUnits does not match canonical content.`);
  if (canonicalJson(manifestTrack.aggregates) !== canonicalJson(computed.aggregates)) fail("AGGREGATE_MISMATCH", `${trackId}.aggregates do not match canonical evidence rows.`);
}

async function loadCanonicalContent(contentRoot) {
  const rootEntries = await listEntries(contentRoot, "content root");
  assertEntryNames(rootEntries, ["catalog.json", ...ACCEPTED_TRACK_IDS, "migration-evidence"], "content root");
  const catalog = await readJson(path.join(contentRoot, "catalog.json"), "content/catalog.json");
  const catalogResult = validateCatalog(catalog);
  if (!catalogResult.valid) fail("CANONICAL_INVALID", "content/catalog.json does not satisfy the canonical catalog contract.", catalogResult.errors);
  assertExactSet(catalog.tracks.map((track) => track.trackId), ACCEPTED_TRACK_IDS, "catalog.tracks");
  const catalogByTrack = new Map(catalog.tracks.map((track) => [track.trackId, track]));
  const questionsByTrack = new Map();
  const questionLocations = new Map();
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const trackRoot = path.join(contentRoot, trackId);
    const nodeEntries = await listEntries(trackRoot, `content/${trackId}`);
    if (nodeEntries.length === 0) fail("CANONICAL_MEMBERSHIP", `${trackId} has no node directories.`);
    const questions = [];
    for (const nodeEntry of nodeEntries) {
      if (!nodeEntry.info.isDirectory()) fail("UNSAFE_PATH", `content/${trackId}/${nodeEntry.name} must be a node directory.`);
      const nodeId = nodeEntry.name;
      const mentalUnitEntries = await listEntries(nodeEntry.path, `content/${trackId}/${nodeId}`);
      if (mentalUnitEntries.length === 0) fail("CANONICAL_MEMBERSHIP", `${trackId}/${nodeId} has no mental-unit files.`);
      for (const mentalUnitEntry of mentalUnitEntries) {
        if (!mentalUnitEntry.info.isFile() || !mentalUnitEntry.name.endsWith(".json")) fail("UNSAFE_PATH", `content/${trackId}/${nodeId}/${mentalUnitEntry.name} must be a JSON file.`);
        const mentalUnitId = mentalUnitEntry.name.slice(0, -5);
        assertPathSegment(nodeId, `canonical nodeId ${nodeId}`);
        assertPathSegment(mentalUnitId, `canonical mentalUnitId ${mentalUnitId}`);
        const fileQuestions = await readJson(mentalUnitEntry.path, `content/${trackId}/${nodeId}/${mentalUnitEntry.name}`);
        if (!Array.isArray(fileQuestions) || fileQuestions.length === 0) fail("CANONICAL_MEMBERSHIP", `content/${trackId}/${nodeId}/${mentalUnitEntry.name} must contain a non-empty question array.`);
        let previousQuestionId;
        for (const [index, question] of fileQuestions.entries()) {
          const label = `content/${trackId}/${nodeId}/${mentalUnitEntry.name}[${index}]`;
          assertCanonicalQuestion(question, label, ACCEPTED_TRACK_IDS);
          assertPathSegment(question.questionId, `${label}.questionId`);
          if (question.trackId !== trackId || question.nodeId !== nodeId || question.mentalUnitId !== mentalUnitId) fail("CANONICAL_MEMBERSHIP", `${label} identity does not match its path.`);
          if (previousQuestionId !== undefined && previousQuestionId >= question.questionId) fail("CANONICAL_ORDER", `${label} question IDs must be sorted.`);
          previousQuestionId = question.questionId;
          if (questionLocations.has(question.questionId)) fail("CANONICAL_MEMBERSHIP", `Duplicate questionId ${question.questionId} appears in canonical content.`);
          questionLocations.set(question.questionId, { trackId, nodeId, mentalUnitId, path: mentalUnitEntry.path });
          questions.push(question);
        }
      }
    }
    questionsByTrack.set(trackId, questions);
  }
  return { catalog, catalogByTrack, questionsByTrack, questionLocations };
}

async function loadEvidence(contentRoot) {
  const evidenceRoot = path.join(contentRoot, "migration-evidence");
  const evidenceEntries = await listEntries(evidenceRoot, "content/migration-evidence");
  assertEntryNames(evidenceEntries, ["items", "manifest.json"], "content/migration-evidence");
  const manifest = await readJson(path.join(evidenceRoot, "manifest.json"), "content/migration-evidence/manifest.json");
  const manifestTracks = validateEvidenceManifestShape(manifest);
  const itemRoot = path.join(evidenceRoot, "items");
  const itemEntries = await listEntries(itemRoot, "content/migration-evidence/items");
  assertEntryNames(itemEntries, ACCEPTED_TRACK_IDS.map((trackId) => `${trackId}.json`), "content/migration-evidence/items");
  const rowsByTrack = new Map();
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const rows = await readJson(path.join(itemRoot, `${trackId}.json`), `content/migration-evidence/items/${trackId}.json`);
    if (!Array.isArray(rows)) fail("EVIDENCE_SHAPE", `content/migration-evidence/items/${trackId}.json must contain an array.`);
    if (rows.length === 0) fail("EVIDENCE_MEMBERSHIP", `${trackId} evidence must not be empty.`);
    const validatedRows = rows.map((row, index) => validateEvidenceRowShape(row, trackId, index));
    const ids = validatedRows.map((row) => row.questionId);
    if (new Set(ids).size !== ids.length) fail("EVIDENCE_MEMBERSHIP", `${trackId} evidence contains duplicate question IDs.`);
    rowsByTrack.set(trackId, validatedRows);
  }
  return { manifest, manifestTracks, rowsByTrack };
}

function compareTrackMembership(trackId, questions, rows, manifestTrack) {
  const questionById = new Map(questions.map((question) => [question.questionId, question]));
  const rowById = new Map(rows.map((row) => [row.questionId, row]));
  const historicalQuestions = rows.map((row) => questionById.get(row.questionId));
  if (historicalQuestions.some((question) => question === undefined)) fail("EVIDENCE_MEMBERSHIP", `${trackId} is missing a historical question.`);
  for (const question of historicalQuestions) {
    const row = rowById.get(question.questionId);
    const label = `evidence.items.${trackId}.${question.questionId}`;
    if (!row) fail("EVIDENCE_MEMBERSHIP", `${label} is missing.`);
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (row[key] !== question[key]) fail("EVIDENCE_MEMBERSHIP", `${label}.${key} does not match canonical identity.`);
    }
    assertCanonicalHash(row, question, label);
  }
  const computed = computedTrackAggregate(trackId, historicalQuestions, rows);
  compareComputedTrack(trackId, manifestTrack, computed);
  return computed;
}

async function validateBizq01Source01Proof(contentRoot, canonical, evidence, privateSourceBytesOverrides) {
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, BIZQ01_PROOF.path);
  const info = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect BIZQ-01 replacement proof: ${error.message}`);
  });
  if (!info) return undefined;
  await rejectSymlinkAncestors(proofPath, "BIZQ-01 replacement proof");
  const manifest = await readJson(proofPath, "BIZQ-01 replacement proof");
  exactKeys(manifest, BIZQ01_ROOT_KEYS, "BIZQ-01 replacement proof");
  if (manifest.schemaVersion !== BIZQ01_PROOF.schemaVersion ||
      manifest.scope !== "BIZQ-01 source slice 01, not full bank acceptance" ||
      manifest.trackId !== BIZQ01_PROOF.trackId ||
      manifest.beforeProducerCommit !== BIZQ01_PROOF.beforeProducerCommit ||
      manifest.beforeContentVersion !== BIZQ01_PROOF.beforeContentVersion ||
      manifest.contentVersion !== BIZQ01_PROOF.contentVersion ||
      manifest.questionSetSha256 !== BIZQ01_PROOF.questionSetSha256) {
    fail("EVIDENCE_VALUE", "BIZQ-01 replacement proof does not match the accepted bounded batch identity.");
  }
  assertHash(manifest.questionSetSha256, "BIZQ-01 replacement proof.questionSetSha256");
  if (canonical.catalogByTrack.get(BIZQ01_PROOF.trackId)?.contentVersion !== BIZQ01_PROOF.contentVersion) {
    fail("EVIDENCE_VALUE", "BIZQ-01 replacement proof contentVersion does not match the current catalog.");
  }

  if (!Array.isArray(manifest.items) || manifest.items.length !== BIZQ01_PROOF.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", "BIZQ-01 replacement proof must contain exactly the two accepted replacements.");
  }
  const trackQuestions = canonical.questionsByTrack.get(BIZQ01_PROOF.trackId);
  const actualTrackHash = sha256([...trackQuestions].sort((left, right) => compare(left.questionId, right.questionId)));
  if (actualTrackHash !== BIZQ01_PROOF.questionSetSha256) {
    fail("HASH_MISMATCH", "Current BIZQ-01 track question set differs from the accepted replacement proof.");
  }

  const rowsById = new Map(evidence.rowsByTrack.get(BIZQ01_PROOF.trackId).map((row) => [row.questionId, row]));
  const currentById = new Map(trackQuestions.map((question) => [question.questionId, question]));
  const replacements = [];
  for (const [index, accepted] of BIZQ01_PROOF.replacements.entries()) {
    const entry = manifest.items[index];
    const label = `BIZQ-01 replacement proof.items[${index}]`;
    exactKeys(entry, BIZQ01_ITEM_KEYS, label);
    for (const key of ["sourceFile", "beforeQuestionId", "questionId", "mentalUnitId", "beforeSourceSha256", "sourceSha256"]) {
      if (entry[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} does not match the accepted replacement pair.`);
    }
    assertRelativePath(entry.sourceFile, `${label}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${label}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${label}.sourceSha256`);

    const oldQuestion = entry.beforeQuestion;
    const newQuestion = currentById.get(accepted.questionId);
    if (!newQuestion || currentById.has(accepted.beforeQuestionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${label} does not identify one present replacement and one removed historical item.`);
    }
    const oldRow = rowsById.get(accepted.beforeQuestionId);
    if (!oldRow) fail("EVIDENCE_MEMBERSHIP", `${label} historical item is not present in immutable migration evidence.`);
    assertCanonicalQuestion(oldQuestion, `${label}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== accepted.beforeQuestionId || oldQuestion.trackId !== BIZQ01_PROOF.trackId ||
        oldQuestion.mentalUnitId !== accepted.mentalUnitId) {
      fail("EVIDENCE_MEMBERSHIP", `${label}.beforeQuestion identity does not match the accepted historical item.`);
    }
    if (newQuestion.trackId !== oldQuestion.trackId || newQuestion.nodeId !== oldQuestion.nodeId ||
        newQuestion.mentalUnitId !== oldQuestion.mentalUnitId || newQuestion.mentalUnitId !== accepted.mentalUnitId ||
        newQuestion.interaction.type !== oldQuestion.interaction.type) {
      fail("EVIDENCE_MEMBERSHIP", `${label} changes taxonomy or interaction identity.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${label} historical evidence ${key} differs from the old question.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${label}.beforeQuestion`);

    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${label}.sourceFile`);
    await regularPath(sourcePath, `${label}.sourceFile`, "file");
    const sourceBytes = privateSourceBytesOverrides?.get(accepted.sourceFile) ?? await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${label}.sourceFile: ${error.message}`));
    if (sha256(sourceBytes) !== accepted.sourceSha256) fail("HASH_MISMATCH", `${label}.sourceFile does not match the accepted current source hash.`);
    let sourceQuestions;
    try {
      sourceQuestions = JSON.parse(sourceBytes.toString("utf8"));
    } catch (error) {
      fail("INVALID_JSON", `${label}.sourceFile is not valid JSON: ${error.message}`);
    }
    if (!Array.isArray(sourceQuestions) || sourceQuestions.filter((question) => question?.questionId === accepted.questionId).length !== 1) {
      fail("EVIDENCE_MEMBERSHIP", `${label}.sourceFile must contain exactly one current replacement item.`);
    }
    const authoredQuestion = sourceQuestions.find((question) => question?.questionId === accepted.questionId);
    if (canonicalJson(authoredQuestion) !== canonicalJson(newQuestion)) fail("HASH_MISMATCH", `${label} current source item differs from canonical content.`);
    const canonicalLocation = canonical.questionLocations.get(accepted.questionId);
    if (!canonicalLocation || path.relative(projectRoot, canonicalLocation.path).split(path.sep).join("/") !== accepted.sourceFile) {
      fail("CANONICAL_MEMBERSHIP", `${label} current source item is not at its accepted identity location.`);
    }
    replacements.push({ oldQuestion, newQuestion, beforeQuestionId: accepted.beforeQuestionId, questionId: accepted.questionId });
  }
  return { trackId: BIZQ01_PROOF.trackId, replacements };
}

async function validateBizq01BesdCohort14Proof(contentRoot, canonical, evidence) {
  const accepted = BIZQ01_BESD_COHORT14_PROOF;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const info = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!info) fail("EVIDENCE_MEMBERSHIP", `${label} requires its fixed cohort proof.`);
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proof = await readJson(proofPath, label);
  exactKeys(proof, BIZQ01_BESD_COHORT14_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  assertHash(proof.questionSetSha256, `${label}.questionSetSha256`);
  if (canonical.catalogByTrack.get(accepted.trackId)?.contentVersion !== accepted.contentVersion) {
    fail("EVIDENCE_VALUE", `${label} contentVersion does not match the current catalog.`);
  }
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== accepted.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the fixed thirty-two replacements.`);
  }
  const trackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  const currentTrackHash = sha256([...trackQuestions].sort((left, right) => compare(left.questionId, right.questionId)));
  if (currentTrackHash !== accepted.questionSetSha256) fail("HASH_MISMATCH", `${label} current track question set differs from the fixed cohort descriptor.`);

  const sourceQuestionsByPath = new Map();
  for (const source of accepted.sources) {
    const sourcePath = path.resolve(projectRoot, ...source.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${label}.sourceFile`);
    await regularPath(sourcePath, `${label}.sourceFile`, "file");
    const bytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${label}.sourceFile: ${error.message}`));
    if (sha256(bytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${label}.sourceFile does not match its fixed current hash.`);
    let questions;
    try { questions = JSON.parse(bytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${label}.sourceFile is not valid JSON: ${error.message}`); }
    if (!Array.isArray(questions)) fail("EVIDENCE_MEMBERSHIP", `${label}.sourceFile must contain a question array.`);
    const expectedIds = accepted.replacements.filter((item) => item.sourceFile === source.sourceFile).map((item) => item.questionId).concat(source.preservedQuestionId);
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${label} source membership`);
    const location = canonical.questionLocations.get(source.preservedQuestionId);
    if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
      fail("CANONICAL_MEMBERSHIP", `${label} preserved item is not at its fixed source location.`);
    }
    for (const item of accepted.replacements.filter((replacement) => replacement.sourceFile === source.sourceFile)) {
      const currentQuestion = trackQuestions.find((question) => question.questionId === item.questionId);
      const sourceQuestion = questions.find((question) => question?.questionId === item.questionId);
      const currentLocation = canonical.questionLocations.get(item.questionId);
      if (!currentQuestion || !sourceQuestion || !currentLocation ||
          path.relative(projectRoot, currentLocation.path).split(path.sep).join("/") !== source.sourceFile ||
          canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) {
        fail("CANONICAL_MEMBERSHIP", `${label} current item ${item.questionId} differs from its fixed source location or canonical object.`);
      }
    }
    sourceQuestionsByPath.set(source.sourceFile, questions);
  }

  const currentById = new Map(trackQuestions.map((question) => [question.questionId, question]));
  const replacements = [];
  for (const [index, descriptor] of accepted.replacements.entries()) {
    const itemLabel = `${label}.replacements[${index}]`;
    const entry = proof.replacements[index];
    exactKeys(entry, BIZQ01_BESD_COHORT14_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "acceptedOptionId"]) {
      if (entry[key] !== descriptor[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed cohort mapping.`);
    }
    if (canonicalJson(entry.confirmedDefects) !== canonicalJson(accepted.confirmedDefects) ||
        entry.identityAction !== accepted.identityAction || entry.identityReason !== accepted.identityReason ||
        canonicalJson(entry.sourceRefs) !== canonicalJson(descriptor.sourceRefs)) {
      fail("EVIDENCE_VALUE", `${itemLabel} defects, identity rationale, or primary references differ from the fixed cohort review.`);
    }
    assertRelativePath(entry.sourceFile, `${itemLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${itemLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${itemLabel}.sourceSha256`);
    const oldQuestion = entry.beforeQuestion;
    const currentQuestion = currentById.get(descriptor.questionId);
    const oldRow = evidence.rowsByTrack.get(accepted.trackId).find((row) => row.questionId === descriptor.beforeQuestionId);
    if (!oldQuestion || !currentQuestion || !oldRow || currentById.has(descriptor.beforeQuestionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must bind one frozen historical object to one current replacement.`);
    }
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== descriptor.beforeQuestionId || oldQuestion.trackId !== accepted.trackId ||
        oldQuestion.nodeId !== descriptor.nodeId || oldQuestion.mentalUnitId !== descriptor.mentalUnitId ||
        currentQuestion.questionId !== descriptor.questionId || currentQuestion.trackId !== accepted.trackId ||
        currentQuestion.nodeId !== descriptor.nodeId || currentQuestion.mentalUnitId !== descriptor.mentalUnitId ||
        canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical/current object identity or taxonomy differs from the fixed cohort.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from its old question.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
        currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== descriptor.acceptedOptionId ||
        currentQuestion.interaction.options.some((option) => oldQuestion.interaction.options.some((old) => old.optionId === option.optionId)) ||
        canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(descriptor.sourceRefs)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the reviewed interaction, scoring, answer, option identity, or source references.`);
    }
    const sourceQuestion = sourceQuestionsByPath.get(descriptor.sourceFile).find((question) => question.questionId === descriptor.questionId);
    if (canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) fail("HASH_MISMATCH", `${itemLabel} source object differs from current canonical content.`);
    replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: descriptor.beforeQuestionId, questionId: descriptor.questionId });
  }

  const predecessorSourceBytes = new Map();
  for (const source of accepted.sources) {
    const cohortIds = new Set(accepted.replacements.filter((item) => item.sourceFile === source.sourceFile).map((item) => item.questionId));
    const oldQuestions = replacements.filter((item) => cohortIds.has(item.questionId)).map((item) => item.oldQuestion);
    const predecessorQuestions = sourceQuestionsByPath.get(source.sourceFile)
      .filter((question) => !cohortIds.has(question.questionId))
      .concat(oldQuestions)
      .sort((left, right) => compare(left.questionId, right.questionId));
    const bytes = Buffer.from(canonicalJson(predecessorQuestions), "utf8");
    if (sha256(bytes) !== source.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct the exact source01 predecessor bytes for ${source.sourceFile}.`);
    }
    predecessorSourceBytes.set(source.sourceFile, bytes);
  }

  const cohortIds = new Set(accepted.replacements.map((item) => item.questionId));
  const historicalTrackQuestions = trackQuestions
    .filter((question) => !cohortIds.has(question.questionId))
    .concat(replacements.map((item) => item.oldQuestion))
    .sort((left, right) => compare(left.questionId, right.questionId));
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
      ? { ...track, contentVersion: accepted.beforeContentVersion }
      : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  for (const item of accepted.replacements) {
    predecessorLocations.delete(item.questionId);
    predecessorLocations.set(item.beforeQuestionId, {
      trackId: accepted.trackId,
      nodeId: item.nodeId,
      mentalUnitId: item.mentalUnitId,
      path: path.resolve(projectRoot, ...item.sourceFile.split("/"))
    });
  }
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, historicalTrackQuestions),
    questionLocations: predecessorLocations
  };
  const source01Proof = await validateBizq01Source01Proof(contentRoot, predecessorCanonical, evidence, predecessorSourceBytes);
  if (!source01Proof || source01Proof.replacements.length !== BIZQ01_PROOF.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged source01 proof to validate against its exact reconstructed predecessor.`);
  }
  return { trackId: accepted.trackId, replacements: [...source01Proof.replacements, ...replacements] };
}

async function loadBizq01ReplacementProof(contentRoot, canonical, evidence) {
  const version = canonical.catalogByTrack.get(BIZQ01_PROOF.trackId)?.contentVersion;
  if (version === BIZQ01_BESD_COHORT14_PROOF.contentVersion) {
    return validateBizq01BesdCohort14Proof(contentRoot, canonical, evidence);
  }
  return validateBizq01Source01Proof(contentRoot, canonical, evidence);
}

async function validateBizq01OodSemanticProof(contentRoot, canonical, evidence, accepted, optionCount, sourceBytesOverride) {
  const labelPrefix = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const info = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect BIZQ-01 OOD semantic proof: ${error.message}`);
  });
  if (!info) return undefined;
  await rejectSymlinkAncestors(proofPath, labelPrefix);
  const proof = await readJson(proofPath, labelPrefix);
  exactKeys(proof, BIZQ01_OOD_ROOT_KEYS, labelPrefix);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${labelPrefix}.${key} differs from the accepted batch identity.`);
  }
  assertHash(proof.questionSetSha256, "BIZQ-01 OOD semantic proof.questionSetSha256");
  if (canonical.catalogByTrack.get(accepted.trackId)?.contentVersion !== accepted.contentVersion) {
    fail("EVIDENCE_VALUE", "BIZQ-01 OOD semantic proof contentVersion does not match the current catalog.");
  }
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== 1) {
    fail("EVIDENCE_MEMBERSHIP", "BIZQ-01 OOD semantic proof must contain exactly the accepted one-question replacement.");
  }

  const entry = proof.replacements[0];
  const label = "BIZQ-01 OOD semantic proof.replacements[0]";
  exactKeys(entry, BIZQ01_OOD_ITEM_KEYS, label);
  const replacement = accepted.replacement;
  for (const key of ["sourceFile", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "beforeSourceSha256", "sourceSha256", "learningObjective", "identityAction", "identityReason", "acceptedOptionId"]) {
    if (entry[key] !== replacement[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the accepted replacement identity.`);
  }
  if (canonicalJson(entry.confirmedDefects) !== canonicalJson(replacement.confirmedDefects) ||
      canonicalJson(entry.sourceRefs) !== canonicalJson(replacement.sourceRefs)) {
    fail("EVIDENCE_VALUE", `${label} defect or source references differ from the accepted review.`);
  }
  assertRelativePath(entry.sourceFile, `${label}.sourceFile`, { suffix: ".json" });
  assertHash(entry.beforeSourceSha256, `${label}.beforeSourceSha256`);
  assertHash(entry.sourceSha256, `${label}.sourceSha256`);

  const trackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  const currentTrackHash = sha256([...trackQuestions].sort((left, right) => compare(left.questionId, right.questionId)));
  if (currentTrackHash !== accepted.questionSetSha256) fail("HASH_MISMATCH", `${labelPrefix} current track question set differs from the accepted proof.`);
  const currentById = new Map(trackQuestions.map((question) => [question.questionId, question]));
  const currentQuestion = currentById.get(replacement.questionId);
  if (!currentQuestion || currentById.has(replacement.beforeQuestionId)) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify one current item and one removed historical item.`);
  }

  const oldRow = evidence.rowsByTrack.get(accepted.trackId).find((row) => row.questionId === replacement.beforeQuestionId);
  if (!oldRow) fail("EVIDENCE_MEMBERSHIP", `${label} old question is absent from immutable migration evidence.`);
  const oldQuestion = entry.beforeQuestion;
  assertCanonicalQuestion(oldQuestion, `${label}.beforeQuestion`, ACCEPTED_TRACK_IDS);
  if (oldQuestion.questionId !== replacement.beforeQuestionId || oldQuestion.trackId !== accepted.trackId ||
      oldQuestion.nodeId !== replacement.nodeId || oldQuestion.mentalUnitId !== replacement.mentalUnitId) {
    fail("EVIDENCE_MEMBERSHIP", `${label}.beforeQuestion does not match the frozen OOD identity.`);
  }
  for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
    if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${label} frozen evidence ${key} differs from the old question.`);
  }
  assertCanonicalHash(oldRow, oldQuestion, `${label}.beforeQuestion`);

  assertCanonicalQuestion(entry.currentQuestion, `${label}.currentQuestion`, ACCEPTED_TRACK_IDS);
  if (canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
    fail("HASH_MISMATCH", `${label}.currentQuestion does not exactly match current canonical content.`);
  }
  if (currentQuestion.questionId !== replacement.questionId || currentQuestion.trackId !== accepted.trackId ||
      currentQuestion.nodeId !== replacement.nodeId || currentQuestion.mentalUnitId !== replacement.mentalUnitId ||
      currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
      currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== replacement.acceptedOptionId) {
    fail("EVIDENCE_MEMBERSHIP", `${label} changes the reviewed OOD track, taxonomy, interaction, scoring or accepted option identity.`);
  }
  const currentOptionIds = currentQuestion.interaction.options.map((option) => option.optionId);
  const oldOptionIds = new Set(oldQuestion.interaction.options.map((option) => option.optionId));
  if (currentOptionIds.length !== optionCount || new Set(currentOptionIds).size !== optionCount ||
      currentOptionIds.some((optionId) => oldOptionIds.has(optionId))) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must use ${optionCount} unique, new option identities for the changed decision.`);
  }
  if (canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(replacement.sourceRefs)) {
    fail("EVIDENCE_VALUE", `${label} source references differ from the reviewed primary sources.`);
  }

  const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
  await rejectSymlinkAncestors(sourcePath, `${label}.sourceFile`);
  await regularPath(sourcePath, `${label}.sourceFile`, "file");
  const sourceBytes = sourceBytesOverride ?? await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${label}.sourceFile: ${error.message}`));
  if (sha256(sourceBytes) !== replacement.sourceSha256) fail("HASH_MISMATCH", `${label}.sourceFile does not match the accepted current source hash.`);
  let sourceQuestions;
  try {
    sourceQuestions = JSON.parse(sourceBytes.toString("utf8"));
  } catch (error) {
    fail("INVALID_JSON", `${label}.sourceFile is not valid JSON: ${error.message}`);
  }
  if (!Array.isArray(sourceQuestions) || sourceQuestions.filter((question) => question?.questionId === replacement.questionId).length !== 1 ||
      sourceQuestions.some((question) => question?.questionId === replacement.beforeQuestionId)) {
    fail("EVIDENCE_MEMBERSHIP", `${label}.sourceFile must contain the new item exactly once and omit its historical identity.`);
  }
  const authoredQuestion = sourceQuestions.find((question) => question?.questionId === replacement.questionId);
  if (canonicalJson(authoredQuestion) !== canonicalJson(currentQuestion)) fail("HASH_MISMATCH", `${label} source item differs from current canonical content.`);
  const location = canonical.questionLocations.get(replacement.questionId);
  if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== replacement.sourceFile) {
    fail("CANONICAL_MEMBERSHIP", `${label} current item is not at its accepted canonical source location.`);
  }
  return {
    trackId: accepted.trackId,
    replacements: [{ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: replacement.beforeQuestionId, questionId: replacement.questionId }]
  };
}

async function validateBizq01OodCohort13Proof(contentRoot, canonical, evidence) {
  const accepted = BIZQ01_OOD_COHORT13_PROOF;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  const proof = await readJson(proofPath, label);
  exactKeys(proof, BIZQ01_OOD_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the accepted batch identity.`);
  }
  if (canonical.catalogByTrack.get(accepted.trackId)?.contentVersion !== accepted.contentVersion) {
    fail("EVIDENCE_VALUE", `${label} contentVersion does not match the current catalog.`);
  }
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== accepted.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the accepted fifteen replacements.`);
  }
  const questions = canonical.questionsByTrack.get(accepted.trackId);
  if (sha256([...questions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current track question set differs from the accepted proof.`);
  }
  const currentById = new Map(questions.map((question) => [question.questionId, question]));
  const oldIds = new Set(accepted.replacements.map((item) => item.beforeQuestionId));
  const sourcePath = path.resolve(projectRoot, ...accepted.sourceFile.split("/"));
  await rejectSymlinkAncestors(sourcePath, `${label}.sourceFile`);
  await regularPath(sourcePath, `${label}.sourceFile`, "file");
  const sourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${label}.sourceFile: ${error.message}`));
  if (sha256(sourceBytes) !== accepted.sourceSha256) fail("HASH_MISMATCH", `${label}.sourceFile does not match the accepted current source hash.`);
  let sourceQuestions;
  try { sourceQuestions = JSON.parse(sourceBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label}.sourceFile is not valid JSON: ${error.message}`); }
  if (!Array.isArray(sourceQuestions) || sourceQuestions.length !== questions.filter((q) => q.mentalUnitId === accepted.mentalUnitId).length ||
      accepted.replacements.some((item) => sourceQuestions.filter((q) => q?.questionId === item.questionId).length !== 1 || sourceQuestions.some((q) => q?.questionId === item.beforeQuestionId))) {
    fail("EVIDENCE_MEMBERSHIP", `${label}.sourceFile must contain every current cohort item once and omit every historical identity.`);
  }

  const replacements = [];
  for (const [index, item] of accepted.replacements.entries()) {
    const entry = proof.replacements[index];
    const itemLabel = `${label}.replacements[${index}]`;
    exactKeys(entry, BIZQ01_OOD_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "beforeSourceSha256", "sourceSha256", "learningObjective", "identityAction", "identityReason", "acceptedOptionId"]) {
      const value = key === "sourceFile" ? accepted.sourceFile
        : key === "beforeSourceSha256" ? accepted.beforeSourceSha256
          : key === "sourceSha256" ? accepted.sourceSha256
            : key === "nodeId" ? accepted.nodeId
              : key === "mentalUnitId" ? accepted.mentalUnitId
                : key === "identityAction" ? accepted.identityAction
                  : key === "identityReason" ? accepted.identityReason
                    : item[key];
      if (entry[key] !== value) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the accepted cohort descriptor.`);
    }
    if (canonicalJson(entry.confirmedDefects) !== canonicalJson(accepted.confirmedDefects) ||
        canonicalJson(entry.sourceRefs) !== canonicalJson(["https://www.omg.org/spec/UML/2.5.1/PDF"])) {
      fail("EVIDENCE_VALUE", `${itemLabel} defects or primary references differ from the accepted cohort descriptor.`);
    }
    const oldQuestion = entry.beforeQuestion;
    const currentQuestion = currentById.get(item.questionId);
    const oldRow = evidence.rowsByTrack.get(accepted.trackId).find((row) => row.questionId === item.beforeQuestionId);
    if (!oldQuestion || !currentQuestion || !oldRow || currentById.has(item.beforeQuestionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must bind one frozen historical item to one current replacement.`);
    }
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== item.beforeQuestionId || oldQuestion.trackId !== accepted.trackId ||
        oldQuestion.nodeId !== accepted.nodeId || oldQuestion.mentalUnitId !== accepted.mentalUnitId ||
        currentQuestion.questionId !== item.questionId || currentQuestion.trackId !== accepted.trackId ||
        currentQuestion.nodeId !== accepted.nodeId || currentQuestion.mentalUnitId !== accepted.mentalUnitId ||
        canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the reviewed taxonomy or current authored object.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the old question.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
        currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId ||
        currentQuestion.interaction.options.length !== 4 || currentQuestion.interaction.options.some((option) => oldQuestion.interaction.options.some((old) => old.optionId === option.optionId)) ||
        canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(["https://www.omg.org/spec/UML/2.5.1/PDF"])) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the reviewed interaction, scoring, accepted answer, option identity, or primary reference.`);
    }
    if (canonicalJson(sourceQuestions.find((question) => question?.questionId === item.questionId)) !== canonicalJson(currentQuestion)) {
      fail("HASH_MISMATCH", `${itemLabel} source object differs from current canonical content.`);
    }
    const location = canonical.questionLocations.get(item.questionId);
    if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== accepted.sourceFile) {
      fail("CANONICAL_MEMBERSHIP", `${itemLabel} current item is not at its accepted source location.`);
    }
    replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: item.beforeQuestionId, questionId: item.questionId });
  }
  if (accepted.replacements.some((item) => !oldIds.has(item.beforeQuestionId))) fail("EVIDENCE_MEMBERSHIP", `${label} descriptor is internally inconsistent.`);
  return { trackId: accepted.trackId, replacements };
}


const BIZQ01_OOD_COHORT17_PROOF = Object.freeze({
  "schemaVersion": "patternly-bizq-semantic-replacement-v1",
  "scope": "BIZQ-01 OOD source17, fixed eight-unit cohort of 152 semantic replacements; not full-bank acceptance",
  "trackId": "object-oriented-design-interview",
  "beforeProducerCommit": "c2112775a1a9e8173202b921c027b9b43f754d74",
  "beforeContentVersion": "object-oriented-design-interview-authoring-v2026.10.03-bizq01-16",
  "contentVersion": "object-oriented-design-interview-authoring-v2026.10.04-bizq01-17",
  "beforeQuestionSetSha256": "533d11db8cbbe0a314359eb08c38b78193415da51d7594486f8082fcd485ecfe",
  "questionSetSha256": "4cf59f42c9e257118e1c2b1d4358753b67c80328f34c6c8350274baff7ffcbcc",
  "identityAction": "replace_question_with_new_id",
  "identityReason": "The primary learning decision and answer meanings change; each retired item remains only in immutable migration evidence, and the authored replacement receives new question and option identities.",
  "confirmedDefects": Object.freeze([
    "The former learner-facing constraints stated the primary decision directly instead of presenting it as a question to infer.",
    "The former repeated invariant-owner answer and generic coordinator feedback failed to assess the distinct declared objective of each mental unit."
  ]),
  "path": "evidence/business-quality/bizq-01-ood-node-closure-17.json",
  "sourceFiles": Object.freeze([
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08"
    })
  ]),
  "replacements": Object.freeze([
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i001",
      "questionId": "ood-n02-b01-i020",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose where billable-mass calculation belongs when callers must share one result derived from shipment measures and carrier class.",
      "acceptedOptionId": "b01_i020_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i002",
      "questionId": "ood-n02-b01-i021",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how the session should report remaining places when confirmation status changes.",
      "acceptedOptionId": "b01_i021_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i003",
      "questionId": "ood-n02-b01-i022",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how an issued line should calculate its amount after catalog prices change.",
      "acceptedOptionId": "b01_i022_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i004",
      "questionId": "ood-n02-b01-i023",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose where scaling belongs so one batch can change without altering the master recipe.",
      "acceptedOptionId": "b01_i023_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i005",
      "questionId": "ood-n02-b01-i024",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how the playlist should expose its total runtime when tracks are reordered or replaced.",
      "acceptedOptionId": "b01_i024_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i006",
      "questionId": "ood-n02-b01-i025",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how a historical corrected value should be obtained after the device is recalibrated.",
      "acceptedOptionId": "b01_i025_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i007",
      "questionId": "ood-n02-b01-i026",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how the allowance should expose its remaining accepted balance.",
      "acceptedOptionId": "b01_i026_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i008",
      "questionId": "ood-n02-b01-i027",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how bounds validation should stay consistent across preview and export.",
      "acceptedOptionId": "b01_i027_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i009",
      "questionId": "ood-n02-b01-i028",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how meeting duration should be calculated for attendees in different zones.",
      "acceptedOptionId": "b01_i028_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i010",
      "questionId": "ood-n02-b01-i029",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how the stay should report its number of nights.",
      "acceptedOptionId": "b01_i029_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i011",
      "questionId": "ood-n02-b01-i030",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how boundary membership should be evaluated consistently wherever bands are used.",
      "acceptedOptionId": "b01_i030_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i012",
      "questionId": "ood-n02-b01-i031",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how the board should determine the number of ready tasks after a dependency is edited.",
      "acceptedOptionId": "b01_i031_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i013",
      "questionId": "ood-n02-b01-i032",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how the risk band should stay aligned with reviewer edits to severity and likelihood.",
      "acceptedOptionId": "b01_i032_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i014",
      "questionId": "ood-n02-b01-i033",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how to keep itinerary travel time accurate when one leg is rebooked.",
      "acceptedOptionId": "b01_i033_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i015",
      "questionId": "ood-n02-b01-i034",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how the activation screen should display the deadline after a permitted edit.",
      "acceptedOptionId": "b01_i034_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i016",
      "questionId": "ood-n02-b01-i035",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how to show proposed ingredient quantities without changing stored batch state.",
      "acceptedOptionId": "b01_i035_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i017",
      "questionId": "ood-n02-b01-i036",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how an existing case should continue to report its due instant after policy changes.",
      "acceptedOptionId": "b01_i036_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i018",
      "questionId": "ood-n02-b01-i037",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how a new temperature reading should affect the zone’s heating state near the target.",
      "acceptedOptionId": "b01_i037_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B01.json",
      "beforeSourceSha256": "0fdcd70fa6df580662c77a3b163f714f54633471577130acddd0234ec1786b46",
      "sourceSha256": "8d858a2491ea8c320d687efc7d427fa469df6bc227fd238b02fc19af0f8fcddf",
      "beforeQuestionId": "ood-n02-b01-i019",
      "questionId": "ood-n02-b01-i038",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B01",
      "learningObjective": "Choose how the preview should recalculate sheets after paper or duplex settings change.",
      "acceptedOptionId": "b01_i038_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i001",
      "questionId": "ood-n02-b02-i020",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose the retirement transition that preserves the stated enrollment and progress behavior.",
      "acceptedOptionId": "b02_i020_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i002",
      "questionId": "ood-n02-b02-i021",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose how a room move should handle one accepted input and one rejected input.",
      "acceptedOptionId": "b02_i021_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i003",
      "questionId": "ood-n02-b02-i022",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose the transition after an export attempt reports a failure.",
      "acceptedOptionId": "b02_i022_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i004",
      "questionId": "ood-n02-b02-i023",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Apply an asynchronous acceptance only to the exact proposal that is still pending; preserve the active package and newer proposal after a stale response.",
      "acceptedOptionId": "b02_i023_request_correlation",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i005",
      "questionId": "ood-n02-b02-i024",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose the publish behavior when the stock count is negative.",
      "acceptedOptionId": "b02_i024_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i006",
      "questionId": "ood-n02-b02-i025",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose what approval should do when one requested quantity exceeds delivery.",
      "acceptedOptionId": "b02_i025_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i007",
      "questionId": "ood-n02-b02-i026",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose how to respond when Plot B becomes occupied before the transfer commits.",
      "acceptedOptionId": "b02_i026_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i008",
      "questionId": "ood-n02-b02-i027",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose what activation should do if the third component is no longer active.",
      "acceptedOptionId": "b02_i027_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i009",
      "questionId": "ood-n02-b02-i028",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose the state when the expiry instant passes and no vehicle connected.",
      "acceptedOptionId": "b02_i028_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i010",
      "questionId": "ood-n02-b02-i029",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose how to commit the merge without losing the source descriptions.",
      "acceptedOptionId": "b02_i029_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i011",
      "questionId": "ood-n02-b02-i030",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose how to handle a request to change the territory of an approved permit.",
      "acceptedOptionId": "b02_i030_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i012",
      "questionId": "ood-n02-b02-i031",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose the result when the proposed replacement is incompatible.",
      "acceptedOptionId": "b02_i031_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i013",
      "questionId": "ood-n02-b02-i032",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose the transition after consent has been revoked but before dispatch.",
      "acceptedOptionId": "b02_i032_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i014",
      "questionId": "ood-n02-b02-i033",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose how a late submission should be recorded.",
      "acceptedOptionId": "b02_i033_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i015",
      "questionId": "ood-n02-b02-i034",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose what a delegate’s approval action should do.",
      "acceptedOptionId": "b02_i034_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i016",
      "questionId": "ood-n02-b02-i035",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose the booking state while the refund provider is still processing.",
      "acceptedOptionId": "b02_i035_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i017",
      "questionId": "ood-n02-b02-i036",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose how denial should affect the pending grant.",
      "acceptedOptionId": "b02_i036_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i018",
      "questionId": "ood-n02-b02-i037",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose what to do when the document changes after confirmation but before sealing.",
      "acceptedOptionId": "b02_i037_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B02.json",
      "beforeSourceSha256": "1db97e9e36b24e19f53d70509de137b1f987c19a47f0cd2c9243e40a1d2f8042",
      "sourceSha256": "03fa49cfcb122f03241f16b826716c8221fd809b3ff5e21706927245208f54f3",
      "beforeQuestionId": "ood-n02-b02-i019",
      "questionId": "ood-n02-b02-i038",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B02",
      "learningObjective": "Choose how to handle a timeout when the release outcome is not yet visible to the caller.",
      "acceptedOptionId": "b02_i038_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i001",
      "questionId": "ood-n02-b03-i020",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how the caller should request the reorder.",
      "acceptedOptionId": "b03_i020_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i002",
      "questionId": "ood-n02-b03-i021",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose where the extension eligibility decision should be made.",
      "acceptedOptionId": "b03_i021_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i003",
      "questionId": "ood-n02-b03-i022",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how a work-order caller should obtain the labor plan.",
      "acceptedOptionId": "b03_i022_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i004",
      "questionId": "ood-n02-b03-i023",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose where the joint move eligibility decision belongs.",
      "acceptedOptionId": "b03_i023_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i005",
      "questionId": "ood-n02-b03-i024",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how both panels should submit commands.",
      "acceptedOptionId": "b03_i024_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i006",
      "questionId": "ood-n02-b03-i025",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how the caller should initiate retirement.",
      "acceptedOptionId": "b03_i025_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i007",
      "questionId": "ood-n02-b03-i026",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose a case operation that prevents callers from applying only part of reassignment.",
      "acceptedOptionId": "b03_i026_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i008",
      "questionId": "ood-n02-b03-i027",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how publication should be invoked so every entry point enforces the same rule.",
      "acceptedOptionId": "b03_i027_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i009",
      "questionId": "ood-n02-b03-i028",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how a caller should request readiness.",
      "acceptedOptionId": "b03_i028_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i010",
      "questionId": "ood-n02-b03-i029",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how to make the merge decision and resulting update consistent.",
      "acceptedOptionId": "b03_i029_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i011",
      "questionId": "ood-n02-b03-i030",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how a permit should answer a usage request.",
      "acceptedOptionId": "b03_i030_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i012",
      "questionId": "ood-n02-b03-i031",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Place a replacement operation with the maintenance job that owns the current aircraft assignment and has the compatibility facts needed to change it safely.",
      "acceptedOptionId": "b03_i031_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i013",
      "questionId": "ood-n02-b03-i032",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how dispatch should be expressed.",
      "acceptedOptionId": "b03_i032_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i014",
      "questionId": "ood-n02-b03-i033",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how scoring should be shared across result and export paths.",
      "acceptedOptionId": "b03_i033_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i015",
      "questionId": "ood-n02-b03-i034",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how the exception should handle an approval attempt.",
      "acceptedOptionId": "b03_i034_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i016",
      "questionId": "ood-n02-b03-i035",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how a replacement should be applied.",
      "acceptedOptionId": "b03_i035_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i017",
      "questionId": "ood-n02-b03-i036",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how permission access should be requested.",
      "acceptedOptionId": "b03_i036_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i018",
      "questionId": "ood-n02-b03-i037",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose the model operation that best expresses the seal action.",
      "acceptedOptionId": "b03_i037_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B03.json",
      "beforeSourceSha256": "57493bbfa63bf607ed2d1026f346e2e1c991fe22b46d7e557c685924c2b0e0c1",
      "sourceSha256": "6a1ce440ba1ce098ebeb4decd991d8d270dd275c0c4f51bf78403ac9d77d89b1",
      "beforeQuestionId": "ood-n02-b03-i019",
      "questionId": "ood-n02-b03-i038",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B03",
      "learningObjective": "Choose how to prevent different callers from deriving different release amounts.",
      "acceptedOptionId": "b03_i038_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i001",
      "questionId": "ood-n02-b04-i020",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Keep the reservation and capacity hold under one booking lifecycle because they change atomically under the same rule; isolate independently changing email delivery.",
      "acceptedOptionId": "b04_i020_reservation_lifecycle",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i002",
      "questionId": "ood-n02-b04-i021",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how to isolate the independent time-source change.",
      "acceptedOptionId": "b04_i021_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i003",
      "questionId": "ood-n02-b04-i022",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how to keep a camera replacement from changing return classification behavior.",
      "acceptedOptionId": "b04_i022_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i004",
      "questionId": "ood-n02-b04-i023",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose the boundary that preserves scientific meaning across a renderer update.",
      "acceptedOptionId": "b04_i023_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i005",
      "questionId": "ood-n02-b04-i024",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how to isolate the mail-provider revision.",
      "acceptedOptionId": "b04_i024_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i006",
      "questionId": "ood-n02-b04-i025",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how to limit changes caused by a new offline transport protocol.",
      "acceptedOptionId": "b04_i025_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i007",
      "questionId": "ood-n02-b04-i026",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how to handle a partner layout revision.",
      "acceptedOptionId": "b04_i026_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i008",
      "questionId": "ood-n02-b04-i027",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose a boundary for the new lock vendor integration.",
      "acceptedOptionId": "b04_i027_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i009",
      "questionId": "ood-n02-b04-i028",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose what should change when a carrier adds a required label field.",
      "acceptedOptionId": "b04_i028_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i010",
      "questionId": "ood-n02-b04-i029",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how to respond to a new localized time format.",
      "acceptedOptionId": "b04_i029_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i011",
      "questionId": "ood-n02-b04-i030",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Keep grant fields under one lifecycle responsibility when they change only through the same reviewed revision, rather than splitting by field name.",
      "acceptedOptionId": "b04_i030_grant_lifecycle",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i012",
      "questionId": "ood-n02-b04-i031",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how to accommodate a streaming vendor API change.",
      "acceptedOptionId": "b04_i031_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i013",
      "questionId": "ood-n02-b04-i032",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how to prepare for a new archive schema.",
      "acceptedOptionId": "b04_i032_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i014",
      "questionId": "ood-n02-b04-i033",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how to isolate a messaging vendor replacement.",
      "acceptedOptionId": "b04_i033_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i015",
      "questionId": "ood-n02-b04-i034",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose a design that accommodates a new thumbnail format without moving listing eligibility rules.",
      "acceptedOptionId": "b04_i034_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i016",
      "questionId": "ood-n02-b04-i035",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how a clearing-network field addition should affect repayment allocation.",
      "acceptedOptionId": "b04_i035_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i017",
      "questionId": "ood-n02-b04-i036",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how to accommodate a new map-tile provider.",
      "acceptedOptionId": "b04_i036_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i018",
      "questionId": "ood-n02-b04-i037",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose a boundary for the catalog search schema revision.",
      "acceptedOptionId": "b04_i037_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B04.json",
      "beforeSourceSha256": "8873e113b42716532352589e8bf896e4896b0580b1adc57f8c7513d48f197e9a",
      "sourceSha256": "17d4027ea20cab4946d0a10508798ed4db3f9cc264769f3bafb75bdbe44ab622",
      "beforeQuestionId": "ood-n02-b04-i019",
      "questionId": "ood-n02-b04-i038",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B04",
      "learningObjective": "Choose how to respond to a billing-provider API change.",
      "acceptedOptionId": "b04_i038_cohesion",
      "sourceRefs": Object.freeze([
        "https://docs.oracle.com/javase/tutorial/java/concepts/",
        "https://learn.microsoft.com/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i001",
      "questionId": "ood-n02-b05-i020",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Capture one coherent provider configuration per stream while later streams receive a published replacement.",
      "acceptedOptionId": "b05_i020_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i002",
      "questionId": "ood-n02-b05-i021",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Copy a mutable nested assignment graph so editing a draft cannot alter a submitted proposal.",
      "acceptedOptionId": "b05_i021_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i003",
      "questionId": "ood-n02-b05-i022",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Keep an accepted route revision as a conflict baseline while editing a separate pending value.",
      "acceptedOptionId": "b05_i022_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i004",
      "questionId": "ood-n02-b05-i023",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Capture the minimal immutable inputs for a transient calculation without turning it into permanent history.",
      "acceptedOptionId": "b05_i023_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i005",
      "questionId": "ood-n02-b05-i024",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Safely share an immutable child value while replacing the coupled plan that must be validated as a whole.",
      "acceptedOptionId": "b05_i024_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i006",
      "questionId": "ood-n02-b05-i025",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Model a composite amount as a value whose currency and minor units both determine equivalence.",
      "acceptedOptionId": "b05_i025_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i007",
      "questionId": "ood-n02-b05-i026",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Represent a correction as a new immutable record linked to the finalized result it supersedes.",
      "acceptedOptionId": "b05_i026_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i008",
      "questionId": "ood-n02-b05-i027",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Freeze submitted condition facts while keeping a later eligibility decision in its own lifecycle.",
      "acceptedOptionId": "b05_i027_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i009",
      "questionId": "ood-n02-b05-i028",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Retain exact immutable input-version references on a published computation for later audit.",
      "acceptedOptionId": "b05_i028_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i010",
      "questionId": "ood-n02-b05-i029",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Separate the immutable accepted comment from delivery state that changes during retries.",
      "acceptedOptionId": "b05_i029_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i011",
      "questionId": "ood-n02-b05-i030",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Retry the exact submitted payload rather than rebuilding it from a subsequently edited draft.",
      "acceptedOptionId": "b05_i030_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i012",
      "questionId": "ood-n02-b05-i031",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Keep each invoice issue’s timestamp and exact inputs fixed when a corrected issue is created.",
      "acceptedOptionId": "b05_i031_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i013",
      "questionId": "ood-n02-b05-i032",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Validate related command rules together and publish one immutable set only when no cross-entry conflict remains.",
      "acceptedOptionId": "b05_i032_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i014",
      "questionId": "ood-n02-b05-i033",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Apply only the service’s stated normalization rules when constructing a postal value.",
      "acceptedOptionId": "b05_i033_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i015",
      "questionId": "ood-n02-b05-i034",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Review a proposed booking against the exact room and attendee facts captured for that proposal.",
      "acceptedOptionId": "b05_i034_proposal_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i016",
      "questionId": "ood-n02-b05-i035",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Break a mutable caller alias when accepting input into a published immutable collection.",
      "acceptedOptionId": "b05_i035_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i017",
      "questionId": "ood-n02-b05-i036",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Return a new immutable progress-set value so a later completion does not mutate a snapshot already held by report readers.",
      "acceptedOptionId": "b05_i036_copy_progress",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i018",
      "questionId": "ood-n02-b05-i037",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Capture all fields needed for a coherent export from one board revision.",
      "acceptedOptionId": "b05_i037_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B05.json",
      "beforeSourceSha256": "a91532674af030117f673fd934ffbdc383569300bc790a8c6109ea2811a0c2a0",
      "sourceSha256": "17907deacb33b6f1d6dac02c33e30625feef5f13fcf2f8ab2225f5160dc48f1e",
      "beforeQuestionId": "ood-n02-b05-i019",
      "questionId": "ood-n02-b05-i038",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B05",
      "learningObjective": "Keep transfer-time owner and deadline facts fixed while the support case continues to change.",
      "acceptedOptionId": "b05_i038_snapshot",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i001",
      "questionId": "ood-n02-b06-i020",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Keep a temporary authorization record addressable while its role and expiry change.",
      "acceptedOptionId": "b06_i020_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i002",
      "questionId": "ood-n02-b06-i021",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Distinguish separate seal records even when they cover the same immutable document.",
      "acceptedOptionId": "b06_i021_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i003",
      "questionId": "ood-n02-b06-i022",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Make retries resolve to the same payout record without merging equal-valued payouts.",
      "acceptedOptionId": "b06_i022_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i004",
      "questionId": "ood-n02-b06-i023",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Preserve superseded notices as distinct audit records.",
      "acceptedOptionId": "b06_i023_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i005",
      "questionId": "ood-n02-b06-i024",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Keep a reservation addressable when its interval is corrected or it is cancelled.",
      "acceptedOptionId": "b06_i024_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i006",
      "questionId": "ood-n02-b06-i025",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Keep session identity stable across provider-configuration history.",
      "acceptedOptionId": "b06_i025_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i007",
      "questionId": "ood-n02-b06-i026",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Preserve assignment identity when volunteers are swapped between assignments.",
      "acceptedOptionId": "b06_i026_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i008",
      "questionId": "ood-n02-b06-i027",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Keep independent edit submissions reviewable even when their geometry matches.",
      "acceptedOptionId": "b06_i027_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i009",
      "questionId": "ood-n02-b06-i028",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Keep character identity stable while quest progress changes.",
      "acceptedOptionId": "b06_i028_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i010",
      "questionId": "ood-n02-b06-i029",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Keep a shipment hash key stable across carrier reassignment.",
      "acceptedOptionId": "b06_i029_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i011",
      "questionId": "ood-n02-b06-i030",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Distinguish separately reversible allocations with equal account and amount.",
      "acceptedOptionId": "b06_i030_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i012",
      "questionId": "ood-n02-b06-i031",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Keep one match addressable through status transitions while events remain separate.",
      "acceptedOptionId": "b06_i031_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i013",
      "questionId": "ood-n02-b06-i032",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Keep physical-item identity stable through inspection corrections.",
      "acceptedOptionId": "b06_i032_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i014",
      "questionId": "ood-n02-b06-i033",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Distinguish executions even when outputs are byte-identical.",
      "acceptedOptionId": "b06_i033_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i015",
      "questionId": "ood-n02-b06-i034",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Retain separate comments with same text/revision and different authors.",
      "acceptedOptionId": "b06_i034_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i016",
      "questionId": "ood-n02-b06-i035",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Resolve the same submission across sync retries and status changes.",
      "acceptedOptionId": "b06_i035_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i017",
      "questionId": "ood-n02-b06-i036",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Differentiate re-delivery retry of one invoice issue from a new corrected issue.",
      "acceptedOptionId": "b06_i036_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i018",
      "questionId": "ood-n02-b06-i037",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Keep a revoked badge record distinct from its owner and any replacement badge.",
      "acceptedOptionId": "b06_i037_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B06.json",
      "beforeSourceSha256": "aa4e039351ff6bf2d4903889e642fbba88469141542d61add8ccda69a26f5e70",
      "sourceSha256": "ed0c5d818f351713fd891c0c470927e1515f120342be2a6e1d12491cb87be638",
      "beforeQuestionId": "ood-n02-b06-i019",
      "questionId": "ood-n02-b06-i038",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B06",
      "learningObjective": "Preserve separate print records even when labels show the same address.",
      "acceptedOptionId": "b06_i038_identity",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode?view=net-10.0",
        "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/how-to-define-value-equality-for-a-type"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i001",
      "questionId": "ood-n02-b07-i020",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Validate stable request identifiers at construction, but check changing fleet exclusivity at commit.",
      "acceptedOptionId": "b07_i020_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i002",
      "questionId": "ood-n02-b07-i021",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Require complete referral facts without treating stored consent evidence as current send authorization.",
      "acceptedOptionId": "b07_i021_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i003",
      "questionId": "ood-n02-b07-i022",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Validate the completed-attempt score as an integer from zero through one hundred.",
      "acceptedOptionId": "b07_i022_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i004",
      "questionId": "ood-n02-b07-i023",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Require approval evidence and bounded scope before constructing an exception record.",
      "acceptedOptionId": "b07_i023_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i005",
      "questionId": "ood-n02-b07-i024",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Reject two annotation segments that map to the same replacement segment ID.",
      "acceptedOptionId": "b07_i024_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i006",
      "questionId": "ood-n02-b07-i025",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Enforce grant field and expiry invariants while consuming already-checked approval evidence.",
      "acceptedOptionId": "b07_i025_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i007",
      "questionId": "ood-n02-b07-i026",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Bind a seal to the exact immutable document revision supplied at creation.",
      "acceptedOptionId": "b07_i026_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i008",
      "questionId": "ood-n02-b07-i027",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Take payout amount and currency from the settled order’s final values.",
      "acceptedOptionId": "b07_i027_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i009",
      "questionId": "ood-n02-b07-i028",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Allow equal route effective times and recheck the nondecreasing predicate at acceptance.",
      "acceptedOptionId": "b07_i028_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i010",
      "questionId": "ood-n02-b07-i029",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Validate interval shape at value creation and defer changing schedule overlap to commit.",
      "acceptedOptionId": "b07_i029_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i011",
      "questionId": "ood-n02-b07-i030",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Create a provider configuration only when language and timing support the stream contract.",
      "acceptedOptionId": "b07_i030_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i012",
      "questionId": "ood-n02-b07-i031",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Reject swaps that repeat an assignment ID and recheck changing availability at execution.",
      "acceptedOptionId": "b07_i031_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i013",
      "questionId": "ood-n02-b07-i032",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Capture a route edit’s parent revision so a stale submission remains an explicit branch.",
      "acceptedOptionId": "b07_i032_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i014",
      "questionId": "ood-n02-b07-i033",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Construct a reward claim only from eligibility tied to the campaign revision used.",
      "acceptedOptionId": "b07_i033_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i015",
      "questionId": "ood-n02-b07-i034",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Require both temperature compatibility and custody acknowledgement before carrier reassignment.",
      "acceptedOptionId": "b07_i034_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i016",
      "questionId": "ood-n02-b07-i035",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Validate an allocation against its stated balance snapshot and recheck at posting.",
      "acceptedOptionId": "b07_i035_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i017",
      "questionId": "ood-n02-b07-i036",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Check timeout and active state when creating a forfeit decision, then recheck before commit.",
      "acceptedOptionId": "b07_i036_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i018",
      "questionId": "ood-n02-b07-i037",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Require an allowed condition category without putting a later refund outcome into the report.",
      "acceptedOptionId": "b07_i037_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B07.json",
      "beforeSourceSha256": "bfe5b9062b4c33f042b6c6cda31909d1780a82232ff0d5e75b3fdee56612f82e",
      "sourceSha256": "e71e17e0366922a268d536518917c9e6a8692a495b30cc88c4a9c042d0fab14f",
      "beforeQuestionId": "ood-n02-b07-i019",
      "questionId": "ood-n02-b07-i038",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B07",
      "learningObjective": "Construct a published result only from a succeeded run with terminal output.",
      "acceptedOptionId": "b07_i038_creation",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i001",
      "questionId": "ood-n02-b08-i020",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Represent a confirmed missing reservation separately from a failed lookup.",
      "acceptedOptionId": "b08_i020_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i002",
      "questionId": "ood-n02-b08-i021",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Keep a valid zero quote distinct from missing required component pricing.",
      "acceptedOptionId": "b08_i021_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i003",
      "questionId": "ood-n02-b08-i022",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Distinguish no available charger from inability to read the schedule.",
      "acceptedOptionId": "b08_i022_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i004",
      "questionId": "ood-n02-b08-i023",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Preserve the difference between absent caption metadata and intentionally blank text.",
      "acceptedOptionId": "b08_i023_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i005",
      "questionId": "ood-n02-b08-i024",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Return actionable validation errors for missing required licensing inputs.",
      "acceptedOptionId": "b08_i024_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i006",
      "questionId": "ood-n02-b08-i025",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Distinguish an unknown battery from a known battery that is already assigned.",
      "acceptedOptionId": "b08_i025_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i007",
      "questionId": "ood-n02-b08-i026",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Keep not-recorded, denied, and granted consent distinguishable; only granted permits sending.",
      "acceptedOptionId": "b08_i026_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i008",
      "questionId": "ood-n02-b08-i027",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Keep a valid zero score distinct from no score and its timeout status.",
      "acceptedOptionId": "b08_i027_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i009",
      "questionId": "ood-n02-b08-i028",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Represent approval lifecycle states, missing requests, and query failure distinctly.",
      "acceptedOptionId": "b08_i028_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i010",
      "questionId": "ood-n02-b08-i029",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Preserve omitted, explicit-null, and supplied-value intents in a partial update.",
      "acceptedOptionId": "b08_i029_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i011",
      "questionId": "ood-n02-b08-i030",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Distinguish no grant record from an existing expired grant.",
      "acceptedOptionId": "b08_i030_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i012",
      "questionId": "ood-n02-b08-i031",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Separate named verification outcomes from verifier unavailability.",
      "acceptedOptionId": "b08_i031_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i013",
      "questionId": "ood-n02-b08-i032",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Distinguish confirmed absence of a payout from unknown status during ledger failure.",
      "acceptedOptionId": "b08_i032_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i014",
      "questionId": "ood-n02-b08-i033",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Keep empty notice history separate from an unknown route and read failure.",
      "acceptedOptionId": "b08_i033_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i015",
      "questionId": "ood-n02-b08-i034",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Use the continuation marker, not the current page length, to determine whether a filtered search is complete.",
      "acceptedOptionId": "b08_i034_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i016",
      "questionId": "ood-n02-b08-i035",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Preserve the working provider on inconclusive discovery; report confirmed incompatibility separately from a registry timeout.",
      "acceptedOptionId": "b08_i035_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i017",
      "questionId": "ood-n02-b08-i036",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Return specific missing-reference and availability-conflict errors for a swap.",
      "acceptedOptionId": "b08_i036_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i018",
      "questionId": "ood-n02-b08-i037",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Separate malformed geometry from a valid stale branch that must be retained.",
      "acceptedOptionId": "b08_i037_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/objects_responsibilities_encapsulation_and_invariants/OOD-N02-B08.json",
      "beforeSourceSha256": "4021e846165b3418bdf6dcdf1ee4771a43d6ece7d845dbb37f559385a0fcaa8b",
      "sourceSha256": "a7187fd7159997b338285a732eb436cf799953d78a527ef1ce45b2612ed8e4b1",
      "beforeQuestionId": "ood-n02-b08-i019",
      "questionId": "ood-n02-b08-i038",
      "nodeId": "objects_responsibilities_encapsulation_and_invariants",
      "mentalUnitId": "OOD-N02-B08",
      "learningObjective": "Distinguish confirmed ineligibility from a missing character and failed evaluation.",
      "acceptedOptionId": "b08_i038_contract",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types",
        "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
      ])
    })
  ])
});

const BIZQ01_OOD_COHORT19_PROOF = Object.freeze({
  "schemaVersion": "patternly-bizq-semantic-replacement-v1",
  "scope": "BIZQ-01 OOD source19, fixed nine-unit N03 cohort of 162 semantic replacements; not full-bank acceptance",
  "trackId": "object-oriented-design-interview",
  "beforeProducerCommit": "90a1d83859c2be83c5266ffe981f487d3c29aeeb",
  "beforeContentVersion": "object-oriented-design-interview-authoring-v2026.10.04-bizq01-17",
  "contentVersion": "object-oriented-design-interview-authoring-v2026.10.04-bizq01-19",
  "beforeQuestionSetSha256": "4cf59f42c9e257118e1c2b1d4358753b67c80328f34c6c8350274baff7ffcbcc",
  "questionSetSha256": "b3198cffb61cad65233b0dee7bf308830d53a6adbf0cd6ceac00ffff5fb665a5",
  "sourceFiles": Object.freeze([
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08"
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09"
    })
  ]),
  "identityAction": "replace_question_with_new_id",
  "identityReason": "Whole-object review confirms each replacement changes the primary decision or accepted-answer meaning; the retired question and option identities remain only in immutable migration evidence.",
  "confirmedDefects": Object.freeze([
    "The former generic lens-plus-invariant-owner choice lacked the decisive unit-specific facts required to assess its declared modeling decision.",
    "The former generic alternatives and coordinator-style error diagnosis did not explain the actual unit-specific choices."
  ]),
  "replacements": Object.freeze([
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i001",
      "questionId": "ood-n03-b01-i019",
      "learningObjective": "Choose association rather than composition when posted allocation records outlive the account.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “a repayment cannot reduce the outstanding balance below zero” to this distinct decision: Choose association rather than composition when posted allocation records outlive the account.",
      "acceptedOptionId": "n03b01_019_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i002",
      "questionId": "ood-n03-b01-i020",
      "learningObjective": "Model exclusive draft-slot ownership with composition and separate the retained match result.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the bracket advances only from a legal match state” to this distinct decision: Model exclusive draft-slot ownership with composition and separate the retained match result.",
      "acceptedOptionId": "n03b01_020_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i003",
      "questionId": "ood-n03-b01-i021",
      "learningObjective": "Determine many-to-many protocol reuse without inventing per-link state or ownership.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “classification and refund eligibility are not the same responsibility” to this distinct decision: Determine many-to-many protocol reuse without inventing per-link state or ownership.",
      "acceptedOptionId": "n03b01_021_model_v2",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i004",
      "questionId": "ood-n03-b01-i022",
      "learningObjective": "Model shared immutable provenance inputs with associations, not snapshot-owned lifetimes.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “published outputs reference immutable inputs and code versions” to this distinct decision: Model shared immutable provenance inputs with associations, not snapshot-owned lifetimes.",
      "acceptedOptionId": "n03b01_022_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i005",
      "questionId": "ood-n03-b01-i023",
      "learningObjective": "Read author and revision multiplicities independently for retained annotations.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “accepted comments must retain their author and document revision” to this distinct decision: Read author and revision multiplicities independently for retained annotations.",
      "acceptedOptionId": "n03b01_023_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i006",
      "questionId": "ood-n03-b01-i024",
      "learningObjective": "Use composition for four session-local drafts that are deleted on cancel, while keeping the committed successor separate.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “a submission is either complete or explicitly retryable” to this distinct decision: Use composition for four session-local drafts that are deleted on cancel, while keeping the committed successor separate.",
      "acceptedOptionId": "n03b01_024_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i007",
      "questionId": "ood-n03-b01-i025",
      "learningObjective": "Model optional, exclusive current installation with 0..1 multiplicity at both ends despite module reuse over time.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the new issue is traceable and does not double-charge the customer” to this distinct decision: Model optional, exclusive current installation with 0..1 multiplicity at both ends despite module reuse over time.",
      "acceptedOptionId": "n03b01_025_model_v3",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i008",
      "questionId": "ood-n03-b01-i026",
      "learningObjective": "Model the current badge-holder link separately from badge record retention and historical assignment.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “revocation is visible to the door policy before access is granted” to this distinct decision: Model the current badge-holder link separately from badge record retention and historical assignment.",
      "acceptedOptionId": "n03b01_026_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i009",
      "questionId": "ood-n03-b01-i027",
      "learningObjective": "Represent replacement labels as one-to-many retained shipment history, not a single current label.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the printed label represents the current approved shipment data” to this distinct decision: Represent replacement labels as one-to-many retained shipment history, not a single current label.",
      "acceptedOptionId": "n03b01_027_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i010",
      "questionId": "ood-n03-b01-i028",
      "learningObjective": "Represent each booking’s current room link and repeated room use without claiming simultaneous multiple rooms.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the room capacity and cancellation policy must remain consistent” to this distinct decision: Represent each booking’s current room link and repeated room use without claiming simultaneous multiple rooms.",
      "acceptedOptionId": "n03b01_028_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i011",
      "questionId": "ood-n03-b01-i029",
      "learningObjective": "Keep exhibit maintenance records associated after the exhibit is retired or replaced.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “unsafe commands are rejected while maintenance is active” to this distinct decision: Keep exhibit maintenance records associated after the exhibit is retired or replaced.",
      "acceptedOptionId": "n03b01_029_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i012",
      "questionId": "ood-n03-b01-i030",
      "learningObjective": "Link completions to the exact retained lesson revision they used.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “progress refers to a stable lesson identity” to this distinct decision: Link completions to the exact retained lesson revision they used.",
      "acceptedOptionId": "n03b01_030_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i013",
      "questionId": "ood-n03-b01-i031",
      "learningObjective": "Place a UML qualifier at the association end whose instances are selected by a key scoped to the opposite object.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “export observes a stable session state” to this distinct decision: Place a UML qualifier at the association end whose instances are selected by a key scoped to the opposite object.",
      "acceptedOptionId": "n03b01_031_model_v4",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i014",
      "questionId": "ood-n03-b01-i032",
      "learningObjective": "Use separate one-to-many links from escalation events to conversation and author, with reuse at both endpoints.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the escalation keeps ownership and response deadlines” to this distinct decision: Use separate one-to-many links from escalation events to conversation and author, with reuse at both endpoints.",
      "acceptedOptionId": "n03b01_032_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i015",
      "questionId": "ood-n03-b01-i033",
      "learningObjective": "Link listings to the exact policy version they pin while allowing version reuse.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “a listing cannot become visible before its price and stock rule are valid” to this distinct decision: Link listings to the exact policy version they pin while allowing version reuse.",
      "acceptedOptionId": "n03b01_033_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i016",
      "questionId": "ood-n03-b01-i034",
      "learningObjective": "Model each request/vendor split as a record connecting exactly one request and vendor.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “each split retains the original request identity and delivery promise” to this distinct decision: Model each request/vendor split as a record connecting exactly one request and vendor.",
      "acceptedOptionId": "n03b01_034_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i017",
      "questionId": "ood-n03-b01-i035",
      "learningObjective": "Choose both reservation-approval multiplicities from stated repeated review and reviewer reuse.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “transfer preserves the plot boundary and approval history” to this distinct decision: Choose both reservation-approval multiplicities from stated repeated review and reviewer reuse.",
      "acceptedOptionId": "n03b01_035_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B01.json",
      "beforeSourceSha256": "ba4f3e943faf3d5a93fb07e24f132309d4999b0f18560146482acb49a7394d36",
      "sourceSha256": "77c68c1e8258deaca67490d1abb5f38d26674038e0f760e756b85166bf33671e",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B01",
      "beforeQuestionId": "ood-n03-b01-i018",
      "questionId": "ood-n03-b01-i036",
      "learningObjective": "Compose bundle-owned lines but associate each line to a shared product.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the bundle pricing policy remains consistent with its components” to this distinct decision: Compose bundle-owned lines but associate each line to a shared product.",
      "acceptedOptionId": "n03b01_036_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i001",
      "questionId": "ood-n03-b02-i019",
      "learningObjective": "Expose both traversals only where the session and provider operations each require a direct object path.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the current stream keeps its timing and error contract” to this distinct decision: Expose both traversals only where the session and provider operations each require a direct object path.",
      "acceptedOptionId": "n03b02_019_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i002",
      "questionId": "ood-n03-b02-i020",
      "learningObjective": "Expose the stored volunteer reference because assignment detail follows it, while keeping profile listing repository-backed.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “skills and availability constraints hold for both assignments” to this distinct decision: Expose the stored volunteer reference because assignment detail follows it, while keeping profile listing repository-backed.",
      "acceptedOptionId": "n03b02_020_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i003",
      "questionId": "ood-n03-b02-i021",
      "learningObjective": "Keep edit-to-parent traversal and use the existing query for reverse edit lookup.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The source item assessed the source’s general rule against unnecessary bidirectional references; this replacement decides whether the actual Edit detail/evaluator path needs the parent reference while the repository serves reverse lookup.",
      "acceptedOptionId": "n03b02_021_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i004",
      "questionId": "ood-n03-b02-i022",
      "learningObjective": "Let a character read its pinned campaign revision without storing a claims collection on the revision.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “reward rules depend on the current legal campaign state” to this distinct decision: Let a character read its pinned campaign revision without storing a claims collection on the revision.",
      "acceptedOptionId": "n03b02_022_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i005",
      "questionId": "ood-n03-b02-i023",
      "learningObjective": "Support both shipment-to-carrier and carrier-to-shipment clients with one coordinated membership update.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “temperature restrictions and hand-off ownership travel with the shipment” to this distinct decision: Support both shipment-to-carrier and carrier-to-shipment clients with one coordinated membership update.",
      "acceptedOptionId": "n03b02_023_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i006",
      "questionId": "ood-n03-b02-i024",
      "learningObjective": "Use a durable account-keyed query for history instead of storing a redundant inverse object collection.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “a repayment cannot reduce the outstanding balance below zero” to this distinct decision: Use a durable account-keyed query for history instead of storing a redundant inverse object collection.",
      "acceptedOptionId": "n03b02_024_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i007",
      "questionId": "ood-n03-b02-i025",
      "learningObjective": "Expose match-to-bracket for the forfeit handler and leave match listing to its indexed repository.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the bracket advances only from a legal match state” to this distinct decision: Expose match-to-bracket for the forfeit handler and leave match listing to its indexed repository.",
      "acceptedOptionId": "n03b02_025_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i008",
      "questionId": "ood-n03-b02-i026",
      "learningObjective": "Provide both required report/item paths and update them atomically because both screens traverse the link.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “classification and refund eligibility are not the same responsibility” to this distinct decision: Provide both required report/item paths and update them atomically because both screens traverse the link.",
      "acceptedOptionId": "n03b02_026_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i009",
      "questionId": "ood-n03-b02-i027",
      "learningObjective": "Expose snapshot-to-input provenance while leaving shared-artifact reverse search to its indexed query.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “published outputs reference immutable inputs and code versions” to this distinct decision: Expose snapshot-to-input provenance while leaving shared-artifact reverse search to its indexed query.",
      "acceptedOptionId": "n03b02_027_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i010",
      "questionId": "ood-n03-b02-i028",
      "learningObjective": "Support revision-to-annotations and annotation-to-revision/author while avoiding an unneeded author collection.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “accepted comments must retain their author and document revision” to this distinct decision: Support revision-to-annotations and annotation-to-revision/author while avoiding an unneeded author collection.",
      "acceptedOptionId": "n03b02_028_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i011",
      "questionId": "ood-n03-b02-i029",
      "learningObjective": "Expose only submission-to-route-revision because revision clients do not enumerate submissions.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “a submission is either complete or explicitly retryable” to this distinct decision: Expose only submission-to-route-revision because revision clients do not enumerate submissions.",
      "acceptedOptionId": "n03b02_029_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i012",
      "questionId": "ood-n03-b02-i030",
      "learningObjective": "Keep order and issue traversals because each named client starts at the opposite endpoint.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the new issue is traceable and does not double-charge the customer” to this distinct decision: Keep order and issue traversals because each named client starts at the opposite endpoint.",
      "acceptedOptionId": "n03b02_030_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i013",
      "questionId": "ood-n03-b02-i031",
      "learningObjective": "Expose door assignment collection and assignment-to-door while keeping holder lookup directory-backed.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “revocation is visible to the door policy before access is granted” to this distinct decision: Expose door assignment collection and assignment-to-door while keeping holder lookup directory-backed.",
      "acceptedOptionId": "n03b02_031_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i014",
      "questionId": "ood-n03-b02-i032",
      "learningObjective": "Expose only the forward ends required for a two-association Shipment→Revision→Publisher detail path.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the printed label represents the current approved shipment data” to this distinct decision: Expose only the forward ends required for a two-association Shipment→Revision→Publisher detail path.",
      "acceptedOptionId": "n03b02_032_model_v3",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i015",
      "questionId": "ood-n03-b02-i033",
      "learningObjective": "Support room calendar and booking detail traversals with one coordinated move operation.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the room capacity and cancellation policy must remain consistent” to this distinct decision: Support room calendar and booking detail traversals with one coordinated move operation.",
      "acceptedOptionId": "n03b02_033_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i016",
      "questionId": "ood-n03-b02-i034",
      "learningObjective": "Expose exhibit-to-policy only because policy consumers do not traverse back to exhibits.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “unsafe commands are rejected while maintenance is active” to this distinct decision: Expose exhibit-to-policy only because policy consumers do not traverse back to exhibits.",
      "acceptedOptionId": "n03b02_034_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i017",
      "questionId": "ood-n03-b02-i035",
      "learningObjective": "Keep event-specific Hub traversal on ScanEvent and omit a misleading shipment-level shortcut or unused inverse.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “progress refers to a stable lesson identity” to this distinct decision: Keep event-specific Hub traversal on ScanEvent and omit a misleading shipment-level shortcut or unused inverse.",
      "acceptedOptionId": "n03b02_035_model_v3",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json",
      "beforeSourceSha256": "d111ae5ce76f81062d69c5e1de7c7b7d720840ccfe30c6519fba78f66c388515",
      "sourceSha256": "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B02",
      "beforeQuestionId": "ood-n03-b02-i018",
      "questionId": "ood-n03-b02-i036",
      "learningObjective": "Support timeline and event detail paths while keeping author search in the staff directory.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “export observes a stable session state” to this distinct decision: Support timeline and event detail paths while keeping author search in the staff directory.",
      "acceptedOptionId": "n03b02_036_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i001",
      "questionId": "ood-n03-b03-i019",
      "learningObjective": "Separate a grant’s authorization expiry from retention of its approval evidence.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the role expires and is attributable to a specific approval” to this distinct decision: Separate a grant’s authorization expiry from retention of its approval evidence.",
      "acceptedOptionId": "n03b03_019_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i002",
      "questionId": "ood-n03-b03-i020",
      "learningObjective": "Close a withdrawn request to new decisions while retaining already signed decision records.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the seal covers the exact immutable revision” to this distinct decision: Close a withdrawn request to new decisions while retaining already signed decision records.",
      "acceptedOptionId": "n03b03_020_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i003",
      "questionId": "ood-n03-b03-i021",
      "learningObjective": "Keep cancellable editor drafts session-owned and create the durable inspection as a distinct committed object.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “release is idempotent and tied to a settled order” to this distinct decision: Keep cancellable editor drafts session-owned and create the durable inspection as a distinct committed object.",
      "acceptedOptionId": "n03b03_021_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i004",
      "questionId": "ood-n03-b03-i022",
      "learningObjective": "Create an immutable snapshot only after complete input validation succeeds.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “passengers receive the change in the order in which it becomes effective” to this distinct decision: Create an immutable snapshot only after complete input validation succeeds.",
      "acceptedOptionId": "n03b03_022_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i005",
      "questionId": "ood-n03-b03-i023",
      "learningObjective": "Consume a one-time recovery secret on success while retaining only a replay marker through the fixed expiry.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “a meter cannot be committed twice for an overlapping window” to this distinct decision: Consume a one-time recovery secret on success while retaining only a replay marker through the fixed expiry.",
      "acceptedOptionId": "n03b03_023_model_v2",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i006",
      "questionId": "ood-n03-b03-i024",
      "learningObjective": "Delete local copied drafts only after durable server acknowledgement; keep server records independent.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the current stream keeps its timing and error contract” to this distinct decision: Delete local copied drafts only after durable server acknowledgement; keep server records independent.",
      "acceptedOptionId": "n03b03_024_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i007",
      "questionId": "ood-n03-b03-i025",
      "learningObjective": "Distinguish retry of the same immutable issue from a corrected successor issue.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “skills and availability constraints hold for both assignments” to this distinct decision: Distinguish retry of the same immutable issue from a corrected successor issue.",
      "acceptedOptionId": "n03b03_025_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i008",
      "questionId": "ood-n03-b03-i026",
      "learningObjective": "Revoke access without deleting the retained badge record; create a new identity for replacement hardware.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “conflicts are explicit and never silently overwrite accepted geometry” to this distinct decision: Revoke access without deleting the retained badge record; create a new identity for replacement hardware.",
      "acceptedOptionId": "n03b03_026_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i009",
      "questionId": "ood-n03-b03-i027",
      "learningObjective": "Discard an unprinted preview on cancel and create the retained artifact only at successful print.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “reward rules depend on the current legal campaign state” to this distinct decision: Discard an unprinted preview on cancel and create the retained artifact only at successful print.",
      "acceptedOptionId": "n03b03_027_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i010",
      "questionId": "ood-n03-b03-i028",
      "learningObjective": "Expire an unconfirmed temporary hold without creating a booking; confirmation creates the durable booking.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “temperature restrictions and hand-off ownership travel with the shipment” to this distinct decision: Expire an unconfirmed temporary hold without creating a booking; confirmation creates the durable booking.",
      "acceptedOptionId": "n03b03_028_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i011",
      "questionId": "ood-n03-b03-i029",
      "learningObjective": "Apply a fixed retention clock and legal hold to a superseded copied-value policy version.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “a repayment cannot reduce the outstanding balance below zero” to this distinct decision: Apply a fixed retention clock and legal hold to a superseded copied-value policy version.",
      "acceptedOptionId": "n03b03_029_model_v2",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i012",
      "questionId": "ood-n03-b03-i030",
      "learningObjective": "Retire a lesson revision from new enrollment without severing existing completion history.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the bracket advances only from a legal match state” to this distinct decision: Retire a lesson revision from new enrollment without severing existing completion history.",
      "acceptedOptionId": "n03b03_030_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i013",
      "questionId": "ood-n03-b03-i031",
      "learningObjective": "Keep live-session strokes through export failure and create an independent archive only after successful export.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “classification and refund eligibility are not the same responsibility” to this distinct decision: Keep live-session strokes through export failure and create an independent archive only after successful export.",
      "acceptedOptionId": "n03b03_031_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i014",
      "questionId": "ood-n03-b03-i032",
      "learningObjective": "Update current assignment and append an immutable event without rewriting prior escalation history.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “published outputs reference immutable inputs and code versions” to this distinct decision: Update current assignment and append an immutable event without rewriting prior escalation history.",
      "acceptedOptionId": "n03b03_032_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i015",
      "questionId": "ood-n03-b03-i033",
      "learningObjective": "Discard only an unpublished draft; publish a new retained revision and preserve prior revisions for orders.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “accepted comments must retain their author and document revision” to this distinct decision: Discard only an unpublished draft; publish a new retained revision and preserve prior revisions for orders.",
      "acceptedOptionId": "n03b03_033_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i016",
      "questionId": "ood-n03-b03-i034",
      "learningObjective": "Delete a tentative split before acknowledgement but retain accepted vendor work as its own object.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “a submission is either complete or explicitly retryable” to this distinct decision: Delete a tentative split before acknowledgement but retain accepted vendor work as its own object.",
      "acceptedOptionId": "n03b03_034_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i017",
      "questionId": "ood-n03-b03-i035",
      "learningObjective": "Expire only a derived quote-cache entry while preserving independent source records for recomputation.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the new issue is traceable and does not double-charge the customer” to this distinct decision: Expire only a derived quote-cache entry while preserving independent source records for recomputation.",
      "acceptedOptionId": "n03b03_035_model_v2",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json",
      "beforeSourceSha256": "eece9e7eba921df5eb811f303782609189b27ef9a3355bacb67fd86ec0f53672",
      "sourceSha256": "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B03",
      "beforeQuestionId": "ood-n03-b03-i018",
      "questionId": "ood-n03-b03-i036",
      "learningObjective": "Retire a shared price version only after retained bundle revisions release their live references.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “revocation is visible to the door policy before access is granted” to this distinct decision: Retire a shared price version only after retained bundle revisions release their live references.",
      "acceptedOptionId": "n03b03_036_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i001",
      "questionId": "ood-n03-b04-i019",
      "learningObjective": "Use a subtype when changed implementation preserves the full base inputs, outputs, and invariants.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “a battery cannot be assigned to two aircraft at once” to this distinct decision: Use a subtype when changed implementation preserves the full base inputs, outputs, and invariants.",
      "acceptedOptionId": "n03b04_019_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i002",
      "questionId": "ood-n03-b04-i020",
      "learningObjective": "Compose an independently selected tax calculator around the stable invoice object.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “privacy and consent rules apply before external disclosure” to this distinct decision: Compose an independently selected tax calculator around the stable invoice object.",
      "acceptedOptionId": "n03b04_020_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i003",
      "questionId": "ood-n03-b04-i021",
      "learningObjective": "Reject a subtype that requires a key unavailable to callers of the base reader contract.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “completion records the exercise version and score policy” to this distinct decision: Reject a subtype that requires a key unavailable to callers of the base reader contract.",
      "acceptedOptionId": "n03b04_021_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i004",
      "questionId": "ood-n03-b04-i022",
      "learningObjective": "Keep a filtered public schedule as a projection because it omits results promised by Schedule.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “approval is attributable, bounded, and cannot bypass required controls” to this distinct decision: Keep a filtered public schedule as a projection because it omits results promised by Schedule.",
      "acceptedOptionId": "n03b04_022_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i005",
      "questionId": "ood-n03-b04-i023",
      "learningObjective": "Accept a lossless encoder subtype that strengthens output guarantees without adding required inputs.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “annotations follow stable segments rather than file offsets” to this distinct decision: Accept a lossless encoder subtype that strengthens output guarantees without adding required inputs.",
      "acceptedOptionId": "n03b04_023_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i006",
      "questionId": "ood-n03-b04-i024",
      "learningObjective": "Compose destination-selected label rendering instead of changing Shipment identity per format.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the role expires and is attributable to a specific approval” to this distinct decision: Compose destination-selected label rendering instead of changing Shipment identity per format.",
      "acceptedOptionId": "n03b04_024_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i007",
      "questionId": "ood-n03-b04-i025",
      "learningObjective": "Allow additive signature metadata when CertifiedReport retains the entire inspection-report contract.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the seal covers the exact immutable revision” to this distinct decision: Allow additive signature metadata when CertifiedReport retains the entire inspection-report contract.",
      "acceptedOptionId": "n03b04_025_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i008",
      "questionId": "ood-n03-b04-i026",
      "learningObjective": "Compose a matcher chosen per search request rather than encoding request policy in Reservation subtype.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “release is idempotent and tied to a settled order” to this distinct decision: Compose a matcher chosen per search request rather than encoding request policy in Reservation subtype.",
      "acceptedOptionId": "n03b04_026_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i009",
      "questionId": "ood-n03-b04-i027",
      "learningObjective": "Reject ScenicRoute as a subtype when it adds a mandatory waypoint precondition.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “passengers receive the change in the order in which it becomes effective” to this distinct decision: Reject ScenicRoute as a subtype when it adds a mandatory waypoint precondition.",
      "acceptedOptionId": "n03b04_027_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i010",
      "questionId": "ood-n03-b04-i028",
      "learningObjective": "Keep a replaceable maintenance policy as a collaborator while Exhibit identity remains stable.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “a meter cannot be committed twice for an overlapping window” to this distinct decision: Keep a replaceable maintenance policy as a collaborator while Exhibit identity remains stable.",
      "acceptedOptionId": "n03b04_028_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i011",
      "questionId": "ood-n03-b04-i029",
      "learningObjective": "Use a regional processor subtype when it preserves the base idempotency and retry outcome contract.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the current stream keeps its timing and error contract” to this distinct decision: Use a regional processor subtype when it preserves the base idempotency and retry outcome contract.",
      "acceptedOptionId": "n03b04_029_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i012",
      "questionId": "ood-n03-b04-i030",
      "learningObjective": "Compose an independently selected SigningProvider around the same sign request.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “skills and availability constraints hold for both assignments” to this distinct decision: Compose an independently selected SigningProvider around the same sign request.",
      "acceptedOptionId": "n03b04_030_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i013",
      "questionId": "ood-n03-b04-i031",
      "learningObjective": "Accept a read-only subtype when the base Profile contract is explicitly query-only and every result is preserved.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “conflicts are explicit and never silently overwrite accepted geometry” to this distinct decision: Accept a read-only subtype when the base Profile contract is explicitly query-only and every result is preserved.",
      "acceptedOptionId": "n03b04_031_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i014",
      "questionId": "ood-n03-b04-i032",
      "learningObjective": "Reject a character subtype whose reward call performs a state change the base contract forbids.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “reward rules depend on the current legal campaign state” to this distinct decision: Reject a character subtype whose reward call performs a state change the base contract forbids.",
      "acceptedOptionId": "n03b04_032_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i015",
      "questionId": "ood-n03-b04-i033",
      "learningObjective": "Keep independently selected carrier assignment behavior outside Shipment subtype identity.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “temperature restrictions and hand-off ownership travel with the shipment” to this distinct decision: Keep independently selected carrier assignment behavior outside Shipment subtype identity.",
      "acceptedOptionId": "n03b04_033_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i016",
      "questionId": "ood-n03-b04-i034",
      "learningObjective": "Compose a campaign-selected evaluator around the same Character input and result contract.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “a repayment cannot reduce the outstanding balance below zero” to this distinct decision: Compose a campaign-selected evaluator around the same Character input and result contract.",
      "acceptedOptionId": "n03b04_034_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i017",
      "questionId": "ood-n03-b04-i035",
      "learningObjective": "Reject a match subtype that allows a state transition the base contract promises to reject.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “the bracket advances only from a legal match state” to this distinct decision: Reject a match subtype that allows a state transition the base contract promises to reject.",
      "acceptedOptionId": "n03b04_035_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B04.json",
      "beforeSourceSha256": "b410df959e838d7ff5e3c075a30b397af4b270fd6de6a2bb4a47e530e0e4658a",
      "sourceSha256": "20a31ab14e6f7d01d132d064b14f347c30483931862409916b232e5df996ae03",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B04",
      "beforeQuestionId": "ood-n03-b04-i018",
      "questionId": "ood-n03-b04-i036",
      "learningObjective": "Keep view-format variation in an adapter because the same Listing supplies both presentations.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "Changes from the source invariant “classification and refund eligibility are not the same responsibility” to this distinct decision: Keep view-format variation in an adapter because the same Listing supplies both presentations.",
      "acceptedOptionId": "n03b04_036_model",
      "sourceRefs": Object.freeze([
        "https://www.omg.org/spec/UML/2.5.1/PDF",
        "https://doi.org/10.1145/62138.62141"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i001",
      "questionId": "ood-n03-b05-i019",
      "learningObjective": "Place a stable tax policy contract with the policy owner while providers vary.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for place a stable tax policy contract with the policy owner while providers vary. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_019_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i002",
      "questionId": "ood-n03-b05-i020",
      "learningObjective": "Keep persistence behind a read capability consumed by stable policy.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep persistence behind a read capability consumed by stable policy. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_020_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i003",
      "questionId": "ood-n03-b05-i021",
      "learningObjective": "Translate provider status into a policy-owned outcome.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for translate provider status into a policy-owned outcome. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_021_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i004",
      "questionId": "ood-n03-b05-i022",
      "learningObjective": "Introduce an abstraction only where a real variation or client boundary supports it.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for introduce an abstraction only where a real variation or client boundary supports it. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_022_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i005",
      "questionId": "ood-n03-b05-i023",
      "learningObjective": "Place a consumer-specific contract with the decision owner instead of a generic shared package.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for place a consumer-specific contract with the decision owner instead of a generic shared package. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_023_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i006",
      "questionId": "ood-n03-b05-i024",
      "learningObjective": "Normalize inbound vendor representations at the adapter boundary.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for normalize inbound vendor representations at the adapter boundary. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_024_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i007",
      "questionId": "ood-n03-b05-i025",
      "learningObjective": "Express retry outcomes in a stable application contract.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for express retry outcomes in a stable application contract. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_025_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i008",
      "questionId": "ood-n03-b05-i026",
      "learningObjective": "Trace transitive imports to identify the actual compile-time dependency.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for trace transitive imports to identify the actual compile-time dependency. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_026_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i009",
      "questionId": "ood-n03-b05-i027",
      "learningObjective": "Expose only the capability the GIS policy needs from replaceable providers.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for expose only the capability the gis policy needs from replaceable providers. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_027_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i010",
      "questionId": "ood-n03-b05-i028",
      "learningObjective": "Distinguish compile-time dependency direction from runtime call direction.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for distinguish compile-time dependency direction from runtime call direction. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_028_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i011",
      "questionId": "ood-n03-b05-i029",
      "learningObjective": "Keep optional audit delivery outside the stable policy decision.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep optional audit delivery outside the stable policy decision. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_029_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i012",
      "questionId": "ood-n03-b05-i030",
      "learningObjective": "Avoid inheriting from a volatile infrastructure base class to reuse policy.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for avoid inheriting from a volatile infrastructure base class to reuse policy. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_030_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i013",
      "questionId": "ood-n03-b05-i031",
      "learningObjective": "Map SDK results into application-owned types.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for map sdk results into application-owned types. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_031_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i014",
      "questionId": "ood-n03-b05-i032",
      "learningObjective": "Validate deployment configuration before exposing it as a domain value.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for validate deployment configuration before exposing it as a domain value. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_032_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i015",
      "questionId": "ood-n03-b05-i033",
      "learningObjective": "Keep serialization after policy validation at the transport boundary.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep serialization after policy validation at the transport boundary. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_033_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i016",
      "questionId": "ood-n03-b05-i034",
      "learningObjective": "Place stable policy constants with the policy that owns their meaning.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for place stable policy constants with the policy that owns their meaning. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_034_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i017",
      "questionId": "ood-n03-b05-i035",
      "learningObjective": "Normalize and validate model output before policy consumes it.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for normalize and validate model output before policy consumes it. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_035_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B05.json",
      "beforeSourceSha256": "759741cbf807116e885c8e3bf12ac4c1250c02ab1d965873a7c69ffed7af9a07",
      "sourceSha256": "583aa495eae6e3ac5e47e4ec9b6ce87a0ac3c9cc826216723e0155547a2bbf05",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B05",
      "beforeQuestionId": "ood-n03-b05-i018",
      "questionId": "ood-n03-b05-i036",
      "learningObjective": "Let the client contract owner define the capability shared by adapters.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for let the client contract owner define the capability shared by adapters. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "b05_036_correct",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i001",
      "questionId": "ood-n03-b06-i019",
      "learningObjective": "Break mutual imports by extracting the shared decision contract.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for break mutual imports by extracting the shared decision contract. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_019_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i002",
      "questionId": "ood-n03-b06-i020",
      "learningObjective": "Give a cross-module result contract a justified owner.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline generic owner_preserves_contract answer did not identify a cycle-breaking result boundary. This replacement states that Order policy owns settlement semantics and asks for its result contract, changing the accepted decision.",
      "acceptedOptionId": "ood-n03-b06_020_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i003",
      "questionId": "ood-n03-b06-i021",
      "learningObjective": "Separate unrelated rules from a genuinely shared utility.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for separate unrelated rules from a genuinely shared utility. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_021_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i004",
      "questionId": "ood-n03-b06-i022",
      "learningObjective": "Break callback type cycles without changing runtime orchestration.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for break callback type cycles without changing runtime orchestration. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_022_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i005",
      "questionId": "ood-n03-b06-i023",
      "learningObjective": "Retain useful acyclic dependencies when no change pressure supports a split.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for retain useful acyclic dependencies when no change pressure supports a split. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_023_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i006",
      "questionId": "ood-n03-b06-i024",
      "learningObjective": "Keep co-changing scheduling policy cohesive behind a result boundary.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep co-changing scheduling policy cohesive behind a result boundary. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_024_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i007",
      "questionId": "ood-n03-b06-i025",
      "learningObjective": "Keep persistence representation from creating a policy back edge.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep persistence representation from creating a policy back edge. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_025_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i008",
      "questionId": "ood-n03-b06-i026",
      "learningObjective": "Shape an abstraction around a stable capability rather than provider knobs.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for shape an abstraction around a stable capability rather than provider knobs. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_026_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i009",
      "questionId": "ood-n03-b06-i027",
      "learningObjective": "Break parser/workflow cycles at their exchanged result contract.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for break parser/workflow cycles at their exchanged result contract. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_027_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i010",
      "questionId": "ood-n03-b06-i028",
      "learningObjective": "Remove unused common imports instead of relocating unrelated policy.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for remove unused common imports instead of relocating unrelated policy. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_028_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i011",
      "questionId": "ood-n03-b06-i029",
      "learningObjective": "Keep policy results independent from use-case orchestration classes.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep policy results independent from use-case orchestration classes. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_029_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i012",
      "questionId": "ood-n03-b06-i030",
      "learningObjective": "Separate policies controlled by distinct change authorities.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for separate policies controlled by distinct change authorities. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_030_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i013",
      "questionId": "ood-n03-b06-i031",
      "learningObjective": "Keep database transaction mechanisms behind a domain contract.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline generic owner_preserves_contract answer did not state ownership of the database transaction or the policy operation. This replacement makes Infrastructure the transaction owner and Domain the policy owner, changing the accepted boundary decision.",
      "acceptedOptionId": "ood-n03-b06_031_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i014",
      "questionId": "ood-n03-b06-i032",
      "learningObjective": "Split responsibilities with independently stated change reasons.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for split responsibilities with independently stated change reasons. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_032_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i015",
      "questionId": "ood-n03-b06-i033",
      "learningObjective": "Keep business event meaning independent from message transport.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep business event meaning independent from message transport. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_033_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i016",
      "questionId": "ood-n03-b06-i034",
      "learningObjective": "Separate shared date representation from domain-specific date rules.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for separate shared date representation from domain-specific date rules. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_034_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i017",
      "questionId": "ood-n03-b06-i035",
      "learningObjective": "Preserve a healthy directed graph in the absence of a demonstrated defect.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for preserve a healthy directed graph in the absence of a demonstrated defect. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_035_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B06.json",
      "beforeSourceSha256": "18ded2381012a9d93224f4a3bc388ab5123ad516076e544cd7bb3d63f1a64e96",
      "sourceSha256": "8b19701bf0b18d25b0984323a7c0d5601eb324d6fb4dbebb690b9956fbd7da09",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B06",
      "beforeQuestionId": "ood-n03-b06-i018",
      "questionId": "ood-n03-b06-i036",
      "learningObjective": "Separate legal redaction policy from a changing PDF rendering mechanism.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for separate legal redaction policy from a changing pdf rendering mechanism. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b06_036_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i001",
      "questionId": "ood-n03-b07-i019",
      "learningObjective": "Assemble concrete collaborators at the application composition root.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for assemble concrete collaborators at the application composition root. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_019_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i002",
      "questionId": "ood-n03-b07-i020",
      "learningObjective": "Match a request handler lifetime to its request-scoped dependency.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for match a request handler lifetime to its request-scoped dependency. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_020_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i003",
      "questionId": "ood-n03-b07-i021",
      "learningObjective": "Identify captive dependencies through retained references.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for identify captive dependencies through retained references. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_021_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i004",
      "questionId": "ood-n03-b07-i022",
      "learningObjective": "Create a bounded scope for each long-lived worker job.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for create a bounded scope for each long-lived worker job. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_022_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i005",
      "questionId": "ood-n03-b07-i023",
      "learningObjective": "Choose a service lifetime from state and dependency facts, not class names.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for choose a service lifetime from state and dependency facts, not class names. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_023_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i006",
      "questionId": "ood-n03-b07-i024",
      "learningObjective": "Select runtime-varying implementations from explicit request data.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for select runtime-varying implementations from explicit request data. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_024_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i007",
      "questionId": "ood-n03-b07-i025",
      "learningObjective": "Inject a changing clock dependency explicitly for deterministic behavior.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for inject a changing clock dependency explicitly for deterministic behavior. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_025_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i008",
      "questionId": "ood-n03-b07-i026",
      "learningObjective": "Prevent scoped service instances escaping into longer-lived caches.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for prevent scoped service instances escaping into longer-lived caches. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_026_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i009",
      "questionId": "ood-n03-b07-i027",
      "learningObjective": "Represent deployment-optional capabilities without fake success.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for represent deployment-optional capabilities without fake success. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_027_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i010",
      "questionId": "ood-n03-b07-i028",
      "learningObjective": "Assess lifetime from the full retained object graph.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for assess lifetime from the full retained object graph. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_028_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i011",
      "questionId": "ood-n03-b07-i029",
      "learningObjective": "Centralize duplicate application wiring while keeping constructors explicit.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for centralize duplicate application wiring while keeping constructors explicit. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_029_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i012",
      "questionId": "ood-n03-b07-i030",
      "learningObjective": "Assess whether a transient retained by one scoped consumer crosses a lifetime boundary.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for assess whether a transient retained by one scoped consumer crosses a lifetime boundary. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_030_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i013",
      "questionId": "ood-n03-b07-i031",
      "learningObjective": "Pass operation-specific data without capturing request scope.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for pass operation-specific data without capturing request scope. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_031_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i014",
      "questionId": "ood-n03-b07-i032",
      "learningObjective": "Use the container for collaborating services, not dependency-free per-input values.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The original item selected a generic ownership response. This replacement tests whether dependency-free, immutable per-input values need container-managed construction; the answer and required reasoning have changed.",
      "acceptedOptionId": "ood-n03-b07_032_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i015",
      "questionId": "ood-n03-b07-i033",
      "learningObjective": "Share a same-scope collaborator where instance identity matters.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for share a same-scope collaborator where instance identity matters. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_033_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i016",
      "questionId": "ood-n03-b07-i034",
      "learningObjective": "Separate stable deployment configuration from request-specific values.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for separate stable deployment configuration from request-specific values. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_034_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i017",
      "questionId": "ood-n03-b07-i035",
      "learningObjective": "Assemble ordered decorators at the application composition root.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The original item selected a generic ownership response. This replacement tests where a required decorator order is composed; the answer and required reasoning have changed.",
      "acceptedOptionId": "ood-n03-b07_035_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B07.json",
      "beforeSourceSha256": "ea473492d59a8c210a53db8a3ebd993568dde28ded9af0595acfbfde0a5fad93",
      "sourceSha256": "1490651f9a176dc61dc92c56733aafefd2010c47340b899a1ccf218cd804e4bd",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B07",
      "beforeQuestionId": "ood-n03-b07-i018",
      "questionId": "ood-n03-b07-i036",
      "learningObjective": "Pass operation-scoped cancellation data without retaining it in a long-lived service.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for pass operation-scoped cancellation data without retaining it in a long-lived service. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b07_036_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
        "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i001",
      "questionId": "ood-n03-b08-i019",
      "learningObjective": "Guarantee stream disposal across early return and exception paths.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for guarantee stream disposal across early return and exception paths. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_019_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i002",
      "questionId": "ood-n03-b08-i020",
      "learningObjective": "Await asynchronous cleanup when resource release completion is required.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for await asynchronous cleanup when resource release completion is required. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_020_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i003",
      "questionId": "ood-n03-b08-i021",
      "learningObjective": "Distinguish borrowed resources from resources the component owns.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for distinguish borrowed resources from resources the component owns. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_021_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i004",
      "questionId": "ood-n03-b08-i022",
      "learningObjective": "Keep temporary files through queued work and clean them at job end.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep temporary files through queued work and clean them at job end. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_022_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i005",
      "questionId": "ood-n03-b08-i023",
      "learningObjective": "Use rollback for a failed transaction and dispose its handle.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for use rollback for a failed transaction and dispose its handle. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_023_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i006",
      "questionId": "ood-n03-b08-i024",
      "learningObjective": "Return borrowed sockets to their owning pool rather than disposing the pool.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for return borrowed sockets to their owning pool rather than disposing the pool. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_024_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i007",
      "questionId": "ood-n03-b08-i025",
      "learningObjective": "Unsubscribe callbacks that retain a shorter-lived component.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for unsubscribe callbacks that retain a shorter-lived component. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_025_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i008",
      "questionId": "ood-n03-b08-i026",
      "learningObjective": "Release attempt timers when success, failure, retry, or cancellation ends the attempt.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for release attempt timers when success, failure, retry, or cancellation ends the attempt. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_026_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i009",
      "questionId": "ood-n03-b08-i027",
      "learningObjective": "Delete partial artifacts when handoff to a caller never succeeds.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for delete partial artifacts when handoff to a caller never succeeds. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_027_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i010",
      "questionId": "ood-n03-b08-i028",
      "learningObjective": "Guarantee lock release on exceptional exits.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for guarantee lock release on exceptional exits. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_028_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i011",
      "questionId": "ood-n03-b08-i029",
      "learningObjective": "Have an owning wrapper dispose the inner resource it owns.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for have an owning wrapper dispose the inner resource it owns. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_029_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i012",
      "questionId": "ood-n03-b08-i030",
      "learningObjective": "Clean up an acquired stream when the owning write operation is cancelled.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for clean up an acquired stream when the owning write operation is cancelled. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b08_030_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i013",
      "questionId": "ood-n03-b08-i031",
      "learningObjective": "Enclose source and destination streams for the full copy operation.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The original item selected a generic ownership response. This replacement tests cleanup of both streams across a failed copy; the answer and required reasoning have changed.",
      "acceptedOptionId": "ood-n03-b08_031_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i014",
      "questionId": "ood-n03-b08-i032",
      "learningObjective": "Close lazy enumerator resources when a consumer stops early.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The original item selected a generic ownership response. This replacement tests closing a cursor when enumeration ends early; the answer and required reasoning have changed.",
      "acceptedOptionId": "ood-n03-b08_032_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i015",
      "questionId": "ood-n03-b08-i033",
      "learningObjective": "Release earlier acquisitions when a later acquisition fails.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The original item selected a generic ownership response. This replacement tests which successful acquisition must be released after a later open fails; the answer and required reasoning have changed.",
      "acceptedOptionId": "ood-n03-b08_033_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i016",
      "questionId": "ood-n03-b08-i034",
      "learningObjective": "Preserve the primary operation failure while reporting cleanup failure.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The original item selected a generic ownership response. This replacement tests preserving a primary operation error when cleanup also fails; the answer and required reasoning have changed.",
      "acceptedOptionId": "ood-n03-b08_034_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i017",
      "questionId": "ood-n03-b08-i035",
      "learningObjective": "Distinguish external handles requiring cleanup from ordinary managed data.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The original item selected a generic ownership response. This replacement distinguishes deterministic release of a native handle from ordinary managed data; the answer and required reasoning have changed.",
      "acceptedOptionId": "ood-n03-b08_035_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json",
      "beforeSourceSha256": "50490bc7ab0deb9b4d91580a8703612cc506e56dce6f06879aff2d4fbf75e667",
      "sourceSha256": "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B08",
      "beforeQuestionId": "ood-n03-b08-i018",
      "questionId": "ood-n03-b08-i036",
      "learningObjective": "Transfer resource ownership only after the handoff succeeds.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The original item selected a generic ownership response. This replacement tests the precise ownership transfer after a successful stream handoff; the answer and required reasoning have changed.",
      "acceptedOptionId": "ood-n03-b08_036_key",
      "sourceRefs": Object.freeze([
        "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose",
        "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i001",
      "questionId": "ood-n03-b09-i019",
      "learningObjective": "Expose a required parsing operation while keeping parser representation private.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for expose a required parsing operation while keeping parser representation private. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_019_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i002",
      "questionId": "ood-n03-b09-i020",
      "learningObjective": "Keep storage representation behind a client-facing amount contract.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep storage representation behind a client-facing amount contract. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_020_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i003",
      "questionId": "ood-n03-b09-i021",
      "learningObjective": "Translate provider failures to stable library-owned outcomes.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for translate provider failures to stable library-owned outcomes. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_021_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i004",
      "questionId": "ood-n03-b09-i022",
      "learningObjective": "Publish a view type that contains only supported client data.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for publish a view type that contains only supported client data. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_022_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i005",
      "questionId": "ood-n03-b09-i023",
      "learningObjective": "Keep a module helper private when no client contract requires it.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep a module helper private when no client contract requires it. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_023_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i006",
      "questionId": "ood-n03-b09-i024",
      "learningObjective": "Shape client access around the requested narrow capability.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for shape client access around the requested narrow capability. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_024_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i007",
      "questionId": "ood-n03-b09-i025",
      "learningObjective": "Preserve public behavior while refactoring internal stages.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for preserve public behavior while refactoring internal stages. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_025_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i008",
      "questionId": "ood-n03-b09-i026",
      "learningObjective": "Align actual TypeScript exports with the declared supported surface.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for align actual typescript exports with the declared supported surface. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_026_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i009",
      "questionId": "ood-n03-b09-i027",
      "learningObjective": "Enforce required validation through the public construction path.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for enforce required validation through the public construction path. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_027_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i010",
      "questionId": "ood-n03-b09-i028",
      "learningObjective": "Use explicit package exports to prevent accidental API exposure.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for use explicit package exports to prevent accidental api exposure. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_028_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i011",
      "questionId": "ood-n03-b09-i029",
      "learningObjective": "Preserve caller-relevant result distinctions while hiding transport codes.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for preserve caller-relevant result distinctions while hiding transport codes. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_029_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i012",
      "questionId": "ood-n03-b09-i030",
      "learningObjective": "Model meaningful omitted-versus-supplied option behavior explicitly.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for model meaningful omitted-versus-supplied option behavior explicitly. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_030_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i013",
      "questionId": "ood-n03-b09-i031",
      "learningObjective": "Translate vendor retry settings inside the adapter boundary.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for translate vendor retry settings inside the adapter boundary. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_031_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i014",
      "questionId": "ood-n03-b09-i032",
      "learningObjective": "Express the legal input set in the public API contract.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for express the legal input set in the public api contract. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_032_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i015",
      "questionId": "ood-n03-b09-i033",
      "learningObjective": "Keep internal optimization state out of the public representation.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep internal optimization state out of the public representation. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_033_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i016",
      "questionId": "ood-n03-b09-i034",
      "learningObjective": "Expose read-only progress without exposing a mutable internal state machine.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for expose read-only progress without exposing a mutable internal state machine. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_034_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i017",
      "questionId": "ood-n03-b09-i035",
      "learningObjective": "Keep caching behind a stable exported load operation.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for keep caching behind a stable exported load operation. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_035_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    }),
    Object.freeze({
      "sourceFile": "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B09.json",
      "beforeSourceSha256": "920e0b9b8fda16b007b72323594d431fe7b2ee09a5a01de0fc7a04b32172e8db",
      "sourceSha256": "a03c8e4fb5404b2e8568946a53c28da215777142acb12d506c48275af3e6ea80",
      "nodeId": "relationships_composition_ownership_lifecycle_and_dependencies",
      "mentalUnitId": "OOD-N03-B09",
      "beforeQuestionId": "ood-n03-b09-i018",
      "questionId": "ood-n03-b09-i036",
      "learningObjective": "Expose the stable operation while retaining replaceable implementations internally.",
      "identityAction": "replace_question_with_new_id",
      "identityReason": "The baseline keyed only generic owner_preserves_contract and lacked facts for expose the stable operation while retaining replaceable implementations internally. This revision makes that case-specific decision the accepted answer, so it uses the manifest candidate ID.",
      "acceptedOptionId": "ood-n03-b09_036_key",
      "sourceRefs": Object.freeze([
        "https://www.typescriptlang.org/docs/handbook/2/modules.html",
        "https://www.omg.org/spec/UML/2.5.1/PDF"
      ])
    })
  ]),
  "path": "evidence/business-quality/bizq-01-ood-node-closure-19.json"
});

const BIZQ01_OOD_COHORT20_PROOF = Object.freeze({
  path: "evidence/business-quality/bizq-01-ood-node-closure-20.json",
  sha256: "cb087c42a24d7a7f6ddbd922b05f379efab8f68e991587b30ee8bf51f0e1298d",
  descriptor: {
    "schemaVersion": "patternly-bizq-semantic-replacement-v1",
    "scope": "BIZQ-01 OOD source20, fixed nine-unit N04 cohort; 144 semantic replacements and 18 same-ID corrections; not full-bank acceptance",
    "trackId": "object-oriented-design-interview",
    "beforeProducerCommit": "98a7d0519005290cd2c0380d04b08a7b1bdebcde",
    "beforeContentVersion": "object-oriented-design-interview-authoring-v2026.10.04-bizq01-19a",
    "contentVersion": "object-oriented-design-interview-authoring-v2026.10.04-bizq01-20",
    "beforeQuestionSetSha256": "6f493ddd0ebfbbd5fa7acf98e17de69420360925f498791a683aca5f1d7f1f53",
    "questionSetSha256": "5b552f935cc3fa8bb142ccd38dc747a19a57823a8c7c8fd243fc786d43f0fe72",
    "sourceFiles": [
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01"
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02"
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03"
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04"
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05"
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06"
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07"
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08"
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09"
      }
    ],
    "replacements": [
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i001",
        "questionId": "ood-n04-b01-i019",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Separate caller capabilities when two workflows share identity reads but only one may change an assignment, while keeping storage replaceable.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old item was a generic owner slogan. This replacement asks which operations each of two specified clients may call while the persistence adapter remains replaceable.",
        "acceptedOptionId": "n04b01_01v2_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i002",
        "questionId": "ood-n04-b01-i020",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Keep consent checking and summary construction at the dispatch boundary while separating the desk’s submit capability from audit history access.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old key was a generic owner maxim; this item now tests a case-specific public contract and its observable outcome, so the primary learner decision and option meanings change.",
        "acceptedOptionId": "n04b01_02_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i003",
        "questionId": "ood-n04-b01-i021",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Submission should capture the versions once, and later readers should observe them without write access. An immutable command/result boundary keeps scoring separate from historical storage.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old key was a generic owner maxim; this item now tests a case-specific public contract and its observable outcome, so the primary learner decision and option meanings change.",
        "acceptedOptionId": "n04b01_03_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i004",
        "questionId": "ood-n04-b01-i022",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Preparation and approval are different capabilities. The approve operation can check the named actor and controls, while callers read status without assigning it.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old key was a generic owner maxim; this item now tests a case-specific public contract and its observable outcome, so the primary learner decision and option meanings change.",
        "acceptedOptionId": "n04b01_04_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i005",
        "questionId": "ood-n04-b01-i023",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Choose a stable public data projection that decouples clients from persistence fields and row layout.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The new primary decision is a stable projection versus exposing a persistence record/shape; it no longer tests the accepted annotation-replacement outcome.",
        "acceptedOptionId": "n04b01_05v2_projection",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i006",
        "questionId": "ood-n04-b01-i024",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Keep a resource screen’s access query separate from grant-management authority, including the explicit prohibition on extending expiry.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old key was a generic owner maxim; this item now tests a case-specific public contract and its observable outcome, so the primary learner decision and option meanings change.",
        "acceptedOptionId": "n04b01_06_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i007",
        "questionId": "ood-n04-b01-i025",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "The operation must bind the signer’s confirmation to a specific immutable revision and report mismatch without sealing. The caller should not manipulate revision bytes or storage.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old key was a generic owner maxim; this item now tests a case-specific public contract and its observable outcome, so the primary learner decision and option meanings change.",
        "acceptedOptionId": "n04b01_07_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i008",
        "questionId": "ood-n04-b01-i026",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Represent distinct payout statuses and their case-specific reference in a read-only lookup result without giving an observer transfer authority.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The learner now designs an observation result for a reconciliation screen: preserve distinct outcomes and the release reference. The accepted N01 payout item instead decides what a repeated command returns after a payout already exists.",
        "acceptedOptionId": "n04b01_08v2_query",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i009",
        "questionId": "ood-n04-b01-i027",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Passenger displays need derived answers, while the controller alone appends corrections. Query and command operations communicate those distinct needs without exposing the notice collection.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old key was a generic owner maxim; this item now tests a case-specific public contract and its observable outcome, so the primary learner decision and option meanings change.",
        "acceptedOptionId": "n04b01_09_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i010",
        "questionId": "ood-n04-b01-i028",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Expose stable search criteria as the caller contract and hide each replaceable index’s query syntax and field names behind the archive adapter.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The primary decision changes from advertising a subset-only search capability to hiding vendor query representation behind a stable criteria contract; the revised options use new IDs because their meanings changed.",
        "acceptedOptionId": "n04b01_10v4_criteria",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i011",
        "questionId": "ood-n04-b01-i029",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Both providers already meet the same input, output, and error shape, so a shared contract allows the stream to use either without provider-specific branches.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old key was a generic owner maxim; this item now tests a case-specific public contract and its observable outcome, so the primary learner decision and option meanings change.",
        "acceptedOptionId": "n04b01_11_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i012",
        "questionId": "ood-n04-b01-i030",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Expose a joint assignment swap as one operation and return the specific assignment that blocks it.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old question was generic; this keeps the same swap decision but makes its alternatives concrete and changes their option meanings.",
        "acceptedOptionId": "n04b01_12v2_swap",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i013",
        "questionId": "ood-n04-b01-i031",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "The route owner must decide whether the parent revision is still current and return both identities on conflict. The caller should submit intent, not replace geometry storage.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old key was a generic owner maxim; this item now tests a case-specific public contract and its observable outcome, so the primary learner decision and option meanings change.",
        "acceptedOptionId": "n04b01_13_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i014",
        "questionId": "ood-n04-b01-i032",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "The page needs to request a claim and display its result; the evaluator owns interpretation of current campaign state. The contract also prevents the claim path from editing quest completion.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old key was a generic owner maxim; this item now tests a case-specific public contract and its observable outcome, so the primary learner decision and option meanings change.",
        "acceptedOptionId": "n04b01_14_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i015",
        "questionId": "ood-n04-b01-i033",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Enforce the conditional carrier handoff and return enough failure detail for the dispatcher to request the needed correction.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old key was a generic owner maxim; this item now tests a case-specific public contract and its observable outcome, so the primary learner decision and option meanings change.",
        "acceptedOptionId": "n04b01_15_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i016",
        "questionId": "ood-n04-b01-i034",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Preview and posting have different observable effects, so the interface should name them separately. The posting operation can validate allocations without exposing balance storage.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old key was a generic owner maxim; this item now tests a case-specific public contract and its observable outcome, so the primary learner decision and option meanings change.",
        "acceptedOptionId": "n04b01_16_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i017",
        "questionId": "ood-n04-b01-i035",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Use a common polymorphic operation to process a mixed collection of extension-defined elements while preserving caller-owned sequence order.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "This replacement changes the learner decision from a completed-match rejection contract to polymorphic dispatch across extension-defined shapes; all answer choices express new meanings.",
        "acceptedOptionId": "n04b01_17v3_dispatch",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B01.json",
        "beforeSourceSha256": "3f7bfd0223ac5f8b67d343b8ec379240607e97cabd6f01afb6215aad9678fad6",
        "sourceSha256": "14689bf58bc6b5fc92e19b58f3ea6c030d0d876b9d7f7d0226639f1078b1a3ab",
        "beforeQuestionId": "ood-n04-b01-i018",
        "questionId": "ood-n04-b01-i036",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B01",
        "learningObjective": "Hide a changing pagination mechanism behind an opaque continuation value so callers can traverse large data without depending on storage position.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "This replacement changes the primary decision from segregating inspection and refund policy to hiding a changing pagination protocol behind an opaque cursor; all option meanings change.",
        "acceptedOptionId": "n04b01_18v3_cursor",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i001",
        "questionId": "ood-n04-b02-i019",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The policy varies per reservation while the caller’s operation stays constant. Delegating through the selected policy lets the corresponding implementation determine the transfer behavior.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_01_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i002",
        "questionId": "ood-n04-b02-i020",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The catalog has already selected a pricing policy, and both policies share the same input and output contract. Dispatching that operation on the selected policy keeps callers uniform.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_02_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i003",
        "questionId": "ood-n04-b02-i021",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "Both connector kinds answer the same question but use different rules. A polymorphic query lets the actual connector supply the validity behavior.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_03_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i004",
        "questionId": "ood-n04-b02-i022",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The sources have a common import operation but different source representations. Letting each implementation normalize its own fields keeps the pipeline stable and the archive record uniform.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_04_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i005",
        "questionId": "ood-n04-b02-i023",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The same usage facts are evaluated under a selected rule set, and the result has a shared shape. Dispatching evaluate on ClearancePolicy represents exactly that variation.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_05_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i006",
        "questionId": "ood-n04-b02-i024",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The job already calls one compatibility operation and the battery implementations differ only in the accepted mounts. Overriding that operation supplies behavior without a model branch.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_06_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i007",
        "questionId": "ood-n04-b02-i025",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "Both destinations accept the same summary and share an outcome contract. The destination object can handle its own transport while keeping the navigator’s call stable.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_07_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i008",
        "questionId": "ood-n04-b02-i026",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The attempt provides the same captured inputs while the selected policy changes only the scoring behavior. A common score operation on the policy keeps the result screen uniform.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_08_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i009",
        "questionId": "ood-n04-b02-i027",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "Both rules share the same input and output but evaluate it differently. Dispatch on a selected ApprovalRule keeps the queue from implementing policy branches.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_09_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i010",
        "questionId": "ood-n04-b02-i028",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The source format is the only varying behavior and the mapper already depends on a common decoded result. A selected decoder isolates format handling before the shared workflow.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_10_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i011",
        "questionId": "ood-n04-b02-i029",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The grants share a query but define effectiveness differently. Implementing that query per grant keeps the access checker independent of grant kind and representation.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_11_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i012",
        "questionId": "ood-n04-b02-i030",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The signing request and reconciliation outcomes have a common contract even though transports differ. A Signer operation lets the workflow reconcile Unknown without parsing provider internals.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_12_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i013",
        "questionId": "ood-n04-b02-i031",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "Both processors accept the same stable payout identity and produce a common outcome. A selected processor can encapsulate the provider-specific request details.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_13_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i014",
        "questionId": "ood-n04-b02-i032",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The notice variants share an application operation but have different effects on the board. Dispatching that operation by notice subtype keeps passenger callers uniform.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_14_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i015",
        "questionId": "ood-n04-b02-i033",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "Both meters answer the same capability question but support different interval forms. A common query can return the required available/unsupported outcome through runtime dispatch.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_15_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i016",
        "questionId": "ood-n04-b02-i034",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The provider’s request format varies, while the stream caller’s chunk/result expectation stays fixed. Translation belongs inside the selected provider implementation.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_16_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i017",
        "questionId": "ood-n04-b02-i035",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "The swap operation is common but eligibility has one subtype-specific condition. Dispatching the check on the assignment preserves the manager’s single call and the specialized rule.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_17_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B02.json",
        "beforeSourceSha256": "39dc806cd5ad144ae86cd60b9c312d211fe9edb34dc93385a8e2d1ec0c8499b6",
        "sourceSha256": "07dc546ab1fe0b27faf59b90415dce6d19c5f84fb3d9e0b5d9b9367089540027",
        "beforeQuestionId": "ood-n04-b02-i018",
        "questionId": "ood-n04-b02-i036",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B02",
        "learningObjective": "Both routes share the same edit/result contract; the constrained subtype adds a specific acceptance condition. Implementing that condition in apply keeps the map client uniform.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic ownership maxim is replaced by a specific shared operation and implementation-variation decision; the primary meaning and all option meanings change.",
        "acceptedOptionId": "n04b02_18_dispatch",
        "sourceRefs": [
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12",
          "https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i001",
        "questionId": "ood-n04-b03-i019",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "A caller that obeys ReportSource’s valid-interval contract must not need a subtype-specific range check. The archive subtype should accept that same input range and preserve the promised outcome.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_01_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i002",
        "questionId": "ood-n04-b03-i020",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "Queue callers rely on FIFO removal and the defined Empty result. A priority-based behavior changes the core postcondition and should use a distinct contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_02_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i003",
        "questionId": "ood-n04-b03-i021",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "Saved is a caller-visible guarantee of durability at return time. A subtype must not weaken that guarantee by acknowledging before it holds.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_03_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i004",
        "questionId": "ood-n04-b03-i022",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "The base contract scopes removal to one stable ID and reports completion. A remote implementation must preserve that scope despite its provider’s broader operation.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_04_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i005",
        "questionId": "ood-n04-b03-i023",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "The base defines a stable repeat-call outcome and no state change. The legacy implementation must report that same ordinary result instead of throwing.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_05_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i006",
        "questionId": "ood-n04-b03-i024",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "The caller is entitled to request a quote without changing account or order state. A premium implementation must preserve that no-side-effect guarantee.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_06_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i007",
        "questionId": "ood-n04-b03-i025",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "The contract ties RetryableFailure to a retained message and a retry path. Swallowing failure as Delivered misreports the externally observable outcome.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_07_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i008",
        "questionId": "ood-n04-b03-i026",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "Each open has a per-reader initial-position and independence guarantee. A shared mutable cursor allows later opens to change an existing reader’s observable state.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_08_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i009",
        "questionId": "ood-n04-b03-i027",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "ClockSource promises a monotone sequence to its callers, not a raw wall reading. The replacement must preserve that guarantee even when the underlying source moves backward.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_09_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i010",
        "questionId": "ood-n04-b03-i028",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "The base accepts all positive quantities, so a subtype cannot impose a minimum threshold. It must preserve the accepted input domain and defined stock result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_10_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i011",
        "questionId": "ood-n04-b03-i029",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "Callers rely on both the total and its reconcilable jurisdiction lines. The flat-rate implementation must preserve that result structure and equality invariant.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_11_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i012",
        "questionId": "ood-n04-b03-i030",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "The contract covers supported text-only documents and requires rendered output. The compact renderer cannot turn absence of images into an unsupported or empty result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_12_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i013",
        "questionId": "ood-n04-b03-i031",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "Closed means the session will not accept later edits, and pending work must be accounted for. The autosaving subtype cannot make the terminal state provisional.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_13_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i014",
        "questionId": "ood-n04-b03-i032",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "Weight can affect whether a carrier is available, but it does not make a base-valid shipment invalid. The subtype should return the defined unavailable outcome rather than reject the call.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_14_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i015",
        "questionId": "ood-n04-b03-i033",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "Preserve both the complete-acceptance and no-commit retry postconditions when a chunk upload cannot fit.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_15_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i016",
        "questionId": "ood-n04-b03-i034",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "Stored guarantees that the newly supplied value is what a subsequent read returns. A write-once variant cannot report that outcome when it silently keeps an earlier value.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_16_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i017",
        "questionId": "ood-n04-b03-i035",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "Preserve a batch method’s one-result-per-input, order, and identity postconditions when replacing its implementation.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "This replaces the stable-request retry decision with a distinct batch substitutability decision about one-to-one ordered outputs; the new choices carry different semantics.",
        "acceptedOptionId": "n04b03_17v2_cardinality",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B03.json",
        "beforeSourceSha256": "0db38c86bde7d00ee5d8740deb9f81b5a269ed17848dd050a953cce88ea3d2e9",
        "sourceSha256": "df3d74abef8658fe3a038af2975644dea70240e549da3c84d0b6358dc27cd770",
        "beforeQuestionId": "ood-n04-b03-i018",
        "questionId": "ood-n04-b03-i036",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B03",
        "learningObjective": "Predict is specified as a read-like operation over fixed model state. Online learning is a distinct behavior and should not be added invisibly to a subtype implementation.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The old generic owner response is replaced by a concrete contract comparison; its accepted decision and option meanings change.",
        "acceptedOptionId": "n04b03_18_contract",
        "sourceRefs": [
          "https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.5"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i001",
        "questionId": "ood-n04-b04-i019",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "The three clients need distinct operations and have explicit authority boundaries. Role-specific interfaces let each depend only on the methods it actually uses.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_01_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i002",
        "questionId": "ood-n04-b04-i020",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "The administrator changes grants; the door only asks for an active-status answer. Separate contracts make the door’s dependency read-only.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_02_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i003",
        "questionId": "ood-n04-b04-i021",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "Creation and tracking have different permitted operations. Separate the creation command from the read-only tracking query so tracking cannot change the record.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_03_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i004",
        "questionId": "ood-n04-b04-i022",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "The scheduler decides and commits a move; the worker sends a confirmation afterward. Separate operation contracts keep scheduling independent of provider details.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_04_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i005",
        "questionId": "ood-n04-b04-i023",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "The operator needs command authority, while the monitor only observes. Distinct interfaces preserve the controller’s safety check and make monitoring read-only.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_05_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i006",
        "questionId": "ood-n04-b04-i024",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "Editors change published content; learners read the active revision and record progress. Separate client-facing interfaces avoid giving either role unrelated methods.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_06_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i007",
        "questionId": "ood-n04-b04-i025",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "Editing and export have separate permissions and responsibilities. The exporter reads a stable snapshot while the editor controls changes and close.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_07_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i008",
        "questionId": "ood-n04-b04-i026",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "Agents need internal commands; customers need a limited public view. Separate those contracts so private notes and management operations do not leak to readers.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_08_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i009",
        "questionId": "ood-n04-b04-i027",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "The seller owns draft changes and publication; the storefront only reads published results. Distinct interfaces make that capability boundary explicit.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_09_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i010",
        "questionId": "ood-n04-b04-i028",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "Fulfillment needs a state-changing split operation; the customer only needs a public projection. The interfaces should reflect that difference without exposing vendor allocation to the portal.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_10_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i011",
        "questionId": "ood-n04-b04-i029",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "The transfer has distinct initiator and recipient actions with different authority. Separate capabilities let the recipient make only its decision without editing plot state.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_11_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i012",
        "questionId": "ood-n04-b04-i030",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "Catalog editing and checkout consumption are distinct roles. Publishing is the boundary that exposes a computed read-only version to checkout.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_12_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i013",
        "questionId": "ood-n04-b04-i031",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "Separate the operator’s reservation commands from analytics’ aggregate-count query and keep individual reservation records outside the analytics contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_13_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i014",
        "questionId": "ood-n04-b04-i032",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "Curators change metadata and provenance; search clients consume only approved identity and tags. Separate contracts preserve the editing boundary and limit what search depends on.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_14_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i015",
        "questionId": "ood-n04-b04-i033",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "Analysts make approvals; downloads consume the authorization result. Separate mutation and query interfaces stop download code from becoming an approval client.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_15_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i016",
        "questionId": "ood-n04-b04-i034",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "Technicians perform replacement; planners only need a compatibility decision. Separate interfaces reflect those roles while the maintenance owner controls assignment changes.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_16_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i017",
        "questionId": "ood-n04-b04-i035",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "The navigator owns consent-checked dispatch, while the specialist needs only the transmitted summary and an acknowledgement. Separate contracts prevent the recipient from gaining internal referral access.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_17_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B04.json",
        "beforeSourceSha256": "7bb3641b4c6f351012823e1e46dc41150a53741849b962263a1e377376f7c9fb",
        "sourceSha256": "111104dbb3d8b2c1d09c49d824a23719808a194bd4d53842cc573724df003f55",
        "beforeQuestionId": "ood-n04-b04-i018",
        "questionId": "ood-n04-b04-i036",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B04",
        "learningObjective": "Editors version content and policy; learners create attempts and consume results. Separate contracts keep learner actions from changing the rules they are scored under.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The former generic owner maxim is replaced by a concrete client-contract partition; the primary decision and option meanings change.",
        "acceptedOptionId": "n04b04_18_roles",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces",
          "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i001",
        "questionId": "ood-n04-b06-i019",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i001_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i002",
        "questionId": "ood-n04-b06-i020",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i002_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i003",
        "questionId": "ood-n04-b06-i021",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i003_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i004",
        "questionId": "ood-n04-b06-i022",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i004_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i005",
        "questionId": "ood-n04-b06-i023",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i005_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i006",
        "questionId": "ood-n04-b06-i024",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i006_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i007",
        "questionId": "ood-n04-b06-i025",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i007_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i008",
        "questionId": "ood-n04-b06-i026",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i008_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i009",
        "questionId": "ood-n04-b06-i027",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i009_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i010",
        "questionId": "ood-n04-b06-i028",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i010_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i011",
        "questionId": "ood-n04-b06-i029",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i011_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i012",
        "questionId": "ood-n04-b06-i030",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i012_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i013",
        "questionId": "ood-n04-b06-i031",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i013_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i014",
        "questionId": "ood-n04-b06-i032",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i014_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i015",
        "questionId": "ood-n04-b06-i033",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i015_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i016",
        "questionId": "ood-n04-b06-i034",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i016_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i017",
        "questionId": "ood-n04-b06-i035",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i017_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B06.json",
        "beforeSourceSha256": "2477b13c36100959c64b312ffe2c29ffe45c75f4d18a5abd5a404a59b7c15108",
        "sourceSha256": "ae0a8306d017225a899a8aa7b4038eca836550c51c702a9c9e3c49fd1c30eef0",
        "beforeQuestionId": "ood-n04-b06-i018",
        "questionId": "ood-n04-b06-i036",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B06",
        "learningObjective": "Design a focused extension, callback, or registration boundary that preserves the stable state owner and the case’s replacement, failure, scope, or lifecycle contract.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to where an extension varies, how registration/callback lifecycle works, and which authority retains state transitions.",
        "acceptedOptionId": "n04b06_i018_extension_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i001",
        "questionId": "ood-n04-b07-i019",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i001_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/creating-variant-generic-interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i002",
        "questionId": "ood-n04-b07-i020",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i002_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i003",
        "questionId": "ood-n04-b07-i021",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i003_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces",
          "https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i004",
        "questionId": "ood-n04-b07-i022",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i004_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/creating-variant-generic-interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i005",
        "questionId": "ood-n04-b07-i023",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i005_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces",
          "https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i006",
        "questionId": "ood-n04-b07-i024",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i006_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i007",
        "questionId": "ood-n04-b07-i025",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i007_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i008",
        "questionId": "ood-n04-b07-i026",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i008_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i009",
        "questionId": "ood-n04-b07-i027",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i009_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i010",
        "questionId": "ood-n04-b07-i028",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i010_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i011",
        "questionId": "ood-n04-b07-i029",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i011_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i012",
        "questionId": "ood-n04-b07-i030",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i012_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces",
          "https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i013",
        "questionId": "ood-n04-b07-i031",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i013_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces",
          "https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i014",
        "questionId": "ood-n04-b07-i032",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i014_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i015",
        "questionId": "ood-n04-b07-i033",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i015_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/creating-variant-generic-interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i016",
        "questionId": "ood-n04-b07-i034",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i016_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i017",
        "questionId": "ood-n04-b07-i035",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select C# generic variance or type constraints from the actual type-parameter positions, required operations, and stated caller compatibility.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen source asks the learner to place an ordinary domain invariant in an owner/coordinator. This candidate instead asks for a C# generic variance/bound decision over explicitly stated typed contracts, which changes the primary decision and answer archetype.",
        "acceptedOptionId": "n04b07_i017_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/creating-variant-generic-interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B07.json",
        "beforeSourceSha256": "0f617c1b70947c885f267fc6c6d8e72514f5f56e6deb3b27fff099252745593c",
        "sourceSha256": "17e336e71bc3690f9c2bf6d0783099261662fb5551f8e2d942df22948bee217f",
        "beforeQuestionId": "ood-n04-b07-i018",
        "questionId": "ood-n04-b07-i036",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B07",
        "learningObjective": "Select independent variance directions for generic type parameters from their distinct input and output positions.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to independent C# variance directions for two interface type parameters.",
        "acceptedOptionId": "n04b07_i018_typed_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/creating-variant-generic-interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i001",
        "questionId": "ood-n04-b08-i019",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i001_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i002",
        "questionId": "ood-n04-b08-i020",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i002_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i003",
        "questionId": "ood-n04-b08-i021",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i003_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i004",
        "questionId": "ood-n04-b08-i022",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i004_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i005",
        "questionId": "ood-n04-b08-i023",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i005_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i006",
        "questionId": "ood-n04-b08-i024",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i006_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i007",
        "questionId": "ood-n04-b08-i025",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i007_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i008",
        "questionId": "ood-n04-b08-i026",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i008_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i009",
        "questionId": "ood-n04-b08-i027",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i009_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i010",
        "questionId": "ood-n04-b08-i028",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i010_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i011",
        "questionId": "ood-n04-b08-i029",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i011_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i012",
        "questionId": "ood-n04-b08-i030",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i012_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i013",
        "questionId": "ood-n04-b08-i031",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i013_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i014",
        "questionId": "ood-n04-b08-i032",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i014_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i015",
        "questionId": "ood-n04-b08-i033",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i015_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i016",
        "questionId": "ood-n04-b08-i034",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to selecting the scope and shape of a capability/marker contract, with explicit caller data and operation semantics.",
        "acceptedOptionId": "n04b08_i016_capability_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i017",
        "questionId": "ood-n04-b08-i035",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks how inspection evidence relates to refund eligibility. This candidate changes the decision to exposing an optional pair-specific copy operation while keeping the shared storage contract usable by unchanged CPU-only adapters.",
        "acceptedOptionId": "n04b08_i035_capability",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B08.json",
        "beforeSourceSha256": "65c6a41268a5811228653ce540d77069b9a5247ca98742f6fa55a07e6ea0977a",
        "sourceSha256": "431555e485c0362703faa4bcd660ad8627774bd6d02619d12520d35d53caf183",
        "beforeQuestionId": "ood-n04-b08-i018",
        "questionId": "ood-n04-b08-i036",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B08",
        "learningObjective": "Distinguish a type-category marker from a behavioral capability by matching the interface contract to the caller’s actual decision, authority, inputs, and result.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks how published experiment snapshots retain source provenance. This candidate changes the decision to reporting cancellation versus already-published completion when an asynchronous export races its commit, with cleanup owned by the job worker.",
        "acceptedOptionId": "n04b08_i036_capability",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i001",
        "questionId": "ood-n04-b09-i019",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i001_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i002",
        "questionId": "ood-n04-b09-i020",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i002_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/inheritance",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i003",
        "questionId": "ood-n04-b09-i021",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i003_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/inheritance"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i004",
        "questionId": "ood-n04-b09-i022",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i004_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/inheritance",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i005",
        "questionId": "ood-n04-b09-i023",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i005_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i006",
        "questionId": "ood-n04-b09-i024",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i006_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/interface-implementation/default-interface-methods-versions",
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i007",
        "questionId": "ood-n04-b09-i025",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i007_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i008",
        "questionId": "ood-n04-b09-i026",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i008_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/inheritance",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i009",
        "questionId": "ood-n04-b09-i027",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i009_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i010",
        "questionId": "ood-n04-b09-i028",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i010_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/inheritance",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i011",
        "questionId": "ood-n04-b09-i029",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i011_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/interface-implementation/default-interface-methods-versions"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i012",
        "questionId": "ood-n04-b09-i030",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i012_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i013",
        "questionId": "ood-n04-b09-i031",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i013_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/inheritance",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i014",
        "questionId": "ood-n04-b09-i032",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i014_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/inheritance",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i015",
        "questionId": "ood-n04-b09-i033",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i015_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/interface-implementation/default-interface-methods-versions",
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i016",
        "questionId": "ood-n04-b09-i034",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i016_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i017",
        "questionId": "ood-n04-b09-i035",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i017_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/inheritance",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B09.json",
        "beforeSourceSha256": "0bd009721c5ee62baeac7655e204fbcf852c3222c956feb8b286dc9594b63461",
        "sourceSha256": "f51418182cf1beee23a947de3f67771bddfd023a5e6599350c6be63e9b15a87c",
        "beforeQuestionId": "ood-n04-b09-i018",
        "questionId": "ood-n04-b09-i036",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B09",
        "learningObjective": "Choose an abstract base, interface capability, or default member from the actual shared state/behavior, hierarchy constraints, and safe fallback available to current clients.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "replace_question_with_new_id",
        "identityReason": "The frozen item asks for an ordinary domain invariant to be assigned to an owner. This candidate changes the primary decision to choosing a type-contract implementation/evolution mechanism from explicit class hierarchy, shared state, compatibility, and default-behavior facts.",
        "acceptedOptionId": "n04b09_i018_type_tradeoff",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/inheritance",
          "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/interfaces"
        ]
      }
    ],
    "sameIdCorrections": [
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i001",
        "questionId": "ood-n04-b05-i001",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (Two payment gateways return different response classes and error enums; either gateway can be selected by deployment, while the renewal rule changes only with subscription policy.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_001_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i002",
        "questionId": "ood-n04-b05-i002",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (A bureau SDK is being replaced and each bureau names income verification differently; the threshold and denial meaning remain fixed across both providers.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_002_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i003",
        "questionId": "ood-n04-b05-i003",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (Two carrier APIs encode arrival states and timestamps differently; the delivery rule uses the same comparison for both carriers and may not inspect raw payloads.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_003_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i004",
        "questionId": "ood-n04-b05-i004",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (The clinic directory can be local or hosted, and both return a provider-specific specialty code; the rule’s two checks are unchanged.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_004_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i005",
        "questionId": "ood-n04-b05-i005",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (A new ledger vendor changes its decimal and line-item classes; the approval invariant and rounding policy stay owned by the billing team.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_005_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i006",
        "questionId": "ood-n04-b05-i006",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (Notice records arrive from two content platforms with different field names; the required-notice list is release policy and remains identical.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_006_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i007",
        "questionId": "ood-n04-b05-i007",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (The policy limit is reviewed with insurance terms; the carrier’s package and currency types are replaced next quarter, while carrier adapters already normalize currency.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_007_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i008",
        "questionId": "ood-n04-b05-i008",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (Two scoring vendors use unrelated response classes and band labels; both adapters can map their documented bands to the same policy vocabulary.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_008_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i009",
        "questionId": "ood-n04-b05-i009",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (One deployment reads retention dates from a local file and another from a settings service; the policy calendar and deletion rule do not vary by deployment.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_009_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i010",
        "questionId": "ood-n04-b05-i010",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (Availability comes from either a venue database or a partner inventory API; both can return occupied intervals, while booking owns overlap semantics.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_010_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i011",
        "questionId": "ood-n04-b05-i011",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (The moderation SDK is being replaced; SDK labels differ, but the editorial team owns the prohibited labels and both adapters can map reviewed outcomes.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_011_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i012",
        "questionId": "ood-n04-b05-i012",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (Verification comes from an internal reviewer tool or an external document service; each reports document kinds differently, while grant requirements are fixed by the program.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_012_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i013",
        "questionId": "ood-n04-b05-i013",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (Two policy-administration systems use different date and status enums; the coverage interval semantics are set by the insurer and remain the same.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_013_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i014",
        "questionId": "ood-n04-b05-i014",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (Retail systems use different product-category codes; warranty terms are fixed by the manufacturer, and each retailer can map its codes to the manufacturer’s family list.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_014_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i015",
        "questionId": "ood-n04-b05-i015",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (Income and debt values come from two finance connectors with distinct DTOs; the loan product defines the ratio and both connectors expose the same dated amounts after conversion.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_015_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i016",
        "questionId": "ood-n04-b05-i016",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (Credential timestamps arrive from two badge vendors; the security policy defines expiry as a timestamp comparison and vendor adapters can normalize timestamps to UTC.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_016_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i017",
        "questionId": "ood-n04-b05-i017",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (One settlement service reports a status enum and another reports event records; both adapters can produce the two facts, and payout policy owns the release rule.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_017_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      },
      {
        "sourceFile": "content/object-oriented-design-interview/interfaces_polymorphism_substitution_and_extensibility/OOD-N04-B05.json",
        "beforeSourceSha256": "1f617f0282d8284dfcef1569f7504efb200ce040722c36c7f64425d063294a75",
        "sourceSha256": "87d3159243ad32fcf4739799478a69b2f8d9eb22994a9a2b701ecaa2752e5950",
        "beforeQuestionId": "ood-n04-b05-i018",
        "questionId": "ood-n04-b05-i018",
        "nodeId": "interfaces_polymorphism_substitution_and_extensibility",
        "mentalUnitId": "OOD-N04-B05",
        "learningObjective": "Choose dependency direction and contract ownership so stable policy depends on policy-meaningful inputs while volatile mechanisms translate their own representations.",
        "confirmedDefects": [
          "Visible case facts do not establish the declared unit decision; generic alternatives and feedback (preflight whole-object review)."
        ],
        "identityAction": "preserve_question_id",
        "identityReason": "The frozen lens still asks for the dependency boundary; these facts now make the same policy-versus-mechanism decision concrete (Consent records are stored in either a regional database or a hosted consent service; both are translated to the same purpose and decision time, while the privacy rule owns purpose matching.). New option identities bind this item-specific wording.",
        "acceptedOptionId": "n04b05_018_policy_contract",
        "sourceRefs": [
          "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure/architectural-principles"
        ]
      }
    ]
  }
});

const BIZQ01_OOD_REASON_AMENDMENT_19A_PROOF = Object.freeze({
  path: "evidence/business-quality/bizq-01-ood-reason-amendment-19a.json",
  sha256: "4d964e0a09690ba4b12382b11e9d9a5917069bbb6bbfe953f157aab5c1b7debb",
  schemaVersion: "patternly-bizq01-ood-reason-amendment-v1",
  scope: "bizq-01-ood-reason-amendment-19a",
  trackId: "object-oriented-design-interview",
  beforeProducerCommit: "1d024bb62328bdb81490d713dc41a6f7d155e9b6",
  beforeContentVersion: "object-oriented-design-interview-authoring-v2026.10.04-bizq01-19",
  contentVersion: "object-oriented-design-interview-authoring-v2026.10.04-bizq01-19a",
  beforeQuestionSetSha256: "b3198cffb61cad65233b0dee7bf308830d53a6adbf0cd6ceac00ffff5fb665a5",
  questionSetSha256: "6f493ddd0ebfbbd5fa7acf98e17de69420360925f498791a683aca5f1d7f1f53",
  sourceFiles: Object.freeze([
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", beforeSourceSha256: "c578f0d66d3bbbf0c3f76da302ad27c3f6339573bca6fdff3e3a1f00041859f3", sourceSha256: "30a103966dbfd6fb44271b1b15f09f1c71248b213d8a4c4b3ad89d98ab28c597", nodeId: "relationships_composition_ownership_lifecycle_and_dependencies", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json", beforeSourceSha256: "ba18ba56cfbacee3a5f27bde8261e7398074b1ff506b1b6100a1e1f9f1ac6ed5", sourceSha256: "2af1b7be2536fd420022e0c50e6d01935a9206990529f603db3f7e48ab13e62c", nodeId: "relationships_composition_ownership_lifecycle_and_dependencies", mentalUnitId: "OOD-N03-B03" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json", beforeSourceSha256: "fc5e6d5a64bc34054bedfd0a6d6ba9b6689a5d99f43d7b640bc14832970853e8", sourceSha256: "bdbab1f296a2816fdc91d64dca06d38b982d001365e27ec3f7bbef3ff5fbb0c1", nodeId: "relationships_composition_ownership_lifecycle_and_dependencies", mentalUnitId: "OOD-N03-B08" })
  ]),
  replacements: Object.freeze([
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i019", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i020", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i021", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i022", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i023", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i024", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i025", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i026", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i027", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i028", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i029", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i030", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i031", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i033", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i034", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B02.json", questionId: "ood-n03-b02-i036", mentalUnitId: "OOD-N03-B02" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json", questionId: "ood-n03-b03-i019", mentalUnitId: "OOD-N03-B03" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json", questionId: "ood-n03-b03-i020", mentalUnitId: "OOD-N03-B03" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json", questionId: "ood-n03-b03-i021", mentalUnitId: "OOD-N03-B03" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json", questionId: "ood-n03-b03-i023", mentalUnitId: "OOD-N03-B03" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json", questionId: "ood-n03-b03-i028", mentalUnitId: "OOD-N03-B03" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json", questionId: "ood-n03-b03-i030", mentalUnitId: "OOD-N03-B03" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json", questionId: "ood-n03-b03-i032", mentalUnitId: "OOD-N03-B03" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B03.json", questionId: "ood-n03-b03-i033", mentalUnitId: "OOD-N03-B03" }),
    Object.freeze({ sourceFile: "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies/OOD-N03-B08.json", questionId: "ood-n03-b08-i021", mentalUnitId: "OOD-N03-B08" })
  ])
});

const BIZQ01_OOD_COHORT20_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "replacements", "sameIdCorrections"];
const BIZQ01_OOD_COHORT20_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"];
const BIZQ01_OOD_COHORT20_ITEM_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "confirmedDefects", "identityAction", "identityReason", "acceptedOptionId", "sourceRefs", "beforeQuestion", "currentQuestion"];
const BIZQ01_OOD_REASON_AMENDMENT_19A_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "replacements"];
const BIZQ01_OOD_REASON_AMENDMENT_19A_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"];
const BIZQ01_OOD_REASON_AMENDMENT_19A_ITEM_KEYS = ["sourceFile", "questionId", "mentalUnitId", "beforeReason", "reason", "beforeQuestionSha256", "questionSha256"];
const OOD_REASON_AMENDMENT_19A_PRIVATE_CONTEXT = Symbol("fixed OOD reason amendment 19a historical source context");

const BIZQ01_OOD_COHORT17_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "identityAction", "identityReason", "confirmedDefects", "replacements"];
const BIZQ01_OOD_COHORT17_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"];

const BIZQ01_OOD_COHORT16_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "identityAction", "identityReason", "confirmedDefects", "replacements"];
const BIZQ01_OOD_COHORT16_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"];

async function validateBizq01OodCohort16Proof(contentRoot, canonical, evidence) {
  const accepted = BIZQ01_OOD_COHORT16_PROOF;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  const proof = await readJson(proofPath, label);
  exactKeys(proof, BIZQ01_OOD_COHORT16_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "identityAction", "identityReason"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  if (canonicalJson(proof.confirmedDefects) !== canonicalJson(accepted.confirmedDefects)) {
    fail("EVIDENCE_VALUE", `${label}.confirmedDefects differ from the fixed cohort descriptor.`);
  }
  assertHash(proof.beforeQuestionSetSha256, `${label}.beforeQuestionSetSha256`);
  assertHash(proof.questionSetSha256, `${label}.questionSetSha256`);
  if (canonical.catalogByTrack.get(accepted.trackId)?.contentVersion !== accepted.contentVersion) {
    fail("EVIDENCE_VALUE", `${label}.contentVersion does not match the current catalog.`);
  }
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from the fixed cohort descriptor.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the seven fixed source files.`);
  }
  const sourcesByPath = new Map();
  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT16_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_COHORT16_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed cohort descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const sourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    if (sha256(sourceBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current source hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const descriptorItems = accepted.replacements.filter((item) => item.sourceFile === source.sourceFile);
    const expectedIds = descriptorItems.map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the 17 fixed current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceById = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes an item outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains a question with a different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source question differs from current canonical content.`);
      }
    }
    sourcesByPath.set(source.sourceFile, { sourcePath, questions, sourceById });
  }
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== accepted.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the fixed 119 replacements.`);
  }
  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  const oldRowsById = new Map(evidence.rowsByTrack.get(accepted.trackId).map((row) => [row.questionId, row]));
  const oldIds = new Set();
  const newIds = new Set();
  const oldOptionIds = new Set();
  const currentOptionIds = new Set();
  const replacements = [];
  for (const [index, item] of accepted.replacements.entries()) {
    const entry = proof.replacements[index];
    const itemLabel = `${label}.replacements[${index}]`;
    exactKeys(entry, BIZQ01_OOD_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "acceptedOptionId"]) {
      if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed replacement map.`);
    }
    const source = accepted.sourceFiles.find((candidate) => candidate.sourceFile === item.sourceFile);
    if (!source || entry.beforeSourceSha256 !== source.beforeSourceSha256 || entry.sourceSha256 !== source.sourceSha256) {
      fail("EVIDENCE_VALUE", `${itemLabel} source hashes do not match the fixed source file.`);
    }
    if (entry.identityAction !== accepted.identityAction || entry.identityReason !== accepted.identityReason ||
        canonicalJson(entry.confirmedDefects) !== canonicalJson(accepted.confirmedDefects) ||
        canonicalJson(entry.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_VALUE", `${itemLabel} identity action, defect record, or source references differ from the fixed review.`);
    }
    const oldQuestion = entry.beforeQuestion;
    const currentQuestion = currentById.get(item.questionId);
    const oldRow = oldRowsById.get(item.beforeQuestionId);
    const sourceData = sourcesByPath.get(item.sourceFile);
    if (!oldQuestion || !currentQuestion || !oldRow || !sourceData || currentById.has(item.beforeQuestionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must bind a removed historical item to one current replacement.`);
    }
    if (oldIds.has(item.beforeQuestionId) || newIds.has(item.questionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} duplicates a historical or current replacement identity.`);
    }
    oldIds.add(item.beforeQuestionId);
    newIds.add(item.questionId);
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== item.beforeQuestionId || oldQuestion.trackId !== accepted.trackId ||
        oldQuestion.nodeId !== item.nodeId || oldQuestion.mentalUnitId !== item.mentalUnitId ||
        currentQuestion.questionId !== item.questionId || currentQuestion.trackId !== accepted.trackId ||
        currentQuestion.nodeId !== item.nodeId || currentQuestion.mentalUnitId !== item.mentalUnitId ||
        canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed taxonomy or current authored object.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the old question.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
        currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId ||
        canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed interaction, scoring, accepted option, or primary references.`);
    }
    const priorOptionIds = new Set(oldQuestion.interaction.options.map((option) => option.optionId));
    const newQuestionOptionIds = currentQuestion.interaction.options.map((option) => option.optionId);
    if (new Set(newQuestionOptionIds).size !== newQuestionOptionIds.length || newQuestionOptionIds.some((optionId) => priorOptionIds.has(optionId))) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must use unique option identities that were not assigned to its retired item.`);
    }
    for (const option of oldQuestion.interaction.options) oldOptionIds.add(option.optionId);
    for (const optionId of newQuestionOptionIds) currentOptionIds.add(optionId);
    const sourceQuestion = sourceData.sourceById.get(item.questionId);
    if (!sourceQuestion || canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) {
      fail("HASH_MISMATCH", `${itemLabel} source item differs from current canonical content.`);
    }
    replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: item.beforeQuestionId, questionId: item.questionId });
  }
  if ([...currentOptionIds].some((optionId) => oldOptionIds.has(optionId))) {
    fail("EVIDENCE_MEMBERSHIP", `${label} reuses an option identity from the retired cohort.`);
  }

  for (const source of accepted.sourceFiles) {
    const sourceData = sourcesByPath.get(source.sourceFile);
    const sourceReplacements = replacements.filter((item) => {
      const descriptor = accepted.replacements.find((candidate) => candidate.questionId === item.questionId);
      return descriptor?.sourceFile === source.sourceFile;
    });
    const currentSourceIds = new Set(sourceReplacements.map((item) => item.questionId));
    const predecessorQuestions = sourceData.questions
      .filter((question) => !currentSourceIds.has(question.questionId))
      .concat(sourceReplacements.map((item) => item.oldQuestion))
      .sort((left, right) => compare(left.questionId, right.questionId));
    const predecessorBytes = Buffer.from(JSON.stringify(predecessorQuestions), "utf8");
    if (sha256(predecessorBytes) !== source.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct the byte-exact v13 predecessor source ${source.sourceFile}.`);
    }
  }
  const reconstructedTrackQuestions = currentTrackQuestions
    .filter((question) => !newIds.has(question.questionId))
    .concat(replacements.map((item) => item.oldQuestion))
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (reconstructedTrackQuestions.length !== currentTrackQuestions.length ||
      sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) {
    fail("HASH_MISMATCH", `${label} does not reconstruct the fixed v13 OOD question set.`);
  }
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
      ? { ...track, contentVersion: accepted.beforeContentVersion }
      : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  for (const item of replacements) {
    predecessorLocations.delete(item.questionId);
    predecessorLocations.set(item.beforeQuestionId, {
      trackId: accepted.trackId,
      nodeId: item.oldQuestion.nodeId,
      mentalUnitId: item.oldQuestion.mentalUnitId,
      path: sourcesByPath.get(accepted.replacements.find((candidate) => candidate.questionId === item.questionId).sourceFile).sourcePath
    });
  }
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions),
    questionLocations: predecessorLocations
  };
  const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence);
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged source13, source12, and source11 proofs for historical validation.`);
  return { trackId: accepted.trackId, replacements: [...predecessor.replacements, ...replacements] };
}


async function validateBizq01OodCohort17Proof(contentRoot, canonical, evidence) {
  return validateBizq01OodClosedCohortProof(contentRoot, canonical, evidence, BIZQ01_OOD_COHORT17_PROOF);
}

// Closed reviewed descriptor only: proof input cannot select approval scope or mappings.
async function validateBizq01OodClosedCohortProof(contentRoot, canonical, evidence, accepted, privateHistoricalSourceBytes, privateContext) {
  if (accepted !== BIZQ01_OOD_COHORT17_PROOF && accepted !== BIZQ01_OOD_COHORT19_PROOF) {
    fail("EVIDENCE_VALUE", "Unsupported private OOD cohort descriptor.");
  }
  if (privateHistoricalSourceBytes !== undefined) {
    if (accepted !== BIZQ01_OOD_COHORT19_PROOF || privateContext !== OOD_REASON_AMENDMENT_19A_PRIVATE_CONTEXT ||
        !(privateHistoricalSourceBytes instanceof Map) ||
        canonicalJson([...privateHistoricalSourceBytes.keys()].sort(compare)) !== canonicalJson(
          BIZQ01_OOD_REASON_AMENDMENT_19A_PROOF.sourceFiles.map((source) => source.sourceFile).sort(compare)
        )) {
      fail("EVIDENCE_VALUE", "Private historical bytes are allowed only for the fixed closed-v19 reason amendment.");
    }
  } else if (privateContext !== undefined) {
    fail("EVIDENCE_VALUE", "A private historical context requires its fixed source buffers.");
  }
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  const proof = await readJson(proofPath, label);
  exactKeys(proof, BIZQ01_OOD_COHORT17_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "identityAction", "identityReason"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  if (canonicalJson(proof.confirmedDefects) !== canonicalJson(accepted.confirmedDefects)) {
    fail("EVIDENCE_VALUE", `${label}.confirmedDefects differ from the fixed cohort descriptor.`);
  }
  assertHash(proof.beforeQuestionSetSha256, `${label}.beforeQuestionSetSha256`);
  assertHash(proof.questionSetSha256, `${label}.questionSetSha256`);
  if (canonical.catalogByTrack.get(accepted.trackId)?.contentVersion !== accepted.contentVersion) {
    fail("EVIDENCE_VALUE", `${label}.contentVersion does not match the current catalog.`);
  }
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from the fixed cohort descriptor.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the ${accepted.sourceFiles.length} fixed source files.`);
  }
  const sourcesByPath = new Map();
  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT17_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_COHORT17_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed cohort descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const diskSourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    const sourceBytes = privateHistoricalSourceBytes?.get(source.sourceFile) ?? diskSourceBytes;
    if (sha256(sourceBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current source hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const descriptorItems = accepted.replacements.filter((item) => item.sourceFile === source.sourceFile);
    const expectedIds = descriptorItems.map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the ${expectedIds.length} fixed current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceById = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes an item outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains a question with a different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source question differs from current canonical content.`);
      }
    }
    sourcesByPath.set(source.sourceFile, { sourcePath, questions, sourceById });
  }
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== accepted.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the fixed ${accepted.replacements.length} replacements.`);
  }
  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  const oldRowsById = new Map(evidence.rowsByTrack.get(accepted.trackId).map((row) => [row.questionId, row]));
  const oldIds = new Set();
  const newIds = new Set();
  const oldOptionIds = new Set();
  const currentOptionIds = new Set();
  const replacements = [];
  for (const [index, item] of accepted.replacements.entries()) {
    const entry = proof.replacements[index];
    const itemLabel = `${label}.replacements[${index}]`;
    exactKeys(entry, BIZQ01_OOD_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "acceptedOptionId"]) {
      if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed replacement map.`);
    }
    const source = accepted.sourceFiles.find((candidate) => candidate.sourceFile === item.sourceFile);
    if (!source || entry.beforeSourceSha256 !== source.beforeSourceSha256 || entry.sourceSha256 !== source.sourceSha256) {
      fail("EVIDENCE_VALUE", `${itemLabel} source hashes do not match the fixed source file.`);
    }
    if (entry.identityAction !== accepted.identityAction || entry.identityReason !== (item.identityReason ?? accepted.identityReason) ||
        canonicalJson(entry.confirmedDefects) !== canonicalJson(accepted.confirmedDefects) ||
        canonicalJson(entry.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_VALUE", `${itemLabel} identity action, defect record, or source references differ from the fixed review.`);
    }
    const oldQuestion = entry.beforeQuestion;
    const currentQuestion = currentById.get(item.questionId);
    const oldRow = oldRowsById.get(item.beforeQuestionId);
    const sourceData = sourcesByPath.get(item.sourceFile);
    if (!oldQuestion || !currentQuestion || !oldRow || !sourceData || currentById.has(item.beforeQuestionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must bind a removed historical item to one current replacement.`);
    }
    if (oldIds.has(item.beforeQuestionId) || newIds.has(item.questionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} duplicates a historical or current replacement identity.`);
    }
    oldIds.add(item.beforeQuestionId);
    newIds.add(item.questionId);
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== item.beforeQuestionId || oldQuestion.trackId !== accepted.trackId ||
        oldQuestion.nodeId !== item.nodeId || oldQuestion.mentalUnitId !== item.mentalUnitId ||
        currentQuestion.questionId !== item.questionId || currentQuestion.trackId !== accepted.trackId ||
        currentQuestion.nodeId !== item.nodeId || currentQuestion.mentalUnitId !== item.mentalUnitId ||
        canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed taxonomy or current authored object.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the old question.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
        currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId ||
        canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed interaction, scoring, accepted option, or primary references.`);
    }
    const priorOptionIds = new Set(oldQuestion.interaction.options.map((option) => option.optionId));
    const newQuestionOptionIds = currentQuestion.interaction.options.map((option) => option.optionId);
    if (new Set(newQuestionOptionIds).size !== newQuestionOptionIds.length || newQuestionOptionIds.some((optionId) => priorOptionIds.has(optionId))) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must use unique option identities that were not assigned to its retired item.`);
    }
    for (const option of oldQuestion.interaction.options) oldOptionIds.add(option.optionId);
    for (const optionId of newQuestionOptionIds) currentOptionIds.add(optionId);
    const sourceQuestion = sourceData.sourceById.get(item.questionId);
    if (!sourceQuestion || canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) {
      fail("HASH_MISMATCH", `${itemLabel} source item differs from current canonical content.`);
    }
    replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: item.beforeQuestionId, questionId: item.questionId });
  }
  if ([...currentOptionIds].some((optionId) => oldOptionIds.has(optionId))) {
    fail("EVIDENCE_MEMBERSHIP", `${label} reuses an option identity from the retired cohort.`);
  }

  for (const source of accepted.sourceFiles) {
    const sourceData = sourcesByPath.get(source.sourceFile);
    const sourceReplacements = replacements.filter((item) => {
      const descriptor = accepted.replacements.find((candidate) => candidate.questionId === item.questionId);
      return descriptor?.sourceFile === source.sourceFile;
    });
    const currentSourceIds = new Set(sourceReplacements.map((item) => item.questionId));
    const predecessorQuestions = sourceData.questions
      .filter((question) => !currentSourceIds.has(question.questionId))
      .concat(sourceReplacements.map((item) => item.oldQuestion))
      .sort((left, right) => compare(left.questionId, right.questionId));
    const predecessorBytes = Buffer.from(JSON.stringify(predecessorQuestions), "utf8");
    if (sha256(predecessorBytes) !== source.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct the byte-exact ${accepted.beforeContentVersion} predecessor source ${source.sourceFile}.`);
    }
  }
  const reconstructedTrackQuestions = currentTrackQuestions
    .filter((question) => !newIds.has(question.questionId))
    .concat(replacements.map((item) => item.oldQuestion))
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (reconstructedTrackQuestions.length !== currentTrackQuestions.length ||
      sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) {
    fail("HASH_MISMATCH", `${label} does not reconstruct the fixed ${accepted.beforeContentVersion} OOD question set.`);
  }
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
      ? { ...track, contentVersion: accepted.beforeContentVersion }
      : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  for (const item of replacements) {
    predecessorLocations.delete(item.questionId);
    predecessorLocations.set(item.beforeQuestionId, {
      trackId: accepted.trackId,
      nodeId: item.oldQuestion.nodeId,
      mentalUnitId: item.oldQuestion.mentalUnitId,
      path: sourcesByPath.get(accepted.replacements.find((candidate) => candidate.questionId === item.questionId).sourceFile).sourcePath
    });
  }
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions),
    questionLocations: predecessorLocations
  };
  const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence);
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", `${label} requires its unchanged predecessor proof chain for historical validation.`);
  return { trackId: accepted.trackId, replacements: [...predecessor.replacements, ...replacements] };
}

async function validateBizq01OodReasonAmendment19a(contentRoot, canonical, evidence) {
  const accepted = BIZQ01_OOD_REASON_AMENDMENT_19A_PROOF;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proofBytes = await readFile(proofPath).catch((error) => fail("READ_ERROR", `Cannot read ${label}: ${error.message}`));
  if (sha256(proofBytes) !== accepted.sha256) fail("HASH_MISMATCH", `${label} differs from its fixed proof bytes.`);
  let proof;
  try { proof = JSON.parse(proofBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`); }
  exactKeys(proof, BIZQ01_OOD_REASON_AMENDMENT_19A_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed amendment identity.`);
  }
  assertHash(proof.beforeQuestionSetSha256, `${label}.beforeQuestionSetSha256`);
  assertHash(proof.questionSetSha256, `${label}.questionSetSha256`);
  if (canonical.catalogByTrack.get(accepted.trackId)?.contentVersion !== accepted.contentVersion) {
    fail("EVIDENCE_VALUE", `${label}.contentVersion does not match the current catalog.`);
  }

  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  const currentQuestionSetSha256 = sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId)));
  if (currentQuestionSetSha256 !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from its fixed descriptor.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the three fixed source files.`);
  }
  const sourceByPath = new Map();
  const privateHistoricalSourceBytes = new Map();
  const predecessorById = new Map();

  if (!Array.isArray(proof.replacements) || proof.replacements.length !== accepted.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the fixed ${accepted.replacements.length} reason-only corrections.`);
  }
  for (const [index, item] of accepted.replacements.entries()) {
    const entry = proof.replacements[index];
    const itemLabel = `${label}.replacements[${index}]`;
    exactKeys(entry, BIZQ01_OOD_REASON_AMENDMENT_19A_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "questionId", "mentalUnitId"]) {
      if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed correction map.`);
    }
    if (typeof entry.beforeReason !== "string" || entry.beforeReason.length === 0 ||
        typeof entry.reason !== "string" || entry.reason.length === 0 || entry.beforeReason === entry.reason) {
      fail("EVIDENCE_VALUE", `${itemLabel} must bind distinct nonempty before/current Reason text.`);
    }
    assertHash(entry.beforeQuestionSha256, `${itemLabel}.beforeQuestionSha256`);
    assertHash(entry.questionSha256, `${itemLabel}.questionSha256`);
  }

  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_REASON_AMENDMENT_19A_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_REASON_AMENDMENT_19A_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed amendment descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const currentSourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    if (sha256(currentSourceBytes) !== source.sourceSha256) {
      fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current 19a source hash.`);
    }
    let questions;
    try { questions = JSON.parse(currentSourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const expectedIds = BIZQ01_OOD_COHORT19_PROOF.replacements
      .filter((item) => item.sourceFile === source.sourceFile)
      .map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the fixed ${expectedIds.length} current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceByIdMap = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes a question outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains a question with different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source question differs from current canonical content.`);
      }
    }
    sourceByPath.set(source.sourceFile, { questions, sourceById: sourceByIdMap });
  }

  for (const [index, entry] of proof.replacements.entries()) {
    const item = accepted.replacements[index];
    const itemLabel = `${label}.replacements[${index}]`;
    const current = sourceByPath.get(item.sourceFile)?.sourceById.get(item.questionId);
    if (!current || current.feedback?.reason !== entry.reason || sha256(current) !== entry.questionSha256) {
      fail("HASH_MISMATCH", `${itemLabel} current whole question or Reason differs from its fixed binding.`);
    }
    const predecessor = {
      ...current,
      feedback: { ...current.feedback, reason: entry.beforeReason }
    };
    if (sha256(predecessor) !== entry.beforeQuestionSha256) {
      fail("HASH_MISMATCH", `${itemLabel} does not reconstruct the immutable v19 whole question by changing Reason only.`);
    }
    predecessorById.set(item.questionId, predecessor);
  }

  for (const source of accepted.sourceFiles) {
    const current = sourceByPath.get(source.sourceFile);
    const reconstructedQuestions = current.questions.map((question) => predecessorById.get(question.questionId) ?? question);
    const reconstructedSourceBytes = Buffer.from(JSON.stringify(reconstructedQuestions), "utf8");
    if (sha256(reconstructedSourceBytes) !== source.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct the byte-exact immutable v19 source ${source.sourceFile}.`);
    }
    privateHistoricalSourceBytes.set(source.sourceFile, reconstructedSourceBytes);
  }

  const reconstructedTrackQuestions = currentTrackQuestions
    .map((question) => predecessorById.get(question.questionId) ?? question)
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) {
    fail("HASH_MISMATCH", `${label} does not reconstruct the immutable v19 OOD question set.`);
  }
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
      ? { ...track, contentVersion: accepted.beforeContentVersion }
      : track)
  };
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions)
  };
  const semanticProof = await validateBizq01OodClosedCohortProof(
    contentRoot,
    predecessorCanonical,
    evidence,
    BIZQ01_OOD_COHORT19_PROOF,
    privateHistoricalSourceBytes,
    OOD_REASON_AMENDMENT_19A_PRIVATE_CONTEXT
  );
  if (!semanticProof) fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged fixed v19 predecessor proof.`);
  return {
    ...semanticProof,
    reasonAmendmentQuestionIds: accepted.replacements.map((item) => item.questionId)
  };
}

async function validateBizq01OodCohort20Proof(contentRoot, canonical, evidence) {
  const accepted = BIZQ01_OOD_COHORT20_PROOF.descriptor;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, BIZQ01_OOD_COHORT20_PROOF.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proofBytes = await readFile(proofPath).catch((error) => fail("READ_ERROR", `Cannot read ${label}: ${error.message}`));
  if (sha256(proofBytes) !== BIZQ01_OOD_COHORT20_PROOF.sha256) fail("HASH_MISMATCH", `${label} differs from its fixed proof bytes.`);
  let proof;
  try { proof = JSON.parse(proofBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`); }
  exactKeys(proof, BIZQ01_OOD_COHORT20_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  for (const key of ["beforeQuestionSetSha256", "questionSetSha256"]) assertHash(proof[key], `${label}.${key}`);
  if (canonical.catalogByTrack.get(accepted.trackId)?.contentVersion !== accepted.contentVersion) {
    fail("EVIDENCE_VALUE", `${label}.contentVersion does not match the current catalog.`);
  }
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (!currentTrackQuestions || sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from its fixed descriptor.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the ${accepted.sourceFiles.length} fixed source files.`);
  }
  const sourcesByPath = new Map();
  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT20_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_COHORT20_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed cohort descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const sourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    if (sha256(sourceBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current source hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const expectedItems = [...accepted.replacements, ...accepted.sameIdCorrections].filter((item) => item.sourceFile === source.sourceFile);
    const expectedIds = expectedItems.map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the fixed ${expectedIds.length} current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceById = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes an item outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains an item with a different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source item differs from current canonical content.`);
      }
    }
    sourcesByPath.set(source.sourceFile, { sourcePath, questions, sourceById });
  }

  const proofGroups = [
    ["replacements", accepted.replacements],
    ["sameIdCorrections", accepted.sameIdCorrections]
  ];
  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  const oldRowsById = new Map(evidence.rowsByTrack.get(accepted.trackId).map((row) => [row.questionId, row]));
  const beforeByCurrentId = new Map();
  const oldIds = new Set();
  const newIds = new Set();
  const oldOptionIds = new Set();
  const currentOptionIds = new Set();
  const replacements = [];
  const sameIdCorrections = [];
  for (const [groupName, descriptors] of proofGroups) {
    const entries = proof[groupName];
    if (!Array.isArray(entries) || entries.length !== descriptors.length) {
      fail("EVIDENCE_MEMBERSHIP", `${label}.${groupName} must contain exactly the fixed ${descriptors.length} items.`);
    }
    for (const [index, item] of descriptors.entries()) {
      const entry = entries[index];
      const itemLabel = `${label}.${groupName}[${index}]`;
      exactKeys(entry, BIZQ01_OOD_COHORT20_ITEM_KEYS, itemLabel);
      for (const key of ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "identityAction", "identityReason", "acceptedOptionId"]) {
        if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed cohort map.`);
      }
      if (canonicalJson(entry.confirmedDefects) !== canonicalJson(item.confirmedDefects) || canonicalJson(entry.sourceRefs) !== canonicalJson(item.sourceRefs)) {
        fail("EVIDENCE_VALUE", `${itemLabel} defect record or source references differ from the fixed review.`);
      }
      const source = accepted.sourceFiles.find((candidate) => candidate.sourceFile === item.sourceFile);
      if (!source || item.beforeSourceSha256 !== source.beforeSourceSha256 || item.sourceSha256 !== source.sourceSha256) {
        fail("EVIDENCE_VALUE", `${itemLabel} source hashes do not match the fixed source descriptor.`);
      }
      const oldQuestion = entry.beforeQuestion;
      const currentQuestion = currentById.get(item.questionId);
      const oldRow = oldRowsById.get(item.beforeQuestionId);
      const sourceData = sourcesByPath.get(item.sourceFile);
      const isSameId = groupName === "sameIdCorrections";
      if (!oldQuestion || !currentQuestion || !oldRow || !sourceData || currentById.has(item.beforeQuestionId) !== isSameId) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} does not bind the fixed historical item to its current item.`);
      }
      if (isSameId ? item.beforeQuestionId !== item.questionId : item.beforeQuestionId === item.questionId) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has an invalid fixed identity action.`);
      }
      if (oldIds.has(item.beforeQuestionId) || newIds.has(item.questionId)) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} duplicates a historical or current identity.`);
      oldIds.add(item.beforeQuestionId);
      newIds.add(item.questionId);
      assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
      assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
      if (oldQuestion.questionId !== item.beforeQuestionId || oldQuestion.trackId !== accepted.trackId || oldQuestion.nodeId !== item.nodeId || oldQuestion.mentalUnitId !== item.mentalUnitId ||
          currentQuestion.questionId !== item.questionId || currentQuestion.trackId !== accepted.trackId || currentQuestion.nodeId !== item.nodeId || currentQuestion.mentalUnitId !== item.mentalUnitId ||
          canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed taxonomy or current authored object.`);
      }
      for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
        if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the old question.`);
      }
      assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
      if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
          currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId || canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(item.sourceRefs)) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed interaction, scoring, accepted answer, or primary references.`);
      }
      const priorOptionIds = new Set(oldQuestion.interaction.options.map((option) => option.optionId));
      const currentItemOptionIds = currentQuestion.interaction.options.map((option) => option.optionId);
      if (new Set(currentItemOptionIds).size !== currentItemOptionIds.length || currentItemOptionIds.some((optionId) => currentOptionIds.has(optionId))) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} uses duplicate current option identities.`);
      }
      if (!isSameId && currentItemOptionIds.some((optionId) => priorOptionIds.has(optionId))) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} reuses an option identity from its retired item.`);
      }
      for (const option of oldQuestion.interaction.options) oldOptionIds.add(option.optionId);
      for (const optionId of currentItemOptionIds) currentOptionIds.add(optionId);
      const sourceQuestion = sourceData.sourceById.get(item.questionId);
      if (!sourceQuestion || canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) fail("HASH_MISMATCH", `${itemLabel} source item differs from current canonical content.`);
      if (beforeByCurrentId.has(item.questionId)) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has more than one predecessor object.`);
      beforeByCurrentId.set(item.questionId, oldQuestion);
      if (isSameId) sameIdCorrections.push({ questionId: item.questionId, oldQuestion, newQuestion: currentQuestion });
      else replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: item.beforeQuestionId, questionId: item.questionId });
    }
  }
  if ([...currentOptionIds].some((optionId) => oldOptionIds.has(optionId))) {
    fail("EVIDENCE_MEMBERSHIP", `${label} reuses an option identity from the retired cohort.`);
  }
  for (const source of accepted.sourceFiles) {
    const sourceData = sourcesByPath.get(source.sourceFile);
    const predecessorQuestions = sourceData.questions.map((question) => beforeByCurrentId.get(question.questionId) ?? question)
      .sort((left, right) => compare(left.questionId, right.questionId));
    const predecessorBytes = Buffer.from(JSON.stringify(predecessorQuestions), "utf8");
    if (sha256(predecessorBytes) !== source.beforeSourceSha256) fail("HASH_MISMATCH", `${label} does not reconstruct byte-exact ${accepted.beforeContentVersion} source ${source.sourceFile}.`);
  }
  const reconstructedTrackQuestions = currentTrackQuestions.map((question) => beforeByCurrentId.get(question.questionId) ?? question)
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) fail("HASH_MISMATCH", `${label} does not reconstruct the immutable predecessor OOD question set.`);
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId ? { ...track, contentVersion: accepted.beforeContentVersion } : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  for (const item of replacements) {
    const descriptor = accepted.replacements.find((candidate) => candidate.questionId === item.questionId);
    predecessorLocations.delete(item.questionId);
    predecessorLocations.set(item.beforeQuestionId, {
      trackId: accepted.trackId,
      nodeId: item.oldQuestion.nodeId,
      mentalUnitId: item.oldQuestion.mentalUnitId,
      path: sourcesByPath.get(descriptor.sourceFile).sourcePath
    });
  }
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions),
    questionLocations: predecessorLocations
  };
  const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence);
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged fixed 19a predecessor proof chain.`);
  return {
    trackId: accepted.trackId,
    replacements: [...predecessor.replacements, ...replacements],
    sameIdCorrections: [...(predecessor.sameIdCorrections ?? []), ...sameIdCorrections],
    reasonAmendmentQuestionIds: predecessor.reasonAmendmentQuestionIds
  };
}

async function loadBizq01OodSemanticProof(contentRoot, canonical, evidence, privateHistoricalSourceBytes) {
  const version = canonical.catalogByTrack.get(BIZQ01_OOD_PROOF.trackId)?.contentVersion;
  if (version === BIZQ01_OOD_COHORT20_PROOF.descriptor.contentVersion) {
    const cohort = await validateBizq01OodCohort20Proof(contentRoot, canonical, evidence);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source20 OOD version requires its fixed nine-unit N04 proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_REASON_AMENDMENT_19A_PROOF.contentVersion) {
    const amendment = await validateBizq01OodReasonAmendment19a(contentRoot, canonical, evidence);
    if (!amendment) fail("EVIDENCE_MEMBERSHIP", "The source19a OOD version requires its fixed 25-item Reason-only amendment proof.");
    return amendment;
  }
  if (version === BIZQ01_OOD_COHORT19_PROOF.contentVersion) {
    const cohort = await validateBizq01OodClosedCohortProof(contentRoot, canonical, evidence, BIZQ01_OOD_COHORT19_PROOF);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source19 OOD version requires its fixed 162-question closure proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_COHORT17_PROOF.contentVersion) {
    const cohort = await validateBizq01OodCohort17Proof(contentRoot, canonical, evidence);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source17 OOD version requires its fixed 152-question closure proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_COHORT16_PROOF.contentVersion) {
    const cohort = await validateBizq01OodCohort16Proof(contentRoot, canonical, evidence);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source16 OOD version requires its fixed 119-question closure proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_PROOF.contentVersion) {
    return validateBizq01OodSemanticProof(contentRoot, canonical, evidence, BIZQ01_OOD_PROOF, 5);
  }
  if (version === BIZQ01_OOD_COHORT13_PROOF.contentVersion) {
    const cohort = await validateBizq01OodCohort13Proof(contentRoot, canonical, evidence);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source13 OOD version requires its fixed fifteen-question cohort proof.");
    const accepted = BIZQ01_OOD_COHORT13_PROOF;
    const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
    const replacedIds = new Set(accepted.replacements.map((item) => item.questionId));
    const reconstructedUnitQuestions = currentTrackQuestions
      .filter((question) => question.mentalUnitId === accepted.mentalUnitId && !replacedIds.has(question.questionId))
      .concat(cohort.replacements.map((item) => item.oldQuestion))
      .sort((left, right) => compare(left.questionId, right.questionId));
    const reconstructedTrackQuestions = currentTrackQuestions
      .filter((question) => !replacedIds.has(question.questionId))
      .concat(cohort.replacements.map((item) => item.oldQuestion))
      .sort((left, right) => compare(left.questionId, right.questionId));
    const reconstructedSourceBytes = Buffer.from(`${JSON.stringify(reconstructedUnitQuestions)}\n`, "utf8");
    if (sha256(reconstructedSourceBytes) !== accepted.beforeSourceSha256) {
      fail("HASH_MISMATCH", "The source13 cohort does not reconstruct the exact accepted source12 predecessor bytes.");
    }
    const predecessorCatalog = {
      ...canonical.catalog,
      tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
        ? { ...track, contentVersion: accepted.beforeContentVersion }
        : track)
    };
    const predecessorLocations = new Map(canonical.questionLocations);
    for (const item of accepted.replacements) {
      predecessorLocations.delete(item.questionId);
      predecessorLocations.set(item.beforeQuestionId, {
        trackId: accepted.trackId,
        nodeId: accepted.nodeId,
        mentalUnitId: accepted.mentalUnitId,
        path: path.resolve(path.dirname(contentRoot), ...accepted.sourceFile.split("/"))
      });
    }
    const predecessorCanonical = {
      ...canonical,
      catalog: predecessorCatalog,
      catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
      questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions),
      questionLocations: predecessorLocations
    };
    const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence, reconstructedSourceBytes);
    if (!predecessor) fail("EVIDENCE_MEMBERSHIP", "The source13 cohort requires both immutable source12 and source11 proofs for predecessor verification.");
    return { trackId: accepted.trackId, replacements: [...predecessor.replacements, ...cohort.replacements] };
  }
  if (version !== BIZQ01_OOD_SUCCESSOR_PROOF.contentVersion) {
    const proofPaths = [BIZQ01_OOD_PROOF.path, BIZQ01_OOD_SUCCESSOR_PROOF.path, BIZQ01_OOD_COHORT13_PROOF.path, BIZQ01_OOD_COHORT16_PROOF.path, BIZQ01_OOD_COHORT17_PROOF.path, BIZQ01_OOD_COHORT19_PROOF.path, BIZQ01_OOD_REASON_AMENDMENT_19A_PROOF.path, BIZQ01_OOD_COHORT20_PROOF.path];
    for (const relativePath of proofPaths) {
      const info = await lstat(path.join(path.dirname(contentRoot), relativePath)).catch((error) => {
        if (error?.code === "ENOENT") return undefined;
        fail("PATH_ERROR", `Cannot inspect OOD semantic proof: ${error.message}`);
      });
      if (info) fail("EVIDENCE_VALUE", `OOD contentVersion ${version} has a fixed semantic proof for a different version.`);
    }
    return undefined;
  }

  const successor = await validateBizq01OodSemanticProof(contentRoot, canonical, evidence, BIZQ01_OOD_SUCCESSOR_PROOF, 4, privateHistoricalSourceBytes);
  if (!successor) fail("EVIDENCE_MEMBERSHIP", "The source12 OOD version requires its fixed successor proof.");
  const successorReplacement = successor.replacements[0];
  const acceptedCurrent = BIZQ01_OOD_SUCCESSOR_PROOF.replacement;
  const sourcePath = path.resolve(path.dirname(contentRoot), ...acceptedCurrent.sourceFile.split("/"));
  const currentSourceBytes = privateHistoricalSourceBytes ?? await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read source12 predecessor input: ${error.message}`));
  let sourceQuestions;
  try {
    sourceQuestions = JSON.parse(currentSourceBytes.toString("utf8"));
  } catch (error) {
    fail("INVALID_JSON", `Cannot parse source12 predecessor input: ${error.message}`);
  }
  const reconstructedSourceQuestions = sourceQuestions
    .filter((question) => question.questionId !== acceptedCurrent.questionId)
    .concat(successorReplacement.oldQuestion)
    .sort((left, right) => compare(left.questionId, right.questionId));
  const reconstructedSourceBytes = Buffer.from(`${JSON.stringify(reconstructedSourceQuestions)}\n`, "utf8");
  if (sha256(reconstructedSourceBytes) !== BIZQ01_OOD_PROOF.replacement.sourceSha256 ||
      sha256(reconstructedSourceBytes) !== acceptedCurrent.beforeSourceSha256) {
    fail("HASH_MISMATCH", "The source12 proof does not reconstruct the exact accepted source11 predecessor bytes.");
  }

  const trackId = BIZQ01_OOD_PROOF.trackId;
  const currentTrackQuestions = canonical.questionsByTrack.get(trackId);
  const predecessorQuestions = currentTrackQuestions
    .filter((question) => question.questionId !== acceptedCurrent.questionId)
    .concat(successorReplacement.oldQuestion)
    .sort((left, right) => compare(left.questionId, right.questionId));
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === trackId
      ? { ...track, contentVersion: BIZQ01_OOD_PROOF.contentVersion }
      : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  predecessorLocations.delete(acceptedCurrent.questionId);
  predecessorLocations.set(acceptedCurrent.beforeQuestionId, {
    trackId,
    nodeId: acceptedCurrent.nodeId,
    mentalUnitId: acceptedCurrent.mentalUnitId,
    path: sourcePath
  });
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(trackId, predecessorQuestions),
    questionLocations: predecessorLocations
  };
  const predecessor = await validateBizq01OodSemanticProof(
    contentRoot,
    predecessorCanonical,
    evidence,
    BIZQ01_OOD_PROOF,
    5,
    reconstructedSourceBytes
  );
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", "The source12 successor requires the immutable source11 proof for predecessor verification.");
  return {
    trackId,
    replacements: [...predecessor.replacements, ...successor.replacements]
  };
}

async function loadBizq01WordingProof(contentRoot, canonical, evidence) {
  const accepted = BIZQ01_COPY_PROOF;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const info = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect BIZQ-01 wording proof: ${error.message}`);
  });
  if (!info) return undefined;
  await rejectSymlinkAncestors(proofPath, "BIZQ-01 wording proof");
  const proof = await readJson(proofPath, "BIZQ-01 wording proof");
  exactKeys(proof, BIZQ01_COPY_KEYS, "BIZQ-01 wording proof");
  for (const key of BIZQ01_COPY_KEYS.filter((key) => !["beforeQuestion", "wording", "sources"].includes(key))) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `BIZQ-01 wording proof.${key} differs from the accepted batch.`);
  }
  if (canonical.catalogByTrack.get(accepted.trackId)?.contentVersion !== accepted.contentVersion) fail("EVIDENCE_VALUE", "BIZQ-01 wording proof contentVersion differs from current catalog.");
  const questions = canonical.questionsByTrack.get(accepted.trackId);
  if (sha256([...questions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) fail("HASH_MISMATCH", "Current Coding questions differ from the accepted wording batch.");
  const oldQuestion = proof.beforeQuestion;
  const newQuestion = questions.find((question) => question.questionId === accepted.questionId);
  const oldRow = evidence.rowsByTrack.get(accepted.trackId).find((row) => row.questionId === accepted.questionId);
  if (!newQuestion || !oldRow) fail("EVIDENCE_MEMBERSHIP", "BIZQ-01 wording correction requires the same current and historical question ID.");
  assertCanonicalQuestion(oldQuestion, "BIZQ-01 wording proof.beforeQuestion", ACCEPTED_TRACK_IDS);
  for (const key of ["trackId", "nodeId", "mentalUnitId", "questionId"]) {
    if (oldQuestion[key] !== accepted[key] || newQuestion[key] !== accepted[key] || oldRow[key] !== accepted[key]) fail("EVIDENCE_MEMBERSHIP", `BIZQ-01 wording correction changes ${key}.`);
  }
  assertCanonicalHash(oldRow, oldQuestion, "BIZQ-01 wording proof.beforeQuestion");
  exactKeys(proof.wording, ["prompt", "detailsParagraph1", "detailsParagraph3"], "BIZQ-01 wording proof.wording");
  if (Object.values(proof.wording).some((value) => typeof value !== "string" || !value.trim())) fail("EVIDENCE_VALUE", "BIZQ-01 wording texts must be nonempty strings.");
  if (newQuestion.prompt !== proof.wording.prompt || newQuestion.feedback.details?.blocks?.[1]?.text !== proof.wording.detailsParagraph1 || newQuestion.feedback.details?.blocks?.[3]?.text !== proof.wording.detailsParagraph3) fail("HASH_MISMATCH", "Current wording differs from the proven three texts.");
  const reconstructed = structuredClone(newQuestion);
  reconstructed.prompt = oldQuestion.prompt;
  reconstructed.feedback.details.blocks[1].text = oldQuestion.feedback.details.blocks[1].text;
  reconstructed.feedback.details.blocks[3].text = oldQuestion.feedback.details.blocks[3].text;
  if (canonicalJson(reconstructed) !== canonicalJson(oldQuestion)) fail("EVIDENCE_VALUE", "BIZQ-01 wording correction changes fields outside the three permitted texts.");
  const sourcePath = path.resolve(projectRoot, ...proof.sourceFile.split("/"));
  await rejectSymlinkAncestors(sourcePath, "BIZQ-01 wording source");
  await regularPath(sourcePath, "BIZQ-01 wording source", "file");
  const bytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read wording source: ${error.message}`));
  if (sha256(bytes) !== accepted.sourceSha256) fail("HASH_MISMATCH", "BIZQ-01 wording source file differs from the accepted hash.");
  let sourceQuestions;
  try { sourceQuestions = JSON.parse(bytes.toString("utf8")); } catch (error) { fail("INVALID_JSON", `BIZQ-01 wording source is invalid JSON: ${error.message}`); }
  if (!Array.isArray(sourceQuestions) || sourceQuestions.filter((question) => question?.questionId === accepted.questionId).length !== 1 || canonicalJson(sourceQuestions.find((question) => question.questionId === accepted.questionId)) !== canonicalJson(newQuestion)) fail("HASH_MISMATCH", "BIZQ-01 wording source does not contain the exact corrected item.");
  const location = canonical.questionLocations.get(accepted.questionId);
  if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== accepted.sourceFile) fail("CANONICAL_MEMBERSHIP", "BIZQ-01 wording item is not at its accepted source location.");
  if (canonicalJson(proof.sources) !== canonicalJson(["https://algs4.cs.princeton.edu/code/javadoc/edu/princeton/cs/algs4/BinarySearch.html", "https://algs4.cs.princeton.edu/code/javadoc/edu/princeton/cs/algs4/Merge.html"])) fail("EVIDENCE_VALUE", "BIZQ-01 wording sources differ from the two reviewed primary pages.");
  return { trackId: accepted.trackId, replacements: [{ oldQuestion, newQuestion, beforeQuestionId: accepted.questionId, questionId: accepted.questionId }] };
}

function compareGlobal(manifest, questionsByTrack) {
  const allQuestions = ACCEPTED_TRACK_IDS.flatMap((trackId) => questionsByTrack.get(trackId));
  const counts = {
    tracks: questionsByTrack.size,
    nodes: new Set(allQuestions.map((question) => `${question.trackId}|${question.nodeId}`)).size,
    mentalUnits: new Set(allQuestions.map((question) => `${question.trackId}|${question.nodeId}|${question.mentalUnitId}`)).size,
    questions: allQuestions.length
  };
  const interactions = Object.fromEntries(INTERACTION_TYPES.map((type) => [type, allQuestions.filter((question) => question.interaction.type === type).length]));
  if (canonicalJson(counts) !== canonicalJson(EXPECTED_GLOBAL_COUNTS)) fail("COUNT_MISMATCH", `Global canonical counts differ: ${canonicalJson(counts)}.`);
  if (canonicalJson(interactions) !== canonicalJson(EXPECTED_GLOBAL_INTERACTIONS)) fail("COUNT_MISMATCH", `Global canonical interactions differ: ${canonicalJson(interactions)}.`);
  if (canonicalJson(manifest.global.counts) !== canonicalJson(counts)) fail("AGGREGATE_MISMATCH", "evidence.manifest.global.counts does not match canonical content.");
  if (canonicalJson(manifest.global.interactions) !== canonicalJson(interactions)) fail("AGGREGATE_MISMATCH", "evidence.manifest.global.interactions does not match canonical content.");
  return { counts, interactions };
}

async function approvedAwsAdditions(contentRoot, canonical, evidence) {
  const trackId = "aws-certified-solutions-architect-associate";
  const baselineIds = new Set(evidence.rowsByTrack.get(trackId).map((row) => row.questionId));
  const questions = canonical.questionsByTrack.get(trackId);
  const additions = questions.filter((question) => !baselineIds.has(question.questionId));
  if (additions.length === 0) return [];
  if (additions.length !== 36) fail("EVIDENCE_MEMBERSHIP", "Current AWS has an unapproved number of additions.");
  const approvalPath = path.join(path.dirname(contentRoot), "evidence/canonical-content-approvals/odk-096-aws-free-node-v1.json");
  const approval = await readJson(approvalPath, "ODK-096 canonical approval");
  if (approval.schemaVersion !== "patternly-canonical-content-approval-addendum-v1" ||
      approval.addendumId !== "odk-096-aws-free-node-v1" ||
      approval.approval?.status !== "approved_pending_sync" ||
      approval.canonicalIdentity?.trackId !== trackId ||
      approval.canonicalIdentity?.contentVersion !== canonical.catalogByTrack.get(trackId).contentVersion) {
    fail("EVIDENCE_VALUE", "ODK-096 approval does not bind the current AWS catalog.");
  }
  assertExactSet(additions.map((question) => question.questionId), approval.questionSet?.newQuestionIds, "ODK-096 approved additions");
  if (additions.length !== approval.questionSet.newQuestionCount ||
      additions.some((question) => question.nodeId !== approval.canonicalIdentity.nodeId)) {
    fail("EVIDENCE_MEMBERSHIP", "ODK-096 additions differ from the approved node and count.");
  }
  const sorted = (values) => [...values].sort((left, right) => compare(left.questionId, right.questionId));
  const nodeQuestions = sorted(questions.filter((question) => question.nodeId === approval.canonicalIdentity.nodeId));
  if (nodeQuestions.length !== approval.canonicalIdentity.node.questionCount ||
      sha256(nodeQuestions) !== approval.canonicalIdentity.node.sha256 ||
      questions.length !== approval.canonicalIdentity.track.questionCount ||
      sha256(sorted(questions)) !== approval.canonicalIdentity.track.sha256) {
    fail("HASH_MISMATCH", "Current AWS questions differ from the approved ODK-096 hashes.");
  }
  return additions.map((question) => question.questionId);
}

export async function verifyMigration(options = {}) {
  const contentRoot = typeof options === "string" ? options : options?.contentRoot;
  if (typeof contentRoot !== "string" || contentRoot.length === 0) fail("INPUT", "contentRoot is required.");
  const resolvedContentRoot = await secureRoot(contentRoot);
  const canonical = await loadCanonicalContent(resolvedContentRoot);
  const evidence = await loadEvidence(resolvedContentRoot);
  const replacementProof = await loadBizq01ReplacementProof(resolvedContentRoot, canonical, evidence);
  const oodSemanticProof = await loadBizq01OodSemanticProof(resolvedContentRoot, canonical, evidence);
  const correctionProof = await loadBizq01WordingProof(resolvedContentRoot, canonical, evidence);
  const approvedAdditions = await approvedAwsAdditions(resolvedContentRoot, canonical, evidence);
  const trackSummaries = [];
  const historicalQuestionsByTrack = new Map();
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const rows = evidence.rowsByTrack.get(trackId);
    const questions = canonical.questionsByTrack.get(trackId);
    const extras = trackId === "aws-certified-solutions-architect-associate" ? approvedAdditions : [];
    const replacements = [replacementProof, oodSemanticProof, correctionProof].filter((proof) => proof?.trackId === trackId).flatMap((proof) => proof.replacements);
    const sameIdCorrections = oodSemanticProof?.trackId === trackId ? (oodSemanticProof.sameIdCorrections ?? []) : [];
    const sameIdCorrectionById = new Map(sameIdCorrections.map((correction) => [correction.questionId, correction]));
    const replacedHistoricalIds = new Set(replacements.map((replacement) => replacement.beforeQuestionId));
    const currentIds = [...rows.map((row) => row.questionId).filter((questionId) => !replacedHistoricalIds.has(questionId)), ...extras, ...replacements.map((replacement) => replacement.questionId)];
    assertExactSet(questions.map((question) => question.questionId), currentIds, `${trackId} current question IDs`);
    const replacedCurrentIds = new Set(replacements.map((replacement) => replacement.questionId));
    const reconstructedQuestions = [
      ...questions.filter((question) => !replacedCurrentIds.has(question.questionId)),
      ...replacements.map((replacement) => replacement.oldQuestion)
    ].map((question) => sameIdCorrectionById.get(question.questionId)?.oldQuestion ?? question);
    const summary = compareTrackMembership(trackId, reconstructedQuestions, rows, evidence.manifestTracks.get(trackId));
    const questionById = new Map(reconstructedQuestions.map((question) => [question.questionId, question]));
    historicalQuestionsByTrack.set(trackId, rows.map((row) => questionById.get(row.questionId)));
    trackSummaries.push({
      trackId: summary.trackId,
      historicalCounts: summary.counts,
      currentCounts: {
        nodes: new Set(questions.map((question) => question.nodeId)).size,
        mentalUnits: new Set(questions.map((question) => `${question.nodeId}|${question.mentalUnitId}`)).size,
        questions: questions.length
      },
      historicalInteractions: summary.interactions,
      currentInteractions: Object.fromEntries(INTERACTION_TYPES.map((type) => [type, questions.filter((question) => question.interaction.type === type).length])),
      aggregates: summary.aggregates
    });
  }
  const historical = compareGlobal(evidence.manifest, historicalQuestionsByTrack);
  const currentQuestions = ACCEPTED_TRACK_IDS.flatMap((trackId) => canonical.questionsByTrack.get(trackId));
  const currentCounts = {
    tracks: ACCEPTED_TRACK_IDS.length,
    nodes: new Set(currentQuestions.map((question) => `${question.trackId}|${question.nodeId}`)).size,
    mentalUnits: new Set(currentQuestions.map((question) => `${question.trackId}|${question.nodeId}|${question.mentalUnitId}`)).size,
    questions: currentQuestions.length
  };
  const currentInteractions = Object.fromEntries(INTERACTION_TYPES.map((type) => [type, currentQuestions.filter((question) => question.interaction.type === type).length]));
  return {
    result: "passed",
    contentRoot: resolvedContentRoot,
    counts: currentCounts,
    interactions: currentInteractions,
    tracks: trackSummaries,
    historicalCounts: historical.counts,
    approvedAdditionCount: approvedAdditions.length,
    semanticReplacementProof: oodSemanticProof ? {
      trackId: oodSemanticProof.trackId,
      replacements: oodSemanticProof.replacements.map(({ beforeQuestionId, questionId }) => ({ beforeQuestionId, questionId }))
    } : undefined,
    reasonAmendmentProof: oodSemanticProof?.reasonAmendmentQuestionIds ? {
      trackId: oodSemanticProof.trackId,
      questionIds: oodSemanticProof.reasonAmendmentQuestionIds
    } : undefined,
    sameIdCorrectionProof: oodSemanticProof?.sameIdCorrections?.length ? {
      trackId: oodSemanticProof.trackId,
      questionIds: oodSemanticProof.sameIdCorrections.map(({ questionId }) => questionId)
    } : undefined,
    wordingCorrectionProof: correctionProof ? { trackId: correctionProof.trackId, questionIds: correctionProof.replacements.map(({ questionId }) => questionId) } : undefined,
    replacementProof: replacementProof ? {
      trackId: replacementProof.trackId,
      replacements: replacementProof.replacements.map(({ beforeQuestionId, questionId }) => ({ beforeQuestionId, questionId }))
    } : undefined
  };
}

export const verifyCanonicalContent = verifyMigration;

function usage() {
  console.error("Usage: node scripts/content/verify-migration.mjs --content-root <canonical-content-root>");
}

function cliContentRoot(argv) {
  const index = argv.indexOf("--content-root");
  if (index >= 0) return argv[index + 1];
  if (argv.length === 1 && !argv[0].startsWith("-")) return argv[0];
  return undefined;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const contentRoot = cliContentRoot(process.argv.slice(2));
  if (!contentRoot) {
    usage();
    process.exitCode = 2;
  } else {
    try {
      console.log(JSON.stringify(await verifyMigration({ contentRoot }), null, 2));
    } catch (error) {
      if (error instanceof MigrationVerificationError) {
        console.error(error.message);
        for (const detail of error.details) console.error(detail);
      } else {
        console.error(error.stack ?? error.message);
      }
      process.exitCode = 1;
    }
  }
}
