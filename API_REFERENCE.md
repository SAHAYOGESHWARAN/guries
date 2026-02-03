# Service-Asset Linking API Reference

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication
All endpoints support optional user context via `(req as any).user?.id`

---

## Asset Upload Endpoints

### Create Asset with Service Link
**POST** `/assets/upload-with-service`

Creates a new asset with automatic service linking and static link creation.

**Request Body:**
```json
{
    "name": "string (required)",
    "type": "string (optional)",
    "asset_category": "string (optional)",
    "asset_format": "string (optional)",
    "content_type": "string (optional)",
    "application_type": "string (required) - WEB, SEO, or SMM",
    "linked_service_id": "number (optional)",
    "linked_sub_service_id": "number (optional)",
    "file_url": "string (optional)",
    "thumbnail_url": "string (optional)",
    "file_size": "number (optional)",
    "file_type": "string (optional)",
    "seo_score": "number (optional) - 0-100",
    "grammar_score": "number (optional) - 0-100",
    "keywords": "string[] (optional)",
    "created_by": "number (optional)"
}
```

**Response (201 Created):**
```json
{
    "message": "Asset created successfully with service link",
    "asset": {
        "id": 123,
        "asset_name": "Asset Name",
        "asset_type": "Image",
        "application_type": "web",
        "status": "Draft",
        "qc_status": "Pending",
        "workflow_stage": "Add",
        "linked_service_id": 5,
        "linked_sub_service_id": 10,
        "linked_service_ids": [5],
        "linked_sub_service_ids": [10],
        "static_service_links": [
            {
                "service_id": 5,
                "sub_service_id": 10,
                "created_at": "2024-02-03T10:30:00Z"
            }
        ],
        "linking_active": 0,
        "seo_score": 85,
        "grammar_score": 90,
        "keywords": ["keyword1", "keyword2"],
        "created_at": "2024-02-03T10:30:00Z"
    }
}
```

**Error Responses:**
- 400: Missing required fields
- 404: Service or sub-service not found
- 500: Server error

---

## QC Review Endpoints

### Get Pending QC Assets
**GET** `/qc-review/pending`

Retrieves all assets pending QC review with pagination.

**Query Parameters:**
```
status: string (optional) - 'all', 'pending', 'rework' (default: 'pending')
limit: number (optional) - default: 50
offset: number (optional) - default: 0
```

**Response (200 OK):**
```json
{
    "assets": [
        {
            "id": 123,
            "asset_name": "Asset Name",
            "asset_type": "Image",
            "status": "Draft",
            "qc_status": "QC Pending",
            "workflow_stage": "QC",
            "seo_score": 85,
            "grammar_score": 90,
            "submitted_by": 1,
            "submitted_at": "2024-02-03T10:30:00Z",
            "file_url": "https://example.com/asset.jpg",
            "thumbnail_url": "https://example.com/thumb.jpg",
            "application_type": "web",
            "asset_category": "Banner",
            "keywords": ["keyword1"],
            "linked_service_id": 5,
            "linked_sub_service_id": 10
        }
    ],
    "total": 15,
    "limit": 50,
    "offset": 0
}
```

---

### Get Asset for QC Review
**GET** `/qc-review/assets/:asset_id`

Retrieves a single asset for detailed QC review.

**Path Parameters:**
```
asset_id: number (required)
```

**Response (200 OK):**
```json
{
    "id": 123,
    "asset_name": "Asset Name",
    "asset_type": "Image",
    "status": "Draft",
    "qc_status": "QC Pending",
    "workflow_stage": "QC",
    "file_url": "https://example.com/asset.jpg",
    "thumbnail_url": "https://example.com/thumb.jpg",
    "application_type": "web",
    "asset_category": "Banner",
    "asset_format": "JPG",
    "seo_score": 85,
    "grammar_score": 90,
    "keywords": ["keyword1"],
    "content_keywords": [],
    "seo_keywords": [],
    "web_h3_tags": [],
    "resource_files": [],
    "qc_checklist_items": [],
    "submitted_by": 1,
    "submitted_at": "2024-02-03T10:30:00Z",
    "linked_service_id": 5,
    "linked_sub_service_id": 10
}
```

**Error Responses:**
- 400: asset_id is required
- 404: Asset not found
- 500: Server error

---

### Approve Asset
**POST** `/qc-review/approve`

Approves an asset and updates all status fields.

**Request Body:**
```json
{
    "asset_id": "number (required)",
    "qc_remarks": "string (optional)",
    "qc_score": "number (optional) - 0-100"
}
```

**Response (200 OK):**
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
        "asset_name": "Asset Name",
        "qc_status": "Approved",
        "workflow_stage": "Published",
        "status": "QC Approved",
        "linking_active": 1,
        "qc_score": 95,
        "qc_remarks": "Looks good!",
        "qc_reviewed_at": "2024-02-03T10:35:00Z",
        "workflow_log": [
            {
                "action": "approved",
                "timestamp": "2024-02-03T10:35:00Z",
                "user_id": 1,
                "status": "Published",
                "workflow_stage": "Approve",
                "remarks": "Looks good!"
            }
        ]
    }
}
```

**Error Responses:**
- 400: asset_id is required
- 404: Asset not found
- 500: Server error

---

### Reject Asset
**POST** `/qc-review/reject`

Rejects an asset and disables linking.

**Request Body:**
```json
{
    "asset_id": "number (required)",
    "qc_remarks": "string (required)",
    "qc_score": "number (optional) - 0-100"
}
```

**Response (200 OK):**
```json
{
    "message": "Asset rejected successfully",
    "asset_id": 123,
    "qc_status": "Fail",
    "linking_active": 0,
    "status": "Rejected",
    "asset": {
        "id": 123,
        "asset_name": "Asset Name",
        "qc_status": "Rejected",
        "workflow_stage": "QC",
        "status": "Rejected",
        "linking_active": 0,
        "qc_score": 45,
        "qc_remarks": "Image quality too low",
        "qc_reviewed_at": "2024-02-03T10:35:00Z"
    }
}
```

**Error Responses:**
- 400: asset_id or qc_remarks is required
- 404: Asset not found
- 500: Server error

---

### Request Rework
**POST** `/qc-review/rework`

Requests rework on an asset and increments rework counter.

**Request Body:**
```json
{
    "asset_id": "number (required)",
    "qc_remarks": "string (required)",
    "qc_score": "number (optional) - 0-100"
}
```

**Response (200 OK):**
```json
{
    "message": "Rework requested successfully",
    "asset_id": 123,
    "qc_status": "Rework",
    "linking_active": 0,
    "status": "Rework Requested",
    "rework_count": 1,
    "asset": {
        "id": 123,
        "asset_name": "Asset Name",
        "qc_status": "Rework",
        "workflow_stage": "QC",
        "status": "Rework Requested",
        "linking_active": 0,
        "rework_count": 1,
        "qc_score": 60,
        "qc_remarks": "Please improve image resolution"
    }
}
```

**Error Responses:**
- 400: asset_id or qc_remarks is required
- 404: Asset not found
- 500: Server error

---

### Get QC Review History
**GET** `/qc-review/assets/:asset_id/history`

Retrieves the QC review history for an asset.

**Path Parameters:**
```
asset_id: number (required)
```

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "asset_id": 123,
        "user_id": 1,
        "qc_decision": "approved",
        "qc_remarks": "Looks good!",
        "created_at": "2024-02-03T10:35:00Z"
    },
    {
        "id": 2,
        "asset_id": 123,
        "user_id": 2,
        "qc_decision": "rework_requested",
        "qc_remarks": "Please improve resolution",
        "created_at": "2024-02-03T11:00:00Z"
    }
]
```

**Error Responses:**
- 400: asset_id is required
- 500: Server error

---

### Get QC Statistics
**GET** `/qc-review/statistics`

Retrieves QC statistics and metrics.

**Response (200 OK):**
```json
{
    "pending": 5,
    "approved": 45,
    "rejected": 3,
    "rework": 2,
    "total": 55,
    "averageScore": 82.5,
    "approvalRate": 82
}
```

---

## Service Endpoints

### Get All Services
**GET** `/services`

Retrieves all services.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "service_name": "Web Development",
        "service_code": "WD-001",
        "slug": "web-development",
        "status": "active",
        "created_at": "2024-02-03T10:00:00Z"
    }
]
```

---

### Get Sub-Services for Service
**GET** `/services/:service_id/sub-services`

Retrieves all sub-services for a parent service.

**Path Parameters:**
```
service_id: number (required)
```

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "sub_service_name": "Frontend Development",
        "parent_service_id": 1,
        "slug": "frontend-development",
        "status": "active",
        "created_at": "2024-02-03T10:00:00Z"
    }
]
```

---

## Asset Library Endpoints

### Get Asset Library
**GET** `/assetLibrary`

Retrieves all assets in the library with linking information.

**Response (200 OK):**
```json
[
    {
        "id": 123,
        "name": "Asset Name",
        "type": "Image",
        "asset_category": "Banner",
        "asset_format": "JPG",
        "repository": "Web",
        "status": "QC Approved",
        "workflow_stage": "Published",
        "qc_status": "Approved",
        "file_url": "https://example.com/asset.jpg",
        "thumbnail_url": "https://example.com/thumb.jpg",
        "application_type": "web",
        "linked_service_id": 5,
        "linked_sub_service_id": 10,
        "linked_service_ids": [5],
        "linked_sub_service_ids": [10],
        "static_service_links": [
            {
                "service_id": 5,
                "sub_service_id": 10,
                "created_at": "2024-02-03T10:30:00Z"
            }
        ],
        "linking_active": 1,
        "seo_score": 85,
        "grammar_score": 90,
        "keywords": ["keyword1"],
        "usage_count": 3,
        "created_at": "2024-02-03T10:30:00Z"
    }
]
```

---

### Get Asset Library Item
**GET** `/assetLibrary/:id`

Retrieves a single asset from the library.

**Path Parameters:**
```
id: number (required)
```

**Response (200 OK):**
```json
{
    "id": 123,
    "name": "Asset Name",
    "type": "Image",
    "asset_category": "Banner",
    "repository": "Web",
    "status": "QC Approved",
    "workflow_stage": "Published",
    "qc_status": "Approved",
    "file_url": "https://example.com/asset.jpg",
    "thumbnail_url": "https://example.com/thumb.jpg",
    "application_type": "web",
    "linked_service_id": 5,
    "linked_sub_service_id": 10,
    "linking_active": 1,
    "seo_score": 85,
    "grammar_score": 90,
    "keywords": ["keyword1"],
    "created_at": "2024-02-03T10:30:00Z"
}
```

---

## Status Field Reference

### QC Status Values
- `Pending` - Awaiting QC review
- `QC Pending` - Awaiting QC review (alternative)
- `Approved` - QC approved
- `Rejected` - QC rejected
- `Rework` - Rework requested

### Workflow Stage Values
- `Add` - Asset being added
- `QC` - In QC review
- `Approve` - Being approved
- `Published` - Published/approved
- `Rejected` - Rejected

### Status Values
- `Draft` - Draft status
- `Pending QC Review` - Pending QC
- `QC Approved` - QC approved
- `Rejected` - Rejected
- `Rework Requested` - Rework requested

### Linking Active Values
- `0` - Linking disabled (asset not QC approved)
- `1` - Linking enabled (asset QC approved)

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Missing required fields | Required field not provided |
| 400 | asset_id is required | asset_id not in request |
| 400 | qc_remarks is required | qc_remarks not provided for rejection |
| 404 | Asset not found | Asset ID doesn't exist |
| 404 | Service not found | Service ID doesn't exist |
| 404 | Sub-service not found | Sub-service ID doesn't exist |
| 500 | Server error | Internal server error |

---

## Example Workflows

### Complete Asset Approval Workflow

1. **Create Asset with Service Link**
```bash
POST /assets/upload-with-service
{
    "name": "Homepage Banner",
    "type": "Image",
    "application_type": "WEB",
    "linked_service_id": 1,
    "linked_sub_service_id": 1,
    "seo_score": 85,
    "grammar_score": 90,
    "created_by": 1
}
```

2. **Get Pending QC Assets**
```bash
GET /qc-review/pending?status=pending
```

3. **Get Asset for Review**
```bash
GET /qc-review/assets/123
```

4. **Approve Asset**
```bash
POST /qc-review/approve
{
    "asset_id": 123,
    "qc_remarks": "Looks good!",
    "qc_score": 95
}
```

5. **Verify Asset Status**
```bash
GET /assetLibrary/123
```

Expected result:
- `qc_status`: "Approved"
- `workflow_stage`: "Published"
- `status`: "QC Approved"
- `linking_active`: 1

---

## Rate Limiting

No rate limiting currently implemented. Implement as needed for production.

---

## Pagination

Endpoints supporting pagination use:
- `limit`: Number of results (default: 50)
- `offset`: Number of results to skip (default: 0)

Example:
```bash
GET /qc-review/pending?limit=25&offset=50
```

---

## Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2024-02-03T10:30:00Z
```

---

## Notes

- All endpoints return JSON responses
- Authentication context available via `(req as any).user?.id`
- Workflow log tracks all status changes
- Static links cannot be removed via API
- Assets must be QC approved before dynamic linking
