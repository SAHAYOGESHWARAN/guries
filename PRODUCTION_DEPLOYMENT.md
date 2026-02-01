# Production Deployment Guide

## Overview

This guide covers deploying the Marketing Control Center to production on Vercel with PostgreSQL database.

## Pre-Deployment Checklist

### Security
- [ ] Remove all hardcoded credentials
- [ ] Implement JWT authentication
- [ ] Add rate limiting
- [ ] Configure CORS properly
- [ ] Add security headers
- [ ] Enable HTTPS/SSL
- [ ] Set up environment variables

### Database
- [ ] Migrate to PostgreSQL
- [ ] Configure connection pooling
- [ ] Set up automated backups
- [ ] Test database recovery
- [ ] Optimize indexes
- [ ] Configure monitoring

### Code Quality
- [ ] Run full test suite
- [ ] Fix all TypeScript errors
- [ ] Enable strict mode
- [ ] Add error handling
- [ ] Implement logging
- [ ] Add monitoring/alerting

### Performance
- [ ] Optimize bundle size
- [ ] Configure caching
- [ ] Set up CDN
- [ ] Test load performance
- [ ] Monitor API response times
- [ ] Optimize database queries

## Step 1: Database Setup

### 1.1 Create PostgreSQL Database

Use one of these services:
- **Supabase** (Recommended) - Free tier available
- **Neon** - Serverless PostgreSQL
- **AWS RDS** - Managed PostgreSQL
- **Railway** - Simple deployment

#### Supabase Setup (Recommended)

```bash
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Copy connection string
# 4. Save credentials securely
```

### 1.2 Initialize Database Schema

```bash
# Set environment variables
export DATABASE_URL="postgresql://user:password@host:5432/mcc_db"

# Initialize schema
npm run db:init

# Seed initial data
npm run db:seed
```

## Step 2: Environment Configuration

### 2.1 Create Production Environment Variables

Create `.env.production` in root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/mcc_db
DB_POOL_MAX=20

# Server
NODE_ENV=production
PORT=3001

# Frontend
FRONTEND_URL=https://your-domain.com
VITE_API_URL=https://your-domain.com/api/v1

# Security
JWT_SECRET=generate_strong_random_string_32_chars_minimum
JWT_EXPIRY=7d
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=https://your-domain.com

# Logging
LOG_LEVEL=info

# Features
ENABLE_NOTIFICATIONS=true
ENABLE_EMAIL_ALERTS=true
```

### 2.2 Set Vercel Environment Variables

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add CORS_ORIGIN
# ... add all other variables
```

## Step 3: Create Serverless API Handler

Create `api/v1/[[...route]].ts`:

```typescript
import { createServer } from 'http';
import app from '../../backend/server';

export default async (req: any, res: any) => {
    // Handle API requests
    return new Promise((resolve) => {
        app(req, res);
        res.on('finish', resolve);
    });
};
```

## Step 4: Update Build Configuration

### 4.1 Update vercel.json

```json
{
    "version": 2,
    "buildCommand": "npm run build:all",
    "outputDirectory": "frontend/dist",
    "framework": "vite",
    "env": {
        "NODE_ENV": "production"
    },
    "functions": {
        "api/**/*.ts": {
            "memory": 1024,
            "maxDuration": 60
        }
    },
    "rewrites": [
        {
            "source": "/((?!api|_next/static|_next/image|favicon.ico).*)",
            "destination": "/index.html"
        }
    ],
    "headers": [
        {
            "source": "/api/(.*)",
            "headers": [
                {
                    "key": "Access-Control-Allow-Credentials",
                    "value": "true"
                },
                {
                    "key": "Access-Control-Allow-Origin",
                    "value": "$CORS_ORIGIN"
                },
                {
                    "key": "Access-Control-Allow-Methods",
                    "value": "GET,HEAD,OPTIONS,PATCH,DELETE,POST,PUT"
                },
                {
                    "key": "Access-Control-Allow-Headers",
                    "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
                }
            ]
        }
    ]
}
```

### 4.2 Update package.json Scripts

```json
{
    "scripts": {
        "build:all": "npm run build:backend && npm run build:frontend",
        "build:backend": "cd backend && npm run build",
        "build:frontend": "cd frontend && npm run build",
        "start": "node backend/dist/server.js",
        "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
        "dev:backend": "cd backend && npm run dev",
        "dev:frontend": "cd frontend && npm run dev"
    }
}
```

## Step 5: Deploy to Vercel

### 5.1 Connect Repository

```bash
# Push to GitHub
git add .
git commit -m "Production deployment setup"
git push origin main

# Connect to Vercel
vercel --prod
```

### 5.2 Verify Deployment

```bash
# Check health endpoint
curl https://your-domain.com/health

# Check API endpoint
curl https://your-domain.com/api/v1/health

# Check database connection
curl https://your-domain.com/api/v1/system/stats
```

## Step 6: Post-Deployment

### 6.1 Verify Everything Works

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Database queries work
- [ ] Authentication works
- [ ] File uploads work
- [ ] WebSockets connect (if applicable)

### 6.2 Set Up Monitoring

```bash
# Install monitoring tools
npm install sentry winston

# Configure Sentry
export SENTRY_DSN=your_sentry_dsn
```

### 6.3 Configure Backups

```bash
# Set up automated backups with Supabase
# Or use pg_dump with cron job
0 2 * * * pg_dump -U user -d mcc_db | gzip > /backups/mcc_db_$(date +\%Y\%m\%d).sql.gz
```

### 6.4 Set Up Monitoring & Alerts

- Configure error tracking (Sentry)
- Set up performance monitoring (New Relic, DataDog)
- Configure uptime monitoring
- Set up log aggregation

## Step 7: Security Hardening

### 7.1 Enable HTTPS

```bash
# Vercel automatically enables HTTPS
# Verify with:
curl -I https://your-domain.com
```

### 7.2 Configure Security Headers

Already configured in `vercel.json` and `backend/server.ts`:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

### 7.3 Set Up Rate Limiting

```typescript
// Already configured in backend/server.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use('/api/', limiter);
```

### 7.4 Enable Database SSL

```env
# Add to DATABASE_URL
?sslmode=require
```

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check connection string format
# postgresql://user:password@host:port/database
```

### Build Failures

```bash
# Check build logs
vercel logs --prod

# Rebuild
vercel --prod --force
```

### Performance Issues

```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/api/v1/health

# Monitor database queries
# Use Supabase dashboard or pg_stat_statements
```

### Memory Issues

```bash
# Increase function memory in vercel.json
"functions": {
    "api/**/*.ts": {
        "memory": 3008,
        "maxDuration": 60
    }
}
```

## Rollback Procedure

```bash
# If deployment fails, rollback to previous version
vercel rollback

# Or redeploy specific commit
vercel --prod --target=production
```

## Maintenance

### Regular Tasks

- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Review logs
- [ ] Update dependencies
- [ ] Test disaster recovery
- [ ] Verify backups

### Monthly

- [ ] Review security logs
- [ ] Update SSL certificates
- [ ] Optimize database
- [ ] Review performance metrics
- [ ] Update documentation

### Quarterly

- [ ] Security audit
- [ ] Performance review
- [ ] Capacity planning
- [ ] Disaster recovery drill

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Contact

For deployment issues or questions, contact the development team.
