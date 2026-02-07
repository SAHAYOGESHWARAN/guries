# Troubleshooting Guide - Guires Marketing Control Center

## Development Issues

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions**:
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use Windows command
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Dependencies Installation Issues

**Problem**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
npm install --legacy-peer-deps
cd backend && npm install --legacy-peer-deps && cd ..
cd frontend && npm install --legacy-peer-deps && cd ..
```

**Problem**: `npm ERR! 404 Not Found`

**Solution**:
```bash
npm cache clean --force
npm install
```

### Build Errors

**Problem**: `TypeScript compilation failed`

**Solution**:
```bash
# Check for errors
npm run build:backend

# Fix errors in code
# Then rebuild
npm run build:backend
```

**Problem**: `Cannot find module '@types/...'`

**Solution**:
```bash
cd backend
npm install --save-dev @types/node
cd ..
```

### Database Issues

**Problem**: `SQLITE_CANTOPEN: unable to open database file`

**Solution**:
```bash
# Check if backend directory exists
ls -la backend/

# Create database manually
cd backend
npm run dev
# Database will be created on first run
```

**Problem**: `Database connection refused`

**Solution**:
```bash
# Check if database is running
# For SQLite, check file exists
ls -la backend/mcc_db.sqlite

# For PostgreSQL, verify connection string
echo $DATABASE_URL
```

### API Connection Issues

**Problem**: `Cannot GET /api/health`

**Solution**:
```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Check if port is correct in .env
cat backend/.env | grep PORT

# Restart backend
cd backend
npm run dev
```

**Problem**: `CORS error in browser console`

**Solution**:
```bash
# Check CORS_ORIGIN in backend/.env
cat backend/.env | grep CORS

# Should match frontend URL
# For development: http://localhost:5173
```

### Frontend Issues

**Problem**: `Blank page or 404`

**Solution**:
```bash
# Check if frontend is running
curl http://localhost:5173

# Check if build succeeded
cd frontend
npm run build

# Check for errors in browser console
# Press F12 to open developer tools
```

**Problem**: `API calls failing`

**Solution**:
```bash
# Check VITE_API_URL in frontend/.env.local
cat frontend/.env.local

# Should be: http://localhost:3001/api/v1

# Verify backend is running
curl http://localhost:3001/api/health
```

**Problem**: `Module not found errors`

**Solution**:
```bash
cd frontend
npm install
npm run dev
```

---

## Deployment Issues

### Build Fails on Vercel

**Problem**: `npm ERR! code ERESOLVE`

**Solution**:
- Vercel uses `--legacy-peer-deps` automatically
- Check `vercel.json` has correct `installCommand`
- Verify all dependencies are in `package.json`

**Problem**: `Cannot find module`

**Solution**:
- Check all imports are correct
- Verify dependencies are installed
- Check for circular dependencies

**Problem**: `Build timeout`

**Solution**:
- Increase function timeout in `vercel.json`
- Optimize build process
- Remove unnecessary dependencies

### Deployment Succeeds but App Doesn't Work

**Problem**: `Cannot GET /`

**Solution**:
- Check `outputDirectory` in `vercel.json`
- Verify frontend build output exists
- Check static file serving configuration

**Problem**: `API returns 404`

**Solution**:
- Check `routes` in `vercel.json`
- Verify API function is deployed
- Check function logs in Vercel dashboard

**Problem**: `Database connection fails`

**Solution**:
```bash
# Verify DATABASE_URL is set
# Check format: postgresql://user:password@host:port/database

# Test connection locally first
# Then deploy
```

### Environment Variables Not Working

**Problem**: `process.env.DATABASE_URL is undefined`

**Solution**:
- Go to Vercel Dashboard
- Project Settings → Environment Variables
- Add all required variables
- Redeploy project

**Problem**: `Variables work locally but not on Vercel`

**Solution**:
- Check variable names match exactly
- No typos in variable names
- Verify variables are set for production environment
- Redeploy after adding variables

### CORS Errors in Production

**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- Update `CORS_ORIGIN` to your Vercel domain
- Update `CORS_ORIGINS` to your Vercel domain
- Update `SOCKET_CORS_ORIGINS` to your Vercel domain
- Redeploy

**Problem**: `CORS error even with correct origin`

**Solution**:
- Check exact domain in error message
- Verify no trailing slashes
- Check for protocol (https vs http)
- Verify backend is receiving requests

---

## Database Issues

### SQLite Issues

**Problem**: `database is locked`

**Solution**:
```bash
# Close all connections
# Restart backend
cd backend
npm run dev
```

**Problem**: `database disk image is malformed`

**Solution**:
```bash
# Backup database
cp backend/mcc_db.sqlite backend/mcc_db.sqlite.backup

# Delete corrupted database
rm backend/mcc_db.sqlite

# Restart backend to recreate
cd backend
npm run dev
```

### PostgreSQL Issues

**Problem**: `connect ECONNREFUSED`

**Solution**:
- Verify DATABASE_URL is correct
- Check Supabase is running
- Verify firewall allows connections
- Test connection string locally

**Problem**: `password authentication failed`

**Solution**:
- Verify DB_PASSWORD is correct
- Check for special characters in password
- Verify DB_USER is correct
- Test credentials in Supabase dashboard

**Problem**: `database does not exist`

**Solution**:
- Verify DB_NAME is correct
- Create database in Supabase
- Run migrations if needed

---

## Authentication Issues

**Problem**: `Login fails with correct credentials`

**Solution**:
- Check ADMIN_EMAIL in .env
- Verify ADMIN_PASSWORD hash is correct
- Check JWT_SECRET is set
- Verify database has admin user

**Problem**: `JWT token invalid`

**Solution**:
- Check JWT_SECRET is same on all instances
- Verify JWT_EXPIRES_IN is set
- Check token expiration
- Clear browser cookies and retry

**Problem**: `Cannot access protected routes`

**Solution**:
- Verify authentication middleware is enabled
- Check token is being sent in headers
- Verify token is valid
- Check authorization rules

---

## Performance Issues

**Problem**: `Slow API responses`

**Solution**:
- Check database query performance
- Add indexes to frequently queried columns
- Enable caching
- Optimize queries
- Check network latency

**Problem**: `High memory usage`

**Solution**:
- Check for memory leaks
- Monitor long-running processes
- Optimize data structures
- Implement pagination
- Clear caches periodically

**Problem**: `Large bundle size`

**Solution**:
- Analyze bundle: `npm run build:frontend`
- Remove unused dependencies
- Enable code splitting
- Lazy load components
- Minify assets

---

## Monitoring and Debugging

### Check Logs

**Local Development**:
```bash
# Backend logs
cd backend
npm run dev
# Logs appear in terminal

# Frontend logs
cd frontend
npm run dev
# Logs appear in terminal
```

**Vercel Production**:
1. Go to Vercel Dashboard
2. Select project
3. Go to "Deployments"
4. Click on deployment
5. View "Function Logs"

### Debug Mode

**Backend**:
```bash
# Set debug level
LOG_LEVEL=debug npm run dev
```

**Frontend**:
```bash
# Open browser console
# Press F12
# Check for errors
```

### Health Checks

```bash
# API health
curl http://localhost:3001/api/health

# Database health
curl http://localhost:3001/api/v1/health

# Frontend
curl http://localhost:5173
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `EADDRINUSE` | Port in use | Kill process on port |
| `ENOENT` | File not found | Check file path |
| `ECONNREFUSED` | Connection refused | Check service is running |
| `CORS error` | CORS not configured | Update CORS_ORIGIN |
| `401 Unauthorized` | Invalid token | Check authentication |
| `404 Not Found` | Route not found | Check route definition |
| `500 Internal Error` | Server error | Check logs |
| `SQLITE_CANTOPEN` | Database file missing | Create database |
| `password authentication failed` | Wrong credentials | Verify credentials |

---

## Getting Help

1. **Check this guide** - Most issues are covered
2. **Check logs** - Error messages are usually helpful
3. **Check GitHub issues** - Similar issues may be documented
4. **Ask for help** - Provide error message and steps to reproduce

---

## Quick Reference

### Restart Services
```bash
# Kill all Node processes
pkill -f node

# Restart backend
cd backend && npm run dev

# Restart frontend (in another terminal)
cd frontend && npm run dev
```

### Clear Cache
```bash
npm cache clean --force
rm -rf node_modules backend/node_modules frontend/node_modules
npm install:all
```

### Reset Database
```bash
# SQLite
rm backend/mcc_db.sqlite

# PostgreSQL
# Drop and recreate database in Supabase
```

### Full Reset
```bash
# Remove everything
rm -rf node_modules backend/node_modules frontend/node_modules backend/dist frontend/dist

# Reinstall
npm install:all

# Rebuild
npm run build

# Start fresh
npm run dev
```

---

**Last Updated**: 2024
**Status**: ✅ Ready for Use
