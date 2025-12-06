# Quick Start: Asset Library Linking

## 🚀 3-Step Setup

### 1️⃣ Run Database Migration (1 minute)
```bash
apply-asset-linking.bat
```
Or manually:
```bash
psql -U postgres -d mcc_db -f add-asset-linking-columns.sql
```

### 2️⃣ Restart Servers (1 minute)
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### 3️⃣ Test It (2 minutes)
1. Open http://localhost:5173
2. Go to **Assets** → Upload a test image
3. Go to **Service Master** → Edit any service
4. Click **Linking** tab
5. See your asset → Click to link it ✅

---

## 📖 How to Use

### Upload Assets
**Assets Module** → **Upload Asset** → Select file → Fill details → **Confirm**

### Link to Services
**Service Master** → **Edit Service** → **Linking Tab** → Click asset to link

### Search Assets
Type in search box → Filter by name, type, or repository

### Unlink Assets
Click **X** button on linked asset

---

## 🎯 What You Get

✅ All assets from Asset Module visible in Service Linking  
✅ Two-panel interface (Linked | Available)  
✅ Real-time search and filtering  
✅ Visual asset previews  
✅ One-click link/unlink  
✅ Repository organization  

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `add-asset-linking-columns.sql` | Database migration |
| `apply-asset-linking.bat` | Run migration easily |
| `components/ServiceAssetLinker.tsx` | Linking UI |
| `ASSET_LIBRARY_LINKING_GUIDE.md` | Full documentation |

---

## ✅ Verification

### Check Database
```bash
psql -U postgres -d mcc_db -f verify-asset-linking.sql
```

### Check Frontend
- No console errors
- Assets load in Linking tab
- Click to link works

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Migration fails | Check PostgreSQL is running |
| Assets not showing | Verify backend is running |
| Can't link | Ensure service is saved first |
| No thumbnails | Check file URLs are valid |

---

## 📞 Need More Help?

See **ASSET_LIBRARY_LINKING_GUIDE.md** for:
- Detailed documentation
- Technical architecture
- API endpoints
- Testing checklist
- Future enhancements

---

**Ready to go!** Run the migration and start linking assets to services. 🎉
