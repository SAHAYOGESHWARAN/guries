# Deployment & Setup Guide

**Marketing Control Center - Deployment Documentation**

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Environment Configuration](#environment-configuration)
3. [Production Build](#production-build)
4. [Vercel Deployment](#vercel-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Database Setup](#database-setup)
7. [SSL/TLS Configuration](#ssltls-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

- Node.js 20.x
- PostgreSQL 14+ or SQLite
- Git
- npm or yarn

### Step-by-Step Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd guires-marketing-control-center
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup Environment Variables**
   ```bash
   npm run setup
   ```

4. **Initialize Database**
   
   For PostgreSQL:
   ```bash
   createdb mcc_db
   psql -U postgres -d mcc_db -f backend/db/schema.sql
   ```
   
   For SQLite (automatic):
   ```bash
   # Database created automatically on first run
   ```

5. **Start Development Servers**
   ```bash
   npm run dev
   ```

6. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

---

## Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mcc_db
# or for SQLite:
# DATABASE_URL=sqlite:///./mcc_db.sqlite

# Server
NODE_ENV=development
PORT=3001

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Optional: Twilio (for SMS/OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Optional: Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api/v1

# Google Gemini AI
VITE_GOOGLE_GEMINI_KEY=your-google-gemini-api-key

# Optional: Analytics
VITE_ANALYTICS_ID=your-analytics-id

# Optional: Sentry Error Tracking
VITE_SENTRY_DSN=your-sentry-dsn
```

### Environment Files by Stage

**Development (.env.development)**
```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

**Production (.env.production)**
```env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn
```

---

## Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

### Build Backend

```bash
cd backend
npm run build
```

Output: `backend/dist/`

### Build Both

```bash
npm run build
```

### Verify Build

```bash
# Test frontend build
npm run preview

# Test backend build
npm start
```

---

## Vercel Deployment

### Prerequisites

- Vercel account
- GitHub repository connected to Vercel

### Configuration

The project includes `vercel.json` for Vercel deployment:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/dist",
  "env": {
    "VITE_API_URL": "@api_url",
    "VITE_GOOGLE_GEMINI_KEY": "@gemini_key"
  }
}
```

### Deployment Steps

1. **Connect Repository**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables:
     - `VITE_API_URL`
     - `VITE_GOOGLE_GEMINI_KEY`
     - `DATABASE_URL` (for backend)
     - `JWT_SECRET`

3. **Deploy**
   - Vercel automatically deploys on push to main branch
   - Or manually deploy: `vercel --prod`

4. **Verify Deployment**
   - Check deployment logs in Vercel dashboard
   - Test API endpoints
   - Verify frontend loads correctly

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for DNS propagation (up to 48 hours)

---

## Docker Deployment

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install production dependencies only
RUN cd backend && npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist

# Expose ports
EXPOSE 3001 5173

# Start backend
CMD ["npm", "start"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: mcc_db
      POSTGRES_USER: mcc_user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    environment:
      DATABASE_URL: postgresql://mcc_user:password@postgres:5432/mcc_db
      NODE_ENV: production
      PORT: 3001
      JWT_SECRET: your-secret-key
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  frontend:
    image: nginx:alpine
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Database Setup

### PostgreSQL Production Setup

1. **Create Database**
   ```bash
   createdb mcc_db
   ```

2. **Create User**
   ```bash
   createuser mcc_user
   psql -U postgres -d mcc_db -c "ALTER USER mcc_user WITH PASSWORD 'strong-password';"
   ```

3. **Grant Privileges**
   ```bash
   psql -U postgres -d mcc_db -c "GRANT ALL PRIVILEGES ON DATABASE mcc_db TO mcc_user;"
   ```

4. **Run Migrations**
   ```bash
   psql -U mcc_user -d mcc_db -f backend/db/schema.sql
   ```

5. **Verify Connection**
   ```bash
   psql -U mcc_user -d mcc_db -c "SELECT version();"
   ```

### Database Backup Strategy

**Daily Backups:**
```bash
#!/bin/bash
BACKUP_DIR="/backups/mcc"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U mcc_user mcc_db | gzip > $BACKUP_DIR/mcc_db_$DATE.sql.gz
```

**Add to crontab:**
```bash
0 2 * * * /path/to/backup.sh
```

**Retention Policy:**
- Daily: 7 days
- Weekly: 4 weeks
- Monthly: 12 months

---

## SSL/TLS Configuration

### Let's Encrypt with Nginx

1. **Install Certbot**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Generate Certificate**
   ```bash
   sudo certbot certonly --nginx -d yourdomain.com
   ```

3. **Configure Nginx**
   ```nginx
   server {
     listen 443 ssl http2;
     server_name yourdomain.com;

     ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

     ssl_protocols TLSv1.2 TLSv1.3;
     ssl_ciphers HIGH:!aNULL:!MD5;

     location / {
       proxy_pass http://localhost:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }

   server {
     listen 80;
     server_name yourdomain.com;
     return 301 https://$server_name$request_uri;
   }
   ```

4. **Auto-renewal**
   ```bash
   sudo certbot renew --dry-run
   ```

---

## Monitoring & Logging

### Application Logging

```typescript
// backend/config/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Checks

```typescript
// backend/routes/health.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### Performance Monitoring

```typescript
// backend/middleware/performance.ts
import { Request, Response, NextFunction } from 'express';

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
```

### Error Tracking (Sentry)

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.errorHandler());
```

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process on port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

**Database Connection Error**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify connection string
psql $DATABASE_URL -c "SELECT 1"
```

**Build Failures**
```bash
# Clear cache
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all

# Rebuild
npm run build
```

**Memory Issues**
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Backend debug
NODE_DEBUG=http npm run dev:backend

# Frontend debug
VITE_DEBUG=true npm run dev:frontend
```

### Performance Issues

1. Check database query performance
2. Review application logs
3. Monitor server resources
4. Check network latency
5. Optimize database indexes

---

## Maintenance

### Regular Tasks

- **Daily**: Monitor logs and errors
- **Weekly**: Review performance metrics
- **Monthly**: Database maintenance (VACUUM, ANALYZE)
- **Quarterly**: Security updates
- **Annually**: Capacity planning

### Updates

```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Backup Verification

```bash
# Test restore from backup
pg_restore -d test_db backup.dump

# Verify data integrity
SELECT COUNT(*) FROM projects;
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable CORS properly
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Use strong JWT secrets

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Nginx Documentation](https://nginx.org/en/docs)
- [Let's Encrypt](https://letsencrypt.org)
