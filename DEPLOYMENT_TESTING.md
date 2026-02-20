# Deployment & Testing Guide

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Node.js 18.x, 20.x, or 22.x installed
- [ ] PostgreSQL database created (or Vercel Postgres)
- [ ] Git repository ready
- [ ] Vercel account configured

### 2. Environment Variables
Set these in Vercel project settings:
```
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
USE_PG=true
VITE_API_URL=/api/v1
```

### 3. Code Verification
```bash
# Install dependencies
npm run install:all

# Build frontend
npm run build:frontend

# Build backend
npm run build:backend

# Run tests
npm run test
```

## Deployment Steps

### Step 1: Push to Git
```bash
git add .
git commit -m "Deploy with PostgreSQL and all fixes"
git push origin main
```

### Step 2: Vercel Deployment
Vercel automatically:
1. Installs dependencies
2. Builds frontend (outputs to `frontend/dist`)
3. Builds backend (outputs to `backend/dist`)
4. Deploys to production

### Step 3: Monitor Deployment
Check Vercel dashboard:
- Build logs
- Deployment status
- Function logs

## Post-Deployment Testing

### Test 1: Health Check
```bash
curl https://your-app.vercel.app/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-20T...",
  "database": "connected"
}
```

### Test 2: Database Connection
```bash
curl https://your-app.vercel.app/api/v1/industry-sectors
```

Expected response:
```json
[
  {
    "id": 1,
    "industry": "Pharmaceuticals",
    "sector": "Healthcare",
    "application": "Medical Research",
    "country": "Global",
    "status": "active"
  },
  ...
]
```

### Test 3: Create New Record
```bash
curl -X POST https://your-app.vercel.app/api/v1/industry-sectors \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Test Industry",
    "sector": "Test Sector",
    "application": "Test App",
    "country": "Test Country",
    "status": "active"
  }'
```

### Test 4: Update Record
```bash
curl -X PUT https://your-app.vercel.app/api/v1/industry-sectors/1 \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Updated Industry",
    "sector": "Updated Sector",
    "application": "Updated App",
    "country": "Updated Country",
    "status": "active"
  }'
```

### Test 5: Delete Record
```bash
curl -X DELETE https://your-app.vercel.app/api/v1/industry-sectors/1
```

## Frontend Testing

### Test 1: Login
1. Navigate to https://your-app.vercel.app
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

### Test 2: Industry/Sector Master Page
1. Click "Industry / Sector Master" in sidebar
2. Verify data loads (should show 25+ records)
3. Test filters:
   - Search by industry
   - Filter by country
   - Filter by status

### Test 3: Create New Entry
1. Click "Add Industry" button
2. Fill in form:
   - Industry: "Test Industry"
   - Sector: "Test Sector"
   - Application: "Test App"
   - Country: "Test Country"
3. Click "Create"
4. Verify entry appears in table

### Test 4: Edit Entry
1. Click edit icon on any row
2. Modify fields
3. Click "Update"
4. Verify changes saved

### Test 5: Delete Entry
1. Click delete icon on any row
2. Confirm deletion
3. Verify entry removed from table

### Test 6: Export to CSV
1. Click "Export" button
2. Verify CSV file downloads
3. Open and verify data format

### Test 7: All Master Data Pages
Test each master data page:
- [ ] Content Types
- [ ] Asset Types
- [ ] Asset Categories
- [ ] Asset Formats
- [ ] Platforms
- [ ] Countries

## Performance Testing

### Load Time
- First page load: < 3 seconds
- Subsequent loads: < 1 second
- API response: < 200ms

### Database Performance
```bash
# Check query performance
psql "your_database_url"
SELECT COUNT(*) FROM industry_sectors;
SELECT COUNT(*) FROM content_types;
SELECT COUNT(*) FROM asset_types;
```

### Connection Pool
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

## Error Handling Tests

### Test 1: Invalid Login
1. Try login with wrong credentials
2. Verify error message displays

### Test 2: Network Error
1. Disconnect internet
2. Try to load page
3. Verify offline message or cached data

### Test 3: Database Error
1. Temporarily disable database
2. Try to create record
3. Verify error handling

### Test 4: Invalid Data
1. Try to create record with missing fields
2. Verify validation error

## Monitoring & Logs

### Check Vercel Logs
```bash
vercel logs --follow
```

### Monitor Database
```bash
psql "your_database_url"

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check record counts
SELECT 'industry_sectors' as table_name, COUNT(*) as count FROM industry_sectors
UNION ALL
SELECT 'content_types', COUNT(*) FROM content_types
UNION ALL
SELECT 'asset_types', COUNT(*) FROM asset_types;
```

## Troubleshooting

### Issue: "Something Went Wrong"
1. Check browser console for errors
2. Check Vercel logs
3. Verify DATABASE_URL is set
4. Clear browser cache and reload

### Issue: No Data Showing
1. Verify database connection
2. Check if tables were created
3. Verify seed data was populated
4. Check API response in browser DevTools

### Issue: Slow Performance
1. Check database query performance
2. Monitor connection pool usage
3. Check Vercel function duration
4. Review network tab in DevTools

### Issue: CORS Errors
1. Verify CORS headers in API
2. Check allowed origins
3. Verify API URL in frontend config

## Rollback Plan

If deployment fails:

```bash
# Revert to previous version
git revert <commit-hash>
git push origin main

# Vercel automatically redeploys
```

## Success Criteria

- [x] Application loads without errors
- [x] Login works with admin credentials
- [x] All master data pages load
- [x] Can create new records
- [x] Can update records
- [x] Can delete records
- [x] Export to CSV works
- [x] Filters work correctly
- [x] Data persists after refresh
- [x] No console errors
- [x] API endpoints respond correctly
- [x] Database queries complete < 200ms
- [x] Page loads < 3 seconds

## Post-Deployment Tasks

1. [ ] Monitor application for 24 hours
2. [ ] Check error logs daily
3. [ ] Verify data integrity
4. [ ] Test all user workflows
5. [ ] Gather user feedback
6. [ ] Document any issues
7. [ ] Plan optimization if needed

## Support Resources

- Vercel Docs: https://vercel.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- React Docs: https://react.dev
- Express Docs: https://expressjs.com

## Contact & Escalation

For issues:
1. Check Vercel logs
2. Review error messages
3. Check database connectivity
4. Verify environment variables
5. Contact support if needed
