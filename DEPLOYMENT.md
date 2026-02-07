# Deployment Guide - Guires Marketing Control Center

## Overview
This guide provides step-by-step instructions for deploying the application to Vercel with PostgreSQL (Supabase).

## Prerequisites
- GitHub account with repository access
- Vercel account (vercel.com)
- Supabase account (supabase.com) for PostgreSQL database
- Node.js 20.x installed locally

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
cd backend && npm install --legacy-peer-deps && cd ..
cd frontend && npm install --legacy-peer-deps && cd ..
```

### 2. Environment Configuration

**Backend (.env)**
```
NODE_ENV=development
PORT=3001
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$2a$10$KL271sXgLncfLQGyT7q/cOz.vYl1CiIy7tsaGWEgDe.b1cbosXMxq
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
DB_CLIENT=sqlite
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

**Frontend (.env.local)**
```
VITE_API_URL=http://localhost:3001/api/v1
VITE_ENVIRONMENT=development
```

### 3. Run Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access at: http://localhost:5173

## Production Deployment (Vercel)

### Step 1: Prepare Supabase Database

1. Create Supabase project at https://supabase.com
2. Get connection details:
   - Database URL
   - Host
   - Port (5432)
   - User
   - Password
   - Database name

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 3: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select root directory (default)
5. Click "Deploy"

### Step 4: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

**Required Variables:**
```
NODE_ENV=production
VITE_API_URL=/api/v1
LOG_LEVEL=info
```

**Database Variables:**
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

**Authentication Variables:**
```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$2a$10$KL271sXgLncfLQGyT7q/cOz.vYl1CiIy7tsaGWEgDe.b1cbosXMxq
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
```

**CORS Variables:**
```
CORS_ORIGIN=https://your-vercel-domain.vercel.app
CORS_ORIGINS=https://your-vercel-domain.vercel.app
SOCKET_CORS_ORIGINS=https://your-vercel-domain.vercel.app
```

**URLs:**
```
FRONTEND_URL=https://your-vercel-domain.vercel.app
BACKEND_URL=https://your-vercel-domain.vercel.app
```

### Step 5: Deploy

1. Vercel will automatically build and deploy
2. Monitor build logs in Vercel Dashboard
3. Once deployed, access your app at the provided URL

## Build Process

The deployment uses these commands:

```bash
# Install dependencies
npm install --legacy-peer-deps
cd backend && npm install --legacy-peer-deps && cd ..
cd frontend && npm install --legacy-peer-deps && cd ..

# Build backend
cd backend && npm run build && cd ..

# Build frontend
cd frontend && npm run build && cd ..
```

## Troubleshooting

### Build Fails
- Check Node.js version: `node --version` (should be 20.x)
- Clear cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules backend/node_modules frontend/node_modules`
- Reinstall: `npm install:all`

### Database Connection Issues
- Verify DATABASE_URL format
- Check Supabase firewall settings
- Ensure database user has proper permissions
- Test connection locally first

### API Not Responding
- Check `/api/health` endpoint
- Verify CORS settings match your domain
- Check Vercel function logs
- Ensure backend build succeeded

### Frontend Not Loading
- Check `VITE_API_URL` environment variable
- Verify frontend build output in `frontend/dist`
- Check browser console for errors
- Verify static file serving in vercel.json

## Monitoring

### Health Checks
```bash
# API health
curl https://your-domain.vercel.app/api/health

# Frontend health
curl https://your-domain.vercel.app/
```

### Logs
- Vercel Dashboard → Deployments → Function Logs
- Check real-time logs for errors

## Rollback

To rollback to previous deployment:
1. Go to Vercel Dashboard
2. Select project
3. Go to Deployments
4. Click three dots on previous deployment
5. Select "Promote to Production"

## Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Change ADMIN_PASSWORD hash
- [ ] Use HTTPS only (Vercel default)
- [ ] Enable CORS only for your domain
- [ ] Rotate database credentials regularly
- [ ] Enable Supabase SSL enforcement
- [ ] Set up monitoring and alerts
- [ ] Regular backups enabled

## Performance Optimization

- Frontend: Vite builds optimized bundles
- Backend: Node.js 20.x with native modules
- Database: PostgreSQL with connection pooling
- Caching: Static assets cached for 1 year
- CDN: Vercel Edge Network

## Support

For issues:
1. Check Vercel logs
2. Review this guide
3. Check GitHub issues
4. Contact support team
