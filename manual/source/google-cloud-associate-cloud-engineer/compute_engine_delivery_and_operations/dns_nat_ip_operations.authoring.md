# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / dns_nat_ip_operations

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/dns_nat_ip_operations.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:cloud_dns_private_zones_nat_external_addresses_name_resolution_egress_path:slot:dns-forwarding-boundary

- Status: authoring-admitted
- Objective: dns nat ip operations — dns forwarding boundary test: determine that “Cloud workloads must resolve on-premises names or on-premises clients must resolve private Cloud DNS records” supports “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries” and has not crossed into “Transfer to Public NAT while preserving a default-internet-gateway route; remove NAT dependence if an external IP is required directly”.
- Expected decision: Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries.
- Decisive boundary: dns nat ip operations — dns forwarding: evidence “Cloud workloads must resolve on-premises names or on-premises clients must resolve private Cloud DNS records” is decisive for “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”. Evidence “A workload changes from having an external IP to requiring outbound-only internet access without one” instead supports the competing transfer “Transfer to Public NAT while preserving a default-internet-gateway route; remove NAT dependence if an external IP is required directly”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:cloud_dns_private_zones_nat_external_addresses_name_resolution_egress_path:slot:egress-requirement-transfer

- Status: authoring-admitted
- Objective: dns nat ip operations — egress requirement constraint transfer: move to “Transfer to Public NAT while preserving a default-internet-gateway route; remove NAT dependence if an external IP is required directly” after “A workload changes from having an external IP to requiring outbound-only internet access without one”, while distinguishing the different transfer “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”.
- Expected decision: Transfer to Public NAT while preserving a default-internet-gateway route; remove NAT dependence if an external IP is required directly.
- Decisive boundary: dns nat ip operations — egress requirement: evidence “A workload changes from having an external IP to requiring outbound-only internet access without one” is decisive for “Transfer to Public NAT while preserving a default-internet-gateway route; remove NAT dependence if an external IP is required directly”. Evidence “Cloud workloads must resolve on-premises names or on-premises clients must resolve private Cloud DNS records” instead supports the competing boundary “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:cloud_dns_private_zones_nat_external_addresses_name_resolution_egress_path:slot:internal-vs-external-address

- Status: authoring-admitted
- Objective: dns nat ip operations — internal vs external address capability recognition: connect “The endpoint must be reachable only inside VPC-connected networks or directly from the internet” to “Choose an internal or external address according to the reachability boundary” and reject the neighboring capability response “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”.
- Expected decision: Choose an internal or external address according to the reachability boundary.
- Decisive boundary: dns nat ip operations — internal vs external address: evidence “The endpoint must be reachable only inside VPC-connected networks or directly from the internet” is decisive for “Choose an internal or external address according to the reachability boundary”. Evidence “Cloud workloads must resolve on-premises names or on-premises clients must resolve private Cloud DNS records” instead supports the competing boundary “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:cloud_dns_private_zones_nat_external_addresses_name_resolution_egress_path:slot:nat-egress-choice

- Status: authoring-admitted
- Objective: dns nat ip operations — nat egress decision: select “Use Public NAT for eligible subnets and routes” under “VMs without external IPs need outbound internet access and return traffic only” rather than the competing action “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”.
- Expected decision: Use Public NAT for eligible subnets and routes.
- Decisive boundary: dns nat ip operations — nat egress: evidence “VMs without external IPs need outbound internet access and return traffic only” is decisive for “Use Public NAT for eligible subnets and routes”. Evidence “Cloud workloads must resolve on-premises names or on-premises clients must resolve private Cloud DNS records” instead supports the competing boundary “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:cloud_dns_private_zones_nat_external_addresses_name_resolution_egress_path:slot:private-zone-visibility-boundary

- Status: authoring-admitted
- Objective: dns nat ip operations — private zone visibility boundary test: determine that “A DNS name must resolve only for explicitly authorized VPC networks” supports “Use a private managed zone and authorize the intended networks” and has not crossed into “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”.
- Expected decision: Use a private managed zone and authorize the intended networks.
- Decisive boundary: dns nat ip operations — private zone visibility: evidence “A DNS name must resolve only for explicitly authorized VPC networks” is decisive for “Use a private managed zone and authorize the intended networks”. Evidence “Cloud workloads must resolve on-premises names or on-premises clients must resolve private Cloud DNS records” instead supports the competing boundary “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:cloud_dns_private_zones_nat_external_addresses_name_resolution_egress_path:slot:public-vs-private-dns-choice

- Status: authoring-admitted
- Objective: dns nat ip operations — public vs private dns decision: select “Choose a public or private managed zone from the query audience” under “The same namespace must be authoritative on the public internet or visible only to selected VPCs” rather than the competing action “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”.
- Expected decision: Choose a public or private managed zone from the query audience.
- Decisive boundary: dns nat ip operations — public vs private dns: evidence “The same namespace must be authoritative on the public internet or visible only to selected VPCs” is decisive for “Choose a public or private managed zone from the query audience”. Evidence “Cloud workloads must resolve on-premises names or on-premises clients must resolve private Cloud DNS records” instead supports the competing boundary “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:cloud_dns_private_zones_nat_external_addresses_name_resolution_egress_path:slot:static-vs-ephemeral-address

- Status: authoring-admitted
- Objective: dns nat ip operations — static vs ephemeral address capability recognition: connect “A service endpoint must survive instance replacement or address reassignment” to “Reserve a static address; use ephemeral only when identity may change with the resource lifecycle” and reject the neighboring capability response “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”.
- Expected decision: Reserve a static address; use ephemeral only when identity may change with the resource lifecycle.
- Decisive boundary: dns nat ip operations — static vs ephemeral address: evidence “A service endpoint must survive instance replacement or address reassignment” is decisive for “Reserve a static address; use ephemeral only when identity may change with the resource lifecycle”. Evidence “Cloud workloads must resolve on-premises names or on-premises clients must resolve private Cloud DNS records” instead supports the competing boundary “Use outbound forwarding for VPC-to-target resolvers and inbound forwarding for on-premises-to-Cloud DNS queries”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:nat_address_port_dns_resolution_evidence_separately:slot:dns-resolution-diagnosis

- Status: authoring-admitted
- Objective: dns nat ip operations — dns resolution failure diagnosis: trace “Name resolution returns NXDOMAIN, SERVFAIL, or an unexpected answer while IP connectivity is otherwise available” to “Inspect zone visibility, resolution order, forwarding target reachability, and record data” instead of applying the competing remediation “Add NAT IP capacity or reduce per-VM port demand after measuring usage”.
- Expected decision: Inspect zone visibility, resolution order, forwarding target reachability, and record data.
- Decisive boundary: dns nat ip operations — dns resolution: evidence “Name resolution returns NXDOMAIN, SERVFAIL, or an unexpected answer while IP connectivity is otherwise available” is decisive for “Inspect zone visibility, resolution order, forwarding target reachability, and record data”. Evidence “The nat_allocation_failed metric is true or the console reports insufficient NAT IP addresses” instead supports the competing diagnosis “Add NAT IP capacity or reduce per-VM port demand after measuring usage”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:nat_address_port_dns_resolution_evidence_separately:slot:nat-address-allocation-diagnosis

- Status: authoring-admitted
- Objective: dns nat ip operations — nat address allocation failure diagnosis: trace “The nat_allocation_failed metric is true or the console reports insufficient NAT IP addresses” to “Add NAT IP capacity or reduce per-VM port demand after measuring usage” instead of applying the competing remediation “Inspect zone visibility, resolution order, forwarding target reachability, and record data”.
- Expected decision: Add NAT IP capacity or reduce per-VM port demand after measuring usage.
- Decisive boundary: dns nat ip operations — nat address allocation: evidence “The nat_allocation_failed metric is true or the console reports insufficient NAT IP addresses” is decisive for “Add NAT IP capacity or reduce per-VM port demand after measuring usage”. Evidence “Name resolution returns NXDOMAIN, SERVFAIL, or an unexpected answer while IP connectivity is otherwise available” instead supports the competing diagnosis “Inspect zone visibility, resolution order, forwarding target reachability, and record data”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:nat_address_port_dns_resolution_evidence_separately:slot:nat-port-exhaustion-diagnosis

- Status: authoring-admitted
- Objective: dns nat ip operations — nat port exhaustion failure diagnosis: trace “Packets drop with OUT_OF_RESOURCES while connection bursts consume available source IP/port tuples” to “Tune port allocation or add NAT IP capacity using port_usage evidence” instead of applying the competing remediation “Inspect zone visibility, resolution order, forwarding target reachability, and record data”.
- Expected decision: Tune port allocation or add NAT IP capacity using port_usage evidence.
- Decisive boundary: dns nat ip operations — nat port exhaustion: evidence “Packets drop with OUT_OF_RESOURCES while connection bursts consume available source IP/port tuples” is decisive for “Tune port allocation or add NAT IP capacity using port_usage evidence”. Evidence “Name resolution returns NXDOMAIN, SERVFAIL, or an unexpected answer while IP connectivity is otherwise available” instead supports the competing diagnosis “Inspect zone visibility, resolution order, forwarding target reachability, and record data”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:nat_address_port_dns_resolution_evidence_separately:slot:route-before-nat-boundary

- Status: authoring-admitted
- Objective: dns nat ip operations — route before nat boundary test: determine that “A Public NAT gateway exists but egress follows a custom default route to VPN, appliance, or another next hop” supports “Restore an eligible default-internet-gateway route for traffic that should use Public NAT” and has not crossed into “Inspect zone visibility, resolution order, forwarding target reachability, and record data”.
- Expected decision: Restore an eligible default-internet-gateway route for traffic that should use Public NAT.
- Decisive boundary: dns nat ip operations — route before nat: evidence “A Public NAT gateway exists but egress follows a custom default route to VPN, appliance, or another next hop” is decisive for “Restore an eligible default-internet-gateway route for traffic that should use Public NAT”. Evidence “Name resolution returns NXDOMAIN, SERVFAIL, or an unexpected answer while IP connectivity is otherwise available” instead supports the competing diagnosis “Inspect zone visibility, resolution order, forwarding target reachability, and record data”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:dns_nat_ip_operations:nat_address_port_dns_resolution_evidence_separately:slot:symptom-change-transfer

- Status: authoring-admitted
- Objective: dns nat ip operations — symptom change constraint transfer: move to “Transfer diagnosis to DNS, routing, NAT capacity, or IP reservation based on the changed evidence” after “The symptom changes among name-resolution failure, no eligible route, NAT allocation failure, and address-lifecycle breakage”, while distinguishing the different transfer “Inspect zone visibility, resolution order, forwarding target reachability, and record data”.
- Expected decision: Transfer diagnosis to DNS, routing, NAT capacity, or IP reservation based on the changed evidence.
- Decisive boundary: dns nat ip operations — symptom change: evidence “The symptom changes among name-resolution failure, no eligible route, NAT allocation failure, and address-lifecycle breakage” is decisive for “Transfer diagnosis to DNS, routing, NAT capacity, or IP reservation based on the changed evidence”. Evidence “Name resolution returns NXDOMAIN, SERVFAIL, or an unexpected answer while IP connectivity is otherwise available” instead supports the competing diagnosis “Inspect zone visibility, resolution order, forwarding target reachability, and record data”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
