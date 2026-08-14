# google-cloud-associate-cloud-engineer / setup_environment / principals_roles_policies

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/setup_environment/principals_roles_policies.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:principals_roles_policies:classify_principals_roles_policies_evidence:slot:human-group-principal-classification

- Status: authoring-admitted
- Objective: Classify a user or group as a workforce principal and choose group-based access for shared human job functions.
- Expected decision: Bind roles to a managed group when multiple humans share the same job function; reserve direct user bindings for justified individual cases.
- Decisive boundary: Human access follows workforce identity and group membership; service accounts represent workloads, not people.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:principals_roles_policies:classify_principals_roles_policies_evidence:slot:policy-inheritance-effective-access

- Status: authoring-admitted
- Objective: Compute a principal's effective IAM access across organization, folder, project, and resource policies.
- Expected decision: Trace inherited and direct bindings to the target resource before adding or removing access.
- Decisive boundary: Effective access is determined by applicable policies across the resource hierarchy, not by one binding file in isolation.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:principals_roles_policies:classify_principals_roles_policies_evidence:slot:principal-lifecycle-transfer

- Status: authoring-admitted
- Objective: Move access with the lifecycle of the principal instead of leaving bindings attached to obsolete identities.
- Expected decision: Remove or replace bindings when the human, group, or workload identity no longer owns the function.
- Decisive boundary: Identity lifecycle changes invalidate bindings even when the role itself remains technically valid.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:principals_roles_policies:classify_principals_roles_policies_evidence:slot:role-permission-resource-scope

- Status: authoring-admitted
- Objective: Interpret an IAM binding as principal plus role plus resource scope, then verify that all three match the requested action.
- Expected decision: Grant the narrowest role containing the required permission at a scope that reaches the target resource.
- Decisive boundary: Authorization requires the permission to be effective for that principal on that resource; role name alone is insufficient.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:principals_roles_policies:classify_principals_roles_policies_evidence:slot:workload-service-account-classification

- Status: authoring-admitted
- Objective: Classify a service account as a workload principal rather than a human administrator identity.
- Expected decision: Give the workload a service account with only the roles its runtime operations require.
- Decisive boundary: Service accounts are non-human principals intended for applications and compute workloads.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
