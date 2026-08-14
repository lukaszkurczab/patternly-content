# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / quotas_visibility_and_legacy_constraints

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/quotas_visibility_and_legacy_constraints.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:quotas_visibility_and_legacy_constraints:quotas_service_health_legacy_dependency_evidence_expose_constraint_silently_assuming_cap:slot:aws-health-event

- Status: authoring-admitted
- Objective: Assess whether the evidence “an AWS event affects the service or Region” supports the owned resolution “use AWS Health evidence rather than assuming application failure”.
- Expected decision: use AWS Health evidence rather than assuming application failure
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:quotas_visibility_and_legacy_constraints:quotas_service_health_legacy_dependency_evidence_expose_constraint_silently_assuming_cap:slot:dependency-retirement

- Status: authoring-admitted
- Objective: Assess whether the evidence “the legacy constraint is removed” supports the owned resolution “re-evaluate the architecture without preserving the old workaround”.
- Expected decision: re-evaluate the architecture without preserving the old workaround
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:quotas_visibility_and_legacy_constraints:quotas_service_health_legacy_dependency_evidence_expose_constraint_silently_assuming_cap:slot:legacy-dependency

- Status: authoring-admitted
- Objective: Assess whether the evidence “a required legacy endpoint cannot scale or fail over” supports the owned resolution “surface it as an architecture constraint”.
- Expected decision: surface it as an architecture constraint
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:quotas_visibility_and_legacy_constraints:quotas_service_health_legacy_dependency_evidence_expose_constraint_silently_assuming_cap:slot:service-quota-evidence

- Status: authoring-admitted
- Objective: Assess whether the evidence “planned capacity exceeds the current applied quota” supports the owned resolution “surface the capacity constraint”.
- Expected decision: surface the capacity constraint
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:quotas_visibility_and_legacy_constraints:quotas_service_health_legacy_dependency_evidence_expose_constraint_silently_assuming_cap:slot:silent-capacity-assumption

- Status: authoring-admitted
- Objective: Assess whether the evidence “a design assumes requested instances will always launch” supports the owned resolution “diagnose missing quota and capacity evidence”.
- Expected decision: diagnose missing quota and capacity evidence
- Decisive boundary: This slot owns the boundary established by a design assumes requested instances will always launch; it resolves only to “diagnose missing quota and capacity evidence” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:quotas_visibility_and_legacy_constraints:recognize_account_region_service_quotas_deployment_scaling_plan_exceeds_them:slot:account-quota

- Status: authoring-admitted
- Objective: Assess whether the evidence “multiple workloads share an account-level limit” supports the owned resolution “include aggregate consumption in capacity planning”.
- Expected decision: include aggregate consumption in capacity planning
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:quotas_visibility_and_legacy_constraints:recognize_account_region_service_quotas_deployment_scaling_plan_exceeds_them:slot:adjustable-vs-fixed

- Status: authoring-admitted
- Objective: Assess whether the evidence “a limit is not adjustable through Service Quotas” supports the owned resolution “redesign around the fixed boundary”.
- Expected decision: redesign around the fixed boundary
- Decisive boundary: This slot owns the boundary established by a limit is not adjustable through Service Quotas; it resolves only to “redesign around the fixed boundary” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:quotas_visibility_and_legacy_constraints:recognize_account_region_service_quotas_deployment_scaling_plan_exceeds_them:slot:autoscaling-maximum

- Status: authoring-admitted
- Objective: Assess whether the evidence “Auto Scaling cannot launch beyond an EC2 or related service quota” supports the owned resolution “raise the quota or bound the plan”.
- Expected decision: raise the quota or bound the plan
- Decisive boundary: This slot owns the boundary established by Auto Scaling cannot launch beyond an EC2 or related service quota; it resolves only to “raise the quota or bound the plan” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:quotas_visibility_and_legacy_constraints:recognize_account_region_service_quotas_deployment_scaling_plan_exceeds_them:slot:predeployment-quota

- Status: authoring-admitted
- Objective: Assess whether the evidence “a large rollout is planned” supports the owned resolution “inventory, measure utilization, request increases, and verify before launch”.
- Expected decision: inventory, measure utilization, request increases, and verify before launch
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:quotas_visibility_and_legacy_constraints:recognize_account_region_service_quotas_deployment_scaling_plan_exceeds_them:slot:regional-quota

- Status: authoring-admitted
- Objective: Assess whether the evidence “a scaling event consumes a Region-scoped service quota” supports the owned resolution “check and request the quota in that Region”.
- Expected decision: check and request the quota in that Region
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
