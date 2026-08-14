# google-cloud-associate-cloud-engineer / setup_environment / location_network_tier_load_balancing

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 13
- Authoring-admitted slots: 13
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/setup_environment/location_network_tier_load_balancing.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:premium_standard_network_tier_load_balancing_type_traffic_path:slot:application-vs-network-load-balancer

- Status: authoring-admitted
- Objective: Choose an Application Load Balancer for HTTP-aware routing and a Network Load Balancer for IP-protocol traffic.
- Expected decision: Use an Application Load Balancer when HTTP semantics drive routing; use a Network Load Balancer when transport or network-layer behavior is required.
- Decisive boundary: Layer 7 HTTP processing versus Layer 4 network transport is the primary family boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:premium_standard_network_tier_load_balancing_type_traffic_path:slot:backend-health-boundary

- Status: authoring-admitted
- Objective: Diagnose healthy frontend reachability with unavailable backends by evaluating health-check results and backend eligibility.
- Expected decision: Repair the backend health path or serving configuration rather than replacing the frontend tier or IP scheme.
- Decisive boundary: A configured frontend cannot serve through backends that fail the applicable health check or are otherwise ineligible.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:premium_standard_network_tier_load_balancing_type_traffic_path:slot:global-vs-regional-load-balancer

- Status: authoring-admitted
- Objective: Select global or regional load-balancer scope from client distribution, backend placement, and failover requirements.
- Expected decision: Use a global product when one anycast frontend and cross-region behavior are required; use a regional product when the service and traffic boundary must stay regional.
- Decisive boundary: The forwarding-rule and backend scope supported by the chosen product must match the required geographic traffic path.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:premium_standard_network_tier_load_balancing_type_traffic_path:slot:internal-vs-external-scheme

- Status: authoring-admitted
- Objective: Choose an internal load-balancing scheme for private VPC consumers and an external scheme for internet-reachable clients.
- Expected decision: Use an internal frontend when consumers reach the service through private networking; expose an external frontend only for approved internet ingress.
- Decisive boundary: Frontend accessibility—not backend private addressing—distinguishes internal from external load balancing.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:premium_standard_network_tier_load_balancing_type_traffic_path:slot:premium-vs-standard-tier-choice

- Status: authoring-admitted
- Objective: Choose Premium or Standard Network Tier from the required Google backbone path, geographic scope, performance, and cost.
- Expected decision: Use Premium for Google's global backbone and global capabilities; use Standard when regional internet routing and its product limitations satisfy the workload.
- Decisive boundary: Network Tier controls the external traffic path and supported scope; it is not a backend machine-performance tier.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:premium_standard_network_tier_load_balancing_type_traffic_path:slot:proxy-vs-passthrough-classification

- Status: authoring-admitted
- Objective: Classify whether the load balancer should terminate and proxy connections or preserve a passthrough packet path to backends.
- Expected decision: Choose a proxy product when the load balancer must terminate connections and apply proxy features; choose passthrough when backends must receive load-balanced packets without proxy termination.
- Decisive boundary: Connection termination and packet handling, not only protocol layer, establish the proxy-versus-passthrough boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:premium_standard_network_tier_load_balancing_type_traffic_path:slot:traffic-path-diagnosis

- Status: authoring-admitted
- Objective: Trace a load-balanced request through frontend, forwarding rule, proxy or packet path, backend service, health check, and backend.
- Expected decision: Identify the first component whose scope, protocol, or health state breaks the documented traffic path.
- Decisive boundary: Each request must match a frontend and forwarding rule before a supported backend path and healthy endpoint can serve it.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:premium_standard_network_tier_load_balancing_type_traffic_path:slot:traffic-requirement-transfer

- Status: authoring-admitted
- Objective: Re-run load-balancer and Network Tier selection when protocol, client scope, or geographic path changes.
- Expected decision: Change only the dimensions whose documented boundary was crossed while keeping compatible choices intact.
- Decisive boundary: A transfer requires a changed traffic property that the incumbent scheme, family, scope, or tier cannot satisfy.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:resources_region_zone_latency_resilience_requirements:slot:latency-placement-choice

- Status: authoring-admitted
- Objective: Place latency-sensitive resources near their users and dependent services without violating resilience requirements.
- Expected decision: Choose a region that meets the latency path, then distribute zonal resources according to the required availability design.
- Decisive boundary: Placement must satisfy the complete request path and resilience objective, not a single map distance.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:resources_region_zone_latency_resilience_requirements:slot:product-location-availability-diagnosis

- Status: authoring-admitted
- Objective: Diagnose provisioning failure when a product, machine type, or feature is unavailable in the selected region or zone.
- Expected decision: Choose a supported location or change the product configuration; do not treat location incompatibility as an IAM defect.
- Decisive boundary: A location-availability error is resolved by the product's geographic support matrix, whereas quota evidence shows an available product with insufficient allowance.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:resources_region_zone_latency_resilience_requirements:slot:resilience-requirement-transfer

- Status: authoring-admitted
- Objective: Change resource placement when the required surviving failure domain expands or contracts.
- Expected decision: Move from zonal to regional or multi-region design only when the availability objective requires survival beyond one zone.
- Decisive boundary: The tolerated failure scope and recovery target determine the minimum geographic topology.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:resources_region_zone_latency_resilience_requirements:slot:resource-location-classification

- Status: authoring-admitted
- Objective: Classify a Google Cloud resource as global, regional, or zonal before designing dependencies and failover.
- Expected decision: Use the documented resource scope to determine compatible references and the blast radius of its location.
- Decisive boundary: Global, regional, and zonal are properties of each resource type, not interchangeable deployment labels.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:location_network_tier_load_balancing:resources_region_zone_latency_resilience_requirements:slot:zonal-failure-boundary

- Status: authoring-admitted
- Objective: Identify which resources become unavailable when one zone fails and which regional resources remain available.
- Expected decision: Treat zonal resources and single-zone dependencies as inside the failure domain; do not assume regional survival for them.
- Decisive boundary: Actual resource and replica scope defines the zone-failure boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
