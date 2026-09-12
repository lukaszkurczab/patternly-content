# SIMP-05 — pakiet akceptacyjny

**Status:** `planned`
**Następstwo:** `SIMP-04` `done` → `SIMP-05`
**Repozytoria:** implementacja w `patternly`; usunięcie legacy source/evidence w `patternly-content` dopiero po przejściu migracji i parity

## Cel

Nowe sesje, próby, historia i kolejka powtórek zapisują wyłącznie `trackId`, `questionId`, `contentVersion` i `artifactSha256`. Przy starcie aplikacja wykonuje jedną odporną na przerwanie migrację zapisanych `packagePin`, zachowuje widoczność starej historii i nigdy nie wznawia sesji na innym artefakcie. Po udowodnieniu braku aktywnego konsumenta usuwa pozostały stary system z aplikacji i legacy source/evidence z repozytorium contentu.

## Potwierdzony stan

| Element | Status | Evidence |
| --- | --- | --- |
| Kanoniczne artefakty i runtime | `done` | [SIMP-04](reports/SIMP-04-REPORT.md): 9 / 117 / 932 / 16 041, jeden `Question`, katalog i runtime |
| Nowe zapisy | `partial` | zapisują kanoniczny SHA jako `packagePin.packageIdentity`, ale nadal utrwalają trzyczęściowy `packagePin` i `itemId` |
| Sesje, próby i review | `partial` | współdzielą `ContentItemRef`; guardy i repozytoria wymagają `packagePin` |
| Plany, reminder identity i mutation journal | `partial` | przechowują lub porównują `ContentPackagePin`; muszą wejść do tej samej migracji |
| Migracja backendu storage | `done`, odrębna | `encryptedStorageBootstrap` migruje backend storage; nie migruje modelu content identity |
| Legacy source w content repo | `planned` | celowo zachowane do SIMP-05; brak aktywnego konsumenta po SIMP-04 |
| Graphify | `unknown / needs evidence` | brak aktualnego graph output; orientacja przez importy, modele, guardy, repozytoria i testy |

## Ustalenia kontraktu

1. Jedyną referencją pytania dopuszczoną do runtime jest `ResolvedContentRef = { trackId, questionId, contentVersion, artifactSha256 }`, a `artifactSha256` zawsze jest niepustym SHA-256.
2. Rekord bez dokładnie dostępnego artefaktu nie staje się `ResolvedContentRef`. Migrator zapisuje go jako osobny, jawnie typowany archival tombstone z zachowanymi faktami historii albo jako unavailable-active/review tombstone; tombstone nie zawiera starego `packagePin`, nie implementuje runtime ref i nie może wejść do selection/scoring.
3. Wszystkie nowe zapisy i każdy runtime consumer przyjmują wyłącznie `ResolvedContentRef`. Stany migracyjne są obsługiwane tylko przez read modele historii oraz jawne komendy usunięcia/porzucenia.
4. Dokładne mapowanie jest dozwolone tylko wtedy, gdy `packageIdentity`, `packageVersion` i track odpowiadają jednemu aktywnemu artefaktowi. Sam zgodny `questionId` nie upoważnia do przypisania bieżącego SHA.
5. Zakończona lub porzucona niemapowalna historia pozostaje widoczna jako immutable archival summary z zapisanym wynikiem i identyfikatorami. Lookup szczegółów pytania pokazuje jawny stan unavailable.
6. Niemapowalna aktywna sesja zostaje przeniesiona do osobnego unavailable-session tombstone; zwykły active pointer nie wskazuje rekordu runtime. Bootstrap pokazuje `content_identity_unavailable`, a UI pozwala jawnie usunąć tombstone i kontynuować bez podmiany pytań.
7. Niemapowalny review entry zostaje przeniesiony do osobnego unavailable-review tombstone. Pozostaje widoczny i usuwalny, lecz nigdy nie jest kwalifikowany do nowej sesji.
8. Sesja i wszystkie jej occurrence, attempts, review evidence, result/journal references muszą mieć jeden identyczny `artifactSha256` i `contentVersion`.
9. Migracja lokalna jest idempotentna, restartowalna i wykonywana w quiescent bootstrap przed otwarciem publicznych repozytoriów. Osobny marker wersji identity nie zastępuje markera migracji backendu storage. Cloud nie jest objęty obietnicą globalnej atomowości: używa wersjonowanych, idempotentnych transformacji inbound/outbox i jawnej kompensacji.
10. Po sukcesie guardy i publiczne typy odrzucają `packagePin` oraz `itemId`; stare rekordy są przyjmowane tylko przez prywatny migrator przed ustawieniem markera.
11. Lokalny commit point jest obserwacyjnie atomowy: migrator zapisuje pełny raw backup i staging manifest z digestem, publikuje/werifikuje docelowe envelopes przy zablokowanym bootstrapie, a na końcu zapisuje jeden marker `committed`. Crash przed markerem powoduje deterministyczny rollback z backupu; crash po markerze kończy wyłącznie cleanup. Publiczne repozytoria nie otwierają się w stanie `staging` ani `publishing`.
12. `malformed`, identity-bearing `unsupported`, orphan index entry i duplicate identity blokują migrację przed commit pointem bez zmiany publicznego datasetu. Jawnie allowlistowany rekord niezwiązany z learning identity przechodzi jako passthrough. `unmapped_*` staje się odpowiednim tombstone.
13. Każdy tombstone zachowuje `trackId`, dotychczasowy question/session/review identifier, `contentVersion`, reason, migration version i deterministyczny `legacyIdentityDigest`; nie zachowuje pól starego pinu ani danych umożliwiających runtime lookup.
14. Jawne porzucenie unavailable-active tworzy terminalny archival record i dopiero potem usuwa active tombstone. Jawne usunięcie unavailable-review usuwa wyłącznie ten wpis zgodnie z istniejącą semantyką kolejki; historia nie znika ubocznie.

## Porcje implementacyjne

### 05-0 — inventory i dry-run bez zapisu

**Cel:** udowodnić kompletny zakres przed wyborem granicy transakcji.

**Zakres:** statyczny registry wszystkich kluczy fixed/dynamic oraz pól identity; reader/writer/owner matrix; lokalny scanner surowych envelopes i indeksów; osobny audit account-sync/outbox/materialization oraz backendowego kontraktu rekordów; klasyfikacja `mapped`, `unmapped_unknown_hash`, `unmapped_version`, `malformed`, `orphan`, `duplicate`.

**Poza zakresem:** mutowanie storage, nowe typy domenowe, UI i usunięcia.

**Akceptacja:** dry-run niczego nie zapisuje; wynik ma deterministyczne counts/digest i pełną listę keys/reasons; każdy klucz namespace jest sklasyfikowany albo jawnie unsupported; repo evidence rozstrzyga, czy cloud wymaga zmiany backendu.

### 05-A — docelowy kontrakt i prywatny decoder legacy

**Cel:** wprowadzić jeden model identity oraz funkcje walidacji/mapowania bez zapisu.

**Zakres:** `ResolvedContentRef`, equality/key helpers, prywatny decoder starego ref/pin, mapowanie do aktywnego katalogu oraz odrębne immutable archival/unavailable tombstones.

**Poza zakresem:** mutowanie storage, UI, usuwanie plików legacy.

**Akceptacja:** runtime constructor nie przyjmuje `packagePin`/`itemId` ani nullable SHA; mapper wymaga exact track/version/hash; obcy/stary pin daje tombstone, nigdy resolved ref; testy obejmują 9 aktywnych artefaktów, zmieniony hash/version/track, malformed/dodatkowe pola i idempotencję.

### 05-B — atomowy migrator trwałych rekordów

**Cel:** jednorazowo przekształcić cały lokalny zbiór danych bez częściowo opublikowanego stanu.

**Zakres:** wyłącznie lokalny namespace: sessions i active pointer, drafts, attempts, review queue, learning plans, reminder identity/journal, mutation journal oraz lokalny account-sync/outbox/materialization state; marker, startup quiesce, raw snapshot, staging record, digest/count/invariant verification, publish/rollback/recovery.

**Poza zakresem:** backend storage migration, sieć, zmiana treści.

**Akceptacja:** migracja pełnego lokalnego snapshotu jest idempotentna; rozpoczyna się przed publicznymi readerami/writerami; awaria każdego etapu pozostawia odtwarzalny stary snapshot albo cały zweryfikowany nowy komplet; restart kończy/rollbackuje bez duplikacji; indeksy i rewizje pozostają spójne; uszkodzony/orphan/duplicate rekord failuje jawnie bez ustawienia markera.

### 05-B2 — wersjonowana migracja cloud/account-sync

**Cel:** nowe i stare rekordy z konta nie odtwarzają legacy identity po lokalnym cutoverze.

**Zakres:** aktualny protocol/account data contract, stored outbox/syncPlan/materialization, inbound remote records, fingerprint/mutation identity oraz — tylko jeśli potwierdzi inventory — minimalna zgodna zmiana backendu.

**Poza zakresem:** obietnica transakcji obejmującej urządzenie i sieć; automatyczne przypisanie bieżącego SHA.

**Akceptacja:** transformacje są wersjonowane i idempotentne; stary client payload nie może nadpisać resolved identity bez konfliktu; retry nie dubluje mutacji; offline outbox po restarcie zachowuje identity; inbound legacy staje się resolved exact-match albo tombstone; kompensacja błędu jest jawna i testowana.

### 05-C — zapis i runtime wyłącznie na nowej identity

**Cel:** przepiąć domenę, repozytoria, lifecycle, read modele i sync na `questionId/contentVersion/artifactSha256`.

**Zakres:** wszystkie create/save/read/compare/key/fingerprint paths; canonical runtime; review selection; history/details; notification identity; cloud account records.

**Poza zakresem:** zmiana pytań i zachowania trybów.

**Akceptacja:** żaden nowy zapis nie może zawierać `packagePin`/`itemId`; canonical runtime wymaga exact SHA i nie zna tombstones; unavailable records nie kwalifikują się do resume/review; historia pozostaje widoczna; brak fallbacku; testy round-trip, backup/restore/export i ścieżek UI.

### 05-D — jawny UX niemapowalnej aktywnej sesji i review

**Cel:** użytkownik rozumie, dlaczego starej sesji/review nie można otworzyć i może bezpiecznie kontynuować.

**Zakres:** typowany failure, resume surface, jawne porzucenie sesji, unavailable review/details, copy PL/EN i selektory testowe.

**Poza zakresem:** automatyczna zamiana artefaktu lub ukryte usunięcie historii.

**Akceptacja:** brak crash/fake success; usunięcie unavailable-active tombstone jest świadomą operacją; po nim można rozpocząć nową sesję; historia i wynik nadal są widoczne; unavailable-review jest widoczny i usuwalny.

### 05-E — usunięcie starego systemu i finalne evidence

**Cel:** po parity usunąć wszystkie pozostałe stare schematy, buildery, typy, manifesty, evidence i testy bez aktywnego właściciela.

**Zakres:** nieaktywne `ContentPackagePin`, legacy package/published-bank contracts i rodzinne question/catalog/scoring/validation paths w aplikacji; legacy source/evidence wskazane przez aktualny ref audit w `patternly-content`; barrel exports, skrypty i docs.

**Poza zakresem:** kanoniczne pytania, zamrożona taksonomia, EPIC-09.

**Akceptacja:** `rg` i test granicy potwierdzają brak `packagePin`, `ContentPackagePin`, `itemId` jako identity pytania, rodzinnych question/runtime catalogs i legacy content source; dokładny inwentarz/hashes są niezmienne; wszystkie owning gates i eksport przechodzą.

## Kryteria akceptacji całości

1. Wszystkie nowe learning records używają dokładnie `trackId`, `questionId`, `contentVersion`, `artifactSha256`; SHA odpowiada aktywnemu artefaktowi.
2. Inventory/dry-run klasyfikuje każdy klucz i payload; lokalny migrator jest idempotentny, restartowalny i fail-closed, a cloud transformacje są osobno wersjonowane i retry-safe.
3. Mapowalna historia i review wskazują te same pytania; niezmienione są session/attempt/review IDs, wyniki, timestamps, kolejność i rewizje.
4. Niemapowalna zakończona historia pozostaje widoczna jako archival record; active/review tombstones pokazują unavailable bez wejścia do runtime i bez fallbacku.
5. Po ustawieniu markera publiczne guardy odrzucają stare pola i mieszane rekordy.
6. Nie istnieją dwa aktywne formaty, legacy resolver ani lookup po starym pinie.
7. Pozostały stary system i nieużywane legacy source/evidence zostały usunięte po sprawdzeniu referencji.
8. Inwentarz pozostaje 9 / 117 / 932 / 16 041, a SHA każdego artefaktu nie zmienia się.
9. `npm run typecheck`, pełny `npm test`, migration failure matrix, content boundary/parity, recovery i eksport iOS przechodzą.
10. Niezależne finalne QA nie ma otwartych findings; raport `docs/planning/reports/SIMP-05-REPORT.md` oraz plany wskazują następny task programu.

## Ryzyka i stop conditions

- Niejawna zmiana SHA starego rekordu na bieżący jest utratą provenance i zatrzymuje implementację.
- Częściowa publikacja migracji albo marker ustawiony przed weryfikacją całego snapshotu zatrzymuje implementację.
- Jeśli cloud account schema wymaga zmiany backendu, najpierw trzeba udowodnić zakres i przygotować osobną zgodną porcję; nie wolno ukryć konfliktu w lokalnym adapterze.
- Jeśli widoczność niemapowalnej historii wymaga zachowania rodzinnego pytania lub starego blobu, historia zachowuje tylko zapisane fakty, a szczegóły contentu są unavailable.
- Jakakolwiek zmiana kanonicznych pytań, IDs, counts lub hashy zatrzymuje cutover.

## Ocena podejścia przed niezależną walidacją

| Kryterium | Wynik | Uzasadnienie |
| --- | ---: | --- |
| Zgodność/architektura | 0,94 | Ścisły runtime ref i osobne tombstones usuwają niejednoznaczność provenance. |
| Prostota | 0,82 | Inventory i rozdzielenie local/cloud ograniczają mechanizmy do koniecznych granic. |
| Ryzyko | 0,86 | Quiescent bootstrap, backup, commit point, rollback, failure matrix i cloud retry kontrolują utratę danych. |
| Utrzymywalność | 0,89 | Po migracji runtime zna jeden format, a stany archival mają osobny jawny kontrakt. |

Minimum: **0,82**. Niezależna walidacja briefingowa Luna/max: **APPROVE** po redesignie; pierwszy wariant z nullable SHA został odrzucony wynikiem 0,61. Warunki walidatora — jawny commit point, wyniki klas dry-run, audit digest tombstones, retencja przy abandon/remove oraz pełne 05-0 — są częścią ustaleń i kryteriów powyżej.

## Wymagane evidence

- inwentarz wszystkich trwałych kluczy/payloadów, readerów/writerów i cloud ownership przed i po migracji;
- tabela mapowalnych i niemapowalnych fixtures oraz exact before/after;
- failure-injection matrix dla quiesce, snapshot, staging, verify, publish, marker, rollback, restart, cloud retry i konfliktu starego klienta;
- dowód widoczności starej historii oraz jawnego unavailable active/review;
- `rg` usuniętych kontraktów i lista fizycznie usuniętych ścieżek;
- parity 9 / 117 / 932 / 16 041 i niezmienione SHA;
- pełne wyniki gate'ów, eksport i niezależne QA.
