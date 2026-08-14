# hashicorp-terraform-associate-004 / terraform_configuration_foundations / init_plugins_lockfile

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/init_plugins_lockfile.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:init_plugins_lockfile:initialize_required_provider_plugins:slot:automation-init

- Status: authoring-admitted
- Objective: Place init correctly in an ephemeral CI worker. It evaluates fresh checkout; documented property fresh_automation_initialization under fresh_automation_initialization.
- Expected decision: Run init before validate/plan and honor the committed provider selection.
- Decisive boundary: Every fresh working directory needs initialization even when dependencies are cached. With fresh checkout; documented property fresh_automation_initialization, the required resolution is Run init before validate/plan and honor the committed provider selection.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:init_plugins_lockfile:initialize_required_provider_plugins:slot:first-init-procedure

- Status: authoring-admitted
- Objective: Prepare a new working directory before plan. It evaluates configuration files; documented property working_directory_initialization under working_directory_initialization.
- Expected decision: Run terraform init to install providers/modules and initialize backend metadata.
- Decisive boundary: Validation requires an initialized directory for provider-dependent checks. With configuration files; documented property working_directory_initialization, the required resolution is Run terraform init to install providers/modules and initialize backend metadata.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:init_plugins_lockfile:initialize_required_provider_plugins:slot:init-upgrade-boundary

- Status: authoring-admitted
- Objective: Separate routine init from deliberate dependency upgrade. It evaluates existing lock selection; documented property routine_init_preserves_lock_selection under routine_init_preserves_lock_selection.
- Expected decision: Use routine init to preserve selection; use -upgrade only in a reviewed dependency change.
- Decisive boundary: The lock file makes normal init reuse the recorded version. With existing lock selection; documented property routine_init_preserves_lock_selection, the required resolution is Use routine init to preserve selection; use -upgrade only in a reviewed dependency change.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:init_plugins_lockfile:initialize_required_provider_plugins:slot:module-download-boundary

- Status: authoring-admitted
- Objective: Identify what init updates after a module source/version change. It evaluates module block changed; documented property module_installation under module_installation.
- Expected decision: Reinstall modules; do not expect module selections in .terraform.lock.hcl.
- Decisive boundary: The lock file currently tracks providers, not remote modules. With module block changed; documented property module_installation, the required resolution is Reinstall modules; do not expect module selections in .terraform.lock.hcl.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:init_plugins_lockfile:initialize_required_provider_plugins:slot:plugin-install-failure

- Status: authoring-admitted
- Objective: Diagnose provider installation that cannot satisfy constraints. It evaluates all module constraints; documented property required_providers under required_providers.
- Expected decision: Resolve incompatible constraints or update the lock selection deliberately.
- Decisive boundary: Terraform selects one provider version compatible with the entire configuration. With all module constraints; documented property required_providers, the required resolution is Resolve incompatible constraints or update the lock selection deliberately.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:init_plugins_lockfile:initialize_required_provider_plugins:slot:reconfigure-backend

- Status: authoring-admitted
- Objective: Choose backend reinitialization behavior after changing backend settings. It evaluates backend configuration changed; documented property backend_reconfiguration under backend_reconfiguration.
- Expected decision: Use init with the appropriate migration or reconfigure option after reviewing state location.
- Decisive boundary: Backend changes require explicit reinitialization and may require state migration. With backend configuration changed; documented property backend_reconfiguration, the required resolution is Use init with the appropriate migration or reconfigure option after reviewing state location.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:init_plugins_lockfile:use_dependency_lock_selections_across_runs:slot:checksum-mismatch

- Status: authoring-admitted
- Objective: Diagnose installation when package checksum does not match the lock file. It evaluates selected version; documented property checksums under checksums.
- Expected decision: Investigate mirror/package integrity or update hashes through a trusted workflow.
- Decisive boundary: Checksums protect the selected dependency artifact. With selected version; documented property checksums, the required resolution is Investigate mirror/package integrity or update hashes through a trusted workflow.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:init_plugins_lockfile:use_dependency_lock_selections_across_runs:slot:commit-lockfile

- Status: authoring-admitted
- Objective: Choose repository treatment for .terraform.lock.hcl. It evaluates provider selections; documented property commit_lock_file under commit_lock_file.
- Expected decision: Commit the lock file with the root configuration.
- Decisive boundary: The lock file is reviewable dependency-selection input, not a provider cache. With provider selections; documented property commit_lock_file, the required resolution is Commit the lock file with the root configuration.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:init_plugins_lockfile:use_dependency_lock_selections_across_runs:slot:constraint-lock-distinction

- Status: authoring-admitted
- Objective: Explain why changing a constraint may not change the installed provider. It evaluates new compatible constraint; documented property lock_selection_constraint_distinction under lock_selection_constraint_distinction.
- Expected decision: Recognize that the locked selection remains if still compatible.
- Decisive boundary: Constraints bound choices; the lock file records the chosen version. With new compatible constraint; documented property lock_selection_constraint_distinction, the required resolution is Recognize that the locked selection remains if still compatible.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:init_plugins_lockfile:use_dependency_lock_selections_across_runs:slot:module-lock-boundary

- Status: authoring-admitted
- Objective: Determine whether the lock file freezes a remote module version. It evaluates module version constraint; documented property providers_only_lock_scope under providers_only_lock_scope.
- Expected decision: Constrain module versions/source refs separately.
- Decisive boundary: Terraform dependency lock currently records providers only. With module version constraint; documented property providers_only_lock_scope, the required resolution is Constrain module versions/source refs separately.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:init_plugins_lockfile:use_dependency_lock_selections_across_runs:slot:multi-platform-lock

- Status: authoring-admitted
- Objective: Prepare lock hashes for multiple CI platforms. It evaluates darwin developer; documented property platform_specific_provider_hashes under platform_specific_provider_hashes.
- Expected decision: Use terraform providers lock for required platforms and review resulting hashes.
- Decisive boundary: Platform packages can differ while representing the same provider version. With darwin developer; documented property platform_specific_provider_hashes, the required resolution is Use terraform providers lock for required platforms and review resulting hashes.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
