# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / local_remote_backend

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/local_remote_backend.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:local_remote_backend:choose_remote_backend_for_shared_state:slot:backend-cloud-block-boundary

- Status: authoring-admitted
- Objective: Distinguish a backend block from the mutually exclusive HCP Terraform cloud configuration path.
- Expected decision: Reject a configuration that declares both backend and cloud blocks.
- Decisive boundary: A configuration chooses one of the documented state-management integration paths.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:local_remote_backend:choose_remote_backend_for_shared_state:slot:backend-lock-capability

- Status: authoring-admitted
- Objective: Recognize that remote storage and state locking are separate backend capabilities.
- Expected decision: Verify documented locking support instead of assuming every remote backend locks state.
- Decisive boundary: The backend documentation must explicitly support locking for locking-dependent collaboration.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:local_remote_backend:choose_remote_backend_for_shared_state:slot:local-remote-classification

- Status: authoring-admitted
- Objective: Classify local default state and remote backend storage by persistence and collaboration properties.
- Expected decision: Recognize when shared, durable state requires a remote backend or HCP Terraform.
- Decisive boundary: Shared state requires supported secure access and must not be inferred from file sharing alone.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:local_remote_backend:choose_remote_backend_for_shared_state:slot:solo-team-transfer

- Status: authoring-admitted
- Objective: Re-evaluate state storage when an isolated configuration becomes a team-operated workflow.
- Expected decision: Move from local to a supported shared state path when collaboration constraints appear.
- Decisive boundary: The transfer is justified by changed collaboration, durability, or access-control requirements.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:local_remote_backend:choose_remote_backend_for_shared_state:slot:state-security-selection

- Status: authoring-admitted
- Objective: Select remote state storage when local persistence creates loss, secret-exposure, or collaboration risk.
- Expected decision: Choose a supported remote storage model that satisfies secure access and shared-state needs.
- Decisive boundary: The storage decision must account for sensitive values and concurrent access.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:local_remote_backend:migrate_backend_without_losing_state_mapping:slot:backend-change-recognition

- Status: authoring-admitted
- Objective: Recognize a changed backend configuration as requiring Terraform reinitialization.
- Expected decision: Identify reinitialization and migration review as the next workflow boundary.
- Decisive boundary: Terraform must initialize the changed backend before state operations continue.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:local_remote_backend:migrate_backend_without_losing_state_mapping:slot:destination-conflict-diagnosis

- Status: authoring-admitted
- Objective: Diagnose a migration blocked by incompatible destination state, lineage, or credentials.
- Expected decision: Separate access failure from a state-safety conflict before changing either side.
- Decisive boundary: Existing destination state and backend access must be reconciled without bypassing safety checks by default.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:local_remote_backend:migrate_backend_without_losing_state_mapping:slot:migrate-reconfigure-classification

- Status: authoring-admitted
- Objective: Select migration when state must move and reconfiguration when only backend connection metadata changes.
- Expected decision: Choose the initialization path that matches whether state bytes must be copied.
- Decisive boundary: The decision turns on state relocation, not merely textual backend changes.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:local_remote_backend:migrate_backend_without_losing_state_mapping:slot:migration-workflow

- Status: authoring-admitted
- Objective: Order state backup, backend configuration change, initialization, migration confirmation, and verification.
- Expected decision: Preserve recoverability and verify state continuity through the backend change.
- Decisive boundary: Migration must retain the same state lineage and resource bindings at the intended destination.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:local_remote_backend:migrate_backend_without_losing_state_mapping:slot:workspace-migration-boundary

- Status: authoring-admitted
- Objective: Test migration completeness when the source backend contains multiple workspaces.
- Expected decision: Require continuity for every intended workspace, not only the current one.
- Decisive boundary: A multi-workspace migration must reconcile the intended workspace set at the destination.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
