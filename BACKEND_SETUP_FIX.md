# Backend Setup Fix - Solve Login Error

## Problem
```
Uncaught SyntaxError: Unexpected token 'export'
Failed to load resource: the server responded with a status of 500
Backend not available, using localStorage
```

## Root Cause
The backend is trying to run TypeScript files directly without compiling them to JavaScript first.

---

## Solution: Compile Backend

### Step 1: Build Backend (One-time)
```bash
cd backend
npm run build
```

This compiles all TypeScript files to JavaScript in the `dist/` folder.

### Step 2: Start Backend
```bash
npm start
```

This runs the compiled JavaScript from `dist/server.js`

### Step 3: Verify Backend is Running
```bash
# Should see:
# 🚀 Server running on port 3003
# ✅ Connected to SQLite Database
```

### Step 4: Create Admin User
```bash
node create-admin-user.js
```

### Step 5: Login
- Email: `admin@example.com`
- Password: `admin123`

---

## Complete Setup Steps

### Terminal 1: Backend
```bash
cd backend
npm install
npm run build
npm start
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

### Terminal 3: Admin Setup (after backend is running)
```bash
cd backend
node create-admin-user.js
```

---

## What Each Command Does

| Command | Purpose | Output |
|---------|---------|--------|
| `npm run build` | Compile TypeScript to JavaScript | Creates `dist/` folder |
| `npm start` | Run compiled backend | Server on port 3003 |
| `npm run dev` | Run backend in dev mode with auto-reload | Uses nodemon |
| `node create-admin-user.js` | Create admin user in database | Admin credentials |

---

## Troubleshooting

### Error: "Cannot find module"
```bash
# Solution: Install dependencies
cd backend
npm install
```

### Error: "Port 3003 already in use"
```bash
# Solution: Kill process on port 3003
# Windows:
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3003
kill -9 <PID>
```

### Error: "Database initialization failed"
```bash
# Solution: Check database file exists
ls -la backend/mcc_db.sqlite

# If missing, create it:
cd backend
npm run build
npm start
# Let it run for a few seconds, then Ctrl+C
```

### Error: "Admin user not found"
```bash
# Solution: Create admin user
cd backend
node create-admin-user.js
```

---

## Development vs Production

### Development Mode
```bash
cd backend
npm run dev
```
- Uses nodemon for auto-reload
- Watches for file changes
- Useful for development

### Production Mode
```bash
cd backend
npm run build
npm start
```
- Runs compiled JavaScript
- No auto-reload
- Better performance

---

## Environment Variables

Create `.env` file in backend directory:

```env
NODE_ENV=development
PORT=3003
DATABASE_URL=./mcc_db.sqlite
FRONTEND_URL=http://localhost:5173
```

---

## Verify Setup

### Check 1: Backend Running
```bash
curl http://localhost:3003/health
# Expected: {"status":"OK","timestamp":"..."}
```

### Check 2: Admin User Created
```bash
# In backend directory
node -e "const db = require('better-sqlite3')('./mcc_db.sqlite'); const user = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@example.com'); console.log(user);"
```

### Check 3: Login Works
1. Open http://localhost:5173
2. Enter admin@example.com / admin123
3. Should see dashboard

---

## Quick Reference

```bash
# First time setup
cd backend
npm install
npm run build
npm start

# In another terminal
cd backend
node create-admin-user.js

# In another terminal
cd frontend
npm install
npm run dev

# Open http://localhost:5173
# Login with admin@example.com / admin123
```

---

## Files Involved

- `backend/server.ts` - Main server file
- `backend/routes/api.ts` - API routes
- `backend/controllers/adminController.ts` - Admin login logic
- `backend/tsconfig.json` - TypeScript config
- `backend/package.json` - Build scripts
- `backend/dist/` - Compiled JavaScript (created by `npm run build`)

---

## Next Steps

1. ✅ Run `npm run build` in backend
2. ✅ Run `npm start` to start backend
3. ✅ Run `node create-admin-user.js` to create admin
4. ✅ Run `npm run dev` in frontend
5. ✅ Login with admin credentials
6. ✅ Test sub-service page

---

**Status**: Ready to fix ✅
**Time to fix**: 2-3 minutes
**Difficulty**: Easy
