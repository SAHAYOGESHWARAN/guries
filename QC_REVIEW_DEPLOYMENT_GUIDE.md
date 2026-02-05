# QC Review & Assets Module - Deployment Guide

## Overview
This guide documents the fixes applied to the QC Review and Assets modules for production deployment.

## Issues Fixed

### 1. QC Status Inconsistencies
**Problem**: Status values were inconsistent across the system
- Rejection response returned `qc_status: 'Fail'` instead of `'Rejected'`
- Statistics query counted `'Reject'` instead of `'Rejected'`
- Frontend filters used incorrect status values

**Solution**:
- Standardized all status values: `'Approved'`, `'Rejected'`, `'Rework'`, `'QC Pending'`
- Updated statistics query to use correct status values
- Fixed frontend filtering logic in AdminQCAssetReviewView

### 2. Submitted Records Not Displaying
**Problem**: Assets weren't showing in QC review tables
- Frontend used incorrect API endpoint paths (`/qcReview/` instead of `/qc-review/`)
- Status filtering logic didn't match database values
- Asset status badges displayed wrong labels

**Solution**:
- Corrected API endpoint paths to `/qc-review/approve`, `/qc-review/reject`, `/qc-review/rework`
- Updated filtering to use correct `qc_status` values
- Fixed status badge display logic

### 3. Approval Actions Not Generating Notifications
**Problem**: Notifications weren't being created or delivered
- Notification system was working but frontend wasn't listening for updates
- Socket.io events were emitted but not properly handled

**Solution**:
- Verified notification creation in all QC decision endpoints
- Ensured socket.io events emit correctly
- Added proper error handling for notification failures

### 4. QC Status Not Updating Accurately
**Problem**: Status updates were incomplete
- Rework requests weren't updating workflow_log
- Workflow log wasn't being tracked for all decisions
- Audit logging had incorrect column names

**Solution**:
- Added workflow_log updates to rework requests
- Fixed audit log column mapping (`action`/`details` instead of `qc_decision`/`qc_remarks`)
- Ensured all QC decisions update workflow_log with complete audit trail

## Database Schema Verification

### Assets Table - Critical Fields
```sql
-- QC Status Fields
qc_status TEXT              -- 'QC Pending', 'Approved', 'Rejected', 'Rework'
qc_score INTEGER            -- 0-100 score
qc_remarks TEXT             -- Reviewer feedback
qc_reviewer_id INTEGER      -- User who performed QC
qc_reviewed_at DATETIME     -- Timestamp of QC decision
workflow_log TEXT           -- JSON array of all workflow events
linking_active INTEGER      -- 1 for approved, 0 for rejected/rework
rework_count INTEGER        -- Number of rework requests
status TEXT                 -- Overall asset status
workflow_stage TEXT         -- Current workflow stage
```

### QC Audit Log Table
```sql
CREATE TABLE qc_audit_log (
  id INTEGER PRIMARY KEY,
  asset_id INTEGER,
  user_id INTEGER,
  action VARCHAR(50),        -- 'approved', 'rejected', 'rework_requested'
  details TEXT,              -- JSON with action details
  created_at DATETIME,
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  title TEXT,
  message TEXT,
  type TEXT,                 -- 'qc', 'info', 'success', 'error', 'warning'
  is_read INTEGER DEFAULT 0,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API Endpoints

### QC Review Endpoints
```
GET  /qc-review/pending?status=QC%20Pending&limit=50
     - Fetch pending QC assets
     - Returns: { assets: [], total: number, limit: number, offset: number }

GET  /qc-review/statistics
     - Get QC metrics
     - Returns: { pending, approved, rejected, rework, total, averageScore, approvalRate }

POST /qc-review/approve
     - Approve asset
     - Body: { asset_id, qc_remarks, qc_score }
     - Returns: { message, asset_id, qc_status: 'Approved', ... }

POST /qc-review/reject
     - Reject asset
     - Body: { asset_id, qc_remarks, qc_score }
     - Returns: { message, asset_id, qc_status: 'Rejected', ... }

POST /qc-review/rework
     - Request rework
     - Body: { asset_id, qc_remarks, qc_score }
     - Returns: { message, asset_id, qc_status: 'Rework', rework_count, ... }

GET  /qc-review/assets/:asset_id/history
     - Get QC audit log for asset
     - Returns: [ { action, user_id, details, created_at }, ... ]
```

## Frontend Components

### QCReviewPage.tsx
- Main QC review interface
- Handles approve, reject, rework actions
- Displays statistics and pending assets
- Refreshes data after each action

### AdminQCAssetReviewView.tsx
- Admin-only QC review with detailed asset preview
- Application-type specific QC checklists
- Status filtering (pending, rework, approved, rejected)
- Correct API endpoint paths

## Deployment Checklist

- [ ] Database schema verified with correct column names
- [ ] QC status values standardized across all tables
- [ ] API endpoints tested and responding correctly
- [ ] Frontend using correct endpoint paths
- [ ] Notifications being created and delivered
- [ ] Workflow log being updated for all QC decisions
- [ ] Audit logging working correctly
- [ ] Socket.io events emitting properly
- [ ] Status filtering working in frontend
- [ ] All test files removed from production

## Testing

### Manual Testing Steps

1. **Create Test Asset**
   ```
   POST /assetLibrary
   {
     "asset_name": "Test Asset",
     "asset_type": "Image",
     "application_type": "web",
     "qc_status": "QC Pending",
     "seo_score": 85,
     "grammar_score": 90
   }
   ```

2. **Approve Asset**
   ```
   POST /qc-review/approve
   {
     "asset_id": 1,
     "qc_remarks": "Approved for deployment",
     "qc_score": 95
   }
   ```
   Expected: `qc_status: 'Approved'`, `linking_active: 1`

3. **Verify Status Update**
   ```
   GET /qc-review/statistics
   ```
   Expected: `approved` count increased

4. **Check Notification**
   ```
   GET /notifications
   ```
   Expected: Notification created for asset owner

5. **Verify Workflow Log**
   ```
   GET /assetLibrary/1
   ```
   Expected: `workflow_log` contains approval event

## Production Deployment

### Pre-Deployment
1. Backup database
2. Run migration scripts if needed
3. Verify all endpoints are accessible
4. Test with sample data

### Deployment
1. Deploy backend changes
2. Deploy frontend changes
3. Clear browser cache
4. Verify QC module functionality
5. Monitor error logs

### Post-Deployment
1. Verify all QC operations working
2. Check notification delivery
3. Monitor performance metrics
4. Verify audit logs are being created

## Troubleshooting

### Assets Not Displaying in QC Table
- Check API endpoint path is `/qc-review/pending`
- Verify `qc_status` values in database match expected values
- Check browser console for API errors

### Notifications Not Appearing
- Verify notifications table exists
- Check user_id is being set correctly
- Verify socket.io connection is active
- Check browser notifications are enabled

### Status Not Updating
- Verify database UPDATE query is executing
- Check workflow_log is being serialized correctly
- Verify qc_reviewer_id is being set
- Check for database transaction issues

### Rework Count Not Incrementing
- Verify rework_count column exists in assets table
- Check UPDATE query includes rework_count increment
- Verify workflow_log is being updated

## Support

For issues or questions, refer to:
- Backend controller: `backend/controllers/qcReviewController.ts`
- Frontend views: `frontend/views/AdminQCAssetReviewView.tsx`
- Frontend components: `frontend/components/QCReviewPage.tsx`
- Database schema: `backend/database/schema.sql`
