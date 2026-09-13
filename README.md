# Patternly canonical content

## KISS — nadrzędna zasada utrzymania

To repozytorium ma być przede wszystkim prostą bazą pytań JSON używaną podczas budowania aplikacji. Wybieraj najmniejsze rozwiązanie, które chroni rzeczywisty kontrakt produktu.

- Jeden koncept ma jedną nazwę i jedno źródło prawdy; w szczególności używaj `mentalUnitId` wszędzie.
- Preferuj jeden wspólny format pytań i jedną współdzieloną implementację narzędzi, ale zachowuj track jako granicę walidacji, testu, buildu i artefaktu. Zmiana jednego tracka nie powinna przetwarzać pozostałych ośmiu.
- Wspólne schema i builder testuj po ich zmianie. Pełne dziewięć tracków sprawdzaj na release; w zwykłej pracy uruchamiaj tylko dotknięty track.
- Nie dodawaj osobnego schematu, pipeline'u, statusu, manifestu, generatora, evidence ani warstwy kompatybilności bez wskazania istniejącego konsumenta lub konkretnego ryzyka produktu, którego prostszy mechanizm nie chroni.
- Nie utrzymuj równoległych aktywnych reprezentacji tych samych pytań. Migracje mają prowadzić do jednego formatu i usuwać zastąpione ścieżki.
- Nie przenoś historycznej złożoności do aplikacji przez trwałe adaptery. Po migracji aplikacja ma bezpośrednio konsumować wspólny kontrakt; zachowujemy stabilne ID i dane użytkownika, nie stary kształt authoringu.
- Model evaluation i review są dodatkami czytającymi kanoniczne dane. Nie mogą komplikować zwykłej edycji i buildu contentu ani automatycznie zatwierdzać lub publikować pytań.
- Gdy obecna architektura jest bardziej złożona niż te zasady, najpierw upraszczaj; nie buduj kolejnych adapterów utrwalających historyczną złożoność.

Plan przejścia do prostego modelu opisuje `docs/planning/PATTERNLY-CONTENT-SIMPLIFICATION-PLAN.md`.

The content repository is an authoring and immutable publishing system. It is
not a runtime API and has no dependency on the backend for content admission.

When a readiness script needs the application checkout, use the explicit
`PATTERNLY_FRONTEND_ROOT` environment variable. `PATTERNLY_BACKEND_ROOT` is
reserved for checks that genuinely require backend evidence; the current
runtime admission check does not require it and therefore does not introduce
an artificial dependency.

The sole learner-content ingress is `content/<trackId>/<nodeId>/<mentalUnitId>.json`, using one shared question schema and `mentalUnitId`. Each file is a non-empty JSON array of canonical questions. Runtime applications import generated artifact bytes at build time; they never use this repository or a content HTTP endpoint at runtime.

Historical approvals and migration records remain under `evidence/` and `content/migration-evidence/`. They describe the accepted source at the time of approval; they are not a writable or executable learner-content ingress.

Run `npm test` for the canonical builder, immutable migration evidence, review-console, and boundary gates. Use `npm run content:validate`, `npm run content:test`, `npm run content:build`, and `npm run content:build-all` for the shared canonical flow.

The Product Owner has accepted nine banks, including Claude Certified Architect Professional. Historical eight-track readiness and review artifacts remain evidence of their original scope, not the current catalogue contract. No mass reduction, expansion, or automatic re-approval is implied.
There is no global `>120 questions/node` readiness rule; counts are operational
evidence only, while content changes are targeted to demonstrated factual,
technical, scoring, feedback, duplicate, coverage, profile, provenance, or runtime
defects. Patternly is a decision-practice/remediation product, not a question bank.

## Shared content builder (SIMP-02)

The canonical v1 builder reads one track at a time from
`content/<trackId>/<nodeId>/<mentalUnitId>.json`; each mental-unit file is a
non-empty JSON array of canonical questions, and every question must repeat the
file's `nodeId` and `mentalUnitId`. Production canonical sources contain the nine
banks migrated in SIMP-03. A durable verifier checks their exact accepted
inventory, identities, projections, source hashes and immutable migration evidence:

```sh
npm run verify:migration
```

Use a temporary fixture workspace when exercising the builder against synthetic
content:

```sh
npm run content:validate -- --track <trackId> --root <workspace>
npm run content:test -- --track <trackId> --root <workspace>
npm run content:build -- --track <trackId> --root <workspace> --output-root <dist>
npm run content:build-all -- --root <workspace> --output-root <dist>
```

`validate`, `test` and `build` require `--track`; `build-all` requires all nine
catalogued track sources. The builder stages deterministic `dist/<trackId>.json`
artifacts and `dist/content-lock.json` together, validates existing lock/artifact
integrity, and rolls back handled write/rename failures; it is not a crash-safe
transaction. It does not import the legacy publishing pipeline.
