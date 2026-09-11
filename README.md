# Patternly manual content publishing and authoring

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

The current legacy flow is family-specific manual source → read-only validation → human review → immutable track artifact → immutable release. The target canonical flow after `SIMP-01`–`SIMP-05` uses one shared question schema and `mentalUnitId`, while retaining track-level validation, artifacts and release boundaries. Authoring readiness is a planning gate; it is separate from human approval, runtime publication, and release activation. Runtime applications import generated artifact bytes at build time; they never use this repository or a content HTTP endpoint at runtime.

Until the KISS migration is completed, `manual/source/<trackId>/` remains the legacy learner-item ingress. Do not add another source format or extend its family-specific architecture. New work should move toward `content/<trackId>/<nodeId>/<mentalUnitId>.json` and the shared `mentalUnitId` contract described in the simplification plan. Empty or placeholder JSON is forbidden.

Run `npm test` for architecture fixtures. Run `npm run authoring:validate` to validate the registry, contracts, current catalogue, slot mapping, and existing Coding source. `npm run authoring:plan` writes the deterministic manifest; `npm run authoring:scaffold` is dry-run by default and requires `--write` to create only README and `.authoring.md` planning files. See `docs/manual-publishing-handoff.md` before adding manual source or emitting a release artifact.

The current three authoring families are `coding_interview`, `certification`, and `design_interview`. Certification and Design source schemas are authoring contracts only; they do not create runtime registrations or claim unsupported case, simulation, package, or release behavior. Every authored batch remains unapproved until a human technical/editorial review record exists. Agent-prepared review records are not human approval; the current launch owner decision is stored separately in `evidence/human-content-approvals/manifest.json` and is bound to the exact source commit and item manifests it covers.

The Product Owner has accepted nine banks, including Claude Certified Architect Professional. Historical eight-track readiness and review artifacts remain evidence of their original scope, not the current catalogue contract. No mass reduction, expansion, or automatic re-approval is implied.
There is no global `>120 questions/node` readiness rule; counts are operational
evidence only, while content changes are targeted to demonstrated factual,
technical, scoring, feedback, duplicate, coverage, profile, provenance, or runtime
defects. Patternly is a decision-practice/remediation product, not a question bank.

## Shared content builder (SIMP-02)

The canonical v1 builder reads one track at a time from
`content/<trackId>/<nodeId>/<mentalUnitId>.json`; each mental-unit file is a
non-empty JSON array of canonical questions, and every question must repeat the
file's `nodeId` and `mentalUnitId`. Production canonical sources are
not populated until SIMP-03; do not add empty or placeholder files. Use a temporary
fixture workspace when exercising the builder:

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
