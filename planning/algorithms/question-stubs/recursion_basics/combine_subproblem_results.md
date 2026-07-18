---
status: planned
roadmapNodeId: "recursion_basics"
unitKind: "direct"
unitId: "combine_subproblem_results"
contentOwnership: "direct"
primaryPatternFamilyId: "recursion_basics"
legalPatternFamilyIds:
  - "recursion_basics"
primarySkillAtomId: "combine_recursive_return_values"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "base_case_recognition"
  - "recursive_decomposition"
  - "divide_and_combine"
  - "tail_recursion_intro"
allowedProblemArchetypeIds:
  - "traverse_recursive_structure"
  - "compute_from_smaller_input"
  - "divide_problem"
  - "generate_recursive_result"
relevantFalseHeuristicIds:
  - "base_case_only_handles_empty_input"
  - "every_call_has_identical_state"
  - "recursion_terminates_automatically"
  - "recursive_code_is_always_exponential"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/recursion-basics/combine-subproblem-results.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `combine_recursive_return_values` as the primary diagnostic target for `combine_subproblem_results` in `recursion_basics`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `recursion_basics`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `base_case_only_handles_empty_input`
- `every_call_has_identical_state`
- `recursion_terminates_automatically`
- `recursive_code_is_always_exponential`

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

- Primary skill atom: `combine_recursive_return_values`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `base_case_recognition`, `recursive_decomposition`, `divide_and_combine`, `tail_recursion_intro`
- Problem archetypes: `traverse_recursive_structure`, `compute_from_smaller_input`, `divide_problem`, `generate_recursive_result`

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
    primarySkillAtomId: "combine_recursive_return_values",
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
