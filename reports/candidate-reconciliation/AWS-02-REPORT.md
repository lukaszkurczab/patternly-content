# AWS-02 — szkic nowego kandydata v2

**Status:** `partial` — lokalny draft dziewięciu artefaktów i deterministyczny candidate ID są gotowe. Nowy kandydat nie ma zgody PO, readiness, publishing/runtime admission ani app release lock.

## Cel, dopasowanie i ocena

Przygotować odtwarzalny, nieopublikowany szkic nowego kandydata z bieżącego kanonicznego źródła i AWS po ODK-096, bez zmiany historycznego v1 lub stanu aplikacji.

Ocena przed implementacją: zgodność/architektura **0,95**, prostota **0,85**, ryzyko **0,90**, utrzymywalność **0,90**, minimum **0,85**. Briefing przeszedł niezależną walidację Luna High bez redesignu. Zastosowano wersjonowane v2 dla nowej draftowej koperty i manifestu; v1 pozostał źródłem historycznych dowodów.

## Wynik

- Candidate ID: `95de91e8a0a9ff6d713c1c64ae8c8a7ebae651a2c60a0f59f608e58b5f705be4`.
- Status manifestu: `draft_not_admitted`.
- Source commit: `340cc4df9bb9c90b2f1d41f8e5eac3f639b4acf5`.
- Draft manifest: `reports/candidate-reconciliation/AWS-02-DRAFT/candidate/manifest.json`.
- Release envelope: `reports/candidate-reconciliation/AWS-02-DRAFT/release/release.json`.
- Release envelope SHA-256: `172c20786d79fdba607086cff9cead47940ea7e8d9af73864e08e8bcb1542d52`.
- Pakiet zawiera dziewięć canonical artifacts. Wszystkie ich bajty i rozmiary ponownie sprawdzono z wpisami koperty; nie znaleziono rozbieżności.
- AWS ma 2 604 pytań, contentVersion `aws-certified-solutions-architect-associate-authoring-v2026.09.21-odk096`, artifact SHA-256 `c86dd81635ebc51771e493729d487432519465f50c55ddcfc5ff71dd546560f9` oraz canonical question-set SHA-256 `46697d0c4e395455084d5dc28206b83e9207109b6f803eb94a47d4b4b981ac45`.
- Draft jawnie wiąże ODK-096: node `aws_secure_architecture_foundations` (40 pytań, SHA-256 `8dd16df1d7c6741b373026547c35255aea97869542bbb8897a4f36c73730bc33`) i 36 additive question ID. Jest to ograniczenie lokalnej admisji producer'a, nie globalne zatwierdzenie.

## Zmiany

- Dodano generator `scripts/review/candidate-draft-v2.mjs`, używający kanonicznego `buildAll` i deterministycznego candidate ID.
- Dodano schematy `schemas/review/content-candidate-draft-v2.schema.json` i `schemas/review/content-release-envelope-v2.schema.json`.
- Rozszerzono `scripts/review/schema-validation.mjs` o standardowe `maxItems`, `allOf`, `contains`, `minContains` i `maxContains`, tak by oba schematy wymagały dokładnie jednego wystąpienia każdego z 9 kanonicznych ID tracków.
- Dodano test `tests/candidate-draft-v2.test.mjs` i komendy `candidate:draft-v2`, `test:candidate-draft-v2`; negatywne przypadki odrzucają duplikaty, nieznane ID i więcej niż 9 tracków w obu schematach.
- Dla szkicu dodano jawny wyjątek w `reports/.gitignore`; artefakty są w odseparowanej ścieżce `AWS-02-DRAFT`, poza `artifacts/releases`.
- Historyczny candidate manifest v1, baseline, release records, approval/readiness/admission, migration evidence i aplikacyjny `release.lock` nie zostały zmienione.
- Zachowano zastane niezwiązane zmiany: `reports/.gitignore` zawierało już wcześniejszy wyjątek AWS-01, a `docs/planning/AUD-12-REPORT.md` pozostaje nietknięte.

## Weryfikacja

- Briefing: niezależna ocena zgodności 0,95 / prostoty 0,85 / ryzyka 0,90 / utrzymywalności 0,90; minimum 0,85, zaakceptowany.
- `npm run test:candidate-draft-v2`: PASS; dwie niezależne generacje dały identyczny manifest, candidate ID i bajty wszystkich dziewięciu artefaktów. Oba schematy odrzucają też duplikaty, nieznane i nadmiarowe tracki.
- `npm test`: PASS, 60/60 testów repozytorium po rozszerzeniu wspólnego walidatora schematów.
- `npm run candidate:draft-v2`: PASS; utworzono szkic w lokalnej kwarantannie.
- Ręczne sprawdzenie koperty i plików: 9 artefaktów, envelope hash zgodny z manifestem, rozmiary i checksumy wszystkich plików zgodne, `artifactErrors=[]`.
- Testy aplikacyjne, symulator/emulatory i Maestro nie dotyczą tego zadania: zmiana obejmuje wyłącznie tooling i content release metadata, bez UI.
- Pierwszy niezależny QA: `FAIL`, bo pierwotne schematy przyjmowały dziewięć powtórzonych/nieznanych ID, a plan był nieaktualny. Dodano dokładny kontrakt zestawu i negatywne testy; zaktualizowano plan. Niezależny retest: `PASS`.

## Pozostałe bramki i następny krok

Nie ma dowodu zgody PO dla dokładnego nowego candidate ID. Historyczne akceptacje banków nie zostały automatycznie skopiowane na nową tożsamość; ODK-096 dopuszcza tylko AWS do lokalnego producenta. Nie generować zielonego readiness ani admission na podstawie tego szkicu. Potrzebna jest decyzja PO dla dokładnego dziewięciobankowego manifestu, a potem osobne evidence readiness, publishing/runtime admission i zatwierdzona integracja z app `release.lock`. Do tego czasu AWS-02 pozostaje `partial`.
