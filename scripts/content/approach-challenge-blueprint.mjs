const EXPECTED_KEYS = Object.freeze([
  "blueprintId", "blueprintVersion", "modeId", "trackId", "requestedProblemCounts",
  "defaultRequestedProblemCount", "occurrencesPerProblem", "supportedDifficulties",
  "defaultDifficulties", "timerKind", "selectionModes", "autoRule", "manualRule",
  "defaultSelectionMode",
  "deduplicateBy", "freeNodeId", "freeProblemCount", "premiumProblemCount", "emptyPool",
  "shortening", "resumeAccessPolicy",
]);

const EXPECTED = Object.freeze({
  blueprintId: "coding-interview-approach-challenge-v1",
  blueprintVersion: "1",
  modeId: "coding-interview-approach-challenge",
  trackId: "coding-interview-dsa-problem-solving",
  requestedProblemCounts: [5, 10, 20],
  defaultRequestedProblemCount: 5,
  occurrencesPerProblem: 2,
  supportedDifficulties: ["easy", "medium", "hard"],
  defaultDifficulties: ["easy", "medium"],
  timerKind: "none",
  selectionModes: ["auto", "manual"],
  defaultSelectionMode: "auto",
  autoRule: "all_required_families_mapped_and_completed",
  manualRule: "all_required_families_selected",
  deduplicateBy: "problemId",
  freeNodeId: "complexity_and_constraints",
  freeProblemCount: 6,
  premiumProblemCount: 30,
  emptyPool: "unavailable",
  shortening: "explicit_confirmation",
  resumeAccessPolicy: "session_scoped_start_grant_exact_pins",
});

export function validateApproachChallengeBlueprint(value) {
  if (!isRecord(value)) throw new Error("Approach Challenge blueprint must be an object");
  const keys = Object.keys(value).sort();
  if (canonicalJson(keys) !== canonicalJson([...EXPECTED_KEYS].sort())) throw new Error("Approach Challenge blueprint has missing or unknown keys");
  for (const key of EXPECTED_KEYS) {
    if (canonicalJson(value[key]) !== canonicalJson(EXPECTED[key])) throw new Error(`Approach Challenge blueprint ${key} does not match the accepted contract`);
  }
  return value;
}

function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (!isRecord(value)) return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}
