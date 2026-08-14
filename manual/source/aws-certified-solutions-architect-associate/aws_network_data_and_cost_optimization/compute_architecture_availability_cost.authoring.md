# aws-certified-solutions-architect-associate / aws_network_data_and_cost_optimization / compute_architecture_availability_cost

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_network_data_and_cost_optimization/compute_architecture_availability_cost.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:compute_architecture_availability_cost:multi_fleet_diversity_standby_capacity_level_justified_service_objective:slot:fleet-diversity

- Status: authoring-admitted
- Objective: Assess whether the evidence “capacity availability risk justifies multiple instance types or pools” supports the owned resolution “use a diversified fleet”.
- Expected decision: use a diversified fleet
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_architecture_availability_cost:multi_fleet_diversity_standby_capacity_level_justified_service_objective:slot:gold-plating

- Status: authoring-admitted
- Objective: Assess whether the evidence “multi-Region active capacity is proposed for a service with a relaxed RTO and low criticality” supports the owned resolution “reject unjustified availability cost”.
- Expected decision: reject unjustified availability cost
- Decisive boundary: This slot owns the boundary established by multi-Region active capacity is proposed for a service with a relaxed RTO and low criticality; it resolves only to “reject unjustified availability cost” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_architecture_availability_cost:multi_fleet_diversity_standby_capacity_level_justified_service_objective:slot:multi-az-objective

- Status: authoring-admitted
- Objective: Assess whether the evidence “the service objective requires surviving an AZ failure” supports the owned resolution “use multi-AZ placement”.
- Expected decision: use multi-AZ placement
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_architecture_availability_cost:multi_fleet_diversity_standby_capacity_level_justified_service_objective:slot:service-criticality-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “the workload becomes tier-zero” supports the owned resolution “increase redundancy only to the new objective”.
- Expected decision: increase redundancy only to the new objective
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_architecture_availability_cost:multi_fleet_diversity_standby_capacity_level_justified_service_objective:slot:standby-capacity

- Status: authoring-admitted
- Objective: Assess whether the evidence “RTO requires preprovisioned capacity” supports the owned resolution “retain only the standby level needed to meet it”.
- Expected decision: retain only the standby level needed to meet it
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_architecture_availability_cost:spot_capacity_fault_tolerant_replaceable_workers_interruption_handling:slot:checkpoint-addition

- Status: authoring-admitted
- Objective: Assess whether the evidence “a formerly nonrestartable job gains durable checkpoints” supports the owned resolution “reconsider Spot eligibility”.
- Expected decision: reconsider Spot eligibility
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_architecture_availability_cost:spot_capacity_fault_tolerant_replaceable_workers_interruption_handling:slot:interruption-notice

- Status: authoring-admitted
- Objective: Assess whether the evidence “the worker receives a Spot interruption signal” supports the owned resolution “checkpoint and drain within the available notice”.
- Expected decision: checkpoint and drain within the available notice
- Decisive boundary: This slot owns the boundary established by the worker receives a Spot interruption signal; it resolves only to “checkpoint and drain within the available notice” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_architecture_availability_cost:spot_capacity_fault_tolerant_replaceable_workers_interruption_handling:slot:mixed-capacity-fleet

- Status: authoring-admitted
- Objective: Assess whether the evidence “baseline service capacity must persist while burst work may interrupt” supports the owned resolution “combine stable and Spot capacity intentionally”.
- Expected decision: combine stable and Spot capacity intentionally
- Decisive boundary: This slot owns the boundary established by baseline service capacity must persist while burst work may interrupt; it resolves only to “combine stable and Spot capacity intentionally” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_architecture_availability_cost:spot_capacity_fault_tolerant_replaceable_workers_interruption_handling:slot:no-rebalance-handling

- Status: authoring-admitted
- Objective: Assess whether the evidence “a fleet ignores rebalance or interruption signals and loses work” supports the owned resolution “diagnose missing interruption handling”.
- Expected decision: diagnose missing interruption handling
- Decisive boundary: This slot owns the boundary established by a fleet ignores rebalance or interruption signals and loses work; it resolves only to “diagnose missing interruption handling” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_architecture_availability_cost:spot_capacity_fault_tolerant_replaceable_workers_interruption_handling:slot:stateful-singleton

- Status: authoring-admitted
- Objective: Assess whether the evidence “the only writer holds unrecoverable local state” supports the owned resolution “reject Spot placement”.
- Expected decision: reject Spot placement
- Decisive boundary: This slot owns the boundary established by the only writer holds unrecoverable local state; it resolves only to “reject Spot placement” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_architecture_availability_cost:spot_capacity_fault_tolerant_replaceable_workers_interruption_handling:slot:stateless-worker

- Status: authoring-admitted
- Objective: Assess whether the evidence “a replaceable stateless worker can retry after interruption” supports the owned resolution “use Spot capacity”.
- Expected decision: use Spot capacity
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
