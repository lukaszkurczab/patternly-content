# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / data_model_engine_selection

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 13
- Authoring-admitted slots: 13
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/data_model_engine_selection.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:data_model_engine_selection:relational_key_value_document_graph_time_series_warehouse_services_access_patterns_consi:slot:consistency-boundary

- Status: authoring-admitted
- Objective: Assess whether the evidence “the service's consistency and transaction semantics do not meet the write invariant” supports the owned resolution “reject the engine despite model fit”.
- Expected decision: reject the engine despite model fit
- Decisive boundary: This slot owns the boundary established by the service's consistency and transaction semantics do not meet the write invariant; it resolves only to “reject the engine despite model fit” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:relational_key_value_document_graph_time_series_warehouse_services_access_patterns_consi:slot:document-model

- Status: authoring-admitted
- Objective: Assess whether the evidence “documents with flexible nested attributes are the primary aggregate” supports the owned resolution “use a document database where its query model fits”.
- Expected decision: use a document database where its query model fits
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:relational_key_value_document_graph_time_series_warehouse_services_access_patterns_consi:slot:graph-traversal

- Status: authoring-admitted
- Objective: Assess whether the evidence “multi-hop relationship traversal is central” supports the owned resolution “use Neptune or another graph model”.
- Expected decision: use Neptune or another graph model
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:relational_key_value_document_graph_time_series_warehouse_services_access_patterns_consi:slot:key-value-scale

- Status: authoring-admitted
- Objective: Assess whether the evidence “known key access at large scale dominates” supports the owned resolution “use DynamoDB or another key-value design”.
- Expected decision: use DynamoDB or another key-value design
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:relational_key_value_document_graph_time_series_warehouse_services_access_patterns_consi:slot:relational-transactions

- Status: authoring-admitted
- Objective: Assess whether the evidence “joins, relational constraints, and multi-row transactions dominate” supports the owned resolution “use a relational database”.
- Expected decision: use a relational database
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:relational_key_value_document_graph_time_series_warehouse_services_access_patterns_consi:slot:time-series

- Status: authoring-admitted
- Objective: Assess whether the evidence “time-ordered measurements and retention queries dominate” supports the owned resolution “use Timestream where supported”.
- Expected decision: use Timestream where supported
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:relational_key_value_document_graph_time_series_warehouse_services_access_patterns_consi:slot:warehouse-analytics

- Status: authoring-admitted
- Objective: Assess whether the evidence “columnar scans and analytic aggregation dominate” supports the owned resolution “use Redshift or an analytic warehouse”.
- Expected decision: use Redshift or an analytic warehouse
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:route_oltp_writes_scale_scans_architectures_suited_each_workload:slot:bi-columnar-scan

- Status: authoring-admitted
- Objective: Assess whether the evidence “large aggregations scan many rows and few columns” supports the owned resolution “route analytics to a columnar warehouse”.
- Expected decision: route analytics to a columnar warehouse
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:route_oltp_writes_scale_scans_architectures_suited_each_workload:slot:freshness-vs-offload

- Status: authoring-admitted
- Objective: Assess whether the evidence “the BI result requires current transactional state” supports the owned resolution “choose a pipeline whose latency meets freshness needs”.
- Expected decision: choose a pipeline whose latency meets freshness needs
- Decisive boundary: This slot owns the boundary established by the BI result requires current transactional state; it resolves only to “choose a pipeline whose latency meets freshness needs” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:route_oltp_writes_scale_scans_architectures_suited_each_workload:slot:oltp-write-path

- Status: authoring-admitted
- Objective: Assess whether the evidence “short selective transactions and indexed writes dominate” supports the owned resolution “keep writes on an OLTP engine”.
- Expected decision: keep writes on an OLTP engine
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:route_oltp_writes_scale_scans_architectures_suited_each_workload:slot:operational-export

- Status: authoring-admitted
- Objective: Assess whether the evidence “analytics must not overload the production writer” supports the owned resolution “replicate or export data to the analytic path”.
- Expected decision: replicate or export data to the analytic path
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:route_oltp_writes_scale_scans_architectures_suited_each_workload:slot:reader-contention

- Status: authoring-admitted
- Objective: Assess whether the evidence “BI scans exhaust buffers or I/O on the writer” supports the owned resolution “diagnose mixed-workload contention”.
- Expected decision: diagnose mixed-workload contention
- Decisive boundary: This slot owns the boundary established by BI scans exhaust buffers or I/O on the writer; it resolves only to “diagnose mixed-workload contention” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:data_model_engine_selection:route_oltp_writes_scale_scans_architectures_suited_each_workload:slot:workload-growth

- Status: authoring-admitted
- Objective: Assess whether the evidence “occasional reports become continuous enterprise BI” supports the owned resolution “separate the analytic architecture”.
- Expected decision: separate the analytic architecture
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
