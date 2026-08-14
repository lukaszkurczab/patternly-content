# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / failure_domains_and_spof

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 6
- Authoring-admitted slots: 6
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/failure_domains_and_spof.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:failure_domains_and_spof:classify_failure_domains_and_spof_evidence:slot:az-failure-domain

- Status: authoring-admitted
- Objective: Assess whether the evidence “targets span independent Availability Zones” supports the owned resolution “match redundancy to AZ loss”.
- Expected decision: match redundancy to AZ loss
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:failure_domains_and_spof:classify_failure_domains_and_spof_evidence:slot:control-plane-dependency

- Status: authoring-admitted
- Objective: Assess whether the evidence “data-plane replicas share one required deployment or identity dependency” supports the owned resolution “include that shared dependency in failure analysis”.
- Expected decision: include that shared dependency in failure analysis
- Decisive boundary: This slot owns the boundary established by data-plane replicas share one required deployment or identity dependency; it resolves only to “include that shared dependency in failure analysis” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:failure_domains_and_spof:classify_failure_domains_and_spof_evidence:slot:instance-failure-domain

- Status: authoring-admitted
- Objective: Assess whether the evidence “replicas on distinct instances but one host can fail” supports the owned resolution “match redundancy to instance loss”.
- Expected decision: match redundancy to instance loss
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:failure_domains_and_spof:classify_failure_domains_and_spof_evidence:slot:region-failure-domain

- Status: authoring-admitted
- Objective: Assess whether the evidence “recovery must survive a Regional disruption” supports the owned resolution “use a cross-Region recovery design”.
- Expected decision: use a cross-Region recovery design
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:failure_domains_and_spof:classify_failure_domains_and_spof_evidence:slot:required-domain-expansion

- Status: authoring-admitted
- Objective: Assess whether the evidence “the required failure domain grows from AZ to Region” supports the owned resolution “expand redundancy rather than adding same-AZ replicas”.
- Expected decision: expand redundancy rather than adding same-AZ replicas
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:failure_domains_and_spof:classify_failure_domains_and_spof_evidence:slot:shared-database-spof

- Status: authoring-admitted
- Objective: Assess whether the evidence “stateless frontends are redundant but all depend on one nonredundant database” supports the owned resolution “identify the remaining single point of failure”.
- Expected decision: identify the remaining single point of failure
- Decisive boundary: This slot owns the boundary established by stateless frontends are redundant but all depend on one nonredundant database; it resolves only to “identify the remaining single point of failure” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
