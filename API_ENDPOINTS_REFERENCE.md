# API Endpoints Reference - Data Persistence Fix

## Base URL
- **Local**: `http://localhost:3001/api/v1`
- **Production**: `https://guries.vercel.app/api/v1`

## Health Check

### Check Backend Status
```
GET /health
GET /api/health
GET /api/v1/health

Response: { status: 'ok', timestamp: '2026-02-06T...' }
```

## Assets Endpoints

### List All Assets
```
GET /api/v1/assets

Response: [
  {
    id: 1,
    asset_name: "Logo Design",
    asset_type: "graphic",
    asset_category: "branding",
    asset_format: "png",
    status: "draft",
    qc_status: "pending",
    file_url: "...",
    thumbnail_url: "...",
    created_at: "2026-02-06T...",
    ...
  }
]
```

### Get Single Asset
```
GET /api/v1/assets/:id

Response: { id: 1, asset_name: "...", ... }
```

### Create Asset
```
POST /api/v1/assets

Body: {
  asset_name: "New Asset",
  asset_type: "graphic",
  asset_category: "branding",
  asset_format: "png",
  status: "draft",
  file_url: "https://...",
  web_title: "Asset Title",
  web_description: "Asset Description",
  smm_platform: "instagram",
  seo_score: 85,
  ...
}

Response: { id: 1, asset_name: "...", ... }
```

### Update Asset
```
PUT /api/v1/assets/:id

Body: {
  asset_name: "Updated Name",
  status: "published",
  qc_status: "approved",
  ...
}

Response: { id: 1, asset_name: "Updated Name", ... }
```

### Delete Asset
```
DELETE /api/v1/assets/:id

Response: { success: true }
```

## Services Endpoints

### List All Services
```
GET /api/v1/services

Response: [
  {
    id: 1,
    service_name: "SEO Optimization",
    service_code: "SEO-001",
    slug: "seo-optimization",
    status: "active",
    created_at: "2026-02-06T...",
    ...
  }
]
```

### Create Service
```
POST /api/v1/services

Body: {
  service_name: "New Service",
  service_code: "SVC-001",
  slug: "new-service",
  status: "active"
}

Response: { id: 1, service_name: "...", ... }
```

## Sub-Services Endpoints

### List All Sub-Services
```
GET /api/v1/sub-services

Response: [
  {
    id: 1,
    service_id: 1,
    sub_service_name: "On-Page SEO",
    sub_service_code: "SEO-001-01",
    slug: "on-page-seo",
    description: "...",
    status: "active",
    created_at: "2026-02-06T...",
    ...
  }
]
```

### Create Sub-Service
```
POST /api/v1/sub-services

Body: {
  service_id: 1,
  sub_service_name: "New Sub-Service",
  sub_service_code: "SVC-001-01",
  slug: "new-sub-service",
  description: "...",
  status: "active"
}

Response: { id: 1, sub_service_name: "...", ... }
```

## Asset Linking Endpoints

### Link Asset to Service
```
POST /api/v1/service-asset-links

Body: {
  service_id: 1,
  asset_id: 1,
  link_type: "primary"
}

Response: { id: 1, service_id: 1, asset_id: 1, ... }
```

### Link Asset to Sub-Service
```
POST /api/v1/subservice-asset-links

Body: {
  sub_service_id: 1,
  asset_id: 1,
  link_type: "primary"
}

Response: { id: 1, sub_service_id: 1, asset_id: 1, ... }
```

### Link Asset to Keyword
```
POST /api/v1/keyword-asset-links

Body: {
  keyword_id: 1,
  asset_id: 1,
  link_type: "primary"
}

Response: { id: 1, keyword_id: 1, asset_id: 1, ... }
```

### Get Asset Links
```
GET /api/v1/service-asset-links?asset_id=1
GET /api/v1/subservice-asset-links?asset_id=1
GET /api/v1/keyword-asset-links?asset_id=1

Response: [
  { id: 1, service_id: 1, asset_id: 1, link_type: "primary", ... }
]
```

## Keywords Endpoints

### List All Keywords
```
GET /api/v1/keywords

Response: [
  {
    id: 1,
    keyword_name: "SEO Optimization",
    keyword_code: "KW-001",
    search_volume: 5000,
    difficulty_score: 45,
    status: "active",
    created_at: "2026-02-06T...",
    ...
  }
]
```

### Create Keyword
```
POST /api/v1/keywords

Body: {
  keyword_name: "New Keyword",
  keyword_code: "KW-001",
  search_volume: 1000,
  difficulty_score: 30,
  status: "active"
}

Response: { id: 1, keyword_name: "...", ... }
```

## Master Tables Endpoints

### Asset Categories
```
GET /api/v1/asset-category-master
POST /api/v1/asset-category-master
PUT /api/v1/asset-category-master/:id
DELETE /api/v1/asset-category-master/:id
```

### Asset Types
```
GET /api/v1/asset-type-master
POST /api/v1/asset-type-master
PUT /api/v1/asset-type-master/:id
DELETE /api/v1/asset-type-master/:id
```

### Asset Formats
```
GET /api/v1/asset-formats
POST /api/v1/asset-formats
PUT /api/v1/asset-formats/:id
DELETE /api/v1/asset-formats/:id
```

### Workflow Stages
```
GET /api/v1/workflow-stages
POST /api/v1/workflow-stages
PUT /api/v1/workflow-stages/:id
DELETE /api/v1/workflow-stages/:id
```

### Platforms
```
GET /api/v1/platforms
POST /api/v1/platforms
PUT /api/v1/platforms/:id
DELETE /api/v1/platforms/:id
```

### Countries
```
GET /api/v1/countries
POST /api/v1/countries
PUT /api/v1/countries/:id
DELETE /api/v1/countries/:id
```

### SEO Error Types
```
GET /api/v1/seo-errors
POST /api/v1/seo-errors
PUT /api/v1/seo-errors/:id
DELETE /api/v1/seo-errors/:id
```

## QC Review Endpoints

### List QC Reviews
```
GET /api/v1/qc-reviews
GET /api/v1/qc-reviews?asset_id=1

Response: [
  {
    id: 1,
    asset_id: 1,
    qc_reviewer_id: 2,
    qc_score: 85,
    checklist_completion: 90,
    qc_remarks: "Good quality",
    qc_decision: "approved",
    created_at: "2026-02-06T...",
    ...
  }
]
```

### Create QC Review
```
POST /api/v1/qc-reviews

Body: {
  asset_id: 1,
  qc_reviewer_id: 2,
  qc_score: 85,
  checklist_completion: 90,
  qc_remarks: "Good quality",
  qc_decision: "approved",
  checklist_items: "[...]"
}

Response: { id: 1, asset_id: 1, ... }
```

## Projects Endpoints

### List All Projects
```
GET /api/v1/projects

Response: [
  {
    id: 1,
    project_name: "Website Redesign",
    project_code: "PRJ-001",
    description: "...",
    status: "Planned",
    start_date: "2026-02-06",
    end_date: "2026-03-06",
    budget: 5000.00,
    owner_id: 1,
    brand_id: 1,
    priority: "High",
    created_at: "2026-02-06T...",
    ...
  }
]
```

### Create Project
```
POST /api/v1/projects

Body: {
  project_name: "New Project",
  project_code: "PRJ-001",
  description: "...",
  status: "Planned",
  start_date: "2026-02-06",
  end_date: "2026-03-06",
  budget: 5000.00,
  owner_id: 1,
  brand_id: 1,
  priority: "High"
}

Response: { id: 1, project_name: "...", ... }
```

## Campaigns Endpoints

### List All Campaigns
```
GET /api/v1/campaigns

Response: [
  {
    id: 1,
    campaign_name: "Spring Campaign",
    campaign_type: "Content",
    status: "planning",
    description: "...",
    campaign_start_date: "2026-02-06",
    campaign_end_date: "2026-03-06",
    campaign_owner_id: 1,
    project_id: 1,
    brand_id: 1,
    target_url: "https://...",
    backlinks_planned: 10,
    backlinks_completed: 5,
    created_at: "2026-02-06T...",
    ...
  }
]
```

### Create Campaign
```
POST /api/v1/campaigns

Body: {
  campaign_name: "New Campaign",
  campaign_type: "Content",
  status: "planning",
  description: "...",
  campaign_start_date: "2026-02-06",
  campaign_end_date: "2026-03-06",
  campaign_owner_id: 1,
  project_id: 1,
  brand_id: 1,
  target_url: "https://..."
}

Response: { id: 1, campaign_name: "...", ... }
```

## Tasks Endpoints

### List All Tasks
```
GET /api/v1/tasks

Response: [
  {
    id: 1,
    task_name: "Create Content",
    description: "...",
    status: "pending",
    priority: "High",
    assigned_to: 1,
    project_id: 1,
    campaign_id: 1,
    due_date: "2026-02-13",
    progress_stage: "Not Started",
    qc_stage: "Pending",
    estimated_hours: 8.5,
    rework_count: 0,
    created_at: "2026-02-06T...",
    ...
  }
]
```

### Create Task
```
POST /api/v1/tasks

Body: {
  task_name: "New Task",
  description: "...",
  status: "pending",
  priority: "High",
  assigned_to: 1,
  project_id: 1,
  campaign_id: 1,
  due_date: "2026-02-13",
  estimated_hours: 8.5
}

Response: { id: 1, task_name: "...", ... }
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request body",
  "details": "asset_name is required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "details": "Asset with id 999 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

## Testing with cURL

### Test Health Check
```bash
curl http://localhost:3001/api/v1/health
```

### Test Get Assets
```bash
curl http://localhost:3001/api/v1/assets
```

### Test Create Asset
```bash
curl -X POST http://localhost:3001/api/v1/assets \
  -H "Content-Type: application/json" \
  -d '{
    "asset_name": "Test Asset",
    "asset_type": "graphic",
    "asset_category": "branding",
    "asset_format": "png",
    "status": "draft",
    "file_url": "https://example.com/image.png"
  }'
```

### Test Update Asset
```bash
curl -X PUT http://localhost:3001/api/v1/assets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "asset_name": "Updated Asset",
    "status": "published"
  }'
```

### Test Delete Asset
```bash
curl -X DELETE http://localhost:3001/api/v1/assets/1
```

---

**Last Updated**: February 6, 2026
**API Version**: v1
**Status**: All endpoints tested and working
