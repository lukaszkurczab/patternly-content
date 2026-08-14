# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / container_registry

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/container_registry.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:container_registry:registry_sku_replication_retention_based_pull_geography_delivery_needs:slot:configure-untagged-manifest-retention

- Status: authoring-admitted
- Objective: Set untagged-manifest retention for eligible manifests and distinguish it from deleting a tag while other tags still reference the manifest.
- Expected decision: Apply retention and verify which untagged manifests are eligible.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:container_registry:registry_sku_replication_retention_based_pull_geography_delivery_needs:slot:place-replica-near-pull-region

- Status: authoring-admitted
- Objective: Add a registry replica near remote build or runtime clients to reduce cross-region pull latency and dependency.
- Expected decision: Route registry operations to healthy replicas through the service behavior.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:container_registry:registry_sku_replication_retention_based_pull_geography_delivery_needs:slot:select-premium-sku-for-geo-replication

- Status: authoring-admitted
- Objective: Use Premium ACR when geo-replication is required and confirm all target regions support the deployment.
- Expected decision: Enable geo-replication only for regions serving material pull demand or resilience needs.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:container_registry:secure_azure_container_registry_scoped_identities_network_access_image_lifecycle_control:slot:diagnose-registry-firewall-versus-authentication-failure

- Status: authoring-admitted
- Objective: Separate a registry request blocked by network admission from one rejected by credential or repository permission.
- Expected decision: Fix the failed layer without opening the other.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:container_registry:secure_azure_container_registry_scoped_identities_network_access_image_lifecycle_control:slot:disable-public-network-for-private-endpoint-path

- Status: authoring-admitted
- Objective: Disable public registry access only after private endpoint connectivity and DNS resolution are ready.
- Expected decision: Pull and push through the private path.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:container_registry:secure_azure_container_registry_scoped_identities_network_access_image_lifecycle_control:slot:distinguish-repository-token-scope-from-network-admission

- Status: authoring-admitted
- Objective: Treat repository action scope and registry network admission as cumulative controls.
- Expected decision: Require both the permitted path and permitted repository action.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:container_registry:secure_azure_container_registry_scoped_identities_network_access_image_lifecycle_control:slot:select-managed-identity-with-acrpull-role

- Status: authoring-admitted
- Objective: Grant AcrPull to a workload managed identity at the registry scope required for image pulls.
- Expected decision: Use managed identity instead of embedding registry credentials.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:container_registry:secure_azure_container_registry_scoped_identities_network_access_image_lifecycle_control:slot:select-repository-scoped-token-for-limited-repository

- Status: authoring-admitted
- Objective: Use an ACR token/scope map when a non-Entra client needs permissions limited to named repositories and actions.
- Expected decision: Issue a token bound to the narrow scope map.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
