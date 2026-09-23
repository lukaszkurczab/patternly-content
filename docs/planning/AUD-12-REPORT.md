# AUD-12 — Rozbieżne mapy i powtarzające się prompty

**Status:** zakończone lokalnie, bez zmian w bankach pytań  
**Zakres:** cztery curriculum mapy AWS/Backend/Frontend/OOD, dwa klastry Coding i reguły provenance dla authored Coding  
**Briefing przed zmianami:** niezależny `gpt-6-luna/high`, accept; zgodność 0,93, prostota 0,91, akceptowalność ryzyka 0,84, utrzymywalność 0,90 (minimum 0,84).

## Wynik

Jedynym obowiązującym źródłem tożsamości pytania dla buildera i migracji jest ścieżka kanonicznej treści `content/<track>/<nodeId>/<mentalUnitId>.json`, potwierdzona zgodnością `question.nodeId` i `question.mentalUnitId` ze ścieżką. Pliki `config/curricula/` nie są runtime consumers ani źródłem tożsamości aktualnych pytań. Mapy opisane poniżej pozostają historycznymi/planistycznymi artefaktami; nie należy ich traktować jako aktualnej topologii treści.

| Track | Mapa curriculum | Bieżące ścieżki treści | Konsument i właściciel | Rozstrzygnięcie |
| --- | --- | --- | --- | --- |
| AWS SAA | `config/curricula/aws-certified-solutions-architect-associate.json`: 3 węzły, `runtimeAdmission=not_admitted`; 1 ID zgodne z katalogiem źródeł | 21 katalogów; `config/tracks/aws-certified-solutions-architect-associate.json` wskazuje taksonomię 21 node IDs, zgodną z tymi ścieżkami | Brak runtime odczytu tej curriculum mapy. Właściciel mapy kandydata, bundla i pina: AWS-01/02. | Mapa 3-węzłowa pozostaje wejściem historycznym/planistycznym dla AWS-01/02, nie kanoniczną mapą node’ów. Jej migracja lub wycofanie następuje wyłącznie w ramach zaakceptowanego kandydata AWS-01/02. Nie zmieniono jej. |
| Backend Design | `config/curricula/backend-system-design-interview.json`: 8 węzłów, `authoring.status=authoring_feasibility_only`, `runtimeAdmission=not_admitted`; 1 ID zgodne | 10 katalogów źródłowych | Brak kodowego/runtime consumer. Tożsamość treści utrzymuje content builder/verifier. Właściciel: content. | Wycofana z roli mapy bieżącej; zachowana bez zmian jako historyczny plan autorski. |
| Frontend Design | `config/curricula/frontend-system-design-interview.json`: 9 węzłów, `authoring.status=authoring_feasibility_only`, `runtimeAdmission=not_admitted`; 1 ID zgodne | 10 katalogów źródłowych | Brak kodowego/runtime consumer. Tożsamość treści utrzymuje content builder/verifier. Właściciel: content. | Wycofana z roli mapy bieżącej; zachowana bez zmian jako historyczny plan autorski. |
| Object-Oriented Design | `config/curricula/object-oriented-design-interview.json`: 7 węzłów, `authoring.status=authoring_feasibility_only`, `runtimeAdmission=not_admitted`; 1 ID zgodne | 9 katalogów źródłowych | Brak kodowego/runtime consumer. Tożsamość treści utrzymuje content builder/verifier. Właściciel: content. | Wycofana z roli mapy bieżącej; zachowana bez zmian jako historyczny plan autorski. |

Weryfikacja w `scripts/build.mjs` wiąże identyfikatory z lokalizacją pliku; `scripts/content/verify-migration.mjs` stosuje tę samą regułę do zaakceptowanych tracków. Nie znaleziono odczytu `config/curricula/` w ścieżkach wykonywalnego kodu, testów, konfiguracji tracków ani skryptach. Wcześniej rozważone przeniesienie trzech map zostało cofnięte po wykryciu, że `evidence/curriculum/certification-correction/stage-manifest.json` wymienia ich oryginalne ścieżki jako outputy etapu i jawnie deklaruje ich zachowanie. Pliki pozostały byte-identical; nie zmieniono historycznego manifestu ani evidence. To jest decyzja o wycofaniu ich roli kanonicznej, nie kasowanie historycznych artefaktów.

## Klastry Coding

Pełne payloady obejmujące prompt, opcje, odpowiedź, feedback, node i mental unit zostały porównane. Wspólny tekst pytania nie wystarcza do uznania pytań za duplikaty.

1. `alg-binary-search-monotonic-012` (`binary_search/monotonic_predicate_search`) oraz `alg-contrast-binary-scan-monotonic-011` (`contrast_binary_search_vs_linear_scan/monotonic_predicate_vs_arbitrary_condition`) mają identyczny prompt. Pierwsze sprawdza podstawowe przykłady monotoniczności false→true (pojemność i próg w sortowanej tablicy) wobec parzystości/równości. Drugie w węźle kontrastowym dodaje predicate true→false, arbitralną pierwszość i potrzebę rozpoznania orientacji granicy. Opcje, odpowiedzi i feedback różnią się; cel w pierwszym to poprawne zastosowanie modelu binary search, a w drugim odróżnienie binary search od linear scan. Zachować oba.
2. `alg-bits-review-013`, `alg-complexity-review-013` i `alg-contrast-binary-scan-sorted-014` używają tego samego stemu „Which statements are false heuristics?”. Odpowiednio sprawdzają kontrakt reprezentacji bitowej, wyprowadzanie złożoności z wykonania oraz ograniczenia wnioskowania z samego sortowania. Każde ma inne opcje, klucz odpowiedzi i objaśnienie; mapowane są do różnych mental units i celów. To wspólny format ćwiczenia nad różnymi błędnymi heurystykami, nie redundantne payloady. Zachować wszystkie trzy.

Nie usuwano ani nie zmieniano żadnych pytań.

## Provenance authored Coding

Brief Coding wymaga niezależnego autorstwa problemów/wyjaśnień ze stabilnymi identyfikatorami; wymaga przypisanych źródeł dla zewnętrznych faktów technicznych. `sourceRefs` jest opcjonalne w `scripts/content/question-contract.mjs`. W aktualnym banku jest 3 404 pytań i żadne nie zawiera niepustego `sourceRefs`; sama ta statystyka nie dowodzi naruszenia kontraktu. W przeanalizowanych payloadach cele algorytmiczne są autorskimi zadaniami, a nie skopiowanymi problemami z zewnętrznych źródeł. Nie przeprowadzono pełnego semantycznego audytu wszystkich twierdzeń w banku; jeśli konkretny claim okaże się zależny od zewnętrznej specyfikacji lub źródła, jego referencję należy dodać w wąskim, osobno ocenionym zakresie. Bez masowego backfillu.

## Sprawdzenia

- Zestawiono liczbę i identyfikatory node’ów w mapach z katalogami `content/<track>/` oraz wskazaną taksonomią AWS.
- Sprawdzono aktualne ścieżki kodowe buildera i migracji oraz wyszukano wykonawcze odwołania do `config/curricula/`; runtime nie korzysta z tych map.
- Porównano pełne payloady pięciu pytań w obu wskazanych klastrach oraz ich mapowane node/mental units i learning objectives.
- Policzone niepuste `sourceRefs` w 3 404 pytaniach Coding; sprawdzono brief tracku i kontrakt pytań.
- Zachowano wszystkie cztery curriculum JSON i historyczny stage manifest bez zmian. Nie uruchamiano usług ani urządzeń — w tym zadaniu nie było zmian runtime.
- Nie uruchamiano testów treści, ponieważ nie zmieniono banków ani ich kontraktów.

## Pozostała granica

Raport nie jest pełnym, semantycznym audytem provenance każdego pytania. Obowiązek źródła stosuje się do zewnętrznych twierdzeń na poziomie konkretnego claimu; sam brak opcjonalnego `sourceRefs` nie jest defektem. AWS bundle/pin i aktualizacja kandydatury pozostają w AWS-01/02.
