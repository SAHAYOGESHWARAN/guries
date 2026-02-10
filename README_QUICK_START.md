# Quick Start Guide

## 🚀 Start Local Development

### Terminal 1: Start Backend
```bash
npm run start:standalone --prefix backend
```
Backend runs on: `http://localhost:3001`

### Terminal 2: Start Frontend
```bash
npm run dev --prefix frontend
```
Frontend runs on: `http://localhost:5173`

---

## 🧪 Test API Endpoints

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Create Project
```bash
curl -X POST http://localhost:3001/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"project_name":"My Project","status":"active"}'
```

### Get Projects
```bash
curl http://localhost:3001/api/v1/projects
```

### Create Task
```bash
curl -X POST http://localhost:3001/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"task_name":"My Task","status":"pending","priority":"High"}'
```

### Get Tasks
```bash
curl http://localhost:3001/api/v1/tasks
```

---

## 📦 Build for Production

### Build Backend
```bash
npm run build --prefix backend
```

### Build Frontend
```bash
npm run build --prefix frontend
```

Output: `frontend/dist/`

---

## 🌐 Deploy to Production

### Step 1: Deploy Backend
- Push to Railway or Render
- Get backend URL (e.g., `https://guires-backend.up.railway.app`)

### Step 2: Update Vercel Environment
- Go to Vercel dashboard
- Set `BACKEND_URL` environment variable
- Redeploy

### Step 3: Deploy Frontend
- Push to GitHub
- Vercel automatically deploys
- Access at `https://guries.vercel.app`

---

## 📋 What's Included

### Backend
- ✅ Standalone server with CRUD operations
- ✅ Projects and Tasks endpoints
- ✅ Health check endpoint
- ✅ CORS enabled
- ✅ Error handling

### Frontend
- ✅ 100+ components
- ✅ Projects page
- ✅ Tasks page
- ✅ API integration
- ✅ Offline mode

### Configuration
- ✅ vercel.json - Vercel setup
- ✅ api/backend-proxy.ts - API proxy
- ✅ Environment variables configured

---

## 🔗 Important URLs

### Local
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API: http://localhost:3001/api/v1

### Production
- Frontend: https://guries.vercel.app
- Backend: https://guires-backend.up.railway.app
- API: https://guries.vercel.app/api/v1

---

## 📚 Documentation

- `TEST_REPORT.md` - Complete test results
- `DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `FINAL_STATUS.md` - Full status report

---

## ✨ Features

- Full CRUD for Projects and Tasks
- Real-time data persistence
- Responsive UI
- Offline mode
- Production-ready

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <PID> /F
```

### Frontend won't build
```bash
# Clear node_modules and reinstall
rm -r frontend/node_modules
npm install --prefix frontend --legacy-peer-deps
npm run build --prefix frontend
```

### API not responding
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check BACKEND_URL in vercel.json
cat vercel.json | grep BACKEND_URL
```

---

**Status**: ✅ READY TO USE
