# Backend Deployment Guide for Vercel

## Overview
This guide explains how the backend has been configured to work properly in Vercel serverless environment.

## Changes Made

### 1. New Vercel Configuration (`vercel.json`)
- Updated to use `api/server.ts` instead of `api/index.ts`
- Added backend build configuration
- Configured proper API routing for all endpoints
- Added function timeout settings

### 2. Serverless API Entry Point (`api/server.ts`)
- Created new serverless function that imports the full backend
- Handles CORS properly for serverless environment
- Includes error handling and fallback responses
- Sets production environment variables

### 3. Backend Server Updates (`backend/server.ts`)
- Modified to detect Vercel environment
- Prevents HTTP server startup in serverless mode
- Exports Express app for serverless use

### 4. Dependencies Updated
- Added all backend dependencies to root `package.json`
- Updated TypeScript configuration
- Configured production environment variables

### 5. Environment Configuration
- Set up mock database for production deployment
- Configured CORS for all origins
- Added Vercel-specific environment variables

## API Endpoints Available

### Core Endpoints
- `/api/v1/assets` - Asset management
- `/api/v1/services` - Service management
- `/api/v1/users` - User management
- `/api/v1/campaigns` - Campaign management
- `/api/v1/projects` - Project management

### Health Checks
- `/health` - Basic health check
- `/api/health` - API health check
- `/api/v1/health` - Versioned health check

### File Uploads
- `/uploads/*` - Static file serving

## Deployment Process

1. **Build All Components**
   ```bash
   npm run build:all
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Environment Variables** (Set in Vercel Dashboard)
   - `NODE_ENV=production`
   - `VERCEL=1`
   - `DB_CLIENT=mock`
   - `USE_PG=false`

## Testing

### Local Testing
```bash
npm run dev
```

### API Testing
```bash
curl https://your-app.vercel.app/api/v1/assets
curl https://your-app.vercel.app/health
```

## Database Configuration

The deployment uses a mock database for compatibility. To use a real database:

1. Set `DB_CLIENT=pg` in environment variables
2. Configure `DATABASE_URL` with your PostgreSQL connection string
3. Update `USE_PG=true`

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript compilation
   - Verify all dependencies are installed
   - Ensure proper import paths

2. **Runtime Errors**
   - Check Vercel function logs
   - Verify environment variables
   - Ensure proper CORS configuration

3. **Database Issues**
   - Mock database should work out of the box
   - For real database, check connection string
   - Verify database schema

### Debug Steps

1. Check Vercel function logs
2. Test individual endpoints
3. Verify environment variables
4. Check build output in `api/dist`

## Performance Considerations

- Functions have 30-second timeout
- Mock database provides instant responses
- Cold starts may affect first request
- Consider edge caching for static assets

## Next Steps

1. Set up real database (PostgreSQL)
2. Configure proper authentication
3. Add monitoring and logging
4. Set up CI/CD pipeline
