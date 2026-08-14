# hashicorp-terraform-associate-004 / terraform_configuration_foundations / declarative_intent_and_provider_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/declarative_intent_and_provider_boundary.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:declarative_intent_and_provider_boundary:assign_provider_configuration_to_the_resource_api:slot:aliased-region-routing

- Status: authoring-admitted
- Objective: Route a resource to the provider configuration for its required region. It evaluates two provider aliases; documented property alias under alias.
- Expected decision: Set provider to the exact aliased configuration.
- Decisive boundary: Provider selection is explicit per resource when the default is wrong. With two provider aliases; documented property alias, the required resolution is Set provider to the exact aliased configuration.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:declarative_intent_and_provider_boundary:assign_provider_configuration_to_the_resource_api:slot:default-provider-selection

- Status: authoring-admitted
- Objective: Determine which provider configuration a resource uses when no provider meta-argument is present. It evaluates resource type prefix; documented property default_configuration under default_configuration.
- Expected decision: Use the matching default provider configuration.
- Decisive boundary: Aliased configurations are not automatic substitutes for the default. With resource type prefix; documented property default_configuration, the required resolution is Use the matching default provider configuration.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:declarative_intent_and_provider_boundary:assign_provider_configuration_to_the_resource_api:slot:missing-default-diagnosis

- Status: authoring-admitted
- Objective: Diagnose an implied empty default provider configuration. It evaluates all provider blocks aliased; documented property implied_empty_default_configuration under implied_empty_default_configuration.
- Expected decision: Add a usable default or explicitly route every resource.
- Decisive boundary: If every configuration is aliased, Terraform may synthesize an empty default configuration. With all provider blocks aliased; documented property implied_empty_default_configuration, the required resolution is Add a usable default or explicitly route every resource.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:declarative_intent_and_provider_boundary:assign_provider_configuration_to_the_resource_api:slot:provider-api-auth-boundary

- Status: authoring-admitted
- Objective: Separate provider configuration routing from the credentials supplied to that configuration. It evaluates selected alias; documented property provider_authentication_context under provider_authentication_context.
- Expected decision: Verify both the provider instance and its authentication inputs.
- Decisive boundary: Routing chooses a configuration; credentials determine the remote identity it uses. With selected alias; documented property provider_authentication_context, the required resolution is Verify both the provider instance and its authentication inputs.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:declarative_intent_and_provider_boundary:assign_provider_configuration_to_the_resource_api:slot:resource-provider-state-link

- Status: authoring-admitted
- Objective: Preserve the provider configuration needed to destroy an existing object. It evaluates resource removed from configuration; documented property provider_state_association under provider_state_association.
- Expected decision: Restore the configuration until managed objects are destroyed or moved safely.
- Decisive boundary: State retains the last provider association for refresh and destroy. With resource removed from configuration; documented property provider_state_association, the required resolution is Restore the configuration until managed objects are destroyed or moved safely.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:declarative_intent_and_provider_boundary:express_desired_resource_end_state:slot:configuration-change-plan

- Status: authoring-admitted
- Objective: Infer the planned action after a desired attribute changes. It evaluates prior state value; documented property managed_resources under managed_resources.
- Expected decision: Expect update or replacement according to provider schema and lifecycle.
- Decisive boundary: Replacement is determined by provider schema and lifecycle constraints, not textual magnitude. With prior state value; documented property managed_resources, the required resolution is Expect update or replacement according to provider schema and lifecycle.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:declarative_intent_and_provider_boundary:express_desired_resource_end_state:slot:desired-state-declaration

- Status: authoring-admitted
- Objective: Recognize a resource block as desired end state rather than an imperative API sequence. It evaluates resource arguments; documented property declarative_iac under declarative_iac.
- Expected decision: Describe the object Terraform should manage and let the graph determine operations.
- Decisive boundary: A resource block declares state; provider behavior determines how to converge. With resource arguments; documented property declarative_iac, the required resolution is Describe the object Terraform should manage and let the graph determine operations.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:declarative_intent_and_provider_boundary:express_desired_resource_end_state:slot:external-object-boundary

- Status: authoring-admitted
- Objective: Select a data source instead of managed resource when Terraform must read but not own an existing object. It evaluates object managed elsewhere; documented property read_only_data under read_only_data.
- Expected decision: Query with a data block and keep ownership external.
- Decisive boundary: Managed resources assert lifecycle ownership; data sources query existing information. With object managed elsewhere; documented property read_only_data, the required resolution is Query with a data block and keep ownership external.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:declarative_intent_and_provider_boundary:express_desired_resource_end_state:slot:ordered-relationship-expression

- Status: authoring-admitted
- Objective: Encode object ordering through an attribute reference when data flow exists. It evaluates consumer needs producer ID; documented property implicit_dependencies under implicit_dependencies.
- Expected decision: Reference the producer attribute and gain both value flow and ordering.
- Decisive boundary: A real reference is more precise than an explicit ordering-only edge. With consumer needs producer ID; documented property implicit_dependencies, the required resolution is Reference the producer attribute and gain both value flow and ordering.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:declarative_intent_and_provider_boundary:express_desired_resource_end_state:slot:removed-resource-intent

- Status: authoring-admitted
- Objective: Distinguish removing a resource block from abandoning its remote object. It evaluates resource absent from configuration; documented property configuration_removal_destroy_intent under configuration_removal_destroy_intent.
- Expected decision: Expect destruction unless an explicit state-removal transition preserves the object.
- Decisive boundary: Configuration absence normally declares the managed object no longer desired. With resource absent from configuration; documented property configuration_removal_destroy_intent, the required resolution is Expect destruction unless an explicit state-removal transition preserves the object.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
