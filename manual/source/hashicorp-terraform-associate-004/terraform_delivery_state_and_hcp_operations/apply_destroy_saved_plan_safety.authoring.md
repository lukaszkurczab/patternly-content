# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / apply_destroy_saved_plan_safety

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/apply_destroy_saved_plan_safety.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:apply_destroy_saved_plan_safety:apply_the_reviewed_saved_plan:slot:apply-plan-file

- Status: authoring-admitted
- Objective: Apply an approved saved plan without generating a new automatic plan. It evaluates plan file path; documented property saved_plan_apply under saved_plan_apply.
- Expected decision: Invoke terraform apply with the saved plan file.
- Decisive boundary: Without a plan file, apply creates a new plan. With plan file path; documented property saved_plan_apply, the required resolution is Invoke terraform apply with the saved plan file.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:apply_destroy_saved_plan_safety:apply_the_reviewed_saved_plan:slot:auto-approve-boundary

- Status: authoring-admitted
- Objective: Recognize that -auto-approve is irrelevant when applying a saved plan. It evaluates saved plan file; documented property auto_approve under auto_approve.
- Expected decision: Treat approval as attached to artifact workflow, not the flag.
- Decisive boundary: Saved-plan apply does not prompt for approval in the same way as automatic-plan apply. With saved plan file; documented property auto_approve, the required resolution is Treat approval as attached to artifact workflow, not the flag.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:apply_destroy_saved_plan_safety:apply_the_reviewed_saved_plan:slot:plan-artifact-provenance

- Status: authoring-admitted
- Objective: Verify a plan artifact belongs to the expected commit, workspace, and lock selections. It evaluates configuration digest; documented property saved_plan_state_snapshot under saved_plan_state_snapshot.
- Expected decision: Bind approval to the artifact provenance.
- Decisive boundary: Binary plans encode context and are not portable templates. With configuration digest; documented property saved_plan_state_snapshot, the required resolution is Bind approval to the artifact provenance.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:apply_destroy_saved_plan_safety:apply_the_reviewed_saved_plan:slot:save-plan-artifact

- Status: authoring-admitted
- Objective: Create a plan file for separation of review and execution. It evaluates terraform plan -out; documented property saved_plan under saved_plan.
- Expected decision: Store the exact plan artifact securely for later apply.
- Decisive boundary: Only the binary plan artifact is executable; text rendering is review output. With terraform plan -out; documented property saved_plan, the required resolution is Store the exact plan artifact securely for later apply.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:apply_destroy_saved_plan_safety:apply_the_reviewed_saved_plan:slot:stale-plan-rejection

- Status: authoring-admitted
- Objective: Respond when state changed after the saved plan was created. It evaluates plan snapshot; documented property saved_plan_state_consistency under saved_plan_state_consistency.
- Expected decision: Generate a fresh plan and repeat review.
- Decisive boundary: Approval cannot override changed state evidence. With plan snapshot; documented property saved_plan_state_consistency, the required resolution is Generate a fresh plan and repeat review.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:apply_destroy_saved_plan_safety:separate_destroy_confirmation_from_routine_apply:slot:destroy-auto-approve-boundary

- Status: authoring-admitted
- Objective: Require an external approval gate when interactive confirmation is disabled. It evaluates automation; documented property confirmation under confirmation.
- Expected decision: Gate the exact destroy plan outside Terraform.
- Decisive boundary: The flag removes a prompt; it does not create governance. With automation; documented property confirmation, the required resolution is Gate the exact destroy plan outside Terraform.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:apply_destroy_saved_plan_safety:separate_destroy_confirmation_from_routine_apply:slot:destroy-plan-review

- Status: authoring-admitted
- Objective: Generate a destroy plan for explicit teardown review. It evaluates -destroy mode; documented property destroy_plan under destroy_plan.
- Expected decision: Review deletions before executing them.
- Decisive boundary: Destroy intent must be explicit because operational risk differs. With -destroy mode; documented property destroy_plan, the required resolution is Review deletions before executing them.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:apply_destroy_saved_plan_safety:separate_destroy_confirmation_from_routine_apply:slot:prevent-destroy-diagnostic

- Status: authoring-admitted
- Objective: Interpret a destroy blocked by prevent_destroy. It evaluates lifecycle rule; documented property prevent_destroy under prevent_destroy.
- Expected decision: Stop and change intent/configuration through a deliberate review.
- Decisive boundary: The lifecycle rule rejects destruction while configured. With lifecycle rule; documented property prevent_destroy, the required resolution is Stop and change intent/configuration through a deliberate review.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:apply_destroy_saved_plan_safety:separate_destroy_confirmation_from_routine_apply:slot:retained-object-transition

- Status: authoring-admitted
- Objective: Keep a remote object while removing Terraform ownership. It evaluates object must survive; documented property removed_preserve_object under removed_preserve_object.
- Expected decision: Use a reviewed removed block/state removal rather than destroy.
- Decisive boundary: Ownership removal and infrastructure deletion are separate outcomes. With object must survive; documented property removed_preserve_object, the required resolution is Use a reviewed removed block/state removal rather than destroy.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:apply_destroy_saved_plan_safety:separate_destroy_confirmation_from_routine_apply:slot:targeted-destroy-risk

- Status: authoring-admitted
- Objective: Reject targeted destroy as routine dependency management. It evaluates -target address; documented property targeted_destroy under targeted_destroy.
- Expected decision: Use it only for exceptional recovery with follow-up full plan.
- Decisive boundary: Targeting can leave configuration and infrastructure partially inconsistent. With -target address; documented property targeted_destroy, the required resolution is Use it only for exceptional recovery with follow-up full plan.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:apply_destroy_saved_plan_safety:separate_destroy_confirmation_from_routine_apply:slot:workspace-scope-check

- Status: authoring-admitted
- Objective: Confirm the state/workspace selected before teardown. It evaluates backend workspace; documented property execution_plan under execution_plan.
- Expected decision: Match the destroy plan to the intended environment.
- Decisive boundary: Backend/workspace state defines actual managed scope. With backend workspace; documented property execution_plan, the required resolution is Match the destroy plan to the intended environment.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
