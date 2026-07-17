---
status: planned
roadmapNodeId: "math_and_geometry"
unitKind: "direct"
unitId: "primes_and_factorization"
contentOwnership: "direct"
primaryPatternFamilyId: "math_and_geometry"
legalPatternFamilyIds:
  - "math_and_geometry"
primarySkillAtomId: "derive_prime_factorization_or_sieve"
secondarySkillAtomIds: []
learningStage: "foundations"
allowedPatternVariantIds:
  - "euclidean_algorithm"
  - "modular_arithmetic"
  - "prime_factorization"
  - "vector_orientation"
  - "coordinate_transform"
allowedProblemArchetypeIds:
  - "divisibility_and_cycles"
  - "compute_gcd_lcm"
  - "count_or_generate_primes"
  - "compare_geometric_orientation"
  - "normalize_coordinates"
relevantFalseHeuristicIds:
  - "floating_point_equality_is_exact"
  - "geometry_needs_no_degenerate_cases"
  - "modulo_behaves_identically_for_negative_values"
  - "slope_division_is_always_safe"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/math-and-geometry/primes-and-factorization.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `derive_prime_factorization_or_sieve` as the primary diagnostic target for `primes_and_factorization` in `math_and_geometry`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `math_and_geometry`.
- Why the chosen learning stage is `foundations`.

## Questions must diagnose

- `floating_point_equality_is_exact`
- `geometry_needs_no_degenerate_cases`
- `modulo_behaves_identically_for_negative_values`
- `slope_division_is_always_safe`

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

- Primary skill atom: `derive_prime_factorization_or_sieve`
- Secondary skill atoms: none
- Learning stage: `foundations`
- Pattern variants: `euclidean_algorithm`, `modular_arithmetic`, `prime_factorization`, `vector_orientation`, `coordinate_transform`
- Problem archetypes: `divisibility_and_cycles`, `compute_gcd_lcm`, `count_or_generate_primes`, `compare_geometric_orientation`, `normalize_coordinates`

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
    primarySkillAtomId: "derive_prime_factorization_or_sieve",
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
