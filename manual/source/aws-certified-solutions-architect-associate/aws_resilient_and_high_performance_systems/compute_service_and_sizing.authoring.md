# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / compute_service_and_sizing

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/compute_service_and_sizing.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:compute_service_and_sizing:burstable_fixed_scalable_capacity_sustained_utilization_latency_sensitivity:slot:burstable-capacity

- Status: authoring-admitted
- Objective: Assess whether the evidence “average CPU is low with short bursts and credit behavior is acceptable” supports the owned resolution “use a burstable instance family”.
- Expected decision: use a burstable instance family
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_service_and_sizing:burstable_fixed_scalable_capacity_sustained_utilization_latency_sensitivity:slot:credit-exhaustion

- Status: authoring-admitted
- Objective: Assess whether the evidence “sustained CPU would exhaust burst credits and breach latency” supports the owned resolution “reject burstable capacity”.
- Expected decision: reject burstable capacity
- Decisive boundary: This slot owns the boundary established by sustained CPU would exhaust burst credits and breach latency; it resolves only to “reject burstable capacity” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_service_and_sizing:burstable_fixed_scalable_capacity_sustained_utilization_latency_sensitivity:slot:fixed-capacity

- Status: authoring-admitted
- Objective: Assess whether the evidence “sustained predictable demand needs stable provisioned performance” supports the owned resolution “use fixed capacity”.
- Expected decision: use fixed capacity
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_service_and_sizing:burstable_fixed_scalable_capacity_sustained_utilization_latency_sensitivity:slot:p99-sensitivity

- Status: authoring-admitted
- Objective: Assess whether the evidence “average utilization is low but tail latency spikes during bursts” supports the owned resolution “diagnose a latency-sensitive capacity mismatch”.
- Expected decision: diagnose a latency-sensitive capacity mismatch
- Decisive boundary: This slot owns the boundary established by average utilization is low but tail latency spikes during bursts; it resolves only to “diagnose a latency-sensitive capacity mismatch” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_service_and_sizing:burstable_fixed_scalable_capacity_sustained_utilization_latency_sensitivity:slot:scalable-fleet

- Status: authoring-admitted
- Objective: Assess whether the evidence “demand varies beyond one instance size” supports the owned resolution “use a horizontally scalable fleet”.
- Expected decision: use a horizontally scalable fleet
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_service_and_sizing:burstable_fixed_scalable_capacity_sustained_utilization_latency_sensitivity:slot:utilization-shape-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “a development workload becomes continuously busy” supports the owned resolution “move from burstable to sustained capacity”.
- Expected decision: move from burstable to sustained capacity
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_service_and_sizing:instance_family_size_cpu_memory_accelerator_network_licensing_evidence:slot:accelerated-computing

- Status: authoring-admitted
- Objective: Assess whether the evidence “GPU or specialized accelerator support is required” supports the owned resolution “select an accelerated family”.
- Expected decision: select an accelerated family
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_service_and_sizing:instance_family_size_cpu_memory_accelerator_network_licensing_evidence:slot:architecture-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “the application is validated for Arm and price-performance improves” supports the owned resolution “move to an applicable Graviton family”.
- Expected decision: move to an applicable Graviton family
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_service_and_sizing:instance_family_size_cpu_memory_accelerator_network_licensing_evidence:slot:compute-optimized

- Status: authoring-admitted
- Objective: Assess whether the evidence “sustained CPU dominates and memory per vCPU is ordinary” supports the owned resolution “select a compute-optimized family”.
- Expected decision: select a compute-optimized family
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_service_and_sizing:instance_family_size_cpu_memory_accelerator_network_licensing_evidence:slot:license-constraint

- Status: authoring-admitted
- Objective: Assess whether the evidence “software licensing restricts cores, sockets, tenancy, or architecture” supports the owned resolution “include licensing in family and size selection”.
- Expected decision: include licensing in family and size selection
- Decisive boundary: This slot owns the boundary established by software licensing restricts cores, sockets, tenancy, or architecture; it resolves only to “include licensing in family and size selection” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_service_and_sizing:instance_family_size_cpu_memory_accelerator_network_licensing_evidence:slot:memory-optimized

- Status: authoring-admitted
- Objective: Assess whether the evidence “the working set and memory bandwidth dominate” supports the owned resolution “select a memory-optimized family”.
- Expected decision: select a memory-optimized family
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_service_and_sizing:instance_family_size_cpu_memory_accelerator_network_licensing_evidence:slot:network-storage-optimized

- Status: authoring-admitted
- Objective: Assess whether the evidence “network or local storage throughput dominates” supports the owned resolution “select a family sized for that resource”.
- Expected decision: select a family sized for that resource
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
