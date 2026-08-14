# google-cloud-associate-cloud-engineer / setup_environment / impersonation_short_lived_credentials_custom_roles

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/setup_environment/impersonation_short_lived_credentials_custom_roles.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:impersonation_short_lived_credentials_custom_roles:custom_role_stable_permission_missing_predefined_roles:slot:custom-role-stage-lifecycle

- Status: authoring-admitted
- Objective: Use custom-role launch stages to communicate readiness and manage role evolution deliberately.
- Expected decision: Assign a launch stage that reflects support maturity and update the role through controlled revisions.
- Decisive boundary: The launch stage communicates the custom role's lifecycle; it does not grant permissions by itself.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:impersonation_short_lived_credentials_custom_roles:custom_role_stable_permission_missing_predefined_roles:slot:missing-permission-diagnosis

- Status: authoring-admitted
- Objective: Diagnose an authorization failure caused by a needed permission being absent from the custom role.
- Expected decision: Add the supported permission only after confirming it is required at the bound resource scope, then update the role.
- Decisive boundary: The denied permission must be both absent from the role and required for the attempted operation; a wrong binding scope produces a different defect.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:impersonation_short_lived_credentials_custom_roles:custom_role_stable_permission_missing_predefined_roles:slot:predefined-role-arrival-transfer

- Status: authoring-admitted
- Objective: Replace a custom role when a stable predefined role later covers the complete permission requirement at acceptable breadth.
- Expected decision: Migrate bindings to the predefined role only after comparing effective permissions and testing dependent workloads.
- Decisive boundary: Transfer is justified when the predefined role satisfies the stable requirement without unacceptable extra permissions.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:impersonation_short_lived_credentials_custom_roles:custom_role_stable_permission_missing_predefined_roles:slot:predefined-vs-custom-role

- Status: authoring-admitted
- Objective: Prefer a predefined role unless no suitably scoped predefined permission set satisfies the stable requirement.
- Expected decision: Bind the narrowest suitable predefined role; create a custom role only for a stable, supported gap.
- Decisive boundary: A custom role is warranted by a concrete permission-set gap, not by naming preference.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:impersonation_short_lived_credentials_custom_roles:custom_role_stable_permission_missing_predefined_roles:slot:supported-permission-eligibility

- Status: authoring-admitted
- Objective: Verify that every requested permission is eligible for inclusion in a custom role at the intended level.
- Expected decision: Include only permissions the custom-role service supports for that role level, or redesign the access grant.
- Decisive boundary: Permission support and role-level eligibility are hard constraints before least-privilege composition begins.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:impersonation_short_lived_credentials_custom_roles:service_account_impersonation_short_lived_credentials_delegated_automation:slot:audit-identity-boundary

- Status: authoring-admitted
- Objective: Distinguish the caller that initiated impersonation from the service account whose authority executed the API call.
- Expected decision: Attribute the request to the impersonated service account's permissions while retaining the initiating principal for audit and delegation analysis.
- Decisive boundary: Impersonation intentionally separates initiating identity from effective service-account authority, and audit evidence can preserve both.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:impersonation_short_lived_credentials_custom_roles:service_account_impersonation_short_lived_credentials_delegated_automation:slot:automation-context-transfer

- Status: authoring-admitted
- Objective: Change the short-lived credential flow when automation moves between local, CI, and Google-managed runtime contexts.
- Expected decision: Use the environment's native attached identity where available and impersonate only across an explicit delegated boundary.
- Decisive boundary: Credential acquisition must start from an identity actually available in the execution environment.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:impersonation_short_lived_credentials_custom_roles:service_account_impersonation_short_lived_credentials_delegated_automation:slot:delegation-chain-diagnosis

- Status: authoring-admitted
- Objective: Locate the failed hop in a service-account impersonation delegation chain.
- Expected decision: Verify that each principal has the required token-creation authority on the next service account in sequence.
- Decisive boundary: Every hop must authorize the immediately preceding principal to impersonate the next identity.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:impersonation_short_lived_credentials_custom_roles:service_account_impersonation_short_lived_credentials_delegated_automation:slot:impersonation-vs-key-classification

- Status: authoring-admitted
- Objective: Choose service-account impersonation instead of downloading a long-lived service-account key for delegated work.
- Expected decision: Generate short-lived credentials through impersonation and avoid creating a persistent key file.
- Decisive boundary: When a trusted identity can obtain temporary credentials, impersonation provides bounded credential lifetime without distributing a private key.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:impersonation_short_lived_credentials_custom_roles:service_account_impersonation_short_lived_credentials_delegated_automation:slot:short-lived-credential-lifetime

- Status: authoring-admitted
- Objective: Set an impersonated credential lifetime no longer than the automation task requires.
- Expected decision: Issue temporary credentials for the narrow task window and refresh through the delegation flow if continued work is authorized.
- Decisive boundary: Credential validity must cover the operation but remain bounded by documented service limits and least-duration practice.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:impersonation_short_lived_credentials_custom_roles:service_account_impersonation_short_lived_credentials_delegated_automation:slot:token-creator-scope-selection

- Status: authoring-admitted
- Objective: Grant Service Account Token Creator on the specific service account that a principal must impersonate.
- Expected decision: Bind the delegation role at the narrowest service-account scope that supports the approved flow.
- Decisive boundary: The binding scope determines which service accounts can be impersonated; target-resource roles determine what the impersonated account can do afterward.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
