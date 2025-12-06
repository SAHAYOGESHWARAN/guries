# Quick Start - Marketing Control Center

## ⚡ 5-Minute Setup

### 1. Install PostgreSQL
- Windows: Download from [postgresql.org](https://www.postgresql.org/download/)
- Mac: `brew install postgresql@14 && brew services start postgresql@14`
- Linux: `sudo apt install postgresql && sudo systemctl start postgresql`

### 2. Setup Backend
```bash
cd backend
copy .env.example .env          # Windows
cp .env.example .env            # Mac/Linux

# Edit .env - Set your postgres password:
# DB_PASSWORD=your_password_here

npm install
node setup-database.js
npm run dev
```

### 3. Setup Frontend (New Terminal)
```bash
cd ..
npm install
npm run dev
```

### 4. Open Browser
```
http://localhost:5173
```

## ✅ Verify Setup

1. **Backend Health:** http://localhost:3001/health
2. **Test Country Master:** Add a country, should appear immediately
3. **Test Asset Linking:** Link assets to services, should update instantly

## 🔧 Quick Commands

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
npm run dev
```

### Reset Database
```bash
cd backend
node setup-database.js
```

### View Database
```bash
psql -U postgres -d mcc_db
\dt                    # List tables
SELECT * FROM countries;
```

## 🆘 Common Issues

**Backend won't start?**
- Check PostgreSQL is running
- Verify password in `backend/.env`

**Frontend can't connect?**
- Make sure backend is running on port 3001
- Check for CORS errors in browser console

**Assets not linking?**
- Save the service first
- Check Content Repository has assets
- Refresh the page

## 📚 Full Documentation

- **Complete Setup:** `COMPLETE_SETUP_GUIDE.md`
- **Backend Details:** `BACKEND_SETUP_GUIDE.md`
- **Asset Linking:** `ASSET_LINKING_FIX.md`

## 🎉 You're Ready!

Start building with the Marketing Control Center! 🚀
