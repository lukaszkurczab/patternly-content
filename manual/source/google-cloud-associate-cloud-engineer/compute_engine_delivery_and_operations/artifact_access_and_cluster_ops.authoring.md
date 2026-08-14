# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / artifact_access_and_cluster_ops

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/artifact_access_and_cluster_ops.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:artifact_access_and_cluster_ops:cluster_operations_evidence_plane_node_workload_failures:slot:control-plane-status-classification

- Status: authoring-admitted
- Objective: artifact access and cluster ops — control plane status: classify “cluster operation status; Kubernetes API reachability; node and Pod conditions” as “Isolate control-plane unavailability before debugging worker or application symptoms”, while separating the competing classification “Investigate the narrowest layer that explains every symptom”.
- Expected decision: Isolate control-plane unavailability before debugging worker or application symptoms.
- Decisive boundary: artifact access and cluster ops — control plane status: evidence “cluster operation status; Kubernetes API reachability; node and Pod conditions” supports “Isolate control-plane unavailability before debugging worker or application symptoms”. The neighboring evidence “affected namespaces; node conditions; Pod events and logs” instead supports decision “Investigate the narrowest layer that explains every symptom”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:artifact_access_and_cluster_ops:cluster_operations_evidence_plane_node_workload_failures:slot:failure-scope-transfer

- Status: authoring-admitted
- Objective: Move diagnosis among platform, node, and workload layers as affected resources change.
- Expected decision: Investigate the narrowest layer that explains every symptom.
- Decisive boundary: Failure ownership follows shared evidence.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:artifact_access_and_cluster_ops:cluster_operations_evidence_plane_node_workload_failures:slot:node-readiness-diagnosis

- Status: authoring-admitted
- Objective: artifact access and cluster ops — node readiness: trace “Ready condition; kubelet and runtime status; node pressure or registration events” to “Restore or replace the node and confirm Pods reschedule on Ready capacity” instead of applying the competing remediation “Correct the stated constraint or supply matching capacity”.
- Expected decision: Restore or replace the node and confirm Pods reschedule on Ready capacity.
- Decisive boundary: artifact access and cluster ops — node readiness: evidence “Ready condition; kubelet and runtime status; node pressure or registration events” supports “Restore or replace the node and confirm Pods reschedule on Ready capacity”. The neighboring evidence “PodScheduled condition; FailedScheduling reason; resource or placement constraint” instead supports diagnosis “Correct the stated constraint or supply matching capacity”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:artifact_access_and_cluster_ops:cluster_operations_evidence_plane_node_workload_failures:slot:pod-scheduling-diagnosis

- Status: authoring-admitted
- Objective: artifact access and cluster ops — pod scheduling: trace “PodScheduled condition; FailedScheduling reason; resource or placement constraint” to “Correct the stated constraint or supply matching capacity” instead of applying the competing remediation “Fix selector or readiness when endpoints are absent; inspect exposure only after endpoints exist”.
- Expected decision: Correct the stated constraint or supply matching capacity.
- Decisive boundary: artifact access and cluster ops — pod scheduling: evidence “PodScheduled condition; FailedScheduling reason; resource or placement constraint” supports “Correct the stated constraint or supply matching capacity”. The neighboring evidence “Service selector; ready endpoints; Service type and client location” instead supports decision “Fix selector or readiness when endpoints are absent; inspect exposure only after endpoints exist”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:artifact_access_and_cluster_ops:cluster_operations_evidence_plane_node_workload_failures:slot:service-reachability-boundary

- Status: authoring-admitted
- Objective: artifact access and cluster ops — service reachability: verify that “Service selector; ready endpoints; Service type and client location” stays with “Fix selector or readiness when endpoints are absent; inspect exposure only after endpoints exist” and has not crossed into “Use events for orchestration actions and logs for process behavior, preserving resource identity and time”.
- Expected decision: Fix selector or readiness when endpoints are absent; inspect exposure only after endpoints exist.
- Decisive boundary: artifact access and cluster ops — service reachability: evidence “Service selector; ready endpoints; Service type and client location” supports “Fix selector or readiness when endpoints are absent; inspect exposure only after endpoints exist”. The neighboring evidence “termination reason; previous container logs; warning-event timeline” instead supports classification “Use events for orchestration actions and logs for process behavior, preserving resource identity and time”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:artifact_access_and_cluster_ops:cluster_operations_evidence_plane_node_workload_failures:slot:workload-log-event-evidence

- Status: authoring-admitted
- Objective: artifact access and cluster ops — workload log event evidence: recognize that “termination reason; previous container logs; warning-event timeline” requires “Use events for orchestration actions and logs for process behavior, preserving resource identity and time”, not the neighboring capability response “Isolate control-plane unavailability before debugging worker or application symptoms”.
- Expected decision: Use events for orchestration actions and logs for process behavior, preserving resource identity and time.
- Decisive boundary: artifact access and cluster ops — workload log event evidence: evidence “termination reason; previous container logs; warning-event timeline” supports “Use events for orchestration actions and logs for process behavior, preserving resource identity and time”. The neighboring evidence “cluster operation status; Kubernetes API reachability; node and Pod conditions” instead supports classification “Isolate control-plane unavailability before debugging worker or application symptoms”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:artifact_access_and_cluster_ops:gke_workloads_pull_access_artifact_registry_through_workload_identity_service_accounts:slot:cross-project-access-path

- Status: authoring-admitted
- Objective: artifact access and cluster ops — cross project access path: order or execute “Grant the node service account read access in the repository project and use the full image path” when “repository project; node service account; repository Reader binding” and distinguish the neighboring procedure “Use node identity for image pulls and Workload Identity Federation for application calls”.
- Expected decision: Grant the node service account read access in the repository project and use the full image path.
- Decisive boundary: artifact access and cluster ops — cross project access path: evidence “repository project; node service account; repository Reader binding” supports “Grant the node service account read access in the repository project and use the full image path”. The neighboring evidence “container-runtime pull; application API request; node versus workload principal” instead supports decision “Use node identity for image pulls and Workload Identity Federation for application calls”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:artifact_access_and_cluster_ops:gke_workloads_pull_access_artifact_registry_through_workload_identity_service_accounts:slot:identity-model-transfer

- Status: authoring-admitted
- Objective: Switch IAM diagnosis according to whether the operation is image retrieval or an in-Pod API call.
- Expected decision: Use node identity for image pulls and Workload Identity Federation for application calls.
- Decisive boundary: The caller, not the namespace name, decides the identity model.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:artifact_access_and_cluster_ops:gke_workloads_pull_access_artifact_registry_through_workload_identity_service_accounts:slot:image-pull-failure-diagnosis

- Status: authoring-admitted
- Objective: artifact access and cluster ops — image pull failure: trace “qualified image reference; node repository permission; network path” to “Correct the first failed pull prerequisite and verify the node fetches the image” instead of applying the competing remediation “Bind image-read permission to the node and application permission to the federated workload principal”.
- Expected decision: Correct the first failed pull prerequisite and verify the node fetches the image.
- Decisive boundary: artifact access and cluster ops — image pull failure: evidence “qualified image reference; node repository permission; network path” supports “Correct the first failed pull prerequisite and verify the node fetches the image”. The neighboring evidence “image pull; application request; node and Kubernetes service accounts” instead supports classification “Bind image-read permission to the node and application permission to the federated workload principal”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:artifact_access_and_cluster_ops:gke_workloads_pull_access_artifact_registry_through_workload_identity_service_accounts:slot:node-vs-workload-identity-classification

- Status: authoring-admitted
- Objective: artifact access and cluster ops — node vs workload identity: classify “image pull; application request; node and Kubernetes service accounts” as “Bind image-read permission to the node and application permission to the federated workload principal”, while separating the competing classification “Bind the specific repository, broadening only for a demonstrated multi-repository need”.
- Expected decision: Bind image-read permission to the node and application permission to the federated workload principal.
- Decisive boundary: artifact access and cluster ops — node vs workload identity: evidence “image pull; application request; node and Kubernetes service accounts” supports “Bind image-read permission to the node and application permission to the federated workload principal”. The neighboring evidence “repositories used; cross-project ownership; node principal” instead supports decision “Bind the specific repository, broadening only for a demonstrated multi-repository need”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:artifact_access_and_cluster_ops:gke_workloads_pull_access_artifact_registry_through_workload_identity_service_accounts:slot:repository-reader-scope-choice

- Status: authoring-admitted
- Objective: artifact access and cluster ops — repository reader scope: select “Bind the specific repository, broadening only for a demonstrated multi-repository need” under “repositories used; cross-project ownership; node principal” instead of the competing action “Grant the node service account read access in the repository project and use the full image path”.
- Expected decision: Bind the specific repository, broadening only for a demonstrated multi-repository need.
- Decisive boundary: artifact access and cluster ops — repository reader scope: evidence “repositories used; cross-project ownership; node principal” supports “Bind the specific repository, broadening only for a demonstrated multi-repository need”. The neighboring evidence “repository project; node service account; repository Reader binding” instead supports procedure “Grant the node service account read access in the repository project and use the full image path”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
