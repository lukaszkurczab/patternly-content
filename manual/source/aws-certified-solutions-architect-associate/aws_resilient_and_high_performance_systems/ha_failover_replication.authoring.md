# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / ha_failover_replication

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/ha_failover_replication.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:ha_failover_replication:active_active_active_passive_failover_consistency_recovery_traffic_routing_requirements:slot:active-active-routing

- Status: authoring-admitted
- Objective: Assess whether the evidence “multiple sites serve traffic concurrently and can accept the consistency model” supports the owned resolution “use active-active routing”.
- Expected decision: use active-active routing
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:ha_failover_replication:active_active_active_passive_failover_consistency_recovery_traffic_routing_requirements:slot:active-passive-consistency

- Status: authoring-admitted
- Objective: Assess whether the evidence “one writer or strict failover control is required” supports the owned resolution “use active-passive”.
- Expected decision: use active-passive
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:ha_failover_replication:active_active_active_passive_failover_consistency_recovery_traffic_routing_requirements:slot:dns-failover-health

- Status: authoring-admitted
- Objective: Assess whether the evidence “traffic failover depends on Route 53 health evaluation” supports the owned resolution “configure health checks and routing for the owned recovery endpoint”.
- Expected decision: configure health checks and routing for the owned recovery endpoint
- Decisive boundary: This slot owns the boundary established by traffic failover depends on Route 53 health evaluation; it resolves only to “configure health checks and routing for the owned recovery endpoint” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:ha_failover_replication:active_active_active_passive_failover_consistency_recovery_traffic_routing_requirements:slot:rto-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “the tolerated traffic restoration time shrinks materially” supports the owned resolution “move from cold passive capacity toward active service”.
- Expected decision: move from cold passive capacity toward active service
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:ha_failover_replication:active_active_active_passive_failover_consistency_recovery_traffic_routing_requirements:slot:split-brain-risk

- Status: authoring-admitted
- Objective: Assess whether the evidence “two active writers cannot safely reconcile concurrent updates” supports the owned resolution “reject active-active writes”.
- Expected decision: reject active-active writes
- Decisive boundary: This slot owns the boundary established by two active writers cannot safely reconcile concurrent updates; it resolves only to “reject active-active writes” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:ha_failover_replication:multi_read_replicas_cross_region_replication_global_tables_stated_recovery_failure_domai:slot:cross-region-replica

- Status: authoring-admitted
- Objective: Assess whether the evidence “a Regional recovery copy or local reads are needed in another Region” supports the owned resolution “use cross-Region replication”.
- Expected decision: use cross-Region replication
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:ha_failover_replication:multi_read_replicas_cross_region_replication_global_tables_stated_recovery_failure_domai:slot:dynamodb-global-table

- Status: authoring-admitted
- Objective: Assess whether the evidence “multi-Region DynamoDB writes and local access are required” supports the owned resolution “use global tables”.
- Expected decision: use global tables
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:ha_failover_replication:multi_read_replicas_cross_region_replication_global_tables_stated_recovery_failure_domai:slot:failure-domain-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “the requirement changes from AZ loss to Region loss” supports the owned resolution “move from intra-Region HA to a cross-Region mechanism”.
- Expected decision: move from intra-Region HA to a cross-Region mechanism
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:ha_failover_replication:multi_read_replicas_cross_region_replication_global_tables_stated_recovery_failure_domai:slot:rds-multi-az

- Status: authoring-admitted
- Objective: Assess whether the evidence “the database must fail over within a Region without using the standby for read scaling” supports the owned resolution “use RDS Multi-AZ”.
- Expected decision: use RDS Multi-AZ
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:ha_failover_replication:multi_read_replicas_cross_region_replication_global_tables_stated_recovery_failure_domai:slot:read-replica

- Status: authoring-admitted
- Objective: Assess whether the evidence “read throughput must scale and asynchronous replication is acceptable” supports the owned resolution “use read replicas”.
- Expected decision: use read replicas
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:ha_failover_replication:multi_read_replicas_cross_region_replication_global_tables_stated_recovery_failure_domai:slot:replica-purpose

- Status: authoring-admitted
- Objective: Assess whether the evidence “a read replica is proposed as synchronous zero-loss HA” supports the owned resolution “reject the capability mismatch”.
- Expected decision: reject the capability mismatch
- Decisive boundary: This slot owns the boundary established by a read replica is proposed as synchronous zero-loss HA; it resolves only to “reject the capability mismatch” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
