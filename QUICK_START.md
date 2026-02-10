# Quick Start - 5 Minute Deployment

## Prerequisites
- GitHub account
- Railway account (railway.app)
- Vercel account (vercel.com)

## Step 1: Deploy Backend (5 min)
```
1. Go to railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository
5. Add service with:
   - Root Directory: backend
   - Build: npm install --legacy-peer-deps && npm run build
   - Start: npm start
6. Add env vars:
   - NODE_ENV=production
   - PORT=3001
   - DB_CLIENT=sqlite
   - CORS_ORIGINS=https://your-vercel-domain.vercel.app
7. Deploy
8. Copy backend URL (e.g., https://your-app-production.up.railway.app)
```

## Step 2: Update Configuration (1 min)
```bash
# Edit vercel.json
# Change BACKEND_URL to your Railway URL
git add vercel.json
git commit -m "Update backend URL"
git push origin master
```

## Step 3: Deploy Frontend (5 min)
```
1. Go to vercel.com
2. Click "Import Project"
3. Select your repository
4. Vercel auto-detects config
5. Click "Deploy"
6. Wait for build
7. Get Vercel URL (e.g., https://your-app.vercel.app)
```

## Step 4: Test (2 min)
```bash
# Test backend
curl https://your-backend.up.railway.app/api/health

# Test frontend
curl https://your-app.vercel.app/api/v1/projects

# Open in browser
https://your-app.vercel.app
```

## URLs
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app-production.up.railway.app
- **API**: https://your-app.vercel.app/api/v1/...

## Environment Variables

### Railway
```
NODE_ENV=production
PORT=3001
DB_CLIENT=sqlite
CORS_ORIGINS=https://your-vercel-domain.vercel.app
```

### Vercel
```
BACKEND_URL=https://your-app-production.up.railway.app
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend not configured | Add BACKEND_URL to Vercel env vars |
| Cannot connect to backend | Check Railway logs, verify CORS_ORIGINS |
| Data not displaying | Check browser console (F12), Network tab |
| Build fails | Check build logs, verify dependencies |

## Cost
- Vercel: Free
- Railway: $5/month
- **Total: $5/month**

## Done!
Your application is now live at https://your-app.vercel.app
