# aws-certified-solutions-architect-associate / aws_network_data_and_cost_optimization / database_cost_model

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_network_data_and_cost_optimization/database_cost_model.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:database_cost_model:demand_provisioned_serverless_reserved_capacity_modes_utilization_shape_commitment:slot:aurora-serverless

- Status: authoring-admitted
- Objective: Assess whether the evidence “relational demand varies and Aurora Serverless constraints fit” supports the owned resolution “use Aurora Serverless”.
- Expected decision: use Aurora Serverless
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:database_cost_model:demand_provisioned_serverless_reserved_capacity_modes_utilization_shape_commitment:slot:commitment-utilization

- Status: authoring-admitted
- Objective: Assess whether the evidence “the utilization forecast cannot support the commitment” supports the owned resolution “reject reserved capacity”.
- Expected decision: reject reserved capacity
- Decisive boundary: This slot owns the boundary established by the utilization forecast cannot support the commitment; it resolves only to “reject reserved capacity” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:database_cost_model:demand_provisioned_serverless_reserved_capacity_modes_utilization_shape_commitment:slot:dynamodb-on-demand

- Status: authoring-admitted
- Objective: Assess whether the evidence “traffic is unpredictable or new and pay-per-request economics fit” supports the owned resolution “use on-demand capacity”.
- Expected decision: use on-demand capacity
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:database_cost_model:demand_provisioned_serverless_reserved_capacity_modes_utilization_shape_commitment:slot:dynamodb-provisioned

- Status: authoring-admitted
- Objective: Assess whether the evidence “traffic is predictable and provisioned capacity with autoscaling is cheaper” supports the owned resolution “use provisioned capacity”.
- Expected decision: use provisioned capacity
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:database_cost_model:demand_provisioned_serverless_reserved_capacity_modes_utilization_shape_commitment:slot:reserved-database

- Status: authoring-admitted
- Objective: Assess whether the evidence “steady database use justifies a term commitment” supports the owned resolution “purchase an applicable reserved offering”.
- Expected decision: purchase an applicable reserved offering
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:database_cost_model:demand_provisioned_serverless_reserved_capacity_modes_utilization_shape_commitment:slot:utilization-shape-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “a spiky new workload becomes stable” supports the owned resolution “move from flexible consumption toward provisioned or committed capacity”.
- Expected decision: move from flexible consumption toward provisioned or committed capacity
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:database_cost_model:storage_tiering_read_scaling_retention_right_sizing_durability_latency_objectives_remain:slot:durability-regression

- Status: authoring-admitted
- Objective: Assess whether the evidence “a cheaper option weakens required backups, replication, or recovery” supports the owned resolution “reject the saving”.
- Expected decision: reject the saving
- Decisive boundary: This slot owns the boundary established by a cheaper option weakens required backups, replication, or recovery; it resolves only to “reject the saving” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:database_cost_model:storage_tiering_read_scaling_retention_right_sizing_durability_latency_objectives_remain:slot:latency-objective-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “the service gains a tighter latency SLO” supports the owned resolution “reverse an optimization that cannot meet it”.
- Expected decision: reverse an optimization that cannot meet it
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:database_cost_model:storage_tiering_read_scaling_retention_right_sizing_durability_latency_objectives_remain:slot:read-scaling

- Status: authoring-admitted
- Objective: Assess whether the evidence “reads dominate and replicas meet freshness needs” supports the owned resolution “add read scaling”.
- Expected decision: add read scaling
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:database_cost_model:storage_tiering_read_scaling_retention_right_sizing_durability_latency_objectives_remain:slot:retention-reduction

- Status: authoring-admitted
- Objective: Assess whether the evidence “data exceeds lawful and product retention needs” supports the owned resolution “remove it under an approved retention policy”.
- Expected decision: remove it under an approved retention policy
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:database_cost_model:storage_tiering_read_scaling_retention_right_sizing_durability_latency_objectives_remain:slot:rightsizing

- Status: authoring-admitted
- Objective: Assess whether the evidence “measured CPU, memory, I/O, and connections show durable overprovisioning” supports the owned resolution “right-size the database”.
- Expected decision: right-size the database
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:database_cost_model:storage_tiering_read_scaling_retention_right_sizing_durability_latency_objectives_remain:slot:storage-tiering

- Status: authoring-admitted
- Objective: Assess whether the evidence “older database data can move to a cheaper supported tier without violating query latency” supports the owned resolution “apply supported tiering”.
- Expected decision: apply supported tiering
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
