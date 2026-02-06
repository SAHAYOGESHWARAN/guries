# Asset & QC Review - Verification Script

## Pre-Deployment Checklist

Run these checks before deploying to production.

### 1. Database Verification

```bash
# Check if migration columns exist
sqlite3 backend/mcc_db.sqlite ".schema service_asset_links"
```

Expected output should include:
```
is_static INTEGER DEFAULT 0
created_by INTEGER REFERENCES users(id)
```

```bash
# Check asset_type_master schema
sqlite3 backend/mcc_db.sqlite ".schema asset_type_master"
```

Expected output should include:
```
asset_type_name TEXT UNIQUE NOT NULL
```

### 2. Backend Build Verification

```bash
# Build backend
npm run build --prefix backend
```

Expected: No errors, successful compilation

### 3. API Route Verification

```bash
# Start backend
npm start --prefix backend

# In another terminal, test health endpoint
curl http://localhost:3001/api/v1/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-02-06T..."}
```

### 4. QC Review Endpoint Verification

```bash
# Test QC review endpoint
curl http://localhost:3001/api/v1/qc-review/pending?limit=5
```

Expected response structure:
```json
{
  "assets": [
    {
      "id": 1,
      "asset_name": "...",
      "asset_type": "...",
      "asset_category": "...",
      "asset_format": "...",
      "qc_status": "...",
      "qc_score": null,
      "qc_checklist_items": null,
      "rework_count": 0,
      "version_history": [],
      "workflow_log": []
    }
  ],
  "total": 0,
  "limit": 5,
  "offset": 0
}
```

### 5. Asset Status Endpoint Verification

```bash
# Test asset status endpoint (replace 1 with actual asset ID)
curl http://localhost:3001/api/v1/asset-status/assets/1/status
```

Expected response structure:
```json
{
  "qc_status": {
    "status": "Pending",
    "label": "Pending QC",
    "color": "#ffc107",
    "icon": "⏳",
    "description": "..."
  },
  "linking_status": {
    "status": "Inactive",
    "label": "Not Linked",
    "color": "#6c757d",
    "icon": "⚪",
    "isStatic": false,
    "staticCount": 0,
    "totalLinked": 0,
    "subServiceLinked": 0
  },
  "workflow_stage": {
    "stage": "Add",
    "label": "Add Asset",
    "color": "#007bff",
    "icon": "➕",
    "progress": 0,
    "description": "..."
  },
  "overallStatus": {
    "isReady": false,
    "readinessPercentage": 0,
    "nextStep": "..."
  }
}
```

### 6. Asset Creation with Service Linking

```bash
# Create test asset with service linking
curl -X POST http://localhost:3001/api/v1/assets/upload \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Asset",
    "type": "Image",
    "asset_category": "Graphics",
    "asset_format": "PNG",
    "file_url": "https://example.com/image.png",
    "linked_service_id": 1,
    "created_by": 1
  }'
```

Expected: Asset created successfully with ID returned

### 7. Database Integrity Check

```bash
# Check for orphaned records
sqlite3 backend/mcc_db.sqlite "
SELECT COUNT(*) as orphaned_service_links 
FROM service_asset_links 
WHERE asset_id NOT IN (SELECT id FROM assets);
"
```

Expected: 0 orphaned records

```bash
# Check linking table structure
sqlite3 backend/mcc_db.sqlite "
PRAGMA table_info(service_asset_links);
"
```

Expected columns:
- id
- service_id
- asset_id
- link_type
- is_static
- created_by
- created_at
- updated_at

### 8. Frontend Integration Test

1. Open browser DevTools (F12)
2. Navigate to Assets page
3. Check Network tab for API calls
4. Verify no 404 errors
5. Check Console for JavaScript errors

Expected:
- All API calls return 200 status
- No console errors
- Asset list loads
- QC review page accessible

### 9. QC Workflow Test

1. Navigate to QC Review page
2. Verify pending assets load
3. Select an asset
4. Click Approve/Reject
5. Verify status updates
6. Check asset appears in correct status

Expected:
- All operations complete without errors
- Status updates reflect immediately
- No data loss

### 10. Performance Test

```bash
# Test with multiple assets
curl "http://localhost:3001/api/v1/qc-review/pending?limit=100&offset=0"
```

Expected: Response time < 2 seconds

## Automated Test Suite

```bash
# Run backend tests (if available)
npm test --prefix backend

# Run frontend tests (if available)
npm test --prefix frontend
```

## Rollback Procedure

If any test fails:

1. **Stop backend**
   ```bash
   # Press Ctrl+C in backend terminal
   ```

2. **Restore database** (if backup available)
   ```bash
   cp backend/mcc_db.sqlite.backup backend/mcc_db.sqlite
   ```

3. **Revert code changes**
   ```bash
   git checkout backend/database/schema.sql
   git checkout backend/routes/api.ts
   git checkout backend/controllers/qcReviewController.ts
   ```

4. **Rebuild and restart**
   ```bash
   npm run build --prefix backend
   npm start --prefix backend
   ```

## Success Criteria

All of the following must be true:

- ✅ Database migration completes without errors
- ✅ Backend builds successfully
- ✅ All API endpoints respond with correct data
- ✅ Asset creation with service linking works
- ✅ QC review workflow functions properly
- ✅ Asset status updates persist
- ✅ No orphaned database records
- ✅ Frontend loads without errors
- ✅ All operations complete within acceptable time
- ✅ No data loss or corruption

## Deployment Sign-Off

Once all tests pass:

- [ ] Database verified
- [ ] Backend builds
- [ ] API endpoints working
- [ ] Asset operations functional
- [ ] QC workflow complete
- [ ] Frontend integration verified
- [ ] Performance acceptable
- [ ] Ready for production

**Deployed by**: _______________
**Date**: _______________
**Notes**: _______________
