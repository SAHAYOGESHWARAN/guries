# Implementation Guide - Apply All Fixes

## Quick Start

This guide walks you through applying all the fixes to your project.

---

## Step 1: Database Schema Updates

### Action: Update Database Schema
**File:** `backend/database/schema.sql`

**Status:** ✅ Already updated with:
- `asset_website_usage` table
- `asset_social_media_usage` table
- `asset_backlink_usage` table
- Proper indexes

**To Apply:**
```bash
# For PostgreSQL (Production)
psql -U your_user -d your_db -f backend/database/schema.sql

# For SQLite (Development)
sqlite3 mcc_db.sqlite < backend/database/schema.sql
```

---

## Step 2: Database Connection Layer

### Action: Update Database Config
**File:** `backend/config/db.ts`

**Status:** ✅ Already fixed with:
- Improved SQLite INSERT handling
- Better ID retrieval logic
- Enhanced error handling

**Verification:**
```typescript
// Test that INSERT returns proper ID
const result = await pool.query(
  'INSERT INTO assets (asset_name, status) VALUES (?, ?)',
  ['Test', 'draft']
);
console.log(result.rows[0].id); // Should have ID
```

---

## Step 3: Notification Controller

### Action: Replace Notification Controller
**File:** `backend/controllers/notificationController.ts`

**Status:** ✅ Already fixed with:
- User authentication checks
- User-scoped queries
- Permission validation
- Pagination support
- Error handling

**Key Changes:**
- All queries now filter by `user_id`
- All operations verify user ownership
- Socket.io errors handled gracefully
- Pagination implemented

**Verification:**
```bash
# Test user-scoped notifications
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/notifications

# Should only return current user's notifications
```

---

## Step 4: Asset Status Controller

### Action: Update Asset Status Controller
**File:** `backend/controllers/assetStatusController.ts`

**Status:** ✅ Already fixed with:
- State transition validation
- Service link verification
- Proper column name references
- Pagination support

**Key Changes:**
- QC status transitions validated
- Linking only activated if service links exist
- Status history uses correct column names
- Pagination added to history

**Verification:**
```bash
# Test invalid transition
curl -X PUT http://localhost:3000/api/assets/1/qc-status \
  -H "Content-Type: application/json" \
  -d '{"qc_status": "Pass"}'

# Then try to change to Fail
curl -X PUT http://localhost:3000/api/assets/1/qc-status \
  -H "Content-Type: application/json" \
  -d '{"qc_status": "Fail"}'

# Should return 400 error
```

---

## Step 5: Asset Controller - Critical Fix

### Action: Update Asset Creation Function
**File:** `backend/controllers/assetController.ts`

**Status:** ⚠️ NEEDS MANUAL UPDATE

**What to Do:**
1. Open `backend/controllers/assetController.fixed.ts`
2. Copy the `createAssetLibraryItem` function
3. Replace the broken version in `backend/controllers/assetController.ts`

**Why:** The original has a truncated INSERT statement that causes data loss

**Steps:**
```bash
# 1. Backup original
cp backend/controllers/assetController.ts backend/controllers/assetController.ts.backup

# 2. Find the createAssetLibraryItem function (starts around line 344)
# 3. Replace it with the fixed version from assetController.fixed.ts

# 4. Verify syntax
npm run build
```

**Verification:**
```bash
# Test asset creation
curl -X POST http://localhost:3000/api/assets/library \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Asset",
    "type": "image",
    "application_type": "WEB",
    "seo_score": 85,
    "grammar_score": 90,
    "status": "Pending QC Review"
  }'

# Should return asset with ID and all fields
```

---

## Step 6: Validation & Testing

### Test 1: Data Persistence
```bash
# Create an asset
ASSET_ID=$(curl -X POST http://localhost:3000/api/assets/library \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Persistence Test",
    "type": "document",
    "application_type": "SEO",
    "seo_score": 75,
    "grammar_score": 80
  }' | jq -r '.id')

# Retrieve it
curl http://localhost:3000/api/assets/library/$ASSET_ID

# Verify all fields are present
```

### Test 2: Notification Privacy
```bash
# Get notifications as User 1
curl -H "Authorization: Bearer USER1_TOKEN" \
  http://localhost:3000/api/notifications

# Try to mark User 2's notification as read
curl -X PUT http://localhost:3000/api/notifications/999/read \
  -H "Authorization: Bearer USER1_TOKEN"

# Should return 403 Forbidden
```

### Test 3: Status Transitions
```bash
# Create asset and submit for QC
ASSET_ID=1

# Update to Pass
curl -X PUT http://localhost:3000/api/assets/$ASSET_ID/qc-status \
  -H "Content-Type: application/json" \
  -d '{"qc_status": "Pass"}'

# Try invalid transition to Fail
curl -X PUT http://localhost:3000/api/assets/$ASSET_ID/qc-status \
  -H "Content-Type: application/json" \
  -d '{"qc_status": "Fail"}'

# Should return error
```

### Test 4: Table Display
```bash
# Get asset library with pagination
curl "http://localhost:3000/api/assets/library?page=1&limit=10"

# Verify response includes:
# - assets array
# - pagination metadata
# - all asset fields populated
```

---

## Step 7: Error Handling Verification

### Check Console for Errors
```bash
# Start server and monitor logs
npm run dev

# Look for:
# ✅ No "Socket.io not initialized" errors
# ✅ No "Cannot read property 'id' of undefined"
# ✅ No "Column not found" errors
# ✅ Proper error messages for validation failures
```

---

## Step 8: Performance Verification

### Check Query Performance
```bash
# Enable query logging
export DEBUG=*:query

npm run dev

# Monitor:
# ✅ Queries complete in <100ms
# ✅ No N+1 query problems
# ✅ Pagination prevents large result sets
```

---

## Rollback Plan

If issues occur:

```bash
# 1. Restore database schema
git checkout backend/database/schema.sql

# 2. Restore controllers
git checkout backend/controllers/notificationController.ts
git checkout backend/controllers/assetStatusController.ts
git checkout backend/config/db.ts

# 3. Restore asset controller
cp backend/controllers/assetController.ts.backup \
   backend/controllers/assetController.ts

# 4. Restart server
npm run dev
```

---

## Monitoring After Deployment

### Key Metrics to Watch

1. **Error Rate**
   - Should decrease after fixes
   - Monitor for new error patterns

2. **Response Times**
   - Should improve with pagination
   - Monitor for slow queries

3. **Data Integrity**
   - Verify all assets save completely
   - Check notification counts

4. **User Reports**
   - Collect feedback on fixes
   - Monitor for edge cases

---

## Troubleshooting

### Issue: "Asset created but could not retrieve data"
**Solution:** Check that INSERT is returning proper ID
```typescript
// Verify in db.ts
console.log('Insert result:', result.rows[0]);
```

### Issue: "Notifications showing for all users"
**Solution:** Verify user_id filtering in queries
```typescript
// Check notificationController.ts
const userId = (req as any).user?.id;
if (!userId) return res.status(401).json({ error: 'Not authenticated' });
```

### Issue: "Status transitions not validating"
**Solution:** Check state machine logic
```typescript
// Verify in assetStatusController.ts
if (currentAsset.qc_status === 'Pass' && qc_status === 'Fail') {
  return res.status(400).json({ error: 'Invalid transition' });
}
```

### Issue: "Socket.io errors crashing server"
**Solution:** Verify try-catch wrapping
```typescript
try {
  getSocket().emit('event', data);
} catch (socketError) {
  console.warn('Socket.io not available:', socketError);
}
```

---

## Final Checklist

- [ ] Database schema updated with new tables
- [ ] Database connection layer tested
- [ ] Notification controller replaced
- [ ] Asset status controller updated
- [ ] Asset controller fixed (createAssetLibraryItem)
- [ ] All tests passing
- [ ] No console errors
- [ ] Data persisting correctly
- [ ] Notifications user-scoped
- [ ] Status transitions validated
- [ ] Tables displaying with pagination
- [ ] Socket.io errors handled
- [ ] Performance acceptable
- [ ] Ready for production deployment

---

## Support

If you encounter issues:

1. Check `FIXES_APPLIED.md` for detailed issue descriptions
2. Review the specific file changes
3. Check console logs for error messages
4. Verify database schema is updated
5. Test individual endpoints with curl

