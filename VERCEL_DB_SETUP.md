# Vercel PostgreSQL Database Setup Guide

## Overview
This guide walks you through setting up a persistent PostgreSQL database on Vercel using Supabase.

## Prerequisites
- Vercel account (https://vercel.com)
- Supabase account (https://supabase.com)
- Git repository connected to Vercel

## Step 1: Create Supabase Database

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `marketing-control-center` (or your project name)
   - Database Password: Create a strong password
   - Region: Choose closest to your users
5. Wait for database to be created (2-3 minutes)

## Step 2: Get Database Connection String

1. In Supabase dashboard, go to **Settings → Database**
2. Copy the connection string (PostgreSQL)
3. Format: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`

## Step 3: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings → Environment Variables**
3. Add these variables:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
DB_CLIENT=pg
USE_PG=true
DB_HOST=[HOST]
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[PASSWORD]
DB_NAME=postgres
NODE_ENV=production
```

4. Click "Save"

## Step 4: Deploy to Vercel

1. Push your code to Git:
```bash
git add .
git commit -m "Add PostgreSQL database setup"
git push
```

2. Vercel will auto-deploy
3. Wait for deployment to complete

## Step 5: Initialize Database

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Run initialization
vercel env pull
npx ts-node backend/database/init-vercel-db.ts
```

### Option B: Using npm script

Add to `package.json`:
```json
{
  "scripts": {
    "db:init": "ts-node backend/database/init-vercel-db.ts",
    "db:init:vercel": "DATABASE_URL=$DATABASE_URL npm run db:init"
  }
}
```

Then run:
```bash
npm run db:init:vercel
```

### Option C: Manual via Supabase

1. Go to Supabase dashboard
2. Click **SQL Editor**
3. Copy content from `backend/database/schema.sql`
4. Paste into SQL editor
5. Click **Run**

## Step 6: Verify Database Setup

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Verify these tables exist:
   - users
   - brands
   - services
   - sub_services
   - keywords
   - assets
   - projects
   - campaigns
   - tasks
   - And 20+ more tables

## Step 7: Test Data Persistence

1. Go to your deployed app: https://guries.vercel.app
2. Create a new asset/project/campaign
3. Refresh the page - data should still be there
4. Wait 5 minutes and refresh again - data should persist

## Troubleshooting

### Database Connection Failed
- Check DATABASE_URL is correct in Vercel environment
- Verify Supabase database is running
- Check IP whitelist in Supabase (should allow all IPs for Vercel)

### Tables Not Created
- Run initialization script again
- Check Supabase SQL Editor for errors
- Verify DATABASE_URL environment variable is set

### Data Not Persisting
- Verify backend is using PostgreSQL (check logs)
- Check that NODE_ENV=production
- Verify USE_PG=true in environment

### Connection Timeout
- Increase connection timeout in `backend/config/db.ts`
- Check Supabase database status
- Verify network connectivity

## Real-Time Features

### Enable Real-Time Subscriptions (Optional)

1. In Supabase dashboard, go to **Replication**
2. Enable replication for tables you want real-time updates
3. Update frontend to use Supabase real-time client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Subscribe to changes
supabase
  .from('assets')
  .on('*', payload => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

## Monitoring

### Check Database Health

```bash
# Connect to database
psql postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check active connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

### Monitor Vercel Logs

1. Go to Vercel dashboard
2. Click **Deployments**
3. Click latest deployment
4. Click **Logs** tab
5. Look for database connection messages

## Backup & Recovery

### Automatic Backups
Supabase automatically backs up your database daily. To restore:

1. Go to Supabase dashboard
2. Click **Backups**
3. Select backup date
4. Click **Restore**

### Manual Backup

```bash
# Export database
pg_dump postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres > backup.sql

# Import database
psql postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres < backup.sql
```

## Performance Optimization

### Add Indexes
Indexes are already created in schema.sql for:
- Asset status and workflow
- Project/campaign/task relationships
- Service/keyword mappings
- User references

### Monitor Query Performance

```sql
-- Find slow queries
SELECT query, calls, mean_time, max_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## Security

### Best Practices
1. ✅ Use strong database password
2. ✅ Enable SSL connections (default in Supabase)
3. ✅ Restrict IP access if needed
4. ✅ Use environment variables for credentials
5. ✅ Never commit DATABASE_URL to Git
6. ✅ Rotate passwords regularly

### Connection Security
- All connections use SSL by default
- Credentials stored in Vercel environment variables
- No hardcoded passwords in code

## Next Steps

1. ✅ Database is initialized and ready
2. ✅ All tables and indexes created
3. ✅ Data persistence enabled
4. ✅ Real-time ready (optional)
5. 🔄 Monitor performance and backups
6. 🔄 Scale as needed

## Support

For issues:
1. Check Supabase status: https://status.supabase.com
2. Check Vercel status: https://www.vercel-status.com
3. Review logs in Vercel dashboard
4. Check Supabase documentation: https://supabase.com/docs

## Summary

Your application now has:
- ✅ Persistent PostgreSQL database on Supabase
- ✅ 30+ tables with proper relationships
- ✅ Performance indexes for fast queries
- ✅ Automatic backups
- ✅ SSL encrypted connections
- ✅ Real-time capable infrastructure
- ✅ Production-ready setup

Data will now persist across deployments, function restarts, and server resets!
