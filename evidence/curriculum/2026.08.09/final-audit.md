# Curriculum coverage specification

Machine-readable source: `config/curricula/*.json`. Catalogue fingerprint: `1cc7250a05e6ff0566cc7f23e75860c7668820717c4e4c06255d3ffac3dbea36`.

## Release tracks

| Track | Family | Before nodes/target | After nodes/target | Blocks | Verified existing | New authoring | Free | Premium | Mode state |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| aws-certified-solutions-architect-associate | certification | 4/480 | 11/2496 | 39 | 0 | 2496 | 171 | 2325 | registry_pending_authoring_blocked |
| backend-system-design-interview | design_interview | 5/600 | 8/1154 | 35 | 0 | 1154 | 121 | 1033 | blocked_by_contract |
| coding-interview-dsa-problem-solving | coding_interview | 26/3404 | 26/3404 | 78 | 2375 | 1029 | 158 | 3246 | active_contract_and_planned_coverage |
| frontend-system-design-interview | design_interview | 5/600 | 9/1460 | 45 | 0 | 1460 | 120 | 1340 | blocked_by_contract |
| google-cloud-associate-cloud-engineer | certification | 5/600 | 10/2011 | 36 | 0 | 2011 | 176 | 1835 | exact_objectives_verified_volume_unverified_authoring_blocked_pending_mechanism_docs_and_CERT-CORR-02_to_CERT-CORR-04 |
| hashicorp-terraform-associate-004 | certification | 5/600 | 9/1695 | 32 | 0 | 1695 | 179 | 1516 | exact_objectives_verified_volume_unverified_authoring_blocked_pending_mechanism_docs_and_CERT-CORR-02_to_CERT-CORR-04 |
| kubernetes-cloud-native-associate-kcna | certification | 4/480 | 10/1514 | 31 | 0 | 1514 | 159 | 1355 | registry_pending_authoring_blocked |
| microsoft-azure-administrator-associate-az-104 | certification | 5/600 | 13/2536 | 48 | 0 | 2536 | 188 | 2348 | registry_pending_authoring_blocked |
| microsoft-azure-ai-fundamentals-ai-901 | certification | 5/600 | 8/1363 | 27 | 0 | 1363 | 130 | 1233 | exact_objectives_verified_volume_unverified_authoring_blocked_pending_mechanism_docs_and_CERT-CORR-02_to_CERT-CORR-04 |
| object-oriented-design-interview | design_interview | 5/600 | 7/1101 | 34 | 0 | 1101 | 122 | 979 | blocked_by_contract |

## Node targets

### aws-certified-solutions-architect-associate

| Order | Node | Target | Existing | Authoring | Package |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | cloud_architecture_foundations | 171 | 0 | 171 | free |
| 2 | identity_access_and_multi_account | 191 | 0 | 191 | premium |
| 3 | workload_and_network_security | 188 | 0 | 188 | premium |
| 4 | data_security_and_protection | 197 | 0 | 197 | premium |
| 5 | decoupled_and_elastic_architectures | 259 | 0 | 259 | premium |
| 6 | availability_fault_tolerance_and_dr | 243 | 0 | 243 | premium |
| 7 | high_performance_storage_and_compute | 279 | 0 | 279 | premium |
| 8 | high_performance_databases | 194 | 0 | 194 | premium |
| 9 | high_performance_network_and_ingestion | 260 | 0 | 260 | premium |
| 10 | cost_optimized_storage_and_data | 261 | 0 | 261 | premium |
| 11 | cost_optimized_compute_and_network | 253 | 0 | 253 | premium |

### backend-system-design-interview

| Order | Node | Target | Existing | Authoring | Package |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | requirements_and_capacity_foundations | 121 | 0 | 121 | free |
| 2 | service_api_and_data_boundaries | 131 | 0 | 131 | premium |
| 3 | read_write_paths_and_scaling | 150 | 0 | 150 | premium |
| 4 | consistency_and_coordination | 132 | 0 | 132 | premium |
| 5 | asynchronous_workflows_and_streaming | 150 | 0 | 150 | premium |
| 6 | reliability_and_failure_containment | 139 | 0 | 139 | premium |
| 7 | security_observability_and_operability | 190 | 0 | 190 | premium |
| 8 | evolution_and_case_synthesis | 141 | 0 | 141 | premium |

### coding-interview-dsa-problem-solving

| Order | Node | Target | Existing | Authoring | Package |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | complexity_and_constraints | 158 | 158 | 0 | free |
| 2 | arrays_and_strings | 140 | 130 | 10 | premium |
| 3 | hash_map_and_set | 120 | 66 | 54 | premium |
| 4 | two_pointers | 120 | 90 | 30 | premium |
| 5 | sliding_window | 120 | 44 | 76 | premium |
| 6 | prefix_sums | 120 | 65 | 55 | premium |
| 7 | sorting_based | 120 | 64 | 56 | premium |
| 8 | stack | 120 | 56 | 64 | premium |
| 9 | binary_search | 134 | 134 | 0 | premium |
| 10 | strategy_selection_core | 120 | 52 | 68 | premium |
| 11 | contrast_hash_map_vs_sorting | 160 | 160 | 0 | premium |
| 12 | contrast_two_pointers_vs_sliding_window | 120 | 43 | 77 | premium |
| 13 | contrast_sliding_window_vs_prefix_sums | 162 | 160 | 2 | premium |
| 14 | contrast_stack_vs_monotonic_stack_intro | 144 | 138 | 6 | premium |
| 15 | contrast_binary_search_vs_linear_scan | 156 | 154 | 2 | premium |
| 16 | linked_list | 120 | 64 | 56 | premium |
| 17 | recursion_basics | 120 | 56 | 64 | premium |
| 18 | tree_traversal | 120 | 50 | 70 | premium |
| 19 | heap_priority_queue | 120 | 44 | 76 | premium |
| 20 | intervals | 120 | 77 | 43 | premium |
| 21 | backtracking | 156 | 156 | 0 | premium |
| 22 | graph_traversal | 120 | 74 | 46 | premium |
| 23 | greedy_intro | 120 | 42 | 78 | premium |
| 24 | dynamic_programming_intro | 120 | 84 | 36 | premium |
| 25 | bit_manipulation | 154 | 154 | 0 | premium |
| 26 | math_and_geometry | 120 | 60 | 60 | premium |

### frontend-system-design-interview

| Order | Node | Target | Existing | Authoring | Package |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | frontend_architecture_foundations | 120 | 0 | 120 | free |
| 2 | state_and_data_flow | 155 | 0 | 155 | premium |
| 3 | ui_composition_and_component_boundaries | 167 | 0 | 167 | premium |
| 4 | rendering_delivery_and_caching | 165 | 0 | 165 | premium |
| 5 | frontend_performance_engineering | 180 | 0 | 180 | premium |
| 6 | accessible_interaction_design | 168 | 0 | 168 | premium |
| 7 | offline_resilience_and_synchronization | 166 | 0 | 166 | premium |
| 8 | client_security_observability_and_operations | 195 | 0 | 195 | premium |
| 9 | evolution_testing_and_case_synthesis | 144 | 0 | 144 | premium |

### google-cloud-associate-cloud-engineer

| Order | Node | Target | Existing | Authoring | Package |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | setup_environment | 176 | 0 | 176 | free |
| 2 | identity_and_service_accounts | 156 | 0 | 156 | premium |
| 3 | plan_and_configure_solution | 179 | 0 | 179 | premium |
| 4 | compute_engine_delivery_and_operations | 225 | 0 | 225 | premium |
| 5 | gke_delivery_and_operations | 242 | 0 | 242 | premium |
| 6 | serverless_and_event_workloads | 211 | 0 | 211 | premium |
| 7 | data_solution_delivery_and_operations | 241 | 0 | 241 | premium |
| 8 | network_delivery_and_operations | 234 | 0 | 234 | premium |
| 9 | infrastructure_as_code_delivery | 153 | 0 | 153 | premium |
| 10 | observability_and_incident_response | 194 | 0 | 194 | premium |

### hashicorp-terraform-associate-004

| Order | Node | Target | Existing | Authoring | Package |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | infrastructure_as_code_foundations | 179 | 0 | 179 | free |
| 2 | providers_initialization_and_locking | 193 | 0 | 193 | premium |
| 3 | configuration_values_and_dependencies | 229 | 0 | 229 | premium |
| 4 | validation_and_sensitive_configuration | 152 | 0 | 152 | premium |
| 5 | core_workflow_and_change_review | 210 | 0 | 210 | premium |
| 6 | modules_and_reuse | 186 | 0 | 186 | premium |
| 7 | state_backends_and_drift | 188 | 0 | 188 | premium |
| 8 | import_inspection_and_debugging | 157 | 0 | 157 | premium |
| 9 | hcp_terraform_collaboration_and_governance | 201 | 0 | 201 | premium |

### kubernetes-cloud-native-associate-kcna

| Order | Node | Target | Existing | Authoring | Package |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | cloud_native_foundations | 159 | 0 | 159 | free |
| 2 | kubernetes_architecture_and_api | 158 | 0 | 158 | premium |
| 3 | workload_scheduling_and_lifecycle | 182 | 0 | 182 | premium |
| 4 | cluster_administration | 137 | 0 | 137 | premium |
| 5 | networking_and_service_discovery | 129 | 0 | 129 | premium |
| 6 | storage_and_stateful_workloads | 137 | 0 | 137 | premium |
| 7 | security_and_identity | 165 | 0 | 165 | premium |
| 8 | troubleshooting_and_debugging | 145 | 0 | 145 | premium |
| 9 | cloud_native_application_delivery | 168 | 0 | 168 | premium |
| 10 | observability | 134 | 0 | 134 | premium |

### microsoft-azure-administrator-associate-az-104

| Order | Node | Target | Existing | Authoring | Package |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | azure_administration_foundations | 188 | 0 | 188 | free |
| 2 | entra_users_groups_and_lifecycle | 214 | 0 | 214 | premium |
| 3 | rbac_subscriptions_and_governance | 241 | 0 | 241 | premium |
| 4 | storage_access_and_accounts | 214 | 0 | 214 | premium |
| 5 | blobs_files_and_lifecycle | 196 | 0 | 196 | premium |
| 6 | arm_and_bicep_deployments | 185 | 0 | 185 | premium |
| 7 | virtual_machines_and_scale_sets | 255 | 0 | 255 | premium |
| 8 | azure_containers | 192 | 0 | 192 | premium |
| 9 | app_service | 183 | 0 | 183 | premium |
| 10 | virtual_networks_and_routing | 145 | 0 | 145 | premium |
| 11 | secure_network_access_dns_and_load_balancing | 196 | 0 | 196 | premium |
| 12 | monitoring_and_alerting | 159 | 0 | 159 | premium |
| 13 | backup_and_site_recovery | 168 | 0 | 168 | premium |

### microsoft-azure-ai-fundamentals-ai-901

| Order | Node | Target | Existing | Authoring | Package |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | ai_workload_foundations | 130 | 0 | 130 | free |
| 2 | responsible_ai | 202 | 0 | 202 | premium |
| 3 | models_deployments_and_configuration | 183 | 0 | 183 | premium |
| 4 | foundry_prompts_and_model_clients | 250 | 0 | 250 | premium |
| 5 | foundry_agents_and_agent_clients | 151 | 0 | 151 | premium |
| 6 | text_and_speech_solutions | 157 | 0 | 157 | premium |
| 7 | vision_and_image_generation_solutions | 152 | 0 | 152 | premium |
| 8 | content_understanding_and_information_extraction | 138 | 0 | 138 | premium |

### object-oriented-design-interview

| Order | Node | Target | Existing | Authoring | Package |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | object_modeling_foundations | 122 | 0 | 122 | free |
| 2 | responsibilities_and_collaborations | 171 | 0 | 171 | premium |
| 3 | invariants_and_lifecycle | 142 | 0 | 142 | premium |
| 4 | identity_persistence_and_external_boundaries | 143 | 0 | 143 | premium |
| 5 | extension_and_behavioral_substitution | 158 | 0 | 158 | premium |
| 6 | concurrency_failure_and_resource_ownership | 175 | 0 | 175 | premium |
| 7 | testing_evolution_and_case_synthesis | 190 | 0 | 190 | premium |


## Certification graph reconciliation

- aws-certified-solutions-architect-associate: 12/12 prerequisite edges reconciled; registry_pending_CERT-CORR-01-aws-certified-solutions-architect-associate_authoring_blocked.
- google-cloud-associate-cloud-engineer: 19/19 prerequisite edges reconciled; CERT-CORR-01_exact_registry_complete_direct_mechanism_docs_unresolved_volume_unverified_authoring_blocked_pending_CERT-CORR-02_to_CERT-CORR-04.
- hashicorp-terraform-associate-004: 10/10 prerequisite edges reconciled; CERT-CORR-01_exact_registry_complete_direct_mechanism_docs_unresolved_volume_unverified_authoring_blocked_pending_CERT-CORR-02_to_CERT-CORR-04.
- kubernetes-cloud-native-associate-kcna: 14/14 prerequisite edges reconciled; registry_pending_CERT-CORR-01-kubernetes-cloud-native-associate-kcna_authoring_blocked.
- microsoft-azure-administrator-associate-az-104: 19/19 prerequisite edges reconciled; registry_pending_CERT-CORR-01-microsoft-azure-administrator-associate-az-104_authoring_blocked.
- microsoft-azure-ai-fundamentals-ai-901: 11/11 prerequisite edges reconciled; CERT-CORR-01_exact_registry_complete_direct_mechanism_docs_unresolved_volume_unverified_authoring_blocked_pending_CERT-CORR-02_to_CERT-CORR-04.

## Certification objective registry

- aws-certified-solutions-architect-associate: registry_pending; authoring_blocked.
- google-cloud-associate-cloud-engineer: exact current registry verified; 12/12 objectives covered, 0 exclusions; mappings 10/36/66/66; direct first-party mechanism documentation remains unresolved, volume unverified, and authoring blocked. New-guide gaps remain later slot/content work: direct first-party mechanism documentation for every target; objective-level volume and slot distinctness validation in CERT-CORR-02 through CERT-CORR-04.
- hashicorp-terraform-associate-004: exact current registry verified; 37/37 objectives covered, 0 exclusions; mappings 9/32/55/55; direct first-party mechanism documentation remains unresolved, volume unverified, and authoring blocked. New-guide gaps remain later slot/content work: direct first-party mechanism documentation for every target; objective-level volume and slot distinctness validation in CERT-CORR-02 through CERT-CORR-04.
- kubernetes-cloud-native-associate-kcna: registry_pending; authoring_blocked.
- microsoft-azure-administrator-associate-az-104: registry_pending; authoring_blocked.
- microsoft-azure-ai-fundamentals-ai-901: exact current registry verified; 7/7 objectives covered, 0 exclusions; mappings 8/27/44/44; direct first-party mechanism documentation remains unresolved, volume unverified, and authoring blocked. New-guide gaps remain later slot/content work: direct first-party mechanism documentation for every target; objective-level volume and slot distinctness validation in CERT-CORR-02 through CERT-CORR-04.

## Contract gaps

3 of 6 certification tracks completed CERT-CORR-01 exact-registry work (google-cloud-associate-cloud-engineer, hashicorp-terraform-associate-004, microsoft-azure-ai-fundamentals-ai-901), but direct first-party mechanism documentation is unresolved; their volumes remain unverified and authoring is blocked pending CERT-CORR-02_to_CERT-CORR-04. 3 certification tracks remain registry_pending in their named CERT-CORR-01 stages (aws-certified-solutions-architect-associate, kubernetes-cloud-native-associate-kcna, microsoft-azure-administrator-associate-az-104). All certification rows and counts are planning values, not an accepted backlog or feasibility claim. Design Interview remains blocked by its application-owned selection/scoring interaction contract. Coding remains an accepted baseline with its active source pipeline and existing pre-authoring gates.

## Audit

Second-pass audit: certification_structure_provisional. Resolved defects: CURR-001, CURR-006, CURR-002, CURR-003.

- node_boundaries_and_learning_blocks: passed — Every node owns two or more family-appropriate blocks; target ownership and track totals reconcile.
- prerequisites_and_order: certification_reconciled_structure_provisional — Certification relationships exactly reconcile each declared prerequisite edge, with valid endpoints, canonical IDs, forward direction, and pair-specific reasons; later certification correction stages remain required.
- overlap_and_ownership: certification_provisional — Coding ownership is accepted. Certification ownership and overlap remain provisional pending exact objective registry and slot-plan correction stages.
- misconceptions_and_transfer: passed — Every target declares a competing decision or misconception plus decisive and transfer boundaries.
- variant_distinctness_and_filler: certification_unverified — Certification variant accounting is provisional and cannot establish authored-item distinctness before CERT-CORR-02 through CERT-CORR-04.
- session_pool_and_modes: certification_unverified — 3 of 6 certification tracks completed exact-registry work but their mechanism documentation and later CERT-CORR-02 through CERT-CORR-04 remain blocked; 3 tracks remain registry_pending in CERT-CORR-01. Design remains blocked_by_contract.
- free_premium_packages: passed — Exactly one brief-owned Free node exists per track and every node is an immutable whole-node package boundary.
- source_and_provenance: 3_of_6_exact_registries_complete — google-cloud-associate-cloud-engineer, hashicorp-terraform-associate-004, microsoft-azure-ai-fundamentals-ai-901 have verified exact registries and unresolved direct mechanism documentation; the remaining 3 exact registries remain pending their individual CERT-CORR-01 stages.
- cross_family_reuse: certification_provisional — Coding and Design contracts retain their current meaning; Certification aggregate SIG/DEC/BND/XFR planning is not accepted pending later correction stages.
- authoring_cost: certification_volume_unverified — Certification volume and its authoring gap are not accepted: google-cloud-associate-cloud-engineer, hashicorp-terraform-associate-004, microsoft-azure-ai-fundamentals-ai-901 await direct mechanism documentation and CERT-CORR-02 through CERT-CORR-04, while 3 tracks await their named CERT-CORR-01 stages.

Completion boundary: 3 of 6 certification tracks have completed CERT-CORR-01 exact-registry work (google-cloud-associate-cloud-engineer, hashicorp-terraform-associate-004, microsoft-azure-ai-fundamentals-ai-901); their direct mechanism documentation remains unresolved. 3 registries remain pending their named CERT-CORR-01 track stages (aws-certified-solutions-architect-associate, kubernetes-cloud-native-associate-kcna, microsoft-azure-administrator-associate-az-104). All certification volumes are unverified and authoring is blocked; CERT-CORR-02 through CERT-CORR-04 remain pending. Coding remains an accepted baseline; Design remains blocked by its interaction contract.

## First safe authoring batch

Candidate after mandatory pre-authoring gate — `coding-interview-dsa-problem-solving/arrays_and_strings/arrays_and_strings:mental-unit-set-2`: 2 additions for atom `preserve_duplicate_contract` in `manual/source/coding-interview-dsa-problem-solving/arrays-and-strings/duplicate-handling.json`. Gates: Bind authored items to curriculum coverageTargetId plus the directly owned atom in the source/publisher validation contract. Advance the Coding contentVersion as one coherent 213-envelope cohort before immutable evidence/build; do not overwrite coding-interview-dsa-problem-solving-0004. This remains the first ordered positive Coding gap and the least-covered atom in its block. It becomes the first safe question batch only after the named machine-binding and coherent-version gates; the current curriculum phase does not pretend that those publishing checks already exist.
