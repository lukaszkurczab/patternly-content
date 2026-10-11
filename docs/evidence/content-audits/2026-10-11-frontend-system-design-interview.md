# FESD N08 — odbiór napraw 162 pytań / 11.10.2026

Status: zakończone — semantic QA PASS 162/162, źródła i artefakt opublikowane, pełne CI PASS. Publikacja nie obejmuje przypięcia w aplikacji. Publikacja dotyczy źródeł i artefaktu, bez admission do aplikacji.

## Zakres i decyzja właściciela

Użytkownik autoryzował wykonanie i publikację przed wydaniem iOS, następnie rozstrzygnął: „Opublikuj odebrane źródła i artefakt contentu; przypięcie w aplikacji pozostaw do osobnego zadania właściciela kontraktu.” To wyjątek dla dokładnie B01–B08, nie całego banku. Q13, Premium gate, runtime aplikacji i cudze nieopublikowane zmiany pozostają poza zakresem.

Bazowy producer: `0f4e6912d7d0cdb1a1c41b9d7885d7e867f80f34`; app użyty do testów: `8a591248c576b0d63f2df6331bd5ce8d83359bd5`. Własny commit połączono z opublikowanym `master` `cac1836`, zachowując zmiany Claude i zamrożenie historycznych fixtures. Nie dołączono nieopublikowanego BESD ani dirty historycznych artefaktów z głównego checkoutu.

## Wynik i tożsamość

Wszystkie 162 stare pytania retired/replaced w tym samym node i mental unit. Nowe ID mają offset +100 (`i001 → i101` itd.). Pełne mapowanie, poprzednie i obecne obiekty oraz SHA ośmiu plików: [canonical proof](../../../evidence/business-quality/fesd-n08-20261011.json). Pozostałe 1604 pytania zachowano dokładnie; test porównuje każdy obiekt z bazowym commitem. Nie otrzymały nowego semantic review.

46 starych single-choice poprawiono, 83 nieuzasadnione total order zastąpiono jednoznacznymi single-choice, 33 matryce otrzymały scenariuszowe wymiary i feedback. Wynik: 129 choice_single, 0 ordering, 33 decision_matrix; cały track nadal 1766 pytań. Usunięto autorskie metainstrukcje, zachowano rzeczywiste ograniczenia i przebudowano Reason, pięć Details oraz target-bound messages. Globalny scorer i schema pozostają istniejące.

Przykłady przed/po:

- B01-i003 wymuszało `observe/preserve/expose/recover` bez koniecznych precedencji. B01-i103 rozstrzyga keyboard-operable file fallback po odmowie kamery przy zachowanych notatkach; dawny legalny porządek nie jest już oceniany jako błąd.
- B02-i001 miało ogólną matrycę semantics/input/state. B02-i101 określa wejście na statyczne podsumowanie wypłaty, Tab containment i powrót do istniejącego Approve po Escape.
- B07-i013 miało powtórzoną ogólną matrycę. B07-i113 rozstrzyga locale plural rules, izolację RTL nazwy produktu i wrapping dłuższych etykiet; feedback i113 wskazuje aktualne alternatywy, bez pomylenia gramatyki i kierunku bazowego.

## Niezależny odbiór

`semantic_qa`, gpt-6-luna high, oddzielny od autorów: **PASS 162/162**. Reviewer czytał prompt/constraints/interaction przed kluczem, następnie każde Reason, Details, messages i refs. Poprzednie FAIL doprowadziły do usunięcia dwuznacznych alternatyw, błędnych bindings, szablonowego transferu i wskazówek długości. Final receipt potwierdza zgodność obecnych plików z odebranymi snapshotami:

| Unit | Pytania | QA | Source SHA256 |
|---|---:|---|---|
| B01 | 19 | PASS | `8a41ef7a13410c8b59e929611d1640a0301be0e5e01b2a78cea1fc379eca387a` |
| B02 | 21 | PASS | `96f6d5499e57883a2d17d95d256b0ba890126969869bbe2cc63ec842a734de0b` |
| B03 | 20 | PASS | `1dce975ef17f1b7d9b15eb50784cddd46f2d205cc074498a93c13d017263934d` |
| B04 | 20 | PASS | `83d978a04782955cb9787a5e68a49de67fd4d47c24a42119202f2c92c232ef0f` |
| B05 | 21 | PASS | `3ab19d3470d562c73025214ec9127d7b70ab45321d05faeb60f5d92e0593d0b8` |
| B06 | 19 | PASS | `1ec3f6c207ba6c90733e1dae9849c4283da9dfbc2dea6be037bd8726d9f079cf` |
| B07 | 20 | PASS | `6513451faebd3dfae6b11c310f44fd61eb3f7c4bc0b541a7627313ab6e6dd80c` |
| B08 | 22 | PASS | `b3c614af22a396ecd6f319cc9f6228660ff41113a77f9560877588f77550b382` |

B08-i113 wymagało jeszcze mechanicznej zmiany value ID `pointer_only → pointer_bound_control` i odpowiadającego targetId. Normalizacja tych dwóch pól odtwarza cały odebrany 22-item snapshot; recenzent osobno potwierdził binding i powyższy final hash. Treść/klucz/Details/refs nie zmieniły się.

Niezależny przegląd projektu: fit 0,90 / simplicity 0,86 / risk 0,81 / maintainability 0,85, minimum 0,81. Podejście producer-first; runtime admission nie jest domniemane. Bounded loader istniejącego migration proof: 0,94 / 0,84 / 0,85 / 0,84, minimum 0,84. Read-only reviewer verifiera/testów (Luna High, nie autor tych plików) wskazał brak git-base binding; poprawiono pin commita oraz test SHA8/deep-equality162 przedmiotów i otrzymano ponowny odbiór.

QA jest statycznym przeglądem semantycznym i kontrolą snapshotów; nie zastępuje testów wykonania ani live weryfikacji każdej zewnętrznej strony.

## Kontrakt migracji i konsument

Producer: canonical source → istniejący `scripts/build.mjs` → artifact-v2 + content-lock-v1. Obecny app sync dopuszcza policy-only successor o identycznym training content; nowa semantyczna partia wymaga osobnego zadania właściciela kontraktu. Nie zmieniono synchronizatora, app pin, ledger ani historycznych approvals/admissions/release lock.

Istniejący `patternly-bizq-semantic-replacement-v1`, bez nowego CLI/schema/pipeline: bounded loader pinuje 8 source paths, 162 one-to-one replacement, before commit, proof SHA, current/prior membership, taxonomy i unikalność zastępowanych child IDs; odtwarza byte-exact historyczny poprzednik i cały jego hash. Proof nie jest ludzkim approval.

- Proof SHA256: `edc2e517adcbbf55a5aa1612868c3da7c1a83c653bb984de829a526a76ec2204`.
- Before question-set SHA256: `8055a759f023ab7368ed26b4a4111fd56cd45a335fbae1ef9664155159cbd416`.
- Current question-set SHA256: `cccc86cda609c071dae829f1c7f9ae5b59219bc89da51f07ac3eab229e169261`.
- Content version: `frontend-system-design-interview-fesd-n08-v2026.10.11`.

## Weryfikacja techniczna

Wykonane na końcowych źródłach pod Node22.22.3:

| Komenda | Wynik |
|---|---|
| `npm run content:validate -- --track frontend-system-design-interview` | PASS — 1766 |
| `npm run content:test -- --track frontend-system-design-interview` | PASS — 1766 canonical answers |
| `npm run content:build -- --track frontend-system-design-interview --root . --output-root /private/tmp/fesd-publish-20261011` | PASS — 1766 |
| `npm run content:build-all -- --root . --output-root /private/tmp/fesd-final-all` | PASS — 9 tracks; identyczne bajty FESD |
| `npm run validate:bundled-free-nodes` | PASS — 9 packages |
| `PATTERNLY_FRONTEND_ROOT=../fesd-app node --import ../patternly/node_modules/tsx/dist/loader.mjs --test tests/fesd-n08-repair.test.mjs` | PASS — 4/4, skipped0, fail0; actual app scorer/presentation |
| `npm test` | 236 tests: 230 PASS, 5 FAIL, 1 SKIP; remediation niżej |
| `node --test --test-name-pattern="Historical manifests retain identity" tests/content-builder.test.mjs` | PASS — 1/1 po aktualizacji bieżącej wersji |
| `node --test tests/primary-strata-readiness.test.mjs` | PASS — 10/10 po odświeżeniu provenance i dwóch inventory pins w testach |

Artefakt: SHA256 `48b295c98c7d7ff18df35e26a30690704d0cb4cdd74989cedc887cdcb62def37`; one-track lock SHA256 `a53e9c9c88e2f7941a9e7a07e5b635f7490b6f62b3bcceab7d58f374b3856cf1`. App FESD lock nadal: `862b1e6abca0ffeabde06c1a7261bd9783aaf398463fc4134a3e666331fb1159`, dotychczasowa wersja `frontend-system-design-interview-candidate-v2026.08.15-bizq02-v2-bizq03-planning-v2`, 1766. Pełny lokalny run trwał 1132378ms. Pięć porażek stanowiło: jedno stare oczekiwanie bieżącej wersji FESD oraz cztery stale-provenance checks istniejącego manifestu. Wersję poprawiono wyłącznie dla bieżącego FESD, bez zmiany historycznych asercji; ponowienie 1/1 PASS. Istniejący `config/primary-strata-readiness.json` odświeżono przez istniejący `describeCurrentSourceProvenance`: wejście canonical_catalog pinuje cały katalog, więc bump FESD zmienia inventory hash wszystkich dziewięciu tracków. Pierwsze ponowienie dało8/10: dwa testy nadal przypinały stare derived inventory SHA dla AI-901/AZ-104. Zaktualizowano tylko te dwa hashe, a następne pełne ponowienie pliku dało10/10PASS. Zachowano wszystkie mapowania, objective/stratum statuses i deklaracje unavailability. Nie jest to nowy manifest ani approval. Jedyny SKIP dotyczy opcjonalnego app-root testu w zwykłym npm test; osobny run z rzeczywistym app checkout dał4/4PASS bezskipów. FESD migration proof3/3PASS w pełnym zestawie.

Wersjonowane testy: `tests/fesd-n08-repair.test.mjs` i `tests/fesd-n08-migration-proof.test.mjs`. Sprawdzają scope162/unchanged1604, każdą poprawną i błędną odpowiedź, omitted dimensions, feedback targets po shuffle, builder output i rzeczywisty app scorer/presentation. Testy negatywne proof obejmują tampering, brak pliku oraz symlink substitution.

App runtime test wymaga `PATTERNLY_FRONTEND_ROOT` wskazującego istniejący checkout oraz Node22 z `--import <app>/node_modules/tsx/dist/loader.mjs`. Bez tej zmiennej część app jest jawnie skipped; nie należy raportować jej jako PASS. Dotychczasowy read-only app presentation test: 5/5 PASS. Nie zmieniano renderera/scorera/presentation, więc zgodnie z załącznikiem nie dodano native/iOS gate; nie uruchamiano nowego symulatora.

## Referencje i ograniczenia

Pierwotne źródła sprawdzone 11.10.2026: [WCAG2.2](https://www.w3.org/TR/WCAG22/), [APG Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [Page Structure](https://www.w3.org/WAI/tutorials/page-structure/), [HTML direction](https://www.w3.org/International/questions/qa-html-dir), [CSS Containment3](https://www.w3.org/TR/css-contain-3/#container-queries) (Working Draft), [ECMA402 PluralRules](https://tc39.es/ecma402/#sec-intl-pluralrules-objects), [DOM AbortController](https://dom.spec.whatwg.org/#interface-abortcontroller), [Fetch](https://fetch.spec.whatwg.org/#fetch-method), [URLSearchParams](https://url.spec.whatwg.org/#urlsearchparams). Per-item sourceRefs zachowują dokładniejsze wskazania. To nie jest pełny audyt wsparcia przeglądarek ani EPIC09 model evaluation.

## Dostarczenie

Źródła opublikowano zwykłym push do `master`: [3c0717fb714af8b4c022b2575258fe8bbc19cbef](https://github.com/lukaszkurczab/patternly-content/commit/3c0717fb714af8b4c022b2575258fe8bbc19cbef), bez PR/issue/force. [Pełne CI](https://github.com/lukaszkurczab/patternly-content/actions/runs/38157759839): **PASS**, 236 tests / 235 PASS / 0 FAIL / 1 SKIP; skipped jest opisanym opcjonalnym app-root testem, który osobno przeszedł4/4. CI zbudowało9tracków, sprawdziło canonical answers wszystkich tracków, quarantined source candidate bez admission, historyczne readiness/decision oraz brak zmian historycznych dowodów i9Free-node packages.

[Publiczne wydanie fesd-n08-2026-10-11](https://github.com/lukaszkurczab/patternly-content/releases/tag/fesd-n08-2026-10-11) celuje dokładnie w powyższy commit i zawiera canonical builder output oraz one-track lock. Oba publiczne assets pobrano ponownie11.10.2026; SHA256 JSON `48b295c98c7d7ff18df35e26a30690704d0cb4cdd74989cedc887cdcb62def37` i lock `a53e9c9c88e2f7941a9e7a07e5b635f7490b6f62b3bcceab7d58f374b3856cf1` zgadzają się z lokalnym buildem i digest GitHub. Rozmiar JSON10593797bytes, lock273bytes. Nie uruchomiono workflow historycznego runtime release.

App pin pozostaje osobnym zadaniem właściciela kontraktu. Lokalne robocze kopie dokumentacji w izolowanym app checkout usunięto; kanoniczny raport jest tutaj, a istniejący plan/state aplikacji odsyła do niego. Nie przypięto nowego contentu ani nie zmieniono Q13/Premium/runtime. Rollback źródeł przez zwykły revert własnej zmiany; żadnych resetów cudzych checkoutów.

Niezależny read-only przegląd końcowego raportu i mechanicznych aktualizacji provenance (Luna High) potwierdził wszystkie hashe oraz zachowanie wszystkich dziewięciu statusów/mappingów; bez materialnego zastrzeżenia. Dodatkowy upstream `7ea9da2` zmienia wyłącznie raport publikacji Claude, więc nie unieważnia powyższych wyników.
