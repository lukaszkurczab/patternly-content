# aws-certified-solutions-architect-associate / aws_network_data_and_cost_optimization / connectivity_and_edge

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_network_data_and_cost_optimization/connectivity_and_edge.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:connectivity_and_edge:internet_gateway_nat_gateway_egress_gateway_edge_routing_workload_direction_version:slot:directionality

- Status: authoring-admitted
- Objective: Assess whether the evidence “NAT is proposed to accept unsolicited inbound connections” supports the owned resolution “reject the direction mismatch”.
- Expected decision: reject the direction mismatch
- Decisive boundary: This slot owns the boundary established by NAT is proposed to accept unsolicited inbound connections; it resolves only to “reject the direction mismatch” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:connectivity_and_edge:internet_gateway_nat_gateway_egress_gateway_edge_routing_workload_direction_version:slot:egress-only-ipv6

- Status: authoring-admitted
- Objective: Assess whether the evidence “private IPv6 resources need outbound-only internet access” supports the owned resolution “use an egress-only internet gateway”.
- Expected decision: use an egress-only internet gateway
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:connectivity_and_edge:internet_gateway_nat_gateway_egress_gateway_edge_routing_workload_direction_version:slot:internet-gateway-ingress

- Status: authoring-admitted
- Objective: Assess whether the evidence “public IPv4 resources require direct internet routing” supports the owned resolution “use an Internet Gateway with public addressing and routes”.
- Expected decision: use an Internet Gateway with public addressing and routes
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:connectivity_and_edge:internet_gateway_nat_gateway_egress_gateway_edge_routing_workload_direction_version:slot:nat-gateway-egress

- Status: authoring-admitted
- Objective: Assess whether the evidence “private IPv4 instances need outbound internet access without inbound initiation” supports the owned resolution “use a NAT Gateway in a public subnet”.
- Expected decision: use a NAT Gateway in a public subnet
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:connectivity_and_edge:internet_gateway_nat_gateway_egress_gateway_edge_routing_workload_direction_version:slot:nat-route-loop

- Status: authoring-admitted
- Objective: Assess whether the evidence “a private route or NAT subnet route is misdirected” supports the owned resolution “diagnose the actual route-table path”.
- Expected decision: diagnose the actual route-table path
- Decisive boundary: This slot owns the boundary established by a private route or NAT subnet route is misdirected; it resolves only to “diagnose the actual route-table path” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:connectivity_and_edge:internet_gateway_nat_gateway_egress_gateway_edge_routing_workload_direction_version:slot:private-service-route

- Status: authoring-admitted
- Objective: Assess whether the evidence “traffic to an AWS service must avoid internet egress” supports the owned resolution “route through the applicable VPC endpoint”.
- Expected decision: route through the applicable VPC endpoint
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:connectivity_and_edge:site_site_vpn_direct_connect_transit_gateway_private_endpoints_based_bandwidth_latency_t:slot:direct-connect

- Status: authoring-admitted
- Objective: Assess whether the evidence “dedicated private connectivity and predictable throughput are required” supports the owned resolution “use Direct Connect”.
- Expected decision: use Direct Connect
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:connectivity_and_edge:site_site_vpn_direct_connect_transit_gateway_private_endpoints_based_bandwidth_latency_t:slot:dx-encryption

- Status: authoring-admitted
- Objective: Assess whether the evidence “a proposal assumes Direct Connect alone encrypts traffic end to end” supports the owned resolution “add a supported encryption design when required”.
- Expected decision: add a supported encryption design when required
- Decisive boundary: This slot owns the boundary established by a proposal assumes Direct Connect alone encrypts traffic end to end; it resolves only to “add a supported encryption design when required” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:connectivity_and_edge:site_site_vpn_direct_connect_transit_gateway_private_endpoints_based_bandwidth_latency_t:slot:private-endpoint

- Status: authoring-admitted
- Objective: Assess whether the evidence “a consumer needs private service access without network-wide routing” supports the owned resolution “use PrivateLink or a service endpoint”.
- Expected decision: use PrivateLink or a service endpoint
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:connectivity_and_edge:site_site_vpn_direct_connect_transit_gateway_private_endpoints_based_bandwidth_latency_t:slot:site-to-site-vpn

- Status: authoring-admitted
- Objective: Assess whether the evidence “encrypted connectivity over the internet meets bandwidth and variability needs” supports the owned resolution “use Site-to-Site VPN”.
- Expected decision: use Site-to-Site VPN
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:connectivity_and_edge:site_site_vpn_direct_connect_transit_gateway_private_endpoints_based_bandwidth_latency_t:slot:topology-growth

- Status: authoring-admitted
- Objective: Assess whether the evidence “two VPC links become a many-network mesh” supports the owned resolution “move to a transit topology”.
- Expected decision: move to a transit topology
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:connectivity_and_edge:site_site_vpn_direct_connect_transit_gateway_private_endpoints_based_bandwidth_latency_t:slot:transit-gateway

- Status: authoring-admitted
- Objective: Assess whether the evidence “many VPCs and on-premises networks need hub routing” supports the owned resolution “use Transit Gateway”.
- Expected decision: use Transit Gateway
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
