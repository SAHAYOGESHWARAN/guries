# Vercel Deployment Guide
## Guires Marketing Control Center v2.5.0

---

## Prerequisites

- Vercel account (https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 20.x installed locally

---

## Local Setup

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
cd frontend && npm install --legacy-peer-deps && cd ..
cd backend && npm install --legacy-peer-deps && cd ..
```

### 2. Build Locally
```bash
npm run build:frontend
cd backend && npm run build && cd ..
```

### 3. Test Locally
```bash
npm run dev
```

---

## Vercel Deployment

### Option 1: Deploy via Vercel CLI

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy Frontend
```bash
cd frontend
vercel --prod
```

#### 4. Deploy Backend
```bash
cd backend
vercel --prod
```

### Option 2: Deploy via GitHub Integration

#### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

#### 2. Connect to Vercel
- Go to https://vercel.com/new
- Select your GitHub repository
- Configure build settings:
  - **Framework**: Vite
  - **Build Command**: `npm run build:frontend`
  - **Output Directory**: `frontend/dist`
  - **Install Command**: `npm install --legacy-peer-deps && cd frontend && npm install --legacy-peer-deps && cd ..`

#### 3. Add Environment Variables
In Vercel dashboard, add:
```
NODE_ENV=production
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<hashed_password>
JWT_SECRET=<your_secret_key>
JWT_EXPIRES_IN=7d
DB_CLIENT=sqlite
USE_PG=false
```

---

## Configuration Files

### Root vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run build:frontend",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm install --legacy-peer-deps && cd frontend && npm install --legacy-peer-deps && cd ..",
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Backend vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb",
        "runtime": "nodejs20.x"
      }
    }
  ]
}
```

### package.json Engines
```json
{
  "engines": {
    "node": "20.x"
  }
}
```

---

## Environment Variables

### Required Variables
```
NODE_ENV=production
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<hashed_password>
JWT_SECRET=<your_secret_key>
JWT_EXPIRES_IN=7d
DB_CLIENT=sqlite
USE_PG=false
CORS_ORIGIN=<your_domain>
```

### Optional Variables
```
PORT=3000
API_PORT=3000
SOCKET_CORS_ORIGINS=<your_domain>
```

---

## Build Optimization

### 1. .vercelignore
```
node_modules
.git
.env.local
.env.development
backend/
frontend/node_modules
*.test.ts
*.test.tsx
```

### 2. .nvmrc
```
20.11.0
```

### 3. Build Command
```bash
npm run build:frontend
```

### 4. Install Command
```bash
npm install --legacy-peer-deps && cd frontend && npm install --legacy-peer-deps && cd ..
```

---

## Troubleshooting

### Build Fails with Node Version Warning
**Solution**: Use specific version in package.json
```json
"engines": {
  "node": "20.x"
}
```

### Dependencies Installation Fails
**Solution**: Use `--legacy-peer-deps` flag
```bash
npm install --legacy-peer-deps
```

### Build Cache Issues
**Solution**: Clear cache in Vercel dashboard
- Go to Project Settings → Git
- Click "Clear Build Cache"
- Redeploy

### Memory Issues During Build
**Solution**: Increase Lambda size in vercel.json
```json
"config": {
  "maxLambdaSize": "50mb"
}
```

### Database Connection Issues
**Solution**: Ensure SQLite is properly configured
- Check `DB_CLIENT=sqlite` in environment
- Verify database file path
- Check file permissions

---

## Post-Deployment

### 1. Verify Deployment
```bash
curl https://your-domain.vercel.app/api/v1/health
```

### 2. Check Logs
- Vercel Dashboard → Deployments → View Logs
- Check for errors and warnings

### 3. Monitor Performance
- Vercel Dashboard → Analytics
- Monitor response times and errors

### 4. Set Up Monitoring
- Configure error tracking
- Set up performance monitoring
- Enable real-time alerts

---

## Production Checklist

- ✅ Node version set to 20.x
- ✅ Environment variables configured
- ✅ Build command optimized
- ✅ Install command uses --legacy-peer-deps
- ✅ .vercelignore configured
- ✅ .nvmrc file present
- ✅ vercel.json configured
- ✅ Database properly initialized
- ✅ CORS configured
- ✅ Security headers enabled
- ✅ Error handling implemented
- ✅ Logging configured

---

## Rollback

### If Deployment Fails
1. Go to Vercel Dashboard
2. Select previous deployment
3. Click "Promote to Production"

### If Issues Occur
1. Check deployment logs
2. Review recent changes
3. Rollback to previous version
4. Fix issues locally
5. Redeploy

---

## Performance Tips

1. **Enable Caching**
   - Set cache headers in vercel.json
   - Use CDN for static assets

2. **Optimize Build**
   - Remove unused dependencies
   - Use tree-shaking
   - Minimize bundle size

3. **Database Optimization**
   - Use indexes
   - Optimize queries
   - Cache frequently accessed data

4. **API Optimization**
   - Implement pagination
   - Use compression
   - Cache responses

---

## Security

1. **Environment Variables**
   - Never commit secrets
   - Use Vercel's environment variable management
   - Rotate secrets regularly

2. **CORS Configuration**
   - Restrict to specific domains
   - Use HTTPS only
   - Validate origins

3. **Authentication**
   - Use strong JWT secrets
   - Implement rate limiting
   - Validate all inputs

4. **Database**
   - Use parameterized queries
   - Implement access control
   - Regular backups

---

## Support

- Vercel Docs: https://vercel.com/docs
- GitHub Issues: Report deployment issues
- Vercel Support: https://vercel.com/support

---

**Version**: 2.5.0  
**Last Updated**: February 6, 2026  
**Status**: Ready for Production
