# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / remote_runs_vcs_cli

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/remote_runs_vcs_cli.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:remote_runs_vcs_cli:choose_remote_run_trigger_and_execution_context:slot:api-driven-run-choice

- Status: authoring-admitted
- Objective: Choose API-driven runs for a custom automation system uploading configuration versions. It evaluates automation service; documented property api_driven_runs under api_driven_runs.
- Expected decision: Create configuration version and run through the API workflow.
- Decisive boundary: API workflow gives explicit machine control over configuration/run lifecycle. With automation service; documented property api_driven_runs, the required resolution is Create configuration version and run through the API workflow.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:remote_runs_vcs_cli:choose_remote_run_trigger_and_execution_context:slot:cli-driven-remote-choice

- Status: authoring-admitted
- Objective: Choose CLI-driven remote execution when local configuration should run on HCP workers. It evaluates cloud block/workspace mapping; documented property cloud_block under cloud_block.
- Expected decision: Invoke Terraform CLI and execute remotely in the selected workspace.
- Decisive boundary: Remote execution uses HCP worker context and workspace credentials. With cloud block/workspace mapping; documented property cloud_block, the required resolution is Invoke Terraform CLI and execute remotely in the selected workspace.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:remote_runs_vcs_cli:choose_remote_run_trigger_and_execution_context:slot:execution-mode-credential-boundary

- Status: authoring-admitted
- Objective: Place provider credentials in the context where Terraform actually executes. It evaluates remote versus local execution mode; documented property execution_context_credentials under execution_context_credentials.
- Expected decision: Configure credentials in the active execution context.
- Decisive boundary: Remote state location and execution location are separable. With remote versus local execution mode; documented property execution_context_credentials, the required resolution is Configure credentials in the active execution context.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:remote_runs_vcs_cli:choose_remote_run_trigger_and_execution_context:slot:speculative-plan-boundary

- Status: authoring-admitted
- Objective: Recognize a speculative plan as review evidence that cannot be applied. It evaluates pull request trigger; documented property speculative_plans under speculative_plans.
- Expected decision: Use it for proposed-change feedback and create an apply-capable run after merge.
- Decisive boundary: Speculative runs intentionally have no apply transition. With pull request trigger; documented property speculative_plans, the required resolution is Use it for proposed-change feedback and create an apply-capable run after merge.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:remote_runs_vcs_cli:choose_remote_run_trigger_and_execution_context:slot:vcs-driven-run-choice

- Status: authoring-admitted
- Objective: Choose a VCS-driven workspace when commits/PRs should trigger speculative and apply runs. It evaluates connected repository; documented property vcs_trigger under vcs_trigger.
- Expected decision: Let HCP fetch configuration versions and run in the workspace context.
- Decisive boundary: VCS workflow derives configuration from the connected repository. With connected repository; documented property vcs_trigger, the required resolution is Let HCP fetch configuration versions and run in the workspace context.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:remote_runs_vcs_cli:interpret_vcs_or_cli_run_status_before_retry:slot:apply-error-recovery

- Status: authoring-admitted
- Objective: Handle an HCP apply error as potentially partial mutation. It evaluates apply logs; documented property partial_apply_recovery under partial_apply_recovery.
- Expected decision: Inspect state/remote results and queue a new convergence plan.
- Decisive boundary: Remote apply shares Terraform partial-failure semantics. With apply logs; documented property partial_apply_recovery, the required resolution is Inspect state/remote results and queue a new convergence plan.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:remote_runs_vcs_cli:interpret_vcs_or_cli_run_status_before_retry:slot:confirmation-wait

- Status: authoring-admitted
- Objective: Approve a run awaiting confirmation only after reviewing its plan and checks. It evaluates planned actions; documented property confirmation_state under confirmation_state.
- Expected decision: Confirm the exact run or discard it.
- Decisive boundary: Workspace queue and approval bind to a specific run proposal. With planned actions; documented property confirmation_state, the required resolution is Confirm the exact run or discard it.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:remote_runs_vcs_cli:interpret_vcs_or_cli_run_status_before_retry:slot:plan-error-diagnosis

- Status: authoring-admitted
- Objective: Interpret a run that reaches plan error. It evaluates configuration version fetched; documented property plan_error_state under plan_error_state.
- Expected decision: Fix configuration/provider evidence and start a new run.
- Decisive boundary: No apply phase exists after a failed plan. With configuration version fetched; documented property plan_error_state, the required resolution is Fix configuration/provider evidence and start a new run.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:remote_runs_vcs_cli:interpret_vcs_or_cli_run_status_before_retry:slot:policy-check-status

- Status: authoring-admitted
- Objective: Separate policy failure from Terraform plan failure. It evaluates plan completed; documented property policy_check_run_state under policy_check_run_state.
- Expected decision: Address or override policy only through authorized governance flow.
- Decisive boundary: Policy evaluation is a post-plan governance gate. With plan completed; documented property policy_check_run_state, the required resolution is Address or override policy only through authorized governance flow.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:remote_runs_vcs_cli:interpret_vcs_or_cli_run_status_before_retry:slot:queued-versus-running

- Status: authoring-admitted
- Objective: Distinguish a queued run from a failed execution. It evaluates workspace run queue; documented property queued_run_serialization under queued_run_serialization.
- Expected decision: Wait or cancel superseded work rather than retrying duplicate runs.
- Decisive boundary: HCP serializes workspace operations to protect state. With workspace run queue; documented property queued_run_serialization, the required resolution is Wait or cancel superseded work rather than retrying duplicate runs.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
