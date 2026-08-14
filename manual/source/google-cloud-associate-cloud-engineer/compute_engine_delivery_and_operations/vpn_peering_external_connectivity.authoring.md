# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / vpn_peering_external_connectivity

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 13
- Authoring-admitted slots: 13
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/vpn_peering_external_connectivity.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:cloud_vpn_cloud_interconnect_vpc_peering_bandwidth_routing_administrative_requirements:slot:bandwidth-sla-boundary

- Status: authoring-admitted
- Objective: vpn peering external connectivity — bandwidth sla boundary test: determine that “Connection capacity, topology redundancy, physical location, and end-to-end SLA requirements are explicit” supports “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them” and has not crossed into “Transfer among HA VPN, Partner Interconnect, Dedicated Interconnect, and VPC Peering accordingly”.
- Expected decision: Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them.
- Decisive boundary: vpn peering external connectivity — bandwidth sla: evidence “Connection capacity, topology redundancy, physical location, and end-to-end SLA requirements are explicit” is decisive for “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”. Evidence “The requirement changes between encrypted internet transport, provider-mediated private capacity, direct colocation capacity, and VPC-to-VPC reachability” instead supports the competing transfer “Transfer among HA VPN, Partner Interconnect, Dedicated Interconnect, and VPC Peering accordingly”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:cloud_vpn_cloud_interconnect_vpc_peering_bandwidth_routing_administrative_requirements:slot:connectivity-requirement-transfer

- Status: authoring-admitted
- Objective: vpn peering external connectivity — connectivity requirement constraint transfer: move to “Transfer among HA VPN, Partner Interconnect, Dedicated Interconnect, and VPC Peering accordingly” after “The requirement changes between encrypted internet transport, provider-mediated private capacity, direct colocation capacity, and VPC-to-VPC reachability”, while distinguishing the different transfer “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”.
- Expected decision: Transfer among HA VPN, Partner Interconnect, Dedicated Interconnect, and VPC Peering accordingly.
- Decisive boundary: vpn peering external connectivity — connectivity requirement: evidence “The requirement changes between encrypted internet transport, provider-mediated private capacity, direct colocation capacity, and VPC-to-VPC reachability” is decisive for “Transfer among HA VPN, Partner Interconnect, Dedicated Interconnect, and VPC Peering accordingly”. Evidence “Connection capacity, topology redundancy, physical location, and end-to-end SLA requirements are explicit” instead supports the competing boundary “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:cloud_vpn_cloud_interconnect_vpc_peering_bandwidth_routing_administrative_requirements:slot:dedicated-interconnect-choice

- Status: authoring-admitted
- Objective: vpn peering external connectivity — dedicated interconnect decision: select “Choose Dedicated Interconnect with the required redundant topology” under “The organization can meet Google at a supported colocation facility and needs one or more 10/100-Gbps circuits” rather than the competing action “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”.
- Expected decision: Choose Dedicated Interconnect with the required redundant topology.
- Decisive boundary: vpn peering external connectivity — dedicated interconnect: evidence “The organization can meet Google at a supported colocation facility and needs one or more 10/100-Gbps circuits” is decisive for “Choose Dedicated Interconnect with the required redundant topology”. Evidence “Connection capacity, topology redundancy, physical location, and end-to-end SLA requirements are explicit” instead supports the competing boundary “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:cloud_vpn_cloud_interconnect_vpc_peering_bandwidth_routing_administrative_requirements:slot:encryption-path-classification

- Status: authoring-admitted
- Objective: vpn peering external connectivity — encryption path procedure: order or execute “Add HA VPN over Interconnect or supported MACsec rather than assuming Interconnect encrypts by default” when “Traffic must be encrypted while using Cloud Interconnect VLAN attachments”; separate it from the neighboring procedure “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”.
- Expected decision: Add HA VPN over Interconnect or supported MACsec rather than assuming Interconnect encrypts by default.
- Decisive boundary: vpn peering external connectivity — encryption path: evidence “Traffic must be encrypted while using Cloud Interconnect VLAN attachments” is decisive for “Add HA VPN over Interconnect or supported MACsec rather than assuming Interconnect encrypts by default”. Evidence “Connection capacity, topology redundancy, physical location, and end-to-end SLA requirements are explicit” instead supports the competing boundary “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:cloud_vpn_cloud_interconnect_vpc_peering_bandwidth_routing_administrative_requirements:slot:ha-vpn-choice

- Status: authoring-admitted
- Objective: vpn peering external connectivity — ha vpn decision: select “Choose HA VPN with the tunnels/topology required for the target SLA” under “The connection can traverse the internet, requires IPsec and dynamic BGP routing, and needs an HA topology” rather than the competing action “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”.
- Expected decision: Choose HA VPN with the tunnels/topology required for the target SLA.
- Decisive boundary: vpn peering external connectivity — ha vpn: evidence “The connection can traverse the internet, requires IPsec and dynamic BGP routing, and needs an HA topology” is decisive for “Choose HA VPN with the tunnels/topology required for the target SLA”. Evidence “Connection capacity, topology redundancy, physical location, and end-to-end SLA requirements are explicit” instead supports the competing boundary “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:cloud_vpn_cloud_interconnect_vpc_peering_bandwidth_routing_administrative_requirements:slot:partner-interconnect-choice

- Status: authoring-admitted
- Objective: vpn peering external connectivity — partner interconnect decision: select “Choose Partner Interconnect through a supported service provider” under “The customer cannot meet Google at colocation or needs provider-delivered flexible capacity” rather than the competing action “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”.
- Expected decision: Choose Partner Interconnect through a supported service provider.
- Decisive boundary: vpn peering external connectivity — partner interconnect: evidence “The customer cannot meet Google at colocation or needs provider-delivered flexible capacity” is decisive for “Choose Partner Interconnect through a supported service provider”. Evidence “Connection capacity, topology redundancy, physical location, and end-to-end SLA requirements are explicit” instead supports the competing boundary “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:cloud_vpn_cloud_interconnect_vpc_peering_bandwidth_routing_administrative_requirements:slot:peering-transitivity-boundary

- Status: authoring-admitted
- Objective: vpn peering external connectivity — peering transitivity boundary test: determine that “Network A peers with B and A peers with C, but B must reach C” supports “Do not rely on VPC Peering for the B-to-C path; add a direct supported connection or other transit design” and has not crossed into “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”.
- Expected decision: Do not rely on VPC Peering for the B-to-C path; add a direct supported connection or other transit design.
- Decisive boundary: vpn peering external connectivity — peering transitivity: evidence “Network A peers with B and A peers with C, but B must reach C” is decisive for “Do not rely on VPC Peering for the B-to-C path; add a direct supported connection or other transit design”. Evidence “Connection capacity, topology redundancy, physical location, and end-to-end SLA requirements are explicit” instead supports the competing boundary “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:cloud_vpn_cloud_interconnect_vpc_peering_bandwidth_routing_administrative_requirements:slot:vpc-peering-choice

- Status: authoring-admitted
- Objective: vpn peering external connectivity — vpc peering decision: select “Use VPC Network Peering when non-transitive route exchange fits the requirement” under “Two independently administered VPC networks need private RFC1918 connectivity without on-premises transport” rather than the competing action “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”.
- Expected decision: Use VPC Network Peering when non-transitive route exchange fits the requirement.
- Decisive boundary: vpn peering external connectivity — vpc peering: evidence “Two independently administered VPC networks need private RFC1918 connectivity without on-premises transport” is decisive for “Use VPC Network Peering when non-transitive route exchange fits the requirement”. Evidence “Connection capacity, topology redundancy, physical location, and end-to-end SLA requirements are explicit” instead supports the competing boundary “Choose VPN or an Interconnect topology whose documented capacity and redundancy meet them”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:verify_route_exchange_dynamic_routing_boundaries_hybrid_connectivity:slot:advertised-route-choice

- Status: authoring-admitted
- Objective: vpn peering external connectivity — advertised route decision: select “Configure Cloud Router advertisements for the required prefixes and verify the peer receives them” under “The on-premises peer needs selected VPC or custom prefixes through BGP” rather than the competing action “Repair peer ASN, addresses, authentication/configuration, or reachability before inspecting route preference”.
- Expected decision: Configure Cloud Router advertisements for the required prefixes and verify the peer receives them.
- Decisive boundary: vpn peering external connectivity — advertised route: evidence “The on-premises peer needs selected VPC or custom prefixes through BGP” is decisive for “Configure Cloud Router advertisements for the required prefixes and verify the peer receives them”. Evidence “Hybrid routes are absent and the Cloud Router BGP peer is down or not established” instead supports the competing diagnosis “Repair peer ASN, addresses, authentication/configuration, or reachability before inspecting route preference”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:verify_route_exchange_dynamic_routing_boundaries_hybrid_connectivity:slot:bgp-session-state-diagnosis

- Status: authoring-admitted
- Objective: vpn peering external connectivity — bgp session state failure diagnosis: trace “Hybrid routes are absent and the Cloud Router BGP peer is down or not established” to “Repair peer ASN, addresses, authentication/configuration, or reachability before inspecting route preference” instead of applying the competing remediation “Configure Cloud Router advertisements for the required prefixes and verify the peer receives them”.
- Expected decision: Repair peer ASN, addresses, authentication/configuration, or reachability before inspecting route preference.
- Decisive boundary: vpn peering external connectivity — bgp session state: evidence “Hybrid routes are absent and the Cloud Router BGP peer is down or not established” is decisive for “Repair peer ASN, addresses, authentication/configuration, or reachability before inspecting route preference”. Evidence “The on-premises peer needs selected VPC or custom prefixes through BGP” instead supports the competing decision “Configure Cloud Router advertisements for the required prefixes and verify the peer receives them”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:verify_route_exchange_dynamic_routing_boundaries_hybrid_connectivity:slot:dynamic-routing-mode-boundary

- Status: authoring-admitted
- Objective: vpn peering external connectivity — dynamic routing mode boundary test: determine that “A learned route must be available beyond the Cloud Router's region” supports “Use global dynamic routing where cross-region propagation is required; regional mode confines learned route applicability” and has not crossed into “Configure Cloud Router advertisements for the required prefixes and verify the peer receives them”.
- Expected decision: Use global dynamic routing where cross-region propagation is required; regional mode confines learned route applicability.
- Decisive boundary: vpn peering external connectivity — dynamic routing mode: evidence “A learned route must be available beyond the Cloud Router's region” is decisive for “Use global dynamic routing where cross-region propagation is required; regional mode confines learned route applicability”. Evidence “The on-premises peer needs selected VPC or custom prefixes through BGP” instead supports the competing decision “Configure Cloud Router advertisements for the required prefixes and verify the peer receives them”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:verify_route_exchange_dynamic_routing_boundaries_hybrid_connectivity:slot:peering-import-export-diagnosis

- Status: authoring-admitted
- Objective: vpn peering external connectivity — peering import export failure diagnosis: trace “Subnet routes work across peering but custom static or dynamic routes do not” to “Enable custom-route export on one side and import on the peer, and advertise the return prefixes where needed” instead of applying the competing remediation “Configure Cloud Router advertisements for the required prefixes and verify the peer receives them”.
- Expected decision: Enable custom-route export on one side and import on the peer, and advertise the return prefixes where needed.
- Decisive boundary: vpn peering external connectivity — peering import export: evidence “Subnet routes work across peering but custom static or dynamic routes do not” is decisive for “Enable custom-route export on one side and import on the peer, and advertise the return prefixes where needed”. Evidence “The on-premises peer needs selected VPC or custom prefixes through BGP” instead supports the competing decision “Configure Cloud Router advertisements for the required prefixes and verify the peer receives them”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vpn_peering_external_connectivity:verify_route_exchange_dynamic_routing_boundaries_hybrid_connectivity:slot:route-domain-transfer

- Status: authoring-admitted
- Objective: vpn peering external connectivity — route domain constraint transfer: move to “Transfer diagnosis to subnet/peering route exchange or Cloud Router BGP as ownership changes” after “The destination moves between local subnet, peered VPC, and on-premises prefixes”, while distinguishing the different transfer “Configure Cloud Router advertisements for the required prefixes and verify the peer receives them”.
- Expected decision: Transfer diagnosis to subnet/peering route exchange or Cloud Router BGP as ownership changes.
- Decisive boundary: vpn peering external connectivity — route domain: evidence “The destination moves between local subnet, peered VPC, and on-premises prefixes” is decisive for “Transfer diagnosis to subnet/peering route exchange or Cloud Router BGP as ownership changes”. Evidence “The on-premises peer needs selected VPC or custom prefixes through BGP” instead supports the competing decision “Configure Cloud Router advertisements for the required prefixes and verify the peer receives them”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
