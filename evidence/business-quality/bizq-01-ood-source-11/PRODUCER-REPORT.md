# BIZQ-01 OOD source11 producer report

This producer slice replaces `ood-n01-b01-i001` with `ood-n01-b01-i018` in `OOD-N01-B01`. The changed primary decision is to identify the primary business actor, its observable goal, and the subject boundary from the operator's perspective. The neighborhood energy-sharing scenario states that the console only relays commands, the meter is passive, and the request relay, overlap checker, and reservation store are inside `EnergyReservationService`.

The replacement retains the OOD track, node, mental unit, single-choice interaction, exact-selected-set scoring, and total track question count. All five option meanings are new and use new option IDs. Authored feedback distinguishes the external business role, observable result, and subject boundary, and explains why the checker, meter, relay, and store distractors fail. It does not claim that actor/subject classification provides atomicity.

The fixed semantic proof is `evidence/business-quality/bizq-01-ood-source-11.json`. It binds the frozen old whole question and evidence row, the exact new question, source path and hashes, OOD version, and full current track question hash. Verification reconstructs the former OOD question set only for existing immutable history checks. BESD and Coding proof paths and semantics are unchanged. No app artifact, candidate admission, release lock, runtime, or publication bytes were produced in this producer slice.

## Identity and hashes

- Previous producer commit: `570eb490eaf194fa61ad380155cfd16c0377aaf2`
- Previous content version: `object-oriented-design-interview-candidate-v2026.08.15`
- Current content version: `object-oriented-design-interview-authoring-v2026.10.03-bizq01-11`
- Previous source file SHA-256: `402e3bf668d0dbcfee94a65e09be8772d3c4e101e6af9d01827f1c8c15e13fce`
- Current source file SHA-256: `276dd399625cf56c95bbd6c595cd08f21d387742ff44650bc1c35de70e11d6ad`
- Current OOD track question-set SHA-256: `b63ff169d69d5271f9f32f0155cbd0a6401c6b4443d4d4f3132c31273d3dd5a3`
- Historical OOD count: 1,413; current OOD count: 1,413

## Verification performed

- `node --test tests/bizq01-ood-source-11.test.mjs` — 7/7 passed, including source-path tampering and physical relocation rejection. The combined OOD/migration/ODK-097 set passed 19/19 before that final path-negative case was added.
- `npm run verify:migration` — passed; current inventory 9 tracks / 117 nodes / 943 mental units / 16,077 questions; historical inventory 9 / 117 / 932 / 16,041; the existing 36 AWS additions remain approved.
- `node scripts/build.mjs validate --track object-oriented-design-interview` — passed, 1,413 items.
- `node scripts/build.mjs test --track object-oriented-design-interview` — passed, 1,413 answers.
- `npm test` — 106/109 passed. Three candidate-draft/admission checks require canonical source bytes to be committed to Git; they fail with the existing “Canonical content paths or bytes differ from the committed source snapshot” guard because this producer work remains uncommitted. No commit was made and no release gate was weakened.

This report is limited to the one source replacement. The other sixteen known OOD-N01-B01 issues and full-unit acceptance remain open. App artifact parity, candidate/readiness, app lock, runtime admission, and learner reachability remain for the parent-owned pipeline.
