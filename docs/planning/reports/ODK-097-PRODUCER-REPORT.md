# ODK-097 — lokalny kontrakt profili Design

Status: `partial` dla całego ODK-097; producentowy wycinek lokalny zakończony. PO zatwierdził w aktywnej rozmowie 2026-09-21 wspólną macierz Backend/OOD/Frontend: Learn `[1,10]`, Tradeoff `[10,20,40]`, Review `[1,10,20]`, default 10; Review tylko z `due_queue`, z jawnym skróceniem lub unavailable. To nie jest globalne package/release admission.

## Zmiana

- Trzy `config/free-node-experience-profiles/*.json` zachowują `profileId` v1 i podnoszą `profileVersion` do `2`. Learn configuration v1 pozostaje bez zmian; Tradeoff i Review mają configurationId/Version v2. Exact Free node, unikatowe ID, brak reinsertion i due-only Review są zachowane.
- Zgodne `docs/track-briefs/*.json` oraz `scripts/product/track-briefs.mjs` wskazują profile v2. `tests/odk097-design-session-matrix.test.mjs` pinni dokładną macierz, wersje i baseline pytań; test włączono do `npm test`.
- Nie zmieniono banków pytań, canonical `contentVersion`, starych immutable package artifacts, `config/bundled-free-node-packages.json`, historycznych release locków ani migration evidence.

## Tożsamość i dowody

SHA-256 profilu oznacza `sha256(canonicalJson(parsed profile))`, nie hash bajtów źródłowego pliku.

| Track | Free node count / SHA-256 | Cały track count / SHA-256 | Profil v2 SHA-256 |
| --- | --- | --- | --- |
| Backend | 145 / `27de9ae6ae032d90e67b837087b18a128e0d991bc3474ca475e2626bf1098d99` | 1569 / `0a66ef035674aee9be6c089b18406321dc8284d88422db3cdc828ffb8ded67a4` | `49bc914148aa261fefb310689e277accb83a82908c0a67e15dd829e383cf5cb2` |
| OOD | 136 / `1635ae7e543e5e3c26acd3e9db489e50c71d03865085fc3a36d9192e8e016829` | 1413 / `7a20a41c7f14a03982558981e7dda04962d951120cf5d53715cace6cca874b69` | `291788f0d822983392266d1e1cdb098b6d47e6d009622672fa2d02b85bdfd2a3` |
| Frontend | 150 / `1fdf8950b3cade9aaf396d64084a99eb2487964f0aa99d4d5b6e5f1fbed06928` | 1766 / `8055a759f023ab7368ed26b4a4111fd56cd45a335fbae1ef9664155159cbd416` | `1ec604e0f348b1d4e8f2382e556a434010be008b2c07e073853fabe10a0a2952` |

Baseline pytań: `validateTrack`, filtr exact `freeNodeId`, sortowanie leksykalne po `questionId`, `sha256(canonicalJson(sorted questions))`. Test potwierdził niezmienność count, SHA i contentVersion każdego tracka.

## Weryfikacja i ograniczenia

- Test ODK-097: 2/2 PASS; pełne `npm test`: 59/59 PASS; walidacja 11 track briefs PASS; jawne `content:validate -- --track <id>` dla Backend/OOD/Frontend PASS; `git diff --check` PASS.
- Próba `npm run content:validate` bez `--track` zwraca błąd użycia CLI; jawne trzy wywołania z `--track` przeszły. Globalne `verify:migration` nadal ma historyczny błąd AWS `EVIDENCE_VALUE` po ODK-096 i nie jest bramką tego wycinka.
- Niezależny QA producenta: `gpt-5.6-luna`, reasoning `max`, `PASS_WITH_GAPS`; consistency 0,96, simplicity 0,94, risk 0,83, maintainability 0,94, minimum 0,83. Wskazał brak bieżącej publikacji paczek i konieczność testu parity z aplikacją.
- `config/bundled-free-node-packages.json` nadal wskazuje immutable paczki `*-free-node-0003` z profilem v1 i dawnymi długościami. Nie zostały podmienione ani ponownie opublikowane. Bieżący app `sync:content-release` buduje canonical question artifacts z producenta i nie czyta tych paczek; lokalny kontrakt sesji wymaga osobnej zmiany aplikacji. Nie twierdzić, że profil v2 jest już aktywny w runtime ani wydany produkcyjnie.

Model wykonania tego wycinka: `gpt-5.6-luna`, reasoning `max`. Repo AGENTS wymaga tej pary dla delegacji; to jawna różnica wobec ogólnego routingu `worker_terra`/`qa_terra` w użytej pętli controller-worker-QA.
