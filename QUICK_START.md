# Quick Start Guide

**Marketing Control Center - Get Started in 5 Minutes**

---

## 🚀 Local Development Setup

### 1. Clone & Install
```bash
git clone <repository-url>
cd guires-marketing-control-center
npm run install:all
```

### 2. Setup Environment
```bash
npm run setup
```

### 3. Start Development
```bash
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

---

## 📖 Documentation Quick Links

| Need | Document | Time |
|------|----------|------|
| Project overview | README.md | 5 min |
| Complete guide | DOCUMENTATION.md | 15 min |
| Frontend dev | FRONTEND_GUIDE.md | 20 min |
| Backend dev | BACKEND_GUIDE.md | 20 min |
| Database info | DATABASE_GUIDE.md | 15 min |
| API reference | API_REFERENCE.md | 10 min |
| Deployment | DEPLOYMENT_GUIDE.md | 15 min |
| Navigation | DOCUMENTATION_INDEX.md | 5 min |

---

## 🛠️ Common Commands

### Development
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend    # Frontend only
npm run dev:backend     # Backend only
```

### Building
```bash
npm run build           # Build both
npm run build:frontend  # Frontend only
npm run build:backend   # Backend only
```

### Installation
```bash
npm run install:all     # Install all dependencies
```

---

## 🔑 Key Features

- 📊 Dashboard & Analytics
- 📁 Project Management
- 🎯 Campaign Tracking
- 📝 Content Management
- 🔗 SEO & Backlinks
- 📱 Social Media Management
- ✅ Quality Control
- 👥 HR Management
- ⚙️ Master Configuration
- 💬 Communication Hub
- 🔌 Integrations
- 🔄 Real-time Updates

---

## 📁 Project Structure

```
frontend/          React application (60+ pages)
backend/           Express API (34+ controllers)
api/               Vercel serverless functions
```

---

## 🔐 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/mcc_db
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api/v1
VITE_GOOGLE_GEMINI_KEY=your-api-key
```

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
lsof -i :3001
kill -9 <PID>
```

**Dependencies issue?**
```bash
rm -rf node_modules
npm run install:all
```

**Database connection error?**
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Ensure database exists

---

## 📚 Technology Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS  
**Backend**: Node.js, Express, TypeScript  
**Database**: PostgreSQL 14+ or SQLite  
**Real-time**: Socket.IO

---

## 🎯 Next Steps

1. ✅ Run `npm run install:all`
2. ✅ Run `npm run setup`
3. ✅ Run `npm run dev`
4. ✅ Open http://localhost:5173
5. ✅ Read DOCUMENTATION_INDEX.md for detailed guides

---

## 📞 Need Help?

- Check **DOCUMENTATION_INDEX.md** for navigation
- Search within documentation files (Ctrl+F)
- Review code examples in guides
- Check troubleshooting sections

---

## 🚀 Ready to Code?

Start with your role:

**Frontend Developer** → Read FRONTEND_GUIDE.md  
**Backend Developer** → Read BACKEND_GUIDE.md  
**DevOps** → Read DEPLOYMENT_GUIDE.md  
**Full Stack** → Read DOCUMENTATION.md

---

**Happy coding! 🎉**

Version: 2.5.0 | Last Updated: January 2026
