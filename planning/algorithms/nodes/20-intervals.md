# Intervals

## Identity

- Roadmap node ID: `intervals`
- Order: 20
- Content ownership: `direct`
- Default learning stage: `pattern_mechanics`
- Primary pattern family: `intervals`
- Involved pattern families: `intervals`
- Prerequisites: none declared

## Learning goal

Enable the learner to apply the primary skills of this node with the correct family boundary and learning-stage expectation.

## Boundaries

### Includes

- Mental units structurally owned by `intervals`.
- Legal pattern families and related variants or archetypes declared by the taxonomy.
- Diagnostic reasoning tied to the unit’s primary skill atom.

### Excludes

- A question whose primary diagnostic target belongs to another mental unit.
- A synthetic pattern family for strategy selection or contrast work.
- Production source JSON until manually authored content exists.

## Mental units

### `interval_representation_and_endpoint_semantics`

- Unit kind: `direct`
- Primary skill atom: `define_interval_endpoint_contract`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `intervals`
- Allowed pattern variants: `merge_overlaps`, `insert_interval`, `sweep_line_intro`, `interval_resource_count`
- Allowed problem archetypes: `merge_or_compare_intervals`, `detect_schedule_conflict`, `count_concurrent_intervals`, `insert_into_merged_intervals`
- Relevant false heuristics: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`
- Exact authoring intent: diagnose `define_interval_endpoint_contract` without changing `interval_representation_and_endpoint_semantics` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/intervals/interval_representation_and_endpoint_semantics.md`
- Future canonical source path: `manual/source/algorithms/intervals/interval-representation-and-endpoint-semantics.json`

### `sort_intervals_for_processing`

- Unit kind: `direct`
- Primary skill atom: `choose_interval_sort_key`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `intervals`
- Allowed pattern variants: `merge_overlaps`, `insert_interval`, `sweep_line_intro`, `interval_resource_count`
- Allowed problem archetypes: `merge_or_compare_intervals`, `detect_schedule_conflict`, `count_concurrent_intervals`, `insert_into_merged_intervals`
- Relevant false heuristics: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`
- Exact authoring intent: diagnose `choose_interval_sort_key` without changing `sort_intervals_for_processing` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/intervals/sort_intervals_for_processing.md`
- Future canonical source path: `manual/source/algorithms/intervals/sort-intervals-for-processing.json`

### `detect_overlap`

- Unit kind: `direct`
- Primary skill atom: `evaluate_interval_overlap`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `intervals`
- Allowed pattern variants: `merge_overlaps`, `insert_interval`, `sweep_line_intro`, `interval_resource_count`
- Allowed problem archetypes: `merge_or_compare_intervals`, `detect_schedule_conflict`, `count_concurrent_intervals`, `insert_into_merged_intervals`
- Relevant false heuristics: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`
- Exact authoring intent: diagnose `evaluate_interval_overlap` without changing `detect_overlap` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/intervals/detect_overlap.md`
- Future canonical source path: `manual/source/algorithms/intervals/detect-overlap.json`

### `merge_overlaps`

- Unit kind: `direct`
- Primary skill atom: `merge_overlapping_intervals`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `intervals`
- Allowed pattern variants: `merge_overlaps`, `insert_interval`, `sweep_line_intro`, `interval_resource_count`
- Allowed problem archetypes: `merge_or_compare_intervals`, `detect_schedule_conflict`, `count_concurrent_intervals`, `insert_into_merged_intervals`
- Relevant false heuristics: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`
- Exact authoring intent: diagnose `merge_overlapping_intervals` without changing `merge_overlaps` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/intervals/merge_overlaps.md`
- Future canonical source path: `manual/source/algorithms/intervals/merge-overlaps.json`

### `insert_interval`

- Unit kind: `direct`
- Primary skill atom: `insert_interval_into_merged_sequence`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `intervals`
- Allowed pattern variants: `merge_overlaps`, `insert_interval`, `sweep_line_intro`, `interval_resource_count`
- Allowed problem archetypes: `merge_or_compare_intervals`, `detect_schedule_conflict`, `count_concurrent_intervals`, `insert_into_merged_intervals`
- Relevant false heuristics: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`
- Exact authoring intent: diagnose `insert_interval_into_merged_sequence` without changing `insert_interval` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/intervals/insert_interval.md`
- Future canonical source path: `manual/source/algorithms/intervals/insert-interval.json`

### `meeting_rooms_and_resource_count`

- Unit kind: `direct`
- Primary skill atom: `count_concurrent_intervals`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `intervals`
- Allowed pattern variants: `merge_overlaps`, `insert_interval`, `sweep_line_intro`, `interval_resource_count`
- Allowed problem archetypes: `merge_or_compare_intervals`, `detect_schedule_conflict`, `count_concurrent_intervals`, `insert_into_merged_intervals`
- Relevant false heuristics: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`
- Exact authoring intent: diagnose `count_concurrent_intervals` without changing `meeting_rooms_and_resource_count` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/intervals/meeting_rooms_and_resource_count.md`
- Future canonical source path: `manual/source/algorithms/intervals/meeting-rooms-and-resource-count.json`

### `sweep_line_intro`

- Unit kind: `direct`
- Primary skill atom: `process_interval_events_in_order`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `intervals`
- Allowed pattern variants: `merge_overlaps`, `insert_interval`, `sweep_line_intro`, `interval_resource_count`
- Allowed problem archetypes: `merge_or_compare_intervals`, `detect_schedule_conflict`, `count_concurrent_intervals`, `insert_into_merged_intervals`
- Relevant false heuristics: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`
- Exact authoring intent: diagnose `process_interval_events_in_order` without changing `sweep_line_intro` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/intervals/sweep_line_intro.md`
- Future canonical source path: `manual/source/algorithms/intervals/sweep-line-intro.json`

### `interval_boundary_mistake_review`

- Unit kind: `direct`
- Primary skill atom: `diagnose_interval_endpoint_error`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `intervals`
- Allowed pattern variants: `merge_overlaps`, `insert_interval`, `sweep_line_intro`, `interval_resource_count`
- Allowed problem archetypes: `merge_or_compare_intervals`, `detect_schedule_conflict`, `count_concurrent_intervals`, `insert_into_merged_intervals`
- Relevant false heuristics: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`
- Exact authoring intent: diagnose `diagnose_interval_endpoint_error` without changing `interval_boundary_mistake_review` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `interval_length_determines_overlap`, `sorting_by_end_is_always_correct`, `sweep_events_need_no_tie_rule`, `touching_endpoints_always_overlap`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/intervals/interval_boundary_mistake_review.md`
- Future canonical source path: `manual/source/algorithms/intervals/interval-boundary-mistake-review.json`

## Question authoring contract

Each future canonical batch stays within one roadmap node, one primary mental unit, and one selected legal pattern family. Each item has exactly one primary mental unit and one primary skill atom. Its learning stage must equal the unit’s declared learning stage; selected variants and archetypes must be legal for the selected family.

## Interaction guidance

Use choice interactions for diagnostic decisions, ordering for ordered state transitions or invariants, and complexity interactions for explicit cost-model reasoning. Do not require every interaction type for every unit.

## Coverage model

Every unit should eventually cover recognition, mechanics or reasoning, edge cases, mistake review, and transfer or variation when meaningful. Target item count: NOT_YET_APPROVED.

## Completion criteria

This node is not production-ready until its item counts are approved, real questions receive manual review, technical evidence is emitted, approvals and activation exist, and a release artifact is built.
