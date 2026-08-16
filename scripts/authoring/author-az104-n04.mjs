import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildManifest, ROOT } from "./lib/model.mjs";

const TRACK = "microsoft-azure-administrator-associate-az-104";
const NODE = "azure_storage_access_blob_files_and_data_protection";
const CREATED_AT = "2026-08-16T00:00:00Z";
const curriculumPath = join(ROOT, "config/curricula", `${TRACK}.json`);
const anchorsPath = join(ROOT, "evidence/curriculum", `${TRACK}-source-anchors.json`);

const sourceSpecs = [
  ["storage-network-security", "Configure Azure Storage firewalls and virtual networks", "https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security", "configure-storage-public-endpoint-network-rules", "Storage firewall IP, virtual-network, resource-instance, and trusted-service rules govern the public endpoint.", "Re-evaluate the rule type when the client path, region, subnet, or public-network policy changes."],
  ["storage-private-endpoints", "Use private endpoints for Azure Storage", "https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints", "configure-storage-private-connectivity-and-dns", "A private endpoint supplies a private IP for one Storage subresource; DNS must resolve the normal service FQDN to that IP.", "Create the required endpoint per service and separately restrict the public endpoint when private-only access is required."],
  ["storage-access-keys-manage", "Manage storage account access keys", "https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage", "retrieve-rotate-and-protect-storage-access-keys", "Either account key authorizes full Shared Key access, so rotation must preserve a valid client credential while the other key changes.", "Prefer identity-based authorization and treat listKeys or key disclosure as account-wide data-access exposure."],
  ["storage-shared-key-prevent", "Prevent Shared Key authorization for an Azure Storage account", "https://learn.microsoft.com/en-us/azure/storage/common/shared-key-authorization-prevent", "disable-and-diagnose-shared-key-authorization", "AllowSharedKeyAccess=false rejects Shared Key requests, including service and account SAS signed with account keys.", "Inventory and migrate dependent clients before disabling Shared Key, then enforce the property with policy where required."],
  ["storage-authorize", "Authorize operations for data access", "https://learn.microsoft.com/en-us/azure/storage/common/authorize-data-access", "choose-storage-data-authorization", "Management-plane roles and data-plane authorization are separate; account keys bypass granular identity permissions.", "Use Microsoft Entra ID and least-privilege data roles whenever the protocol and workload support them."],
  ["storage-sas", "Grant limited access to Azure Storage resources using shared access signatures", "https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview", "select-and-scope-shared-access-signatures", "User delegation, service, and account SAS differ by signing credential, service scope, resource scope, and revocation model.", "Grant only the required permissions, resource types, services, duration, protocol, and network scope."],
  ["storage-stored-access-policy", "Define a stored access policy", "https://learn.microsoft.com/en-us/rest/api/storageservices/define-stored-access-policy", "control-service-sas-with-stored-access-policy", "A stored access policy can change or revoke associated service SAS tokens on a container, share, queue, or table.", "Account SAS and user-delegation SAS cannot be linked to stored access policies; plan for propagation after policy changes."],
  ["azure-files-planning", "Plan for an Azure Files deployment", "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-planning", "select-azure-files-protocol-identity-and-protection", "SMB and NFS shares have different identity, media, redundancy, and protection capabilities and a share uses one protocol.", "Validate the client operating system, identity source, network path, data-protection requirement, and performance model together."],
  ["azure-files-identity-overview", "Overview of Azure Files identity-based authentication for SMB access", "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-active-directory-overview", "select-azure-files-smb-identity-source", "Azure Files supports one configured identity source per storage account for SMB identity-based authentication.", "Choose AD DS, Microsoft Entra Domain Services, or Microsoft Entra Kerberos from the actual identities and client environment."],
  ["azure-files-share-permissions", "Configure share-level permissions for Azure Files", "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-assign-share-level-permissions", "assign-azure-files-share-level-rbac", "A Storage File Data SMB Share role grants share-level access but does not replace directory and file ACL evaluation.", "Assign the narrowest share role at the lowest useful scope and allow propagation before testing."],
  ["azure-files-file-permissions", "Configure directory and file-level permissions for Azure Files", "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-configure-file-level-permissions", "configure-azure-files-directory-and-file-acls", "Identity-based SMB access requires both share-level permission and an effective Windows ACL for the path.", "Diagnose share RBAC and NTFS ACLs independently; use SMB admin elevation only for ACL administration."],
  ["blob-access-tiers", "Access tiers for blob data", "https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview", "choose-blob-access-tier", "Hot, cool, cold, and archive tiers trade storage price, access price, minimum retention, and retrieval latency.", "Choose from measured access and recovery requirements, and include rehydration and early-deletion charges in the decision."],
  ["blob-archive", "Archive a blob", "https://learn.microsoft.com/en-us/azure/storage/blobs/archive-blob", "archive-and-rehydrate-block-blobs", "Archive is offline; a blob must be rehydrated to an online tier before its data can be read or modified.", "Select standard or high-priority rehydration deliberately and avoid premature moves that incur minimum-duration charges."],
  ["blob-lifecycle", "Azure Blob Storage lifecycle management overview", "https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-overview", "automate-blob-tiering-and-deletion", "Lifecycle rules evaluate supported blob states and filters asynchronously to tier or delete current blobs, versions, and snapshots.", "A lifecycle policy cannot rehydrate archived blobs and must be updated as a complete policy document."],
  ["blob-versioning", "Blob versioning", "https://learn.microsoft.com/en-us/azure/storage/blobs/versioning-overview", "protect-and-recover-overwritten-blobs-with-versioning", "With versioning enabled, each write creates a new immutable version and earlier versions remain addressable by version ID.", "Control retained versions with lifecycle rules and combine versioning with deletion protection for broader recovery."],
  ["blob-soft-delete", "Soft delete for blobs", "https://learn.microsoft.com/en-us/azure/storage/blobs/soft-delete-blob-overview", "recover-soft-deleted-blobs", "Blob soft delete retains deleted blobs, versions, snapshots, and metadata for the configured retention interval.", "Recovery must occur before the retention interval expires; it does not recover a deleted storage account."],
  ["container-soft-delete", "Soft delete for containers", "https://learn.microsoft.com/en-us/azure/storage/blobs/soft-delete-container-overview", "recover-soft-deleted-containers", "Container soft delete restores a deleted container and its contents to the deletion-time state under the original name.", "It protects whole-container deletion, not an individual blob deletion while the container remains active."],
  ["azure-files-create-share", "Create an Azure file share", "https://learn.microsoft.com/en-us/azure/storage/files/create-classic-file-share", "create-and-configure-azure-file-share", "The share creation contract includes account compatibility, protocol, provisioned capacity or quota, tier, and protection settings.", "Choose SMB or NFS at share creation and validate the account and region support for the chosen combination."],
  ["azure-files-snapshots", "Use Azure Files share snapshots", "https://learn.microsoft.com/en-us/azure/storage/files/storage-snapshots-files", "create-and-restore-azure-files-share-snapshots", "A share snapshot is a read-only point-in-time copy from which individual files or a complete share can be copied back.", "Snapshots share the base share's redundancy and are not promoted in place; restore copies data to a writable destination."],
  ["azure-files-data-protection", "Data protection overview for Azure Files", "https://learn.microsoft.com/en-us/azure/storage/files/files-data-protection-overview", "protect-and-recover-azure-file-shares", "Azure Files protection combines soft delete, snapshots, Azure Backup, redundancy, and optionally File Sync for different failure modes.", "Match each control to deletion, modification, account loss, retention, or hybrid-server recovery rather than treating sync as backup."],
  ["azure-file-sync-overview", "What is Azure File Sync", "https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-introduction", "design-azure-file-sync-boundary", "Azure File Sync centralizes a Windows Server namespace in an Azure file share and can cache frequently used content locally.", "It is a hybrid synchronization and caching service; use snapshots or Azure Backup for independent recovery points."],
].map(([sourceId, title, url, authority, boundary, transfer]) => ({ sourceId, provider: "Microsoft", sourceType: "direct_first_party_product_documentation", title, url, checkedDate: "2026-08-16", sourceVolatility: "high", versionContext: "current Microsoft Learn documentation checked for AZ104-N04 authoring", resolutionState: "resolved_exact_first_party", authoritativeFor: [authority], propertyAuthorityBasis: "manual_slot_property_review_2026_08_16", boundary, transfer }));

const sourceById = new Map(sourceSpecs.map((source) => [source.sourceId, source]));
const W = (text, why) => ({ text, why });
const pools = {
  B01: [
    W("Add an account access key to the client configuration.", "Credentials authorize a request but do not admit a network path blocked by Storage networking."),
    W("Create one blob private endpoint and assume it covers every Storage service.", "Private endpoints target a specific subresource such as blob, dfs, file, queue, or table."),
    W("Use a private RFC1918 address in a storage IP network rule.", "Storage IP rules accept public internet IPv4 addresses, not private address ranges."),
    W("Create a private endpoint but leave the public endpoint unrestricted.", "A private endpoint does not automatically disable or firewall the public endpoint."),
    W("Connect applications directly to the `privatelink` service hostname.", "Clients should use the normal service FQDN and rely on DNS to resolve it to the private endpoint."),
    W("Enable a service endpoint without adding the subnet to the storage network rules.", "A service endpoint and an allowed virtual-network rule are both needed for selected-network public access."),
    W("Add an IP rule for a same-region Azure VM's public outbound IP.", "Same-region Azure traffic uses private Azure routing; use a virtual-network rule or private endpoint."),
    W("Assume every Azure service is covered by the trusted-services exception.", "Only documented trusted services and supported access patterns qualify for that exception."),
  ],
  B02: [
    W("Regenerate both account keys before updating any client.", "Changing both keys first removes every working Shared Key credential and causes avoidable downtime."),
    W("Store the account key in source control so every deployment can retrieve it.", "An account key is a full-access secret and must not be committed or broadly distributed."),
    W("Assign Reader and expect it to authorize blob data through Microsoft Entra ID.", "Reader is a management-plane role and doesn't grant blob data actions."),
    W("Disable Shared Key without inventorying service SAS and key-based clients.", "Account- and service-SAS tokens signed by account keys can fail when Shared Key is disabled."),
    W("Rotate a connection-string password independently of the account key.", "The Shared Key credential embedded in a connection string is the storage account key itself."),
    W("Use an account key because it can be restricted to one container.", "An account key grants broad account data access; a SAS or data role supplies narrower scope."),
    W("Grant Storage Account Contributor as the least-privilege data-reader role.", "That management role can manage accounts and list keys but is not a granular data-read role."),
    W("Assume disabling Shared Key disables Microsoft Entra authorization too.", "AllowSharedKeyAccess controls Shared Key; Microsoft Entra data authorization remains a separate path."),
  ],
  B03: [
    W("Distribute an account key instead of a scoped token.", "An account key provides broad persistent authority and defeats SAS least privilege."),
    W("Grant write and delete when the client only needs read.", "Extra permissions expand impact without serving the stated operation."),
    W("Issue the token without an expiry time.", "A bounded validity period limits exposure and is a core SAS control."),
    W("Allow HTTP when the client supports HTTPS.", "The SAS protocol restriction should require HTTPS to prevent exposure over plaintext transport."),
    W("Use a service SAS to authorize Queue and Blob services together.", "A service SAS is scoped to one Storage service; an account SAS can span selected services."),
    W("Use an account SAS signed by Microsoft Entra credentials.", "Account SAS is signed with an account key; user delegation SAS uses an Entra-derived delegation key."),
    W("Ignore the token's signed IP range when clients change networks.", "Requests outside the signed IP range are rejected even if every other SAS field is valid."),
    W("Edit the signed query string after issuance to add a permission.", "Changing a signed field invalidates the signature rather than extending authority."),
  ],
  B04: [
    W("Rotate the account key for every single service SAS revocation.", "Key rotation invalidates all SAS tokens signed by that key and is broader than a linked policy change."),
    W("Attach a stored access policy to an account SAS.", "Stored access policies apply to service SAS, not account SAS."),
    W("Attach a stored access policy to a user delegation SAS.", "User delegation SAS cannot reference a stored access policy."),
    W("Place the same permission and expiry fields in both the SAS and its stored policy.", "A field must be supplied by the signature or policy as documented, not ambiguously by both."),
    W("Delete the container to revoke its associated SAS tokens.", "Deleting production data is not an authorization-management strategy."),
    W("Expect a policy update to take effect globally with zero propagation time.", "Stored access policy changes can take time to propagate to service front ends."),
    W("Create an ad hoc service SAS and expect later policy edits to affect it.", "Only a SAS carrying the stored policy identifier is governed by that policy."),
    W("Rename a policy while keeping existing SAS identifiers unchanged.", "Existing linked SAS tokens reference the original identifier and won't automatically follow a rename."),
  ],
  B05: [
    W("Assign Storage Account Contributor and skip a Storage File Data SMB Share role.", "Management of the account doesn't grant identity-based SMB data access."),
    W("Grant a share role and ignore the directory's NTFS ACL.", "Both share-level RBAC and the effective file-system ACL participate in authorization."),
    W("Configure two SMB identity sources simultaneously on one storage account.", "Azure Files supports one active identity source per storage account."),
    W("Use a Blob data role for an SMB file share.", "Blob roles contain Blob service data actions, not Azure Files SMB share permissions."),
    W("Use an account key and describe the mount as identity-based authorization.", "Shared Key authenticates the account rather than the user or workload identity."),
    W("Change NTFS ACLs without mounting through an authorized administrative identity.", "ACL administration requires an effective share role and appropriate administrative file permissions."),
    W("Assume Microsoft Entra group membership bypasses share-level propagation.", "Role and group changes can require propagation before effective access is observed."),
    W("Enable an SMB identity source for an NFS share.", "The documented identity-source and Windows ACL model applies to SMB, not the NFS authorization model."),
  ],
  B06: [
    W("Move frequently read data to Archive for lower retrieval latency.", "Archive is offline and requires rehydration before reads."),
    W("Use lifecycle management to rehydrate archived blobs automatically.", "Lifecycle policies can tier data colder but cannot rehydrate Archive to an online tier."),
    W("Treat the account default access tier as immutable for every blob.", "A supported block blob can have an explicit tier that differs from the account default."),
    W("Ignore minimum storage duration when moving or deleting cool, cold, or archive data.", "Early deletion charges can apply before a tier's minimum duration elapses."),
    W("Apply a lifecycle prefix filter with different letter casing.", "Lifecycle prefix filters are case-sensitive."),
    W("Expect a new lifecycle policy to process every matching blob synchronously.", "Lifecycle evaluation is asynchronous and isn't an immediate transaction."),
    W("Read an archived blob before rehydration completes.", "Archived content remains offline until rehydration reaches an online tier."),
    W("Use a partial patch operation to update one lifecycle rule.", "The lifecycle policy document is read and written as a complete policy."),
  ],
  B07: [
    W("Enable only container soft delete to recover an overwritten blob in an active container.", "Container soft delete protects container deletion, not overwrite of an individual active blob."),
    W("Enable only versioning to recover a deleted storage account.", "Blob versioning is an in-account protection and cannot restore a deleted account."),
    W("Wait until the retention interval expires before attempting undelete.", "Soft-deleted data becomes permanently unavailable after its retention interval."),
    W("Modify the content of an immutable previous blob version in place.", "Existing blob versions are immutable; recovery creates or promotes a current state."),
    W("Create a new container with the deleted container's name before restoration.", "Container restore requires the original name to be available."),
    W("Disable versioning and expect all existing versions to be deleted.", "Disabling versioning stops new versions but retains existing versions until explicitly deleted."),
    W("Change the retention interval and assume it retroactively changes every prior deletion.", "A deleted container retains the interval that applied when it was deleted."),
    W("Use blob soft delete to reverse a container deletion without container soft delete.", "Whole-container recovery requires container soft delete or another independent recovery mechanism."),
  ],
  B08: [
    W("Configure one share to accept both SMB and NFS protocols.", "An Azure file share is created for one protocol, although an account can contain shares of different protocols where supported."),
    W("Treat File Sync as an immutable backup with independent retention.", "File Sync synchronizes changes; snapshots or Azure Backup provide recovery points."),
    W("Promote a share snapshot in place as the live share.", "Restore copies files from the read-only snapshot to a writable destination."),
    W("Delete the 201st snapshot automatically by creating another one.", "A share supports up to 200 snapshots; older snapshots must be deleted before another can be created."),
    W("Assume soft-deleted shares stop incurring storage charges.", "Used capacity in a soft-deleted share remains billable during retention."),
    W("Install the Azure File Sync agent without creating a Storage Sync Service and sync group.", "The registered server and server endpoint participate in a defined sync group with a cloud endpoint."),
    W("Use a share snapshot to change the share protocol.", "Snapshots preserve point-in-time data and don't change the base share's protocol."),
    W("Create an NFS share without verifying SSD/account and regional support.", "NFS support has account, media, redundancy, region, and client constraints that must be checked."),
  ],
};

let poolCursor = 0;
const usedWrongSets = new Map();
const F = (source, prompt, correct, reason, wrongIndexes) => {
  const key = `B${prompt.match(/^\[(\d+)\]/)?.[1]}`;
  const pool = pools[key];
  let indexes = wrongIndexes ?? [poolCursor % pool.length, (poolCursor + 3) % pool.length, (poolCursor + 5) % pool.length];
  const used = usedWrongSets.get(key) ?? new Set();
  const keyFor = (candidate) => candidate.map((index) => pool[index].text).sort().join("\u001f");
  let attempts = 0;
  while ((used.has(keyFor(indexes)) || new Set(indexes).size !== indexes.length) && attempts < pool.length * 2) {
    indexes = indexes.map((index, offset) => (index + offset + 1) % pool.length);
    attempts += 1;
  }
  used.add(keyFor(indexes));
  usedWrongSets.set(key, used);
  poolCursor += 1;
  const spec = sourceById.get(source);
  return { source, prompt: prompt.replace(/^\[\d+\]\s*/, ""), correct, reason, wrongs: indexes.map((index) => pool[index]), boundary: spec.boundary, transfer: spec.transfer };
};

const blocks = {
  "AZ104-N04-B01": [
    F("storage-network-security", "[01] Internet clients at two fixed public IPv4 addresses must reach Blob while all other internet traffic is denied. Which network configuration fits?", "Set public network access to selected networks and add the two public IPv4 address rules.", "Storage IP rules admit only the specified public source addresses through the public endpoint.", [0,2,3]),
    F("storage-network-security", "[01] VMs in one subnet must use the Storage public endpoint without allowing other subnets. What should be configured?", "Enable the Microsoft.Storage service endpoint on the subnet and add that subnet as an allowed virtual-network rule.", "The service endpoint establishes the Azure service route and the storage rule admits that subnet.", [0,5,6]),
    F("storage-private-endpoints", "[01] On-premises clients connected by ExpressRoute private peering must access Blob through a private address. Which design fits?", "Create a Blob private endpoint in the connected virtual network and configure private DNS resolution for the clients.", "Private Link carries the service connection on a VNet private IP and DNS directs the normal Blob hostname to it.", [1,3,4]),
    F("storage-network-security", "[01] An Azure service with a documented trusted-services integration must reach a firewalled account. What is the least broad exception?", "Enable the trusted Microsoft services exception only after verifying that the specific service and access pattern are supported.", "The bypass is limited to documented trusted-service scenarios rather than all Azure-origin traffic.", [3,6,7]),
    F("storage-private-endpoints", "[01] A Blob workload must have no usable public path to its account. Which combination meets the requirement?", "Create and approve a Blob private endpoint with working private DNS, then disable public network access.", "The private endpoint supplies the private path and the separate account setting closes the public path.", [1,3,4]),
    F("storage-private-endpoints", "[01] A hierarchical-namespace workload uses both Blob and Data Lake endpoints over Private Link. What is required?", "Create private endpoints for both the blob and dfs subresources and publish both private DNS zones.", "Data Lake clients can use both service endpoints, and each Storage subresource has its own private endpoint and DNS zone.", [1,4,5]),
    F("storage-private-endpoints", "[01] Which sequence creates a private-only Blob connection?", "Create the private endpoint for the blob subresource, approve it, link the Blob private DNS zone to client VNets, verify private resolution and access, then restrict the public endpoint.", "This order proves the replacement path before closing the public path.", [1,3,4]),
    F("storage-network-security", "[01] Which sequence admits a new application subnet through selected networks?", "Enable the Storage service endpoint on the subnet, add the subnet to the account's virtual-network rules, keep default public access denied for other networks, and test from the subnet.", "Both subnet routing identity and the account allow rule are required.", [0,5,6]),
    F("storage-private-endpoints", "[01] Which sequence integrates on-premises DNS with a Storage private endpoint?", "Create the endpoint and private DNS zone, link the zone to the endpoint VNet, configure on-premises DNS forwarding or delegation through an Azure resolver, then verify the normal service FQDN returns the private IP.", "Private connectivity depends on clients resolving the ordinary service name through the Private Link zone.", [1,4,6]),
    F("storage-network-security", "[01] Which sequence adds a branch office's fixed public egress address without opening all networks?", "Confirm the observed public IPv4 egress, add it as an account IP network rule, retain selected-network default deny, then test and monitor from that branch.", "The firewall evaluates the request's public source address at the public endpoint.", [0,2,7]),
    F("storage-private-endpoints", "[01] A private endpoint is approved, but a VM resolves `acct.blob.core.windows.net` to a public IP and access fails after public access is disabled. What is wrong?", "The Blob private DNS zone is missing, unlinked, or not reachable from the VM's DNS path.", "An approved endpoint is insufficient when the service FQDN still resolves to the public endpoint.", [0,3,4]),
    F("storage-network-security", "[01] An application used the public endpoint successfully until public network access was disabled. It has no private endpoint. Why does it now fail?", "The only network path was the public endpoint, and the account now rejects that path.", "Disabling public access is an effective-state network control independent of the application's credential.", [0,3,7]),
    F("storage-network-security", "[01] A subnet has a Microsoft.Storage service endpoint but receives network-denied responses from a selected-networks account. What is missing?", "Add the subnet as an allowed virtual-network rule on the storage account.", "The service endpoint doesn't itself modify the storage account's allow list.", [0,5,6]),
    F("storage-network-security", "[01] An administrator adds `10.20.0.0/16` as an IP network rule and Azure rejects it. What should be used for clients in that private range?", "Use a virtual-network rule with a service endpoint or a private endpoint, depending on the required endpoint model.", "Storage IP rules are for public IPv4 addresses, not RFC1918 source ranges.", [0,2,5]),
    F("storage-network-security", "[01] A same-region Azure VM remains blocked after its public outbound address is added to the account's IP rules. What is the correction?", "Authorize its subnet with a virtual-network rule or provide a private endpoint.", "Same-region Azure requests don't traverse the public internet source path that Storage IP rules are designed to match.", [2,5,6]),
    F("storage-private-endpoints", "[01] DNS is correct, but a newly created private endpoint connection shows Pending and data access fails. What is required?", "Approve the private endpoint connection on the storage account, then retest.", "A pending consent state does not establish an accepted Private Link connection.", [0,1,4]),
    F("storage-private-endpoints", "[01] Blob works over Private Link, but SMB to the same account still resolves publicly. Why?", "Only the blob subresource has a private endpoint; Azure Files needs a separate file private endpoint and DNS zone.", "Private endpoint scope is per Storage service subresource.", [1,4,5]),
    F("storage-private-endpoints", "[01] A server-side copy between two accounts fails after only the destination is made private. What network condition must be checked?", "The copy initiator must have an admitted network path to both the source and destination accounts.", "Securing one endpoint doesn't create reachability to the other storage endpoint.", [0,1,3]),
    F("storage-network-security", "[01] Which Azure CLI operation adds an existing subnet to the storage firewall allow list?", "Use `az storage account network-rule add` with the account, resource group, subnet, and virtual-network identifiers.", "The network-rule command updates the account's selected-network rules.", [0,5,7]),
    F("storage-private-endpoints", "[01] Which command families automate a private Blob endpoint and its DNS mapping?", "Use `az network private-endpoint create` for group-id blob, then private-DNS zone, VNet-link, and zone-group operations for `privatelink.blob.core.windows.net`.", "The endpoint and its DNS integration are distinct resources that must be deployed together.", [1,3,4]),
    F("storage-private-endpoints", "[01] What is the boundary between a Storage firewall rule and a private endpoint?", "Firewall rules control admission through the public endpoint; a private endpoint creates a private service path with separate consent and DNS.", "One controls the existing public surface, while the other materializes a private IP path.", [0,3,5]),
    F("storage-private-endpoints", "[01] What is the boundary between a service endpoint and a private endpoint for Storage?", "A service endpoint identifies an allowed subnet while traffic reaches the service public endpoint; a private endpoint places a private IP for a specific Storage subresource in the VNet.", "Their routing, DNS, endpoint exposure, and cross-network design are different.", [1,4,5]),
  ],
  "AZ104-N04-B02": [
    F("storage-access-keys-manage", "[02] An account key might be compromised, but production clients cannot all be updated simultaneously. What rotation approach minimizes downtime?", "Move every client to the other valid key, regenerate the exposed key, update clients to the regenerated value, and optionally regenerate the second key later.", "Two independent keys allow staged rotation while one credential remains valid.", [0,1,4]),
    F("storage-authorize", "[02] A new VM workload can use a managed identity for Blob data. Which authorization should replace its account key?", "Assign the managed identity the least-privilege Storage Blob Data role at the required scope and use Microsoft Entra authentication.", "Identity authorization avoids an account-wide secret and scopes permitted data actions.", [1,2,5]),
    F("storage-shared-key-prevent", "[02] Conditional Access must govern all supported Blob user access. Which account control is necessary?", "Migrate clients to Microsoft Entra authorization and disable Shared Key authorization on the account.", "Shared Key doesn't represent the requesting Entra identity and would bypass Conditional Access evaluation.", [2,3,7]),
    F("storage-access-keys-manage", "[02] A legacy application cannot yet use Microsoft Entra ID and requires a Shared Key connection string. How should its secret be handled?", "Store the connection string in a protected secret store such as Key Vault, restrict retrieval, and establish a staged key-rotation process.", "Secure storage and controlled rotation reduce—but don't remove—the risk of the broad account key.", [1,4,5]),
    F("storage-access-keys-manage", "[02] Which sequence performs routine key1 rotation without outage?", "Verify clients can switch credentials, update all clients to key2, regenerate key1, distribute key1 through the secret-delivery path, verify, then rotate key2 in a later cycle.", "A client must always retain one currently valid key throughout the rotation.", [0,1,4]),
    F("storage-access-keys-manage", "[02] Which sequence responds to confirmed key2 disclosure?", "Record affected use, switch known clients to key1, regenerate key2 immediately, update authorized secret stores, monitor rejected old-key requests, and plan rotation of key1.", "Regeneration revokes the disclosed credential while the alternate key preserves service continuity.", [0,1,5]),
    F("storage-shared-key-prevent", "[02] Which sequence safely disables Shared Key?", "Use logs and configuration inventory to find key- and SAS-based clients, migrate them to supported Entra or user-delegation paths, test, set AllowSharedKeyAccess to false, and monitor 403 responses.", "The account property should be enforced only after dependent Shared Key authorization paths are replaced.", [2,3,7]),
    F("storage-access-keys-manage", "[02] Which sequence retrieves a key for an approved emergency legacy client?", "Use a narrowly controlled identity with listKeys permission, retrieve one key through an audited path, place it in the approved secret store, configure the client, and schedule replacement and rotation.", "Key retrieval is privileged because possession grants broad data access.", [1,5,6]),
    F("storage-access-keys-manage", "[02] Which sequence moves a connection-string application from key1 to key2?", "Publish a key2-based secret version, restart or reload the application, verify all instances use key2, then regenerate key1 and remove its obsolete secret versions.", "Deployment evidence must prove no instance still depends on key1 before it is revoked.", [0,1,4]),
    F("storage-access-keys-manage", "[02] An application returns authentication failures immediately after key1 regeneration. What is the likely cause?", "At least one instance still uses a connection string containing the old key1 value.", "Regeneration invalidates the prior value immediately; clients must reload the replacement credential.", [0,4,5]),
    F("storage-shared-key-prevent", "[02] Service SAS requests begin returning 403 after AllowSharedKeyAccess is set to false. Why?", "The service SAS is signed with an account key and is rejected with Shared Key authorization disabled.", "A SAS token can be scoped yet still depend on Shared Key as its signing authority.", [3,4,7]),
    F("storage-authorize", "[02] A principal with Storage Account Contributor can list account keys and then read blobs. Why is this possible despite having no Blob Data Reader role?", "The management role includes listKeys; possessing an account key enables broad Shared Key data access outside granular data RBAC.", "The indirect key path is why management roles with listKeys must be tightly restricted.", [2,5,6]),
    F("storage-access-keys-manage", "[02] Which CLI command regenerates key2 for a storage account?", "Run `az storage account keys renew --key secondary` for the selected account and resource group.", "The renew operation changes one account key while leaving the other key valid.", [0,4,6]),
    F("storage-authorize", "[02] What is the boundary between Storage Account Contributor and a Storage data role?", "Storage Account Contributor manages the account and can list keys; a Storage data role authorizes defined service data actions for the principal.", "Management-plane capability and identity-based data-plane capability are separate, even though key retrieval can create an indirect data path.", [0,3,5]),
  ],
  "AZ104-N04-B03": [
    F("storage-sas", "[03] A user must upload one blob for 15 minutes without receiving an account key. The administrator can use Microsoft Entra ID. Which SAS type is preferred?", "Issue a short-lived user delegation SAS scoped to the target container or blob with only create/write permission and HTTPS.", "A user delegation SAS is signed from an Entra-authorized delegation key and avoids distributing an account key.", [0,1,2]),
    F("storage-sas", "[03] A partner needs read access to one Blob container, and Entra federation isn't available. Which token type fits?", "Issue a read-only Blob service SAS for that container with a short expiry and HTTPS-only protocol.", "A service SAS scopes account-key-signed access to one Storage service resource.", [0,1,4]),
    F("storage-sas", "[03] One migration tool must read Blob and write File service data with selected resource types. Which SAS type can express both services?", "Create an account SAS limited to Blob and File, the required resource types and permissions, HTTPS, and a short validity window.", "Account SAS can span selected Storage services and service/container/object resource types.", [1,4,5]),
    F("storage-sas", "[03] A download token is intended only for a corporate NAT address. Which additional restriction should be signed?", "Set the SAS signed IP range to the corporate public egress address.", "The service rejects use from source addresses outside the signed range.", [1,3,6]),
    F("storage-sas", "[03] A client only downloads existing blobs. Which permission set follows least privilege?", "Grant read only, with no write, create, add, or delete permission.", "SAS permission letters directly expand the operations the bearer can perform.", [0,1,2]),
    F("storage-sas", "[03] A browser client supports HTTPS and receives a bearer-style SAS URL. Which protocol setting is appropriate?", "Restrict the SAS to HTTPS only.", "A SAS in a URL is sensitive and should not be transmitted over plaintext HTTP.", [2,3,7]),
    F("storage-sas", "[03] Which sequence creates a user delegation SAS for Blob?", "Authorize the operator with the required Blob data role, request a user delegation key with Entra credentials, construct a least-privilege SAS with bounded start/expiry, then test the exact operation.", "The delegation key and the caller's data permission are prerequisites before the signed token is usable.", [0,2,5]),
    F("storage-sas", "[03] Which sequence issues a service SAS for one container?", "Select the target container, choose only required permissions, set a short expiry and HTTPS, optionally constrain IP, sign with a protected account key, and validate allowed and denied operations.", "Resource scope and signed restrictions must be decided before the token is distributed.", [0,1,3]),
    F("storage-sas", "[03] Which sequence constructs an account SAS for Blob and File object operations?", "Select Blob and File services, select only needed resource types, set exact permissions, expiry, HTTPS and optional IP range, sign with one account key, then validate each intended service operation.", "An account SAS requires both service and resource-type fields in addition to permissions.", [1,2,4]),
    F("storage-sas", "[03] Which sequence avoids client clock skew when issuing a SAS for immediate use?", "Prefer omitting the start time or setting it slightly in the past, keep a short expiry, generate the signature, then test from a client with synchronized time.", "A start time later than service time can make an otherwise correct SAS not yet valid.", [2,3,6]),
    F("storage-sas", "[03] Which sequence validates SAS least privilege before delivery?", "Use the SAS to perform the required operation, attempt representative forbidden operations, verify expiry/protocol/IP behavior, then deliver it through an approved channel.", "Both positive and negative tests prove that the signed scope matches the requirement.", [0,1,7]),
    F("storage-sas", "[03] Which sequence revokes account-key-signed SAS tokens after that signing key is exposed?", "Move authorized clients to tokens signed by the other key, regenerate the exposed key, issue replacement scoped tokens, and monitor failures from the old signatures.", "Regenerating the signing key invalidates all SAS signatures derived from that key.", [0,2,5]),
    F("storage-sas", "[03] An account SAS has Blob selected and write permission, but object uploads fail with an authorization resource-type mismatch. What field is likely missing?", "Include the object resource type in the signed resource types.", "Permissions alone are insufficient when the account SAS doesn't authorize the requested service resource type.", [1,4,7]),
    F("storage-sas", "[03] A SAS worked until an administrator manually changed `sp=r` to `sp=rw` in the URL. Why does it now fail?", "The signed permissions field was modified after signing, so the service-calculated signature no longer matches.", "SAS restrictions are integrity-protected by the signature and cannot be edited in place.", [1,5,7]),
    F("storage-sas", "[03] A newly generated SAS reports that it is not valid yet for clients whose clocks lag. What authoring correction is appropriate?", "Omit the start time when possible or set it slightly in the past, while retaining a short expiry.", "Clock skew at the validity boundary can reject a token before its signed start time.", [0,4,7]),
    F("storage-sas", "[03] A token works from headquarters but returns 403 from a branch office. All permissions and times are correct. What should be checked?", "Check whether the branch's public egress address falls outside the SAS signed IP range.", "The signed IP field is enforced independently of permissions and validity time.", [3,6,7]),
    F("storage-sas", "[03] Which Azure CLI approach generates a user delegation SAS for a container?", "Use `az storage container generate-sas --auth-mode login --as-user` with the required permissions and expiry.", "The login/as-user path requests a user delegation signature rather than using an account key.", [0,4,5]),
    F("storage-sas", "[03] Which CLI command family generates a multi-service account SAS?", "Use `az storage account generate-sas` with explicit services, resource types, permissions, expiry, and HTTPS-only settings.", "Account-level generation exposes the signed service and resource-type fields needed for a multi-service token.", [1,4,5]),
    F("storage-sas", "[03] What is the boundary between an account key and a SAS?", "An account key grants broad signing and data authority for the account; a SAS delegates a bounded subset of operations for a bounded context and time.", "A SAS reduces bearer scope but must still be protected because its holder can exercise every signed permission.", [0,1,2]),
    F("storage-sas", "[03] What is the boundary between user delegation SAS and account-key-signed SAS?", "User delegation SAS uses a key derived from Microsoft Entra authorization and applies to Blob; service and account SAS use account keys and cover their documented service scopes.", "The signing identity, supported services, revocation controls, and Shared Key policy impact differ.", [4,5,6]),
  ],
  "AZ104-N04-B04": [
    F("storage-stored-access-policy", "[04] Twenty service SAS tokens for one container must be revoked together without rotating an account key. What should they reference?", "Create a stored access policy on the container and issue each service SAS with that policy identifier.", "Deleting or constraining the shared policy changes the server-side authorization of every associated service SAS.", [0,5,6]),
    F("storage-stored-access-policy", "[04] An issued group of service SAS tokens needs its expiry shortened. How can this be done centrally?", "Update the expiry on their associated stored access policy and allow for propagation.", "The server-side policy remains a mutable bound for linked service SAS tokens.", [0,3,5]),
    F("storage-stored-access-policy", "[04] An account SAS must be revocable independently of other SAS tokens signed by the same key. Can a stored access policy provide that?", "No; use a different authorization design because account SAS cannot reference a stored access policy.", "Stored access policy linkage is supported for service SAS on supported service resources, not account SAS.", [0,1,2]),
    F("storage-stored-access-policy", "[04] Which sequence creates centrally governed container SAS tokens?", "Create the container policy with permissions and validity bounds, issue service SAS tokens containing its identifier, verify allowed and denied operations, and record the policy-to-client inventory.", "The policy must exist before linked tokens can defer their constraints to it.", [3,6,7]),
    F("storage-stored-access-policy", "[04] Which sequence revokes every service SAS linked to one policy?", "Identify dependent clients, delete the stored access policy or remove its permissions, wait for propagation, and verify old tokens are denied before closing the incident.", "Server-side policy removal revokes the linked authorization without deleting the container.", [0,4,5]),
    F("storage-stored-access-policy", "[04] Which sequence replaces a policy identifier without unexpectedly breaking clients?", "Create the replacement policy, issue and deploy new SAS tokens carrying its identifier, verify adoption, then remove the original policy and monitor old-token rejection.", "A SAS embeds its policy identifier, so clients need replacement tokens before the old identifier is removed.", [0,6,7]),
    F("storage-stored-access-policy", "[04] A policy expiry was shortened, but some linked SAS requests still succeed for several minutes. What explains the state?", "Stored access policy changes can take time to propagate across the Storage service.", "Transient authorization with the prior policy is expected during propagation and must be considered in incident timing.", [0,5,6]),
    F("storage-stored-access-policy", "[04] An ad hoc service SAS remains valid after an unrelated stored policy is deleted. Why?", "The SAS does not carry that policy identifier and therefore isn't governed by it.", "Only explicitly associated service SAS tokens inherit a stored policy's constraints.", [0,6,7]),
    F("storage-stored-access-policy", "[04] A user delegation SAS generator rejects an attempt to set a stored policy identifier. What is the cause?", "User delegation SAS does not support stored access policy linkage.", "Its authorization and validity are expressed in the delegation signature rather than a service stored policy.", [1,2,3]),
    F("storage-stored-access-policy", "[04] A linked service SAS contains an expiry while its policy also supplies expiry and requests fail. What should be corrected?", "Define that constraint in the supported location and issue a new SAS without conflicting duplicate fields.", "A service SAS and its policy divide constraint ownership according to the documented field rules.", [2,3,7]),
    F("storage-stored-access-policy", "[04] Which CLI operation revokes a container's stored access policy?", "Use `az storage container policy delete` for the named policy and then verify linked SAS requests after propagation.", "Deleting the server-side policy removes the authorization reference used by its linked service SAS tokens.", [0,4,5]),
    F("storage-stored-access-policy", "[04] What is the boundary between a stored-policy SAS and an ad hoc service SAS?", "A linked SAS inherits mutable server-side constraints and can be centrally revoked; an ad hoc SAS carries its constraints entirely in the signed token.", "The stored policy adds lifecycle control but also identifier management and propagation behavior.", [0,5,6]),
  ],
  "AZ104-N04-B05": [
    F("azure-files-identity-overview", "[05] Domain users must access an SMB Azure file share with their existing on-premises AD DS credentials. Which identity source fits?", "Enable on-premises AD DS authentication for Azure Files and register the storage account with the domain.", "AD DS integration lets SMB clients use Kerberos identities from the customer-managed domain.", [0,2,4]),
    F("azure-files-share-permissions", "[05] A group needs read and write access to one SMB share but no ACL-administration elevation. Which share role fits?", "Assign Storage File Data SMB Share Contributor at the file-share scope, then configure the required NTFS ACLs.", "The Contributor share role supplies normal SMB read/write/delete data actions without the elevated ACL-administration role.", [0,1,3]),
    F("azure-files-file-permissions", "[05] A user can mount an SMB share but must be denied one restricted directory. Where should that restriction be expressed?", "Set the directory's Windows ACL so the user's effective NTFS permission denies or omits access.", "Share-level RBAC admits the share; file-system ACLs refine access within it.", [0,1,5]),
    F("azure-files-identity-overview", "[05] Microsoft Entra-joined clients with cloud-only users need identity-based SMB access without customer domain controllers. Which source should be evaluated?", "Use Microsoft Entra Kerberos authentication when the documented client and account prerequisites are met.", "Microsoft Entra Kerberos can issue SMB Kerberos tickets for supported cloud-only and hybrid identities.", [2,4,7]),
    F("azure-files-identity-overview", "[05] An account already uses AD DS for SMB identity, but a team tries to enable Microsoft Entra Domain Services simultaneously. What is the correct decision?", "Keep one identity source or perform a controlled switch by disabling the current source before enabling the new one.", "Azure Files supports one active SMB identity source per storage account.", [1,2,6]),
    F("azure-files-file-permissions", "[05] An administrator must take ownership and repair ACLs without using an account key. Which role is intended for that elevation?", "Assign the documented Storage File Data SMB Admin role to the authorized administrator and use the Windows permission model.", "The SMB Admin role supplies administrative data actions for ownership and ACL repair without Shared Key.", [0,3,5]),
    F("azure-files-identity-overview", "[05] Which sequence enables identity-based SMB access?", "Choose one supported identity source, enable and validate it on the storage account, assign a share-level Storage File Data SMB role, configure NTFS ACLs, allow propagation, then test with the intended identity.", "Authentication, share authorization, path authorization, and propagation are separate dependencies.", [0,1,2]),
    F("azure-files-identity-overview", "[05] Which sequence changes the storage account from AD DS to Microsoft Entra Kerberos?", "Inventory users and prerequisites, plan the outage, disable AD DS authentication, enable Microsoft Entra Kerberos, revalidate share roles and ACL identity mapping, then test clients.", "Only one identity source can be active, so the transition contains an explicit interruption boundary.", [1,2,6]),
    F("azure-files-file-permissions", "[05] A user has Storage File Data SMB Share Contributor but receives Access Denied only for one folder. What should be inspected?", "Inspect the user's effective NTFS ACL on that folder and its parents.", "The share role admits SMB data access, while directory ACLs can still deny the path.", [0,1,6]),
    F("azure-files-share-permissions", "[05] A user has Full Control in the folder ACL but cannot mount the share. What authorization is missing?", "Assign an appropriate Storage File Data SMB Share role or configured default share-level permission.", "A permissive path ACL doesn't create share-level Azure authorization.", [0,1,3]),
    F("azure-files-share-permissions", "[05] Which CLI operation grants normal read/write SMB access to a group at one share?", "Use `az role assignment create` for Storage File Data SMB Share Contributor with the file share resource ID as scope.", "The role assignment establishes identity-based share-level authorization at the narrow resource scope.", [0,3,6]),
    F("storage-authorize", "[05] What is the boundary between managing a file share resource and reading its files?", "Management-plane roles create or configure the share; Storage File Data roles authorize file data operations for an identity.", "Control-plane success does not prove SMB data-plane access.", [0,3,4]),
    F("azure-files-file-permissions", "[05] What is the boundary between share-level RBAC and NTFS permissions?", "Share RBAC determines whether the identity may access the share; NTFS ACLs determine permitted directories, files, and operations inside it.", "Effective SMB access must pass both layers.", [0,1,5]),
    F("azure-files-planning", "[05] What is the boundary between identity-based SMB authentication and Azure Files REST authorization?", "SMB identity sources use Kerberos and Windows authorization semantics; REST requests use their supported Entra, SAS, or Shared Key authorization paths.", "Do not transfer an SMB role or ACL assumption unchanged to a REST client.", [3,4,7]),
  ],
  "AZ104-N04-B06": [
    F("blob-access-tiers", "[06] Telemetry files are read many times each day and require immediate access. Which tier fits?", "Keep the block blobs in the Hot tier.", "Hot optimizes for frequent access with online low-latency retrieval.", [0,2,3]),
    F("blob-access-tiers", "[06] Compliance exports are rarely read but must be available online immediately when requested. Which class of tier fits better than Archive?", "Use an online cool or cold tier selected from the measured access interval and minimum-retention economics.", "Cool and cold remain online, while Archive introduces hours-scale rehydration.", [0,3,6]),
    F("blob-access-tiers", "[06] Records are retained for years and can tolerate hours before a rare read. Which tier minimizes storage cost subject to that delay?", "Use the Archive tier and include rehydration and minimum-duration costs in the plan.", "Archive is designed for long-lived, rarely accessed data with delayed retrieval.", [0,3,6]),
    F("blob-archive", "[06] An archived incident file must be read as soon as practical and higher retrieval cost is acceptable. What action fits?", "Rehydrate it to Hot or Cool with high-priority rehydration where supported.", "An Archive blob must move to an online tier, and high priority reduces retrieval latency for urgent cases.", [0,1,6]),
    F("blob-lifecycle", "[06] Which sequence creates a lifecycle rule for `logs/` blobs?", "Define a rule for block blobs, add the case-sensitive `logs/` prefix filter, configure age-based tier and delete actions, deploy the complete policy, then monitor asynchronous results.", "The rule needs a supported blob type, precise filter, valid actions, and time for evaluation.", [1,4,5]),
    F("blob-lifecycle", "[06] Which sequence deletes previous versions after 90 days while preserving current blobs?", "Enable versioning as required, target previous versions in the lifecycle rule, configure delete after 90 days, deploy the full policy, and verify current-version retention separately.", "Lifecycle actions distinguish base blobs, previous versions, and snapshots.", [2,5,7]),
    F("blob-lifecycle", "[06] Which sequence changes one rule in an existing lifecycle policy?", "Retrieve the complete current policy, modify the intended rule without dropping the others, validate the JSON, replace the complete policy, and monitor evaluation.", "Lifecycle management does not support a partial rule patch.", [4,5,7]),
    F("blob-archive", "[06] Which sequence retrieves data from Archive?", "Request rehydration to Hot or Cool with the selected priority, monitor rehydration status, wait until the blob is online, then read it and review the resulting charges.", "Changing the target tier starts an asynchronous rehydration rather than an immediate read.", [0,6,7]),
    F("blob-access-tiers", "[06] Which sequence chooses an access tier for a new data class?", "Measure read frequency, required retrieval latency, retention duration, transaction volume and deletion timing, compare tier costs, select the tier, then review telemetry after deployment.", "The lowest storage price alone does not determine total cost or recovery suitability.", [0,2,3]),
    F("blob-lifecycle", "[06] Which sequence limits a rule to blobs with a classification tag?", "Ensure the blobs carry the intended index tag, define the rule's blob-index match filter and actions, deploy the full policy, and validate matching and nonmatching samples.", "Blob index filters provide policy selection independent of virtual-directory prefixes.", [4,5,7]),
    F("blob-lifecycle", "[06] A lifecycle rule must move archived data back to Hot after 30 days. Why will the design not work?", "Lifecycle management cannot rehydrate blobs from Archive to an online tier.", "Rehydration requires an explicit Set Blob Tier or copy-based operation outside lifecycle management.", [1,5,6]),
    F("blob-archive", "[06] An application gets BlobArchived when reading a blob. Permissions and networking are correct. What is required?", "Rehydrate the blob to an online Hot or Cool tier and wait for completion before reading.", "Archive access state, not authorization, prevents online content reads.", [0,1,6]),
    F("blob-lifecycle", "[06] A prefix-filtered lifecycle rule affects `logs/` but not `Logs/`. Why?", "Lifecycle prefix matching is case-sensitive.", "The two prefixes are distinct filter values even when users treat them as the same logical folder.", [2,4,5]),
    F("blob-lifecycle", "[06] A lifecycle delete action does not remove a blob that is already soft-deleted. What explains this?", "Lifecycle delete does not act on a blob while it is in the soft-deleted state.", "Soft-delete retention governs that retained state until recovery or permanent expiry.", [3,5,7]),
    F("blob-access-tiers", "[06] Which CLI command moves an online block blob to Archive?", "Use `az storage blob set-tier --tier Archive` for the selected blob with valid data authorization.", "Set Blob Tier changes the access tier without downloading and re-uploading the content.", [0,6,7]),
    F("blob-lifecycle", "[06] Which CLI resource operation deploys a lifecycle policy?", "Use `az storage account management-policy create` with the complete validated rules document.", "The management-policy resource owns the account's lifecycle rule collection.", [1,5,7]),
    F("blob-access-tiers", "[06] What is the boundary between Cold and Archive?", "Cold remains online with immediate reads but higher access costs and a minimum duration; Archive is offline and requires asynchronous rehydration.", "The required recovery latency is the decisive capability boundary.", [0,3,6]),
    F("blob-access-tiers", "[06] What is the boundary between the account default access tier and a blob's explicit tier?", "The account default applies to eligible blobs without an explicit tier; an explicitly tiered blob retains its own access-tier setting.", "Changing the default doesn't mean every existing explicitly tiered blob changes with it.", [2,5,7]),
  ],
  "AZ104-N04-B07": [
    F("blob-versioning", "[07] A production blob is overwritten with incorrect content and earlier writes must remain recoverable. Which feature directly preserves each prior write state?", "Enable Blob versioning and recover by copying or promoting the required previous version.", "Versioning turns the former current state into an immutable previous version on each write.", [0,1,3]),
    F("blob-soft-delete", "[07] Individual blobs might be accidentally deleted while their containers remain. Which protection directly supports undelete during retention?", "Enable blob soft delete with a retention interval aligned to incident detection time.", "Blob soft delete retains a deleted blob and related state for recovery within the interval.", [0,2,7]),
    F("container-soft-delete", "[07] An operator might delete an entire container. Which protection restores that container and its contents?", "Enable container soft delete and restore the container under its original name within retention.", "Container soft delete protects the container-deletion failure mode as one recoverable unit.", [0,2,7]),
    F("blob-versioning", "[07] The account needs recovery from both overwrites and deletes of individual blobs. Which combination is recommended?", "Enable Blob versioning and blob soft delete, and manage retained versions with lifecycle rules.", "Versioning preserves write history while soft delete protects deletion states; together they cover distinct operations.", [0,1,2]),
    F("blob-versioning", "[07] Which sequence enables layered Blob protection?", "Enable versioning, blob soft delete and container soft delete with reviewed retention, add lifecycle cleanup for old versions, test overwrite/blob-delete/container-delete recovery, then monitor capacity.", "The controls protect different failure modes and introduce retained-data cost that must be governed.", [0,1,7]),
    F("blob-versioning", "[07] Which sequence restores a previous blob version as current?", "List versions, identify and validate the desired version ID, copy that version over the base blob to create a new current version, then verify content and retain audit evidence.", "Previous versions remain immutable; recovery writes the selected state as the current blob.", [1,3,5]),
    F("container-soft-delete", "[07] Which sequence restores a deleted container?", "List deleted containers, confirm the original name is unused, select the deletion/version identifier when required, restore within retention, and validate its contents and access controls.", "Container restore re-creates the deletion-time state under the original name.", [2,4,7]),
    F("container-soft-delete", "[07] A soft-deleted container cannot be restored because a new container has the same name. What is the correction?", "Rename or remove the conflicting active container, then restore the deleted container under its original name while retention remains.", "The restore operation requires the original container name to be available.", [2,4,6]),
    F("blob-versioning", "[07] Versioning cannot be enabled on an account with hierarchical namespace. What explains the result?", "Blob versioning isn't supported for hierarchical-namespace accounts in the documented feature matrix.", "The protection design must use capabilities supported by the account's namespace configuration.", [0,1,5]),
    F("blob-versioning", "[07] Versioning was disabled, but old version IDs are still listed. Is this an error?", "No; disabling versioning stops creation of new versions but does not delete existing versions.", "Existing versions remain addressable until lifecycle or explicit deletion removes them.", [1,5,6]),
    F("container-soft-delete", "[07] The container retention setting changed from 14 to 30 days, but a container deleted yesterday still expires under 14 days. Why?", "The retention value in effect at deletion continues to govern that already deleted container.", "A later configuration change applies to subsequent deletions rather than rewriting prior retention state.", [2,5,6]),
    F("blob-soft-delete", "[07] A blob was deleted from an active container, but only container soft delete is enabled. Why is individual recovery unavailable?", "Container soft delete does not protect a blob deletion when the container itself wasn't deleted.", "Blob soft delete or versioning must protect the individual object operation.", [0,2,7]),
    F("blob-soft-delete", "[07] Which CLI operation restores a soft-deleted blob while its container remains active?", "Use the Blob undelete operation for the target container or blob, before the configured blob soft-delete retention expires.", "Blob soft delete restores retained deleted blob state inside an active container; container soft delete is a separate whole-container control.", [0,3,6]),
    F("blob-versioning", "[07] What is the boundary between versioning and blob soft delete?", "Versioning automatically preserves prior states on writes; blob soft delete retains deleted blob states for a fixed recovery interval.", "Use versioning for overwrite history and soft delete for deletion recovery, often together.", [0,1,3]),
  ],
  "AZ104-N04-B08": [
    F("azure-files-planning", "[08] Windows clients require identity-based access and Windows ACLs. Which Azure Files protocol should the share use?", "Create an SMB file share and configure the supported SMB identity source and permissions.", "The Kerberos and Windows ACL authorization model applies to Azure Files over SMB.", [0,6,7]),
    F("azure-files-planning", "[08] Linux clients require NFS 4.1 and no SMB access on the same share. What should be created?", "Create an NFS file share in a supported SSD account, region, and network configuration.", "NFS is selected per share and has documented account and deployment constraints.", [0,6,7]),
    F("azure-files-snapshots", "[08] One file was corrupted yesterday and the team needs its point-in-time content without replacing the whole share. What should be used?", "Open the appropriate share snapshot and copy or restore that individual file to the live share.", "A share snapshot exposes read-only point-in-time files for item-level recovery.", [1,2,6]),
    F("azure-files-data-protection", "[08] An entire file share may be accidentally deleted and must remain recoverable for 21 days. Which account setting fits?", "Enable Azure Files share soft delete with a 21-day retention period.", "Soft delete retains the deleted share for undelete during the configured interval.", [2,4,6]),
    F("azure-file-sync-overview", "[08] Branch users need local Windows Server performance while Azure Files holds the centralized namespace. Which service fits?", "Deploy Azure File Sync with the Azure file share as cloud endpoint and branch paths as server endpoints.", "File Sync caches and synchronizes the centralized Azure Files namespace to Windows Servers.", [1,5,7]),
    F("azure-files-create-share", "[08] Which sequence creates an SMB Azure file share?", "Choose a compatible storage account, create the share with SMB, set tier and quota or provisioned capacity, configure networking and identity, enable protection, then test a client mount.", "Protocol, capacity, network, authorization, and protection are all part of a usable share deployment.", [0,5,7]),
    F("azure-files-snapshots", "[08] Which sequence restores an entire Azure file share from a share snapshot?", "Create or select a writable destination share, copy the required directory and file tree from the read-only snapshot, validate permissions and completeness, then switch clients to the restored destination according to the recovery plan.", "A share snapshot is read-only and is not promoted in place; whole-share recovery is a copy operation into a writable destination.", [0,3,7]),
    F("azure-files-data-protection", "[08] Which sequence recovers a soft-deleted Azure file share?", "List deleted shares, select the intended share and deletion instance, undelete it before retention expires, then validate quota, permissions, snapshots, and client access.", "Undelete reactivates the retained share state, after which effective configuration must be verified.", [2,4,6]),
    F("azure-file-sync-overview", "[08] Which sequence creates an Azure File Sync topology for one branch?", "Create a Storage Sync Service, create a sync group and cloud endpoint for the Azure file share, install and register the agent on Windows Server, create the server endpoint, then monitor initial sync.", "A sync group binds one cloud endpoint to registered server endpoints.", [1,5,7]),
    F("azure-files-snapshots", "[08] Creating another share snapshot fails because the share already has 200 snapshots. What is required?", "Delete an obsolete snapshot according to retention policy before creating another one.", "Azure Files enforces a maximum of 200 snapshots per share and doesn't silently replace an existing recovery point.", [1,3,6]),
    F("azure-files-data-protection", "[08] A deleted share is successfully undeleted but storage cost never fell during deletion. Why?", "Soft-deleted Azure file share capacity remains billable during the retention period.", "Soft delete preserves recoverable data rather than releasing its used capacity immediately.", [2,4,6]),
    F("azure-file-sync-overview", "[08] A registered File Sync server shows Appears Offline and synchronization has stopped. What layer should be checked first?", "Check that the Azure Storage Sync Monitor and agent services run and that the server can reach Azure File Sync service endpoints.", "Registered-server health depends on the local agent processes and outbound service connectivity.", [1,5,7]),
    F("azure-files-create-share", "[08] Which CLI operation creates a provisioned Azure file share with an explicit protocol and capacity?", "Use `az storage share-rm create` with the account, share name, enabled protocol, and quota or provisioned capacity settings.", "The resource-manager share command expresses protocol and provisioned configuration at creation.", [0,6,7]),
    F("azure-files-data-protection", "[08] What is the boundary between Azure File Sync and a share snapshot?", "File Sync propagates and caches namespace changes across endpoints; a snapshot is a read-only point-in-time recovery copy of one share.", "Synchronization serves hybrid access, while snapshots provide independent recovery state.", [1,2,5]),
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
if (allCards.length !== 128) throw new Error(`N04 has ${allCards.length} cases; expected 128.`);
if (new Set(allCards.map((card) => card.prompt)).size !== allCards.length) throw new Error("Every N04 prompt must be unique.");
const distractorSets = new Set();
for (const card of allCards) {
  if (card.wrongs.length !== 3 || new Set([card.correct, ...card.wrongs.map((wrong) => wrong.text)]).size !== 4) throw new Error(`Options are incomplete or duplicated: ${card.prompt}`);
  if (card.wrongs.some((wrong) => !wrong.why)) throw new Error(`Every distractor needs individual feedback: ${card.prompt}`);
  if (!card.reason || !card.boundary || !card.transfer) throw new Error(`Incomplete feedback plan: ${card.prompt}`);
  const distractorSet = card.wrongs.map((wrong) => wrong.text.trim().replace(/\s+/g, " ")).sort().join("\u001f");
  if (distractorSets.has(distractorSet)) throw new Error(`Every N04 distractor set must be unique across cards: ${card.prompt}`);
  distractorSets.add(distractorSet);
}

if (process.argv.includes("--check")) {
  console.log(`AZ104-N04 slot-order QA passed for ${allCards.length} cases across ${Object.keys(blocks).length} blocks.`);
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
