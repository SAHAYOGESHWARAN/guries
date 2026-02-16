# Deployment Guide - Asset Upload Fix

## Quick Start (5 minutes)

### 1. Verify Environment Variables in Vercel

Go to: **Vercel Dashboard → Project Settings → Environment Variables**

Ensure these variables are set:

```
DATABASE_URL = postgresql://user:password@host:port/database
NODE_ENV = production
USE_PG = true
VITE_API_URL = /api/v1
```

### 2. Deploy the Fix

```bash
git add api/db.ts api/v1/assetLibrary.ts
git commit -m "Fix: Asset upload database persistence - use PostgreSQL instead of mock DB"
git push
```

### 3. Monitor Deployment

In Vercel Dashboard:
1. Go to Deployments
2. Click on the latest deployment
3. Check the logs for: `[DB] PostgreSQL connection pool created`
4. If you see this, the database connection is working

### 4. Test the Fix

1. Open your application
2. Navigate to: **Assets → Upload New Asset**
3. Fill in the form:
   - Asset Title: "Test Asset"
   - Asset Type: Select any type
   - Application Type: "Web"
4. Click "Submit for QC"
5. Should see: "Asset submitted for QC successfully!"
6. Refresh the page - asset should still be there

## What Was Fixed

### Before (Broken)
- Used mock in-memory database
- Data lost on every deployment
- "Failed to save asset" error
- No persistence

### After (Fixed)
- Uses real PostgreSQL database (Supabase)
- Data persists permanently
- Assets save successfully
- Proper error handling

## Database Connection Details

### Supabase PostgreSQL
If using Supabase, your `DATABASE_URL` looks like:
```
postgresql://postgres:PASSWORD@db.REGION.supabase.co:5432/postgres
```

### Other PostgreSQL Providers
- Heroku Postgres
- AWS RDS
- DigitalOcean Managed Databases
- Any PostgreSQL 12+

## Troubleshooting

### Deployment Fails
**Check**:
1. Vercel logs for errors
2. `DATABASE_URL` is set correctly
3. Database is accessible from Vercel

**Fix**:
```bash
# Test database connection locally
psql $DATABASE_URL -c "SELECT 1;"
```

### Assets Not Saving
**Check**:
1. Browser console for API errors
2. Vercel logs for database errors
3. All required fields are filled

**Fix**:
1. Verify `DATABASE_URL` in Vercel
2. Redeploy the application
3. Clear browser cache and try again

### "Database not configured" Error
**Fix**:
1. Add `DATABASE_URL` to Vercel environment variables
2. Redeploy
3. Wait 2-3 minutes for deployment to complete

## Verification

### Check Database Connection
```bash
# From your local terminal
psql $DATABASE_URL -c "SELECT 1;"
# Should return: 1
```

### Check Assets Table
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM assets;"
# Should return: number of assets
```

### View Recent Assets
```bash
psql $DATABASE_URL -c "SELECT id, asset_name, status, created_at FROM assets ORDER BY created_at DESC LIMIT 5;"
```

## Performance Notes

- First request may take 2-3 seconds (schema initialization)
- Subsequent requests are fast (<100ms)
- Connection pooling handles multiple concurrent requests
- SSL encryption for secure data transmission

## Security

- All data encrypted in transit (SSL)
- Database credentials in environment variables (not in code)
- No sensitive data in logs
- Proper error handling (no database details exposed)

## Next Steps

1. ✅ Deploy the fixed code
2. ✅ Verify environment variables
3. ✅ Test asset upload
4. ✅ Monitor logs for errors
5. ✅ Verify data persistence

## Support

If you encounter issues:

1. **Check Vercel Logs**
   ```bash
   vercel logs --tail
   ```

2. **Test Database Connection**
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

3. **Review Error Messages**
   - Check browser console (F12)
   - Check Vercel deployment logs
   - Look for `[DB]` or `[API]` prefixed messages

4. **Common Issues**
   - DATABASE_URL not set → Add to Vercel environment variables
   - Connection timeout → Check database is accessible
   - Schema errors → Database may need initialization

## Rollback (if needed)

If you need to revert:
```bash
git revert HEAD
git push
```

This will restore the previous version (though data will be lost).
