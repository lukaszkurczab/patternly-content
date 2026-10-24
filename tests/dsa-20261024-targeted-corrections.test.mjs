import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { canonicalJson, sha256 } from "../scripts/build.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";
import registryModule from "../../patternly/src/content/canonical/interactions/registry.ts";
import optionOrderModule from "../../patternly/src/application/canonical/canonicalOptionOrder.ts";

const { canonicalInteractionRegistry: runtime } = registryModule;
const { prepareCanonicalOptionOrder, isCanonicalOptionOrder } = optionOrderModule;
const bank = await loadCurrentQuestionBank("coding-interview-dsa-problem-solving");
// Exercise emitted questions, after the helper proves source/artifact equality.
const byId = new Map(bank.artifact.questions.map(question => [question.questionId, question]));
const q = id => { const question = byId.get(id.startsWith("alg-") ? id : `alg-complexity-${id}`); assert.ok(question, id); return question; };
const pin = { contentVersion: bank.artifact.contentVersion, artifactSha256: sha256(canonicalJson(bank.artifact)) };
const prose = question => JSON.stringify(question.feedback);
const response = (question, dimension, value) => ({ type: "complexity", selectedValueIdsByDimension: { ...question.answer.selectedValueIdsByDimension, [dimension]: [value] } });
const permutations = values => values.length ? values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map(tail => [value, ...tail])) : [[]];
const pairs = ids => ids.slice(0, -1).map((id, index) => `${id}->${ids[index + 1]}`);
function full(question) {
  assert.equal(validateQuestion(question).valid, true, question.questionId);
  assert.deepEqual(runtime.validate(question), [], question.questionId);
  const producer = scoreQuestion(question, question.answer), consumer = runtime.score(question, question.answer);
  assert.equal(producer.status, "correct"); assert.equal(consumer.kind, "correct");
  assert.equal(producer.earnedPoints, producer.maxPoints); assert.equal(consumer.earnedPoints, producer.maxPoints);
}

const orderingCases = {
  "alg-complexity-amortized-014": {
    "answer": [
      "define_sequence",
      "bound_total",
      "divide",
      "state_limits"
    ],
    "display": [
      "divide",
      "define_sequence",
      "state_limits",
      "bound_total"
    ]
  },
  "alg-complexity-amortized-015": {
    "answer": [
      "charge_credit",
      "store_credit",
      "pay_resize",
      "bound_charge"
    ],
    "display": [
      "store_credit",
      "bound_charge",
      "charge_credit",
      "pay_resize"
    ]
  },
  "alg-complexity-scaling-014": {
    "answer": [
      "extract_limits",
      "derive_cost",
      "substitute",
      "decide_margin"
    ],
    "display": [
      "decide_margin",
      "derive_cost",
      "extract_limits",
      "substitute"
    ]
  },
  "alg-complexity-scaling-015": {
    "answer": [
      "preprocess",
      "per_query",
      "multiply_queries",
      "combine"
    ],
    "display": [
      "multiply_queries",
      "combine",
      "per_query",
      "preprocess"
    ]
  },
  "alg-complexity-scaling-016": {
    "answer": [
      "keep_dimensions",
      "substitute_max",
      "compute_product",
      "compare_budget"
    ],
    "display": [
      "substitute_max",
      "keep_dimensions",
      "compare_budget",
      "compute_product"
    ]
  },
  "alg-complexity-review-016": {
    "answer": [
      "state_model",
      "count_work",
      "include_terms",
      "simplify_report"
    ],
    "display": [
      "simplify_report",
      "state_model",
      "include_terms",
      "count_work"
    ]
  },
  "alg-complexity-space-013": {
    "answer": [
      "list_storage",
      "classify_roles",
      "find_peak",
      "combine"
    ],
    "display": [
      "find_peak",
      "classify_roles",
      "combine",
      "list_storage"
    ]
  },
  "alg-complexity-space-014": {
    "answer": [
      "derive_depth",
      "derive_frame",
      "multiply",
      "add_other"
    ],
    "display": [
      "derive_frame",
      "multiply",
      "derive_depth",
      "add_other"
    ]
  },
  "alg-complexity-space-015": {
    "answer": [
      "size_first",
      "lifetime",
      "size_second",
      "take_max"
    ],
    "display": [
      "size_second",
      "size_first",
      "take_max",
      "lifetime"
    ]
  },
  "alg-complexity-time-013": {
    "answer": [
      "identify_input",
      "count_structures",
      "compose",
      "simplify"
    ],
    "display": [
      "count_structures",
      "simplify",
      "identify_input",
      "compose"
    ]
  },
  "alg-complexity-time-014": {
    "answer": [
      "define_moves",
      "bound_each",
      "sum_moves",
      "conclude_linear"
    ],
    "display": [
      "conclude_linear",
      "bound_each",
      "define_moves",
      "sum_moves"
    ]
  },
  "alg-complexity-time-015": {
    "answer": [
      "write_recurrence",
      "count_levels",
      "work_per_level",
      "multiply_levels"
    ],
    "display": [
      "work_per_level",
      "multiply_levels",
      "count_levels",
      "write_recurrence"
    ]
  },
  "alg-complexity-time-016": {
    "answer": [
      "drop_constants",
      "compare_growth",
      "select_dominant",
      "report"
    ],
    "display": [
      "compare_growth",
      "drop_constants",
      "report",
      "select_dominant"
    ]
  },
  "alg-complexity-output-014": {
    "answer": [
      "define_output_unit",
      "bound_count",
      "derive_lower",
      "compare_algorithm"
    ],
    "display": [
      "compare_algorithm",
      "define_output_unit",
      "derive_lower",
      "bound_count"
    ]
  },
  "alg-complexity-output-015": {
    "answer": [
      "input_pass",
      "one_per_result",
      "no_hidden_repeat",
      "match_lower"
    ],
    "display": [
      "no_hidden_repeat",
      "one_per_result",
      "match_lower",
      "input_pass"
    ]
  },
  "alg-complexity-preprocess-013": {
    "answer": [
      "write_direct",
      "write_preprocessed",
      "compare_space_updates",
      "choose"
    ],
    "display": [
      "write_preprocessed",
      "compare_space_updates",
      "write_direct",
      "choose"
    ]
  },
  "alg-complexity-preprocess-014": {
    "answer": [
      "build",
      "receive_query",
      "subtract_prefixes",
      "repeat"
    ],
    "display": [
      "subtract_prefixes",
      "build",
      "repeat",
      "receive_query"
    ]
  },
  "alg-complexity-preprocess-015": {
    "answer": [
      "count_workload",
      "cost_each",
      "combine",
      "check_validity"
    ],
    "display": [
      "cost_each",
      "check_validity",
      "count_workload",
      "combine"
    ]
  },
  "alg-complexity-reject-015": {
    "answer": [
      "derive_bound",
      "substitute_limits",
      "compare_resources",
      "seek_structure"
    ],
    "display": [
      "seek_structure",
      "substitute_limits",
      "derive_bound",
      "compare_resources"
    ]
  },
  "alg-complexity-reject-016": {
    "answer": [
      "state_contract",
      "bound_output",
      "compare_search",
      "classify"
    ],
    "display": [
      "compare_search",
      "classify",
      "bound_output",
      "state_contract"
    ]
  }
};
const looserCases = {
  "amortized-016": [
    "total_cost",
    "O(n²)"
  ],
  "amortized-017": [
    "total_cost",
    "O(m²)"
  ],
  "amortized-018": [
    "worst_single_increment",
    "O(n)"
  ],
  "review-018": [
    "worst_single_append",
    "O(n²)"
  ],
  "space-016": [
    "auxiliary_space",
    "O(n)"
  ],
  "space-017": [
    "auxiliary_space",
    "O(n²)"
  ],
  "space-018": [
    "stack_space",
    "O(n)"
  ],
  "space-019": [
    "auxiliary_space",
    "O(2^n)"
  ],
  "space-020": [
    "auxiliary_space",
    "O(d + k)"
  ],
  "time-017": [
    "time",
    "O(n²)"
  ],
  "time-018": [
    "time",
    "O(n³)"
  ],
  "time-019": [
    "time",
    "O(n)"
  ],
  "time-020": [
    "time",
    "O(n²)"
  ],
  "time-021": [
    "time",
    "O(n²)"
  ],
  "time-022": [
    "time",
    "O(n²)"
  ],
  "preprocess-017": [
    "auxiliary_space",
    "O(nq)"
  ],
  "preprocess-018": [
    "auxiliary_space",
    "O(nq)"
  ]
};
const choiceCases = {
  "alg-complexity-amortized-004": {
    "old": "names",
    "replacement": "fixed_additive_growth",
    "text": "Growing capacity by a fixed number of slots is enough to make all resize copies linear.",
    "message": "Additive growth copies Θ(n²) total elements over n appends; a constant-factor multiplicative growth rule is needed for the geometric sum."
  },
  "alg-complexity-scaling-007": {
    "old": "names",
    "replacement": "big_o_fixes_runtime",
    "text": "Sharing a Big-O class also fixes practical costs such as cache misses and allocation overhead.",
    "message": "Equal growth classes allow different constants, allocations and memory locality; near a budget threshold those effects still matter."
  },
  "alg-complexity-review-003": {
    "old": "mid_reserved",
    "replacement": "midpoint_update_suffices",
    "text": "Computing a midpoint and changing either boundary is enough to ensure logarithmic progress, even without a shrink invariant.",
    "message": "Moving a boundary by only one index may leave Θ(n) iterations; geometric shrinkage must be proved from updates."
  },
  "alg-complexity-preprocess-008": {
    "old": "variable_names",
    "replacement": "q_always_n",
    "text": "The break-even query count is always close to n regardless of the two preprocessing and per-query costs.",
    "message": "The threshold follows from the actual difference in build and query costs; it need not be near n."
  },
  "alg-complexity-reject-001": {
    "old": "names",
    "replacement": "nested_loops_always_infeasible",
    "text": "Reject any nested-loop candidate even when aggregate pointer movement is provably linear.",
    "message": "Nested syntax can implement O(n) aggregate work; rejection requires a resource or correctness proof, not a syntax ban."
  }
};

test("P01–P06: current emitted bank retains 3404 questions and has its own authoring version", () => {
  assert.equal(byId.size, 3404);
  assert.match(pin.contentVersion, /-dsa-20261024-fixes-v1$/);
  const ids = [...Object.keys(orderingCases), "output-001", "output-016", "output-017", "output-018", "preprocess-020", ...Object.keys(looserCases), ...Object.keys(choiceCases)].map(id => id.startsWith("alg-") ? id : `alg-complexity-${id}`);
  assert.equal(new Set(ids).size, 47);
  for (const id of ids) full(q(id));
});

for (const [id, expected] of Object.entries(orderingCases)) {
  test(`P01 ${id}: authored display, saved occurrence, all 24 responses and review`, () => {
    const question = q(id), authored = question.interaction.elements.map(element => element.elementId);
    assert.deepEqual(authored, expected.display);
    assert.deepEqual(question.answer.orderedElementIds, expected.answer);
    assert.deepEqual([...authored].sort(), [...expected.answer].sort());
    assert.notDeepEqual(authored, expected.answer);
    assert.equal(runtime.randomizeControlOrder(question), false);
    const prepared = prepareCanonicalOptionOrder(question, `${id}/first`, pin);
    const saved = JSON.parse(JSON.stringify({ displayOrder: prepared }));
    assert.equal(isCanonicalOptionOrder(question, saved.displayOrder), true);
    assert.deepEqual(prepareCanonicalOptionOrder(question, `${id}/second`, pin), prepared);
    assert.deepEqual(saved.displayOrder, expected.display);
    const initial = runtime.present(question, null, saved.displayOrder).model;
    assert.deepEqual(initial.renderer.elements.map(element => element.id), expected.display);
    assert.equal(Object.hasOwn(initial, "answer"), false);
    assert.equal(Object.hasOwn(initial, "feedback"), false);
    assert.deepEqual(runtime.evaluate(question, null), { complete: false, result: null, diagnostics: [], feedback: null });
    assert.ok(runtime.score(question, { type: "ordering", orderedElementIds: authored }).earnedPoints < 3);
    for (const ids of permutations(expected.answer)) {
      const submitted = { type: "ordering", orderedElementIds: ids };
      const kept = new Set(pairs(ids)), expectedPoints = pairs(expected.answer).filter(pair => kept.has(pair)).length;
      assert.equal(scoreQuestion(question, submitted).earnedPoints, expectedPoints);
      assert.equal(runtime.score(question, submitted).earnedPoints, expectedPoints);
      assert.equal(runtime.score(question, submitted).maxPoints, 3);
      assert.deepEqual(runtime.projectDiagnostics(question, submitted), (question.feedback.messages ?? []).filter(message => message.kind === "broken_relation" && !kept.has(message.targetId)));
    }
    for (const ids of [["unknown", ...expected.answer.slice(1)], expected.answer.slice(1), [expected.answer[0], ...expected.answer.slice(0, 3)]]) {
      const bad = { type: "ordering", orderedElementIds: ids };
      assert.equal(runtime.isComplete(question, bad), false);
      assert.ok(runtime.score(question, bad).earnedPoints < 3);
      assert.ok(scoreQuestion(question, bad).earnedPoints < 3);
    }
    // Review is a post-finalization projection; session timing itself is unchanged.
    const review = runtime.presentReview(question, null, saved.displayOrder);
    assert.deepEqual(review.model.renderer.elements.map(element => element.id), expected.answer);
    assert.equal(runtime.score(question, question.answer).earnedPoints, 3);
  });
}

test("P01: existing authored broken_relation fixture filters by adjacency, including moved intact pairs", () => {
  // These 20 source questions have no relation messages. Reuse the existing shared
  // fixture to exercise message selection without inventing feedback in the bank.
  const fixture = JSON.parse(readFileSync(new URL("./fixtures/shared-contract-fixture.json", import.meta.url), "utf8"));
  const question = fixture.questions.find(question => question.questionId === "simp01-ordering");
  assert.ok(question.feedback.messages.some(message => message.kind === "broken_relation"));
  for (const ids of permutations(question.answer.orderedElementIds)) {
    const kept = new Set(pairs(ids)), submitted = { type: "ordering", orderedElementIds: ids };
    assert.deepEqual(runtime.projectDiagnostics(question, submitted), question.feedback.messages.filter(message => message.kind === "broken_relation" && !kept.has(message.targetId)));
  }
});

for (const [suffix, lowerDimension, weaker] of [["output-001", null, "omega_log_k"], ["output-017", "time_lower_bound", "Ω(n)"], ["output-018", "time_lower_bound", "Ω(n!)"]]) {
  test(`P02 ${suffix}: asks for strongest offered bound and explains the valid weaker bound`, () => {
    const question = q(suffix); full(question);
    assert.match(question.prompt, /strongest.*among the choices/);
    assert.match(prose(question), /valid.*weaker|also valid.*weaker/);
    const weakerResponse = lowerDimension ? response(question, lowerDimension, weaker) : { type: "choice_single", optionId: weaker };
    assert.ok(runtime.score(question, weakerResponse).earnedPoints < runtime.score(question, question.answer).maxPoints);
    assert.ok(scoreQuestion(question, weakerResponse).earnedPoints < scoreQuestion(question, question.answer).maxPoints);
    const feedback = runtime.projectFeedback(question, weakerResponse);
    assert.match(JSON.stringify(feedback), /valid.*weaker|also valid.*weaker/);
    if (!lowerDimension) {
      assert.equal(question.answer.optionId, "omega_k");
      assert.equal(feedback.messages[0].targetId, "omega_log_k");
    } else {
      const outputWrong = response(question, "output_space_lower_bound", weaker);
      assert.equal(runtime.score(question, outputWrong).earnedPoints, 2);
    }
  });
}

test("P03: distinguish explicit scan+emit decomposition from an impossible logarithmic scan", () => {
  const question = q("output-016"), dimension = question.interaction.dimensions.find(dimension => dimension.dimensionId === "time");
  assert.match(question.prompt, /0 <= k <= n/); assert.match(question.prompt, /both the scan term and the result-emission term explicitly/);
  assert.deepEqual(question.answer.selectedValueIdsByDimension, { auxiliary_space: ["O(1)"], output_space: ["O(k)"], time: ["O(n + k)"] });
  assert.ok(!dimension.values.some(value => value.valueId === "O(n)"));
  assert.ok(dimension.values.some(value => value.valueId === "O(log n + k)" && value.text === value.valueId));
  assert.deepEqual(dimension.aliases, { scan_plus_emit: "O(n + k)" });
  assert.match(prose(question), /O\(n\+k\) simplifies to O\(n\)/);
  assert.match(prose(question), /not because O\(n\) is mathematically invalid/);
  full(question);
  assert.equal(runtime.score(question, response(question, "time", "O(log n + k)")).earnedPoints, 2);
  assert.equal(scoreQuestion(question, response(question, "time", "O(log n + k)")).earnedPoints, 2);
  const n = 100000, k = 0; assert.ok(n > 1000 * (Math.log2(n) + k));
});

test("P04: u >= 1 covers the initial build; zero updates is explicitly outside the domain", () => {
  const question = q("preprocess-020"); full(question);
  assert.match(question.prompt, /starts without a prefix structure.*u >= 1/);
  assert.match(question.constraints[0], /initial O\(n\) construction.*u >= 1/);
  assert.match(prose(question), /u = 0 and q = 1/);
  assert.match(prose(question), /outside this question/);
  assert.deepEqual(question.answer.selectedValueIdsByDimension.time, ["O(un + q)"]);
  assert.equal(runtime.score(question, response(question, "time", "O(n + u + q)")).earnedPoints, 0);
  const cost = (n, u, queries) => n + u*n + queries;
  assert.equal(cost(1000, 2, 3), 3003);
  for (const n of [16, 1024, 65536]) {
    assert.ok(cost(n, 2, 3) <= 2 * (2*n + 3));
    assert.equal(cost(n, 0, 1), n+1); // un+q would remain 1.
  }
});

for (const [suffix, [dimension, looser]] of Object.entries(looserCases)) {
  test(`P05 ${suffix}: exact key wins; an offered looser upper bound is rejected for the stated task`, () => {
    const question = q(suffix); full(question);
    assert.match(question.prompt, /tightest valid asymptotic upper bound among the offered expressions under the stated model/);
    assert.match(question.prompt, /rather than any looser Big-O upper bound/);
    assert.ok(question.interaction.dimensions.find(entry => entry.dimensionId === dimension).values.some(value => value.valueId === looser));
    const wrong = response(question, dimension, looser), maximum = question.interaction.dimensions.length;
    assert.equal(runtime.score(question, wrong).earnedPoints, maximum - 1);
    assert.equal(scoreQuestion(question, wrong).earnedPoints, maximum - 1);
    assert.deepEqual(runtime.projectFeedback(question, wrong).reason, question.feedback.reason);
    assert.equal(Object.hasOwn(question.feedback, "messages"), false);
    if (suffix === "time-022") {
      assert.match(prose(question), /O\(n²\) is also a valid but looser upper bound/);
      assert.doesNotMatch(prose(question), /not O\(n\) or O\(n²\)/);
    }
  });
}

for (const [id, replacement] of Object.entries(choiceCases)) {
  test(`P06 ${id}: fresh distractor identity and its exact feedback survive all 24 option orders`, () => {
    const question = q(id); full(question);
    assert.ok(!question.interaction.options.some(option => option.optionId === replacement.old));
    assert.ok(!question.feedback.messages.some(message => message.targetId === replacement.old));
    assert.equal(question.interaction.options.find(option => option.optionId === replacement.replacement).text, replacement.text);
    for (const ids of permutations(question.interaction.options.map(option => option.optionId))) {
      const shuffled = { ...question, interaction: { ...question.interaction, options: ids.map(id => question.interaction.options.find(option => option.optionId === id)) } };
      const wrong = { type: "choice_single", optionId: replacement.replacement };
      assert.equal(runtime.score(shuffled, question.answer).earnedPoints, 1);
      assert.equal(scoreQuestion(shuffled, question.answer).earnedPoints, 1);
      assert.equal(runtime.score(shuffled, wrong).earnedPoints, 0);
      assert.equal(scoreQuestion(shuffled, wrong).earnedPoints, 0);
      assert.deepEqual(runtime.projectFeedback(shuffled, wrong).messages, [{ kind: "wrong_option", targetId: replacement.replacement, text: replacement.message }]);
      assert.deepEqual(runtime.projectFeedback(shuffled, question.answer).messages, []);
    }
    const prepared = prepareCanonicalOptionOrder(question, `${id}/choice`, pin);
    assert.equal(isCanonicalOptionOrder(question, prepared), true);
    assert.deepEqual(runtime.present(question, null, prepared).model.renderer.options.map(option => option.id), prepared);
  });
}

test("D07 diagnostic only: the unchanged adjacency contract awards 1/3 after exchanging independent facts", () => {
  for (const suffix of ["scaling-015", "space-014", "preprocess-013"]) {
    const question = q(suffix), [a, b, ...tail] = question.answer.orderedElementIds;
    const swapped = { type: "ordering", orderedElementIds: [b, a, ...tail] };
    assert.equal(scoreQuestion(question, swapped).earnedPoints, 1);
    assert.equal(runtime.score(question, swapped).earnedPoints, 1);
    assert.equal(runtime.score(question, question.answer).earnedPoints, 3);
  }
  // This records the diagnostic, not approval of arbitrary first-pair precedence.
});

test("D08 diagnostic only: duplicate semantics change the domain; empty output does not remove the scan", () => {
  full(q("output-019")); full(q("review-017"));
  const left = [1,1,1], right = [1,1,1];
  const paired = Math.min(left.length, right.length), crossProduct = left.length * right.length;
  assert.ok(paired <= Math.min(left.length, right.length));
  assert.ok(crossProduct > left.length + right.length);
  const filterResults = [1,2,3].filter(value => value > 5);
  assert.equal(filterResults.length, 0);
  assert.equal([1,2,3].flatMap(value => [value,value]).length, 6);
  // Neither duplicate policy nor per-record copy multiplicity is selected here.
});
