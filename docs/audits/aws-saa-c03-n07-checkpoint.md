# AWS SAA-C03 N07 checkpoint

Date: 2026-08-16

Node: `api_messaging_event_and_workflow_decoupling`

This is candidate content for human review. It is not runtime-admitted or exam-certified.

| Batch | Mental unit | Questions |
| --- | --- | ---: |
| B01 | API Gateway and AppSync integration boundaries | 18 |
| B02 | SQS queue patterns and dead-letter handling | 18 |
| B03 | SNS fan-out and publish-subscribe | 18 |
| B04 | EventBridge routing and event buses | 18 |
| B05 | Amazon MQ protocol-preserving integration | 18 |
| B06 | Step Functions orchestration and workflow state | 18 |
| B07 | Retry, buffering, throttling, and asynchronous failure isolation | 18 |
| **Total** |  | **126** |

Validation performed:

- `npm run audit:aws-workbook-source` — PASS.
- Candidate items have one accepted option, complete distractor explanations, explicit constraints, first-party AWS source bindings, and `approvalStatus: unapproved`.
- The workbook estimate is not used as a filler target; all 126 items are scenario-shaped and mapped to one primary mental unit.

Known review boundary: B01 owns API type, integration, private-access, and GraphQL contract decisions; B02 owns queue semantics, visibility, FIFO/standard trade-offs, and dead-letter recovery; B03 owns fan-out, subscription isolation, filtering, and delivery contracts; B04 owns event-pattern routing, custom buses, archive/replay, and target boundaries; B05 owns protocol compatibility, broker engine, network, failover, and operational trade-offs; B06 owns workflow type, state modeling, service integrations, retries, callbacks, idempotency, and compensation; B07 owns asynchronous boundaries, buffering, backpressure, visibility, retry budgets, throttling, and poison-message isolation.

The repository-wide authoring validator remains blocked by pre-existing malformed unrelated GCP curriculum JSON and unrelated count reconciliation failures. Runtime publishing remains separately blocked because this dirty source repository has no available technical input commit.
