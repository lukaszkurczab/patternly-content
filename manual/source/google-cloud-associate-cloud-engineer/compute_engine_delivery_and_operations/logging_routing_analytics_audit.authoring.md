# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / logging_routing_analytics_audit

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/logging_routing_analytics_audit.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:audit_logs_admin_data_access_system_activity_evidence:slot:admin-activity-classification

- Status: authoring-admitted
- Objective: logging routing analytics audit — admin activity classification: use “A user-driven API call modifies resource configuration or metadata” to classify “Classify it as Admin Activity, which is always written and cannot be disabled”, while distinguishing the competing classification “Transfer to Admin Activity, Data Access, System Event, or Policy Denied logs”.
- Expected decision: Classify it as Admin Activity, which is always written and cannot be disabled.
- Decisive boundary: logging routing analytics audit — admin activity: evidence “A user-driven API call modifies resource configuration or metadata” is decisive for “Classify it as Admin Activity, which is always written and cannot be disabled”. Evidence “The audit need changes among configuration changes, data reads/writes, system-driven changes, and security-policy denials” instead supports the competing transfer “Transfer to Admin Activity, Data Access, System Event, or Policy Denied logs”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:audit_logs_admin_data_access_system_activity_evidence:slot:audit-requirement-transfer

- Status: authoring-admitted
- Objective: logging routing analytics audit — audit requirement constraint transfer: move to “Transfer to Admin Activity, Data Access, System Event, or Policy Denied logs” after “The audit need changes among configuration changes, data reads/writes, system-driven changes, and security-policy denials”, while distinguishing the different transfer “Classify it as Admin Activity, which is always written and cannot be disabled”.
- Expected decision: Transfer to Admin Activity, Data Access, System Event, or Policy Denied logs.
- Decisive boundary: logging routing analytics audit — audit requirement: evidence “The audit need changes among configuration changes, data reads/writes, system-driven changes, and security-policy denials” is decisive for “Transfer to Admin Activity, Data Access, System Event, or Policy Denied logs”. Evidence “A user-driven API call modifies resource configuration or metadata” instead supports the competing classification “Classify it as Admin Activity, which is always written and cannot be disabled”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:audit_logs_admin_data_access_system_activity_evidence:slot:data-access-classification

- Status: authoring-admitted
- Objective: logging routing analytics audit — data access classification: use “An API reads configuration/metadata or creates, reads, or modifies user-provided data” to classify “Classify it as Data Access and account for service-specific defaults”, while distinguishing the competing classification “Classify it as Admin Activity, which is always written and cannot be disabled”.
- Expected decision: Classify it as Data Access and account for service-specific defaults.
- Decisive boundary: logging routing analytics audit — data access: evidence “An API reads configuration/metadata or creates, reads, or modifies user-provided data” is decisive for “Classify it as Data Access and account for service-specific defaults”. Evidence “A user-driven API call modifies resource configuration or metadata” instead supports the competing classification “Classify it as Admin Activity, which is always written and cannot be disabled”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:audit_logs_admin_data_access_system_activity_evidence:slot:data-access-enablement-diagnosis

- Status: authoring-admitted
- Objective: logging routing analytics audit — data access enablement failure diagnosis: trace “Expected non-BigQuery Data Access entries are absent while other audit logs exist” to “Verify Data Access audit logging is explicitly enabled and the viewer has private-log access” instead of applying the competing remediation “Classify it as Admin Activity, which is always written and cannot be disabled”.
- Expected decision: Verify Data Access audit logging is explicitly enabled and the viewer has private-log access.
- Decisive boundary: logging routing analytics audit — data access enablement: evidence “Expected non-BigQuery Data Access entries are absent while other audit logs exist” is decisive for “Verify Data Access audit logging is explicitly enabled and the viewer has private-log access”. Evidence “A user-driven API call modifies resource configuration or metadata” instead supports the competing classification “Classify it as Admin Activity, which is always written and cannot be disabled”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:audit_logs_admin_data_access_system_activity_evidence:slot:policy-denied-classification

- Status: authoring-admitted
- Objective: logging routing analytics audit — policy denied classification: use “A user or service account is denied because of a security-policy violation” to classify “Classify the entry as Policy Denied”, while distinguishing the competing classification “Classify it as Admin Activity, which is always written and cannot be disabled”.
- Expected decision: Classify the entry as Policy Denied.
- Decisive boundary: logging routing analytics audit — policy denied: evidence “A user or service account is denied because of a security-policy violation” is decisive for “Classify the entry as Policy Denied”. Evidence “A user-driven API call modifies resource configuration or metadata” instead supports the competing classification “Classify it as Admin Activity, which is always written and cannot be disabled”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:audit_logs_admin_data_access_system_activity_evidence:slot:system-event-classification

- Status: authoring-admitted
- Objective: logging routing analytics audit — system event classification: use “Google Cloud, not a direct user action, modifies a resource, such as autoscaling a MIG” to classify “Classify it as System Event, which is always written”, while distinguishing the competing classification “Classify it as Admin Activity, which is always written and cannot be disabled”.
- Expected decision: Classify it as System Event, which is always written.
- Decisive boundary: logging routing analytics audit — system event: evidence “Google Cloud, not a direct user action, modifies a resource, such as autoscaling a MIG” is decisive for “Classify it as System Event, which is always written”. Evidence “A user-driven API call modifies resource configuration or metadata” instead supports the competing classification “Classify it as Admin Activity, which is always written and cannot be disabled”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:route_logs_correct_sink_destination_retention_analysis_path:slot:aggregated-sink-scope

- Status: authoring-admitted
- Objective: logging routing analytics audit — aggregated sink scope classification: use “Logs from all projects under a folder or organization must reach one destination” to classify “Use an aggregated sink at the parent scope with include-children semantics”, while distinguishing the competing classification “Transfer the sink destination and retention design to the new analysis path”.
- Expected decision: Use an aggregated sink at the parent scope with include-children semantics.
- Decisive boundary: logging routing analytics audit — aggregated sink scope: evidence “Logs from all projects under a folder or organization must reach one destination” is decisive for “Use an aggregated sink at the parent scope with include-children semantics”. Evidence “The consumer changes among long-term Logging analysis, BigQuery SQL analysis, Pub/Sub streaming, and external storage” instead supports the competing transfer “Transfer the sink destination and retention design to the new analysis path”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:route_logs_correct_sink_destination_retention_analysis_path:slot:analysis-requirement-transfer

- Status: authoring-admitted
- Objective: logging routing analytics audit — analysis requirement constraint transfer: move to “Transfer the sink destination and retention design to the new analysis path” after “The consumer changes among long-term Logging analysis, BigQuery SQL analysis, Pub/Sub streaming, and external storage”, while distinguishing the different transfer “Use an aggregated sink at the parent scope with include-children semantics”.
- Expected decision: Transfer the sink destination and retention design to the new analysis path.
- Decisive boundary: logging routing analytics audit — analysis requirement: evidence “The consumer changes among long-term Logging analysis, BigQuery SQL analysis, Pub/Sub streaming, and external storage” is decisive for “Transfer the sink destination and retention design to the new analysis path”. Evidence “Logs from all projects under a folder or organization must reach one destination” instead supports the competing classification “Use an aggregated sink at the parent scope with include-children semantics”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:route_logs_correct_sink_destination_retention_analysis_path:slot:destination-type-choice

- Status: authoring-admitted
- Objective: logging routing analytics audit — destination type decision: select “Choose the supported sink destination that matches retention and consumption” under “The required consumer is a log bucket, BigQuery dataset, Cloud Storage bucket, or Pub/Sub topic” rather than the competing action “Use an aggregated sink at the parent scope with include-children semantics”.
- Expected decision: Choose the supported sink destination that matches retention and consumption.
- Decisive boundary: logging routing analytics audit — destination type: evidence “The required consumer is a log bucket, BigQuery dataset, Cloud Storage bucket, or Pub/Sub topic” is decisive for “Choose the supported sink destination that matches retention and consumption”. Evidence “Logs from all projects under a folder or organization must reach one destination” instead supports the competing classification “Use an aggregated sink at the parent scope with include-children semantics”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:route_logs_correct_sink_destination_retention_analysis_path:slot:log-bucket-retention-choice

- Status: authoring-admitted
- Objective: logging routing analytics audit — log bucket retention decision: select “Set log-bucket retention to that window and account for cost” under “Logs must remain queryable in Cloud Logging for a defined compliance or investigation window” rather than the competing action “Use an aggregated sink at the parent scope with include-children semantics”.
- Expected decision: Set log-bucket retention to that window and account for cost.
- Decisive boundary: logging routing analytics audit — log bucket retention: evidence “Logs must remain queryable in Cloud Logging for a defined compliance or investigation window” is decisive for “Set log-bucket retention to that window and account for cost”. Evidence “Logs from all projects under a folder or organization must reach one destination” instead supports the competing classification “Use an aggregated sink at the parent scope with include-children semantics”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:route_logs_correct_sink_destination_retention_analysis_path:slot:sink-filter-choice

- Status: authoring-admitted
- Objective: logging routing analytics audit — sink filter decision: select “Use an inclusion filter and focused exclusions in one coherent sink policy” under “Only entries matching specific resource, log name, severity, or payload criteria should be routed” rather than the competing action “Use an aggregated sink at the parent scope with include-children semantics”.
- Expected decision: Use an inclusion filter and focused exclusions in one coherent sink policy.
- Decisive boundary: logging routing analytics audit — sink filter: evidence “Only entries matching specific resource, log name, severity, or payload criteria should be routed” is decisive for “Use an inclusion filter and focused exclusions in one coherent sink policy”. Evidence “Logs from all projects under a folder or organization must reach one destination” instead supports the competing classification “Use an aggregated sink at the parent scope with include-children semantics”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:logging_routing_analytics_audit:route_logs_correct_sink_destination_retention_analysis_path:slot:writer-identity-diagnosis

- Status: authoring-admitted
- Objective: logging routing analytics audit — writer identity failure diagnosis: trace “A sink is configured but the destination receives no matching logs and the filter is correct” to “Grant the sink's writer identity permission on the destination” instead of applying the competing remediation “Use an aggregated sink at the parent scope with include-children semantics”.
- Expected decision: Grant the sink's writer identity permission on the destination.
- Decisive boundary: logging routing analytics audit — writer identity: evidence “A sink is configured but the destination receives no matching logs and the filter is correct” is decisive for “Grant the sink's writer identity permission on the destination”. Evidence “Logs from all projects under a folder or organization must reach one destination” instead supports the competing classification “Use an aggregated sink at the parent scope with include-children semantics”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
