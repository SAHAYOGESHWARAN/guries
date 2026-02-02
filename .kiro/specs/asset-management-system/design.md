# Design Document: Asset Management System

## Overview

The Asset Management System is a comprehensive solution for managing digital assets with hierarchical service organization, automated linking, and quality control workflow management. The system provides a complete asset lifecycle from creation through approval, with real-time status tracking and team coordination features.

### Key Design Principles

1. **Hierarchical Organization**: Services and sub-services provide flexible asset grouping
2. **Automatic Linking**: Assets are linked to services during upload without manual steps
3. **Immutable Links**: Asset-service associations are permanent and non-removable
4. **Real-Time Awareness**: Socket.io enables live status updates across all clients
5. **Workflow Transparency**: Current working team is always visible on assets
6. **Data Integrity**: SQLite persistence ensures consistency across sessions

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Service Creation UI  │  Asset Upload UI  │  QC Review UI   │
│  Service Pages        │  Asset Details    │  Status Display │
└────────────┬──────────────────────────────────────────────┬──┘
             │                                              │
             │         Socket.io (Real-time)               │
             │                                              │
┌────────────▼──────────────────────────────────────────────▼──┐
│                  Backend (Express.js)                        │
├─────────────────────────────────────────────────────────────┤
│  Service Controller   │  Asset Controller  │  QC Controller │
│  Service Routes       │  Asset Routes      │  QC Routes     │
│  Slug Generator       │  Link Manager      │  Status Manager│
└────────────┬──────────────────────────────────────────────┬──┘
             │                                              │
             │         Database Queries                    │
             │                                              │
┌────────────▼──────────────────────────────────────────────▼──┐
│                  SQLite Database                             │
├─────────────────────────────────────────────────────────────┤
│  Services Table  │  Assets Table  │  Asset_Links Table      │
│  Workflow_Stages │  QC_Status     │  Audit_Log              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Asset Upload with Service Linking**:
```
User selects service → Upload form includes Linked Service → 
Asset uploaded → Auto-link to service → Asset appears in Web Repository → 
Socket.io broadcasts update → All clients see asset in service
```

**QC Approval Workflow**:
```
Asset in QC stage → QC reviewer approves → Update QC status → 
Update workflow stage → Remove from review queue → 
Socket.io broadcasts update → Status tag updates on all views
```

## Components and Interfaces

### 1. Service Management Component

**Responsibilities**:
- Create and store services and sub-services
- Generate URL slugs
- Maintain service hierarchy
- Provide service list for dropdowns

**Key Methods**:
```typescript
interface ServiceController {
  createService(name: string, description: string, parentId?: string): Promise<Service>
  getServiceById(id: string): Promise<Service>
  getAllServices(): Promise<Service[]>
  getSubServices(parentId: string): Promise<Service[]>
  updateService(id: string, updates: Partial<Service>): Promise<Service>
}

interface SlugGenerator {
  generateFromUrl(url: string): string
  generateFromName(name: string): string
  ensureUnique(slug: string): Promise<string>
}
```

### 2. Asset Management Component

**Responsibilities**:
- Handle asset uploads
- Manage asset metadata
- Track asset-service links
- Display assets in Web Repository

**Key Methods**:
```typescript
interface AssetController {
  uploadAsset(file: File, metadata: AssetMetadata, linkedServiceId?: string): Promise<Asset>
  getAssetById(id: string): Promise<Asset>
  getAssetsByService(serviceId: string): Promise<Asset[]>
  updateAssetStatus(id: string, status: WorkflowStage): Promise<Asset>
  getAssetWithStatus(id: string): Promise<AssetWithStatus>
}

interface AssetLinkManager {
  linkAssetToService(assetId: string, serviceId: string): Promise<void>
  getLinkedService(assetId: string): Promise<Service>
  validateLink(assetId: string, serviceId: string): Promise<boolean>
}
```

### 3. Workflow Status Component

**Responsibilities**:
- Track workflow stages
- Manage QC status
- Display current working team
- Update status tags

**Key Methods**:
```typescript
interface WorkflowManager {
  updateWorkflowStage(assetId: string, stage: WorkflowStage): Promise<Asset>
  getCurrentWorkingTeam(assetId: string): Promise<string>
  getStatusTag(assetId: string): Promise<StatusTag>
  broadcastStatusUpdate(assetId: string): Promise<void>
}

interface QCStatusManager {
  updateQCStatus(assetId: string, status: QCStatus): Promise<Asset>
  getQCStatus(assetId: string): Promise<QCStatus>
  isApproved(assetId: string): Promise<boolean>
}
```

### 4. QC Review Component

**Responsibilities**:
- Display assets in QC review
- Process approvals and rejections
- Update asset status
- Broadcast updates

**Key Methods**:
```typescript
interface QCReviewController {
  getAssetsInReview(): Promise<Asset[]>
  approveAsset(assetId: string, reviewerId: string): Promise<Asset>
  rejectAsset(assetId: string, reviewerId: string, reason: string): Promise<Asset>
  getReviewDetails(assetId: string): Promise<ReviewDetails>
}
```

### 5. Real-Time Update Component

**Responsibilities**:
- Broadcast status changes via Socket.io
- Update UI without page refresh
- Maintain client synchronization

**Key Methods**:
```typescript
interface SocketManager {
  broadcastServiceCreated(service: Service): void
  broadcastAssetLinked(asset: Asset, service: Service): void
  broadcastStatusChanged(assetId: string, newStatus: WorkflowStage): void
  broadcastQCApproved(assetId: string): void
  broadcastQCRejected(assetId: string, reason: string): void
}
```

## Data Models

### Service Model
```typescript
interface Service {
  id: string
  name: string
  description: string
  parentId?: string
  urlSlug: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}
```

### Asset Model
```typescript
interface Asset {
  id: string
  name: string
  fileUrl: string
  linkedServiceId: string
  workflowStage: WorkflowStage
  qcStatus: QCStatus
  currentWorkingTeam?: string
  uploadedBy: string
  uploadedAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

type WorkflowStage = 'CW' | 'GD' | 'QC' | 'Approved' | 'Rejected'
type QCStatus = 'QC Pending' | 'Approved' | 'Rejected'
```

### Asset Link Model
```typescript
interface AssetLink {
  id: string
  assetId: string
  serviceId: string
  linkedAt: Date
  linkedBy: string
}
```

### Status Tag Model
```typescript
interface StatusTag {
  assetId: string
  workflowStage: WorkflowStage
  workingTeam: string
  displayText: string
  color: string
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Service Creation Persistence

*For any* valid service creation request with name and description, the service should be stored in the database and retrievable with all required fields intact.

**Validates: Requirements 1.2, 9.1**

### Property 2: Service Hierarchy Preservation

*For any* sub-service created under a parent service, the parent-child relationship should be maintained and retrievable. Querying sub-services should return only those nested under the specified parent.

**Validates: Requirements 1.3**

### Property 3: Service Response Completeness

*For any* service creation request, the returned service object should contain all required fields (id, name, description, parentId, urlSlug, createdAt, updatedAt, createdBy).

**Validates: Requirements 1.4**

### Property 4: URL Slug Generation from URL

*For any* full URL provided during service creation, the system should extract and generate a URL-safe slug that accurately represents the URL's domain or path.

**Validates: Requirements 2.1**

### Property 5: URL Slug Generation from Name

*For any* service name provided without a URL, the system should generate a URL-safe slug from the service name by converting to lowercase, replacing spaces with hyphens, and removing special characters.

**Validates: Requirements 2.2, 2.3**

### Property 6: URL Slug Uniqueness with Suffix

*For any* service creation where the generated slug already exists, the system should append a numeric suffix to ensure uniqueness. Subsequent services with similar names should have incrementing suffixes.

**Validates: Requirements 2.4**

### Property 7: Asset-Service Link Creation

*For any* asset uploaded with a selected "Linked Service", the system should create an association between the asset and service in the database.

**Validates: Requirements 3.3, 3.4, 4.1**

### Property 8: Linked Assets in Web Repository

*For any* service, querying its Web Repository should return all assets linked to that service. When an asset is linked, it should immediately appear in the Web Repository without page refresh.

**Validates: Requirements 3.5, 8.1, 8.2**

### Property 9: Service Dropdown Completeness

*For any* asset upload form, the "Linked Service" dropdown should display all services and sub-services in the system. When a new service is created, it should appear in the dropdown.

**Validates: Requirements 3.2**

### Property 10: Asset-Service Link Immutability

*For any* asset linked to a service, attempting to remove or modify the link through any interface should fail. The link should remain unchanged and permanent.

**Validates: Requirements 4.1, 4.3**

### Property 11: Workflow Status Tag Display

*For any* asset with a workflow stage change to a team-specific stage (CW, GD, QC), a status tag should be displayed showing the team name and indicating they are working on the asset.

**Validates: Requirements 5.1, 5.2**

### Property 12: Status Tag Real-Time Updates

*For any* asset whose workflow stage changes, the status tag should update in real-time across all views displaying that asset without requiring manual refresh.

**Validates: Requirements 5.3, 5.5**

### Property 13: QC Status Update on Approval

*For any* asset approved through the QC Review module, the asset's QC status should change to "Approved" and the workflow stage should update to reflect the approved state.

**Validates: Requirements 6.1, 6.2**

### Property 14: QC Approval Queue Removal

*For any* asset approved through the QC Review module, the asset should be removed from the QC review queue and should not appear in subsequent QC review queries.

**Validates: Requirements 6.3**

### Property 15: QC Rejection with Stage Rollback

*For any* asset rejected through the QC Review module, the asset's QC status should change to "Rejected" and the workflow stage should revert to the previous stage.

**Validates: Requirements 6.5**

### Property 16: QC Status Persistence

*For any* change to an asset's QC status, the change should be persisted to the database and reflected across all views of that asset.

**Validates: Requirements 6.6**

### Property 17: QC Review Module Asset Filtering

*For any* query of the QC Review module, all returned assets should have a workflow stage of "QC" and QC status of "QC Pending".

**Validates: Requirements 7.1**

### Property 18: QC Review Asset Information Completeness

*For any* asset displayed in the QC Review module, the display should include asset name, linked service, current workflow stage, and QC status.

**Validates: Requirements 7.2**

### Property 19: Web Repository Status Display

*For any* asset in a service's Web Repository, the display should show both the asset's current workflow status and QC status.

**Validates: Requirements 8.4**

### Property 20: Web Repository Real-Time Updates

*For any* asset in a service's Web Repository, when the asset's status changes, the display should update in real-time without requiring page refresh.

**Validates: Requirements 8.5**

### Property 21: Database Persistence Round-Trip for Services

*For any* service created and persisted to the database, retrieving it should return an equivalent object with all fields intact.

**Validates: Requirements 9.1**

### Property 22: Database Persistence Round-Trip for Links

*For any* asset-service link created and persisted to the database, retrieving it should return an equivalent link with all fields intact.

**Validates: Requirements 9.2**

### Property 23: Database Persistence Round-Trip for Status

*For any* asset status change persisted to the database, retrieving the asset should reflect the updated status.

**Validates: Requirements 9.3**

### Property 24: Socket.io Status Change Broadcast

*For any* asset status change, the system should broadcast the update via Socket.io to all connected clients.

**Validates: Requirements 10.1**

### Property 25: Socket.io Service Creation Broadcast

*For any* new service created, the system should broadcast the update via Socket.io to all connected clients so it appears in service dropdowns.

**Validates: Requirements 10.2**

### Property 26: Socket.io Asset Link Broadcast

*For any* asset linked to a service, the system should broadcast the update via Socket.io to all clients viewing that service's page.

**Validates: Requirements 10.3**

### Property 27: Socket.io QC Approval Broadcast

*For any* QC approval processed, the system should broadcast the update via Socket.io to all clients viewing the asset or QC review module.

**Validates: Requirements 10.4**

## Error Handling

### Service Creation Errors
- **Duplicate Name**: Return validation error if service name already exists under same parent
- **Invalid Parent**: Return error if parent service ID doesn't exist
- **Missing Fields**: Return validation error if required fields are empty

### Asset Upload Errors
- **Invalid File**: Return error if file format is not supported
- **Service Not Found**: Return error if linked service ID doesn't exist
- **Upload Failure**: Return error if file storage fails

### QC Approval Errors
- **Invalid State**: Return error if asset is not in QC stage
- **Concurrent Update**: Return error if asset was modified by another user
- **Permission Denied**: Return error if user is not authorized to approve

### Socket.io Errors
- **Connection Lost**: Attempt to reconnect and queue updates
- **Broadcast Failure**: Log error and retry broadcast
- **Client Sync**: Validate client state and resync if needed

## Testing Strategy

### Unit Testing

**Service Management Tests**:
- Test service creation with valid inputs
- Test slug generation from URLs and names
- Test slug uniqueness enforcement
- Test sub-service hierarchy creation
- Test service retrieval and filtering

**Asset Management Tests**:
- Test asset upload with linked service
- Test asset retrieval by service
- Test asset metadata storage
- Test asset-service link creation
- Test link immutability (no removal)

**Workflow Status Tests**:
- Test workflow stage updates
- Test status tag generation
- Test working team identification
- Test QC status updates
- Test status persistence

**QC Review Tests**:
- Test QC approval processing
- Test asset removal from review queue
- Test status updates on approval
- Test rejection with reason
- Test concurrent approval handling

### Property-Based Testing

**Property 1: Service Slug Uniqueness**
- Generate random service names and URLs
- Create multiple services with similar names
- Verify each generated slug is unique
- Verify numeric suffixes are applied correctly

**Property 2: Asset-Service Link Immutability**
- Create assets and link them to services
- Attempt to modify or remove links through all interfaces
- Verify links remain unchanged
- Verify link information is read-only

**Property 3: Linked Assets Appear in Web Repository**
- Create services and upload assets with linked services
- Query Web Repository for each service
- Verify all linked assets appear immediately
- Verify assets persist across sessions

**Property 4: QC Approval Status Consistency**
- Create assets in QC stage
- Approve assets through QC Review module
- Verify QC status, workflow stage, and review queue are all updated
- Verify asset no longer appears in review queue

**Property 5: Workflow Status Tag Accuracy**
- Create assets with various workflow stages
- Update workflow stages
- Verify status tags reflect current stage and team
- Verify tags update in real-time

**Property 6: Service Dropdown Completeness**
- Create multiple services and sub-services
- Query service dropdown list
- Verify all services appear in dropdown
- Create new service and verify it appears without refresh

**Property 7: Real-Time Socket.io Broadcast**
- Create multiple client connections
- Perform status changes
- Verify all clients receive broadcasts
- Verify UI updates without manual refresh

**Property 8: Database Persistence Round-Trip**
- Create services, assets, and links
- Persist to database
- Retrieve from database
- Verify retrieved objects match originals

### Integration Testing

- Test complete asset upload workflow with service linking
- Test QC approval workflow from review to completion
- Test real-time updates across multiple clients
- Test concurrent operations and conflict resolution
- Test database consistency after system restart

### Test Configuration

- Minimum 100 iterations per property test
- Use fast-check or similar library for property generation
- Tag each test with feature and property reference
- Mock Socket.io for unit tests, use real connections for integration tests
- Use SQLite in-memory database for fast test execution
