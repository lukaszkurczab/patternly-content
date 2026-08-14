# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / storage_scaling_configuration

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/storage_scaling_configuration.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:storage_scaling_configuration:iops_throughput_capacity_file_system_mode_based_observed_storage_bottleneck:slot:capacity-coupling

- Status: authoring-admitted
- Objective: Assess whether the evidence “a volume type couples attainable performance to provisioned size” supports the owned resolution “increase size or select a type with independent controls”.
- Expected decision: increase size or select a type with independent controls
- Decisive boundary: This slot owns the boundary established by a volume type couples attainable performance to provisioned size; it resolves only to “increase size or select a type with independent controls” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:storage_scaling_configuration:iops_throughput_capacity_file_system_mode_based_observed_storage_bottleneck:slot:file-system-mode

- Status: authoring-admitted
- Objective: Assess whether the evidence “an EFS workload needs higher aggregate throughput or specific performance behavior” supports the owned resolution “select the documented EFS modes and throughput settings”.
- Expected decision: select the documented EFS modes and throughput settings
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:storage_scaling_configuration:iops_throughput_capacity_file_system_mode_based_observed_storage_bottleneck:slot:iops-bottleneck

- Status: authoring-admitted
- Objective: Assess whether the evidence “IOPS reaches the volume limit with small random operations” supports the owned resolution “provision an IOPS-suited volume or redesign striping”.
- Expected decision: provision an IOPS-suited volume or redesign striping
- Decisive boundary: This slot owns the boundary established by IOPS reaches the volume limit with small random operations; it resolves only to “provision an IOPS-suited volume or redesign striping” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:storage_scaling_configuration:iops_throughput_capacity_file_system_mode_based_observed_storage_bottleneck:slot:latency-root-cause

- Status: authoring-admitted
- Objective: Assess whether the evidence “storage metrics are healthy while application latency rises” supports the owned resolution “reject storage scaling without bottleneck evidence”.
- Expected decision: reject storage scaling without bottleneck evidence
- Decisive boundary: This slot owns the boundary established by storage metrics are healthy while application latency rises; it resolves only to “reject storage scaling without bottleneck evidence” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:storage_scaling_configuration:iops_throughput_capacity_file_system_mode_based_observed_storage_bottleneck:slot:storage-tuning

- Status: authoring-admitted
- Objective: Assess whether the evidence “storage latency is high” supports the owned resolution “measure operation size, queue, IOPS, throughput, capacity, and file-system behavior before changing configuration”.
- Expected decision: measure operation size, queue, IOPS, throughput, capacity, and file-system behavior before changing configuration
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:storage_scaling_configuration:iops_throughput_capacity_file_system_mode_based_observed_storage_bottleneck:slot:throughput-bottleneck

- Status: authoring-admitted
- Objective: Assess whether the evidence “large sequential transfer saturates throughput before IOPS” supports the owned resolution “select and size for throughput”.
- Expected decision: select and size for throughput
- Decisive boundary: This slot owns the boundary established by large sequential transfer saturates throughput before IOPS; it resolves only to “select and size for throughput” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:storage_scaling_configuration:storage_class_replication_configuration_durability_access_requirements:slot:az-requirement-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “a re-creatable cache becomes authoritative data” supports the owned resolution “move away from a one-AZ storage posture”.
- Expected decision: move away from a one-AZ storage posture
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:storage_scaling_configuration:storage_class_replication_configuration_durability_access_requirements:slot:ebs-az-scope

- Status: authoring-admitted
- Objective: Assess whether the evidence “block storage must remain attached within its Availability Zone” supports the owned resolution “account for EBS AZ scope”.
- Expected decision: account for EBS AZ scope
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:storage_scaling_configuration:storage_class_replication_configuration_durability_access_requirements:slot:efs-regional

- Status: authoring-admitted
- Objective: Assess whether the evidence “shared files need regional multi-AZ availability” supports the owned resolution “use EFS Regional storage”.
- Expected decision: use EFS Regional storage
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:storage_scaling_configuration:storage_class_replication_configuration_durability_access_requirements:slot:one-zone-access

- Status: authoring-admitted
- Objective: Assess whether the evidence “re-creatable infrequent data can tolerate one-AZ storage” supports the owned resolution “use an applicable One Zone class”.
- Expected decision: use an applicable One Zone class
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:storage_scaling_configuration:storage_class_replication_configuration_durability_access_requirements:slot:replication-not-durability-label

- Status: authoring-admitted
- Objective: Assess whether the evidence “a copied dataset has an untested or asynchronous recovery path” supports the owned resolution “evaluate its actual durability and recovery semantics”.
- Expected decision: evaluate its actual durability and recovery semantics
- Decisive boundary: This slot owns the boundary established by a copied dataset has an untested or asynchronous recovery path; it resolves only to “evaluate its actual durability and recovery semantics” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:storage_scaling_configuration:storage_class_replication_configuration_durability_access_requirements:slot:s3-standard-multi-az

- Status: authoring-admitted
- Objective: Assess whether the evidence “frequent object access needs multi-AZ resilience” supports the owned resolution “use S3 Standard”.
- Expected decision: use S3 Standard
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
