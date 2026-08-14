# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / decomposition_sync_async

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/decomposition_sync_async.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:decomposition_sync_async:split_workload_along_independently_deployable_data_failure_boundaries:slot:coupling-evidence

- Status: authoring-admitted
- Objective: Assess whether the evidence “independent scaling disappears and every change is coordinated” supports the owned resolution “reconsider whether the split remains justified”.
- Expected decision: reconsider whether the split remains justified
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:decomposition_sync_async:split_workload_along_independently_deployable_data_failure_boundaries:slot:data-ownership-boundary

- Status: authoring-admitted
- Objective: Assess whether the evidence “two capabilities require different authoritative data ownership” supports the owned resolution “separate their data contracts”.
- Expected decision: separate their data contracts
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:decomposition_sync_async:split_workload_along_independently_deployable_data_failure_boundaries:slot:deployment-boundary

- Status: authoring-admitted
- Objective: Assess whether the evidence “two capabilities change and deploy independently” supports the owned resolution “split them at the independent deployment boundary”.
- Expected decision: split them at the independent deployment boundary
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:decomposition_sync_async:split_workload_along_independently_deployable_data_failure_boundaries:slot:distributed-monolith

- Status: authoring-admitted
- Objective: Assess whether the evidence “services are split but require lockstep deployment and one shared schema” supports the owned resolution “reject superficial decomposition”.
- Expected decision: reject superficial decomposition
- Decisive boundary: This slot owns the boundary established by services are split but require lockstep deployment and one shared schema; it resolves only to “reject superficial decomposition” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:decomposition_sync_async:split_workload_along_independently_deployable_data_failure_boundaries:slot:failure-boundary

- Status: authoring-admitted
- Objective: Assess whether the evidence “one unstable function must not exhaust resources for unrelated work” supports the owned resolution “isolate the failure domain”.
- Expected decision: isolate the failure domain
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:decomposition_sync_async:synchronous_calls_caller_needs_immediate_response_decouple_work_otherwise:slot:cascading-failure

- Status: authoring-admitted
- Objective: Assess whether the evidence “downstream slowness consumes all upstream workers” supports the owned resolution “diagnose synchronous failure propagation”.
- Expected decision: diagnose synchronous failure propagation
- Decisive boundary: This slot owns the boundary established by downstream slowness consumes all upstream workers; it resolves only to “diagnose synchronous failure propagation” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:decomposition_sync_async:synchronous_calls_caller_needs_immediate_response_decouple_work_otherwise:slot:deferred-work

- Status: authoring-admitted
- Objective: Assess whether the evidence “the caller can accept work and observe completion later” supports the owned resolution “decouple with a queue or event”.
- Expected decision: decouple with a queue or event
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:decomposition_sync_async:synchronous_calls_caller_needs_immediate_response_decouple_work_otherwise:slot:immediacy-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “a previously immediate operation becomes a background report” supports the owned resolution “move it to asynchronous processing”.
- Expected decision: move it to asynchronous processing
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:decomposition_sync_async:synchronous_calls_caller_needs_immediate_response_decouple_work_otherwise:slot:long-running-timeout

- Status: authoring-admitted
- Objective: Assess whether the evidence “work duration exceeds the synchronous client or integration timeout” supports the owned resolution “reject synchronous coupling”.
- Expected decision: reject synchronous coupling
- Decisive boundary: This slot owns the boundary established by work duration exceeds the synchronous client or integration timeout; it resolves only to “reject synchronous coupling” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:decomposition_sync_async:synchronous_calls_caller_needs_immediate_response_decouple_work_otherwise:slot:request-response

- Status: authoring-admitted
- Objective: Assess whether the evidence “the caller cannot proceed without the result” supports the owned resolution “retain a synchronous request-response path”.
- Expected decision: retain a synchronous request-response path
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
