# google-cloud-associate-cloud-engineer / setup_environment / tool_and_source_of_truth_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 2
- Authoring-admitted slots: 2
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/setup_environment/tool_and_source_of_truth_boundary.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:tool_and_source_of_truth_boundary:classify_tool_and_source_of_truth_boundary_evidence:slot:declarative-state-owner-classification

- Status: authoring-admitted
- Objective: Determine whether Terraform is the authoritative controller for the resource property before choosing a change tool.
- Expected decision: Route normal changes through the declared owner; use Terraform when configuration and state establish its ownership.
- Decisive boundary: Ownership evidence in declaration, state, and controller policy decides the tool—not operator familiarity.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:tool_and_source_of_truth_boundary:classify_tool_and_source_of_truth_boundary_evidence:slot:emergency-imperative-boundary

- Status: authoring-admitted
- Objective: Permit an imperative break-glass change only when incident urgency outweighs the normal declarative workflow and reconciliation is assigned.
- Expected decision: Make the minimum reversible emergency change, record it, then reconcile declared configuration and state after service recovery.
- Decisive boundary: Break-glass use requires both time-critical impact and an explicit route back to the authoritative source.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
