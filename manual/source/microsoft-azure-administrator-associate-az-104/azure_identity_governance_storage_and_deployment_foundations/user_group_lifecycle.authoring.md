# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / user_group_lifecycle

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/user_group_lifecycle.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:user_group_lifecycle:entra_users_groups_lifecycle_states_identity_ownership:slot:classify-cloud-user-versus-external-user-object

- Status: authoring-admitted
- Objective: Distinguish an internally managed cloud user from a B2B user represented in the resource tenant.
- Expected decision: Apply the lifecycle process of the identity's owning organization.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:user_group_lifecycle:entra_users_groups_lifecycle_states_identity_ownership:slot:diagnose-soft-deleted-user-recovery-window

- Status: authoring-admitted
- Objective: Recognize when a deleted user can be restored and when a new identity would be created instead.
- Expected decision: Restore within the supported deleted-object window when identity continuity is required.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:user_group_lifecycle:entra_users_groups_lifecycle_states_identity_ownership:slot:sequence-create-update-disable-delete-user

- Status: authoring-admitted
- Objective: Choose disable before deletion when access must stop but investigation or handoff is incomplete.
- Expected decision: Disable access, complete ownership transfer, then delete under the retention policy.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:user_group_lifecycle:group_membership_dynamic_rules_authorization_model:slot:diagnose-rule-risk-from-user-writable-attribute

- Status: authoring-admitted
- Objective: Detect privilege escalation when a security-sensitive dynamic group trusts a user-writable attribute.
- Expected decision: Replace or protect the attribute before relying on the group for authorization.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:user_group_lifecycle:group_membership_dynamic_rules_authorization_model:slot:select-assigned-membership-for-manual-control

- Status: authoring-admitted
- Objective: Use assigned membership when an owner must approve each member explicitly.
- Expected decision: Keep membership assigned and audit owner changes.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:user_group_lifecycle:group_membership_dynamic_rules_authorization_model:slot:select-dynamic-device-rule-for-device-attributes

- Status: authoring-admitted
- Objective: Use a dynamic device rule for device properties without referencing the device owner's user attributes.
- Expected decision: Build the rule from supported device properties.
- Decisive boundary: A device rule cannot become a user-attribute rule through the device owner.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:user_group_lifecycle:group_membership_dynamic_rules_authorization_model:slot:select-dynamic-user-rule-for-attribute-membership

- Status: authoring-admitted
- Objective: Use a dynamic user rule only when trusted user attributes define membership.
- Expected decision: Create a user rule whose attributes cannot be self-manipulated to gain access.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
