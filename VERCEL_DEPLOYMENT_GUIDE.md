# Complete Vercel Deployment Guide (Hobby Plan)

## Overview
This guide walks through deploying the application on Vercel's free Hobby plan by separating the frontend and backend.

## Architecture
- **Frontend**: Deployed on Vercel (static + lightweight proxy)
- **Backend**: Deployed on Railway/Render (separate server)
- **Database**: PostgreSQL or SQLite (on backend server)

## Step 1: Deploy Backend to Railway (Recommended)

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### 1.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository
4. Select the root directory (not a subdirectory)

### 1.3 Configure Backend
1. In Railway dashboard, click "Add Service"
2. Select "GitHub Repo"
3. Choose your repository
4. In the service settings:
   - Set "Root Directory" to `backend`
   - Set "Build Command": `npm install --legacy-peer-deps && npm run build`
   - Set "Start Command": `npm start`

### 1.4 Set Environment Variables
In Railway dashboard, go to Variables:
```
NODE_ENV=production
PORT=3001
DATABASE_URL=your_database_connection_string
CORS_ORIGINS=https://your-vercel-domain.vercel.app
```

### 1.5 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Copy the public URL (e.g., `https://your-app-production.up.railway.app`)

## Step 2: Deploy Frontend to Vercel

### 2.1 Update Backend URL
In `vercel.json`, update the environment variable:
```json
"env": {
  "BACKEND_URL": "https://your-app-production.up.railway.app"
}
```

### 2.2 Push to GitHub
```bash
git add vercel.json
git commit -m "Update backend URL for production"
git push origin master
```

### 2.3 Connect to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select your repository
5. Vercel auto-detects the configuration from `vercel.json`
6. Click "Deploy"

### 2.4 Verify Deployment
1. Wait for build to complete
2. Vercel provides a URL (e.g., `https://your-app.vercel.app`)
3. Open the URL in browser
4. Check that Projects and Tasks pages load with data

## Step 3: Verify Everything Works

### 3.1 Test Frontend
1. Open https://your-app.vercel.app
2. Navigate to Projects page
3. Verify data displays in table
4. Navigate to Tasks page
5. Verify data displays in table

### 3.2 Test API Directly
```bash
# Test backend health
curl https://your-app-production.up.railway.app/api/health

# Test projects endpoint
curl https://your-app-production.up.railway.app/api/v1/projects

# Test through Vercel proxy
curl https://your-app.vercel.app/api/v1/projects
```

### 3.3 Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for any errors
4. Go to Network tab
5. Verify API requests are successful (200 status)

## Troubleshooting

### Issue: "Cannot reach backend"
**Solution**: 
1. Verify backend URL in `vercel.json`
2. Check backend is running on Railway
3. Verify CORS_ORIGINS includes Vercel domain
4. Check network tab in browser for failed requests

### Issue: "Data not displaying"
**Solution**:
1. Check browser console for errors
2. Verify API endpoint returns data
3. Check database connection on backend
4. Verify frontend is making requests to `/api/v1/...`

### Issue: "Build fails on Vercel"
**Solution**:
1. Check build logs in Vercel dashboard
2. Verify `vercel.json` is valid JSON
3. Ensure `frontend/dist` exists after build
4. Check for TypeScript errors: `npm run build` locally

### Issue: "Build fails on Railway"
**Solution**:
1. Check build logs in Railway dashboard
2. Verify backend builds locally: `cd backend && npm run build`
3. Check Node.js version compatibility
4. Verify all dependencies are installed

## Environment Variables Reference

### Railway Backend
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ORIGINS=https://your-vercel-domain.vercel.app
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

## Alternative Backend Hosting

### Option 1: Render (Free Tier)
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub
4. Set build command: `npm install --legacy-peer-deps && npm run build`
5. Set start command: `npm start`
6. Deploy
7. **Cost**: Free (with limitations)

### Option 2: Heroku (Paid)
1. Go to https://heroku.com
2. Create new app
3. Connect GitHub
4. Deploy
5. **Cost**: $7/month minimum

### Option 3: Self-Hosted (VPS)
1. Rent VPS from DigitalOcean, Linode, etc.
2. Install Node.js and PostgreSQL
3. Clone repository
4. Run `npm install && npm run build && npm start`
5. **Cost**: $5-20/month depending on provider

## Monitoring

### Check Backend Health
```bash
curl https://your-railway-backend.up.railway.app/api/health
```

### Check Frontend Health
```bash
curl https://your-vercel-app.vercel.app/
```

### View Logs
- **Railway**: Dashboard → Logs tab
- **Vercel**: Dashboard → Deployments → Logs

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Update `vercel.json` with backend URL
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
