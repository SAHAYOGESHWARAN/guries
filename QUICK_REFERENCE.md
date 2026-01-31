# QC Review System - Quick Reference Card

## 🚀 Start Here (Copy & Paste)

### Terminal 1: Backend
```bash
cd backend
npm start
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Browser
```
http://localhost:5173
```

---

## 🔍 Diagnostic (If Issues)

```bash
cd backend
node run-qc-diagnostic.js
```

---

## 📋 Test Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Browser shows http://localhost:5173
- [ ] Login as admin
- [ ] Go to Assets → QC Review
- [ ] Select asset
- [ ] Click "Approve"
- [ ] See success message ✓

---

## 🔧 Common Fixes

| Problem | Fix |
|---------|-----|
| Connection refused | Start backend: `npm start` |
| 404 error | Check asset exists in database |
| 403 forbidden | Login as admin user |
| Wrong port | Check `.env.development` |
| Module error | Check config files use `module.exports` |

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `START_HERE.md` | Quick start (5 min) |
| `QC_REVIEW_MASTER_GUIDE.md` | Complete guide |
| `README_QC_SYSTEM.md` | Documentation index |
| `SYSTEM_VERIFICATION.md` | Verification report |
| `backend/run-qc-diagnostic.js` | Diagnostic script |

---

## 🎯 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/assetLibrary/:id/qc-review` | POST | Submit QC review |
| `/api/v1/assetLibrary/qc/pending` | GET | Get pending assets |
| `/api/v1/assetLibrary/:id/qc-reviews` | GET | Get QC history |
| `/api/v1/health` | GET | Check backend |

---

## 💾 Database

```bash
# Open database
sqlite3 backend/mcc_db.sqlite

# Check admin user
SELECT id, name, role FROM users WHERE role = 'Admin';

# Check assets
SELECT id, asset_name, status FROM assets LIMIT 5;

# Check QC reviews
SELECT * FROM asset_qc_reviews ORDER BY created_at DESC LIMIT 5;
```

---

## 🔄 Restart Everything

```bash
# Kill both servers (Ctrl+C in each terminal)

# Clear cache
rm -rf frontend/dist
rm -rf frontend/node_modules/.vite

# Restart backend
cd backend && npm start

# Restart frontend (new terminal)
cd frontend && npm run dev

# Hard refresh browser (Ctrl+Shift+R)
```

---

## ✅ Success Indicators

✅ Diagnostic shows all checks passed  
✅ Backend running on port 3001  
✅ Frontend running on port 5173  
✅ QC submission returns 200 status  
✅ Asset status updates  
✅ No console errors  

---

## 🆘 Still Not Working?

1. Run: `node backend/run-qc-diagnostic.js`
2. Check: Backend logs for errors
3. Verify: Database has data
4. Check: Browser console for errors
5. Restart: Both servers
6. Clear: Browser cache (Ctrl+Shift+Delete)
7. Reload: Hard refresh (Ctrl+Shift+R)

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

# Check logs
tail -f backend/server.log
```

---

## 🎯 Configuration

**Backend Port**: 3001  
**Frontend Port**: 5173  
**API URL**: http://localhost:3001/api/v1  
**Database**: backend/mcc_db.sqlite  
**Admin Role**: Case-sensitive "Admin"  

---

## ✨ That's It!

Everything is ready. Start with the commands above and follow the test checklist.

