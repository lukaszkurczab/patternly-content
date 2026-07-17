---
status: planned
roadmapNodeId: "two_pointers"
unitKind: "direct"
unitId: "converging_boundaries_and_proof"
contentOwnership: "direct"
primaryPatternFamilyId: "two_pointers"
legalPatternFamilyIds:
  - "two_pointers"
primarySkillAtomId: "justify_candidate_elimination_by_pointer_move"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "opposite_ends"
  - "same_direction_read_write"
  - "partition_scan"
  - "duplicate_skip"
allowedProblemArchetypeIds:
  - "find_pair_in_sorted_input"
  - "compact_sequence_in_place"
  - "partition_sequence"
  - "compare_from_both_ends"
relevantFalseHeuristicIds:
  - "move_both_pointers_on_every_step"
  - "pointer_movement_needs_no_correctness_argument"
  - "sorting_cost_is_free"
  - "two_indices_means_two_pointers"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/two-pointers/converging-boundaries-and-proof.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `justify_candidate_elimination_by_pointer_move` as the primary diagnostic target for `converging_boundaries_and_proof` in `two_pointers`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `two_pointers`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `move_both_pointers_on_every_step`
- `pointer_movement_needs_no_correctness_argument`
- `sorting_cost_is_free`
- `two_indices_means_two_pointers`

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

- Primary skill atom: `justify_candidate_elimination_by_pointer_move`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `opposite_ends`, `same_direction_read_write`, `partition_scan`, `duplicate_skip`
- Problem archetypes: `find_pair_in_sorted_input`, `compact_sequence_in_place`, `partition_sequence`, `compare_from_both_ends`

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
    primarySkillAtomId: "justify_candidate_elimination_by_pointer_move",
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
