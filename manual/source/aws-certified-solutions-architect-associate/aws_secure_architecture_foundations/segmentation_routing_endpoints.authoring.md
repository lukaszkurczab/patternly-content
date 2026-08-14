# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / segmentation_routing_endpoints

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/segmentation_routing_endpoints.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:segmentation_routing_endpoints:gateway_interface_vpc_endpoints_traffic_must_stay_private_supported_aws_services:slot:cross-region-service

- Status: authoring-admitted
- Objective: Assess whether the evidence “the endpoint and service access path change Regions” supports the owned resolution “re-evaluate endpoint support and routing”.
- Expected decision: re-evaluate endpoint support and routing
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:segmentation_routing_endpoints:gateway_interface_vpc_endpoints_traffic_must_stay_private_supported_aws_services:slot:endpoint-policy

- Status: authoring-admitted
- Objective: Assess whether the evidence “network connectivity exists but the endpoint policy denies the action” supports the owned resolution “diagnose authorization at the endpoint”.
- Expected decision: diagnose authorization at the endpoint
- Decisive boundary: This slot owns the boundary established by network connectivity exists but the endpoint policy denies the action; it resolves only to “diagnose authorization at the endpoint” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:segmentation_routing_endpoints:gateway_interface_vpc_endpoints_traffic_must_stay_private_supported_aws_services:slot:interface-endpoint

- Status: authoring-admitted
- Objective: Assess whether the evidence “private access targets a supported service through endpoint network interfaces” supports the owned resolution “use an interface endpoint”.
- Expected decision: use an interface endpoint
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:segmentation_routing_endpoints:gateway_interface_vpc_endpoints_traffic_must_stay_private_supported_aws_services:slot:private-dns

- Status: authoring-admitted
- Objective: Assess whether the evidence “clients use public service DNS names with an interface endpoint” supports the owned resolution “configure and verify private DNS behavior”.
- Expected decision: configure and verify private DNS behavior
- Decisive boundary: This slot owns the boundary established by clients use public service DNS names with an interface endpoint; it resolves only to “configure and verify private DNS behavior” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:segmentation_routing_endpoints:gateway_interface_vpc_endpoints_traffic_must_stay_private_supported_aws_services:slot:s3-gateway-endpoint

- Status: authoring-admitted
- Objective: Assess whether the evidence “private VPC access targets S3 and route-table integration is acceptable” supports the owned resolution “use an S3 gateway endpoint”.
- Expected decision: use an S3 gateway endpoint
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:segmentation_routing_endpoints:gateway_interface_vpc_endpoints_traffic_must_stay_private_supported_aws_services:slot:unsupported-service

- Status: authoring-admitted
- Objective: Assess whether the evidence “the desired service has no applicable endpoint type” supports the owned resolution “reject an endpoint-only design”.
- Expected decision: reject an endpoint-only design
- Decisive boundary: This slot owns the boundary established by the desired service has no applicable endpoint type; it resolves only to “reject an endpoint-only design” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:segmentation_routing_endpoints:route_table_reachability_security_group_network_acl_authorization:slot:missing-route

- Status: authoring-admitted
- Objective: Assess whether the evidence “the subnet route table has no path to the destination” supports the owned resolution “diagnose reachability before authorization”.
- Expected decision: diagnose reachability before authorization
- Decisive boundary: This slot owns the boundary established by the subnet route table has no path to the destination; it resolves only to “diagnose reachability before authorization” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:segmentation_routing_endpoints:route_table_reachability_security_group_network_acl_authorization:slot:nacl-return-path

- Status: authoring-admitted
- Objective: Assess whether the evidence “the request path is allowed but the stateless return path is blocked” supports the owned resolution “diagnose the network ACL”.
- Expected decision: diagnose the network ACL
- Decisive boundary: This slot owns the boundary established by the request path is allowed but the stateless return path is blocked; it resolves only to “diagnose the network ACL” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:segmentation_routing_endpoints:route_table_reachability_security_group_network_acl_authorization:slot:packet-path-order

- Status: authoring-admitted
- Objective: Assess whether the evidence “a flow fails across subnet boundaries” supports the owned resolution “trace DNS, routes, security groups, NACLs, and target health in order”.
- Expected decision: trace DNS, routes, security groups, NACLs, and target health in order
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:segmentation_routing_endpoints:route_table_reachability_security_group_network_acl_authorization:slot:security-group-ingress

- Status: authoring-admitted
- Objective: Assess whether the evidence “the route exists but the destination security group lacks stateful ingress” supports the owned resolution “diagnose security-group authorization”.
- Expected decision: diagnose security-group authorization
- Decisive boundary: This slot owns the boundary established by the route exists but the destination security group lacks stateful ingress; it resolves only to “diagnose security-group authorization” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:segmentation_routing_endpoints:route_table_reachability_security_group_network_acl_authorization:slot:stateful-vs-stateless

- Status: authoring-admitted
- Objective: Assess whether the evidence “a return flow is assumed to need an explicit security-group egress rule solely because the NACL does” supports the owned resolution “apply the stateful security-group boundary”.
- Expected decision: apply the stateful security-group boundary
- Decisive boundary: This slot owns the boundary established by a return flow is assumed to need an explicit security-group egress rule solely because the NACL does; it resolves only to “apply the stateful security-group boundary” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
