# hashicorp-terraform-associate-004 / terraform_configuration_foundations / sensitive_data_and_secrets_vault

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/sensitive_data_and_secrets_vault.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:sensitive_data_and_secrets_vault:retrieve_secret_reference_without_managing_secret_value:slot:data-source-state-risk

- Status: authoring-admitted
- Objective: Identify plaintext secret exposure after a Vault data lookup. It evaluates data source attribute; documented property state_exposure under state_exposure.
- Expected decision: Treat the state as compromised exposure surface and redesign or secure it.
- Decisive boundary: Data source values can be recorded in state despite UI redaction. With data source attribute; documented property state_exposure, the required resolution is Treat the state as compromised exposure surface and redesign or secure it.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:sensitive_data_and_secrets_vault:retrieve_secret_reference_without_managing_secret_value:slot:reference-versus-value

- Status: authoring-admitted
- Objective: Prefer passing a secret reference to a workload when the workload can resolve it itself. It evaluates workload secret integration; documented property secret_reference_over_plaintext under secret_reference_over_plaintext.
- Expected decision: Configure the reference and keep plaintext outside Terraform.
- Decisive boundary: Avoiding secret material is stronger than merely redacting it. With workload secret integration; documented property secret_reference_over_plaintext, the required resolution is Configure the reference and keep plaintext outside Terraform.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:sensitive_data_and_secrets_vault:retrieve_secret_reference_without_managing_secret_value:slot:secret-rotation-transfer

- Status: authoring-admitted
- Objective: Plan for secret rotation without forcing unrelated resource replacement. It evaluates rotating secret; documented property secret_rotation_boundary under secret_rotation_boundary.
- Expected decision: Use stable references or write-only version signaling according to the provider.
- Decisive boundary: Rotation semantics depend on the consumer API and Terraform persistence path. With rotating secret; documented property secret_rotation_boundary, the required resolution is Use stable references or write-only version signaling according to the provider.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:sensitive_data_and_secrets_vault:retrieve_secret_reference_without_managing_secret_value:slot:vault-data-source-read

- Status: authoring-admitted
- Objective: Retrieve a secret from Vault through a provider data source for runtime configuration. It evaluates Vault path; documented property vault_data_sources under vault_data_sources.
- Expected decision: Read the secret only when Terraform truly needs the value.
- Decisive boundary: Reading and managing the secret are different ownership decisions. With Vault path; documented property vault_data_sources, the required resolution is Read the secret only when Terraform truly needs the value.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:sensitive_data_and_secrets_vault:retrieve_secret_reference_without_managing_secret_value:slot:vault-token-boundary

- Status: authoring-admitted
- Objective: Separate credentials used by Terraform to access Vault from the secret it reads. It evaluates Vault auth token; documented property vault_authentication_boundary under vault_authentication_boundary.
- Expected decision: Scope both authentication and secret access to the run.
- Decisive boundary: The access credential and retrieved secret have separate lifecycles and exposure risks. With Vault auth token; documented property vault_authentication_boundary, the required resolution is Scope both authentication and secret access to the run.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:sensitive_data_and_secrets_vault:select_sensitive_ephemeral_or_write_only_value_handling:slot:ephemeral-flow-error

- Status: authoring-admitted
- Objective: Diagnose an ephemeral value used in a persistent context. It evaluates ephemeral variable; documented property ephemeral_flow_restrictions under ephemeral_flow_restrictions.
- Expected decision: Redesign the flow to a supported ephemeral/write-only context.
- Decisive boundary: Terraform prevents ephemeral values from leaking into persistent positions. With ephemeral variable; documented property ephemeral_flow_restrictions, the required resolution is Redesign the flow to a supported ephemeral/write-only context.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:sensitive_data_and_secrets_vault:select_sensitive_ephemeral_or_write_only_value_handling:slot:ephemeral-omission

- Status: authoring-admitted
- Objective: Choose an ephemeral variable for runtime-only data that must not enter plan or state. It evaluates runtime credential; documented property ephemeral_values under ephemeral_values.
- Expected decision: Declare ephemeral and pass it only through supported contexts.
- Decisive boundary: Ephemeral values are omitted but restricted in where they can flow. With runtime credential; documented property ephemeral_values, the required resolution is Declare ephemeral and pass it only through supported contexts.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:sensitive_data_and_secrets_vault:select_sensitive_ephemeral_or_write_only_value_handling:slot:sensitive-redaction

- Status: authoring-admitted
- Objective: Choose sensitive when a value may persist but should be redacted from normal output. It evaluates secret value; documented property sensitive_redaction under sensitive_redaction.
- Expected decision: Mark it sensitive and secure state separately.
- Decisive boundary: Sensitive controls display, not persistence. With secret value; documented property sensitive_redaction, the required resolution is Mark it sensitive and secure state separately.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:sensitive_data_and_secrets_vault:select_sensitive_ephemeral_or_write_only_value_handling:slot:state-access-remains

- Status: authoring-admitted
- Objective: Secure remote state even after adopting redaction and ephemeral values. It evaluates ordinary sensitive attributes; documented property sensitive_state_security under sensitive_state_security.
- Expected decision: Apply encryption and least-privilege state access.
- Decisive boundary: Many provider attributes can remain sensitive and persisted. With ordinary sensitive attributes; documented property sensitive_state_security, the required resolution is Apply encryption and least-privilege state access.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:sensitive_data_and_secrets_vault:select_sensitive_ephemeral_or_write_only_value_handling:slot:version-feature-boundary

- Status: authoring-admitted
- Objective: Verify feature availability against Terraform 1.12. It evaluates sensitive since 0.15; documented property feature_version_requirements under feature_version_requirements.
- Expected decision: Use all three only with compatible provider schemas and Core version.
- Decisive boundary: Core language support and provider field support are separate requirements. With sensitive since 0.15; documented property feature_version_requirements, the required resolution is Use all three only with compatible provider schemas and Core version.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:sensitive_data_and_secrets_vault:select_sensitive_ephemeral_or_write_only_value_handling:slot:write-only-argument

- Status: authoring-admitted
- Objective: Use a provider write-only argument for a secret accepted during apply but not returned or stored. It evaluates provider supports write-only field; documented property write_only_arguments under write_only_arguments.
- Expected decision: Populate the write-only argument and manage version/change signaling as documented.
- Decisive boundary: Write-only is a provider schema capability distinct from redaction. With provider supports write-only field; documented property write_only_arguments, the required resolution is Populate the write-only argument and manage version/change signaling as documented.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
