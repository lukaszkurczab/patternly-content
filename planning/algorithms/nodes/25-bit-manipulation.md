# Bit Manipulation

## Identity

- Roadmap node ID: `bit_manipulation`
- Order: 25
- Content ownership: `direct`
- Default learning stage: `pattern_mechanics`
- Primary pattern family: `bit_manipulation`
- Involved pattern families: `bit_manipulation`
- Prerequisites: none declared

## Learning goal

Enable the learner to apply the primary skills of this node with the correct family boundary and learning-stage expectation.

## Boundaries

### Includes

- Mental units structurally owned by `bit_manipulation`.
- Legal pattern families and related variants or archetypes declared by the taxonomy.
- Diagnostic reasoning tied to the unit’s primary skill atom.

### Excludes

- A question whose primary diagnostic target belongs to another mental unit.
- A synthetic pattern family for strategy selection or contrast work.
- Production source JSON until manually authored content exists.

## Mental units

### `binary_representation_and_masks`

- Unit kind: `direct`
- Primary skill atom: `interpret_integer_bit_representation`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `bit_manipulation`
- Allowed pattern variants: `bit_mask`, `xor_cancellation`, `lowest_set_bit`, `subset_mask`
- Allowed problem archetypes: `encode_boolean_state`, `find_unique_element`, `enumerate_subsets_by_mask`, `count_set_bits`
- Relevant false heuristics: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`
- Exact authoring intent: diagnose `interpret_integer_bit_representation` without changing `binary_representation_and_masks` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/bit_manipulation/binary_representation_and_masks.md`
- Future canonical source path: `manual/source/algorithms/bit-manipulation/binary-representation-and-masks.json`

### `test_set_clear_toggle_bits`

- Unit kind: `direct`
- Primary skill atom: `manipulate_selected_bit`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `bit_manipulation`
- Allowed pattern variants: `bit_mask`, `xor_cancellation`, `lowest_set_bit`, `subset_mask`
- Allowed problem archetypes: `encode_boolean_state`, `find_unique_element`, `enumerate_subsets_by_mask`, `count_set_bits`
- Relevant false heuristics: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`
- Exact authoring intent: diagnose `manipulate_selected_bit` without changing `test_set_clear_toggle_bits` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/bit_manipulation/test_set_clear_toggle_bits.md`
- Future canonical source path: `manual/source/algorithms/bit-manipulation/test-set-clear-toggle-bits.json`

### `shifts_and_sign_behavior`

- Unit kind: `direct`
- Primary skill atom: `reason_about_bit_shift_behavior`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `bit_manipulation`
- Allowed pattern variants: `bit_mask`, `xor_cancellation`, `lowest_set_bit`, `subset_mask`
- Allowed problem archetypes: `encode_boolean_state`, `find_unique_element`, `enumerate_subsets_by_mask`, `count_set_bits`
- Relevant false heuristics: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`
- Exact authoring intent: diagnose `reason_about_bit_shift_behavior` without changing `shifts_and_sign_behavior` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/bit_manipulation/shifts_and_sign_behavior.md`
- Future canonical source path: `manual/source/algorithms/bit-manipulation/shifts-and-sign-behavior.json`

### `xor_cancellation`

- Unit kind: `direct`
- Primary skill atom: `apply_xor_cancellation`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `bit_manipulation`
- Allowed pattern variants: `bit_mask`, `xor_cancellation`, `lowest_set_bit`, `subset_mask`
- Allowed problem archetypes: `encode_boolean_state`, `find_unique_element`, `enumerate_subsets_by_mask`, `count_set_bits`
- Relevant false heuristics: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`
- Exact authoring intent: diagnose `apply_xor_cancellation` without changing `xor_cancellation` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/bit_manipulation/xor_cancellation.md`
- Future canonical source path: `manual/source/algorithms/bit-manipulation/xor-cancellation.json`

### `count_bits_and_lowest_set_bit`

- Unit kind: `direct`
- Primary skill atom: `remove_lowest_set_bit`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `bit_manipulation`
- Allowed pattern variants: `bit_mask`, `xor_cancellation`, `lowest_set_bit`, `subset_mask`
- Allowed problem archetypes: `encode_boolean_state`, `find_unique_element`, `enumerate_subsets_by_mask`, `count_set_bits`
- Relevant false heuristics: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`
- Exact authoring intent: diagnose `remove_lowest_set_bit` without changing `count_bits_and_lowest_set_bit` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/bit_manipulation/count_bits_and_lowest_set_bit.md`
- Future canonical source path: `manual/source/algorithms/bit-manipulation/count-bits-and-lowest-set-bit.json`

### `subset_mask_enumeration_intro`

- Unit kind: `direct`
- Primary skill atom: `enumerate_subset_by_bitmask`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `bit_manipulation`
- Allowed pattern variants: `bit_mask`, `xor_cancellation`, `lowest_set_bit`, `subset_mask`
- Allowed problem archetypes: `encode_boolean_state`, `find_unique_element`, `enumerate_subsets_by_mask`, `count_set_bits`
- Relevant false heuristics: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`
- Exact authoring intent: diagnose `enumerate_subset_by_bitmask` without changing `subset_mask_enumeration_intro` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/bit_manipulation/subset_mask_enumeration_intro.md`
- Future canonical source path: `manual/source/algorithms/bit-manipulation/subset-mask-enumeration-intro.json`

### `bitmask_state_representation`

- Unit kind: `direct`
- Primary skill atom: `encode_boolean_state_in_mask`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `bit_manipulation`
- Allowed pattern variants: `bit_mask`, `xor_cancellation`, `lowest_set_bit`, `subset_mask`
- Allowed problem archetypes: `encode_boolean_state`, `find_unique_element`, `enumerate_subsets_by_mask`, `count_set_bits`
- Relevant false heuristics: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`
- Exact authoring intent: diagnose `encode_boolean_state_in_mask` without changing `bitmask_state_representation` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/bit_manipulation/bitmask_state_representation.md`
- Future canonical source path: `manual/source/algorithms/bit-manipulation/bitmask-state-representation.json`

### `bit_manipulation_mistake_review`

- Unit kind: `direct`
- Primary skill atom: `diagnose_bit_width_or_sign_assumption`
- Learning stage: `pattern_mechanics`
- Legal pattern families: `bit_manipulation`
- Allowed pattern variants: `bit_mask`, `xor_cancellation`, `lowest_set_bit`, `subset_mask`
- Allowed problem archetypes: `encode_boolean_state`, `find_unique_element`, `enumerate_subsets_by_mask`, `count_set_bits`
- Relevant false heuristics: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`
- Exact authoring intent: diagnose `diagnose_bit_width_or_sign_assumption` without changing `bit_manipulation_mistake_review` into a multi-unit batch.
- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.
- Common mistakes to diagnose: `bit_tricks_need_no_integer_width_model`, `masks_are_only_performance_optimizations`, `shifts_equal_division_for_all_signed_values`, `xor_is_general_arithmetic_addition`.
- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.
- Target stub path: `planning/algorithms/question-stubs/bit_manipulation/bit_manipulation_mistake_review.md`
- Future canonical source path: `manual/source/algorithms/bit-manipulation/bit-manipulation-mistake-review.json`

## Question authoring contract

Each future canonical batch stays within one roadmap node, one primary mental unit, and one selected legal pattern family. Each item has exactly one primary mental unit and one primary skill atom. Its learning stage must equal the unit’s declared learning stage; selected variants and archetypes must be legal for the selected family.

## Interaction guidance

Use choice interactions for diagnostic decisions, ordering for ordered state transitions or invariants, and complexity interactions for explicit cost-model reasoning. Do not require every interaction type for every unit.

## Coverage model

Every unit should eventually cover recognition, mechanics or reasoning, edge cases, mistake review, and transfer or variation when meaningful. Target item count: NOT_YET_APPROVED.

## Completion criteria

This node is not production-ready until its item counts are approved, real questions receive manual review, technical evidence is emitted, approvals and activation exist, and a release artifact is built.
