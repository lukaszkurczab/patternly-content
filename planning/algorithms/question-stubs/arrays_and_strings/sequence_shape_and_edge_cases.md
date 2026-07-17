---
status: planned
roadmapNodeId: "arrays_and_strings"
unitKind: "direct"
unitId: "sequence_shape_and_edge_cases"
contentOwnership: "direct"
primaryPatternFamilyId: "arrays_and_strings"
legalPatternFamilyIds:
  - "arrays_and_strings"
primarySkillAtomId: "diagnose_sequence_shape_edge_case"
secondarySkillAtomIds: []
learningStage: "foundations"
allowedPatternVariantIds:
  - "linear_scan"
  - "adjacent_scan"
  - "frequency_table"
  - "stable_compaction"
  - "in_place_duplicate_collapse"
allowedProblemArchetypeIds:
  - "scan_indexed_sequence"
  - "normalize_and_compare_sequences"
  - "remove_or_compact_in_place"
  - "count_or_group_values"
relevantFalseHeuristicIds:
  - "duplicate_handling_is_automatic"
  - "one_pass_means_constant_space"
  - "output_space_is_auxiliary_space"
  - "sorting_can_ignore_original_order"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/arrays-and-strings/sequence-shape-and-edge-cases.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `diagnose_sequence_shape_edge_case` as the primary diagnostic target for `sequence_shape_and_edge_cases` in `arrays_and_strings`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `arrays_and_strings`.
- Why the chosen learning stage is `foundations`.

## Questions must diagnose

- `duplicate_handling_is_automatic`
- `one_pass_means_constant_space`
- `output_space_is_auxiliary_space`
- `sorting_can_ignore_original_order`

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

- Primary skill atom: `diagnose_sequence_shape_edge_case`
- Secondary skill atoms: none
- Learning stage: `foundations`
- Pattern variants: `linear_scan`, `adjacent_scan`, `frequency_table`, `stable_compaction`, `in_place_duplicate_collapse`
- Problem archetypes: `scan_indexed_sequence`, `normalize_and_compare_sequences`, `remove_or_compact_in_place`, `count_or_group_values`

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
    primarySkillAtomId: "diagnose_sequence_shape_edge_case",
    secondarySkillAtomIds: [],
    learningStage: "foundations",
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
