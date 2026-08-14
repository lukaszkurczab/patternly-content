# hashicorp-terraform-associate-004 / terraform_configuration_foundations / iac_value_and_multi_cloud

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/iac_value_and_multi_cloud.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:iac_value_and_multi_cloud:choose_repeatable_iac_over_clickops:slot:idempotent-reapply-boundary

- Status: authoring-admitted
- Objective: Determine whether rerunning the same declaration should converge without duplicating infrastructure. It evaluates stable resource address; documented property declarative_iac under declarative_iac.
- Expected decision: Expect no change after convergence.
- Decisive boundary: Idempotence requires the same address-to-object mapping; scripts may duplicate work without that model. With stable resource address; documented property declarative_iac, the required resolution is Expect no change after convergence.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:iac_value_and_multi_cloud:choose_repeatable_iac_over_clickops:slot:manual-hotfix-reconciliation

- Status: authoring-admitted
- Objective: Select the next safe action after an operator changes a managed resource outside Terraform. It evaluates manual hotfix; documented property drift_accept_or_revert under drift_accept_or_revert.
- Expected decision: Review drift and encode or revert the hotfix before routine apply.
- Decisive boundary: A manual fix can be operationally valid while still leaving Terraform ownership inconsistent. With manual hotfix; documented property drift_accept_or_revert, the required resolution is Review drift and encode or revert the hotfix before routine apply.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:iac_value_and_multi_cloud:choose_repeatable_iac_over_clickops:slot:repeatable-environment-classification

- Status: authoring-admitted
- Objective: Classify versioned desired configuration as the repeatable source for recreating equivalent environments. It evaluates configuration in version control; documented property declarative_iac under declarative_iac.
- Expected decision: Choose Terraform configuration over undocumented console actions.
- Decisive boundary: Repeatability depends on reviewable configuration and stable inputs, not on remembering UI steps. With configuration in version control; documented property declarative_iac, the required resolution is Choose Terraform configuration over undocumented console actions.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:iac_value_and_multi_cloud:choose_repeatable_iac_over_clickops:slot:reviewable-change-evidence

- Status: authoring-admitted
- Objective: Identify which change path leaves an auditable proposal before infrastructure mutation. It evaluates configuration diff; documented property plan_before_apply under plan_before_apply.
- Expected decision: Route the change through configuration and plan review.
- Decisive boundary: Provider audit history records actions but does not encode intended desired state. With configuration diff; documented property plan_before_apply, the required resolution is Route the change through configuration and plan review.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:iac_value_and_multi_cloud:choose_repeatable_iac_over_clickops:slot:scale-team-collaboration-choice

- Status: authoring-admitted
- Objective: Choose IaC when multiple operators must reproduce and review infrastructure changes. It evaluates multiple contributors; documented property versioned_reusable_shareable_configuration under versioned_reusable_shareable_configuration.
- Expected decision: Use shared configuration, state, and review workflow.
- Decisive boundary: State is operational mapping data and may contain secrets; configuration is the reviewable intent. With multiple contributors; documented property versioned_reusable_shareable_configuration, the required resolution is Use shared configuration, state, and review workflow.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:iac_value_and_multi_cloud:separate_terraform_core_from_provider_services:slot:core-provider-responsibility

- Status: authoring-admitted
- Objective: Separate Terraform Core graph and state responsibilities from provider API translation. It evaluates dependency graph; documented property provider_model under provider_model.
- Expected decision: Assign evaluation and graph execution to Core, resource CRUD translation to the provider.
- Decisive boundary: Providers implement resource types; Core orchestrates declared relationships and state. With dependency graph; documented property provider_model, the required resolution is Assign evaluation and graph execution to Core, resource CRUD translation to the provider.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:iac_value_and_multi_cloud:separate_terraform_core_from_provider_services:slot:multi-provider-plan

- Status: authoring-admitted
- Objective: Trace one plan that configures resources through two provider plugins. It evaluates two source addresses; documented property consistent_provider_extensible_workflow under consistent_provider_extensible_workflow.
- Expected decision: Keep one Core workflow while each provider handles its own APIs.
- Decisive boundary: Provider diversity does not itself require multiple Core processes; state boundaries are an architecture choice. With two source addresses; documented property consistent_provider_extensible_workflow, the required resolution is Keep one Core workflow while each provider handles its own APIs.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:iac_value_and_multi_cloud:separate_terraform_core_from_provider_services:slot:provider-schema-failure

- Status: authoring-admitted
- Objective: Locate a diagnostic caused by an unsupported resource argument. It evaluates provider schema; documented property provider_model under provider_model.
- Expected decision: Inspect the selected provider version and resource schema.
- Decisive boundary: Resource arguments belong to the provider schema, although Core validates configuration against it. With provider schema; documented property provider_model, the required resolution is Inspect the selected provider version and resource schema.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:iac_value_and_multi_cloud:separate_terraform_core_from_provider_services:slot:service-agnostic-boundary

- Status: authoring-admitted
- Objective: Explain what remains service-agnostic when provider resource types differ. It evaluates HCL constructs; documented property consistent_provider_extensible_workflow under consistent_provider_extensible_workflow.
- Expected decision: Reuse workflow and language concepts, not provider-specific arguments.
- Decisive boundary: Terraform is provider-extensible, not a universal resource-schema translator. With HCL constructs; documented property consistent_provider_extensible_workflow, the required resolution is Reuse workflow and language concepts, not provider-specific arguments.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
