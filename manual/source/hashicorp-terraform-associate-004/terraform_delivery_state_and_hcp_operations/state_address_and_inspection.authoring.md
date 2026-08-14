# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / state_address_and_inspection

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/state_address_and_inspection.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:state_address_and_inspection:classify_state_address_and_inspection_evidence:slot:address-anatomy-classification

- Status: authoring-admitted
- Objective: Classify module path, resource spec, and instance index components in a Terraform address.
- Expected decision: Parse an address into its state-location components.
- Decisive boundary: A Terraform address is formed from configuration names and instance keys, not provider IDs.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_address_and_inspection:classify_state_address_and_inspection_evidence:slot:count-foreach-boundary

- Status: authoring-admitted
- Objective: Distinguish numeric count indices from string for_each keys.
- Expected decision: Use the instance-key form defined by the resource's meta-argument.
- Decisive boundary: Count and for_each produce different address index forms.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_address_and_inspection:classify_state_address_and_inspection_evidence:slot:human-json-output-boundary

- Status: authoring-admitted
- Objective: Distinguish human-oriented state show output from documented JSON output for automation.
- Expected decision: Use documented JSON output when software consumes state data.
- Decisive boundary: Human-readable output is not a documented programmatic interface.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_address_and_inspection:classify_state_address_and_inspection_evidence:slot:list-show-selection

- Status: authoring-admitted
- Objective: Select state list for discovery and state show for one resolved instance.
- Expected decision: Discover candidate addresses before requesting attributes for exactly one instance.
- Decisive boundary: State show requires one matching resource instance; state list supports filtering and discovery.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_address_and_inspection:classify_state_address_and_inspection_evidence:slot:remote-id-lookup-diagnosis

- Status: authoring-admitted
- Objective: Resolve a provider remote-object identifier to its Terraform state address.
- Expected decision: Use state inventory evidence to locate the configuration or state address bound to the remote object.
- Decisive boundary: Remote identifiers and Terraform addresses occupy different namespaces even when they identify the same object.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
