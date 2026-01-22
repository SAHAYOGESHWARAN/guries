# Deployment Fixes & Admin Setup Guide

## Issues Fixed

### 1. ✅ Build Warning: Duplicate `linked_campaign_ids` Key
**Status**: FIXED
- Removed duplicate key declaration in `SubServiceMasterView.tsx` handleAdd function
- Build now completes without warnings

### 2. ✅ Sub-Service Page Blank Issue
**Status**: FIXED
- Added missing state variables (isRefreshing, formData, ogImageFile, etc.)
- Added computed values (filteredData, linkedLibraryAssets, availableLibraryAssets)
- Added missing handler functions (handleCreateClick)
- Component now properly loads and displays sub-services list

### 3. ⚠️ Admin Email/Password Not Working
**Status**: REQUIRES SETUP

## Admin User Setup Instructions

### Step 1: Create Admin User in Database

Run this command in your backend directory:

```bash
node create-admin-user.js
```

This will:
- Create or update admin user with email: `admin@example.com`
- Set password: `admin123`
- Hash password using SHA256
- Set role to 'admin' and status to 'active'

### Step 2: Verify Admin User Created

Check the output should show:
```
✅ Admin user created successfully!

📋 Admin User Details:
   ID: 1
   Name: Admin User
   Email: admin@example.com
   Role: admin
   Status: active
   Department: Administration

🔐 Login Credentials:
   Email: admin@example.com
   Password: admin123
```

### Step 3: Login with Admin Credentials

1. Go to login page
2. Enter email: `admin@example.com`
3. Enter password: `admin123`
4. Click Login

### Step 4: Change Admin Password (Recommended)

After first login:
1. Go to Settings/Profile
2. Change password to something secure
3. Save changes

## How Admin Authentication Works

### Login Flow
1. User submits email and password
2. Backend calls `POST /api/v1/admin/auth/login`
3. Controller validates:
   - User exists with that email
   - User status is 'active' (not 'inactive' or 'pending')
   - Password hash matches stored hash
4. Returns user info with success message
5. Frontend stores user session

### Password Hashing
- Algorithm: SHA256
- Format: `crypto.createHash('sha256').update(password).digest('hex')`
- Example: `admin123` → `240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9`

## Troubleshooting Admin Login

### Issue: "Invalid credentials"
**Causes:**
- Email doesn't exist in database
- Password is incorrect
- User was never created

**Solution:**
1. Run `node create-admin-user.js` again
2. Verify email is exactly: `admin@example.com`
3. Verify password is exactly: `admin123`

### Issue: "User deactivated"
**Cause:** Admin user status is 'inactive'

**Solution:**
1. Run `node create-admin-user.js` to reactivate
2. Or manually update in database:
   ```sql
   UPDATE users SET status = 'active' WHERE email = 'admin@example.com';
   ```

### Issue: "Account pending approval"
**Cause:** Admin user status is 'pending'

**Solution:**
1. Run `node create-admin-user.js` to set to 'active'
2. Or manually update in database:
   ```sql
   UPDATE users SET status = 'active' WHERE email = 'admin@example.com';
   ```

## Database Schema for Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'pending',
  department VARCHAR(255),
  country VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);
```

## Deployment Checklist

- [ ] Fixed build warning (duplicate key removed)
- [ ] Sub-service page loads correctly
- [ ] Run `node create-admin-user.js` to create admin user
- [ ] Test admin login with `admin@example.com` / `admin123`
- [ ] Change admin password to secure value
- [ ] Deploy to production
- [ ] Verify all pages load without errors
- [ ] Test sub-service CRUD operations

## Environment Variables Required

Make sure these are set in your `.env` files:

```env
# Backend
NODE_ENV=production
DATABASE_URL=./mcc_db.sqlite
PORT=5000

# Frontend
VITE_API_URL=/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

## Post-Deployment Verification

1. **Check Sub-Service Page**
   - Navigate to Sub-Service Master
   - Should display list of sub-services
   - Should be able to add/edit/delete

2. **Check Admin Login**
   - Login with admin credentials
   - Should access admin console
   - Should see employee management

3. **Check API Health**
   - Visit `/api/v1/health` endpoint
   - Should return 200 OK

## Additional Notes

- All passwords are hashed with SHA256
- Admin user is created with 'admin' role
- User status must be 'active' to login
- Password reset available in admin console
- Audit logging tracks all admin actions

## Support

If issues persist:
1. Check backend logs for error messages
2. Verify database connection
3. Ensure all migrations have run
4. Check browser console for frontend errors
5. Verify API endpoints are responding
