# Vercel Deployment Guide

## Fixed Configuration
The project has been configured to prevent 404 errors on Vercel deployment:

### Key Changes Made:
1. **Updated `vercel.json`**: Fixed routing configuration using `routes` instead of `rewrites`
2. **Updated Node.js version**: Changed from 24.x to 18.x to match your current installation
3. **Proper static asset handling**: Added specific routes for CSS, JS, and image files

### Vercel Configuration (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/dist/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/frontend/(.*)",
      "dest": "/frontend/$1"
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "dest": "/frontend/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/index.html"
    }
  ]
}
```

## Deployment Steps:

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Set Environment Variables in Vercel Dashboard
Go to your Vercel project dashboard and add these environment variables:
- `VITE_API_URL`: `/api/v1` (already set in .env.production)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

### 4. Deploy to Vercel
```bash
vercel --prod
```

## What the Fixed Configuration Does:

1. **API Routes**: `/api/*` routes are handled by serverless functions
2. **Static Assets**: CSS, JS, images, and fonts are served directly from the frontend build
3. **SPA Fallback**: All other routes fallback to `index.html` for React Router
4. **Build Process**: Automatically builds frontend and API before deployment

## Troubleshooting:

### If you still get 404 errors:
1. Check that the build completed successfully
2. Verify environment variables are set in Vercel dashboard
3. Check Vercel function logs for API errors

### Common Issues:
- **Missing environment variables**: Ensure all required env vars are set in Vercel dashboard
- **Build failures**: Check that Node.js 18.x is specified in package.json engines
- **API routes not working**: Verify API build output in `api/dist/` folder

## Local Testing:
To test the build locally:
```bash
npm run build:all
```

This will build the frontend, API, and backend to ensure everything works before deployment.
