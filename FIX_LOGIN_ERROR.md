# Fix Login Error - Quick Guide

## Error Message
```
Uncaught SyntaxError: Unexpected token 'export'
Failed to load resource: the server responded with a status of 500
Backend not available, using localStorage
```

## Cause
Backend TypeScript files are not compiled to JavaScript.

---

## ⚡ Quick Fix (2 minutes)

### Step 1: Build Backend
```bash
cd backend
npm run build
```

### Step 2: Start Backend
```bash
npm start
```

Expected output:
```
✅ Connected to SQLite Database
🚀 Server running on port 3003
```

### Step 3: Create Admin User (in new terminal)
```bash
cd backend
node create-admin-user.js
```

### Step 4: Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

### Step 5: Login
- URL: http://localhost:5173
- Email: `admin@example.com`
- Password: `admin123`

---

## ✅ Verify It Works

### Check 1: Backend Health
```bash
curl http://localhost:3003/health
# Should return: {"status":"OK","timestamp":"..."}
```

### Check 2: Admin User Exists
```bash
# In backend directory
node -e "const db = require('better-sqlite3')('./mcc_db.sqlite'); const user = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@example.com'); console.log(user ? '✅ Admin user exists' : '❌ Admin user not found');"
```

### Check 3: Login Works
1. Open http://localhost:5173
2. Enter credentials
3. Should see dashboard

---

## 🔧 Automated Setup

### Linux/Mac
```bash
chmod +x setup-backend.sh
./setup-backend.sh
```

### Windows
```bash
setup-backend.bat
```

---

## 📋 What Each Step Does

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `npm run build` | Compile TypeScript → JavaScript |
| 2 | `npm start` | Run compiled backend |
| 3 | `node create-admin-user.js` | Create admin in database |
| 4 | `npm run dev` | Start frontend dev server |
| 5 | Login | Access application |

---

## 🚨 If Still Getting Error

### Error: "Cannot find module"
```bash
cd backend
npm install
npm run build
npm start
```

### Error: "Port 3003 in use"
```bash
# Windows
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3003
kill -9 <PID>
```

### Error: "Database error"
```bash
cd backend
npm run build
npm start
# Wait 5 seconds, then Ctrl+C
node create-admin-user.js
npm start
```

---

## 📁 Terminal Setup

You need 3 terminals:

### Terminal 1: Backend
```bash
cd backend
npm run build
npm start
```

### Terminal 2: Admin Setup
```bash
cd backend
node create-admin-user.js
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

Then open: http://localhost:5173

---

## 🎯 Expected Output

### Backend Terminal
```
✅ Connected to SQLite Database
🚀 Server running on port 3003
```

### Admin Setup Terminal
```
✅ Admin user created successfully!

📋 Admin User Details:
   ID: 1
   Name: Admin User
   Email: admin@example.com
   Role: admin
   Status: active

🔐 Login Credentials:
   Email: admin@example.com
   Password: admin123
```

### Frontend Terminal
```
  VITE v6.4.1  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## ✨ Success Indicators

- ✅ Backend running on port 3003
- ✅ Frontend running on port 5173
- ✅ Admin user created
- ✅ Can login with admin credentials
- ✅ Sub-service page loads
- ✅ No errors in console

---

## 🔐 Login Credentials

```
Email: admin@example.com
Password: admin123
```

**⚠️ Change password after first login!**

---

## 📞 Still Having Issues?

1. Check `BACKEND_SETUP_FIX.md` for detailed troubleshooting
2. Verify Node.js is installed: `node --version`
3. Check ports are available: `netstat -ano | findstr :3003`
4. Check database file exists: `ls backend/mcc_db.sqlite`
5. Check logs for errors

---

**Time to fix**: 2-3 minutes  
**Difficulty**: Easy  
**Status**: Ready to fix ✅
