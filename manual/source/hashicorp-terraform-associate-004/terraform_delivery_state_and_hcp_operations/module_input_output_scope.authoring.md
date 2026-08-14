# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / module_input_output_scope

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/module_input_output_scope.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:module_input_output_scope:consume_module_outputs_instead_of_internal_addresses:slot:output-contract-change

- Status: authoring-admitted
- Objective: Handle a renamed or removed module output. It evaluates module version change; documented property module_output_contract under module_output_contract.
- Expected decision: Update the caller through a coordinated module contract change.
- Decisive boundary: Outputs are the supported interface and can have versioned compatibility impact. With module version change; documented property module_output_contract, the required resolution is Update the caller through a coordinated module contract change.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_input_output_scope:consume_module_outputs_instead_of_internal_addresses:slot:output-dependency

- Status: authoring-admitted
- Objective: Recognize that consuming an output carries dependencies of its expression. It evaluates output expression; documented property outputs under outputs.
- Expected decision: Let Terraform order the downstream object appropriately.
- Decisive boundary: Output value flow creates precise graph edges. With output expression; documented property outputs, the required resolution is Let Terraform order the downstream object appropriately.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_input_output_scope:consume_module_outputs_instead_of_internal_addresses:slot:output-reference

- Status: authoring-admitted
- Objective: Consume a child output from the parent configuration. It evaluates module label; documented property outputs under outputs.
- Expected decision: Reference module.<label>.<output>.
- Decisive boundary: Child internals are not addressable as parent values. With module label; documented property outputs, the required resolution is Reference module.<label>.<output>.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_input_output_scope:consume_module_outputs_instead_of_internal_addresses:slot:sensitive-output-consumption

- Status: authoring-admitted
- Objective: Propagate sensitivity when a caller consumes a sensitive module output. It evaluates child sensitive output; documented property sensitive_output_propagation under sensitive_output_propagation.
- Expected decision: Keep the derived value sensitive and secure state.
- Decisive boundary: nonsensitive is an explicit declassification decision, not a formatting fix. With child sensitive output; documented property sensitive_output_propagation, the required resolution is Keep the derived value sensitive and secure state.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_input_output_scope:pass_only_declared_module_inputs:slot:declared-input-contract

- Status: authoring-admitted
- Objective: Pass values only to variables declared by the child module. It evaluates module arguments; documented property inputs under inputs.
- Expected decision: Match caller arguments to the child interface.
- Decisive boundary: Module-specific arguments are defined by child inputs. With module arguments; documented property inputs, the required resolution is Match caller arguments to the child interface.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_input_output_scope:pass_only_declared_module_inputs:slot:input-type-propagation

- Status: authoring-admitted
- Objective: Trace a caller value that fails the child input type. It evaluates caller expression type; documented property inputs under inputs.
- Expected decision: Fix the interface/value at the module boundary.
- Decisive boundary: The module call is a typed contract. With caller expression type; documented property inputs, the required resolution is Fix the interface/value at the module boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_input_output_scope:pass_only_declared_module_inputs:slot:interface-minimization

- Status: authoring-admitted
- Objective: Avoid exposing every child resource argument as a module variable. It evaluates stable use case; documented property module_interface_contract under module_interface_contract.
- Expected decision: Expose real consumer decisions and keep invariants internal.
- Decisive boundary: A useful module interface encodes reusable policy and lifecycle. With stable use case; documented property module_interface_contract, the required resolution is Expose real consumer decisions and keep invariants internal.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_input_output_scope:pass_only_declared_module_inputs:slot:provider-map-not-input

- Status: authoring-admitted
- Objective: Separate provider configuration passing from ordinary module variables. It evaluates providers map; documented property provider_passing under provider_passing.
- Expected decision: Use the providers meta-argument for provider instances.
- Decisive boundary: Provider references are not ordinary values and follow static routing rules. With providers map; documented property provider_passing, the required resolution is Use the providers meta-argument for provider instances.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:module_input_output_scope:pass_only_declared_module_inputs:slot:required-input-diagnosis

- Status: authoring-admitted
- Objective: Diagnose a missing required module input. It evaluates child variable no default; documented property inputs under inputs.
- Expected decision: Supply the value or intentionally add a safe child default.
- Decisive boundary: Locals do not assign input variables. With child variable no default; documented property inputs, the required resolution is Supply the value or intentionally add a safe child default.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
