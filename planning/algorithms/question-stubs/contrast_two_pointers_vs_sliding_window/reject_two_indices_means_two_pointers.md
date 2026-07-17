---
status: planned
roadmapNodeId: "contrast_two_pointers_vs_sliding_window"
unitKind: "contrast"
unitId: "reject_two_indices_means_two_pointers"
contentOwnership: "cross_family"
primaryPatternFamilyId: "two_pointers"
legalPatternFamilyIds:
  - "two_pointers"
  - "sliding_window"
primarySkillAtomId: "reject_two_indices_implies_two_pointers_heuristic"
secondarySkillAtomIds: []
learningStage: "contrast_practice"
allowedPatternVariantIds: []
allowedProblemArchetypeIds: []
relevantFalseHeuristicIds:
  - "any_solution_with_two_indices_is_two_pointers"
contrastedMentalUnitIds:
  - "recognize_two_pointer_signal"
  - "recognize_sliding_window_signal"
futureBatchKind: "contrast"
futureCanonicalSourcePath: "manual/source/algorithms/contrast-two-pointers-vs-sliding-window/reject-two-indices-means-two-pointers.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `reject_two_indices_implies_two_pointers_heuristic` as the primary diagnostic target for `reject_two_indices_means_two_pointers` in `contrast_two_pointers_vs_sliding_window`.

A contrast batch must include `contrastMetadata` with these contrasted units, one of the listed false heuristics, and an explicit transfer boundary. The question must diagnose the decision boundary rather than restate either pattern definition.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `two_pointers`, `sliding_window`.
- Why the chosen learning stage is `contrast_practice`.

## Questions must diagnose

- `any_solution_with_two_indices_is_two_pointers`

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

- Primary skill atom: `reject_two_indices_implies_two_pointers_heuristic`
- Secondary skill atoms: none
- Learning stage: `contrast_practice`
- Pattern variants: none
- Problem archetypes: none

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
    primarySkillAtomId: "reject_two_indices_implies_two_pointers_heuristic",
    secondarySkillAtomIds: [],
    learningStage: "contrast_practice",
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
