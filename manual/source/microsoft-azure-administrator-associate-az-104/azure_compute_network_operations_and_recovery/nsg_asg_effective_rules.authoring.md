# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / nsg_asg_effective_rules

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/nsg_asg_effective_rules.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:nsg_asg_effective_rules:classify_nsg_asg_effective_rules_evidence:slot:calculate-effective-rules-from-subnet-and-nic-nsg

- Status: authoring-admitted
- Objective: Require both subnet and NIC effective rules to allow the flow when NSGs exist at both scopes.
- Expected decision: Locate the denying scope rather than editing only one NSG.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:nsg_asg_effective_rules:classify_nsg_asg_effective_rules_evidence:slot:calculate-nsg-rule-priority-first-match

- Status: authoring-admitted
- Objective: Evaluate custom and default NSG rules in ascending priority until the first five-tuple match.
- Expected decision: Apply the first matching rule's allow or deny action.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:nsg_asg_effective_rules:classify_nsg_asg_effective_rules_evidence:slot:distinguish-inbound-from-outbound-rule

- Status: authoring-admitted
- Objective: Evaluate source-side outbound and destination-side inbound rules in the correct direction.
- Expected decision: Change the rule on the direction where matching denial occurs.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:nsg_asg_effective_rules:classify_nsg_asg_effective_rules_evidence:slot:select-asg-for-workload-membership

- Status: authoring-admitted
- Objective: Use an application security group to represent NIC workload membership in NSG rules.
- Expected decision: Reference the ASG rather than maintaining changing IP lists.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:nsg_asg_effective_rules:classify_nsg_asg_effective_rules_evidence:slot:validate-stateful-return-traffic-behavior

- Status: authoring-admitted
- Objective: Account for NSG statefulness so response traffic for an allowed flow need not be separately allowed as a new connection.
- Expected decision: Troubleshoot new flows separately from return traffic.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
