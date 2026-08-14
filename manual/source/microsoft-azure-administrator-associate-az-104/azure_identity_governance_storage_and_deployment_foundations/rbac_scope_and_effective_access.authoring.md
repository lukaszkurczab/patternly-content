# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / rbac_scope_and_effective_access

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/rbac_scope_and_effective_access.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:rbac_scope_and_effective_access:built_custom_role_permissions_narrowest_scope:slot:choose-narrowest-role-assignment-scope

- Status: authoring-admitted
- Objective: Assign the chosen role at the lowest scope containing every required resource.
- Expected decision: Use resource or resource-group scope unless a broader shared scope is required.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:rbac_scope_and_effective_access:built_custom_role_permissions_narrowest_scope:slot:select-built-in-role-when-permissions-fit

- Status: authoring-admitted
- Objective: Choose a Microsoft built-in role when its documented permissions match the job without material excess.
- Expected decision: Assign the fitting built-in role rather than creating an unnecessary custom role.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:rbac_scope_and_effective_access:built_custom_role_permissions_narrowest_scope:slot:select-custom-role-for-stable-permission-gap

- Status: authoring-admitted
- Objective: Create a custom role only for a stable permission set not represented by a built-in role.
- Expected decision: Define the minimum Actions and DataActions and document ownership.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:rbac_scope_and_effective_access:built_custom_role_permissions_narrowest_scope:slot:set-assignable-scopes-for-custom-role

- Status: authoring-admitted
- Objective: Set assignableScopes to the management groups or subscriptions where the custom role may be assigned.
- Expected decision: Keep assignable scopes no broader than the role's governance ownership.
- Decisive boundary: AssignableScopes controls where the definition is available, not a principal's actual access.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:rbac_scope_and_effective_access:built_custom_role_permissions_narrowest_scope:slot:validate-dataactions-for-data-plane-access

- Status: authoring-admitted
- Objective: Check DataActions when the required operation reads or changes service data.
- Expected decision: Use a role containing the required DataAction instead of relying on a management-only role.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:rbac_scope_and_effective_access:effective_azure_rbac_role_assignment_scope_inheritance_deny_conditions:slot:apply-deny-assignment-to-effective-access

- Status: authoring-admitted
- Objective: Apply a matching deny assignment after computing allowed permissions.
- Expected decision: Report the denied operation even when an allow role otherwise contains it.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:rbac_scope_and_effective_access:effective_azure_rbac_role_assignment_scope_inheritance_deny_conditions:slot:calculate-role-assignment-inheritance

- Status: authoring-admitted
- Objective: Trace role assignments from management group, subscription, resource group, and resource scopes.
- Expected decision: Include every inherited assignment that applies to the resource.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:rbac_scope_and_effective_access:effective_azure_rbac_role_assignment_scope_inheritance_deny_conditions:slot:calculate-union-of-allow-role-assignments

- Status: authoring-admitted
- Objective: Combine allowed actions from all applicable role assignments for the principal and its groups.
- Expected decision: Treat effective allow permissions as the union before evaluating restrictions.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:rbac_scope_and_effective_access:effective_azure_rbac_role_assignment_scope_inheritance_deny_conditions:slot:diagnose-role-assignment-condition-not-satisfied

- Status: authoring-admitted
- Objective: Evaluate an Azure RBAC condition when the role exists but the request attributes do not satisfy it.
- Expected decision: Correct the request context or condition rather than adding a broader duplicate role.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:rbac_scope_and_effective_access:effective_azure_rbac_role_assignment_scope_inheritance_deny_conditions:slot:distinguish-notactions-from-explicit-deny

- Status: authoring-admitted
- Objective: Interpret NotActions as subtraction from that role definition, not a global denial.
- Expected decision: Allow the operation when another applicable role grants it and no deny assignment blocks it.
- Decisive boundary: NotActions in one role cannot cancel permissions granted by a different role.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
