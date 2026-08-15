# Patternly authoring gate quick check

## Gate

**READY_FOR_FIRST_REAL_BOUNDED_AUTHORING_BATCH** — all ten current curricula are deterministically mapped; blocked slots are explicit and receive no writable source path.

Starting SHA: `7cfb71fc7f7ad0a061a9533f09ad5549ba8114c5`
Audited repository SHA: `a023847feee33034468bb494f799c16191d28db9`
Input fingerprint: `396df7e9ff2e5ccc932c45fc84fc43cedbe74e6a424b9578cbe0d3a545440377`
Generated-output fingerprint: `22e408a51e55098f60e04faeef1f8042e62b551e5ac8157404619549a5a6891a`

## Current catalogue

| Track | Planned | Existing | Remaining | Authoring-admitted | Blocked | Nodes | Learning-block files | Authoring | Runtime/publication |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| aws-certified-solutions-architect-associate | 446 | 0 | 446 | 0 | 446 | 3 | 0 | READY_FOR_AUTHORING_WITH_EXPLICIT_BLOCKS | not_admitted |
| backend-system-design-interview | 74 | 0 | 74 | 8 | 66 | 8 | 4 | READY_FOR_AUTHORING_WITH_EXPLICIT_BLOCKS | not_admitted |
| coding-interview-dsa-problem-solving | 3404 | 2375 | 1029 | 1029 | 0 | 26 | 213 | READY_FOR_AUTHORING | admitted_for_existing_coding_pipeline |
| frontend-system-design-interview | 181 | 0 | 181 | 10 | 171 | 9 | 6 | READY_FOR_AUTHORING_WITH_EXPLICIT_BLOCKS | not_admitted |
| google-cloud-associate-cloud-engineer | 361 | 0 | 361 | 0 | 361 | 2 | 0 | READY_FOR_AUTHORING_WITH_EXPLICIT_BLOCKS | not_admitted |
| hashicorp-terraform-associate-004 | 285 | 0 | 285 | 0 | 285 | 2 | 0 | READY_FOR_AUTHORING_WITH_EXPLICIT_BLOCKS | not_admitted |
| kubernetes-cloud-native-associate-kcna | 257 | 0 | 257 | 0 | 257 | 2 | 0 | READY_FOR_AUTHORING_WITH_EXPLICIT_BLOCKS | not_admitted |
| microsoft-azure-administrator-associate-az-104 | 324 | 0 | 324 | 0 | 324 | 2 | 0 | READY_FOR_AUTHORING_WITH_EXPLICIT_BLOCKS | not_admitted |
| microsoft-azure-ai-fundamentals-ai-901 | 258 | 0 | 258 | 0 | 258 | 2 | 0 | READY_FOR_AUTHORING_WITH_EXPLICIT_BLOCKS | not_admitted |
| object-oriented-design-interview | 68 | 0 | 68 | 9 | 59 | 7 | 6 | READY_FOR_AUTHORING_WITH_EXPLICIT_BLOCKS | not_admitted |

## Node → learning-block outline

- **aws-certified-solutions-architect-associate** — aws_secure_architecture_foundations (12 blocks, 134 planned items); aws_resilient_and_high_performance_systems (15 blocks, 169 planned items); aws_network_data_and_cost_optimization (12 blocks, 143 planned items)
- **backend-system-design-interview** — requirements_and_capacity_foundations (4 blocks, 8 planned items); service_api_and_data_boundaries (4 blocks, 8 planned items); read_write_paths_and_scaling (5 blocks, 10 planned items); consistency_and_coordination (4 blocks, 8 planned items); asynchronous_workflows_and_streaming (5 blocks, 10 planned items); reliability_and_failure_containment (4 blocks, 9 planned items); security_observability_and_operability (5 blocks, 12 planned items); evolution_and_case_synthesis (4 blocks, 9 planned items)
- **coding-interview-dsa-problem-solving** — complexity_and_constraints (3 blocks, 158 planned items); arrays_and_strings (3 blocks, 140 planned items); hash_map_and_set (3 blocks, 120 planned items); two_pointers (3 blocks, 120 planned items); sliding_window (3 blocks, 120 planned items); prefix_sums (3 blocks, 120 planned items); sorting_based (3 blocks, 120 planned items); stack (3 blocks, 120 planned items); binary_search (3 blocks, 134 planned items); strategy_selection_core (3 blocks, 120 planned items); contrast_hash_map_vs_sorting (3 blocks, 160 planned items); contrast_two_pointers_vs_sliding_window (3 blocks, 120 planned items); contrast_sliding_window_vs_prefix_sums (3 blocks, 162 planned items); contrast_stack_vs_monotonic_stack_intro (3 blocks, 144 planned items); contrast_binary_search_vs_linear_scan (3 blocks, 156 planned items); linked_list (3 blocks, 120 planned items); recursion_basics (3 blocks, 120 planned items); tree_traversal (3 blocks, 120 planned items); heap_priority_queue (3 blocks, 120 planned items); intervals (3 blocks, 120 planned items); backtracking (3 blocks, 156 planned items); graph_traversal (3 blocks, 120 planned items); greedy_intro (3 blocks, 120 planned items); dynamic_programming_intro (3 blocks, 120 planned items); bit_manipulation (3 blocks, 154 planned items); math_and_geometry (3 blocks, 120 planned items)
- **frontend-system-design-interview** — frontend_architecture_foundations (4 blocks, 15 planned items); state_and_data_flow (5 blocks, 23 planned items); ui_composition_and_component_boundaries (5 blocks, 17 planned items); rendering_delivery_and_caching (5 blocks, 18 planned items); frontend_performance_engineering (6 blocks, 20 planned items); accessible_interaction_design (5 blocks, 22 planned items); offline_resilience_and_synchronization (5 blocks, 25 planned items); client_security_observability_and_operations (6 blocks, 27 planned items); evolution_testing_and_case_synthesis (4 blocks, 14 planned items)
- **google-cloud-associate-cloud-engineer** — setup_environment (13 blocks, 124 planned items); compute_engine_delivery_and_operations (23 blocks, 237 planned items)
- **hashicorp-terraform-associate-004** — terraform_configuration_foundations (14 blocks, 127 planned items); terraform_delivery_state_and_hcp_operations (18 blocks, 158 planned items)
- **kubernetes-cloud-native-associate-kcna** — cloud_native_kubernetes_and_service_operating_foundations (15 blocks, 128 planned items); cloud_native_state_security_delivery_and_reliability (16 blocks, 129 planned items)
- **microsoft-azure-administrator-associate-az-104** — azure_identity_governance_storage_and_deployment_foundations (22 blocks, 153 planned items); azure_compute_network_operations_and_recovery (26 blocks, 171 planned items)
- **microsoft-azure-ai-fundamentals-ai-901** — ai_concepts_responsible_models_and_foundry_clients (14 blocks, 138 planned items); agents_multimodal_and_extraction_implementation (13 blocks, 120 planned items)
- **object-oriented-design-interview** — object_modeling_foundations (4 blocks, 8 planned items); responsibilities_and_collaborations (5 blocks, 11 planned items); invariants_and_lifecycle (5 blocks, 8 planned items); identity_persistence_and_external_boundaries (5 blocks, 9 planned items); extension_and_behavioral_substitution (5 blocks, 9 planned items); concurrency_failure_and_resource_ownership (5 blocks, 11 planned items); testing_evolution_and_case_synthesis (5 blocks, 12 planned items)

## Decision/source coverage handoff

- **aws-certified-solutions-architect-associate** — admitted blocks: none; blocked blocks: 39; interaction pool: choice=446.
- **backend-system-design-interview** — admitted blocks: failure_model_and_dependency_budget (1), timeouts_retries_circuit_breakers (3), redundancy_failover_and_disaster_recovery (2), overload_degradation_and_load_shedding (2); blocked blocks: 32; interaction pool: choice=74.
- **coding-interview-dsa-problem-solving** — admitted blocks: arrays_and_strings:mental-unit-set-2 (2), arrays_and_strings:mental-unit-set-3 (8), hash_map_and_set:mental-unit-set-1 (16), hash_map_and_set:mental-unit-set-2 (14), hash_map_and_set:mental-unit-set-3 (24), two_pointers:mental-unit-set-1 (6), two_pointers:mental-unit-set-2 (6), two_pointers:mental-unit-set-3 (18), sliding_window:mental-unit-set-1 (23), sliding_window:mental-unit-set-2 (25), sliding_window:mental-unit-set-3 (28), prefix_sums:mental-unit-set-1 (16), prefix_sums:mental-unit-set-2 (15), prefix_sums:mental-unit-set-3 (24), sorting_based:mental-unit-set-1 (16), sorting_based:mental-unit-set-2 (16), sorting_based:mental-unit-set-3 (24), stack:mental-unit-set-1 (20), stack:mental-unit-set-2 (20), stack:mental-unit-set-3 (24), strategy_selection_core:mental-unit-set-1 (20), strategy_selection_core:mental-unit-set-2 (21), strategy_selection_core:mental-unit-set-3 (27), contrast_two_pointers_vs_sliding_window:mental-unit-set-1 (26), contrast_two_pointers_vs_sliding_window:mental-unit-set-2 (22), contrast_two_pointers_vs_sliding_window:mental-unit-set-3 (29), contrast_sliding_window_vs_prefix_sums:mental-unit-set-3 (2), contrast_stack_vs_monotonic_stack_intro:mental-unit-set-3 (6), contrast_binary_search_vs_linear_scan:mental-unit-set-3 (2), linked_list:mental-unit-set-1 (16), linked_list:mental-unit-set-2 (16), linked_list:mental-unit-set-3 (24), recursion_basics:mental-unit-set-1 (16), recursion_basics:mental-unit-set-2 (24), recursion_basics:mental-unit-set-3 (24), tree_traversal:mental-unit-set-1 (23), tree_traversal:mental-unit-set-2 (24), tree_traversal:mental-unit-set-3 (23), heap_priority_queue:mental-unit-set-1 (23), heap_priority_queue:mental-unit-set-2 (24), heap_priority_queue:mental-unit-set-3 (29), intervals:mental-unit-set-1 (11), intervals:mental-unit-set-2 (10), intervals:mental-unit-set-3 (22), graph_traversal:mental-unit-set-1 (9), graph_traversal:mental-unit-set-2 (19), graph_traversal:mental-unit-set-3 (18), greedy_intro:mental-unit-set-1 (25), greedy_intro:mental-unit-set-2 (24), greedy_intro:mental-unit-set-3 (29), dynamic_programming_intro:mental-unit-set-1 (12), dynamic_programming_intro:mental-unit-set-2 (12), dynamic_programming_intro:mental-unit-set-3 (12), math_and_geometry:mental-unit-set-1 (18), math_and_geometry:mental-unit-set-2 (18), math_and_geometry:mental-unit-set-3 (24); blocked blocks: 0; interaction pool: choice=2222, ordering=1182.
- **frontend-system-design-interview** — admitted blocks: device_browser_network_and_accessibility_constraints (1), semantics_name_role_and_value (1), contrast_reflow_zoom_and_responsive_access (1), status_error_and_dynamic_content_announcement (2), cross_device_and_assistive_technology_transfer (4), component_integration_e2e_a11y_and_performance_testing (1); blocked blocks: 45; interaction pool: choice=134, null=47.
- **google-cloud-associate-cloud-engineer** — admitted blocks: none; blocked blocks: 36; interaction pool: choice=361.
- **hashicorp-terraform-associate-004** — admitted blocks: none; blocked blocks: 32; interaction pool: choice=285.
- **kubernetes-cloud-native-associate-kcna** — admitted blocks: none; blocked blocks: 31; interaction pool: choice=257.
- **microsoft-azure-administrator-associate-az-104** — admitted blocks: none; blocked blocks: 48; interaction pool: choice=324.
- **microsoft-azure-ai-fundamentals-ai-901** — admitted blocks: none; blocked blocks: 27; interaction pool: choice=258.
- **object-oriented-design-interview** — admitted blocks: use_cases_scenarios_and_behavior_extraction (1), domain_vocabulary_entities_and_value_objects (2), god_object_feature_envy_and_anemic_leakage (1), temporal_and_cross_object_invariants (1), persistence_mapping_and_repository_boundary (2), external_api_adapter_and_anti_corruption_boundary (2); blocked blocks: 31; interaction pool: choice=50, null=18.

## Feasibility and blocks

- Certification: 1931 slots are planned; 0 are exact-direct authoring admitted and 1931 are blocked until literal exact-direct source anchors exist; runtime/publication remains not admitted.
- Design Interview: the canonical exact-direct roster is authoring admitted (backend-system-design-interview=8, frontend-system-design-interview=10, object-oriented-design-interview=9; 27 slots total). The remaining 296 slots are blocked/deferred by the current authoring roster, source evidence, or interaction contract; no case/simulation semantics are represented as choice content.
- Coding Interview: existing 213 source files and their 2375 verified items are preserved; remaining authoring extends the existing canonical layout only after separate review.
- Interaction anomaly: all admitted Certification and Design slots are choice; blocked Design case/simulation modes remain unavailable.

## Material changes

- Added the three-family authoring registry and exact track registrations without copying curriculum slots or counts.
- Added strict Certification and Design source contracts with semantic slot, feedback, taxonomy, mode, provenance, and direct-source validation.
- Added deterministic plan/scaffold tooling and regenerated current-SHA evidence.
- Added explicit Certification single-selection allocation to all current slots and recomputed the six canonical content fingerprints.
- Preserved all existing Coding Interview learner-source JSON bytes; no new learner-source JSON was created.

## Owner decisions

None for schema, layout, naming, batching, provenance, or validation. Human review is still required before any authored batch becomes approved, runtime-admitted, or released.

## Next task

Run the exact handoff in [`next-task.md`](./next-task.md). The first command is:

```sh
npm run authoring:validate && npm run authoring:plan && npm run authoring:scaffold -- --write
```

First real batch: `manual/source/frontend-system-design-interview/frontend_architecture_foundations/device_browser_network_and_accessibility_constraints.json` (1 item).
No empty JSON is created by scaffolding.
