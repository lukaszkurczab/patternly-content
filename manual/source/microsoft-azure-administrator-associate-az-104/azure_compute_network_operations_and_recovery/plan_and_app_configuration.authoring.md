# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / plan_and_app_configuration

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/plan_and_app_configuration.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:plan_and_app_configuration:app_configuration_secrets_connection_strings_code_artifacts:slot:distinguish-code-package-from-runtime-configuration

- Status: authoring-admitted
- Objective: Separate immutable deployed code from App Service configuration injected at runtime.
- Expected decision: Redeploy only code changes and change runtime configuration through the configuration plane.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:plan_and_app_configuration:app_configuration_secrets_connection_strings_code_artifacts:slot:mark-slot-specific-setting

- Status: authoring-admitted
- Objective: Mark a setting as a deployment-slot setting when it must remain with the source or destination slot during swap.
- Expected decision: Keep the value sticky to its slot through release swaps.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:plan_and_app_configuration:app_configuration_secrets_connection_strings_code_artifacts:slot:store-connection-string-in-connection-string-setting

- Status: authoring-admitted
- Objective: Use the connection-string configuration surface when framework/provider handling requires its typed prefix behavior.
- Expected decision: Configure the value outside the deployment artifact.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:plan_and_app_configuration:app_configuration_secrets_connection_strings_code_artifacts:slot:store-environment-value-in-app-setting

- Status: authoring-admitted
- Objective: Put environment-specific nonsecret runtime configuration in App Service application settings.
- Expected decision: Change the setting without rebuilding the code package.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:plan_and_app_configuration:app_configuration_secrets_connection_strings_code_artifacts:slot:use-key-vault-reference-for-secret

- Status: authoring-admitted
- Objective: Use a Key Vault reference when App Service must resolve a secret through its managed identity.
- Expected decision: Authorize the app identity and reference the secret rather than storing its value directly.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:plan_and_app_configuration:app_service_plan_application_settings_runtime_scale_isolation_needs:slot:select-isolated-plan-for-network-isolation

- Status: authoring-admitted
- Objective: Use an isolated App Service Environment only when dedicated network isolation and scale justify it.
- Expected decision: Deploy the isolated environment rather than assuming ordinary VNet integration provides the same boundary.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:plan_and_app_configuration:app_service_plan_application_settings_runtime_scale_isolation_needs:slot:select-plan-tier-for-custom-domain-tls-and-scale

- Status: authoring-admitted
- Objective: Select a plan tier that exposes the required TLS, custom-domain, deployment-slot, and scale capabilities.
- Expected decision: Use the lowest tier that satisfies all required capabilities and capacity.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:plan_and_app_configuration:app_service_plan_application_settings_runtime_scale_isolation_needs:slot:select-windows-or-linux-plan-for-runtime

- Status: authoring-admitted
- Objective: Choose a Windows or Linux plan that supports the application's runtime and deployment artifact.
- Expected decision: Create the app on a compatible plan OS.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:plan_and_app_configuration:app_service_plan_application_settings_runtime_scale_isolation_needs:slot:validate-plan-capacity-shared-by-apps

- Status: authoring-admitted
- Objective: Account for all apps and slots consuming the same App Service plan workers.
- Expected decision: Scale or separate the plan when aggregate demand exceeds capacity.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
