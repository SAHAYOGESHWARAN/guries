# Marketing Control Center - Deployment & Setup Guide

**Version**: 2.5.0  
**Last Updated**: January 17, 2026  
**Status**: Production Ready

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **PostgreSQL**: 14+ (for production)
- **SQLite3**: (for development)
- **Git**: Latest version

### Required API Keys
- **Google Gemini AI**: https://aistudio.google.com/app/apikey
- **Twilio** (Optional): https://console.twilio.com/
- **Supabase** (Production): https://supabase.com/

### Recommended Tools
- **VS Code**: Code editor
- **Postman**: API testing
- **pgAdmin**: PostgreSQL management
- **Git**: Version control

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd guires-marketing-control-center
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

Or use the convenience script:

```bash
npm run install:all
```

### Step 3: Create Environment Files

#### Backend Environment (.env)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Server Configuration
PORT=3003
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_TYPE=sqlite
DB_PATH=./mcc_db.sqlite

# For PostgreSQL (Production)
# DB_TYPE=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=mcc_db
# DB_USER=postgres
# DB_PASSWORD=your_password

# API Keys
GOOGLE_GEMINI_API_KEY=your_api_key_here
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

# Logging
LOG_LEVEL=debug
```

#### Frontend Environment (.env.local)

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# API Configuration
VITE_API_URL=http://localhost:3003/api/v1
VITE_SOCKET_URL=http://localhost:3003

# Google Gemini AI
VITE_GOOGLE_GEMINI_API_KEY=your_api_key_here

# Supabase (Optional)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_REAL_TIME_UPDATES=true
```

### Step 4: Run Setup Script

```bash
npm run setup
```

This will:
- Create necessary directories
- Initialize database
- Set up environment variables
- Create default configurations

---

## Database Setup

### SQLite (Development)

The SQLite database is automatically created in `backend/mcc_db.sqlite` when the backend starts.

### PostgreSQL (Production)

#### Step 1: Create Database

```bash
createdb mcc_db
```

#### Step 2: Run Schema

```bash
psql -U postgres -d mcc_db -f schema.sql
```

#### Step 3: Run Migrations

```bash
cd backend
node migrations/run-all-migrations.js
```

#### Step 4: Seed Data (Optional)

```bash
node migrations/seed-data.js
```

### Database Verification

```bash
# Check tables
psql -U postgres -d mcc_db -c "\dt"

# Check table structure
psql -U postgres -d mcc_db -c "\d users"

# Count records
psql -U postgres -d mcc_db -c "SELECT COUNT(*) FROM users;"
```

---

## Environment Configuration

### Development Environment

```bash
# Root directory
NODE_ENV=development
PORT=3003

# Frontend
VITE_API_URL=http://localhost:3003/api/v1
VITE_SOCKET_URL=http://localhost:3003

# Backend
DB_TYPE=sqlite
DB_PATH=./mcc_db.sqlite
```

### Production Environment

```bash
# Root directory
NODE_ENV=production
PORT=3003

# Frontend
VITE_API_URL=https://your-domain.com/api/v1
VITE_SOCKET_URL=https://your-domain.com

# Backend
DB_TYPE=postgres
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=mcc_db
DB_USER=postgres
DB_PASSWORD=secure_password
```

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development`, `production` |
| `PORT` | Server port | `3003` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:5173` |
| `DB_TYPE` | Database type | `sqlite`, `postgres` |
| `DB_PATH` | SQLite path | `./mcc_db.sqlite` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `mcc_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `GOOGLE_GEMINI_API_KEY` | Google AI API key | `your_api_key` |
| `JWT_SECRET` | JWT signing key | `your_secret_key` |
| `LOG_LEVEL` | Logging level | `debug`, `info`, `warn`, `error` |

---

## Running the Application

### Development Mode

#### Option 1: Run Both Frontend & Backend

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:3003

#### Option 2: Run Separately

```bash
# Terminal 1: Frontend
npm run dev:frontend

# Terminal 2: Backend
npm run dev:backend
```

#### Option 3: Run Specific Services

```bash
# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev
```

### Production Build

```bash
# Build frontend
npm run build:frontend

# Build backend
npm run build:backend

# Or build both
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Testing

### Run All Tests

```bash
# Database tests
node test-workflow-stage.cjs
node test-country-master.cjs
node test-user-management.cjs
node test-role-permission.cjs
node test-reward-penalty-automation.cjs

# Feature tests
node test-ai-evaluation-engine.cjs
node test-ai-task-allocation.cjs
node test-employee-scorecard.cjs
node test-employee-comparison.cjs
node test-analytics-dashboard.cjs

# Integration tests
node final-integration-test.cjs
node final-verification-test.cjs

# Verification scripts
node verify-database-consolidation.js
node verify-implementation.js
node verify-project-health.js
```

### Run Specific Test

```bash
node test-workflow-stage.cjs
```

### Test Output

Tests will display:
- ✅ Passed tests
- ❌ Failed tests
- ⚠️ Warnings
- 📊 Summary statistics

---

## Production Deployment

### Vercel Deployment

#### Step 1: Connect Repository

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

#### Step 2: Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add all required variables:
   - `GOOGLE_GEMINI_API_KEY`
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
   - `JWT_SECRET`

#### Step 3: Configure Database

1. Set up Supabase PostgreSQL
2. Update connection string in environment variables
3. Run migrations on production database

#### Step 4: Deploy

```bash
vercel --prod
```

### Docker Deployment

#### Create Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Build backend
WORKDIR /app/backend
RUN npm run build

# Expose port
EXPOSE 3003

# Start server
CMD ["npm", "start"]
```

#### Build and Run

```bash
# Build image
docker build -t mcc:latest .

# Run container
docker run -p 3003:3003 \
  -e DB_HOST=your-db-host \
  -e DB_USER=postgres \
  -e DB_PASSWORD=password \
  mcc:latest
```

### Manual Server Deployment

#### Step 1: Prepare Server

```bash
# SSH into server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install Nginx
sudo apt-get install -y nginx
```

#### Step 2: Clone and Setup

```bash
# Clone repository
git clone <repository-url>
cd guires-marketing-control-center

# Install dependencies
npm run install:all

# Setup environment
npm run setup
```

#### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/mcc`:

```nginx
upstream backend {
    server localhost:3003;
}

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/mcc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 4: Setup SSL (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Step 5: Start Application

```bash
# Build
npm run build

# Start backend
cd backend && npm start &

# Start frontend
cd ../frontend && npm run preview &
```

Or use PM2:

```bash
npm install -g pm2

# Start backend
pm2 start "npm run dev:backend" --name "mcc-backend"

# Start frontend
pm2 start "npm run dev:frontend" --name "mcc-frontend"

# Save configuration
pm2 save

# Enable startup
pm2 startup
```

---

## Troubleshooting

### Issue: Port Already in Use

```bash
# Find process using port 3003
lsof -i :3003

# Kill process
kill -9 <PID>

# Or use different port
PORT=3004 npm run dev:backend
```

### Issue: Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -d mcc_db -c "SELECT 1"

# Check environment variables
echo $DB_HOST
echo $DB_PORT
echo $DB_NAME
```

### Issue: Frontend Can't Connect to Backend

```bash
# Check backend is running
curl http://localhost:3003/health

# Check CORS configuration
# Verify FRONTEND_URL in backend .env

# Check API URL in frontend .env
echo $VITE_API_URL
```

### Issue: Missing Dependencies

```bash
# Clear node_modules
rm -rf node_modules frontend/node_modules backend/node_modules

# Reinstall
npm run install:all

# Clear npm cache
npm cache clean --force
```

### Issue: Database Migration Failed

```bash
# Check migration files
ls backend/migrations/

# Run migrations manually
cd backend
node migrations/run-all-migrations.js

# Check database state
psql -U postgres -d mcc_db -c "\dt"
```

### Issue: Build Fails

```bash
# Check TypeScript errors
cd frontend && npm run build
cd ../backend && npm run build

# Check for missing dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

### Issue: Tests Failing

```bash
# Clear test database
rm backend/mcc_db.sqlite

# Run tests
node test-workflow-stage.cjs

# Check test output for specific errors
```

---

## Health Check

### API Health Endpoint

```bash
curl http://localhost:3003/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-17T10:30:00Z",
  "database": "connected",
  "uptime": 3600
}
```

### Database Health

```bash
# Check connection
psql -U postgres -d mcc_db -c "SELECT 1"

# Check tables
psql -U postgres -d mcc_db -c "\dt"

# Check record counts
psql -U postgres -d mcc_db -c "SELECT COUNT(*) FROM users;"
```

### Frontend Health

```bash
# Check if frontend loads
curl http://localhost:5173

# Check for console errors
# Open browser DevTools (F12)
# Check Console tab for errors
```

---

## Performance Optimization

### Frontend Optimization

```bash
# Build with optimization
npm run build

# Analyze bundle size
npm install -g webpack-bundle-analyzer
```

### Backend Optimization

```bash
# Enable compression
# Already configured in server.ts

# Use connection pooling
# Configure in database config

# Enable caching
# Configure Redis/Upstash
```

### Database Optimization

```bash
# Create indexes
psql -U postgres -d mcc_db -f backend/migrations/create-indexes.sql

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users;

# Vacuum database
VACUUM ANALYZE;
```

---

## Monitoring & Logging

### Backend Logs

```bash
# View logs
tail -f backend/logs/app.log

# Filter errors
grep ERROR backend/logs/app.log

# Filter specific module
grep "Controller" backend/logs/app.log
```

### Frontend Logs

```bash
# Browser console
# Open DevTools (F12)
# Check Console tab

# Network tab
# Monitor API requests
# Check response times
```

### Database Logs

```bash
# PostgreSQL logs
tail -f /var/log/postgresql/postgresql.log

# Query logs
psql -U postgres -d mcc_db -c "SET log_statement = 'all';"
```

---

## Backup & Recovery

### Database Backup

```bash
# Backup PostgreSQL
pg_dump -U postgres mcc_db > backup.sql

# Backup with compression
pg_dump -U postgres mcc_db | gzip > backup.sql.gz

# Scheduled backup (cron)
0 2 * * * pg_dump -U postgres mcc_db | gzip > /backups/mcc_$(date +\%Y\%m\%d).sql.gz
```

### Database Restore

```bash
# Restore from backup
psql -U postgres mcc_db < backup.sql

# Restore from compressed backup
gunzip -c backup.sql.gz | psql -U postgres mcc_db
```

### Application Backup

```bash
# Backup entire application
tar -czf mcc-backup.tar.gz guires-marketing-control-center/

# Backup specific directories
tar -czf mcc-code-backup.tar.gz frontend/ backend/ api/
```

---

## Security Checklist

- ✅ Change default passwords
- ✅ Set strong JWT secret
- ✅ Enable HTTPS/SSL
- ✅ Configure firewall
- ✅ Set up rate limiting
- ✅ Enable CORS properly
- ✅ Validate all inputs
- ✅ Use environment variables for secrets
- ✅ Enable database encryption
- ✅ Set up monitoring & alerts
- ✅ Regular security updates
- ✅ Implement backup strategy

---

## Support & Resources

### Documentation
- README.md - Project overview
- COMPREHENSIVE_E2E_TEST_REPORT.md - Test results
- API_DOCUMENTATION.md - API reference

### Tools & Services
- Vercel: https://vercel.com
- Supabase: https://supabase.com
- PostgreSQL: https://www.postgresql.org
- Node.js: https://nodejs.org

### Getting Help
1. Check documentation files
2. Review error logs
3. Check GitHub issues
4. Contact development team

---

**Version**: 2.5.0  
**Last Updated**: January 17, 2026  
**Status**: Production Ready
