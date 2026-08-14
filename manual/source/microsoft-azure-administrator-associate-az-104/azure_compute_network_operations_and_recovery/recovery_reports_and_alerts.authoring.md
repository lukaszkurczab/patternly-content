# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / recovery_reports_and_alerts

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 4
- Authoring-admitted slots: 4
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/recovery_reports_and_alerts.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:recovery_reports_and_alerts:classify_recovery_reports_and_alerts_evidence:slot:classify-backup-job-success-failure-evidence

- Status: authoring-admitted
- Objective: Use job status and error details to decide whether the scheduled backup actually produced a recovery point.
- Expected decision: Remediate failed jobs and rerun or await the next compliant point.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:recovery_reports_and_alerts:classify_recovery_reports_and_alerts_evidence:slot:classify-protected-item-health-and-last-restore-point

- Status: authoring-admitted
- Objective: Use protected-item health and latest recovery-point time to assess current recoverability.
- Expected decision: Escalate an item whose latest point violates RPO even if an older point exists.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:recovery_reports_and_alerts:classify_recovery_reports_and_alerts_evidence:slot:configure-built-in-alert-routing

- Status: authoring-admitted
- Objective: Route Azure Backup built-in alerts through Azure Monitor action groups to the responsible operations team.
- Expected decision: Test delivery and preserve alert history.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:recovery_reports_and_alerts:classify_recovery_reports_and_alerts_evidence:slot:query-backup-report-for-policy-compliance

- Status: authoring-admitted
- Objective: Use Backup reports to find items, jobs, or policies that miss organizational backup requirements across the selected scope.
- Expected decision: Create a remediation list from report evidence rather than assuming vault existence equals compliance.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
