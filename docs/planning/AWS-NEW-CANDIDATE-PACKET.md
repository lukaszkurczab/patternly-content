# AWS-01 — dokładny kontrakt nowego kandydata

**Status:** `planned`. Dokument precyzuje pierwszy, odblokowany krok po zgodzie PO z 22 września 2026. Nie jest zgodą na opublikowanie paczki ani wynikiem bramki.

## Cel i wejście

Przygotować odtwarzalny kontrakt nowego dziewięciobankowego kandydata z aktualnym AWS po ODK-096. PO zgodził się użyć poprawionego AWS jako podstawy nowego kandydata. Zgoda nie zmienia historycznego ACC-02, SIMP-03 migration evidence ani wcześniejszych zgód dla innych banków.

Wejścia: kanoniczne `content/manual/source`, bieżący katalog i builder, zgoda na AWS Free node i track zapisana w `evidence/canonical-content-approvals/odk-096-aws-free-node-v1.json`, historyczny manifest w `evidence/content-acceptance/candidate-manifest-v1.json`, aktualne admission/readiness, [diagnoza 09-A](../../reports/model-evaluation/09-a-diagnostic.md) oraz aplikacyjny `integration/contracts/content-release/release.lock.json`.

## Zakres i granice

- Odczytać dokładny source/item hash, liczby, ścieżki i wersje bieżącego AWS; porównać z zatwierdzonymi SHA ODK-096 oraz historycznym ACC-02.
- Zinwentaryzować wszystkie miejsca, które wiążą `candidateId`, release ID, checksum, frontend commit, approval, readiness, runtime/publishing admission i app release lock.
- Zaproponować jeden nowy kontrakt kandydata, wymagane pliki, kolejność migracji i sposób weryfikacji. Rozdzielić historyczne dowody od nowego evidence.
- Ustalić, czy obecny `verify:migration` jest historyczną kontrolą starego baseline'u czy blokadą nowego kandydata; nie zmieniać jego oczekiwań bez jawnego nowego kontraktu.

Poza zakresem tego kroku: zmiana pytań, przepisywanie historycznych evidence, nadanie admission, publikacja artefaktów, aktualizacja aplikacyjnego release lock i uruchomienie model judge'a.

## Kryteria akceptacji

1. Raport podaje dziewięć tracków, dokładne hashe i rozbieżność AWS (+11 mental unitów, +36 pytań) bez ukrywania błędów walidacji.
2. Aktualny AWS odpowiada zakresowi zgody PO; jeśli hash lub treść nie odpowiadają, raport zatrzymuje dalszą pracę i wskazuje różnicę wymagającą nowej decyzji.
3. Mapa konsumentów wskazuje każdy kontrakt do odnowienia i kolejność bez zmiany historycznych rekordów.
4. Następny task budowy kandydata ma wejścia, testy, bramki, wymagane dowody i warunek zatrzymania.

## Weryfikacja, dowód i ryzyka

Uruchomić deterministyczne inventory, walidację kanonicznego schema, porównanie hashy oraz obecny `verify:migration` jako diagnostykę. Raportować rzeczywiste komendy i wyniki, także czerwone; nie przedstawiać starego verifiera jako zielonego. Wymagany raport: `reports/candidate-reconciliation/AWS-01-REPORT.md`, z niezależnym QA przed uruchomieniem budowy kandydata.

Ryzyka: zgoda PO bez exact binding, zależności od starych release ID, rozjazd app lock z contentem i fałszywe przejście bramki przez edycję historycznych dowodów. Każde z nich zatrzymuje admission do czasu udokumentowanego rozwiązania.
