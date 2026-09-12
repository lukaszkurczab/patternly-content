# SIMP-03 — raport

**Status:** `done`
**Model wykonawczy:** kontroler oraz workerzy i niezależne QA — `gpt-5.6-luna`, reasoning `max`.

## Wynik

- Dziewięć zaakceptowanych banków przeniesiono do jednego kanonicznego układu `content/<trackId>/<nodeId>/<mentalUnitId>.json` bez zmian pytań ani aplikacji.
- Inwentarz wynosi dokładnie 9 tracków, 117 nodów, 932 mental unity i 16 041 pytań. Zachowano dokładne `questionId`, treści learner-visible, przypisania oraz zachowanie scoringu pięciu interakcji.
- Niezmienione źródła legacy pozostają dostępne do przełączenia konsumenta i usunięcia starego systemu w SIMP-05. Jednorazowy writer i protokół cutoveru usunięto po zweryfikowanej aktywacji.
- Trwałe `content/migration-evidence/` oraz `npm run verify:migration` niezależnie potwierdzają membership, hashe źródłowych plików i elementów, projekcje, canonical question hashes, agregaty i exact counts.
- Kontrakt wspólny rozróżnia trim-clean identyfikatory od learner-visible tekstu. Zachowano jedyny zastany prompt z końcową spacją, zamiast cicho zmieniać treść.

## Macierz przed / po

| Własność | Przed | Po |
| --- | --- | --- |
| Produkcyjne źródło kanoniczne | brak | 9 niezależnych drzew tracków |
| Kształty pytań | 6 historycznych formatów | 1 kontrakt, 5 interakcji |
| Inwentarz | przypięty baseline | dokładnie 9 / 117 / 932 / 16 041 |
| Dowód migracji | manifesty źródłowe | immutable evidence + niezależny verifier |
| Jednorazowy kod migracyjny | potrzebny do cutoveru | usunięty po finalizacji |

## Weryfikacja

- `npm run verify:migration` — PASS dla aktywnego drzewa; canonical content SHA-256 `de7a2a1f67a304fb4d1ca55b9bb6d1238c471796aac36b3e95219b1d9d639d0a`.
- Każdy z 9 tracków: `content:validate`, `content:test`, `content:build` — PASS; `content:build-all` — PASS z dokładnie 9 artefaktami.
- Replay 16 041 pytań i wszystkich pięciu interakcji — PASS; padding learner-visible promptu zachowany.
- `npm test` — PASS, 245/245 przed usunięciem testów jednorazowego cutoveru/writera oraz 222/222 na końcowym stanie repozytorium.
- Niezależne końcowe QA Luna/max po aktywacji — PASS, bez otwartych problemów; minimum oceny 0,92.

## Usunięte ścieżki

- `scripts/migration/simp03-writer.mjs`
- `scripts/migration/simp03-cutover.mjs`
- testy jednorazowego writera i protokołu cutoveru

Nie usunięto legacy contentu ani jego aktywnych ścieżek; ich bezpieczne usunięcie należy do SIMP-05 po przełączeniu aplikacji.

## Następny task

`SIMP-04` — prosty konsument dziewięciu kanonicznych artefaktów w aplikacji.
