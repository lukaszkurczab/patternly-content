---
status: planned
roadmapNodeId: "binary_search"
unitKind: "direct"
unitId: "recognize_binary_search_signal"
contentOwnership: "direct"
primaryPatternFamilyId: "binary_search"
legalPatternFamilyIds:
  - "binary_search"
primarySkillAtomId: "identify_legal_half_discard_rule"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "classic_index_search"
  - "lower_bound"
  - "upper_bound"
  - "binary_search_on_answer"
  - "monotonic_predicate_search"
  - "rotated_array_search"
allowedProblemArchetypeIds:
  - "find_index_in_sorted_input"
  - "find_first_valid_position"
  - "find_last_valid_position"
  - "minimize_feasible_answer"
  - "maximize_feasible_answer"
  - "search_rotated_sequence"
relevantFalseHeuristicIds:
  - "binary_search_is_always_faster"
  - "boundary_choice_is_only_style"
  - "monotonic_predicate_can_change_back_and_forth"
  - "sorted_input_alone_justifies_binary_search"
  - "using_mid_makes_complexity_logarithmic"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/binary-search/recognize-binary-search-signal.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `identify_legal_half_discard_rule` as the primary diagnostic target for `recognize_binary_search_signal` in `binary_search`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `binary_search`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `binary_search_is_always_faster`
- `boundary_choice_is_only_style`
- `monotonic_predicate_can_change_back_and_forth`
- `sorted_input_alone_justifies_binary_search`
- `using_mid_makes_complexity_logarithmic`

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

- Primary skill atom: `identify_legal_half_discard_rule`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `classic_index_search`, `lower_bound`, `upper_bound`, `binary_search_on_answer`, `monotonic_predicate_search`, `rotated_array_search`
- Problem archetypes: `find_index_in_sorted_input`, `find_first_valid_position`, `find_last_valid_position`, `minimize_feasible_answer`, `maximize_feasible_answer`, `search_rotated_sequence`

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
    primarySkillAtomId: "identify_legal_half_discard_rule",
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
