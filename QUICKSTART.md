# Quick Start Guide - Guires Marketing Control Center

## 5-Minute Setup

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd guires-marketing-control-center
npm install:all
```

### 2. Configure Environment
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

### 3. Start Development
```bash
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api/v1
- **Login**: admin@example.com / admin123

---

## Project Structure

```
├── backend/          # Express API
├── frontend/         # React + Vite
├── api/             # Vercel serverless
├── SETUP.md         # Detailed setup
├── DEPLOYMENT.md    # Deploy guide
└── TROUBLESHOOTING.md # Help
```

---

## Common Commands

```bash
# Development
npm run dev              # Start both servers
npm run dev:backend     # Backend only
npm run dev:frontend    # Frontend only

# Building
npm run build           # Build both
npm run build:backend   # Backend only
npm run build:frontend  # Frontend only

# Testing
npm test               # Run all tests
npm run test:backend   # Backend tests
npm run test:frontend  # Frontend tests

# Installation
npm install:all        # Install all dependencies
```

---

## Environment Variables

### Backend (backend/.env)
```
NODE_ENV=development
PORT=3001
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$2a$10$KL271sXgLncfLQGyT7q/cOz.vYl1CiIy7tsaGWEgDe.b1cbosXMxq
JWT_SECRET=your-secret-key
DB_CLIENT=sqlite
CORS_ORIGIN=http://localhost:5173
```

### Frontend (frontend/.env.local)
```
VITE_API_URL=http://localhost:3001/api/v1
VITE_ENVIRONMENT=development
```

---

## Troubleshooting

### Port in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Dependencies Error
```bash
npm cache clean --force
npm install:all
```

### Build Error
```bash
npm run build:backend
npm run build:frontend
```

---

## Next Steps

1. **Read SETUP.md** - Detailed setup instructions
2. **Read DEPLOYMENT.md** - Deploy to production
3. **Read TROUBLESHOOTING.md** - Common issues
4. **Explore Code** - Check backend/ and frontend/ directories

---

## Features

✅ User Authentication (JWT)
✅ Asset Management
✅ SEO Tools
✅ Analytics Dashboard
✅ QC Workflow
✅ Real-time Updates (Socket.io)
✅ Responsive Design

---

## Support

- Check TROUBLESHOOTING.md for common issues
- Review error messages in console
- Check GitHub issues
- Contact development team

---

**Status**: ✅ Ready to Start
