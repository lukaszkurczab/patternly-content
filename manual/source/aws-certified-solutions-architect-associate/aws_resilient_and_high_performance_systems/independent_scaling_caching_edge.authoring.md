# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / independent_scaling_caching_edge

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/independent_scaling_caching_edge.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:cloudfront_elasticache_application_caching_data_freshness_access_locality_permit_reuse:slot:application-local-cache

- Status: authoring-admitted
- Objective: Assess whether the evidence “one process safely reuses small immutable reference data” supports the owned resolution “cache in the application”.
- Expected decision: cache in the application
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:cloudfront_elasticache_application_caching_data_freshness_access_locality_permit_reuse:slot:cloudfront-cache

- Status: authoring-admitted
- Objective: Assess whether the evidence “geographically distributed clients repeatedly request cacheable objects” supports the owned resolution “cache at CloudFront”.
- Expected decision: cache at CloudFront
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:cloudfront_elasticache_application_caching_data_freshness_access_locality_permit_reuse:slot:elasticache-cache

- Status: authoring-admitted
- Objective: Assess whether the evidence “application nodes repeatedly read low-latency shared database results” supports the owned resolution “cache in ElastiCache”.
- Expected decision: cache in ElastiCache
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:cloudfront_elasticache_application_caching_data_freshness_access_locality_permit_reuse:slot:freshness-limit

- Status: authoring-admitted
- Objective: Assess whether the evidence “the data must reflect every committed write immediately” supports the owned resolution “reject stale cache reuse unless invalidation meets the requirement”.
- Expected decision: reject stale cache reuse unless invalidation meets the requirement
- Decisive boundary: This slot owns the boundary established by the data must reflect every committed write immediately; it resolves only to “reject stale cache reuse unless invalidation meets the requirement” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:cloudfront_elasticache_application_caching_data_freshness_access_locality_permit_reuse:slot:locality-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “request locality moves from one Region to global edge clients” supports the owned resolution “move caching closer to the new access locality”.
- Expected decision: move caching closer to the new access locality
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:cloudfront_elasticache_application_caching_data_freshness_access_locality_permit_reuse:slot:poor-cache-key

- Status: authoring-admitted
- Objective: Assess whether the evidence “tenant or authorization context is omitted from the cache key” supports the owned resolution “diagnose incorrect cross-context reuse”.
- Expected decision: diagnose incorrect cross-context reuse
- Decisive boundary: This slot owns the boundary established by tenant or authorization context is omitted from the cache key; it resolves only to “diagnose incorrect cross-context reuse” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:scale_tier_constrained_cpu_connections_iops_request_rate:slot:bottleneck-loop

- Status: authoring-admitted
- Objective: Assess whether the evidence “performance degrades under load” supports the owned resolution “measure, identify the constrained resource, change that tier, and remeasure”.
- Expected decision: measure, identify the constrained resource, change that tier, and remeasure
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:scale_tier_constrained_cpu_connections_iops_request_rate:slot:connection-bound-tier

- Status: authoring-admitted
- Objective: Assess whether the evidence “database connection exhaustion occurs before CPU saturation” supports the owned resolution “scale or proxy the connection boundary”.
- Expected decision: scale or proxy the connection boundary
- Decisive boundary: This slot owns the boundary established by database connection exhaustion occurs before CPU saturation; it resolves only to “scale or proxy the connection boundary” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:scale_tier_constrained_cpu_connections_iops_request_rate:slot:cpu-bound-tier

- Status: authoring-admitted
- Objective: Assess whether the evidence “application CPU saturates while downstream services remain healthy” supports the owned resolution “scale the application compute tier”.
- Expected decision: scale the application compute tier
- Decisive boundary: This slot owns the boundary established by application CPU saturates while downstream services remain healthy; it resolves only to “scale the application compute tier” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:scale_tier_constrained_cpu_connections_iops_request_rate:slot:iops-bound-tier

- Status: authoring-admitted
- Objective: Assess whether the evidence “storage queue depth and latency rise at provisioned IOPS” supports the owned resolution “change the storage performance tier”.
- Expected decision: change the storage performance tier
- Decisive boundary: This slot owns the boundary established by storage queue depth and latency rise at provisioned IOPS; it resolves only to “change the storage performance tier” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:scale_tier_constrained_cpu_connections_iops_request_rate:slot:request-rate-bound-tier

- Status: authoring-admitted
- Objective: Assess whether the evidence “one API partition reaches request limits” supports the owned resolution “scale or repartition that request-processing tier”.
- Expected decision: scale or repartition that request-processing tier
- Decisive boundary: This slot owns the boundary established by one API partition reaches request limits; it resolves only to “scale or repartition that request-processing tier” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:independent_scaling_caching_edge:scale_tier_constrained_cpu_connections_iops_request_rate:slot:whole-stack-scaling

- Status: authoring-admitted
- Objective: Assess whether the evidence “only one tier is constrained” supports the owned resolution “reject scaling every tier together”.
- Expected decision: reject scaling every tier together
- Decisive boundary: This slot owns the boundary established by only one tier is constrained; it resolves only to “reject scaling every tier together” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
