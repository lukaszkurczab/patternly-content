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


async function loadBizq01OodSemanticProof(contentRoot, canonical, evidence, privateHistoricalSourceBytes) {
  const version = canonical.catalogByTrack.get(BIZQ01_OOD_PROOF.trackId)?.contentVersion;
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
    const proofPaths = [BIZQ01_OOD_PROOF.path, BIZQ01_OOD_SUCCESSOR_PROOF.path, BIZQ01_OOD_COHORT13_PROOF.path];
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
    const replacedHistoricalIds = new Set(replacements.map((replacement) => replacement.beforeQuestionId));
    const currentIds = [...rows.map((row) => row.questionId).filter((questionId) => !replacedHistoricalIds.has(questionId)), ...extras, ...replacements.map((replacement) => replacement.questionId)];
    assertExactSet(questions.map((question) => question.questionId), currentIds, `${trackId} current question IDs`);
    const replacedCurrentIds = new Set(replacements.map((replacement) => replacement.questionId));
    const reconstructedQuestions = [
      ...questions.filter((question) => !replacedCurrentIds.has(question.questionId)),
      ...replacements.map((replacement) => replacement.oldQuestion)
    ];
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
