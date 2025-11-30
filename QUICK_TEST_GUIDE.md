# Quick Test Guide - Marketing Control Center

## Quick Start Testing

### 1. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
npm run dev:client
```

### 2. Verify Services
- Backend: http://localhost:3001/health
- Frontend: http://localhost:5173

### 3. Run Automated Tests
```bash
node test-project.js
```

## Critical Tests Checklist

### ✅ Backend API (5 min)
- [ ] `GET http://localhost:3001/health` → Returns 200
- [ ] `GET http://localhost:3001/api/v1/dashboard/stats` → Returns data
- [ ] `GET http://localhost:3001/api/v1/projects` → Returns array
- [ ] `GET http://localhost:3001/api/v1/users` → Returns array

### ✅ Frontend Pages (10 min)
- [ ] Dashboard loads
- [ ] Projects page loads
- [ ] Campaigns page loads
- [ ] Tasks page loads
- [ ] Content Repository loads
- [ ] Settings page loads

### ✅ Realtime (2 min)
- [ ] Open browser console
- [ ] Create a task via API
- [ ] Verify Socket.IO event received
- [ ] Frontend updates automatically

### ✅ Database (3 min)
```sql
-- Connect to database
psql -U postgres -d mcc_db

-- Check tables exist
\dt

-- Test insert
INSERT INTO users (name, email, role) VALUES ('Test', 'test@test.com', 'admin');
SELECT * FROM users;
```

## Common Issues Quick Fix

| Issue | Quick Fix |
|-------|-----------|
| Database connection failed | Check PostgreSQL is running: `pg_isready` |
| Port 3001 in use | `lsof -ti:3001 \| xargs kill` |
| CORS errors | Check `FRONTEND_URL` in backend `.env` |
| Socket.IO not connecting | Verify backend is running on port 3001 |
| Missing tables | Run: `psql -U postgres -d mcc_db -f backend/db/schema.sql` |

## Test All Pages (Navigation)

1. Open http://localhost:5173
2. Login (if required)
3. Navigate through sidebar:
   - Dashboard ✓
   - Projects ✓
   - Campaigns ✓
   - Tasks ✓
   - Assets ✓
   - Content Repository ✓
   - Service Pages ✓
   - SMM Posting ✓
   - All other pages...

## Test API Endpoints (Postman/curl)

```bash
# Health check
curl http://localhost:3001/health

# Dashboard stats
curl http://localhost:3001/api/v1/dashboard/stats

# Get projects
curl http://localhost:3001/api/v1/projects

# Create project
curl -X POST http://localhost:3001/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"project_name":"Test","project_type":"seo"}'
```

## Expected Test Results

- ✅ **Passed**: 80+ tests
- ❌ **Failed**: 0-5 tests (acceptable if database empty)
- ⚠️ **Warnings**: Check connection issues

## Full Documentation

See `TESTING_DOCUMENTATION.md` for comprehensive testing procedures.

