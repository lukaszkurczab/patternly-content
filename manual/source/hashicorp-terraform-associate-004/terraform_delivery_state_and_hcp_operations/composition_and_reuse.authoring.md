# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / composition_and_reuse

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/composition_and_reuse.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:composition_and_reuse:choose_module_boundary_by_reusable_lifecycle:slot:boundary-refactor-transfer

- Status: authoring-admitted
- Objective: Move resources into a new module without recreating them. It evaluates old addresses; documented property module_resource_refactor under module_resource_refactor.
- Expected decision: Declare exact moved mappings and review a no-destroy plan.
- Decisive boundary: Module refactoring changes resource addresses even when remote objects are unchanged. With old addresses; documented property module_resource_refactor, the required resolution is Declare exact moved mappings and review a no-destroy plan.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:composition_and_reuse:choose_module_boundary_by_reusable_lifecycle:slot:cohesive-lifecycle-boundary

- Status: authoring-admitted
- Objective: Group resources that change and are owned together behind a meaningful interface. It evaluates shared lifecycle; documented property cohesive_module_lifecycle under cohesive_module_lifecycle.
- Expected decision: Create a module around the reusable capability.
- Decisive boundary: Module boundaries should express ownership and reuse, not cosmetic layout. With shared lifecycle; documented property cohesive_module_lifecycle, the required resolution is Create a module around the reusable capability.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:composition_and_reuse:choose_module_boundary_by_reusable_lifecycle:slot:overgeneralization-risk

- Status: authoring-admitted
- Objective: Reject a universal module with many unrelated feature toggles. It evaluates many optional inputs; documented property cohesive_module_lifecycle under cohesive_module_lifecycle.
- Expected decision: Prefer smaller cohesive modules composed by callers.
- Decisive boundary: Excess optionality weakens contracts and creates untestable combinations. With many optional inputs; documented property cohesive_module_lifecycle, the required resolution is Prefer smaller cohesive modules composed by callers.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:composition_and_reuse:choose_module_boundary_by_reusable_lifecycle:slot:reuse-evidence

- Status: authoring-admitted
- Objective: Decide whether repeated configuration warrants a module. It evaluates same capability in multiple callers; documented property reuse under reuse.
- Expected decision: Extract a reviewed interface when repetition reflects one reusable concept.
- Decisive boundary: Real reuse includes lifecycle and contract, not only textual duplication. With same capability in multiple callers; documented property reuse, the required resolution is Extract a reviewed interface when repetition reflects one reusable concept.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:composition_and_reuse:choose_module_boundary_by_reusable_lifecycle:slot:state-boundary-distinction

- Status: authoring-admitted
- Objective: Separate a module boundary from a state/workspace boundary. It evaluates child module; documented property module_state_boundary under module_state_boundary.
- Expected decision: Recognize modules organize configuration while root/backend defines state.
- Decisive boundary: Child resources are recorded in the caller root state. With child module; documented property module_state_boundary, the required resolution is Recognize modules organize configuration while root/backend defines state.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:composition_and_reuse:compose_modules_without_duplicate_resource_ownership:slot:cross-state-owner-boundary

- Status: authoring-admitted
- Objective: Share outputs across states without letting both states manage the producer. It evaluates producer state; documented property single_resource_owner under single_resource_owner.
- Expected decision: Keep mutation in producer and read-only consumption elsewhere.
- Decisive boundary: State separation strengthens, rather than relaxes, single ownership. With producer state; documented property single_resource_owner, the required resolution is Keep mutation in producer and read-only consumption elsewhere.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:composition_and_reuse:compose_modules_without_duplicate_resource_ownership:slot:import-duplicate-diagnosis

- Status: authoring-admitted
- Objective: Detect one remote object imported at two addresses. It evaluates matching remote ID; documented property single_address_binding under single_address_binding.
- Expected decision: Remove the erroneous mapping and retain one owner after backup/review.
- Decisive boundary: Terraform expects one remote object per resource address binding. With matching remote ID; documented property single_address_binding, the required resolution is Remove the erroneous mapping and retain one owner after backup/review.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:composition_and_reuse:compose_modules_without_duplicate_resource_ownership:slot:module-count-ownership

- Status: authoring-admitted
- Objective: Ensure repeated module instances receive disjoint object identities. It evaluates module for_each keys; documented property module_instance_identity under module_instance_identity.
- Expected decision: Derive stable unique identities per instance.
- Decisive boundary: Terraform addresses do not guarantee remote API uniqueness. With module for_each keys; documented property module_instance_identity, the required resolution is Derive stable unique identities per instance.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:composition_and_reuse:compose_modules_without_duplicate_resource_ownership:slot:shared-network-interface

- Status: authoring-admitted
- Objective: Compose an application module with a network module through outputs and inputs. It evaluates network output ID; documented property composition under composition.
- Expected decision: Pass the stable network identifier across the interface.
- Decisive boundary: Composition connects ownership units without duplicating resources. With network output ID; documented property composition, the required resolution is Pass the stable network identifier across the interface.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:composition_and_reuse:compose_modules_without_duplicate_resource_ownership:slot:single-owner-composition

- Status: authoring-admitted
- Objective: Assign each remote object to one module/resource address. It evaluates two candidate modules; documented property single_resource_owner under single_resource_owner.
- Expected decision: Choose one canonical owner and expose outputs.
- Decisive boundary: Duplicate ownership produces conflicting plans and state mappings. With two candidate modules; documented property single_resource_owner, the required resolution is Choose one canonical owner and expose outputs.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
