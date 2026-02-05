# Deploy Now - Quick Guide

## 3 Simple Steps

### Step 1: Add Environment Variables to Vercel

Go to: **Vercel Dashboard → Settings → Environment Variables**

Add these 3:
```
ADMIN_EMAIL = admin@example.com
ADMIN_PASSWORD = admin123
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
```

### Step 2: Deploy

```bash
vercel deploy --prod
```

### Step 3: Test

Open: `https://your-domain.vercel.app`

Login:
- Email: `admin@example.com`
- Password: `admin123`

---

## ✅ Everything is Ready

- ✅ Frontend configured
- ✅ API configured
- ✅ Login endpoint working
- ✅ Routes mapped
- ✅ CORS enabled
- ✅ Mock data ready

---

**Deploy now!** 🚀

