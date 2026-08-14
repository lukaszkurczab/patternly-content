# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / aci_vs_container_apps_provision

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/aci_vs_container_apps_provision.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:aci_vs_container_apps_provision:aci_container_apps_orchestration_networking_scaling_revision_needs:slot:diagnose-vnet-and-ingress-capability-requirement

- Status: authoring-admitted
- Objective: Reject ACI or Container Apps configuration when the required VNet/ingress capability is unavailable in that environment shape.
- Expected decision: Select the supported environment or product before provisioning.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:aci_vs_container_apps_provision:aci_container_apps_orchestration_networking_scaling_revision_needs:slot:select-aci-for-isolated-short-lived-container-group

- Status: authoring-admitted
- Objective: Choose Azure Container Instances for a directly provisioned container group needing no revision model or event-driven app platform.
- Expected decision: Deploy an ACI container group with required networking and restart behavior.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:aci_vs_container_apps_provision:aci_container_apps_orchestration_networking_scaling_revision_needs:slot:select-container-apps-for-http-event-driven-scaling

- Status: authoring-admitted
- Objective: Choose Container Apps when managed ingress and HTTP or event-driven replica scaling are required.
- Expected decision: Deploy a Container App and configure the appropriate scale rule.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:aci_vs_container_apps_provision:aci_container_apps_orchestration_networking_scaling_revision_needs:slot:select-container-apps-for-revision-traffic-splitting

- Status: authoring-admitted
- Objective: Choose Container Apps when immutable revisions and weighted traffic splitting are release requirements.
- Expected decision: Create a new revision and shift traffic under the release plan.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:aci_vs_container_apps_provision:container_identity_networking_secrets_runtime_boundary:slot:assign-managed-identity-to-container-runtime

- Status: authoring-admitted
- Objective: Attach a managed identity to the running container resource and authorize that identity on dependencies.
- Expected decision: Use the runtime identity for token acquisition without embedding credentials.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:aci_vs_container_apps_provision:container_identity_networking_secrets_runtime_boundary:slot:configure-ingress-external-or-internal

- Status: authoring-admitted
- Objective: Choose external or internal ingress from the caller network and exposure requirement.
- Expected decision: Expose only the required ingress path.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:aci_vs_container_apps_provision:container_identity_networking_secrets_runtime_boundary:slot:diagnose-identity-token-access-to-dependent-resource

- Status: authoring-admitted
- Objective: Use the runtime identity and target role assignment to diagnose a token succeeds but dependency access fails.
- Expected decision: Correct the target authorization for the attached runtime identity.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:aci_vs_container_apps_provision:container_identity_networking_secrets_runtime_boundary:slot:reference-secret-without-embedding-value

- Status: authoring-admitted
- Objective: Store a supported platform secret and reference it from environment/configuration instead of baking it into the image.
- Expected decision: Rotate the platform secret without rebuilding the image.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
