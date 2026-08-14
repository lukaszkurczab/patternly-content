# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / architecture_review

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/architecture_review.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:architecture_review:architecture_recommendation_against_stated_fault_deployment_demand_failure_mode:slot:az-failure-test

- Status: authoring-admitted
- Objective: Assess whether the evidence “the recommendation claims high availability but all targets share one AZ” supports the owned resolution “reject it against the stated AZ failure”.
- Expected decision: reject it against the stated AZ failure
- Decisive boundary: This slot owns the boundary established by the recommendation claims high availability but all targets share one AZ; it resolves only to “reject it against the stated AZ failure” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:architecture_review:architecture_recommendation_against_stated_fault_deployment_demand_failure_mode:slot:demand-spike-test

- Status: authoring-admitted
- Objective: Assess whether the evidence “the architecture has no scalable unit for burst demand” supports the owned resolution “reject it against the demand failure mode”.
- Expected decision: reject it against the demand failure mode
- Decisive boundary: This slot owns the boundary established by the architecture has no scalable unit for burst demand; it resolves only to “reject it against the demand failure mode” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:architecture_review:architecture_recommendation_against_stated_fault_deployment_demand_failure_mode:slot:deployment-failure-test

- Status: authoring-admitted
- Objective: Assess whether the evidence “a release replaces all healthy capacity at once” supports the owned resolution “reject it against the deployment failure mode”.
- Expected decision: reject it against the deployment failure mode
- Decisive boundary: This slot owns the boundary established by a release replaces all healthy capacity at once; it resolves only to “reject it against the deployment failure mode” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:architecture_review:architecture_recommendation_against_stated_fault_deployment_demand_failure_mode:slot:failure-domain-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “the requirement moves from instance loss to Region loss” supports the owned resolution “re-evaluate the same recommendation at the larger failure domain”.
- Expected decision: re-evaluate the same recommendation at the larger failure domain
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:architecture_review:architecture_recommendation_against_stated_fault_deployment_demand_failure_mode:slot:fault-mismatch

- Status: authoring-admitted
- Objective: Assess whether the evidence “redundancy exists but not across the failure domain in scope” supports the owned resolution “treat the recommendation as insufficient”.
- Expected decision: treat the recommendation as insufficient
- Decisive boundary: This slot owns the boundary established by redundancy exists but not across the failure domain in scope; it resolves only to “treat the recommendation as insufficient” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:architecture_review:architecture_recommendation_against_stated_fault_deployment_demand_failure_mode:slot:review-sequence

- Status: authoring-admitted
- Objective: Assess whether the evidence “a recommendation lacks a named failure and measurable outcome” supports the owned resolution “order failure definition, evidence, test, and decision”.
- Expected decision: order failure definition, evidence, test, and decision
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:architecture_review:well_architected_finding_its_concrete_reliability_security_performance_cost_risk:slot:cost-risk

- Status: authoring-admitted
- Objective: Assess whether the evidence “idle committed capacity dominates spend without protecting an SLO” supports the owned resolution “classify and prioritize the cost finding”.
- Expected decision: classify and prioritize the cost finding
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:architecture_review:well_architected_finding_its_concrete_reliability_security_performance_cost_risk:slot:performance-risk

- Status: authoring-admitted
- Objective: Assess whether the evidence “a measured bottleneck breaches latency under expected load” supports the owned resolution “classify and prioritize the performance finding”.
- Expected decision: classify and prioritize the performance finding
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:architecture_review:well_architected_finding_its_concrete_reliability_security_performance_cost_risk:slot:pillar-label-alone

- Status: authoring-admitted
- Objective: Assess whether the evidence “two findings share a pillar but differ materially in impact” supports the owned resolution “reject pillar membership as sufficient priority evidence”.
- Expected decision: reject pillar membership as sufficient priority evidence
- Decisive boundary: This slot owns the boundary established by two findings share a pillar but differ materially in impact; it resolves only to “reject pillar membership as sufficient priority evidence” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:architecture_review:well_architected_finding_its_concrete_reliability_security_performance_cost_risk:slot:reliability-risk

- Status: authoring-admitted
- Objective: Assess whether the evidence “a shared dependency can take down all replicas” supports the owned resolution “classify and prioritize the reliability finding”.
- Expected decision: classify and prioritize the reliability finding
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:architecture_review:well_architected_finding_its_concrete_reliability_security_performance_cost_risk:slot:risk-severity-order

- Status: authoring-admitted
- Objective: Assess whether the evidence “findings differ in blast radius, likelihood, and business impact” supports the owned resolution “prioritize by concrete risk rather than pillar label”.
- Expected decision: prioritize by concrete risk rather than pillar label
- Decisive boundary: This slot owns the boundary established by findings differ in blast radius, likelihood, and business impact; it resolves only to “prioritize by concrete risk rather than pillar label” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:architecture_review:well_architected_finding_its_concrete_reliability_security_performance_cost_risk:slot:security-risk

- Status: authoring-admitted
- Objective: Assess whether the evidence “a public data path exposes sensitive records” supports the owned resolution “classify and prioritize the security finding”.
- Expected decision: classify and prioritize the security finding
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
