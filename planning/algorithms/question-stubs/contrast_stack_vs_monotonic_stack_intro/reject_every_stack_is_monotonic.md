---
status: planned
roadmapNodeId: "contrast_stack_vs_monotonic_stack_intro"
unitKind: "contrast"
unitId: "reject_every_stack_is_monotonic"
contentOwnership: "cross_family"
primaryPatternFamilyId: "stack"
legalPatternFamilyIds:
  - "stack"
  - "monotonic_stack"
primarySkillAtomId: "reject_every_stack_is_monotonic_heuristic"
secondarySkillAtomIds: []
learningStage: "contrast_practice"
allowedPatternVariantIds: []
allowedProblemArchetypeIds: []
relevantFalseHeuristicIds:
  - "every_problem_using_a_stack_is_a_monotonic_stack_problem"
contrastedMentalUnitIds:
  - "recognize_lifo_signal"
  - "recognize_monotonic_stack_signal"
futureBatchKind: "contrast"
futureCanonicalSourcePath: "manual/source/algorithms/contrast-stack-vs-monotonic-stack-intro/reject-every-stack-is-monotonic.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `reject_every_stack_is_monotonic_heuristic` as the primary diagnostic target for `reject_every_stack_is_monotonic` in `contrast_stack_vs_monotonic_stack_intro`.

A contrast batch must include `contrastMetadata` with these contrasted units, one of the listed false heuristics, and an explicit transfer boundary. The question must diagnose the decision boundary rather than restate either pattern definition.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `stack`, `monotonic_stack`.
- Why the chosen learning stage is `contrast_practice`.

## Questions must diagnose

- `every_problem_using_a_stack_is_a_monotonic_stack_problem`

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

- Primary skill atom: `reject_every_stack_is_monotonic_heuristic`
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
    primarySkillAtomId: "reject_every_stack_is_monotonic_heuristic",
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
