# CC-01 — mapa oficjalnego kursu Claude Professional

Stan na 11.10.2026. Zakres: pełne mapowanie eksportu `materialy-v2` do obecnego banku i przygotowanie przypisań modułów dla Details. **Bez zmian pytań, schematu, reguły ukończenia i pakietu aplikacji.**

Kanoniczny artefakt: [pełna mapa JSON](2026-10-11-claude-course-map.json). Zawiera wszystkie 845 questionId, 38 jednostek, 24 numerowane cele kursu, 107 sekcji, uzasadnienia przypisań, link dokumentacji, docelowy moduł kursu, hashe wejść oraz dowody i brakujące decyzje każdego aspektu. Ten raport jest jego czytelnym widokiem; JSON jest jedynym właścicielem mapowania pytań.

## Jak czytać mapę

`M1-O01` i `M1-S01` to lokalne identyfikatory celów i kolejnych ekranów eksportu, nie kody nadane przez Anthropic. Rejestr przewodnika egzaminacyjnego ma odrębne 38 celów `ccarp-D.N`; nie utożsamiamy ich z 24 celami kursu. Każda obecna jednostka zachowuje swój cel przewodnika. Cel kursu może być ćwiczony przez kilka jednostek, a pytanie może wspierać kilka celów. `primaryObjectiveId` i `moduleId` wskazują decyzję, która wyznacza główny link w Details; dodatkowe `objectiveIds` uwzględniają konkretne dowody aspektów.

`covered` oznacza obecność pytań ćwiczących opisaną decyzję, nie wystarczające przygotowanie ani walidację wszystkich odpowiedzi. `partial` wskazuje konkretny niećwiczony fragment; `missing` — brak pytania sprawdzającego tę decyzję. `excluded` oddziela zakres partnerski jawnie wyłączony przez kurs z egzaminu. Dla pytania `direct` oznacza wyjaśnienie badanej decyzji w kursie; `adjacent` — właściwy kontekst modułu, podczas gdy szczegółowy mechanizm wymaga dokumentacji. Samo podobieństwo słów i liczba pytań nie stanowią dowodu pokrycia.

Eksport ma wszystkie 107 wstępnie załadowanych ekranów, lecz jego raport określa kompletność jako `unverified`: interakcje zachowano w źródle, ale nie przećwiczono ich stanów, a zewnętrznych zasobów nie zweryfikowano. „Pełna mapa” dotyczy tego udostępnionego materiału. Przypisanie nie jest niezależnym audytem każdego klucza odpowiedzi.

## Moduły i Details

| Moduł | Docelowy odsyłacz | Sekcje | Pytania z głównym linkiem |
| --- | --- | ---: | ---: |
| M1 | [Module 1 · Claude Platform & Solution Design: Architect](https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional/claude-platform-solution-design) | 34 | 255 |
| M2 | [Enterprise Integration & Production: Architect Module 2](https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional/enterprise-integration-production) | 21 | 294 |
| M3 | [Responsible AI, Safety & Risk, Architect Module 3](https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional/responsible-ai-safety-risk-for-architects) | 22 | 141 |
| M4 | [Stakeholder Engagement, Lifecycle & Go-to-Market, Architect Module 4](https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional/stakeholder-engagement-lifecycle-gtm) | 20 | 97 |
| M5 | [Team Enablement and Operational Productivity: Architect Module 5](https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional/developer-productivity-enablement) | 10 | 58 |

Do Details przypisano adres strony modułu, obecny w `links.json`, oraz dokładną sekcję i jej tytuł do nawigacji. Nie tworzymy adresów do pojedynczych ekranów SCORM. Oryginalny adres lekcji SCORM pozostaje jako dowód `lessonUrl`. Dokumentację zachowano osobno jako `documentationUrl`; jej pełny odbiór i wdrożenie dwóch odsyłaczy należą do CC-03.

Przy kursie przewidziano informację o koncie Anthropic Partner Academy. Dostęp funkcjonalny pozostaje **niezweryfikowany**: anonimowy odczyt pięciu stron modułów zwrócił HTTP 403, próba przeglądarkowa nie uruchomiła środowiska, a logowania nie wykonano. 403 nie dowodzi zasad rejestracji ani tego, jakie konta mają dostęp. CC-03 musi odebrać rzeczywiste otwarcie i finalną treść informacji o koncie.

Przypisania: **641 bezpośrednich, 204 sąsiednich**. Dla sąsiednich moduł pomaga zrozumieć obszar, ale dokumentacja pozostaje potrzebna do szczegółu odpowiedzi. Przykład: cache → M1-S26, paginacja/snapshot API → M2-S11 jako sąsiednie, kontrola wywołania narzędzia → M3-S07. To zapobiega kierowaniu pytań o cache do bezpieczeństwa tylko dlatego, że wspominają tenantów.

## Wszystkie cele kursu → istniejące jednostki

| Cel | Decyzja ćwiczona w kursie | Zakres | Jednostki z dowodem | Stan aspektów |
| --- | --- | --- | --- | --- |
| M1-O01 | Break down a partner request across Claude, existing systems, and people using model capabilities and limitations as the design lens. | exam | D01-O01, D01-O02, D01-O03, D01-O04, D01-O05, D01-O06, D02-O01, D02-O02, D02-O03, D02-O04, D03-O01, D03-O03, D03-O04, D03-O05, D03-O06, D03-O07, D03-O08, D04-O02, D04-O06 | covered: 4, partial: 3 |
| M1-O02 | Choose an augmented call, workflow, or agent and explain the costs of that interaction shape. | exam | D01-O01, D01-O02, D01-O03, D01-O04, D01-O05, D01-O06, D02-O01, D02-O02, D02-O03, D02-O04, D02-O05, D03-O01, D03-O02, D03-O03, D03-O04, D03-O05, D03-O07, D03-O08 | covered: 2 |
| M1-O03 | Select a reference architecture for the problem and recognize when retrieval should yield to live system state or a tool. | exam | D01-O01, D01-O02, D01-O03, D01-O04, D01-O05, D01-O06, D02-O01, D02-O02, D02-O03, D02-O04, D02-O05, D03-O01, D03-O02, D03-O03, D03-O04, D03-O05, D03-O06, D03-O07, D03-O08 | covered: 3 |
| M1-O04 | Make defensible model and context decisions, using evaluation evidence as the gate before a model change. | exam | D01-O01, D01-O02, D01-O03, D01-O04, D01-O05, D01-O06, D02-O01, D02-O02, D02-O03, D02-O04, D02-O05, D03-O01, D03-O02, D03-O03, D03-O04, D03-O05, D03-O06, D03-O07, D03-O08 | covered: 5 |
| M1-O05 | Distinguish Claude entry points, engineering interfaces, and the customization layer suited to each. | exam | D01-O01, D01-O02, D01-O03, D01-O04, D01-O05, D02-O01, D02-O02, D02-O03, D02-O04, D02-O05, D03-O01, D03-O02, D03-O03, D03-O04, D03-O05, D03-O07, D03-O08 | covered: 1, partial: 1, missing: 1 |
| M1-O06 | Choose a delivery route under enterprise governance and regulated-industry constraints. | exam | D01-O03, D02-O02 | missing: 1 |
| M2-O01 | Define measurable success criteria and build a representative eval suite before production code; select model-based versus code-based grading, choose eval workflow stages, and use evals to gate production changes. | exam | D01-O01, D01-O02, D01-O03, D01-O04, D01-O05, D01-O06, D02-O01, D02-O03, D02-O05, D03-O03, D03-O05, D04-O01, D04-O02, D04-O03, D06-O05 | covered: 4, partial: 1 |
| M2-O02 | Apply the POC-to-production checklist: model cost and latency, specify reliability patterns, name architecture-specific failure modes, and mitigate them, including for production agents. | exam | D01-O01, D01-O02, D01-O03, D01-O04, D01-O06, D02-O01, D02-O04, D03-O03, D03-O04, D04-O02, D04-O03, D04-O04, D04-O05, D04-O06, D06-O03, D06-O05, D07-O03 | covered: 2, partial: 1 |
| M2-O03 | Estimate call volume, token consumption, and cost; assess feasibility against the four AI properties and translate the business problem into a scoped architecture with explicit boundaries. | exam | D01-O01, D01-O04, D01-O06, D02-O04, D04-O05 | partial: 2, covered: 1 |
| M2-O04 | Design enterprise integrations for compliance, identity, authorization, data handling, and observability, selecting an appropriate integration point. | exam | D01-O04, D02-O05, D03-O01, D03-O02, D03-O04, D03-O07, D04-O01, D04-O06, D05-O04, D06-O05, D07-O03 | partial: 2, covered: 2 |
| M2-O05 | Plan and interpret a live A/B test or structured experiment by setting a hypothesis, choosing metrics, estimating sample size, and reading results without overclaiming. | exam | D04-O03 | covered: 1, partial: 1 |
| M3-O01 | Distinguish safety behavior established by model training from controls the application must enforce. | exam | — | missing: 1 |
| M3-O02 | Place input screening, output screening, and tool-call authorization correctly; choose model-based versus deterministic checks and define fail-closed behavior. | exam | D01-O01, D01-O02, D01-O04, D02-O02, D03-O01, D03-O02, D03-O04, D03-O07, D05-O01, D05-O02 | covered: 3, partial: 1 |
| M3-O03 | Identify where unequal outcomes can arise in the system and define explanations needed by users, regulators, and the debugging team. | exam | D03-O04, D05-O05 | partial: 2, covered: 1 |
| M3-O04 | Route decisions to an appropriate reviewer based on confidence, reversibility, and the cost of a wrong answer. | exam | D01-O02, D05-O03 | covered: 2 |
| M3-O05 | Map each compliance obligation to a named control, an owner, and an evidence artifact. | exam | D03-O04, D05-O04 | covered: 1 |
| M4-O01 | Structured discovery, bounded requirements and documented assumptions. | exam | D01-O01, D06-O01 | covered: 4 |
| M4-O02 | Present architecture tradeoffs with cost, risk and reversal implications; make decisions actionable. | exam | D01-O01, D06-O02 | covered: 1 |
| M4-O03 | Build stakeholder feedback loops with triggers, owners, SLA response and iteration/re-architecture decisions. | exam | D01-O01, D01-O02, D06-O02, D06-O03, D06-O04, D06-O05 | covered: 4, missing: 1 |
| M4-O04 | Partner-only: lead go-to-market discovery, scenario demo, objection handling and joint scoping with Applied AI. | partner_only | — | excluded: 2 |
| M4-O05 | Select live deployment entry point/cross-platform strategy and document business outcomes. | mixed_exam_and_partner | D01-O01, D01-O06 | missing: 4, excluded: 1 |
| M5-O01 | Configure team tools, environment, rollout, Skills distribution and spend controls. | exam | D07-O01 | covered: 1, missing: 3 |
| M5-O02 | Integrate AI assistance into developer workflows with verification discipline. | exam | D07-O02 | partial: 2, covered: 1 |
| M5-O03 | Diagnose symptoms, make runbooks/escalation paths and build team self-sufficiency. | exam | D07-O03 | covered: 2, missing: 1 |

M4-O04 jest wyłącznie partnerski. M4-O05 łączy trasę wdrożenia i wynik biznesowy z ponownym użyciem partnerskiego IP; wyłączono tylko ten ostatni aspekt. Sekcje handoff/audit M4-S11–13 pozostają pełnoprawną częścią mapy pod lifecycle M4-O03, mimo że nie mają osobnego numeru na liście celów wprowadzających. Przypadki błędnych projektów są materiałem dydaktycznym, a nie pustymi ekranami organizacyjnymi.

## Wszystkie jednostki → pytania i moduły

| Jednostka / cel przewodnika | Cel jednostki | Pytania | Główne moduły kursu (liczba pytań) |
| --- | --- | ---: | --- |
| CCARP-D01-O01 / ccarp-1.1 | Translate business problems into Claude-based AI solutions | 20 | M1: 15, M2: 3, M4: 2 |
| CCARP-D01-O02 / ccarp-1.2 | Design end-to-end architectures (input → processing → output → feedback loops) | 25 | M1: 15, M2: 8, M3: 1, M4: 1 |
| CCARP-D01-O03 / ccarp-1.3 | Select appropriate architectural patterns (workflow, agentic, augmented LLM) | 20 | M1: 18, M2: 2 |
| CCARP-D01-O04 / ccarp-1.4 | Design multi-agent systems and orchestration strategies | 32 | M1: 25, M2: 7 |
| CCARP-D01-O05 / ccarp-1.5 | Apply decomposition techniques for complex problem solving | 21 | M1: 20, M2: 1 |
| CCARP-D01-O06 / ccarp-1.6 | Align solutions to business value pillars (efficiency, transformation, productivity, cost, performance SLAs) | 20 | M1: 13, M2: 5, M4: 2 |
| CCARP-D02-O01 / ccarp-2.1 | Select appropriate Claude models based on trade-offs | 20 | M1: 10, M2: 10 |
| CCARP-D02-O02 / ccarp-2.2 | Design system prompts, templates, and guardrails | 21 | M1: 21 |
| CCARP-D02-O03 / ccarp-2.3 | Apply prompt engineering techniques (zero-shot, few-shot, chain-of-thought) | 21 | M1: 10, M2: 11 |
| CCARP-D02-O04 / ccarp-2.4 | Optimize context windows and manage token usage | 33 | M1: 32, M2: 1 |
| CCARP-D02-O05 / ccarp-2.5 | Implement prompt reuse strategies (caching, modular prompts, Skills) | 20 | M1: 18, M2: 2 |
| CCARP-D03-O01 / ccarp-3.1 | Evaluate tool/agent configuration for capability bloat | 15 | M1: 2, M2: 12, M3: 1 |
| CCARP-D03-O02 / ccarp-3.2 | Analyze authentication and authorization requirements to identify security gaps | 17 | M3: 17 |
| CCARP-D03-O03 / ccarp-3.3 | Evaluate accuracy-latency trade-offs and justify configuration decisions | 23 | M2: 23 |
| CCARP-D03-O04 / ccarp-3.4 | Analyze observability challenges and select monitoring strategies at scale | 25 | M2: 25 |
| CCARP-D03-O05 / ccarp-3.5 | Design a RAG pipeline with appropriate chunking and indexing strategies | 26 | M1: 22, M2: 4 |
| CCARP-D03-O06 / ccarp-3.6 | Apply retrieval strategies matched to data shape and query pattern | 17 | M1: 17 |
| CCARP-D03-O07 / ccarp-3.7 | Evaluate connection protocols and select the appropriate integration mechanism (MCP, API/CLI, agent-to-agent) | 24 | M1: 4, M2: 20 |
| CCARP-D03-O08 / ccarp-3.8 | Evaluate progressive discovery vs. monolithic context strategy | 13 | M1: 13 |
| CCARP-D04-O01 / ccarp-4.1 | Define evaluation metrics (accuracy, latency, cost, safety, security) | 15 | M2: 15 |
| CCARP-D04-O02 / ccarp-4.2 | Design evaluation datasets and test frameworks using mixed methodologies | 20 | M2: 20 |
| CCARP-D04-O03 / ccarp-4.3 | Conduct A/B testing and iterative improvements | 20 | M2: 20 |
| CCARP-D04-O04 / ccarp-4.4 | Diagnose system issues (prompt failure, hallucinations, model mismatch) | 13 | M2: 13 |
| CCARP-D04-O05 / ccarp-4.5 | Optimize token usage, latency, and cost-performance trade-offs | 31 | M2: 31 |
| CCARP-D04-O06 / ccarp-4.6 | Monitor system performance using logging and observability tools | 26 | M2: 26 |
| CCARP-D05-O01 / ccarp-5.1 | Implement guardrails and safety controls | 27 | M3: 27 |
| CCARP-D05-O02 / ccarp-5.2 | Identify risks, limitations, and failure modes of LLM systems | 18 | M3: 18 |
| CCARP-D05-O03 / ccarp-5.3 | Apply human-in-the-loop validation strategies | 24 | M3: 24 |
| CCARP-D05-O04 / ccarp-5.4 | Ensure compliance with regulations (e.g., GDPR, HIPAA, FedRAMP) | 30 | M3: 30 |
| CCARP-D05-O05 / ccarp-5.5 | Address ethical AI considerations (bias, fairness, transparency) | 23 | M3: 23 |
| CCARP-D06-O01 / ccarp-6.1 | Conduct structured discovery and requirement gathering | 24 | M4: 24 |
| CCARP-D06-O02 / ccarp-6.2 | Communicate architectural decisions and trade-offs | 25 | M4: 25 |
| CCARP-D06-O03 / ccarp-6.3 | Manage stakeholder feedback loops and expectation alignment (including SLAs) | 23 | M2: 5, M4: 18 |
| CCARP-D06-O04 / ccarp-6.4 | Document architectures and provide implementation guidance | 21 | M4: 21 |
| CCARP-D06-O05 / ccarp-6.5 | Support lifecycle phases (discovery, design, handoff, monitoring, iteration) | 20 | M2: 16, M4: 4 |
| CCARP-D07-O01 / ccarp-7.1 | Configure Claude tools and environments for teams (e.g., Claude Code) | 24 | M5: 24 |
| CCARP-D07-O02 / ccarp-7.2 | Improve developer workflows using AI-assisted tooling | 25 | M5: 25 |
| CCARP-D07-O03 / ccarp-7.3 | Support debugging and operational issue resolution | 23 | M2: 14, M5: 9 |

Wiersz jednostki nie wymusza jednego linku dla wszystkich pytań. D06-O05 zawiera produkcyjną gotowość i ewaluację, a D07-O03 również transport API; ich pytania mogą poprawnie kierować do M2. Docelowe powiązanie konkretnego pytania jest zapisane w JSON, wraz z uzasadnieniem, sekcją, hashem i dokumentacją.

## Braki i przygotowanie CC-02

Nie ma podstaw do deklaracji pełnego pokrycia. Poniższe pakiety zmian grupują powiązane aspekty w jednostki modelu mentalnego. Obejmują nowe ćwiczenia, a nie same etykiety. Granice i identyfikatory nowych/podzielonych jednostek należy uzgodnić z aktualną taksonomią podczas CC-02; nie proponujemy migracji schematu pytań w CC-01.

| Jednostka do uzupełnienia | Oczekiwana umiejętność / konkretne rozróżnienie | Cele kursu | Miejsce w obecnym banku |
| --- | --- | --- | --- |
| Właściwości modelu → konsekwencje projektu | Rozpoznać next-token prediction, niedeterminizm i steerability; dobrać weryfikację, deterministyczny komponent i eval wielokrotnych przebiegów | M1-O01, M3-O01 | D05-O02 + granice D01-O01; odróżnić bezpieczeństwo treningowe od odpowiedzialności aplikacji |
| Wejście, interfejs i trasa wdrożenia | Oddzielić narzędzie użytkownika od API/SDK/Agent SDK/MCP i miejsca wykonania; wyeliminować niezgodne trasy przed kosztem | M1-O05/O06, M2-O04, M4-O05 | D03-O07 oraz D05-O04; API, Bedrock, Vertex, Foundry/third-party według aktualnego źródła |
| Wieloplatformowe wdrożenie | Wybrać trasę główną i dodatkową, uwzględniając region, umowy, opóźnienia, funkcje i politykę zakupową | M4-O05 | Odrębna jednostka decyzji w obszarze integracji; nie zastępować pytaniami o MCP |
| Wykonalność i sizing | Przeliczyć wolumen × wywołania × tokeny i przedstawić warunkowy werdykt wykonalności wobec właściwości modelu i ograniczeń | M2-O03 | D01-O01/O06, D04-O05; oddzielić koszt próby od kosztu wyniku biznesowego |
| Ewalucja rozmowy i plan eksperymentu | Sprawdzić utrzymanie kontekstu, spójność kolejnych tur i zmyśloną historię; zaplanować próbę przed eksperymentem | M2-O01/O05 | D04-O02/O03; istniejące pytania o niepewność wyniku pozostają |
| Trwała awaria i degradacja | Wybrać retry, circuit breaker lub sprawdzony fallback chain; rozpoznać awarię fallbacku | M2-O02 | D03-O03; nie dublować istniejących pytań o retry budget |
| Kontrola, fairness i odbiorca wyjaśnienia | Wybrać kontrolę deterministyczną/modelową z jej blind spot; sprawdzić bias w corpus/prompt/examples/routing; dopasować dowody do użytkownika, regulatora i debuggera | M3-O02/O03 | D05-O01/O05; istniejące auth, fail-closed i logowanie nie są brakujące |
| Iteracja czy zmiana architektury | Z sygnału, triggera i właściciela wyprowadzić zmianę lokalną albo ponowne otwarcie projektu | M4-O03 | D06-O03/O05; odróżnić od samego rollout/rollback |
| Dokument wyniku biznesowego | Zestawić baseline i wynik na właściwym mierniku biznesowym, wkład rozwiązania i audytowalne kontrole; przekazać sponsorowi decyzję o dalszym zakresie | M4-O05 | D06-O04 + D01-O06; istniejąca ocena ROI nie ćwiczy przygotowania takiego dokumentu |
| Wdrożenie zespołu | Wybrać dystrybucję Skills dla odbiorców, wersjonowanie i wycofanie; champion-first adoption; model/spend/rate guardrails | M5-O01 | Podzielić nadmiernie jednorodne D07-O01; konfiguracja MCP nie zastępuje tych umiejętności |
| Workflow i samodzielność zespołu | Wpiąć AI w editor/review/test, wybrać automatyczne kontrole i ludzką ocenę; potwierdzić teach-back oraz rozwiązanie znanego problemu bez architekta | M5-O02/O03 | D07-O02/O03; sam runbook lub poprawna diagnostyka nie dowodzą przekazania umiejętności |

Pełna lista brakujących aspektów, wraz z istniejącym dowodem i konkretnym brakującym rozróżnieniem:

| Aspekt | Stan / dowody | Brakujący zakres | Proponowane miejsce naprawy |
| --- | --- | --- | --- |
| M1-O01-F01 — Account for non-determinism by evaluating behavior across representative cases and runs | partial; 3 ID w JSON | Questions test measured prompt/evaluation tradeoffs, but none explicitly asks the learner to connect run-to-run non-determinism to the need for repeated evaluation as a named model property. | Add a focused property-to-architecture question to the closest canonical unit; retain evaluation examples as adjacent evidence. |
| M1-O01-F06 — Use steerability limits to separate prompt guidance from deterministic enforcement | partial; 3 ID w JSON | Questions test prompt structure and external enforcement, but do not ask learners to identify steerability as one of the four properties or compare its implications across a whole design. | Add a focused property-to-architecture question to the closest canonical unit. |
| M1-O01-F07 — Recognize next-token prediction and protect factual precision rather than infer validity from fluent output | partial; 3 ID w JSON | The bank assesses unsupported evidence and deterministic factual authority. It does not explicitly connect next-token prediction to precision failures in names, dates, citations and statistics as the course foundation does. | CC-02: model properties to architectural mitigations under CCARP-D05-O02. |
| M1-O05-F01 — Distinguish the user-facing entry point from the build-time interface and runtime/deployment route | partial; 3 ID w JSON | These questions compare a shared MCP surface with existing API integration for cross-client reuse; they do not ask learners to classify all three architectural layers together. | Add focused practice to the closest canonical unit, and recheck full-bank evidence before declaring covered. |
| M1-O05-F03 — Choose Cowork for non-developer local file/action work and account for permission scope and supervision | missing; 0 ID w JSON | Cowork is explicitly taught in the course export, but no bank question assesses this entry-point choice. The exam guide does not establish a Cowork-specific requirement. | CC-02: course supplement within the entry-point mental-model unit; verify current documentation before authoring, without claiming confirmed exam scope. |
| M1-O06-F01 — Select a delivery route using platform, compliance, residency, and procurement constraints | missing; 0 ID w JSON | No D01-D03 item asks learners to choose among enterprise delivery routes under procurement, regulated-industry, residency, or governance constraints. MCP/API integration and telemetry privacy questions do not establish this route-selection skill. | Add focused practice to the closest canonical unit, and recheck full-bank evidence before declaring covered. |
| M2-O01-F05 — Use full-conversation datasets to assess context retention, follow-up consistency, and quality over multiple turns. | partial; 1 ID w JSON | The course teaches whole-conversation evals and turn-by-turn context checks. The bank has a multi-turn judge-calibration item, but no direct context-retention or fabricated-prior-turn item. | M2 eval-design unit / CCARP-D04-O02 |
| M2-O02-F02 — Choose and test retries/backoff, fallback chains, and circuit breakers against the failure mode and reliability requirement. | partial; 9 ID w JSON | Retry budgets, deadline-aware degradation and bounded fallback have evidence across nodes. No existing item explicitly chooses a circuit breaker or designs a fallback chain under its own failure modes. | CC-02: reliability mental-model unit under CCARP-D03-O03; distinguish transient retry, persistent-failure breaker and evaluated fallback. |
| M2-O03-F01 — Estimate expected calls, input/output tokens, and projected cost against business demand. | partial; 9 ID w JSON | Token/cost and capacity boundaries are practiced, but there is no integrated projection of daily request volume × calls per request × input/output tokens into the full feasibility verdict. | CC-02: feasibility and workload sizing under CCARP-D01-O06 / CCARP-D04-O05. |
| M2-O03-F02 — Assess feasibility against the four AI properties and state a scoped verdict with boundary conditions. | partial; 4 ID w JSON | Scoped no-go and narrowing decisions exist, but no item explicitly combines the four AI properties with the course feasibility verdict and its boundary conditions. | CC-02: feasibility mental-model unit under CCARP-D01-O01. |
| M2-O04-F01 — Select API, SDK, MCP, or Claude Code integration point under compliance and product constraints. | partial; 2 ID w JSON | MCP/API integration ownership and client boundaries are practiced. Choosing Claude Code versus API/SDK/Agent SDK for a product, separately from the approved cloud delivery route, is not directly exercised as a complete choice. | CC-02: integration interface versus delivery route under CCARP-D03-O07. |
| M2-O04-F03 — Minimize sensitive prompt/log data and account for retention, residency, BAA, and feature constraints. | partial; 9 ID w JSON | BAA/feature scope, data minimization, processor changes and evidence boundaries are practiced. Selecting an eligible provider route and explicit residency configuration from alternatives is missing. | CC-02: governed delivery-route selection under CCARP-D03-O07 and CCARP-D05-O04. |
| M2-O05-F02 — Estimate sample size for effect size and confidence needs; interpret statistical and practical significance without overclaiming. | partial; 4 ID w JSON | The bank tests unmet sample targets, uncertainty and invalid independence. It does not explicitly choose a prospective sample-size posture from expected effect size, confidence and stakes. | CC-02: experiment planning under CCARP-D04-O03. |
| M3-O01-F01 — Distinguish broad training-time safety behavior from domain, data, and authorization rules owned by the application. | missing; 0 ID w JSON | No owned D05 item directly tests the training-versus-application responsibility boundary. | M3 alignment-boundary unit |
| M3-O02-F02 — Choose model-based checks for ambiguous language and deterministic checks for explicit rules; account for different blind spots. | partial; 5 ID w JSON | Application validation and language-screen decisions have evidence; a focused comparison of deterministic checks versus model checks, including each blind spot, remains shallow. | CC-02: control selection under CCARP-D05-O01. |
| M3-O03-F01 — Inspect corpus, prompt, few-shot examples, and downstream routing as fairness entry points and compare relevant outcomes. | partial; 5 ID w JSON |  |  |
| M3-O03-F02 — Capture decision inputs, retrieved context, output, and routing so a decision can be reconstructed for each audience. | partial; 5 ID w JSON | Safe trace/reconstruction and user-facing explanation exist, but no focused item selects the different explanation/evidence artifacts needed by an affected user, regulator and debugging team together. | CC-02: audience-specific explanation and traceability under CCARP-D05-O05. |
| M4-O03-F04 — Decide when evidence calls for iteration versus re-architecture | missing; 0 ID w JSON | The assigned bank has no clear question that asks when to iterate versus re-architect from feedback-loop evidence. | Existing M4 feedback-loop unit. |
| M4-O05-F01 — Compare direct API, Bedrock, Vertex and third-party routes on latency/compliance/cost | missing; 0 ID w JSON | The course explicitly teaches this route/outcome skill, but no mapped D06/D07 item requires the learner to perform it. | Existing M4 entry-point and outcome-document learning unit. |
| M4-O05-F02 — Choose cross-platform primary/secondary routes for cloud and regulatory constraints | missing; 0 ID w JSON | The course explicitly teaches this route/outcome skill, but no mapped D06/D07 item requires the learner to perform it. | Existing M4 entry-point and outcome-document learning unit. |
| M4-O05-F03 — Write outcomes with before/after business measures and auditable controls | missing; 0 ID w JSON | The course explicitly teaches this route/outcome skill, but no mapped D06/D07 item requires the learner to perform it. | Existing M4 entry-point and outcome-document learning unit. |
| M4-O05-F04 — Make deployment value legible to a non-technical sponsor | missing; 0 ID w JSON | The course explicitly teaches this route/outcome skill, but no mapped D06/D07 item requires the learner to perform it. | Existing M4 entry-point and outcome-document learning unit. |
| M5-O01-F02 — Choose Skills distribution by audience, scope, versioning and revocation | missing; 0 ID w JSON | The course teaches Skills distribution by audience, ownership, versioning, and revocation, but the full question bank has no item testing that choice; the current selection item concerns managed MCP/network controls. | Existing M5 team setup unit; add a Skills distribution scenario only if coverage is intended. |
| M5-O01-F03 — Roll out with champions and batches to address uneven adoption | missing; 0 ID w JSON | The full question bank has no item practicing champion-first, department-by-department rollout to address uneven adoption; existing setup/version compatibility items are adjacent but do not assess adoption strategy. | Existing M5 team-setup unit; add a champion-first rollout scenario if that course goal should be practiced. |
| M5-O01-F04 — Set model and spend guardrails before team use | missing; 0 ID w JSON | No mapped question directly requires a coherent spend posture with model defaults/allowlists, effort guidance, and spend/rate/per-user limits. | Existing M5 team-setup unit. |
| M5-O02-F01 — Integrate AI help into editor, review and test loops | partial; 16 ID w JSON | Questions touch AI-assisted coding and review, but rarely require choosing integration points in the team’s existing editor/review/test flow. | Existing M5 developer-workflow unit. |
| M5-O02-F03 — Automate repeatable verification with tests/evals where suitable | partial; 15 ID w JSON | Many questions involve checks, but few distinguish repeatable automated tests/evals from checks needing human judgment. | Existing M5 developer-workflow unit. |
| M5-O03-F03 — Teach team to resolve known issues without the Architect | missing; 0 ID w JSON | No item has the team practice teach-back or independent resolution of known issues as an assessed outcome. Runbook creation and authorized diagnostics are neighboring support skills, not proof of team self-sufficiency. | Existing M5 operational-support unit; add a teach-back/independent-resolution practice. |

Nie uznano za braki istniejących golden datasets, A/B hypothesis/metrics, business outcome measurement POC, auth/delegation, retry budgets, kontrolowanego rollout, fail-closed czy bezpiecznej telemetrii tylko dlatego, że nie było ich w jednym podzbiorze pytań. Globalne rozstrzygnięcia i dokładne ID są zapisane w `reconciliationNotes` i facetach JSON. Osobne błędy MCP D07-O01-expansion-20/-27 pozostają zadaniem CC-02 z wcześniejszego audytu; ta mapa nie zatwierdza ich obecnej treści.

Cowork: M1-S28 uczy wyboru narzędzia do lokalnych działań osoby nietechnicznej. Bank tego nie ćwiczy. Aspekt M1-O05-F03 oznaczono jako `course_supplement`, z niepotwierdzonym wymaganiem egzaminacyjnym; uzupełnienie kursu nie powinno udawać potwierdzonego elementu blueprintu.


## Weryfikacja i granice odbioru

Wykonano odczyt i walidację aktualnego banku oraz kontrolę mapy: **PASS — 845 pytań, 38 jednostek, 24 cele, 107 sekcji, 5 modułów**. Sprawdzono dokładny zbiór pytań, hashe rekordów i plików źródłowych, wersję treści, tytuły/numery sekcji, adresy modułów obecne w eksporcie, poprawność odwołań oraz indeksy celów i jednostek. Próby negatywne odrzuciły usunięte pytanie, powtórzone pytanie i nieaktualny hash pliku. Narzędzie jest tylko czytnikiem dowodów; nie zatwierdza semantyki.

```sh
node scripts/content-audit/verify-claude-course-map.mjs --course-root /Users/lukaszkurczab/Desktop/Projects/claude-study-export/materialy-v2
```

Weryfikator: [verify-claude-course-map.mjs](../../../scripts/content-audit/verify-claude-course-map.mjs). Nie uruchamiano symulatora ani testów UI: żaden kod wykonawczy nie został zmieniony. Nie publikowano treści ani aplikacji. Niezależny przegląd `cc01_m23` (gpt-6-luna, high) wydał **PASS dla granicy mapy**: kompletność wejść i odniesień, formalne cele/aspekty, widoczność braków oraz próbkowane semantyczne przypisania między modułami. Uwaga o dwukierunkowym indeksie Cowork została poprawiona: M1-O05 ↔ M1-S28. Finalny artefakt ma 76 aspektów, w tym osobny suplement Cowork. Nie jest to niezależny odbiór każdego z 845 kluczy odpowiedzi ani działającego logowania Skilljar.

Ocena podejścia CC-01: dopasowanie do celu/architektury 0,92; prostota 0,87; ryzyko 0,84; utrzymanie 0,88; minimum 0,84. Jedna mapa dowodowa poza runtime, obecny walidator banku i wąski czytnik integralności ograniczają ryzyko. Ograniczenia: eksport nie potwierdza wszystkich interakcji, dostęp Skilljar wymaga realnego odbioru, a mapowanie nie jest audytem każdego klucza.
