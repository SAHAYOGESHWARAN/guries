# Quick Start Guide

## ✅ Servers are Running!

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3003/api/v1
- **Health Check**: http://localhost:3003/health

---

## What Was Fixed

### 1. TypeScript Error in Backend
- **File**: `backend/controllers/serviceController.ts`
- **Issue**: Referenced non-existent `meta_keywords` column
- **Fix**: Removed the invalid column reference from SQL queries
- **Status**: ✅ Fixed

### 2. Frontend API Configuration
- **File**: `frontend/.env.local`
- **Issue**: API URL pointed to wrong port (3004 instead of 3003)
- **Fix**: Updated to correct backend port
- **Status**: ✅ Fixed

---

## Running Servers

Both servers are running in the background:

```bash
# Backend (Port 3003)
npm run dev:backend

# Frontend (Port 5173)
npm run dev:frontend

# Or run both together
npm run dev
```

---

## Database

- **Type**: SQLite
- **Location**: `backend/mcc_db.sqlite`
- **Status**: ✅ Initialized with all tables and sample data

---

## Available Features

- ✅ Asset Management
- ✅ Service Management
- ✅ Campaign Management
- ✅ User Management
- ✅ QC Workflow
- ✅ Analytics Dashboard
- ✅ Real-time Updates (Socket.io)
- ✅ SEO Management
- ✅ Content Repository
- ✅ Backlink Management

---

## Troubleshooting

### Port Already in Use
If port 3003 or 5173 is already in use, the server will automatically try the next available port.

### Database Issues
The SQLite database is automatically initialized on first run. If you need to reset:
1. Delete `backend/mcc_db.sqlite`
2. Restart the backend server

### API Connection Issues
Make sure:
1. Backend is running on port 3003
2. Frontend `.env.local` has correct API URL
3. CORS is enabled (it is by default)

---

## Next Steps

1. Open http://localhost:5173 in your browser
2. Explore the application features
3. Check the backend API at http://localhost:3003/api/v1
4. Review the database schema in `backend/config/db-sqlite.ts`

---

## Support

All errors have been resolved. The application is ready for development!
