# Production Deployment Checklist

## Pre-Deployment Verification

### Backend Configuration
- [ ] Set `NODE_ENV=production`
- [ ] Set `USE_PG=true` for PostgreSQL
- [ ] Configure `DATABASE_URL` with production database
- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (bcrypt hashed)
- [ ] Configure `CORS_ORIGIN` to match frontend domain
- [ ] Configure `SOCKET_CORS_ORIGINS` to match frontend domain
- [ ] Set `PORT` to 3001 or desired port
- [ ] Enable HTTPS redirect in production

### Frontend Configuration
- [ ] Set `VITE_ENVIRONMENT=production`
- [ ] Set `VITE_API_URL` to production backend URL
- [ ] Build frontend: `npm run build`
- [ ] Test build locally: `npm run preview`
- [ ] Verify no console errors in production build

### Database Setup
- [ ] Create PostgreSQL database
- [ ] Run migrations: `npm run migrate` (if applicable)
- [ ] Seed initial data (admin user, master data)
- [ ] Verify all tables created successfully
- [ ] Test database connection from backend

### Security Checklist
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure CORS headers
- [ ] Enable rate limiting on all endpoints
- [ ] Implement request validation
- [ ] Add input sanitization
- [ ] Enable CSRF protection
- [ ] Set secure cookie flags
- [ ] Implement API key rotation
- [ ] Enable audit logging
- [ ] Set up error tracking (Sentry, etc.)

### Performance Optimization
- [ ] Enable gzip compression
- [ ] Minify frontend assets
- [ ] Optimize database indexes
- [ ] Set up caching headers
- [ ] Enable CDN for static assets
- [ ] Configure database connection pooling
- [ ] Set up monitoring and alerts

### Monitoring & Logging
- [ ] Set up application logging
- [ ] Configure error tracking
- [ ] Set up performance monitoring
- [ ] Configure uptime monitoring
- [ ] Set up database monitoring
- [ ] Configure alert notifications

---

## Deployment Steps

### 1. Backend Deployment

#### Option A: Traditional Server (AWS EC2, DigitalOcean, etc.)
```bash
# SSH into server
ssh user@server-ip

# Clone repository
git clone <repo-url>
cd guires-marketing-control-center/backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start with PM2
npm install -g pm2
pm2 start dist/server.js --name "mcc-backend"
pm2 save
pm2 startup

# Configure Nginx reverse proxy
# Point to http://localhost:3001
```

#### Option B: Vercel (Serverless)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, etc.
```

#### Option C: Docker
```bash
# Build Docker image
docker build -t mcc-backend .

# Run container
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  mcc-backend
```

### 2. Frontend Deployment

#### Option A: Vercel
```bash
cd frontend
vercel --prod
```

#### Option B: Netlify
```bash
cd frontend
npm run build
# Deploy dist folder to Netlify
```

#### Option C: AWS S3 + CloudFront
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name/
# Configure CloudFront distribution
```

#### Option D: Traditional Server
```bash
cd frontend
npm run build
# Copy dist folder to web server
scp -r dist/* user@server:/var/www/html/
```

### 3. Database Migration

```bash
# Backup existing database
pg_dump production_db > backup_$(date +%Y%m%d).sql

# Run migrations
npm run migrate

# Verify schema
psql production_db -c "\dt"
```

### 4. SSL/TLS Certificate

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d yourdomain.com

# Configure Nginx to use certificate
# Update server block with ssl_certificate paths
```

---

## Post-Deployment Verification

### Health Checks
- [ ] Backend health endpoint: `GET /health` → 200 OK
- [ ] API health endpoint: `GET /api/v1/health` → 200 OK
- [ ] Frontend loads without errors
- [ ] Database connection successful
- [ ] Socket.io connection established

### Functional Tests
- [ ] Login works with production credentials
- [ ] Asset upload and save works
- [ ] Data displays correctly
- [ ] Real-time notifications work
- [ ] QC workflow functions
- [ ] Status updates work
- [ ] Forms validate correctly
- [ ] Error handling works

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database queries < 100ms
- [ ] No memory leaks
- [ ] CPU usage normal

### Security Tests
- [ ] HTTPS enforced
- [ ] CORS headers correct
- [ ] Rate limiting working
- [ ] Input validation working
- [ ] Authentication required for protected endpoints
- [ ] Authorization checks working

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Application running without errors
- [ ] Database responding normally
- [ ] No unusual CPU/memory usage
- [ ] No failed API requests
- [ ] Notifications being delivered

### Weekly Checks
- [ ] Review error logs
- [ ] Check database size
- [ ] Verify backups completed
- [ ] Review performance metrics
- [ ] Check for security updates

### Monthly Checks
- [ ] Database optimization
- [ ] Cache cleanup
- [ ] Log rotation
- [ ] Security audit
- [ ] Performance review

### Quarterly Checks
- [ ] Dependency updates
- [ ] Security patches
- [ ] Disaster recovery drill
- [ ] Capacity planning
- [ ] Architecture review

---

## Rollback Plan

### If Deployment Fails

```bash
# Revert to previous version
git revert <commit-hash>
npm run build
# Redeploy

# Or restore from backup
git checkout <previous-tag>
npm install
npm run build
# Redeploy
```

### If Database Migration Fails

```bash
# Restore from backup
psql production_db < backup_YYYYMMDD.sql

# Verify data integrity
psql production_db -c "SELECT COUNT(*) FROM users;"
```

### If Frontend Breaks

```bash
# Revert to previous build
# Restore previous dist folder from backup
# Clear CDN cache
```

---

## Environment Variables Template

### Backend (.env)
```
NODE_ENV=production
PORT=3001
API_PORT=3001

# Database
DB_CLIENT=pg
USE_PG=true
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=$2a$10$... (bcrypt hash)
JWT_SECRET=your-very-long-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
SOCKET_CORS_ORIGINS=https://yourdomain.com

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Logging
LOG_LEVEL=info
```

### Frontend (.env.production)
```
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_ENVIRONMENT=production
```

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy, AWS ALB)
- Run multiple backend instances
- Use sticky sessions for Socket.io
- Implement Redis for session sharing

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement caching layer (Redis)
- Use CDN for static assets

### Database Scaling
- Read replicas for read-heavy operations
- Connection pooling (PgBouncer)
- Partitioning for large tables
- Archive old data

---

## Disaster Recovery

### Backup Strategy
- Daily automated backups
- Weekly full backups
- Monthly archive backups
- Test restore procedures monthly

### Backup Locations
- Primary: On-server backup
- Secondary: Cloud storage (S3, GCS)
- Tertiary: Off-site backup

### Recovery Time Objectives (RTO)
- Critical systems: < 1 hour
- Important systems: < 4 hours
- Non-critical systems: < 24 hours

### Recovery Point Objectives (RPO)
- Database: < 1 hour
- Application: < 1 hour
- Static files: < 24 hours

---

## Support & Troubleshooting

### Common Production Issues

#### High CPU Usage
```bash
# Check running processes
top

# Check database queries
psql -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Optimize slow queries
EXPLAIN ANALYZE SELECT ...;
```

#### High Memory Usage
```bash
# Check Node.js memory
node --max-old-space-size=4096 dist/server.js

# Check for memory leaks
# Use clinic.js or node-inspect
```

#### Database Connection Errors
```bash
# Check connection pool
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Increase pool size in .env
DB_POOL_MAX=20
```

#### Socket.io Connection Issues
```bash
# Check Socket.io logs
# Verify CORS settings
# Check firewall rules
```

---

## Contact & Escalation

### Support Contacts
- DevOps Team: devops@yourdomain.com
- Database Team: dba@yourdomain.com
- Security Team: security@yourdomain.com
- On-Call: [on-call schedule]

### Escalation Path
1. Level 1: Application Support
2. Level 2: DevOps/Infrastructure
3. Level 3: Architecture/Security
4. Level 4: Executive/Management

---

## Sign-Off

- [ ] DevOps Lead: _________________ Date: _______
- [ ] Security Lead: ________________ Date: _______
- [ ] Product Manager: ______________ Date: _______
- [ ] CTO/Technical Lead: ___________ Date: _______

