# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / scope_and_resource_model

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 6
- Authoring-admitted slots: 6
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/scope_and_resource_model.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:scope_and_resource_model:azure_resources_correct_management_group_subscription_resource_group_resource_scope:slot:classify-management-group-governance-scope

- Status: authoring-admitted
- Objective: Determine when subscriptions must share inherited policy or RBAC through a management group.
- Expected decision: Place the subscriptions under the management group that owns the shared governance.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scope_and_resource_model:azure_resources_correct_management_group_subscription_resource_group_resource_scope:slot:classify-resource-group-lifecycle-boundary

- Status: authoring-admitted
- Objective: Group resources that must be deployed, updated, and deleted together without implying regional colocation.
- Expected decision: Use one resource group for the common lifecycle and retain each resource's own location.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scope_and_resource_model:azure_resources_correct_management_group_subscription_resource_group_resource_scope:slot:classify-subscription-billing-and-quota-boundary

- Status: authoring-admitted
- Objective: Separate a subscription boundary from a resource-group lifecycle boundary.
- Expected decision: Use a subscription when billing, quota, or subscription-level administration must be isolated.
- Decisive boundary: A resource group does not create a new billing or quota boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scope_and_resource_model:resource_provider_regional_dependencies_deployment:slot:verify-api-version-for-resource-type

- Status: authoring-admitted
- Objective: Match the template API version to a version published for that provider resource type.
- Expected decision: Use a supported API version that exposes the required properties.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scope_and_resource_model:resource_provider_regional_dependencies_deployment:slot:verify-provider-registration-state

- Status: authoring-admitted
- Objective: Check whether the subscription is registered for the namespace before deploying its resource type.
- Expected decision: Register only the required provider when its state does not permit deployment.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scope_and_resource_model:resource_provider_regional_dependencies_deployment:slot:verify-resource-type-region-support

- Status: authoring-admitted
- Objective: Verify that the selected resource type is offered in the requested Azure region.
- Expected decision: Change region or resource type when the provider metadata excludes the requested location.
- Decisive boundary: Provider registration does not make an unsupported location valid.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
