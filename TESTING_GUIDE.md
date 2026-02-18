# End-to-End Testing Guide

## Quick Start

### 1. Setup Environment

```bash
# Backend setup
cd backend
npm install
cp .env.example .env

# Frontend setup
cd ../frontend
npm install
cp .env.example .env.local
```

### 2. Start Backend
```bash
cd backend
npm run dev
# Should see: ✅ Connected to database (SQLite)
# Should see: ✅ Database ready for requests
# Should see: Server running on port 3001
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
# Should see: VITE v6.4.1 ready in 123 ms
# Should see: ➜  Local:   http://localhost:5173/
```

---

## Test Scenarios

### Test 1: Login & Authentication

**Steps:**
1. Navigate to http://localhost:5173
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: (from .env ADMIN_PASSWORD)
3. Click Login

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ JWT token stored in localStorage
- ✅ User info displayed in header
- ✅ No console errors

**Check:**
```javascript
// In browser console
localStorage.getItem('token') // Should return JWT token
```

---

### Test 2: Asset Upload

**Steps:**
1. Navigate to Asset Library or Web Asset Upload
2. Fill form:
   - Asset Name: "Test Asset"
   - Asset Type: "Blog Post"
   - Asset Category: "Content"
   - Asset Format: "HTML"
   - Application Type: "WEB"
3. Upload file (or leave empty for testing)
4. Click Submit

**Expected Results:**
- ✅ Form validates all required fields
- ✅ Asset created successfully
- ✅ Asset appears in asset library
- ✅ Status shows "Draft"
- ✅ No console errors

**Check Database:**
```bash
# In backend terminal
sqlite3 backend/mcc_db.sqlite "SELECT * FROM assets LIMIT 1;"
```

---

### Test 3: Data Fetching & Display

**Steps:**
1. Navigate to any data view (Projects, Campaigns, Tasks, etc.)
2. Wait for data to load
3. Check browser console

**Expected Results:**
- ✅ Data loads within 3 seconds
- ✅ Table displays records
- ✅ Pagination works (if applicable)
- ✅ No 404 errors in console
- ✅ No CORS errors

**Check Network:**
```javascript
// In browser DevTools Network tab
// Should see successful requests to /api/v1/assets, /api/v1/projects, etc.
// Status: 200 OK
// Response format: { success: true, data: [...] }
```

---

### Test 4: Real-Time Notifications

**Steps:**
1. Open two browser windows (same user)
2. In Window 1: Navigate to Asset QC Review
3. In Window 2: Create a new asset
4. In Window 1: Approve the asset
5. Check Window 2 for notification

**Expected Results:**
- ✅ Notification appears in Window 2 within 1 second
- ✅ Notification shows correct message
- ✅ Notification type matches decision (success/error/warning)
- ✅ No console errors

**Check Socket.io:**
```javascript
// In browser console
// Should see Socket.io connection messages
// Should see user_join event
```

---

### Test 5: QC Workflow (Approve/Reject)

**Steps:**
1. Navigate to Asset QC Review
2. Select an asset in "Pending QC" status
3. Fill QC form:
   - QC Score: 85
   - QC Remarks: "Good quality"
   - Decision: "Approved"
4. Click Submit

**Expected Results:**
- ✅ Asset status changes to "QC Approved"
- ✅ Notification created for asset owner
- ✅ Asset linking_active flag set to 1
- ✅ Asset appears in service's asset list
- ✅ No console errors

**Check Database:**
```bash
sqlite3 backend/mcc_db.sqlite "SELECT id, asset_name, status, qc_status, linking_active FROM assets WHERE id = 1;"
```

---

### Test 6: Form Validation

**Steps:**
1. Navigate to any form (Create Project, Create Campaign, etc.)
2. Try to submit with empty required fields
3. Try to submit with invalid email format
4. Try to submit with invalid phone format

**Expected Results:**
- ✅ Frontend validation shows error messages
- ✅ Form doesn't submit
- ✅ Backend validation also prevents save (if frontend bypassed)
- ✅ Error messages are clear and helpful

---

### Test 7: Data Persistence

**Steps:**
1. Create a new record (Project, Campaign, Task, etc.)
2. Refresh the page
3. Navigate away and back

**Expected Results:**
- ✅ Record still exists after refresh
- ✅ Data is saved in database
- ✅ Data is cached in localStorage
- ✅ Data is cached in memory

**Check:**
```javascript
// In browser console
localStorage.getItem('mcc_projects') // Should return JSON array
```

---

### Test 8: Error Handling

**Steps:**
1. Stop the backend server
2. Try to fetch data in frontend
3. Try to create a new record
4. Check browser console

**Expected Results:**
- ✅ Graceful error message displayed
- ✅ Fallback to cached/localStorage data
- ✅ No unhandled promise rejections
- ✅ Error logged to console with context

---

### Test 9: Status Updates

**Steps:**
1. Navigate to Tasks view
2. Select a task
3. Change status (e.g., "Pending" → "In Progress")
4. Click Save

**Expected Results:**
- ✅ Status updated in database
- ✅ Status updated in UI immediately
- ✅ Real-time update via Socket.io
- ✅ Notification sent to assigned user

---

### Test 10: Offline Mode

**Steps:**
1. Open DevTools Network tab
2. Set throttling to "Offline"
3. Try to navigate and view data
4. Go back online

**Expected Results:**
- ✅ Cached data still displays
- ✅ localStorage data is used
- ✅ Clear indication that app is offline
- ✅ Data syncs when back online

---

## Performance Testing

### Load Time
```javascript
// In browser console
performance.getEntriesByType('navigation')[0].loadEventEnd - performance.getEntriesByType('navigation')[0].loadEventStart
// Should be < 3000ms
```

### API Response Time
```javascript
// In DevTools Network tab
// Most requests should complete in < 500ms
// Large data requests < 2000ms
```

### Memory Usage
```javascript
// In DevTools Memory tab
// Should not exceed 100MB for normal usage
// No memory leaks after navigation
```

---

## Debugging Tips

### Enable Debug Logging
```javascript
// In browser console
localStorage.setItem('DEBUG', 'true')
// Reload page
```

### Check Database
```bash
# List all tables
sqlite3 backend/mcc_db.sqlite ".tables"

# Check specific table
sqlite3 backend/mcc_db.sqlite "SELECT * FROM assets LIMIT 5;"

# Check row count
sqlite3 backend/mcc_db.sqlite "SELECT COUNT(*) FROM assets;"
```

### Monitor Socket.io
```javascript
// In browser console
// Check if socket is connected
io.connected // Should be true

// Listen to all events
io.onAny((event, ...args) => {
    console.log(`[Socket] ${event}`, args);
});
```

### Check API Responses
```javascript
// In browser console
fetch('/api/v1/assets')
    .then(r => r.json())
    .then(d => console.log(d))
```

---

## Common Issues & Solutions

### Issue: "Cannot GET /api/v1/assets"
**Solution**: Backend not running. Start backend with `npm run dev`

### Issue: CORS error
**Solution**: Check CORS_ORIGIN in backend .env matches frontend URL

### Issue: Socket.io not connecting
**Solution**: Check SOCKET_CORS_ORIGINS in backend .env

### Issue: Data not saving
**Solution**: Check database path and permissions. Verify database is created.

### Issue: Notifications not appearing
**Solution**: Check Socket.io connection. Verify user_join event is emitted.

### Issue: Stale data displayed
**Solution**: Clear localStorage and refresh. Check cache TTL settings.

---

## Test Results Template

```markdown
# Test Results - [Date]

## Environment
- Node: v20.16.0
- npm: 10.8.3
- OS: Windows
- Browser: Chrome 120

## Test Results
- [ ] Test 1: Login & Authentication - PASS/FAIL
- [ ] Test 2: Asset Upload - PASS/FAIL
- [ ] Test 3: Data Fetching & Display - PASS/FAIL
- [ ] Test 4: Real-Time Notifications - PASS/FAIL
- [ ] Test 5: QC Workflow - PASS/FAIL
- [ ] Test 6: Form Validation - PASS/FAIL
- [ ] Test 7: Data Persistence - PASS/FAIL
- [ ] Test 8: Error Handling - PASS/FAIL
- [ ] Test 9: Status Updates - PASS/FAIL
- [ ] Test 10: Offline Mode - PASS/FAIL

## Performance
- Page Load Time: ___ms
- API Response Time: ___ms
- Memory Usage: ___MB

## Issues Found
1. [Issue description]
2. [Issue description]

## Notes
[Any additional notes]
```

