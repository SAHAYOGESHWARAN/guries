# Fix: Backend URL Not Configured

## Problem
The API proxy is returning HTML instead of JSON because `BACKEND_URL` environment variable is not set in Vercel.

## Solution

### Step 1: Deploy Backend to Railway First
If you haven't already:
1. Go to https://railway.app
2. Create new project
3. Connect GitHub
4. Configure backend service
5. Deploy
6. **Copy the backend URL** (e.g., `https://your-app-production.up.railway.app`)

### Step 2: Add Backend URL to Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com
2. Select your project
3. Go to Settings → Environment Variables
4. Add new variable:
   - Name: `BACKEND_URL`
   - Value: `https://your-app-production.up.railway.app` (your Railway URL)
5. Click "Save"
6. Go to Deployments
7. Click "Redeploy" on latest deployment

**Option B: Via vercel.json (Recommended)**
1. Edit `vercel.json` in your repository
2. Update the `env` section:
```json
"env": {
  "BACKEND_URL": "https://your-app-production.up.railway.app",
  "VITE_API_URL": "/api/v1",
  "NODE_ENV": "production"
}
```
3. Commit and push:
```bash
git add vercel.json
git commit -m "Update backend URL"
git push origin master
```
4. Vercel will automatically redeploy

### Step 3: Test

**Test Backend Health**
```bash
curl https://your-app-production.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T14:00:00.000Z"
}
```

**Test Through Vercel Proxy**
```bash
curl https://your-app.vercel.app/api/v1/projects
```

Expected response:
```json
{
  "success": true,
  "data": [],
  "message": "Projects retrieved successfully"
}
```

**Test in Browser**
1. Open https://your-app.vercel.app
2. Open DevTools (F12)
3. Go to Console tab
4. Check for errors
5. Go to Network tab
6. Verify API requests are successful (200 status)

## Troubleshooting

### Still Getting HTML Response
1. Verify `BACKEND_URL` is set in Vercel
2. Check that Railway backend is running
3. Verify Railway URL is correct
4. Check Railway logs for errors

### Backend URL Format
- ✅ Correct: `https://your-app-production.up.railway.app`
- ❌ Wrong: `http://localhost:3001`
- ❌ Wrong: `your-app-production.up.railway.app` (missing https://)

### CORS Errors
If you see CORS errors:
1. Go to Railway dashboard
2. Add environment variable: `CORS_ORIGINS=https://your-vercel-domain.vercel.app`
3. Redeploy backend

## Verify Configuration

### Check Vercel Environment Variables
1. Go to https://vercel.com
2. Select your project
3. Settings → Environment Variables
4. Verify `BACKEND_URL` is set

### Check Railway Environment Variables
1. Go to https://railway.app
2. Select your project
3. Variables tab
4. Verify `CORS_ORIGINS` includes your Vercel domain

## After Fixing

1. ✅ Vercel will redeploy automatically
2. ✅ Wait 2-3 minutes for deployment
3. ✅ Refresh browser
4. ✅ Check console for errors
5. ✅ Verify data displays

## Quick Reference

| Item | Value |
|------|-------|
| Frontend URL | https://your-app.vercel.app |
| Backend URL | https://your-app-production.up.railway.app |
| API Endpoint | https://your-app.vercel.app/api/v1/projects |
| Health Check | https://your-app-production.up.railway.app/api/health |

---

**Status**: Follow these steps to fix the backend URL configuration
