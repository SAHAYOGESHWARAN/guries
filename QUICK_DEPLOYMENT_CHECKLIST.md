# Quick Deployment Checklist - Data Persistence Fix

## Pre-Deployment (Local Testing)

### Backend Setup
- [ ] Backend running on port 3001: `npm run dev` in `backend/` folder
- [ ] Database initialized: Check `backend/mcc_db.sqlite` exists
- [ ] All tables created: Run `sqlite3 backend/mcc_db.sqlite ".tables"`
- [ ] Health check works: `curl http://localhost:3001/api/v1/health`

### Frontend Setup
- [ ] Frontend `.env.local` has correct API URL: `VITE_API_URL=http://localhost:3001/api/v1`
- [ ] Frontend running: `npm run dev` in `frontend/` folder
- [ ] No console errors: Open DevTools (F12)
- [ ] API calls working: Check Network tab for successful requests

### Functionality Testing
- [ ] Can create new asset
- [ ] Asset data saves to database
- [ ] Asset appears in list immediately
- [ ] Can edit asset
- [ ] Can delete asset
- [ ] Can link asset to service
- [ ] Can link asset to sub-service
- [ ] Can link asset to keyword
- [ ] QC review workflow works
- [ ] Data persists after page refresh

## Deployment to Vercel

### Step 1: Commit Changes
```bash
git add .
git commit -m "Fix: Data persistence and database schema issues

- Fixed API URL mismatch (3003 → 3001)
- Added 40+ missing columns to assets table
- Created sub_services table
- Created asset linking tables (service, subservice, keyword)
- Created master tables (category, type, format, keywords, etc.)
- Added 10+ database indexes
- Updated production environment configuration"
git push origin main
```

### Step 2: Verify Vercel Deployment
- [ ] Vercel build succeeds (check Vercel dashboard)
- [ ] No build errors in logs
- [ ] Deployment completes successfully

### Step 3: Test Production
- [ ] Visit https://guries.vercel.app
- [ ] Page loads without errors
- [ ] No console errors (F12 → Console)
- [ ] API health check: https://guries.vercel.app/api/v1/health
- [ ] Can create asset
- [ ] Asset saves successfully
- [ ] Asset appears in list
- [ ] Data persists after refresh

## Post-Deployment Verification

### API Endpoints
- [ ] GET `/api/v1/health` - Returns 200 OK
- [ ] GET `/api/v1/assets` - Returns asset list
- [ ] POST `/api/v1/assets` - Creates new asset
- [ ] PUT `/api/v1/assets/:id` - Updates asset
- [ ] DELETE `/api/v1/assets/:id` - Deletes asset
- [ ] GET `/api/v1/services` - Returns services
- [ ] GET `/api/v1/sub-services` - Returns sub-services
- [ ] GET `/api/v1/keywords` - Returns keywords

### Database Tables
Verify all tables exist:
- [ ] users
- [ ] assets
- [ ] services
- [ ] sub_services
- [ ] service_asset_links
- [ ] subservice_asset_links
- [ ] keyword_asset_links
- [ ] asset_category_master
- [ ] asset_type_master
- [ ] asset_formats
- [ ] keywords
- [ ] workflow_stages
- [ ] platforms
- [ ] countries
- [ ] seo_error_types
- [ ] projects
- [ ] campaigns
- [ ] tasks
- [ ] asset_qc_reviews
- [ ] qc_audit_log
- [ ] notifications
- [ ] brands

### Performance Checks
- [ ] Asset list loads in < 2 seconds
- [ ] Asset creation completes in < 1 second
- [ ] No database errors in logs
- [ ] No API timeout errors
- [ ] Memory usage stable

## Troubleshooting

### If Assets Don't Save
1. Check backend logs: `vercel logs`
2. Check browser Network tab: F12 → Network
3. Verify API URL: Should be `/api/v1` on production
4. Check database: Verify tables exist

### If Data Doesn't Display
1. Check API response: `curl https://guries.vercel.app/api/v1/assets`
2. Check browser console: F12 → Console
3. Verify data exists in database
4. Check for CORS errors

### If Page Won't Load
1. Check Vercel build logs
2. Check browser console for errors
3. Verify frontend environment variables
4. Check backend is running

## Rollback Plan

If deployment fails:
1. Revert to previous commit: `git revert HEAD`
2. Push to GitHub: `git push origin main`
3. Vercel automatically redeploys previous version
4. Verify production is restored

## Success Criteria

✅ All checks passed when:
- Frontend loads without errors
- API endpoints respond correctly
- Data saves to database
- Data displays in tables
- No console errors
- No API errors
- Database tables exist
- Performance is acceptable

---

**Estimated Time**: 15-20 minutes
**Risk Level**: Low (all changes are additive, no breaking changes)
**Rollback Time**: 2-3 minutes
