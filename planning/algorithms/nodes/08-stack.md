# Stack

## Identity

- Roadmap node ID: `stack`
- Order: 8
- Content ownership: `direct`
- Default learning stage: `pattern_mechanics`
- Primary pattern family: `stack`
- Involved pattern families: `stack`, `monotonic_stack`
- Prerequisites: none declared

## Learning goal

Enable the learner to apply the primary skills of this node with the correct family boundary and learning-stage expectation.

## Boundaries

### Includes

- Mental units structurally owned by `stack`.
- Legal pattern families and related variants or archetypes declared by the taxonomy.
- Diagnostic reasoning tied to the unit’s primary skill atom.

### Excludes

- A question whose primary diagnostic target belongs to another mental unit.
- A synthetic pattern family for strategy selection or contrast work.
- Production source JSON until manually authored content exists.

## Mental units

### `recognize_lifo_signal`

- Unit kind: `direct`
- Primary skill atom: `identify_last_unresolved_state`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `stack`
- Allowed pattern variants: `nested_structure_validation`, `undo_or_previous_state`, `monotonic_increasing_stack`, `monotonic_decreasing_stack`, `next_greater_smaller`
- Allowed problem archetypes: `validate_nested_structure`, `nearest_greater_or_smaller`, `deferred_resolution`, `undo_previous_state`
- Relevant false heuristics: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`
- Exact authoring intent: diagnose `identify_last_unresolved_state` without changing `recognize_lifo_signal` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/stack/recognize_lifo_signal.md`
- Future canonical source path: `manual/source/algorithms/stack/recognize-lifo-signal.json`

### `push_pop_top_mechanics`

- Unit kind: `direct`
- Primary skill atom: `trace_stack_operation`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `stack`
- Allowed pattern variants: `nested_structure_validation`, `undo_or_previous_state`, `monotonic_increasing_stack`, `monotonic_decreasing_stack`, `next_greater_smaller`
- Allowed problem archetypes: `validate_nested_structure`, `nearest_greater_or_smaller`, `deferred_resolution`, `undo_previous_state`
- Relevant false heuristics: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`
- Exact authoring intent: diagnose `trace_stack_operation` without changing `push_pop_top_mechanics` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/stack/push_pop_top_mechanics.md`
- Future canonical source path: `manual/source/algorithms/stack/push-pop-top-mechanics.json`

### `nested_structure_validation`

- Unit kind: `direct`
- Primary skill atom: `match_nested_structure_with_stack`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `stack`
- Allowed pattern variants: `nested_structure_validation`, `undo_or_previous_state`, `monotonic_increasing_stack`, `monotonic_decreasing_stack`, `next_greater_smaller`
- Allowed problem archetypes: `validate_nested_structure`, `nearest_greater_or_smaller`, `deferred_resolution`, `undo_previous_state`
- Relevant false heuristics: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`
- Exact authoring intent: diagnose `match_nested_structure_with_stack` without changing `nested_structure_validation` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/stack/nested_structure_validation.md`
- Future canonical source path: `manual/source/algorithms/stack/nested-structure-validation.json`

### `undo_and_previous_state`

- Unit kind: `direct`
- Primary skill atom: `restore_previous_state_from_stack`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `stack`
- Allowed pattern variants: `nested_structure_validation`, `undo_or_previous_state`, `monotonic_increasing_stack`, `monotonic_decreasing_stack`, `next_greater_smaller`
- Allowed problem archetypes: `validate_nested_structure`, `nearest_greater_or_smaller`, `deferred_resolution`, `undo_previous_state`
- Relevant false heuristics: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`
- Exact authoring intent: diagnose `restore_previous_state_from_stack` without changing `undo_and_previous_state` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/stack/undo_and_previous_state.md`
- Future canonical source path: `manual/source/algorithms/stack/undo-and-previous-state.json`

### `recognize_monotonic_stack_signal`

- Unit kind: `direct`
- Primary skill atom: `identify_dominated_candidate_signal`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `monotonic_stack`
- Allowed pattern variants: `nested_structure_validation`, `undo_or_previous_state`, `monotonic_increasing_stack`, `monotonic_decreasing_stack`, `next_greater_smaller`
- Allowed problem archetypes: `validate_nested_structure`, `nearest_greater_or_smaller`, `deferred_resolution`, `undo_previous_state`
- Relevant false heuristics: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`
- Exact authoring intent: diagnose `identify_dominated_candidate_signal` without changing `recognize_monotonic_stack_signal` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/stack/recognize_monotonic_stack_signal.md`
- Future canonical source path: `manual/source/algorithms/stack/recognize-monotonic-stack-signal.json`

### `maintain_monotonic_stack_invariant`

- Unit kind: `direct`
- Primary skill atom: `maintain_monotonic_stack_order`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `monotonic_stack`
- Allowed pattern variants: `nested_structure_validation`, `undo_or_previous_state`, `monotonic_increasing_stack`, `monotonic_decreasing_stack`, `next_greater_smaller`
- Allowed problem archetypes: `validate_nested_structure`, `nearest_greater_or_smaller`, `deferred_resolution`, `undo_previous_state`
- Relevant false heuristics: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`
- Exact authoring intent: diagnose `maintain_monotonic_stack_order` without changing `maintain_monotonic_stack_invariant` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/stack/maintain_monotonic_stack_invariant.md`
- Future canonical source path: `manual/source/algorithms/stack/maintain-monotonic-stack-invariant.json`

### `next_greater_smaller_boundaries`

- Unit kind: `direct`
- Primary skill atom: `resolve_nearest_greater_or_smaller`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `monotonic_stack`
- Allowed pattern variants: `nested_structure_validation`, `undo_or_previous_state`, `monotonic_increasing_stack`, `monotonic_decreasing_stack`, `next_greater_smaller`
- Allowed problem archetypes: `validate_nested_structure`, `nearest_greater_or_smaller`, `deferred_resolution`, `undo_previous_state`
- Relevant false heuristics: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`
- Exact authoring intent: diagnose `resolve_nearest_greater_or_smaller` without changing `next_greater_smaller_boundaries` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/stack/next_greater_smaller_boundaries.md`
- Future canonical source path: `manual/source/algorithms/stack/next-greater-smaller-boundaries.json`

### `stack_complexity_and_mistake_review`

- Unit kind: `direct`
- Primary skill atom: `explain_amortized_stack_processing`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `stack`
- Allowed pattern variants: `nested_structure_validation`, `undo_or_previous_state`, `monotonic_increasing_stack`, `monotonic_decreasing_stack`, `next_greater_smaller`
- Allowed problem archetypes: `validate_nested_structure`, `nearest_greater_or_smaller`, `deferred_resolution`, `undo_previous_state`
- Relevant false heuristics: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`
- Exact authoring intent: diagnose `explain_amortized_stack_processing` without changing `stack_complexity_and_mistake_review` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `each_item_can_be_popped_many_times`, `monotonic_stack_stores_every_item`, `queue_and_stack_order_are_equivalent`, `stack_means_recursion`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/stack/stack_complexity_and_mistake_review.md`
- Future canonical source path: `manual/source/algorithms/stack/stack-complexity-and-mistake-review.json`

## Question authoring contract

Each future canonical batch stays within one roadmap node, one primary mental unit, and one selected legal pattern family. Each item has exactly one primary mental unit and one primary skill atom. Its learning stage must equal the unit’s declared learning stage; selected variants and archetypes must be legal for the selected family.

## Interaction guidance

Use choice interactions for diagnostic decisions, ordering for ordered state transitions or invariants, and complexity interactions for explicit cost-model reasoning. Do not require every interaction type for every unit.

## Coverage model

Every unit should eventually cover recognition, mechanics or reasoning, edge cases, mistake review, and transfer or variation when meaningful. Target item count: NOT_YET_APPROVED.

## Completion criteria

This node is not production-ready until its item counts are approved, real questions receive manual review, technical evidence is emitted, approvals and activation exist, and a release artifact is built.
