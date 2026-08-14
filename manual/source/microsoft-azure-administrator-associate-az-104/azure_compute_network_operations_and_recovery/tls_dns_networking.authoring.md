# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / tls_dns_networking

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/tls_dns_networking.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:tls_dns_networking:bind_tls_dns_private_access_networking_controls_app_service_ingress_boundary:slot:bind-certificate-to-hostname

- Status: authoring-admitted
- Objective: Bind a valid certificate whose subject/SAN covers the custom hostname.
- Expected decision: Attach the certificate to the exact hostname after DNS validation.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:tls_dns_networking:bind_tls_dns_private_access_networking_controls_app_service_ingress_boundary:slot:enforce-https-and-minimum-tls

- Status: authoring-admitted
- Objective: Redirect HTTP and set the minimum inbound TLS version required by policy and client compatibility.
- Expected decision: Reject weaker inbound transport without breaking approved clients.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:tls_dns_networking:bind_tls_dns_private_access_networking_controls_app_service_ingress_boundary:slot:select-private-endpoint-for-private-ingress

- Status: authoring-admitted
- Objective: Use an App Service private endpoint when inbound access must terminate on a private IP in the client network.
- Expected decision: Configure private resolution and restrict the public ingress path as required.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:tls_dns_networking:bind_tls_dns_private_access_networking_controls_app_service_ingress_boundary:slot:verify-custom-domain-dns-record

- Status: authoring-admitted
- Objective: Create the required DNS validation and routing record for the custom hostname before binding it.
- Expected decision: Verify ownership and resolution to the intended app.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:tls_dns_networking:inbound_access_restriction_outbound_vnet_integration:slot:diagnose-vnet-integration-not-providing-private-ingress

- Status: authoring-admitted
- Objective: Recognize that VNet integration changes outbound reachability and does not create a private inbound listener.
- Expected decision: Add a private endpoint or inbound control for private client access.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:tls_dns_networking:inbound_access_restriction_outbound_vnet_integration:slot:select-access-restriction-for-inbound-source-filter

- Status: authoring-admitted
- Objective: Use access restrictions to allow or deny inbound requests by source rules on the app endpoint.
- Expected decision: Create ordered inbound rules without claiming they configure outbound routing.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:tls_dns_networking:inbound_access_restriction_outbound_vnet_integration:slot:select-private-endpoint-for-private-inbound-address

- Status: authoring-admitted
- Objective: Use a private endpoint when inbound clients need a private destination address for the app.
- Expected decision: Connect inbound clients through the private endpoint.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:tls_dns_networking:inbound_access_restriction_outbound_vnet_integration:slot:select-vnet-integration-for-outbound-private-resource-access

- Status: authoring-admitted
- Objective: Use regional VNet integration when the app must initiate outbound connections into a VNet.
- Expected decision: Integrate the app with the delegated subnet and verify egress routing.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
