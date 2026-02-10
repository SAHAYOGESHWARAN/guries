# Vercel Hobby Plan Deployment Strategy

## Problem
Vercel Hobby plan has 2048 MB memory limit per serverless function. The previous approach tried to bundle the entire Express backend, which exceeded this limit.

## Solution
Use a lightweight API proxy that routes requests to an external backend server.

## Architecture

### Frontend (Vercel)
- Deployed on Vercel
- Runs on Vercel's CDN
- Makes API calls to `/api/*`

### API Proxy (Vercel Serverless)
- Lightweight function (512 MB)
- Routes requests to backend
- Handles CORS
- No backend code bundled

### Backend (External)
- Runs on separate server (Railway, Render, Heroku, etc.)
- Handles all business logic
- Manages database
- Processes API requests

## Deployment Steps

### 1. Deploy Backend First
Choose one of these options:

**Option A: Railway (Recommended)**
- Go to railway.app
- Connect GitHub repository
- Select backend folder
- Set environment variables
- Deploy
- Copy backend URL

**Option B: Render**
- Go to render.com
- Create new Web Service
- Connect GitHub
- Set build command: `npm install && npm run build`
- Set start command: `npm start`
- Copy backend URL

**Option C: Heroku**
- Go to heroku.com
- Create new app
- Connect GitHub
- Deploy
- Copy backend URL

### 2. Update Vercel Configuration
In `vercel.json`, update:
```json
"env": {
  "BACKEND_URL": "https://your-backend-url.com"
}
```

Replace `https://your-backend-url.com` with your actual backend URL.

### 3. Deploy Frontend to Vercel
- Push changes to GitHub
- Vercel automatically deploys
- Frontend is now live

## Environment Variables

### Backend Server
```
NODE_ENV=production
DATABASE_URL=your_database_url
PORT=3001
```

### Vercel
```
BACKEND_URL=https://your-backend-url.com
VITE_API_URL=/api/v1
NODE_ENV=production
```

## How It Works

1. User opens frontend on Vercel
2. Frontend makes request to `/api/v1/projects`
3. Vercel routes to `api/backend-proxy.ts`
4. Proxy function makes HTTP request to backend
5. Backend processes request and returns data
6. Proxy returns data to frontend
7. Frontend displays data

## Memory Usage

- **Frontend**: ~50 MB (static files)
- **API Proxy**: ~100 MB (lightweight function)
- **Total**: ~150 MB (well under 2048 MB limit)

## Cost

- **Vercel Frontend**: Free (Hobby plan)
- **Vercel API Proxy**: Free (included in Hobby plan)
- **Backend Server**: Varies by provider
  - Railway: $5/month
  - Render: Free tier available
  - Heroku: Paid plans start at $7/month

## Next Steps

1. Choose backend hosting provider
2. Deploy backend
3. Get backend URL
4. Update `vercel.json` with backend URL
5. Push to GitHub
6. Vercel deploys automatically
7. Test API endpoints
8. Verify data displays in frontend
