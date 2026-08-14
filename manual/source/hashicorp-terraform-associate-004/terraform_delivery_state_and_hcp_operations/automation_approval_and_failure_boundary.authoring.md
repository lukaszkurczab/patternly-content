# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / automation_approval_and_failure_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/automation_approval_and_failure_boundary.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:automation_approval_and_failure_boundary:automate_noninteractive_plan_apply_with_approval_control:slot:automation-credential-scope

- Status: authoring-admitted
- Objective: Give the apply job only the credentials and time window it needs. It evaluates plan job permissions; documented property phase_scoped_credentials under phase_scoped_credentials.
- Expected decision: Separate read/plan and mutate privileges where the platform supports it.
- Decisive boundary: Approval does not mitigate overprivileged long-lived credentials. With plan job permissions; documented property phase_scoped_credentials, the required resolution is Separate read/plan and mutate privileges where the platform supports it.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:automation_approval_and_failure_boundary:automate_noninteractive_plan_apply_with_approval_control:slot:detailed-exitcode-gate

- Status: authoring-admitted
- Objective: Use plan -detailed-exitcode to distinguish no change, change, and error in CI. It evaluates exit code 0; documented property detailed_exitcode under detailed_exitcode.
- Expected decision: Route each outcome to the correct pipeline branch.
- Decisive boundary: Exit code 2 means a valid plan with changes. With exit code 0; documented property detailed_exitcode, the required resolution is Route each outcome to the correct pipeline branch.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:automation_approval_and_failure_boundary:automate_noninteractive_plan_apply_with_approval_control:slot:lock-concurrency-boundary

- Status: authoring-admitted
- Objective: Handle a state lock conflict in CI. It evaluates active run; documented property automatic_state_locking under automatic_state_locking.
- Expected decision: Wait/cancel the duplicate or recover only after proving the lock is stale.
- Decisive boundary: Locking protects concurrent state mutation. With active run; documented property automatic_state_locking, the required resolution is Wait/cancel the duplicate or recover only after proving the lock is stale.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:automation_approval_and_failure_boundary:automate_noninteractive_plan_apply_with_approval_control:slot:noninteractive-input-boundary

- Status: authoring-admitted
- Objective: Prevent automation from waiting for interactive variable or approval prompts. It evaluates -input=false; documented property noninteractive_input under noninteractive_input.
- Expected decision: Fail explicitly when required inputs are absent.
- Decisive boundary: Noninteractive workflows need complete deterministic inputs and external gates. With -input=false; documented property noninteractive_input, the required resolution is Fail explicitly when required inputs are absent.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:automation_approval_and_failure_boundary:automate_noninteractive_plan_apply_with_approval_control:slot:saved-plan-approval-pipeline

- Status: authoring-admitted
- Objective: Separate plan creation, review, and apply jobs around one artifact. It evaluates immutable plan artifact; documented property saved_plan_approval_pipeline under saved_plan_approval_pipeline.
- Expected decision: Apply only the approved artifact.
- Decisive boundary: Replanning changes the executable proposal. With immutable plan artifact; documented property saved_plan_approval_pipeline, the required resolution is Apply only the approved artifact.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:automation_approval_and_failure_boundary:stop_pipeline_after_partial_or_failed_apply:slot:partial-apply-classification

- Status: authoring-admitted
- Objective: Recognize that apply can succeed for some resources before another action fails. It evaluates completed actions; documented property partial_failure under partial_failure.
- Expected decision: Treat infrastructure as partially changed.
- Decisive boundary: Terraform applies graph operations but does not provide global rollback. With completed actions; documented property partial_failure, the required resolution is Treat infrastructure as partially changed.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:automation_approval_and_failure_boundary:stop_pipeline_after_partial_or_failed_apply:slot:pipeline-stop-gate

- Status: authoring-admitted
- Objective: Prevent downstream deployment steps after Terraform returns apply failure. It evaluates nonzero exit; documented property stop_after_failed_apply under stop_after_failed_apply.
- Expected decision: Stop and surface the exact run/state evidence.
- Decisive boundary: Dependent systems cannot assume the declared infrastructure is complete. With nonzero exit; documented property stop_after_failed_apply, the required resolution is Stop and surface the exact run/state evidence.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:automation_approval_and_failure_boundary:stop_pipeline_after_partial_or_failed_apply:slot:post-failure-replan

- Status: authoring-admitted
- Objective: Recover after a failed apply. It evaluates failure fixed or external issue resolved; documented property apply_requires_new_plan_after_failure under apply_requires_new_plan_after_failure.
- Expected decision: Refresh and create a new plan before further mutation.
- Decisive boundary: Completed actions and state serial can invalidate the original plan. With failure fixed or external issue resolved; documented property apply_requires_new_plan_after_failure, the required resolution is Refresh and create a new plan before further mutation.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:automation_approval_and_failure_boundary:stop_pipeline_after_partial_or_failed_apply:slot:provider-timeout-transfer

- Status: authoring-admitted
- Objective: Handle an ambiguous provider timeout where the remote action may have completed. It evaluates timeout diagnostic; documented property partial_failure under partial_failure.
- Expected decision: Verify the real object and refresh/import as appropriate before retry.
- Decisive boundary: Distributed API timeouts can leave uncertain completion. With timeout diagnostic; documented property partial_failure, the required resolution is Verify the real object and refresh/import as appropriate before retry.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:automation_approval_and_failure_boundary:stop_pipeline_after_partial_or_failed_apply:slot:state-write-failure

- Status: authoring-admitted
- Objective: Distinguish remote API failure from failure to persist updated state. It evaluates resource operation result; documented property state_persistence_failure_recovery under state_persistence_failure_recovery.
- Expected decision: Protect recovery state and restore the backend mapping before another run.
- Decisive boundary: Losing successful-operation mappings can cause duplicate creation or unsafe ownership. With resource operation result; documented property state_persistence_failure_recovery, the required resolution is Protect recovery state and restore the backend mapping before another run.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
