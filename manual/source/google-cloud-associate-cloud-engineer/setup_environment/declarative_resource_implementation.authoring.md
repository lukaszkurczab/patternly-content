# google-cloud-associate-cloud-engineer / setup_environment / declarative_resource_implementation

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/setup_environment/declarative_resource_implementation.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:declarative_resource_implementation:express_resource_dependencies_identities_configuration_declaratively:slot:api-enablement-ordering

- Status: authoring-admitted
- Objective: Represent service API enablement as a dependency when a Terraform resource cannot be created before its API is active.
- Expected decision: Declare API enablement and connect dependent resources so Terraform orders service activation before creation.
- Decisive boundary: The dependency is required when the provider cannot create the resource until Service Usage reports the API enabled.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:declarative_resource_implementation:express_resource_dependencies_identities_configuration_declaratively:slot:dependency-plan-diagnosis

- Status: authoring-admitted
- Objective: Diagnose a Terraform plan or apply failure caused by a missing resource dependency rather than by invalid provider credentials.
- Expected decision: Add or correct a data-flow reference or explicit dependency so the graph reflects the provider prerequisite.
- Decisive boundary: A prerequisite-ready failure paired with no graph edge identifies ordering; authentication failures occur before the dependent resource can exercise that prerequisite.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:declarative_resource_implementation:express_resource_dependencies_identities_configuration_declaratively:slot:dependency-reference-choice

- Status: authoring-admitted
- Objective: Create Terraform dependencies through expression references when one resource consumes another resource's value.
- Expected decision: Reference the producer attribute directly so Terraform derives both the value and dependency edge.
- Decisive boundary: An actual value flow should be expressed as a reference; depends_on is reserved for dependencies with no usable data reference.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:declarative_resource_implementation:express_resource_dependencies_identities_configuration_declaratively:slot:provider-identity-configuration

- Status: authoring-admitted
- Objective: Configure Terraform to use an approved application identity without embedding a long-lived service-account key in configuration.
- Expected decision: Use the environment's approved short-lived credential path and set provider context explicitly where required.
- Decisive boundary: The provider must authenticate as the intended principal for the target project; configuration files must not become a secret store.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:declarative_resource_implementation:express_resource_dependencies_identities_configuration_declaratively:slot:resource-output-reference

- Status: authoring-admitted
- Objective: Expose only the resource attributes a consuming Terraform module needs, then reference those outputs explicitly.
- Expected decision: Publish a stable module output and wire it into the consumer instead of reaching into another module's internal resources.
- Decisive boundary: Cross-module data must pass through declared outputs; within one module a direct resource reference is simpler.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:declarative_resource_implementation:parameterize_environment_specific_values_duplicating_resource_definitions:slot:input-variable-choice

- Status: authoring-admitted
- Objective: Define a Terraform input variable for a value callers must choose per deployment.
- Expected decision: Expose a typed, documented variable with a safe validation boundary rather than editing duplicated resource blocks.
- Decisive boundary: A value is an input when the module caller owns the choice; derived internal values belong in locals.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:declarative_resource_implementation:parameterize_environment_specific_values_duplicating_resource_definitions:slot:locals-vs-outputs-boundary

- Status: authoring-admitted
- Objective: Use locals for internal expression reuse and outputs for values intentionally exposed outside a module.
- Expected decision: Keep internal derived values in locals; declare outputs only for the module's supported external contract.
- Decisive boundary: Visibility across the module boundary, not how often a value is reused, distinguishes outputs from locals.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:declarative_resource_implementation:parameterize_environment_specific_values_duplicating_resource_definitions:slot:module-reuse-choice

- Status: authoring-admitted
- Objective: Factor repeated infrastructure into a module when deployments share resource structure but vary through a bounded input contract.
- Expected decision: Use one module with explicit inputs and outputs when environments share an invariant resource design.
- Decisive boundary: Reuse is valid when the common structure is real; unrelated topologies should not be forced behind a large conditional module.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:declarative_resource_implementation:parameterize_environment_specific_values_duplicating_resource_definitions:slot:parameterization-scope-transfer

- Status: authoring-admitted
- Objective: Change a parameter's ownership when a once-variable value becomes an invariant or a derived implementation detail.
- Expected decision: Keep caller-owned differences as inputs; move stable or derivable values into module configuration or locals.
- Decisive boundary: The narrowest owner capable of choosing the value correctly should control it.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
