# Claude maintenance — rozbudowa banku

## Aktualny stan

Źródłowy bank zawiera **845 pytań** w 38 jednostkach i 7 domenach, wersja `ccarp-2026.10.07`. Liczby per jednostka wynoszą **13–33** i wynikają z pokrycia decyzji, typowych błędów, granic oraz wariantów ćwiczeniowych. Zachowano wszystkie pierwotne 300 identyfikatorów; poprawiono 37 pierwotnych obiektów i dodano 545 pytań względem baseline `cf119c3f8e8ebfce3e5bdbcd3d5f4e4c7c5dd509`. Nie ma limitu15 ani celu wyliczanego przez mnożenie liczby jednostek.

Wszystkie aktualne obiekty mają dokładnie dopasowane pełne dowody review:259 niezmienionych historycznych +586 bieżących; zero brakujących lub non-PASS. Najnowsze15 poprawiono po wykryciu błędnego przypisania kluczy oraz podpowiedzi długością opcji; niezależny review potwierdził finalne klucze, każdy distractor i rzeczywistą wartość trzech zamienników. Nie przyjęto ich dla zachowania licznika. Niepublikowany MCP near-repeat zastąpiono nowym przypadkiem dwóch klientów; żaden pierwotny opublikowany question ID nie został usunięty. Pierwszy review A miał ujawniony klucz i ten fakt pozostaje jawny; finalne B/C stosowały osobny input bez klucza przed oceną pełnych obiektów.

[Końcowy przegląd pokrycia](2026-10-07-claude-coverage/final-binding-review.md):PASS na dokładnym finalnym845 snapshot; wcześniejsza [macierz celów](2026-10-07-claude-coverage/prospective-matrix.md) i [korekta przypisania rodzin](2026-10-07-claude-coverage/binding-review.md) wyjaśniają zapotrzebowanie wszystkich38 jednostek. Węższe progressive-loading i debugging mają po13 i pełne centralne rodziny; większe cele otrzymują więcej praktyki. Dwa bliskie istniejące progressive-loading przykłady zachowano jako nieblokujące powtórzenie. Nie ma twierdzenia o potwierdzonych wagach/blueprint Professional ani empirycznie dowiedzionej retencji.

Walidacja845 i scoring845 PASS;34 ukierunkowane testy PASS. Normalny builder utworzył9 artefaktów. Rzeczywisty katalog aplikacji w izolowanej próbie odczytał845 pytań,38 jednostek i Focus Free pool138; rzeczywisty scorer i feedback dla kluczy oraz błędnych pojedynczych wyborów PASS. Test3840 permutacji/subsets w rzeczywistym kodzie prezentacji/scoringu PASS. [Diagnostyka](2026-10-07-claude-diagnostics.json):zero exact prompt duplicates; każdy sourceRef jest zarejestrowany, każdy Details URL należy do jednego z refs. Pozycje/długości są diagnostyką, nie kwotą.

Nowe źródła MCP dotyczą określonych mechanizmów i nie dziedziczą claimów historycznych slot anchors. Przypadki starego profilu jawnie pinują2025-06-18; przypadek dwóch klientów używa aktualnej architektury2026-07-28. Istniejący curriculum pozostaje historycznym planem300 slotów, z jawnie nieprzyznanym admission i licznikami dotyczącymi dokumentu; jego sourceRecords uzupełniono, bez udawania nowego approval, ważenia egzaminu ani zmiany runtime/progression. Aktywny bank jest w content, a jego finalne identyfikatory/hash w [manifest](2026-10-07-claude-coverage/final-manifest.json).

Przypadkowy `pnpm exec tsx --version` w app checkout uruchomił instalację nowych zależności. Proces już nie działa. Dwa wygenerowane pliki pnpm odłożono odwracalnie do `/private/tmp/patternly-claude-expansion-20261007/dependency-probe-recovery`; standardowe `npm ci` przywróciło istniejący npm lock. Potwierdzono pierwotne expo57.0.17,tsx4.21.0,react-native0.86.3,typescript6.0.3 i brak grafu pnpm. Finalne runtime/scoring probes ponowiono po przywróceniu. Żadne cudze zmiany kodu/app lock nie zostały dołączone do tej pracy.

Pozostały gates wydania: historyczny migration verifier wymaga dokładnego starego membership300/approval, dlatego nie przyznaje admission nowemu bankowi. Nie zmieniono historycznych approvals, pinned runtime, publishing ani głównego BIZQ ownera. Installowany bundle nadal ma300. Źródła będą utrwalone lokalnie do normalnego candidate draft; jego wynik i pełny test suite zostaną zapisane niżej. Brak push/publikacji/importu.

PO 07.10.2026 polecił znaleźć odłożone zadanie BIZQ i kontynuować do zadowalającego banku, oczekując >840 pytań. Found: [BIZQ-01 §7](../../../../patternly/docs/specs/business-quality/01-BIZQ-01-JAKOSC-PYTAN-I-OBJASNIEN.md:182), [kanoniczna kolejka FCA-EDIT Claude](../../../../patternly/docs/PATTERNLY-WORKING-PLAN.md:1717). Wytyczne: jawna decyzja, realistyczne distractory, Reason/Details wyjaśniające mechanizm i granicę, 13 wymiarów review każdego zmienionego itemu, aktualne primary sources, nowe wersjonowanie i normalny builder/candidate/admission bez fałszowania historycznych approval. Obecne zlecenie PO reaktywuje maintenance tego banku i jawnie dopuszcza jego rozbudowę; starszy zakaz masowego rozszerzania launch baseline nie unieważnia tej dyspozycji. Pozostałe banki i główny BIZQ runner pozostają u swoich owners.

Baseline:316 pytań po [pierwszej partii](2026-10-07-claude-implementation.md),38 mental units /7 domen. Zachować wszystkie istniejące IDs i brak regresji w niezmienionych obiektach. Korekta PO: odrzucono równy limit15 na jednostkę i wynikający z niego cel886. Każda jednostka otrzymuje liczbę wynikającą z pełnego pokrycia decyzji, mechanizmów, typowych błędów, granic i kontekstów użycia. Oczekiwana skala >840 nie jest kwotą do wypełnienia. Drafty z pierwszych partii są kandydatami do oceny: usunąć zbędne, a ważniejsze jednostki pogłębić tam, gdzie macierz wykazuje rzeczywistą lukę. Po review wadliwe/parafrazowane przykłady naprawić, rozróżnić lub usunąć i uzupełnić rzeczywistą lukę, nie zachowywać ich dla licznika.

Plan: odtworzyć16 istniejących tasków FCA Claude; uzupełnić macierz decyzji i rozbudować wszystkie jednostki; review source-first wszystkich nowych/zmienionych itemów i distractorów; narrow validate/test, duplicate/provenance/position risk analysis; nowy contentVersion i build/candidate z właściwymi hashami. Runtime admission/import tylko po kontroli aktualnego ownera i istniejących warunków; bez automatycznej zgody właściciela, bez publikacji/usług/symulatora.

Fit0,95; simplicity0,90; risk0,85; maintainability0,92;minimum0,85. Brak zmiany formatu/scoringu/progression ani runtime generatora. Root jest jedynym writerem kanonicznych źródeł; Luna medium authors mogą równolegle pisać wyłącznie disjoint private draft directories, review Luna high jest niezależny.

Rozstrzygające wytyczne jakości:
- powtarzać cele i mechanizmy, ale zmieniać istotne warunki lub diagnozowany błąd; podobieństwo języka nie jest samo w sobie defektem;
- wymagane warunki decyzji są widoczne przed submit; sama parafraza poprawnej opcji w prompt nie jest zadaniem;
- każda błędna opcja reprezentuje wiarygodną najbliższą alternatywę, jej feedback wskazuje konkretny brak;
- trace/numeric/boundary cases mają sprawdzalne konsekwencje; nie ma wymyślonych gwarancji providera;
- nowe źródła nie implikują potwierdzonego Professional blueprint ani human signoff;
- bliskie warianty wspierają ćwiczenie, nie stanowią niezależnego pomiaru transferu/retencji.

Niezależny design review: PASS WITH GAPS; fit0,93 / simplicity0,82 / risk0,81 / maintainability0,88, minimum0,81. Historyczna propozycja15/unit została następnie odrzucona przez PO. Review nie stanowi akceptacji równych kwot. Nowy plan: macierz pokrycia per jednostka i zmienna liczba przykładów z uzasadnieniem. Fit0,97 / simplicity0,90 / risk0,86 / maintainability0,92, minimum0,86: zachowuje kontrakt, eliminuje padding i wiąże rozbudowę z celami nauki. Wymagany końcowy przegląd podobieństwa również między jednostkami. Drafty przygotowują Luna medium (B,C) i Luna high (A po zgłoszeniu ograniczenia przez medium); root pozostaje jedynym writerem kanonicznych źródeł.

Następny krok: review i integracja draftów, kontynuacja authoringu oraz naprawy historycznych FCA na aktualnych obiektach. Nie zakończyć na kolejnym małym batchu ani samym przekroczeniu840.

## Korekta metody po uwadze PO

Macierz każdego celu rozdziela: decyzje/mechanizmy, wiarygodne błędy, granice/counterfactuals oraz warianty ćwiczeniowe. Pełne pokrycie nie oznacza jednego unikalnego pytania na mechanizm: istotne i trudne decyzje potrzebują wielu podobnych przypadków z inną przesłanką, wzorcem dowodów lub rozstrzygnięciem. Nie używać wymyślonych wag egzaminacyjnych. Uzasadniać głębokość zakresem celu, skutkiem błędu i zależnością od innych umiejętności. Liczby per unit są wynikiem macierzy i review, nigdy wejściową kwotą.

Historyczny stan pierwszej partii:316 (zob. aktualny stan na początku). Nie zintegrowano draftów tylko dlatego, że przeszły walidację. Root wykrył w szkicach A niepoprawne przypisanie feedbacku po rotacji klucza; B miał powtarzane zbiorcze objaśnienia każdego distractora (poprawione przez autora); C wymaga doprecyzowania bramki review i wiarygodnych najbliższych alternatyw. To defekty authoringu, nie runtime schema. Po naprawie konieczny pełny niezależny review.

Dodatkowe naprawy FCA w źródłach:20 transfer rules, Usage API aggregation vs per-request ledger, supported token-count inputs, measured cache eligibility/hits, measured end-to-end segmented latency with pending/reviewer semantics, differentiated example-selection/evaluation case, answer-local role disclosure case. Transfer-only stale findings w D03O03scenario03/transfer, D03O07transfer i D03O08transfer są już rozstrzygnięte w bieżącym baseline; nie przepisywać ich dla zgodności z historycznym opisem. Current change map: [current whole objects](2026-10-07-claude-current-changes.json),aktualizowana lista dodatków i37 poprawek względem HEAD. Targeted current validate316, canonical-answer test316 i regression9/9 PASS; nie jest to pełna nowa akceptacja semantyczna.

## Primary-source checks dla bieżących napraw FCA

Checked2026-10-07:
- [Usage and Cost API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api): raporty mają time buckets i obsługiwane wymiary agregacji; nie dostarczają application case ID. Konsekwencja D04O06scenario03: rozdzielić agregatowe reconciliation i application per-request attribution, nie odtwarzać brakujących joins z agregatu.
- [Token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting): wspierane system/messages/client tools/base64 images/PDF; ograniczenia obejmują m.in. MCP connector i URL/file source images/documents. D02O04boundary ogranicza jawnie deployed request shape, traktuje count jako estimate i zachowuje handling rejection.
- [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): eligibility zależy od model/platform minimum, matching i reuse; pola usage potwierdzają actual writes/reads. D02O05scenario02 zawiera zaobserwowane nonzero cache reads zamiast zgadywać minimum.

Source registry/history nie zostały przedstawione jako ponownie sprawdzone w całości. Źródła dla draftów muszą zostać powiązane z aktualną macierzą i review każdego obiektu.

## Kolejka odłożonych FCA — current-source reconciliation

| Task | Obiekty / działanie | Stan |
|---|---|---|
| 97f6830713 | D03O01scenario03/04 transfer | poprawiono eager/discovery i selection tracing |
| 7ddba908c3 | D03O02scenario03/04 transfer | poprawiono transport trust i artifact release reauthorization |
| cb2013c671 | D03O03scenario03/04/05/transfer | 04/05 transfer poprawiono;03/transfer już jawnie rozdzielają complete-output async i offline quality, finding adjudicated na current source |
| 565ce74f4c | D03O04scenario03/04 transfer | bounded private review i outcome-version replay |
| 9034a521a0 | D03O05scenario03/04 transfer | fit/section retrieval oraz source authority/freshness/conflict |
| 4bc3687c54 | D03O06scenario04/05 transfer | exact-key vs semantic gap; metric-first bounded JIT prose |
| e13da9ae07 | D03O07scenario02/transfer | shared negotiated capability rule poprawiono; specialist ownership transfer już konkretny |
| 79f43621d4 | D03O08scenario02/03/transfer | common core/rareaddenda/cachefreshness poprawiono; transfer już konkretny |
| 0fde61a48d | D04O06scenario03 | provider aggregate vs application request ledger; missing history unknown; accepted option now request-ledger (new meaning ID) |
| 33abc1419a | D05O05transfer | realistic observed trust error, plausible incomplete disclosures, new option IDs |
| a6c9ea109b | D02O03transfer vsdiagnosis | budgeted demonstration selection vs diagnosis; new option IDs, same learning objective |
| 656c666b00 | D02O04boundary | supported request forms/thinking, estimate/rejection boundary |
| 33064e70e5 | D02O05scenario02 | observed eligible prefix cache reads |
| 8d364c84e3 | D01O03scenario04 | exact-first and no-match/conflict routing rule |
| ef6d96a0f7 | D01O05scenario03/04 | prerequisite independence / grouped discovery budget |
| cb9812adb2 | D01O06scenario03/04 | quality-slice routing; measured full-routep95 and async reviewer hold |

Stan tabeli to implementacja/adjudication, nie końcowy independent semantic approval ani zamknięcie głównego BIZQ. Poprawki wymagają review całych aktualnych obiektów i wersjonowania po integracji zaakceptowanych draftów.

## Independent coverage review — zaakceptowana korekta

[Coverage design review](2026-10-07-claude-coverage-design-review.md): PASS WITH GAPS, minimum0,80 (fit0,92/simple0,90/risk0,80/maintainability0,88). Przyjęto decision-family ledger zamiast mechanism-presence closure. B ma konkretne błędy source/feedback/objective; nie wolno integrować go na podstawie schema PASS. Pierwszy medium B zakończył na12 dodatkach mimo dalszego wymaganego zakresu; kontynuację14celów powierzono Luna high po tym udokumentowanym ograniczeniu. AHigh i CMedium kontynuują practice-depth batches; żadna jednostka nie ma fixedquota. Root singlecanonicalwriter.
