# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / explorer_azcopy_transfer

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/explorer_azcopy_transfer.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:explorer_azcopy_transfer:preserve_metadata_completion_during_data_movement:slot:resume-interrupted-azcopy-job

- Status: authoring-admitted
- Objective: Resume the recorded AzCopy job rather than restarting an already-partial transfer without review.
- Expected decision: Resume after correcting the cause and revalidate the final summary.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:explorer_azcopy_transfer:preserve_metadata_completion_during_data_movement:slot:select-copy-flags-to-preserve-properties

- Status: authoring-admitted
- Objective: Set copy options for the metadata, properties, tags, access tier, or ACLs that the destination must preserve.
- Expected decision: Copy only supported attributes and record intentional transformations.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:explorer_azcopy_transfer:preserve_metadata_completion_during_data_movement:slot:validate-transfer-job-status-and-failed-count

- Status: authoring-admitted
- Objective: Use the AzCopy job summary and failed-transfer list before declaring a migration complete.
- Expected decision: Retry or disposition every failed item and reconcile destination counts.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:explorer_azcopy_transfer:storage_explorer_azcopy_managed_transfer_path_volume_automation_authentication_needs:slot:select-azcopy-for-scripted-bulk-transfer

- Status: authoring-admitted
- Objective: Use AzCopy for repeatable high-throughput copy or sync between supported storage endpoints.
- Expected decision: Run AzCopy with the least-privilege Entra or SAS authorization.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:explorer_azcopy_transfer:storage_explorer_azcopy_managed_transfer_path_volume_automation_authentication_needs:slot:select-managed-import-export-path-for-offline-volume

- Status: authoring-admitted
- Objective: Use Azure Import/Export when offline disk shipment is justified by data volume or network limits and the service supports the direction.
- Expected decision: Create and track the Import/Export job rather than misusing AzCopy for an infeasible network window.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:explorer_azcopy_transfer:storage_explorer_azcopy_managed_transfer_path_volume_automation_authentication_needs:slot:select-server-to-server-copy-with-sas-or-entra

- Status: authoring-admitted
- Objective: Use server-side copy when Azure Storage can read the source directly without routing bytes through the operator host.
- Expected decision: Provide bounded source access and authorize the destination write.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:explorer_azcopy_transfer:storage_explorer_azcopy_managed_transfer_path_volume_automation_authentication_needs:slot:select-storage-explorer-for-interactive-inspection

- Status: authoring-admitted
- Objective: Use Storage Explorer for an operator-driven inspection or small transfer requiring visual browsing.
- Expected decision: Use an authenticated Storage Explorer session rather than building automation.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
