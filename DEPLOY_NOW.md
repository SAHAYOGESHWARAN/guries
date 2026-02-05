# Deploy to Vercel - Quick Steps

## 1️⃣ Set Environment Variables

Go to: **Vercel Dashboard → Project Settings → Environment Variables**

Add these 4 variables:

```
ADMIN_EMAIL = admin@example.com
ADMIN_PASSWORD = $2a$10$E0IhqlBU6K1o2zxe2bp0vO2vpHsGatVVV7iBKGtHlN9zGagScGaiS
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN = 7d
```

## 2️⃣ Deploy

```bash
vercel deploy --prod
```

Or push to GitHub and Vercel auto-deploys.

## 3️⃣ Test

### Health Check
```bash
curl https://your-domain.vercel.app/api/v1/health
```

### Login Test
```bash
curl -X POST https://your-domain.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Open App
```
https://your-domain.vercel.app
```

Login with:
- Email: `admin@example.com`
- Password: `admin123`

---

## What's Fixed

✅ Auth endpoint working
✅ Login credentials configured
✅ API routes fixed
✅ Frontend build configured
✅ Environment variables ready

---

**Ready to deploy!** 🚀

