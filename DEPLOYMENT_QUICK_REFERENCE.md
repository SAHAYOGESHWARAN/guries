# 🚀 DEPLOYMENT QUICK REFERENCE CARD

## Your Supabase Project

```
URL: https://dsglniwrrkylniphwygc.supabase.co
Project Ref: dsglniwrrkylniphwygc
API Key (Anon): sb_publishable_G5k3L_T1hrX1ZEvH3Dh5VA_QYvjcUkr
```

---

## QUICK STEPS (5 MINUTES)

### 1️⃣ Run Database Migrations (Supabase)

```
1. https://app.supabase.com → Select project
2. SQL Editor → New Query
3. Copy-paste: backend/migrations/postgres-complete-schema.sql
4. Click RUN
✅ Wait for completion (30 seconds)
```

### 2️⃣ Get Supabase Credentials

```
Connection String:
- Go to Settings → Database → PostgreSQL
- Copy the connection string (postgresql://...)

Service Role Key:
- Go to Settings → API
- Copy the "Service Role Key" (starts with sb_service_role_)
```

### 3️⃣ Import & Deploy to Vercel

```
1. https://vercel.com/new
2. Import: guires-marketing-control-center (your GitHub repo)
3. Click Import → Let it auto-detect settings → Deploy
```

### 4️⃣ Set Environment Variables in Vercel

```
Settings → Environment Variables → Add these:

NODE_ENV              = production
USE_PG                = true
DB_CLIENT             = pg
DATABASE_URL          = postgresql://postgres:PASSWORD@dsglniwrrkylniphwygc.supabase.co:5432/postgres
DB_HOST               = dsglniwrrkylniphwygc.supabase.co
DB_PORT               = 5432
DB_USER               = postgres
DB_PASSWORD           = PASSWORD_FROM_SUPABASE
DB_NAME               = postgres
JWT_SECRET            = (generate below)
JWT_EXPIRES_IN        = 7d
VITE_API_URL          = /api/v1
CORS_ORIGIN           = https://your-vercel-url.vercel.app
CORS_ORIGINS          = https://your-vercel-url.vercel.app
FRONTEND_URL          = https://your-vercel-url.vercel.app
```

**Generate JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5️⃣ Deploy & Test

```
1. Vercel: Click Deploy
2. Wait 2-3 minutes
3. Get your Vercel URL (preview at top)
4. Update CORS variables with your Vercel URL
5. Trigger Redeploy
```

### 6️⃣ Verify Deployment

```bash
# Test health endpoint
curl https://your-url.vercel.app/api/v1/health

# Test login
curl -X POST https://your-url.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## DEFAULT CREDENTIALS

Login with:

```
Email: admin@example.com
Password: admin123
```

⚠️ **CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

---

## IMPORTANT FILES

| File                                              | Purpose                           |
| ------------------------------------------------- | --------------------------------- |
| `backend/migrations/postgres-complete-schema.sql` | Database schema (run in Supabase) |
| `backend/.env.production`                         | Production environment template   |
| `vercel.json`                                     | Vercel configuration              |
| `DEPLOYMENT_GUIDE_SUPABASE_VERCEL.md`             | Full deployment guide             |

---

## TROUBLESHOOTING

### ❌ "Database Connection Failed"

```
✅ Check DATABASE_URL in Vercel env vars
✅ Verify Supabase project is active
✅ Check password has no special characters
```

### ❌ "CORS Error"

```
✅ Update CORS_ORIGIN and CORS_ORIGINS with your actual Vercel URL
✅ Redeploy after changing env vars
```

### ❌ "Tables don't exist"

```
✅ Verify SQL migration ran successfully
✅ Check Supabase SQL Editor for errors
✅ Re-run migration if needed
```

---

## DATABASE STRUCTURE

20+ Tables created including:

| Table                 | Rows | Purpose                          |
| --------------------- | ---- | -------------------------------- |
| users                 | 1    | Admin user                       |
| campaigns             | -    | Marketing campaigns              |
| projects              | -    | Projects under campaigns         |
| assets                | 5    | Digital assets                   |
| asset_category_master | 5    | Asset categories                 |
| asset_types           | 8    | Asset type definitions           |
| content_types         | 8    | Content type definitions         |
| keywords              | -    | SEO keywords                     |
| tasks                 | -    | Project tasks                    |
| + 10 more             | -    | Services, backlinks, roles, etc. |

---

## API ENDPOINTS AVAILABLE

```
POST   /api/v1/auth/login              - User login
GET    /api/v1/health                  - Health check
GET    /api/v1/assets                  - List assets
POST   /api/v1/assets                  - Create asset
GET    /api/v1/assets/:id              - Get asset
PUT    /api/v1/assets/:id              - Update asset
DELETE /api/v1/assets/:id              - Delete asset
GET    /api/v1/asset-categories        - List categories
POST   /api/v1/asset-categories        - Create category
GET    /api/v1/campaigns               - List campaigns
POST   /api/v1/campaigns               - Create campaign
GET    /api/v1/projects                - List projects
POST   /api/v1/projects                - Create project
... and 20+ more endpoints
```

---

## PERFORMANCE MONITORING

Vercel Dashboard:

- **Analytics** → Request latency, error rates
- **Logs** → View application logs
- **Deployments** → Rollback if needed

Supabase Dashboard:

- **Database** → Connection health
- **Logs** → SQL query logs
- **Backups** → Configure automatic backups

---

## POST-DEPLOYMENT

✅ Change admin password
✅ Enable monitoring
✅ Configure backups
✅ Set up CI/CD (GitHub Actions)
✅ Monitor error logs
✅ Plan database scaling if needed

---

## SUPPORT LINKS

- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- PostgreSQL: https://www.postgresql.org/docs/
- Your Repo: https://github.com/[owner]/guires-marketing-control-center

---

**Last Updated:** March 9, 2026
**Version:** 2.5.0
**Status:** Ready for Production ✅
