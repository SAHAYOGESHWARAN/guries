# Vercel Deployment Guide

## Quick Deploy

### Step 1: Set Environment Variables on Vercel

Go to Vercel Dashboard → Project Settings → Environment Variables

Add these:
```
ADMIN_EMAIL = admin@example.com
ADMIN_PASSWORD = $2a$10$E0IhqlBU6K1o2zxe2bp0vO2vpHsGatVVV7iBKGtHlN9zGagScGaiS
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN = 7d
NODE_ENV = production
```

### Step 2: Update vercel.json

Copy `vercel-deploy.json` to `vercel.json`:
```bash
cp vercel-deploy.json vercel.json
```

### Step 3: Deploy

```bash
vercel deploy --prod
```

Or push to GitHub and Vercel will auto-deploy.

---

## Deployment Checklist

- [ ] Environment variables set on Vercel
- [ ] `vercel.json` configured correctly
- [ ] Frontend builds successfully
- [ ] API endpoints working
- [ ] Login endpoint working
- [ ] CORS configured
- [ ] Database connection (if using)

---

## Test After Deployment

### Test Health Endpoint
```bash
curl https://your-domain.vercel.app/api/v1/health
```

### Test Login
```bash
curl -X POST https://your-domain.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Test Frontend
```
https://your-domain.vercel.app
```

---

## Troubleshooting

### Login returns 404
- Check `vercel.json` routes
- Verify API endpoint path

### Login returns 401
- Check environment variables
- Verify bcrypt hash

### Frontend not loading
- Check build output
- Verify `frontend/dist` exists

### CORS errors
- Check CORS headers in API
- Verify allowed origins

---

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| ADMIN_EMAIL | admin@example.com | Yes |
| ADMIN_PASSWORD | bcrypt hash | Yes |
| JWT_SECRET | random string | Yes |
| JWT_EXPIRES_IN | 7d | No |
| NODE_ENV | production | No |

---

## Credentials for Deployment

```
Email:    admin@example.com
Password: admin123
```

---

**Status: Ready for Vercel deployment**

