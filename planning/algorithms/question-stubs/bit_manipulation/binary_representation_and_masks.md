---
status: planned
roadmapNodeId: "bit_manipulation"
unitKind: "direct"
unitId: "binary_representation_and_masks"
contentOwnership: "direct"
primaryPatternFamilyId: "bit_manipulation"
legalPatternFamilyIds:
  - "bit_manipulation"
primarySkillAtomId: "interpret_integer_bit_representation"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "bit_mask"
  - "xor_cancellation"
  - "lowest_set_bit"
  - "subset_mask"
allowedProblemArchetypeIds:
  - "encode_boolean_state"
  - "find_unique_element"
  - "enumerate_subsets_by_mask"
  - "count_set_bits"
relevantFalseHeuristicIds:
  - "bit_tricks_need_no_integer_width_model"
  - "masks_are_only_performance_optimizations"
  - "shifts_equal_division_for_all_signed_values"
  - "xor_is_general_arithmetic_addition"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/bit-manipulation/binary-representation-and-masks.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `interpret_integer_bit_representation` as the primary diagnostic target for `binary_representation_and_masks` in `bit_manipulation`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `bit_manipulation`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `bit_tricks_need_no_integer_width_model`
- `masks_are_only_performance_optimizations`
- `shifts_equal_division_for_all_signed_values`
- `xor_is_general_arithmetic_addition`

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

- Primary skill atom: `interpret_integer_bit_representation`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `bit_mask`, `xor_cancellation`, `lowest_set_bit`, `subset_mask`
- Problem archetypes: `encode_boolean_state`, `find_unique_element`, `enumerate_subsets_by_mask`, `count_set_bits`

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
    primarySkillAtomId: "interpret_integer_bit_representation",
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
