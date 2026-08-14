# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / metrics_logs_queries

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/metrics_logs_queries.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:metrics_logs_queries:azure_monitor_metrics_logs_kql_queries_signal_type_retention_investigation_need:slot:configure-diagnostic-settings-for-resource-logs

- Status: authoring-admitted
- Objective: Create diagnostic settings when a resource's logs or selected metrics must be routed to Log Analytics, Storage, or Event Hubs.
- Expected decision: Route only required categories and verify records arrive.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:metrics_logs_queries:azure_monitor_metrics_logs_kql_queries_signal_type_retention_investigation_need:slot:diagnose-log-query-scope-versus-workspace-scope

- Status: authoring-admitted
- Objective: Recognize an empty query caused by querying the wrong workspace or resource scope.
- Expected decision: Run the query against the workspace receiving the diagnostic data.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:metrics_logs_queries:azure_monitor_metrics_logs_kql_queries_signal_type_retention_investigation_need:slot:distinguish-platform-metric-retention-from-log-workspace-retention

- Status: authoring-admitted
- Objective: Separate native metric retention from Log Analytics workspace retention and archive policy.
- Expected decision: Select the store and retention policy that can answer the investigation window.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:metrics_logs_queries:azure_monitor_metrics_logs_kql_queries_signal_type_retention_investigation_need:slot:select-kql-for-log-query-and-correlation

- Status: authoring-admitted
- Objective: Use Logs and KQL when record-level fields, longer workspace retention, joins, or cross-resource correlation are required.
- Expected decision: Write a scoped KQL query over the ingested records.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:metrics_logs_queries:azure_monitor_metrics_logs_kql_queries_signal_type_retention_investigation_need:slot:select-metric-for-numeric-time-series

- Status: authoring-admitted
- Objective: Use Azure Monitor metrics for platform numeric time series requiring low-latency aggregation and dimensions.
- Expected decision: Query or chart the metric rather than ingesting a log solely for numeric trend.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:metrics_logs_queries:correlate_resource_application_evidence_correct_time_range_dimensions:slot:align-query-time-range-with-incident-window

- Status: authoring-admitted
- Objective: Set the metric and log query window to include the incident, ingestion delay, and relevant pre-failure baseline.
- Expected decision: Compare signals over one aligned window.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:metrics_logs_queries:correlate_resource_application_evidence_correct_time_range_dimensions:slot:correlate-activity-log-with-resource-log

- Status: authoring-admitted
- Objective: Join a control-plane change from Activity Log to subsequent service/resource evidence using resource, correlation, and time context.
- Expected decision: Support or reject the change-caused-incident hypothesis with both planes.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:metrics_logs_queries:correlate_resource_application_evidence_correct_time_range_dimensions:slot:filter-by-resource-id-and-subscription

- Status: authoring-admitted
- Objective: Filter records by full Azure resource ID and subscription to avoid mixing same-named resources.
- Expected decision: Attribute evidence to the exact resource instance.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:metrics_logs_queries:correlate_resource_application_evidence_correct_time_range_dimensions:slot:split-metric-by-relevant-dimension

- Status: authoring-admitted
- Objective: Split a metric by the dimension that isolates the affected instance, status code, or operation.
- Expected decision: Identify the dimension carrying the anomaly before scaling or restarting.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
