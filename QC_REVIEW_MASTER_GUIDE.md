# QC Review System - Master Guide

## Quick Start (5 Minutes)

### Step 1: Run Diagnostic
```bash
cd backend
node run-qc-diagnostic.js
```

### Step 2: Start Servers
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Step 3: Test QC Submission
1. Open http://localhost:5173
2. Login as admin
3. Go to Assets → QC Review
4. Select asset and click "Approve"
5. Should see success message

---

## If Submission Fails

### Step 1: Run Full Diagnostic
```bash
cd backend
node run-qc-diagnostic.js
```

This checks:
- ✓ Database connectivity
- ✓ Required tables exist
- ✓ Backend running on port 3001
- ✓ API endpoint accessible
- ✓ Frontend configuration correct
- ✓ Backend routes defined
- ✓ Config files using CommonJS

### Step 2: Check Backend Logs
```bash
# Look for errors
tail -f backend/server.log

# Or check console output when running npm start
```

### Step 3: Verify Database
```bash
sqlite3 backend/mcc_db.sqlite

# Check tables
.tables

# Check admin user
SELECT id, name, role FROM users WHERE role = 'Admin';

# Check assets
SELECT id, asset_name, status FROM assets LIMIT 5;

# Check QC reviews
SELECT * FROM asset_qc_reviews ORDER BY created_at DESC LIMIT 5;
```

### Step 4: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Go to Network tab
5. Click "Approve"
6. Check POST request to `/api/v1/assetLibrary/1/qc-review`
7. Check status code (should be 200)

### Step 5: Restart Everything
```bash
# Kill both servers (Ctrl+C in each terminal)

# Clear cache
rm -rf frontend/dist
rm -rf frontend/node_modules/.vite

# Restart backend
cd backend
npm start

# Restart frontend
cd frontend
npm run dev

# Hard refresh browser (Ctrl+Shift+R)
```

---

## Common Issues & Solutions

### Issue 1: "Connection Refused"
**Error:** `net::ERR_CONNECTION_REFUSED`

**Solution:**
```bash
# Check if backend is running
curl http://localhost:3001/api/v1/health

# If not, start it
cd backend
npm start
```

### Issue 2: "404 Not Found"
**Error:** `POST http://localhost:3001/api/v1/assetLibrary/1/qc-review 404`

**Solution:**
```bash
# Check route exists in backend/routes/api.ts
grep "qc-review" backend/routes/api.ts

# Should show: router.post('/assetLibrary/:id/qc-review'
```

### Issue 3: "403 Forbidden"
**Error:** `Access denied. Only administrators can perform QC reviews.`

**Solution:**
```bash
# Verify user is admin
sqlite3 backend/mcc_db.sqlite
SELECT role FROM users WHERE id = 1;

# Should show: Admin
```

### Issue 4: "Asset Not Found"
**Error:** `Asset not found`

**Solution:**
```bash
# Check asset exists
sqlite3 backend/mcc_db.sqlite
SELECT id, asset_name FROM assets LIMIT 1;

# Use correct asset ID in URL
```

### Issue 5: "Wrong API URL"
**Error:** API calls going to port 3003 instead of 3001

**Solution:**
```bash
# Check frontend/.env.development
cat frontend/.env.development

# Should show:
# VITE_API_URL=http://localhost:3001/api/v1
# VITE_SOCKET_URL=http://localhost:3001

# If wrong, update and restart frontend
```

### Issue 6: "Module Syntax Error"
**Error:** `Unexpected token 'export'`

**Solution:**
```bash
# Check config files use CommonJS
grep "module.exports" frontend/tailwind.config.js
grep "module.exports" frontend/postcss.config.js

# Should show module.exports, not export default
```

---

## QC Submission Flow

### 1. Frontend Sends Request
```javascript
POST /api/v1/assetLibrary/1/qc-review
Headers: {
  'Content-Type': 'application/json',
  'X-User-Role': 'Admin'
}
Body: {
  qc_score: 85,
  qc_remarks: 'Good quality',
  qc_decision: 'approved',
  qc_reviewer_id: 1,
  user_role: 'Admin',
  checklist_items: {...},
  checklist_completion: true,
  linking_active: true
}
```

### 2. Backend Validates
- ✓ Check user is admin
- ✓ Validate QC decision (approved/rejected/rework)
- ✓ Get current asset
- ✓ Update asset status

### 3. Backend Updates Database
- ✓ Update assets table
- ✓ Insert asset_qc_reviews record
- ✓ Create notification
- ✓ Log audit trail
- ✓ Link to service (if approved)

### 4. Backend Returns Response
```json
{
  "id": 1,
  "name": "Asset Name",
  "status": "QC Approved",
  "qc_score": 85,
  "qc_remarks": "Good quality",
  "qc_reviewed_at": "2024-01-31T10:30:00Z",
  "linking_active": 1,
  "rework_count": 0,
  "submitted_by": 2
}
```

### 5. Frontend Shows Success
- ✓ Display success message
- ✓ Close QC panel
- ✓ Refresh asset list
- ✓ Update asset status

---

## Database Schema

### assets Table (QC Fields)
```sql
qc_score INTEGER,              -- 0-100 score
qc_remarks TEXT,               -- Admin feedback
qc_reviewer_id INTEGER,        -- Admin user ID
qc_reviewed_at DATETIME,       -- Review timestamp
qc_status TEXT,                -- 'Pass', 'Fail', 'Rework'
qc_checklist_completion INTEGER, -- 0 or 1
linking_active INTEGER,        -- 0 or 1
rework_count INTEGER,          -- Number of reworks
workflow_log TEXT              -- JSON array
```

### asset_qc_reviews Table
```sql
id INTEGER PRIMARY KEY,
asset_id INTEGER NOT NULL,
qc_reviewer_id INTEGER,
qc_score INTEGER,
checklist_completion INTEGER,
qc_remarks TEXT,
qc_decision TEXT,              -- 'approved', 'rejected', 'rework'
checklist_items TEXT,          -- JSON
created_at DATETIME
```

---

## Testing Checklist

Before submitting QC review:
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] User logged in as admin
- [ ] Asset exists in database
- [ ] API URL correct in .env.development
- [ ] No console errors
- [ ] Network tab shows POST request

After submitting QC review:
- [ ] Success message appears
- [ ] Asset status updated
- [ ] QC score shows in details
- [ ] Notification sent
- [ ] Database record created
- [ ] No console errors

---

## Manual Testing with cURL

```bash
curl -X POST http://localhost:3001/api/v1/assetLibrary/1/qc-review \
  -H "Content-Type: application/json" \
  -H "X-User-Role: Admin" \
  -d '{
    "qc_score": 85,
    "qc_remarks": "Good quality",
    "qc_decision": "approved",
    "qc_reviewer_id": 1,
    "user_role": "Admin",
    "checklist_items": {
      "Brand Compliance": true,
      "Technical Specs Met": true,
      "Content Quality": true,
      "SEO Optimization": true,
      "Legal / Regulatory Check": true,
      "Tone of Voice": true
    },
    "checklist_completion": true,
    "linking_active": true
  }'
```

Expected response:
```json
{
  "id": 1,
  "name": "Asset Name",
  "status": "QC Approved",
  "qc_score": 85,
  ...
}
```

---

## Files to Check

| File | Purpose |
|------|---------|
| `backend/run-qc-diagnostic.js` | Diagnostic script |
| `backend/routes/api.ts` | API routes definition |
| `backend/controllers/assetController.ts` | QC review logic |
| `backend/mcc_db.sqlite` | Database file |
| `frontend/.env.development` | Frontend config |
| `frontend/tailwind.config.js` | Tailwind config |
| `frontend/postcss.config.js` | PostCSS config |
| `frontend/views/AssetQCView.tsx` | QC review component |

---

## Restart Procedure

If nothing works:

```bash
# 1. Kill all processes
# Press Ctrl+C in each terminal

# 2. Clear caches
rm -rf frontend/dist
rm -rf frontend/node_modules/.vite

# 3. Restart backend
cd backend
npm start

# 4. In new terminal, restart frontend
cd frontend
npm run dev

# 5. Hard refresh browser
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# 6. Run diagnostic again
cd backend
node run-qc-diagnostic.js
```

---

## Success Indicators

✅ Diagnostic script shows all checks passed
✅ Backend running on port 3001
✅ Frontend running on port 5173
✅ API calls to localhost:3001
✅ QC submission returns 200 status
✅ Asset status updates in database
✅ Notification created
✅ No console errors

---

## Support

### If Still Failing:

1. **Run diagnostic** - `node backend/run-qc-diagnostic.js`
2. **Check backend logs** - Look for error messages
3. **Verify database** - Check tables and data exist
4. **Check browser console** - Look for network errors
5. **Restart servers** - Clear state and restart
6. **Check file permissions** - Ensure database file is writable
7. **Try different browser** - Rule out browser cache issues

### Key Commands:

```bash
# Diagnostic
node backend/run-qc-diagnostic.js

# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Check database
sqlite3 backend/mcc_db.sqlite

# Check backend logs
tail -f backend/server.log

# Test API
curl http://localhost:3001/api/v1/health
```

---

## Summary

**QC Review System requires:**
- Backend running on port 3001
- Frontend running on port 5173
- Admin user in database
- Correct API URL in .env.development
- Valid asset in database
- Proper request headers

**If submission fails:**
1. Run diagnostic script
2. Check backend logs
3. Verify database
4. Check browser console
5. Restart servers
6. Clear cache and reload

**Expected result:**
- Success message appears
- Asset status updates
- Notification sent
- Database record created
