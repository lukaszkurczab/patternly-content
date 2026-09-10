# EPIC-09 — model-based evaluation wszystkich banków

> **Rola po konsolidacji:** specyfikacja i kryteria `09-A–09-H`. Kolejność programu i status tasków utrzymuje wyłącznie [`../../../docs/PATTERNLY-WORKING-PLAN.md`](../../../docs/PATTERNLY-WORKING-PLAN.md).

**Status:** `deferred` do zakończenia uproszczenia repozytorium content
**Charakter:** uzupełniająca ścieżka jakościowa
**Zakres:** wszystkie 9 zaakceptowanych banków, około 16 041 pozycji według obecnych raportów i źródeł
**Poza zakresem:** zmiana liczby, granic i znaczenia istniejących nodów

**Warunek wejścia:** zakończone `SIMP-01`–`SIMP-05` z `docs/planning/PATTERNLY-CONTENT-SIMPLIFICATION-PLAN.md`. EPIC-09 ma czytać jeden kanoniczny schema i nie implementuje adapterów utrwalających sześć historycznych formatów.

## 1. Cel

Zbudować powtarzalne narzędzie, które dla każdego istniejącego noda:

1. oceni jakość podziału pytań na mental unity;
2. oceni komplet pytań wewnątrz każdego mental unitu;
3. wystawi dla każdego pytania jawne wyniki 0–1 według wersjonowanej rubryki;
4. zatrzyma mental unit, jeśli choć jedno pytanie uzyska wynik poniżej 0,90 albo wystąpi krytyczny błąd;
5. wygeneruje konkretną kolejkę poprawek i po zmianie oceni tylko zmienione oraz zależne elementy.

Model nie zmienia treści automatycznie i nie jest nową władzą publikacyjną. Dostarcza evidence do poprawy i późniejszej decyzji.

## 2. Ustalona granica

```text
TRACK
  └── NODE                    ← istniejący, nie oceniamy jego podziału ani nie cofamy architektury
       ├── MENTAL UNIT A      ← najpierw oceniamy podział wewnątrz noda
       │    ├── QUESTION 1    ← następnie każde pytanie osobno
       │    ├── QUESTION 2
       │    └── ...
       └── MENTAL UNIT B
```

Po SIMP-05 każde pytanie jest reprezentowane przez jeden kanoniczny kontrakt z obowiązkowym `mentalUnitId`. Evaluator czyta wyłącznie ten kontrakt i nie zna `learningBlockId`, `primaryMentalUnitId`, rodzinnych candidate-source schemas ani dawnych runtime adapterów. Jeśli któregokolwiek tracka nie da się odczytać z kanonicznego schema, EPIC-09 zatrzymuje się jako `blocking`; nie dodaje adaptera zgodności.

### Historyczny baseline migracji

Poniższa tabela opisuje przypięty stan wejściowy przed SIMP-03. Służy do sprawdzenia mechanicznej zgodności migracji, a nie jako kontrakt wejściowy evaluatora. Inventory EPIC-09 odtwarza liczby z kanonicznych plików po SIMP-05 i raportuje rozbieżność zamiast normalizować legacy.

| Bank | Nody w `manual/source` | Mental unity | Pytania | Interakcje |
|---|---:|---:|---:|---|
| AWS SAA | 21 | 134 | 2 568 | 2 568 choice-single |
| GCP ACE | 20 | 152 | 2 981 | 2 981 choice-single |
| Azure AZ-104 | 9 | 75 | 1 288 | 1 288 choice-single |
| Azure AI-901 | 5 | 64 | 752 | 752 choice-single |
| Claude Certified Architect Professional | 7 | 38 | 300 | 237 choice-single, 63 choice-multiple |
| Coding Interview | 26 | 213 | 3 404 | 2 827 choice, 298 ordering, 279 complexity |
| Backend System Design | 10 | 89 | 1 569 | 1 569 choice-single |
| Frontend System Design | 10 | 88 | 1 766 | 601 choice, 1 018 ordering, 147 decision-matrix |
| Object-Oriented Design | 9 | 79 | 1 413 | 1 413 choice-single |
| **Razem** | **117** | **932** | **16 041** | **16 041** |

Przed SIMP-03 sześć rzeczywistych kontraktów to `certification-manual-source-v2`, `certification-node-manual-source-v1`, `coding-interview-manual-source-v2` oraz trzy osobne candidate-source schemas dla Backend, Frontend i OOD. Jednorazowa migracja może je odczytać wyłącznie po to, aby wytworzyć kanoniczne pliki i dowód zgodności. Kod tej migracji jest usuwany w SIMP-05 i nie może być importowany przez evaluator.

Liczby nodów w części historycznych curriculum configs różnią się od topologii zaakceptowanych źródeł. SIMP-03 musi jawnie udokumentować te różnice i zachować zamrożone node identities; EPIC-09 nie czyta równoległej curriculum topology. Nie wolno automatycznie scalać, usuwać ani przenosić nodów.

## 3. Pipeline

| Krok | Nazwa | Wejście | Wynik | Warunek przejścia |
|---|---|---|---|---|
| 0 | Inventory kanonicznego schema | 9 osobnych banków po SIMP-05, track/node/mentalUnit/question IDs i źródła | Deterministyczny manifest ewaluacji z hashami | Każde pytanie przechodzi jeden wspólny schema i ma jednoznaczny track, node, mental unit oraz fingerprint; zero legacy adapters. |
| 1 | Walidacja deterministyczna | Kanoniczny manifest | Błędy schematu, braków, ID, referencji, duplikatów dokładnych | Zero błędów strukturalnych. Model nie ocenia danych, których nie da się jednoznacznie odczytać z kanonicznego kontraktu. |
| 2 | Ocena podziału noda na mental unity | Cel noda, lista mental units, ich cele/opisy, przypisane identyfikatory pytań i wymagania family | Raport architektury mental units | Każdy wymiar ma co najmniej 0,90 i nie ma krytycznej kolizji/braku. |
| 3 | Ocena pojedynczych pytań | Jedno pytanie, kontrakt mental unitu, źródła, family rubric | Wersjonowany rekord oceny pytania | Najniższy wymagany wynik pytania ≥ 0,90 i brak hard fail. |
| 4 | Ocena zestawu mental unitu | Wszystkie wyniki i pytania mental unitu; kandydaci podobieństwa z kontroli deterministycznej | Raport duplikacji, pokrycia, różnorodności i przecieków wzorca | Wszystkie wymiary zestawu ≥ 0,90 i brak krytycznego problemu. |
| 5 | Agregacja i kolejka poprawek | Raporty z kroków 2–4 | PASS/FAIL mental unitu, lista problemów i rekomendowanych działań | Mental unit przechodzi tylko przy pełnym spełnieniu wszystkich bramek. |
| 6 | Remediation i retest | Zatwierdzone poprawki | Nowe fingerprinty i raport wpływu | Ponowna ocena zmienionych pytań, ich mental unitu oraz wykrytych relacji między pytaniami. |

## 4. Rubryka mental unitu

Evaluator otrzymuje cel istniejącego noda, pełną listę mental units w tym nodzie, opis/wymagania każdego unitu oraz zwięzły inventory przypisanych pytań. Nie wolno oceniać unitu w izolacji, ponieważ overlap i brak pokrycia są relacyjne.

| Wymiar | Pytanie ewaluacyjne | Przykład problemu |
|---|---|---|
| Cohesion | Czy wszystkie pytania w unicie ćwiczą jedną rozpoznawalną decyzję lub mechanizm? | Jeden unit łączy IAM, billing i networking bez wspólnej decyzji. |
| Separation | Czy unity w tym samym nodzie mają rozłączne odpowiedzialności i nie są synonimami? | Dwa unity różnią się tylko nazwą. |
| Coverage | Czy ważne decyzje należące do noda są pokryte przez jakiś unit? | Brak unitu dla krytycznego mechanizmu wymaganego przez blueprint. |
| Granularity | Czy unit nie jest ani pojedynczym faktem, ani ukrytym mini-nodem? | Jeden unit ma jeden drobiazg; inny obejmuje całą domenę. |
| Learnability | Czy zakres można ćwiczyć i wyjaśniać jako spójny model mentalny? | Lista luźnych usług bez wspólnej zasady. |
| Assignability | Czy każde pytanie ma jedno najlepsze przypisanie do unitu? | Znaczna część pytań pasuje równie dobrze do dwóch unitów. |

Proponowany `mentalUnitScore` to minimum z sześciu wymiarów, nie średnia. PASS wymaga `mentalUnitScore >= 0.90` oraz braku hard fail: braku istotnego zakresu, fundamentalnego overlapu albo niemożności jednoznacznego przypisania znaczącej części pytań.

## 5. Rubryka pojedynczego pytania

Każde pytanie otrzymuje wektor ocen, a nie tylko jedną nieprzejrzystą liczbę.

| Wymiar | Co oceniamy | Hard fail |
|---|---|---|
| Mental-unit alignment | Czy pytanie naprawdę sprawdza deklarowany mental unit i node? | Pytanie należy do innego unitu/noda. |
| Factual correctness | Czy treść, założenia i oczekiwana odpowiedź są poprawne względem dołączonych źródeł/kontraktu? | Błąd faktograficzny lub niepodparte twierdzenie krytyczne. |
| Answer-key correctness | Czy zaznaczony klucz jest poprawny, a liczba wyborów zgodna z poleceniem? | Zły klucz lub brak poprawnej opcji. |
| Precision and unambiguity | Czy prompt zawiera wszystkie rozstrzygające warunki i istnieje jednoznacznie najlepsza odpowiedź albo dokładnie deklarowany poprawny zestaw? | Dwie równorzędne odpowiedzi albo brak danych koniecznych do rozstrzygnięcia. |
| Distractor quality | Czy błędne odpowiedzi są wiarygodne diagnostycznie, lecz jednoznacznie błędne? | Distraktor również poprawny albo oczywista atrapa. |
| Educational explanation | Czy wyjaśnienie tłumaczy mechanizm i wszystkie rozróżnienia potrzebne do odpowiedzi, w tym najbliższe alternatywy, ale nie powtarza prerequisite knowledge z wcześniejszych nodów? | Wyjaśnienie przeczy kluczowi, pomija rozstrzygający mechanizm albo wymaga wiedzy, której użytkownik nie powinien jeszcze znać. |
| Clarity | Czy użytkownik rozumie oczekiwaną czynność i decydujące ograniczenia bez odgadywania intencji autora? | Konstrukcja językowa zmienia lub ukrywa znaczenie pytania. |
| B2 language with domain terminology | Czy składnia jest dostępna na poziomie B2 przy zachowaniu poprawnej terminologii branżowej? | Język uniemożliwia wiarygodne zmierzenie wiedzy zamiast kompetencji językowej. |
| Assessment quality | Czy trudność, głębokość rozumowania i forma są właściwe dla family i celu pytania? | Pytanie nie mierzy deklarowanej umiejętności lub udaje nieudokumentowany standard egzaminu. |
| Decision value | Czy pytanie ćwiczy użyteczną decyzję lub rozróżnienie zamiast pustego recallu albo kosmetycznej parafrazy? | Brak mierzalnej wartości edukacyjnej. |
| Source traceability | Czy ważne twierdzenia można powiązać z dozwolonym, aktualnym źródłem? | Nieistniejące lub nieadekwatne źródło dla kluczowego twierdzenia. |

Proponowany `questionScore` to minimum z wymaganych wymiarów. Pytanie przechodzi tylko, gdy `questionScore >= 0.90` i nie ma hard fail. Średnia nie może ukryć złego klucza wysokimi ocenami stylu.

Rubryki interakcji są osobne: choice ocenia distraktory; multiple-choice kompletność zestawu i omitted-correct feedback; ordering poprawność relacji i dopuszczalnych remisów; complexity poprawność wyprowadzenia; decision-matrix każdą oś, kombinację i scoring. `insufficient_evidence` oraz nierozstrzygnięty `disagreement` nie mogą dać PASS.

## 6. Kontrole całego zestawu pytań w mental unicie

Ocena każdego pytania osobno nie wykryje problemów kolekcji. Mental unit wymaga dodatkowych kontroli:

- duplikaty i bliskie parafrazy;
- nadmierne powtarzanie tego samego scenariusza lub poprawnej opcji;
- pokrycie wszystkich deklarowanych decyzji mental unitu;
- rozkład trudności i wymaganej głębokości rozumowania;
- różnorodność kontekstu bez sztucznej zamiany nazw;
- option-pattern leakage i stylistyczne podpowiedzi odpowiedzi;
- proporcja recall, zastosowania, diagnozy, trade-off i transferu;
- koncentracja całego unitu na jednym źródle, jeśli zakres wymaga szerszego dowodu.

Duplikację należy najpierw wykrywać tanio deterministycznie lub embeddingami, a modelowi przekazywać pary/klastry kandydatów. Wysyłanie kilkudziesięciu pełnych pytań w jednym promptcie grozi pomijaniem pozycji i biasem pozycyjnym.

## 7. Kontrakt wyniku

Każdy rekord oceny musi zawierać co najmniej:

```text
evaluationRunId
rubricVersion
evaluatorModel + exact version
promptTemplateVersion
trackId / nodeId / mentalUnitId / itemId
source fingerprint + item fingerprint
dimension scores 0..1
questionScore = minimum required dimension
hardFail codes
short evidence-based rationale
source references used
recommended action code
confidence / disagreement state
timestamp and cost/usage metadata
```

Raport mental unitu zawiera:

- ocenę struktury unitu;
- liczbę wszystkich pytań i rozkład wyników;
- najniżej ocenione pytanie;
- wszystkie pozycje poniżej 0,90;
- problemy zestawowe;
- PASS/FAIL oraz dokładne przyczyny;
- listę proponowanych poprawek, bez automatycznej mutacji źródeł.

## 8. Wiarygodność model-based evaluation

Wynik 0–1 nie jest obiektywnym prawdopodobieństwem poprawności. Jest wynikiem wersjonowanej rubryki. Zanim skala 0,90 stanie się gate, trzeba ją skalibrować.

Minimalny mechanizm wiarygodności:

1. ręcznie oznaczony zestaw kalibracyjny zawierający dobre pytania i znane defekty;
2. co najmniej dwa niezależne przebiegi lub dwa role/model judges dla krytycznych wymiarów;
3. jawny stan `disagreement`, gdy oceny różnią się ponad ustalony limit;
4. silniejszy adjudicator albo człowiek dla disagreement, hard fail i wyników blisko progu;
5. test stabilności na powtórzeniach przed masowym uruchomieniem;
6. brak automatycznej publikacji lub automatycznego zatwierdzania poprawek przez evaluator.

Gold set ma zawierać minimum 180 stratyfikowanych pytań rzeczywistych (20 na bank, wszystkie interakcje i rodziny) oraz minimum 120 syntetycznych mutacji z dokładnie jednym kontrolowanym defektem. Mutacje obejmują między innymi zły klucz, brak decydującego warunku, drugą poprawną odpowiedź, błędne przypisanie do unitu, sprzeczne wyjaśnienie, zły ordering/complexity/matrix scoring, parafrazę-duplikat i naruszenie prerequisite boundary. Mutacje nie trafiają do `manual/source`.

Warunek skalowania: recall hard-failów >= 0,95; precision hard-failów >= 0,90; zgodność PASS/FAIL z gold setem >= 0,90; zgodność powtórzonych dyspozycji >= 0,95; średnia różnica wyniku <= 0,03; zero przeoczonych celowo złych kluczy. Metryki są raportowane osobno per family i interaction.

## 9. Kontrola kosztu

- Ewaluacja działa na fingerprintach i nie ocenia ponownie niezmienionych rekordów.
- Najpierw uruchamiane są darmowe/tanie walidatory deterministyczne.
- Ocena pytań odbywa się pojedynczo lub w małych, stałych batchach.
- Drugi judge i adjudication są obowiązkowe tylko według zatwierdzonej polityki ryzyka, np. dla fail, near-threshold i próbki passów.
- Pipeline można wznawiać na poziomie track/node/mental unit/item.
- Raport kosztu powstaje per bank, model i typ oceny przed uruchomieniem pełnych około 16 tysięcy pozycji.

## 10. Proponowane fazy wdrożenia

Każda faza `09-*` jest osobnym taskiem. Jej goal i acceptance/stop condition są w tabeli; scope ogranicza się do wskazanego wejścia i artefaktu, a non-goals obejmują następne fazy, zmianę pytań bez human-edited remediation, automatyczną akceptację i publikację. Inputs to zatwierdzony raport poprzedniej fazy oraz kanoniczny schema po SIMP-05. Verification musi powtórzyć deterministyczne kontrakty, fixture/gold-set/pilot właściwe fazie i budget guard; required evidence obejmuje wersje modelu/rubryki, fingerprinty, wyniki, koszt i stop reason. Ryzyka to model bias, false precision, koszt, niepełne źródła i resumability. Report target: wersjonowany `reports/model-evaluation/09-<letter>-*.md/json`; niezależny QA zatwierdza evidence przed przejściem dalej.

| Faza | Cel | Stop condition |
|---|---|---|
| 09-A — inventory | Udowodnić pełne mapowanie 9 banków do track/node/mental unit/item. | Zero nieprzypisanych i wieloznacznie przypisanych pytań. |
| 09-B — rubric contract | Zatwierdzić kryteria, kody błędów, wynik i JSON schema. | PO akceptuje znaczenie PASS/FAIL; testy fixture obejmują znane defekty. |
| 09-C — calibration | Skalibrować gold set oraz syntetyczne defekty przed oceną produkcyjnego zakresu. | Stabilność, recall defektów i false-positive rate mieszczą się w ustalonych limitach per family i interaction. |
| 09-D — interaction/family pilots | Uruchomić małe piloty Coding, Certification i każdego odrębnego Design schema, obejmujące wszystkie interakcje. | Każda rodzina i interakcja ma evidence jakości judge'a; nierozstrzygnięte braki zatrzymują pełny track. |
| 09-E — one-track pilot i koszt | Ocenić jeden pełny track, policzyć p50/p90 koszt i jakość rekomendacji. | Raport pozwala podjąć decyzję scale/no-scale; pełny run nadal nie startuje bez jawnego budżetu. |
| 09-F — budget/scale gate | Zatwierdzić limit kosztu, modele, parametry, cache i stop conditions. | Istnieje jawna decyzja scale oraz egzekwowalny budżet. |
| 09-G — nine-track run | Uruchomić wersjonowany pipeline dla wszystkich banków. | Każdy mental unit ma kompletny, trwały raport i kolejkę poprawek. |
| 09-H — remediation loop | Po human-edited remediation retestować tylko zakres wpływu. | Zmienione pytania, dotknięte unity, relacje sibling partition i zależne źródła mają aktualne evidence. |

## 11. Rozstrzygnięcia implementacyjne

1. Próg 0,90 obowiązuje strukturę mental unitu, każdy wymagany wymiar pytania i kontrole zestawowe; agregacją jest minimum, nie średnia.
2. Kryteria niepasujące do typu interakcji są `not_applicable`, nie zerem; wszystkie właściwe wymiary są wymagane.
3. Primary judge zaczyna kalibrację na kosztowym modelu masowym, a niezależny silniejszy judge obsługuje fail, zakres 0,87–0,93, low confidence, insufficient evidence, disagreement i stratyfikowane 5% PASS. Dokładne snapshoty wybiera i przypina dopiero gold-set calibration.
4. EPIC-09 nie unieważnia bieżącej akceptacji PO i nie nadaje modelowi prawa publikacji. Ewentualne włączenie wyniku do release gate wymaga późniejszej jawnej decyzji PO po kalibracji.
5. Pilot rodzinny obejmuje co najmniej jeden node Coding, Certification i każdego odrębnego Design schema, w tym bogate interakcje Frontend. Pierwszy pełny track pilot to Claude: 300 pytań i single/multiple choice; nie zastępuje pilotów innych rodzin.
6. Implementacja powstaje jako Node.js CLI w `patternly-content`. Skill steruje procesem, a review console jest wyłącznie opcjonalnym konsumentem evidence. Nie powstaje osobna aplikacja ani równoległy Python pipeline.
7. Pełny run używa wersjonowanych Structured Outputs i asynchronicznych batchy. Każdy request oraz rezultat ma fingerprint, usage, koszt, status i resumable checkpoint.
8. Budżet nie jest zgadywany przed kalibracją: pełny run wymaga raportu kosztu pilota, prognozy p50/p90 oraz jawnego limitu zatwierdzonego przed wysłaniem dziewięciu banków.

## 12. Ocena podejścia przed implementacją

| Kryterium | Wynik 0–1 | Powód |
|---|---:|---|
| Spójność | 0,94 | Zachowuje istniejące nody i runtime, ocenia dokładnie mental unity oraz pytania. |
| Prostota | 0,90 | Warstwowy pipeline jest większy niż pojedynczy skrypt, ale czyta jeden schema; różnice pozostają wyłącznie w rubrykach interakcji. |
| Ryzyko | 0,82 | Największe ryzyka to fałszywa precyzja 0–1, model bias i koszt; calibration/adjudication/cache ograniczają je, ale wymagają decyzji. |
| Utrzymywalność | 0,91 | Wersjonowane rubryki, fingerprinty i jawne artefakty pozwalają powtarzać ocenę tylko dla zmian. |
| **Wynik końcowy** | **0,82** | Minimum nadal wyznacza ryzyko. Podejście jest gotowe do rozbicia na małe taski dopiero po SIMP-05; pierwszy task to wyłącznie deterministyczny inventory contract. |

## 13. Pierwszy task wykonawczy po uproszczeniu — 09-A

Zbudować read-only inventory z jednego kanonicznego schema. Kryteria: dokładnie 9 tracków oraz zgodność z przypiętym baseline'em migracji (obecnie 117 node identities, 932 mental unity i 16 041 unikalnych pytań); zero `unassigned`; pełny rozkład interakcji; identyczny bajtowo manifest przy powtórzeniu; zero zmian `content/`; zero wywołań modelu. Każda rozbieżność względem raportu SIMP-03 jest jawna i blokująca. Historyczne adaptery należą wyłącznie do jednorazowej migracji SIMP-03, są usuwane najpóźniej w SIMP-05 i nie pozostają częścią evaluatora.
