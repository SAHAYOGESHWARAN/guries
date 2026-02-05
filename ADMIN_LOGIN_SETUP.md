# Admin Login Setup Guide

## Quick Start

### Admin Credentials
- **Email:** `admin@example.com`
- **Password:** `admin123`

## Setup Instructions

### Step 1: Run Setup Script

```bash
node setup-admin-account.js
```

This script will:
- Generate bcrypt hash for the password
- Create `.env` file with admin credentials
- Generate JWT secret
- Display all credentials

### Step 2: Verify Environment Variables

Check `backend/.env` file contains:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$2a$10$... (bcrypt hash)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Step 3: Start Backend

```bash
npm install --prefix backend
npm run dev --prefix backend
```

Backend should start on `http://localhost:3003`

### Step 4: Start Frontend

```bash
npm install --prefix frontend
npm run dev --prefix frontend
```

Frontend should start on `http://localhost:5173`

### Step 5: Login

1. Open `http://localhost:5173` in browser
2. You'll see the login page with demo credentials displayed
3. Enter:
   - Email: `admin@example.com`
   - Password: `admin123`
4. Click "Sign In"
5. You'll be redirected to the dashboard with full admin access

## What You Get with Admin Account

### Dashboard Access
- ✅ Full admin console
- ✅ User management
- ✅ Audit logs
- ✅ System configuration

### QC Review Module
- ✅ View all pending QC assets
- ✅ Approve/Reject/Request rework
- ✅ QC statistics and metrics
- ✅ Audit trail for all QC decisions

### Asset Management
- ✅ View all assets
- ✅ Edit/Delete any asset
- ✅ Asset linking and categorization
- ✅ Asset usage tracking

### Master Data Management
- ✅ Industry/Sector Master
- ✅ Asset Types & Categories
- ✅ Platforms & Countries
- ✅ Content Types
- ✅ Workflow Stages

### User Management
- ✅ Create/Edit/Delete users
- ✅ Assign roles and permissions
- ✅ View user activity
- ✅ Manage user status

## Login Page Features

### Demo Credentials Display
The login page shows demo credentials in a blue info box:
- Email: admin@example.com
- Password: admin123

### Authentication Methods
1. **Email & Password** (Primary)
   - Standard login with email and password
   - Credentials verified against backend

2. **Phone OTP** (Optional)
   - Requires Twilio setup
   - 6-digit OTP sent via SMS
   - 30-second resend timer

3. **Google Workspace** (Optional)
   - Requires Google OAuth setup
   - SSO integration
   - Pre-registration required

### Error Handling
- Invalid credentials: "Invalid email or password"
- Server connection error: "Unable to connect to server"
- Account inactive: "Your account has been deactivated"
- Account pending: "Your account is pending approval"

## Environment Variables

### Required
```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<bcrypt-hash>
JWT_SECRET=<your-secret-key>
```

### Optional
```bash
# Twilio for OTP
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# API Configuration
API_PORT=3003
API_HOST=localhost
VITE_API_URL=http://localhost:3003/api/v1
```

## Testing Login

### Using cURL
```bash
curl -X POST http://localhost:3003/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Expected Response
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

## Troubleshooting

### Login Fails with "Invalid email or password"
**Cause:** Wrong credentials or environment variables not set
**Solution:**
1. Verify email is exactly: `admin@example.com`
2. Verify password is exactly: `admin123`
3. Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`
4. Restart backend server

### "Unable to connect to server"
**Cause:** Backend not running or wrong API URL
**Solution:**
1. Verify backend is running: `npm run dev --prefix backend`
2. Check backend is on port 3003
3. Verify `VITE_API_URL` in frontend `.env.local`
4. Check browser console for CORS errors

### Login page shows blank
**Cause:** Frontend build issue
**Solution:**
1. Clear browser cache
2. Restart frontend: `npm run dev --prefix frontend`
3. Check browser console for errors

### "Your account has been deactivated"
**Cause:** User status is 'inactive'
**Solution:**
1. Check database user status
2. Update status to 'active' if needed

## Security Considerations

### Development
- Demo credentials are fine for development
- Use `.env` file (not committed to git)
- Change JWT_SECRET from default

### Production
- **Never use demo credentials**
- Generate strong passwords (minimum 12 characters)
- Use bcrypt hashing (minimum 10 rounds)
- Use strong JWT secret (minimum 32 characters)
- Enable HTTPS only
- Implement rate limiting on login endpoint
- Monitor failed login attempts
- Rotate credentials regularly
- Use environment variables for all secrets
- Never commit `.env` to version control

## Password Management

### Change Admin Password
1. Generate new bcrypt hash:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('newpassword', 10));"
   ```

2. Update `ADMIN_PASSWORD` in `.env`

3. Restart backend server

### Reset Forgotten Password
1. Generate new bcrypt hash
2. Update `.env` file
3. Restart backend
4. Login with new password

## Multi-User Setup

### Add Additional Users
1. Go to Admin Console → User Management
2. Click "Add User"
3. Fill in user details
4. Set role and status
5. User can login with their credentials

### User Roles
- **Admin:** Full system access
- **QC:** QC review and asset management
- **Manager:** View QC panel, manage own assets
- **User:** Submit assets, manage own assets
- **Guest:** Read-only access

## Session Management

### Token Details
- **Expiration:** 7 days (configurable)
- **Algorithm:** HS256
- **Storage:** localStorage (frontend)

### Auto-Logout
- Automatic logout on token expiration
- Manual logout available in user menu
- Session persists across page refreshes

## Support & Documentation

### Files
- `LOGIN_CREDENTIALS.md` - Detailed credentials guide
- `setup-admin-account.js` - Setup script
- `backend/.env.example` - Environment template
- `frontend/.env.local` - Frontend configuration

### Logs
- Backend logs: Check console output
- Frontend logs: Check browser console (F12)
- Database logs: Check SQLite database

### Common Issues
See LOGIN_CREDENTIALS.md for troubleshooting guide

## Next Steps

1. ✅ Run setup script
2. ✅ Start backend and frontend
3. ✅ Login with admin credentials
4. ✅ Explore admin console
5. ✅ Create additional users
6. ✅ Configure master data
7. ✅ Test QC review workflow
8. ✅ Set up additional authentication methods (optional)
