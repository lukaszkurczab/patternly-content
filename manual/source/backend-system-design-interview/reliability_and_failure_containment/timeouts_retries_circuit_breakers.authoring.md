# backend-system-design-interview / reliability_and_failure_containment / timeouts_retries_circuit_breakers

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: design_interview
- Planned item count: 3
- Authoring-admitted slots: 3
- Blocked slots: 0
- Future source path: manual/source/backend-system-design-interview/reliability_and_failure_containment/timeouts_retries_circuit_breakers.json
- Interaction allocation: choice
- Mode contribution: none

## Slot handoff

### backend-system-design-interview:timeouts_retries_circuit_breakers:derive_and_propagate_per_hop_timeouts_from_the_caller_deadline:slot:owned-decision-diagnosis

- Status: authoring-admitted
- Objective: Assess whether the learner can identify the decisive evidence for, apply, challenge, and re-evaluate “derive and propagate per hop timeouts from the caller deadline” without treating a complementary sibling atom as a forced alternative.
- Expected decision: Choose, scope, and justify derive and propagate per hop timeouts from the caller deadline without claiming it is universally correct.
- Decisive boundary: The decision is valid only while the stated caller deadline, remaining deadline budget, normal latency distribution, cancellation propagation support it.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### backend-system-design-interview:timeouts_retries_circuit_breakers:open_and_probe_a_circuit_breaker_from_dependency_failure_evidence_rather_than_caller_impatience:slot:owned-decision-diagnosis

- Status: authoring-admitted
- Objective: Assess whether the learner can identify the decisive evidence for, apply, challenge, and re-evaluate “open and probe a circuit breaker from dependency failure evidence rather than caller impatience” without treating a complementary sibling atom as a forced alternative.
- Expected decision: Choose, scope, and justify open and probe a circuit breaker from dependency failure evidence rather than caller impatience without claiming it is universally correct.
- Decisive boundary: The decision is valid only while the stated circuit-open threshold, rolling dependency-failure window, half-open probe rate, dependency recovery signal support it.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### backend-system-design-interview:timeouts_retries_circuit_breakers:retry_only_idempotent_work_within_explicit_attempt_and_elapsed_time_budgets:slot:owned-decision-diagnosis

- Status: authoring-admitted
- Objective: Assess whether the learner can identify the decisive evidence for, apply, challenge, and re-evaluate “retry only idempotent work within explicit attempt and elapsed time budgets” without treating a complementary sibling atom as a forced alternative.
- Expected decision: Choose, scope, and justify retry only idempotent work within explicit attempt and elapsed time budgets without claiming it is universally correct.
- Decisive boundary: The decision is valid only while the stated retry amplification, duplicate-work risk, idempotency guarantee, remaining retry budget support it.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
