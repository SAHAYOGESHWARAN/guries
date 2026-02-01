# Deployment Guide - Vercel Setup

## Overview
This guide explains how to properly deploy the Marketing Control Center to Vercel with both frontend and backend.

## Critical Changes Made

### 1. **vercel.json** - Updated Configuration
- Added backend API deployment support
- Configured serverless functions for `/api/v1/*` routes
- Added proper CORS headers
- Set up rewrites for SPA routing

### 2. **package.json** - Updated Build Scripts
- Changed `vercel-build` to run both frontend and backend builds
- Added `build:all` script that builds both
- Ensures backend TypeScript is compiled

### 3. **.env.production** - Complete Configuration
- Added database connection variables
- Added JWT configuration
- Added CORS settings
- Added all required backend variables

### 4. **api/v1/[[...route]].ts** - Serverless Handler
- Created catch-all API route handler
- Handles all `/api/v1/*` requests
- Includes health check endpoint
- Proper error handling and CORS

## Pre-Deployment Checklist

### Step 1: Database Setup
**CRITICAL**: SQLite won't work on Vercel. You must use PostgreSQL.

**Option A: Use Supabase (Recommended)**
1. Go to https://supabase.com
2. Create a new project
3. Get your connection string
4. Add to Vercel environment variables:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

**Option B: Use Neon**
1. Go to https://neon.tech
2. Create a new project
3. Get your connection string
4. Add to Vercel environment variables

### Step 2: Environment Variables
Set these in Vercel Project Settings → Environment Variables:

```
# Database
DATABASE_URL=postgresql://...
DATABASE_POOL_SIZE=10

# API
API_PORT=3001
NODE_ENV=production
LOG_LEVEL=info

# JWT
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=https://your-domain.com

# Gemini (for Chatbot)
VITE_GEMINI_API_KEY=your_key_here

# Supabase
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
SUPABASE_ANON_KEY=your_key

# Frontend
VITE_API_URL=/api/v1
VITE_SOCKET_URL=
```

### Step 3: Backend Configuration
Update `backend/server.ts` to support Vercel:

```typescript
// Use dynamic port from environment
const PORT = parseInt(process.env.PORT || process.env.API_PORT || '3001', 10);

// Use PostgreSQL instead of SQLite
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Connect to PostgreSQL
const pool = new Pool({
  connectionString: dbUrl,
  max: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
});
```

### Step 4: Database Migration
Before deploying, migrate your data from SQLite to PostgreSQL:

```bash
# Export from SQLite
npm run export:sqlite

# Import to PostgreSQL
npm run import:postgres
```

### Step 5: Build Verification
Test the build locally:

```bash
# Install all dependencies
npm run install:all

# Build both frontend and backend
npm run build:all

# Verify backend compiled
ls backend/dist/

# Verify frontend built
ls frontend/dist/
```

## Deployment Steps

### Step 1: Connect to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### Step 2: Set Environment Variables
```bash
# Set variables in Vercel
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add VITE_GEMINI_API_KEY
# ... add all other variables
```

### Step 3: Deploy
```bash
# Deploy to production
vercel --prod

# Or push to git and Vercel will auto-deploy
git push origin main
```

### Step 4: Verify Deployment
1. Check Vercel dashboard for build status
2. Test health endpoint: `https://your-domain.com/api/v1/health`
3. Test frontend: `https://your-domain.com`
4. Check browser console for API errors

## Troubleshooting

### Build Fails
**Error**: `Cannot find module 'backend'`
- Solution: Ensure `npm run build:backend` completes successfully
- Check: `backend/dist/` directory exists
- Fix: Run `cd backend && npm install && npm run build`

### API Returns 404
**Error**: `/api/v1/...` returns 404
- Solution: Check `vercel.json` rewrites configuration
- Check: `api/v1/[[...route]].ts` file exists
- Fix: Redeploy with `vercel --prod`

### Database Connection Fails
**Error**: `ECONNREFUSED` or `ENOTFOUND`
- Solution: Verify `DATABASE_URL` is set correctly
- Check: Database is accessible from Vercel
- Fix: Test connection string locally first

### CORS Errors
**Error**: `Access to XMLHttpRequest blocked by CORS`
- Solution: Check `CORS_ORIGIN` environment variable
- Check: `vercel.json` CORS headers
- Fix: Update `CORS_ORIGIN` to match your domain

### Frontend Can't Reach API
**Error**: API calls return 404 or timeout
- Solution: Check `VITE_API_URL` is set to `/api/v1`
- Check: Frontend build includes correct API URL
- Fix: Rebuild frontend with correct env vars

## Post-Deployment

### 1. Monitor Logs
```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

### 2. Test Critical Endpoints
- [ ] Health check: `/api/v1/health`
- [ ] QC Reviews: `/api/v1/qc-reviews`
- [ ] Assets: `/api/v1/assets`
- [ ] Users: `/api/v1/users`
- [ ] Frontend loads: `/`

### 3. Set Up Monitoring
- Enable Vercel Analytics
- Set up error tracking (Sentry, etc.)
- Monitor database performance
- Set up alerts for failures

### 4. Database Backups
- Enable automatic backups in Supabase/Neon
- Test restore procedure
- Document backup schedule

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous deployment
vercel rollback

# Or redeploy specific commit
vercel --prod --target=production
```

## Performance Optimization

### 1. Database
- Add indexes to frequently queried columns
- Use connection pooling (already configured)
- Monitor slow queries

### 2. Frontend
- Enable gzip compression (Vercel default)
- Optimize images
- Use code splitting
- Enable caching headers

### 3. API
- Add response caching
- Implement rate limiting
- Use pagination for large datasets
- Monitor function execution time

## Security Checklist

- [ ] JWT_SECRET is strong and random
- [ ] DATABASE_URL uses SSL connection
- [ ] CORS_ORIGIN is restricted to your domain
- [ ] Environment variables are not in git
- [ ] API validates all inputs
- [ ] Sensitive data is encrypted
- [ ] HTTPS is enforced
- [ ] Rate limiting is enabled

## Next Steps

1. **Migrate Data**: Move data from SQLite to PostgreSQL
2. **Test Thoroughly**: Test all critical workflows
3. **Set Up Monitoring**: Enable logging and alerts
4. **Document Changes**: Update team documentation
5. **Plan Maintenance**: Schedule regular backups and updates

## Support

For issues:
1. Check Vercel logs: `vercel logs`
2. Check browser console for errors
3. Test API endpoints with curl/Postman
4. Review environment variables
5. Check database connectivity

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Node.js Runtime](https://vercel.com/docs/functions/serverless-functions/node-js)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
