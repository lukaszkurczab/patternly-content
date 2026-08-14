# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / access_pattern_capacity_replication

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/access_pattern_capacity_replication.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:partition_keys_indexes_distribution_strategy_hot_key_risk_query_predicates:slot:access-pattern-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “a new query becomes latency-critical and frequent” supports the owned resolution “add or redesign an index only for the material pattern”.
- Expected decision: add or redesign an index only for the material pattern
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:partition_keys_indexes_distribution_strategy_hot_key_risk_query_predicates:slot:composite-key-query

- Status: authoring-admitted
- Objective: Assess whether the evidence “queries need ordered range access within one entity grouping” supports the owned resolution “use a composite key that supports the predicate”.
- Expected decision: use a composite key that supports the predicate
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:partition_keys_indexes_distribution_strategy_hot_key_risk_query_predicates:slot:high-cardinality-partition-key

- Status: authoring-admitted
- Objective: Assess whether the evidence “writes must distribute across many partition values” supports the owned resolution “choose a high-cardinality partition key”.
- Expected decision: choose a high-cardinality partition key
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:partition_keys_indexes_distribution_strategy_hot_key_risk_query_predicates:slot:hot-key

- Status: authoring-admitted
- Objective: Assess whether the evidence “a small set of partition values receives most traffic” supports the owned resolution “reject the skewed partition design”.
- Expected decision: reject the skewed partition design
- Decisive boundary: This slot owns the boundary established by a small set of partition values receives most traffic; it resolves only to “reject the skewed partition design” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:partition_keys_indexes_distribution_strategy_hot_key_risk_query_predicates:slot:scan-antipattern

- Status: authoring-admitted
- Objective: Assess whether the evidence “a proposed key forces full-table scans for the dominant query” supports the owned resolution “redesign around access patterns”.
- Expected decision: redesign around access patterns
- Decisive boundary: This slot owns the boundary established by a proposed key forces full-table scans for the dominant query; it resolves only to “redesign around access patterns” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:partition_keys_indexes_distribution_strategy_hot_key_risk_query_predicates:slot:secondary-index

- Status: authoring-admitted
- Objective: Assess whether the evidence “a recurring alternate access pattern is not served by the base key” supports the owned resolution “add a justified secondary index”.
- Expected decision: add a justified secondary index
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:read_replicas_multi_global_replication_caches_read_locality_failover_need:slot:database-cache

- Status: authoring-admitted
- Objective: Assess whether the evidence “repeated reads can tolerate cached freshness” supports the owned resolution “cache those reads”.
- Expected decision: cache those reads
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:read_replicas_multi_global_replication_caches_read_locality_failover_need:slot:freshness-tightening

- Status: authoring-admitted
- Objective: Assess whether the evidence “reads can no longer tolerate replica or cache lag” supports the owned resolution “route them to a consistency-capable source”.
- Expected decision: route them to a consistency-capable source
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:read_replicas_multi_global_replication_caches_read_locality_failover_need:slot:global-replication

- Status: authoring-admitted
- Objective: Assess whether the evidence “regional reads or disaster recovery require cross-Region copies” supports the owned resolution “use a documented global replication mechanism”.
- Expected decision: use a documented global replication mechanism
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:read_replicas_multi_global_replication_caches_read_locality_failover_need:slot:multi-az-failover

- Status: authoring-admitted
- Objective: Assess whether the evidence “writer availability within a Region is the requirement” supports the owned resolution “use Multi-AZ deployment”.
- Expected decision: use Multi-AZ deployment
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:read_replicas_multi_global_replication_caches_read_locality_failover_need:slot:read-replica-locality

- Status: authoring-admitted
- Objective: Assess whether the evidence “read traffic needs local capacity and tolerates asynchronous freshness” supports the owned resolution “use read replicas”.
- Expected decision: use read replicas
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_pattern_capacity_replication:read_replicas_multi_global_replication_caches_read_locality_failover_need:slot:write-scaling

- Status: authoring-admitted
- Objective: Assess whether the evidence “read replicas are proposed to scale a single-writer bottleneck” supports the owned resolution “reject the write-path mismatch”.
- Expected decision: reject the write-path mismatch
- Decisive boundary: This slot owns the boundary established by read replicas are proposed to scale a single-writer bottleneck; it resolves only to “reject the write-path mismatch” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
