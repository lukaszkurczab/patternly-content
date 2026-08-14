# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / scaling_and_instance_controls

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/scaling_and_instance_controls.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:scaling_and_instance_controls:classify_scaling_and_instance_controls_evidence:slot:concurrency-throughput-choice

- Status: authoring-admitted
- Objective: scaling and instance controls — concurrency throughput: select “Set concurrency high enough for efficient throughput but low enough to preserve handler and dependency safety” under “requests per instance; CPU and memory contention; downstream connection capacity” instead of the competing action “Avoid multi-CPU under-scaling for single-threaded work by aligning CPU allocation and concurrency with actual parallelism”.
- Expected decision: Set concurrency high enough for efficient throughput but low enough to preserve handler and dependency safety.
- Decisive boundary: scaling and instance controls — concurrency throughput: evidence “requests per instance; CPU and memory contention; downstream connection capacity” supports “Set concurrency high enough for efficient throughput but low enough to preserve handler and dependency safety”. The neighboring evidence “average CPU per instance; number of allocated CPUs; single-threaded versus parallel code” instead supports classification “Avoid multi-CPU under-scaling for single-threaded work by aligning CPU allocation and concurrency with actual parallelism”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:scaling_and_instance_controls:classify_scaling_and_instance_controls_evidence:slot:cpu-scaling-signal

- Status: authoring-admitted
- Objective: scaling and instance controls — cpu scaling signal: recognize that “average CPU per instance; number of allocated CPUs; single-threaded versus parallel code” requires “Avoid multi-CPU under-scaling for single-threaded work by aligning CPU allocation and concurrency with actual parallelism”, not the neighboring capability response “Keep the protective cap if the dependency cannot accept more load and shed or queue excess demand explicitly”.
- Expected decision: Avoid multi-CPU under-scaling for single-threaded work by aligning CPU allocation and concurrency with actual parallelism.
- Decisive boundary: scaling and instance controls — cpu scaling signal: evidence “average CPU per instance; number of allocated CPUs; single-threaded versus parallel code” supports “Avoid multi-CPU under-scaling for single-threaded work by aligning CPU allocation and concurrency with actual parallelism”. The neighboring evidence “service and revision maximums; traffic split; downstream connection ceiling” instead supports diagnosis “Keep the protective cap if the dependency cannot accept more load and shed or queue excess demand explicitly”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:scaling_and_instance_controls:classify_scaling_and_instance_controls_evidence:slot:downstream-ceiling-diagnosis

- Status: authoring-admitted
- Objective: scaling and instance controls — downstream ceiling: trace “service and revision maximums; traffic split; downstream connection ceiling” to “Keep the protective cap if the dependency cannot accept more load and shed or queue excess demand explicitly” instead of applying the competing remediation “Use minimum instances for startup latency and concurrency or maximum instances for serving capacity and cost protection”.
- Expected decision: Keep the protective cap if the dependency cannot accept more load and shed or queue excess demand explicitly.
- Decisive boundary: scaling and instance controls — downstream ceiling: evidence “service and revision maximums; traffic split; downstream connection ceiling” supports “Keep the protective cap if the dependency cannot accept more load and shed or queue excess demand explicitly”. The neighboring evidence “scale-from-zero latency; steady request load; idle-instance billing” instead supports classification “Use minimum instances for startup latency and concurrency or maximum instances for serving capacity and cost protection”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:scaling_and_instance_controls:classify_scaling_and_instance_controls_evidence:slot:latency-cost-classification

- Status: authoring-admitted
- Objective: scaling and instance controls — latency cost: classify “scale-from-zero latency; steady request load; idle-instance billing” as “Use minimum instances for startup latency and concurrency or maximum instances for serving capacity and cost protection”, while separating the competing classification “Change only the controls whose underlying demand or latency constraint changed”.
- Expected decision: Use minimum instances for startup latency and concurrency or maximum instances for serving capacity and cost protection.
- Decisive boundary: scaling and instance controls — latency cost: evidence “scale-from-zero latency; steady request load; idle-instance billing” supports “Use minimum instances for startup latency and concurrency or maximum instances for serving capacity and cost protection”. The neighboring evidence “burstiness; baseline traffic; per-request work” instead supports decision “Change only the controls whose underlying demand or latency constraint changed”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:scaling_and_instance_controls:classify_scaling_and_instance_controls_evidence:slot:load-profile-transfer

- Status: authoring-admitted
- Objective: Retune minimum instances, concurrency, and maximum instances when load shape changes.
- Expected decision: Change only the controls whose underlying demand or latency constraint changed.
- Decisive boundary: Load shape, not historical settings, owns the scaling profile.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:scaling_and_instance_controls:classify_scaling_and_instance_controls_evidence:slot:maximum-instance-capacity-boundary

- Status: authoring-admitted
- Objective: scaling and instance controls — maximum instance capacity: verify that “service-level cap; revision-level cap; traffic-split allocation” stays with “Set the service cap for the overall dependency budget and narrower revision caps only for deliberate release isolation” and has not crossed into “Keep the smallest warm capacity that meets latency, preferably at service scope unless revision-specific behavior is required”.
- Expected decision: Set the service cap for the overall dependency budget and narrower revision caps only for deliberate release isolation.
- Decisive boundary: scaling and instance controls — maximum instance capacity: evidence “service-level cap; revision-level cap; traffic-split allocation” supports “Set the service cap for the overall dependency budget and narrower revision caps only for deliberate release isolation”. The neighboring evidence “container startup duration; idle warm-instance cost; typical traffic baseline” instead supports decision “Keep the smallest warm capacity that meets latency, preferably at service scope unless revision-specific behavior is required”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:scaling_and_instance_controls:classify_scaling_and_instance_controls_evidence:slot:minimum-instance-cold-start-choice

- Status: authoring-admitted
- Objective: scaling and instance controls — minimum instance cold start: select “Keep the smallest warm capacity that meets latency, preferably at service scope unless revision-specific behavior is required” under “container startup duration; idle warm-instance cost; typical traffic baseline” instead of the competing action “Set concurrency high enough for efficient throughput but low enough to preserve handler and dependency safety”.
- Expected decision: Keep the smallest warm capacity that meets latency, preferably at service scope unless revision-specific behavior is required.
- Decisive boundary: scaling and instance controls — minimum instance cold start: evidence “container startup duration; idle warm-instance cost; typical traffic baseline” supports “Keep the smallest warm capacity that meets latency, preferably at service scope unless revision-specific behavior is required”. The neighboring evidence “requests per instance; CPU and memory contention; downstream connection capacity” instead supports decision “Set concurrency high enough for efficient throughput but low enough to preserve handler and dependency safety”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
