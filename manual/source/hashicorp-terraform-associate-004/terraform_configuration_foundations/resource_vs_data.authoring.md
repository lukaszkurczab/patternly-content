# hashicorp-terraform-associate-004 / terraform_configuration_foundations / resource_vs_data

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/resource_vs_data.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:resource_vs_data:declare_an_object_terraform_manages:slot:conditional-resource-cardinality

- Status: authoring-admitted
- Objective: Choose count or for_each for conditional and keyed resource instances. It evaluates stable identity requirement; documented property count_foreach_instance_identity under count_foreach_instance_identity.
- Expected decision: Use for_each for stable keys and count for simple indexed cardinality.
- Decisive boundary: Instance addressing differs and affects state identity. With stable identity requirement; documented property count_foreach_instance_identity, the required resolution is Use for_each for stable keys and count for simple indexed cardinality.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:resource_vs_data:declare_an_object_terraform_manages:slot:managed-resource-ownership

- Status: authoring-admitted
- Objective: Identify a resource block as lifecycle ownership of a remote object. It evaluates resource type; documented property desired_state_resource_ownership under desired_state_resource_ownership.
- Expected decision: Treat Terraform as responsible for create, refresh, update, and destroy at that address.
- Decisive boundary: A managed resource asserts desired lifecycle; a data block does not. With resource type; documented property desired_state_resource_ownership, the required resolution is Treat Terraform as responsible for create, refresh, update, and destroy at that address.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:resource_vs_data:declare_an_object_terraform_manages:slot:provider-schema-arguments

- Status: authoring-admitted
- Objective: Separate provider-specific arguments from Terraform meta-arguments. It evaluates resource schema; documented property provider_defined_resource_schema under provider_defined_resource_schema.
- Expected decision: Validate each argument against its owning schema.
- Decisive boundary: Meta-arguments are Terraform language features; ordinary arguments come from the provider. With resource schema; documented property provider_defined_resource_schema, the required resolution is Validate each argument against its owning schema.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:resource_vs_data:declare_an_object_terraform_manages:slot:resource-instance-address

- Status: authoring-admitted
- Objective: Resolve the address of an instance created with for_each. It evaluates resource label; documented property resource_addressing under resource_addressing.
- Expected decision: Use the keyed instance address rather than the block address alone.
- Decisive boundary: for_each instances are keyed; count instances are indexed. With resource label; documented property resource_addressing, the required resolution is Use the keyed instance address rather than the block address alone.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:resource_vs_data:declare_an_object_terraform_manages:slot:resource-removal-effect

- Status: authoring-admitted
- Objective: Predict the plan when a managed resource declaration disappears. It evaluates state entry exists; documented property configuration_removal_destroy_intent under configuration_removal_destroy_intent.
- Expected decision: Expect Terraform to propose destroying the remote object.
- Decisive boundary: Removing desired ownership normally means destruction. With state entry exists; documented property configuration_removal_destroy_intent, the required resolution is Expect Terraform to propose destroying the remote object.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:resource_vs_data:read_an_existing_object_as_a_data_source:slot:alternate-provider-data

- Status: authoring-admitted
- Objective: Query the same data source type through an aliased provider. It evaluates target region/account; documented property aliased_provider_for_data_source under aliased_provider_for_data_source.
- Expected decision: Route the data block to the exact alias.
- Decisive boundary: Data sources use provider authentication and endpoints like resources. With target region/account; documented property aliased_provider_for_data_source, the required resolution is Route the data block to the exact alias.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:resource_vs_data:read_an_existing_object_as_a_data_source:slot:data-depends-on-boundary

- Status: authoring-admitted
- Objective: Use depends_on on a data source only for a hidden behavioral dependency. It evaluates no attribute reference captures dependency; documented property data_dependencies under data_dependencies.
- Expected decision: Add the narrow dependency and accept conservative unknowns.
- Decisive boundary: Explicit dependencies can defer reads and widen unknown results. With no attribute reference captures dependency; documented property data_dependencies, the required resolution is Add the narrow dependency and accept conservative unknowns.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:resource_vs_data:read_an_existing_object_as_a_data_source:slot:deferred-read-diagnosis

- Status: authoring-admitted
- Objective: Explain a data source marked read during apply. It evaluates query argument unknown; documented property unknown_input_apply_time_read under unknown_input_apply_time_read.
- Expected decision: Trace the unknown argument or explicit dependency.
- Decisive boundary: Terraform defers reads whose inputs are not known safely during planning. With query argument unknown; documented property unknown_input_apply_time_read, the required resolution is Trace the unknown argument or explicit dependency.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:resource_vs_data:read_an_existing_object_as_a_data_source:slot:plan-time-read

- Status: authoring-admitted
- Objective: Predict when a data source can be read during planning. It evaluates all query arguments known; documented property known_input_plan_time_read under known_input_plan_time_read.
- Expected decision: Expect the value during refresh/plan.
- Decisive boundary: Known arguments allow plan-time reads. With all query arguments known; documented property known_input_plan_time_read, the required resolution is Expect the value during refresh/plan.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:resource_vs_data:read_an_existing_object_as_a_data_source:slot:read-only-query

- Status: authoring-admitted
- Objective: Choose a data block for an object managed outside the current configuration. It evaluates existing object; documented property read_only_data under read_only_data.
- Expected decision: Read the object without claiming its lifecycle.
- Decisive boundary: Data sources query; managed resources own lifecycle. With existing object; documented property read_only_data, the required resolution is Read the object without claiming its lifecycle.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
