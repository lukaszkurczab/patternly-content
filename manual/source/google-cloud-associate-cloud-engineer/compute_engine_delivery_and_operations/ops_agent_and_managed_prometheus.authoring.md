# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / ops_agent_and_managed_prometheus

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/ops_agent_and_managed_prometheus.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:deploy_ops_agent_managed_service_prometheus_host_metric_collection_needs:slot:agent-permission-diagnosis

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — agent permission failure diagnosis: trace “Ops Agent is running but metric or log writes are rejected” to “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs” instead of applying the competing remediation “Use GKE managed collection/PodMonitoring instead of treating each node as an ordinary Ops Agent installation target”.
- Expected decision: Verify the VM service account has required telemetry-writer permissions and can reach Google APIs.
- Decisive boundary: ops agent and managed prometheus — agent permission: evidence “Ops Agent is running but metric or log writes are rejected” is decisive for “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs”. Evidence “The workload is on GKE with managed collection available rather than a standalone Compute Engine host” instead supports the competing boundary “Use GKE managed collection/PodMonitoring instead of treating each node as an ordinary Ops Agent installation target”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:deploy_ops_agent_managed_service_prometheus_host_metric_collection_needs:slot:gke-collection-boundary

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — gke collection boundary test: determine that “The workload is on GKE with managed collection available rather than a standalone Compute Engine host” supports “Use GKE managed collection/PodMonitoring instead of treating each node as an ordinary Ops Agent installation target” and has not crossed into “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs”.
- Expected decision: Use GKE managed collection/PodMonitoring instead of treating each node as an ordinary Ops Agent installation target.
- Decisive boundary: ops agent and managed prometheus — gke collection: evidence “The workload is on GKE with managed collection available rather than a standalone Compute Engine host” is decisive for “Use GKE managed collection/PodMonitoring instead of treating each node as an ordinary Ops Agent installation target”. Evidence “Ops Agent is running but metric or log writes are rejected” instead supports the competing diagnosis “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:deploy_ops_agent_managed_service_prometheus_host_metric_collection_needs:slot:host-vs-prometheus-metric-classification

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — host vs prometheus metric classification: use “The signal is host telemetry from a VM or an application-exported Prometheus metric” to classify “Use Ops Agent host receivers for VM telemetry and a Prometheus collection path for exporter metrics”, while distinguishing the competing classification “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs”.
- Expected decision: Use Ops Agent host receivers for VM telemetry and a Prometheus collection path for exporter metrics.
- Decisive boundary: ops agent and managed prometheus — host vs prometheus metric: evidence “The signal is host telemetry from a VM or an application-exported Prometheus metric” is decisive for “Use Ops Agent host receivers for VM telemetry and a Prometheus collection path for exporter metrics”. Evidence “Ops Agent is running but metric or log writes are rejected” instead supports the competing diagnosis “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:deploy_ops_agent_managed_service_prometheus_host_metric_collection_needs:slot:ops-agent-installation-choice

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — ops agent installation procedure: order or execute “Install and configure Ops Agent on the VM, ensuring package/API reachability” when “A supported Compute Engine VM needs logs, host metrics, or traces collected through one agent”; separate it from the neighboring procedure “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs”.
- Expected decision: Install and configure Ops Agent on the VM, ensuring package/API reachability.
- Decisive boundary: ops agent and managed prometheus — ops agent installation: evidence “A supported Compute Engine VM needs logs, host metrics, or traces collected through one agent” is decisive for “Install and configure Ops Agent on the VM, ensuring package/API reachability”. Evidence “Ops Agent is running but metric or log writes are rejected” instead supports the competing diagnosis “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:deploy_ops_agent_managed_service_prometheus_host_metric_collection_needs:slot:prometheus-collection-choice

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — prometheus collection decision: select “Use Managed Service for Prometheus managed collection; choose self-deployed collection only for a requirement it satisfies” under “Kubernetes exporters need scalable Prometheus-compatible ingestion with minimal collector operations” rather than the competing action “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs”.
- Expected decision: Use Managed Service for Prometheus managed collection; choose self-deployed collection only for a requirement it satisfies.
- Decisive boundary: ops agent and managed prometheus — prometheus collection: evidence “Kubernetes exporters need scalable Prometheus-compatible ingestion with minimal collector operations” is decisive for “Use Managed Service for Prometheus managed collection; choose self-deployed collection only for a requirement it satisfies”. Evidence “Ops Agent is running but metric or log writes are rejected” instead supports the competing diagnosis “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:deploy_ops_agent_managed_service_prometheus_host_metric_collection_needs:slot:telemetry-source-transfer

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — telemetry source constraint transfer: move to “Transfer among Ops Agent receivers, Ops Agent Prometheus, and managed Kubernetes collection” after “The source moves between VM host telemetry, Compute Engine Prometheus exporters, and Kubernetes exporters”, while distinguishing the different transfer “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs”.
- Expected decision: Transfer among Ops Agent receivers, Ops Agent Prometheus, and managed Kubernetes collection.
- Decisive boundary: ops agent and managed prometheus — telemetry source: evidence “The source moves between VM host telemetry, Compute Engine Prometheus exporters, and Kubernetes exporters” is decisive for “Transfer among Ops Agent receivers, Ops Agent Prometheus, and managed Kubernetes collection”. Evidence “Ops Agent is running but metric or log writes are rejected” instead supports the competing diagnosis “Verify the VM service account has required telemetry-writer permissions and can reach Google APIs”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:scrape_targets_labels_retention_actionable_prometheus_telemetry:slot:collection-interval-boundary

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — collection interval boundary test: determine that “The scrape interval is shortened to capture brief events, increasing samples and cost, or lengthened beyond the signal duration” supports “Choose an interval no shorter than needed and above the service minimum while preserving detection” and has not crossed into “Use targetLabels/relabeling to add allowed labels without overwriting mandatory target identity”.
- Expected decision: Choose an interval no shorter than needed and above the service minimum while preserving detection.
- Decisive boundary: ops agent and managed prometheus — collection interval: evidence “The scrape interval is shortened to capture brief events, increasing samples and cost, or lengthened beyond the signal duration” is decisive for “Choose an interval no shorter than needed and above the service minimum while preserving detection”. Evidence “Pod labels are needed for attribution but mandatory target labels must remain intact” instead supports the competing boundary “Use targetLabels/relabeling to add allowed labels without overwriting mandatory target identity”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:scrape_targets_labels_retention_actionable_prometheus_telemetry:slot:label-relabeling-boundary

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — label relabeling boundary test: determine that “Pod labels are needed for attribution but mandatory target labels must remain intact” supports “Use targetLabels/relabeling to add allowed labels without overwriting mandatory target identity” and has not crossed into “Choose an interval no shorter than needed and above the service minimum while preserving detection”.
- Expected decision: Use targetLabels/relabeling to add allowed labels without overwriting mandatory target identity.
- Decisive boundary: ops agent and managed prometheus — label relabeling: evidence “Pod labels are needed for attribution but mandatory target labels must remain intact” is decisive for “Use targetLabels/relabeling to add allowed labels without overwriting mandatory target identity”. Evidence “The scrape interval is shortened to capture brief events, increasing samples and cost, or lengthened beyond the signal duration” instead supports the competing boundary “Choose an interval no shorter than needed and above the service minimum while preserving detection”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:scrape_targets_labels_retention_actionable_prometheus_telemetry:slot:metric-filter-choice

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — metric filter decision: select “Use metricRelabeling keep/drop rules before ingestion” under “Only a known metric allowlist is actionable and other series drive ingestion cost” rather than the competing action “Choose an interval no shorter than needed and above the service minimum while preserving detection”.
- Expected decision: Use metricRelabeling keep/drop rules before ingestion.
- Decisive boundary: ops agent and managed prometheus — metric filter: evidence “Only a known metric allowlist is actionable and other series drive ingestion cost” is decisive for “Use metricRelabeling keep/drop rules before ingestion”. Evidence “The scrape interval is shortened to capture brief events, increasing samples and cost, or lengthened beyond the signal duration” instead supports the competing boundary “Choose an interval no shorter than needed and above the service minimum while preserving detection”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:scrape_targets_labels_retention_actionable_prometheus_telemetry:slot:scrape-failure-diagnosis

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — scrape failure failure diagnosis: trace “PodMonitoring status shows a stale last scrape, down health, or too few discovered targets” to “Check selector, namespace, port/path, authorization, and endpoint reachability in that order” instead of applying the competing remediation “Choose an interval no shorter than needed and above the service minimum while preserving detection”.
- Expected decision: Check selector, namespace, port/path, authorization, and endpoint reachability in that order.
- Decisive boundary: ops agent and managed prometheus — scrape failure: evidence “PodMonitoring status shows a stale last scrape, down health, or too few discovered targets” is decisive for “Check selector, namespace, port/path, authorization, and endpoint reachability in that order”. Evidence “The scrape interval is shortened to capture brief events, increasing samples and cost, or lengthened beyond the signal duration” instead supports the competing boundary “Choose an interval no shorter than needed and above the service minimum while preserving detection”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:scrape_targets_labels_retention_actionable_prometheus_telemetry:slot:target-discovery-choice

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — target discovery decision: select “Use PodMonitoring for namespace scope and ClusterPodMonitoring for cluster-wide discovery” under “Targets are pods in one namespace versus matching pods across all namespaces” rather than the competing action “Choose an interval no shorter than needed and above the service minimum while preserving detection”.
- Expected decision: Use PodMonitoring for namespace scope and ClusterPodMonitoring for cluster-wide discovery.
- Decisive boundary: ops agent and managed prometheus — target discovery: evidence “Targets are pods in one namespace versus matching pods across all namespaces” is decisive for “Use PodMonitoring for namespace scope and ClusterPodMonitoring for cluster-wide discovery”. Evidence “The scrape interval is shortened to capture brief events, increasing samples and cost, or lengthened beyond the signal duration” instead supports the competing boundary “Choose an interval no shorter than needed and above the service minimum while preserving detection”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:ops_agent_and_managed_prometheus:scrape_targets_labels_retention_actionable_prometheus_telemetry:slot:telemetry-requirement-transfer

- Status: authoring-admitted
- Objective: ops agent and managed prometheus — telemetry requirement constraint transfer: move to “Transfer interval, relabeling, filtering, or query expectations according to the changed property” after “The requirement changes among lower cost, richer labels, faster detection, and longer historical resolution”, while distinguishing the different transfer “Choose an interval no shorter than needed and above the service minimum while preserving detection”.
- Expected decision: Transfer interval, relabeling, filtering, or query expectations according to the changed property.
- Decisive boundary: ops agent and managed prometheus — telemetry requirement: evidence “The requirement changes among lower cost, richer labels, faster detection, and longer historical resolution” is decisive for “Transfer interval, relabeling, filtering, or query expectations according to the changed property”. Evidence “The scrape interval is shortened to capture brief events, increasing samples and cost, or lengthened beyond the signal duration” instead supports the competing boundary “Choose an interval no shorter than needed and above the service minimum while preserving detection”; applying that response here would cross this slot’s evidence boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
