# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / connectivity_troubleshooting

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/connectivity_troubleshooting.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:connectivity_troubleshooting:classify_connectivity_troubleshooting_evidence:slot:diagnose-effective-route-next-hop

- Status: authoring-admitted
- Objective: Verify the source NIC's winning route and next hop for the resolved destination.
- Expected decision: Correct peering, gateway, or UDR when the path is wrong.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:connectivity_troubleshooting:classify_connectivity_troubleshooting_evidence:slot:diagnose-name-resolution-before-packet-filter

- Status: authoring-admitted
- Objective: Resolve the destination name and verify the returned public/private address before route or NSG changes.
- Expected decision: Fix DNS when the client targets the wrong address.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:connectivity_troubleshooting:classify_connectivity_troubleshooting_evidence:slot:diagnose-nsg-effective-rule-denial

- Status: authoring-admitted
- Objective: Find the first effective inbound or outbound NSG rule that matches the flow.
- Expected decision: Change the narrow rule or workload membership responsible for denial.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:connectivity_troubleshooting:classify_connectivity_troubleshooting_evidence:slot:diagnose-private-endpoint-dns-mapping

- Status: authoring-admitted
- Objective: Identify a private endpoint FQDN resolving publicly or to the wrong private endpoint address.
- Expected decision: Correct zone/link/record ownership for the client VNet.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:connectivity_troubleshooting:classify_connectivity_troubleshooting_evidence:slot:diagnose-storage-or-service-firewall-denial

- Status: authoring-admitted
- Objective: Recognize service-side network admission rejecting traffic after DNS, route, and NSG checks pass.
- Expected decision: Authorize the correct subnet/private path without broadening data permission.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
