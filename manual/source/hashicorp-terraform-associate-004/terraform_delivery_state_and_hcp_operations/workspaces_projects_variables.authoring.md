# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / workspaces_projects_variables

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 6
- Authoring-admitted slots: 6
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/workspaces_projects_variables.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:workspaces_projects_variables:classify_workspaces_projects_variables_evidence:slot:project-grouping-choice

- Status: authoring-admitted
- Objective: Use a project to group workspaces by team or business responsibility. It evaluates multiple workspaces; documented property workspace_grouping under workspace_grouping.
- Expected decision: Assign workspaces to the project and scope access there.
- Decisive boundary: Projects organize collections; workspaces own individual state/run contexts. With multiple workspaces; documented property workspace_grouping, the required resolution is Assign workspaces to the project and scope access there.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:workspaces_projects_variables:classify_workspaces_projects_variables_evidence:slot:project-variable-set-choice

- Status: authoring-admitted
- Objective: Apply shared values to every current and future workspace in one project. It evaluates project-wide consumers; documented property project_variable_sets under project_variable_sets.
- Expected decision: Use a project-scoped variable set.
- Decisive boundary: Project scope maintains consistent intended propagation. With project-wide consumers; documented property project_variable_sets, the required resolution is Use a project-scoped variable set.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:workspaces_projects_variables:classify_workspaces_projects_variables_evidence:slot:variable-precedence-diagnosis

- Status: authoring-admitted
- Objective: Trace an HCP run receiving an unexpected variable value. It evaluates run-specific input; documented property precedence under precedence.
- Expected decision: Use documented precedence and scope evidence to find the winner.
- Decisive boundary: HCP assignment layers feed root inputs/environment independently of locals. With run-specific input; documented property precedence, the required resolution is Use documented precedence and scope evidence to find the winner.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:workspaces_projects_variables:classify_workspaces_projects_variables_evidence:slot:workspace-ownership-unit

- Status: authoring-admitted
- Objective: Classify an HCP workspace as one configuration, state, variables, settings, and run history. It evaluates configuration version; documented property workspace_state_ownership under workspace_state_ownership.
- Expected decision: Use a workspace as the operational ownership unit.
- Decisive boundary: HCP workspaces are remote managed collections; CLI workspaces are state instances within a working directory. With configuration version; documented property workspace_state_ownership, the required resolution is Use a workspace as the operational ownership unit.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:workspaces_projects_variables:classify_workspaces_projects_variables_evidence:slot:workspace-split-transfer

- Status: authoring-admitted
- Objective: Split a monolithic workspace without sharing full mutable ownership. It evaluates resource lifecycle groups; documented property workspace_state_ownership under workspace_state_ownership.
- Expected decision: Create distinct state owners and explicit cross-workspace data contracts.
- Decisive boundary: Each object must retain one state owner throughout migration. With resource lifecycle groups; documented property workspace_state_ownership, the required resolution is Create distinct state owners and explicit cross-workspace data contracts.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:workspaces_projects_variables:classify_workspaces_projects_variables_evidence:slot:workspace-variable-choice

- Status: authoring-admitted
- Objective: Place a value only one workspace needs in workspace variables. It evaluates single workspace consumer; documented property workspace_variable_scope under workspace_variable_scope.
- Expected decision: Create the correctly categorized scoped variable.
- Decisive boundary: Narrow scope reduces accidental propagation. With single workspace consumer; documented property workspace_variable_scope, the required resolution is Create the correctly categorized scoped variable.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
