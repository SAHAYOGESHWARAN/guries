# Vercel Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [x] All TypeScript errors resolved (0 errors)
- [x] Frontend builds successfully
- [x] Backend builds successfully
- [x] No console errors or warnings

### ✅ Configuration
- [x] vercel.json properly configured
- [x] Output directory set to `frontend/dist`
- [x] Build command: `npm run build:all`
- [x] CORS headers configured
- [x] API routes configured

### ✅ Database
- [ ] PostgreSQL database created
- [ ] Database credentials obtained
- [ ] Database accessible from internet (if needed)
- [ ] Connection tested locally

### ✅ Environment Variables
- [ ] NODE_ENV=production
- [ ] DB_HOST set
- [ ] DB_PORT set (5432)
- [ ] DB_USER set
- [ ] DB_PASSWORD set
- [ ] DB_NAME set
- [ ] JWT_SECRET generated (32+ chars)
- [ ] CORS_ORIGIN set to your domain
- [ ] FRONTEND_URL set to your domain

---

## Deployment Steps

### Step 1: Prepare Database
```bash
# Option A: Use Supabase (Recommended)
1. Go to https://supabase.com
2. Create new project
3. Copy connection details

# Option B: Use AWS RDS
1. Create PostgreSQL instance
2. Copy endpoint and credentials

# Option C: Use DigitalOcean
1. Create managed PostgreSQL
2. Copy connection details
```

### Step 2: Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output for JWT_SECRET

### Step 3: Connect to Vercel
```bash
# Option A: Using Vercel CLI
npm install -g vercel
vercel --prod

# Option B: Using Git Integration
1. Push code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com
3. Click "New Project"
4. Select your repository
5. Click "Deploy"
```

### Step 4: Add Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Click "Settings"
4. Click "Environment Variables"
5. Add all variables from VERCEL_ENV_SETUP.md
6. Select "Production" environment
7. Click "Save"

### Step 5: Redeploy
1. Go to "Deployments"
2. Click three dots on latest deployment
3. Click "Redeploy"

---

## Post-Deployment Verification

### ✅ Frontend
- [ ] Visit https://your-domain.com
- [ ] Page loads without errors
- [ ] All assets load (CSS, JS, images)
- [ ] Navigation works
- [ ] No console errors

### ✅ API
- [ ] Visit https://your-domain.com/api/health
- [ ] Returns 200 status
- [ ] Response shows server info

### ✅ Database
- [ ] API can connect to database
- [ ] Data queries work
- [ ] No connection errors in logs

### ✅ Logs
- [ ] Check Vercel deployment logs
- [ ] No errors or warnings
- [ ] Build completed successfully

---

## Troubleshooting

### Build Fails
**Error**: "npm run build:all" failed
- Check build logs in Vercel
- Verify all dependencies installed
- Ensure package.json scripts exist

### Database Connection Error
**Error**: "Cannot connect to database"
- Verify DB credentials in environment variables
- Check database is running
- Ensure firewall allows connections
- Test connection locally first

### CORS Error
**Error**: "CORS policy: No 'Access-Control-Allow-Origin' header"
- Update CORS_ORIGIN in environment variables
- Ensure it matches your domain exactly
- Include https:// in the URL

### 404 on API Routes
**Error**: "Cannot GET /api/..."
- Check vercel.json routes configuration
- Verify API files exist in api/ directory
- Check build output includes API files

### Frontend Not Loading
**Error**: "Cannot find module" or blank page
- Check frontend/dist exists
- Verify Vite build completed
- Check browser console for errors
- Clear browser cache

---

## Rollback Plan

If deployment fails:

1. **Immediate Rollback**
   - Go to Vercel Deployments
   - Click three dots on previous working deployment
   - Click "Promote to Production"

2. **Check Logs**
   - Review deployment logs for errors
   - Fix issues locally
   - Redeploy

3. **Contact Support**
   - Vercel Support: https://vercel.com/support
   - Check documentation: https://vercel.com/docs

---

## Performance Monitoring

After deployment, monitor:

1. **Build Time**: Should be < 5 minutes
2. **Bundle Size**: Frontend ~1.2 MB
3. **API Response**: Should be < 500ms
4. **Error Rate**: Should be 0%

---

## Security Checklist

- [ ] JWT_SECRET is strong (32+ chars)
- [ ] Database password is strong
- [ ] CORS_ORIGIN is restricted to your domain
- [ ] No secrets in code or git
- [ ] Environment variables not logged
- [ ] HTTPS enabled (Vercel provides)
- [ ] Database backups configured

---

## Final Checklist

- [ ] All environment variables set
- [ ] Database credentials verified
- [ ] JWT secret generated
- [ ] Code pushed to repository
- [ ] Vercel project created
- [ ] Build succeeds
- [ ] Frontend loads
- [ ] API responds
- [ ] Database connects
- [ ] No errors in logs
- [ ] Performance acceptable

---

## Deployment Complete! 🎉

Your application is now live at: `https://your-domain.com`

Monitor the application and check logs regularly for any issues.

