// Fixed accepted Claude predecessor and successor evidence; pins remain immutable.
export const CLAUDE_HISTORICAL_BASELINE = Object.freeze({
  path: "evidence/canonical-content-approvals/claude-20261007-historical-questions.json",
  schemaVersion: "patternly-claude-historical-question-baseline-v1",
  trackId: "claude-certified-architect-professional-certification",
  contentVersion: "ccarp-2026.09.03",
  sourceRepositoryCommit: "cf119c3f8e8ebfce3e5bdbcd3d5f4e4c7c5dd509",
  questionCount: 300,
  questionSetSha256: "713f1709b438430773ad56ccb71fa50cc59473afd1cbfa3b208496b4b1d38a09"
});

// Accepted predecessor identities remain frozen while the separately reviewed CC-02/CC-03 successor is proven below.
export const CLAUDE_CURRENT_BANK = Object.freeze({
  questionCount: 845,
  questionSetSha256: "73f561c4d64a272f8b6f055a321414303620c54dba7dfb4d0283d75ea74bfe6d"
});

export const CLAUDE_SUCCESSOR_BANK = Object.freeze({
  contentVersion: "ccarp-2026.10.11-capacity-v1-bizq02-v2-bizq03-planning-v2-cc02-v1-cc03-v1-cc04-v3",
  questionCount: 918,
  questionSetSha256: "710b8550f3d09c20437912f045853fed596ec92c431c785a6fe42a0da0c5377c",
  withoutCourseSha256: "4c8aac41f5e758747a64fb947f19005496de2034aa6e9652e3f4e1dad91df595"
});

export const CLAUDE_CC02_SUCCESSOR_EVIDENCE = Object.freeze({
  coveragePath: "docs/evidence/content-audits/2026-10-11-cc02-content-coverage.json",
  coverageSha256: "08540f2440fd723261cd25b84632452288293b414ca8683776ef7ce2a69f38c6",
  beforePath: "evidence/canonical-content-approvals/claude-cc02-historical-before.json",
  beforeSha256: "5841e96aa1c242003cbed0dceb7030b4a34f29bc3f06fe7c96d361075026ab8b",
  courseBaselinePath: "evidence/canonical-content-approvals/claude-cc03-question-baseline.json",
  courseBaselineSha256: "c57846cfafd02d451599584671fd7cf3272e6eb7b437729dfee3e669920580d9",
  schemaVersion: "cc02-content-coverage-v1",
  trackId: "claude-certified-architect-professional-certification",
  contentVersionBefore: "ccarp-2026.10.11-capacity-v1-bizq02-v2-bizq03-planning-v2",
  contentVersionAfter: "ccarp-2026.10.11-capacity-v1-bizq02-v2-bizq03-planning-v2-cc02-v1",
  beforeQuestionCount: 845,
  addedQuestionCount: 73,
  changedQuestionCount: 6,
  supplementalQuestionCount: 4,
  reviewAnswerTextMatches: 83
});
