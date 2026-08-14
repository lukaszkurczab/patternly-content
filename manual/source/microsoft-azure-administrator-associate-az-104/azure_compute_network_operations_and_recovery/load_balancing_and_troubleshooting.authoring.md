# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / load_balancing_and_troubleshooting

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/load_balancing_and_troubleshooting.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:load_balancing_and_troubleshooting:health_probes_rules_backend_reachability_changing_frontend_configuration:slot:diagnose-backend-unhealthy-from-probe-response

- Status: authoring-admitted
- Objective: Use backend health and probe response to distinguish application unready state from frontend configuration.
- Expected decision: Repair the backend listener/application before changing the frontend IP.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:load_balancing_and_troubleshooting:health_probes_rules_backend_reachability_changing_frontend_configuration:slot:diagnose-nsg-blocking-probe-traffic

- Status: authoring-admitted
- Objective: Recognize effective security rules denying the platform probe or frontend-to-backend flow.
- Expected decision: Allow only the required probe/data path at the denying NSG scope.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:load_balancing_and_troubleshooting:health_probes_rules_backend_reachability_changing_frontend_configuration:slot:validate-load-balancing-rule-to-backend-pool

- Status: authoring-admitted
- Objective: Trace frontend IP/port and protocol through the rule/listener to the intended backend pool and backend port.
- Expected decision: Correct the misbound rule or pool without replacing healthy backends.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:load_balancing_and_troubleshooting:health_probes_rules_backend_reachability_changing_frontend_configuration:slot:validate-probe-protocol-port-and-path

- Status: authoring-admitted
- Objective: Match probe protocol, port, host/path, interval, and success response to the backend's readiness endpoint.
- Expected decision: Correct the probe so healthy serving instances are marked available.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:load_balancing_and_troubleshooting:load_balancer_application_gateway_front_door_traffic_manager_protocol_layer_global_routi:slot:select-application-gateway-for-regional-layer7-and-waf

- Status: authoring-admitted
- Objective: Choose Application Gateway for regional HTTP/S reverse proxy, URL/host routing, TLS termination, or WAF.
- Expected decision: Configure listeners, rules, probes, and backend settings on Application Gateway.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:load_balancing_and_troubleshooting:load_balancer_application_gateway_front_door_traffic_manager_protocol_layer_global_routi:slot:select-front-door-for-global-layer7-edge-routing

- Status: authoring-admitted
- Objective: Choose Front Door for global HTTP/S edge entry, acceleration, health-based origin routing, or edge WAF.
- Expected decision: Publish the application through a Front Door profile and origins.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:load_balancing_and_troubleshooting:load_balancer_application_gateway_front_door_traffic_manager_protocol_layer_global_routi:slot:select-load-balancer-for-regional-layer4-traffic

- Status: authoring-admitted
- Objective: Choose Azure Load Balancer for regional TCP/UDP distribution that does not require HTTP routing or WAF inspection.
- Expected decision: Use a public or internal Load Balancer with the required frontend and rule.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:load_balancing_and_troubleshooting:load_balancer_application_gateway_front_door_traffic_manager_protocol_layer_global_routi:slot:select-traffic-manager-for-dns-based-global-routing

- Status: authoring-admitted
- Objective: Choose Traffic Manager when DNS should direct clients among endpoints without proxying application traffic.
- Expected decision: Select the routing method and accept DNS caching/TTL behavior.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
