# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / vnet_subnet_ip_design

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/vnet_subnet_ip_design.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:vnet_subnet_ip_design:reserve_subnet_capacity_azure_services_future_scale:slot:reserve-capacity-for-private-endpoints

- Status: authoring-admitted
- Objective: Budget one private IP per private endpoint and room for the expected endpoint lifecycle.
- Expected decision: Place endpoints in a subnet with sufficient unallocated addresses.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vnet_subnet_ip_design:reserve_subnet_capacity_azure_services_future_scale:slot:reserve-dedicated-bastion-subnet-size

- Status: authoring-admitted
- Objective: Create the required AzureBastionSubnet with the documented minimum prefix for the chosen Bastion features and scale.
- Expected decision: Reserve the compliant dedicated subnet before deploying Bastion.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vnet_subnet_ip_design:reserve_subnet_capacity_azure_services_future_scale:slot:reserve-gateway-subnet-for-vpn-or-expressroute

- Status: authoring-admitted
- Objective: Reserve GatewaySubnet with capacity for the planned VPN or ExpressRoute gateway SKU and coexistence.
- Expected decision: Keep the subnet dedicated and large enough for planned gateway instances.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vnet_subnet_ip_design:vnet_subnet_cidr_allocation_workload_growth_service_delegation_hybrid_routing:slot:apply-subnet-delegation-for-platform-service

- Status: authoring-admitted
- Objective: Delegate a subnet only to the platform service that requires control over that subnet.
- Expected decision: Use a dedicated compatible subnet and avoid conflicting resource types.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vnet_subnet_ip_design:vnet_subnet_cidr_allocation_workload_growth_service_delegation_hybrid_routing:slot:calculate-nonoverlapping-vnet-address-space

- Status: authoring-admitted
- Objective: Choose VNet address space that does not overlap peered or hybrid networks that must route to it.
- Expected decision: Reserve a nonoverlapping prefix before deployment.
- Decisive boundary: Azure can create overlapping VNets, but they cannot provide the intended routed connectivity.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vnet_subnet_ip_design:vnet_subnet_cidr_allocation_workload_growth_service_delegation_hybrid_routing:slot:reserve-address-space-for-hybrid-peer-routes

- Status: authoring-admitted
- Objective: Leave contiguous unallocated address space for future subnets and advertised hybrid/peer routes.
- Expected decision: Preserve expansion without renumbering live workloads.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vnet_subnet_ip_design:vnet_subnet_cidr_allocation_workload_growth_service_delegation_hybrid_routing:slot:size-subnet-for-azure-reserved-addresses-and-growth

- Status: authoring-admitted
- Objective: Size each subnet after accounting for Azure-reserved addresses and expected instance/private-endpoint growth.
- Expected decision: Choose a prefix with enough usable addresses and expansion strategy.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
