# QC Workflow Manual Testing Guide

## Quick Test (5 minutes)

### Prerequisites
- Backend running on http://localhost:3003
- Frontend running on http://localhost:5173
- Database initialized with migrations

### Test Steps

#### Step 1: Create Test Asset
1. Open frontend at http://localhost:5173
2. Navigate to Assets view
3. Click "Upload Asset"
4. Fill in required fields:
   - Name: "Test QC Asset"
   - Type: "Article"
   - Category: "Blog"
   - Body Content: "This is test content for QC review"
5. Click "Submit for QC"
6. Note the asset ID from the response

#### Step 2: Verify Asset in QC Review
1. Navigate to QC Review page
2. Filter by "Pending"
3. Verify "Test QC Asset" appears in the list
4. Click "Review" button
5. Verify asset details load correctly

#### Step 3: Approve Asset
1. In QC Review panel:
   - Set QC Score: 85
   - Add Remarks: "Approved - meets all standards"
2. Click "✅ Approve" button
3. Verify success message appears
4. Verify asset disappears from pending list

#### Step 4: Verify Status Update in Asset Library
1. Navigate back to Assets view
2. Search for "Test QC Asset"
3. Verify status shows:
   - QC Status: "Approved"
   - Workflow Stage: "Published"
   - Status: "QC Approved"
4. Verify asset is no longer in review options

#### Step 5: Verify Auto-Refresh
1. Open Asset Library in one tab
2. Open QC Review in another tab
3. Approve another asset in QC Review tab
4. Watch Asset Library tab automatically update
5. Verify status changes within 10 seconds

## API Testing (Using cURL or Postman)

### Test Asset Approval via API

```bash
# 1. Get pending assets
curl -X GET http://localhost:3003/api/v1/qc-review/pending?status=Pending

# 2. Approve specific asset
curl -X POST http://localhost:3003/api/v1/qc-review/approve \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": 1,
    "qc_remarks": "Approved - meets all standards",
    "qc_score": 85
  }'

# 3. Verify asset status updated
curl -X GET http://localhost:3003/api/v1/assetLibrary/1

# 4. Get QC statistics
curl -X GET http://localhost:3003/api/v1/qc-review/statistics
```

## Expected Results

### After Approval
```json
{
  "message": "Asset approved successfully",
  "asset_id": 1,
  "qc_status": "Approved",
  "workflow_stage": "Published",
  "linking_active": 1,
  "status": "QC Approved"
}
```

### Asset Library Response
```json
{
  "id": 1,
  "asset_name": "Test QC Asset",
  "qc_status": "Approved",
  "workflow_stage": "Published",
  "status": "QC Approved",
  "linking_active": 1,
  "qc_score": 85,
  "qc_remarks": "Approved - meets all standards"
}
```

## Verification Checklist

### Backend Verification
- [ ] Asset approval endpoint returns success
- [ ] All status fields updated correctly
- [ ] Workflow log contains approval event
- [ ] Asset removed from pending list
- [ ] QC statistics updated

### Frontend Verification
- [ ] QC Review page loads pending assets
- [ ] Approval button works
- [ ] Success message displays
- [ ] Asset disappears from pending list
- [ ] Asset Library shows updated status
- [ ] Auto-refresh updates within 10 seconds

### Database Verification
```sql
-- Check asset status after approval
SELECT 
  id, asset_name, qc_status, workflow_stage, 
  status, linking_active, qc_score, qc_remarks
FROM assets 
WHERE id = 1;

-- Expected output:
-- id | asset_name | qc_status | workflow_stage | status | linking_active | qc_score | qc_remarks
-- 1  | Test QC... | Approved  | Published      | QC ... | 1              | 85       | Approved...
```

## Troubleshooting

### Issue: Asset not appearing in QC Review
**Solution:**
1. Verify asset has `qc_status = 'Pending'`
2. Check asset was submitted for QC
3. Verify QC Review page is filtering correctly

### Issue: Status not updating after approval
**Solution:**
1. Check backend logs for errors
2. Verify database connection
3. Ensure migrations were applied
4. Check API response for errors

### Issue: Auto-refresh not working
**Solution:**
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check network tab for API calls
4. Verify refresh interval (should be 10 seconds)

### Issue: Too many API calls
**Solution:**
1. Verify refresh interval is 10 seconds (not 5)
2. Check for duplicate useAutoRefresh calls
3. Monitor network tab for excessive requests
4. Consider increasing interval if needed

## Performance Monitoring

### Monitor API Calls
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by XHR/Fetch
4. Watch for `/api/v1/assetLibrary` calls
5. Verify calls happen every ~10 seconds

### Monitor Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any errors or warnings
4. Verify no "Unexpected token" errors

### Monitor Performance
1. Open DevTools Performance tab
2. Record while approving asset
3. Check for long tasks or jank
4. Verify smooth UI updates

## Success Criteria

✅ **All of the following must be true:**
1. Asset approval completes without errors
2. All status fields update correctly
3. Asset removed from review options
4. Asset Library shows updated status
5. Auto-refresh works within 10 seconds
6. No console errors
7. No excessive API calls
8. Smooth UI updates

## Next Steps

If all tests pass:
1. Deploy to staging environment
2. Run full integration tests
3. Load test with multiple users
4. Monitor performance metrics
5. Deploy to production

If any tests fail:
1. Check error messages in console
2. Review backend logs
3. Verify database state
4. Check API responses
5. Debug specific issue
