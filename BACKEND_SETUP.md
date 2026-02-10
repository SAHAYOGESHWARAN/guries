# Backend Setup & Deployment Guide

## Local Development

### 1. Install Dependencies
```bash
cd backend
npm install --legacy-peer-deps
```

### 2. Build Backend
```bash
npm run build
```

### 3. Start Backend
```bash
npm start
```

Backend will start on port 3003 (or 3001 if configured).

### 4. Test Backend
```bash
# Health check
curl http://localhost:3003/api/health

# Get projects
curl http://localhost:3003/api/v1/projects

# Get tasks
curl http://localhost:3003/api/v1/tasks
```

## Production Deployment (Railway)

### 1. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Select your repository

### 3. Configure Backend Service
- Set "Root Directory" to `backend`
- Build Command: `npm install --legacy-peer-deps && npm run build`
- Start Command: `npm start`

### 4. Set Environment Variables
In Railway dashboard, add:
```
NODE_ENV=production
PORT=3001
DB_CLIENT=sqlite
CORS_ORIGINS=https://your-vercel-domain.vercel.app
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

### 5. Deploy
- Click "Deploy"
- Wait for build to complete
- Copy the public URL (e.g., `https://your-app-production.up.railway.app`)

### 6. Update Vercel
- Go to Vercel project settings
- Add environment variable: `BACKEND_URL=https://your-app-production.up.railway.app`
- Redeploy frontend

## Database Configuration

### SQLite (Default - No Setup Required)
- Uses local SQLite database
- Data stored in `backend/data.db`
- Perfect for development and small deployments

### PostgreSQL (Optional)
If you want to use PostgreSQL:

1. Set environment variables:
```
DB_CLIENT=postgres
DB_HOST=your-host
DB_PORT=5432
DB_NAME=your-db
DB_USER=your-user
DB_PASSWORD=your-password
```

2. Backend will automatically create tables on startup

## API Endpoints

### Health Check
```
GET /api/health
GET /api/v1/health
```

### Projects
```
GET /api/v1/projects
POST /api/v1/projects
GET /api/v1/projects/:id
PUT /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

### Tasks
```
GET /api/v1/tasks
POST /api/v1/tasks
GET /api/v1/tasks/:id
PUT /api/v1/tasks/:id
DELETE /api/v1/tasks/:id
```

## Troubleshooting

### Port Already in Use
Backend will automatically try the next port (3004, 3005, etc.)

### Database Connection Failed
- Check DB_CLIENT is set correctly
- For SQLite: ensure write permissions in backend directory
- For PostgreSQL: verify connection string

### CORS Errors
- Update CORS_ORIGINS to include your frontend URL
- Format: `https://your-domain.com,http://localhost:5173`

### Build Fails
```bash
# Clean and rebuild
rm -rf backend/dist
npm run build
```

## Monitoring

### Check Backend Health
```bash
curl https://your-backend.up.railway.app/api/health
```

### View Logs
- Railway: Dashboard → Logs tab
- Local: Check console output

## Cost

- Railway Starter Plan: $5/month
- SQLite Database: Free (included)
- Total: $5/month

## Next Steps

1. Deploy backend to Railway
2. Get backend URL
3. Update Vercel environment variables
4. Redeploy frontend
5. Test all endpoints
