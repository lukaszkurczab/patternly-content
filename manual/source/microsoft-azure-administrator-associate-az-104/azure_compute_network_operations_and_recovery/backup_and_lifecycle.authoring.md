# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / backup_and_lifecycle

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 3
- Authoring-admitted slots: 3
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/backup_and_lifecycle.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:backup_and_lifecycle:classify_backup_and_lifecycle_evidence:slot:configure-app-service-backup-schedule-and-retention

- Status: authoring-admitted
- Objective: Configure scheduled App Service backups to supported storage with retention matching the recovery requirement.
- Expected decision: Run and verify an initial backup before relying on the policy.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:backup_and_lifecycle:classify_backup_and_lifecycle_evidence:slot:include-database-connection-in-backup-when-supported

- Status: authoring-admitted
- Objective: Include a supported linked database only when the backup feature and connection configuration support it.
- Expected decision: Document separately protected databases when integrated backup is unsupported.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:backup_and_lifecycle:classify_backup_and_lifecycle_evidence:slot:restore-backup-to-existing-or-new-app

- Status: authoring-admitted
- Objective: Choose in-place or new-app restore based on overwrite risk and validation needs.
- Expected decision: Prefer an isolated restore when the recovery must be validated before cutover.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
