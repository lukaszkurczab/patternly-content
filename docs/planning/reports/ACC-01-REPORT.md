# ACC-01 — accepted content baseline

**Result:** `done`  
**Date:** 2026-09-10  
**Baseline:** `evidence/content-acceptance/acc-01-baseline-v1.json`  
**Baseline SHA-256:** `3028599302799f12a576f3c1b8ec41b978702dd1970731117a7cb9e523baf0eb`

## Outcome

The human-owner decision is pinned to one reproducible nine-track baseline. Each entry records its source commit, source root, file/item counts, and aggregate source/item manifest hashes. The item manifest is the SHA-256 of canonical JSON for the item records sorted by identity; source-file and item order therefore cannot cause a false change. No question source, approval manifest, readiness record, admission record, review packet, or publishing artifact changed.

| Track | Source commit | Files | Items | Source manifest SHA-256 | Item manifest SHA-256 |
|---|---|---:|---:|---|---|
| aws-certified-solutions-architect-associate | `1e35906ccea0f3abbed6814fd828bdc6467318be` | 137 | 2568 | `d837d60bb005facbde1fe6520ecb31307b41fa5ebd62a85afac4cb55d2b15477` | `d9211e2091505f7dfcf9c0dbc96e6866919047fb30a9ff4371be5c8eccaf6733` |
| backend-system-design-interview | `1e35906ccea0f3abbed6814fd828bdc6467318be` | 89 | 1569 | `8cb0a15bcb1c2994a74b419719aca2a9085106da7999641dad5ad06ee3d930ff` | `5f9d81cb3ed9ff0d5bb5a52e1259f57cd28a8255982785f3b365d4ae58b7a305` |
| claude-certified-architect-professional-certification | `846b75fafa1fa0a35590622bebd7b1789c95adf7` | 38 | 300 | `d62e69e8dbd24bd91d09016185bb5cfbe1a6e3ab065344ad259802eecfa5c0f1` | `95fa7656d3b92dc2113b45ad40bca4f6c327306da31270c68b8d7fba1f335c51` |
| coding-interview-dsa-problem-solving | `1e35906ccea0f3abbed6814fd828bdc6467318be` | 213 | 3404 | `fa7e1c4ea91414cb8637e99a5d8eb52aee5f1d738626cca7f7c1cec55e5d747c` | `8d32e94b0bee05e9a01c650290ba266befe9564b334fbc005d079860c41e82a0` |
| frontend-system-design-interview | `1e35906ccea0f3abbed6814fd828bdc6467318be` | 88 | 1766 | `912d575d340d1bbe681ab00e5cf4bbd38982cdaf6bbd759567b0fe5f1f84f61d` | `99071ce3843c6a12302ca75e6209c294b6bf158f0b6b2f63df403bf8eff32e38` |
| google-cloud-associate-cloud-engineer | `1e35906ccea0f3abbed6814fd828bdc6467318be` | 152 | 2981 | `de3f95b1dc78d3624f7e42a4c91c6b7b1c2148a2f69f34d0fafb9ec701568853` | `6c7a8e18a1a94713aef04ff99956a93fa8efe463ff90d0d293c44cb051ee3cf1` |
| microsoft-azure-administrator-associate-az-104 | `1e35906ccea0f3abbed6814fd828bdc6467318be` | 75 | 1288 | `ca3bdfd2de66b2783ea0f670ccaa4f01af5d6736f9f7a3de23cc4fc06ce2d651` | `7f8e7ce7a217b9a964102902efdc05ade0188862d115aa531dd9be51b8f3a05c` |
| microsoft-azure-ai-fundamentals-ai-901 | `1e35906ccea0f3abbed6814fd828bdc6467318be` | 5 | 752 | `13a410f133ccdcbe9a81772b62b1bd2809829ca6ff59b57ebb42ae602f732a3b` | `8e32f1b55b195c4a330dfe06180bbb97e40951155a43c1968284e0d87dfc86c3` |
| object-oriented-design-interview | `1e35906ccea0f3abbed6814fd828bdc6467318be` | 79 | 1413 | `b0aa400ce61dba894a43b3081a355ddeedd82af1a542a7d7a7c79d9d522615e3` | `e99f443c2478d079a11bf2559dcde661ae58c39a5f48f5160c836122ba7437fd` |

Claude additionally records content version `ccarp-2026.09.03`. The baseline provenance is the Product Owner decision dated 2026-09-10 and does not attribute approval to an agent. Git source-root comparisons found no changes between each pinned commit and `HEAD`.

## Verification

- `npm run test:content-acceptance-baseline` — 5/5 passed.
- `node scripts/review/content-acceptance-baseline.mjs` — passed for all 9 tracks.
- `git diff --check` — passed.
- `node --test tests/contentApprovals.test.mjs` — 1/2 passed; the existing readiness/approval source-commit mismatch remains intentionally open for `ACC-02 / ODK-E2E-099`.
- Independent code QA — `pass`; schema enforcement, negative cases, historical eight-track binding, source pins, and scope were checked.

## Execution record

- Briefing validator: `gpt-5.6-luna`, reasoning effort `max`; minimum score 0.87, approved.
- Implementation worker: `gpt-5.6-luna`, reasoning effort `max`; route `C1/R1`.
- Independent QA and re-QA: `gpt-5.6-luna`, reasoning effort `max`; final verdict `pass`.

## Remaining boundary

`ACC-02 / ODK-E2E-099` must consume this baseline and reconcile the human approval manifest, readiness, review packets, admission, and immutable artifacts. ACC-01 does not grant runtime or publishing admission.
