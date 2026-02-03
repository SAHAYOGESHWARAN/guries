# Service-Asset Linking Implementation Guide

## Overview
Complete implementation of service-asset linking system with static links, QC workflow fixes, and workflow status visibility.

## Features Implemented

### 1. Service & Asset Linking
- ✅ Create Services and Sub-Services
- ✅ Upload Assets with Linked Service field
- ✅ Automatic static link creation during upload
- ✅ Static links cannot be removed (immutable)
- ✅ Automatic display on Service Pages

### 2. URL Slug Auto-Generation
- ✅ Auto-generate URL slugs when creating services
- ✅ No manual slug entry required
- ✅ Full URL generation for services and sub-services

### 3. Workflow Status Visibility
- ✅ Display current workflow stage on assets
- ✅ Show QC status tags
- ✅ Display linked service/sub-service info
- ✅ Quick identification of who is working on asset

### 4. QC Approval Fixes
- ✅ Asset removed from review options after approval
- ✅ Workflow stage updated to "Published"
- ✅ QC status changed to "Approved"
- ✅ Status field updated to "QC Approved"
- ✅ Linking enabled (linking_active = 1)

### 5. Asset QC Review Module
- ✅ QC approval correctly updates all status fields
- ✅ Asset disappears from pending review list
- ✅ Workflow log tracks all changes
- ✅ Proper status transitions

### 6. Auto-Link Assets to Service (Web Upload)
- ✅ When Linked Service selected during upload
- ✅ Asset automatically linked to service
- ✅ No additional manual linking required
- ✅ Link appears on service page immediately

## Database Schema

### New Tables

#### service_asset_links
```sql
CREATE TABLE service_asset_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    sub_service_id INTEGER,
    is_static INTEGER DEFAULT 1,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asset_id, service_id, sub_service_id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
);
```

#### subservice_asset_links
```sql
CREATE TABLE subservice_asset_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    sub_service_id INTEGER NOT NULL,
    is_static INTEGER DEFAULT 1,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asset_id, sub_service_id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
);
```

### Updated Assets Table Fields
- `linked_service_id` - Primary service link
- `linked_sub_service_id` - Primary sub-service link
- `linked_service_ids` - JSON array of all linked services
- `linked_sub_service_ids` - JSON array of all linked sub-services
- `static_service_links` - JSON array of static links created during upload
- `linking_active` - Boolean flag (0/1) for dynamic linking capability
- `workflow_stage` - Current workflow stage (Add, QC, Approve, Published, etc.)
- `qc_status` - QC status (Pending, Approved, Rejected, Rework)
- `workflow_log` - JSON array of workflow events

## Backend Implementation

### Controllers

#### assetUploadController.ts
- `createAssetWithServiceLink()` - Create asset with automatic service linking
- Validates service and sub-service existence
- Creates static links in junction tables
- Sets linking_active = 0 until QC approval

#### qcReviewController.ts
- `approveAsset()` - Approve asset and update all status fields
  - Sets qc_status = 'Approved'
  - Sets workflow_stage = 'Published'
  - Sets status = 'QC Approved'
  - Sets linking_active = 1
  - Logs workflow event
  
- `rejectAsset()` - Reject asset
  - Sets qc_status = 'Rejected'
  - Sets workflow_stage = 'QC'
  - Sets status = 'Rejected'
  - Sets linking_active = 0
  
- `requestRework()` - Request rework
  - Sets qc_status = 'Rework'
  - Sets workflow_stage = 'QC'
  - Sets status = 'Rework Requested'
  - Increments rework_count

### Routes

#### QC Review Routes (backend/routes/qcReview.ts)
```
POST /api/v1/qc-review/approve - Approve asset
POST /api/v1/qc-review/reject - Reject asset
POST /api/v1/qc-review/rework - Request rework
GET /api/v1/qc-review/pending - Get pending assets
GET /api/v1/qc-review/statistics - Get QC statistics
```

Supports both endpoint styles:
- `/qc-review/approve` (body contains asset_id)
- `/qc-review/assets/:asset_id/approve` (asset_id in URL)

## Frontend Implementation

### Components

#### AssetUploadWithServiceLink.tsx
- Service dropdown populated from API
- Sub-service dropdown populated based on selected service
- Static link warning message
- SEO and Grammar score inputs
- Keywords management

#### AssetWorkflowStatusTag.tsx
- Display workflow stage with color coding
- Display QC status
- Show linked service/sub-service info
- Compact and full display modes

#### QCReviewPage.tsx
- Updated endpoints to use new routes
- Proper error handling
- Status refresh after approval/rejection
- Statistics display

### API Endpoints Used

```typescript
// Fetch services
GET /api/v1/services

// Fetch sub-services for a service
GET /api/v1/services/:serviceId/sub-services

// Create asset with service link
POST /api/v1/assets/upload-with-service
Body: {
    name: string,
    type: string,
    asset_category: string,
    asset_format: string,
    application_type: 'WEB' | 'SEO' | 'SMM',
    linked_service_id: number,
    linked_sub_service_id: number,
    file_url: string,
    seo_score: number,
    grammar_score: number,
    keywords: string[],
    created_by: number
}

// Get pending QC assets
GET /api/v1/qc-review/pending?status=pending&limit=50

// Approve asset
POST /api/v1/qc-review/approve
Body: {
    asset_id: number,
    qc_remarks: string,
    qc_score: number
}

// Reject asset
POST /api/v1/qc-review/reject
Body: {
    asset_id: number,
    qc_remarks: string,
    qc_score: number
}

// Get QC statistics
GET /api/v1/qc-review/statistics
```

## Workflow Status Transitions

### Asset Lifecycle
```
Draft (Add)
    ↓
Pending QC Review (QC)
    ↓
├─ Approved (Published) ✓ [linking_active = 1]
├─ Rejected (QC) ✗ [linking_active = 0]
└─ Rework (QC) ⚠ [linking_active = 0]
    ↓
Re-submit for QC
    ↓
(Approved/Rejected/Rework)
```

### Status Fields Updated on Approval
1. `qc_status` → 'Approved'
2. `workflow_stage` → 'Published'
3. `status` → 'QC Approved'
4. `linking_active` → 1
5. `workflow_log` → Appended with approval event

## Testing

### Test File: backend/__tests__/service-asset-linking.test.ts

Tests cover:
- Asset creation with service link
- Static link creation
- QC approval workflow
- Status field updates
- Workflow log tracking
- Asset rejection
- Rework requests

### Running Tests
```bash
cd backend
npm test -- service-asset-linking.test.ts
```

## Implementation Checklist

### Backend
- [x] Update QC review controller with proper status updates
- [x] Add support for both endpoint styles in routes
- [x] Create asset upload controller with service linking
- [x] Add static link creation logic
- [x] Implement workflow log tracking
- [x] Add QC statistics endpoint
- [x] Create comprehensive tests

### Frontend
- [x] Create asset upload component with service selection
- [x] Create workflow status tag component
- [x] Update QC review page with new endpoints
- [x] Add proper error handling
- [x] Add success messages
- [x] Implement status refresh after actions

### Database
- [x] Create service_asset_links table
- [x] Create subservice_asset_links table
- [x] Add linking fields to assets table
- [x] Add workflow tracking fields

## Key Features

### Static Links
- Created during asset upload
- Cannot be removed by users
- Marked with `is_static = 1` in database
- Automatically appear on service pages

### Dynamic Links
- Created after asset is QC approved
- Can be toggled on/off
- Require `linking_active = 1`
- Managed through service edit interface

### Workflow Tracking
- All status changes logged in `workflow_log` JSON field
- Includes timestamp, user_id, action, and remarks
- Enables audit trail and history

### QC Status Visibility
- Assets show current workflow stage
- QC status displayed as tag
- Linked service/sub-service shown
- Quick identification of asset state

## API Response Examples

### Approve Asset Response
```json
{
    "message": "Asset approved successfully",
    "asset_id": 123,
    "qc_status": "Approved",
    "workflow_stage": "Published",
    "linking_active": 1,
    "status": "QC Approved",
    "asset": {
        "id": 123,
        "asset_name": "Test Asset",
        "qc_status": "Approved",
        "workflow_stage": "Published",
        "status": "QC Approved",
        "linking_active": 1,
        "linked_service_id": 5,
        "linked_sub_service_id": 10,
        "workflow_log": [...]
    }
}
```

### Pending QC Assets Response
```json
{
    "assets": [
        {
            "id": 123,
            "asset_name": "Test Asset",
            "qc_status": "QC Pending",
            "workflow_stage": "QC",
            "status": "Draft",
            "linked_service_id": 5,
            "linked_sub_service_id": 10,
            "seo_score": 85,
            "grammar_score": 90,
            "submitted_at": "2024-02-03T10:30:00Z"
        }
    ],
    "total": 15,
    "limit": 50,
    "offset": 0
}
```

## Troubleshooting

### Asset Still Shows in Review After Approval
- Check that `qc_status` is set to 'Approved'
- Verify `workflow_stage` is set to 'Published'
- Ensure `status` is set to 'QC Approved'
- Check that workflow_log was updated

### Service Link Not Appearing
- Verify `linked_service_id` is set correctly
- Check that service exists in services table
- Ensure static link was created in service_asset_links table
- Verify asset is displayed on service page query

### QC Approval Not Working
- Check API endpoint is correct: `/api/v1/qc-review/approve`
- Verify asset_id is being sent in request body
- Check database connection
- Review server logs for errors

## Future Enhancements

- [ ] Bulk QC approval
- [ ] QC workflow automation
- [ ] Asset versioning
- [ ] Approval notifications
- [ ] QC metrics dashboard
- [ ] Automated quality scoring
