# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / groups_licenses_external_users

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/groups_licenses_external_users.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:groups_licenses_external_users:external_guest_access_lifecycle:slot:select-cross-tenant-setting-for-inbound-access

- Status: authoring-admitted
- Objective: Use cross-tenant access settings to constrain which external tenant users and apps may authenticate.
- Expected decision: Scope inbound collaboration to the approved external principals and resources.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:groups_licenses_external_users:external_guest_access_lifecycle:slot:select-external-collaboration-setting-for-invitation-rights

- Status: authoring-admitted
- Objective: Use external collaboration settings to control who may invite guests and which domains are allowed.
- Expected decision: Restrict invitation authority without confusing it with inbound authentication policy.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:groups_licenses_external_users:external_guest_access_lifecycle:slot:sequence-invite-redeem-authorize-review-remove

- Status: authoring-admitted
- Objective: Treat external access as invitation, redemption, explicit authorization, periodic review, and removal.
- Expected decision: Remove both assignments and the guest object when the relationship ends.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:groups_licenses_external_users:group_based_license_assignment:slot:assign-product-license-to-security-group

- Status: authoring-admitted
- Objective: Assign the product and enabled service plans to a group so current and future members inherit them.
- Expected decision: Apply the license at group scope and inspect processing status.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:groups_licenses_external_users:group_based_license_assignment:slot:diagnose-conflicting-service-plan-assignment

- Status: authoring-admitted
- Objective: Resolve a user license error caused by mutually dependent or conflicting service-plan state.
- Expected decision: Correct the product or plan combination instead of removing unrelated group membership.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:groups_licenses_external_users:group_based_license_assignment:slot:diagnose-insufficient-license-inventory

- Status: authoring-admitted
- Objective: Identify users left in error because available product licenses do not cover group members.
- Expected decision: Acquire or release capacity, then reprocess the affected assignments.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:groups_licenses_external_users:group_based_license_assignment:slot:distinguish-direct-from-inherited-group-license

- Status: authoring-admitted
- Objective: Identify whether a user's effective license came directly or through group inheritance before removal.
- Expected decision: Remove the actual assignment source and confirm the effective license state.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:groups_licenses_external_users:group_membership_and_authorization_boundary:slot:diagnose-nested-membership-not-evaluated-by-service

- Status: authoring-admitted
- Objective: Check whether the consuming service honors nested group membership before relying on it.
- Expected decision: Use supported direct membership when the authorization path ignores nesting.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:groups_licenses_external_users:group_membership_and_authorization_boundary:slot:distinguish-group-membership-from-role-assignment

- Status: authoring-admitted
- Objective: Separate who belongs to the group from what the group is allowed to do.
- Expected decision: Change membership for principal selection and RBAC for Azure permissions.
- Decisive boundary: Adding a user to an unassigned group grants no Azure resource access.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:groups_licenses_external_users:group_membership_and_authorization_boundary:slot:select-security-group-for-resource-authorization

- Status: authoring-admitted
- Objective: Use a security group when membership will be assigned to an Azure role or application permission.
- Expected decision: Authorize the security group at the required resource scope.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
