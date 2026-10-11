import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const unitDirectory = path.resolve(
  here,
  "../content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows",
);
const expectedAnswers = {
  B02: [
    "credential_epoch_enforced", "durable_job_resource", "expand_compatible_data", "atomic_overlap_guard",
    "index_watermark_freshness", "reserved_priority_compute", "stable_payment_intent_reconcile", "durable_risk_priority_admission",
    "immutable_export_snapshot", "single_cutoff_report", "bounded_ingest_isolation", "provider_bulkhead_deadline",
    "attributed_durable_append", "monotonic_revision_guard", "billable_intent_ledger", "explicit_allocation_state",
  ],
  B03: [
    "fraud_durable_unary_accept", "payroll_durable_export_job", "report_typed_unary_snapshot", "telemetry_stream_flow_control",
    "notification_durable_async_handoff", "audit_unary_durable_append", "parcel_unary_revision_guard", "extraction_unary_accept_status",
    "ticket_unary_pending_status", "tenant_authorized_unary_page", "metadata_unary_freshness_result", "iot_durable_command_status",
    "webhook_http_dedup_ack", "document_conditional_unary_write", "inventory_atomic_reserve", "progress_idempotent_unary_set",
    "price_conditional_unary_publish",
  ],
  B04: [
    "fraud_durable_pending", "ticket_async_intent", "support_bounded_sync_read", "metadata_sync_get", "iot_async_command",
    "webhook_async_delivery", "document_sync_compare_swap", "inventory_sync_atomic_claim", "progress_sync_idempotent_set",
    "price_sync_conditional_publish", "revocation_pending_until_enforced", "transcode_durable_accept", "rollout_flag_data_separation",
    "booking_sync_atomic_commit", "search_async_index_sync_query", "route_durable_priority_job", "payment_async_unknown",
  ],
  B05: [
    "stock_cursor_candidates", "learner_cursor_tiebreaker", "price_revision_cursor", "session_scoped_cursor", "job_status_stable_page",
    "rollout_revision_pinned_query", "slot_candidate_freshness", "search_cursor_bound_context", "route_priority_cursor",
    "payment_history_and_intent", "fraud_priority_fair_cursor", "payroll_pinned_export_pages", "report_snapshot_cursor",
    "telemetry_bounded_time_cursor", "notification_attempt_cursor", "audit_sequence_snapshot_page", "parcel_carrier_sequence_page",
  ],
  B06: [
    "index_dual_version_cursor", "route_additive_optional_field", "payment_version_unknown", "fraud_safe_legacy_priority",
    "payroll_versioned_pinned_artifact", "finance_explicit_unit_version", "telemetry_optional_dual_compat", "notification_version_pending",
    "audit_actor_versioned_evidence", "carrier_revision_staged", "extraction_operation_compat", "ticket_versioned_pending",
    "support_tenant_version_gate", "media_status_additive", "iot_device_version_stage", "webhook_delivery_id_stage",
  ],
  B07: [
    "notification_bounded_retry", "audit_stable_append_ack", "carrier_retry_monotonic", "extraction_unknown_reconcile", "ticket_unknown_status",
    "support_cancel_authorized", "metadata_bounded_semantic_retry", "iot_cancel_wait_dedup", "webhook_single_retry_owner",
    "edit_conditional_retry", "inventory_intent_atomic_retry", "progress_idempotent_retry_owner", "price_conditional_retry",
    "revocation_enforcement_state", "transcode_job_poll_separation", "rollout_bounded_reversible", "booking_unknown_atomic_retry",
  ],
  B08: [
    "iot_scoped_priority_admission", "webhook_partner_budget", "collab_fair_cas", "stock_per_sku_atomic", "progress_account_idempotent_budget",
    "price_merchant_budget", "credential_security_budget", "transcode_weighted_fair", "rollout_cohort_budget", "booking_fair_atomic",
    "index_budget_watermark", "route_priority_lanes", "payment_quota_stable_intent", "fraud_durable_priority_bands",
    "payroll_export_budget", "financial_query_budget_cutoff",
  ],
  B09: [
    "transcode_compute_boundary", "rollout_cohesive_owner", "booking_slot_owner", "search_projection_service", "route_planner_isolation",
    "payment_intent_owner_adapter", "fraud_admission_owner", "payroll_export_owner", "finance_snapshot_projection",
    "telemetry_ingest_query_split", "notification_worker_boundary", "audit_write_trust_boundary", "parcel_ingest_projection",
    "extraction_job_billing_owner", "ticket_inventory_status_boundary", "support_search_scoped_projection", "media_metadata_owner_projection",
    "iot_transport_effect_owner",
  ],
};
const criticalFacts = {
  B02: ["remain unexpired for 30 minutes", "worker may crash immediately after acceptance", "old and new app versions coexist for a week", "different valid idempotency key", "processed only through 8360", "urgent route within 100 ms", "cannot tell whether it charged the customer", "must never disappear after an acceptance response", "tax-rules revision 17", "period ending at 2026-09-30", "40,000 events per second", "request deadline is 500 ms", "seven-year retention period", "different event ID", "response is lost after the provider may have started", "allocation authority may already have reserved a seat"],
  B03: ["within 100 ms", "takes four minutes to render", "available in 150 ms", "bursts to 50,000", "request budget is 150 ms", "durably appended", "revisions may arrive out of order", "response can be lost", "within 200 ms", "partitioned by tenant", "up to 20 seconds stale", "offline for six hours", "duplicate deliveries are possible", "expectedRevision=12", "One unit remains in stock", "must not increment progress more than once", "reject a stale price"],
  B04: ["120 ms response budget", "times out after 300 ms", "completes in 80 ms", "20 seconds stale", "offline and may not reconnect for six hours", "at most 8 attempts over 24 hours", "revision 12", "One stock unit remains", "retry after a lost response", "cache invalidation may take two seconds", "nodes may take two seconds", "250 ms deadline", "versions coexist for a week", "overlapping appointment ranges", "indexing can lag by 15 seconds", "within 100 ms", "response times out"],
  B05: ["another buyer may reserve stock", "share the same timestamp", "immutable revisions", "list is capped at 100 rows", "share a creation timestamp", "policy revision 72", "15 seconds stale", "watermark 812", "priority and arrival sequence", "charge outcome is unknown", "without starving routine work forever", "snapshot 550 under rules revision 17", "New entries arrive before page 2", "Multiple events share timestamps", "for one tenant", "ledger sequence 9200", "arrive out of order"],
  B06: ["Old mobile clients remain active for a month", "optional etaConfidence", "stable paymentIntentId", "some v1 producers omit it", "download an old v1 export years later", "explicit currency", "Old producers remain active", "stable deliveryId", "source cannot prove who performed", "revisionless delivery", "no stable intent identity", "stable allocation intent ID", "reject requests missing that scope", "HTTP 404", "many devices remain on v1", "reject unknown fields"],
  B07: ["at most three attempts", "response is lost", "revision 41 event is also delayed", "outcome can remain unknown", "must not allocate another seat", "300 ms deadline", "retrying a 404 cannot repair it", "may have reached the device", "at-least-once", "version conflict", "Two distinct reserve intents", "at most twice", "limited to two", "may still accept old sessions", "poll is canceled at 250 ms", "100 ms deadline", "distinct idempotency keys"],
  B08: ["urgent safety commands take priority", "one partner’s backlog must not consume every delivery worker", "same document revision must still conflict", "one unit left", "up to 30 progress updates per minute", "within two seconds", "must never leave an old credential authorized", "interactive preview capacity must remain available", "reversible without incompatible data writes", "overlapping requests must never both be confirmed", "source writes must remain durable", "100 ms SLO", "must not be charged twice", "High-risk cases must persist", "reproducible under their exportId", "one consistent cutoff"],
  B09: ["25 minutes and consumes GPU", "roll back within five minutes", "tolerate 10 seconds of staleness", "15 seconds of index lag", "100 ms deadline", "reconciled before a new charge", "durable before the caller receives accepted", "same bytes for the same period and rules revision", "10-second projection lag", "50,000 events per second", "500 ms request budget", "seven-year retention policy", "out-of-order updates", "charge once per user intent", "one authoritative seat inventory", "tenant-scoped", "stale or unavailable", "Duplicate physical action is unsafe"],
};
const nearestCounterexamples = {
  "B02": [
    {
      "optionId": "short_token_ttl",
      "feedbackNeedle": "A 30-minute residual lifetime means an old session remains usable after the endpoint reports success; expiry alone does not meet immediate revocation semantics."
    },
    {
      "optionId": "long_unary_execution",
      "feedbackNeedle": "The 20-minute operation exceeds the caller’s 200 ms budget; a timed-out request does not reveal whether the original work continues, and a fresh submission can duplicate it."
    },
    {
      "optionId": "rewrite_then_flag",
      "feedbackNeedle": "A flag rollback does not reverse an in-place data rewrite; old app versions can no longer read records changed to the incompatible shape."
    },
    {
      "optionId": "idempotency_only",
      "feedbackNeedle": "Idempotency prevents replay of one intent; the two valid keys represent different intents, so it does not prevent their ranges from overlapping."
    },
    {
      "optionId": "permanent_index_404",
      "feedbackNeedle": "The known source record is committed after the indexed watermark; a 404 without freshness state misreports lag as absence."
    },
    {
      "optionId": "priority_tag_shared_pool",
      "feedbackNeedle": "A priority label alone does not reserve execution or admission capacity once long-running jobs occupy every worker."
    },
    {
      "optionId": "fresh_provider_key",
      "feedbackNeedle": "The provider may already have accepted the first request; a fresh identifier represents another charge rather than a retry of the same intent."
    },
    {
      "optionId": "best_effort_broker_ack",
      "feedbackNeedle": "An in-memory or non-durable broker acknowledgment does not prove the high-risk case survives overload or process loss."
    },
    {
      "optionId": "latest_recompute",
      "feedbackNeedle": "A period URL identifies the subject period but not the approved snapshot; recomputation can return different bytes after the correction."
    },
    {
      "optionId": "independent_latest_reads",
      "feedbackNeedle": "Combining independently current reads can include an invoice without its corresponding payment or balance update and produce totals that never existed together."
    },
    {
      "optionId": "shared_unbounded_pool",
      "feedbackNeedle": "An unbounded shared pool allows the 40,000-event burst to occupy connections needed to keep queries under 250 ms."
    },
    {
      "optionId": "shared_worker_wait",
      "feedbackNeedle": "An 8-second wait exceeds the 500 ms budget and ties up shared workers needed by other providers."
    },
    {
      "optionId": "mutable_audit_row",
      "feedbackNeedle": "A mutable row can erase the history of prior actions, so the ledger cannot prove what was originally recorded."
    },
    {
      "optionId": "arrival_order",
      "feedbackNeedle": "Network arrival order can differ from carrier state order; revision 41 is older even though it arrived later."
    },
    {
      "optionId": "new_job_each_retry",
      "feedbackNeedle": "A new job ID turns recovery of the same client intent into a second operation, so the provider may bill for the extraction twice."
    },
    {
      "optionId": "timeout_means_failed",
      "feedbackNeedle": "A timeout only means the response was not observed; the seat may already be allocated, so final failure can cause a duplicate retry."
    }
  ],
  "B03": [
    {
      "optionId": "fraud_stream_only",
      "feedbackNeedle": "A stream disconnect can occur after delivery but before durable persistence; it cannot establish the required survival guarantee."
    },
    {
      "optionId": "payroll_long_unary",
      "feedbackNeedle": "The execution time exceeds the caller deadline; losing the response leaves the client unsure whether an export exists."
    },
    {
      "optionId": "report_stream_single_value",
      "feedbackNeedle": "The requested result is one bounded response and no subscription is required; a long-lived stream adds lifecycle without useful interaction semantics."
    },
    {
      "optionId": "telemetry_unary_per_event",
      "feedbackNeedle": "At 50,000 events per second, unbounded unary calls can overwhelm ingestion and compete with the query path."
    },
    {
      "optionId": "notification_typed_sync",
      "feedbackNeedle": "The provider’s three-second delay exceeds the 150 ms request budget and can occupy gateway capacity."
    },
    {
      "optionId": "audit_stream_early_ack",
      "feedbackNeedle": "Receipt on a stream is not the durable append the response promises; a failure before commit would lose an acknowledged record."
    },
    {
      "optionId": "parcel_stream_order_assumed",
      "feedbackNeedle": "A stream transports updates but does not guarantee source revision order or prevent a delayed revision from overwriting a newer one."
    },
    {
      "optionId": "extraction_stream_only",
      "feedbackNeedle": "The caller may lose its connection during long work; reconnecting as a new request can duplicate the provider charge."
    },
    {
      "optionId": "ticket_long_rpc",
      "feedbackNeedle": "The work can outlast the 200 ms caller budget, and timeout does not prove that the seat claim failed."
    },
    {
      "optionId": "typed_stream_all_tenants",
      "feedbackNeedle": "A correct message schema does not authorize the data; cross-tenant records would already have been disclosed."
    },
    {
      "optionId": "metadata_stream_single_get",
      "feedbackNeedle": "The caller asks for one bounded read and no subscription; a stream adds lifecycle without satisfying the missing/stale result distinction."
    },
    {
      "optionId": "iot_stream_is_delivery",
      "feedbackNeedle": "The device may be offline for hours, and transport delivery is not evidence of actuation or durable acceptance."
    },
    {
      "optionId": "grpc_stream_required",
      "feedbackNeedle": "The partner contract is an HTTP webhook, and a stream ACK alone does not deduplicate the receiver’s side effect."
    },
    {
      "optionId": "document_stream_order",
      "feedbackNeedle": "Transport ordering cannot tell whether a write was based on stale revision 12; the second could silently overwrite newer content."
    },
    {
      "optionId": "inventory_rpc_implies_atomic",
      "feedbackNeedle": "RPC typing and transport do not serialize application writes or enforce the stock invariant."
    },
    {
      "optionId": "progress_stream_scalar",
      "feedbackNeedle": "A single bounded state update has no continuous feed requirement, and a retry should not create an additional count."
    },
    {
      "optionId": "price_stream_is_authority",
      "feedbackNeedle": "A delayed or disconnected consumer can miss the notification; the stream is not the authoritative publication record."
    }
  ],
  "B04": [
    {
      "optionId": "fraud_fire_and_forget",
      "feedbackNeedle": "A best-effort handoff can disappear after success, violating the explicit durable-acceptance condition."
    },
    {
      "optionId": "ticket_long_sync",
      "feedbackNeedle": "The claim may complete after the client deadline, so timeout does not prove it failed and a fresh retry may allocate twice."
    },
    {
      "optionId": "support_async_every_read",
      "feedbackNeedle": "The prompt gives a bounded interactive read that fits its budget; unconditional async work adds unnecessary delay and state."
    },
    {
      "optionId": "metadata_async_get",
      "feedbackNeedle": "The requested operation is a bounded read, and GET should not create ingestion work as an incidental side effect."
    },
    {
      "optionId": "iot_sync_wait",
      "feedbackNeedle": "A six-hour offline interval cannot fit a caller-bound synchronous request."
    },
    {
      "optionId": "webhook_sync_retry",
      "feedbackNeedle": "The 10-second or offline dependency would hold request capacity and exceeds a normal caller-bound interaction."
    },
    {
      "optionId": "document_async_queue",
      "feedbackNeedle": "The requirement is a direct conflict result for a bounded write; asynchronous acceptance would hide that decision from the caller."
    },
    {
      "optionId": "inventory_async_confirm",
      "feedbackNeedle": "Confirmation precedes the authoritative claim, so both buyers can be promised the same unit."
    },
    {
      "optionId": "progress_async_job",
      "feedbackNeedle": "No long-running work is given; queueing introduces delay and state without a reason."
    },
    {
      "optionId": "price_async_ack",
      "feedbackNeedle": "The success response could precede the state checkout must validate, so revision 41 may still be confirmed."
    },
    {
      "optionId": "revocation_success_on_write",
      "feedbackNeedle": "The API would report success while the old credential remains usable, contrary to the stated security guarantee."
    },
    {
      "optionId": "transcode_sync",
      "feedbackNeedle": "The request deadline is far shorter than the workload and should not control accepted job lifetime."
    },
    {
      "optionId": "rollout_flag_reverses_schema",
      "feedbackNeedle": "A flag changes behavior, not persisted bytes; old clients can still fail after rollback."
    },
    {
      "optionId": "booking_async_confirm",
      "feedbackNeedle": "The confirmation precedes the invariant check and can promise two users the same time range."
    },
    {
      "optionId": "search_sync_index_write",
      "feedbackNeedle": "The scenario permits asynchronous indexing and a 15-second lag; coupling all writes to every index is unnecessary and may fail unrelated writes."
    },
    {
      "optionId": "route_all_sync",
      "feedbackNeedle": "Minutes of work can occupy the capacity needed to meet the urgent 100 ms deadline."
    },
    {
      "optionId": "payment_sync_timeout_failure",
      "feedbackNeedle": "The provider may have charged before the timeout, so a final failure can prompt a duplicate payment."
    }
  ],
  "B05": [
    {
      "optionId": "offset_no_order",
      "feedbackNeedle": "Storage order is not stable; inserts and ties can shift rows between pages and cause duplicates or omissions."
    },
    {
      "optionId": "timestamp_only",
      "feedbackNeedle": "Equal completion times leave records without a total order, so a page boundary can repeat or omit items."
    },
    {
      "optionId": "offset_live_prices",
      "feedbackNeedle": "Rows may move as prices change, and a feed item is not proof it is still the authoritative checkout price."
    },
    {
      "optionId": "global_search_filter",
      "feedbackNeedle": "Protected session metadata has already crossed the tenant/account boundary before client filtering."
    },
    {
      "optionId": "timestamp_only_jobs",
      "feedbackNeedle": "Timestamp ties can skip jobs or cause the same job to recur on later pages."
    },
    {
      "optionId": "latest_policy_each_page",
      "feedbackNeedle": "Pages can then combine decisions made under different rule revisions, so the audit is not a coherent view."
    },
    {
      "optionId": "slot_page_guarantees",
      "feedbackNeedle": "The 15-second-old projection may already be claimed; listing a candidate is not ownership of the time range."
    },
    {
      "optionId": "last_key_only",
      "feedbackNeedle": "The next page would continue a different query and can skip, repeat, or expose unrelated results."
    },
    {
      "optionId": "arrival_only",
      "feedbackNeedle": "The ordering ignores the priority distinction the operator needs to see."
    },
    {
      "optionId": "timestamp_cursor_new_intent",
      "feedbackNeedle": "Timestamp ties can break paging, and a history page cannot establish that an unknown prior charge failed."
    },
    {
      "optionId": "priority_no_tiebreaker",
      "feedbackNeedle": "Equal risk scores have no deterministic order, so cases can be skipped or repeated."
    },
    {
      "optionId": "latest_rows_on_retry",
      "feedbackNeedle": "The retry would splice newer rows into the original artifact and break reproducibility."
    },
    {
      "optionId": "live_page_reads",
      "feedbackNeedle": "Page 2 may include entries absent from page 1, so the combined report no longer represents one cutoff."
    },
    {
      "optionId": "timestamp_only_cursor",
      "feedbackNeedle": "Timestamp ties make the boundary ambiguous and can omit or repeat events."
    },
    {
      "optionId": "global_attempt_search",
      "feedbackNeedle": "The read crosses the trust boundary before filtering; tenant scope must be enforced by the server."
    },
    {
      "optionId": "wallclock_only",
      "feedbackNeedle": "Wall-clock time may not define a unique total order or match the ledger’s authoritative append sequence."
    },
    {
      "optionId": "arrival_time_projection",
      "feedbackNeedle": "A late delivery can arrive after a newer carrier state and move the parcel backward."
    }
  ],
  "B06": [
    {
      "optionId": "replace_v1_now",
      "feedbackNeedle": "Old clients still send offset requests and cannot continue pagination after the one-sided cutover."
    },
    {
      "optionId": "required_enum_now",
      "feedbackNeedle": "Old clients may reject an unknown required field, so the rollout depends on a coordinated upgrade that is unavailable."
    },
    {
      "optionId": "enum_in_boolean",
      "feedbackNeedle": "Encoding unknown as false triggers the legacy reader’s retry path; it may create another charge for the unresolved paymentIntentId."
    },
    {
      "optionId": "missing_means_low",
      "feedbackNeedle": "A v1 producer may be sending a high-risk case; the default silently violates its required handling."
    },
    {
      "optionId": "reinterpret_old_bytes",
      "feedbackNeedle": "Old readers would misread units, and the archived v1 artifact would no longer preserve its original meaning."
    },
    {
      "optionId": "reuse_total_field",
      "feedbackNeedle": "Old readers will parse cents as whole currency units and misreport the amount."
    },
    {
      "optionId": "new_reader_requires_field",
      "feedbackNeedle": "Old producers remain active, so the new consumer would reject valid messages during coexistence."
    },
    {
      "optionId": "pending_as_false",
      "feedbackNeedle": "Old clients interpret false as final failure and may create a second notification while the original is retrying."
    },
    {
      "optionId": "backfill_default_actor",
      "feedbackNeedle": "A default would fabricate attribution for actions whose actor is unknown."
    },
    {
      "optionId": "require_before_producers",
      "feedbackNeedle": "This rejects legacy traffic without first preserving it in a quarantine/replay path; it can lose updates during the overlap."
    },
    {
      "optionId": "new_id_each_legacy_retry",
      "feedbackNeedle": "A new job ID makes an ambiguous retry look like a new intent and can cause a second provider charge."
    },
    {
      "optionId": "unknown_as_failed",
      "feedbackNeedle": "The seat may already be reserved; mapping unknown to failure can allocate a second ticket."
    },
    {
      "optionId": "default_public_tenant",
      "feedbackNeedle": "A permissive default can resolve another tenant’s cases and violates server-side ownership."
    },
    {
      "optionId": "empty_means_all",
      "feedbackNeedle": "A shared empty response erases the existing difference between 404 confirmed absence and 503 temporary failure, and still hides projection staleness."
    },
    {
      "optionId": "send_new_to_all",
      "feedbackNeedle": "The old device may reject the message or execute duplicates because it lacks the new replay guard."
    },
    {
      "optionId": "add_fields_everywhere",
      "feedbackNeedle": "The prompt says some receivers reject unknown fields, so immediate expansion breaks them."
    }
  ],
  "B07": [
    {
      "optionId": "retry_every_layer",
      "feedbackNeedle": "Independent retry loops multiply attempts and can exceed both the caller SLA and provider capacity."
    },
    {
      "optionId": "new_id_retry",
      "feedbackNeedle": "A new ID describes a second append and can duplicate the same administrator action."
    },
    {
      "optionId": "retry_as_new_event",
      "feedbackNeedle": "A retry becomes indistinguishable from a new update and may bypass dedup or monotonic order."
    },
    {
      "optionId": "new_billable_id",
      "feedbackNeedle": "The first provider job may already be running, so a fresh identity can create a second charge."
    },
    {
      "optionId": "timeout_failed_new_id",
      "feedbackNeedle": "The first claim may already have committed, so a new ID can reserve a second seat."
    },
    {
      "optionId": "skip_auth_on_deadline",
      "feedbackNeedle": "Meeting latency cannot justify crossing tenant scope; an unscoped query exposes protected data."
    },
    {
      "optionId": "retry_404_forever",
      "feedbackNeedle": "A confirmed absent asset is not a transient failure, and unlimited retries consume capacity without changing the result."
    },
    {
      "optionId": "fresh_id_on_timeout",
      "feedbackNeedle": "The prior command may already have executed; a new identity can repeat the unsafe effect."
    },
    {
      "optionId": "new_id_retry",
      "feedbackNeedle": "A new ID defeats deduplication and makes retries appear as separate logical events."
    },
    {
      "optionId": "drop_precondition",
      "feedbackNeedle": "Removing the precondition converts a detected stale edit into a silent lost update."
    },
    {
      "optionId": "idempotency_equals_stock",
      "feedbackNeedle": "The keys prevent duplicate execution of each intent, not competition between two distinct intents."
    },
    {
      "optionId": "increment_each_attempt",
      "feedbackNeedle": "The progress counter changes before the response, so ignoring a duplicate response does not undo duplicate increments."
    },
    {
      "optionId": "retry_stale_as_current",
      "feedbackNeedle": "A stale revision conflict is permanent for that payload; unconditional retry would roll the price back from 52."
    },
    {
      "optionId": "timeout_success",
      "feedbackNeedle": "The timeout does not prove enforcement; old sessions may remain authorized after a false success."
    },
    {
      "optionId": "cancel_kills_job",
      "feedbackNeedle": "The caller canceled waiting, not the already accepted transcoding operation."
    },
    {
      "optionId": "retry_migration_forever",
      "feedbackNeedle": "An ambiguous timeout can repeat an irreversible or non-idempotent migration and break rollback."
    },
    {
      "optionId": "idempotency_is_exclusion",
      "feedbackNeedle": "The keys identify different intents and do not enforce the shared resource’s no-overlap invariant."
    }
  ],
  "B08": [
    {
      "optionId": "global_rate_only",
      "feedbackNeedle": "A noisy device can consume the shared budget and delay urgent commands from other devices."
    },
    {
      "optionId": "global_retry_pool",
      "feedbackNeedle": "One partner outage can starve all other deliveries and overwhelm shared capacity."
    },
    {
      "optionId": "global_quota_bypass_cas",
      "feedbackNeedle": "Admission does not replace the revision invariant; admitted stale writes can still overwrite one another."
    },
    {
      "optionId": "quota_confirms_stock",
      "feedbackNeedle": "Quota controls request volume; it does not establish that a unit remains available."
    },
    {
      "optionId": "increment_on_retry",
      "feedbackNeedle": "A throttled or lost-response retry can count the same completion multiple times."
    },
    {
      "optionId": "one_global_price_quota",
      "feedbackNeedle": "A bulk merchant can consume shared capacity and delay checkout freshness for everyone."
    },
    {
      "optionId": "throttle_success",
      "feedbackNeedle": "The old credential remains usable after the API claims revocation succeeded."
    },
    {
      "optionId": "one_job_one_token",
      "feedbackNeedle": "A few heavyweight jobs can consume far more resources than their nominal request count suggests."
    },
    {
      "optionId": "rate_limit_only",
      "feedbackNeedle": "A request quota does not bound the blast radius of each admitted rollout."
    },
    {
      "optionId": "fair_queue_is_invariant",
      "feedbackNeedle": "Scheduling order is not the authoritative conflict check; concurrent or retried commits can still overlap."
    },
    {
      "optionId": "drop_source_on_index_limit",
      "feedbackNeedle": "Index capacity should not decide whether source-of-truth data is accepted or retained."
    },
    {
      "optionId": "shared_fifo",
      "feedbackNeedle": "A long batch backlog can place urgent work behind minutes of computation."
    },
    {
      "optionId": "new_intent_on_429",
      "feedbackNeedle": "The existing intent may still be pending or charged; a new identity can duplicate the effect."
    },
    {
      "optionId": "single_fifo",
      "feedbackNeedle": "A routine backlog can block high-risk cases that the policy must protect."
    },
    {
      "optionId": "global_export_quota",
      "feedbackNeedle": "A global quota lacks tenant fairness and lets one tenant monopolize expensive export capacity."
    },
    {
      "optionId": "mix_snapshots",
      "feedbackNeedle": "Different source cutoffs can produce a total that never existed at one point in time."
    }
  ],
  "B09": [
    {
      "optionId": "split_without_journal",
      "feedbackNeedle": "The new boundary has no durable job owner, so accepted work can disappear when the API or worker is replaced."
    },
    {
      "optionId": "split_flag_data",
      "feedbackNeedle": "The flag may roll back while persisted data remains unreadable to old clients."
    },
    {
      "optionId": "split_check_commit",
      "feedbackNeedle": "The check and commit can race across service boundaries, allowing overlapping bookings."
    },
    {
      "optionId": "index_becomes_source",
      "feedbackNeedle": "The projection is allowed to lag and rebuild, so it cannot replace the source of truth."
    },
    {
      "optionId": "split_shared_workers",
      "feedbackNeedle": "A process/service boundary does not isolate a shared saturated resource."
    },
    {
      "optionId": "split_intent_issuance",
      "feedbackNeedle": "Separate identities can cause duplicate provider charges when outcomes are ambiguous."
    },
    {
      "optionId": "async_lossy_handoff",
      "feedbackNeedle": "A message loss after the ACK makes the high-risk case disappear."
    },
    {
      "optionId": "workers_latest_payroll",
      "feedbackNeedle": "The same identity can produce different bytes after a correction, breaking audit reproducibility."
    },
    {
      "optionId": "independent_service_cutoffs",
      "feedbackNeedle": "Different cutoffs can yield a total that never existed at one point in time."
    },
    {
      "optionId": "split_shared_pool",
      "feedbackNeedle": "The service split does not isolate the actual shared bottleneck."
    },
    {
      "optionId": "provider_in_gateway",
      "feedbackNeedle": "A slow dependency can exhaust the gateway before its 500 ms budget is met."
    },
    {
      "optionId": "split_writer_untrusted",
      "feedbackNeedle": "The service boundary loses the provenance that must be bound to every record."
    },
    {
      "optionId": "projection_owns_sequence",
      "feedbackNeedle": "Different replicas can apply out-of-order events inconsistently and regress shipment state."
    },
    {
      "optionId": "two_identity_services",
      "feedbackNeedle": "Different identities make one intent appear as two billable operations."
    },
    {
      "optionId": "presentation_allocates",
      "feedbackNeedle": "Two services can allocate the same seat before reconciliation."
    },
    {
      "optionId": "index_bypasses_auth",
      "feedbackNeedle": "The index has already disclosed unauthorized records before client filtering."
    },
    {
      "optionId": "cache_owns_metadata",
      "feedbackNeedle": "An expiring projection cannot be the durable source of truth."
    },
    {
      "optionId": "gateway_only_dedup",
      "feedbackNeedle": "The gateway cannot know the physical effect completed when its response was lost; replay protection must reach the actuation boundary."
    }
  ]
};
const requiredMechanisms = {
  B02: ["credential epoch", "durable job ID", "Expand readers and writers compatibly", "non-overlap atomically", "indexed-through watermark", "Reserve compute capacity", "one durable payment intent", "Durably admit high-risk cases", "immutable export ID", "consistent snapshot", "isolate telemetry ingestion", "bulkhead", "integrity-protected audit append", "authoritative revision", "stable extraction intent", "allocation intent"],
  B03: ["Durably enqueue", "durable export job ID", "consistent database snapshot", "bidirectional stream", "Durably hand off", "durably appended", "authenticated HTTP", "stable billable intent", "durable allocation intent ID", "Authorize by tenant", "as-of age", "Persist the command", "stable event ID", "expectedRevision matches", "atomic inventory claim", "idempotently", "newer"],
  B04: ["Durably enqueue", "durable allocation intent", "bounded authorized page synchronously", "synchronously", "Durably accept", "Durably enqueue one delivery", "compare-and-swap", "Claim stock atomically", "idempotently", "authoritative price synchronously", "authorization checks enforce it", "durable transcode job ID", "stored records readable", "atomic guard", "Return search results synchronously", "urgent routing capacity", "original payment intent"],
  B05: ["stable SKU-and-unit keyset cursor", "completion time plus module ID", "immutable price revisions", "authenticated account", "creation time and job ID", "policy revision 72", "start time plus slot ID", "filters, sort, index watermark", "urgency and arrival sequence", "UNKNOWN intents", "bounded fairness rule", "same export ID", "same accounting cutoff", "event time and event ID", "delivery ID and attempt sequence", "ledger sequence cutoff", "carrier history in carrier revision order"],
  B06: ["versioned cursor contract", "optional etaConfidence", "nonterminal 503 plus status Location", "safe absent-priority rule", "v1 exports immutable", "versioned amount representation", "deviceMetadata optional", "RETRY_PENDING", "authenticated actor IDs", "Quarantine revisionless carrier events", "Hold unmatched legacy retries UNKNOWN", "stable intent", "authenticated identity", "404 for missing and 503 for unavailable", "Stage gateway and device support", "compatible payload version"],
  B07: ["one retry owner", "same operation ID", "same event identity", "existing extraction operation", "same allocation intent", "Propagate cancellation", "explicitly transient source failures", "same device sequence ID", "one sender", "original expected revision", "atomically", "one service own", "same revision precondition", "pending until", "independently", "explicit rollback result", "same booking intent"],
  B08: ["per-device bounded admission", "each partner’s attempt budget", "per-tenant fair admission", "Bound the reserve queue", "per-account budget", "Give each merchant a publish budget", "per-user security budgets", "weighted fair worker admission", "by cohort and rate", "per booking resource", "separately", "reserved urgent route lane", "tenant attempt limits", "durable admission", "per tenant and period", "per-tenant cost budget"],
  B09: ["GPU transcode jobs separately", "flag rules and their audit record", "transactional booking owner", "separate projection", "Isolate bursty batch planning", "one owner", "durable high-risk admission", "immutable export identity", "bounded read projection", "Split telemetry ingestion from interactive query capacity", "delivery workers", "authenticated immutable audit append", "carrier event ordering", "billable intent identity", "seat reservation atomicity", "tenant-aware source owner", "source owner", "device sequence/dedup"],
};
const idOffsets = { B02: 16, B03: 17, B04: 17, B05: 17, B06: 16, B07: 17, B08: 16, B09: 18 };
const ids = Object.keys(expectedAnswers);
const questionsByUnit = Object.fromEntries(ids.map((unit) => {
  const unitNumber = unit.slice(1);
  const file = `BESD-N02-${unit}.json`;
  const questions = JSON.parse(readFileSync(path.join(unitDirectory, file), "utf8"));
  return [unit, questions];
}));
const allQuestions = ids.flatMap((unit) => questionsByUnit[unit]);

function optionFor(question, optionId) {
  const option = question.interaction.options.find((candidate) => candidate.optionId === optionId);
  assert.ok(option, `${question.questionId}: expected option ${optionId} exists`);
  return option;
}

function feedbackFor(question, optionId) {
  return question.feedback.messages.find((message) => message.kind === "wrong_option" && message.targetId === optionId);
}

test("the 134 repaired rows keep the approved unit offsets and reviewed single-choice decisions", () => {
  assert.equal(allQuestions.length, 134);
  let correctChoicesThatAreLongest = 0;
  for (const unit of ids) {
    const questions = questionsByUnit[unit];
    assert.equal(questions.length, expectedAnswers[unit].length, `${unit} row count`);
    questions.forEach((question, index) => {
      const label = `${unit} row ${index + 1}`;
      assert.equal(question.questionId, `besd-n02-${unit.toLowerCase()}-i${String(index + 1 + idOffsets[unit]).padStart(3, "0")}`, `${label} identity`);
      assert.equal(question.answer.optionId, expectedAnswers[unit][index], `${label} accepted decision`);
      assert.ok(question.prompt.includes(criticalFacts[unit][index]), `${label} preserves decisive scenario fact: ${criticalFacts[unit][index]}`);
      assert.equal(question.interaction.type, "choice_single", `${label} interaction type`);
      assert.equal(question.interaction.options.length, 5, `${label} option count`);
      assert.equal(question.interaction.options.filter((option) => option.optionId === question.answer.optionId).length, 1, `${label} has one keyed option`);
      const validation = validateQuestion(question);
      assert.equal(validation.valid, true, `${label} canonical contract: ${validation.errors.join("; ")}`);
      assert.equal(Object.hasOwn(question, "constraints"), false, `${label} has no answer-revealing editorial constraints`);
      const correctText = optionFor(question, question.answer.optionId).text;
      assert.equal(question.prompt.includes(correctText), false, `${label} does not copy the answer into its prompt`);
      if (correctText.length >= Math.max(...question.interaction.options.filter((option) => option.optionId !== question.answer.optionId).map((option) => option.text.length))) correctChoicesThatAreLongest += 1;
    });
  }
  assert.ok(correctChoicesThatAreLongest < allQuestions.length / 2, "correct choices are not systematically the longest option");
});

test("each row scores its concrete accepted choice and every wrong candidate as a negative case", () => {
  for (const unit of ids) {
    for (const [index, question] of questionsByUnit[unit].entries()) {
      const label = `${question.questionId} — ${question.prompt}`;
      const correctId = expectedAnswers[unit][index];
      const correctOption = optionFor(question, correctId);
      const mechanism = requiredMechanisms[unit][index];
      assert.ok(correctOption.text.includes(mechanism), `${label}: preserves the decision mechanism “${mechanism}”`);
      const nearest = nearestCounterexamples[unit][index];
      const nearestOption = optionFor(question, nearest.optionId);
      assert.notEqual(nearestOption.optionId, correctId, `${label}: nearest counterexample is not accepted`);
      const nearestFeedback = feedbackFor(question, nearest.optionId);
      assert.ok(nearestFeedback?.text?.startsWith(nearest.feedbackNeedle), `${label}: nearest counterexample feedback preserves its causal explanation`);
      const shuffled = {
        ...question,
        interaction: {
          ...question.interaction,
          options: [...question.interaction.options].reverse(),
        },
      };

      const nearestNegative = scoreQuestion(shuffled, { type: "choice_single", optionId: nearest.optionId });
      assert.equal(nearestNegative.earnedPoints, 0, `${label}: concrete counterexample “${nearestOption.text}” remains incorrect`);
      const accepted = scoreQuestion(shuffled, { type: "choice_single", optionId: correctId });
      assert.equal(accepted.earnedPoints, 1, `${label}: accepted scenario scores`);
      assert.equal(accepted.maxPoints, 1, `${label}: single-choice score ceiling`);
      assert.equal(accepted.correctOptionId, correctId, `${label}: correct identity remains stable after shuffle`);

      for (const option of question.interaction.options) {
        if (option.optionId === correctId) continue;
        const rejected = scoreQuestion(shuffled, { type: "choice_single", optionId: option.optionId });
        assert.equal(rejected.earnedPoints, 0, `${label}: counterexample “${option.text}” stays incorrect after shuffle`);
        const feedback = feedbackFor(question, option.optionId);
        assert.ok(feedback?.text?.trim(), `${label}: counterexample “${option.text}” has causal feedback`);
        assert.notEqual(feedback.text, correctOption.text, `${label}: wrong feedback does not expose the accepted option verbatim`);
        assert.equal(feedbackFor(shuffled, option.optionId).text, feedback.text, `${label}: wrong feedback is stable after shuffle`);
      }
    }
  }
});

test("answer keys and feedback do not contain the retired generic marker or inherited broad references", () => {
  const inheritedReferences = new Set([
    "https://spec.openapis.org/oas/latest.html",
    "https://grpc.io/docs/what-is-grpc/introduction/",
    "https://amazon.jobs/content/en/how-we-hire/sde-ii-interview-prep",
    "https://docs.cloud.google.com/architecture/framework",
  ]);
  for (const question of allQuestions) {
    assert.notEqual(question.answer.optionId, "primary_decision");
    assert.equal(question.interaction.options.some((option) => option.optionId === "primary_decision"), false);
    assert.equal(question.feedback.messages.some((message) => message.targetId === question.answer.optionId), false);
    assert.equal(question.feedback.messages.some((message) => /primary decision is|the distractors either/i.test(message.text)), false);
    for (const reference of question.sourceRefs ?? []) {
      assert.equal(inheritedReferences.has(reference), false, `${question.questionId}: broad inherited source ${reference}`);
    }
  }
});

test("B01 source remains byte-for-byte unchanged", () => {
  const b01Path = path.join(unitDirectory, "BESD-N02-B01.json");
  const digest = createHash("sha256").update(readFileSync(b01Path)).digest("hex");
  assert.equal(digest, "f73d88f77618599892473b17848e9e01947277ab56304795343abaa188713a89");
});
