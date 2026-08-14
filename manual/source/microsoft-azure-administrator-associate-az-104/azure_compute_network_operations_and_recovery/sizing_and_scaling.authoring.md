# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / sizing_and_scaling

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/sizing_and_scaling.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:sizing_and_scaling:resource_requests_limits_scale_thresholds_coherently:slot:align-cpu-memory-allocation-with-replica-density

- Status: authoring-admitted
- Objective: Choose per-replica CPU and memory so each replica can handle the demand assumed by the scale threshold.
- Expected decision: Align resource allocation and concurrency/backlog target.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sizing_and_scaling:resource_requests_limits_scale_thresholds_coherently:slot:diagnose-container-restart-from-memory-limit

- Status: authoring-admitted
- Objective: Identify OOM termination when the container working set exceeds its memory allocation.
- Expected decision: Reduce memory demand or raise the allocation before changing scale thresholds.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sizing_and_scaling:resource_requests_limits_scale_thresholds_coherently:slot:diagnose-scale-out-blocked-by-max-replicas

- Status: authoring-admitted
- Objective: Recognize sustained trigger pressure with replica count at maximum as a fleet bound, not a scaler failure.
- Expected decision: Increase the bound only after validating downstream and cost capacity.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sizing_and_scaling:scale_containers_concurrency_cpu_memory_replica_limits_request_pressure:slot:diagnose-throttling-from-cpu-memory-limit

- Status: authoring-admitted
- Objective: Recognize request latency or restarts caused by per-replica CPU/memory limits rather than insufficient scale-rule activation.
- Expected decision: Correct resources or workload behavior before only increasing replica count.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sizing_and_scaling:scale_containers_concurrency_cpu_memory_replica_limits_request_pressure:slot:select-event-source-scale-rule

- Status: authoring-admitted
- Objective: Use the supported event scaler and authentication when queue or stream backlog drives work.
- Expected decision: Scale replicas from the external event signal.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sizing_and_scaling:scale_containers_concurrency_cpu_memory_replica_limits_request_pressure:slot:select-http-concurrency-scale-rule

- Status: authoring-admitted
- Objective: Scale an HTTP Container App on concurrent requests per replica when request pressure drives capacity.
- Expected decision: Set the concurrency target from measured serving capacity.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sizing_and_scaling:scale_containers_concurrency_cpu_memory_replica_limits_request_pressure:slot:set-minimum-replicas-for-warm-capacity

- Status: authoring-admitted
- Objective: Set minimum replicas above zero only when cold start or continuous availability requires warm instances.
- Expected decision: Keep enough warm replicas for the stated response objective.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
