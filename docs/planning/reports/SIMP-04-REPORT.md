# SIMP-04 — raport

**Status:** `done`
**Model wykonawczy:** kontroler, workerzy oraz dwukrotne niezależne QA — `gpt-5.6-luna`, reasoning `max`.

## Wynik

- Aplikacja bezpośrednio importuje dziewięć kanonicznych JSON-ów i jeden `content-lock.json`; nie koduje ich jako TypeScript, gzip ani base64.
- Jeden walidowany `Question`, jeden katalog i jeden `CanonicalTrainingRuntime` obsługują 29 konfiguracji produktu oraz pięć interakcji: `choice_single`, `choice_multiple`, `ordering`, `complexity`, `decision_matrix`.
- Discovery, przygotowanie, odpowiedź, scoring, feedback, review, resume i finalizacja korzystają z aktywnego artefaktu kanonicznego. Coding UI jest jawnie mapowany z lokalnego `kind` na canonical `type` przed lifecycle.
- Przejściowy `packagePin` ma wyłącznie projekcję `{ artifactSha256, contentVersion, canonical-content-v1 }`, exact-match i brak fallbacku. Zmiana trwałego formatu pozostaje zakresem SIMP-05.
- Usunięto aktywny generated blob, resolver, trust index, dekompresję, trzy FamilyRuntime i rodzinne adaptery katalogu. Zachowane legacy definicje są poza aktywnymi barrelami/runtime i zostaną usunięte z migracją persistence w SIMP-05.

## Manifest importów

| Track | Pytania | SHA-256 |
| --- | ---: | --- |
| aws-certified-solutions-architect-associate | 2568 | `694d15a7ba2ccae54b7813a2371f1169a8e77a029625ae6c2dd305aa41ca1c17` |
| backend-system-design-interview | 1569 | `35bb6d79c5caff3ed3abd3f68bec4cfe4c1f9bd34472d91c01d07987c3f51fc2` |
| claude-certified-architect-professional-certification | 300 | `7d6d12a49d67642e3144d062a6d237bec4604917ab34124e4ee121263c6beb2d` |
| coding-interview-dsa-problem-solving | 3404 | `8a6ed5c1938e28588bb57856870c59ab5640fc6a88f25b577d473be57a282e94` |
| frontend-system-design-interview | 1766 | `82088aedf0b8f01d798292afd7f5c70111a3ebbf09b6d22b45ab8bb04ff58ae6` |
| google-cloud-associate-cloud-engineer | 2981 | `f319709a94d5019bbd7c57db975327ef25ed34ec31e1ca127aaaea13a5b9663d` |
| microsoft-azure-administrator-associate-az-104 | 1288 | `80e5b920beade4a9b540dfa505aa67368c07c99497998314935be53da9013975` |
| microsoft-azure-ai-fundamentals-ai-901 | 752 | `ef25741799306c6cfbc7cc90cb7d76492f3df639c056b61b1c2b0492f5fbb9d4` |
| object-oriented-design-interview | 1413 | `cbb309e4263620128adc613e26e3f3afd8ed1e5b3ea8c04f4e9553da0cb45952` |

Zbiorczy inwentarz: **9 tracków / 117 nodów / 932 mental unity / 16 041 pytań**. Źródło: `patternly-content` HEAD `61cb765c2131875d53e4c1b928ccae32c5302108`.

## Weryfikacja

- `npm run typecheck` — PASS.
- `npm test` — PASS, 953/953.
- `npm run check:content-release` — PASS, exact bytes i inwentarz `9/117/932/16041`.
- `npm run test:content-release-cross-repo` — PASS.
- `npm run validate:content-boundary` — PASS.
- `npm run validate:runtime-privacy-boundary` — PASS.
- `npm run recovery:check` — PASS; 379 aktywnych plików źródłowych, 947 przypadków baseline.
- `npx expo export --platform ios --output-dir /tmp/patternly-simp04-final-export` — PASS; 1587 modułów.
- `git diff --check` — PASS.
- Niezależne finalne re-QA po poprawce granicy odpowiedzi — PASS kodu; oceny: fit 0,93, prostota 0,87, ryzyko 0,84, utrzymywalność 0,82. Jedyną wskazaną luką był niniejszy raport.

## Usunięte aktywne ścieżki

- `src/content/bundled/generatedFreeNodePackages.ts`
- `src/content/application/contentPackageResolver.ts`
- `src/content/application/bundledContentPackageTrustIndex.ts`
- `src/content/application/packageRuntimeCatalog.ts`
- `src/infrastructure/content/contentPackageRuntime{,.native,.shared}.ts`
- `src/application/{coding-interview,certification,design-interview}/*FamilyRuntime.ts`
- powiązane eksporty, stare testy aktywnej ścieżki i test support.

## Ograniczenia i następny task

Nie zmieniono pytań, `manual/source`, backendu ani webu. Legacy source/evidence w `patternly-content` oraz przejściowe zapisane `packagePin` pozostają celowo do SIMP-05.

**Następny task:** `SIMP-05` — migracja zapisanej tożsamości i usunięcie pozostałego starego systemu.
