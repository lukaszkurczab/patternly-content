# SIMP-01 — raport

**Status:** `done`
**Zakres:** kanoniczny kontrakt pytania v1, katalog 9 tracków i syntetyczny fixture pięciu interakcji.

## Wynik

- Dodano jeden rodzinno-neutralny schema oraz jeden walidator semantyczny bez zależności od legacy publishing pipeline.
- `questionId`, `trackId`, `nodeId` i `mentalUnitId` są obowiązkowe; pola dodatkowe i aliasy rodzinne są odrzucane.
- Katalog wiąże dokładnie 9 tracków ACC-02, a fixture obejmuje `choice_single`, `choice_multiple`, `ordering`, `complexity` i `decision_matrix`.
- Każda interakcja ma deterministyczny scoring; błędna część odpowiedzi nie może dać statusu `correct`.
- Nie migrowano banków, nie zmieniono pytań i nie podłączono aplikacji. Legacy pozostaje aktywne zgodnie z planem do SIMP-05; w SIMP-01 nie usuwano zastąpionych ścieżek.

## Weryfikacja

- `npm run validate:shared-contract` — PASS, 5 pytań / 9 tracków.
- `npm run test:shared-contract` — PASS, 16/16.
- `npm test` — PASS, 187/187.
- JSON Schema Draft 2020-12 — PASS dla pięciu fixture'ów oraz testów newline/whitespace.
- `git diff --check` — PASS.
- Niezależne QA Luna/max — PASS bez otwartych problemów po dwóch iteracjach naprawczych.

## Następny task

`SIMP-02` — wspólny builder z dziewięcioma niezależnymi wejściami.
