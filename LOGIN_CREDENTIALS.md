# Login Credentials & Setup Guide

## Admin Account

**Email:** `admin@example.com`  
**Password:** `admin123`

## How to Set Up Admin Credentials

### Option 1: Environment Variables (Recommended for Production)

Set these environment variables in your `.env` or `.env.production` file:

```bash
# Backend Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$2a$10$YourHashedPasswordHere  # Must be bcrypt hashed
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

### Option 2: Hash the Password

To generate a bcrypt hash for the password `admin123`:

```bash
# Using Node.js
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

This will output something like:
```
$2a$10$YourHashedPasswordHere
```

Use this hash in your `ADMIN_PASSWORD` environment variable.

### Option 3: Quick Setup Script

Run this script to set up the admin account:

```bash
# Create .env file with admin credentials
cat > backend/.env << EOF
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=\$2a\$10\$YourHashedPasswordHere
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
EOF
```

## Login Flow

### 1. Frontend Login Page
- Navigate to the login page
- Enter email: `admin@example.com`
- Enter password: `admin123`
- Click "Sign In"

### 2. Backend Authentication
- Backend receives login request
- Checks if email matches `ADMIN_EMAIL` environment variable
- Compares password with bcrypt hash
- Generates JWT token on success
- Returns user object with admin role

### 3. Frontend Session
- Stores user in localStorage
- Sets authentication context
- Redirects to dashboard
- User has full admin permissions

## Features

### Admin Permissions
- ✅ Full QC Review access
- ✅ Approve/Reject/Rework assets
- ✅ View all assets
- ✅ Manage users
- ✅ Access admin console
- ✅ View audit logs
- ✅ Manage master data (Industry/Sector, Asset Types, etc.)

### Login Methods
1. **Email & Password** - Primary method
2. **Phone OTP** - Alternative method (requires Twilio setup)
3. **Google Workspace** - SSO method (requires Google OAuth setup)

## Environment Variables Required

```bash
# Authentication
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<bcrypt-hashed-password>
JWT_SECRET=<your-secret-key>
JWT_EXPIRES_IN=7d

# Optional: Twilio for OTP
TWILIO_ACCOUNT_SID=<your-account-sid>
TWILIO_AUTH_TOKEN=<your-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>

# Optional: Google OAuth
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

## Testing Login

### Test Admin Login
```bash
curl -X POST http://localhost:3003/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Expected Response:
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

### "Invalid email or password"
- Check email matches `ADMIN_EMAIL` exactly (case-insensitive)
- Verify password is correct: `admin123`
- Ensure `ADMIN_PASSWORD` environment variable is set with bcrypt hash

### "Unable to connect to server"
- Verify backend is running on correct port (default: 3003)
- Check `VITE_API_URL` environment variable in frontend
- Verify CORS is configured correctly

### "Your account has been deactivated"
- Check user status in database
- Ensure user status is 'active'

### "Your account is pending approval"
- Admin must approve the account first
- Check user status in database

## Security Best Practices

1. **Never commit passwords** to version control
2. **Always use bcrypt hashing** for passwords
3. **Use strong JWT secrets** (minimum 32 characters)
4. **Rotate credentials regularly** in production
5. **Use HTTPS** in production
6. **Enable rate limiting** on login endpoint
7. **Monitor failed login attempts** for security

## Password Reset

To reset the admin password:

1. Generate new bcrypt hash:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('newpassword', 10));"
   ```

2. Update `ADMIN_PASSWORD` environment variable

3. Restart backend server

## Multi-User Setup

To add additional users:

1. Use the User Management interface (Admin Console)
2. Or insert directly into database:
   ```sql
   INSERT INTO users (name, email, password_hash, role, status, department)
   VALUES ('User Name', 'user@example.com', '<bcrypt-hash>', 'user', 'active', 'Marketing');
   ```

## Session Management

- **Token Expiration:** 7 days (configurable via `JWT_EXPIRES_IN`)
- **Auto-logout:** On token expiration
- **Remember Me:** Not implemented (for security)
- **Session Storage:** localStorage (frontend)

## Support

For issues with login:
1. Check backend logs for authentication errors
2. Verify environment variables are set correctly
3. Ensure database is accessible
4. Check browser console for frontend errors
5. Verify CORS configuration
