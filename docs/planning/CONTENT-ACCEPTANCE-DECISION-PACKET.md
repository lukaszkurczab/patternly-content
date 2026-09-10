# Patternly — pakiet decyzyjny akceptacji treści

**Status:** decyzja PO podjęta; materiał jest wejściem do naprawy ODK-E2E-099
**Data:** 10 września 2026
**Epic:** EPIC-02 — spójność i dopuszczenie treści do wydania
**Powiązanie:** ODK-E2E-099

## Decyzja Product Ownera

10 września 2026 Product Owner zaakceptował na obecnym etapie wszystkie 9 banków, w tym Claude Certified Architect Professional. Zapis implementacyjny musi wiązać tę decyzję z dokładnymi manifestami treści, a nie automatycznie przepisywać zgodę na dowolny nowszy commit repozytorium.

Product Owner ustanowił jednocześnie osobny EPIC-09: uzupełniającą ponowną walidację wszystkich banków przy użyciu model-based evidence / model-based evaluation. Metoda jest opisana w `docs/planning/EPIC-09-MODEL-BASED-EVALUATION-DRAFT.md`, ale jej implementacja pozostaje `deferred` do zakończenia `SIMP-01`–`SIMP-05`. Model evaluation nie unieważnia tej decyzji, nie dziedziczy uprawnienia do akceptacji i nie publikuje treści.

## Stan zapisu decyzji

| Zakres | Status | Repozytoryjne źródło prawdy | Następny krok |
|---|---|---|---|
| Osiem wcześniej zaakceptowanych banków | `done` | `evidence/human-content-approvals/manifest.json` zawiera per-track `sourceManifestSha256` i `itemManifestSha256` dla dokładnego baseline'u `1e35906ccea0f3abbed6814fd828bdc6467318be`. | Zachować rekord i potwierdzić jego zgodność z niezmienionymi item manifestami; nie przepisywać zgody na nowszy commit repozytorium. |
| Claude Certified Architect Professional | `partial` | Decyzja PO z 10 września 2026 istnieje, a artefakt `ccarp-2026.09.03` ma 300 pozycji, source commit `563d1b06b3c51552f177199091fb28ef53ccf2b8` i checksum `ebc0c49fecff8a67a2b0ecbd04f8e4eb78d89e0efff83ad7646b3878c2875138`. Dziewiąty wpis nie istnieje jeszcze w manifeście human approval. | W `ACC-01` wyliczyć i zapisać dokładne source/item manifest hashes, a w `ACC-02` wdrożyć dziewięcio-trackowy rekord bez fałszywego przypisania decyzji agentowi. |
| Readiness i admission | `blocking` | Aktywne skrypty, schematy i evidence nadal są nazwane i zbudowane dla ośmiu tracków; testy oczekują ośmiu wpisów. | Naprawić w `ACC-02` / ODK-E2E-099 na podstawie ustalonego baseline'u, bez osłabiania asercji. |

## Porównane punkty historii

| Punkt | Rola |
|---|---|
| `1e35906ccea0f3abbed6814fd828bdc6467318be` | commit związany z ostatnim manifestem akceptacji właściciela ośmiu tracków |
| `846b75fafa1fa0a35590622bebd7b1789c95adf7` | commit wskazany przez readiness i dodający bank Claude |

Porównanie obejmuje pełny diff między tymi punktami. Nie zakłada, że późniejszy commit zasługuje na akceptację tylko dlatego, że jest nowszy.

## Wynik porównania

| Zakres | Status | Potwierdzony wynik | Wymagana decyzja |
|---|---|---|---|
| Kanoniczne źródła pytań wcześniejszych 8 tracków | `done` | Między porównywanymi punktami nie zmieniono żadnego pliku pod ich `manual/source`. | Zachować istniejącą akceptację dla dokładnie tych samych manifestów treści; nie wymagać ponownego czytania banków. |
| Claude Certified Architect Professional | `partial` | Dodano 38 plików źródłowych i 300 pytań obejmujących 38 celów w 7 obszarach. Pliki nadal mają historyczny techniczny status `unapproved`, ale PO jawnie zaakceptował bank 10 września 2026; brakuje technicznego wpisu tej decyzji powiązanego z dokładnymi manifestami. | W ACC-01/ACC-02 zapisać decyzję względem dokładnych manifestów. Późniejsza model-based evaluation należy do EPIC-09. |
| GCP ACE — profil darmowego doświadczenia | `partial` | Kanoniczne pytania nie zmieniły się, ale profil został podniesiony do v2 i dodano 40-pytaniowy tryb diagnostic z istniejących identyfikatorów. | Nie jest to ponowna akceptacja treści; wymaga osobnej akceptacji zachowania produktu i testu konfiguracji. |
| Publikacja, immutable artifacts i free-node packages | `partial` | Dodano nowe wydania, pakiety, piny i dowody dla ośmiu tracków bez zmiany ich kanonicznych źródeł pytań. | Agent weryfikuje zgodność hashy i artefaktów; PO nie zatwierdza ich merytorycznie jako nowych pytań. |
| Readiness i manifest akceptacji | `blocking` | Readiness wskazuje inny commit niż manifest akceptacji, przez co test słusznie failuje. | Naprawić model dowodu tak, aby akceptacja wiązała manifest treści, a nie przypadkowy commit zawierający również narzędzia i artefakty. |

## Claude — zakres nowej treści

| Obszar | Cele | Pytania | Jednokrotny wybór | Wielokrotny wybór |
|---|---:|---:|---:|---:|
| Solution design and architecture | 6 | 48 | 42 | 6 |
| Model, prompt and context decisions | 5 | 42 | 37 | 5 |
| Enterprise tools, retrieval and integration | 8 | 64 | 56 | 8 |
| Evaluation, diagnosis and optimization | 6 | 45 | 33 | 12 |
| Governance, safety and risk controls | 5 | 35 | 22 | 13 |
| Stakeholder decisions and delivery lifecycle | 5 | 36 | 23 | 13 |
| Team workflows and operational enablement | 3 | 30 | 24 | 6 |
| **Łącznie** | **38** | **300** | **237** | **63** |

Bank deklaruje zgodność z siedmioma obszarami egzaminu i 63-pytaniową formą ćwiczeniową. Nie deklaruje wiernego odtworzenia zachowań providera, których źródła nie dokumentują, ani przewidywania wyniku egzaminu.

## Wykonana weryfikacja techniczna

Uruchomiono dedykowany zestaw `ccarpContent.test.mjs`: **6/6 testów przeszło**. Kontrole potwierdzają między innymi:

- obecność decyzji dla wszystkich celów;
- siedem obszarów i jawne niewymyślanie nieudokumentowanego zachowania providera;
- przejście wszystkich batchy przez kanoniczny authoring, feedback i source bindings;
- wykonalną formę 63 pytań;
- pokrycie decyzji kontrastowych i zintegrowanych;
- trzy rozłączne formy egzaminacyjne oraz trzy rozłączne zestawy ćwiczeń na obszar.

Te testy potwierdzają strukturę i kontrakty. Nie potwierdzają samodzielnie poprawności merytorycznej, jakości języka ani wartości dydaktycznej wszystkich 300 pytań.

## Historyczna propozycja przeglądu — nieaktywna

Poniższa propozycja A–D jest zachowana jako kontekst decyzji, lecz została usunięta z aktywnej kolejki. Nie jest metodą EPIC-09, kryterium ważności akceptacji PO ani warunkiem ACC-01/ACC-02.

### Etap A — pełna kontrola automatyczna

Agent uruchamia pełne walidatory banku, źródeł, unikalności, schematów, feedbacku, pokrycia celów i form. Każdy błąd blokuje przekazanie do przeglądu PO.

### Etap B — deterministyczna próbka merytoryczna

Przygotować 3 pozycje z każdego z 38 celów: `selection`, `diagnosis` i `boundary`. Daje to **114 pytań**, obejmuje każdy cel i trzy kluczowe typy decyzji, bez arbitralnego losowania.

Dla każdej pozycji pakiet pokazuje:

- pytanie i ograniczenia scenariusza;
- wszystkie odpowiedzi i zaznaczoną odpowiedź oczekiwaną;
- Reason, Details i wyjaśnienia błędnych opcji;
- przypisany cel, obszar oraz źródła;
- miejsce na wynik `approve`, `changes_requested` albo `reject` i komentarz.

### Etap C — kontrola wszystkich poprawek

Każda pozycja zmieniona po uwadze PO wraca do ponownego przeglądu. Niezmienione pozycje zachowują wynik. Agent nie może sam nadać końcowego statusu właściciela.

### Etap D — decyzja końcowa

Po zielonych kontrolach i zamknięciu uwag PO podejmuje jedną z decyzji:

- `approved` — bank może wejść do nine-track readiness;
- `changes_requested` — wskazane pozycje lub cele wracają do poprawy;
- `rejected` — Claude pozostaje poza kandydatem mimo obecności technicznej.

## Obowiązująca kolejność po decyzji PO

1. Zachować ważność wcześniejszej akceptacji ośmiu niezmienionych banków na podstawie ich dokładnych manifestów treści.
2. Zapisać akceptację Claude udzieloną przez PO 10 września 2026 względem dokładnego manifestu 300 pozycji, bez przypisywania agentowi roli approvera.
3. Przebudować readiness na dziewięć tracków i naprawić model dowodu tak, aby akceptacja nie była związana ze zmianami narzędziowymi całego repozytorium (`ACC-01` → `ACC-02` / ODK-E2E-099).
4. Następnie wykonać `SIMP-01`–`SIMP-05` według `docs/planning/PATTERNLY-CONTENT-SIMPLIFICATION-PLAN.md`.
5. Dopiero po `SIMP-05` rozpocząć zadania EPIC-09 z `docs/planning/EPIC-09-MODEL-BASED-EVALUATION-DRAFT.md`.
6. Nie traktować próbki 114 pozycji jako zatwierdzonej metody; jest wyłącznie historyczną propozycją.

## Kontrakty wykonawcze ACC

### ACC-01 — przypięcie zaakceptowanego baseline'u

- **Cel:** zapisać mały, wersjonowany manifest dokładnych source/item hashes dla dziewięciu banków objętych decyzją PO, bez zmiany treści pytań.
- **Zakres i wejścia:** osiem wpisów z `evidence/human-content-approvals/manifest.json`, bank Claude `ccarp-2026.09.03`, wskazane wyżej commity, generatory manifestów i bieżące testy integralności.
- **Poza zakresem:** przebudowa readiness, publikacja, migracja schematu, poprawki pytań i model-based evaluation.
- **Kryteria akceptacji:** manifest jest reprodukowalny; zawiera dziewięć jednoznacznych tracków; osiem wcześniejszych item manifestów jest identycznych z zaakceptowanym baseline'em; Claude wskazuje dokładne 300 itemów i decyzję PO z 10 września 2026; żadna decyzja nie jest przypisana agentowi.
- **Weryfikacja i evidence:** uruchomić generator/hash checks i dedykowane testy manifestu; w raporcie zapisać komendy, wyniki, count/hash/provenance każdego banku oraz diff potwierdzający brak zmian wcześniejszych ośmiu banków.
- **Ryzyka i stop conditions:** zatrzymać pracę przy różnicy treści lub identity, nieodtwarzalnym hashu, niejasnym provenance albo potrzebie rozszerzenia decyzji PO.
- **Raport docelowy:** `docs/planning/reports/ACC-01-REPORT.md`; wynik wymaga niezależnego QA przed rozpoczęciem ACC-02.

### ACC-02 / ODK-E2E-099 — jeden kandydat dziewięciu banków

- **Cel:** przepiąć readiness, review packets, human approval evidence, runtime/publishing admission i immutable artifacts na dokładny kandydat z ACC-01.
- **Zakres i wejścia:** zaakceptowany raport ACC-01, skrypty readiness/publishing, schematy, artifacts i trzy znane czerwone testy opisane w tym pakiecie.
- **Poza zakresem:** SIMP-01–05, poprawki merytoryczne banków, EPIC-09 i zmiana decyzji PO.
- **Kryteria akceptacji:** wszystkie powierzchnie opisują te same dziewięć tracków i te same hashe; trzy czerwone testy przechodzą bez osłabienia asercji; runtime nie dopuszcza innego kandydata; ODK-E2E-099 ma kompletne evidence.
- **Weryfikacja i evidence:** uruchomić pełne walidatory readiness, approval, publishing i immutable artifacts oraz testy dotkniętych kontraktów; raportować dokładne komendy, wyniki, manifesty, usunięte ścieżki ośmio-trackowe i niezależny wynik QA.
- **Ryzyka i stop conditions:** zatrzymać pracę przy rozjeździe identity/count/hash, konieczności fałszywego przepisywania zgody, ukrytym konsumencie starego kontraktu albo regresji publikacji.
- **Raport docelowy:** `docs/planning/reports/ACC-02-REPORT.md`; dopiero zaakceptowany wynik odblokowuje SIMP-01.

## Kryterium zamknięcia ODK-E2E-099

- osiem historycznie zaakceptowanych banków jest powiązanych z niezmienionymi manifestami treści;
- Claude ma jawny wynik właściciela dla określonego zakresu i manifestu;
- readiness obejmuje kanoniczne dziewięć tracków;
- review packets, runtime/publishing admission oraz immutable artifacts opisują ten sam kandydat;
- trzy obecnie czerwone testy przechodzą bez osłabienia asercji i bez fałszywego przepisania zgody;
- raport zawiera wykonane komendy, wyniki, manifesty i decyzję PO.

## Ryzyka pozostające

- Próbka 114 pozycji nie jest przeczytaniem wszystkich 300; pozostałe pozycje opierają się na pełnych kontrolach automatycznych i spójności wzorców.
- Oficjalne materiały lub blueprint mogą zmienić się po dacie źródeł; aktualność wymaga osobnej kontroli przed finalnym freeze.
- Zielone testy strukturalne nie zastępują oceny merytorycznej człowieka.
- Zmiana któregokolwiek pytania po akceptacji unieważnia wynik dla tej pozycji lub jej manifestu zgodnie z przyjętym modelem dowodu.
