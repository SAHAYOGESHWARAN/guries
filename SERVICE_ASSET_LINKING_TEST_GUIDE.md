# Service-Asset Linking - Quick Test Guide

## Prerequisites
- Backend running on http://localhost:3001 (or configured port)
- Frontend running on http://localhost:5173 (or configured port)
- Database initialized with schema

## Step 1: Create a Service

### Via API
```bash
curl -X POST http://localhost:3001/api/v1/services \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "Web Development",
    "industry_ids": [],
    "country_ids": [],
    "status": "active"
  }'
```

### Via Frontend
1. Navigate to "Create New Service"
2. Enter service name: "Web Development"
3. Click Create
4. Note the service ID from response

## Step 2: Create a Sub-Service

### Via API
```bash
curl -X POST http://localhost:3001/api/v1/services/1/sub-services \
  -H "Content-Type: application/json" \
  -d '{
    "sub_service_name": "Frontend Development",
    "parent_service_id": 1,
    "status": "active"
  }'
```

Replace `1` with your service ID.

## Step 3: Upload Asset with Service Link

### Via Frontend
1. Click "Upload Asset"
2. Fill in form:
   - Asset Name: "Homepage Banner"
   - Application Type: "WEB"
   - Asset Type: "Image"
   - Asset Category: "Banner"
   - Link to Service: Select "Web Development"
   - Link to Sub-Service: Select "Frontend Development"
   - SEO Score: 85
   - Grammar Score: 90
   - File URL: https://example.com/banner.jpg
3. Click "Create Asset"

### Via API
```bash
curl -X POST http://localhost:3001/api/v1/assets/upload-with-service \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Homepage Banner",
    "type": "Image",
    "asset_category": "Banner",
    "asset_format": "JPG",
    "application_type": "WEB",
    "linked_service_id": 1,
    "linked_sub_service_id": 1,
    "file_url": "https://example.com/banner.jpg",
    "seo_score": 85,
    "grammar_score": 90,
    "keywords": ["banner", "homepage"],
    "created_by": 1
  }'
```

## Step 4: Verify Asset Created with Service Link

### Check Asset Details
```bash
curl http://localhost:3001/api/v1/assetLibrary
```

Look for your asset with:
- `linked_service_id`: 1
- `linked_sub_service_id`: 1
- `linking_active`: 0 (until QC approval)
- `static_service_links`: Array with service link

## Step 5: Submit Asset for QC Review

### Via API
```bash
curl -X POST http://localhost:3001/api/v1/assets/1/submit-qc \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Pending QC Review",
    "workflow_stage": "QC"
  }'
```

Replace `1` with your asset ID.

## Step 6: Get Pending QC Assets

### Via API
```bash
curl http://localhost:3001/api/v1/qc-review/pending?status=pending&limit=50
```

Response should show your asset with:
- `qc_status`: "QC Pending" or "Pending"
- `workflow_stage`: "QC"
- `linked_service_id`: 1
- `linked_sub_service_id`: 1

## Step 7: Approve Asset (QC Pass)

### Via API
```bash
curl -X POST http://localhost:3001/api/v1/qc-review/approve \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": 1,
    "qc_remarks": "Looks good!",
    "qc_score": 95
  }'
```

Replace `1` with your asset ID.

### Expected Response
```json
{
    "message": "Asset approved successfully",
    "asset_id": 1,
    "qc_status": "Approved",
    "workflow_stage": "Published",
    "linking_active": 1,
    "status": "QC Approved",
    "asset": {
        "id": 1,
        "asset_name": "Homepage Banner",
        "qc_status": "Approved",
        "workflow_stage": "Published",
        "status": "QC Approved",
        "linking_active": 1,
        ...
    }
}
```

## Step 8: Verify Asset Removed from Review

### Via API
```bash
curl http://localhost:3001/api/v1/qc-review/pending?status=pending&limit=50
```

Your asset should NOT appear in the list anymore.

## Step 9: Verify Asset Status Updated

### Via API
```bash
curl http://localhost:3001/api/v1/assetLibrary/1
```

Verify:
- `qc_status`: "Approved"
- `workflow_stage`: "Published"
- `status`: "QC Approved"
- `linking_active`: 1

## Step 10: Verify Asset Appears on Service Page

### Via API
```bash
curl http://localhost:3001/api/v1/services/1
```

Look for asset in:
- `linked_assets_ids` array
- Asset should be visible in Web Repository

## Test Rejection Workflow

### Reject Asset
```bash
curl -X POST http://localhost:3001/api/v1/qc-review/reject \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": 1,
    "qc_remarks": "Image quality too low",
    "qc_score": 45
  }'
```

### Verify Rejection
```bash
curl http://localhost:3001/api/v1/assetLibrary/1
```

Verify:
- `qc_status`: "Rejected"
- `workflow_stage`: "QC"
- `status`: "Rejected"
- `linking_active`: 0

## Test Rework Workflow

### Request Rework
```bash
curl -X POST http://localhost:3001/api/v1/qc-review/rework \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": 1,
    "qc_remarks": "Please improve image resolution",
    "qc_score": 60
  }'
```

### Verify Rework Request
```bash
curl http://localhost:3001/api/v1/assetLibrary/1
```

Verify:
- `qc_status`: "Rework"
- `workflow_stage`: "QC"
- `status`: "Rework Requested"
- `rework_count`: 1
- `linking_active`: 0

## Test Static Link Immutability

### Verify Static Link Cannot Be Removed
```bash
curl http://localhost:3001/api/v1/assets/1/service-links
```

Should show:
- `is_static`: 1
- Cannot be deleted via API

## Frontend Testing

### Test Asset Upload Component
1. Navigate to Asset Upload
2. Select "WEB" as application type
3. Select service from dropdown
4. Verify sub-services populate
5. Select sub-service
6. Fill in scores and keywords
7. Submit form
8. Verify success message

### Test QC Review Page
1. Navigate to QC Review
2. View pending assets
3. Click on asset to review
4. Click "Approve" button
5. Enter remarks and score
6. Submit
7. Verify success message
8. Verify asset removed from list
9. Verify status updated

### Test Workflow Status Display
1. View asset in library
2. Verify workflow stage badge shows
3. Verify QC status badge shows
4. Verify linked service info displays
5. Verify status tags are color-coded

## Troubleshooting

### Asset Not Appearing in Service
- Check `linked_service_id` is set
- Verify service exists
- Check `static_service_links` JSON field
- Verify asset is QC approved

### QC Approval Not Working
- Check API endpoint: `/api/v1/qc-review/approve`
- Verify asset_id in request body
- Check server logs for errors
- Verify database connection

### Asset Still in Review After Approval
- Check all status fields updated:
  - `qc_status` = 'Approved'
  - `workflow_stage` = 'Published'
  - `status` = 'QC Approved'
- Refresh page to see changes
- Check browser console for errors

### Service Link Not Showing
- Verify `linked_service_id` is not null
- Check service exists in database
- Verify `static_service_links` JSON is valid
- Check service page query includes linked assets

## Performance Testing

### Load Test: Create Multiple Assets
```bash
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/v1/assets/upload-with-service \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Test Asset $i\",
      \"type\": \"Image\",
      \"asset_category\": \"Banner\",
      \"application_type\": \"WEB\",
      \"linked_service_id\": 1,
      \"file_url\": \"https://example.com/asset$i.jpg\",
      \"seo_score\": 85,
      \"grammar_score\": 90,
      \"created_by\": 1
    }"
done
```

### Load Test: Bulk QC Approval
```bash
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/v1/qc-review/approve \
    -H "Content-Type: application/json" \
    -d "{
      \"asset_id\": $i,
      \"qc_remarks\": \"Approved\",
      \"qc_score\": 95
    }"
done
```

## Success Criteria

✅ Asset created with service link
✅ Asset appears in pending QC list
✅ Asset can be approved
✅ Asset removed from review after approval
✅ All status fields updated correctly
✅ Asset appears on service page
✅ Static link cannot be removed
✅ Workflow log tracks changes
✅ Rejection workflow works
✅ Rework workflow works
