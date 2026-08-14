# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / module_sources_and_versions

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/module_sources_and_versions.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:module_sources_and_versions:choose_registry_git_or_local_module_source:slot:git-source-choice

- Status: authoring-admitted
- Objective: Choose a Git source for a version-controlled module not published to a registry. It evaluates repository URL; documented property git_source under git_source.
- Expected decision: Use git:: source syntax and pin a ref.
- Decisive boundary: VCS sources use repository revision semantics. With repository URL; documented property git_source, the required resolution is Use git:: source syntax and pin a ref.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_sources_and_versions:choose_registry_git_or_local_module_source:slot:local-source-choice

- Status: authoring-admitted
- Objective: Choose a local module for code released atomically with its caller. It evaluates same repository; documented property local_source under local_source.
- Expected decision: Use a relative path and preserve repository structure.
- Decisive boundary: Relative local sources are portable within the codebase. With same repository; documented property local_source, the required resolution is Use a relative path and preserve repository structure.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_sources_and_versions:choose_registry_git_or_local_module_source:slot:registry-source-choice

- Status: authoring-admitted
- Objective: Choose a registry source when discoverable versioned releases and registry metadata are required. It evaluates published module; documented property registry_source under registry_source.
- Expected decision: Use registry address plus version constraint.
- Decisive boundary: Registry protocol provides version discovery and distribution. With published module; documented property registry_source, the required resolution is Use registry address plus version constraint.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_sources_and_versions:choose_registry_git_or_local_module_source:slot:source-change-init

- Status: authoring-admitted
- Objective: Reinitialize after changing module source kind or location. It evaluates module source edited; documented property module_reinitialization under module_reinitialization.
- Expected decision: Run init to install the new source before plan.
- Decisive boundary: Module installation belongs to init. With module source edited; documented property module_reinitialization, the required resolution is Run init to install the new source before plan.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_sources_and_versions:choose_registry_git_or_local_module_source:slot:subdirectory-syntax

- Status: authoring-admitted
- Objective: Diagnose a remote source that points to the repository root instead of the module subdirectory. It evaluates double-slash subdirectory; documented property subdirectory under subdirectory.
- Expected decision: Correct source syntax so Terraform downloads package then selects the subdirectory.
- Decisive boundary: Remote package subdirectory and query parameters have defined ordering. With double-slash subdirectory; documented property subdirectory, the required resolution is Correct source syntax so Terraform downloads package then selects the subdirectory.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_sources_and_versions:pin_module_source_and_version_for_reproducibility:slot:git-ref-pin

- Status: authoring-admitted
- Objective: Pin a VCS module source to a tag or commit via ref. It evaluates git source; documented property immutable_git_ref under immutable_git_ref.
- Expected decision: Use a reviewed immutable ref for reproducibility.
- Decisive boundary: The module version argument is not available for generic Git sources. With git source; documented property immutable_git_ref, the required resolution is Use a reviewed immutable ref for reproducibility.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_sources_and_versions:pin_module_source_and_version_for_reproducibility:slot:local-source-boundary

- Status: authoring-admitted
- Objective: Recognize that a local module shares the caller repository revision. It evaluates relative source path; documented property local_source_same_revision under local_source_same_revision.
- Expected decision: Version it with the containing codebase.
- Decisive boundary: Local modules are not independently downloaded/version-selected. With relative source path; documented property local_source_same_revision, the required resolution is Version it with the containing codebase.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_sources_and_versions:pin_module_source_and_version_for_reproducibility:slot:lockfile-module-misconception

- Status: authoring-admitted
- Objective: Reject reliance on .terraform.lock.hcl for module revision locking. It evaluates lock entries; documented property providers_only_lock_scope under providers_only_lock_scope.
- Expected decision: Pin modules in their source syntax.
- Decisive boundary: The dependency lock currently tracks providers, not modules. With lock entries; documented property providers_only_lock_scope, the required resolution is Pin modules in their source syntax.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_sources_and_versions:pin_module_source_and_version_for_reproducibility:slot:module-upgrade-plan

- Status: authoring-admitted
- Objective: Upgrade a module through a reviewed source/version change. It evaluates new version constraint/ref; documented property module_reinitialization under module_reinitialization.
- Expected decision: Reinstall and inspect downstream infrastructure changes.
- Decisive boundary: The source declaration is canonical; cache edits are disposable. With new version constraint/ref; documented property module_reinitialization, the required resolution is Reinstall and inspect downstream infrastructure changes.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_sources_and_versions:pin_module_source_and_version_for_reproducibility:slot:registry-version-constraint

- Status: authoring-admitted
- Objective: Pin a registry module with an explicit compatible version constraint. It evaluates registry source address; documented property registry_version_constraint under registry_version_constraint.
- Expected decision: Select a controlled version range or exact version per policy.
- Decisive boundary: Registry module versions are independent dependencies. With registry source address; documented property registry_version_constraint, the required resolution is Select a controlled version range or exact version per policy.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
