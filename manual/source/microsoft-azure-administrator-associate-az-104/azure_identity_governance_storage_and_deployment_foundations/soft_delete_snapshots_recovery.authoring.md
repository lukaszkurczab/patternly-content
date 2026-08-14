# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / soft_delete_snapshots_recovery

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 4
- Authoring-admitted slots: 4
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/soft_delete_snapshots_recovery.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:soft_delete_snapshots_recovery:classify_soft_delete_snapshots_recovery_evidence:slot:diagnose-point-in-time-prerequisite-missing

- Status: authoring-admitted
- Objective: Identify disabled change feed, versioning, soft delete, or unsupported account features blocking point-in-time restore.
- Expected decision: Enable the complete prerequisite set for future recovery; do not promise retroactive protection.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:soft_delete_snapshots_recovery:classify_soft_delete_snapshots_recovery_evidence:slot:distinguish-blob-version-from-snapshot

- Status: authoring-admitted
- Objective: Select an automatic version for overwrite history and an explicit snapshot for a point-in-time copy created by an operation.
- Expected decision: Restore from the artifact that actually captured the required state.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:soft_delete_snapshots_recovery:classify_soft_delete_snapshots_recovery_evidence:slot:restore-soft-deleted-blob-within-retention

- Status: authoring-admitted
- Objective: Restore a soft-deleted blob or container only while its deleted state remains inside configured retention.
- Expected decision: Undelete the retained item and verify the intended current version.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:soft_delete_snapshots_recovery:classify_soft_delete_snapshots_recovery_evidence:slot:select-point-in-time-restore-for-block-blob-account

- Status: authoring-admitted
- Objective: Choose point-in-time restore for a supported block-blob account that must rewind a range to an earlier time.
- Expected decision: Submit the restore within the account's supported retention window.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
