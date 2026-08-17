# GCP Associate Cloud Engineer — audyt źródła i plan authoringu

## Zakres i źródło wejściowe

Źródłem planistycznym tej iteracji jest plik `patternly_google-cloud-associate-cloud-engineer_2026-08-15.xlsx` z lokalizacji przekazanej przez właściciela zadania. Plik nie zawiera pytań; zawiera trzy arkusze planowania, taksonomii i cross-checku.

Potwierdzony stan arkusza:

- 20 tematów learner-facing,
- 152 mental blocks,
- planistyczny target 3000 pozycji,
- rozkład sekcji 20% / 30% / 30% / 20%,
- 98 znormalizowanych wymagań oznaczonych jako pokryte,
- 17 aktywności ścieżki Google Skills,
- brak błędów formuł w kontrolowanych zakresach.

Pola `Existing`, `Admitted`, `Blocked`, `Source-ready` oraz liczby z repozytoryjnego evidence nie są używane jako źródło prawdy merytorycznej. Repozytoryczny curriculum i evidence są użyte wyłącznie jako techniczny kontrakt identyfikatorów, trybów, ścieżki pliku i walidacji publikacyjnej.

## Ocena poprawności arkusza

### Co jest poprawne

1. Rozdzielenie czterech domen egzaminu jest zgodne z aktualnym standardowym exam guide Google: 20% setup, 30% planning and implementation, 30% operation, 20% access and security.
2. Redukcja z 34 do 20 tematów jest sensowna jako korekta learner-facing taxonomy: Compute Engine, GKE, Cloud Run, storage, networking i observability są modelami ciągłymi, a nie osobnymi tematami tylko dlatego, że występują w kilku sekcjach egzaminu.
3. Arkusz oddziela oficjalny blueprint od dodatkowego cross-checku szkoleniowego. To dobry kierunek, ale cross-check nie może zastąpić exam guide.
4. Zakres obejmuje główne usługi wskazane w aktualnym blueprintcie: Compute Engine, GKE, Cloud Run, Cloud Run functions, storage/data, networking, observability, IAM i service accounts.

### Co wymaga korekty

1. Arkusz nie jest jeszcze bankiem pytań. Nie można na jego podstawie zatwierdzić unikalności promptów, jakości distractorów, kompletności feedbacku ani poprawności scoring contract.
2. Outline dla compute nie nazywa jawnie trzeciego modelu Cloud Run — worker pool. Aktualna dokumentacja Google rozróżnia service, job i worker pool; worker pool obsługuje ciągłe, pull-based workloady bez endpointu, a job kończy się po wykonaniu zadania. Ten brak został naprawiony w pierwszym batchu pytań.
3. „Coverage complete” oznacza pokrycie listy wymagań, nie poprawność przyszłych pytań. Każdy question-level claim musi mieć własne źródło, mental unit, granicę decyzyjną i feedback.
4. Lista kursów i aktywności jest użyteczna jako kontrola szerokości, ale Google Skills jest katalogiem zmiennym. Oficjalny guide i bezpośrednia dokumentacja produktu mają pierwszeństwo przed nazwą lub kolejnością kursu.
5. W arkuszu `00 Track Summary` kolumna URL jest wizualnie zbyt wąska i łamie adresy pionowo. To problem prezentacji arkusza, nie problem treści; plik wejściowy nie został nadpisany.
6. Target 3000 jest limitem planistycznym, nie powodem do generowania pytań. Pytanie powstaje tylko wtedy, gdy wnosi nowy przypadek, błąd, kontrast lub transfer.

## Oficjalny cross-check

- Aktualny [Associate Cloud Engineer exam guide](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf) jest blueprintem zakresu i wag.
- Oficjalna [strona certyfikacji ACE](https://cloud.google.com/learn/certification/cloud-engineer/) opisuje rolę, konfigurację, implementację, operacje i access/security.
- Oficjalna [ścieżka Associate Cloud Engineer w Google Skills](https://www.skills.google/paths/11) ma obecnie 17 aktywności i jest praktycznym uzupełnieniem blueprintu, nie jego zamiennikiem.
- Oficjalna strona [Google Cloud Infrastructure Training](https://cloud.google.com/learn/training/cloud-infrastructure) potwierdza nacisk na Compute Engine, GKE, logging/monitoring, networking, IAM, Cloud Storage i Terraform.
- Dokumentacja [Choose compute options](https://docs.cloud.google.com/docs/compute-area/choose-compute-options) rozdziela zarządzanie VM/kernel, orkiestrację Kubernetes i managed application runtime.
- Dokumentacja [What is Cloud Run](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run) rozdziela service, job i worker pool.
- [Container runtime contract](https://docs.cloud.google.com/run/docs/container-contract) definiuje port/HTTP dla service, exit code dla job oraz zakres sieci i filesystemu.

## Canonical mental units

Każde pytanie dostaje jeden primary mental unit. Pierwszy batch obejmuje jeden mental unit zgodny z pierwszą jednostką workbooka: `organization, folder, project and resource hierarchy`. Wszystkie 18 pytań rozróżnia parentage, ancestor scope, project ownership, identifiers, organization prerequisites, inheritance, delegation i transfer; nie miesza mechaniki IAM ani semantyki konkretnych constraints Organization Policy.

Drugi zaauthorowany zakres to `cloud_identity_workforce_federation_and_human_access`: siedem canonical blocks i 130 pozycji choice/single. Obejmuje managed users, groups, provisioning, human IAM grants, federation boundaries, Workforce Identity Federation oraz onboarding/offboarding.

Trzeci zaauthorowany zakres to `billing_accounts_budgets_exports_costs_and_visibility`: sześć canonical blocks i 130 pozycji choice/single. Obejmuje billing-account scope, project linkage, separation of duties, budgets, threshold notifications oraz BigQuery billing exports.

Czwarty zaauthorowany zakres to `vpc_topology_shared_networking_and_hybrid_connectivity`: osiem canonical blocks i 150 pozycji choice/single. Obejmuje VPC/subnet design, planowanie CIDR i lokalizacji, Shared VPC, VPC Network Peering, Cloud VPN, Cloud Interconnect, routing/static IP/Cloud DNS/Cloud NAT oraz diagnostykę łączności.

Piąty zaauthorowany zakres to `network_security_load_balancing_and_service_tiers`: osiem canonical blocks i 140 pozycji choice/single. Obejmuje strukturę i ewaluację VPC firewall rules, Cloud NGFW policy hierarchy, source/destination/protocol/port matching, secure tags i service-account targets, lifecycle/troubleshooting, dobór load balancera, Network Service Tiers oraz trade-offy dostarczania ruchu.

Szósty zaauthorowany zakres to `compute_platform_selection_and_accelerator_fit`: siedem canonical blocks i 135 pozycji choice/single. Obejmuje dobór Compute Engine/GKE/Cloud Run, service/job/worker-pool i event-driven fit, Agent Engine, granicę managed-versus-self-managed, stateful/stateless/batch/request signals, GPU-versus-TPU oraz near-miss trade-offs.

Siódmy zaauthorowany zakres to `compute_engine_lifecycle_instances_storage_scaling_and_access`: osiem canonical blocks i 155 pozycji choice/single. Obejmuje uruchamianie VM i dostęp SSH, persistent disk/Hyperdisk, machine types i Spot VMs, instance templates/MIG, autoscaling, OS Login/VM Manager, images/snapshots oraz remote operations i GPU/TPU attachment.

Ósmy zaauthorowany zakres to `gke_clusters_workloads_autoscaling_and_operations`: dziewięć canonical blocks i 165 pozycji choice/single. Obejmuje kubectl i cluster context, Standard versus Autopilot, klastry zonal/regional/private, Artifact Registry access, Pods/Services/StatefulSets, node-pool lifecycle, HPA/VPA, Autopilot resource requests oraz traffic splitting i troubleshooting.

Dziewiąty zaauthorowany zakres to `cloud_run_functions_events_and_release_operations`: osiem canonical blocks i 145 pozycji choice/single. Obejmuje Pub/Sub i Cloud Storage events, Eventarc routing, Cloud Run revisions, traffic splitting, rollback, autoscaling, identity oraz troubleshooting. Batch B01–B08 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

Dziesiąty zaauthorowany zakres to `agent_runtime_notebooks_and_developer_environments`: sześć canonical blocks i 130 pozycji choice/single. Obejmuje Agent Runtime, workload identity, Vertex AI Workbench, BigQuery notebooks, Cloud Workstations oraz deklaratywną konfigurację i troubleshooting. Batch B01–B06 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

Jedenasty zaauthorowany zakres to `storage_products_classes_transfer_lifecycle_and_encryption`: osiem canonical blocks i 140 pozycji choice/single. Obejmuje object-versus-file fit, Storage classes, Filestore/NetApp/Managed Lustre, transfer i loading, availability/durability, lifecycle, retention oraz CMEK. Batch B01–B08 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

Dwunasty zaauthorowany zakres to `database_selection_queries_backup_and_fleet_operations`: osiem canonical blocks i 160 pozycji choice/single. Obejmuje Cloud SQL/AlloyDB, Spanner, Firestore/Bigtable, relacyjne versus non-relational boundaries, BigQuery jobs, backup/restore, Database Center oraz CMEK/operational troubleshooting. Batch B01–B08 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

Trzynasty zaauthorowany zakres to `analytics_streaming_messaging_and_cache_services`: osiem canonical blocks i 140 pozycji choice/single. Obejmuje BigQuery analytical fit, Dataflow batch/stream processing, Pub/Sub delivery and fan-out, Managed Service for Apache Kafka, Memorystore caching, batch versus streaming ingestion, BigQuery job lifecycle oraz near-miss product integration. Batch B01–B08 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

Czternasty zaauthorowany zakres to `infrastructure_as_code_and_ai_assisted_delivery`: siedem canonical blocks i 130 pozycji choice/single. Obejmuje Terraform configuration/state, Config Connector, Helm on GKE, Fabric FAST foundations, Terraform operations, Gemini CLI oraz Application Design Center. Batch B01–B07 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

Piętnasty zaauthorowany zakres to `observability_setup_metrics_alerts_agents_and_prometheus`: siedem canonical blocks i 135 pozycji choice/single. Obejmuje metrics scopes, metric/log/SQL/PromQL alerting, user-defined metrics, dashboards, Ops Agent, Managed Service for Prometheus oraz Gemini Cloud Assist dla monitoringu i troubleshooting. Batch B01–B07 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

Szesnasty zaauthorowany zakres to `logging_audit_exports_analytics_and_routing`: osiem canonical blocks i 150 pozycji choice/single. Obejmuje Cloud Audit Logs, VPC Flow/Firewall Logs, log buckets and retention, log routers/sinks, exports to external systems/BigQuery, Log Analytics, viewing/filtering oraz logging permissions/troubleshooting. Batch B01–B08 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

Siedemnasty zaauthorowany zakres to `diagnostics_service_health_and_resource_optimization`: siedem canonical blocks i 130 pozycji choice/single. Obejmuje Cloud Trace, Cloud Profiler, Query Insights, Index Advisor, Personalized Service Health, Active Assist oraz Cloud Hub. Batch B01–B07 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

Osiemnasty zaauthorowany zakres to `iam_policies_roles_inheritance_and_custom_roles`: osiem canonical blocks i 190 pozycji choice/single. Obejmuje IAM policy structure, principals/roles/bindings, resource hierarchy and inheritance, effective access, basic/predefined roles, custom roles, custom-role lifecycle/support oraz least privilege and IAM troubleshooting. Batch B01–B08 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

Dziewiętnasty zaauthorowany zakres to `service_accounts_permissions_impersonation_and_short_lived_credentials`: dziewięć canonical blocks i 200 pozycji choice/single. Obejmuje user-managed versus Google-managed service accounts, creation/lifecycle, attachment, service-account IAM policy/minimum permissions, Service Account User/actAs, Token Creator, impersonation, short-lived credentials/key avoidance oraz credential troubleshooting. Batch B01–B09 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

Dwudziesty zaauthorowany zakres to `workload_identity_federation_and_gke_workload_identity`: osiem canonical blocks i 190 pozycji choice/single. Obejmuje workload identity pools/providers, external federation, attribute mappings, attribute conditions, federated service-account impersonation, GKE Workload Identity Federation, Kubernetes ServiceAccount mapping oraz trust-boundary troubleshooting. Batch B01–B08 pozostaje `unapproved` po pełnym audycie strukturalnym i semantycznym.

`taxonomy.skillAtomId` pozostaje technicznym identyfikatorem istniejącego kontraktu. Nie dodajemy nowego pola do runtime; definicja primary mental unit jest kontrolowana przez slot, prompt, constraints i audyt semantyczny.

## Zasady authoringu

1. Prompt opisuje jedną główną decyzję i ujawnia wszystkie założenia: rodzaj wejścia, lifetime procesu, HTTP/event/pull, persistence, skalowanie i ograniczenia produktu.
2. Choice ma jeden accepted option przy `single`; distractory są bliskimi, realnymi błędami, nie losowymi produktami.
3. Feedback ma `Reason`, cztery elementy `Details`, pole `url` z bezpośrednim adresem oficjalnej dokumentacji oraz osobne wyjaśnienie każdego wrong option. `transfer` pojawia się, gdy mental unit ma jawny transfer boundary.
4. Complexity lub ordering trafiają do pytania tylko wtedy, gdy istnieje jeden kanoniczny porządek lub jawny parametr analizy. W tym batchu nie używamy tych interaction types.
5. Metadane opisują treść, a nie trudność samą w sobie. Nie dodajemy sztucznie trybów ani etykiet transfer/boundary.
6. `modeEligibility` jest dokładnie dziedziczone ze slotu. Nie rozszerzamy listy o simulation, recognition ani interleaved scopes.
7. Wszystkie nowe batch/item IDs są niezależne od identyfikatorów pozycji w niezmiennym artefakcie historycznym.
8. `feedback.Details.url` musi wskazywać dokładny URL jednego ze źródeł związanych z `sourceBinding`; audyt odrzuca brak URL-a, stronę wyszukiwania albo adres spoza oficjalnych source records.

## Zaauthorowane zakresy

Canonical source: `manual/source/google-cloud-associate-cloud-engineer/organization_projects_policies_services_quotas_and_assets/GCPACE-N01-B01.json`.

Batch `gcp-ace-n01-b01-organization-hierarchy` zawiera 18 pytań choice/single. Każdy item jest związany z jednym slotem `GCPACE-N01-B01`, ma bezpośrednie źródło Google Cloud Resource Manager, pełny feedback dla A–D oraz transfer boundary. Batch pozostaje `unapproved`.

Wszystkie batch'e pozostają `unapproved`. Nie uruchamiają runtime admission, publikacji ani zmian w niezmiennych artefaktach.

N01–N20 obejmują obecnie 152 ręcznie przygotowane batche: N01 136 pozycji, N02 130, N03 130, N04 150, N05 140, N06 135, N07 155, N08 165, N09 145, N10 130, N11 140, N12 160, N13 140, N14 130, N15 135, N16 150, N17 130, N18 190, N19 200 i N20 190. Każdy batch ma dokładne slot/source binding, pełny feedback i bezpośredni URL Google Cloud; przed publikacją wymaga niezależnego review technicznego i redakcyjnego.

## Audyt po każdym batchu

Każdy kolejny batch przechodzi tę samą bramkę:

1. schema i dokładny canonical block path;
2. exact slot/source binding, interaction, scoring i mode closure;
3. unikalność `batchId`, `itemId`, promptów oraz semantyczne porównanie z istniejącym bankiem;
4. fact-check against official exam guide and direct product docs;
5. kontrola jednego mental unit, jawnych constraints i realnych distractorów;
6. kontrola kompletności feedbacku, w tym wrong-option reasoning i transfer boundary;
7. kontrola metadanych, bez wymuszania nowych trybów;
8. kontrola URL-a w każdym `feedback.Details` względem bezpośredniego source record;
9. niezależny QA oraz korekta batcha przed przejściem do następnego zakresu.

Automatyczny audyt jest dostępny jako `npm run audit:gcp:authoring`; porównuje nowe prompty z 360 pozycjami GCP w niezmiennym release baseline i deleguje kontrakt strukturalny do canonical authoring validatora.

## Stan po tej iteracji

GCP authoring audit przechodzi dla 2981 bieżących pozycji źródłowych: 136 w N01, 130 w N02, 130 w N03, 150 w N04, 140 w N05, 135 w N06, 155 w N07, 165 w N08, 145 w N09, 130 w N10, 140 w N11, 160 w N12, 140 w N13, 130 w N14, 135 w N15, 150 w N16, 130 w N17, 190 w N18, 200 w N19 i 190 w N20, w 152 canonical batchach. Każdy item przechodzi schema, exact slot/source binding, interaction, scoring, mode closure, feedback i dedupe validation; wszystkie pozostają `unapproved` i wymagają niezależnego review merytorycznego oraz redakcyjnego przed approval, runtime admission lub publication. Canonical curriculum ma 20 node’ów, 152 mental blocks i 2981 slotów planistycznych; wszystkie sloty są authoring-admitted, a authored source batches obejmują N01–N20. Repo-wide `validate:curricula` pozostaje niezależnie zablokowane na istniejącym `INVALID_CERTIFICATION_SLOT_SOURCE` dla `aws-certified-solutions-architect-associate:principal_and_federation:iam_identity_center_federated_iam_roles_workforce_access_long_lived_iam_users:slot:workforce-sso`; nie jest to błąd GCP authoring audit. Pełny repository-wide test suite nie był częścią tej weryfikacji.

## Bramka runtime i publikacji po audycie authoringu

GCP nie jest jeszcze kandydatem do nowego immutable release. Bieżący commit źródeł nie zawiera `config/tracks/google-cloud-associate-cloud-engineer.json` ani odpowiadającego profilu `config/free-node-experience-profiles/google-cloud-associate-cloud-engineer.json`; historyczne `gcp-ace-0016` nie jest źródłem canonical i nie może być kopiowane do nowej publikacji. Próba walidacji bieżącego tracka kończy się `SOURCE_COMMIT_UNAVAILABLE`, zanim pipeline może wykonać build.

Nie należy dodawać konfiguracji tylko po to, aby przejść ten pierwszy błąd. Aktualny source bank deklaruje 2 981 pozycji, ale jego `modeEligibility` obejmuje wyłącznie `certification-diagnostic-baseline`, `certification-focus-practice`, `certification-weak-area-review`, `certification-mixed-practice`, `certification-exam-simulation` i `certification-quick-review`; nie ma żadnego itemu dla wymaganego przez rodzinę trybu `certification-scenario-practice`. Odtworzenie starego blueprintu scenario z historycznymi identyfikatorami byłoby niezgodne z aktualnym bankiem i ukrywałoby brak authoringu.

Do bezpiecznego cutoveru GCP potrzebne są więc: (1) jawny, aktualny track config i profil Free oparty na bieżącym curriculum oraz briefie, (2) rzeczywista scenariuszowa pula itemów z poprawnym `modeEligibility`, (3) ponowna walidacja, technical evidence i nowy immutable artifact, a dopiero potem (4) package/inventory oraz runtime/publishing admission. Sam owner approval record istnieje dla commit `e73c7314eee7b2cd3f53b04c952b6af6526d3685`, ale nie zastępuje tych kontraktów technicznych.
