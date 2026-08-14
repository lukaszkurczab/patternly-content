# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / ingress_egress_firewall_policy

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/ingress_egress_firewall_policy.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:enforce_ingress_egress_controls_hierarchical_firewall_policy_vpc_rules_right_scope:slot:administration-scope-transfer

- Status: authoring-admitted
- Objective: ingress egress firewall policy — administration scope constraint transfer: move to “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy” after “A rule that was local to one VPC must become mandatory across folders or the organization”, while distinguishing the different transfer “Use ingress for packets arriving at the target and egress for packets leaving it”.
- Expected decision: Transfer enforcement from a VPC rule to an associated hierarchical firewall policy.
- Decisive boundary: ingress egress firewall policy — administration scope: evidence “A rule that was local to one VPC must become mandatory across folders or the organization” is decisive for “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”. Evidence “Traffic direction is observed from the perspective of the target VM interface” instead supports the competing classification “Use ingress for packets arriving at the target and egress for packets leaving it”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:enforce_ingress_egress_controls_hierarchical_firewall_policy_vpc_rules_right_scope:slot:ingress-vs-egress-classification

- Status: authoring-admitted
- Objective: ingress egress firewall policy — ingress vs egress classification: use “Traffic direction is observed from the perspective of the target VM interface” to classify “Use ingress for packets arriving at the target and egress for packets leaving it”, while distinguishing the competing classification “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”.
- Expected decision: Use ingress for packets arriving at the target and egress for packets leaving it.
- Decisive boundary: ingress egress firewall policy — ingress vs egress: evidence “Traffic direction is observed from the perspective of the target VM interface” is decisive for “Use ingress for packets arriving at the target and egress for packets leaving it”. Evidence “A rule that was local to one VPC must become mandatory across folders or the organization” instead supports the competing transfer “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:enforce_ingress_egress_controls_hierarchical_firewall_policy_vpc_rules_right_scope:slot:organization-folder-policy-choice

- Status: authoring-admitted
- Objective: ingress egress firewall policy — organization folder policy decision: select “Associate a hierarchical policy at the organization or folder level” under “The control must apply consistently to all descendant projects and resist lower-level override” rather than the competing action “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”.
- Expected decision: Associate a hierarchical policy at the organization or folder level.
- Decisive boundary: ingress egress firewall policy — organization folder policy: evidence “The control must apply consistently to all descendant projects and resist lower-level override” is decisive for “Associate a hierarchical policy at the organization or folder level”. Evidence “A rule that was local to one VPC must become mandatory across folders or the organization” instead supports the competing transfer “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:enforce_ingress_egress_controls_hierarchical_firewall_policy_vpc_rules_right_scope:slot:policy-association-diagnosis

- Status: authoring-admitted
- Objective: ingress egress firewall policy — policy association failure diagnosis: trace “A hierarchical policy contains the intended rule but effective firewalls do not show it” to “Verify that the policy is associated with the organization or folder containing the target” instead of applying the competing remediation “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”.
- Expected decision: Verify that the policy is associated with the organization or folder containing the target.
- Decisive boundary: ingress egress firewall policy — policy association: evidence “A hierarchical policy contains the intended rule but effective firewalls do not show it” is decisive for “Verify that the policy is associated with the organization or folder containing the target”. Evidence “A rule that was local to one VPC must become mandatory across folders or the organization” instead supports the competing transfer “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:enforce_ingress_egress_controls_hierarchical_firewall_policy_vpc_rules_right_scope:slot:secure-tag-boundary

- Status: authoring-admitted
- Objective: ingress egress firewall policy — secure tag boundary test: determine that “Firewall targeting must follow centrally governed resource identity rather than mutable network tags” supports “Use supported secure tags in firewall policy rules, not instance network tags where unsupported” and has not crossed into “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”.
- Expected decision: Use supported secure tags in firewall policy rules, not instance network tags where unsupported.
- Decisive boundary: ingress egress firewall policy — secure tag: evidence “Firewall targeting must follow centrally governed resource identity rather than mutable network tags” is decisive for “Use supported secure tags in firewall policy rules, not instance network tags where unsupported”. Evidence “A rule that was local to one VPC must become mandatory across folders or the organization” instead supports the competing transfer “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:enforce_ingress_egress_controls_hierarchical_firewall_policy_vpc_rules_right_scope:slot:target-service-account-choice

- Status: authoring-admitted
- Objective: ingress egress firewall policy — target service account decision: select “Target the VM service account when the firewall surface supports it” under “The rule must apply to workload identity across changing VM addresses” rather than the competing action “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”.
- Expected decision: Target the VM service account when the firewall surface supports it.
- Decisive boundary: ingress egress firewall policy — target service account: evidence “The rule must apply to workload identity across changing VM addresses” is decisive for “Target the VM service account when the firewall surface supports it”. Evidence “A rule that was local to one VPC must become mandatory across folders or the organization” instead supports the competing transfer “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:enforce_ingress_egress_controls_hierarchical_firewall_policy_vpc_rules_right_scope:slot:vpc-rule-scope-choice

- Status: authoring-admitted
- Objective: ingress egress firewall policy — vpc rule scope decision: select “Use a VPC firewall rule at the network scope” under “A rule is intentionally owned by one VPC network and need not govern sibling projects” rather than the competing action “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”.
- Expected decision: Use a VPC firewall rule at the network scope.
- Decisive boundary: ingress egress firewall policy — vpc rule scope: evidence “A rule is intentionally owned by one VPC network and need not govern sibling projects” is decisive for “Use a VPC firewall rule at the network scope”. Evidence “A rule that was local to one VPC must become mandatory across folders or the organization” instead supports the competing transfer “Transfer enforcement from a VPC rule to an associated hierarchical firewall policy”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:evaluate_firewall_priority_target_implied_rules_diagnosing_reachability:slot:implied-rule-boundary

- Status: authoring-admitted
- Objective: ingress egress firewall policy — implied rule boundary test: determine that “No explicit rule matches the flow” supports “Apply the implied allow-egress or deny-ingress behavior at lowest priority, subject to higher-level policies” and has not crossed into “Apply the matching rule with the lowest priority number”.
- Expected decision: Apply the implied allow-egress or deny-ingress behavior at lowest priority, subject to higher-level policies.
- Decisive boundary: ingress egress firewall policy — implied rule: evidence “No explicit rule matches the flow” is decisive for “Apply the implied allow-egress or deny-ingress behavior at lowest priority, subject to higher-level policies”. Evidence “Multiple matching rules have different numeric priorities” instead supports the competing diagnosis “Apply the matching rule with the lowest priority number”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:evaluate_firewall_priority_target_implied_rules_diagnosing_reachability:slot:priority-order-diagnosis

- Status: authoring-admitted
- Objective: ingress egress firewall policy — priority order failure diagnosis: trace “Multiple matching rules have different numeric priorities” to “Apply the matching rule with the lowest priority number” instead of applying the competing remediation “Apply the implied allow-egress or deny-ingress behavior at lowest priority, subject to higher-level policies”.
- Expected decision: Apply the matching rule with the lowest priority number.
- Decisive boundary: ingress egress firewall policy — priority order: evidence “Multiple matching rules have different numeric priorities” is decisive for “Apply the matching rule with the lowest priority number”. Evidence “No explicit rule matches the flow” instead supports the competing boundary “Apply the implied allow-egress or deny-ingress behavior at lowest priority, subject to higher-level policies”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:evaluate_firewall_priority_target_implied_rules_diagnosing_reachability:slot:stateful-connection-boundary

- Status: authoring-admitted
- Objective: ingress egress firewall policy — stateful connection boundary test: determine that “Return packets belong to a connection initiated through an allowed flow” supports “Permit return traffic through stateful tracking; evaluate a new independent connection normally” and has not crossed into “Apply the implied allow-egress or deny-ingress behavior at lowest priority, subject to higher-level policies”.
- Expected decision: Permit return traffic through stateful tracking; evaluate a new independent connection normally.
- Decisive boundary: ingress egress firewall policy — stateful connection: evidence “Return packets belong to a connection initiated through an allowed flow” is decisive for “Permit return traffic through stateful tracking; evaluate a new independent connection normally”. Evidence “No explicit rule matches the flow” instead supports the competing boundary “Apply the implied allow-egress or deny-ingress behavior at lowest priority, subject to higher-level policies”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:evaluate_firewall_priority_target_implied_rules_diagnosing_reachability:slot:target-match-diagnosis

- Status: authoring-admitted
- Objective: ingress egress firewall policy — target match failure diagnosis: trace “A rule's direction, target, source/destination, protocol, or port does not match the failed flow” to “Find the first nonmatching component before changing action or priority” instead of applying the competing remediation “Apply the implied allow-egress or deny-ingress behavior at lowest priority, subject to higher-level policies”.
- Expected decision: Find the first nonmatching component before changing action or priority.
- Decisive boundary: ingress egress firewall policy — target match: evidence “A rule's direction, target, source/destination, protocol, or port does not match the failed flow” is decisive for “Find the first nonmatching component before changing action or priority”. Evidence “No explicit rule matches the flow” instead supports the competing boundary “Apply the implied allow-egress or deny-ingress behavior at lowest priority, subject to higher-level policies”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ingress_egress_firewall_policy:evaluate_firewall_priority_target_implied_rules_diagnosing_reachability:slot:traffic-change-transfer

- Status: authoring-admitted
- Objective: ingress egress firewall policy — traffic change constraint transfer: move to “Transfer diagnosis to the rule set that actually matches the changed flow” after “The failing traffic changes direction, target identity, protocol/port, or governing hierarchy”, while distinguishing the different transfer “Apply the implied allow-egress or deny-ingress behavior at lowest priority, subject to higher-level policies”.
- Expected decision: Transfer diagnosis to the rule set that actually matches the changed flow.
- Decisive boundary: ingress egress firewall policy — traffic change: evidence “The failing traffic changes direction, target identity, protocol/port, or governing hierarchy” is decisive for “Transfer diagnosis to the rule set that actually matches the changed flow”. Evidence “No explicit rule matches the flow” instead supports the competing boundary “Apply the implied allow-egress or deny-ingress behavior at lowest priority, subject to higher-level policies”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
