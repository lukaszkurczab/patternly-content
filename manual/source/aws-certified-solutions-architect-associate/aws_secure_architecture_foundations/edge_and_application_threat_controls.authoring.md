# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / edge_and_application_threat_controls

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/edge_and_application_threat_controls.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:cloudfront_aws_waf_shield_alb_layer_matching_threat_traffic_entry_point:slot:alb-layer7-routing

- Status: authoring-admitted
- Objective: Assess whether the evidence “the need is host or path routing to healthy targets” supports the owned resolution “use an ALB”.
- Expected decision: use an ALB
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:cloudfront_aws_waf_shield_alb_layer_matching_threat_traffic_entry_point:slot:cloudfront-edge-delivery

- Status: authoring-admitted
- Objective: Assess whether the evidence “global clients need cached content and origin shielding” supports the owned resolution “place CloudFront at the edge”.
- Expected decision: place CloudFront at the edge
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:cloudfront_aws_waf_shield_alb_layer_matching_threat_traffic_entry_point:slot:entry-point-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “traffic moves from direct ALB access behind CloudFront” supports the owned resolution “move or compose controls at the actual request entry points”.
- Expected decision: move or compose controls at the actual request entry points
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:cloudfront_aws_waf_shield_alb_layer_matching_threat_traffic_entry_point:slot:layer-mismatch

- Status: authoring-admitted
- Objective: Assess whether the evidence “a Layer 4 traffic requirement is offered an HTTP-only control” supports the owned resolution “reject the mismatched enforcement layer”.
- Expected decision: reject the mismatched enforcement layer
- Decisive boundary: This slot owns the boundary established by a Layer 4 traffic requirement is offered an HTTP-only control; it resolves only to “reject the mismatched enforcement layer” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:cloudfront_aws_waf_shield_alb_layer_matching_threat_traffic_entry_point:slot:shield-ddos

- Status: authoring-admitted
- Objective: Assess whether the evidence “the threat is infrastructure or application DDoS” supports the owned resolution “use the appropriate Shield protection and resilient architecture”.
- Expected decision: use the appropriate Shield protection and resilient architecture
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:cloudfront_aws_waf_shield_alb_layer_matching_threat_traffic_entry_point:slot:waf-http-inspection

- Status: authoring-admitted
- Objective: Assess whether the evidence “the threat is a malicious HTTP request pattern” supports the owned resolution “attach AWS WAF at a supported web ACL integration”.
- Expected decision: attach AWS WAF at a supported web ACL integration
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:waf_rule_logic_known_malicious_http_request_characteristics_blocking_valid_traffic:slot:allow-known-path

- Status: authoring-admitted
- Objective: Assess whether the evidence “a broad block rule catches a valid health-check path” supports the owned resolution “add a narrowly justified exception or refine matching”.
- Expected decision: add a narrowly justified exception or refine matching
- Decisive boundary: This slot owns the boundary established by a broad block rule catches a valid health-check path; it resolves only to “add a narrowly justified exception or refine matching” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:waf_rule_logic_known_malicious_http_request_characteristics_blocking_valid_traffic:slot:count-before-block

- Status: authoring-admitted
- Objective: Assess whether the evidence “rule impact is uncertain in production traffic” supports the owned resolution “evaluate in count mode before enforcing block”.
- Expected decision: evaluate in count mode before enforcing block
- Decisive boundary: This slot owns the boundary established by rule impact is uncertain in production traffic; it resolves only to “evaluate in count mode before enforcing block” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:waf_rule_logic_known_malicious_http_request_characteristics_blocking_valid_traffic:slot:header-normalization

- Status: authoring-admitted
- Objective: Assess whether the evidence “the reliable malicious signal changes from URI to a header attribute” supports the owned resolution “change the match statement, not the protected-resource placement”.
- Expected decision: change the match statement, not the protected-resource placement
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:waf_rule_logic_known_malicious_http_request_characteristics_blocking_valid_traffic:slot:managed-rule-scope

- Status: authoring-admitted
- Objective: Assess whether the evidence “known malicious request classes should be blocked with maintained signatures” supports the owned resolution “use an applicable managed rule group and scope-down statement”.
- Expected decision: use an applicable managed rule group and scope-down statement
- Decisive boundary: This slot owns the boundary established by known malicious request classes should be blocked with maintained signatures; it resolves only to “use an applicable managed rule group and scope-down statement” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:waf_rule_logic_known_malicious_http_request_characteristics_blocking_valid_traffic:slot:priority-shadowing

- Status: authoring-admitted
- Objective: Assess whether the evidence “an earlier terminating rule prevents the intended later evaluation” supports the owned resolution “diagnose web ACL rule priority”.
- Expected decision: diagnose web ACL rule priority
- Decisive boundary: This slot owns the boundary established by an earlier terminating rule prevents the intended later evaluation; it resolves only to “diagnose web ACL rule priority” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:edge_and_application_threat_controls:waf_rule_logic_known_malicious_http_request_characteristics_blocking_valid_traffic:slot:rate-based-rule

- Status: authoring-admitted
- Objective: Assess whether the evidence “one client population exceeds an abusive request rate” supports the owned resolution “use a rate-based rule with an appropriate aggregation key”.
- Expected decision: use a rate-based rule with an appropriate aggregation key
- Decisive boundary: This slot owns the boundary established by one client population exceeds an abusive request rate; it resolves only to “use a rate-based rule with an appropriate aggregation key” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
