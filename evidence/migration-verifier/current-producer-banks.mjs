import { CLAUDE_SUCCESSOR_BANK } from "./claude-historical.mjs";

export const EXPECTED_CURRENT_PRODUCER_BANKS = Object.freeze({
  "aws-certified-solutions-architect-associate": Object.freeze({
    questionCount: 2604,
    questionSetSha256: "f745d5ea27b753a3fae1143c079086fb2bab99dacfbb89a08744925030eeed42"
  }),
  "backend-system-design-interview": Object.freeze({
    questionCount: 1569,
    questionSetSha256: "46954940e5d7ef7517f2602e32899f4ffbcbff13e40e8c6409f8433e0e0dd9c9"
  }),
  "claude-certified-architect-professional-certification": Object.freeze({
    questionCount: CLAUDE_SUCCESSOR_BANK.questionCount,
    questionSetSha256: CLAUDE_SUCCESSOR_BANK.questionSetSha256
  }),
  "coding-interview-dsa-problem-solving": Object.freeze({
    questionCount: 3404,
    questionSetSha256: "cf941d1ea96f24110ea67dc7a112b2a1093848086ef5f14840ef0bf5da50d9ab"
  }),
  "object-oriented-design-interview": Object.freeze({
    questionCount: 1413,
    questionSetSha256: "c92a9f04488efb4ef7a5fa8b3257495c21e6c62125123df8073141c60000b2d8"
  })
});
