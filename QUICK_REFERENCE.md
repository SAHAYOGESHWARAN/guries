# Quick Reference - Guries Marketing Control Center

## 🌐 Live Application
**URL**: https://guries-sahayogeshwarans-projects.vercel.app

## 🔐 Login Credentials
- **Email**: admin@example.com
- **Password**: admin123

## 📋 Key Files
- `vercel.json` - Deployment configuration
- `.vercelignore` - Files excluded from deployment
- `api.ts` - Consolidated API handler
- `frontend/dist/` - Pre-built frontend assets
- `DEPLOYMENT_SUCCESS.md` - Full deployment documentation

## 🚀 API Endpoints

### Assets
- `GET /api/v1/assets` - List all assets
- `POST /api/v1/assets` - Create asset

### QC Reviews
- `GET /api/v1/qc-reviews` - List reviews
- `POST /api/v1/qc-reviews` - Submit review

### Authentication
- `POST /api/auth/login` - Login with email/password

### Other Resources
- `GET /api/v1/users` - Users
- `GET /api/v1/services` - Services
- `GET /api/v1/tasks` - Tasks
- `GET /api/v1/campaigns` - Campaigns
- `GET /api/v1/projects` - Projects

## 🔧 Environment Variables
All configured in `vercel.json`:
- `ADMIN_EMAIL` - Admin email
- `ADMIN_PASSWORD` - Admin password (bcrypt hash)
- `JWT_SECRET` - JWT signing key
- `NODE_ENV` - Set to "production"
- `DB_CLIENT` - Set to "mock"

## 📊 Database
- **Type**: Mock (in-memory)
- **Data**: Pre-populated with sample data
- **Persistence**: None (resets on deployment)

## 🛠️ Development

### Local Frontend
```bash
cd frontend
npm install
npm run dev
```

### Local Backend
```bash
cd backend
npm install
npm run dev
```

### Build Frontend
```bash
cd frontend
npm run build
```

## 📝 Deployment

### Deploy to Vercel
```bash
vercel deploy --prod
```

### Check Deployment Status
```bash
vercel projects list
```

## ⚠️ Important Notes

1. **Hobby Plan Limit**: Maximum 12 serverless functions
2. **No Database**: Uses mock data only
3. **Pre-built Frontend**: Build is skipped, using dist folder
4. **Single API Function**: All routes consolidated into one function

## 🔄 Update Workflow

1. Make changes locally
2. Test thoroughly
3. Commit to git
4. Run `vercel deploy --prod`
5. Verify at live URL

## 📞 Support

For deployment issues:
1. Check `DEPLOYMENT_SUCCESS.md` for detailed info
2. Review `vercel.json` configuration
3. Verify `.vercelignore` settings
4. Check environment variables in Vercel dashboard

---

**Last Updated**: February 5, 2026
**Status**: ✅ Live and Operational
