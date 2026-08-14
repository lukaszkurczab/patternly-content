# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / vaults_and_policy

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/vaults_and_policy.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:vaults_and_policy:backup_scope_schedule_retention_storage_redundancy_coherently:slot:distinguish-soft-delete-retention-from-backup-policy-retention

- Status: authoring-admitted
- Objective: Separate soft-delete protection after deletion from normal backup-policy recovery-point retention.
- Expected decision: Use the correct retention control when evaluating recoverability.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vaults_and_policy:backup_scope_schedule_retention_storage_redundancy_coherently:slot:select-vault-storage-redundancy-before-protection

- Status: authoring-admitted
- Objective: Choose vault storage redundancy before protected items make the setting immutable or constrained.
- Expected decision: Set LRS/ZRS/GRS as supported before onboarding workloads.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vaults_and_policy:backup_scope_schedule_retention_storage_redundancy_coherently:slot:set-backup-frequency-from-rpo

- Status: authoring-admitted
- Objective: Set backup frequency and schedule so the maximum interval between recovery points satisfies RPO.
- Expected decision: Configure and verify the first scheduled recovery point.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vaults_and_policy:backup_scope_schedule_retention_storage_redundancy_coherently:slot:set-retention-points-from-compliance-window

- Status: authoring-admitted
- Objective: Set daily/weekly/monthly/yearly retention to satisfy recovery and compliance without retaining every point indefinitely.
- Expected decision: Keep the required recovery points under the policy.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vaults_and_policy:recovery_services_vault_backup_vault_policy_retention_workload_recovery_requirements:slot:choose-vault-region-matching-protected-resource

- Status: authoring-admitted
- Objective: Place the vault in the region required by the protected resource and decide redundancy before protection.
- Expected decision: Create the correctly located vault before onboarding items.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vaults_and_policy:recovery_services_vault_backup_vault_policy_retention_workload_recovery_requirements:slot:distinguish-backup-from-site-recovery-workload-protection

- Status: authoring-admitted
- Objective: Use Backup for recovery points and Site Recovery for replicated workload failover/orchestration.
- Expected decision: Select the protection service matching the recovery outcome, or use both when both outcomes are required.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vaults_and_policy:recovery_services_vault_backup_vault_policy_retention_workload_recovery_requirements:slot:select-backup-vault-for-supported-modern-workload

- Status: authoring-admitted
- Objective: Use Backup vault for workloads documented on the newer Backup vault architecture, such as supported disks or blobs.
- Expected decision: Choose Backup vault rather than assuming one vault type protects all workloads.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vaults_and_policy:recovery_services_vault_backup_vault_policy_retention_workload_recovery_requirements:slot:select-policy-from-rpo-and-retention

- Status: authoring-admitted
- Objective: Choose backup frequency and retention tiers from the workload's RPO and compliance retention.
- Expected decision: Create a policy that produces and retains the required recovery points.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vaults_and_policy:recovery_services_vault_backup_vault_policy_retention_workload_recovery_requirements:slot:select-recovery-services-vault-for-supported-iaas-workload

- Status: authoring-admitted
- Objective: Use a Recovery Services vault for supported Azure VM, Azure Files, SQL/SAP-in-VM, or agent-based backup scenarios.
- Expected decision: Create the vault in the supported region and register/protect the workload.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
