# google-cloud-associate-cloud-engineer / setup_environment / data_and_storage_selection

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 15
- Authoring-admitted slots: 15
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/setup_environment/data_and_storage_selection.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:data_and_storage_selection:cloud_storage_persistent_disk_filestore_database_storage_access_protocol_durability:slot:availability-durability-classification

- Status: authoring-admitted
- Objective: Separate durability from availability when evaluating a storage requirement.
- Expected decision: Choose storage and location configuration that satisfies both retention of bytes and required access during failures.
- Decisive boundary: Durability protects against loss; availability describes whether the data can be reached at the required time and failure scope.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:cloud_storage_persistent_disk_filestore_database_storage_access_protocol_durability:slot:database-storage-boundary

- Status: authoring-admitted
- Objective: Recognize when query, transaction, indexing, or record-update needs require a database instead of file, block, or object storage.
- Expected decision: Select a database service when the application requires managed data-model and query semantics rather than a storage protocol alone.
- Decisive boundary: The boundary is a required data and query model, not merely the volume or durability of stored bytes.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:cloud_storage_persistent_disk_filestore_database_storage_access_protocol_durability:slot:failure-domain-transfer

- Status: authoring-admitted
- Objective: Change the storage topology when the tolerated zone or region failure changes.
- Expected decision: Select a regional or multi-region-capable storage configuration when access must survive the corresponding location failure.
- Decisive boundary: The required surviving failure domain determines whether zonal placement remains sufficient.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:cloud_storage_persistent_disk_filestore_database_storage_access_protocol_durability:slot:local-ephemeral-storage-boundary

- Status: authoring-admitted
- Objective: Reject Local SSD for data that must survive VM stop, deletion, or host failure.
- Expected decision: Use Local SSD only for reconstructible scratch or cache data; place durable VM data on Persistent Disk or another durable service.
- Decisive boundary: Reconstructibility is decisive: data without an external durable copy cannot rely on Local SSD.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:cloud_storage_persistent_disk_filestore_database_storage_access_protocol_durability:slot:object-storage-choice

- Status: authoring-admitted
- Objective: Choose Cloud Storage when applications exchange immutable or append-oriented objects through an object API.
- Expected decision: Use Cloud Storage for bucket-and-object access when clients do not require a POSIX file system or attached disk.
- Decisive boundary: An object namespace accessed through Cloud Storage APIs distinguishes this choice from VM-attached block and NFS file storage.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:cloud_storage_persistent_disk_filestore_database_storage_access_protocol_durability:slot:persistent-block-storage-choice

- Status: authoring-admitted
- Objective: Choose Persistent Disk when a Compute Engine workload needs durable block storage attached to a VM.
- Expected decision: Attach an appropriate Persistent Disk or Hyperdisk volume when the operating system or application needs durable block semantics.
- Decisive boundary: VM-attached block access is decisive; shared NFS and object APIs solve different access patterns.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:cloud_storage_persistent_disk_filestore_database_storage_access_protocol_durability:slot:shared-file-storage-choice

- Status: authoring-admitted
- Objective: Choose Filestore when multiple clients require a managed shared NFS filesystem.
- Expected decision: Use Filestore for shared file access rather than emulating a file system on object storage or attaching one block device as if it were shared.
- Decisive boundary: A managed NFS mount shared by clients is the defining requirement for Filestore.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:managed_data_service_query_consistency_requirements:slot:consistency-requirement-boundary

- Status: authoring-admitted
- Objective: Use the required read and transaction consistency as a hard boundary when choosing a managed database.
- Expected decision: Select a service whose documented consistency and transaction model satisfies the application's correctness invariant.
- Decisive boundary: A correctness requirement for strongly consistent reads or transactions cannot be traded away for a superficially similar data model.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:managed_data_service_query_consistency_requirements:slot:data-model-classification

- Status: authoring-admitted
- Objective: Classify the workload's primary model as relational rows, documents, or wide-column key ranges before comparing services.
- Expected decision: Map relational models to Cloud SQL or Spanner, document models to Firestore, and low-latency wide-column patterns to Bigtable before applying scale and consistency constraints.
- Decisive boundary: The application's authoritative data model narrows the viable services before secondary operational preferences.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:managed_data_service_query_consistency_requirements:slot:horizontal-scale-choice

- Status: authoring-admitted
- Objective: Distinguish Cloud SQL vertical instance scaling from databases designed for horizontal scale.
- Expected decision: Choose Spanner for horizontally scalable relational transactions or Bigtable for horizontally scalable key-range workloads when Cloud SQL's instance model is insufficient.
- Decisive boundary: The required scale-out model must align with both relational correctness and the workload's key-access pattern.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:managed_data_service_query_consistency_requirements:slot:latency-throughput-boundary

- Status: authoring-admitted
- Objective: Choose Bigtable only when sustained low-latency, high-throughput key-based access matches its data model.
- Expected decision: Use Bigtable for massive operational workloads organized around row keys; do not select it for relational joins or warehouse-style SQL exploration.
- Decisive boundary: Low-latency throughput is decisive only together with a compatible wide-column row-key design.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:managed_data_service_query_consistency_requirements:slot:operational-vs-analytical-choice

- Status: authoring-admitted
- Objective: Separate online application transactions from large analytical scans when choosing between operational databases and BigQuery.
- Expected decision: Use BigQuery for serverless analytical queries over large datasets; use an operational database for request-path reads, writes, and transactions.
- Decisive boundary: The dominant interaction—operational mutation or analytical scan—defines the initial service boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:managed_data_service_query_consistency_requirements:slot:query-interface-choice

- Status: authoring-admitted
- Objective: Match required query operations to the interfaces a managed data service actually exposes.
- Expected decision: Select a service whose native query interface supports the application's recurring access paths without rebuilding a database engine in application code.
- Decisive boundary: The required query operators and access paths must be native or deliberately redesigned before the service is viable.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:managed_data_service_query_consistency_requirements:slot:relational-compatibility-choice

- Status: authoring-admitted
- Objective: Choose between Cloud SQL and Spanner from relational compatibility, scale, and distribution requirements.
- Expected decision: Use Cloud SQL for supported conventional database-engine compatibility; use Spanner when horizontally scalable, highly available relational transactions outweigh engine-specific compatibility.
- Decisive boundary: Engine compatibility and horizontal/global requirements jointly decide between the relational services.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:data_and_storage_selection:managed_data_service_query_consistency_requirements:slot:requirement-change-transfer

- Status: authoring-admitted
- Objective: Re-run data-service selection when one decisive requirement changes instead of preserving the incumbent product by default.
- Expected decision: Move only after the changed requirement crosses a documented service boundary; otherwise retain the current service and avoid unnecessary migration.
- Decisive boundary: Transfer requires a named incompatibility between the new requirement and the current service, plus a service that satisfies the complete requirement set.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
