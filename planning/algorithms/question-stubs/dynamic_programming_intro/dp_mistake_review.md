---
status: planned
roadmapNodeId: "dynamic_programming_intro"
unitKind: "direct"
unitId: "dp_mistake_review"
contentOwnership: "direct"
primaryPatternFamilyId: "dynamic_programming_intro"
legalPatternFamilyIds:
  - "dynamic_programming_intro"
primarySkillAtomId: "diagnose_incomplete_dp_state_or_transition"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "memoization"
  - "tabulation"
  - "one_dimensional_dp"
  - "two_dimensional_dp"
  - "state_compression"
allowedProblemArchetypeIds:
  - "count_ways"
  - "optimize_prefix_or_suffix"
  - "choose_or_skip"
  - "grid_path_dp"
  - "sequence_alignment_intro"
relevantFalseHeuristicIds:
  - "dp_state_is_always_only_the_index"
  - "memoization_is_always_faster"
  - "overlapping_subproblems_alone_are_sufficient"
  - "state_compression_never_changes_correctness"
  - "transition_order_never_matters"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/dynamic-programming-intro/dp-mistake-review.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `diagnose_incomplete_dp_state_or_transition` as the primary diagnostic target for `dp_mistake_review` in `dynamic_programming_intro`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `dynamic_programming_intro`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `dp_state_is_always_only_the_index`
- `memoization_is_always_faster`
- `overlapping_subproblems_alone_are_sufficient`
- `state_compression_never_changes_correctness`
- `transition_order_never_matters`

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

- Primary skill atom: `diagnose_incomplete_dp_state_or_transition`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `memoization`, `tabulation`, `one_dimensional_dp`, `two_dimensional_dp`, `state_compression`
- Problem archetypes: `count_ways`, `optimize_prefix_or_suffix`, `choose_or_skip`, `grid_path_dp`, `sequence_alignment_intro`

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
    primarySkillAtomId: "diagnose_incomplete_dp_state_or_transition",
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
