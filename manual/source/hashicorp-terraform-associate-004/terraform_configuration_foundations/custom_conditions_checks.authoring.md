# hashicorp-terraform-associate-004 / terraform_configuration_foundations / custom_conditions_checks

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/custom_conditions_checks.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:custom_conditions_checks:enforce_input_or_resource_invariant_with_conditions:slot:condition-error-message

- Status: authoring-admitted
- Objective: Design a condition diagnostic that identifies the violated invariant and remedy. It evaluates failed expression; documented property condition_error_message under condition_error_message.
- Expected decision: Return a specific actionable error at the owning boundary.
- Decisive boundary: Precise ownership shortens diagnosis and prevents callers from changing unrelated resources. With failed expression; documented property condition_error_message, the required resolution is Return a specific actionable error at the owning boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:custom_conditions_checks:enforce_input_or_resource_invariant_with_conditions:slot:postcondition-choice

- Status: authoring-admitted
- Objective: Use a postcondition to validate a guarantee after reading or applying an object. It evaluates self attributes; documented property postconditions under postconditions.
- Expected decision: Block dependent operations when the guarantee fails.
- Decisive boundary: Postconditions can inspect result attributes unavailable at input validation. With self attributes; documented property postconditions, the required resolution is Block dependent operations when the guarantee fails.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:custom_conditions_checks:enforce_input_or_resource_invariant_with_conditions:slot:precondition-choice

- Status: authoring-admitted
- Objective: Use a precondition for an assumption that must hold before operating on a resource. It evaluates resource argument context; documented property preconditions under preconditions.
- Expected decision: Fail planning/apply before the resource action.
- Decisive boundary: Precondition failure blocks the operation. With resource argument context; documented property preconditions, the required resolution is Fail planning/apply before the resource action.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:custom_conditions_checks:enforce_input_or_resource_invariant_with_conditions:slot:unknown-condition-timing

- Status: authoring-admitted
- Objective: Predict when a custom condition can be evaluated if it depends on unknown data. It evaluates condition expression; documented property condition_unknown_evaluation under condition_unknown_evaluation.
- Expected decision: Defer evaluation to the phase where values become known.
- Decisive boundary: Unknown is not failure; Terraform evaluates when sufficient evidence exists. With condition expression; documented property condition_unknown_evaluation, the required resolution is Defer evaluation to the phase where values become known.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:custom_conditions_checks:enforce_input_or_resource_invariant_with_conditions:slot:variable-validation-choice

- Status: authoring-admitted
- Objective: Place a restriction that depends only on one input variable in its validation block. It evaluates input value; documented property variable_validation under variable_validation.
- Expected decision: Reject invalid caller input before resource planning proceeds.
- Decisive boundary: Variable validation belongs at the input boundary. With input value; documented property variable_validation, the required resolution is Reject invalid caller input before resource planning proceeds.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:custom_conditions_checks:use_check_block_for_nonblocking_operational_assertion:slot:check-data-source

- Status: authoring-admitted
- Objective: Use a scoped data block inside a check to query external health evidence. It evaluates deployed endpoint; documented property data_sources_in_checks under data_sources_in_checks.
- Expected decision: Evaluate the assertion against the data source result.
- Decisive boundary: Check-scoped data gathers evidence; it is not lifecycle ownership. With deployed endpoint; documented property data_sources_in_checks, the required resolution is Evaluate the assertion against the data source result.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:custom_conditions_checks:use_check_block_for_nonblocking_operational_assertion:slot:check-versus-test-boundary

- Status: authoring-admitted
- Objective: Separate check blocks from terraform test runs. It evaluates deployed infrastructure assertion; documented property check_test_boundary under check_test_boundary.
- Expected decision: Use checks for ongoing configuration assertions and tests for test scenarios/module behavior.
- Decisive boundary: The mechanisms have different lifecycle and execution contracts. With deployed infrastructure assertion; documented property check_test_boundary, the required resolution is Use checks for ongoing configuration assertions and tests for test scenarios/module behavior.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:custom_conditions_checks:use_check_block_for_nonblocking_operational_assertion:slot:continuous-validation-transfer

- Status: authoring-admitted
- Objective: Apply the same check assertions during HCP continuous validation. It evaluates workspace health assessment; documented property continuous_validation under continuous_validation.
- Expected decision: Use checks as nonblocking ongoing health evidence where HCP supports it.
- Decisive boundary: Continuous validation requires an execution service; CLI checks run during Terraform operations. With workspace health assessment; documented property continuous_validation, the required resolution is Use checks as nonblocking ongoing health evidence where HCP supports it.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:custom_conditions_checks:use_check_block_for_nonblocking_operational_assertion:slot:nonblocking-check-choice

- Status: authoring-admitted
- Objective: Choose a check block for an operational assertion that should warn without rolling back infrastructure. It evaluates post-provision endpoint; documented property nonblocking_assertions under nonblocking_assertions.
- Expected decision: Record a warning while allowing the run to complete.
- Decisive boundary: Check assertion failures warn; pre/postconditions can block operations. With post-provision endpoint; documented property nonblocking_assertions, the required resolution is Record a warning while allowing the run to complete.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
