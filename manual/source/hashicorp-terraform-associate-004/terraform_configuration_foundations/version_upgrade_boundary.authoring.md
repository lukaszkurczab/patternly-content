# hashicorp-terraform-associate-004 / terraform_configuration_foundations / version_upgrade_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/version_upgrade_boundary.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:version_upgrade_boundary:classify_version_upgrade_boundary_evidence:slot:constraint-widening

- Status: authoring-admitted
- Objective: Choose whether a provider constraint permits a desired upgrade. It evaluates current constraint; documented property version_constraint under version_constraint.
- Expected decision: Adjust constraints only after checking all module requirements.
- Decisive boundary: The selected version must satisfy every declared constraint. With current constraint; documented property version_constraint, the required resolution is Adjust constraints only after checking all module requirements.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:version_upgrade_boundary:classify_version_upgrade_boundary_evidence:slot:downgrade-lock-boundary

- Status: authoring-admitted
- Objective: Evaluate a requested provider downgrade. It evaluates state schema written by newer provider; documented property provider_selection under provider_selection.
- Expected decision: Confirm backward compatibility before selecting the older version.
- Decisive boundary: Provider state schemas may not be readable by older versions. With state schema written by newer provider; documented property provider_selection, the required resolution is Confirm backward compatibility before selecting the older version.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:version_upgrade_boundary:classify_version_upgrade_boundary_evidence:slot:post-upgrade-plan-diagnosis

- Status: authoring-admitted
- Objective: Attribute new plan differences after a provider upgrade. It evaluates same configuration; documented property provider_selection under provider_selection.
- Expected decision: Review provider release/schema effects before applying.
- Decisive boundary: Provider behavior and schema can change refreshed values or replacement rules. With same configuration; documented property provider_selection, the required resolution is Review provider release/schema effects before applying.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:version_upgrade_boundary:classify_version_upgrade_boundary_evidence:slot:terraform-core-version

- Status: authoring-admitted
- Objective: Separate Terraform CLI version constraints from provider version constraints. It evaluates required_version; documented property terraform_core_version_constraint under terraform_core_version_constraint.
- Expected decision: Change and validate the correct constraint family.
- Decisive boundary: Core and providers are independently versioned dependencies. With required_version; documented property terraform_core_version_constraint, the required resolution is Change and validate the correct constraint family.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:version_upgrade_boundary:classify_version_upgrade_boundary_evidence:slot:upgrade-selection

- Status: authoring-admitted
- Objective: Perform a reviewed provider upgrade. It evaluates constraint permits version; documented property init_upgrade under init_upgrade.
- Expected decision: Run init -upgrade, inspect lock changes, then plan.
- Decisive boundary: Upgrade changes dependency evidence before infrastructure evidence. With constraint permits version; documented property init_upgrade, the required resolution is Run init -upgrade, inspect lock changes, then plan.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
