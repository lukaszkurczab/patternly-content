---
status: planned
roadmapNodeId: "sliding_window"
unitKind: "direct"
unitId: "recognize_sliding_window_signal"
contentOwnership: "direct"
primaryPatternFamilyId: "sliding_window"
legalPatternFamilyIds:
  - "sliding_window"
primarySkillAtomId: "identify_contiguous_window_signal"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "fixed_size_window"
  - "variable_size_positive_numbers"
  - "frequency_constraint"
  - "at_most_k_window"
allowedProblemArchetypeIds:
  - "contiguous_range_optimum"
  - "longest_valid_window"
  - "shortest_threshold_window"
  - "fixed_length_aggregate"
relevantFalseHeuristicIds:
  - "answer_updates_only_during_shrink"
  - "every_subarray_problem_is_sliding_window"
  - "negative_values_never_break_window"
  - "shrink_until_answer_changes"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/sliding-window/recognize-sliding-window-signal.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `identify_contiguous_window_signal` as the primary diagnostic target for `recognize_sliding_window_signal` in `sliding_window`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `sliding_window`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `answer_updates_only_during_shrink`
- `every_subarray_problem_is_sliding_window`
- `negative_values_never_break_window`
- `shrink_until_answer_changes`

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

- Primary skill atom: `identify_contiguous_window_signal`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `fixed_size_window`, `variable_size_positive_numbers`, `frequency_constraint`, `at_most_k_window`
- Problem archetypes: `contiguous_range_optimum`, `longest_valid_window`, `shortest_threshold_window`, `fixed_length_aggregate`

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
    primarySkillAtomId: "identify_contiguous_window_signal",
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
