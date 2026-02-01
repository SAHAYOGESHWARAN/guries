# Quick Start Guide

## 5-Minute Setup

### 1. Install PostgreSQL
```bash
# macOS
brew install postgresql@15 && brew services start postgresql@15

# Ubuntu
sudo apt-get install postgresql && sudo systemctl start postgresql

# Windows: Download from https://www.postgresql.org/download/windows/
```

### 2. Create Database
```bash
psql -U postgres -c "CREATE DATABASE mcc_db;"
```

### 3. Setup Project
```bash
cd backend
npm install
npm run db:init
npm run db:seed
npm run dev
```

### 4. Verify
```bash
# Open browser
http://localhost:3001/health

# Should return:
# {"status":"OK","timestamp":"2026-02-01T..."}
```

## Environment Setup

### Create `.env` file
```bash
cp .env.example .env
```

### Edit `backend/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=mcc_db
NODE_ENV=development
PORT=3001
```

## Common Commands

```bash
# Initialize database
npm run db:init

# Seed data
npm run db:seed

# Reset database
npm run db:reset

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Database Info

- **Type**: PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: mcc_db
- **Tables**: 50+
- **Seeded Data**: Yes

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Start PostgreSQL: `brew services start postgresql@15` |
| Database not found | Create: `psql -U postgres -c "CREATE DATABASE mcc_db;"` |
| Port in use | Change PORT in `.env` |
| Auth failed | Check credentials in `.env` |

## Next Steps

1. ✅ Database setup complete
2. ⏳ Implement JWT authentication
3. ⏳ Add rate limiting
4. ⏳ Deploy to production

## Documentation

- `DATABASE_SETUP_SUMMARY.md` - Overview
- `MIGRATION_COMPLETE.md` - Migration details
- `PRODUCTION_DEPLOYMENT.md` - Production setup
- `backend/database/README.md` - Full documentation

## Support

```bash
# Check database connection
psql -U postgres -d mcc_db

# View logs
npm run dev 2>&1 | tee app.log

# Test API
curl http://localhost:3001/api/health
```

---

**Ready to go!** 🚀
