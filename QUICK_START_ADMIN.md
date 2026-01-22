# Quick Start: Admin Setup & Login

## TL;DR - 3 Steps to Get Admin Working

### Step 1: Create Admin User
```bash
cd backend
node create-admin-user.js
```

### Step 2: Start Backend
```bash
npm start
```

### Step 3: Login
- Email: `admin@example.com`
- Password: `admin123`

---

## What Was Fixed

### Build Issues ✅
- Removed duplicate `linked_campaign_ids` key warning
- Sub-service page now loads correctly
- All state variables properly initialized

### Admin Authentication ✅
- Admin user creation script ready
- Password hashing implemented (SHA256)
- Login validation working

---

## Admin User Details

| Field | Value |
|-------|-------|
| Email | admin@example.com |
| Password | admin123 |
| Role | admin |
| Status | active |
| Department | Administration |

---

## Verify Setup

### Check 1: Admin User Created
```bash
# In backend directory
node -e "const db = require('better-sqlite3')('./mcc_db.sqlite'); const user = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@example.com'); console.log(user);"
```

### Check 2: Login Works
1. Open app in browser
2. Go to login page
3. Enter credentials above
4. Should see dashboard

### Check 3: Sub-Service Page Works
1. After login, navigate to "Sub-Service Master"
2. Should see list (or empty state if no data)
3. Should be able to add new sub-service

---

## Troubleshooting

### "Invalid credentials" error
```bash
# Recreate admin user
node create-admin-user.js
```

### "User deactivated" error
```bash
# Reactivate admin user
node -e "const db = require('better-sqlite3')('./mcc_db.sqlite'); db.prepare('UPDATE users SET status = ? WHERE email = ?').run('active', 'admin@example.com'); console.log('Admin reactivated');"
```

### Sub-service page still blank
1. Check browser console for errors
2. Check backend logs
3. Verify API is running on correct port
4. Clear browser cache and reload

---

## Next Steps

1. ✅ Create admin user (see Step 1 above)
2. ✅ Login with admin credentials
3. ⏭️ Change admin password (Settings → Profile)
4. ⏭️ Create other users as needed
5. ⏭️ Configure system settings

---

## Files Modified

- `frontend/views/SubServiceMasterView.tsx` - Fixed state initialization
- `backend/controllers/adminController.ts` - Admin login validation (no changes needed)
- `backend/create-admin-user.js` - Admin creation script (ready to use)

## New Files Created

- `backend/setup-admin.sh` - Linux/Mac setup script
- `backend/setup-admin.bat` - Windows setup script
- `DEPLOYMENT_FIXES.md` - Detailed deployment guide
- `QUICK_START_ADMIN.md` - This file

---

## Support

For detailed information, see `DEPLOYMENT_FIXES.md`

For code changes, see git diff or check modified files above.
