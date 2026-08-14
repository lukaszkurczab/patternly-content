# google-cloud-associate-cloud-engineer / setup_environment / compute_execution_model_selection

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/setup_environment/compute_execution_model_selection.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:compute_execution_model_selection:compute_engine_gke_cloud_run_cloud_run_functions_runtime_operations_needs:slot:accelerator-support-boundary

- Status: authoring-admitted
- Objective: Determine which execution products support the required GPU or TPU while preserving the workload's packaging model.
- Expected decision: Exclude products that cannot supply the named accelerator; among the remaining products, choose by required control and orchestration.
- Decisive boundary: Accelerator eligibility is a hard gate: Compute Engine and GKE expose broad GPU and TPU choices, while Cloud Run exposes a narrower GPU set and Cloud Run functions does not provide the same accelerator contract.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:compute_execution_model_selection:compute_engine_gke_cloud_run_cloud_run_functions_runtime_operations_needs:slot:container-orchestration-choice

- Status: authoring-admitted
- Objective: Choose GKE only when the workload needs Kubernetes scheduling, controllers, or multi-service container orchestration.
- Expected decision: Use GKE for Kubernetes-native orchestration; use Cloud Run when independent containers can be run without a cluster abstraction.
- Decisive boundary: A container image alone is not the boundary; dependence on Kubernetes objects and scheduling semantics is.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:compute_execution_model_selection:compute_engine_gke_cloud_run_cloud_run_functions_runtime_operations_needs:slot:event-function-choice

- Status: authoring-admitted
- Objective: Identify when a small event handler should use Cloud Run functions rather than a general container service.
- Expected decision: Use Cloud Run functions for supported function runtimes driven by HTTP or CloudEvents; retain Cloud Run service control when arbitrary container packaging is material.
- Decisive boundary: The decisive distinction is a function entry point on a supported runtime versus ownership of a complete container contract.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:compute_execution_model_selection:compute_engine_gke_cloud_run_cloud_run_functions_runtime_operations_needs:slot:operational-overhead-comparison

- Status: authoring-admitted
- Objective: Compare infrastructure ownership across Compute Engine, GKE, and Cloud Run before selecting a compute product.
- Expected decision: Prefer the most managed product that still exposes the workload controls the team actually requires.
- Decisive boundary: The product is viable only when its retained operational duties fit the team's operating model.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:compute_execution_model_selection:compute_engine_gke_cloud_run_cloud_run_functions_runtime_operations_needs:slot:os-kernel-control-choice

- Status: authoring-admitted
- Objective: Select Compute Engine when the application requires guest OS, kernel, boot-file, or machine-level administration.
- Expected decision: Use Compute Engine for machine-level control; reject Cloud Run and function runtimes when the requirement cannot be expressed inside their managed execution environment.
- Decisive boundary: A required host or kernel modification crosses the managed-runtime boundary and makes VM-level control decisive.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:compute_execution_model_selection:compute_engine_gke_cloud_run_cloud_run_functions_runtime_operations_needs:slot:stateful-long-running-boundary

- Status: authoring-admitted
- Objective: Test whether a continuously running stateful process fits the selected managed compute contract.
- Expected decision: Keep durable state outside ephemeral instances, or select an execution model that explicitly supports the required continuous process and storage attachment.
- Decisive boundary: Required process permanence or host-attached durable state is incompatible with a request-scaled ephemeral instance unless the design externalizes those requirements.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:compute_execution_model_selection:compute_engine_gke_cloud_run_cloud_run_functions_runtime_operations_needs:slot:stateless-request-service-choice

- Status: authoring-admitted
- Objective: Choose Cloud Run for a stateless HTTP or gRPC container when server and cluster administration are not required.
- Expected decision: Deploy the container as a Cloud Run service and let the platform create and scale instances for requests.
- Decisive boundary: The service contract fits only when the ingress container can serve requests and does not depend on durable local instance identity.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:compute_execution_model_selection:execution_model_state_request_lifetime:slot:event-driven-execution-choice

- Status: authoring-admitted
- Objective: Match an event-triggered unit of work to a function, service, or job by invocation and completion semantics.
- Expected decision: Use a function for a supported event handler, a service for request serving, and a job for work that runs to completion without listening for requests.
- Decisive boundary: Trigger shape does not decide alone; the entry-point contract and whether the process serves requests or exits are also decisive.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:compute_execution_model_selection:execution_model_state_request_lifetime:slot:request-lifetime-limit

- Status: authoring-admitted
- Objective: Determine whether an HTTP operation can complete within the configured Cloud Run request timeout.
- Expected decision: Keep the operation synchronous only when it can respond before timeout; otherwise redesign it as asynchronous work or a job.
- Decisive boundary: Cloud Run requires the response within the configured request timeout, including container startup time.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:compute_execution_model_selection:execution_model_state_request_lifetime:slot:service-vs-job-classification

- Status: authoring-admitted
- Objective: Classify a Cloud Run container as a service or job from its process contract.
- Expected decision: Use a service for a process that listens for requests; use a job for a task that exits zero on success and nonzero on failure.
- Decisive boundary: Listening on the injected port and producing responses distinguishes a service; termination status distinguishes a job.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:compute_execution_model_selection:execution_model_state_request_lifetime:slot:state-externalization-boundary

- Status: authoring-admitted
- Objective: Decide which state must move outside a Cloud Run instance before the workload can scale or restart safely.
- Expected decision: Place durable or shared state in an external storage or data service; treat the instance filesystem as instance-scoped memory-backed storage.
- Decisive boundary: State that must survive instance lifetime or be shared across instances cannot remain solely on the instance filesystem.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
