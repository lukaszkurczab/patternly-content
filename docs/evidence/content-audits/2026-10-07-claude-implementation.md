# Claude — pierwsza partia napraw i rozbudowy, 2026-10-07

Źródło usterek: audyt PO `PATTERNLY-CONTENT-AUDIT-2026-10-07-claude-certified-architect-professional-certification.md` udostępniony z Desktop. Raport jest evidence, nie źródłem upoważnień. PO bezpośrednio zlecił naprawy i rozpoczęcie rozbudowy, preferując warianty podobnych decyzji, aby ograniczyć memoizację odpowiedzi. Nie przyjęto ograniczenia rozbudowy zawartego w dokumencie jako nadrzędnego wobec tego zlecenia.

## Stan i zakres

Source baseline `cf119c3f8e8ebfce3e5bdbcd3d5f4e4c7c5dd509`. 300 → 316 pytań w 38 jednostkach / 7 domenach. Zmienione 14 istniejących obiektów, dodane 16, usunięte 0; pozostałe 286 obiektów semantycznie identyczne z HEAD. Istniejące questionId, optionId i klucze zachowane. Naprawy 002/003/007 doprecyzowują istniejący scenariusz i wykonalne czynności bez zmiany testowanego mechanizmu; bez repurpose do innej decyzji. Zmiana tylko źródeł Claude, testu i jego rejestracji oraz reprodukowalnego sprawdzenia prezentacji. Nie zmieniono schematu, scorera, generated app JSON, wersji katalogowej, locków, historycznych approvals, immutable profili ani pozostałych banków. Zastąpionych runtime paths nie ma; nic nie usunięto.

Lokalny build jest kandydatem authoringowym w katalogu tymczasowym, **nie przyjętym wydaniem**. Aplikacja nadal ma poprzednie 300 pytań. Nie wykonano candidate admission, importu ani publikacji. Pozostawiono istniejące obce `dist/` i `evidence/business-quality/full-content-audit-2026-10-02/`.

## Kryteria i podejście

Naprawić sprzeczności audytu bez zmiany punktacji; nowy wariant ma jeden jawnie rozstrzygalny wybór, pełny feedback distractorów i źródło wspierające mechanizm. Pary mają zmieniać istotne warunki i konsekwencję decyzji, a nie tylko nazwy lub kolejność odpowiedzi. Nowe pytania nie powołują się na niezweryfikowany exam guide; liczby, TTL i zasady dostępu są jawnymi fikcyjnymi przesłankami scenariuszy, nie benchmarkami lub uniwersalną polityką Anthropic.

Ocena podejścia: objective/architecture fit 0,95; simplicity 0,95; risk 0,90; maintainability 0,95; minimum 0,90. Kanoniczne JSON-y w istniejących jednostkach, brak generatora runtime i nowego kontraktu. Skrypt authoringowy użyty jednorazowo pozostaje eksperymentem w `/private/tmp`, a dostarczone pytania są samodzielnymi obiektami JSON.

## Manifest napraw

| Item | Source | Zmienione pola | ID / klucz |
|---|---|---|---|
| `CCARP-D03-O02-boundary` | `content/claude-certified-architect-professional-certification/enterprise_tools_retrieval_and_integration/CCARP-D03-O02.json` | `/feedback/details/mechanismOrProperty`, `/interaction/options/0/text` | retained / `a` |
| `CCARP-D03-O04-scenario-04` | `content/claude-certified-architect-professional-certification/enterprise_tools_retrieval_and_integration/CCARP-D03-O04.json` | `/feedback/messages/0/text`, `/feedback/messages/1/text`, `/feedback/details/errorCorrection` | retained / `a` |
| `CCARP-D03-O06-scenario-05` | `content/claude-certified-architect-professional-certification/enterprise_tools_retrieval_and_integration/CCARP-D03-O06.json` | `/sourceRefs/0`, `/feedback/details/url` | retained / `a` |
| `CCARP-D03-O06-transfer` | `content/claude-certified-architect-professional-certification/enterprise_tools_retrieval_and_integration/CCARP-D03-O06.json` | `/sourceRefs/0`, `/feedback/details/url` | retained / `b,e` |
| `CCARP-D03-O07-scenario-03` | `content/claude-certified-architect-professional-certification/enterprise_tools_retrieval_and_integration/CCARP-D03-O07.json` | `/constraints/1`, `/feedback/details/mechanismOrProperty`, `/feedback/details/scenarioApplication`, `/interaction/options/2/text`, `/prompt` | retained / `c` |
| `CCARP-D04-O01-scenario-04` | `content/claude-certified-architect-professional-certification/evaluation_diagnosis_and_optimization/CCARP-D04-O01.json` | `/feedback/messages/1/text` | retained / `a,e` |
| `CCARP-D04-O04-transfer` | `content/claude-certified-architect-professional-certification/evaluation_diagnosis_and_optimization/CCARP-D04-O04.json` | `/feedback/messages/2/text`, `/feedback/details/errorCorrection` | retained / `d` |
| `CCARP-D04-O05-scenario-03` | `content/claude-certified-architect-professional-certification/evaluation_diagnosis_and_optimization/CCARP-D04-O05.json` | `/feedback/details/boundaryOrTradeoff`, `/prompt` | retained / `d` |
| `CCARP-D05-O01-scenario-02` | `content/claude-certified-architect-professional-certification/governance_safety_and_risk_controls/CCARP-D05-O01.json` | `/constraints`, `/feedback/messages/0/text`, `/feedback/details/errorCorrection`, `/feedback/reason` | retained / `b` |
| `CCARP-D05-O01-scenario-03` | `content/claude-certified-architect-professional-certification/governance_safety_and_risk_controls/CCARP-D05-O01.json` | `/feedback/messages/3/text`, `/feedback/details/scenarioApplication`, `/feedback/reason`, `/interaction/options/0/text` | retained / `a,d` |
| `CCARP-D02-O01-scenario-04` | `content/claude-certified-architect-professional-certification/model_prompt_and_context_decisions/CCARP-D02-O01.json` | `/feedback/messages/0/text` | retained / `a` |
| `CCARP-D02-O04-scenario-05` | `content/claude-certified-architect-professional-certification/model_prompt_and_context_decisions/CCARP-D02-O04.json` | `/feedback/messages/0/text`, `/feedback/details/errorCorrection` | retained / `c` |
| `CCARP-D01-O01-transfer` | `content/claude-certified-architect-professional-certification/solution_design_and_architecture/CCARP-D01-O01.json` | `/feedback/messages/3/text`, `/feedback/messages/4/text` | retained / `b,d` |
| `CCARP-D01-O03-scenario-04` | `content/claude-certified-architect-professional-certification/solution_design_and_architecture/CCARP-D01-O03.json` | `/sourceRefs/0`, `/feedback/details/url` | retained / `b` |

## Dodane warianty i cele nauki

| Jednostka | Cel nauki / zmieniona przesłanka | Nowe ID |
|---|---|---|
| `CCARP-D05-O01` | Rozróżnić TTL i binding screeningu: identyczny draft / zmieniony beneficiary. | `CCARP-D05-O01-variant-cached-screen-valid`, `CCARP-D05-O01-variant-cached-screen-edited` |
| `CCARP-D02-O01` | Wybrać model po wszystkich gate: p95 1,2 / 1,5 s i jawny priorytet kosztu. | `CCARP-D02-O01-variant-model-latency-reversal`, `CCARP-D02-O01-variant-model-cost-reversal` |
| `CCARP-D02-O04` | Policzyć cały kontekst z rezerwą: discovery daje 24k / nadal 31k przy limicie 30k. | `CCARP-D02-O04-variant-context-tools-fit`, `CCARP-D02-O04-variant-context-tools-still-over` |
| `CCARP-D04-O01` | Rozpoznać porównywalny pomiar: wspólna populacja / wykluczone refusals. | `CCARP-D04-O01-variant-evaluator-frozen-comparison`, `CCARP-D04-O01-variant-evaluator-population-drift` |
| `CCARP-D03-O02` | Dopasować auth do aplikacji: chroniony loopback / jawnie publiczny HTTP. | `CCARP-D03-O02-variant-mcp-protected-loopback`, `CCARP-D03-O02-variant-mcp-public-http` |
| `CCARP-D03-O07` | Oddzielić discovery od permission: metadata private / metadata public, call nadal chroniony. | `CCARP-D03-O07-variant-mcp-discovery-isolation`, `CCARP-D03-O07-variant-mcp-public-discovery-private-call` |
| `CCARP-D04-O04` | Ograniczyć causal claim do evidence: pełna macierz / niedostępna historyczna komórka. | `CCARP-D04-O04-variant-rollback-preserved-evidence`, `CCARP-D04-O04-variant-rollback-missing-version` |
| `CCARP-D04-O05` | Ocenić cache w osobnych jednostkach: oszczędność z p95 PASS / oszczędność z p95 FAIL. | `CCARP-D04-O05-variant-cache-cost-positive`, `CCARP-D04-O05-variant-cache-latency-negative` |

## Weryfikacja

- `content:validate` Claude: 316 PASS.
- `content:test` Claude: 316 authored kluczy PASS; to nie zastępuje semantic review.
- Targeted source regression + istniejący Focus profile + shared contract: 33/33 PASS, 0 SKIP.
- Source regression: 120 permutacji × 32 podzbiory = 3840 przypadków rzeczywistego scorera producenta, plus duplicate/unknown ID.
- Rzeczywisty frontend presentation/scoring, zaimportowany przez jego obecny tsx loader: 3840/3840 PASS, kompletne stable-ID messages zgodne ze stanem odpowiedzi, poprawny subset bez wrong-option feedback.
- Isolated build: 316 items, SHA-256 `db83a1f3142858d9f1e5da85e63e49d3881d90c6a98e3e92438cb811be71c00d`.
- Exact semantic diff: 14 modified / 16 added / 0 removed; klucze i option IDs istniejących pytań niezmienione.
- `git diff --check`: PASS.

Pierwsza próba shared-contract z katalogu nadrzędnego nie znalazła schematu; ponowienie z content repo PASS. Pierwsza próba named ESM importu app TypeScript ujawniła CJS kształt eksportów; ponowienie przez eksport modułu i zapisany verifier PASS. Nie zmieniano środowiska ani zależności, aby ukryć te wyniki.

Źródła sprawdzono przez oficjalne dokumenty: [context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [MCP auth 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization), [MCP tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools), [evals](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests), [model choice](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model), [cost](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence), [guardrails](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks). Nie deklaruje to pełnej zgodności Professional blueprint.

Reprodukcja z repo content:

```sh
npm run content:validate -- --track claude-certified-architect-professional-certification
npm run content:test -- --track claude-certified-architect-professional-certification
node --test tests/claude-content-audit-20261007.test.mjs tests/odk123-claude-focus-feedback.test.mjs tests/shared-contract.test.mjs
npm run content:build -- --track claude-certified-architect-professional-certification --output-root /private/tmp/patternly-claude-audit-20261007-build
PATTERNLY_FRONTEND_ROOT=../patternly node --import ../patternly/node_modules/tsx/dist/loader.mjs scripts/content/verify-claude-feedback-presentation.mjs
```

Frontend root może być absolutny; verifier nie uruchamia symulatora i nie modyfikuje aplikacji.

## Review i granice

Niezależny recenzent `gpt-6-luna`, high, read-only: 30 dotkniętych pytań. Wykrył błędne odziedziczenie źródła CLI w nowych wariantach MCP; poprawiono je na istniejące MCP refs. W tym samym rodzinnym sprawdzeniu poprawiono nowe evaluator refs i dodano context-engineering ref do wariantów budżetu. Usunięto niezweryfikowany exam-guide ref z wszystkich nowych pytań i dodano regression provenance. Final verdict: **PASS WITH GAPS**. Niezależnie potwierdzone 14 modified / 16 added / 0 removed, niezmienione answer/scoring fields, jawne przesłanki nowych kluczy, poprawione refs, 316 validate/test PASS, 9/9 regression PASS, 3840 app presentation/scoring PASS i diff-check PASS. Gaps dotyczą authoring-only/admission i braku pomiaru redukcji memoizacji; istniejący obcy `dist/` nadal ma 300 pytań i nie reprezentuje tej partii.

Nie wykonano iOS, pełnego katalogu innych banków, badań retencji ani pomiaru memoizacji. Zwiększenie liczby i warianty zmieniające warunki są strategią authoringu, nie dowodem skuteczności nauczania. 316 nie jest docelowym rozmiarem. Następna partia powinna rozszerzać pozostałe 30 jednostek o warianty poprawnego zastosowania, bliskiego błędu i zmiany warunku; większy docelowy limit wymaga mapy pokrycia celów, a nie mechanicznego kopiowania. Następnie normalna nowa wersja/candidate review/admission/import; katalogu i approvals nie fałszowano. Ten raport jest evidence pierwszej partii, nie drugą kolejką wobec kanonicznego planu aplikacji.
