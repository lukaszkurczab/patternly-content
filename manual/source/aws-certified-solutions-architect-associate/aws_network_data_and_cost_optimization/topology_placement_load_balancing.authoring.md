# aws-certified-solutions-architect-associate / aws_network_data_and_cost_optimization / topology_placement_load_balancing

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_network_data_and_cost_optimization/topology_placement_load_balancing.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:alb_nlb_gwlb_based_layer_layer_static_appliance_insertion_needs:slot:alb-http-routing

- Status: authoring-admitted
- Objective: Assess whether the evidence “HTTP host, path, header, or method routing is required” supports the owned resolution “use ALB”.
- Expected decision: use ALB
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:alb_nlb_gwlb_based_layer_layer_static_appliance_insertion_needs:slot:gwlb-appliance

- Status: authoring-admitted
- Objective: Assess whether the evidence “transparent insertion and scaling of network appliances is required” supports the owned resolution “use GWLB”.
- Expected decision: use GWLB
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:alb_nlb_gwlb_based_layer_layer_static_appliance_insertion_needs:slot:health-protocol

- Status: authoring-admitted
- Objective: Assess whether the evidence “targets fail because the configured health check does not match the service” supports the owned resolution “diagnose load-balancer health configuration”.
- Expected decision: diagnose load-balancer health configuration
- Decisive boundary: This slot owns the boundary established by targets fail because the configured health check does not match the service; it resolves only to “diagnose load-balancer health configuration” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:alb_nlb_gwlb_based_layer_layer_static_appliance_insertion_needs:slot:nlb-layer4

- Status: authoring-admitted
- Objective: Assess whether the evidence “TCP, UDP, TLS pass-through, or static IP behavior is required” supports the owned resolution “use NLB”.
- Expected decision: use NLB
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:alb_nlb_gwlb_based_layer_layer_static_appliance_insertion_needs:slot:protocol-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “a TCP service adds HTTP content routing” supports the owned resolution “move from Layer 4 to an appropriate Layer 7 load balancer”.
- Expected decision: move from Layer 4 to an appropriate Layer 7 load balancer
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:alb_nlb_gwlb_based_layer_layer_static_appliance_insertion_needs:slot:static-ip-alb

- Status: authoring-admitted
- Objective: Assess whether the evidence “a design chooses ALB solely while requiring load-balancer static IPs” supports the owned resolution “reject the unsupported property or add the documented fronting pattern”.
- Expected decision: reject the unsupported property or add the documented fronting pattern
- Decisive boundary: This slot owns the boundary established by a design chooses ALB solely while requiring load-balancer static IPs; it resolves only to “reject the unsupported property or add the documented fronting pattern” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:region_subnet_target_placement_client_latency_failure_requirements:slot:client-geography-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “the client population becomes global” supports the owned resolution “re-evaluate Region and edge placement”.
- Expected decision: re-evaluate Region and edge placement
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:region_subnet_target_placement_client_latency_failure_requirements:slot:multi-az-targets

- Status: authoring-admitted
- Objective: Assess whether the evidence “the service must survive one AZ failure” supports the owned resolution “place independent targets across AZs”.
- Expected decision: place independent targets across AZs
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:region_subnet_target_placement_client_latency_failure_requirements:slot:public-private-subnets

- Status: authoring-admitted
- Objective: Assess whether the evidence “only ingress components need direct internet routing” supports the owned resolution “separate public and private subnet roles”.
- Expected decision: separate public and private subnet roles
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:region_subnet_target_placement_client_latency_failure_requirements:slot:region-latency

- Status: authoring-admitted
- Objective: Assess whether the evidence “users need a Region close to their geography and compliant data location” supports the owned resolution “choose the Region from latency and residency”.
- Expected decision: choose the Region from latency and residency
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:region_subnet_target_placement_client_latency_failure_requirements:slot:single-az-cost

- Status: authoring-admitted
- Objective: Assess whether the evidence “placing every component in one AZ saves transfer cost but violates availability” supports the owned resolution “reject the placement against the failure requirement”.
- Expected decision: reject the placement against the failure requirement
- Decisive boundary: This slot owns the boundary established by placing every component in one AZ saves transfer cost but violates availability; it resolves only to “reject the placement against the failure requirement” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:topology_placement_load_balancing:region_subnet_target_placement_client_latency_failure_requirements:slot:target-locality

- Status: authoring-admitted
- Objective: Assess whether the evidence “targets depend on zonal storage or downstream capacity” supports the owned resolution “align target placement with zonal dependencies”.
- Expected decision: align target placement with zonal dependencies
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
