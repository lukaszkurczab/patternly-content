# AWS-01 — uzgodnienie nowego kandydata

**Status:** `done` dla lokalnego uzgodnienia; budowa nowego kandydata i admission nie zostały wykonane.  
**Data:** 23 września 2026  
**Zakres:** wyłącznie inventory, porównanie do ODK-096, mapa konsumentów i wejście do AWS-02.

## Wynik

Zgoda ODK-096 odpowiada obecnemu kanonicznemu AWS. Dla `aws-certified-solutions-architect-associate` zatwierdzono content version `aws-certified-solutions-architect-associate-authoring-v2026.09.21-odk096`, 2 604 pytania o SHA-256 `46697d0c4e395455084d5dc28206b83e9207109b6f803eb94a47d4b4b981ac45`, oraz node `aws_secure_architecture_foundations` z 40 pytaniami o SHA-256 `8dd16df1d7c6741b373026547c35255aea97869542bbb8897a4f36c73730bc33`. Lista 36 nowych ID w addendum zgadza się z dopuszczonymi dodatkami verifiera.

Zgoda ma status `approved_pending_sync`. Dopuszcza lokalne przygotowanie producenta i synchronizację wskazanego bundla po odrębnym kroku, ale nie nadaje runtime, publishing ani global release admission. Nie rozszerza zgód na pozostałe tracki.

| Track | Nodes | Mental units | Pytania | SHA-256 inventory item fingerprint |
| --- | ---: | ---: | ---: | --- |
| aws-certified-solutions-architect-associate | 21 | 145 | 2 604 | `98e10d9476e5a55822f360f45f15ceeffe934a9dc0547c41d1c7668829a9547a` |
| backend-system-design-interview | 10 | 89 | 1 569 | `142148dcecbaab5b490757685c5e3b036a10ddd8c051b94fc618452928766639` |
| claude-certified-architect-professional-certification | 7 | 38 | 300 | `2bc0cea1b5c9c55ec8c46c2c2ac25419576a507c2face808a2b3d633f361d06d` |
| coding-interview-dsa-problem-solving | 26 | 213 | 3 404 | `a549cd2630a30eb0dd379b73d176218b8bd39497a328389adc024c3a499aa597` |
| frontend-system-design-interview | 10 | 88 | 1 766 | `0e178f05e4043056f0bb482db3d48300e4e859dec12d87e6a3dd9169b0e9edb8` |
| google-cloud-associate-cloud-engineer | 20 | 152 | 2 981 | `4b223305016dce5458bc50a4f2bb95e495296c00cc6642915e33ead0fd7dd816` |
| microsoft-azure-administrator-associate-az-104 | 9 | 75 | 1 288 | `f6cc5df7a87a908c020484a964e508d0fd8048b371d7fab540daaf0270873651` |
| microsoft-azure-ai-fundamentals-ai-901 | 5 | 64 | 752 | `1bd3b1c04210579269e457f67ff6f7a18c35d61c0e3fbe07ce4108b87a1f3740` |
| object-oriented-design-interview | 9 | 79 | 1 413 | `991b046ff80649a9408309bed795809c58c9a4b6e7e54b3be4ef04b05ad083c9` |
| **Razem** | **117** | **943** | **16 077** | — |

Fingerprinty w tabeli są obliczane z `[{questionId,itemSha256}, ...]`, posortowanego po `questionId`, zakodowanego jako JSON; algorytm to SHA-256. Globalny deterministyczny inventory JSON ma SHA-256 `0f01ab51b3fcec0d61876e310ad6add2a9fcc5f4ae52b4c611353e7212d5ca84`.

Porównanie z historycznym baseline SIMP-03 (9 tracków, 117 nodes, 932 mental units, 16 041 pytań) daje `+11` mental units i `+36` pytań wyłącznie w AWS. Nie wykryto rozbieżności względem exact binding ODK-096.

## Historyczny kandydat i migracja

Historyczny kandydat `68524885ebca4bfb2098a6f1afa80a65e4b68db2b2d8e529c11ab5d9fe14b2e6` nadal wiąże AWS do 2 568 pytań, starego item manifestu `d9211e2091505f7dfcf9c0dbc96e6866919047fb30a9ff4371be5c8eccaf6733`, content version z 2026-08-15 i starego artefaktu release. Jego human approval, readiness, candidate admission/runtime evidence i app release lock również odnoszą się do tej tożsamości. Pozostają historyczne i nie mogą być edytowane ani przepinane.

`npm run verify:migration` **PASS** dla bieżącego źródła: zachowuje 16 041 pytań historycznych i dopuszcza wyłącznie 36 zatwierdzonych dodatków ODK-096, weryfikując ich exact ID i SHA. Jest to działający verifier kanonicznego przejścia historyczne → bieżące źródło, a nie globalne admission nowego release. Nie należy przepisywać jego oczekiwań. `npm run model-evaluation:inventory` zwraca oczekiwany `blocked_baseline` (inwentaryzacja 9/117/943/16 077; digest powyżej), bo baseline 09-A pozostaje historyczny i decyzja PO nie zmienia automatycznie bramki tej oceny. `npm run validate:shared-contract` PASS.

## Mapa kontraktów i konsumentów

| Konsument / kontrakt | Aktualne wiązanie | Wymaganie AWS-02 |
| --- | --- | --- |
| `evidence/content-acceptance/candidate-manifest-v1.json` i `schemas/review/content-candidate-manifest.schema.json` | 9-trackowy kandydat; AWS 2 568 | Dodać wersjonowaną ścieżkę nowego manifestu i schema. Stare pliki zostają niezmienione. |
| `scripts/review/candidate-manifest.mjs` (builder i verifier) | Jedna stała ścieżka; baseline ACC-01 plus stary release | Rozszerzyć jawnie o nową wersję kontraktu, bez zmiany semantyki historycznego odczytu. Builder ma wiązać dokładne source i release każdego tracka. |
| `content/migration-evidence/manifest.json` oraz `scripts/content/verify-migration.mjs` | Manifest wskazuje stary candidate path/ID; verifier osobno waliduje bieżące źródło i 36 dodatków | Ustalić nowy, odrębny migration/candidate evidence binding i testy; pozostawić verifier bieżącego źródła bez regresji. |
| `evidence/human-content-approvals/manifest.json`, per-track approval i review packets | Zatwierdzenie dokładnego starego candidate ID/source | Utworzyć nowe approval records dopiero po zbudowaniu dokładnego nowego manifestu i właściwym przeglądzie; starych zgód nie dziedziczyć dla zmienionych itemów. |
| `evidence/readiness/candidate-readiness.json` | Stare candidate ID/source oraz runtime/publishing `admitted` | Nowa ścieżka readiness dla nowego ID; nie kopiować starych admission. Braki mają pozostać jawne. |
| `evidence/admissions/candidate-admission.json` i `evidence/admissions/runtime/*` | Runtime/publishing evidence przypięte do starego kandydata i frontend commit | Dla nowego kandydata admission pozostaje `not_granted`, dopóki odpowiednie osobne bramki nie dostarczą nowego evidence. |
| `patternly/integration/contracts/content-release/release.lock.json` (repo Patternly) | AWS release/checksum/contentVersion ze starego artefaktu | Zaktualniać dopiero po nowym, zatwierdzonym kandydacie/artefakcie i jego dowodach; task przekrojowy musi wskazać kolejność i QA po stronie aplikacji. |
| `artifacts/releases/*`, builder reports i bundle package evidence | Wydane artefakty ze starymi release IDs/checksumami | Wyprodukować nowe, nie nadpisując historycznych artefaktów; spiąć z nowym manifestem i app lock w kontrolowanym kroku. |

## Następny krok: AWS-02

AWS-02 może ruszyć dopiero po niezależnym QA tego raportu i planu. Zależności wymagają najpierw ustalić wersjonowany kontrakt/schema oraz exact canonical source inputs, a następnie zbudować nowe release/bundle artefakty bez nadpisania historii. Dopiero z gotowymi release ID/checksumami builder może utworzyć finalny dziewięciobankowy manifest i wyliczyć z jego identity payloadu candidate ID. Następnie należy dodać osobne human approval/review packet bindings, structural readiness i migration evidence dla nowego ID; admission pozostaje `not_granted`, dopóki własne bramki go nie uzasadnią. App release lock oraz runtime aktualizuje się dopiero po wymaganych właścicielskich bramkach i niezależnej weryfikacji powiązań.

Wymagane dowody: exact candidate manifest SHA/ID wyliczony po zamrożeniu artifact identities; wszystkie source/item/artifact hashes; zweryfikowane approval bindings; testy schema/builder/verifier i migration; status readiness oraz admission; niezmienione historyczne SHA; wynik niezależnego QA. Warunek zatrzymania: dowolny hash/count/contentVersion/release/approval niezgodny z ODK-096 lub innym zatwierdzonym bankiem, próba przepisania historii albo brak właściwego approval/admission. Samo `verify:migration` PASS nie nadaje admission.

## Briefing i niezależna walidacja

Przed pracą briefing otrzymał redesign po pierwszej walidacji poniżej progu. Zatwierdzona rewizja: **Cel** — raport uzgodnienia i precyzyjna aktualizacja root planu, bez AWS-02/admission; **Ustalenia** — dokładne wejścia, inventory, approval, stare wiązania i ograniczenia; **Podejście** — zmiana tylko tego raportu i `docs/PATTERNLY-WORKING-PLAN.md`, z jawnie określonym zakresem QA i stop condition.

Niezależna walidacja briefingu: `gpt-6-luna/high`; zgodność **0,95**, prostota **0,86**, ryzyko **0,84**, utrzymywalność **0,86**, minimum **0,84** — zatwierdzono. Walidator oceniał tylko briefing, bez inspekcji repozytorium.

## Weryfikacja i QA

- `npm run model-evaluation:inventory` — deterministyczny wynik `blocked_baseline`, 9/117/943/16 077, SHA `0f01ab51b3fcec0d61876e310ad6add2a9fcc5f4ae52b4c611353e7212d5ca84`.
- `npm run validate:shared-contract` — PASS, 5 fixture questions / 9 tracks.
- `npm run verify:migration` — PASS, 9 tracks, 117 nodes, 943 mental units, 16 077 current questions, 16 041 historical questions, 36 dokładnych zatwierdzonych dodatków.
- Niezależne porównanie approval ODK-096 do inventory: count/version oraz track i node SHA zgodne; wszystkie 36 zatwierdzonych IDs obecne jako dodatki.
- Niezależny QA (Luna High) sprawdził źródłowe hashe, pełne inventory dziewięciu tracków i brak zmian historycznych. Pierwszy werdykt był `FAIL`: wykazał zależność candidate ID od gotowych release ID/checksumów, które poprzedni szkic umieszczał po generowaniu ID. Raport i kanoniczny plan poprawiono zgodnie z tą zależnością. Retest QA zwrócił `PASS WITH ISSUES`; wskazał ograniczenia widoczności planu i ignorowany raport. Plan został uzupełniony, a wyjątek Git dodany i zweryfikowany. Finalny QA potwierdził poprawną kolejność i plan (`PASS WITH ISSUES`); raport pozostaje nieśledzony (`??`) do czasu dodania do Git i nie był stage'owany. AWS-02 może rozpocząć się zgodnie z planem, zachowując niezwiązane zmiany użytkownika.

## Ocena podejścia

Oceny zatwierdzonego zakresu: zgodność **0,95**, prostota **0,86**, ryzyko **0,84**, utrzymywalność **0,86**; minimum **0,84**. Najważniejszym ograniczeniem jest to, że bieżące approvals i release artifacts poza exact ODK-096 AWS nie są automatycznie przenoszone na nowy candidate ID. Root working plan jest plikiem workspace poza checkoutem Git, dlatego jego zmianę sprawdzono bezpośrednio, bez git diff. Raport ma jawny wyjątek w `reports/.gitignore` i pozostaje nieśledzony do czasu dodania do Git.
