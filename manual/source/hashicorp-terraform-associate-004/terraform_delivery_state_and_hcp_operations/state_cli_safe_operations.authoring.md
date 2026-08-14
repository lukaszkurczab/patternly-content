# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / state_cli_safe_operations

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/state_cli_safe_operations.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:state_cli_safe_operations:move_or_remove_state_address_only_with_mapping_evidence:slot:mapping-evidence-check

- Status: authoring-admitted
- Objective: Verify source and destination addresses before a state move. It evaluates state show remote ID; documented property state_show under state_show.
- Expected decision: Prove both addresses refer to the intended one-object transition.
- Decisive boundary: State mutations bypass ordinary provider planning for the mapping itself. With state show remote ID; documented property state_show, the required resolution is Prove both addresses refer to the intended one-object transition.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_cli_safe_operations:move_or_remove_state_address_only_with_mapping_evidence:slot:state-mv-address-refactor

- Status: authoring-admitted
- Objective: Move a mapping when configuration address changes but the remote object stays. It evaluates old address; documented property state_mv under state_mv.
- Expected decision: Back up state, execute state mv or use a moved block, then verify plan.
- Decisive boundary: A move preserves one binding while changing its Terraform address. With old address; documented property state_mv, the required resolution is Back up state, execute state mv or use a moved block, then verify plan.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_cli_safe_operations:move_or_remove_state_address_only_with_mapping_evidence:slot:state-push-danger

- Status: authoring-admitted
- Objective: Reject manual state push for ordinary address changes. It evaluates edited JSON state; documented property state_push under state_push.
- Expected decision: Use structured state commands or moved/removed blocks.
- Decisive boundary: Manual push can overwrite mappings and bypass safer invariants. With edited JSON state; documented property state_push, the required resolution is Use structured state commands or moved/removed blocks.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_cli_safe_operations:move_or_remove_state_address_only_with_mapping_evidence:slot:state-rm-ownership-release

- Status: authoring-admitted
- Objective: Remove a state mapping only when Terraform must stop managing an object that remains remote. It evaluates explicit ownership handoff; documented property state_rm under state_rm.
- Expected decision: Remove the mapping and confirm no duplicate owner is created.
- Decisive boundary: state rm forgets ownership but does not destroy the object. With explicit ownership handoff; documented property state_rm, the required resolution is Remove the mapping and confirm no duplicate owner is created.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_cli_safe_operations:move_or_remove_state_address_only_with_mapping_evidence:slot:wrong-move-recovery

- Status: authoring-admitted
- Objective: Recover from a state move to the wrong address before apply. It evaluates backup state; documented property state_mv under state_mv.
- Expected decision: Move the binding to the correct address and review plan.
- Decisive boundary: Remote objects are unchanged until an apply, so mapping repair should precede convergence. With backup state; documented property state_mv, the required resolution is Move the binding to the correct address and review plan.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_cli_safe_operations:use_state_commands_without_changing_remote_infrastructure:slot:remote-infrastructure-boundary

- Status: authoring-admitted
- Objective: Classify state list/show/pull as mapping operations that do not invoke resource CRUD. It evaluates state subcommand; documented property state_command_remote_api_boundary under state_command_remote_api_boundary.
- Expected decision: Use them for ownership evidence, not infrastructure change.
- Decisive boundary: Some state commands such as mv/rm/push mutate mappings even though they do not mutate the remote API. With state subcommand; documented property state_command_remote_api_boundary, the required resolution is Use them for ownership evidence, not infrastructure change.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_cli_safe_operations:use_state_commands_without_changing_remote_infrastructure:slot:state-command-scope

- Status: authoring-admitted
- Objective: Diagnose a missing address caused by the wrong workspace/backend. It evaluates expected address; documented property workspace_backend_scope under workspace_backend_scope.
- Expected decision: Confirm backend and workspace before editing mappings.
- Decisive boundary: A correct remote object can still be absent from the selected Terraform state. With expected address; documented property workspace_backend_scope, the required resolution is Confirm backend and workspace before editing mappings.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_cli_safe_operations:use_state_commands_without_changing_remote_infrastructure:slot:state-list-inspection

- Status: authoring-admitted
- Objective: List addresses recorded in the selected state. It evaluates backend/workspace selected; documented property state_list under state_list.
- Expected decision: Use terraform state list before targeted inspection or migration.
- Decisive boundary: State list shows Terraform mappings, not all remote objects. With backend/workspace selected; documented property state_list, the required resolution is Use terraform state list before targeted inspection or migration.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_cli_safe_operations:use_state_commands_without_changing_remote_infrastructure:slot:state-pull-boundary

- Status: authoring-admitted
- Objective: Treat state pull as sensitive full-state export. It evaluates remote backend; documented property state_pull under state_pull.
- Expected decision: Use only for backup/diagnosis with secure handling.
- Decisive boundary: Full state can contain secrets and internal metadata. With remote backend; documented property state_pull, the required resolution is Use only for backup/diagnosis with secure handling.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_cli_safe_operations:use_state_commands_without_changing_remote_infrastructure:slot:state-show-inspection

- Status: authoring-admitted
- Objective: Inspect one state address without proposing remote mutation. It evaluates exact address; documented property state_show under state_show.
- Expected decision: Use terraform state show and protect output.
- Decisive boundary: State inspection is local/backend mapping access, not convergence. With exact address; documented property state_show, the required resolution is Use terraform state show and protect output.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
