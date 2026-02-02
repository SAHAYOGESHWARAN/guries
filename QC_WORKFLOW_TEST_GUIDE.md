# QC Workflow - Testing & Deployment Guide

## Current Workflow Status

### Asset Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASSET WORKFLOW STATUS                        │
└─────────────────────────────────────────────────────────────────┘

1. UPLOAD ASSET
   ├─ Status: Draft
   ├─ QC Status: Pending ⏳
   ├─ Workflow Stage: Add 📝
   ├─ Linking: Inactive ⚪
   └─ Appears in: Assets List

2. SUBMIT FOR QC
   ├─ Status: Pending QC Review
   ├─ QC Status: Pending ⏳
   ├─ Workflow Stage: Submit 📤
   ├─ Linking: Inactive ⚪
   └─ Appears in: QC Review Page

3. QC REVIEW (Reviewer Actions)
   ├─ Option A: APPROVE ✅
   │  ├─ QC Status: Pass ✅
   │  ├─ Workflow Stage: Approve ✔️
   │  ├─ Linking: Active 🔗
   │  ├─ Status: Published
   │  └─ Reflected in: Assets Page (QC Status Column)
   │
   ├─ Option B: REJECT ❌
   │  ├─ QC Status: Fail ❌
   │  ├─ Workflow Stage: QC 🔍
   │  ├─ Linking: Inactive ⚪
   │  ├─ Status: Rejected
   │  └─ Reflected in: Assets Page (QC Status Column)
   │
   └─ Option C: REQUEST REWORK 🔄
      ├─ QC Status: Rework 🔄
      ├─ Workflow Stage: QC 🔍
      ├─ Linking: Inactive ⚪
      ├─ Rework Count: +1
      ├─ Status: Rework Requested
      └─ Reflected in: Assets Page (QC Status Column)

4. ASSET PUBLISHED (After Approval)
   ├─ Status: Published
   ├─ QC Status: Pass ✅
   ├─ Workflow Stage: Publish 🚀
   ├─ Linking: Active 🔗
   └─ Visible in: Service Pages, Web Repository
```

---

## Testing Checklist

### Phase 1: Asset Upload & Submission

- [ ] **Upload Asset**
  - [ ] Go to "Upload New Asset"
  - [ ] Select file (image/document)
  - [ ] Enter asset name
  - [ ] Select application type (Web/SEO/SMM)
  - [ ] Enter SEO score (0-100)
  - [ ] Enter Grammar score (0-100)
  - [ ] Click "Upload Asset"
  - [ ] Verify: Asset appears in Assets list with status "Draft"

- [ ] **Check Assets Page**
  - [ ] Asset visible in table
  - [ ] QC Status shows: ⏳ Pending
  - [ ] Workflow shows: 📝 Add
  - [ ] Linking shows: ⚪ (inactive)

- [ ] **Submit for QC**
  - [ ] Click "Submit for QC" button on asset
  - [ ] Verify: Status changes to "Pending QC Review"
  - [ ] Verify: Workflow changes to 📤 Submit

### Phase 2: QC Review Page

- [ ] **Navigate to QC Review**
  - [ ] Go to `/qc-review` page
  - [ ] See statistics dashboard:
    - [ ] Pending count shows correct number
    - [ ] Approved count shows 0 (initially)
    - [ ] Rejected count shows 0 (initially)
    - [ ] Rework count shows 0 (initially)
    - [ ] Approval rate shows 0% (initially)

- [ ] **View Pending Assets**
  - [ ] Assets list shows submitted assets
  - [ ] Filter buttons work (Pending, Rework, All)
  - [ ] Asset details visible:
    - [ ] Asset name
    - [ ] Type
    - [ ] Category
    - [ ] Submitted date
    - [ ] SEO score
    - [ ] Grammar score
    - [ ] Rework count

### Phase 3: Approve Asset

- [ ] **Open Review Panel**
  - [ ] Click "Review" button on asset
  - [ ] Review panel opens on right side
  - [ ] Asset info displays:
    - [ ] Asset name
    - [ ] Type
    - [ ] SEO score
    - [ ] Grammar score

- [ ] **Approve Asset**
  - [ ] Enter QC score (0-100)
  - [ ] Add remarks (optional)
  - [ ] Click "✅ Approve" button
  - [ ] Verify: Success message appears
  - [ ] Verify: Asset removed from pending list
  - [ ] Verify: Statistics updated:
    - [ ] Pending count decreased by 1
    - [ ] Approved count increased by 1
    - [ ] Approval rate updated

- [ ] **Check Assets Page**
  - [ ] Navigate to Assets page
  - [ ] Find approved asset
  - [ ] Verify QC Status Column shows:
    - [ ] ✅ Pass badge (green)
    - [ ] ✔️ Approve badge (green)
    - [ ] 🔗 Linked badge (green)
  - [ ] Verify status changed to "Published"
  - [ ] Verify workflow changed to "Approve"

### Phase 4: Reject Asset

- [ ] **Upload New Asset for Rejection Test**
  - [ ] Upload another asset
  - [ ] Submit for QC
  - [ ] Go to QC Review page

- [ ] **Reject Asset**
  - [ ] Click "Review" on new asset
  - [ ] Enter QC score
  - [ ] Enter remarks (REQUIRED for rejection)
  - [ ] Click "❌ Reject" button
  - [ ] Verify: Success message appears
  - [ ] Verify: Asset removed from pending list
  - [ ] Verify: Statistics updated:
    - [ ] Pending count decreased by 1
    - [ ] Rejected count increased by 1

- [ ] **Check Assets Page**
  - [ ] Navigate to Assets page
  - [ ] Find rejected asset
  - [ ] Verify QC Status Column shows:
    - [ ] ❌ Fail badge (red)
    - [ ] 🔍 QC badge (yellow)
    - [ ] No linking badge
  - [ ] Verify status changed to "Rejected"

### Phase 5: Request Rework

- [ ] **Upload New Asset for Rework Test**
  - [ ] Upload another asset
  - [ ] Submit for QC
  - [ ] Go to QC Review page

- [ ] **Request Rework**
  - [ ] Click "Review" on new asset
  - [ ] Enter QC score
  - [ ] Enter remarks (REQUIRED for rework)
  - [ ] Click "🔄 Rework" button
  - [ ] Verify: Success message appears
  - [ ] Verify: Asset removed from pending list
  - [ ] Verify: Statistics updated:
    - [ ] Pending count decreased by 1
    - [ ] Rework count increased by 1

- [ ] **Check Assets Page**
  - [ ] Navigate to Assets page
  - [ ] Find rework asset
  - [ ] Verify QC Status Column shows:
    - [ ] 🔄 Rework badge (orange)
    - [ ] 🔍 QC badge (yellow)
    - [ ] Rework count displayed
    - [ ] No linking badge
  - [ ] Verify status changed to "Rework Requested"

### Phase 6: Real-Time Updates

- [ ] **Test Real-Time Updates**
  - [ ] Open Assets page in one tab
  - [ ] Open QC Review page in another tab
  - [ ] Approve asset in QC Review tab
  - [ ] Switch to Assets tab
  - [ ] Verify: Status updated WITHOUT page refresh
  - [ ] Verify: QC Status column shows new status

### Phase 7: Status History

- [ ] **Check Status History**
  - [ ] In QC Review page, click asset
  - [ ] Look for "History" section
  - [ ] Verify: All actions logged:
    - [ ] Approve action with timestamp
    - [ ] Reviewer name/ID
    - [ ] Remarks recorded

---

## Test Results Template

### Test Case 1: Approve Asset
```
Status: ✅ PASS / ❌ FAIL

Before Approval:
- QC Status: Pending ⏳
- Workflow: Submit 📤
- Linking: Inactive ⚪

After Approval:
- QC Status: Pass ✅
- Workflow: Approve ✔️
- Linking: Active 🔗
- Status: Published

Assets Page Reflection:
- QC Status Column: ✅ Pass ✔️ Approve 🔗 Linked
- Status: Published

Notes: _______________
```

### Test Case 2: Reject Asset
```
Status: ✅ PASS / ❌ FAIL

Before Rejection:
- QC Status: Pending ⏳
- Workflow: Submit 📤
- Linking: Inactive ⚪

After Rejection:
- QC Status: Fail ❌
- Workflow: QC 🔍
- Linking: Inactive ⚪
- Status: Rejected

Assets Page Reflection:
- QC Status Column: ❌ Fail 🔍 QC
- Status: Rejected

Notes: _______________
```

### Test Case 3: Request Rework
```
Status: ✅ PASS / ❌ FAIL

Before Rework:
- QC Status: Pending ⏳
- Workflow: Submit 📤
- Linking: Inactive ⚪
- Rework Count: 0

After Rework Request:
- QC Status: Rework 🔄
- Workflow: QC 🔍
- Linking: Inactive ⚪
- Rework Count: 1
- Status: Rework Requested

Assets Page Reflection:
- QC Status Column: 🔄 Rework 🔍 QC (Rework: 1)
- Status: Rework Requested

Notes: _______________
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] **Backend Verification**
  - [ ] qcReviewController.ts copied to backend/controllers/
  - [ ] qcReview.ts copied to backend/routes/
  - [ ] Routes registered in backend/server.ts
  - [ ] Database tables exist (qc_audit_log, asset_status_log)
  - [ ] All endpoints tested locally

- [ ] **Frontend Verification**
  - [ ] QCReviewPage.tsx copied to frontend/components/
  - [ ] AssetQCStatusColumn.tsx copied to frontend/components/
  - [ ] Route added: /qc-review
  - [ ] Status column integrated in Assets table
  - [ ] All components render correctly

- [ ] **Testing Complete**
  - [ ] All test cases passed
  - [ ] Real-time updates working
  - [ ] Status history logging working
  - [ ] Statistics dashboard accurate
  - [ ] No console errors

### Deployment Steps

1. **Backend Deployment**
   ```bash
   # Verify files in place
   ls backend/controllers/qcReviewController.ts
   ls backend/routes/qcReview.ts
   
   # Restart backend
   npm restart
   
   # Verify endpoints
   curl http://localhost:3003/api/v1/qc-review/statistics
   ```

2. **Frontend Deployment**
   ```bash
   # Build frontend
   npm run build
   
   # Verify build successful
   ls frontend/dist/
   
   # Deploy to production
   npm run deploy
   ```

3. **Post-Deployment Verification**
   - [ ] QC Review page loads
   - [ ] Assets page shows status column
   - [ ] Approve/reject/rework actions work
   - [ ] Status updates reflected in real-time
   - [ ] No errors in browser console
   - [ ] No errors in server logs

### Rollback Plan

If issues occur:

1. **Revert Backend**
   ```bash
   git revert <commit-hash>
   npm restart
   ```

2. **Revert Frontend**
   ```bash
   git revert <commit-hash>
   npm run build
   npm run deploy
   ```

3. **Verify Rollback**
   - [ ] QC Review page removed
   - [ ] Status column removed from Assets
   - [ ] All functionality restored

---

## Performance Metrics

### Expected Performance

- **QC Review Page Load**: < 2 seconds
- **Asset Approval**: < 1 second
- **Status Update Reflection**: < 500ms
- **Statistics Update**: < 1 second

### Monitoring

- [ ] Monitor API response times
- [ ] Check database query performance
- [ ] Monitor real-time update latency
- [ ] Track error rates

---

## Success Criteria

✅ **All tests pass**
✅ **Real-time updates working**
✅ **Status history logging**
✅ **Statistics accurate**
✅ **No console errors**
✅ **No server errors**
✅ **Performance acceptable**
✅ **Ready for production**

---

## Deployment Sign-Off

- [ ] Development testing complete
- [ ] Staging testing complete
- [ ] Performance verified
- [ ] Security reviewed
- [ ] Ready for production deployment

**Deployed by:** _______________
**Date:** _______________
**Version:** 1.0.0
