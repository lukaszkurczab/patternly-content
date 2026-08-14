# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / object_file_block_hybrid_selection

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/object_file_block_hybrid_selection.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:object_file_block_hybrid_selection:object_efs_file_ebs_block_fsx_based_protocol_attachment_latency_requirements:slot:attachment-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “a single-instance block workload becomes multi-client shared file access” supports the owned resolution “move to a shared file service”.
- Expected decision: move to a shared file service
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:object_file_block_hybrid_selection:object_efs_file_ebs_block_fsx_based_protocol_attachment_latency_requirements:slot:ebs-block

- Status: authoring-admitted
- Objective: Assess whether the evidence “one EC2 attachment path needs low-latency block storage” supports the owned resolution “use EBS with the applicable attachment model”.
- Expected decision: use EBS with the applicable attachment model
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:object_file_block_hybrid_selection:object_efs_file_ebs_block_fsx_based_protocol_attachment_latency_requirements:slot:efs-file

- Status: authoring-admitted
- Objective: Assess whether the evidence “multiple Linux compute clients need a shared POSIX file system” supports the owned resolution “use EFS”.
- Expected decision: use EFS
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:object_file_block_hybrid_selection:object_efs_file_ebs_block_fsx_based_protocol_attachment_latency_requirements:slot:fsx-specialized-file

- Status: authoring-admitted
- Objective: Assess whether the evidence “SMB, Lustre, NetApp ONTAP, or OpenZFS semantics are required” supports the owned resolution “use the matching FSx family”.
- Expected decision: use the matching FSx family
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:object_file_block_hybrid_selection:object_efs_file_ebs_block_fsx_based_protocol_attachment_latency_requirements:slot:protocol-mismatch

- Status: authoring-admitted
- Objective: Assess whether the evidence “an application requires file locking but is offered object storage” supports the owned resolution “reject the protocol mismatch”.
- Expected decision: reject the protocol mismatch
- Decisive boundary: This slot owns the boundary established by an application requires file locking but is offered object storage; it resolves only to “reject the protocol mismatch” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:object_file_block_hybrid_selection:object_efs_file_ebs_block_fsx_based_protocol_attachment_latency_requirements:slot:s3-object

- Status: authoring-admitted
- Objective: Assess whether the evidence “clients use object APIs and need massive durable object storage” supports the owned resolution “use S3”.
- Expected decision: use S3
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:object_file_block_hybrid_selection:storage_gateway_datasync_compatible_migration_paths_premises_systems_retain_protocol_dep:slot:datasync-online-transfer

- Status: authoring-admitted
- Objective: Assess whether the evidence “files or objects must move online with scheduling, verification, and incremental transfer” supports the owned resolution “use DataSync”.
- Expected decision: use DataSync
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:object_file_block_hybrid_selection:storage_gateway_datasync_compatible_migration_paths_premises_systems_retain_protocol_dep:slot:migration-validation

- Status: authoring-admitted
- Objective: Assess whether the evidence “a protocol-dependent dataset moves to AWS” supports the owned resolution “inventory protocol and metadata, transfer, validate, and cut over”.
- Expected decision: inventory protocol and metadata, transfer, validate, and cut over
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:object_file_block_hybrid_selection:storage_gateway_datasync_compatible_migration_paths_premises_systems_retain_protocol_dep:slot:offline-scale

- Status: authoring-admitted
- Objective: Assess whether the evidence “network bandwidth cannot meet the cutover window” supports the owned resolution “reject an online-only path and assess an offline transfer device”.
- Expected decision: reject an online-only path and assess an offline transfer device
- Decisive boundary: This slot owns the boundary established by network bandwidth cannot meet the cutover window; it resolves only to “reject an online-only path and assess an offline transfer device” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:object_file_block_hybrid_selection:storage_gateway_datasync_compatible_migration_paths_premises_systems_retain_protocol_dep:slot:storage-gateway-file

- Status: authoring-admitted
- Objective: Assess whether the evidence “on-premises applications retain file protocol access while data is backed by AWS storage” supports the owned resolution “use an appropriate Storage Gateway mode”.
- Expected decision: use an appropriate Storage Gateway mode
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:object_file_block_hybrid_selection:storage_gateway_datasync_compatible_migration_paths_premises_systems_retain_protocol_dep:slot:storage-gateway-volume

- Status: authoring-admitted
- Objective: Assess whether the evidence “block-oriented on-premises applications need cloud-backed volumes” supports the owned resolution “use Volume Gateway where its model fits”.
- Expected decision: use Volume Gateway where its model fits
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
