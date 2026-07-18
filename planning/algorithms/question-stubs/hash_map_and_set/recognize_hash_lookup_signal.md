---
status: planned
roadmapNodeId: "hash_map_and_set"
unitKind: "direct"
unitId: "recognize_hash_lookup_signal"
contentOwnership: "direct"
primaryPatternFamilyId: "hash_map_and_set"
legalPatternFamilyIds:
  - "hash_map_and_set"
primarySkillAtomId: "identify_lookup_state_signal"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "lookup_by_value"
  - "complement_lookup"
  - "seen_set"
  - "frequency_map"
  - "grouping_map"
allowedProblemArchetypeIds:
  - "find_pair_with_condition"
  - "detect_duplicate_or_membership"
  - "group_or_count_values"
  - "preserve_original_index"
relevantFalseHeuristicIds:
  - "check_after_insert_is_always_safe"
  - "frequency_and_presence_are_equivalent"
  - "hash_lookup_is_worst_case_constant"
  - "set_and_map_are_interchangeable"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/hash-map-and-set/recognize-hash-lookup-signal.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `identify_lookup_state_signal` as the primary diagnostic target for `recognize_hash_lookup_signal` in `hash_map_and_set`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `hash_map_and_set`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `check_after_insert_is_always_safe`
- `frequency_and_presence_are_equivalent`
- `hash_lookup_is_worst_case_constant`
- `set_and_map_are_interchangeable`

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

- Primary skill atom: `identify_lookup_state_signal`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `lookup_by_value`, `complement_lookup`, `seen_set`, `frequency_map`, `grouping_map`
- Problem archetypes: `find_pair_with_condition`, `detect_duplicate_or_membership`, `group_or_count_values`, `preserve_original_index`

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
    primarySkillAtomId: "identify_lookup_state_signal",
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
