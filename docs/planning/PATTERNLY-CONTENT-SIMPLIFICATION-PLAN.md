# Patternly Content — KISS plan

> **Rola po konsolidacji:** kryteria techniczne `SIMP-01–05`. Kolejność programu i status tasków utrzymuje wyłącznie [`../../../docs/PATTERNLY-WORKING-PLAN.md`](../../../docs/PATTERNLY-WORKING-PLAN.md).

**Status:** realizacja rozpoczęta; `SIMP-01–04` ukończone, następny `SIMP-05`
**Cel:** repozytorium ma być prostą bazą pytań JSON, a aplikacja ma bezpośrednio konsumować jej prosty artefakt podczas buildu

**Warunek poprzedzający:** naprawa zapisu decyzji akceptacyjnej `ACC-01` → `ACC-02` / ODK-E2E-099 zgodnie z `docs/planning/CONTENT-ACCEPTANCE-DECISION-PACKET.md`. Migracja musi zachować dokładne item identities związane z decyzją PO; nie może użyć model evaluation jako zastępczej akceptacji.

## Ocena podejścia

- zgodność z celem: **0,96** — usuwa złożoność authoringu i aplikacyjnych adapterów;
- prostota: **0,91** — jeden kontrakt i wspólny kod, ale dziewięć niezależnych granic pracy;
- bezpieczeństwo migracji: **0,88** — zachowuje identyfikatory pytań oraz możliwość odczytu rozpoczętych sesji;
- utrzymywalność: **0,93** — różnice zostają tylko tam, gdzie wynikają z interakcji lub zachowania produktu.

Wynik całościowy: **0,92**. Podejście nie wymaga kolejnego przeprojektowania przed implementacją.

## Zweryfikowana granica aplikacja–content

Aplikacja nie czyta dziś źródłowych banków. Skrypt synchronizujący pobiera z historycznych commitów repozytorium contentu paczki Free node, kompresuje je do wygenerowanego pliku TypeScript, a aplikacja ponownie sprawdza wielowarstwowy manifest, provenance, profile trybów, taksonomię i kilka hashy. Sam wygenerowany plik ma około 761 KB.

Runtime ma trzy rodzinne kształty pytania i trzy adaptery katalogu. Ten sam mental unit jest odczytywany między innymi jako `taxonomy.primaryMentalUnitId`, `taxonomy.mentalUnitId` albo pośrednio przez pola certyfikacyjne. Ta złożoność jest technicznym długiem, nie potrzebą produktu.

Nie można jednak usunąć całej tożsamości wersji. Sesje, próby, kolejka powtórek i raporty treści zapisują `trackId`, `itemId`, `contentVersion` oraz dokładną wersję paczki. Docelowo zachowujemy wartości `trackId` i `itemId`, a bieżącą paczkę identyfikujemy prostym `contentVersion` i hashem artefaktu. Stare `packagePin` pozostaje wyłącznie przy odczycie już zapisanych danych do czasu potwierdzenia migracji tych danych; nie jest częścią nowego formatu pytań.

## Docelowy układ

```text
content/
  catalog.json
  <trackId>/<nodeId>/<mentalUnitId>.json
assets/
scripts/build.mjs
tests/shared-contract.test.mjs
tests/tracks/<trackId>.test.mjs
package.json
README.md
```

Każde pytanie ma ten sam zestaw pól:

```text
questionId
trackId
nodeId
mentalUnitId
prompt
constraints
interaction
answer
feedback
difficulty
sourceRefs
```

Wszędzie obowiązuje `mentalUnitId`. Nie pozostają aliasy `learningBlockId`, `primaryMentalUnitId` ani osobne nazwy zależne od rodziny.

Jedyną uzasadnioną różnicą jest `interaction`: choice single/multiple, ordering, complexity albo decision matrix. Nie tworzymy przez to osobnych schematów rodzin ani osobnych pipeline'ów.

## Jeden mechanizm, niezależne tracki

Builder jest jedną współdzieloną implementacją, ale zawsze przyjmuje `trackId`:

1. czyta wyłącznie `content/<trackId>/`;
2. odrzuca brakujące lub powtórzone ID i niewykonalny klucz odpowiedzi;
3. tworzy osobny JSON tego tracka używany przez aplikację;
4. zapisuje liczbę pytań i hash wyniku.

Każdy z dziewięciu tracków można osobno walidować, testować i budować. Zmiana AWS nie uruchamia testów ani buildu GCP, Design lub Coding. Wspólny test kontraktu jest mały i uruchamia się tylko wtedy, gdy zmienia się schema albo builder.

Przykładowy interfejs:

```text
npm run content:validate -- --track <trackId>
npm run content:test -- --track <trackId>
npm run content:build -- --track <trackId>
```

Pełny katalog wszystkich dziewięciu tracków jest sprawdzany wyłącznie w release gate lub po zmianie wspólnego kontraktu.

## Jedna migracja

1. Sprawdzić dokładnie, jaki JSON importuje aplikacja, jakie typy i selektory utrzymuje oraz jakie ID zapisuje w postępie.
2. Ustalić jeden docelowy przykładowy plik obejmujący wszystkie interakcje.
3. Jednorazowo przekonwertować sześć obecnych formatów.
4. Potwierdzić każdy track osobno oraz łączny katalog 9 tracków, 117 nodów, 932 mental unitów i 16 041 pytań bez zmiany ID lub treści.
5. Uprościć aplikacyjny importer, typy danych, rejestr tracków i selektory tak, aby czytały bezpośrednio wspólny kontrakt i osobne artefakty tracków.
6. Usunąć z aplikacji rodzinne adaptery, aliasy pól i ścieżki zgodności, które istnieją wyłącznie dla starej architektury contentu.
7. Uruchomić per-track buildy, test scoringu oraz test odczytu istniejącego postępu.
8. Usunąć stary system contentu i jednorazowy konwerter.

Nie utrzymujemy dwóch aktywnych formatów ani trwałego adaptera przenoszącego historyczną złożoność do aplikacji. Kompatybilność dotyczy wartości stabilnych ID i zapisanych danych użytkownika, nie starego kształtu authoringu.

## Zadania implementacyjne

Każdy `SIMP-*` jest osobnym taskiem i dziedziczy ten kontrakt wykonawczy: celem jest wyłącznie rezultat nazwany w nagłówku; wejściami są zaakceptowany raport poprzedniego taska, przypięty baseline ACC-01/02 oraz bieżący kod/testy; poza zakresem są późniejsze `SIMP-*`, poprawki merytoryczne pytań i EPIC-09. Weryfikacja obejmuje test wspólnego kontraktu, dotknięte tracki/interakcje oraz exact identity/count/hash; wymagane evidence to komendy, wyniki, macierz przed/po i lista usuniętych ścieżek. Ryzyka oraz stop conditions to rozjazd identity/content/count, aktywny konsument usuwanej ścieżki, potrzeba trwałego legacy adaptera albo wynik oceny poniżej 0,8. Raport docelowy: `docs/planning/reports/SIMP-<NN>-REPORT.md` lub istniejący równoważny kanoniczny katalog. Status następnego taska nie zmienia się na `done` bez niezależnego QA.

### SIMP-01 — kanoniczny kontrakt i fixture referencyjny

**Status:** `done` — [raport](reports/SIMP-01-REPORT.md)

W `patternly-content` dodać jeden schemat pytania, katalog tracków i mały fixture pokrywający pięć interakcji. `questionId`, `trackId`, `nodeId` i `mentalUnitId` są obowiązkowe. `answer` oraz `feedback` mają wariant zależny wyłącznie od `interaction`.

Akceptacja: fixture przechodzi wspólną walidację; aliasy rodzinne nie występują w kontrakcie; dla każdej interakcji da się policzyć wynik.

### SIMP-02 — wspólny builder z dziewięcioma niezależnymi wejściami

**Status:** `done` — [raport](reports/SIMP-02-REPORT.md)

Zastąpić rodzinne pipeline'y jednym builderem przyjmującym `trackId`. Wynikiem jest `dist/<trackId>.json` oraz mały wpis locka: `trackId`, `contentVersion`, `questionCount`, `sha256`. Walidacja strukturalna i scoring są wspólne; test inwentarza pozostaje osobny dla każdego tracka.

Akceptacja: każdy track daje się osobno walidować, testować i budować; zmiana jednego banku nie dotyka artefaktów pozostałych; pełny gate potwierdza dokładnie dziewięć wpisów.

### SIMP-03 — mechaniczna migracja dziewięciu banków

**Status:** `done` — [raport](reports/SIMP-03-REPORT.md)

Jednorazowym konwerterem przenieść kolejno każdy track. To dziewięć niezależnych porcji tego samego zadania, nie dziewięć architektur. Nie poprawiać pytań podczas migracji i nie zmieniać zamrożonych nodów.

Akceptacja każdego tracka: identyczny zbiór ID i treści, poprawne przypisanie do node/mental unit, zgodne typy interakcji i liczba pytań. Akceptacja całości: 9 tracków, 117 nodów, 932 mental unity i 16 041 pytań względem przypiętego baseline'u migracji. Sześć historycznych formatów może obsłużyć wyłącznie jednorazowy kod migracyjny należący do SIMP-03; konwerter usuwa się po migracji i nie może stać się wejściem ani biblioteką EPIC-09.

### SIMP-04 — prosty konsument w aplikacji

**Status:** `done` — [raport](reports/SIMP-04-REPORT.md)

Zastąpić synchronizację przez historyczne commity, wygenerowany plik z zakodowanymi paczkami, trust index, rozpakowywanie oraz rodzinne walidatory bezpośrednim włączeniem dziewięciu zbudowanych JSON-ów. Wprowadzić jeden `Question` i jeden katalog runtime. Zachować osobne funkcje scoringu dla realnie różnych interakcji oraz tryby ćwiczeń jako logikę produktu, a nie część formatu banku.

Akceptacja: aplikacja uruchamia każdy track z jego osobnego artefaktu; choice, ordering, complexity i decision matrix liczą wynik jak wcześniej; w kodzie konsumenta nie ma aliasów mental unitów ani trzech rodzinnych adapterów.

### SIMP-05 — migracja zapisanej tożsamości i usunięcie starego systemu

**Status:** `planned` — [pakiet akceptacyjny](SIMP-05-ACCEPTANCE-PACKET.md)

Nowe sesje zapisują `trackId`, `questionId`, `contentVersion` i `artifactSha256`. Przy starcie jednorazowo przekształcić istniejące `packagePin` do nowej tożsamości, zachowując stare wartości ID. Jeśli konkretnej starej paczki nie da się zmapować, istniejąca zakończona historia pozostaje widoczna, a wznowienie niedokończonej sesji pokazuje jawny komunikat zamiast używać innej wersji pytań.

Po przejściu testów usunąć stare schematy, buildery, generated TS, resolver/trust index, nieużywane manifesty, evidence i ich testy. Przed usunięciem każdego obszaru sprawdzić odwołania i entry pointy.

Akceptacja: historia i kolejka powtórek wskazują te same pytania; aktywna sesja wznawia się na tej samej wersji albo jawnie zgłasza brak; nie istnieją dwa aktywne formaty ani fallback do starego contentu.

## Minimalna kolejność i bramki

SIMP-01–SIMP-02 tworzą nową prostą ścieżkę. SIMP-03 migruje track po tracku. SIMP-04–SIMP-05 przełączają aplikację dopiero po zgodności wszystkich dziewięciu inwentarzy. Stary system i jednorazowe adaptery migracyjne usuwamy najpóźniej w SIMP-05, zanim EPIC-09 ruszy.

Weryfikacja jest proporcjonalna: test kontraktu, test i build zmienionego tracka, test scoringu jego interakcji oraz test odczytu zapisanych danych. Wszystkie dziewięć tracków uruchamiamy przy zmianie wspólnego kontraktu, przełączeniu aplikacji i release.

## Co usuwamy

Po potwierdzeniu braku aktywnego konsumenta usuwamy:

- family-specific schemas;
- authoring registrations i scaffoldy;
- curricula, slot plans i promotion stages dublujące pytania;
- osobne walidatory banków;
- readiness ośmiu tracków;
- generatory review packets;
- wieloetapowe admission states;
- wygenerowane evidence i artefakty bez aktywnego konsumenta;
- testy, skrypty, konfiguracje i dokumentację starej architektury.

Historia pozostaje w Git. Zachowujemy tylko artefakty faktycznie potrzebne przez istniejący build lub zapisany postęp użytkownika.

## Review i EPIC-09

Akceptacja PO to jeden mały manifest hashy dziewięciu banków, przygotowany i naprawiony wcześniej przez ACC-01/ACC-02. Review człowieka i wyniki modelu wskazują `questionId`, ale nie są częścią pytania ani buildu. Migracja zachowuje powiązanie zaakceptowanych item identities z nowym kontraktem i nie tworzy nowej decyzji PO.

EPIC-09 zaczyna się po uproszczeniu. Czyta zwykłe JSON-y, zapisuje raport i kolejkę poprawek. Nie potrzebuje adapterów, osobnej aplikacji, rozbudowanej konsoli ani prawa publikacji.

## Gotowe oznacza

- jeden format pytań;
- jedno `mentalUnitId`;
- jeden katalog wejściowy;
- jeden współdzielony mechanizm buildera z parametrem `trackId`;
- osobna walidacja, test i artefakt dla każdego z dziewięciu tracków;
- mały wspólny test schema/buildera oraz pełny test katalogu tylko na release;
- te same pytania i stabilne ID w aplikacji;
- jeden prosty importer i wspólne typy contentu w aplikacji;
- brak rodzinnych adapterów i aliasów starego schematu po obu stronach granicy;
- brak równoległej starej architektury;
- cały aktualny proces da się zrozumieć z README i jednego przykładowego pliku.

## Następny krok

Zaimplementować SIMP-04: zastąpić złożony konsument aplikacyjny bezpośrednim użyciem dziewięciu kanonicznych artefaktów, zachowując scoring i zapisane stabilne ID. EPIC-09 pozostaje wstrzymany do zakończenia SIMP-05.
