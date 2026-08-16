import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildManifest, ROOT } from "./lib/model.mjs";

const TRACK = "microsoft-azure-administrator-associate-az-104";
const NODE = "entra_identity_lifecycle_and_authentication";
const BLOCK = "AZ104-N01-B01";
const BATCH = "az104-2026-08-16-AZ104-N01-B01";
const CREATED_AT = "2026-08-16T00:00:00Z";
const provenance = { authoringMethod: "manual", approvalStatus: "unapproved", author: "Codex", createdAt: CREATED_AT, contentBatchId: BATCH };

// Every entry is a reviewed slot-specific decision. The code below only materializes the shared envelope.
const authored = [
  {
    suffix: "scenario-decision-01",
    url: "https://learn.microsoft.com/en-us/entra/fundamentals/whatis",
    prompt: "Contoso has one Microsoft Entra tenant and three Azure subscriptions. A new team needs separate Azure billing and resource quotas but must keep using the existing Contoso identities. What should the administrator create?",
    constraints: ["Keep the existing identity directory.", "Create a separate billing and quota boundary.", "Do not introduce another authentication-policy boundary."],
    options: [
      ["A new Azure subscription associated with the existing tenant.", "A subscription creates the requested resource, billing, and quota boundary while continuing to use principals from the existing tenant."],
      ["A new Microsoft Entra tenant without a subscription.", "A tenant separates identity administration but does not itself create the requested Azure resource and quota boundary."],
      ["A new resource group in an existing subscription.", "A resource group is a lifecycle container and does not provide independent subscription quotas or billing."],
      ["A new management group containing the current subscriptions.", "A management group scopes inherited governance but does not create a new billing or quota boundary."]
    ], answer: 0,
    reason: "An Azure subscription is the resource, quota, and billing boundary; its associated Microsoft Entra tenant supplies the identities used for authorization.",
    mechanism: "Subscriptions trust principals from an associated tenant while retaining their own Azure resource and commercial boundaries.",
    application: "Create the team subscription under the current tenant and assign existing users or groups at the required scopes.",
    error: "A new tenant changes identity ownership, while resource groups and management groups do not create subscription quotas.",
    boundary: "Directory policies remain shared because the subscription still uses the existing tenant.",
    transfer: "Choose a separate tenant only when directory administration or authentication policy must also be independent."
  },
  {
    suffix: "scenario-decision-02", url: "https://learn.microsoft.com/en-us/entra/fundamentals/whatis",
    prompt: "Fabrikam must administer its own users, authentication methods, and external-collaboration settings without Contoso directory administrators changing them. Which boundary is required?",
    constraints: ["Directory administrators must be independent.", "Authentication policies must be isolated.", "Azure billing arrangements may be handled separately."],
    options: [
      ["A resource group in the Contoso subscription.", "A resource group cannot isolate tenant-level identities or authentication settings."],
      ["A separate Microsoft Entra tenant for Fabrikam.", "A tenant is the directory and identity-policy boundary that provides independent administration."],
      ["A management group in the Contoso tenant.", "A management group organizes Azure subscriptions but does not create a new directory."],
      ["A security group containing Fabrikam users.", "A group remains inside one tenant and under that tenant's directory administration."]
    ], answer: 1,
    reason: "Independent directory administration and identity policy require a separate Microsoft Entra tenant.",
    mechanism: "A tenant owns users, groups, applications, directory roles, and tenant-level identity configuration.",
    application: "Provision Fabrikam in its own tenant and design cross-tenant collaboration explicitly.",
    error: "Azure resource scopes and groups do not isolate tenant-level directory ownership.",
    boundary: "A second tenant increases cross-tenant governance work but supplies the required identity separation.",
    transfer: "Use subscriptions or management groups when only Azure resource governance must differ."
  },
  {
    suffix: "scenario-decision-03", url: "https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals",
    prompt: "A SaaS application is registered in its publisher's tenant. Contoso consents to the app and wants to assign Contoso groups to it. Which Contoso object receives those tenant-local assignments?",
    constraints: ["The publisher retains the application definition.", "Contoso needs a local security principal.", "Assignments must be owned in the Contoso tenant."],
    options: [
      ["The publisher tenant's Azure subscription.", "A subscription is an Azure resource scope, not the application's local identity in Contoso."],
      ["A duplicate human user account.", "A user is the wrong identity type for representing an application."],
      ["The application's service principal in the Contoso tenant.", "The service principal is the tenant-local application identity used for consent and assignments."],
      ["A management group named after the application.", "A management group scopes Azure governance and cannot represent an application identity."]
    ], answer: 2,
    reason: "A service principal is the local representation of an application in a Microsoft Entra tenant.",
    mechanism: "The application object defines the software, while each consuming tenant uses a service principal as its security principal.",
    application: "Assign Contoso users or groups to the Contoso service principal rather than changing the publisher's application object.",
    error: "Subscriptions, users, and management groups do not provide the tenant-local application identity.",
    boundary: "Deleting Contoso's service principal removes its local enterprise application but not the publisher's registration.",
    transfer: "For an Azure-hosted workload that only needs service authentication, evaluate managed identity."
  },
  {
    suffix: "scenario-decision-04", url: "https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview",
    prompt: "An Azure VM must retrieve Key Vault secrets. Policy forbids storing a client secret or certificate on the VM, and Azure must manage credential rotation. Which identity should be used?",
    constraints: ["Store no application credential on the VM.", "Tie identity lifecycle to the VM.", "Grant only the required Key Vault access."],
    options: [
      ["A shared user with a non-expiring password.", "This introduces a human credential and manual secret lifecycle, violating policy."],
      ["A system-assigned managed identity on the VM.", "Azure creates the principal and manages its credential lifecycle; authorization can then be scoped to Key Vault."],
      ["The VM subscription ID used as a token.", "A subscription ID identifies a scope and is not an authentication credential."],
      ["A resource lock on the Key Vault.", "A lock restricts management operations and does not authenticate the workload."]
    ], answer: 1,
    reason: "Managed identity provides an Entra principal to an Azure resource without administrator-managed credentials.",
    mechanism: "A system-assigned identity is created for one resource and Azure manages token-signing credentials.",
    application: "Enable the VM identity and assign it the narrow Key Vault data role required by the workload.",
    error: "Passwords, subscription IDs, and locks do not meet the service-authentication requirement.",
    boundary: "Managed identity removes credential handling but does not grant permissions automatically.",
    transfer: "Use a user-assigned managed identity when several resources must share an independent identity lifecycle."
  },
  {
    suffix: "scenario-decision-05", url: "https://learn.microsoft.com/en-us/entra/external-id/what-is-b2b",
    prompt: "A partner employee must access one Contoso application with credentials managed by the partner. Contoso needs a local object for group assignment and later access review. What should Contoso create?",
    constraints: ["Do not issue a shared Contoso password.", "Represent the person in Contoso's directory.", "Keep application authorization under Contoso control."],
    options: [
      ["A B2B collaboration guest user in Contoso's tenant.", "The guest object represents the external person locally while authentication can remain with the home organization."],
      ["An Azure resource group for the partner.", "A resource group cannot represent or authenticate a person."],
      ["A managed identity assigned to the partner's browser.", "Managed identities represent supported Azure resources, not external human users."],
      ["A new Contoso tenant containing only the application.", "A new tenant is broader than the requested collaboration relationship."]
    ], answer: 0,
    reason: "B2B collaboration creates a tenant-local guest object while allowing the external user to authenticate with an external identity.",
    mechanism: "The guest receives a Contoso object ID and can join groups or receive application assignments after redemption.",
    application: "Invite the partner, verify redemption, and assign only the required application access.",
    error: "Resource groups and managed identities are not external human identities, and another tenant is unnecessary.",
    boundary: "Invitation redemption establishes identity presence but grants no application or Azure resource access by itself.",
    transfer: "Use an application trust rather than a guest user when the external actor is software, not a person."
  },
  {
    suffix: "scenario-decision-06", url: "https://learn.microsoft.com/en-us/entra/fundamentals/compare",
    prompt: "A legacy server workload requires LDAP, Kerberos, computer domain join, and Group Policy. The company currently uses Microsoft Entra ID for cloud sign-in. Which conclusion is correct?",
    constraints: ["All four classic domain capabilities are mandatory.", "Do not equate similar identity terminology with equivalent protocols.", "Choose a supported directory boundary."],
    options: [
      ["Microsoft Entra ID alone supplies all required AD DS protocols.", "Cloud directory membership does not provide classic AD DS LDAP, domain join, and Group Policy."],
      ["Azure RBAC on the servers supplies LDAP and Group Policy.", "Azure RBAC authorizes Azure resource operations and is not a Windows domain service."],
      ["A management group supplies the domain hierarchy.", "Management groups organize subscriptions and provide no directory protocols."],
      ["The workload requires AD DS or a supported managed domain service in addition to the Entra design.", "An AD DS-compatible domain service provides the required protocols and domain-management model."]
    ], answer: 3,
    reason: "Microsoft Entra ID is a cloud identity service; LDAP, Kerberos domain join, and Group Policy are classic AD DS domain capabilities.",
    mechanism: "Entra ID and AD DS differ in protocols, object management, and trust model even when identities are synchronized.",
    application: "Keep Entra for cloud identity and add an appropriate domain service for the legacy workload.",
    error: "Azure RBAC and management groups are governance mechanisms, not directory protocol services.",
    boundary: "Adding domain services introduces network, DNS, domain lifecycle, and synchronization work.",
    transfer: "For modern OAuth, OIDC, or SAML applications, prefer Entra integration instead of introducing AD DS by habit."
  },
  {
    suffix: "configuration-sequence-07", url: "https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals",
    prompt: "A daemon running outside Azure must call an Azure API without a signed-in user. Which sequence correctly establishes its identity and authorization?",
    constraints: ["The host cannot use Azure managed identity.", "Authentication is application-only.", "The principal must exist before authorization is assigned."],
    options: [
      ["Create an app registration and tenant service principal, configure a protected credential or federation, then grant the principal only required access.", "This creates the definition, local principal, authentication method, and authorization in the required order."],
      ["Assign RBAC to the application display name before creating its identity.", "RBAC needs an existing, unambiguous security principal."],
      ["Create a resource lock and use the lock ID as a credential.", "Resource locks do not create identities or credentials."],
      ["Create a new user for every run and embed its password.", "Human passwords are the wrong application-only credential model and violate secret protection."]
    ], answer: 0,
    reason: "A noninteractive application needs an application definition, tenant-local service principal, authentication method, and separate authorization.",
    mechanism: "The registration defines the client; the service principal is authorized; a credential or federation proves the application's identity.",
    application: "Create the identity artifacts, secure the authentication method, then assign only the required API or Azure role.",
    error: "RBAC cannot target a nonexistent principal, locks are not identities, and human passwords are inappropriate.",
    boundary: "Client secrets require rotation; certificates or workload federation can reduce secret risk when supported.",
    transfer: "Prefer managed identity when the workload later moves to a supported Azure hosting service."
  },
  {
    suffix: "configuration-sequence-08", url: "https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview",
    prompt: "An App Service app will read blobs with a system-assigned managed identity. Which implementation sequence is correct?",
    constraints: ["Store no account key or client secret.", "Grant blob read access only.", "Create the principal before its role assignment."],
    options: [
      ["Assign a role to the app name, then enable identity only if access fails.", "The principal ID does not exist until managed identity is enabled, and name matching is ambiguous."],
      ["Enable identity, capture its principal ID, assign Storage Blob Data Reader at the required scope, then request a managed-identity token.", "This creates the principal before authorization and grants only the required data action."],
      ["Enable identity and assume it automatically becomes subscription Owner.", "Managed identity creates a principal but grants no permissions automatically."],
      ["Enable identity and make the container anonymous instead of assigning RBAC.", "Anonymous access defeats the identity-based least-privilege requirement."]
    ], answer: 1,
    reason: "The managed identity principal must exist before RBAC can authorize it, and enabling identity alone grants no data access.",
    mechanism: "A system-assigned identity creates an Entra service principal tied to the App Service resource.",
    application: "Enable identity first, assign Storage Blob Data Reader at container or account scope, and use token authentication.",
    error: "Display-name targeting, assumed Owner rights, and anonymous access violate the identity and authorization model.",
    boundary: "Deleting the app deletes its system-assigned identity and leaves its former principal unusable.",
    transfer: "Use a user-assigned identity when the identity must survive replacement of the App Service resource."
  },
  {
    suffix: "troubleshooting-effective-state-09", url: "https://learn.microsoft.com/en-us/graph/auth-v2-service",
    prompt: "A Microsoft Graph script signs in successfully, but lookup by a known user object ID returns resource not found. The object is visible in another organization's Entra admin center. What should be checked first?",
    constraints: ["The object ID was copied exactly.", "Authentication succeeded.", "The object exists in another tenant."],
    options: [
      ["Whether the script authenticated to the tenant that owns the object.", "Object IDs resolve within a tenant context; the evidence points directly to the wrong tenant."],
      ["Whether the user has an Azure cost budget.", "Budgets do not affect Graph directory-object resolution."],
      ["Whether a subscription has a CanNotDelete lock.", "Azure resource locks do not control Graph directory lookup."],
      ["Whether the display name follows storage-account naming rules.", "Storage naming rules are unrelated to Entra user lookup."]
    ], answer: 0,
    reason: "A directory object ID is resolved inside a specific tenant; the correct ID queried against another tenant produces a not-found result.",
    mechanism: "Microsoft Graph requests run in the authenticated tenant context unless a supported cross-tenant operation is explicitly used.",
    application: "Inspect the token tenant ID, reconnect to the owning tenant, and repeat the exact-ID lookup.",
    error: "Budgets, locks, and storage naming cannot alter Graph's directory context.",
    boundary: "The same person may have separate objects and object IDs in different tenants.",
    transfer: "For RBAC troubleshooting, confirm that a role assignment uses the principal object from the subscription's associated tenant."
  },
  {
    suffix: "troubleshooting-effective-state-10", url: "https://learn.microsoft.com/en-us/entra/fundamentals/how-to-manage-user-profile-info",
    prompt: "A user's UPN changes from alex@old.contoso.com to alex@contoso.com. Automation targeting the old UPN now fails, but the existing account and memberships must be preserved. Which identifier should the job use?",
    constraints: ["Update the existing object.", "The sign-in name changed.", "Do not create a replacement account."],
    options: [
      ["The current display name.", "Display names are mutable and not guaranteed unique."],
      ["The user's Azure subscription ID.", "A subscription ID identifies an Azure resource boundary, not a user."],
      ["The user's Microsoft Entra object ID.", "The object ID remains the stable identifier when UPN and other profile properties change."],
      ["The object ID of the user's primary group.", "That ID targets the group rather than the user to update."]
    ], answer: 2,
    reason: "The object ID is the stable key for the user object; UPN and display name are mutable properties.",
    mechanism: "Changing a UPN updates a property on the same directory object and does not create a new object ID.",
    application: "Persist or resolve the exact user object ID and target the update by that ID.",
    error: "Names, subscription IDs, and group IDs do not durably identify the user object.",
    boundary: "Object IDs are tenant-specific; a guest representation of the same person has another object ID.",
    transfer: "Use immutable IDs for role assignments and automation joins when readable identifiers can be renamed or reused."
  },
  {
    suffix: "tool-or-iac-11", url: "https://learn.microsoft.com/en-us/powershell/microsoftgraph/overview",
    prompt: "An administrator must update a governed department attribute for 4,000 Entra users from CSV, record every failure, and rerun only failed rows. Which approach is most appropriate?",
    constraints: ["This is a directory data change, not an Azure resource deployment.", "Record per-user results.", "Make the process repeatable."],
    options: [
      ["Use Microsoft Graph PowerShell or Graph API with exact IDs, input validation, and per-request error logging.", "Graph is the supported programmatic surface for Entra objects and exposes per-object outcomes."],
      ["Declare all users in an ARM template.", "ARM templates manage Azure resources, not Entra user profiles."],
      ["Use AzCopy sync between the CSV and tenant.", "AzCopy transfers storage data and cannot update directory users."],
      ["Use Azure Policy remediation to modify user departments.", "Azure Policy evaluates Azure resources, not Entra user properties."]
    ], answer: 0,
    reason: "Microsoft Graph is the correct automation surface for Entra directory objects; ARM, AzCopy, and Azure Policy operate on different planes.",
    mechanism: "Graph calls can target exact object IDs and return operation-specific success or failure information.",
    application: "Validate input, process within throttling limits, log each result, and construct a retry set from failed rows.",
    error: "ARM and Policy target Resource Manager resources; AzCopy targets storage data.",
    boundary: "Bulk automation must handle throttling, partial failure, authorization, and idempotent retry.",
    transfer: "Use the admin center for a small inspected change when scale and repeatability are not required."
  },
  {
    suffix: "boundary-or-contrast-12", url: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/rbac-and-directory-admin-roles",
    prompt: "One operator can reset Entra user passwords but cannot restart a VM. Another can restart the VM but cannot reset passwords. Both assignments are intentional. Which explanation is correct?",
    constraints: ["Do not broaden either operator's access.", "Identify both authorization planes.", "Treat successful sign-in separately from operation authorization."],
    options: [
      ["Entra directory roles and Azure RBAC roles authorize different administrative planes.", "Password administration is governed by Entra roles; VM management is governed by Azure RBAC."],
      ["Every Entra role automatically maps to an equivalent Azure role.", "No general automatic permission mapping exists between the two role systems."],
      ["VM restart requires a Microsoft 365 license instead of RBAC.", "Product licensing does not grant Azure compute management actions."],
      ["Password reset is authorized by a VM resource lock.", "Locks constrain resource changes and do not grant directory permissions."]
    ], answer: 0,
    reason: "Entra roles govern directory administration; Azure RBAC governs Azure resource operations at Azure scopes.",
    mechanism: "Each authorization system evaluates its own role definitions, principals, and scopes for a different plane.",
    application: "Keep the directory help-desk role and VM operator role separate because each already matches its duty.",
    error: "Licenses and locks do not bridge the role systems, and similar role names do not imply equivalent permissions.",
    boundary: "A portal may display both planes, but the underlying authorization checks remain separate.",
    transfer: "Before selecting a role, identify whether the target is a directory object, Azure resource, or service data."
  },
  {
    suffix: "boundary-or-contrast-13", url: "https://learn.microsoft.com/en-us/azure/role-based-access-control/role-definitions",
    prompt: "An engineer can create a storage account but receives authorization failure when listing blobs with Entra authentication. Which boundary explains the result?",
    constraints: ["Storage account creation succeeded.", "Anonymous access and account keys are prohibited.", "Blob listing uses the engineer's Entra identity."],
    options: [
      ["Account creation is control-plane; blob listing is data-plane and needs a storage data role.", "Resource management and blob data access are distinct authorization surfaces."],
      ["A tenant may contain users or Azure resources, but never both.", "Tenants supply identities used to authorize resources; these concepts are not mutually exclusive."],
      ["A subscription permits creation only after every blob is public.", "Public blob access is unrelated to storage-account resource creation."],
      ["The user must be converted into a service principal.", "A user can receive a storage data role; identity-type conversion is not the missing permission."]
    ], answer: 0,
    reason: "Resource Manager permission can authorize storage-account management without authorizing access to blob contents.",
    mechanism: "Role definitions distinguish management actions from service data actions, and Storage supplies blob data roles.",
    application: "Keep the management assignment and add Storage Blob Data Reader at the narrowest required scope.",
    error: "Tenant composition, public access, and identity-type conversion do not explain the plane-specific result.",
    boundary: "Granting data access exposes stored content and should not be implied by generic resource visibility.",
    transfer: "Apply the same plane distinction to Key Vault secrets, queues, tables, and other service data."
  },
  {
    suffix: "boundary-or-contrast-14", url: "https://learn.microsoft.com/en-us/azure/governance/management-groups/overview",
    prompt: "An architect places two subscriptions under separate management groups and claims this guarantees a different Entra user directory for each subscription. Is the claim correct?",
    constraints: ["Both subscriptions currently trust one tenant.", "Management groups may carry Policy and RBAC assignments.", "The requirement is a separate user directory."],
    options: [
      ["Yes; each management group creates a child Entra tenant.", "Management groups do not create or own child tenants."],
      ["Yes; management-group Policy duplicates every user into a new directory.", "Azure Policy evaluates Azure resources and does not create tenant directories."],
      ["No; management groups separate inherited Azure governance, while a separate directory requires another tenant and explicit subscription association.", "The hierarchy change leaves both subscriptions using the same tenant directory."],
      ["No; subscriptions cannot be organized under management groups.", "Subscriptions are the child resource type organized beneath management groups."]
    ], answer: 2,
    reason: "Management groups are governance scopes above subscriptions; Microsoft Entra tenants are separate identity-directory boundaries.",
    mechanism: "A management-group tree scopes inherited Azure Policy and RBAC to descendant subscriptions in a tenant.",
    application: "Use management groups for governance, but create another tenant when directory ownership must be independent.",
    error: "Management groups and Policy do not clone a directory, and subscriptions can be organized below management groups.",
    boundary: "Moving a subscription in the hierarchy changes inherited governance, not the tenant directory by itself.",
    transfer: "Verify tenant association directly; do not infer identity boundaries from resource hierarchy names."
  }
];

const { manifest, model } = await buildManifest(ROOT);
const manifestTrack = manifest.tracks.find((entry) => entry.trackId === TRACK);
const canonicalTrack = model.curricula.get(TRACK);
if (!manifestTrack || !canonicalTrack) throw new Error("AZ-104 authoring model is unavailable.");
const manifestSlots = new Map(manifestTrack.slots.filter((slot) => slot.learningBlockId === BLOCK).map((slot) => [slot.slotId.split(":").at(-1), slot]));
const normalizedSlots = new Map(canonicalTrack.normalized.slots.map((slot) => [slot.slotId, slot]));
if (authored.length !== 14 || manifestSlots.size !== 14) throw new Error("AZ104-N01-B01 must contain exactly 14 slots.");

const items = authored.map((question, index) => {
  const slot = manifestSlots.get(question.suffix);
  if (!slot?.authoringAdmitted || !slot.sourceBinding) throw new Error(`${question.suffix} lacks exact source admission.`);
  const normalized = normalizedSlots.get(slot.slotId);
  const optionIds = ["A", "B", "C", "D"];
  return {
    itemId: `az104-${BLOCK}-${String(index + 1).padStart(3, "0")}`,
    slotId: slot.slotId,
    nodeId: NODE,
    learningBlockId: BLOCK,
    taxonomy: { examDomainId: normalized.raw.primarySimulationDomainId, competencyAreaId: NODE, topicId: BLOCK, skillAtomId: normalized.raw.directSkillOrDecisionAtomId },
    prompt: question.prompt,
    constraints: question.constraints,
    interaction: { type: "choice", selectionMode: "single", options: question.options.map((option, i) => ({ optionId: optionIds[i], text: option[0] })), acceptedOptionIds: [optionIds[question.answer]] },
    scoringContract: { type: "choice", resultSemantics: "exact_selected_set_with_partial_v1", selectionMode: "single" },
    feedback: {
      Reason: question.reason,
      Details: { mechanismOrProperty: question.mechanism, scenarioApplication: question.application, errorCorrection: question.error, boundaryOrTradeoff: question.boundary, transfer: question.transfer, url: question.url },
      wrongOptionExplanationsByOptionId: Object.fromEntries(question.options.map((option, i) => [optionIds[i], option[1]]).filter((_, i) => i !== question.answer)),
      omittedCorrectElementExplanationsByOptionId: {}
    },
    modeEligibility: slot.modeEligibility,
    sourceBinding: slot.sourceBinding,
    authoringProvenance: provenance
  };
});

if (new Set(items.map((item) => item.prompt)).size !== 14) throw new Error("Prompts must be unique.");
for (const item of items) {
  const directRefs = new Set(item.sourceBinding.sourceRefs);
  const sourceId = canonicalTrack.sourceRecords.find((source) => source.url === item.feedback.Details.url)?.sourceId;
  if (!sourceId || !directRefs.has(sourceId)) throw new Error(`${item.slotId} Details.url is not its exact direct source binding.`);
}

const payload = {
  schemaVersion: "certification-manual-source-v2", batchId: BATCH, trackId: TRACK, familyId: "certification",
  contentVersion: "microsoft-azure-administrator-associate-az-104-authoring-v2026.08.15", taxonomyVersion: "2026.08.15",
  nodeId: NODE, learningBlockId: BLOCK, slotIds: items.map((item) => item.slotId), items, authoringProvenance: provenance
};
const output = join(ROOT, "manual", "source", TRACK, NODE, `${BLOCK}.json`);
await mkdir(join(output, ".."), { recursive: true });
await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Authored ${items.length} reviewed questions at ${output}.`);
