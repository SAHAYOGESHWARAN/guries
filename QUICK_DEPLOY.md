# Quick Deployment Guide

## 🚀 Fast Track to Production

### Step 1: Verify Everything Locally (5 minutes)

```bash
# Build the project
npm run build:all

# Verify database connection
npx ts-node backend/verify-db-connection.ts

# Expected output: ✅ All checks passed!
```

### Step 2: Generate JWT Secret (1 minute)

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output - you'll need it for Vercel
```

### Step 3: Set Up Vercel (5 minutes)

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Set environment variables
vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_NAME
vercel env add NODE_ENV production
vercel env add FRONTEND_URL https://your-domain.com
vercel env add CORS_ORIGIN https://your-domain.com
vercel env add JWT_SECRET <paste-generated-secret>
vercel env add JWT_EXPIRY 7d
vercel env add VITE_API_URL /api/v1
```

### Step 4: Deploy (2 minutes)

```bash
# Deploy to production
vercel --prod

# Or push to GitHub and Vercel will auto-deploy
git add .
git commit -m "Deploy to production"
git push origin main
```

### Step 5: Verify Deployment (2 minutes)

```bash
# Check health endpoint
curl https://your-domain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-02-01T12:00:00.000Z"}

# View logs
vercel logs --prod
```

---

## 📋 Environment Variables Quick Reference

### Required Variables
```
DB_HOST=your-db-host.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=postgres
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
JWT_SECRET=<generated-secret>
JWT_EXPIRY=7d
VITE_API_URL=/api/v1
```

### Optional Variables
```
VITE_GEMINI_API_KEY=your_gemini_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🔧 Troubleshooting Quick Fixes

### Build Fails
```bash
# Clear cache and rebuild
rm -rf frontend/dist backend/dist
npm run build:all
```

### Database Connection Error
```bash
# Verify connection locally
npx ts-node backend/verify-db-connection.ts

# Check environment variables
echo $DB_HOST
echo $DB_PORT
echo $DB_USER
echo $DB_NAME
```

### CORS Errors
```bash
# Verify CORS_ORIGIN is set correctly
vercel env list

# Should show your domain with https://
# Example: https://myapp.com (NOT http://)
```

### API Not Responding
```bash
# Check Vercel logs
vercel logs --prod

# Look for database connection errors
# Check if all environment variables are set
vercel env list
```

---

## ✅ Deployment Checklist (Quick Version)

- [ ] `npm run build:all` succeeds
- [ ] `npx ts-node backend/verify-db-connection.ts` passes
- [ ] JWT_SECRET generated
- [ ] All environment variables set in Vercel
- [ ] Code pushed to GitHub
- [ ] Deployment shows "Ready" in Vercel
- [ ] Health endpoint responds: `curl https://your-domain.com/api/health`
- [ ] Frontend loads without errors
- [ ] Can login and use the app

---

## 🎯 Common Deployment Scenarios

### Scenario 1: First Time Deployment
1. Create PostgreSQL database (Supabase)
2. Generate JWT_SECRET
3. Set all environment variables in Vercel
4. Push code to GitHub
5. Vercel auto-deploys
6. Verify with health check

### Scenario 2: Update Existing Deployment
1. Make code changes
2. Test locally: `npm run build:all`
3. Commit and push to GitHub
4. Vercel auto-deploys
5. Verify deployment

### Scenario 3: Fix Database Connection
1. Verify database is running
2. Check credentials in Vercel env vars
3. Run: `npx ts-node backend/verify-db-connection.ts`
4. Fix any issues
5. Redeploy: `vercel --prod`

### Scenario 4: Update Environment Variables
```bash
# Update a variable
vercel env add JWT_SECRET new_secret_value

# Remove a variable
vercel env remove OLD_VAR

# View all variables
vercel env list

# Redeploy with new variables
vercel --prod
```

---

## 📊 Monitoring After Deployment

### View Logs
```bash
# Real-time logs
vercel logs --prod --follow

# Last 100 lines
vercel logs --prod
```

### Check Status
```bash
# Deployment status
vercel status

# Project info
vercel projects list
```

### Rollback if Needed
```bash
# List deployments
vercel deployments

# Redeploy previous version
vercel rollback
```

---

## 🔐 Security Reminders

✅ DO:
- Use strong JWT_SECRET (32+ characters)
- Use strong database password
- Set CORS_ORIGIN to your domain only
- Use HTTPS (Vercel provides this)
- Keep .env files out of Git
- Rotate secrets periodically

❌ DON'T:
- Commit .env files
- Use weak passwords
- Hardcode secrets in code
- Use HTTP in production
- Share JWT_SECRET
- Use same secret for multiple environments

---

## 📞 Need Help?

1. **Check Vercel Logs**: `vercel logs --prod`
2. **Verify Database**: `npx ts-node backend/verify-db-connection.ts`
3. **Test Health Endpoint**: `curl https://your-domain.com/api/health`
4. **Review Deployment Guide**: See `DEPLOYMENT_ENV_SETUP.md`
5. **Check Checklist**: See `DEPLOYMENT_CHECKLIST.md`

---

## 🎉 Success!

Once deployment is complete:
- ✅ Frontend is live at your domain
- ✅ API is responding
- ✅ Database is connected
- ✅ Users can access the application

**Congratulations! Your application is now in production! 🚀**

