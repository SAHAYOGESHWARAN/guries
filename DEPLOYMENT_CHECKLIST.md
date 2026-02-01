# Production Deployment Checklist

## Pre-Deployment Phase

### 1. Code Quality & Build
- [ ] All TypeScript errors resolved: `npm run build:backend`
- [ ] Frontend builds successfully: `npm run build:frontend`
- [ ] Full build succeeds: `npm run build:all`
- [ ] No console errors or warnings
- [ ] All tests pass (if applicable)
- [ ] Code committed to Git

### 2. Database Setup
- [ ] PostgreSQL database created (Supabase recommended)
- [ ] Database is accessible and running
- [ ] Database credentials obtained:
  - [ ] DB_HOST
  - [ ] DB_PORT
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] DB_NAME

### 3. Environment Variables
- [ ] JWT_SECRET generated (32+ characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] All required variables identified:
  - [ ] DB_HOST
  - [ ] DB_PORT
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] DB_NAME
  - [ ] NODE_ENV=production
  - [ ] FRONTEND_URL (your domain)
  - [ ] CORS_ORIGIN (your domain)
  - [ ] JWT_SECRET
  - [ ] JWT_EXPIRY

### 4. Local Testing
- [ ] Test database connection locally:
  ```bash
  npx ts-node backend/verify-db-connection.ts
  ```
- [ ] Start backend locally with production env:
  ```bash
  NODE_ENV=production npm run dev:backend
  ```
- [ ] Verify health endpoint responds:
  ```bash
  curl http://localhost:3001/api/health
  ```
- [ ] Test API endpoints work correctly
- [ ] Frontend connects to backend successfully

### 5. Security Review
- [ ] No hardcoded secrets in code
- [ ] .env files added to .gitignore
- [ ] JWT_SECRET is strong and unique
- [ ] Database password is strong
- [ ] CORS_ORIGIN restricted to your domain
- [ ] HTTPS enabled (Vercel provides this)
- [ ] No sensitive data in logs

---

## Vercel Deployment Phase

### 1. Repository Setup
- [ ] Code pushed to GitHub main branch
- [ ] Repository is public or Vercel has access
- [ ] No uncommitted changes

### 2. Vercel Project Setup
- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Project created in Vercel dashboard
- [ ] Build command set to: `npm run build:all`
- [ ] Output directory set to: `frontend/dist`

### 3. Environment Variables in Vercel
- [ ] Go to Project Settings → Environment Variables
- [ ] Add all variables from section 3 above
- [ ] Verify each variable is set correctly:
  - [ ] DB_HOST
  - [ ] DB_PORT
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] DB_NAME
  - [ ] NODE_ENV=production
  - [ ] FRONTEND_URL
  - [ ] CORS_ORIGIN
  - [ ] JWT_SECRET
  - [ ] JWT_EXPIRY
  - [ ] VITE_API_URL=/api/v1
  - [ ] VITE_GEMINI_API_KEY (if using chatbot)

### 4. Domain Configuration
- [ ] Custom domain added to Vercel (if applicable)
- [ ] DNS records updated
- [ ] SSL certificate provisioned (automatic)
- [ ] Domain resolves correctly

### 5. Deploy
- [ ] Trigger deployment (automatic on push or manual)
- [ ] Monitor build logs for errors
- [ ] Wait for deployment to complete
- [ ] Check deployment status shows "Ready"

---

## Post-Deployment Verification

### 1. Health Checks
- [ ] Frontend loads: `https://your-domain.com`
- [ ] API health endpoint responds: `https://your-domain.com/api/health`
- [ ] Database connection successful (check logs)
- [ ] No 500 errors in logs

### 2. Functionality Tests
- [ ] Login works
- [ ] Can view dashboard
- [ ] Can create/read/update/delete data
- [ ] API endpoints respond correctly
- [ ] WebSocket connections work (if applicable)
- [ ] File uploads work (if applicable)

### 3. Performance
- [ ] Page load time acceptable
- [ ] API response time acceptable
- [ ] No memory leaks in logs
- [ ] Database queries are efficient

### 4. Security
- [ ] HTTPS enforced
- [ ] CORS headers correct
- [ ] No sensitive data in logs
- [ ] Authentication working
- [ ] Authorization working

### 5. Monitoring Setup
- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Logs accessible and monitored
- [ ] Alerts configured for errors
- [ ] Database backups enabled
- [ ] Uptime monitoring enabled

---

## Troubleshooting

### Build Fails
1. Check build logs in Vercel
2. Verify all environment variables are set
3. Test build locally: `npm run build:all`
4. Check for TypeScript errors: `npm run build:backend`

### Database Connection Error
1. Verify DB credentials in environment variables
2. Check database is running and accessible
3. Run verification script: `npx ts-node backend/verify-db-connection.ts`
4. Check firewall/security groups allow connection
5. Verify database user has correct permissions

### CORS Errors
1. Check CORS_ORIGIN matches your domain exactly
2. Include protocol (https://)
3. No trailing slash
4. Verify FRONTEND_URL is set correctly

### API Not Responding
1. Check Vercel logs for errors
2. Verify environment variables are set
3. Check database connection
4. Verify API routes are registered
5. Check for port conflicts

### Frontend Not Loading
1. Check Vercel build logs
2. Verify VITE_API_URL is set to `/api/v1`
3. Check frontend build succeeded
4. Verify static files are served correctly

---

## Rollback Plan

If deployment has critical issues:

1. **Immediate Actions**
   - [ ] Check Vercel logs for error details
   - [ ] Verify environment variables
   - [ ] Check database connectivity

2. **Rollback to Previous Version**
   - [ ] Go to Vercel Dashboard
   - [ ] Select your project
   - [ ] Go to Deployments
   - [ ] Find previous successful deployment
   - [ ] Click "Redeploy"

3. **Fix Issues**
   - [ ] Identify root cause
   - [ ] Fix locally and test
   - [ ] Commit and push to GitHub
   - [ ] Vercel will auto-deploy

---

## Post-Deployment Maintenance

### Daily
- [ ] Monitor error logs
- [ ] Check uptime status
- [ ] Verify no unusual activity

### Weekly
- [ ] Review performance metrics
- [ ] Check database size
- [ ] Verify backups are working

### Monthly
- [ ] Review security logs
- [ ] Update dependencies (if needed)
- [ ] Test disaster recovery plan
- [ ] Review and optimize slow queries

---

## Success Criteria

✅ Deployment is successful when:
- Frontend loads without errors
- API responds to requests
- Database connection is stable
- All environment variables are set
- HTTPS is working
- No critical errors in logs
- Performance is acceptable
- Security checks pass

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Supabase Docs**: https://supabase.com/docs
- **Node.js Docs**: https://nodejs.org/docs/

