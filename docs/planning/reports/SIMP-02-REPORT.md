# SIMP-02 — raport

**Status:** `done`
**Model wykonawczy:** worker i niezależne QA — `gpt-5.6-luna`, reasoning `max`.

## Wynik

- Jeden `scripts/build.mjs` waliduje, testuje i buduje wskazany `trackId`; pełny gate iteruje dokładny katalog dziewięciu tracków.
- Artefakt `dist/<trackId>.json` i `content-lock.json` są deterministyczne; lock przechowuje wyłącznie `trackId`, `contentVersion`, `questionCount` i SHA-256 dokładnych bajtów artefaktu.
- Katalog zawiera content versions przypięte do Candidate Manifest ACC-02.
- Testowy workspace dowodzi dziewięciu niezależnych wejść. Produkcyjne `content/<trackId>/` pozostają nieutworzone do migracji SIMP-03; brak lub pusty input jawnie failuje.
- Builder odrzuca symlinki źródła/outputu, obce i powtórzone identity, uszkodzony lock/artefakt oraz częściowy output po hard kill. Obsłużone błędy zapisu rollbackują poprzedni zestaw; ograniczenie wieloplikowej crash-atomicity jest jawne w README.
- Nie importowano ani nie rozszerzano legacy pipeline. Nie migrowano i nie zmieniano pytań. Nie usuwano ścieżek, ponieważ legacy pozostaje aktywnym konsumentem do SIMP-05.

## Macierz przed / po

| Własność | Przed | Po |
| --- | --- | --- |
| Wspólny builder | brak | jeden builder parametryzowany `trackId` |
| Granica artefaktu | rodzinne pipeline'y | osobny deterministyczny JSON per track |
| Lock | brak | jeden ścisły lock, dokładnie 9 wpisów w pełnym gate |
| Izolacja | nieudowodniona | zmiana tracka nie przepisuje bajtów ani `mtime` pozostałych |
| Brak źródła | brak nowej ścieżki | jawny błąd, bez placeholdera |

## Weryfikacja

- `node --test tests/content-builder.test.mjs` — PASS, 16/16.
- `npm run test:shared-contract` — PASS, 16/16.
- `npm test` — PASS, 203/203.
- `git diff --check` — PASS.
- Niezależne QA Luna/max — PASS po dwóch iteracjach naprawczych, bez otwartych problemów.

## Następny task

`SIMP-03` — mechaniczna migracja dziewięciu banków z zachowaniem exact identity, treści i inwentarza.
