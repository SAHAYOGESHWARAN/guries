# Fix Login Issue - "Invalid email or password"

## Problem
Login returns "Invalid email or password" error even with correct credentials.

## Root Cause
The backend environment variables are not being loaded correctly, or the bcrypt hash doesn't match the password.

---

## ✅ Solution

### Step 1: Verify Backend Configuration

Check that `backend/.env` has the correct bcrypt hash:

```bash
cat backend/.env | grep ADMIN_PASSWORD
```

Should show:
```
ADMIN_PASSWORD=$2a$10$E0IhqlBU6K1o2zxe2bp0vO2vpHsGatVVV7iBKGtHlN9zGagScGaiS
```

### Step 2: Restart Backend

Kill any running backend processes and restart:

```bash
# Kill all node processes
pkill -f node

# Start backend fresh
npm run dev --prefix backend
```

Watch for these messages in console:
```
🔐 Auth Configuration Loaded:
   ADMIN_EMAIL: admin@example.com
   ADMIN_PASSWORD: ✅ SET
   JWT_SECRET: ✅ SET
   JWT_EXPIRES_IN: 7d
```

### Step 3: Test API Directly

```bash
curl -X POST http://localhost:3003/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Should return:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### Step 4: Restart Frontend

```bash
npm run dev --prefix frontend
```

### Step 5: Test Login

1. Open `http://localhost:5173`
2. Enter email: `admin@example.com`
3. Enter password: `admin123`
4. Click "Sign In"

---

## 🔧 If Still Not Working

### Option 1: Regenerate Bcrypt Hash

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

Copy the output and update `ADMIN_PASSWORD` in `backend/.env`:

```bash
ADMIN_PASSWORD=<paste-new-hash-here>
```

Then restart backend.

### Option 2: Run Verification Script

**On Windows:**
```bash
verify-login.bat
```

**On Mac/Linux:**
```bash
bash verify-login.sh
```

This will test:
- Backend is running
- Environment variables are loaded
- API endpoint works
- Frontend is running

### Option 3: Check Backend Logs

When you try to login, the backend console should show:

**Success:**
```
🔐 Login attempt: { email: 'admin@example.com', adminEmail: 'admin@example.com' }
✅ Email matches admin email
🔑 Comparing password with hash...
🔐 Password valid: true
✅ Login successful, token generated
```

**Failure:**
```
🔐 Login attempt: { email: 'admin@example.com', adminEmail: 'admin@example.com' }
✅ Email matches admin email
🔑 Comparing password with hash...
🔐 Password valid: false
❌ Password mismatch
```

If you see "Password mismatch", the bcrypt hash is wrong. Regenerate it.

---

## 📋 Checklist

- [ ] Backend `.env` file exists
- [ ] `ADMIN_EMAIL=admin@example.com`
- [ ] `ADMIN_PASSWORD` is bcrypt hash (starts with `$2a$10$`)
- [ ] `JWT_SECRET` is set
- [ ] Backend restarted after `.env` changes
- [ ] Backend console shows "Auth Configuration Loaded"
- [ ] API test with cURL returns success
- [ ] Frontend is running
- [ ] Browser console has no errors
- [ ] Login works in browser

---

## 🚀 Quick Fix (All Steps)

```bash
# 1. Kill all node processes
pkill -f node

# 2. Verify .env
cat backend/.env | grep ADMIN_

# 3. Start backend
npm run dev --prefix backend

# 4. In new terminal, start frontend
npm run dev --prefix frontend

# 5. Test API
curl -X POST http://localhost:3003/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 6. Open browser
# http://localhost:5173
```

---

## 📚 Related Files

- `backend/.env` - Configuration file
- `backend/controllers/authController.ts` - Login logic (with debug logging)
- `frontend/views/LoginView.tsx` - Login page
- `LOGIN_TROUBLESHOOTING.md` - Detailed troubleshooting guide
- `verify-login.bat` - Windows verification script
- `verify-login.sh` - Mac/Linux verification script

---

## ✅ Status

**Debug logging added to auth controller** - You can now see exactly what's happening during login attempts in the backend console.

**Verification scripts created** - Run `verify-login.bat` (Windows) or `bash verify-login.sh` (Mac/Linux) to test the entire system.

**Troubleshooting guide created** - See `LOGIN_TROUBLESHOOTING.md` for detailed debugging steps.

---

**Next: Restart backend and test login again!**

