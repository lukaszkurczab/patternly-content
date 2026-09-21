# ODK-096 — AWS Free node, stan po lokalnej admisji producenta

Status: `LOCAL_CANONICAL_ADMITTED / LOCAL_BUNDLE_APPROVED_PENDING_SYNC / GLOBAL_RUNTIME_PUBLISHING_BLOCKED` — dokładna tożsamość AWS Free node jest przyjęta lokalnie, a lokalna publikacja/synchronizacja bundle'a ma zgodę `approved_pending_sync`, ale nie została jeszcze wykonana; globalnej admisji runtime ani publikacji nie przyznano.

## Aktualny addendum admisji

- Addendum `evidence/canonical-content-approvals/odk-096-aws-free-node-v1.json` wiąże decyzję PO z dokładnym `aws_secure_architecture_foundations` (40 pytań, SHA-256 `8dd16df1d7c6741b373026547c35255aea97869542bbb8897a4f36c73730bc33`) i całym trackiem AWS (2604 pytań, SHA-256 `46697d0c4e395455084d5dc28206b83e9207109b6f803eb94a47d4b4b981ac45`). Hash jest liczony przez repozytoryjne `canonicalJson` dla tablic sortowanych po `questionId` komparatorem canonical build.
- Zakres pytaniowy to 36 nowych ID `-odk096` oraz cztery zachowane ID policy (`aws-saa-c03-iam-policy-evaluation-001`–`004`); addendum nie zmienia historycznego manifestu ACC-01 (2568 pytań, `evidence/content-acceptance/acc-01-baseline-v1.json`).
- Catalog AWS ma `contentVersion` `aws-certified-solutions-architect-associate-authoring-v2026.09.21-odk096`. Profil Free AWS jest v2 (`...-free-node-v2`) z długościami focus `[10,20,40]`/default `10`, weak `[10,20]`/default `10`, quick `[10]`/default `10`, primary `10`; brief tracku i implementowana mapa profilu są zsynchronizowane.
- Pliki tego admission slice'a: `content/catalog.json`, `config/free-node-experience-profiles/aws-certified-solutions-architect-associate.json`, `docs/track-briefs/aws-certified-solutions-architect-associate.json` (nowo objęty zakresem jako konieczna synchronizacja profilu), `scripts/product/track-briefs.mjs`, `evidence/canonical-content-approvals/odk-096-aws-free-node-v1.json`, `tests/odk096-canonical-approval.test.mjs`, `package.json` oraz ten raport i coverage draft. Historyczne evidence, candidate/human approval, migration scripts i aplikacja nie zostały zmienione.
- Admisja jest lokalna dla jednego tracku i jednego node'a. `localBundlePublicationSync` ma status `approved_pending_sync`, natomiast `runtimeAdmission`, `publishingAdmission`, `globalReleaseAdmission` oraz pozostałe tracki pozostają `not_granted`. Finalny scoped independent QA: `gpt-5.6-luna/max`, verdict `pass_local_producer_boundary`, zakres wyłącznie granicy lokalnego producenta, consistency `0,96`, simplicity `0,93`, risk `0,90`, maintainability `0,96`, minimum `0,90` — nie jest to pełny release gate. Wcześniejsza próba z minimum `0,74` została odrzucona z powodu blokady hermetyczności testu i nie jest bieżącą oceną.

## Aktualna weryfikacja i ograniczenia

- PASS: `npm run content:validate -- --track aws-certified-solutions-architect-associate` (2604), `npm run content:test -- --track aws-certified-solutions-architect-associate` (2604), `npm run validate:shared-contract`, `node scripts/product/track-briefs.mjs`, `node --test tests/odk096-canonical-approval.test.mjs`.
- PASS: `npm run content:build -- --track aws-certified-solutions-architect-associate --output-root /tmp/odk096-build.UlfQwF/aws` oraz `npm run content:build-all -- --output-root /tmp/odk096-build.UlfQwF/all`; build-all wyemitował 9 artefaktów i lock z agregatami `9/117/943/16077` (tracki/node'y/mental units/pytania). Osiem nie-AWS tracków zachowało count/hash/contentVersion względem zapisanych historycznych tożsamości migracji; AWS jest celowo zmieniony (`2604`, lock artifact hash `c86dd81635ebc51771e493729d487432519465f50c55ddcfc5ff71dd546560f9`).
- PASS: `git diff --check`.
- `npm test` — PASS `57/57`; test ACC-02 rozdziela niezmienioną historyczną tożsamość wszystkich 9 tracków od bieżącej catalog identity AWS ODK-096, bez przepisywania historycznego manifestu.
- `npm run verify:migration` — FAIL `EVIDENCE_VALUE`: zamrożone evidence nadal wskazuje stary artifact `contentVersion`; to oczekiwane przy lokalnej admisji bez aktualizacji historycznego evidence. Lokalna publikacja/synchronizacja bundle'a ma status `approved_pending_sync`, ale nie została wykonana; nie wykonano globalnego runtime/publishing/app sync, Practice Setup, E2E ani VoiceOver.

Ocena implementacji tego slice'a: spójność 0,92, prostota 0,86, ryzyko 0,82, utrzymywalność 0,90; minimum 0,82 (obniżone przez konieczną synchronizację briefu z profilem v2 i świadomie pozostawione historyczne evidence). Niezależny QA addendum ma osobny zakres i finalne minimum 0,90: `pass_local_producer_boundary`, bez pełnego release gate.

Poniższe sekcje zachowują historyczny stan raportu sprzed addendum; ich stwierdzenia o oczekiwaniu na decyzję PO nie opisują już aktualnej admisji lokalnej.

## Historyczny snapshot: wynik autorowania przed admisją

- Węzeł `aws_secure_architecture_foundations` ma 40 rzeczywistych pytań: cztery niezmienione pytania o ewaluację polityk i 36 nowych pytań `-odk096` w 12 jednostkach mentalnych. Cały track AWS ma 2 604 pytania.
- PO zatwierdził wymianę powtarzającego się slotu `managed-service-platform-patching` na `lambda-runtime-update-mode` z głównym celem SAA 1.2. Konfiguracja programu, pytanie i odwołania przeszły niezależny QA (minimum 0,84).
- Kolejne wycinki treści przeszły niezależny QA po korektach: porządek kanoniczny w policy (minimum 0,87), SSE-S3 i wzorzec WAF (minimum 0,90), źródło AWS Backup (minimum 0,88). [Macierz pokrycia i porównania](./ODK-096-COVERAGE-DRAFT.md) opisuje ID, sloty, cele, źródła i najbliższe istniejące pytania.
- Cztery oryginalne pytania policy pozostają semantycznie zgodne z HEAD; SHA-256 `c17e4d5ff635d10f30f1bb018e0c4104382ae1f33241769f1f5bba45d3be8833`.

## Tożsamość pakietu do decyzji PO

Hash jest SHA-256 z pytań posortowanych po `questionId`, zapisanych przez repozytoryjne `canonicalJson` z kluczami w porządku leksykalnym:

| Zakres | Liczba | SHA-256 |
| --- | ---: | --- |
| AWS Free node `aws_secure_architecture_foundations` | 40 | `8dd16df1d7c6741b373026547c35255aea97869542bbb8897a4f36c73730bc33` |
| Cały kanoniczny track AWS | 2604 | `46697d0c4e395455084d5dc28206b83e9207109b6f803eb94a47d4b4b981ac45` |

Istniejąca akceptacja human/Stage03 dotyczy 2 568 pytań i nie obejmuje tych 36 nowych ID. Wcześniejsza zgoda PO na zmianę slotu nie jest zgodą na przyjęcie nowego manifestu. Nie aktualizowano evidence, historycznego approval, katalogu, profilu Free ani aplikacji.

## Weryfikacja i ograniczenia

- `npm run content:validate -- --track aws-certified-solutions-architect-associate` — PASS, 2604.
- `npm run content:test -- --track aws-certified-solutions-architect-associate` — PASS, 2604.
- `npm run validate:shared-contract` i `npm run test:shared-contract` — PASS, 22/22.
- `npm test` — PASS, 56/56 podczas końcowego autorowania; po ostatniej korekcie odnośnika powtórzono focused validate/test, nie pełny suite.
- `git diff --check` — PASS w repozytorium treści.
- `npm run verify:migration` — FAIL wyłącznie `EVIDENCE_MEMBERSHIP`: zamrożone evidence 2568, bieżący canonical 2604. To oczekiwane przed admisją, ale blokuje promocję.
- Nie wykonano build/sync do aplikacji, testu Practice Setup/E2E ani VoiceOver. Ostatni test nie należy do zakresu żądanej pracy.

## Pozostałe bramki po admisji lokalnej

Pozostaje formalny proces aktualizacji evidence/migracji oraz osobna decyzja o admisji runtime i publikacji. Dopiero po tych decyzjach można synchronizować artefakt z aplikacją i weryfikować Practice Setup/E2E. Ten addendum sam nie oznacza ODK-096 ani EPIC-06 jako `done`.

Model wykonawczy i niezależny QA: `gpt-5.6-luna`, reasoning effort `max`. Ocena planu dla ostatniego wycinka: spójność 0,96, prostota 0,93, ryzyko 0,88, utrzymywalność 0,91; minimum 0,88.
