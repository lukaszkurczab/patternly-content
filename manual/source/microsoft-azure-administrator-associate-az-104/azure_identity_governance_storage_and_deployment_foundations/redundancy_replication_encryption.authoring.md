# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / redundancy_replication_encryption

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/redundancy_replication_encryption.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:redundancy_replication_encryption:lrs_zrs_grs_gzrs_encryption_controls_availability_geographic_recovery_requirements:slot:select-customer-managed-key-for-key-control

- Status: authoring-admitted
- Objective: Choose a customer-managed key when the organization must control key lifecycle, access, and rotation.
- Expected decision: Configure the storage encryption identity and key permissions before switching to the customer key.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:redundancy_replication_encryption:lrs_zrs_grs_gzrs_encryption_controls_availability_geographic_recovery_requirements:slot:select-grs-for-regional-copy-from-lrs-primary

- Status: authoring-admitted
- Objective: Choose GRS when an asynchronous secondary-region copy is required and primary copies may remain locally redundant.
- Expected decision: Use GRS and evaluate separate read-access/failover requirements.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:redundancy_replication_encryption:lrs_zrs_grs_gzrs_encryption_controls_availability_geographic_recovery_requirements:slot:select-gzrs-for-zone-primary-and-region-secondary

- Status: authoring-admitted
- Objective: Choose GZRS when the primary must survive a zone failure and data must also replicate to a secondary region.
- Expected decision: Use GZRS where the account type and region support it.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:redundancy_replication_encryption:lrs_zrs_grs_gzrs_encryption_controls_availability_geographic_recovery_requirements:slot:select-lrs-for-single-datacenter-redundancy

- Status: authoring-admitted
- Objective: Choose LRS only when copies within one primary-region datacenter satisfy the failure requirement.
- Expected decision: Use LRS and document that datacenter-scale failure is outside the design.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:redundancy_replication_encryption:lrs_zrs_grs_gzrs_encryption_controls_availability_geographic_recovery_requirements:slot:select-zrs-for-zonal-resilience

- Status: authoring-admitted
- Objective: Choose ZRS when synchronous copies across availability zones in the primary region are required.
- Expected decision: Use ZRS for primary-region zone resilience without claiming a secondary region.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:redundancy_replication_encryption:replication_durability_immediate_read_access_failover_behavior:slot:diagnose-data-loss-window-at-failover

- Status: authoring-admitted
- Objective: Bound potential data loss at account failover by the last synchronization time.
- Expected decision: Approve failover only after accepting the recovery-point consequence.
- Decisive boundary: Customer-managed failover can make unreplicated primary writes unavailable.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:redundancy_replication_encryption:replication_durability_immediate_read_access_failover_behavior:slot:diagnose-secondary-eventual-consistency

- Status: authoring-admitted
- Objective: Recognize stale or missing recent objects at the secondary as replication lag rather than immediate primary data loss.
- Expected decision: Use the documented recovery point and avoid assuming synchronous regional replication.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:redundancy_replication_encryption:replication_durability_immediate_read_access_failover_behavior:slot:distinguish-durability-from-service-availability

- Status: authoring-admitted
- Objective: Separate durable replicated copies from whether the application can currently read or write through an endpoint.
- Expected decision: Evaluate availability and recovery operations independently from durability claims.
- Decisive boundary: Multiple durable copies do not guarantee the primary endpoint is reachable.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:redundancy_replication_encryption:replication_durability_immediate_read_access_failover_behavior:slot:distinguish-grs-from-ra-grs-read-access

- Status: authoring-admitted
- Objective: Distinguish a replicated secondary that is not readable from an RA option exposing a read-only secondary endpoint.
- Expected decision: Select read access only when the application can tolerate the secondary's read-only, lagging view.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
