# Next task: author the first bounded real batch

Work from a clean current `master` and do not repeat the curriculum analysis.

1. Run `npm ci`.
2. Run `npm run authoring:validate`. If the input fingerprint differs from `945ee5500e46f5d16797e7d134c73bb694800cbc1d95271886cab91553bd1d2d`, regenerate the plan and review the changed evidence before continuing.
3. Run `npm run authoring:plan`.
4. Run `npm run authoring:scaffold -- --write` only if the planning briefs need materialization; it creates no JSON, approval, artifact, or release files.
5. Author exactly one complete batch at the path below, using its `.authoring.md` brief, canonical slot bindings, family schema, and exact human-review handoff:
   - path: `manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/principal_and_federation.json`
   - track/family: `aws-certified-solutions-architect-associate` / `certification`
   - node/block: `aws_secure_architecture_foundations` / `principal_and_federation`
   - slot IDs: `aws-certified-solutions-architect-associate:principal_and_federation:iam_identity_center_federated_iam_roles_workforce_access_long_lived_iam_users:slot:external-idp-federation`, `aws-certified-solutions-architect-associate:principal_and_federation:iam_identity_center_federated_iam_roles_workforce_access_long_lived_iam_users:slot:long-lived-user-exception`, `aws-certified-solutions-architect-associate:principal_and_federation:iam_identity_center_federated_iam_roles_workforce_access_long_lived_iam_users:slot:orphaned-local-users`, `aws-certified-solutions-architect-associate:principal_and_federation:iam_identity_center_federated_iam_roles_workforce_access_long_lived_iam_users:slot:permission-set-assignment`, `aws-certified-solutions-architect-associate:principal_and_federation:iam_identity_center_federated_iam_roles_workforce_access_long_lived_iam_users:slot:workforce-sso`, `aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:ec2-instance-role`, `aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:ecs-task-role`, `aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:embedded-access-key`, `aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:human-role-boundary`, `aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:lambda-execution-role`, `aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:workload-move`
   - taxonomy version: `2026.08.11`
   - authoring content version: `aws-certified-solutions-architect-associate-authoring-v2026.08.11`
6. Before approval, run `npm run authoring:validate` and record factual, technical, and editorial human review. Do not activate, publish, or add release artifacts in that task.

Learner-item creation belongs to the following bounded batch task unless the owner explicitly includes it.

Expected gate: `READY_FOR_FIRST_REAL_BOUNDED_AUTHORING_BATCH`.
