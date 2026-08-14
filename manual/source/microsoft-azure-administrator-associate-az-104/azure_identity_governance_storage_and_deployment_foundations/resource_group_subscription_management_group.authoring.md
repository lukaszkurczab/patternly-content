# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / resource_group_subscription_management_group

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/resource_group_subscription_management_group.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:resource_group_subscription_management_group:move_resources_validating_supported_types_dependencies_scope:slot:diagnose-resource-id-change-after-move

- Status: authoring-admitted
- Objective: Identify configurations that still reference the old subscription or resource-group resource ID.
- Expected decision: Update dependent configuration after the move completes.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:resource_group_subscription_management_group:move_resources_validating_supported_types_dependencies_scope:slot:distinguish-move-from-region-redeployment

- Status: authoring-admitted
- Objective: Treat a region change as service-specific migration or redeployment rather than a Resource Manager move.
- Expected decision: Plan data and dependency migration using the service's regional procedure.
- Decisive boundary: Changing resource group or subscription does not change the resource's region.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:resource_group_subscription_management_group:move_resources_validating_supported_types_dependencies_scope:slot:include-dependent-resources-in-move

- Status: authoring-admitted
- Objective: Include dependent resources required by the provider's move contract.
- Expected decision: Submit the supported dependency set together or stop the move.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:resource_group_subscription_management_group:move_resources_validating_supported_types_dependencies_scope:slot:verify-resource-type-move-support

- Status: authoring-admitted
- Objective: Check the provider's move-support table before planning a resource-group or subscription move.
- Expected decision: Reject or redesign a move containing an unsupported resource type.
- Decisive boundary: A resource that can be redeployed elsewhere is not necessarily movable in place.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:resource_group_subscription_management_group:organize_management_groups_subscriptions_resource_groups_governance_billing_ownership:slot:select-management-group-for-policy-inheritance

- Status: authoring-admitted
- Objective: Group subscriptions under a management group when they share governance controls.
- Expected decision: Place subscriptions under the common governance parent.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:resource_group_subscription_management_group:organize_management_groups_subscriptions_resource_groups_governance_billing_ownership:slot:select-resource-group-for-common-lifecycle

- Status: authoring-admitted
- Objective: Use a resource group for resources that share deployment and deletion lifecycle within a subscription.
- Expected decision: Group the resources without assuming the group imposes a shared region.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:resource_group_subscription_management_group:organize_management_groups_subscriptions_resource_groups_governance_billing_ownership:slot:select-subscription-for-billing-and-quota-isolation

- Status: authoring-admitted
- Objective: Create or select a subscription when billing ownership, quotas, or subscription administration must be separate.
- Expected decision: Keep workloads with different billing or quota ownership in distinct subscriptions.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
