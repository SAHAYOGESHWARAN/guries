# Marketing Control Center - Quick Reference Guide

**Version**: 2.5.0 | **Status**: Production Ready

---

## Quick Start (5 Minutes)

### 1. Install & Setup
```bash
git clone <repo-url>
cd guires-marketing-control-center
npm run install:all
npm run setup
```

### 2. Start Development
```bash
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:3003
- API: http://localhost:3003/api/v1

---

## Common Commands

### Development
```bash
npm run dev                 # Start both frontend & backend
npm run dev:frontend       # Frontend only
npm run dev:backend        # Backend only
npm run build              # Build for production
npm run preview            # Preview production build
```

### Testing
```bash
node test-workflow-stage.cjs
node test-country-master.cjs
node test-user-management.cjs
node test-reward-penalty-automation.cjs
node final-integration-test.cjs
```

### Database
```bash
# SQLite (Development)
# Automatically created at backend/mcc_db.sqlite

# PostgreSQL (Production)
createdb mcc_db
psql -U postgres -d mcc_db -f schema.sql
```

---

## Project Structure

```
guires-marketing-control-center/
├── frontend/              # React app (port 5173)
│   ├── components/        # Reusable UI components
│   ├── views/             # 90+ page components
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Helper functions
├── backend/               # Express API (port 3003)
│   ├── controllers/       # 60+ business logic files
│   ├── routes/            # 26+ route files
│   ├── middleware/        # Auth, validation, etc.
│   └── config/            # Database config
├── api/                   # Vercel serverless functions
├── schema.sql             # Database schema
└── package.json           # Root configuration
```

---

## Environment Variables

### Backend (.env)
```env
PORT=3003
NODE_ENV=development
DB_TYPE=sqlite
GOOGLE_GEMINI_API_KEY=your_key
JWT_SECRET=your_secret
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3003/api/v1
VITE_GOOGLE_GEMINI_API_KEY=your_key
```

---

## API Endpoints (100+)

### Core Resources
| Resource | GET | POST | PUT | DELETE |
|----------|-----|------|-----|--------|
| Projects | ✅ | ✅ | ✅ | ✅ |
| Campaigns | ✅ | ✅ | ✅ | ✅ |
| Tasks | ✅ | ✅ | ✅ | ✅ |
| Content | ✅ | ✅ | ✅ | ✅ |
| Assets | ✅ | ✅ | ✅ | ✅ |
| Keywords | ✅ | ✅ | ✅ | ✅ |
| Backlinks | ✅ | ✅ | ✅ | ✅ |
| SMM Posts | ✅ | ✅ | ✅ | ✅ |
| QC Runs | ✅ | ✅ | ✅ | ✅ |
| Employees | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | ✅ |

### Example API Calls

```bash
# Get projects
curl http://localhost:3003/api/v1/projects

# Create project
curl -X POST http://localhost:3003/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"New Project","ownerId":1}'

# Get specific project
curl http://localhost:3003/api/v1/projects/1

# Update project
curl -X PUT http://localhost:3003/api/v1/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'

# Delete project
curl -X DELETE http://localhost:3003/api/v1/projects/1
```

---

## Database Tables (40+)

### Core Tables
- users, projects, campaigns, tasks, keywords
- content_repository, services, sub_services
- graphic_assets, assets, backlink_sources
- smm_posts, qc_runs, qc_checklists
- employee_evaluations, employee_scorecards
- bonus_criteria_tiers, reward_recommendations
- ai_evaluation_reports, ai_task_allocation

### Master Tables
- industry_sectors, content_types, asset_types
- platform_master, workflow_stage_master
- country_master, seo_error_type_master
- audit_checklist_master

---

## Frontend Pages (90+)

### Main Sections
- Dashboard
- Projects & Campaigns
- Tasks & Content
- Assets & Media
- SEO & Backlinks
- Social Media
- Quality Control
- Analytics
- HR & Employees
- Rewards & Penalties
- AI Features
- Master Tables
- User Management
- Settings

---

## Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :3003

# Kill process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Test connection
psql -U postgres -d mcc_db -c "SELECT 1"
```

### Frontend Can't Connect to Backend
```bash
# Check backend running
curl http://localhost:3003/health

# Check CORS in backend .env
# FRONTEND_URL=http://localhost:5173
```

### Missing Dependencies
```bash
npm run install:all
npm cache clean --force
```

---

## Key Features

### ✅ Complete
- 90+ Frontend Pages
- 60+ Backend Controllers
- 100+ API Endpoints
- 40+ Database Tables
- Real-time Updates (Socket.IO)
- Role-based Access Control
- AI Evaluation Engine
- AI Task Allocation
- Reward & Penalty Automation
- Comprehensive Analytics

### 🔒 Security
- JWT Authentication
- Role-based Permissions
- Helmet Security Headers
- CORS Configuration
- Input Validation
- SQL Injection Prevention

### 📊 Analytics
- Dashboard KPIs
- Traffic Analytics
- Competitor Benchmarks
- OKR Tracking
- Performance Metrics

### 🤖 AI Features
- Automatic Evaluations
- Task Allocation
- Workload Forecasting
- Performance Analysis
- Risk Detection

---

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Docker
```bash
docker build -t mcc:latest .
docker run -p 3003:3003 mcc:latest
```

### Manual Server
```bash
npm run build
npm run dev:backend &
npm run dev:frontend &
```

---

## Performance Tips

### Frontend
- Use React DevTools for debugging
- Check Network tab for API calls
- Monitor bundle size
- Enable code splitting

### Backend
- Use database indexes
- Enable query caching
- Use connection pooling
- Monitor API response times

### Database
- Regular backups
- Index optimization
- Query analysis
- Vacuum regularly

---

## Testing

### Run All Tests
```bash
node test-workflow-stage.cjs
node test-country-master.cjs
node test-user-management.cjs
node test-reward-penalty-automation.cjs
node final-integration-test.cjs
```

### Test Coverage
- ✅ Database operations
- ✅ API endpoints
- ✅ User management
- ✅ Role permissions
- ✅ Reward automation
- ✅ AI features

---

## Documentation Files

| File | Purpose |
|------|---------|
| README.md | Project overview |
| COMPREHENSIVE_E2E_TEST_REPORT.md | Test results |
| DEPLOYMENT_AND_SETUP_GUIDE.md | Setup instructions |
| API_DOCUMENTATION.md | API reference |
| QUICK_REFERENCE_GUIDE.md | This file |

---

## Useful Links

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3003
- **API Docs**: http://localhost:3003/api/v1
- **Health Check**: http://localhost:3003/health
- **GitHub**: <repository-url>
- **Vercel**: https://vercel.com
- **Supabase**: https://supabase.com

---

## Support

### Getting Help
1. Check documentation files
2. Review error logs
3. Check test files for examples
4. Contact development team

### Common Issues
- Port conflicts → Use different port
- Database errors → Check connection
- API errors → Check backend logs
- Frontend errors → Check browser console

---

## Version Info

- **Current Version**: 2.5.0
- **Node.js**: 20.x
- **React**: 18.2.0
- **Express**: 4.18.2
- **PostgreSQL**: 14+
- **Last Updated**: January 17, 2026

---

**Status**: ✅ Production Ready  
**Test Coverage**: 95%+  
**Documentation**: Complete
