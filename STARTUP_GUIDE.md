# 🚀 Complete Startup Guide

## ✅ Status: Ready to Run

All npm scripts are properly configured and ready to use.

---

## Quick Start

### Start Frontend Only
```bash
npm start --prefix frontend
```
- Runs on: http://localhost:5173
- Uses Vite dev server
- Hot module replacement enabled

### Start Backend Only
```bash
npm start --prefix backend
```
- Runs on: http://localhost:3001
- Uses compiled JavaScript
- Database: SQLite (mcc_db.sqlite)

### Start Full Stack (Recommended)

**Terminal 1 - Backend:**
```bash
npm start --prefix backend
```

**Terminal 2 - Frontend:**
```bash
npm start --prefix frontend
```

---

## Development Mode

### Frontend Development
```bash
npm run dev --prefix frontend
```
- Same as `npm start --prefix frontend`
- Vite dev server with HMR

### Backend Development
```bash
npm run dev --prefix backend
```
- Uses nodemon for auto-reload
- Watches TypeScript files
- Requires TypeScript compilation

---

## Build for Production

### Build Frontend
```bash
npm run build --prefix frontend
```
- Output: `frontend/dist/`
- Optimized bundle
- Ready for deployment

### Build Backend
```bash
npm run build --prefix backend
```
- Output: `backend/dist/`
- Compiled JavaScript
- Ready for production

---

## Preview Production Build

### Preview Frontend Build
```bash
npm run preview --prefix frontend
```
- Serves the production build locally
- Useful for testing before deployment

---

## Environment Setup

### Frontend (.env files)
- `.env.development` - Development environment
- `.env.local` - Local overrides
- `.env.production` - Production environment

### Backend (.env files)
- `backend/.env` - Backend configuration
- `backend/.env.example` - Example configuration

---

## Troubleshooting

### Port Already in Use
If port 5173 (frontend) or 3001 (backend) is already in use:

**Frontend:**
```bash
npm start --prefix frontend -- --port 5174
```

**Backend:**
Edit `backend/.env` and change PORT variable

### Dependencies Not Installed
```bash
npm install --prefix frontend
npm install --prefix backend
```

### TypeScript Errors
```bash
npm run build --prefix frontend
npm run build --prefix backend
```

### Clear Cache
```bash
# Frontend
rm -r frontend/node_modules frontend/dist
npm install --prefix frontend

# Backend
rm -r backend/node_modules backend/dist
npm install --prefix backend
```

---

## Verification Checklist

✅ Frontend package.json has `start` script
✅ Backend package.json has `start` script
✅ Vite config configured for port 5173
✅ API proxy configured (localhost:3001)
✅ Socket.io proxy configured
✅ TypeScript compilation passes
✅ All dependencies available

---

## Architecture

```
Frontend (Vite + React)
    ↓
    ├─ API Calls → http://localhost:3001/api
    └─ WebSocket → http://localhost:3001/socket.io
    
Backend (Express + SQLite)
    ↓
    └─ Database: mcc_db.sqlite
```

---

## Next Steps

1. Start backend: `npm start --prefix backend`
2. Start frontend: `npm start --prefix frontend`
3. Open browser: http://localhost:5173
4. Login with credentials
5. Start developing!

---

## Support

For issues or questions, check:
- `frontend/vite.config.ts` - Frontend configuration
- `backend/server.ts` - Backend entry point
- `backend/.env` - Backend environment variables
- `.kiro/steering/` - Development guides
