# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / backup_and_restore

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/backup_and_restore.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:backup_and_restore:classify_backup_and_restore_evidence:slot:diagnose-restore-blocked-by-network-or-key-dependency

- Status: authoring-admitted
- Objective: Identify restore failure caused by inaccessible key, storage, subscription, network, or identity dependency.
- Expected decision: Restore the dependency access before retrying; do not choose an unrelated recovery point.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:backup_and_restore:classify_backup_and_restore_evidence:slot:select-disk-restore-for-controlled-rebuild

- Status: authoring-admitted
- Objective: Choose disk restore when operators need recovered disks for inspection or a controlled VM rebuild.
- Expected decision: Restore disks, build the VM deliberately, and validate dependencies.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:backup_and_restore:classify_backup_and_restore_evidence:slot:select-file-recovery-for-item-level-need

- Status: authoring-admitted
- Objective: Choose file recovery when only specific files/folders are required and the workload supports item-level recovery.
- Expected decision: Mount/download the recovery view and copy only required items.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:backup_and_restore:classify_backup_and_restore_evidence:slot:select-full-vm-restore-for-machine-recovery

- Status: authoring-admitted
- Objective: Choose full VM restore when a bootable VM and associated configuration must be recreated.
- Expected decision: Restore to an isolated or approved destination and validate boot/service health.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:backup_and_restore:classify_backup_and_restore_evidence:slot:verify-backup-job-completed-before-recovery-claim

- Status: authoring-admitted
- Objective: Confirm a successful backup job and usable recovery point exist for the item.
- Expected decision: Select only a completed recovery point for restoration.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
