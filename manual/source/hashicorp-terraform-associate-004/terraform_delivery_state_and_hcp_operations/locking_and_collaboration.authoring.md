# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / locking_and_collaboration

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/locking_and_collaboration.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:locking_and_collaboration:classify_locking_and_collaboration_evidence:slot:active-stale-lock-diagnosis

- Status: authoring-admitted
- Objective: Diagnose whether lock evidence indicates an active writer or a failed automatic unlock.
- Expected decision: Preserve an active lock and investigate a stale own lock only after liveness is established.
- Decisive boundary: Force-unlock is lawful only for the caller's own lock after automatic unlocking failed.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:locking_and_collaboration:classify_locking_and_collaboration_evidence:slot:automatic-locking-recognition

- Status: authoring-admitted
- Objective: Recognize automatic state locking on write-capable operations when the backend supports it.
- Expected decision: Expect Terraform to stop when a required lock cannot be acquired.
- Decisive boundary: Locking behavior depends on backend support and the operation's ability to write state.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:locking_and_collaboration:classify_locking_and_collaboration_evidence:slot:force-unlock-workflow

- Status: authoring-admitted
- Objective: Order liveness verification, lock-ID confirmation, coordination, and force-unlock.
- Expected decision: Confirm a failed own lock before targeting the exact lock identifier.
- Decisive boundary: The exact lock identifier and inactive owner are required safety evidence.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:locking_and_collaboration:classify_locking_and_collaboration_evidence:slot:lock-false-boundary

- Status: authoring-admitted
- Objective: Test the safety boundary of disabling locking for a write-capable operation.
- Expected decision: Reject lock bypass when concurrent access can corrupt shared state.
- Decisive boundary: Documented guidance does not recommend disabling locking for normal operation.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:locking_and_collaboration:classify_locking_and_collaboration_evidence:slot:unsupported-backend-transfer

- Status: authoring-admitted
- Objective: Re-evaluate collaboration safety when the backend changes to one without locking support.
- Expected decision: Change backend or operating controls rather than assuming prior lock guarantees transfer.
- Decisive boundary: Locking guarantees transfer only when the destination backend documents support.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
