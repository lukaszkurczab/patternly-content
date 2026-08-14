# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / policy_locks_tags

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 13
- Authoring-admitted slots: 13
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/policy_locks_tags.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:azure_policy_compliance_and_remediation:slot:diagnose-policy-exemption-versus-noncompliance

- Status: authoring-admitted
- Objective: Distinguish an exempt resource from an evaluated resource that remains noncompliant.
- Expected decision: Review exemption scope and expiry rather than attempting remediation of an intentionally exempt resource.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:azure_policy_compliance_and_remediation:slot:select-audit-effect-for-observation

- Status: authoring-admitted
- Objective: Use audit when noncompliance must be recorded without blocking the operation.
- Expected decision: Collect compliance evidence while allowing the resource operation.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:azure_policy_compliance_and_remediation:slot:select-deny-effect-for-prevention

- Status: authoring-admitted
- Objective: Use deny when a noncompliant create or update must be rejected before reaching the provider.
- Expected decision: Assign the deny policy at the governance scope that owns prevention.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:azure_policy_compliance_and_remediation:slot:select-deployifnotexists-for-related-resource

- Status: authoring-admitted
- Objective: Use deployIfNotExists when compliance requires deploying a related resource after the evaluated resource exists.
- Expected decision: Authorize the assignment identity and remediate missing related resources.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:azure_policy_compliance_and_remediation:slot:select-modify-effect-with-managed-identity

- Status: authoring-admitted
- Objective: Use modify for supported properties that must be added or corrected and grant the assignment identity required permissions.
- Expected decision: Create a remediation task for existing resources after the assignment is authorized.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:azure_policy_compliance_and_remediation:slot:sequence-assignment-remediation-compliance-recheck

- Status: authoring-admitted
- Objective: Separate policy assignment, evaluation, remediation task, and post-remediation compliance evaluation.
- Expected decision: Recheck compliance after remediation instead of treating task creation as success.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:resource_lock_operation_protection:slot:calculate-lock-inheritance-to-child-resource

- Status: authoring-admitted
- Objective: Determine whether a parent resource-group or subscription lock is the most restrictive effective lock on a child.
- Expected decision: Treat the inherited lock as effective until it is removed at its assignment scope.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:resource_lock_operation_protection:slot:distinguish-lock-from-rbac-authorization

- Status: authoring-admitted
- Objective: Separate an authorized request blocked by a lock from a request denied by missing role permission.
- Expected decision: Fix the correct control instead of broadening RBAC to bypass a lock.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:resource_lock_operation_protection:slot:select-cannotdelete-for-delete-protection

- Status: authoring-admitted
- Objective: Use CanNotDelete when updates must continue but control-plane deletion must fail.
- Expected decision: Apply the lock at the smallest scope covering the protected resources.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:resource_lock_operation_protection:slot:select-readonly-for-write-protection

- Status: authoring-admitted
- Objective: Use ReadOnly when control-plane creates, updates, and deletes must all be blocked.
- Expected decision: Avoid ReadOnly where required service operations issue control-plane writes.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:resource_tags_classification_and_ownership:slot:classify-tag-as-queryable-metadata

- Status: authoring-admitted
- Objective: Use a tag to record owner, environment, or cost-center metadata for inventory and reporting.
- Expected decision: Apply a consistent tag key and governed value vocabulary.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:resource_tags_classification_and_ownership:slot:diagnose-tag-noninheritance-from-resource-group

- Status: authoring-admitted
- Objective: Recognize that resource-group tags do not automatically appear on child resources.
- Expected decision: Tag the child explicitly or use an approved Policy modify assignment.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:policy_locks_tags:resource_tags_classification_and_ownership:slot:distinguish-tag-from-policy-enforcement

- Status: authoring-admitted
- Objective: Do not treat a tag value as an access, network, or deployment control.
- Expected decision: Use RBAC, Policy, or network controls for enforcement and tags for classification.
- Decisive boundary: Changing Owner=TeamA does not transfer Azure permissions to TeamA.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
