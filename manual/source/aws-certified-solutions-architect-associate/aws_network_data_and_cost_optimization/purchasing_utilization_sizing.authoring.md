# aws-certified-solutions-architect-associate / aws_network_data_and_cost_optimization / purchasing_utilization_sizing

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_network_data_and_cost_optimization/purchasing_utilization_sizing.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:change_instance_family_count_measured_cpu_memory_network_schedule_utilization:slot:cpu-overprovisioned

- Status: authoring-admitted
- Objective: Assess whether the evidence “measured CPU remains low across representative periods” supports the owned resolution “reduce vCPU or instance count after checking other resources”.
- Expected decision: reduce vCPU or instance count after checking other resources
- Decisive boundary: This slot owns the boundary established by measured CPU remains low across representative periods; it resolves only to “reduce vCPU or instance count after checking other resources” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:change_instance_family_count_measured_cpu_memory_network_schedule_utilization:slot:memory-constrained

- Status: authoring-admitted
- Objective: Assess whether the evidence “memory pressure and swapping occur while CPU is moderate” supports the owned resolution “choose a memory-suited family or size”.
- Expected decision: choose a memory-suited family or size
- Decisive boundary: This slot owns the boundary established by memory pressure and swapping occur while CPU is moderate; it resolves only to “choose a memory-suited family or size” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:change_instance_family_count_measured_cpu_memory_network_schedule_utilization:slot:network-constrained

- Status: authoring-admitted
- Objective: Assess whether the evidence “network throughput or packets reach the instance limit” supports the owned resolution “choose a network-capable family or scale out”.
- Expected decision: choose a network-capable family or scale out
- Decisive boundary: This slot owns the boundary established by network throughput or packets reach the instance limit; it resolves only to “choose a network-capable family or scale out” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:change_instance_family_count_measured_cpu_memory_network_schedule_utilization:slot:recommendation-validation

- Status: authoring-admitted
- Objective: Assess whether the evidence “Compute Optimizer recommends a change” supports the owned resolution “validate representative metrics, migration risk, performance, and cost before applying”.
- Expected decision: validate representative metrics, migration risk, performance, and cost before applying
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:change_instance_family_count_measured_cpu_memory_network_schedule_utilization:slot:scheduled-idle

- Status: authoring-admitted
- Objective: Assess whether the evidence “capacity is unused on a predictable schedule” supports the owned resolution “stop, schedule, or scale it down”.
- Expected decision: stop, schedule, or scale it down
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:change_instance_family_count_measured_cpu_memory_network_schedule_utilization:slot:single-metric-rightsize

- Status: authoring-admitted
- Objective: Assess whether the evidence “CPU is low but memory or licensing constrains the workload” supports the owned resolution “reject CPU-only rightsizing”.
- Expected decision: reject CPU-only rightsizing
- Decisive boundary: This slot owns the boundary established by CPU is low but memory or licensing constrains the workload; it resolves only to “reject CPU-only rightsizing” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:savings_plans_reserved_instances_spot_demand_stable_utilization_interruption_tolerance:slot:commitment-risk

- Status: authoring-admitted
- Objective: Assess whether the evidence “forecast confidence is too low for the proposed term and payment” supports the owned resolution “reject overcommitment”.
- Expected decision: reject overcommitment
- Decisive boundary: This slot owns the boundary established by forecast confidence is too low for the proposed term and payment; it resolves only to “reject overcommitment” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:savings_plans_reserved_instances_spot_demand_stable_utilization_interruption_tolerance:slot:interruption-tolerance-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “a batch worker becomes stateful and nonrestartable” supports the owned resolution “move it off Spot”.
- Expected decision: move it off Spot
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:savings_plans_reserved_instances_spot_demand_stable_utilization_interruption_tolerance:slot:on-demand-uncertain

- Status: authoring-admitted
- Objective: Assess whether the evidence “usage is short-lived or uncertain and interruption is unacceptable” supports the owned resolution “use On-Demand Instances”.
- Expected decision: use On-Demand Instances
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:savings_plans_reserved_instances_spot_demand_stable_utilization_interruption_tolerance:slot:reserved-instance-attributes

- Status: authoring-admitted
- Objective: Assess whether the evidence “steady EC2 use needs applicable reservation attributes or capacity behavior” supports the owned resolution “use the fitting Reserved Instance model”.
- Expected decision: use the fitting Reserved Instance model
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:savings_plans_reserved_instances_spot_demand_stable_utilization_interruption_tolerance:slot:savings-plan-stable

- Status: authoring-admitted
- Objective: Assess whether the evidence “steady eligible compute spend can support a commitment” supports the owned resolution “use the fitting Savings Plan”.
- Expected decision: use the fitting Savings Plan
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:purchasing_utilization_sizing:savings_plans_reserved_instances_spot_demand_stable_utilization_interruption_tolerance:slot:spot-interruptible

- Status: authoring-admitted
- Objective: Assess whether the evidence “fault-tolerant work can stop with short notice” supports the owned resolution “use Spot capacity”.
- Expected decision: use Spot capacity
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
