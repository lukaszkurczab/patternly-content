# Sliding Window

## Identity

- Roadmap node ID: `sliding_window`
- Order: 5
- Content ownership: `direct`
- Default learning stage: `pattern_mechanics`
- Primary pattern family: `sliding_window`
- Involved pattern families: `sliding_window`
- Prerequisites: none declared

## Learning goal

Enable the learner to apply the primary skills of this node with the correct family boundary and learning-stage expectation.

## Boundaries

### Includes

- Mental units structurally owned by `sliding_window`.
- Legal pattern families and related variants or archetypes declared by the taxonomy.
- Diagnostic reasoning tied to the unit’s primary skill atom.

### Excludes

- A question whose primary diagnostic target belongs to another mental unit.
- A synthetic pattern family for strategy selection or contrast work.
- Production source JSON until manually authored content exists.

## Mental units

### `recognize_sliding_window_signal`

- Unit kind: `direct`
- Primary skill atom: `identify_contiguous_window_signal`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `sliding_window`
- Allowed pattern variants: `fixed_size_window`, `variable_size_positive_numbers`, `frequency_constraint`, `at_most_k_window`
- Allowed problem archetypes: `contiguous_range_optimum`, `longest_valid_window`, `shortest_threshold_window`, `fixed_length_aggregate`
- Relevant false heuristics: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`
- Exact authoring intent: diagnose `identify_contiguous_window_signal` without changing `recognize_sliding_window_signal` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/sliding_window/recognize_sliding_window_signal.md`
- Future canonical source path: `manual/source/algorithms/sliding-window/recognize-sliding-window-signal.json`

### `fixed_size_window`

- Unit kind: `direct`
- Primary skill atom: `maintain_fixed_size_window_state`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `sliding_window`
- Allowed pattern variants: `fixed_size_window`, `variable_size_positive_numbers`, `frequency_constraint`, `at_most_k_window`
- Allowed problem archetypes: `contiguous_range_optimum`, `longest_valid_window`, `shortest_threshold_window`, `fixed_length_aggregate`
- Relevant false heuristics: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`
- Exact authoring intent: diagnose `maintain_fixed_size_window_state` without changing `fixed_size_window` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/sliding_window/fixed_size_window.md`
- Future canonical source path: `manual/source/algorithms/sliding-window/fixed-size-window.json`

### `variable_size_monotonic_window`

- Unit kind: `direct`
- Primary skill atom: `maintain_monotonic_shrink_rule`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `sliding_window`
- Allowed pattern variants: `fixed_size_window`, `variable_size_positive_numbers`, `frequency_constraint`, `at_most_k_window`
- Allowed problem archetypes: `contiguous_range_optimum`, `longest_valid_window`, `shortest_threshold_window`, `fixed_length_aggregate`
- Relevant false heuristics: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`
- Exact authoring intent: diagnose `maintain_monotonic_shrink_rule` without changing `variable_size_monotonic_window` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/sliding_window/variable_size_monotonic_window.md`
- Future canonical source path: `manual/source/algorithms/sliding-window/variable-size-monotonic-window.json`

### `frequency_constrained_window`

- Unit kind: `direct`
- Primary skill atom: `maintain_frequency_constrained_window`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `sliding_window`
- Allowed pattern variants: `fixed_size_window`, `variable_size_positive_numbers`, `frequency_constraint`, `at_most_k_window`
- Allowed problem archetypes: `contiguous_range_optimum`, `longest_valid_window`, `shortest_threshold_window`, `fixed_length_aggregate`
- Relevant false heuristics: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`
- Exact authoring intent: diagnose `maintain_frequency_constrained_window` without changing `frequency_constrained_window` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/sliding_window/frequency_constrained_window.md`
- Future canonical source path: `manual/source/algorithms/sliding-window/frequency-constrained-window.json`

### `expand_shrink_update_order`

- Unit kind: `direct`
- Primary skill atom: `order_window_state_updates`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `sliding_window`
- Allowed pattern variants: `fixed_size_window`, `variable_size_positive_numbers`, `frequency_constraint`, `at_most_k_window`
- Allowed problem archetypes: `contiguous_range_optimum`, `longest_valid_window`, `shortest_threshold_window`, `fixed_length_aggregate`
- Relevant false heuristics: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`
- Exact authoring intent: diagnose `order_window_state_updates` without changing `expand_shrink_update_order` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/sliding_window/expand_shrink_update_order.md`
- Future canonical source path: `manual/source/algorithms/sliding-window/expand-shrink-update-order.json`

### `answer_update_and_boundaries`

- Unit kind: `direct`
- Primary skill atom: `update_window_answer_at_legal_state`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `sliding_window`
- Allowed pattern variants: `fixed_size_window`, `variable_size_positive_numbers`, `frequency_constraint`, `at_most_k_window`
- Allowed problem archetypes: `contiguous_range_optimum`, `longest_valid_window`, `shortest_threshold_window`, `fixed_length_aggregate`
- Relevant false heuristics: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`
- Exact authoring intent: diagnose `update_window_answer_at_legal_state` without changing `answer_update_and_boundaries` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/sliding_window/answer_update_and_boundaries.md`
- Future canonical source path: `manual/source/algorithms/sliding-window/answer-update-and-boundaries.json`

### `invalid_window_signals`

- Unit kind: `direct`
- Primary skill atom: `detect_simple_window_failure_signal`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `sliding_window`
- Allowed pattern variants: `fixed_size_window`, `variable_size_positive_numbers`, `frequency_constraint`, `at_most_k_window`
- Allowed problem archetypes: `contiguous_range_optimum`, `longest_valid_window`, `shortest_threshold_window`, `fixed_length_aggregate`
- Relevant false heuristics: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`
- Exact authoring intent: diagnose `detect_simple_window_failure_signal` without changing `invalid_window_signals` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/sliding_window/invalid_window_signals.md`
- Future canonical source path: `manual/source/algorithms/sliding-window/invalid-window-signals.json`

### `window_complexity_and_mistake_review`

- Unit kind: `direct`
- Primary skill atom: `explain_linear_window_complexity`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `sliding_window`
- Allowed pattern variants: `fixed_size_window`, `variable_size_positive_numbers`, `frequency_constraint`, `at_most_k_window`
- Allowed problem archetypes: `contiguous_range_optimum`, `longest_valid_window`, `shortest_threshold_window`, `fixed_length_aggregate`
- Relevant false heuristics: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`
- Exact authoring intent: diagnose `explain_linear_window_complexity` without changing `window_complexity_and_mistake_review` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `answer_updates_only_during_shrink`, `every_subarray_problem_is_sliding_window`, `negative_values_never_break_window`, `shrink_until_answer_changes`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/sliding_window/window_complexity_and_mistake_review.md`
- Future canonical source path: `manual/source/algorithms/sliding-window/window-complexity-and-mistake-review.json`

## Question authoring contract

Each future canonical batch stays within one roadmap node, one primary mental unit, and one selected legal pattern family. Each item has exactly one primary mental unit and one primary skill atom. Its learning stage must equal the unit’s declared learning stage; selected variants and archetypes must be legal for the selected family.

## Interaction guidance

Use choice interactions for diagnostic decisions, ordering for ordered state transitions or invariants, and complexity interactions for explicit cost-model reasoning. Do not require every interaction type for every unit.

## Coverage model

Every unit should eventually cover recognition, mechanics or reasoning, edge cases, mistake review, and transfer or variation when meaningful. Target item count: NOT_YET_APPROVED.

## Completion criteria

This node is not production-ready until its item counts are approved, real questions receive manual review, technical evidence is emitted, approvals and activation exist, and a release artifact is built.
