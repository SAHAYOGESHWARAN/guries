# Deployment Credentials - Updated

## Environment Variables for Vercel

Set these 3 variables on Vercel Dashboard → Project Settings → Environment Variables:

```
ADMIN_EMAIL = admin@example.com
ADMIN_PASSWORD = admin123
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
```

## Login Credentials

```
Email:    admin@example.com
Password: admin123
```

## How to Set on Vercel

1. Go to: **Vercel Dashboard**
2. Select your project
3. Go to: **Settings → Environment Variables**
4. Add these 3 variables:
   - Name: `ADMIN_EMAIL` → Value: `admin@example.com`
   - Name: `ADMIN_PASSWORD` → Value: `admin123`
   - Name: `JWT_SECRET` → Value: `your-super-secret-jwt-key-change-this-in-production`
5. Click "Save"
6. Redeploy: `vercel deploy --prod`

## Test Login

After deployment:

1. Open: `https://your-domain.vercel.app`
2. Enter:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click "Sign In"
4. Should redirect to dashboard

## API Test

```bash
curl -X POST https://your-domain.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Expected response:
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
  "token": "mock-jwt-token-...",
  "message": "Login successful"
}
```

---

**Status: ✅ Ready to deploy with new credentials**

