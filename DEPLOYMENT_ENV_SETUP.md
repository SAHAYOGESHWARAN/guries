# Deployment Environment Setup Guide

## Overview
This guide ensures proper database connection and environment variables for production deployment on Vercel.

---

## 1. Database Setup (PostgreSQL)

### Option A: Supabase (Recommended for Vercel)
Supabase provides PostgreSQL hosting with free tier.

**Steps:**
1. Go to https://supabase.com
2. Sign up and create a new project
3. Wait for project initialization
4. Go to **Settings → Database** to get connection details
5. Copy the connection string (looks like: `postgresql://user:password@host:5432/database`)

### Option B: AWS RDS
1. Create RDS PostgreSQL instance
2. Get endpoint, username, password, database name
3. Ensure security group allows inbound on port 5432

### Option C: DigitalOcean Managed Database
1. Create managed PostgreSQL database
2. Get connection details from dashboard
3. Whitelist your Vercel IP

---

## 2. Environment Variables for Vercel

### Frontend Environment Variables
Set these in Vercel Project Settings → Environment Variables:

```
VITE_API_URL=/api/v1
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Backend Environment Variables
Set these in Vercel Project Settings → Environment Variables:

```
# Database (PostgreSQL)
DB_HOST=your-db-host.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=postgres

# Server
NODE_ENV=production
PORT=3001
API_PORT=3001

# Frontend URL
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com

# JWT (Generate a strong secret)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRY=7d

# Logging
LOG_LEVEL=info

# Features
ENABLE_NOTIFICATIONS=true
ENABLE_EMAIL_ALERTS=true
```

---

## 3. Generate Secure JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it for `JWT_SECRET`.

---

## 4. Database Connection String Format

### Supabase Format:
```
postgresql://postgres:password@db.supabase.co:5432/postgres
```

### Standard PostgreSQL Format:
```
postgresql://username:password@host:port/database
```

---

## 5. Vercel Deployment Checklist

### Pre-Deployment:
- [ ] PostgreSQL database created and accessible
- [ ] All environment variables set in Vercel
- [ ] JWT_SECRET generated and set
- [ ] CORS_ORIGIN set to your production domain
- [ ] Build succeeds locally: `npm run build:all`
- [ ] No TypeScript errors: `npm run build:backend`

### Deployment Steps:

1. **Connect GitHub Repository to Vercel**
   ```bash
   # Push code to GitHub
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Set Environment Variables in Vercel**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all variables from section 2 above

3. **Deploy**
   - Vercel will auto-deploy on push to main
   - Or manually trigger: Deployments → Deploy

4. **Verify Deployment**
   - Check health endpoint: `https://your-domain.com/api/health`
   - Check database connection in logs

---

## 6. Database Initialization on Production

The backend will automatically:
1. Test PostgreSQL connection on startup
2. Initialize schema (if not already done)
3. Seed initial data (if needed)

**To manually initialize database:**

```bash
# Connect to your production database
psql postgresql://user:password@host:5432/database

# Run migrations (if needed)
# The app will handle this automatically
```

---

## 7. Troubleshooting

### Connection Refused
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
- Verify database is running
- Check firewall/security groups allow connection

### Authentication Failed
- Verify DB_USER and DB_PASSWORD are correct
- Check for special characters in password (URL encode if needed)

### Database Not Found
- Verify DB_NAME exists
- Check user has permissions on database

### CORS Errors
- Ensure CORS_ORIGIN matches your domain exactly
- Include protocol (https://)
- No trailing slash

### JWT Errors
- Regenerate JWT_SECRET if needed
- Ensure JWT_SECRET is at least 32 characters
- Set JWT_EXPIRY to valid value (e.g., "7d")

---

## 8. Production Security Best Practices

1. **Use HTTPS only** - Vercel provides free SSL
2. **Strong JWT Secret** - Use generated secret, not hardcoded
3. **Database Password** - Use strong, random password
4. **Environment Variables** - Never commit .env files
5. **CORS** - Restrict to your domain only
6. **Rate Limiting** - Consider adding rate limiting middleware
7. **Database Backups** - Enable automatic backups
8. **Monitoring** - Set up error tracking (Sentry, etc.)

---

## 9. Monitoring & Logs

### View Vercel Logs:
```bash
vercel logs --prod
```

### Check Database Connection:
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-01T12:00:00.000Z"
}
```

---

## 10. Rollback Plan

If deployment fails:

1. **Check Vercel Logs** - Identify the error
2. **Verify Environment Variables** - Ensure all are set
3. **Test Database Connection** - Verify PostgreSQL is accessible
4. **Rollback to Previous Deployment** - Vercel → Deployments → Rollback
5. **Fix Issues Locally** - Test before re-deploying

---

## Next Steps

1. Set up PostgreSQL database (Supabase recommended)
2. Generate JWT_SECRET
3. Add all environment variables to Vercel
4. Push code to GitHub
5. Verify deployment with health check
6. Monitor logs for any issues

