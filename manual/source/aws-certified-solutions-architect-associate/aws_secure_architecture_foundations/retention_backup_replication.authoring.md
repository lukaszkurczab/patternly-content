# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / retention_backup_replication

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/retention_backup_replication.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:retention_backup_replication:backup_snapshot_replication_archive_based_restore_point_retention_regional_isolation_nee:slot:archive-retention

- Status: authoring-admitted
- Objective: Assess whether the evidence “data is rarely restored but must be retained cheaply for years” supports the owned resolution “use an archive tier with understood retrieval time”.
- Expected decision: use an archive tier with understood retrieval time
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:retention_backup_replication:backup_snapshot_replication_archive_based_restore_point_retention_regional_isolation_nee:slot:backup-restore-point

- Status: authoring-admitted
- Objective: Assess whether the evidence “periodic recoverable copies must meet a stated RPO” supports the owned resolution “schedule backups at a frequency consistent with the RPO”.
- Expected decision: schedule backups at a frequency consistent with the RPO
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:retention_backup_replication:backup_snapshot_replication_archive_based_restore_point_retention_regional_isolation_nee:slot:cross-region-copy

- Status: authoring-admitted
- Objective: Assess whether the evidence “regional isolation is required for recovery copies” supports the owned resolution “copy or replicate to another Region”.
- Expected decision: copy or replicate to another Region
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:retention_backup_replication:backup_snapshot_replication_archive_based_restore_point_retention_regional_isolation_nee:slot:replication-not-backup

- Status: authoring-admitted
- Objective: Assess whether the evidence “logical deletion would immediately propagate to the replica” supports the owned resolution “reject replication as the only recovery copy”.
- Expected decision: reject replication as the only recovery copy
- Decisive boundary: This slot owns the boundary established by logical deletion would immediately propagate to the replica; it resolves only to “reject replication as the only recovery copy” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:retention_backup_replication:backup_snapshot_replication_archive_based_restore_point_retention_regional_isolation_nee:slot:rto-tightening

- Status: authoring-admitted
- Objective: Assess whether the evidence “recovery time moves from days to minutes” supports the owned resolution “replace archive-only recovery with faster restore or standby capability”.
- Expected decision: replace archive-only recovery with faster restore or standby capability
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:retention_backup_replication:backup_snapshot_replication_archive_based_restore_point_retention_regional_isolation_nee:slot:snapshot-volume-recovery

- Status: authoring-admitted
- Objective: Assess whether the evidence “a point-in-time block volume copy is needed” supports the owned resolution “use an EBS snapshot and test restoration”.
- Expected decision: use an EBS snapshot and test restoration
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:retention_backup_replication:immutable_isolated_recovery_copies_deletion_ransomware_logical_corruption_scope:slot:cross-account-vault

- Status: authoring-admitted
- Objective: Assess whether the evidence “a compromised workload account must not control all recovery copies” supports the owned resolution “copy backups to a separately governed account”.
- Expected decision: copy backups to a separately governed account
- Decisive boundary: This slot owns the boundary established by a compromised workload account must not control all recovery copies; it resolves only to “copy backups to a separately governed account” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:retention_backup_replication:immutable_isolated_recovery_copies_deletion_ransomware_logical_corruption_scope:slot:governance-vs-compliance

- Status: authoring-admitted
- Objective: Assess whether the evidence “authorized users may need to override retention” supports the owned resolution “choose governance or compliance behavior deliberately”.
- Expected decision: choose governance or compliance behavior deliberately
- Decisive boundary: This slot owns the boundary established by authorized users may need to override retention; it resolves only to “choose governance or compliance behavior deliberately” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:retention_backup_replication:immutable_isolated_recovery_copies_deletion_ransomware_logical_corruption_scope:slot:recovery-validation

- Status: authoring-admitted
- Objective: Assess whether the evidence “immutable copies are configured” supports the owned resolution “order restore testing, integrity validation, and recovery evidence”.
- Expected decision: order restore testing, integrity validation, and recovery evidence
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:retention_backup_replication:immutable_isolated_recovery_copies_deletion_ransomware_logical_corruption_scope:slot:s3-object-lock

- Status: authoring-admitted
- Objective: Assess whether the evidence “object versions require write-once-read-many retention” supports the owned resolution “use S3 Object Lock with versioning”.
- Expected decision: use S3 Object Lock with versioning
- Decisive boundary: This slot owns the boundary established by object versions require write-once-read-many retention; it resolves only to “use S3 Object Lock with versioning” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:retention_backup_replication:immutable_isolated_recovery_copies_deletion_ransomware_logical_corruption_scope:slot:same-admin-domain

- Status: authoring-admitted
- Objective: Assess whether the evidence “backup copies exist but the compromised administrator can delete all of them” supports the owned resolution “diagnose lack of isolation”.
- Expected decision: diagnose lack of isolation
- Decisive boundary: This slot owns the boundary established by backup copies exist but the compromised administrator can delete all of them; it resolves only to “diagnose lack of isolation” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:retention_backup_replication:immutable_isolated_recovery_copies_deletion_ransomware_logical_corruption_scope:slot:vault-lock-compliance

- Status: authoring-admitted
- Objective: Assess whether the evidence “backup retention must be immutable after a grace period” supports the owned resolution “use AWS Backup Vault Lock compliance mode”.
- Expected decision: use AWS Backup Vault Lock compliance mode
- Decisive boundary: This slot owns the boundary established by backup retention must be immutable after a grace period; it resolves only to “use AWS Backup Vault Lock compliance mode” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
