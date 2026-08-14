# hashicorp-terraform-associate-004 / terraform_configuration_foundations / variables_outputs_locals_scope

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/variables_outputs_locals_scope.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:variables_outputs_locals_scope:choose_variable_local_or_output_by_consumer_scope:slot:input-variable-boundary

- Status: authoring-admitted
- Objective: Choose an input variable for a value supplied by a module caller. It evaluates caller-controlled value; documented property caller_input_boundary under caller_input_boundary.
- Expected decision: Declare a variable with type and description.
- Decisive boundary: Locals are internal expressions; variables form the input interface. With caller-controlled value; documented property caller_input_boundary, the required resolution is Declare a variable with type and description.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:variables_outputs_locals_scope:choose_variable_local_or_output_by_consumer_scope:slot:local-reuse-boundary

- Status: authoring-admitted
- Objective: Choose a local for a repeated internal expression. It evaluates derived expression; documented property module_internal_local under module_internal_local.
- Expected decision: Name the expression with a local.
- Decisive boundary: Locals improve internal clarity without expanding the public interface. With derived expression; documented property module_internal_local, the required resolution is Name the expression with a local.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:variables_outputs_locals_scope:choose_variable_local_or_output_by_consumer_scope:slot:null-omission-choice

- Status: authoring-admitted
- Objective: Use null when an optional provider argument should be omitted conditionally. It evaluates optional argument; documented property null under null.
- Expected decision: Return null to behave as omission where the argument permits it.
- Decisive boundary: null and empty values can have different provider semantics. With optional argument; documented property null, the required resolution is Return null to behave as omission where the argument permits it.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:variables_outputs_locals_scope:choose_variable_local_or_output_by_consumer_scope:slot:output-consumer-boundary

- Status: authoring-admitted
- Objective: Choose an output for data needed outside the module. It evaluates resource attribute; documented property module_output_interface under module_output_interface.
- Expected decision: Expose the minimal stable value as an output.
- Decisive boundary: Parents can consume child outputs, not child internals. With resource attribute; documented property module_output_interface, the required resolution is Expose the minimal stable value as an output.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:variables_outputs_locals_scope:choose_variable_local_or_output_by_consumer_scope:slot:variable-precedence-diagnosis

- Status: authoring-admitted
- Objective: Find why an input variable has an unexpected value. It evaluates default; documented property input_variables under input_variables.
- Expected decision: Trace Terraform variable precedence and the actual invocation.
- Decisive boundary: Assignment sources can override defaults; locals do not alter input precedence. With default; documented property input_variables, the required resolution is Trace Terraform variable precedence and the actual invocation.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:variables_outputs_locals_scope:expose_module_output_without_leaking_internal_values:slot:cross-state-sharing-boundary

- Status: authoring-admitted
- Objective: Avoid exposing full state solely to share one value. It evaluates consumer needs one value; documented property state_security under state_security.
- Expected decision: Publish a constrained output or provider-queryable record.
- Decisive boundary: State access can reveal more than declared outputs. With consumer needs one value; documented property state_security, the required resolution is Publish a constrained output or provider-queryable record.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:variables_outputs_locals_scope:expose_module_output_without_leaking_internal_values:slot:minimal-output-interface

- Status: authoring-admitted
- Objective: Expose only the identifier required by a parent module. It evaluates child resource attributes; documented property module_output_interface under module_output_interface.
- Expected decision: Output the stable identifier instead of the full resource object.
- Decisive boundary: A narrow output reduces coupling to provider schema and accidental data exposure. With child resource attributes; documented property module_output_interface, the required resolution is Output the stable identifier instead of the full resource object.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:variables_outputs_locals_scope:expose_module_output_without_leaking_internal_values:slot:output-removal-impact

- Status: authoring-admitted
- Objective: Assess removing an output used by another module. It evaluates consumer reference; documented property module_output_contract under module_output_contract.
- Expected decision: Update consumers or preserve the interface through a coordinated change.
- Decisive boundary: Outputs participate in dependency and value flow. With consumer reference; documented property module_output_contract, the required resolution is Update consumers or preserve the interface through a coordinated change.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:variables_outputs_locals_scope:expose_module_output_without_leaking_internal_values:slot:root-child-output-access

- Status: authoring-admitted
- Objective: Reference a child module output from its caller. It evaluates module block label; documented property root_child_output_reference under root_child_output_reference.
- Expected decision: Use module.<label>.<output>.
- Decisive boundary: The module call exposes only declared outputs. With module block label; documented property root_child_output_reference, the required resolution is Use module.<label>.<output>.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:variables_outputs_locals_scope:expose_module_output_without_leaking_internal_values:slot:sensitive-output-propagation

- Status: authoring-admitted
- Objective: Mark an output sensitive when it derives from a sensitive value. It evaluates sensitive input; documented property sensitive_output_propagation under sensitive_output_propagation.
- Expected decision: Propagate sensitive marking and secure state access.
- Decisive boundary: Sensitivity metadata propagates through expressions and does not remove storage. With sensitive input; documented property sensitive_output_propagation, the required resolution is Propagate sensitive marking and secure state access.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
