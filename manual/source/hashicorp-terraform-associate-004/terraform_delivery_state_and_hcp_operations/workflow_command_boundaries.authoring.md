# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / workflow_command_boundaries

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 6
- Authoring-admitted slots: 6
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/workflow_command_boundaries.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:workflow_command_boundaries:classify_workflow_command_boundaries_evidence:slot:apply-command-boundary

- Status: authoring-admitted
- Objective: Select apply to execute either a newly generated or saved plan. It evaluates approved changes; documented property automatic_plan under automatic_plan.
- Expected decision: Apply only the intended reviewed actions.
- Decisive boundary: Apply mutates infrastructure/state and may create an automatic plan if no file is given. With approved changes; documented property automatic_plan, the required resolution is Apply only the intended reviewed actions.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:workflow_command_boundaries:classify_workflow_command_boundaries_evidence:slot:command-retry-diagnosis

- Status: authoring-admitted
- Objective: Choose retry behavior from the failed command phase. It evaluates init/plan/apply phase; documented property partial_failure under partial_failure.
- Expected decision: Retry only after identifying whether side effects or partial state exist.
- Decisive boundary: A failed plan normally has no intended remote mutations; a failed apply may have partial changes. With init/plan/apply phase; documented property partial_failure, the required resolution is Retry only after identifying whether side effects or partial state exist.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:workflow_command_boundaries:classify_workflow_command_boundaries_evidence:slot:destroy-command-boundary

- Status: authoring-admitted
- Objective: Select destroy only when the desired result is removal of all managed objects in scope. It evaluates destroy intent; documented property explicit_destroy_intent under explicit_destroy_intent.
- Expected decision: Review a destroy plan and confirm separately.
- Decisive boundary: Destroy proposes remote deletion; state rm changes only mapping. With destroy intent; documented property explicit_destroy_intent, the required resolution is Review a destroy plan and confirm separately.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:workflow_command_boundaries:classify_workflow_command_boundaries_evidence:slot:init-command-boundary

- Status: authoring-admitted
- Objective: Select init when dependencies or backend metadata must be prepared. It evaluates new working directory; documented property working_directory_initialization under working_directory_initialization.
- Expected decision: Initialize before validation or planning.
- Decisive boundary: Init prepares the working directory and may migrate state only when explicitly requested. With new working directory; documented property working_directory_initialization, the required resolution is Initialize before validation or planning.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:workflow_command_boundaries:classify_workflow_command_boundaries_evidence:slot:plan-command-boundary

- Status: authoring-admitted
- Objective: Select plan to preview proposed convergence without applying it. It evaluates configuration; documented property execution_plan under execution_plan.
- Expected decision: Generate and review actions.
- Decisive boundary: Normal plan does not apply, but refresh and backend access still occur; some special options affect state evidence. With configuration; documented property execution_plan, the required resolution is Generate and review actions.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:workflow_command_boundaries:classify_workflow_command_boundaries_evidence:slot:validate-versus-plan

- Status: authoring-admitted
- Objective: Choose plan when validity depends on variable values, state, provider behavior, or remote APIs. It evaluates validate passed; documented property configuration_validation_scope under configuration_validation_scope.
- Expected decision: Escalate from static validation to environment-specific plan evidence.
- Decisive boundary: Validate and plan prove different layers. With validate passed; documented property configuration_validation_scope, the required resolution is Escalate from static validation to environment-specific plan evidence.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
