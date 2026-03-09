# 🚀 COMPLETE SUPABASE + VERCEL DEPLOYMENT GUIDE

## Overview

This guide will help you deploy the Marketing Control Center to Vercel with PostgreSQL/Supabase as the database.

---

## PHASE 1: SUPABASE SETUP (Database)

### Step 1.1: You Already Have Supabase Project ✅

- Project URL: `https://dsglniwrrkylniphwygc.supabase.co`
- Project Reference: `dsglniwrrkylniphwygc`

### Step 1.2: Get Your Supabase Credentials

**Navigate to:** https://app.supabase.com → Select your project

#### a) Database Connection String

1. Go to **Settings** → **Database**
2. Under "Connection String", select **PostgreSQL** tab
3. Copy the full connection string (starts with `postgresql://`)
4. **Save this** - you'll need it for Step 2.4

**Format:** `postgresql://postgres:PASSWORD@dsglniwrrkylniphwygc.supabase.co:5432/postgres`

#### b) API Keys

1. Go to **Settings** → **API**
2. Copy these 2 keys:
   - **Anon key** (you have this): `sb_publishable_G5k3L_T1hrX1ZEvH3Dh5VA_QYvjcUkr`
   - **Service Role Key** (look here): `sb_service_role_...` (copy this ~100 char key starting with sb_service_role)

**Save all 3 credentials:**

```
DATABASE_URL = postgresql://postgres:PASSWORD@dsglniwrrkylniphwygc.supabase.co:5432/postgres
ANON_KEY = sb_publishable_G5k3L_T1hrX1ZEvH3Dh5VA_QYvjcUkr
SERVICE_ROLE_KEY = sb_service_role_...
```

### Step 1.3: Run Database Migrations (SQL)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the migration file: `backend/migrations/postgres-complete-schema.sql`
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run**
7. Wait for completion ✅

This creates all required tables:

- ✅ users
- ✅ campaigns
- ✅ projects
- ✅ assets
- ✅ asset_category_master
- ✅ keywords
- ✅ services
- ✅ and 10+ more tables

### Step 1.4: Verify Database Setup

In Supabase SQL Editor, run:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
```

You should see 20+ tables listed. ✅

---

## PHASE 2: GITHUB SETUP (Code Repository)

### Step 2.1: Prepare Repository

```bash
# From project root directory
git add .
git commit -m "Production deployment - Supabase + Vercel"
git push origin main
```

### Step 2.2: Verify Pushed Files

Your GitHub repository should have:

- ✅ `backend/.env.production` (with placeholder values)
- ✅ `backend/migrations/postgres-complete-schema.sql`
- ✅ `frontend/` folder with latest code
- ✅ `vercel.json` configuration

---

## PHASE 3: VERCEL DEPLOYMENT

### Step 3.1: Create Vercel Project

1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. **Import** your GitHub repository:
   - Search for: `guires-marketing-control-center`
   - Select the correct repository
4. Click **Import**

### Step 3.2: Configure Build Settings

Vercel should auto-detect these settings:

- **Framework**: (auto-detected) - leave as is
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`

**Click** "Edit" if anything is wrong.

### Step 3.3: Set Environment Variables in Vercel

This is CRITICAL! Go to **Settings** → **Environment Variables**

Add these variables:

| Key              | Value                                                                           | Notes                                            |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| `NODE_ENV`       | `production`                                                                    | Mark as Production                               |
| `USE_PG`         | `true`                                                                          | Mark as Production                               |
| `DB_CLIENT`      | `pg`                                                                            | Mark as Production                               |
| `DATABASE_URL`   | `postgresql://postgres:PASSWORD@dsglniwrrkylniphwygc.supabase.co:5432/postgres` | **Replace PASSWORD with your Supabase password** |
| `DB_HOST`        | `dsglniwrrkylniphwygc.supabase.co`                                              | Mark as Production                               |
| `DB_PORT`        | `5432`                                                                          | Mark as Production                               |
| `DB_USER`        | `postgres`                                                                      | Mark as Production                               |
| `DB_PASSWORD`    | `YOUR_SUPABASE_PASSWORD`                                                        | **Replace with your password**                   |
| `DB_NAME`        | `postgres`                                                                      | Mark as Production                               |
| `JWT_SECRET`     | `generate_random_32_char_string`                                                | **See Step 3.4**                                 |
| `JWT_EXPIRES_IN` | `7d`                                                                            | Mark as Production                               |
| `FRONTEND_URL`   | `https://your-deployment-name.vercel.app`                                       | **Update after getting Vercel URL**              |
| `CORS_ORIGIN`    | `https://your-deployment-name.vercel.app`                                       | **Update after getting Vercel URL**              |
| `CORS_ORIGINS`   | `https://your-deployment-name.vercel.app`                                       | **Update after getting Vercel URL**              |
| `VITE_API_URL`   | `/api/v1`                                                                       | Mark as Production                               |

### Step 3.4: Generate JWT Secret

Run this in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (32 character hex string) and paste as `JWT_SECRET`

### Step 3.5: Deploy

1. Click **Deploy** button in Vercel
2. Wait for build to complete (usually 2-3 minutes)
3. **Your deployment URL will be shown** (example: `https://guries-mcc.vercel.app`)

### Step 3.6: Update URLs in Environment Variables

Once you have your Vercel URL:

1. Go back to **Settings** → **Environment Variables**
2. Update these 3 variables with your actual Vercel URL:
   - `FRONTEND_URL` = `https://your-actual-url.vercel.app`
   - `CORS_ORIGIN` = `https://your-actual-url.vercel.app`
   - `CORS_ORIGINS` = `https://your-actual-url.vercel.app`

3. Click **Save** and trigger a **Redeploy** from Deployments tab

---

## PHASE 4: VERIFICATION

### Step 4.1: Test Health Endpoint

```bash
curl https://your-deployment-name.vercel.app/api/v1/health
```

Expected Response:

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-03-09T..."
}
```

### Step 4.2: Test Login Endpoint

```bash
curl -X POST https://your-deployment-name.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Expected Response:

```json
{
  "token": "eyJ...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Step 4.3: Test Assets Endpoint

```bash
# First, get token from login endpoint
TOKEN="your-token-from-login"

curl https://your-deployment-name.vercel.app/api/v1/assets \
  -H "Authorization: Bearer $TOKEN"
```

Expected Response: Array of assets from your database

### Step 4.4: Visit Your Application

Open in browser: `https://your-deployment-name.vercel.app`

Login with:

- **Email:** `admin@example.com`
- **Password:** `admin123`

---

## PHASE 5: POST-DEPLOYMENT TASKS

### Step 5.1: Change Admin Password ⚠️

CRITICAL: Change the default admin password immediately!

1. Log in to application
2. Go to **Settings** → **User Profile**
3. Change password from `admin123` to something secure

### Step 5.2: Enable HTTPS/SSL ✅

Vercel automatically provides:

- ✅ SSL Certificate (free)
- ✅ HTTPS redirect
- ✅ Security headers

### Step 5.3: Set Up Monitoring

In Vercel Dashboard:

1. Go to **Analytics**
2. Monitor:
   - Request latency
   - Error rates
   - Database connection health

### Step 5.4: Configure Vercel Logs

```bash
# View live logs
vercel logs your-deployment-name.vercel.app

# View specific function logs
vercel logs your-deployment-name.vercel.app --function api/v1/[...].ts
```

---

## TROUBLESHOOTING

### Issue: "Database Connection Failed"

**Solution:**

1. Verify `DATABASE_URL` is correct in Vercel env vars
2. Check Supabase project is active
3. Verify password is correct (no special char escaping issues)
4. Test connection manually:

```bash
psql postgresql://postgres:password@dsglniwrrkylniphwygc.supabase.co:5432/postgres
```

### Issue: "CORS Error - Request blocked"

**Solution:**

1. Ensure `CORS_ORIGIN` and `CORS_ORIGINS` are set to your Vercel URL
2. Check no typos in URL
3. Redeploy after changing env vars

### Issue: "404 on API routes"

**Solution:**

1. Verify `vercel.json` has correct routes
2. Check `/api` folder structure
3. Ensure build succeeded (check Vercel build logs)

### Issue: "Assets table is empty"

**Solution:**

1. Verify migration ran successfully in Supabase
2. Check `asset_category_master` has default categories
3. Create test asset through API:

```bash
POST /api/v1/assets
{
  "asset_name": "Test Asset",
  "asset_type": "Image",
  "asset_category": 1
}
```

---

## MONITORING & MAINTENANCE

### Regular Checks

- [ ] Check error logs weekly: `vercel logs`
- [ ] Monitor database performance in Supabase
- [ ] Update dependencies monthly
- [ ] Backup database (Supabase Dashboard → Backups)

### Performance Optimization

- Enable caching for static assets
- Use CDN (Vercel provides automatically)
- Monitor database query performance
- Scale database if needed

### Security

- Rotate JWT secret periodically
- Keep dependencies updated
- Review user access logs
- Enable audit logging in Supabase

---

## DEPLOYMENT CHECKLIST

- [ ] Supabase project created
- [ ] Database credentials obtained
- [ ] SQL migrations run successfully
- [ ] GitHub repository updated
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] JWT secret generated and added
- [ ] Deployment successful
- [ ] Health endpoint responding
- [ ] Login endpoint working
- [ ] Assets loading from database
- [ ] CORS errors resolved
- [ ] Admin password changed
- [ ] Monitoring enabled
- [ ] Backups configured

---

## SUPPORT & RESOURCES

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Actions:** https://github.com/features/actions
- **Database Issues:** Check Supabase dashboard → Logs

---

**Deployment Date:** March 9, 2026
**Version:** 2.5.0
**Status:** Ready for Production ✅
