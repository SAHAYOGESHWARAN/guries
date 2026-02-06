# Fix: Login 405 Error

## Problem
The login page shows "Login failed: 405" error when trying to authenticate.

## Root Cause
Vercel hasn't properly deployed the API serverless functions yet. The `/api` directory structure needs to be recognized and built.

## Solution

### Step 1: Wait for Vercel Rebuild
The rebuild has been triggered. Check deployment status:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Wait for the new deployment to complete (usually 2-5 minutes)
4. Check the deployment logs for any errors

### Step 2: Verify API Deployment
Once deployment completes, test the API:

```bash
# Test health endpoint
curl https://guries.vercel.app/api/health

# Test login endpoint
curl -X POST https://guries.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Step 3: Clear Browser Cache
If API works but login still fails:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear localStorage
4. Clear cookies
5. Refresh the page

### Step 4: Test Login Again
1. Visit https://guries.vercel.app
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click Sign In

## If Still Not Working

### Check Vercel Logs
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click on the latest deployment
4. Check the "Logs" tab for errors

### Common Issues

**Issue: "Cannot find module '@vercel/node'"**
- Solution: Ensure `@vercel/node` is in package.json dependencies
- Status: ✅ Already added

**Issue: "API returns HTML instead of JSON"**
- Solution: Verify `/api` directory structure is correct
- Check: `api/auth.ts`, `api/health.ts`, `api/v1/[[...route]].ts`

**Issue: "CORS errors"**
- Solution: CORS headers are already set in API handlers
- Check: `res.setHeader('Access-Control-Allow-Origin', '*')`

### Manual Deployment (If Needed)

If Vercel deployment fails, manually trigger rebuild:

```bash
# Option 1: Push a new commit
git add .
git commit -m "Trigger rebuild"
git push origin master

# Option 2: Use Vercel CLI
npm install -g vercel
vercel --prod

# Option 3: Redeploy from Vercel Dashboard
# Go to https://vercel.com/dashboard
# Click "Redeploy" on the latest deployment
```

## Expected Behavior After Fix

1. ✅ Login page loads without errors
2. ✅ Enter credentials: `admin@example.com` / `admin123`
3. ✅ Click "Sign In"
4. ✅ API returns JWT token
5. ✅ Redirected to dashboard
6. ✅ Dashboard loads with user data

## Verification Checklist

- [ ] Vercel deployment completed successfully
- [ ] API health endpoint returns 200
- [ ] Login endpoint accepts POST requests
- [ ] Login with valid credentials succeeds
- [ ] JWT token is returned
- [ ] Dashboard loads after login
- [ ] No console errors in browser

## Support

If issues persist:
1. Check Vercel logs for deployment errors
2. Verify environment variables are set
3. Check browser console for JavaScript errors
4. Test API endpoints with curl
5. Review DEPLOYMENT_GUIDE.md for troubleshooting

---

**Status**: Rebuild triggered  
**Next Step**: Wait for Vercel deployment to complete (2-5 minutes)  
**Test URL**: https://guries.vercel.app
