# aws-certified-solutions-architect-associate / aws_network_data_and_cost_optimization / transfer_routing_nat_connectivity

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_network_data_and_cost_optimization/transfer_routing_nat_connectivity.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:nat_inter_inter_region_internet_egress_endpoint_charges_actual_packet_path:slot:endpoint-hourly-data

- Status: authoring-admitted
- Objective: Assess whether the evidence “traffic uses a priced interface endpoint” supports the owned resolution “include endpoint hourly and data processing charges”.
- Expected decision: include endpoint hourly and data processing charges
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:nat_inter_inter_region_internet_egress_endpoint_charges_actual_packet_path:slot:inter-az-path

- Status: authoring-admitted
- Objective: Assess whether the evidence “source and destination or middleboxes cross AZs” supports the owned resolution “include inter-AZ data transfer where priced”.
- Expected decision: include inter-AZ data transfer where priced
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:nat_inter_inter_region_internet_egress_endpoint_charges_actual_packet_path:slot:inter-region-path

- Status: authoring-admitted
- Objective: Assess whether the evidence “traffic crosses AWS Regions” supports the owned resolution “include inter-Region transfer”.
- Expected decision: include inter-Region transfer
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:nat_inter_inter_region_internet_egress_endpoint_charges_actual_packet_path:slot:internet-egress-path

- Status: authoring-admitted
- Objective: Assess whether the evidence “data leaves AWS to the internet” supports the owned resolution “include applicable internet data transfer out”.
- Expected decision: include applicable internet data transfer out
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:nat_inter_inter_region_internet_egress_endpoint_charges_actual_packet_path:slot:nat-processing-path

- Status: authoring-admitted
- Objective: Assess whether the evidence “private subnet traffic crosses a NAT Gateway” supports the owned resolution “include NAT processing and related transfer charges”.
- Expected decision: include NAT processing and related transfer charges
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:nat_inter_inter_region_internet_egress_endpoint_charges_actual_packet_path:slot:packet-cost-trace

- Status: authoring-admitted
- Objective: Assess whether the evidence “a data path cost is disputed” supports the owned resolution “trace every hop, AZ, Region, gateway, endpoint, and direction before pricing”.
- Expected decision: trace every hop, AZ, Region, gateway, endpoint, and direction before pricing
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:vpc_endpoints_same_placement_direct_routing_they_remove_justified_transfer_charge:slot:availability-tradeoff

- Status: authoring-admitted
- Objective: Assess whether the evidence “same-AZ placement would create a single-AZ dependency” supports the owned resolution “reject savings that violate availability”.
- Expected decision: reject savings that violate availability
- Decisive boundary: This slot owns the boundary established by same-AZ placement would create a single-AZ dependency; it resolves only to “reject savings that violate availability” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:vpc_endpoints_same_placement_direct_routing_they_remove_justified_transfer_charge:slot:direct-vpc-routing

- Status: authoring-admitted
- Objective: Assess whether the evidence “peered or transit traffic takes an unnecessary NAT path” supports the owned resolution “use direct private routing where topology permits”.
- Expected decision: use direct private routing where topology permits
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:vpc_endpoints_same_placement_direct_routing_they_remove_justified_transfer_charge:slot:interface-endpoint-economics

- Status: authoring-admitted
- Objective: Assess whether the evidence “an interface endpoint's fixed and processing charges exceed the avoided NAT or transfer cost” supports the owned resolution “reject the endpoint as a cost-only optimization”.
- Expected decision: reject the endpoint as a cost-only optimization
- Decisive boundary: This slot owns the boundary established by an interface endpoint's fixed and processing charges exceed the avoided NAT or transfer cost; it resolves only to “reject the endpoint as a cost-only optimization” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:vpc_endpoints_same_placement_direct_routing_they_remove_justified_transfer_charge:slot:s3-gateway-endpoint-cost

- Status: authoring-admitted
- Objective: Assess whether the evidence “private S3 traffic currently crosses NAT and the gateway endpoint meets policy needs” supports the owned resolution “route through the gateway endpoint”.
- Expected decision: route through the gateway endpoint
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:vpc_endpoints_same_placement_direct_routing_they_remove_justified_transfer_charge:slot:same-az-middlebox

- Status: authoring-admitted
- Objective: Assess whether the evidence “traffic crosses AZs only to reach a duplicated service” supports the owned resolution “place or route to a same-AZ endpoint where reliability remains intact”.
- Expected decision: place or route to a same-AZ endpoint where reliability remains intact
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:transfer_routing_nat_connectivity:vpc_endpoints_same_placement_direct_routing_they_remove_justified_transfer_charge:slot:traffic-volume-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “private service traffic grows materially” supports the owned resolution “recalculate endpoint versus NAT economics”.
- Expected decision: recalculate endpoint versus NAT economics
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
