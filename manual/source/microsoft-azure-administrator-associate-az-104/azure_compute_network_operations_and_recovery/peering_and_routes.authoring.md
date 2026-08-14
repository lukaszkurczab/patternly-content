# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / peering_and_routes

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/peering_and_routes.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:peering_and_routes:effective_routes_changing_nsg:slot:diagnose-none-next-hop-from-conflict

- Status: authoring-admitted
- Objective: Identify a winning route with next hop None as a routing black hole.
- Expected decision: Remove or replace the conflicting route.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:peering_and_routes:effective_routes_changing_nsg:slot:distinguish-routing-failure-from-nsg-denial

- Status: authoring-admitted
- Objective: Separate no/incorrect next hop from a valid path later denied by effective NSG rules.
- Expected decision: Change UDR/peering for path errors and NSG only for filtering errors.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:peering_and_routes:effective_routes_changing_nsg:slot:inspect-effective-routes-on-nic

- Status: authoring-admitted
- Objective: Inspect effective routes on the source NIC for the actual destination before editing security rules.
- Expected decision: Confirm a valid path or correct routing first.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:peering_and_routes:vnet_peering_user_defined_routes_gateway_transit_intended_packet_path:slot:add-user-defined-route-to-virtual-appliance

- Status: authoring-admitted
- Objective: Add a UDR to a virtual appliance only when forwarding is enabled and return routing is designed.
- Expected decision: Associate the route table with the intended subnet and verify symmetric reachability.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:peering_and_routes:vnet_peering_user_defined_routes_gateway_transit_intended_packet_path:slot:calculate-next-hop-from-longest-prefix-system-and-udr

- Status: authoring-admitted
- Objective: Use longest-prefix match and route source/priority to identify the effective next hop.
- Expected decision: Change the route that actually wins for the destination.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:peering_and_routes:vnet_peering_user_defined_routes_gateway_transit_intended_packet_path:slot:configure-allow-gateway-transit-and-use-remote-gateway

- Status: authoring-admitted
- Objective: Configure gateway transit on the hub and remote-gateway use on the spoke when the spoke must use the hub gateway.
- Expected decision: Set complementary flags on the correct peering directions.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:peering_and_routes:vnet_peering_user_defined_routes_gateway_transit_intended_packet_path:slot:diagnose-peering-not-transitive

- Status: authoring-admitted
- Objective: Recognize that A-to-hub and hub-to-B peerings do not automatically route A-to-B traffic.
- Expected decision: Add the intended transit design rather than another unrelated NSG rule.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:peering_and_routes:vnet_peering_user_defined_routes_gateway_transit_intended_packet_path:slot:select-vnet-peering-for-private-backbone-path

- Status: authoring-admitted
- Objective: Use VNet peering for direct private connectivity between nonoverlapping Azure VNets over the Microsoft backbone.
- Expected decision: Create reciprocal peering and validate access settings.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
