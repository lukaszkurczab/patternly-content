---
status: planned
roadmapNodeId: "contrast_sliding_window_vs_prefix_sums"
unitKind: "contrast"
unitId: "transfer_sliding_window_vs_prefix_sums"
contentOwnership: "cross_family"
primaryPatternFamilyId: "sliding_window"
legalPatternFamilyIds:
  - "sliding_window"
  - "prefix_sums"
primarySkillAtomId: "transfer_window_vs_prefix_decision"
secondarySkillAtomIds: []
learningStage: "contrast_practice"
allowedPatternVariantIds: []
allowedProblemArchetypeIds: []
relevantFalseHeuristicIds:
  - "every_contiguous_sum_problem_is_sliding_window"
contrastedMentalUnitIds:
  - "recognize_sliding_window_signal"
  - "recognize_prefix_accumulation_signal"
futureBatchKind: "contrast"
futureCanonicalSourcePath: "manual/source/algorithms/contrast-sliding-window-vs-prefix-sums/transfer-sliding-window-vs-prefix-sums.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `transfer_window_vs_prefix_decision` as the primary diagnostic target for `transfer_sliding_window_vs_prefix_sums` in `contrast_sliding_window_vs_prefix_sums`.

A contrast batch must include `contrastMetadata` with these contrasted units, one of the listed false heuristics, and an explicit transfer boundary. The question must diagnose the decision boundary rather than restate either pattern definition.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `sliding_window`, `prefix_sums`.
- Why the chosen learning stage is `contrast_practice`.

## Questions must diagnose

- `every_contiguous_sum_problem_is_sliding_window`

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

- Primary skill atom: `transfer_window_vs_prefix_decision`
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
    primarySkillAtomId: "transfer_window_vs_prefix_decision",
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
