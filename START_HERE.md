# QC Review System - START HERE

## 🚀 Quick Start (5 Minutes)

### 1. Run Diagnostic
```bash
cd backend
node run-qc-diagnostic.js
```

### 2. Start Backend
```bash
cd backend
npm start
# Should show: Server running on port 3001
```

### 3. Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
# Should show: http://localhost:5173
```

### 4. Test QC Submission
1. Open http://localhost:5173
2. Login as admin
3. Go to Assets → QC Review
4. Select asset → Click "Approve"
5. Should see success message ✓

---

## ❌ If Submission Fails

### Step 1: Run Diagnostic
```bash
cd backend
node run-qc-diagnostic.js
```

**Expected output:**
```
✓ Database file exists
✓ Database is accessible
✓ All required tables exist
✓ Assets exist in database
✓ Users exist in database
✓ Admin user exists
✓ Backend is running
✓ QC review endpoint works
✓ Frontend .env.development exists
✓ API URL set to localhost:3001
✓ QC review route defined

ALL CHECKS PASSED!
```

### Step 2: Check Backend Logs
```bash
# Look for errors in backend console output
# Or check server.log if it exists
```

### Step 3: Verify Database
```bash
sqlite3 backend/mcc_db.sqlite

# Check admin user
SELECT id, name, role FROM users WHERE role = 'Admin';

# Check assets
SELECT id, asset_name FROM assets LIMIT 1;

# Check QC reviews
SELECT * FROM asset_qc_reviews LIMIT 1;
```

### Step 4: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Go to Network tab
5. Click "Approve"
6. Check POST request status (should be 200)

### Step 5: Restart Everything
```bash
# Kill both servers (Ctrl+C)

# Clear cache
rm -rf frontend/dist
rm -rf frontend/node_modules/.vite

# Restart backend
cd backend
npm start

# Restart frontend (new terminal)
cd frontend
npm run dev

# Hard refresh browser (Ctrl+Shift+R)
```

---

## 🔧 Common Fixes

| Error | Fix |
|-------|-----|
| Connection refused | Start backend: `npm start` |
| 404 Not Found | Check asset ID exists in database |
| 403 Forbidden | Login as admin user |
| Wrong API URL | Check `.env.development` has `VITE_API_URL=http://localhost:3001/api/v1` |
| Module syntax error | Check config files use `module.exports` not `export default` |
| No response | Restart backend server |

---

## 📋 Checklist

Before testing:
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] User logged in as admin
- [ ] Asset exists in database
- [ ] No console errors

After submission:
- [ ] Success message appears
- [ ] Asset status updated
- [ ] No console errors
- [ ] Database record created

---

## 📚 Documentation

- **QC_REVIEW_MASTER_GUIDE.md** - Complete guide with all details
- **backend/run-qc-diagnostic.js** - Automated diagnostic script

---

## 🎯 Success Indicators

✅ Diagnostic shows all checks passed
✅ Backend running on port 3001
✅ Frontend running on port 5173
✅ QC submission returns 200 status
✅ Asset status updates
✅ No console errors

---

## 🆘 Still Not Working?

1. Run diagnostic: `node backend/run-qc-diagnostic.js`
2. Check backend logs for errors
3. Verify database has data
4. Check browser console for errors
5. Restart both servers
6. Clear browser cache (Ctrl+Shift+Delete)
7. Hard refresh (Ctrl+Shift+R)

---

## 📞 Key Commands

```bash
# Diagnostic
node backend/run-qc-diagnostic.js

# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Check database
sqlite3 backend/mcc_db.sqlite

# Test API
curl http://localhost:3001/api/v1/health
```

---

## ✨ That's It!

QC Review system should now work properly. If you encounter any issues, follow the troubleshooting steps above.
