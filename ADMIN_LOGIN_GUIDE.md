# Admin Login Guide

## ✅ Admin Account Created

**Email:** admin@example.com  
**Password:** admin123  
**Role:** Admin  
**Status:** Active

---

## How to Login

### Option 1: Web Interface
1. Go to https://guries.vercel.app
2. Enter email: `admin@example.com`
3. Enter password: `admin123`
4. Click "Sign In"

### Option 2: API Login
```bash
curl -X POST https://guries.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "token_1_1234567890",
    "message": "Login successful"
  }
}
```

---

## Admin Features

### Access Level
- ✅ Full system access
- ✅ User management
- ✅ Asset management
- ✅ QC workflow control
- ✅ Campaign management
- ✅ Dashboard access
- ✅ Reporting

### Available Endpoints
- All authentication endpoints
- All service endpoints
- All asset endpoints
- All QC review endpoints
- All campaign endpoints
- All dashboard endpoints
- All reward/penalty endpoints

---

## Demo Users

| Email | Password | Role | Auto-Created |
|-------|----------|------|--------------|
| admin@example.com | admin123 | admin | ✅ Pre-configured |
| test@example.com | any | user | ✅ Pre-configured |
| any@email.com | any | user | ✅ On first login |

---

## Password Security

### Admin Account
- Password: `admin123` (stored in mock database)
- For production: Use PostgreSQL with hashed passwords
- Change password after first login (recommended)

### Other Users
- Auto-created on first login
- Any password accepted (for testing)
- For production: Implement proper password hashing

---

## Testing Admin Features

### 1. Get Current User
```bash
curl -X GET https://guries.vercel.app/api/v1/auth/me \
  -H "Authorization: token_1_1234567890"
```

### 2. Create Service (Admin Only)
```bash
curl -X POST https://guries.vercel.app/api/v1/services \
  -H "Content-Type: application/json" \
  -H "Authorization: token_1_1234567890" \
  -d '{
    "service_name": "SEO Services",
    "service_code": "SEO001",
    "slug": "seo-services",
    "status": "active"
  }'
```

### 3. Get QC Statistics
```bash
curl -X GET https://guries.vercel.app/api/v1/qc-review/statistics \
  -H "Authorization: token_1_1234567890"
```

### 4. Approve QC Item
```bash
curl -X POST https://guries.vercel.app/api/v1/qc-review/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: token_1_1234567890" \
  -d '{
    "asset_id": 1,
    "qc_score": 95,
    "qc_remarks": "Approved - Excellent quality"
  }'
```

---

## Database Configuration

### Mock Database (Current)
- Admin user pre-configured
- Password stored in plain text (for testing only)
- Data persists during function execution
- Resets between deployments

### PostgreSQL (Production)
1. Set `DATABASE_URL` in Vercel environment variables
2. Redeploy
3. Admin user will be created automatically
4. Implement password hashing for security

---

## Security Notes

### For Testing
- ✅ Admin credentials provided for testing
- ✅ Mock database for development
- ✅ No password hashing (testing only)

### For Production
- ⚠️ Change admin password immediately
- ⚠️ Use PostgreSQL with hashed passwords
- ⚠️ Implement proper authentication
- ⚠️ Use HTTPS only
- ⚠️ Implement rate limiting
- ⚠️ Add 2FA for admin accounts

---

## Troubleshooting

### Login Failed
**Error:** "Invalid email or password"  
**Solution:** 
- Check email is exactly: `admin@example.com`
- Check password is exactly: `admin123`
- Verify system is using mock database (no DATABASE_URL set)

### Token Invalid
**Error:** "Invalid token"  
**Solution:**
- Use token from login response
- Token format: `token_1_1234567890`
- Token expires after function execution

### Access Denied
**Error:** "User account is not active"  
**Solution:**
- Admin account status is "active"
- Check database for user status
- Verify user exists in database

---

## Next Steps

1. **Login to Admin Account**
   - Go to https://guries.vercel.app
   - Use admin@example.com / admin123

2. **Test Admin Features**
   - Create services
   - Upload assets
   - Manage QC workflow
   - View dashboards

3. **Configure Production**
   - Set DATABASE_URL in Vercel
   - Implement password hashing
   - Change admin password
   - Enable 2FA

4. **Create Additional Users**
   - Use admin account to manage users
   - Set proper roles and permissions
   - Configure access levels

---

## API Token Usage

### Get Token
```bash
curl -X POST https://guries.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Use Token in Requests
```bash
curl -X GET https://guries.vercel.app/api/v1/auth/me \
  -H "Authorization: token_1_1234567890"
```

### Token Format
- Prefix: `token_`
- User ID: `1` (for admin)
- Timestamp: `1234567890`
- Full: `token_1_1234567890`

---

## Admin Dashboard Access

### Available Dashboards
1. **Employee Dashboard** - View employee metrics
2. **Employee Comparison** - Compare employee performance
3. **Task Assignment** - Assign tasks to employees
4. **Performance Export** - Export performance data
5. **Suggestion Implementation** - Implement suggestions

### Access Endpoints
```bash
# Employee Dashboard
curl -X GET https://guries.vercel.app/api/v1/dashboards/employees \
  -H "Authorization: token_1_1234567890"

# Employee Comparison
curl -X GET https://guries.vercel.app/api/v1/dashboards/employee-comparison \
  -H "Authorization: token_1_1234567890"

# Task Assignment
curl -X POST https://guries.vercel.app/api/v1/dashboards/task-assignment \
  -H "Content-Type: application/json" \
  -H "Authorization: token_1_1234567890" \
  -d '{"employee_id":2,"task_id":1}'
```

---

## Support

**Production URL:** https://guries.vercel.app  
**Admin Email:** admin@example.com  
**Admin Password:** admin123  
**API Base:** https://guries.vercel.app/api/v1

---

**Status:** ✅ Admin account ready for use  
**Deployment:** ✅ Latest version deployed  
**Last Updated:** February 16, 2026
