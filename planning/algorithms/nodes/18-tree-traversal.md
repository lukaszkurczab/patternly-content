# Tree Traversal

## Identity

- Roadmap node ID: `tree_traversal`
- Order: 18
- Content ownership: `direct`
- Default learning stage: `pattern_mechanics`
- Primary pattern family: `tree_traversal`
- Involved pattern families: `tree_traversal`
- Prerequisites: none declared

## Learning goal

Enable the learner to apply the primary skills of this node with the correct family boundary and learning-stage expectation.

## Boundaries

### Includes

- Mental units structurally owned by `tree_traversal`.
- Legal pattern families and related variants or archetypes declared by the taxonomy.
- Diagnostic reasoning tied to the unit’s primary skill atom.

### Excludes

- A question whose primary diagnostic target belongs to another mental unit.
- A synthetic pattern family for strategy selection or contrast work.
- Production source JSON until manually authored content exists.

## Mental units

### `tree_structure_and_recursive_contract`

- Unit kind: `direct`
- Primary skill atom: `define_tree_subproblem_contract`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `tree_traversal`
- Allowed pattern variants: `dfs_preorder`, `dfs_inorder`, `dfs_postorder`, `bfs_level_order`, `path_accumulation`, `subtree_aggregation`
- Allowed problem archetypes: `traverse_tree`, `compute_subtree_property`, `root_to_leaf_path`, `level_order_processing`, `validate_tree_property`
- Relevant false heuristics: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`
- Exact authoring intent: diagnose `define_tree_subproblem_contract` without changing `tree_structure_and_recursive_contract` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/tree_traversal/tree_structure_and_recursive_contract.md`
- Future canonical source path: `manual/source/algorithms/tree-traversal/tree-structure-and-recursive-contract.json`

### `dfs_preorder`

- Unit kind: `direct`
- Primary skill atom: `apply_preorder_processing`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `tree_traversal`
- Allowed pattern variants: `dfs_preorder`, `dfs_inorder`, `dfs_postorder`, `bfs_level_order`, `path_accumulation`, `subtree_aggregation`
- Allowed problem archetypes: `traverse_tree`, `compute_subtree_property`, `root_to_leaf_path`, `level_order_processing`, `validate_tree_property`
- Relevant false heuristics: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`
- Exact authoring intent: diagnose `apply_preorder_processing` without changing `dfs_preorder` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/tree_traversal/dfs_preorder.md`
- Future canonical source path: `manual/source/algorithms/tree-traversal/dfs-preorder.json`

### `dfs_inorder`

- Unit kind: `direct`
- Primary skill atom: `apply_inorder_processing`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `tree_traversal`
- Allowed pattern variants: `dfs_preorder`, `dfs_inorder`, `dfs_postorder`, `bfs_level_order`, `path_accumulation`, `subtree_aggregation`
- Allowed problem archetypes: `traverse_tree`, `compute_subtree_property`, `root_to_leaf_path`, `level_order_processing`, `validate_tree_property`
- Relevant false heuristics: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`
- Exact authoring intent: diagnose `apply_inorder_processing` without changing `dfs_inorder` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/tree_traversal/dfs_inorder.md`
- Future canonical source path: `manual/source/algorithms/tree-traversal/dfs-inorder.json`

### `dfs_postorder`

- Unit kind: `direct`
- Primary skill atom: `apply_postorder_processing`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `tree_traversal`
- Allowed pattern variants: `dfs_preorder`, `dfs_inorder`, `dfs_postorder`, `bfs_level_order`, `path_accumulation`, `subtree_aggregation`
- Allowed problem archetypes: `traverse_tree`, `compute_subtree_property`, `root_to_leaf_path`, `level_order_processing`, `validate_tree_property`
- Relevant false heuristics: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`
- Exact authoring intent: diagnose `apply_postorder_processing` without changing `dfs_postorder` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/tree_traversal/dfs_postorder.md`
- Future canonical source path: `manual/source/algorithms/tree-traversal/dfs-postorder.json`

### `bfs_level_order`

- Unit kind: `direct`
- Primary skill atom: `process_tree_by_levels`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `tree_traversal`
- Allowed pattern variants: `dfs_preorder`, `dfs_inorder`, `dfs_postorder`, `bfs_level_order`, `path_accumulation`, `subtree_aggregation`
- Allowed problem archetypes: `traverse_tree`, `compute_subtree_property`, `root_to_leaf_path`, `level_order_processing`, `validate_tree_property`
- Relevant false heuristics: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`
- Exact authoring intent: diagnose `process_tree_by_levels` without changing `bfs_level_order` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/tree_traversal/bfs_level_order.md`
- Future canonical source path: `manual/source/algorithms/tree-traversal/bfs-level-order.json`

### `carry_path_and_aggregate_state`

- Unit kind: `direct`
- Primary skill atom: `carry_state_along_tree_path`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `tree_traversal`
- Allowed pattern variants: `dfs_preorder`, `dfs_inorder`, `dfs_postorder`, `bfs_level_order`, `path_accumulation`, `subtree_aggregation`
- Allowed problem archetypes: `traverse_tree`, `compute_subtree_property`, `root_to_leaf_path`, `level_order_processing`, `validate_tree_property`
- Relevant false heuristics: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`
- Exact authoring intent: diagnose `carry_state_along_tree_path` without changing `carry_path_and_aggregate_state` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/tree_traversal/carry_path_and_aggregate_state.md`
- Future canonical source path: `manual/source/algorithms/tree-traversal/carry-path-and-aggregate-state.json`

### `subtree_return_values`

- Unit kind: `direct`
- Primary skill atom: `derive_parent_result_from_subtrees`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `tree_traversal`
- Allowed pattern variants: `dfs_preorder`, `dfs_inorder`, `dfs_postorder`, `bfs_level_order`, `path_accumulation`, `subtree_aggregation`
- Allowed problem archetypes: `traverse_tree`, `compute_subtree_property`, `root_to_leaf_path`, `level_order_processing`, `validate_tree_property`
- Relevant false heuristics: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`
- Exact authoring intent: diagnose `derive_parent_result_from_subtrees` without changing `subtree_return_values` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/tree_traversal/subtree_return_values.md`
- Future canonical source path: `manual/source/algorithms/tree-traversal/subtree-return-values.json`

### `tree_boundaries_and_null_cases`

- Unit kind: `direct`
- Primary skill atom: `handle_empty_and_leaf_boundaries`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `tree_traversal`
- Allowed pattern variants: `dfs_preorder`, `dfs_inorder`, `dfs_postorder`, `bfs_level_order`, `path_accumulation`, `subtree_aggregation`
- Allowed problem archetypes: `traverse_tree`, `compute_subtree_property`, `root_to_leaf_path`, `level_order_processing`, `validate_tree_property`
- Relevant false heuristics: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`
- Exact authoring intent: diagnose `handle_empty_and_leaf_boundaries` without changing `tree_boundaries_and_null_cases` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/tree_traversal/tree_boundaries_and_null_cases.md`
- Future canonical source path: `manual/source/algorithms/tree-traversal/tree-boundaries-and-null-cases.json`

### `traversal_choice_and_complexity`

- Unit kind: `direct`
- Primary skill atom: `choose_tree_traversal_order`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `tree_traversal`
- Allowed pattern variants: `dfs_preorder`, `dfs_inorder`, `dfs_postorder`, `bfs_level_order`, `path_accumulation`, `subtree_aggregation`
- Allowed problem archetypes: `traverse_tree`, `compute_subtree_property`, `root_to_leaf_path`, `level_order_processing`, `validate_tree_property`
- Relevant false heuristics: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`
- Exact authoring intent: diagnose `choose_tree_traversal_order` without changing `traversal_choice_and_complexity` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `global_state_is_always_simpler`, `null_children_need_no_contract`, `traversal_order_never_matters`, `tree_dfs_and_graph_dfs_are_identical`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/tree_traversal/traversal_choice_and_complexity.md`
- Future canonical source path: `manual/source/algorithms/tree-traversal/traversal-choice-and-complexity.json`

## Question authoring contract

Each future canonical batch stays within one roadmap node, one primary mental unit, and one selected legal pattern family. Each item has exactly one primary mental unit and one primary skill atom. Its learning stage must equal the unit’s declared learning stage; selected variants and archetypes must be legal for the selected family.

## Interaction guidance

Use choice interactions for diagnostic decisions, ordering for ordered state transitions or invariants, and complexity interactions for explicit cost-model reasoning. Do not require every interaction type for every unit.

## Coverage model

Every unit should eventually cover recognition, mechanics or reasoning, edge cases, mistake review, and transfer or variation when meaningful. Target item count: NOT_YET_APPROVED.

## Completion criteria

This node is not production-ready until its item counts are approved, real questions receive manual review, technical evidence is emitted, approvals and activation exist, and a release artifact is built.
