# Deployment Guide - Service-Asset Linking & QC Workflow

## Quick Deployment Steps

### 1. Database Migration
```bash
cd backend
node migrations/add-service-asset-linking.js
```

**Expected Output:**
```
✅ Created service_asset_links table
✅ Created subservice_asset_links table
✅ Executed: ALTER TABLE assets ADD COLUMN linked_service_ids TEXT
✅ Executed: ALTER TABLE assets ADD COLUMN linked_sub_service_ids TEXT
✅ Executed: ALTER TABLE assets ADD COLUMN linked_service_id INTEGER
✅ Executed: ALTER TABLE assets ADD COLUMN linked_sub_service_id INTEGER
✅ Executed: ALTER TABLE assets ADD COLUMN static_service_links TEXT
✅ Executed: ALTER TABLE assets ADD COLUMN linking_active INTEGER DEFAULT 0
✅ Service-Asset Linking migration completed successfully!
```

### 2. Backend Build & Test
```bash
# Build backend
npm run build:backend

# Run tests
npm run test:backend

# Start backend
npm run dev:backend
```

### 3. Frontend Build
```bash
# Build frontend
npm run build:frontend

# Start frontend
npm run dev:frontend
```

### 4. Test Deployment
```bash
# In another terminal, run deployment tests
npm run test:deployment
```

---

## Files Modified/Created

### Backend
- ✅ `backend/controllers/qcReviewController.ts` - Fixed QC approval logic
- ✅ `backend/controllers/assetUploadController.ts` - Asset upload with linking
- ✅ `backend/routes/assetUpload.ts` - Upload routes
- ✅ `backend/routes/api.ts` - Registered new routes
- ✅ `backend/migrations/add-service-asset-linking.js` - Database migration
- ✅ `backend/__tests__/qc-workflow-complete.test.ts` - QC workflow tests
- ✅ `backend/test-deployment.ts` - Deployment test script

### Frontend
- ✅ `frontend/components/AssetUploadWithServiceLink.tsx` - Upload form
- ✅ `frontend/components/AssetWorkflowStatusBadge.tsx` - Status display
- ✅ `frontend/components/AssetWorkflowStatusInline.tsx` - Inline status

---

## API Endpoints

### Asset Upload with Service Link
```
POST /api/v1/assets/upload-with-service
Content-Type: application/json

{
    "name": "Asset Name",
    "type": "Image",
    "asset_category": "Blog",
    "asset_format": "PNG",
    "application_type": "WEB",
    "linked_service_id": 1,
    "linked_sub_service_id": 2,
    "file_url": "https://example.com/file.png",
    "seo_score": 85,
    "grammar_score": 90,
    "keywords": ["keyword1", "keyword2"],
    "created_by": 1
}

Response: 201 Created
{
    "message": "Asset created successfully with service link",
    "asset": { ... }
}
```

### QC Approval
```
POST /api/v1/qc-review/assets/:asset_id/approve
Content-Type: application/json

{
    "qc_remarks": "Approved",
    "qc_score": 95
}

Response: 200 OK
{
    "message": "Asset approved successfully",
    "asset_id": 1,
    "qc_status": "Approved",
    "workflow_stage": "Approve",
    "linking_active": 1,
    "status": "Published"
}
```

### QC Rejection
```
POST /api/v1/qc-review/assets/:asset_id/reject
Content-Type: application/json

{
    "qc_remarks": "Needs improvement",
    "qc_score": 45
}

Response: 200 OK
{
    "message": "Asset rejected successfully",
    "asset_id": 1,
    "qc_status": "Rejected",
    "linking_active": 0,
    "status": "Rejected"
}
```

### Get Pending QC Assets
```
GET /api/v1/qc-review/pending?status=Pending&limit=50&offset=0

Response: 200 OK
{
    "assets": [ ... ],
    "total": 10,
    "limit": 50,
    "offset": 0
}
```

---

## Testing Checklist

### Backend Tests
- [ ] Run `npm run test:backend`
- [ ] All tests pass
- [ ] No console errors

### Frontend Tests
- [ ] Run `npm run test:frontend`
- [ ] All tests pass
- [ ] No console errors

### Manual Testing
- [ ] Asset upload form displays services
- [ ] Sub-services load when service selected
- [ ] Asset created successfully
- [ ] QC review page shows pending assets
- [ ] Approval updates status correctly
- [ ] Asset removed from review list
- [ ] Asset appears on service page
- [ ] Workflow status badge displays

### Deployment Tests
- [ ] Run `npm run test:deployment`
- [ ] All endpoints respond correctly
- [ ] No 404 errors

---

## Troubleshooting

### Issue: Migration fails
**Solution:**
1. Check database path is correct
2. Verify database file exists
3. Check file permissions
4. Run migration again

### Issue: Routes not found (404)
**Solution:**
1. Verify routes registered in `backend/routes/api.ts`
2. Check import statements
3. Restart backend server
4. Check console for errors

### Issue: Asset upload fails
**Solution:**
1. Check required fields are provided
2. Verify service exists
3. Check database connection
4. Review error message

### Issue: QC approval not updating
**Solution:**
1. Check asset exists
2. Verify user has permission
3. Check database for updates
4. Review workflow_log field

---

## Rollback Plan

If issues occur:

```bash
# 1. Stop services
npm run stop

# 2. Restore database backup
# (Restore from backup created before migration)

# 3. Revert code changes
git revert <commit-hash>

# 4. Rebuild and restart
npm run build:backend
npm run build:frontend
npm run dev:backend
npm run dev:frontend
```

---

## Performance Considerations

### Database Indexes
- ✅ Index on `service_asset_links.asset_id`
- ✅ Index on `service_asset_links.service_id`
- ✅ Index on `subservice_asset_links.asset_id`
- ✅ Index on `assets.linking_active`
- ✅ Index on `assets.qc_status`

### Query Optimization
- ✅ Parameterized queries prevent SQL injection
- ✅ Indexes speed up lookups
- ✅ JSON fields for flexible data storage
- ✅ Proper foreign keys for referential integrity

---

## Monitoring

### Key Metrics
- Asset upload success rate
- QC approval rate
- Service page load time
- API response time
- Database query performance

### Logs to Check
- Backend error logs
- Frontend console errors
- Database query logs
- API request logs

---

## Post-Deployment Verification

1. **Database**
   - [ ] New tables created
   - [ ] New columns added
   - [ ] Indexes created
   - [ ] No errors in migration log

2. **Backend**
   - [ ] Server starts without errors
   - [ ] All routes registered
   - [ ] Health check passes
   - [ ] Database connection works

3. **Frontend**
   - [ ] Components load
   - [ ] No console errors
   - [ ] Forms work correctly
   - [ ] API calls succeed

4. **Functionality**
   - [ ] Asset upload works
   - [ ] Service linking works
   - [ ] QC approval works
   - [ ] Status displays correctly

---

## Support

For issues or questions:
1. Check this guide
2. Review code comments
3. Check test files for examples
4. Review error logs
5. Check database schema

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Status**: Ready for Production ✅
