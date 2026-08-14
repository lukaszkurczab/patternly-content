# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / drift_refresh_moved_removed

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/drift_refresh_moved_removed.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:drift_refresh_moved_removed:classify_drift_before_refresh_or_apply:slot:accept-revert-selection

- Status: authoring-admitted
- Objective: Select whether to adopt an intentional remote change or reconcile infrastructure back to configuration.
- Expected decision: Update configuration and state for accepted change or use normal plan and apply to restore declared intent.
- Decisive boundary: Refresh-only records remote reality; normal apply reconciles remote infrastructure to configuration.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:drift_refresh_moved_removed:classify_drift_before_refresh_or_apply:slot:drift-classification

- Status: authoring-admitted
- Objective: Classify divergence among configuration, recorded state, and remote infrastructure.
- Expected decision: Identify an out-of-band remote change as drift rather than a configuration refactor.
- Decisive boundary: Drift requires remote infrastructure to diverge from the recorded or intended Terraform view outside the normal workflow.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:drift_refresh_moved_removed:classify_drift_before_refresh_or_apply:slot:drift-context-transfer

- Status: authoring-admitted
- Objective: Re-evaluate remediation when an out-of-band change becomes an approved desired-state change.
- Expected decision: Move from reversion to configuration adoption only when desired intent changes.
- Decisive boundary: The same remote difference can require opposite remediation under different desired-state evidence.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:drift_refresh_moved_removed:classify_drift_before_refresh_or_apply:slot:refresh-disabled-diagnosis

- Status: authoring-admitted
- Objective: Diagnose a misleading plan produced with refresh disabled while remote infrastructure changed.
- Expected decision: Identify stale state evidence as the reason drift is absent from the plan.
- Decisive boundary: A plan that skips refresh cannot establish current remote-state agreement.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:drift_refresh_moved_removed:classify_drift_before_refresh_or_apply:slot:refresh-only-workflow

- Status: authoring-admitted
- Objective: Order suspected-drift inspection with a refresh-only plan before accepting state changes.
- Expected decision: Preview remote-to-state changes before recording them without changing infrastructure.
- Decisive boundary: Refresh-only preview must precede any decision to record the observed remote values.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:drift_refresh_moved_removed:use_moved_or_removed_block_for_configuration_transition:slot:module-refactor-moved

- Status: authoring-admitted
- Objective: Identify a move into or across modules that requires full old and new addresses.
- Expected decision: Preserve binding across a module-structure refactor.
- Decisive boundary: Both addresses must resolve to compatible resource instances.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:drift_refresh_moved_removed:use_moved_or_removed_block_for_configuration_transition:slot:move-versus-remove-selection

- Status: authoring-admitted
- Objective: Choose moved for continued management at a new address and removed for relinquished management.
- Expected decision: Select the configuration transition from the intended post-change ownership.
- Decisive boundary: Moved preserves Terraform management; removed ends it, with destruction separately controlled.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:drift_refresh_moved_removed:use_moved_or_removed_block_for_configuration_transition:slot:removed-destroy-boundary

- Status: authoring-admitted
- Objective: Test the destroy behavior of a removed block when destroy is not disabled.
- Expected decision: Recognize when removal also destroys the remote object.
- Decisive boundary: Preservation is not implied; the lifecycle setting governs remote destruction.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:drift_refresh_moved_removed:use_moved_or_removed_block_for_configuration_transition:slot:removed-preserve-object

- Status: authoring-admitted
- Objective: Select a removed block with destroy false when Terraform must stop managing an object without destroying it.
- Expected decision: Remove the binding while explicitly preserving remote infrastructure.
- Decisive boundary: Preservation requires the documented removed lifecycle behavior.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:drift_refresh_moved_removed:use_moved_or_removed_block_for_configuration_transition:slot:resource-rename-moved

- Status: authoring-admitted
- Objective: Identify a resource rename that requires a moved block to preserve the existing binding.
- Expected decision: Record address continuity so planning does not propose destroy and create solely from the rename.
- Decisive boundary: The old and new addresses must represent the same managed object after refactoring.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:drift_refresh_moved_removed:use_moved_or_removed_block_for_configuration_transition:slot:transition-plan-verification

- Status: authoring-admitted
- Objective: Order transition declaration, plan review, address or destruction verification, and apply.
- Expected decision: Verify the plan expresses the intended ownership and object lifecycle before applying.
- Decisive boundary: The plan must show the intended address and lifecycle effect before state changes are committed.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
