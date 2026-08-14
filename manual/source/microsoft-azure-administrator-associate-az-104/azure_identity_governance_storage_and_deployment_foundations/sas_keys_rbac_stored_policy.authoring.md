# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / sas_keys_rbac_stored_policy

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/sas_keys_rbac_stored_policy.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:sas_keys_rbac_stored_policy:stored_access_policies_sas_revocation_supported:slot:bind-service-sas-to-stored-access-policy

- Status: authoring-admitted
- Objective: Reference a named stored access policy from a service SAS when shared constraints must be changed centrally.
- Expected decision: Issue the service SAS against the policy rather than embedding every constraint.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sas_keys_rbac_stored_policy:stored_access_policies_sas_revocation_supported:slot:diagnose-account-sas-not-supported-by-stored-policy

- Status: authoring-admitted
- Objective: Reject a design that expects a stored access policy to control an account SAS.
- Expected decision: Use a service SAS with a policy or rotate the signing key according to the required revocation model.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sas_keys_rbac_stored_policy:stored_access_policies_sas_revocation_supported:slot:revoke-sas-by-deleting-stored-policy

- Status: authoring-admitted
- Objective: Revoke service SAS tokens tied to a policy by deleting or invalidating that policy.
- Expected decision: Change the stored policy and account for propagation before declaring revocation complete.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sas_keys_rbac_stored_policy:user_delegation_sas_service_sas_account_key_rbac_delegation_scope_revocation_needs:slot:diagnose-sas-valid-but-network-denied

- Status: authoring-admitted
- Objective: Separate a correctly signed, unexpired SAS from a request rejected by the storage network perimeter.
- Expected decision: Correct the network path without broadening token permissions.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sas_keys_rbac_stored_policy:user_delegation_sas_service_sas_account_key_rbac_delegation_scope_revocation_needs:slot:select-account-sas-for-multiple-storage-services

- Status: authoring-admitted
- Objective: Use an account SAS only when one token must span supported services or service-level operations.
- Expected decision: Bound the account SAS by services, resource types, permissions, protocol, and time.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sas_keys_rbac_stored_policy:user_delegation_sas_service_sas_account_key_rbac_delegation_scope_revocation_needs:slot:select-entra-rbac-for-identity-based-access

- Status: authoring-admitted
- Objective: Use Microsoft Entra authentication and a storage data role when an identifiable principal should receive revocable ongoing access.
- Expected decision: Assign the narrow storage data role instead of distributing an account key.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sas_keys_rbac_stored_policy:user_delegation_sas_service_sas_account_key_rbac_delegation_scope_revocation_needs:slot:select-service-sas-for-one-storage-service

- Status: authoring-admitted
- Objective: Use a service SAS when access is limited to supported resources in one storage service.
- Expected decision: Sign a service SAS with the required scope and no broader permissions.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sas_keys_rbac_stored_policy:user_delegation_sas_service_sas_account_key_rbac_delegation_scope_revocation_needs:slot:select-user-delegation-sas-over-account-key-sas

- Status: authoring-admitted
- Objective: Use a user delegation SAS for delegated Blob access without signing with the storage account key.
- Expected decision: Issue a short-lived user delegation SAS from an authorized principal.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
