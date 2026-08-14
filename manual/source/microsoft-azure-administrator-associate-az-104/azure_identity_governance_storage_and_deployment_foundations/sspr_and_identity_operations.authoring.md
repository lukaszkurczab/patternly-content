# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / sspr_and_identity_operations

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/sspr_and_identity_operations.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:sspr_and_identity_operations:identity_operations_through_audit_sign_evidence:slot:classify-interactive-versus-noninteractive-signin

- Status: authoring-admitted
- Objective: Choose the sign-in record type that matches a user-interactive, service-principal, or managed-identity authentication.
- Expected decision: Investigate the record stream that owns the authentication attempt.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sspr_and_identity_operations:identity_operations_through_audit_sign_evidence:slot:diagnose-conditional-access-result-evidence

- Status: authoring-admitted
- Objective: Interpret the Conditional Access result attached to the sign-in instead of assuming policy evaluation from assignment alone.
- Expected decision: Change the policy only when the recorded evaluation identifies it as the blocker.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sspr_and_identity_operations:identity_operations_through_audit_sign_evidence:slot:distinguish-audit-log-change-from-signin-event

- Status: authoring-admitted
- Objective: Use audit logs for directory-object changes and sign-in logs for authentication outcomes.
- Expected decision: Query the correct Entra log category for the event under investigation.
- Decisive boundary: A user update audit record does not demonstrate a successful sign-in.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sspr_and_identity_operations:identity_operations_through_audit_sign_evidence:slot:identify-failure-code-and-correlation-id

- Status: authoring-admitted
- Objective: Use the sign-in error code and correlation ID to identify the failed authentication transaction.
- Expected decision: Trace the exact attempt before changing authentication policy.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sspr_and_identity_operations:self_service_password_reset_authentication_writeback_requirements:slot:calculate-required-authentication-methods

- Status: authoring-admitted
- Objective: Match the number of methods required for reset to the methods users can register and use.
- Expected decision: Configure a satisfiable method policy and require registration before reset is needed.
- Decisive boundary: A user in scope still cannot reset with fewer usable methods than the policy requires.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sspr_and_identity_operations:self_service_password_reset_authentication_writeback_requirements:slot:diagnose-protected-group-writeback-failure

- Status: authoring-admitted
- Objective: Recognize that protected on-premises groups can prevent the writeback service account from resetting a password.
- Expected decision: Use an approved administrative reset or correct supported delegation; do not weaken protected-group controls.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sspr_and_identity_operations:self_service_password_reset_authentication_writeback_requirements:slot:select-password-writeback-for-hybrid-user

- Status: authoring-admitted
- Objective: Enable password writeback when cloud reset must update the user's on-premises AD password.
- Expected decision: Configure writeback through the supported sync path and test the on-premises policy.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:sspr_and_identity_operations:self_service_password_reset_authentication_writeback_requirements:slot:validate-user-method-registration

- Status: authoring-admitted
- Objective: Distinguish SSPR enablement from an individual user's completed authentication-method registration.
- Expected decision: Complete method registration rather than changing the tenant scope when the user is enabled but unregistered.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
