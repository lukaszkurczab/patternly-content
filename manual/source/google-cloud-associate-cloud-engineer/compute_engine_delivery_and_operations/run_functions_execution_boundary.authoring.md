# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / run_functions_execution_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/run_functions_execution_boundary.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:run_functions_execution_boundary:cloud_run_cloud_run_functions_request_model_runtime_event_trigger_needs:slot:container-vs-function-classification

- Status: authoring-admitted
- Objective: run functions execution boundary — container vs function: classify “existing container image; function handler and supported runtime; need for arbitrary binary or sidecar control” as “Deploy a function for handler-oriented supported-runtime code; use a service when the application owns the container and HTTP process”, while separating the competing classification “Expose an HTTP service for request callers or bind an Eventarc-compatible trigger for state-change events”.
- Expected decision: Deploy a function for handler-oriented supported-runtime code; use a service when the application owns the container and HTTP process.
- Decisive boundary: run functions execution boundary — container vs function: evidence “existing container image; function handler and supported runtime; need for arbitrary binary or sidecar control” supports “Deploy a function for handler-oriented supported-runtime code; use a service when the application owns the container and HTTP process”. The neighboring evidence “caller can issue HTTP; Google Cloud event source; CloudEvents delivery” instead supports decision “Expose an HTTP service for request callers or bind an Eventarc-compatible trigger for state-change events”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:run_functions_execution_boundary:cloud_run_cloud_run_functions_request_model_runtime_event_trigger_needs:slot:http-vs-event-trigger-choice

- Status: authoring-admitted
- Objective: run functions execution boundary — http vs event trigger: select “Expose an HTTP service for request callers or bind an Eventarc-compatible trigger for state-change events” under “caller can issue HTTP; Google Cloud event source; CloudEvents delivery” instead of the competing action “Keep the workload on Cloud Run for supported container control; move to GKE or VMs only for a demonstrated unsupported infrastructure dependency”.
- Expected decision: Expose an HTTP service for request callers or bind an Eventarc-compatible trigger for state-change events.
- Decisive boundary: run functions execution boundary — http vs event trigger: evidence “caller can issue HTTP; Google Cloud event source; CloudEvents delivery” supports “Expose an HTTP service for request callers or bind an Eventarc-compatible trigger for state-change events”. The neighboring evidence “custom container process; host or kernel dependency; managed scaling requirement” instead supports decision “Keep the workload on Cloud Run for supported container control; move to GKE or VMs only for a demonstrated unsupported infrastructure dependency”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:run_functions_execution_boundary:cloud_run_cloud_run_functions_request_model_runtime_event_trigger_needs:slot:runtime-control-boundary

- Status: authoring-admitted
- Objective: run functions execution boundary — runtime control: verify that “custom container process; host or kernel dependency; managed scaling requirement” stays with “Keep the workload on Cloud Run for supported container control; move to GKE or VMs only for a demonstrated unsupported infrastructure dependency” and has not crossed into “Use a service for requests and events; use a job for bounded parallel tasks whose success is process completion”.
- Expected decision: Keep the workload on Cloud Run for supported container control; move to GKE or VMs only for a demonstrated unsupported infrastructure dependency.
- Decisive boundary: run functions execution boundary — runtime control: evidence “custom container process; host or kernel dependency; managed scaling requirement” supports “Keep the workload on Cloud Run for supported container control; move to GKE or VMs only for a demonstrated unsupported infrastructure dependency”. The neighboring evidence “stable HTTPS endpoint; run-to-completion task; manual or scheduled execution” instead supports decision “Use a service for requests and events; use a job for bounded parallel tasks whose success is process completion”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:run_functions_execution_boundary:cloud_run_cloud_run_functions_request_model_runtime_event_trigger_needs:slot:service-vs-job-choice

- Status: authoring-admitted
- Objective: run functions execution boundary — service vs job: select “Use a service for requests and events; use a job for bounded parallel tasks whose success is process completion” under “stable HTTPS endpoint; run-to-completion task; manual or scheduled execution” instead of the competing action “Rebind execution to the invocation model that now owns delivery and completion semantics”.
- Expected decision: Use a service for requests and events; use a job for bounded parallel tasks whose success is process completion.
- Decisive boundary: run functions execution boundary — service vs job: evidence “stable HTTPS endpoint; run-to-completion task; manual or scheduled execution” supports “Use a service for requests and events; use a job for bounded parallel tasks whose success is process completion”. The neighboring evidence “response required by caller; event source; delivery retries and idempotency” instead supports decision “Rebind execution to the invocation model that now owns delivery and completion semantics”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:run_functions_execution_boundary:cloud_run_cloud_run_functions_request_model_runtime_event_trigger_needs:slot:trigger-requirement-transfer

- Status: authoring-admitted
- Objective: Change serverless resource or trigger when the workload moves between synchronous requests and asynchronous events.
- Expected decision: Rebind execution to the invocation model that now owns delivery and completion semantics.
- Decisive boundary: A trigger change is material only when producer and completion contracts change.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:run_functions_execution_boundary:concurrency_timeout_authentication_execution_contract:slot:authenticated-invocation-path

- Status: authoring-admitted
- Objective: run functions execution boundary — authenticated invocation path: order or execute “Grant invoker at the service and send a valid identity token for the service audience” when “caller principal; Cloud Run Invoker grant; audience-bound identity token” and distinguish the neighboring procedure “Lower concurrency for unsafe or resource-heavy handlers; raise it only when parallelism improves throughput without contention”.
- Expected decision: Grant invoker at the service and send a valid identity token for the service audience.
- Decisive boundary: run functions execution boundary — authenticated invocation path: evidence “caller principal; Cloud Run Invoker grant; audience-bound identity token” supports “Grant invoker at the service and send a valid identity token for the service audience”. The neighboring evidence “thread safety; memory and CPU per request; downstream connection use” instead supports decision “Lower concurrency for unsafe or resource-heavy handlers; raise it only when parallelism improves throughput without contention”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:run_functions_execution_boundary:concurrency_timeout_authentication_execution_contract:slot:concurrency-safety-choice

- Status: authoring-admitted
- Objective: run functions execution boundary — concurrency safety: select “Lower concurrency for unsafe or resource-heavy handlers; raise it only when parallelism improves throughput without contention” under “thread safety; memory and CPU per request; downstream connection use” instead of the competing action “Align deadlines, return before Cloud Run closes the connection, and make long operations resumable or idempotent”.
- Expected decision: Lower concurrency for unsafe or resource-heavy handlers; raise it only when parallelism improves throughput without contention.
- Decisive boundary: run functions execution boundary — concurrency safety: evidence “thread safety; memory and CPU per request; downstream connection use” supports “Lower concurrency for unsafe or resource-heavy handlers; raise it only when parallelism improves throughput without contention”. The neighboring evidence “service request timeout; downstream call deadline; client disconnect or retry” instead supports diagnosis “Align deadlines, return before Cloud Run closes the connection, and make long operations resumable or idempotent”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:run_functions_execution_boundary:concurrency_timeout_authentication_execution_contract:slot:downstream-deadline-diagnosis

- Status: authoring-admitted
- Objective: run functions execution boundary — downstream deadline: trace “service request timeout; downstream call deadline; client disconnect or retry” to “Align deadlines, return before Cloud Run closes the connection, and make long operations resumable or idempotent” instead of applying the competing remediation “Carry forward only settings that remain valid for the changed handler and caller model”.
- Expected decision: Align deadlines, return before Cloud Run closes the connection, and make long operations resumable or idempotent.
- Decisive boundary: run functions execution boundary — downstream deadline: evidence “service request timeout; downstream call deadline; client disconnect or retry” supports “Align deadlines, return before Cloud Run closes the connection, and make long operations resumable or idempotent”. The neighboring evidence “new parallelism safety; new execution duration; new caller trust boundary” instead supports decision “Carry forward only settings that remain valid for the changed handler and caller model”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:run_functions_execution_boundary:concurrency_timeout_authentication_execution_contract:slot:execution-contract-transfer

- Status: authoring-admitted
- Objective: Reconfigure concurrency, timeout, and authentication together when workload behavior changes materially.
- Expected decision: Carry forward only settings that remain valid for the changed handler and caller model.
- Decisive boundary: Each control answers a separate constraint and none implies the others.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:run_functions_execution_boundary:concurrency_timeout_authentication_execution_contract:slot:public-invocation-boundary

- Status: authoring-admitted
- Objective: run functions execution boundary — public invocation: verify that “public caller population; IAM authentication feasibility; ingress restriction” stays with “Disable the IAM invocation check only for the intended public endpoint and retain application-level controls where needed” and has not crossed into “Choose a bounded timeout and redesign very long or retry-sensitive work for resumable asynchronous execution”.
- Expected decision: Disable the IAM invocation check only for the intended public endpoint and retain application-level controls where needed.
- Decisive boundary: run functions execution boundary — public invocation: evidence “public caller population; IAM authentication feasibility; ingress restriction” supports “Disable the IAM invocation check only for the intended public endpoint and retain application-level controls where needed”. The neighboring evidence “expected execution duration; maximum 60-minute service timeout; idempotency under reconnect or retry” instead supports decision “Choose a bounded timeout and redesign very long or retry-sensitive work for resumable asynchronous execution”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:run_functions_execution_boundary:concurrency_timeout_authentication_execution_contract:slot:request-timeout-boundary

- Status: authoring-admitted
- Objective: run functions execution boundary — request timeout: verify that “expected execution duration; maximum 60-minute service timeout; idempotency under reconnect or retry” stays with “Choose a bounded timeout and redesign very long or retry-sensitive work for resumable asynchronous execution” and has not crossed into “Grant invoker at the service and send a valid identity token for the service audience”.
- Expected decision: Choose a bounded timeout and redesign very long or retry-sensitive work for resumable asynchronous execution.
- Decisive boundary: run functions execution boundary — request timeout: evidence “expected execution duration; maximum 60-minute service timeout; idempotency under reconnect or retry” supports “Choose a bounded timeout and redesign very long or retry-sensitive work for resumable asynchronous execution”. The neighboring evidence “caller principal; Cloud Run Invoker grant; audience-bound identity token” instead supports procedure “Grant invoker at the service and send a valid identity token for the service audience”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
