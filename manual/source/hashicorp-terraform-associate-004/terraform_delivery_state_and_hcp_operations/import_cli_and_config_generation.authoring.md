# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / import_cli_and_config_generation

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/import_cli_and_config_generation.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:import_cli_and_config_generation:generate_configuration_then_review_import_result:slot:bulk-import-boundary

- Status: authoring-admitted
- Objective: Recognize single/small-batch generation limits versus provider resource discovery workflows. It evaluates many remote resources; documented property import_block under import_block.
- Expected decision: Use supported bulk discovery only when provider/tooling evidence exists; otherwise scope imports explicitly.
- Decisive boundary: Import identity and configuration remain provider/resource-specific. With many remote resources; documented property import_block, the required resolution is Use supported bulk discovery only when provider/tooling evidence exists; otherwise scope imports explicitly.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:import_cli_and_config_generation:generate_configuration_then_review_import_result:slot:generated-hcl-review

- Status: authoring-admitted
- Objective: Identify provider-populated attributes that should not remain explicit desired settings. It evaluates generated resource arguments; documented property generated_configuration_is_starting_point under generated_configuration_is_starting_point.
- Expected decision: Remove or normalize arguments after comparing provider documentation and intent.
- Decisive boundary: Generated configuration is a best-effort template from observed data, not architectural intent. With generated resource arguments; documented property generated_configuration_is_starting_point, the required resolution is Remove or normalize arguments after comparing provider documentation and intent.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:import_cli_and_config_generation:generate_configuration_then_review_import_result:slot:generation-diagnostic

- Status: authoring-admitted
- Objective: Resolve generation when Terraform cannot determine provider configuration. It evaluates import block; documented property generation_provider_requirement under generation_provider_requirement.
- Expected decision: Add the correct provider configuration and initialize before planning.
- Decisive boundary: Import planning needs a provider context, but credentials are not resource desired state. With import block; documented property generation_provider_requirement, the required resolution is Add the correct provider configuration and initialize before planning.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:import_cli_and_config_generation:generate_configuration_then_review_import_result:slot:import-block-generation

- Status: authoring-admitted
- Objective: Generate starter HCL for an import block whose resource configuration is absent. It evaluates import to address; documented property generate_config_out under generate_config_out.
- Expected decision: Write generated configuration to a new file, then review it.
- Decisive boundary: Configuration generation is tied to import blocks and plan. With import to address; documented property generate_config_out, the required resolution is Write generated configuration to a new file, then review it.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:import_cli_and_config_generation:generate_configuration_then_review_import_result:slot:new-file-boundary

- Status: authoring-admitted
- Objective: Choose a new output path for generated configuration. It evaluates generate-config-out path; documented property new_output_file_requirement under new_output_file_requirement.
- Expected decision: Use a non-existing file and preserve existing source.
- Decisive boundary: Terraform refuses to overwrite an existing generation target. With generate-config-out path; documented property new_output_file_requirement, the required resolution is Use a non-existing file and preserve existing source.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:import_cli_and_config_generation:import_existing_resource_at_correct_address:slot:cli-import-address

- Status: authoring-admitted
- Objective: Import one existing object into its configured resource address. It evaluates resource configuration; documented property cli_import under cli_import.
- Expected decision: Run terraform import ADDRESS ID and review the next plan.
- Decisive boundary: The address defines Terraform ownership and must match the intended resource instance. With resource configuration; documented property cli_import, the required resolution is Run terraform import ADDRESS ID and review the next plan.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:import_cli_and_config_generation:import_existing_resource_at_correct_address:slot:for-each-instance-import

- Status: authoring-admitted
- Objective: Target the correct keyed resource instance during import. It evaluates for_each key; documented property for_each_import under for_each_import.
- Expected decision: Use the full keyed address and verify one-to-one mapping.
- Decisive boundary: Repeated resources have distinct instance addresses. With for_each key; documented property for_each_import, the required resolution is Use the full keyed address and verify one-to-one mapping.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:import_cli_and_config_generation:import_existing_resource_at_correct_address:slot:post-import-plan

- Status: authoring-admitted
- Objective: Review the first plan after import for configuration mismatch. It evaluates imported state attributes; documented property post_import_plan_review under post_import_plan_review.
- Expected decision: Adjust configuration or deliberately converge the object before routine apply.
- Decisive boundary: Import creates a mapping; it does not guarantee configuration describes the object. With imported state attributes; documented property post_import_plan_review, the required resolution is Adjust configuration or deliberately converge the object before routine apply.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:import_cli_and_config_generation:import_existing_resource_at_correct_address:slot:provider-import-id

- Status: authoring-admitted
- Objective: Diagnose an import rejected for an invalid ID. It evaluates resource type; documented property provider_specific_import_id under provider_specific_import_id.
- Expected decision: Use the provider-documented import identifier.
- Decisive boundary: ADDRESS selects state ownership; ID is provider-specific remote identity. With resource type; documented property provider_specific_import_id, the required resolution is Use the provider-documented import identifier.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:import_cli_and_config_generation:import_existing_resource_at_correct_address:slot:single-binding-boundary

- Status: authoring-admitted
- Objective: Prevent importing one remote object to multiple addresses. It evaluates remote object identity; documented property single_address_binding under single_address_binding.
- Expected decision: Confirm no other state entry owns the object.
- Decisive boundary: Terraform assumes one remote object maps to one resource address. With remote object identity; documented property single_address_binding, the required resolution is Confirm no other state entry owns the object.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
