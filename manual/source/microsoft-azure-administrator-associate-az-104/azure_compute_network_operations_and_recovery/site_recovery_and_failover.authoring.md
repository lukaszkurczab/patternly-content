# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / site_recovery_and_failover

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/site_recovery_and_failover.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:site_recovery_and_failover:classify_site_recovery_and_failover_evidence:slot:select-planned-failover-when-source-available

- Status: authoring-admitted
- Objective: Use planned failover when the source is available for final synchronization and controlled shutdown.
- Expected decision: Synchronize, fail over, validate, and commit under the plan.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:site_recovery_and_failover:classify_site_recovery_and_failover_evidence:slot:select-test-failover-for-isolated-validation

- Status: authoring-admitted
- Objective: Run a test failover into an isolated network to validate recovery without affecting production replication.
- Expected decision: Validate applications and clean up the test failover.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:site_recovery_and_failover:classify_site_recovery_and_failover_evidence:slot:select-unplanned-failover-for-source-outage

- Status: authoring-admitted
- Objective: Use unplanned failover when the source cannot complete final synchronization and accept the recovery-point consequence.
- Expected decision: Fail over to the selected point and document potential data loss.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:site_recovery_and_failover:classify_site_recovery_and_failover_evidence:slot:sequence-failover-commit-reprotect-failback

- Status: authoring-admitted
- Objective: After validation, commit the failover, reprotect in the reverse direction, and plan failback.
- Expected decision: Do not treat initial VM startup as completed disaster recovery.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:site_recovery_and_failover:classify_site_recovery_and_failover_evidence:slot:validate-recovery-plan-order-and-dependencies

- Status: authoring-admitted
- Objective: Order groups, scripts, and manual actions so identity, network, data, and application tiers recover coherently.
- Expected decision: Test the plan and stop on failed critical dependencies.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
