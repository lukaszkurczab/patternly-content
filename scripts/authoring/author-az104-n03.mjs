import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildManifest, ROOT } from "./lib/model.mjs";

const TRACK = "microsoft-azure-administrator-associate-az-104";
const NODE = "azure_storage_account_architecture_redundancy_and_data_movement";
const CREATED_AT = "2026-08-16T00:00:00Z";
const curriculumPath = join(ROOT, "config/curricula", `${TRACK}.json`);
const anchorsPath = join(ROOT, "evidence/curriculum", `${TRACK}-source-anchors.json`);

const sourceSpecs = [
  ["storage-account-overview", "Storage account overview", "https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview", "choose-current-storage-account-kind-and-endpoint", "Account kind, performance tier, enabled capabilities, and service endpoint must all support the workload.", "Re-evaluate the account boundary when the required service, protocol, namespace, or performance tier changes."],
  ["storage-account-create", "Create a storage account", "https://learn.microsoft.com/en-us/azure/storage/common/storage-account-create", "create-storage-account-with-supported-settings", "Creation-time settings include region, account kind, performance, redundancy, namespace, networking, and encryption choices.", "Validate regional and feature support before encoding the same creation choice in automation."],
  ["storage-redundancy", "Azure Storage redundancy", "https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy", "select-storage-redundancy-for-failure-boundary", "LRS, ZRS, GRS, RA-GRS, GZRS, and RA-GZRS protect against different failure scopes and expose different read behavior.", "Choose redundancy from the required failure boundary, read availability, regional support, and cost rather than copy count alone."],
  ["storage-redundancy-migration", "Change how a storage account is replicated", "https://learn.microsoft.com/en-us/azure/storage/common/redundancy-migration", "change-storage-redundancy-safely", "A redundancy change can be a direct configuration change or a support-requested conversion, depending on the source, target, region, and account.", "Check the current support matrix and conversion state before promising a migration path or completion time."],
  ["storage-failover", "Disaster recovery and storage account failover", "https://learn.microsoft.com/en-us/azure/storage/common/storage-disaster-recovery-guidance", "plan-storage-account-failover", "Geo replication is asynchronous, so unplanned account failover can lose writes that have not reached the secondary.", "Use account failover for regional recovery, not routine data migration, and validate service-specific limitations first."],
  ["storage-failover-initiate", "Initiate a storage account failover", "https://learn.microsoft.com/en-us/azure/storage/common/storage-initiate-account-failover", "initiate-and-verify-storage-failover", "Failover promotes the secondary through DNS changes; unplanned failover leaves the new primary locally redundant until geo redundancy is re-enabled.", "A planned failover requires both regions to be available, while an unplanned failover accepts a possible data-loss window."],
  ["storage-last-sync-time", "Check the Last Sync Time property", "https://learn.microsoft.com/en-us/azure/storage/common/last-sync-time-get", "interpret-geo-replication-last-sync-time", "Last Sync Time is the latest time before which writes are guaranteed to be present in the secondary region.", "Treat it as a recovery-point boundary, not as proof that later writes are absent or that the secondary is writable."],
  ["blob-object-replication", "Object replication overview", "https://learn.microsoft.com/en-us/azure/storage/blobs/object-replication-overview", "design-block-blob-object-replication", "Object replication asynchronously copies supported block blobs according to policy rules and depends on versioning and change feed.", "It is object-level asynchronous replication, not storage-account failover or a synchronous write guarantee."],
  ["blob-object-replication-configure", "Configure object replication", "https://learn.microsoft.com/en-us/azure/storage/blobs/object-replication-configure", "configure-and-troubleshoot-object-replication", "A policy binds existing source and destination containers; versioning is required on both accounts and change feed on the source.", "Confirm account, namespace, tenant, blob type, prefix, and creation-time boundaries before relying on a rule."],
  ["storage-encryption", "Azure Storage encryption for data at rest", "https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption", "select-storage-encryption-key-model", "Azure Storage encrypts data at rest by default; the key model changes who controls keys and rotation, not whether encryption occurs.", "Separate service-side encryption, customer-provided request keys, encryption scopes, and client-side encryption when transferring the model."],
  ["storage-cmk", "Customer-managed keys for account encryption", "https://learn.microsoft.com/en-us/azure/storage/common/customer-managed-keys-overview", "operate-storage-customer-managed-keys", "Customer-managed keys require a supported Key Vault or Managed HSM key, managed identity authorization, and recoverability protections.", "The storage service must retain access to an enabled key; revocation is an availability-impacting security action."],
  ["storage-cmk-existing", "Configure customer-managed keys for an existing storage account", "https://learn.microsoft.com/en-us/azure/storage/common/customer-managed-keys-configure-existing-account", "configure-cmk-on-existing-storage-account", "For an existing account, authorize a system- or user-assigned managed identity to the key and then configure the key URI or vault selection.", "When selecting a key version, decide deliberately whether rotation should follow new versions automatically."],
  ["storage-infrastructure-encryption", "Create a storage account with infrastructure encryption", "https://learn.microsoft.com/en-us/azure/storage/common/infrastructure-encryption-enable", "enable-double-encryption-at-account-creation", "Infrastructure encryption adds a second service-layer encryption pass and must be enabled when the storage account is created.", "Use it only for an explicit double-encryption requirement; customer-managed keys solve a different key-control requirement."],
  ["azcopy-overview", "Get started with AzCopy", "https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-v10", "select-azcopy-command-and-transfer-model", "AzCopy v10 provides copy, sync, list, remove, login, and resumable job commands for supported storage endpoints.", "Select copy for transfer and sync only when one-way destination reconciliation semantics are intended."],
  ["azcopy-auth", "Authorize AzCopy with a user identity", "https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-authorize-user-identity", "authorize-azcopy-with-entra-id", "AzCopy authentication supplies an identity, while Azure RBAC and Data Lake ACLs determine the allowed data operations.", "A successful login does not prove source read, destination write, firewall, or hierarchical namespace ACL access."],
  ["azcopy-sync", "Synchronize with Blob Storage by using AzCopy", "https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-blobs-synchronize", "synchronize-blob-data-with-azcopy", "AzCopy sync compares a source with a destination in one direction and can delete destination objects when explicitly requested.", "Use copy for append-only migration; use sync when destination reconciliation and deletion behavior have been reviewed."],
  ["azcopy-troubleshoot", "Troubleshoot AzCopy v10", "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/blobs/connectivity/storage-use-azcopy-troubleshoot", "diagnose-azcopy-transfer-failure", "Exit codes, transfer status, and logs distinguish authentication, authorization, network, throttling, and path failures.", "Repair the evidenced cause and resume the saved job instead of starting an unbounded duplicate transfer."],
  ["storage-explorer", "Get started with Storage Explorer", "https://learn.microsoft.com/en-us/azure/storage/storage-explorer/vs-azure-tools-storage-manage-with-storage-explorer", "connect-and-operate-with-storage-explorer", "Storage Explorer can sign in to subscriptions or attach a specific resource with Entra ID, account keys, SAS, or anonymous access where supported.", "Choose the narrowest attachment and credential that grants the required data operation without exposing an account-wide secret."],
  ["storage-explorer-blobs", "Manage Blob Storage resources with Storage Explorer", "https://learn.microsoft.com/en-us/azure/storage/storage-explorer/vs-azure-tools-storage-explorer-blobs", "operate-blob-data-with-storage-explorer", "Storage Explorer provides interactive container and blob operations while the service still enforces network and data-plane authorization.", "Use a scripted transfer for repeatability or scale; use the explorer when interactive inspection and a bounded operation are the objective."],
  ["storage-explorer-troubleshoot", "Storage Explorer troubleshooting guide", "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/blobs/alerts/storage-explorer-troubleshooting", "diagnose-storage-explorer-access-and-transfer", "Storage Explorer account, network, proxy, certificate, and AzCopy logs expose different failure layers.", "Reproduce and inspect the layer-specific log before rotating credentials or weakening the storage firewall."],
  ["storage-migration", "Azure Storage migration overview", "https://learn.microsoft.com/en-us/azure/storage/common/storage-migration-overview", "plan-storage-data-migration", "Storage migration must account for data volume, bandwidth, downtime, change rate, validation, and the target account's feature support.", "Choose online or offline movement from the transfer window and keep a source-of-truth and rollback boundary until validation completes."],
].map(([sourceId, title, url, authority, boundary, transfer]) => ({ sourceId, provider: "Microsoft", sourceType: "direct_first_party_product_documentation", title, url, checkedDate: "2026-08-16", sourceVolatility: "high", versionContext: "current Microsoft Learn documentation checked for AZ104-N03 authoring", resolutionState: "resolved_exact_first_party", authoritativeFor: [authority], propertyAuthorityBasis: "manual_slot_property_review_2026_08_16", boundary, transfer }));

const sourceById = new Map(sourceSpecs.map((source) => [source.sourceId, source]));
const W = (text, why) => ({ text, why });
const distractors = {
  B01: [
    W("Use a premium FileStorage account for every service.", "FileStorage is specialized for premium Azure Files and does not provide a general mixed-service account."),
    W("Enable hierarchical namespace after the account is in production.", "Hierarchical namespace is a capability with creation and feature-support constraints, not a cosmetic toggle."),
    W("Use the file endpoint for block blobs.", "Block blobs use the blob endpoint; the file endpoint serves Azure Files."),
    W("Select a legacy general-purpose v1 account for a new design.", "General-purpose v2 is the current default for most new mixed-service workloads."),
    W("Treat the access tier as the storage account performance tier.", "Blob access tier and standard-versus-premium performance are different decisions."),
    W("Create the account with a globally duplicated name.", "Storage account names must be globally unique and conform to the documented naming rules."),
    W("Choose a region without checking requested feature support.", "Account features and redundancy combinations are region- and service-dependent."),
    W("Use a private endpoint to change the account kind.", "Private endpoints change network reachability, not the storage account kind or supported services."),
  ],
  B02: [
    W("Choose LRS for protection from a complete regional outage.", "LRS keeps copies in one datacenter region boundary and does not create a secondary region."),
    W("Choose ZRS to obtain a readable paired-region endpoint.", "ZRS distributes across zones in one region and has no geo-secondary endpoint."),
    W("Choose GRS when applications must read the secondary before failover.", "Read access before failover requires RA-GRS or RA-GZRS."),
    W("Choose RA-GRS to make writes synchronous across regions.", "Geo replication remains asynchronous even when secondary read access is enabled."),
    W("Choose GZRS without checking regional support.", "GZRS availability and supported services depend on the region and account configuration."),
    W("Treat durability percentage as the application availability SLA.", "Durability and request availability measure different outcomes."),
    W("Change redundancy during an outage without checking conversion state.", "Redundancy changes have supported paths, conversion state, and regional constraints."),
    W("Select redundancy from cost alone.", "The required zone, region, read, and recovery boundary is the primary design input."),
  ],
  B03: [
    W("Assume every write after Last Sync Time is already on the secondary.", "Writes after Last Sync Time are not guaranteed to have reached the secondary."),
    W("Use the secondary endpoint for writes before failover.", "The geo-secondary is read-only when read access is enabled."),
    W("Expect the storage account URL in application configuration to change after failover.", "Primary service hostnames remain stable while DNS is updated to the promoted region."),
    W("Expect unplanned failover to retain GRS immediately.", "Unplanned failover produces an LRS account in the promoted region until geo redundancy is re-enabled."),
    W("Use account failover as a bulk migration method.", "Failover is a disaster-recovery operation, not a general migration path."),
    W("Initiate planned failover while the primary region is unavailable.", "Planned failover needs both regions available so replication can complete."),
    W("Interpret Last Sync Time as the newest object timestamp.", "It is a geo-replication guarantee boundary, not an object inventory timestamp."),
    W("Ignore Azure Files client activity during failover.", "File activity must be stopped as documented to avoid inconsistent shares."),
  ],
  B04: [
    W("Enable versioning only on the source account.", "Object replication requires blob versioning on both source and destination accounts."),
    W("Enable change feed only on the destination account.", "Change feed is required on the source account so changes can be discovered."),
    W("Replicate page blobs with an object replication rule.", "Object replication supports block blobs, not page or append blobs."),
    W("Use object replication on a hierarchical namespace account.", "Object replication is not supported when hierarchical namespace is enabled."),
    W("Write directly to the destination container while the policy is active.", "Writes to a destination container governed by a replication policy are rejected."),
    W("Assume all preexisting blobs replicate under the default scope.", "The default policy scope covers new objects unless an existing-object or time scope is configured."),
    W("Use a suffix filter to select objects.", "Replication rules support documented prefix filters, not arbitrary suffix matching."),
    W("Treat replication completion as synchronous with the source write.", "Object replication is asynchronous and status must be checked."),
  ],
  B05: [
    W("Disable Azure Storage encryption to reduce latency.", "Storage encryption is always enabled and cannot be disabled."),
    W("Use customer-managed keys only to turn encryption on.", "Data is already encrypted with Microsoft-managed keys by default."),
    W("Delete the Key Vault key immediately after configuration.", "Storage needs continued access to an enabled key; deletion can make data unavailable."),
    W("Grant the storage account Contributor on the Key Vault resource.", "The managed identity needs the documented cryptographic key permissions or Key Vault role, not generic resource management alone."),
    W("Enable infrastructure encryption after account creation.", "Infrastructure encryption is selected at account creation."),
    W("Assume queues and tables always adopt CMK automatically.", "Queue and Table protection by the account CMK requires the account encryption-key option selected at creation."),
    W("Use an expiring SAS to authorize Key Vault key access.", "Storage uses a managed identity to access the customer-managed key."),
    W("Rotate the key by changing the storage account access keys.", "Storage access keys authorize requests and are unrelated to the encryption key version."),
  ],
  B06: [
    W("Run azcopy sync for every one-time append-only upload.", "Copy is safer when destination deletion or reconciliation is not intended."),
    W("Use azcopy login as proof that the data operation is authorized.", "Login authenticates the identity; RBAC, ACL, and network rules still govern the transfer."),
    W("Restart every failed job from the beginning.", "AzCopy job plan files support diagnosis and resume without duplicating completed work."),
    W("Place a SAS token unquoted in a shell command.", "SAS query characters can be interpreted by the shell and the credential can leak through history."),
    W("Use --recursive=false to copy a directory tree.", "A directory-tree transfer requires recursive traversal."),
    W("Treat a 403 as proof that the path does not exist.", "403 indicates an authentication, authorization, ACL, or network denial; missing paths normally produce a different signal."),
    W("Use sync between Azure Files and Blob Storage.", "AzCopy sync supports the documented Blob synchronization endpoints, not every service pairing."),
    W("Delete the job plan before inspecting a failure.", "The plan and log files are the evidence needed to diagnose and resume the job."),
  ],
  B07: [
    W("Share an account key for a read-only container inspection.", "An account key is broader than a resource-scoped SAS or Entra data role."),
    W("Assume subscription sign-in grants blob data access.", "Management discovery and data-plane authorization are separate."),
    W("Disable the storage firewall when Storage Explorer receives 403.", "The failure must be separated into identity, permission, ACL, and network causes before changing the firewall."),
    W("Attach a file share by using an anonymous connection.", "Azure Files does not support anonymous attachment in Storage Explorer."),
    W("Use the portal activity log to inspect blob contents.", "Activity Log records control-plane events and does not provide a data browser."),
    W("Use Storage Explorer for a repeatable multi-terabyte migration runbook.", "A scripted transfer tool provides resumability and reproducible command evidence at migration scale."),
    W("Regenerate both account keys before checking a bad SAS.", "Rotating account keys has broad impact and is not the first diagnostic step for a scoped token."),
    W("Treat a successful attachment as proof that upload is allowed.", "Listing, reading, and writing can require different data permissions and network paths."),
  ],
  B08: [
    W("Perform an unplanned account failover as the migration cutover.", "Failover is a regional recovery mechanism and can lose unsynchronized data."),
    W("Enable hierarchical namespace on the existing source after copying data.", "Namespace selection has account-creation and feature-compatibility consequences that belong in target design."),
    W("Move data before validating the target account kind and features.", "An incompatible target can invalidate protocol, replication, encryption, or application assumptions."),
    W("Use object replication for a page-blob estate.", "Object replication supports block blobs only."),
    W("Use AzCopy sync with deletion enabled during the first migration pass.", "Deletion reconciliation before source and target validation can remove required destination data."),
    W("Cut over DNS before a final delta and validation.", "Cutover should follow bulk copy, delta handling, integrity validation, and readiness approval."),
    W("Retire the source immediately after the first successful copy.", "A rollback and evidence window is needed until target correctness and application behavior are confirmed."),
    W("Assume CMK configuration transfers with copied objects.", "Encryption-key configuration belongs to the target storage account and must be configured separately."),
  ],
};

const F = (source, prompt, correct, reason, wrongIds, boundary, transfer) => {
  const blockKey = `B${prompt.match(/^\[(\d+)\]/)?.[1]}`;
  const wrongs = wrongIds.map((id) => distractors[blockKey][id]);
  return { source, prompt: prompt.replace(/^\[\d+\]\s*/, ""), correct, reason, wrongs, boundary: boundary ?? sourceById.get(source).boundary, transfer: transfer ?? sourceById.get(source).transfer };
};

const blocks = {
  "AZ104-N03-B01": [
    F("storage-account-overview", "[01] A new application needs Blob, Queue, and Table services in one standard account. Which account kind should the administrator select?", "Create a general-purpose v2 StorageV2 account.", "StorageV2 is the current general-purpose account kind for mixed Azure Storage services.", [0,3,7]),
    F("storage-account-overview", "[01] A low-latency workload stores only block blobs and requires premium block-blob performance. Which account type fits?", "Create a premium BlockBlobStorage account.", "BlockBlobStorage is the specialized premium account type for block blob workloads.", [0,3,4]),
    F("storage-account-overview", "[01] A workload requires premium SMB file shares. Which specialized account should be created?", "Create a premium FileStorage account.", "FileStorage is the premium account type designed for Azure Files.", [2,3,4]),
    F("storage-account-create", "[01] Analytics clients require directory semantics and POSIX-style ACLs in Data Lake Storage. What creation choice is required?", "Create a StorageV2 account with hierarchical namespace enabled after checking feature compatibility.", "Hierarchical namespace supplies the Data Lake directory and ACL model and must be part of account design.", [1,3,7]),
    F("storage-account-overview", "[01] An application must send messages to Azure Queue Storage. Which endpoint should it use?", "Use the account's queue service endpoint.", "Each storage service exposes its own endpoint; Queue requests belong on the queue endpoint.", [2,4,7]),
    F("storage-account-overview", "[01] An application must mount a managed SMB share. Which service endpoint is correct?", "Use the account's file service endpoint.", "Azure Files data is served through the file endpoint rather than the blob endpoint.", [2,4,7]),
    F("storage-account-create", "[01] A naming check rejects `Finance_Data_01`. What should the administrator change?", "Choose a globally unique 3-24 character name containing only lowercase letters and numbers.", "Storage account DNS names follow a global uniqueness and restricted-character contract.", [3,5,7]),
    F("storage-account-create", "[01] A design needs ZRS and hierarchical namespace in a chosen region. What should happen before deployment?", "Confirm that the region and requested account capabilities support the combination.", "Feature and redundancy support must be validated for the target region before creation.", [1,6,7]),
    F("storage-account-overview", "[01] A new general-purpose account stores frequently accessed blobs but also exposes queues. Which tier decisions are distinct?", "Select the standard performance tier for the account and choose the blob access tier separately.", "Account performance and Blob hot/cool/cold access are independent configuration dimensions.", [0,4,7]),
    F("storage-account-create", "[01] Which sequence creates a storage account without encoding an unsupported design?", "Validate name and regional feature support, choose kind/performance/redundancy and security settings, create the account, then verify endpoints and effective configuration.", "Preflight precedes creation, and endpoint/effective-state validation follows it.", [5,6,7]),
    F("storage-account-create", "[01] Which sequence enables a Data Lake Storage Gen2 account safely?", "Inventory required Blob features, confirm hierarchical-namespace compatibility, create StorageV2 with the namespace enabled, then configure authorization and test directory operations.", "Namespace compatibility and data authorization are both required for the intended directory behavior.", [1,3,7]),
    F("storage-account-create", "[01] Which sequence provisions a premium Azure Files target?", "Confirm FileStorage regional and redundancy support, create a premium FileStorage account, create the share, then test the required protocol and permissions.", "The specialized account and share must both match the protocol, region, and performance requirement.", [0,4,6]),
    F("storage-account-overview", "[01] A client sends blob REST requests to the table endpoint and receives resource errors. What is the root cause?", "The client is using the wrong service endpoint; change it to the blob endpoint.", "Storage service endpoints are not interchangeable even when they share one account name.", [2,7,4]),
    F("storage-account-create", "[01] Portal creation says the storage account name is unavailable although no account exists in the resource group. Why?", "The name is already taken in the global Azure Storage namespace.", "Uniqueness is global, so resource-group inspection cannot prove name availability.", [5,6,7]),
    F("storage-account-overview", "[01] A team chose FileStorage, then discovers it also needs Queue Storage in the same account. What must change?", "Create a general-purpose v2 account for the mixed-service requirement and plan data movement as needed.", "FileStorage is specialized; it does not become a general-purpose multi-service account.", [0,3,7]),
    F("storage-account-create", "[01] Which Azure CLI command shape creates a standard general-purpose v2 account?", "Use `az storage account create` with the resource group, name, location, `--kind StorageV2`, and an appropriate standard SKU.", "The storage account create command makes account kind and SKU explicit and validates them through Resource Manager.", [0,3,5]),
    F("storage-account-overview", "[01] What is the boundary between premium account type and Blob access tier?", "Premium account type controls the performance model; hot, cool, cold, or archive controls Blob access economics and availability characteristics.", "Performance tier and access tier solve different requirements and cannot substitute for one another.", [0,4,7]),
    F("storage-account-overview", "[01] What is the boundary between Blob Storage and Azure Files endpoints?", "The blob endpoint serves object/container APIs; the file endpoint serves Azure Files share and file protocols.", "Selecting a service endpoint is an API and protocol decision, not a naming preference.", [2,0,7]),
    F("storage-account-overview", "[01] What is the boundary between StorageV2 and a specialized premium account?", "StorageV2 supports general-purpose services; specialized premium accounts trade service breadth for a service-specific premium performance model.", "Choose specialization only when the workload matches the supported service and performance contract.", [0,3,4]),
    F("storage-account-create", "[01] What is the boundary between a creation-time capability and a later operational setting?", "Treat hierarchical namespace and infrastructure encryption as creation design inputs, while settings documented as mutable can be changed only through supported paths.", "A deployment plan must distinguish immutable or conversion-bound choices from ordinary updates.", [1,6,7]),
  ],
  "AZ104-N03-B02": [
    F("storage-redundancy", "[02] A disposable cache needs the lowest-cost local replication and can tolerate loss of one datacenter. Which redundancy option fits?", "Choose locally redundant storage (LRS).", "LRS keeps three synchronous copies within one primary-region datacenter boundary.", [1,2,7]),
    F("storage-redundancy", "[02] A workload must remain durable if one availability zone fails but needs no paired-region copy. Which option fits?", "Choose zone-redundant storage (ZRS).", "ZRS synchronously distributes copies across availability zones in the primary region.", [0,2,7]),
    F("storage-redundancy", "[02] A workload needs a secondary-region copy but must not read it before failover. Which option fits?", "Choose geo-redundant storage (GRS).", "GRS adds asynchronous replication to a secondary region without exposing a readable secondary endpoint.", [1,2,3]),
    F("storage-redundancy", "[02] Reports may read stale data from the paired region during a primary outage before failover. Which option fits?", "Choose read-access geo-redundant storage (RA-GRS).", "RA-GRS exposes the asynchronous geo-secondary for read operations.", [0,1,3]),
    F("storage-redundancy", "[02] A critical account needs zone protection in the primary and a secondary-region copy. Which option fits?", "Choose geo-zone-redundant storage (GZRS).", "GZRS combines synchronous zone replication in the primary with asynchronous replication to a secondary region.", [0,1,4]),
    F("storage-redundancy", "[02] A critical account needs primary-zone resilience and readable secondary-region data before failover. Which option fits?", "Choose read-access geo-zone-redundant storage (RA-GZRS).", "RA-GZRS adds secondary read access to the GZRS protection model.", [1,2,4]),
    F("storage-redundancy", "[02] A database export requires zone-failure durability but reads must remain in-region for residency. Which option fits?", "Choose ZRS in a supported region.", "ZRS protects across zones while retaining the data within the primary region.", [0,2,4]),
    F("storage-redundancy", "[02] A compliance rule requires a remote copy but forbids clients from reading the secondary. Which option is appropriate?", "Choose GRS or GZRS according to the primary-region zone requirement, without the RA variant.", "The non-RA geo options maintain a secondary copy without exposing routine secondary reads.", [1,2,3]),
    F("storage-redundancy", "[02] A web application needs reads during a regional incident but accepts eventual consistency. What feature is essential?", "Select an RA geo-redundancy option and implement client logic for the secondary read endpoint.", "The RA option makes the secondary readable; the application must deliberately use that endpoint and tolerate lag.", [1,2,5]),
    F("storage-redundancy", "[02] A team claims ZRS and GRS provide the same outage protection because both keep multiple copies. How should the design be corrected?", "Choose ZRS for zone failure in one region and GRS for an asynchronous paired-region copy; use GZRS when both boundaries are required.", "The placement of copies, not just their count, determines the protected failure scope.", [0,3,5]),
    F("storage-redundancy-migration", "[02] Which sequence safely changes an LRS account toward ZRS?", "Verify the account, region, and target path are supported, request or apply the documented change, monitor conversion state, then validate the resulting SKU.", "A supported-path precheck and completion verification prevent false assumptions about in-progress conversion.", [4,6,7]),
    F("storage-redundancy-migration", "[02] Which sequence adds secondary read access to an existing GRS account?", "Verify workload tolerance for eventual consistency, change GRS to RA-GRS through the supported configuration path, then test reads against the secondary endpoint.", "The configuration change and application behavior both need validation.", [1,3,6]),
    F("storage-redundancy", "[02] Which sequence chooses redundancy for a new regulated workload?", "Define zone and region failure requirements, decide whether pre-failover secondary reads are needed, validate service and region support, then select the least costly matching option.", "Failure boundary and read behavior precede SKU selection.", [4,5,7]),
    F("storage-redundancy", "[02] An application on GRS cannot read the secondary endpoint before failover. What is the effective-state diagnosis?", "GRS does not expose secondary reads; change to RA-GRS if supported and required.", "Geo replication alone does not enable the read-access endpoint.", [1,2,3]),
    F("storage-redundancy", "[02] A ZRS account survives a zone outage but has no copy in the paired region. Is this a fault?", "No; ZRS is designed for zonal resilience within one region, not geo replication.", "Observed behavior matches the selected failure boundary.", [0,2,5]),
    F("storage-redundancy", "[02] A team selected RA-GRS but observes stale reads from the secondary. What explains this?", "Geo replication is asynchronous, so the readable secondary is eventually consistent.", "Read access does not make cross-region replication synchronous.", [2,3,5]),
    F("storage-redundancy-migration", "[02] Which CLI property should automation change to select a supported storage redundancy SKU?", "Update the storage account SKU through the documented `az storage account update --sku` path after validating the transition.", "The account SKU expresses the redundancy option; validation is required before mutation.", [4,6,7]),
    F("storage-redundancy", "[02] What is the boundary between LRS and ZRS?", "LRS protects against local hardware faults in one datacenter boundary; ZRS synchronously protects across availability zones in a region.", "The options differ in physical failure isolation, availability behavior, and cost.", [0,1,5]),
    F("storage-redundancy", "[02] What is the boundary between GRS and RA-GRS?", "Both replicate asynchronously to a secondary region, but only RA-GRS exposes that secondary for reads before failover.", "The RA prefix changes read accessibility, not write direction or replication synchrony.", [1,2,3]),
    F("storage-redundancy", "[02] What is the boundary between GRS and GZRS?", "GRS uses local redundancy in the primary before geo replication; GZRS uses zonal redundancy in the primary before geo replication.", "Primary-region zone resilience is the decisive difference.", [0,1,4]),
    F("storage-redundancy", "[02] What is the boundary between data durability and service availability?", "Durability concerns the probability of retaining data; availability concerns successful access to the service at a point in time.", "Multiple durable copies do not by themselves guarantee that the current endpoint is reachable.", [2,5,7]),
    F("storage-redundancy", "[02] What is the boundary between secondary read access and regional write recovery?", "An RA option permits reads from the secondary endpoint, while writes move only after a supported failover promotes the secondary.", "Read routing is not a writable-primary promotion.", [1,2,3]),
  ],
  "AZ104-N03-B03": [
    F("storage-last-sync-time", "[03] The primary region is unavailable and the business can lose at most ten minutes of writes. What evidence should drive an unplanned failover decision?", "Compare the outage time and business RPO with the account's Last Sync Time before approving failover.", "Last Sync Time bounds the writes guaranteed in the secondary and therefore estimates the possible loss window.", [0,4,6]),
    F("storage-failover-initiate", "[03] Both regions are healthy and a disaster-recovery exercise must avoid data loss. Which failover type should be chosen?", "Use customer-managed planned failover after validating service limitations and stopping required client activity.", "Planned failover waits for replication to complete before DNS promotion.", [3,5,7]),
    F("storage-failover", "[03] The primary region is unavailable and writes must resume in the paired region despite an accepted RPO. Which action fits?", "Approve an unplanned customer-managed failover after reviewing Last Sync Time and unsupported-feature implications.", "Unplanned failover is the recovery path that promotes the available secondary while accepting possible loss.", [1,4,5]),
    F("storage-redundancy", "[03] An application needs read-only continuity before operators decide to fail over. Which architecture is required?", "Use RA-GRS or RA-GZRS and implement reads against the secondary endpoint when the primary is unavailable.", "Read-access redundancy exposes the secondary without promoting it to writable primary.", [1,2,4]),
    F("storage-failover-initiate", "[03] Which sequence performs an unplanned account failover responsibly?", "Confirm the outage and account support, inspect Last Sync Time and client impact, obtain approval for possible loss, initiate failover, validate DNS and data, then re-enable geo redundancy.", "The sequence preserves evidence, acknowledges loss, verifies promotion, and restores regional protection.", [0,3,4]),
    F("storage-failover-initiate", "[03] Which sequence performs a planned failover exercise?", "Verify both regions are available, stop unsupported client activity, initiate planned failover, wait for synchronization and DNS promotion, validate workloads, then perform planned failback when approved.", "Planned operation depends on complete replication and controlled client activity.", [3,5,7]),
    F("storage-failover-initiate", "[03] Which sequence restores geo protection after an unplanned failover?", "Validate the promoted primary and reconciled writes, select an appropriate geo-redundant SKU, wait for initial replication to the new secondary, then retest recovery evidence.", "The promoted account is locally redundant until geo replication is deliberately restored.", [3,4,6]),
    F("storage-last-sync-time", "[03] Last Sync Time is 12:00, but the latest primary write is 12:07. What data state is guaranteed after unplanned failover?", "Writes through 12:00 are guaranteed in the secondary; writes after 12:00 may or may not be present.", "The property supplies a guarantee boundary, not a precise list of lost writes.", [0,6,7]),
    F("storage-redundancy", "[03] A client reads old metadata from an RA-GRS secondary while primary reads are current. What is the cause?", "Expected eventual consistency from asynchronous geo replication.", "The secondary can lag the primary even though it is available for reads.", [0,2,6]),
    F("storage-failover-initiate", "[03] After unplanned failover, monitoring reports the account as LRS. What should the administrator conclude?", "This is expected; re-enable a supported geo-redundant SKU after validating the new primary.", "Unplanned failover does not immediately preserve the former geo-redundancy configuration.", [3,4,6]),
    F("storage-failover-initiate", "[03] Applications still use the normal primary hostname after failover and reach the new region. Why?", "Azure updates the service endpoint DNS records so the stable hostname resolves to the promoted region.", "Failover changes DNS mapping rather than requiring a new storage account name.", [2,4,6]),
    F("storage-failover-initiate", "[03] A planned failover preparation fails because the primary region is unavailable. What is the correction?", "Use planned failover only when both regions can complete synchronization; evaluate unplanned failover and its RPO if the primary remains unavailable.", "The two failover types have different availability and data-loss preconditions.", [3,5,6]),
    F("storage-last-sync-time", "[03] Which Azure CLI query retrieves the geo-replication recovery-point evidence?", "Run `az storage account show --expand geoReplicationStats --query geoReplicationStats.lastSyncTime` for the account.", "The expanded geoReplicationStats property exposes Last Sync Time for decision evidence.", [0,4,6]),
    F("storage-failover-initiate", "[03] Which command family initiates a customer-managed storage failover after approval?", "Use the documented `az storage account failover` or corresponding Az.Storage PowerShell operation for the account and selected failover type.", "Failover is a Resource Manager account operation, not a blob copy command.", [1,4,5]),
    F("storage-last-sync-time", "[03] What is the boundary between Last Sync Time and replication completion?", "Last Sync Time guarantees all earlier writes are present; it does not assert that every later write is absent or that replication has stopped.", "Use it to bound RPO exposure rather than infer exact object loss.", [0,6,7]),
    F("storage-failover-initiate", "[03] What is the boundary between storage account failover and data migration?", "Failover promotes a geo-secondary for outage recovery; migration copies or synchronizes data into a deliberately designed target account.", "The operations have different consistency, rollback, feature, and destination-design contracts.", [2,4,5]),
  ],
  "AZ104-N03-B04": [
    F("blob-object-replication", "[04] New block blobs must asynchronously appear in a second account without failing over the entire account. Which feature fits?", "Configure Blob object replication between source and destination containers.", "Object replication applies asynchronous policy-based copying at block-blob scope.", [2,3,7]),
    F("blob-object-replication", "[04] Only blobs under the `images/` virtual prefix should replicate. What should the rule contain?", "Add the documented `images/` prefix filter to the replication rule.", "Prefix filters restrict eligible source block blobs without creating another account.", [5,6,7]),
    F("blob-object-replication", "[04] Existing and future block blobs must be copied by a new policy. What scope decision is needed?", "Configure the policy to include existing objects, or a deliberate creation-time scope, instead of accepting the default new-object scope.", "Default policy behavior does not automatically guarantee replication of the existing estate.", [5,6,7]),
    F("blob-object-replication", "[04] Security requires preventing replication policies across Microsoft Entra tenants. What account control should be used?", "Set the account's cross-tenant replication allowance to false before accepting policies.", "The account property constrains whether an authorized policy may cross tenant boundaries.", [3,4,6]),
    F("blob-object-replication-configure", "[04] Which prerequisite sequence prepares two accounts for object replication?", "Create supported accounts and containers, enable versioning on both accounts, enable change feed on the source, then create the destination policy and associate the matching policy with the source.", "The replication engine needs compatible accounts, existing containers, versions, source changes, and matching policy identity.", [0,1,3]),
    F("blob-object-replication-configure", "[04] Which sequence configures one replication rule in the portal?", "Select the destination account, add a policy with source account and container pair, choose copy scope and filters, create it, then verify the matching source policy and status.", "The destination policy definition and source association must describe the same rule.", [0,5,7]),
    F("blob-object-replication-configure", "[04] Which sequence removes a policy when writes must resume on the destination container?", "Stop relying on replication, remove the rule or policy from the governed accounts, verify policy removal, then test destination writes.", "Destination writes remain blocked while the replication policy governs the container.", [4,5,7]),
    F("blob-object-replication-configure", "[04] Which sequence validates a prefix-filtered policy?", "Upload one matching and one nonmatching block blob after policy creation, wait for asynchronous processing, inspect source replication status, and verify only the matching object at the destination.", "A controlled pair of objects proves both inclusion and exclusion behavior.", [2,6,7]),
    F("blob-object-replication-configure", "[04] Which sequence adds existing-object replication to a replacement policy?", "Record the required creation-time boundary, remove or replace the policy deliberately, configure an existing-object or custom-time copy scope, then monitor the resulting backlog and cost.", "Recreation semantics and historical-copy scope must be explicit to avoid silent omissions.", [5,7,6]),
    F("blob-object-replication", "[04] Replication never starts, and versioning is enabled only at the destination. What is missing?", "Enable versioning at the source as well and enable source change feed before recreating or validating the policy.", "Both accounts require versioning, while change feed belongs on the source.", [0,1,7]),
    F("blob-object-replication", "[04] A new append blob remains absent from the destination although the rule matches its prefix. Why?", "Object replication supports block blobs, not append blobs.", "Prefix eligibility does not override the supported blob-type boundary.", [2,6,7]),
    F("blob-object-replication", "[04] A destination upload returns HTTP 409 while reads and deletes work. What is the effective-state cause?", "The active replication policy makes the destination container read-only for writes from clients.", "The conflict is policy behavior, not missing blob data permission.", [4,7,6]),
    F("blob-object-replication-configure", "[04] Which CLI operation family configures object replication prerequisites before a policy is added?", "Use `az storage account blob-service-properties update` to enable source change feed and versioning on both accounts, then use the object-replication policy commands.", "Blob service properties own versioning and change feed; policy commands own the account-to-account rules.", [0,1,3]),
    F("blob-object-replication", "[04] What is the boundary between object replication and RA-GRS?", "Object replication copies selected block blobs by container rules to another account; RA-GRS maintains an account-level geo-secondary that is read-only before failover.", "Filtering, destination ownership, write behavior, and recovery semantics differ.", [2,4,7]),
  ],
  "AZ104-N03-B05": [
    F("storage-encryption", "[05] A new account has no custom encryption settings. Is its data encrypted at rest?", "Yes; Azure Storage encrypts data at rest with Microsoft-managed keys by default.", "Encryption is enabled for every storage account and cannot be disabled.", [0,1,4]),
    F("storage-cmk", "[05] Compliance requires customer control over key rotation and revocation. Which model fits?", "Configure a customer-managed key in Key Vault or Managed HSM for the storage account.", "CMK transfers key lifecycle control and audit responsibility to the customer.", [1,6,7]),
    F("storage-infrastructure-encryption", "[05] Policy requires two independent service-level encryption layers for a new account. What should be enabled?", "Enable infrastructure encryption when creating the storage account.", "Infrastructure encryption supplies the additional service-layer encryption pass required by the policy.", [1,4,7]),
    F("storage-encryption", "[05] One container in a multi-tenant account needs its own encryption boundary. Which feature should be evaluated?", "Use an encryption scope assigned to the container or blobs with the required key model.", "Encryption scopes allow a narrower encryption-key boundary inside an account.", [1,5,7]),
    F("storage-cmk", "[05] A new account must use CMK immediately at creation. Which identity type is required for same-tenant Key Vault authorization?", "Provide a user-assigned managed identity that already has the required key permissions.", "CMK configuration at account creation needs an identity that exists before the account.", [3,6,7]),
    F("storage-cmk-existing", "[05] Which sequence enables CMK on an existing account?", "Enable or assign a managed identity, grant it the documented Key Vault cryptographic permissions, verify soft delete and purge protection, then configure the storage account with the key and validate access.", "Identity, vault recoverability, authorization, key selection, and data availability form one dependency chain.", [2,3,6]),
    F("storage-cmk", "[05] Which sequence rotates a CMK while minimizing outage risk?", "Create and enable the new key version, verify the storage identity can use it, update or allow versionless tracking as designed, validate storage access, then retain old versions per recovery policy.", "Rotation should preserve a usable key path until storage access with the new version is proven.", [2,3,7]),
    F("storage-cmk", "[05] Which sequence prepares Key Vault for a storage CMK?", "Enable soft delete and purge protection, create a supported RSA key, authorize the storage managed identity for required key operations, then reference the key from Storage.", "The vault must satisfy key type, recoverability, and authorization prerequisites before Storage can adopt the key.", [2,3,6]),
    F("storage-infrastructure-encryption", "[05] Which sequence meets a double-encryption requirement for a new account?", "Confirm the requirement and regional/account support, enable infrastructure encryption during account creation, configure the desired primary key model, then verify both settings.", "Double encryption is a creation-time layer separate from customer ownership of the primary encryption key.", [1,4,7]),
    F("storage-cmk", "[05] Which sequence revokes a compromised CMK without mistaking loss of access for success?", "Activate the incident plan, block or rotate the compromised key as approved, monitor storage availability, configure a trusted replacement, and validate recovery before retiring evidence.", "Revocation can intentionally make storage data unavailable and therefore needs an availability-aware recovery path.", [2,3,7]),
    F("storage-cmk", "[05] Storage data operations fail immediately after CMK configuration. The key is disabled. What is the cause?", "Azure Storage cannot unwrap its data encryption keys because the referenced CMK is unavailable.", "An enabled and authorized Key Vault key is a runtime dependency for CMK-protected storage.", [2,3,7]),
    F("storage-cmk", "[05] The CMK is enabled, but the storage managed identity has no key permissions. What correction is needed?", "Grant the managed identity the documented Key Vault cryptographic permissions or role, then retest storage access.", "Resource management access does not automatically grant key unwrap and wrap operations.", [3,6,7]),
    F("storage-cmk", "[05] Blobs and files use CMK, but queues remain on Microsoft-managed service keys. Why?", "The account was not created with account-scoped encryption-key support for queues and tables.", "Queue and Table CMK coverage depends on the creation-time account encryption key option.", [1,5,7]),
    F("storage-cmk-existing", "[05] Which CLI workflow configures an existing account with a Key Vault CMK?", "Assign an identity and Key Vault permissions, then use `az storage account update` with the key vault/key identifiers and identity settings, followed by a key-source verification.", "The Resource Manager update binds the authorized identity and key reference to the storage account.", [3,6,7]),
    F("storage-encryption", "[05] What is the boundary between Microsoft-managed and customer-managed keys?", "Both encrypt data at rest; Microsoft owns lifecycle for MMK, while the customer owns CMK storage, access, rotation, and recovery responsibility.", "CMK changes control and operational risk, not the existence of encryption.", [0,1,7]),
    F("storage-infrastructure-encryption", "[05] What is the boundary between CMK and infrastructure encryption?", "CMK controls ownership of an encryption key; infrastructure encryption adds a second encryption layer selected at account creation.", "A requirement for customer key control does not automatically require double encryption, and vice versa.", [1,4,7]),
  ],
  "AZ104-N03-B06": [
    F("azcopy-overview", "[06] A scripted one-time upload must preserve destination objects that are absent locally. Which AzCopy command fits?", "Use `azcopy copy` with the required recursive and authorization options.", "Copy transfers selected data without making destination reconciliation the primary operation.", [0,4,6]),
    F("azcopy-sync", "[06] A destination Blob container must mirror a source directory, including approved deletion of extra destination blobs. Which command fits?", "Use `azcopy sync` with source and destination in the correct order and explicitly reviewed deletion behavior.", "Sync is the one-way reconciliation operation and can remove destination-only data when requested.", [0,6,7]),
    F("azcopy-auth", "[06] An administrator runs AzCopy interactively and policy forbids account keys. Which authorization approach fits?", "Assign the least-privilege Storage data role and authenticate with `azcopy login` in the correct tenant.", "Entra authentication avoids Shared Key while RBAC supplies the required data action.", [1,3,5]),
    F("azcopy-overview", "[06] Which sequence performs a controlled local-to-Blob migration?", "Inventory and size data, grant source/destination access, test a small recursive copy, run the bulk copy, inspect job status and logs, then validate counts and hashes before cutover.", "A transfer is complete only after authorization, execution evidence, and integrity validation.", [2,4,7]),
    F("azcopy-sync", "[06] Which sequence maintains a Blob mirror after the initial copy?", "Run a non-destructive sync preview or test, review direction and deletion policy, execute sync, inspect differences and failures, then validate the destination.", "Direction and delete semantics must be proven before reconciliation.", [0,6,7]),
    F("azcopy-troubleshoot", "[06] Which sequence recovers an interrupted AzCopy job?", "Capture the job ID and exit status, inspect failed transfers in the log, repair authorization/network/path causes, then run `azcopy jobs resume <job-id>` and verify completion.", "The saved plan resumes remaining work after the actual failure is corrected.", [2,5,7]),
    F("azcopy-troubleshoot", "[06] AzCopy returns 403 for every upload after successful login. What should be checked first?", "Check the destination data role or ACL and storage firewall rules for the AzCopy client path.", "Authentication success does not prove data authorization or network admission.", [1,5,3]),
    F("azcopy-overview", "[06] A recursive copy moved only top-level files. What is the likely correction?", "Rerun or resume with `--recursive=true` after confirming the intended source path.", "Directory traversal must be explicitly enabled for a tree transfer.", [4,2,7]),
    F("azcopy-troubleshoot", "[06] A resumed AzCopy job reports that its source SAS has expired while some transfers remain pending. What should the operator do?", "Inspect the job log to confirm the expired credential, obtain a replacement SAS with the required scope, then resume the saved job with the renewed credential and verify the remaining transfers.", "An expired SAS is a credential-lifetime failure; renewing only the affected authorization and resuming the saved plan preserves completed transfers.", [1,4,7]),
    F("azcopy-overview", "[06] Which command copies a local directory recursively to a Blob container?", "Run `azcopy copy '<local-path>' 'https://<account>.blob.core.windows.net/<container>' --recursive=true` with valid destination authorization.", "The copy command, Blob container URL, and recursive flag express the intended transfer.", [0,4,6]),
    F("azcopy-sync", "[06] Which command reconciles one Blob container into another without assuming bidirectional merge?", "Run `azcopy sync '<source-container-url>' '<destination-container-url>' --recursive=true` after reviewing deletion semantics.", "AzCopy sync treats the first endpoint as source and the second as destination.", [0,6,7]),
    F("azcopy-troubleshoot", "[06] Which command shows detailed status for a known transfer job?", "Run `azcopy jobs show <job-id>` and inspect failed or skipped transfers and the associated log.", "Job status provides scoped evidence before resume or repair.", [2,5,7]),
    F("azcopy-troubleshoot", "[06] Which command continues a repaired transfer from its plan file?", "Run `azcopy jobs resume <job-id>` and supply renewed source or destination SAS values if the job requires them.", "Resume uses the preserved plan instead of recopying completed transfers.", [2,3,7]),
    F("azcopy-sync", "[06] What is the boundary between `azcopy copy` and `azcopy sync`?", "Copy transfers selected objects; sync compares one-way source and destination state and may delete destination-only objects when configured.", "Use copy for migration additions and sync only for reviewed reconciliation semantics.", [0,6,7]),
  ],
  "AZ104-N03-B07": [
    F("storage-explorer", "[07] A support engineer needs interactive read-only access to one Blob container. Which connection is least broad?", "Attach the container with Entra ID and a read-only data role, or a resource-scoped read SAS if identity access is unavailable.", "A container-scoped credential avoids exposing account-wide authority.", [0,1,3]),
    F("storage-explorer", "[07] An administrator must browse several storage accounts already visible in an authorized subscription. Which connection path fits?", "Sign in to the correct Azure account and tenant, select only the required subscriptions, and browse the discovered accounts.", "Subscription sign-in supports management discovery while data roles still govern operations.", [0,1,7]),
    F("storage-explorer-blobs", "[07] An operator must inspect metadata and download a few blobs manually. Which tool fits?", "Use Storage Explorer's Blob container view with a least-privilege data credential.", "The interactive explorer is appropriate for bounded inspection and download operations.", [4,5,7]),
    F("storage-explorer", "[07] Which sequence attaches one Blob container by SAS?", "Generate a container-scoped SAS with required permissions and short lifetime, choose Blob container attachment, enter the SAS URL, review the target, connect, and test only the intended action.", "Resource scope, permission, expiry, and endpoint review limit credential exposure.", [0,3,6]),
    F("storage-explorer", "[07] Which sequence connects with Entra ID when the user has only data-plane permissions?", "Choose attachment to the individual resource, select Entra ID, sign in to the correct tenant, enter the resource URL, connect, and verify the permitted data operation.", "Individual-resource attachment avoids requiring unrelated management discovery access.", [0,1,7]),
    F("storage-explorer-blobs", "[07] Which sequence uploads a bounded set of blobs interactively?", "Open the authorized container, choose Upload Files or Folder, review destination and overwrite behavior, start the transfer, then inspect Activity Log and destination objects.", "Interactive transfer still needs preflight and post-transfer evidence.", [4,5,7]),
    F("storage-explorer", "[07] Which sequence retires a shared SAS attachment?", "Remove the attachment, revoke or let the short-lived SAS expire, verify access no longer succeeds, and preserve audit evidence without storing the token.", "Removing the UI entry alone does not revoke a still-valid credential.", [0,6,7]),
    F("storage-explorer-troubleshoot", "[07] Storage Explorer lists an account but returns 403 when opening a container. What should be diagnosed?", "Separate data RBAC or ACL, SAS scope/expiry, and storage firewall or proxy restrictions using the relevant logs.", "Management-plane visibility does not establish data-plane access.", [1,2,7]),
    F("storage-explorer-troubleshoot", "[07] A large upload fails inside Storage Explorer. Where should the operator look for transfer-level evidence?", "Open the failed transfer's AzCopy log from Activity Log and inspect the failed paths and service errors.", "Storage Explorer delegates bulk transfers to AzCopy, whose log contains item-level failure evidence.", [2,5,7]),
    F("storage-explorer", "[07] A SAS attachment can list blobs but cannot upload. What is the most likely effective-state cause?", "The SAS grants read/list but lacks create or write permission, or the network path blocks the write request.", "Successful listing proves only the permissions and path used by that operation.", [1,2,7]),
    F("storage-explorer", "[07] Which tool should an administrator select for interactive cross-platform inspection of blobs, queues, tables, and files?", "Use Microsoft Azure Storage Explorer with an attachment method supported by the target resource.", "Storage Explorer is the desktop interactive surface for multiple Azure Storage services.", [4,5,0]),
    F("storage-explorer", "[07] What is the boundary between signing into a subscription and attaching an individual resource?", "Subscription sign-in supports account discovery through management access; individual attachment can use a resource URL and data credential without broader subscription discovery.", "Choose the connection scope from the operator's required visibility and permission boundary.", [0,1,7]),
  ],
  "AZ104-N03-B08": [
    F("storage-migration", "[08] A 40-TB file estate has a short cutover window and limited WAN bandwidth. What transfer design should be evaluated?", "Evaluate an offline Data Box bulk seed followed by an online delta transfer and validation.", "Volume, bandwidth, and cutover time can make a hybrid offline-plus-delta approach safer than network-only transfer.", [0,2,5]),
    F("storage-migration", "[08] A continuously changing Blob workload can tolerate online transfer but not a long freeze. Which migration pattern fits?", "Bulk-copy the source, run controlled delta passes, pause writes briefly, perform a final delta and integrity check, then cut over.", "Bulk-plus-delta limits downtime while preserving a clear final consistency boundary.", [0,4,6]),
    F("storage-account-overview", "[08] A legacy GPv1 account needs lifecycle management and current Blob features. What target architecture fits?", "Create or upgrade to a supported general-purpose v2 design after validating feature and migration constraints.", "StorageV2 is the current general-purpose architecture for modern service capabilities.", [1,2,7]),
    F("blob-object-replication-configure", "[08] A source and destination account are ready for selective block-blob replication. Which prerequisite sequence must be completed before creating the policy?", "Enable blob versioning on both accounts, enable change feed on the source, confirm supported block-blob containers and tenant/account prerequisites, then create the policy with explicit container and prefix rules.", "Object-replication policy creation depends on the service properties and account relationship being prepared first; a policy alone does not enable the required source and destination capabilities.", [0,1,3]),
    F("storage-cmk", "[08] A migration target must use a customer-owned key from day one. What must the plan include?", "Prepare Key Vault protections, identity and key permissions, configure CMK on the target, validate access, then move data.", "Target encryption dependencies should be proven before the migrated estate relies on them.", [2,7,6]),
    F("storage-migration", "[08] Which sequence migrates a live Blob workload with rollback?", "Design the compatible target, establish security and encryption, bulk copy, run deltas, validate inventory and hashes, freeze writes, run final delta, cut over clients, monitor, then retire the source after rollback expiry.", "The sequence separates target readiness, data convergence, cutover, and retirement.", [2,5,6]),
    F("storage-migration", "[08] Which sequence moves to an HNS-enabled analytics target?", "Inventory unsupported source features, create a compatible HNS target, configure identity and ACLs, copy and validate data, test analytics clients, then cut over and retain rollback.", "Namespace behavior and authorization must be tested in the target rather than assumed from object copy success.", [1,2,6]),
    F("storage-migration", "[08] Which sequence changes redundancy during a storage migration?", "Select and validate the target region/account/redundancy combination first, create the target, copy and validate data, then cut over; do not use failover as the migration mechanism.", "Redundancy is part of target architecture and should be proven before application cutover.", [0,2,5]),
    F("storage-migration", "[08] Which sequence retires the source account safely?", "Confirm cutover success and reconciliation, retain the source read-only for the approved rollback period, collect audit evidence, remove dependencies, then delete it through change control.", "Retirement follows proven target operation and expiration of rollback obligations.", [5,6,7]),
    F("storage-migration", "[08] Counts match after migration, but several large blobs have different hashes. What should happen?", "Stop cutover or roll back, identify and recopy the mismatched objects, then repeat integrity validation.", "Object count alone is insufficient when content-integrity evidence fails.", [2,5,6]),
    F("storage-account-overview", "[08] After moving data to an HNS account, an application using an unsupported Blob feature fails. What is the root cause?", "The target account capability was incompatible with the application's required feature and should have been found during target preflight.", "Data presence does not guarantee feature or API compatibility.", [1,2,7]),
    F("storage-cmk", "[08] Migrated objects are inaccessible immediately after the target CMK is disabled. What should be repaired?", "Restore an enabled authorized key version or execute the approved replacement-key recovery procedure for the target account.", "Copied data depends on the target account's encryption configuration after migration.", [2,7,6]),
    F("azcopy-overview", "[08] Which tool provides a resumable scripted online copy for a large supported Blob migration?", "Use AzCopy v10 with explicit source and destination authorization, logs, job IDs, and post-copy validation.", "AzCopy supplies high-throughput command-line transfer and resumable job evidence.", [0,4,6]),
    F("storage-migration", "[08] What is the boundary between migration completion and source retirement?", "Migration completes when target data and application behavior are validated; source retirement waits for rollback expiry, dependency removal, and approved deletion.", "A successful copy is not authority to remove the former system of record immediately.", [5,6,7]),
  ],
};

const kindByMixKey = { scenarioDecision: "scenario-decision", configurationSequence: "configuration-sequence", troubleshootingEffectiveState: "troubleshooting-effective-state", toolOrIacCommand: "tool-or-iac", boundaryOrContrast: "boundary-or-contrast" };
const slotOrdinal = (slot) => Number(slot.slotId.match(/-(\d+)$/)?.[1]);
const curriculum = JSON.parse(await readFile(curriculumPath, "utf8"));

for (const block of curriculum.blockPlans.filter((entry) => entry.nodeId === NODE)) {
  const cards = blocks[block.blockId];
  if (!cards) throw new Error(`${block.blockId} has no authored case plan.`);
  const expectedKinds = Object.entries(block.questionMix).flatMap(([key, count]) => Array(count).fill(kindByMixKey[key]));
  const slots = curriculum.slots.filter((slot) => slot.blockId === block.blockId).sort((a, b) => slotOrdinal(a) - slotOrdinal(b));
  if (cards.length !== slots.length) throw new Error(`${block.blockId} has ${cards.length} cases for ${slots.length} canonical slots.`);
  slots.forEach((slot, index) => {
    const actualKind = slot.slotId.match(/slot:([^:]+)-\d+$/)?.[1];
    if (actualKind !== expectedKinds[index]) throw new Error(`${slot.slotId} is out of canonical questionMix order; expected ${expectedKinds[index]}.`);
    if (!sourceById.has(cards[index].source)) throw new Error(`${slot.slotId} uses unknown source ${cards[index].source}.`);
  });
}

const allCards = Object.values(blocks).flat();
if (allCards.length !== 128) throw new Error(`N03 has ${allCards.length} cases; expected 128.`);
if (new Set(allCards.map((card) => card.prompt)).size !== allCards.length) throw new Error("Every N03 prompt must be unique.");
for (const card of allCards) {
  if (card.wrongs.length !== 3 || new Set([card.correct, ...card.wrongs.map((wrong) => wrong.text)]).size !== 4) throw new Error(`Options are incomplete or duplicated: ${card.prompt}`);
  if (card.wrongs.some((wrong) => !wrong.why)) throw new Error(`Every distractor needs individual feedback: ${card.prompt}`);
  if (!card.reason || !card.boundary || !card.transfer) throw new Error(`Incomplete feedback plan: ${card.prompt}`);
}

if (process.argv.includes("--check")) {
  console.log(`AZ104-N03 slot-order QA passed for ${allCards.length} cases across ${Object.keys(blocks).length} blocks.`);
  process.exit(0);
}

const registrySources = sourceSpecs.map(({ boundary, transfer, ...source }) => source);
const sourceRecords = new Map(curriculum.sourceRecords.map((source) => [source.sourceId, source]));
for (const source of registrySources) {
  const existing = sourceRecords.get(source.sourceId);
  sourceRecords.set(source.sourceId, existing ? { ...existing, ...source, authoritativeFor: [...new Set([...(existing.authoritativeFor ?? []), ...source.authoritativeFor])] } : source);
}
curriculum.sourceRecords = [...sourceRecords.values()].sort((a, b) => a.sourceId.localeCompare(b.sourceId));

for (const [blockId, cards] of Object.entries(blocks)) {
  const slots = curriculum.slots.filter((slot) => slot.blockId === blockId).sort((a, b) => slotOrdinal(a) - slotOrdinal(b));
  slots.forEach((slot, index) => {
    const requirement = slot.sourceRequirements.directFirstPartyDocumentation[0];
    requirement.testedProperties = [`${blockId.toLowerCase()}-${slot.learningOperation}-${String(index + 1).padStart(2, "0")}`];
    requirement.sourceRefs = [cards[index].source];
    requirement.resolutionState = "resolved_exact_direct";
  });
  const target = curriculum.targetPlans.find((entry) => entry.blockId === blockId);
  if (!target) throw new Error(`${blockId} target plan is missing.`);
  target.sourceRefs = [...new Set(cards.map((card) => card.source))].sort();
}

const activeSourceIds = new Set();
for (const slot of curriculum.slots) {
  for (const sourceRef of slot.sourceRequirements.officialObjective?.sourceRefs ?? []) activeSourceIds.add(sourceRef);
  for (const requirement of slot.sourceRequirements.directFirstPartyDocumentation ?? []) for (const sourceRef of requirement.sourceRefs ?? []) activeSourceIds.add(sourceRef);
}
const collectBlueprintSources = (value) => {
  if (Array.isArray(value)) return value.forEach(collectBlueprintSources);
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) key === "sourceRefs" && Array.isArray(child) ? child.forEach((sourceRef) => activeSourceIds.add(sourceRef)) : collectBlueprintSources(child);
};
collectBlueprintSources(curriculum.examSimulationBlueprint);
curriculum.sourceRecords = curriculum.sourceRecords.filter((source) => activeSourceIds.has(source.sourceId));
const { promotionProvenance, contentFingerprint, ...fingerprintPayload } = curriculum;
curriculum.contentFingerprint = createHash("sha256").update(JSON.stringify(fingerprintPayload)).digest("hex");
await writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`);

const anchorRegistry = JSON.parse(await readFile(anchorsPath, "utf8"));
const anchorSources = new Map(anchorRegistry.anchors.map((source) => [source.sourceId, source]));
for (const source of registrySources) {
  const existing = anchorSources.get(source.sourceId);
  anchorSources.set(source.sourceId, existing ? { ...existing, ...source, authoritativeFor: [...new Set([...(existing.authoritativeFor ?? []), ...source.authoritativeFor])] } : source);
}
const retainedSourceIds = new Set(curriculum.sourceRecords.map((source) => source.sourceId));
anchorRegistry.anchors = [...anchorSources.values()].filter((source) => retainedSourceIds.has(source.sourceId)).sort((a, b) => a.sourceId.localeCompare(b.sourceId));
await writeFile(anchorsPath, `${JSON.stringify(anchorRegistry, null, 2)}\n`);

const { manifest, model } = await buildManifest(ROOT);
const manifestTrack = manifest.tracks.find((entry) => entry.trackId === TRACK);
const canonicalTrack = model.curricula.get(TRACK);
const normalizedById = new Map(canonicalTrack.normalized.slots.map((slot) => [slot.slotId, slot]));
const optionIds = ["A", "B", "C", "D"];

for (const [blockId, cards] of Object.entries(blocks)) {
  const batchId = `az104-2026-08-16-${blockId}`;
  const provenance = { authoringMethod: "manual", approvalStatus: "unapproved", author: "Codex", createdAt: CREATED_AT, contentBatchId: batchId };
  const slots = manifestTrack.slots.filter((slot) => slot.learningBlockId === blockId).sort((a, b) => slotOrdinal(a) - slotOrdinal(b));
  const items = slots.map((slot, index) => {
    const card = cards[index];
    const normalized = normalizedById.get(slot.slotId);
    if (!slot.authoringAdmitted || !slot.sourceBinding) throw new Error(`${slot.slotId} is not authoring admitted.`);
    const rawOptions = [{ text: card.correct, correct: true, why: card.reason }, ...card.wrongs.map((wrong) => ({ ...wrong, correct: false }))];
    const shift = index % 4;
    const arranged = [...rawOptions.slice(shift), ...rawOptions.slice(0, shift)];
    const answer = arranged.findIndex((option) => option.correct);
    const directUrl = sourceById.get(card.source).url;
    if (!slot.sourceBinding.sourceRefs.includes(card.source)) throw new Error(`${slot.slotId} does not bind ${card.source}.`);
    return {
      itemId: `az104-${blockId}-${String(index + 1).padStart(3, "0")}`,
      slotId: slot.slotId,
      nodeId: NODE,
      learningBlockId: blockId,
      taxonomy: { examDomainId: normalized.raw.primarySimulationDomainId, competencyAreaId: NODE, topicId: blockId, skillAtomId: normalized.raw.directSkillOrDecisionAtomId },
      prompt: card.prompt,
      constraints: [card.boundary, card.transfer],
      interaction: { type: "choice", selectionMode: "single", options: arranged.map((option, optionIndex) => ({ optionId: optionIds[optionIndex], text: option.text })), acceptedOptionIds: [optionIds[answer]] },
      scoringContract: { type: "choice", resultSemantics: "exact_selected_set_with_partial_v1", selectionMode: "single" },
      feedback: {
        Reason: card.reason,
        Details: { mechanismOrProperty: card.reason, scenarioApplication: card.correct, errorCorrection: arranged.filter((option) => !option.correct).map((option) => option.why).join(" "), boundaryOrTradeoff: card.boundary, transfer: card.transfer, url: directUrl },
        wrongOptionExplanationsByOptionId: Object.fromEntries(arranged.map((option, optionIndex) => [optionIds[optionIndex], option.why]).filter((_, optionIndex) => optionIndex !== answer)),
        omittedCorrectElementExplanationsByOptionId: {},
      },
      modeEligibility: slot.modeEligibility,
      sourceBinding: slot.sourceBinding,
      authoringProvenance: provenance,
    };
  });
  const payload = { schemaVersion: "certification-manual-source-v2", batchId, trackId: TRACK, familyId: "certification", contentVersion: "microsoft-azure-administrator-associate-az-104-authoring-v2026.08.15", taxonomyVersion: "2026.08.15", nodeId: NODE, learningBlockId: blockId, slotIds: items.map((item) => item.slotId), items, authoringProvenance: provenance };
  const output = join(ROOT, "manual/source", TRACK, NODE, `${blockId}.json`);
  await mkdir(join(output, ".."), { recursive: true });
  await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Authored ${items.length} reviewed items at ${output}.`);
}
