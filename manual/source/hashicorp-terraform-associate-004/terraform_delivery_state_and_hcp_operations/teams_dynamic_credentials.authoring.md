# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / teams_dynamic_credentials

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 6
- Authoring-admitted slots: 6
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/teams_dynamic_credentials.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:teams_dynamic_credentials:classify_teams_dynamic_credentials_evidence:slot:dynamic-credential-choice

- Status: authoring-admitted
- Objective: Use OIDC-based dynamic provider credentials instead of static long-lived cloud keys. It evaluates supported cloud provider; documented property oidc under oidc.
- Expected decision: Exchange HCP run identity for short-lived cloud credentials.
- Decisive boundary: Sensitive variables hide display but still retain long-lived credential risk. With supported cloud provider; documented property oidc, the required resolution is Exchange HCP run identity for short-lived cloud credentials.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:teams_dynamic_credentials:classify_teams_dynamic_credentials_evidence:slot:human-team-permission

- Status: authoring-admitted
- Objective: Separate a user/team permission to approve runs from the cloud identity used by Terraform. It evaluates HCP team role; documented property human_platform_permission under human_platform_permission.
- Expected decision: Grant human platform permissions and run identity independently.
- Decisive boundary: HCP authorization governs platform actions; provider identity governs cloud API calls. With HCP team role; documented property human_platform_permission, the required resolution is Grant human platform permissions and run identity independently.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:teams_dynamic_credentials:classify_teams_dynamic_credentials_evidence:slot:plan-apply-role-boundary

- Status: authoring-admitted
- Objective: Choose distinct cloud roles for speculative plan and apply where supported. It evaluates read versus mutate operations; documented property plan_apply_role_separation under plan_apply_role_separation.
- Expected decision: Map plan to read/preview privileges and apply to approved mutation privileges.
- Decisive boundary: Phase-specific credentials reduce exposure. With read versus mutate operations; documented property plan_apply_role_separation, the required resolution is Map plan to read/preview privileges and apply to approved mutation privileges.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:teams_dynamic_credentials:classify_teams_dynamic_credentials_evidence:slot:static-secret-fallback-risk

- Status: authoring-admitted
- Objective: Migrate existing workspaces from static credentials without leaving two active paths. It evaluates dynamic credentials verified; documented property no_static_credential_fallback under no_static_credential_fallback.
- Expected decision: Remove static keys after proving federation and audit the selected identity.
- Decisive boundary: Multiple credential sources obscure provenance and can retain long-lived access. With dynamic credentials verified; documented property no_static_credential_fallback, the required resolution is Remove static keys after proving federation and audit the selected identity.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:teams_dynamic_credentials:classify_teams_dynamic_credentials_evidence:slot:trust-claim-diagnosis

- Status: authoring-admitted
- Objective: Diagnose dynamic credential exchange rejected by the cloud identity provider. It evaluates OIDC subject/audience; documented property oidc_trust_claims under oidc_trust_claims.
- Expected decision: Align trust conditions with the actual HCP run claims.
- Decisive boundary: Provider credential federation is governed by cloud trust, not human UI roles. With OIDC subject/audience; documented property oidc_trust_claims, the required resolution is Align trust conditions with the actual HCP run claims.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:teams_dynamic_credentials:classify_teams_dynamic_credentials_evidence:slot:workspace-least-privilege

- Status: authoring-admitted
- Objective: Grant a team permissions only on the projects/workspaces it operates. It evaluates team responsibility; documented property project_scoped_access under project_scoped_access.
- Expected decision: Use scoped project/workspace roles.
- Decisive boundary: Broader platform access increases ability to alter runs, variables, and state. With team responsibility; documented property project_scoped_access, the required resolution is Use scoped project/workspace roles.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
