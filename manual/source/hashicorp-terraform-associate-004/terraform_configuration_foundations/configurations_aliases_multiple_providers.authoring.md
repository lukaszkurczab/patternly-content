# hashicorp-terraform-associate-004 / terraform_configuration_foundations / configurations_aliases_multiple_providers

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/configurations_aliases_multiple_providers.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:configurations_aliases_multiple_providers:inherit_or_pass_provider_aliases_to_child_modules:slot:alias-contract-transfer

- Status: authoring-admitted
- Objective: Apply the child alias contract when moving a module between accounts. It evaluates same module code; documented property configuration_aliases under configuration_aliases.
- Expected decision: Change caller mappings without changing child resource logic.
- Decisive boundary: Explicit alias contracts separate module behavior from caller credentials/endpoints. With same module code; documented property configuration_aliases, the required resolution is Change caller mappings without changing child resource logic.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:configurations_aliases_multiple_providers:inherit_or_pass_provider_aliases_to_child_modules:slot:default-inheritance

- Status: authoring-admitted
- Objective: Identify when a child module inherits a default provider configuration. It evaluates caller default configuration; documented property provider_inheritance under provider_inheritance.
- Expected decision: Allow implicit default inheritance for the matching provider.
- Decisive boundary: Only default configurations are inherited automatically. With caller default configuration; documented property provider_inheritance, the required resolution is Allow implicit default inheritance for the matching provider.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:configurations_aliases_multiple_providers:inherit_or_pass_provider_aliases_to_child_modules:slot:explicit-alias-map

- Status: authoring-admitted
- Objective: Pass two aliased configurations into a child module. It evaluates child configuration_aliases; documented property configuration_aliases under configuration_aliases.
- Expected decision: Map each child provider name to the intended caller configuration.
- Decisive boundary: Provider configurations belong in the root; children declare requirements and aliases. With child configuration_aliases; documented property configuration_aliases, the required resolution is Map each child provider name to the intended caller configuration.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:configurations_aliases_multiple_providers:inherit_or_pass_provider_aliases_to_child_modules:slot:legacy-child-provider-failure

- Status: authoring-admitted
- Objective: Diagnose a child module with embedded provider configurations used with for_each. It evaluates child provider block; documented property legacy_child_provider_configuration_limit under legacy_child_provider_configuration_limit.
- Expected decision: Refactor provider configurations into the root and pass them.
- Decisive boundary: Legacy child configurations conflict with module repetition and modern lifecycle control. With child provider block; documented property legacy_child_provider_configuration_limit, the required resolution is Refactor provider configurations into the root and pass them.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:configurations_aliases_multiple_providers:inherit_or_pass_provider_aliases_to_child_modules:slot:providers-map-override

- Status: authoring-admitted
- Objective: Predict inheritance after a module call sets a providers map. It evaluates providers argument; documented property providers_map under providers_map.
- Expected decision: Use the explicit mapping for that provider and do not assume default inheritance remains.
- Decisive boundary: The providers map overrides automatic inheritance for mapped providers. With providers argument; documented property providers_map, the required resolution is Use the explicit mapping for that provider and do not assume default inheritance remains.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:configurations_aliases_multiple_providers:route_resource_to_aliased_provider_configuration:slot:alias-name-mismatch

- Status: authoring-admitted
- Objective: Diagnose a reference to an undeclared provider alias. It evaluates resource provider reference; documented property alias under alias.
- Expected decision: Correct the alias or add the intended provider configuration.
- Decisive boundary: Init installs provider binaries; it does not create configuration aliases. With resource provider reference; documented property alias, the required resolution is Correct the alias or add the intended provider configuration.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:configurations_aliases_multiple_providers:route_resource_to_aliased_provider_configuration:slot:cross-account-routing

- Status: authoring-admitted
- Objective: Choose explicit aliases when resources of one provider type target separate accounts. It evaluates two credential sets; documented property explicit_alias_routing under explicit_alias_routing.
- Expected decision: Create named configurations and route each resource explicitly.
- Decisive boundary: Provider configuration is fixed for the graph; mid-run credential switching is not resource routing. With two credential sets; documented property explicit_alias_routing, the required resolution is Create named configurations and route each resource explicitly.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:configurations_aliases_multiple_providers:route_resource_to_aliased_provider_configuration:slot:default-versus-alias

- Status: authoring-admitted
- Objective: Classify whether a resource will use default or aliased configuration. It evaluates provider meta-argument present; documented property default_configuration under default_configuration.
- Expected decision: Use alias only when explicitly referenced.
- Decisive boundary: Configuration selection follows references, not file order. With provider meta-argument present; documented property default_configuration, the required resolution is Use alias only when explicitly referenced.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:configurations_aliases_multiple_providers:route_resource_to_aliased_provider_configuration:slot:provider-meta-static-reference

- Status: authoring-admitted
- Objective: Reject a dynamic provider selection expression. It evaluates conditional account choice; documented property static_provider_reference under static_provider_reference.
- Expected decision: Model separate resource/module instances with explicit provider references.
- Decisive boundary: Provider associations must be known while Terraform builds the graph. With conditional account choice; documented property static_provider_reference, the required resolution is Model separate resource/module instances with explicit provider references.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:configurations_aliases_multiple_providers:route_resource_to_aliased_provider_configuration:slot:resource-alias-route

- Status: authoring-admitted
- Objective: Assign an alternate provider configuration to a managed resource. It evaluates provider alias; documented property alias under alias.
- Expected decision: Reference <local-name>.<alias> in the resource.
- Decisive boundary: Aliases name configurations, not provider installations. With provider alias; documented property alias, the required resolution is Reference <local-name>.<alias> in the resource.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
