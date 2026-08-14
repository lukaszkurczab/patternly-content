# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / product_deploy_and_load

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 13
- Authoring-admitted slots: 13
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/product_deploy_and_load.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:product_deploy_and_load:managed_data_product_ingestion_path_data_shape_latency_operations_needs:slot:batch-load-choice

- Status: authoring-admitted
- Objective: product deploy and load — batch load decision: select “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion” under “Source files arrive in bounded windows, freshness is not continuous, and volume is large” rather than the competing action “Use Datastream CDC; do not treat periodic file loads as equivalent”.
- Expected decision: Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion.
- Decisive boundary: product deploy and load — batch load: evidence “Source files arrive in bounded windows, freshness is not continuous, and volume is large” is decisive for “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”. Evidence “A supported operational database must replicate row-level changes to BigQuery with near-real-time freshness” instead supports the competing boundary “Use Datastream CDC; do not treat periodic file loads as equivalent”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:managed_data_product_ingestion_path_data_shape_latency_operations_needs:slot:change-data-capture-boundary

- Status: authoring-admitted
- Objective: product deploy and load — change data capture boundary test: determine that “A supported operational database must replicate row-level changes to BigQuery with near-real-time freshness” supports “Use Datastream CDC; do not treat periodic file loads as equivalent” and has not crossed into “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”.
- Expected decision: Use Datastream CDC; do not treat periodic file loads as equivalent.
- Decisive boundary: product deploy and load — change data capture: evidence “A supported operational database must replicate row-level changes to BigQuery with near-real-time freshness” is decisive for “Use Datastream CDC; do not treat periodic file loads as equivalent”. Evidence “Source files arrive in bounded windows, freshness is not continuous, and volume is large” instead supports the competing decision “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:managed_data_product_ingestion_path_data_shape_latency_operations_needs:slot:data-arrival-transfer

- Status: authoring-admitted
- Objective: product deploy and load — data arrival constraint transfer: move to “Transfer between batch loading and streaming ingestion when arrival cadence changes materially” after “The source changes from periodic files to continuously emitted events, or back again”, while distinguishing the different transfer “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”.
- Expected decision: Transfer between batch loading and streaming ingestion when arrival cadence changes materially.
- Decisive boundary: product deploy and load — data arrival: evidence “The source changes from periodic files to continuously emitted events, or back again” is decisive for “Transfer between batch loading and streaming ingestion when arrival cadence changes materially”. Evidence “Source files arrive in bounded windows, freshness is not continuous, and volume is large” instead supports the competing decision “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:managed_data_product_ingestion_path_data_shape_latency_operations_needs:slot:latency-operations-comparison

- Status: authoring-admitted
- Objective: product deploy and load — latency operations comparison capability recognition: connect “The same data shape is evaluated under interactive SQL, transactional relational, document, and wide-column access plus operator burden” to “Select BigQuery, Cloud SQL, Firestore, or Bigtable from access pattern, latency, consistency, and administration needs” and reject the neighboring capability response “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”.
- Expected decision: Select BigQuery, Cloud SQL, Firestore, or Bigtable from access pattern, latency, consistency, and administration needs.
- Decisive boundary: product deploy and load — latency operations comparison: evidence “The same data shape is evaluated under interactive SQL, transactional relational, document, and wide-column access plus operator burden” is decisive for “Select BigQuery, Cloud SQL, Firestore, or Bigtable from access pattern, latency, consistency, and administration needs”. Evidence “Source files arrive in bounded windows, freshness is not continuous, and volume is large” instead supports the competing decision “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:managed_data_product_ingestion_path_data_shape_latency_operations_needs:slot:managed-product-shape-choice

- Status: authoring-admitted
- Objective: product deploy and load — managed product shape decision: select “Map the workload to the managed product whose native model satisfies it” under “Relational transactions, document access, wide-key low-latency access, or analytical scans are the decisive workload shape” rather than the competing action “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”.
- Expected decision: Map the workload to the managed product whose native model satisfies it.
- Decisive boundary: product deploy and load — managed product shape: evidence “Relational transactions, document access, wide-key low-latency access, or analytical scans are the decisive workload shape” is decisive for “Map the workload to the managed product whose native model satisfies it”. Evidence “Source files arrive in bounded windows, freshness is not continuous, and volume is large” instead supports the competing decision “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:managed_data_product_ingestion_path_data_shape_latency_operations_needs:slot:pubsub-ingestion-path

- Status: authoring-admitted
- Objective: product deploy and load — pubsub ingestion path procedure: order or execute “Use a BigQuery subscription; introduce Dataflow only when custom preprocessing is required” when “Messages already arrive through Pub/Sub and require direct near-real-time delivery to BigQuery without custom transforms”; separate it from the neighboring procedure “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”.
- Expected decision: Use a BigQuery subscription; introduce Dataflow only when custom preprocessing is required.
- Decisive boundary: product deploy and load — pubsub ingestion path: evidence “Messages already arrive through Pub/Sub and require direct near-real-time delivery to BigQuery without custom transforms” is decisive for “Use a BigQuery subscription; introduce Dataflow only when custom preprocessing is required”. Evidence “Source files arrive in bounded windows, freshness is not continuous, and volume is large” instead supports the competing decision “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:managed_data_product_ingestion_path_data_shape_latency_operations_needs:slot:streaming-ingestion-choice

- Status: authoring-admitted
- Objective: product deploy and load — streaming ingestion decision: select “Use Dataflow or the Storage Write API according to the transformation requirement” under “A custom streaming source needs preprocessing or high-throughput writes before BigQuery ingestion” rather than the competing action “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”.
- Expected decision: Use Dataflow or the Storage Write API according to the transformation requirement.
- Decisive boundary: product deploy and load — streaming ingestion: evidence “A custom streaming source needs preprocessing or high-throughput writes before BigQuery ingestion” is decisive for “Use Dataflow or the Storage Write API according to the transformation requirement”. Evidence “Source files arrive in bounded windows, freshness is not continuous, and volume is large” instead supports the competing decision “Choose a BigQuery batch load job or scheduled transfer instead of continuous ingestion”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:schema_partitioning_write_disposition_loading_data:slot:explicit-vs-autodetect-schema

- Status: authoring-admitted
- Objective: product deploy and load — explicit vs autodetect schema capability recognition: connect “The incoming format and schema stability determine whether inference is reliable” to “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input” and reject the neighboring capability response “Supply the job's actual location or use its fully qualified job ID”.
- Expected decision: Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input.
- Decisive boundary: product deploy and load — explicit vs autodetect schema: evidence “The incoming format and schema stability determine whether inference is reliable” is decisive for “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input”. Evidence “A BigQuery load job cannot be found or acted on using a short job ID in the default location” instead supports the competing diagnosis “Supply the job's actual location or use its fully qualified job ID”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:schema_partitioning_write_disposition_loading_data:slot:job-location-diagnosis

- Status: authoring-admitted
- Objective: product deploy and load — job location failure diagnosis: trace “A BigQuery load job cannot be found or acted on using a short job ID in the default location” to “Supply the job's actual location or use its fully qualified job ID” instead of applying the competing remediation “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input”.
- Expected decision: Supply the job's actual location or use its fully qualified job ID.
- Decisive boundary: product deploy and load — job location: evidence “A BigQuery load job cannot be found or acted on using a short job ID in the default location” is decisive for “Supply the job's actual location or use its fully qualified job ID”. Evidence “The incoming format and schema stability determine whether inference is reliable” instead supports the competing capability “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:schema_partitioning_write_disposition_loading_data:slot:load-contract-transfer

- Status: authoring-admitted
- Objective: product deploy and load — load contract constraint transfer: move to “Transfer from append-compatible loading to an explicit schema migration or replacement path” after “The source schema changes from additive compatible fields to incompatible type or mode changes”, while distinguishing the different transfer “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input”.
- Expected decision: Transfer from append-compatible loading to an explicit schema migration or replacement path.
- Decisive boundary: product deploy and load — load contract: evidence “The source schema changes from additive compatible fields to incompatible type or mode changes” is decisive for “Transfer from append-compatible loading to an explicit schema migration or replacement path”. Evidence “The incoming format and schema stability determine whether inference is reliable” instead supports the competing capability “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:schema_partitioning_write_disposition_loading_data:slot:partition-field-choice

- Status: authoring-admitted
- Objective: product deploy and load — partition field decision: select “Partition on the dimension that enables partition pruning for the dominant filters” under “Queries consistently filter on one eligible date, timestamp, datetime, or integer-range dimension” rather than the competing action “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input”.
- Expected decision: Partition on the dimension that enables partition pruning for the dominant filters.
- Decisive boundary: product deploy and load — partition field: evidence “Queries consistently filter on one eligible date, timestamp, datetime, or integer-range dimension” is decisive for “Partition on the dimension that enables partition pruning for the dominant filters”. Evidence “The incoming format and schema stability determine whether inference is reliable” instead supports the competing capability “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:schema_partitioning_write_disposition_loading_data:slot:schema-compatibility-diagnosis

- Status: authoring-admitted
- Objective: product deploy and load — schema compatibility failure diagnosis: trace “A load or append fails after a source field type, mode, or name changes” to “Compare source and destination schemas and apply only supported schema evolution” instead of applying the competing remediation “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input”.
- Expected decision: Compare source and destination schemas and apply only supported schema evolution.
- Decisive boundary: product deploy and load — schema compatibility: evidence “A load or append fails after a source field type, mode, or name changes” is decisive for “Compare source and destination schemas and apply only supported schema evolution”. Evidence “The incoming format and schema stability determine whether inference is reliable” instead supports the competing capability “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:product_deploy_and_load:schema_partitioning_write_disposition_loading_data:slot:write-disposition-boundary

- Status: authoring-admitted
- Objective: product deploy and load — write disposition boundary test: determine that “The destination must either preserve rows, replace the table atomically, or reject nonempty output” supports “Choose WRITE_APPEND, WRITE_TRUNCATE, or WRITE_EMPTY from the required data-preservation contract” and has not crossed into “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input”.
- Expected decision: Choose WRITE_APPEND, WRITE_TRUNCATE, or WRITE_EMPTY from the required data-preservation contract.
- Decisive boundary: product deploy and load — write disposition: evidence “The destination must either preserve rows, replace the table atomically, or reject nonempty output” is decisive for “Choose WRITE_APPEND, WRITE_TRUNCATE, or WRITE_EMPTY from the required data-preservation contract”. Evidence “The incoming format and schema stability determine whether inference is reliable” instead supports the competing capability “Use an explicit schema for controlled contracts; use autodetect only for supported, sufficiently representative input”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
