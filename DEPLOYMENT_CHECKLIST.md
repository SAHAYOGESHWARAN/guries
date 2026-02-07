# Deployment Checklist - Guires Marketing Control Center

## Pre-Deployment (Local Testing)

### Code Quality
- [ ] Run `npm run build` successfully
- [ ] Run `npm test` - all tests pass
- [ ] No TypeScript errors: `npm run build:backend`
- [ ] No build warnings in frontend: `npm run build:frontend`
- [ ] Code review completed
- [ ] All features tested locally

### Environment Setup
- [ ] `.env` files configured correctly
- [ ] Database connection tested locally
- [ ] API endpoints responding
- [ ] Frontend loads without errors
- [ ] Login works with test credentials

### Database
- [ ] Database schema initialized
- [ ] Test data seeded
- [ ] Migrations run successfully
- [ ] Backup created

### Security
- [ ] JWT_SECRET is strong and unique
- [ ] ADMIN_PASSWORD is hashed
- [ ] No sensitive data in code
- [ ] CORS origins configured
- [ ] HTTPS enforced (production)

---

## Vercel Deployment Setup

### 1. GitHub Repository
- [ ] Code pushed to GitHub
- [ ] Repository is public or Vercel has access
- [ ] Main branch is clean and ready
- [ ] No uncommitted changes

### 2. Vercel Account
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Project created in Vercel

### 3. Supabase Database
- [ ] Supabase project created
- [ ] PostgreSQL database initialized
- [ ] Connection string obtained
- [ ] Database user created with proper permissions
- [ ] SSL enforcement enabled

### 4. Environment Variables in Vercel

#### Required Variables
```
NODE_ENV=production
VITE_API_URL=/api/v1
LOG_LEVEL=info
```

#### Database Variables
```
DB_CLIENT=pg
USE_PG=true
DATABASE_URL=postgresql://user:password@host:5432/database
DB_HOST=your-host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=postgres
```

#### Authentication Variables
```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$2a$10$KL271sXgLncfLQGyT7q/cOz.vYl1CiIy7tsaGWEgDe.b1cbosXMxq
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
```

#### CORS Variables
```
CORS_ORIGIN=https://your-vercel-domain.vercel.app
CORS_ORIGINS=https://your-vercel-domain.vercel.app
SOCKET_CORS_ORIGINS=https://your-vercel-domain.vercel.app
```

#### URL Variables
```
FRONTEND_URL=https://your-vercel-domain.vercel.app
BACKEND_URL=https://your-vercel-domain.vercel.app
```

---

## Deployment Steps

### Step 1: Connect Repository
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New" → "Project"
- [ ] Select GitHub repository
- [ ] Vercel imports project

### Step 2: Configure Build Settings
- [ ] Root directory: `.` (default)
- [ ] Build command: `npm run build`
- [ ] Output directory: `frontend/dist`
- [ ] Install command: `npm install --legacy-peer-deps && cd backend && npm install --legacy-peer-deps && cd ../frontend && npm install --legacy-peer-deps && cd ..`

### Step 3: Add Environment Variables
- [ ] Add all variables from checklist above
- [ ] Verify each variable is set correctly
- [ ] No typos in variable names

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Monitor build logs
- [ ] Wait for deployment to complete
- [ ] Check deployment status

### Step 5: Verify Deployment
- [ ] [ ] Access frontend URL
- [ ] [ ] Check `/api/health` endpoint
- [ ] [ ] Test login functionality
- [ ] [ ] Verify database connection
- [ ] [ ] Check browser console for errors
- [ ] [ ] Test API endpoints

---

## Post-Deployment

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable Vercel analytics
- [ ] Monitor function logs
- [ ] Set up alerts for errors

### Testing
- [ ] Run smoke tests
- [ ] Test all major features
- [ ] Verify database operations
- [ ] Check API response times
- [ ] Test on different browsers

### Security
- [ ] Verify HTTPS is enforced
- [ ] Check CORS headers
- [ ] Verify authentication works
- [ ] Test authorization rules
- [ ] Check for exposed secrets

### Performance
- [ ] Check bundle size
- [ ] Monitor API response times
- [ ] Check database query performance
- [ ] Verify caching headers
- [ ] Test on slow network

### Backup & Recovery
- [ ] Database backup configured
- [ ] Backup tested
- [ ] Recovery procedure documented
- [ ] Rollback plan ready

---

## Troubleshooting

### Build Fails
**Error**: `npm ERR! code ERESOLVE`
- Solution: Use `--legacy-peer-deps` flag
- Check: `npm install --legacy-peer-deps`

**Error**: `Cannot find module`
- Solution: Ensure all dependencies installed
- Check: `npm install:all`

**Error**: `TypeScript compilation failed`
- Solution: Fix TypeScript errors
- Check: `npm run build:backend`

### Deployment Fails
**Error**: `Function exceeded maximum size`
- Solution: Reduce bundle size
- Check: Remove unused dependencies

**Error**: `Database connection timeout`
- Solution: Check DATABASE_URL
- Check: Verify Supabase firewall settings

**Error**: `CORS error`
- Solution: Update CORS_ORIGIN
- Check: Verify domain in environment variables

### Runtime Errors
**Error**: `Cannot GET /`
- Solution: Check frontend build
- Check: Verify `frontend/dist` exists

**Error**: `API not responding`
- Solution: Check backend build
- Check: Verify `/api/health` endpoint

**Error**: `Database error`
- Solution: Check connection string
- Check: Verify database exists

---

## Rollback Procedure

If deployment has critical issues:

1. Go to Vercel Dashboard
2. Select project
3. Go to "Deployments"
4. Find previous stable deployment
5. Click three dots menu
6. Select "Promote to Production"
7. Verify rollback successful

---

## Performance Optimization

### Frontend
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Code splitting enabled
- [ ] Lazy loading configured
- [ ] Cache headers set

### Backend
- [ ] Database indexes created
- [ ] Query optimization done
- [ ] Connection pooling enabled
- [ ] Caching implemented
- [ ] Rate limiting configured

### Database
- [ ] Indexes on frequently queried columns
- [ ] Query optimization completed
- [ ] Connection pooling configured
- [ ] Backup strategy in place

---

## Security Hardening

- [ ] Change default admin password
- [ ] Rotate JWT_SECRET
- [ ] Enable database SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Penetration testing done

---

## Documentation

- [ ] Deployment guide updated
- [ ] Environment variables documented
- [ ] Troubleshooting guide created
- [ ] Runbook for common issues
- [ ] Disaster recovery plan

---

## Sign-Off

- [ ] QA approved
- [ ] Product owner approved
- [ ] Security review passed
- [ ] Performance acceptable
- [ ] Ready for production

**Deployed by**: ________________
**Date**: ________________
**Version**: ________________

---

## Post-Deployment Monitoring (First 24 Hours)

- [ ] Monitor error rates
- [ ] Check API response times
- [ ] Verify database performance
- [ ] Monitor user activity
- [ ] Check for security issues
- [ ] Monitor resource usage
- [ ] Verify backups running
- [ ] Check logs for warnings

---

**Status**: Ready for Deployment ✅
