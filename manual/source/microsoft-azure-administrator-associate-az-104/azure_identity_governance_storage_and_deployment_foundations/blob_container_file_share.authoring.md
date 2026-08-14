# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / blob_container_file_share

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/blob_container_file_share.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:blob_container_file_share:blob_container_azure_files_share_object_versus_smb_nfs_file_access:slot:diagnose-protocol-mismatch-for-application

- Status: authoring-admitted
- Objective: Identify a workload failure caused by using object storage where a mounted file protocol is required, or the reverse.
- Expected decision: Move the workload to the service matching its access semantics.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:blob_container_file_share:blob_container_azure_files_share_object_versus_smb_nfs_file_access:slot:select-azure-files-for-smb-share

- Status: authoring-admitted
- Objective: Choose Azure Files when clients require a managed SMB file share with file and directory semantics.
- Expected decision: Provision an Azure file share and configure supported SMB authentication.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:blob_container_file_share:blob_container_azure_files_share_object_versus_smb_nfs_file_access:slot:select-azure-files-for-supported-nfs-workload

- Status: authoring-admitted
- Objective: Choose an Azure Files NFS share only when the account, protocol, and network prerequisites are supported.
- Expected decision: Provision the supported NFS share and private network path.
- Decisive boundary: A need for POSIX-like access does not make every Azure Files account configuration NFS-capable.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:blob_container_file_share:blob_container_azure_files_share_object_versus_smb_nfs_file_access:slot:select-blob-for-object-access

- Status: authoring-admitted
- Objective: Choose Blob Storage when the application addresses objects through blob APIs or HTTP endpoints.
- Expected decision: Store objects in a blob container.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:blob_container_file_share:container_share_directory_access_controls_correct_boundary:slot:apply-ntfs-acl-for-smb-directory-authorization

- Status: authoring-admitted
- Objective: Use NTFS ACLs for directory and file authorization after share-level SMB access succeeds.
- Expected decision: Grant only the required directory/file ACEs.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:blob_container_file_share:container_share_directory_access_controls_correct_boundary:slot:distinguish-share-permission-from-directory-acl

- Status: authoring-admitted
- Objective: Diagnose access by separating the share-level role from the NTFS ACL on the requested path.
- Expected decision: Fix the layer that denies access; both must permit the SMB operation.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:blob_container_file_share:container_share_directory_access_controls_correct_boundary:slot:select-container-level-rbac-for-blob-data

- Status: authoring-admitted
- Objective: Assign a Blob data role at container scope when the principal needs one container and descendants.
- Expected decision: Avoid account scope when no other containers are required.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:blob_container_file_share:container_share_directory_access_controls_correct_boundary:slot:select-share-level-rbac-for-files

- Status: authoring-admitted
- Objective: Assign the supported Azure Files data role at share scope for share-level access.
- Expected decision: Grant the share role before evaluating directory/file permissions.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
