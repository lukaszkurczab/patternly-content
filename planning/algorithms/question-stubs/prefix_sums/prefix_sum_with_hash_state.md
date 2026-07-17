---
status: planned
roadmapNodeId: "prefix_sums"
unitKind: "direct"
unitId: "prefix_sum_with_hash_state"
contentOwnership: "direct"
primaryPatternFamilyId: "prefix_sums"
legalPatternFamilyIds:
  - "prefix_sums"
primarySkillAtomId: "match_required_prior_prefix"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "one_dimensional_prefix"
  - "range_sum_query"
  - "prefix_hash_frequency"
  - "difference_array"
  - "two_dimensional_prefix"
allowedProblemArchetypeIds:
  - "range_query"
  - "count_subarrays_by_prefix"
  - "batch_range_updates"
  - "matrix_region_sum"
relevantFalseHeuristicIds:
  - "prefix_and_window_are_equivalent"
  - "prefix_boundaries_are_interchangeable"
  - "prefix_hash_requires_no_auxiliary_space"
  - "prefix_sum_requires_sorted_input"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/prefix-sums/prefix-sum-with-hash-state.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `match_required_prior_prefix` as the primary diagnostic target for `prefix_sum_with_hash_state` in `prefix_sums`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `prefix_sums`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `prefix_and_window_are_equivalent`
- `prefix_boundaries_are_interchangeable`
- `prefix_hash_requires_no_auxiliary_space`
- `prefix_sum_requires_sorted_input`

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

- Primary skill atom: `match_required_prior_prefix`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `one_dimensional_prefix`, `range_sum_query`, `prefix_hash_frequency`, `difference_array`, `two_dimensional_prefix`
- Problem archetypes: `range_query`, `count_subarrays_by_prefix`, `batch_range_updates`, `matrix_region_sum`

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
    primarySkillAtomId: "match_required_prior_prefix",
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
