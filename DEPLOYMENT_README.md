# Complete Deployment Guide - Guires Marketing Control Center

## 📋 Overview

This guide provides everything needed to deploy the Guires Marketing Control Center to production on Vercel with PostgreSQL (Supabase).

**Status**: ✅ Production Ready
**Last Updated**: 2024
**Version**: 2.5.0

---

## 🚀 Quick Links

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[SETUP.md](./SETUP.md)** - Detailed local setup
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment steps
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues & solutions

---

## 📦 What's Included

### Documentation Files
- ✅ `QUICKSTART.md` - 5-minute setup guide
- ✅ `SETUP.md` - Detailed setup instructions
- ✅ `DEPLOYMENT.md` - Production deployment guide
- ✅ `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- ✅ `TROUBLESHOOTING.md` - Troubleshooting guide
- ✅ `DEPLOYMENT_README.md` - This file

### Configuration Files
- ✅ `vercel.json` - Vercel deployment config
- ✅ `.env.example` - Root environment template
- ✅ `.env.production` - Production environment config
- ✅ `backend/.env.example` - Backend environment template
- ✅ `frontend/.env.example` - Frontend environment template
- ✅ `build.sh` - Build script for deployment

### API Files
- ✅ `api/index.ts` - Vercel serverless entry point

---

## 🎯 Deployment Path

### Option 1: Local Development (5 minutes)
```bash
npm install:all
npm run dev
# Access: http://localhost:5173
```

### Option 2: Production on Vercel (15 minutes)
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] Code tested locally
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Database configured
- [ ] Environment variables prepared
- [ ] Security review completed
- [ ] Performance optimized

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete checklist.

---

## 🔧 Environment Variables

### Required for Production

**Database**
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

**Authentication**
```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$2a$10$KL271sXgLncfLQGyT7q/cOz.vYl1CiIy7tsaGWEgDe.b1cbosXMxq
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
```

**CORS**
```
CORS_ORIGIN=https://your-vercel-domain.vercel.app
CORS_ORIGINS=https://your-vercel-domain.vercel.app
SOCKET_CORS_ORIGINS=https://your-vercel-domain.vercel.app
```

**URLs**
```
FRONTEND_URL=https://your-vercel-domain.vercel.app
BACKEND_URL=https://your-vercel-domain.vercel.app
VITE_API_URL=/api/v1
```

**Other**
```
NODE_ENV=production
LOG_LEVEL=info
```

---

## 🚀 Deployment Steps

### Step 1: Prepare Code
```bash
# Ensure code is clean
git status

# Push to GitHub
git add .
git commit -m "Ready for production"
git push origin main
```

### Step 2: Setup Supabase
1. Create account at https://supabase.com
2. Create new project
3. Get connection details
4. Note DATABASE_URL

### Step 3: Connect to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select GitHub repository
4. Click "Import"

### Step 4: Configure Environment
1. Go to Project Settings
2. Click "Environment Variables"
3. Add all required variables
4. Save

### Step 5: Deploy
1. Click "Deploy"
2. Monitor build logs
3. Wait for completion
4. Access your app

### Step 6: Verify
- [ ] Frontend loads
- [ ] API responds
- [ ] Login works
- [ ] Database connected
- [ ] No errors in logs

---

## 🔍 Verification

### Health Checks
```bash
# API health
curl https://your-domain.vercel.app/api/health

# Frontend
curl https://your-domain.vercel.app/

# Database
curl https://your-domain.vercel.app/api/v1/health
```

### Testing
- [ ] Login with admin credentials
- [ ] Create test asset
- [ ] Verify database operations
- [ ] Check API responses
- [ ] Test on mobile

---

## 📊 Monitoring

### Vercel Dashboard
- Deployments
- Function Logs
- Analytics
- Performance

### Recommended Tools
- Sentry (error tracking)
- LogRocket (session replay)
- Datadog (monitoring)
- New Relic (APM)

---

## 🔐 Security

### Before Production
- [ ] Change JWT_SECRET
- [ ] Change ADMIN_PASSWORD
- [ ] Enable HTTPS (Vercel default)
- [ ] Configure CORS properly
- [ ] Enable database SSL
- [ ] Set up backups
- [ ] Enable monitoring

### Ongoing
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Rotate secrets periodically
- [ ] Review access logs
- [ ] Test disaster recovery

---

## 📈 Performance

### Optimization
- Frontend: Vite optimized builds
- Backend: Node.js 20.x
- Database: PostgreSQL with indexes
- Caching: Static assets cached 1 year
- CDN: Vercel Edge Network

### Monitoring
- Bundle size
- API response times
- Database query performance
- Error rates
- User experience metrics

---

## 🔄 Rollback

If issues occur:

1. Go to Vercel Dashboard
2. Select project
3. Go to "Deployments"
4. Find previous stable version
5. Click menu → "Promote to Production"
6. Verify rollback successful

---

## 🆘 Troubleshooting

### Common Issues

**Build Fails**
- Check Node.js version (20.x)
- Verify dependencies installed
- Check for TypeScript errors
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**API Not Responding**
- Check DATABASE_URL
- Verify environment variables
- Check function logs
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**CORS Errors**
- Update CORS_ORIGIN
- Verify domain matches
- Check browser console
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Database Issues**
- Verify connection string
- Check Supabase firewall
- Test credentials
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📚 Documentation

### Getting Started
1. Read [QUICKSTART.md](./QUICKSTART.md) - 5 minutes
2. Read [SETUP.md](./SETUP.md) - Detailed setup
3. Read [DEPLOYMENT.md](./DEPLOYMENT.md) - Production

### Before Deploying
1. Complete [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Test locally thoroughly

### After Deploying
1. Monitor [Vercel Dashboard](https://vercel.com/dashboard)
2. Check logs regularly
3. Set up monitoring tools
4. Plan for scaling

---

## 🎓 Learning Resources

### Project Structure
```
guires-marketing-control-center/
├── backend/              # Express API
│   ├── controllers/     # Route handlers
│   ├── routes/         # API routes
│   ├── config/         # Configuration
│   └── database/       # Database setup
├── frontend/           # React + Vite
│   ├── components/    # React components
│   ├── views/        # Page views
│   └── utils/        # Utilities
├── api/               # Vercel serverless
└── docs/              # Documentation
```

### Key Technologies
- **Backend**: Express.js, TypeScript, Node.js 20
- **Frontend**: React 18, Vite, TypeScript
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Vercel
- **Real-time**: Socket.io

---

## 🤝 Support

### Getting Help
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review error messages
3. Check GitHub issues
4. Contact development team

### Reporting Issues
- Provide error message
- Include steps to reproduce
- Share environment details
- Attach logs if possible

---

## ✅ Deployment Checklist Summary

### Pre-Deployment
- [ ] Code tested locally
- [ ] All tests passing
- [ ] No errors in build
- [ ] Environment variables prepared
- [ ] Database ready
- [ ] Security review done

### Deployment
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Build successful
- [ ] Deployment successful

### Post-Deployment
- [ ] Frontend loads
- [ ] API responds
- [ ] Login works
- [ ] Database connected
- [ ] Monitoring enabled
- [ ] Backups configured

---

## 📞 Contact

For questions or issues:
- Check documentation files
- Review troubleshooting guide
- Contact development team
- Check GitHub issues

---

## 📄 License

Proprietary - All rights reserved

---

## 🎉 Ready to Deploy!

You now have everything needed to deploy the Guires Marketing Control Center to production.

**Next Steps**:
1. Read [QUICKSTART.md](./QUICKSTART.md)
2. Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
4. Reference [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) as needed

**Status**: ✅ Production Ready

---

**Last Updated**: 2024
**Version**: 2.5.0
**Maintained by**: Development Team
