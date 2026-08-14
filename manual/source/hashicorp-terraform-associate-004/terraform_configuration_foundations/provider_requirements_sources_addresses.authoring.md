# hashicorp-terraform-associate-004 / terraform_configuration_foundations / provider_requirements_sources_addresses

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/provider_requirements_sources_addresses.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:provider_requirements_sources_addresses:classify_provider_requirements_sources_addresses_evidence:slot:built-in-provider-boundary

- Status: authoring-admitted
- Objective: Recognize the built-in terraform provider used by terraform_remote_state. It evaluates terraform.io/builtin/terraform; documented property built_in_terraform_provider under built_in_terraform_provider.
- Expected decision: Do not declare the obsolete hashicorp/terraform provider.
- Decisive boundary: The built-in provider is part of Terraform Core and has a distinct source address. With terraform.io/builtin/terraform; documented property built_in_terraform_provider, the required resolution is Do not declare the obsolete hashicorp/terraform provider.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:provider_requirements_sources_addresses:classify_provider_requirements_sources_addresses_evidence:slot:constraint-selection

- Status: authoring-admitted
- Objective: Separate compatible version constraints from the selected installed version. It evaluates version constraint; documented property version_constraint under version_constraint.
- Expected decision: Read compatibility from configuration and exact selection from the lock file.
- Decisive boundary: Constraints define a set; init and the lock file determine the selection. With version constraint; documented property version_constraint, the required resolution is Read compatibility from configuration and exact selection from the lock file.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:provider_requirements_sources_addresses:classify_provider_requirements_sources_addresses_evidence:slot:implied-source-risk

- Status: authoring-admitted
- Objective: Diagnose a requirement that omitted source for a non-HashiCorp provider. It evaluates missing source; documented property implied_hashicorp_source_address under implied_hashicorp_source_address.
- Expected decision: Add the explicit provider source address.
- Decisive boundary: Omission implies registry.terraform.io/hashicorp/<local-name>. With missing source; documented property implied_hashicorp_source_address, the required resolution is Add the explicit provider source address.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:provider_requirements_sources_addresses:classify_provider_requirements_sources_addresses_evidence:slot:local-name-source-address

- Status: authoring-admitted
- Objective: Distinguish a module-local provider name from its global source address. It evaluates required_providers key; documented property source_address under source_address.
- Expected decision: Use the local name in module configuration and the source address for installation identity.
- Decisive boundary: Source addresses are global; local names are module-scoped. With required_providers key; documented property source_address, the required resolution is Use the local name in module configuration and the source address for installation identity.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:provider_requirements_sources_addresses:classify_provider_requirements_sources_addresses_evidence:slot:root-child-requirement

- Status: authoring-admitted
- Objective: Determine which modules must declare provider requirements. It evaluates root module; documented property per_module_provider_requirement under per_module_provider_requirement.
- Expected decision: Declare the requirement in every module that uses the provider.
- Decisive boundary: Configurations may be inherited, but requirements are per module. With root module; documented property per_module_provider_requirement, the required resolution is Declare the requirement in every module that uses the provider.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
