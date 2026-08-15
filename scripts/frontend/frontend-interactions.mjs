const ORDERING_PREFERENCES = new Set([
  "failure_state_design",
  "architecture_evolution_review",
  "browser_execution_prediction",
  "request_lifecycle_diagnosis",
  "network_data_flow"
]);

const MATRIX_PREFERENCES = new Set([
  "cache_state_reasoning",
  "performance_diagnosis",
  "accessibility_evaluation",
  "security_boundary_diagnosis"
]);

export const RICH_INTERACTION_PREFERENCES = new Set([...ORDERING_PREFERENCES, ...MATRIX_PREFERENCES]);

const orderingTemplates = {
  failure_state_design: [
    ["observe", "Observe the user-visible and system evidence at the failed boundary."],
    ["preserve", "Preserve the user's intent and any repairable input before changing state."],
    ["expose", "Expose the unavailable, stale, rejected, or partial state with an actionable explanation."],
    ["recover", "Retry, reconcile, or hand off to the authoritative owner and confirm the resulting state."]
  ],
  architecture_evolution_review: [
    ["measure", "Measure the current contract, affected consumers, and release health signal."],
    ["stage", "Introduce the new boundary or representation while the existing contract remains readable."],
    ["migrate", "Move consumers with observable adoption and repair paths for mixed versions."],
    ["retire", "Remove the old path only after compatibility and rollback evidence shows it is unreachable."]
  ],
  browser_execution_prediction: [
    ["input", "The browser receives the user action or document lifecycle trigger."],
    ["schedule", "Tasks, microtasks, network callbacks, or worker messages update the relevant state."],
    ["render", "The browser calculates the next DOM, style, layout, or compositing result."],
    ["present", "The resulting pixels or assistive-technology state become observable to the user."]
  ],
  request_lifecycle_diagnosis: [
    ["intent", "Capture the current user intent and assign it a request identity."],
    ["dispatch", "Start the request with the required credentials, cache policy, and cancellation signal."],
    ["resolve", "Classify the response, error, cancellation, or stale result against that intent."],
    ["commit", "Commit only the still-current result and expose repair or retry state when needed."]
  ],
  network_data_flow: [
    ["source", "Identify the originating user, browser, local store, or remote event and its authority."],
    ["boundary", "Apply the trust, validation, authorization, and schema boundary before forwarding data."],
    ["transport", "Deliver or reconcile the data with explicit ordering, retry, freshness, and loss semantics."],
    ["consumer", "Render, persist, or act on the result only at the owner that can enforce its lifecycle."]
  ]
};

const matrixTemplates = {
  cache_state_reasoning: [
    {
      id: "authority",
      label: "Authoritative owner",
      values: [["server", "The server-confirmed representation owns protected or durable truth."], ["browser_cache", "The browser cache is treated as the authoritative source for the outcome."], ["component", "A component-local value becomes the authority for shared or durable truth."]],
      accepted: "server"
    },
    {
      id: "freshness",
      label: "Freshness policy",
      values: [["explicit_revalidation", "Use a cache key and explicit freshness or revalidation policy."], ["clear_everything", "Clear every cached value after any change because ownership is undefined."], ["silent_stale", "Show stale data as current without labeling or reconciling it."]],
      accepted: "explicit_revalidation"
    },
    {
      id: "failure",
      label: "Unavailable-state behavior",
      values: [["visible_repair", "Keep the known data visible with an explicit stale or unavailable state and a repair path."], ["blank_success", "Hide the failure and render an empty successful-looking result."], ["unbounded_retry", "Retry forever without a visible state or budget."]],
      accepted: "visible_repair"
    }
  ],
  performance_diagnosis: [
    {
      id: "evidence",
      label: "Evidence to collect",
      values: [["representative_trace", "Use a representative journey, device, network, and percentile trace."], ["single_lab_score", "Use one synthetic score as the complete diagnosis."], ["user_agent_guess", "Infer the bottleneck from a browser or device label."]],
      accepted: "representative_trace"
    },
    {
      id: "intervention",
      label: "Intervention owner",
      values: [["measured_bottleneck", "Change the resource, main-thread, layout, or delivery owner shown by the trace."], ["generic_memoization", "Add memoization without establishing that render work is causal."], ["global_lazy_loading", "Lazy-load all content regardless of whether it is on the critical path."]],
      accepted: "measured_bottleneck"
    },
    {
      id: "gate",
      label: "Release decision",
      values: [["segment_budget", "Gate the affected journey and user segment against an explicit budget."], ["average_only", "Ship when the overall average looks acceptable."], ["score_without_owner", "Record a metric without assigning a responsible boundary."]],
      accepted: "segment_budget"
    }
  ],
  accessibility_evaluation: [
    {
      id: "semantics",
      label: "Control contract",
      values: [["native_or_complete_widget", "Use native semantics or implement the full role, name, state, and keyboard contract."], ["visual_div", "Style a generic element and rely on its visual appearance."], ["aria_only", "Add a role without implementing the behavior that role promises."]],
      accepted: "native_or_complete_widget"
    },
    {
      id: "input",
      label: "Input coverage",
      values: [["task_equivalence", "Verify the same task with keyboard, assistive technology, zoom, touch, and other supported inputs."], ["pointer_only", "Treat pointer success as evidence that every input mode works."], ["separate_accessibility_mode", "Move the accessible task into a disconnected alternate flow."]],
      accepted: "task_equivalence"
    },
    {
      id: "state",
      label: "Dynamic state",
      values: [["explicit_announcement", "Expose meaningful state changes in stable semantics and a nonduplicative announcement path."], ["color_only", "Use color or motion as the only state signal."], ["announce_every_render", "Announce every render regardless of whether user-relevant state changed."]],
      accepted: "explicit_announcement"
    }
  ],
  security_boundary_diagnosis: [
    {
      id: "enforcement",
      label: "Enforcement owner",
      values: [["trusted_service", "Enforce authorization and protected outcomes at the trusted service boundary."], ["hidden_control", "Hide the control and treat its absence as authorization."], ["client_check", "Trust a browser-side check as the final security boundary."]],
      accepted: "trusted_service"
    },
    {
      id: "data",
      label: "Data handling",
      values: [["purpose_minimized", "Send only the fields required for the stated purpose and retention policy."], ["full_payload", "Send complete form or session state because the telemetry or vendor accepts it."], ["global_sdk_access", "Give a third-party script access to unrelated sensitive state."]],
      accepted: "purpose_minimized"
    },
    {
      id: "failure",
      label: "Failure behavior",
      values: [["deny_and_repair", "Deny the unsafe action, preserve safe input, and expose a repair path."], ["silent_retry", "Retry an unauthorized or unsafe action without telling the user."], ["fail_open", "Allow the action when the client cannot prove the policy."]],
      accepted: "deny_and_repair"
    }
  ]
};

function elementExplanation(domain, axis) {
  return `This element is part of the ${axis.label.toLowerCase()} for ${domain.product}, but treating it as the first or only step would hide the boundary that must preserve ${domain.constraint}.`;
}

export function isRichInteractionPreference(preference) {
  return RICH_INTERACTION_PREFERENCES.has(preference);
}

export function buildRichInteraction({ preference, domain, axis }) {
  if (ORDERING_PREFERENCES.has(preference)) {
    const elements = orderingTemplates[preference].map(([id, text]) => ({ elementId: id, text: `${text} Scenario: ${domain.actor} must ${domain.operation}; ${axis.constraint}.` }));
    const canonicalOrder = elements.map((element) => element.elementId);
    return {
      type: "ordering",
      elements,
      canonicalOrder,
      scoringMethod: "adjacent_relations"
    };
  }
  if (MATRIX_PREFERENCES.has(preference)) {
    const dimensions = matrixTemplates[preference].map((dimension) => ({
      dimensionId: dimension.id,
      label: dimension.label,
      values: dimension.values.map(([valueId, text]) => ({ valueId, text: `${text} Scenario: ${domain.constraint}.` })),
      acceptedValueIds: [dimension.accepted]
    }));
    return { type: "decision_matrix", dimensions, scoringMethod: "dimension_exact" };
  }
  return null;
}

export function buildRichFeedback(interaction, domain, axis) {
  if (interaction.type === "ordering") {
    const relationIds = interaction.canonicalOrder.slice(0, -1).map((id, index) => `${id}->${interaction.canonicalOrder[index + 1]}`);
    return {
      wrongElementExplanationsByElementId: Object.fromEntries(interaction.elements.map((element) => [element.elementId, elementExplanation(domain, axis)])),
      brokenRelationExplanationsByRelationId: Object.fromEntries(relationIds.map((relationId) => [relationId, `Breaking ${relationId} loses the explicit ownership or recovery boundary for ${domain.failure}; the learner must preserve the sequence before claiming success.`]))
    };
  }
  const wrongValues = {};
  const omitted = {};
  for (const dimension of interaction.dimensions) {
    const accepted = new Set(dimension.acceptedValueIds);
    for (const value of dimension.values) {
      if (!accepted.has(value.valueId)) wrongValues[`${dimension.dimensionId}|${value.valueId}`] = `This ${dimension.label.toLowerCase()} choice does not preserve ${domain.constraint}; it leaves ${domain.failure} hidden or assigns authority to the wrong boundary.`;
    }
    omitted[dimension.dimensionId] = `Without the accepted ${dimension.label.toLowerCase()} choice, the design cannot preserve ${domain.constraint} or explain ${domain.failure}.`;
  }
  return { wrongValueExplanationsByDimensionIdAndValueId: wrongValues, omittedCorrectValueExplanationsByDimensionId: omitted };
}

export function buildRichScoringContract(interaction) {
  if (interaction.type === "ordering") return { type: "ordering", resultSemantics: "adjacent_relations_v1", maxPoints: interaction.elements.length - 1 };
  if (interaction.type === "decision_matrix") return { type: "decision_matrix", resultSemantics: "exact_dimension_values_v1", maxPoints: interaction.dimensions.length };
  throw new Error(`Unsupported rich interaction type: ${interaction.type}`);
}

export function validateRichInteraction(item) {
  const interaction = item.interaction;
  const scoring = item.scoringContract;
  const richFeedback = item.feedback?.richInteraction;
  if (interaction?.type === "ordering") {
    const ids = interaction.elements?.map((element) => element.elementId) ?? [];
    if (ids.length < 3 || new Set(ids).size !== ids.length || ids.some((id) => typeof id !== "string" || !id.trim()) || !Array.isArray(interaction.canonicalOrder) || interaction.canonicalOrder.length !== ids.length || new Set(interaction.canonicalOrder).size !== ids.length || interaction.canonicalOrder.some((id) => !ids.includes(id)) || interaction.scoringMethod !== "adjacent_relations" || scoring?.type !== "ordering" || scoring.resultSemantics !== "adjacent_relations_v1" || scoring.maxPoints !== ids.length - 1) return false;
    const explanations = richFeedback?.wrongElementExplanationsByElementId ?? {};
    const relations = interaction.canonicalOrder.slice(0, -1).map((id, index) => `${id}->${interaction.canonicalOrder[index + 1]}`);
    const relationExplanations = richFeedback?.brokenRelationExplanationsByRelationId ?? {};
    return ids.every((id) => typeof explanations[id] === "string" && explanations[id].trim()) && relations.every((id) => typeof relationExplanations[id] === "string" && relationExplanations[id].trim());
  }
  if (interaction?.type === "decision_matrix") {
    const dimensions = interaction.dimensions ?? [];
    if (dimensions.length < 3 || interaction.scoringMethod !== "dimension_exact" || scoring?.type !== "decision_matrix" || scoring.resultSemantics !== "exact_dimension_values_v1" || scoring.maxPoints !== dimensions.length) return false;
    const dimensionIds = dimensions.map((dimension) => dimension.dimensionId);
    if (new Set(dimensionIds).size !== dimensionIds.length) return false;
    const wrong = richFeedback?.wrongValueExplanationsByDimensionIdAndValueId ?? {};
    const omitted = richFeedback?.omittedCorrectValueExplanationsByDimensionId ?? {};
    return dimensions.every((dimension) => {
      const values = dimension.values ?? [];
      const valueIds = values.map((value) => value.valueId);
      const accepted = dimension.acceptedValueIds ?? [];
      if (values.length < 3 || new Set(valueIds).size !== valueIds.length || accepted.length !== 1 || !valueIds.includes(accepted[0])) return false;
      return valueIds.filter((id) => id !== accepted[0]).every((id) => typeof wrong[`${dimension.dimensionId}|${id}`] === "string" && wrong[`${dimension.dimensionId}|${id}`].trim()) && typeof omitted[dimension.dimensionId] === "string" && omitted[dimension.dimensionId].trim();
    });
  }
  return false;
}

export function scoreFrontendInteraction(item, response) {
  if (!validateRichInteraction(item)) throw new Error(`Invalid rich interaction: ${item.itemId}`);
  if (item.interaction.type === "ordering") {
    if (response?.kind !== "ordering") throw new Error(`Expected ordering response for ${item.itemId}`);
    const expected = item.interaction.canonicalOrder;
    if (response.orderedElementIds.length !== expected.length || new Set(response.orderedElementIds).size !== expected.length || response.orderedElementIds.some((id) => !expected.includes(id))) throw new Error(`Invalid ordering response for ${item.itemId}`);
    const expectedRelations = new Set(expected.slice(0, -1).map((id, index) => `${id}->${expected[index + 1]}`));
    const actualRelations = response.orderedElementIds.slice(0, -1).map((id, index) => `${id}->${response.orderedElementIds[index + 1]}`);
    const earnedPoints = actualRelations.filter((relation) => expectedRelations.has(relation)).length;
    return { status: earnedPoints === expectedRelations.size ? "correct" : earnedPoints > 0 ? "partial" : "incorrect", earnedPoints, maxPoints: expectedRelations.size, brokenRelations: [...expectedRelations].filter((relation) => !actualRelations.includes(relation)) };
  }
  if (response?.kind !== "decision_matrix") throw new Error(`Expected decision_matrix response for ${item.itemId}`);
  const selected = response.selectedValueIdsByDimension ?? {};
  const dimensions = item.interaction.dimensions;
  const earnedPoints = dimensions.reduce((total, dimension) => total + (dimension.acceptedValueIds.includes(selected[dimension.dimensionId]) ? 1 : 0), 0);
  return { status: earnedPoints === dimensions.length ? "correct" : earnedPoints > 0 ? "partial" : "incorrect", earnedPoints, maxPoints: dimensions.length, incorrectDimensions: dimensions.filter((dimension) => !dimension.acceptedValueIds.includes(selected[dimension.dimensionId])).map((dimension) => dimension.dimensionId) };
}
