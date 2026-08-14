# hashicorp-terraform-associate-004 / terraform_configuration_foundations / state_purpose_and_change_cycle

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/state_purpose_and_change_cycle.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:state_purpose_and_change_cycle:reconcile_planned_change_with_refreshed_state:slot:drift-versus-config-change

- Status: authoring-admitted
- Objective: Separate drift from an intentional configuration edit in a plan. It evaluates remote value differs from prior state; documented property plan_refresh under plan_refresh.
- Expected decision: Attribute each difference to external change, desired change, or both.
- Decisive boundary: Drift is remote divergence; configuration edits change desired state. With remote value differs from prior state; documented property plan_refresh, the required resolution is Attribute each difference to external change, desired change, or both.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_purpose_and_change_cycle:reconcile_planned_change_with_refreshed_state:slot:refresh-before-diff

- Status: authoring-admitted
- Objective: Trace how a normal plan refreshes remote object data before comparing configuration. It evaluates prior state; documented property plan_refresh under plan_refresh.
- Expected decision: Update the working view and calculate the resulting diff.
- Decisive boundary: Normal planning incorporates refresh unless explicitly disabled. With prior state; documented property plan_refresh, the required resolution is Update the working view and calculate the resulting diff.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_purpose_and_change_cycle:reconcile_planned_change_with_refreshed_state:slot:refresh-false-boundary

- Status: authoring-admitted
- Objective: Evaluate the risk of planning with refresh disabled. It evaluates -refresh=false; documented property refresh_disabled_visibility under refresh_disabled_visibility.
- Expected decision: Treat the plan as based on stale mappings and restrict use to a justified performance tradeoff.
- Decisive boundary: Skipping refresh removes current remote evidence from the plan. With -refresh=false; documented property refresh_disabled_visibility, the required resolution is Treat the plan as based on stale mappings and restrict use to a justified performance tradeoff.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_purpose_and_change_cycle:reconcile_planned_change_with_refreshed_state:slot:refresh-only-reconciliation

- Status: authoring-admitted
- Objective: Choose refresh-only when external changes should be accepted into state without changing remote infrastructure. It evaluates intentional out-of-band change; documented property refresh_only under refresh_only.
- Expected decision: Review and apply a refresh-only plan.
- Decisive boundary: Refresh-only changes state/output records; normal apply may converge remote objects. With intentional out-of-band change; documented property refresh_only, the required resolution is Review and apply a refresh-only plan.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_purpose_and_change_cycle:reconcile_planned_change_with_refreshed_state:slot:unknown-after-apply

- Status: authoring-admitted
- Objective: Interpret an unknown value in the plan. It evaluates provider-computed attribute; documented property unknown_values under unknown_values.
- Expected decision: Recognize deferred value calculation rather than drift or error by itself.
- Decisive boundary: Unknown values are placeholders when the provider cannot determine a result during planning. With provider-computed attribute; documented property unknown_values, the required resolution is Recognize deferred value calculation rather than drift or error by itself.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_purpose_and_change_cycle:use_state_to_map_config_to_real_objects:slot:address-object-mapping

- Status: authoring-admitted
- Objective: Identify state as the binding between a resource instance address and a remote object. It evaluates resource address; documented property resource_address_remote_object_mapping under resource_address_remote_object_mapping.
- Expected decision: Use the mapping to refresh and plan the same object.
- Decisive boundary: Without the mapping Terraform may plan a duplicate or lose lifecycle control. With resource address; documented property resource_address_remote_object_mapping, the required resolution is Use the mapping to refresh and plan the same object.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_purpose_and_change_cycle:use_state_to_map_config_to_real_objects:slot:metadata-dependency-role

- Status: authoring-admitted
- Objective: Explain why state retains dependency metadata after configuration changes. It evaluates prior dependency; documented property dependency_metadata under dependency_metadata.
- Expected decision: Use retained metadata to order operations safely.
- Decisive boundary: State includes metadata needed when configuration no longer contains the original edge. With prior dependency; documented property dependency_metadata, the required resolution is Use retained metadata to order operations safely.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_purpose_and_change_cycle:use_state_to_map_config_to_real_objects:slot:one-object-one-address

- Status: authoring-admitted
- Objective: Apply the single-binding invariant when importing or refactoring. It evaluates one remote object; documented property one_object_one_address under one_object_one_address.
- Expected decision: Bind the object to exactly one address.
- Decisive boundary: Duplicate bindings can produce conflicting lifecycle actions. With one remote object; documented property one_object_one_address, the required resolution is Bind the object to exactly one address.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_purpose_and_change_cycle:use_state_to_map_config_to_real_objects:slot:state-loss-diagnosis

- Status: authoring-admitted
- Objective: Predict the plan after state is lost but managed objects still exist. It evaluates empty state; documented property state_loss_mapping_risk under state_loss_mapping_risk.
- Expected decision: Expect Terraform to plan creation unless mappings are recovered or imported.
- Decisive boundary: Providers do not generally infer ownership from similarity. With empty state; documented property state_loss_mapping_risk, the required resolution is Expect Terraform to plan creation unless mappings are recovered or imported.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:state_purpose_and_change_cycle:use_state_to_map_config_to_real_objects:slot:state-secret-boundary

- Status: authoring-admitted
- Objective: Classify state as sensitive operational data even when outputs are redacted. It evaluates resource attributes; documented property state_security under state_security.
- Expected decision: Secure state storage and access independently of display redaction.
- Decisive boundary: Sensitive marking affects presentation, not removal from state. With resource attributes; documented property state_security, the required resolution is Secure state storage and access independently of display redaction.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
