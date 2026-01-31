# Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Marketing Control Center application to production.

## Prerequisites
- Node.js v16+ installed
- npm or yarn package manager
- SQLite3 support (built-in with better-sqlite3)
- 2GB+ disk space for database and uploads

## Deployment Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd guires-marketing-control-center
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Initialize Production Database

**On Linux/Mac:**
```bash
cd backend
chmod +x deploy-setup.sh
./deploy-setup.sh
```

**On Windows:**
```bash
cd backend
deploy-setup.bat
```

**Or manually:**
```bash
cd backend
node init-production-db.js
```

### 4. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `.env` with production values:
```
NODE_ENV=production
PORT=3003
DB_PATH=./mcc_db.sqlite
API_URL=https://your-domain.com/api
FRONTEND_URL=https://your-domain.com
```

**Frontend (.env.production):**
```bash
cd ../frontend
cp .env.production .env.production
```

Edit `.env.production`:
```
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=Marketing Control Center
```

### 5. Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/dist/`.

### 6. Start Backend Server

```bash
cd backend
npm run dev
# or for production
npm start
```

The backend will start on `http://localhost:3003`

### 7. Serve Frontend

**Option A: Using Vite Preview**
```bash
cd frontend
npm run preview
```

**Option B: Using a Web Server (Nginx/Apache)**
Copy `frontend/dist/` contents to your web server's public directory.

**Option C: Using Node.js Server**
```bash
npm install -g serve
serve -s dist -l 5174
```

### 8. Verify Deployment

Test the following endpoints:

```bash
# Health check
curl http://localhost:3003/api/v1/health

# Get services
curl http://localhost:3003/api/v1/services

# Get assets
curl http://localhost:3003/api/v1/assetLibrary

# Get keywords
curl http://localhost:3003/api/v1/keywords
```

## Database Management

### Backup Database
```bash
cp backend/mcc_db.sqlite backend/mcc_db.sqlite.backup.$(date +%Y%m%d_%H%M%S)
```

### Restore Database
```bash
cp backend/mcc_db.sqlite.backup.YYYYMMDD_HHMMSS backend/mcc_db.sqlite
```

### Reset Database
```bash
cd backend
rm mcc_db.sqlite
node init-production-db.js
node populate-db.js
```

## Docker Deployment (Optional)

### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install && npm run build

# Copy source
COPY backend ./backend
COPY frontend ./frontend

# Initialize database
RUN cd backend && node init-production-db.js

EXPOSE 3003 5174

CMD ["sh", "-c", "cd backend && npm start"]
```

### Build and Run
```bash
docker build -t mcc-app .
docker run -p 3003:3003 -p 5174:5174 -v $(pwd)/backend/mcc_db.sqlite:/app/backend/mcc_db.sqlite mcc-app
```

## Nginx Configuration

```nginx
upstream backend {
    server localhost:3003;
}

upstream frontend {
    server localhost:5174;
}

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /uploads/ {
        alias /app/backend/public/uploads/;
        expires 30d;
    }
}
```

## Troubleshooting

### Database Not Found
```bash
cd backend
node init-production-db.js
```

### Port Already in Use
```bash
# Find process using port 3003
lsof -i :3003
# Kill process
kill -9 <PID>
```

### API Not Responding
1. Check backend is running: `curl http://localhost:3003/api/v1/health`
2. Check logs: `tail -f backend/logs/error.log`
3. Verify database: `ls -lh backend/mcc_db.sqlite`

### Frontend Not Loading
1. Check frontend build: `ls -la frontend/dist/`
2. Verify API URL in `.env.production`
3. Check browser console for errors

## Performance Optimization

### Enable Compression
```bash
npm install compression
```

### Database Optimization
```bash
cd backend
node -e "const db = require('better-sqlite3')('./mcc_db.sqlite'); db.exec('VACUUM; ANALYZE;'); db.close();"
```

### Frontend Optimization
- Minification: Enabled by default in production build
- Code splitting: Configured in vite.config.ts
- Image optimization: Use WebP format where possible

## Security Checklist

- [ ] Change default admin password
- [ ] Enable HTTPS/SSL
- [ ] Set secure environment variables
- [ ] Configure CORS properly
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up automated backups
- [ ] Review and update dependencies

## Monitoring

### Log Files
```bash
# Backend logs
tail -f backend/logs/error.log
tail -f backend/logs/access.log

# System logs
journalctl -u mcc-app -f
```

### Database Health
```bash
cd backend
node -e "
const db = require('better-sqlite3')('./mcc_db.sqlite');
const tables = db.prepare(\"SELECT name FROM sqlite_master WHERE type='table'\").all();
console.log('Tables:', tables.length);
tables.forEach(t => {
  const count = db.prepare(\`SELECT COUNT(*) as c FROM \${t.name}\`).get();
  console.log(\`  \${t.name}: \${count.c} records\`);
});
db.close();
"
```

## Maintenance

### Regular Tasks
- Daily: Monitor logs and performance
- Weekly: Backup database
- Monthly: Update dependencies
- Quarterly: Security audit

### Update Application
```bash
git pull origin main
npm install
npm run build
# Restart services
```

## Support

For issues or questions:
1. Check logs: `backend/logs/error.log`
2. Review this guide
3. Check GitHub issues
4. Contact support team

---

**Last Updated:** 2024
**Version:** 1.0.0
