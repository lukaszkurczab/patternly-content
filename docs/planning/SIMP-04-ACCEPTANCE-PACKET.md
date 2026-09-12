# SIMP-04 — pakiet akceptacyjny

**Status:** `planned`
**Następstwo:** `SIMP-03` `done` → `SIMP-04` → `SIMP-05`
**Repozytoria:** implementacja w `patternly`; źródłowe artefakty w `patternly-content`

## Cel

Aplikacja ma bezpośrednio konsumować dziewięć kanonicznych artefaktów zbudowanych przez `patternly-content`, używać jednego typu `Question` i jednego katalogu runtime oraz zachować działanie pięciu rzeczywiście różnych interakcji. Konfiguracje trybów ćwiczeń pozostają logiką produktu w aplikacji, a nie wracają do formatu pytań.

## Potwierdzony stan

| Element | Status | Evidence |
| --- | --- | --- |
| Kanoniczne banki | `done` | SIMP-03: 9 tracków, 117 nodów, 932 mental unity, 16 041 pytań |
| Kanoniczny build | `done` | osobne `dist/<trackId>.json` i `content-lock.json`; wszystkie dziewięć buildów przechodzi |
| Konsument aplikacyjny | `partial` | aktywny `ContentPackageResolver` czyta wygenerowany TypeScript z zakodowanymi, skompresowanymi paczkami Free-node |
| Pełny katalog runtime | `planned` | obecne katalogi i typy pytań są rozdzielone na Coding, Certification i Design |
| Tryby produktu | `done` jako istniejąca logika, wymagają przepięcia | profile i selekcja trybów istnieją w aplikacji/paczkach; nie są częścią nowego artefaktu pytań |
| Migracja zapisanej tożsamości | `planned` w SIMP-05 | bieżące rekordy nadal używają `packagePin`; SIMP-04 nie zmienia formatu persistence |

Graphify nie jest dostępny w sprawdzonych ścieżkach. Orientację wykonano przez aktualne importy, entry pointy, testy i skrypty graniczne.

## Ustalenia architektoniczne

1. `patternly-content` pozostaje jedynym źródłem pytań i builderem artefaktów.
2. Repozytorium aplikacji przechowuje dziewięć dokładnych, zbudowanych JSON-ów oraz mały lock jako build inputs; nie koduje ich ponownie w TypeScript, base64 ani gzip.
3. Sync czyta bieżący, jawnie wskazany checkout `patternly-content`, uruchamia jego kanoniczny build, weryfikuje lock i kopiuje dokładne bajty. Nie używa `git show`, historycznych commitów ani legacy artifacts.
4. Jeden loader waliduje prostą otoczkę artefaktu (`schemaVersion`, `trackId`, `contentVersion`, `questions`) i zgodność SHA-256/identity z lockiem. Nie rozpakowuje payloadu i nie wybiera walidatora według rodziny.
5. Jeden `Question` jest discriminated union zależnym wyłącznie od `interaction.type`: `choice_single`, `choice_multiple`, `ordering`, `complexity`, `decision_matrix`.
6. Jeden runtime catalog udostępnia track, node, mental unit, pytania, lookup po `questionId`, `contentVersion` i `artifactSha256`. W nowym kodzie nie występują aliasy `primaryMentalUnitId` ani `learningBlockId`.
7. Konfiguracje trybów, selekcja puli, timery, feedback timing i reguły sesji pozostają własnością aplikacji. Mogą rozróżniać zachowanie produktu, lecz przyjmują kanoniczne pytania zamiast rodzinnych formatów.
8. SIMP-04 zachowuje bieżący kontrakt persistence `packagePin` wyłącznie na granicy zgodności do SIMP-05. Nie wolno na jego podstawie odczytywać starej paczki ani fallbackować do legacy contentu; nowe uruchomienia muszą wskazywać aktywny artefakt.

### Jawny kontrakt trybów produktu

Każdy wpis `ProductModeConfig` ma dokładnie: `trackId`, `modeId`, `availability`, `requestedLengths`, `minimumActualLength`, `defaultRequestedLength`, `feedbackTiming`, `timer`, `reinsertPolicy` i `selection`. `selection` jest wyłącznie jednym z: pełny `nodeId`, opcjonalny `mentalUnitId`, jawna uporządkowana lista `questionId` albo evidence-conditioned subset tych samych pytań. Loader odrzuca brak konfiguracji, obcy track/node/mental unit/question, pustą pulę oraz długość niezgodną z pulą.

| Tracki | Zachowywane tryby z bieżącego runtime | Bazowa selekcja |
| --- | --- | --- |
| Coding | Learn Approach 10; Guided 10/20/40; Custom 10/20/40 z feedbackiem after-each lub session-end; Weak Area 10/20 | aktywny Free node; Weak Area tylko z due/session-miss evidence |
| 3× Design | Learn Framework 1/10; Tradeoff Practice 1/10; Weak Area 1/10 | aktywny Free node; Weak Area tylko z due evidence |
| GCP | Diagnostic 40; Focus 10/20/40; Weak Area 10/20; Quick Review 10 | aktywny Free node; Diagnostic zachowuje dokładną uporządkowaną listę 40 `questionId` |
| AWS | Focus 4; Weak Area 4; Quick Review 4 | aktywny Free node; review tylko z due evidence |
| AZ-104, AI-901, Claude | Focus 10/20/40; Weak Area 10/20; Quick Review 10 | aktywny Free node; review tylko z due evidence |

Tryby wymienione w briefach, ale nieobecne w zweryfikowanych bieżących paczkach, pozostają jawnie unavailable; SIMP-04 ich nie „odblokowuje” samym pojawieniem się pełnego banku. Dane potrzebne do powyższej macierzy zostają zapisane w jednym aplikacyjnym module configu, nie w pytaniach i nie w adapterach rodzinnych.

### Jednokierunkowa projekcja persistence

Dla nowego aktywnego artefaktu kompatybilny `packagePin` powstaje wyłącznie jako `{ packageIdentity: artifactSha256, packageVersion: contentVersion, contentReleaseId: "canonical-content-v1" }`. Jest zapisywany przez istniejące rekordy do czasu SIMP-05, ale nie służy do wyszukania historycznego blobu. Lookup dopuszcza tylko dokładne dopasowanie do jednego z dziewięciu aktywnych artefaktów. Stary pin daje jawny błąd niedopasowania; nie uruchamia legacy resolvera. SIMP-05 zastąpi pole docelowym `artifactSha256` i obsłuży migrację zapisanych danych.

### Niezmienność i parity

Skopiowane JSON-y są build artifacts, nie drugim źródłem authoringu: nagłówek README i test boundary zabraniają ręcznych zmian. Sync najpierw buduje do katalogu tymczasowego, porównuje exact lock/track membership/counts/hashes, atomowo zastępuje wyłącznie zestaw dziesięciu plików, a następnie ponownie weryfikuje ich bajty. Check-only parity gate przebudowuje źródło do temp i failuje na każdym drifcie bez zapisu. Ten gate obowiązuje przed usunięciem starej ścieżki, po jej usunięciu i w finalnym QA.

## Zakres implementacji

- deterministyczny sync dziewięciu artefaktów i locka z `patternly-content`;
- bezpośrednie importy JSON w aplikacji;
- wspólny `Question`, walidacja i scoring pięciu interakcji;
- jeden katalog runtime oraz przepięcie discovery, przygotowania sesji, lookupów, feedbacku i selekcji;
- usunięcie aktywnego generowanego blobu, trust indexu, gzip/base64 oraz rodzinnych walidatorów i adapterów pytania;
- aktualizacja content boundary, testów cross-repo i testów wszystkich interakcji/tracków;
- raport `patternly-content/docs/planning/reports/SIMP-04-REPORT.md` oraz aktualizacja planów po niezależnym QA.

## Poza zakresem

- zmiany treści pytań lub zamrożonej taksonomii;
- migracja trwałego formatu sesji, prób, historii i review queue — SIMP-05;
- usuwanie legacy źródeł i evidence w `patternly-content` — SIMP-05;
- zmiany UI niezwiązane z nowym formatem;
- EPIC-09.

## Kryteria akceptacji

1. Aplikacja importuje dokładnie dziewięć prostych artefaktów oraz jeden lock; każdy track jest dostępny z pełnym kanonicznym inwentarzem.
2. Hash każdego importowanego JSON-u zgadza się z lockiem z `patternly-content`; zbiorczy inwentarz wynosi 9 / 117 / 932 / 16 041.
3. Nie istnieje aktywny import `generatedFreeNodePackages`, `ContentPackageResolver`, `bundledContentPackageTrustIndex` ani runtime path wykonujący base64/gunzip lub rodzinny schema dispatch.
4. Produkcyjny model pytania nie zawiera rodzinnych typów ani aliasów mental unitów; konsumenci używają `questionId`, `nodeId`, `mentalUnitId`, `prompt`, `interaction`, `answer` i `feedback`.
5. Choice single/multiple, ordering, complexity i decision matrix mają jawne, przetestowane funkcje scoringu zgodne z kontraktem `patternly-content`.
6. Każdy z dziewięciu tracków przechodzi discovery i może przygotować co najmniej jeden obsługiwany tryb z pytaniami należącymi do tego samego aktywnego artefaktu.
7. Brakujący, dodatkowy, zmieniony lub źle przypisany artefakt failuje jawnie przed gotowością aplikacji; nie ma fallbacku do starej paczki ani innego tracka.
8. Istniejące tryby produktu pozostają oddzielone od danych pytania, a testy regresyjne potwierdzają ich dostępność, długości i selekcję w zakresie obsługiwanym przed zmianą.
9. `npm run typecheck`, pełny `npm test`, `npm run validate:content-boundary`, właściwy gate cross-repo oraz build/export aplikacji przechodzą.
10. Nie zmieniono `manual/source`, kanonicznych pytań ani repozytoriów `patternly-backend` i `patternly-web`.

## Kolejność małych porcji

1. Build-input boundary: sync, dziewięć JSON-ów, lock i test dokładnych bajtów/hash/inwentarza.
2. Product-mode contract: jeden jawny config odpowiadający powyższej macierzy oraz fail-closed test każdej puli/długości/timera/feedback timing.
3. Canonical question core: jeden typ, walidator, indeks i scoring pięciu interakcji.
4. Runtime cutover: jeden katalog oraz przepięcie przygotowania/discovery/lookupów i rodzinnych lifecycle runners na canonical `Question`.
5. Pre-removal parity gate; dopiero po PASS usunięcie blobu, resolvera, trust indexu, dekompresji i nieużywanych rodzinnych adapterów wraz z referencjami/testami.
6. Post-removal parity gate, full gate, niezależne QA, raport, status planu, commit i push.

## Ryzyka i stop conditions

- **Persistence:** jeśli SIMP-04 wymaga trwałej zmiany zapisanych rekordów zamiast ograniczonej projekcji `packagePin`, zatrzymać i przenieść ją do jawnego SIMP-05.
- **Tryby:** jeśli nowy artefakt nie dostarcza informacji koniecznej do zachowania istniejącego trybu, nie dopisywać jej do pytania i nie tworzyć ukrytego fallbacku; udokumentować najmniejszy produktowy config w aplikacji.
- **Tożsamość:** jakikolwiek rozjazd ID, treści, counts lub hash zatrzymuje cutover.
- **Zakres:** nie usuwać legacy contentu w `patternly-content` i nie uruchamiać EPIC-09.
- **QA:** unexplained test/build failure albo wynik oceny poniżej 0,8 zatrzymuje wdrożenie.

## Ocena podejścia

| Kryterium | Wynik | Uzasadnienie |
| --- | ---: | --- |
| Zgodność z celem / architekturą | 0,94 | Usuwa historyczne paczki i rodzinne formaty z aktywnej granicy, zachowując ownership trybów w aplikacji. |
| Prostota | 0,86 | Jeden JSON contract, katalog i mode config; przejściowa projekcja persistence pozostaje tylko do SIMP-05. |
| Ryzyko | 0,86 | Jawna macierz trybów, jednokierunkowy pin oraz parity przed i po removal izolują cutover. |
| Utrzymywalność | 0,91 | Pytania mają jedną reprezentację, a build inputs są jawne i deterministyczne. |

Minimum: **0,86**. Podejście przekracza próg 0,8 i wymaga ponownej niezależnej walidacji briefingu przed implementacją.

## Wymagane evidence

- manifest importowanych plików z exact SHA-256 i counts;
- wynik cross-repo parity z `patternly-content` HEAD;
- testy wszystkich pięciu interakcji i dziewięciu tracków;
- lista usuniętych aktywnych ścieżek oraz `rg` potwierdzający brak runtime referencji;
- pełne komendy i wyniki gate'ów;
- niezależne QA bez otwartych problemów.
