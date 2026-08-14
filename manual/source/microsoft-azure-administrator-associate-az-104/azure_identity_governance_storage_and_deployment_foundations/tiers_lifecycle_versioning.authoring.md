# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / tiers_lifecycle_versioning

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/tiers_lifecycle_versioning.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:tiers_lifecycle_versioning:classify_tiers_lifecycle_versioning_evidence:slot:configure-lifecycle-tier-transition-by-age

- Status: authoring-admitted
- Objective: Create a lifecycle rule whose filters and age conditions move eligible blobs through the intended tiers.
- Expected decision: Apply one ordered lifecycle policy and validate which blobs it selects.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:tiers_lifecycle_versioning:classify_tiers_lifecycle_versioning_evidence:slot:diagnose-rehydration-required-from-archive

- Status: authoring-admitted
- Objective: Recognize that an archived blob must be rehydrated before normal reads.
- Expected decision: Initiate rehydration and wait for the target online tier before retrying the read.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:tiers_lifecycle_versioning:classify_tiers_lifecycle_versioning_evidence:slot:distinguish-version-protection-from-legal-immutability

- Status: authoring-admitted
- Objective: Use immutability when writes or deletes must be prevented for a retention period, not merely recoverable as versions.
- Expected decision: Apply the supported immutable policy rather than relying on version history.
- Decisive boundary: Versioning preserves earlier content but does not prohibit modification or deletion.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:tiers_lifecycle_versioning:classify_tiers_lifecycle_versioning_evidence:slot:enable-versioning-for-overwrite-recovery

- Status: authoring-admitted
- Objective: Enable blob versioning when prior object states must survive overwrite or delete operations.
- Expected decision: Restore the required previous version and control accumulated version cost.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:tiers_lifecycle_versioning:classify_tiers_lifecycle_versioning_evidence:slot:select-hot-cool-cold-archive-tier-by-access-pattern

- Status: authoring-admitted
- Objective: Choose a blob access tier from access frequency, latency, minimum-duration, and retrieval-cost constraints.
- Expected decision: Use the least-cost tier that still satisfies access and minimum-duration requirements.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
