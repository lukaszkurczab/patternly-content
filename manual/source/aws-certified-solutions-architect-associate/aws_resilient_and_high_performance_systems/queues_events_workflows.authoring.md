# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / queues_events_workflows

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/queues_events_workflows.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:queues_events_workflows:consumers_duplicate_delivery_ordering_retries_dead_letter_handling:slot:dead-letter-redrive

- Status: authoring-admitted
- Objective: Assess whether the evidence “repeatedly failing messages block useful processing” supports the owned resolution “configure bounded retries and a DLQ/redrive policy”.
- Expected decision: configure bounded retries and a DLQ/redrive policy
- Decisive boundary: This slot owns the boundary established by repeatedly failing messages block useful processing; it resolves only to “configure bounded retries and a DLQ/redrive policy” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:queues_events_workflows:consumers_duplicate_delivery_ordering_retries_dead_letter_handling:slot:failure-recovery

- Status: authoring-admitted
- Objective: Assess whether the evidence “a consumer fails after a side effect but before acknowledgement” supports the owned resolution “order idempotency check, effect, checkpoint, and acknowledgement”.
- Expected decision: order idempotency check, effect, checkpoint, and acknowledgement
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:queues_events_workflows:consumers_duplicate_delivery_ordering_retries_dead_letter_handling:slot:fifo-message-group

- Status: authoring-admitted
- Objective: Assess whether the evidence “ordered processing is required per business key” supports the owned resolution “use appropriate FIFO grouping and deduplication”.
- Expected decision: use appropriate FIFO grouping and deduplication
- Decisive boundary: This slot owns the boundary established by ordered processing is required per business key; it resolves only to “use appropriate FIFO grouping and deduplication” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:queues_events_workflows:consumers_duplicate_delivery_ordering_retries_dead_letter_handling:slot:idempotent-consumer

- Status: authoring-admitted
- Objective: Assess whether the evidence “the same message may be delivered more than once” supports the owned resolution “make processing idempotent”.
- Expected decision: make processing idempotent
- Decisive boundary: This slot owns the boundary established by the same message may be delivered more than once; it resolves only to “make processing idempotent” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:queues_events_workflows:consumers_duplicate_delivery_ordering_retries_dead_letter_handling:slot:poison-message-loop

- Status: authoring-admitted
- Objective: Assess whether the evidence “an invalid message is retried indefinitely” supports the owned resolution “diagnose missing terminal handling”.
- Expected decision: diagnose missing terminal handling
- Decisive boundary: This slot owns the boundary established by an invalid message is retried indefinitely; it resolves only to “diagnose missing terminal handling” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:queues_events_workflows:consumers_duplicate_delivery_ordering_retries_dead_letter_handling:slot:visibility-timeout

- Status: authoring-admitted
- Objective: Assess whether the evidence “processing outlasts queue visibility and causes concurrent redelivery” supports the owned resolution “set or extend visibility consistent with processing”.
- Expected decision: set or extend visibility consistent with processing
- Decisive boundary: This slot owns the boundary established by processing outlasts queue visibility and causes concurrent redelivery; it resolves only to “set or extend visibility consistent with processing” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:queues_events_workflows:sqs_sns_eventbridge_step_functions_buffering_fan_out_routing_stateful_orchestration_need:slot:eventbridge-routing

- Status: authoring-admitted
- Objective: Assess whether the evidence “events need content-based routing across producers and consumers” supports the owned resolution “use EventBridge”.
- Expected decision: use EventBridge
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:queues_events_workflows:sqs_sns_eventbridge_step_functions_buffering_fan_out_routing_stateful_orchestration_need:slot:fanout-to-orchestration

- Status: authoring-admitted
- Objective: Assess whether the evidence “independent subscribers become a coordinated stateful workflow” supports the owned resolution “move coordination into an orchestrator”.
- Expected decision: move coordination into an orchestrator
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:queues_events_workflows:sqs_sns_eventbridge_step_functions_buffering_fan_out_routing_stateful_orchestration_need:slot:ordering-requirement

- Status: authoring-admitted
- Objective: Assess whether the evidence “strict per-group ordering is required” supports the owned resolution “select a queue or stream mode that documents that ordering”.
- Expected decision: select a queue or stream mode that documents that ordering
- Decisive boundary: This slot owns the boundary established by strict per-group ordering is required; it resolves only to “select a queue or stream mode that documents that ordering” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:queues_events_workflows:sqs_sns_eventbridge_step_functions_buffering_fan_out_routing_stateful_orchestration_need:slot:sns-fanout

- Status: authoring-admitted
- Objective: Assess whether the evidence “one publication must push to multiple subscribers” supports the owned resolution “use SNS fan-out”.
- Expected decision: use SNS fan-out
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:queues_events_workflows:sqs_sns_eventbridge_step_functions_buffering_fan_out_routing_stateful_orchestration_need:slot:sqs-buffering

- Status: authoring-admitted
- Objective: Assess whether the evidence “work needs durable buffering and pull-based consumption” supports the owned resolution “use SQS”.
- Expected decision: use SQS
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:queues_events_workflows:sqs_sns_eventbridge_step_functions_buffering_fan_out_routing_stateful_orchestration_need:slot:step-functions-state

- Status: authoring-admitted
- Objective: Assess whether the evidence “a multi-step process needs explicit state, branching, retries, and history” supports the owned resolution “use Step Functions”.
- Expected decision: use Step Functions
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
