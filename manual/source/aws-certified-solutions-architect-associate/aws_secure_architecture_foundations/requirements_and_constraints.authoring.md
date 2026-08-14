# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / requirements_and_constraints

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 6
- Authoring-admitted slots: 6
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/requirements_and_constraints.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:requirements_and_constraints:classify_requirements_and_constraints_evidence:slot:conflicting-durability-and-cost

- Status: authoring-admitted
- Objective: Assess whether the evidence “durability requires cross-Region copies while budget forbids the transfer and storage cost” supports the owned resolution “surface the conflict instead of pretending both are independently satisfiable”.
- Expected decision: surface the conflict instead of pretending both are independently satisfiable
- Decisive boundary: This slot owns the boundary established by durability requires cross-Region copies while budget forbids the transfer and storage cost; it resolves only to “surface the conflict instead of pretending both are independently satisfiable” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:requirements_and_constraints:classify_requirements_and_constraints_evidence:slot:constraint-register

- Status: authoring-admitted
- Objective: Assess whether the evidence “requirements arrive as mixed wishes, assumptions, and hard limits” supports the owned resolution “order elicitation, validation, conflict detection, and decision recording”.
- Expected decision: order elicitation, validation, conflict detection, and decision recording
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:requirements_and_constraints:classify_requirements_and_constraints_evidence:slot:latency-priority

- Status: authoring-admitted
- Objective: Assess whether the evidence “latency SLO outranks cost after an explicit product priority is supplied” supports the owned resolution “select the architecture that satisfies latency and record the cost tradeoff”.
- Expected decision: select the architecture that satisfies latency and record the cost tradeoff
- Decisive boundary: This slot owns the boundary established by latency SLO outranks cost after an explicit product priority is supplied; it resolves only to “select the architecture that satisfies latency and record the cost tradeoff” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:requirements_and_constraints:classify_requirements_and_constraints_evidence:slot:priority-reversal

- Status: authoring-admitted
- Objective: Assess whether the evidence “the owner changes the priority from minimum cost to minimum recovery time” supports the owned resolution “reverse the design choice because the governing priority changed”.
- Expected decision: reverse the design choice because the governing priority changed
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:requirements_and_constraints:classify_requirements_and_constraints_evidence:slot:residency-priority

- Status: authoring-admitted
- Objective: Assess whether the evidence “data may not leave a named jurisdiction even though a remote Region is cheaper” supports the owned resolution “retain data in the lawful geography”.
- Expected decision: retain data in the lawful geography
- Decisive boundary: This slot owns the boundary established by data may not leave a named jurisdiction even though a remote Region is cheaper; it resolves only to “retain data in the lawful geography” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:requirements_and_constraints:classify_requirements_and_constraints_evidence:slot:separate-hard-constraints

- Status: authoring-admitted
- Objective: Assess whether the evidence “availability, latency, residency, and budget are independently mandatory” supports the owned resolution “classify all four as design constraints”.
- Expected decision: classify all four as design constraints
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
