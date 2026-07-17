# Graph Traversal

## Identity

- Roadmap node ID: `graph_traversal`
- Order: 22
- Content ownership: `direct`
- Default learning stage: `pattern_mechanics`
- Primary pattern family: `graph_traversal`
- Involved pattern families: `graph_traversal`
- Prerequisites: none declared

## Learning goal

Enable the learner to apply the primary skills of this node with the correct family boundary and learning-stage expectation.

## Boundaries

### Includes

- Mental units structurally owned by `graph_traversal`.
- Legal pattern families and related variants or archetypes declared by the taxonomy.
- Diagnostic reasoning tied to the unit’s primary skill atom.

### Excludes

- A question whose primary diagnostic target belongs to another mental unit.
- A synthetic pattern family for strategy selection or contrast work.
- Production source JSON until manually authored content exists.

## Mental units

### `graph_representation`

- Unit kind: `direct`
- Primary skill atom: `choose_graph_representation`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `graph_traversal`
- Allowed pattern variants: `adjacency_list`, `graph_dfs`, `graph_bfs`, `multi_source_bfs`, `connected_components`, `topological_order_intro`, `grid_graph`
- Allowed problem archetypes: `traverse_connected_state`, `shortest_unweighted_path`, `count_components`, `propagate_from_multiple_sources`, `order_dependencies`
- Relevant false heuristics: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`
- Exact authoring intent: diagnose `choose_graph_representation` without changing `graph_representation` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/graph_traversal/graph_representation.md`
- Future canonical source path: `manual/source/algorithms/graph-traversal/graph-representation.json`

### `recognize_graph_traversal_signal`

- Unit kind: `direct`
- Primary skill atom: `identify_connected_state_search`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `graph_traversal`
- Allowed pattern variants: `adjacency_list`, `graph_dfs`, `graph_bfs`, `multi_source_bfs`, `connected_components`, `topological_order_intro`, `grid_graph`
- Allowed problem archetypes: `traverse_connected_state`, `shortest_unweighted_path`, `count_components`, `propagate_from_multiple_sources`, `order_dependencies`
- Relevant false heuristics: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`
- Exact authoring intent: diagnose `identify_connected_state_search` without changing `recognize_graph_traversal_signal` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/graph_traversal/recognize_graph_traversal_signal.md`
- Future canonical source path: `manual/source/algorithms/graph-traversal/recognize-graph-traversal-signal.json`

### `graph_dfs`

- Unit kind: `direct`
- Primary skill atom: `traverse_graph_depth_first`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `graph_traversal`
- Allowed pattern variants: `adjacency_list`, `graph_dfs`, `graph_bfs`, `multi_source_bfs`, `connected_components`, `topological_order_intro`, `grid_graph`
- Allowed problem archetypes: `traverse_connected_state`, `shortest_unweighted_path`, `count_components`, `propagate_from_multiple_sources`, `order_dependencies`
- Relevant false heuristics: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`
- Exact authoring intent: diagnose `traverse_graph_depth_first` without changing `graph_dfs` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/graph_traversal/graph_dfs.md`
- Future canonical source path: `manual/source/algorithms/graph-traversal/graph-dfs.json`

### `graph_bfs`

- Unit kind: `direct`
- Primary skill atom: `traverse_graph_breadth_first`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `graph_traversal`
- Allowed pattern variants: `adjacency_list`, `graph_dfs`, `graph_bfs`, `multi_source_bfs`, `connected_components`, `topological_order_intro`, `grid_graph`
- Allowed problem archetypes: `traverse_connected_state`, `shortest_unweighted_path`, `count_components`, `propagate_from_multiple_sources`, `order_dependencies`
- Relevant false heuristics: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`
- Exact authoring intent: diagnose `traverse_graph_breadth_first` without changing `graph_bfs` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/graph_traversal/graph_bfs.md`
- Future canonical source path: `manual/source/algorithms/graph-traversal/graph-bfs.json`

### `visited_state_and_cycles`

- Unit kind: `direct`
- Primary skill atom: `maintain_graph_visited_state`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `graph_traversal`
- Allowed pattern variants: `adjacency_list`, `graph_dfs`, `graph_bfs`, `multi_source_bfs`, `connected_components`, `topological_order_intro`, `grid_graph`
- Allowed problem archetypes: `traverse_connected_state`, `shortest_unweighted_path`, `count_components`, `propagate_from_multiple_sources`, `order_dependencies`
- Relevant false heuristics: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`
- Exact authoring intent: diagnose `maintain_graph_visited_state` without changing `visited_state_and_cycles` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/graph_traversal/visited_state_and_cycles.md`
- Future canonical source path: `manual/source/algorithms/graph-traversal/visited-state-and-cycles.json`

### `connected_components`

- Unit kind: `direct`
- Primary skill atom: `count_connected_components`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `graph_traversal`
- Allowed pattern variants: `adjacency_list`, `graph_dfs`, `graph_bfs`, `multi_source_bfs`, `connected_components`, `topological_order_intro`, `grid_graph`
- Allowed problem archetypes: `traverse_connected_state`, `shortest_unweighted_path`, `count_components`, `propagate_from_multiple_sources`, `order_dependencies`
- Relevant false heuristics: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`
- Exact authoring intent: diagnose `count_connected_components` without changing `connected_components` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/graph_traversal/connected_components.md`
- Future canonical source path: `manual/source/algorithms/graph-traversal/connected-components.json`

### `multi_source_bfs`

- Unit kind: `direct`
- Primary skill atom: `initialize_multi_source_frontier`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `graph_traversal`
- Allowed pattern variants: `adjacency_list`, `graph_dfs`, `graph_bfs`, `multi_source_bfs`, `connected_components`, `topological_order_intro`, `grid_graph`
- Allowed problem archetypes: `traverse_connected_state`, `shortest_unweighted_path`, `count_components`, `propagate_from_multiple_sources`, `order_dependencies`
- Relevant false heuristics: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`
- Exact authoring intent: diagnose `initialize_multi_source_frontier` without changing `multi_source_bfs` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/graph_traversal/multi_source_bfs.md`
- Future canonical source path: `manual/source/algorithms/graph-traversal/multi-source-bfs.json`

### `grid_as_graph`

- Unit kind: `direct`
- Primary skill atom: `map_grid_cells_to_graph_state`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `graph_traversal`
- Allowed pattern variants: `adjacency_list`, `graph_dfs`, `graph_bfs`, `multi_source_bfs`, `connected_components`, `topological_order_intro`, `grid_graph`
- Allowed problem archetypes: `traverse_connected_state`, `shortest_unweighted_path`, `count_components`, `propagate_from_multiple_sources`, `order_dependencies`
- Relevant false heuristics: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`
- Exact authoring intent: diagnose `map_grid_cells_to_graph_state` without changing `grid_as_graph` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/graph_traversal/grid_as_graph.md`
- Future canonical source path: `manual/source/algorithms/graph-traversal/grid-as-graph.json`

### `topological_order_intro`

- Unit kind: `direct`
- Primary skill atom: `process_dependency_order`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `graph_traversal`
- Allowed pattern variants: `adjacency_list`, `graph_dfs`, `graph_bfs`, `multi_source_bfs`, `connected_components`, `topological_order_intro`, `grid_graph`
- Allowed problem archetypes: `traverse_connected_state`, `shortest_unweighted_path`, `count_components`, `propagate_from_multiple_sources`, `order_dependencies`
- Relevant false heuristics: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`
- Exact authoring intent: diagnose `process_dependency_order` without changing `topological_order_intro` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/graph_traversal/topological_order_intro.md`
- Future canonical source path: `manual/source/algorithms/graph-traversal/topological-order-intro.json`

### `graph_complexity_and_mistakes`

- Unit kind: `direct`
- Primary skill atom: `derive_graph_traversal_complexity`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `graph_traversal`
- Allowed pattern variants: `adjacency_list`, `graph_dfs`, `graph_bfs`, `multi_source_bfs`, `connected_components`, `topological_order_intro`, `grid_graph`
- Allowed problem archetypes: `traverse_connected_state`, `shortest_unweighted_path`, `count_components`, `propagate_from_multiple_sources`, `order_dependencies`
- Relevant false heuristics: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`
- Exact authoring intent: diagnose `derive_graph_traversal_complexity` without changing `graph_complexity_and_mistakes` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `adjacency_matrix_is_always_wrong`, `bfs_is_always_faster_than_dfs`, `marking_visited_on_dequeue_is_always_equivalent`, `tree_visited_rules_apply_unchanged`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/graph_traversal/graph_complexity_and_mistakes.md`
- Future canonical source path: `manual/source/algorithms/graph-traversal/graph-complexity-and-mistakes.json`

## Question authoring contract

Each future canonical batch stays within one roadmap node, one primary mental unit, and one selected legal pattern family. Each item has exactly one primary mental unit and one primary skill atom. Its learning stage must equal the unit’s declared learning stage; selected variants and archetypes must be legal for the selected family.

## Interaction guidance

Use choice interactions for diagnostic decisions, ordering for ordered state transitions or invariants, and complexity interactions for explicit cost-model reasoning. Do not require every interaction type for every unit.

## Coverage model

Every unit should eventually cover recognition, mechanics or reasoning, edge cases, mistake review, and transfer or variation when meaningful. Target item count: NOT_YET_APPROVED.

## Completion criteria

This node is not production-ready until its item counts are approved, real questions receive manual review, technical evidence is emitted, approvals and activation exist, and a release artifact is built.
