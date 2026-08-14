# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / plan_graph_and_change_interpretation

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/plan_graph_and_change_interpretation.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:interpret_plan_actions_and_unknown_values:slot:action-symbol-classification

- Status: authoring-admitted
- Objective: Interpret create, update, destroy, and replace actions in plan output. It evaluates action symbols; documented property planned_action_symbols under planned_action_symbols.
- Expected decision: Classify operational impact for review.
- Decisive boundary: Replacement can combine create and destroy with meaningful ordering. With action symbols; documented property planned_action_symbols, the required resolution is Classify operational impact for review.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:interpret_plan_actions_and_unknown_values:slot:plan-file-sensitivity

- Status: authoring-admitted
- Objective: Treat a saved plan as a sensitive, version-specific execution artifact. It evaluates exact configuration/state snapshot; documented property saved_plan_sensitive_data under saved_plan_sensitive_data.
- Expected decision: Protect it and apply it only in the matching workflow.
- Decisive boundary: Plan files can embed sensitive values and are not portable approval documents. With exact configuration/state snapshot; documented property saved_plan_sensitive_data, the required resolution is Protect it and apply it only in the matching workflow.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:interpret_plan_actions_and_unknown_values:slot:refresh-only-action

- Status: authoring-admitted
- Objective: Distinguish refresh-only state updates from infrastructure convergence. It evaluates refresh-only mode; documented property refresh_only under refresh_only.
- Expected decision: Use the plan to accept remote facts into state without remote mutation.
- Decisive boundary: Refresh-only changes Terraform records, not managed remote settings. With refresh-only mode; documented property refresh_only, the required resolution is Use the plan to accept remote facts into state without remote mutation.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:interpret_plan_actions_and_unknown_values:slot:replace-cause-diagnosis

- Status: authoring-admitted
- Objective: Trace why a resource is marked for replacement. It evaluates provider force-new attribute; documented property replacement_reason under replacement_reason.
- Expected decision: Identify the exact replacement cause before approval.
- Decisive boundary: Provider schema, lifecycle, user flags, or address changes can force replacement. With provider force-new attribute; documented property replacement_reason, the required resolution is Identify the exact replacement cause before approval.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:interpret_plan_actions_and_unknown_values:slot:sensitive-plan-boundary

- Status: authoring-admitted
- Objective: Recognize that redacted plan values still require change review and secure artifacts. It evaluates sensitive marker; documented property saved_plan_sensitive_data under saved_plan_sensitive_data.
- Expected decision: Review action and provenance while protecting the plan file.
- Decisive boundary: Saved plans can contain sensitive data in cleartext. With sensitive marker; documented property saved_plan_sensitive_data, the required resolution is Review action and provenance while protecting the plan file.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:interpret_plan_actions_and_unknown_values:slot:unknown-value-classification

- Status: authoring-admitted
- Objective: Treat known-after-apply values as deferred provider results. It evaluates unknown marker; documented property unknown_values under unknown_values.
- Expected decision: Review what is knowable and trace downstream uncertainty.
- Decisive boundary: Unknown is a planning abstraction, not automatically an error. With unknown marker; documented property unknown_values, the required resolution is Review what is knowable and trace downstream uncertainty.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:trace_dependency_graph_before_approving_change:slot:cycle-diagnosis

- Status: authoring-admitted
- Objective: Find a circular dependency preventing plan graph construction. It evaluates cycle path diagnostic; documented property dependency_cycle under dependency_cycle.
- Expected decision: Break the data contract cycle.
- Decisive boundary: Lifecycle ordering does not make mutually required input values available. With cycle path diagnostic; documented property dependency_cycle, the required resolution is Break the data contract cycle.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:trace_dependency_graph_before_approving_change:slot:destroy-order-review

- Status: authoring-admitted
- Objective: Verify dependency reversal during destruction. It evaluates producer-consumer edge; documented property dependency_destroy_order under dependency_destroy_order.
- Expected decision: Destroy consumers before objects they depend on.
- Decisive boundary: Dependency direction reverses for safe teardown. With producer-consumer edge; documented property dependency_destroy_order, the required resolution is Destroy consumers before objects they depend on.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:trace_dependency_graph_before_approving_change:slot:explicit-dependency-conservatism

- Status: authoring-admitted
- Objective: Explain unexpectedly unknown downstream values caused by broad depends_on. It evaluates module/resource depends_on; documented property conservative_plans under conservative_plans.
- Expected decision: Narrow or replace the dependency with real value references.
- Decisive boundary: Explicit dependencies can make Terraform defer more computations. With module/resource depends_on; documented property conservative_plans, the required resolution is Narrow or replace the dependency with real value references.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:trace_dependency_graph_before_approving_change:slot:graph-command-boundary

- Status: authoring-admitted
- Objective: Use terraform graph as structural aid, not a substitute for plan action review. It evaluates DOT dependency graph; documented property dependency_graph under dependency_graph.
- Expected decision: Combine graph topology with plan evidence.
- Decisive boundary: Graph shows relationships, not all provider-specific action consequences. With DOT dependency graph; documented property dependency_graph, the required resolution is Combine graph topology with plan evidence.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:trace_dependency_graph_before_approving_change:slot:parallelism-classification

- Status: authoring-admitted
- Objective: Identify which graph branches can execute concurrently. It evaluates independent resources; documented property graph_parallelism under graph_parallelism.
- Expected decision: Allow parallel execution subject to graph and provider behavior.
- Decisive boundary: Terraform graph topology, not source order, determines concurrency. With independent resources; documented property graph_parallelism, the required resolution is Allow parallel execution subject to graph and provider behavior.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:plan_graph_and_change_interpretation:trace_dependency_graph_before_approving_change:slot:upstream-replacement-impact

- Status: authoring-admitted
- Objective: Trace consumers affected when an upstream identifier changes during replacement. It evaluates producer replacement; documented property dependency_graph under dependency_graph.
- Expected decision: Review the graph-propagated impact, not only the initiating resource.
- Decisive boundary: Referenced values can propagate unknowns or updates across resources. With producer replacement; documented property dependency_graph, the required resolution is Review the graph-propagated impact, not only the initiating resource.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
