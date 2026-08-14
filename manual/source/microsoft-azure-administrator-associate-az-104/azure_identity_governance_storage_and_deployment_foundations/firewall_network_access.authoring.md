# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / firewall_network_access

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 4
- Authoring-admitted slots: 4
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/firewall_network_access.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:firewall_network_access:classify_firewall_network_access_evidence:slot:classify-public-network-access-setting

- Status: authoring-admitted
- Objective: Determine whether the storage account accepts traffic through its public endpoint before evaluating network rules.
- Expected decision: Enable only the required public path or use private access.
- Decisive boundary: A correct credential cannot reach an account whose selected network path is disabled.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:firewall_network_access:classify_firewall_network_access_evidence:slot:diagnose-firewall-allow-with-missing-data-permission

- Status: authoring-admitted
- Objective: Recognize network admission succeeded but the principal or SAS lacks the required data operation.
- Expected decision: Fix the data role or token, not the firewall.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:firewall_network_access:classify_firewall_network_access_evidence:slot:select-private-endpoint-for-private-ip-access

- Status: authoring-admitted
- Objective: Use a private endpoint when clients must resolve and reach the account through a private IP.
- Expected decision: Approve the connection and configure private resolution without reopening public access.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:firewall_network_access:classify_firewall_network_access_evidence:slot:select-vnet-rule-with-service-endpoint

- Status: authoring-admitted
- Objective: Use a virtual-network rule when an approved subnet reaches the public storage endpoint through a service endpoint.
- Expected decision: Add the approved subnet and keep data authorization independent.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
