# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / compute_container_serverless_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 13
- Authoring-admitted slots: 13
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/compute_container_serverless_boundary.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:ec2_ecs_eks_lambda_fargate_based_runtime_packaging_execution_duration_operations_ownersh:slot:ec2-control

- Status: authoring-admitted
- Objective: Assess whether the evidence “custom operating system, long-running process, or specialized host control is required” supports the owned resolution “use EC2”.
- Expected decision: use EC2
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:ec2_ecs_eks_lambda_fargate_based_runtime_packaging_execution_duration_operations_ownersh:slot:ecs-managed-orchestration

- Status: authoring-admitted
- Objective: Assess whether the evidence “containers need AWS-native orchestration without Kubernetes semantics” supports the owned resolution “use ECS”.
- Expected decision: use ECS
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:ec2_ecs_eks_lambda_fargate_based_runtime_packaging_execution_duration_operations_ownersh:slot:eks-kubernetes-api

- Status: authoring-admitted
- Objective: Assess whether the evidence “the workload requires Kubernetes APIs or ecosystem portability” supports the owned resolution “use EKS”.
- Expected decision: use EKS
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:ec2_ecs_eks_lambda_fargate_based_runtime_packaging_execution_duration_operations_ownersh:slot:fargate-serverless-containers

- Status: authoring-admitted
- Objective: Assess whether the evidence “containers need task or pod semantics without managing worker instances” supports the owned resolution “use Fargate where supported”.
- Expected decision: use Fargate where supported
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:ec2_ecs_eks_lambda_fargate_based_runtime_packaging_execution_duration_operations_ownersh:slot:lambda-event-runtime

- Status: authoring-admitted
- Objective: Assess whether the evidence “short event-driven execution fits Lambda duration and runtime constraints” supports the owned resolution “use Lambda”.
- Expected decision: use Lambda
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:ec2_ecs_eks_lambda_fargate_based_runtime_packaging_execution_duration_operations_ownersh:slot:operational-ownership-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “the team no longer owns host operations” supports the owned resolution “move to a managed compute boundary that still meets runtime constraints”.
- Expected decision: move to a managed compute boundary that still meets runtime constraints
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:ec2_ecs_eks_lambda_fargate_based_runtime_packaging_execution_duration_operations_ownersh:slot:runtime-limit

- Status: authoring-admitted
- Objective: Assess whether the evidence “package size, execution duration, networking, or host control exceeds the selected service boundary” supports the owned resolution “reject the incompatible compute service”.
- Expected decision: reject the incompatible compute service
- Decisive boundary: This slot owns the boundary established by package size, execution duration, networking, or host control exceeds the selected service boundary; it resolves only to “reject the incompatible compute service” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:scale_instances_tasks_pods_invocations_unit_isolates_workload_demand:slot:demand-isolation-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “a shared worker pool is separated by workload class” supports the owned resolution “scale each class at its new isolation unit”.
- Expected decision: scale each class at its new isolation unit
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:scale_instances_tasks_pods_invocations_unit_isolates_workload_demand:slot:instance-unit

- Status: authoring-admitted
- Objective: Assess whether the evidence “host-level CPU or network saturation constrains all work on an instance” supports the owned resolution “scale instances”.
- Expected decision: scale instances
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:scale_instances_tasks_pods_invocations_unit_isolates_workload_demand:slot:invocation-concurrency

- Status: authoring-admitted
- Objective: Assess whether the evidence “event arrivals and concurrency drive Lambda load” supports the owned resolution “scale through invocation concurrency and source controls”.
- Expected decision: scale through invocation concurrency and source controls
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:scale_instances_tasks_pods_invocations_unit_isolates_workload_demand:slot:pod-unit

- Status: authoring-admitted
- Objective: Assess whether the evidence “one Kubernetes workload has an independent demand signal” supports the owned resolution “scale pods”.
- Expected decision: scale pods
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:scale_instances_tasks_pods_invocations_unit_isolates_workload_demand:slot:task-unit

- Status: authoring-admitted
- Objective: Assess whether the evidence “one ECS service demand changes independently” supports the owned resolution “scale tasks”.
- Expected decision: scale tasks
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:compute_container_serverless_boundary:scale_instances_tasks_pods_invocations_unit_isolates_workload_demand:slot:wrong-aggregate-metric

- Status: authoring-admitted
- Objective: Assess whether the evidence “fleet-average CPU hides a hot isolated tier” supports the owned resolution “reject scaling on the diluted aggregate”.
- Expected decision: reject scaling on the diluted aggregate
- Decisive boundary: This slot owns the boundary established by fleet-average CPU hides a hot isolated tier; it resolves only to “reject scaling on the diluted aggregate” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
