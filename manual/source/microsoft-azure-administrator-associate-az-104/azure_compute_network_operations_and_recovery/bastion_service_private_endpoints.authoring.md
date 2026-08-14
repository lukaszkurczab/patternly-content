# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / bastion_service_private_endpoints

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/bastion_service_private_endpoints.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:bastion_service_private_endpoints:bastion_service_endpoints_private_endpoints_management_private_service_access_requiremen:slot:distinguish-management-access-from-application-data-access

- Status: authoring-admitted
- Objective: Separate administrator RDP/SSH through Bastion from application access to a PaaS data endpoint.
- Expected decision: Use Bastion for management and service/private endpoints for application data paths.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:bastion_service_private_endpoints:bastion_service_endpoints_private_endpoints_management_private_service_access_requiremen:slot:select-bastion-for-browser-rdp-ssh-without-public-vm-ip

- Status: authoring-admitted
- Objective: Use Azure Bastion for managed RDP/SSH access to VMs without assigning public IPs to those VMs.
- Expected decision: Connect through Bastion and retain VM network controls.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:bastion_service_private_endpoints:bastion_service_endpoints_private_endpoints_management_private_service_access_requiremen:slot:select-private-endpoint-for-private-ip-to-service

- Status: authoring-admitted
- Objective: Use a private endpoint when the service must be reached through a private IP in the consumer VNet.
- Expected decision: Create/approve the endpoint and configure private DNS.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:bastion_service_private_endpoints:bastion_service_endpoints_private_endpoints_management_private_service_access_requiremen:slot:select-service-endpoint-for-subnet-identity-to-public-service-endpoint

- Status: authoring-admitted
- Objective: Use a service endpoint when a supported PaaS firewall should trust selected VNet subnets while clients still use the service's public endpoint.
- Expected decision: Enable the endpoint and add the subnet to the service firewall.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:bastion_service_private_endpoints:private_endpoint_dns_resolution_network_path_authorization:slot:diagnose-public-resolution-from-missing-zone-link

- Status: authoring-admitted
- Objective: Identify a client VNet not linked or forwarded to the private DNS zone when it receives a public answer.
- Expected decision: Link or forward the correct zone without changing endpoint approval.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:bastion_service_private_endpoints:private_endpoint_dns_resolution_network_path_authorization:slot:map-service-fqdn-to-private-endpoint-ip

- Status: authoring-admitted
- Objective: Ensure the service FQDN resolves through the private-link DNS chain to the endpoint's private IP for the client.
- Expected decision: Correct the private DNS record and forwarding path.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:bastion_service_private_endpoints:private_endpoint_dns_resolution_network_path_authorization:slot:validate-route-to-private-endpoint-subnet

- Status: authoring-admitted
- Objective: Verify routing and security from the client to the endpoint NIC's private IP.
- Expected decision: Correct network reachability before changing service credentials.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:bastion_service_private_endpoints:private_endpoint_dns_resolution_network_path_authorization:slot:validate-service-data-authorization-after-network-success

- Status: authoring-admitted
- Objective: Evaluate RBAC, SAS, keys, or service-specific authorization only after the private network connection succeeds.
- Expected decision: Grant the minimum data permission to the actual principal.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
