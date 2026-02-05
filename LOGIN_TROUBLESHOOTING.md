# Login Troubleshooting Guide

## Issue: "Invalid email or password"

This error occurs when the backend cannot verify your credentials. Follow these steps to debug:

---

## 🔍 Step 1: Verify Backend is Running

### Check if backend is running
```bash
curl http://localhost:3003/api/v1/health
```

Expected response:
```json
{ "status": "ok" }
```

If you get "Connection refused", the backend is not running.

### Start backend with debugging
```bash
npm run dev --prefix backend
```

Watch for these messages:
```
✅ Server running on http://localhost:3003
🔐 Auth Configuration Loaded:
   ADMIN_EMAIL: admin@example.com
   ADMIN_PASSWORD: ✅ SET
   JWT_SECRET: ✅ SET
   JWT_EXPIRES_IN: 7d
```

---

## 🔍 Step 2: Verify Environment Variables

### Check backend/.env file
```bash
cat backend/.env | grep -E "ADMIN_|JWT_"
```

Expected output:
```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$2a$10$E0IhqlBU6K1o2zxe2bp0vO2vpHsGatVVV7iBKGtHlN9zGagScGaiS
JWT_SECRET=dev-secret-key-change-in-production-12345
JWT_EXPIRES_IN=7d
```

### If variables are missing:
1. Create/update `backend/.env` file
2. Add the correct values
3. Restart backend

---

## 🔍 Step 3: Test API Directly

### Test login endpoint with cURL
```bash
curl -X POST http://localhost:3003/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Expected response (success):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "department": "Administration",
    "created_at": "2025-02-05T00:00:00.000Z",
    "last_login": "2025-02-05T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### Expected response (failure):
```json
{
  "error": "Invalid email or password"
}
```

---

## 🔍 Step 4: Check Backend Logs

### Look for these debug messages in backend console:

**Success case:**
```
🔐 Login attempt: { email: 'admin@example.com', adminEmail: 'admin@example.com' }
✅ Email matches admin email
🔑 Comparing password with hash...
🔐 Password valid: true
✅ Login successful, token generated
```

**Failure case:**
```
🔐 Login attempt: { email: 'admin@example.com', adminEmail: 'admin@example.com' }
✅ Email matches admin email
🔑 Comparing password with hash...
🔐 Password valid: false
❌ Password mismatch
```

**Email mismatch:**
```
🔐 Login attempt: { email: 'wrong@example.com', adminEmail: 'admin@example.com' }
❌ Email does not match admin email
```

---

## 🔐 Step 5: Verify Bcrypt Hash

### Test if bcrypt hash is correct
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.compareSync('admin123', '\$2a\$10\$E0IhqlBU6K1o2zxe2bp0vO2vpHsGatVVV7iBKGtHlN9zGagScGaiS'));"
```

Expected output:
```
true
```

If output is `false`, the hash is incorrect.

### Generate correct hash
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

Copy the output and update `ADMIN_PASSWORD` in `backend/.env`

---

## 🔍 Step 6: Check Frontend Configuration

### Verify frontend API URL
```bash
cat frontend/.env.local | grep VITE_API_URL
```

Expected output:
```
VITE_API_URL=http://localhost:3003/api/v1
```

### If incorrect:
1. Update `frontend/.env.local`
2. Restart frontend: `npm run dev --prefix frontend`

---

## 🔍 Step 7: Check Browser Console

### Open browser developer tools (F12)

1. Go to **Console** tab
2. Look for error messages
3. Check **Network** tab for API response

### Common errors:

**CORS Error:**
```
Access to XMLHttpRequest at 'http://localhost:3003/api/v1/auth/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```
Solution: Check CORS configuration in backend

**Network Error:**
```
Failed to fetch
```
Solution: Backend not running or wrong API URL

**401 Unauthorized:**
```
{"error": "Invalid email or password"}
```
Solution: Wrong credentials or bcrypt hash mismatch

---

## 🔧 Common Issues & Solutions

### Issue 1: "Invalid email or password" but credentials are correct

**Cause:** Bcrypt hash doesn't match password

**Solution:**
1. Generate new hash:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
   ```
2. Update `ADMIN_PASSWORD` in `backend/.env`
3. Restart backend

### Issue 2: Backend won't start

**Cause:** Missing environment variables

**Solution:**
1. Check `backend/.env` exists
2. Verify all required variables are set
3. Check for syntax errors in `.env`
4. Restart backend

### Issue 3: "Unable to connect to server"

**Cause:** Backend not running or wrong API URL

**Solution:**
1. Start backend: `npm run dev --prefix backend`
2. Verify port 3003 is available
3. Check `VITE_API_URL` in frontend `.env.local`
4. Restart frontend

### Issue 4: CORS error

**Cause:** Frontend origin not allowed

**Solution:**
1. Check `CORS_ORIGINS` in `backend/.env`
2. Should include `http://localhost:5173`
3. Restart backend

### Issue 5: Login works in cURL but not in browser

**Cause:** Token not being stored or sent

**Solution:**
1. Check browser console for errors
2. Check localStorage for token
3. Check Network tab for API response
4. Verify frontend code is correct

---

## 🧪 Full Debug Checklist

- [ ] Backend is running on port 3003
- [ ] Frontend is running on port 5173
- [ ] `backend/.env` file exists
- [ ] `ADMIN_EMAIL` is set correctly
- [ ] `ADMIN_PASSWORD` is bcrypt hash
- [ ] `JWT_SECRET` is set
- [ ] `VITE_API_URL` is correct in frontend
- [ ] Bcrypt hash matches password
- [ ] Backend logs show correct debug messages
- [ ] API test with cURL works
- [ ] Browser console has no errors
- [ ] Network tab shows 200 response

---

## 📝 Debug Commands

### Restart everything
```bash
# Kill all node processes
pkill -f node

# Start backend
npm run dev --prefix backend

# In new terminal, start frontend
npm run dev --prefix frontend
```

### Test API
```bash
curl -X POST http://localhost:3003/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Check environment
```bash
cat backend/.env | grep -E "ADMIN_|JWT_|PORT"
```

### Generate hash
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

### Test hash
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.compareSync('admin123', '\$2a\$10\$E0IhqlBU6K1o2zxe2bp0vO2vpHsGatVVV7iBKGtHlN9zGagScGaiS'));"
```

---

## 📞 Still Having Issues?

1. Check backend console for debug messages
2. Check browser console (F12) for errors
3. Check Network tab for API response
4. Verify all environment variables
5. Verify bcrypt hash is correct
6. Restart both backend and frontend
7. Clear browser cache

---

## ✅ Verification

Once login works, you should see:

**Backend console:**
```
✅ Login successful, token generated
```

**Browser:**
- Redirected to dashboard
- No console errors
- Token in localStorage

**Network tab:**
- POST /api/v1/auth/login → 200 OK
- Response contains user object and token

---

**Status: Debugging enabled with detailed logging**

