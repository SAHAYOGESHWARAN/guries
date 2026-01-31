# QC Review - Quick Fix Reference

## The Problem
Admin QC review was failing with "Failed to submit QC review" error.

## The Root Cause
**Endpoint Mismatch:**
- Frontend called: `POST /api/v1/qc-review` ❌
- Backend has: `POST /api/v1/assetLibrary/:id/qc-review` ✓

## The Solution

### File Changed
`frontend/views/AdminQCAssetReviewView.tsx` - Line ~210

### What Was Fixed
```diff
- const response = await fetch(`${apiUrl}/qc-review`, {
+ const response = await fetch(`${apiUrl}/assetLibrary/${selectedAsset.id}/qc-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
-     assetId: selectedAsset.id,
+     qc_score: qcScore || 0,
      qc_remarks: qcRemarks || '',
      qc_decision: decision,
      qc_reviewer_id: user.id,
      user_role: user.role,
      checklist_items: checklistItems,
      checklist_completion: Object.values(checklistItems).every(v => v),
      linking_active: decision === 'approved'
    })
  });
```

## New Files Created

1. **frontend/views/TestAssetsQCView.tsx**
   - Test page with 5 sample assets
   - Full QC workflow
   - Admin-only access
   - Real-time approval tracking

2. **backend/test-qc-deployment-fixed.js**
   - Automated test suite
   - Verifies endpoint
   - Tests all workflows
   - Checks error handling

3. **QC_REVIEW_DEPLOYMENT_FIXED.md**
   - Complete deployment guide
   - API documentation
   - Troubleshooting guide

## How to Test

### Quick Test (5 minutes)
```bash
# 1. Start backend
cd backend && npm start

# 2. In another terminal, run tests
node backend/test-qc-deployment-fixed.js

# Expected: All tests pass ✓
```

### UI Test (10 minutes)
1. Login as Admin
2. Go to `/test-assets-qc`
3. Click "Review Asset"
4. Fill QC score (0-100)
5. Check compliance items
6. Click "Approve"
7. See success message ✓

## Verification Checklist

- [x] Endpoint fixed in AdminQCAssetReviewView.tsx
- [x] AssetQCView already uses correct endpoint
- [x] Test assets page created
- [x] Deployment test script created
- [x] Documentation complete
- [ ] Run deployment tests
- [ ] Test in UI
- [ ] Deploy to staging
- [ ] Deploy to production

## Key Points

✓ **Endpoint:** `POST /api/v1/assetLibrary/:id/qc-review`
✓ **Asset ID:** In URL path, not request body
✓ **Admin Only:** Role validation enforced
✓ **Decisions:** "approved", "rejected", or "rework"
✓ **Response:** Updated asset object on success

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 Error | Wrong endpoint | Use `/assetLibrary/:id/qc-review` |
| 403 Error | Not admin | Login with admin account |
| 400 Error | Invalid decision | Use "approved", "rejected", or "rework" |
| Network Error | Backend down | Start backend server |

## Files Modified
- ✅ `frontend/views/AdminQCAssetReviewView.tsx` - Fixed endpoint

## Files Created
- ✅ `frontend/views/TestAssetsQCView.tsx` - Test page
- ✅ `backend/test-qc-deployment-fixed.js` - Test script
- ✅ `QC_REVIEW_DEPLOYMENT_FIXED.md` - Full guide
- ✅ `QC_REVIEW_QUICK_FIX.md` - This file

## Next Steps

1. **Immediate:** Run deployment tests
2. **Short-term:** Test in UI with test assets
3. **Medium-term:** Deploy to staging
4. **Long-term:** Deploy to production

## Support

For detailed information, see: `QC_REVIEW_DEPLOYMENT_FIXED.md`
