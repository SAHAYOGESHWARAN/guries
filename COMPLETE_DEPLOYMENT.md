# Complete Deployment Guide - Production Ready

## Overview
This guide walks through deploying the entire application (frontend + backend) to production.

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Vercel (Frontend + API Proxy)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Frontend (React)                                    │   │
│  │  - Projects page                                     │   │
│  │  - Tasks page                                        │   │
│  │  - Other views                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Proxy (512 MB)                                  │   │
│  │  - Routes /api/* to backend                          │   │
│  │  - Handles CORS                                      │   │
│  │  - Error handling                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Railway (Backend Server)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express API                                         │   │
│  │  - /api/v1/projects                                  │   │
│  │  - /api/v1/tasks                                     │   │
│  │  - Other endpoints                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database (SQLite)                                   │   │
│  │  - Projects table (19 columns)                       │   │
│  │  - Tasks table (20 columns)                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway

### 1.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository
4. Click "Deploy"

### 1.3 Configure Backend Service
1. In Railway dashboard, click "Add Service"
2. Select "GitHub Repo"
3. Choose your repository
4. In service settings:
   - Root Directory: `backend`
   - Build Command: `npm install --legacy-peer-deps && npm run build`
   - Start Command: `npm start`

### 1.4 Set Environment Variables
In Railway dashboard, go to Variables and add:
```
NODE_ENV=production
PORT=3001
DB_CLIENT=sqlite
CORS_ORIGINS=https://your-vercel-domain.vercel.app
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

### 1.5 Deploy
1. Click "Deploy"
2. Wait for build to complete (5-10 minutes)
3. Copy the public URL from Railway dashboard
   - Format: `https://your-app-production.up.railway.app`

### 1.6 Test Backend
```bash
# Test health endpoint
curl https://your-app-production.up.railway.app/api/health

# Test projects endpoint
curl https://your-app-production.up.railway.app/api/v1/projects
```

## Step 2: Update Vercel Configuration

### 2.1 Update Backend URL
1. Edit `vercel.json` in your repository
2. Find the `env` section
3. Update `BACKEND_URL`:
```json
"env": {
  "BACKEND_URL": "https://your-app-production.up.railway.app"
}
```

### 2.2 Commit and Push
```bash
git add vercel.json
git commit -m "Update backend URL for production"
git push origin master
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select your repository
5. Vercel auto-detects configuration from `vercel.json`
6. Click "Deploy"

### 3.2 Wait for Deployment
- Build takes 2-5 minutes
- Vercel provides a URL: `https://your-app.vercel.app`

### 3.3 Verify Deployment
1. Open the Vercel URL in browser
2. Check that frontend loads
3. Check browser console for errors

## Step 4: Test Everything

### 4.1 Test Frontend
1. Open https://your-app.vercel.app
2. Navigate to Projects page
3. Verify data displays in table
4. Navigate to Tasks page
5. Verify data displays in table

### 4.2 Test API Directly
```bash
# Test through Vercel proxy
curl https://your-app.vercel.app/api/v1/projects

# Test backend directly
curl https://your-app-production.up.railway.app/api/v1/projects
```

### 4.3 Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for any errors
4. Go to Network tab
5. Verify API requests are successful (200 status)

## Step 5: Troubleshooting

### Issue: "Backend not configured"
**Solution:**
1. Go to Vercel project settings
2. Add environment variable: `BACKEND_URL=https://your-railway-backend.up.railway.app`
3. Redeploy

### Issue: "Cannot connect to backend"
**Solution:**
1. Verify backend URL is correct
2. Check Railway logs for errors
3. Verify CORS_ORIGINS includes Vercel domain
4. Test backend directly: `curl https://your-backend.up.railway.app/api/health`

### Issue: "Data not displaying"
**Solution:**
1. Check browser console (F12) for errors
2. Check Network tab for failed requests
3. Verify backend URL in vercel.json
4. Check that backend is running on Railway

### Issue: "Build fails on Vercel"
**Solution:**
1. Check Vercel build logs
2. Verify `vercel.json` is valid JSON
3. Ensure `frontend/dist` exists after build
4. Check for TypeScript errors locally: `npm run build`

### Issue: "Build fails on Railway"
**Solution:**
1. Check Railway build logs
2. Verify backend builds locally: `cd backend && npm run build`
3. Check Node.js version compatibility
4. Verify all dependencies are installed

## Environment Variables Reference

### Railway Backend
```
NODE_ENV=production
PORT=3001
DB_CLIENT=sqlite
CORS_ORIGINS=https://your-vercel-domain.vercel.app
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

### Vercel Frontend
```
BACKEND_URL=https://your-railway-backend.up.railway.app
VITE_API_URL=/api/v1
NODE_ENV=production
```

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Vercel Frontend | Hobby | Free |
| Vercel API Proxy | Hobby | Free |
| Railway Backend | Starter | $5/month |
| **Total** | | **$5/month** |

## Monitoring

### Check Backend Health
```bash
curl https://your-backend.up.railway.app/api/health
```

### View Logs
- **Railway**: Dashboard → Logs tab
- **Vercel**: Dashboard → Deployments → Logs

### Monitor Performance
- **Vercel**: Analytics tab
- **Railway**: Metrics tab

## Rollback

### If Something Goes Wrong

**Rollback Frontend:**
1. Go to Vercel dashboard
2. Click "Deployments"
3. Select previous deployment
4. Click "Redeploy"

**Rollback Backend:**
1. Go to Railway dashboard
2. Click "Deployments"
3. Select previous deployment
4. Click "Redeploy"

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Update vercel.json with backend URL
3. ✅ Deploy frontend to Vercel
4. ✅ Test all endpoints
5. ✅ Monitor logs for errors
6. ✅ Share application URL

## Support

For issues:
1. Check Railway logs: https://railway.app
2. Check Vercel logs: https://vercel.com
3. Test API directly with curl
4. Check browser DevTools Network tab
5. Verify environment variables are set correctly

---

**Status**: ✅ Ready for Production Deployment
**Estimated Time**: 20-30 minutes
**Difficulty**: Easy
