# aws-certified-solutions-architect-associate / aws_network_data_and_cost_optimization / backup_archive_migration

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_network_data_and_cost_optimization/backup_archive_migration.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:backup_archive_migration:archive_tiers_retained_data_backup_mechanisms_defined_recovery_workflows:slot:archive-not-backup

- Status: authoring-admitted
- Objective: Assess whether the evidence “an archive copy lacks application-consistent recovery and restore orchestration” supports the owned resolution “reject calling it a complete backup workflow”.
- Expected decision: reject calling it a complete backup workflow
- Decisive boundary: This slot owns the boundary established by an archive copy lacks application-consistent recovery and restore orchestration; it resolves only to “reject calling it a complete backup workflow” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:backup_archive_migration:archive_tiers_retained_data_backup_mechanisms_defined_recovery_workflows:slot:archive-retention

- Status: authoring-admitted
- Objective: Assess whether the evidence “data must be retained cheaply but has no defined application recovery workflow” supports the owned resolution “use an archive storage class”.
- Expected decision: use an archive storage class
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:backup_archive_migration:archive_tiers_retained_data_backup_mechanisms_defined_recovery_workflows:slot:backup-recovery

- Status: authoring-admitted
- Objective: Assess whether the evidence “systems need scheduled recovery points and orchestrated restores” supports the owned resolution “use AWS Backup or service backup mechanisms”.
- Expected decision: use AWS Backup or service backup mechanisms
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:backup_archive_migration:archive_tiers_retained_data_backup_mechanisms_defined_recovery_workflows:slot:retention-policy

- Status: authoring-admitted
- Objective: Assess whether the evidence “recovery points must expire under a documented retention schedule” supports the owned resolution “configure backup lifecycle and vault retention”.
- Expected decision: configure backup lifecycle and vault retention
- Decisive boundary: This slot owns the boundary established by recovery points must expire under a documented retention schedule; it resolves only to “configure backup lifecycle and vault retention” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:backup_archive_migration:archive_tiers_retained_data_backup_mechanisms_defined_recovery_workflows:slot:untested-archive-restore

- Status: authoring-admitted
- Objective: Assess whether the evidence “the nominally retained data cannot be restored within the requirement” supports the owned resolution “diagnose a retrieval-time mismatch”.
- Expected decision: diagnose a retrieval-time mismatch
- Decisive boundary: This slot owns the boundary established by the nominally retained data cannot be restored within the requirement; it resolves only to “diagnose a retrieval-time mismatch” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:backup_archive_migration:datasync_snowball_replication_network_migration_dataset_size_bandwidth_cutover_tolerance:slot:bandwidth-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “a new dedicated link makes incremental online migration feasible” supports the owned resolution “move from offline shipment to DataSync or network transfer”.
- Expected decision: move from offline shipment to DataSync or network transfer
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:backup_archive_migration:datasync_snowball_replication_network_migration_dataset_size_bandwidth_cutover_tolerance:slot:cutover-window

- Status: authoring-admitted
- Objective: Assess whether the evidence “raw bandwidth math cannot finish before the allowed outage” supports the owned resolution “reject the online-only plan”.
- Expected decision: reject the online-only plan
- Decisive boundary: This slot owns the boundary established by raw bandwidth math cannot finish before the allowed outage; it resolves only to “reject the online-only plan” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:backup_archive_migration:datasync_snowball_replication_network_migration_dataset_size_bandwidth_cutover_tolerance:slot:datasync-incremental

- Status: authoring-admitted
- Objective: Assess whether the evidence “network capacity supports repeated online transfers with verification” supports the owned resolution “use DataSync”.
- Expected decision: use DataSync
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:backup_archive_migration:datasync_snowball_replication_network_migration_dataset_size_bandwidth_cutover_tolerance:slot:network-copy

- Status: authoring-admitted
- Objective: Assess whether the evidence “a one-time small transfer fits available connectivity and tooling” supports the owned resolution “use an online network path”.
- Expected decision: use an online network path
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:backup_archive_migration:datasync_snowball_replication_network_migration_dataset_size_bandwidth_cutover_tolerance:slot:s3-replication

- Status: authoring-admitted
- Objective: Assess whether the evidence “objects already in S3 must replicate continuously to another bucket” supports the owned resolution “use S3 replication”.
- Expected decision: use S3 replication
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:backup_archive_migration:datasync_snowball_replication_network_migration_dataset_size_bandwidth_cutover_tolerance:slot:snowball-offline

- Status: authoring-admitted
- Objective: Assess whether the evidence “dataset size and bandwidth make the online cutover infeasible” supports the owned resolution “use Snowball Edge transfer”.
- Expected decision: use Snowball Edge transfer
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
