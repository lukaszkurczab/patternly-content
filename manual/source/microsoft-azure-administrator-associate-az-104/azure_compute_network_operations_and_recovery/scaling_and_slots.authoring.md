# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / scaling_and_slots

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/scaling_and_slots.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:scaling_and_slots:classify_scaling_and_slots_evidence:slot:create-staging-slot-for-release-validation

- Status: authoring-admitted
- Objective: Deploy a release to a nonproduction slot when it needs warm-up and validation in the same plan before production traffic.
- Expected decision: Validate the staging slot before swap.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scaling_and_slots:classify_scaling_and_slots_evidence:slot:mark-sticky-configuration-before-swap

- Status: authoring-admitted
- Objective: Mark environment-specific settings and connection strings sticky before swapping slots.
- Expected decision: Prevent environment credentials and endpoints from moving unexpectedly.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scaling_and_slots:classify_scaling_and_slots_evidence:slot:rollback-release-by-swap-back

- Status: authoring-admitted
- Objective: Swap back only after confirming the previous production slot still holds the known-good build and correct configuration.
- Expected decision: Restore traffic to the known-good slot and investigate the failed revision.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scaling_and_slots:classify_scaling_and_slots_evidence:slot:select-scale-out-for-instance-count

- Status: authoring-admitted
- Objective: Scale out when the app can distribute load across more workers and per-instance resources are adequate.
- Expected decision: Increase instance count or configure autoscale.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scaling_and_slots:classify_scaling_and_slots_evidence:slot:select-scale-up-for-per-instance-resources

- Status: authoring-admitted
- Objective: Scale up when each worker needs more CPU, memory, storage, or a higher plan capability.
- Expected decision: Move the plan to a larger or capable tier.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
