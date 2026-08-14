# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / kubernetes_app_resources

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/kubernetes_app_resources.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:deployment_statefulset_daemonset_job_service_pod_lifecycle_networking_needs:slot:controller-mismatch-diagnosis

- Status: authoring-admitted
- Objective: kubernetes app resources — controller mismatch: trace “desired replica lifecycle; stable identity or completion; actual controller kind” to “Change controller only after matching the workload to Deployment, StatefulSet, DaemonSet, or Job semantics” instead of applying the competing remediation “Let DaemonSet reconciliation maintain node coverage as the cluster changes”.
- Expected decision: Change controller only after matching the workload to Deployment, StatefulSet, DaemonSet, or Job semantics.
- Decisive boundary: kubernetes app resources — controller mismatch: evidence “desired replica lifecycle; stable identity or completion; actual controller kind” supports “Change controller only after matching the workload to Deployment, StatefulSet, DaemonSet, or Job semantics”. The neighboring evidence “per-node agent; node selectors and taints; nodes added or removed” instead supports classification “Let DaemonSet reconciliation maintain node coverage as the cluster changes”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:deployment_statefulset_daemonset_job_service_pod_lifecycle_networking_needs:slot:daemonset-node-coverage

- Status: authoring-admitted
- Objective: kubernetes app resources — daemonset node coverage: recognize that “per-node agent; node selectors and taints; nodes added or removed” requires “Let DaemonSet reconciliation maintain node coverage as the cluster changes”, not the neighboring capability response “Put the Pod template in a Deployment so ReplicaSets restore failures and roll image changes”.
- Expected decision: Let DaemonSet reconciliation maintain node coverage as the cluster changes.
- Decisive boundary: kubernetes app resources — daemonset node coverage: evidence “per-node agent; node selectors and taints; nodes added or removed” supports “Let DaemonSet reconciliation maintain node coverage as the cluster changes”. The neighboring evidence “interchangeable replicas; desired replica count; continuous serving” instead supports decision “Put the Pod template in a Deployment so ReplicaSets restore failures and roll image changes”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:deployment_statefulset_daemonset_job_service_pod_lifecycle_networking_needs:slot:deployment-controller-choice

- Status: authoring-admitted
- Objective: kubernetes app resources — deployment controller: select “Put the Pod template in a Deployment so ReplicaSets restore failures and roll image changes” under “interchangeable replicas; desired replica count; continuous serving” instead of the competing action “Configure Job completions and allow failed Pods to be replaced until the task succeeds”.
- Expected decision: Put the Pod template in a Deployment so ReplicaSets restore failures and roll image changes.
- Decisive boundary: kubernetes app resources — deployment controller: evidence “interchangeable replicas; desired replica count; continuous serving” supports “Put the Pod template in a Deployment so ReplicaSets restore failures and roll image changes”. The neighboring evidence “run-to-completion; parallelism; failure retry” instead supports decision “Configure Job completions and allow failed Pods to be replaced until the task succeeds”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:deployment_statefulset_daemonset_job_service_pod_lifecycle_networking_needs:slot:job-completion-choice

- Status: authoring-admitted
- Objective: kubernetes app resources — job completion: select “Configure Job completions and allow failed Pods to be replaced until the task succeeds” under “run-to-completion; parallelism; failure retry” instead of the competing action “Operate production Pods through their controller and preserve desired state there”.
- Expected decision: Configure Job completions and allow failed Pods to be replaced until the task succeeds.
- Decisive boundary: kubernetes app resources — job completion: evidence “run-to-completion; parallelism; failure retry” supports “Configure Job completions and allow failed Pods to be replaced until the task succeeds”. The neighboring evidence “Pod deletion; controller owner reference; automatic recreation need” instead supports decision “Operate production Pods through their controller and preserve desired state there”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:deployment_statefulset_daemonset_job_service_pod_lifecycle_networking_needs:slot:pod-lifecycle-boundary

- Status: authoring-admitted
- Objective: kubernetes app resources — pod lifecycle: verify that “Pod deletion; controller owner reference; automatic recreation need” stays with “Operate production Pods through their controller and preserve desired state there” and has not crossed into “Choose the Service type and selector that expose the intended ready Pods”.
- Expected decision: Operate production Pods through their controller and preserve desired state there.
- Decisive boundary: kubernetes app resources — pod lifecycle: evidence “Pod deletion; controller owner reference; automatic recreation need” supports “Operate production Pods through their controller and preserve desired state there”. The neighboring evidence “label selector; internal or external reachability; stable virtual endpoint” instead supports decision “Choose the Service type and selector that expose the intended ready Pods”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:deployment_statefulset_daemonset_job_service_pod_lifecycle_networking_needs:slot:service-exposure-choice

- Status: authoring-admitted
- Objective: kubernetes app resources — service exposure: select “Choose the Service type and selector that expose the intended ready Pods” under “label selector; internal or external reachability; stable virtual endpoint” instead of the competing action “Use StatefulSet with the required service and claim templates”.
- Expected decision: Choose the Service type and selector that expose the intended ready Pods.
- Decisive boundary: kubernetes app resources — service exposure: evidence “label selector; internal or external reachability; stable virtual endpoint” supports “Choose the Service type and selector that expose the intended ready Pods”. The neighboring evidence “stable network identity; volume per replica; ordered startup or termination” instead supports decision “Use StatefulSet with the required service and claim templates”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:deployment_statefulset_daemonset_job_service_pod_lifecycle_networking_needs:slot:statefulset-identity-choice

- Status: authoring-admitted
- Objective: kubernetes app resources — statefulset identity: select “Use StatefulSet with the required service and claim templates” under “stable network identity; volume per replica; ordered startup or termination” instead of the competing action “Adopt the controller whose reconciliation behavior now matches the application”.
- Expected decision: Use StatefulSet with the required service and claim templates.
- Decisive boundary: kubernetes app resources — statefulset identity: evidence “stable network identity; volume per replica; ordered startup or termination” supports “Use StatefulSet with the required service and claim templates”. The neighboring evidence “new lifecycle invariant; identity persistence; coverage or completion semantics” instead supports decision “Adopt the controller whose reconciliation behavior now matches the application”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:deployment_statefulset_daemonset_job_service_pod_lifecycle_networking_needs:slot:workload-shape-transfer

- Status: authoring-admitted
- Objective: Change controller when lifecycle shifts among stateless serving, node coverage, stable identity, and finite completion.
- Expected decision: Adopt the controller whose reconciliation behavior now matches the application.
- Decisive boundary: Image or configuration changes alone do not justify a controller transfer.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:kubernetes_configuration_application_image_delivery:slot:change-scope-transfer

- Status: authoring-admitted
- Objective: Separate runtime configuration from application-image changes before rolling GKE Pods.
- Expected decision: Change the immutable image for code; change external configuration and roll Pods only when runtime settings changed.
- Decisive boundary: The artifact boundary follows what materially changed.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:kubernetes_configuration_application_image_delivery:slot:configuration-change-rollout

- Status: authoring-admitted
- Objective: kubernetes app resources — configuration change rollout: order or execute “Update or version configuration, trigger replacement where needed, and verify new Pods consume it” when “configuration version; rollout trigger; replacement Pod readiness” and distinguish the neighboring procedure “Reuse the verified image digest and inject environment configuration through Kubernetes resources”.
- Expected decision: Update or version configuration, trigger replacement where needed, and verify new Pods consume it.
- Decisive boundary: kubernetes app resources — configuration change rollout: evidence “configuration version; rollout trigger; replacement Pod readiness” supports “Update or version configuration, trigger replacement where needed, and verify new Pods consume it”. The neighboring evidence “same binary promoted across stages; secret handling; deploy-time value” instead supports decision “Reuse the verified image digest and inject environment configuration through Kubernetes resources”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:kubernetes_configuration_application_image_delivery:slot:configuration-vs-image-boundary

- Status: authoring-admitted
- Objective: kubernetes app resources — configuration vs image: verify that “same binary promoted across stages; secret handling; deploy-time value” stays with “Reuse the verified image digest and inject environment configuration through Kubernetes resources” and has not crossed into “Deploy the verified digest so later tag movement cannot silently alter new Pods”.
- Expected decision: Reuse the verified image digest and inject environment configuration through Kubernetes resources.
- Decisive boundary: kubernetes app resources — configuration vs image: evidence “same binary promoted across stages; secret handling; deploy-time value” supports “Reuse the verified image digest and inject environment configuration through Kubernetes resources”. The neighboring evidence “resolved digest; mutable tag risk; rollback identity” instead supports decision “Deploy the verified digest so later tag movement cannot silently alter new Pods”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:kubernetes_app_resources:kubernetes_configuration_application_image_delivery:slot:immutable-artifact-choice

- Status: authoring-admitted
- Objective: kubernetes app resources — immutable artifact: select “Deploy the verified digest so later tag movement cannot silently alter new Pods” under “resolved digest; mutable tag risk; rollback identity” instead of the competing action “Change the immutable image for code; change external configuration and roll Pods only when runtime settings changed”.
- Expected decision: Deploy the verified digest so later tag movement cannot silently alter new Pods.
- Decisive boundary: kubernetes app resources — immutable artifact: evidence “resolved digest; mutable tag risk; rollback identity” supports “Deploy the verified digest so later tag movement cannot silently alter new Pods”. The neighboring evidence “image digest; ConfigMap or Secret data; Pod-template reference” instead supports decision “Change the immutable image for code; change external configuration and roll Pods only when runtime settings changed”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
