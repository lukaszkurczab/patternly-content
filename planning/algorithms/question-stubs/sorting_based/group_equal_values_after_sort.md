---
status: planned
roadmapNodeId: "sorting_based"
unitKind: "direct"
unitId: "group_equal_values_after_sort"
contentOwnership: "direct"
primaryPatternFamilyId: "sorting_based"
legalPatternFamilyIds:
  - "sorting_based"
primarySkillAtomId: "process_equal_value_runs"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "sort_then_scan"
  - "sort_then_two_pointers"
  - "grouping_after_sort"
  - "custom_key_sort"
allowedProblemArchetypeIds:
  - "reveal_ordered_structure"
  - "group_equal_values"
  - "pair_search_after_sort"
  - "process_by_priority_key"
relevantFalseHeuristicIds:
  - "custom_comparator_needs_no_tie_break"
  - "original_positions_never_matter"
  - "sorting_always_improves_solution"
  - "sorting_is_linear"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/sorting-based/group-equal-values-after-sort.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `process_equal_value_runs` as the primary diagnostic target for `group_equal_values_after_sort` in `sorting_based`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `sorting_based`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `custom_comparator_needs_no_tie_break`
- `original_positions_never_matter`
- `sorting_always_improves_solution`
- `sorting_is_linear`

## Required coverage

- Recognition when a signal is relevant.
- Mechanics or reasoning required by the primary skill.
- Relevant edge cases and boundary conditions.
- Mistake review through plausible distractors.
- Transfer or variation when it changes the decision boundary.

## Preferred interaction types

- Choice (single or multiple) for strategy selection and misconception diagnosis.
- Ordering for process or invariant sequencing.
- Complexity for cost-model reasoning when applicable.

## Allowed taxonomy

- Primary skill atom: `process_equal_value_runs`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `sort_then_scan`, `sort_then_two_pointers`, `grouping_after_sort`, `custom_key_sort`
- Problem archetypes: `reveal_ordered_structure`, `group_equal_values`, `pair_search_after_sort`, `process_by_priority_key`

## Forbidden scope

- Do not make another mental unit the primary target.
- Do not create a source file until at least one independently authored, human-reviewed item exists.
- Do not copy placeholder values from the item shape below into canonical ingress.

## Required item format

```ts
{
  id: "REPLACE_ME",
  prompt: "REPLACE_ME",
  interaction: {
    type: "choice",
    selectionMode: "single",
    options: [
      { id: "option_a", text: "REPLACE_ME" },
      { id: "option_b", text: "REPLACE_ME" }
    ],
    acceptedOptionIds: ["option_a"]
  },
  scoringContract: {
    type: "choice",
    resultSemantics: "exact_selected_set_with_partial_v1"
  },
  feedback: {
    reason: "REPLACE_ME",
    details: "REPLACE_ME",
    wrongOptionExplanationsByOptionId: { option_b: "REPLACE_ME" }
  },
  taxonomy: {
    primarySkillAtomId: "process_equal_value_runs",
    secondarySkillAtomIds: [],
    learningStage: "pattern_mechanics",
    patternVariantId: "OPTIONAL",
    problemArchetypeId: "OPTIONAL"
  }
}
```

This is an authoring shape example, not a real question. Do not copy placeholder values into canonical ingress.

## Review checklist

- [ ] The primary skill atom is the exact ID in this stub.
- [ ] The selected family, variant, and archetype are legal for this unit.
- [ ] The item tests reasoning rather than keyword matching.
- [ ] Feedback explains every incorrect choice where required.
- [ ] A canonical source JSON will be created only after manual authoring and review.
