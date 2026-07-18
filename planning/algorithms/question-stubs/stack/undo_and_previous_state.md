---
status: planned
roadmapNodeId: "stack"
unitKind: "direct"
unitId: "undo_and_previous_state"
contentOwnership: "direct"
primaryPatternFamilyId: "stack"
legalPatternFamilyIds:
  - "stack"
primarySkillAtomId: "restore_previous_state_from_stack"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "nested_structure_validation"
  - "undo_or_previous_state"
  - "monotonic_increasing_stack"
  - "monotonic_decreasing_stack"
  - "next_greater_smaller"
allowedProblemArchetypeIds:
  - "validate_nested_structure"
  - "nearest_greater_or_smaller"
  - "deferred_resolution"
  - "undo_previous_state"
relevantFalseHeuristicIds:
  - "each_item_can_be_popped_many_times"
  - "monotonic_stack_stores_every_item"
  - "queue_and_stack_order_are_equivalent"
  - "stack_means_recursion"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/stack/undo-and-previous-state.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `restore_previous_state_from_stack` as the primary diagnostic target for `undo_and_previous_state` in `stack`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `stack`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `each_item_can_be_popped_many_times`
- `monotonic_stack_stores_every_item`
- `queue_and_stack_order_are_equivalent`
- `stack_means_recursion`

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

- Primary skill atom: `restore_previous_state_from_stack`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `nested_structure_validation`, `undo_or_previous_state`, `monotonic_increasing_stack`, `monotonic_decreasing_stack`, `next_greater_smaller`
- Problem archetypes: `validate_nested_structure`, `nearest_greater_or_smaller`, `deferred_resolution`, `undo_previous_state`

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
    primarySkillAtomId: "restore_previous_state_from_stack",
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
