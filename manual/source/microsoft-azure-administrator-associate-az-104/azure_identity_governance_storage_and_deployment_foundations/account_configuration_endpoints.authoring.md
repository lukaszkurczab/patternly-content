# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / account_configuration_endpoints

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/account_configuration_endpoints.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:account_configuration_endpoints:blob_file_queue_table_endpoint_account_level_configuration:slot:classify-blob-endpoint-for-object-data

- Status: authoring-admitted
- Objective: Route object and container operations to the account's blob endpoint.
- Expected decision: Use the blob endpoint and blob data authorization.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:account_configuration_endpoints:blob_file_queue_table_endpoint_account_level_configuration:slot:classify-file-endpoint-for-smb-nfs-share

- Status: authoring-admitted
- Objective: Route Azure Files SMB or NFS share operations to the file endpoint.
- Expected decision: Use the file endpoint with the protocol-specific identity and network configuration.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:account_configuration_endpoints:blob_file_queue_table_endpoint_account_level_configuration:slot:classify-queue-endpoint-for-message-storage

- Status: authoring-admitted
- Objective: Use the queue endpoint for Azure Queue Storage messages rather than blob containers or Service Bus semantics.
- Expected decision: Address the queue service endpoint for storage-queue operations.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:account_configuration_endpoints:blob_file_queue_table_endpoint_account_level_configuration:slot:classify-table-endpoint-for-key-value-entities

- Status: authoring-admitted
- Objective: Use the table endpoint for Azure Table Storage entities and partition/row keys.
- Expected decision: Address the table service endpoint with table data authorization.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:account_configuration_endpoints:storage_account_kind_performance_namespace_endpoints_workload_protocol_requirements:slot:enable-hierarchical-namespace-for-data-lake-semantics

- Status: authoring-admitted
- Objective: Enable hierarchical namespace when directory operations and Data Lake Storage semantics are required.
- Expected decision: Create the account with hierarchical namespace after checking feature compatibility.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:account_configuration_endpoints:storage_account_kind_performance_namespace_endpoints_workload_protocol_requirements:slot:select-general-purpose-v2-for-mixed-services

- Status: authoring-admitted
- Objective: Choose StorageV2 when one standard account must expose supported blob, file, queue, and table services.
- Expected decision: Create a general-purpose v2 account for the mixed-service workload.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:account_configuration_endpoints:storage_account_kind_performance_namespace_endpoints_workload_protocol_requirements:slot:select-premium-account-for-latency-iops-requirement

- Status: authoring-admitted
- Objective: Choose the premium account type that matches the required service and provisioned performance model.
- Expected decision: Use the premium account kind supported by the workload rather than assuming one premium kind serves every protocol.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:account_configuration_endpoints:storage_account_kind_performance_namespace_endpoints_workload_protocol_requirements:slot:validate-region-and-redundancy-availability

- Status: authoring-admitted
- Objective: Confirm the selected account kind and redundancy option are offered in the deployment region.
- Expected decision: Change the region or redundancy choice before deployment when the combination is unsupported.
- Decisive boundary: A generally available redundancy option is not necessarily supported for every account kind in every region.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
