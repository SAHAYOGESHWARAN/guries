# Setup Guide - Guires Marketing Control Center

## Quick Start (5 minutes)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd guires-marketing-control-center
```

### 2. Install Dependencies
```bash
npm install:all
```

### 3. Configure Environment
```bash
# Copy example to local
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

### 4. Start Development
```bash
npm run dev
```

Access at: http://localhost:5173

**Login Credentials:**
- Email: admin@example.com
- Password: admin123

---

## Detailed Setup

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Git

### Installation Steps

#### 1. Clone Repository
```bash
git clone <your-repo-url>
cd guires-marketing-control-center
```

#### 2. Install Root Dependencies
```bash
npm install
```

#### 3. Install Backend Dependencies
```bash
cd backend
npm install --legacy-peer-deps
cd ..
```

#### 4. Install Frontend Dependencies
```bash
cd frontend
npm install --legacy-peer-deps
cd ..
```

#### 5. Configure Environment Variables

**Backend Configuration (backend/.env)**
```bash
NODE_ENV=development
PORT=3001
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$2a$10$KL271sXgLncfLQGyT7q/cOz.vYl1CiIy7tsaGWEgDe.b1cbosXMxq
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
DB_CLIENT=sqlite
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

**Frontend Configuration (frontend/.env.local)**
```bash
VITE_API_URL=http://localhost:3001/api/v1
VITE_ENVIRONMENT=development
```

### Development

#### Start Backend
```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:3001

#### Start Frontend (in another terminal)
```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

#### Or Start Both Together
```bash
npm run dev
```

### Building

#### Build Backend
```bash
cd backend
npm run build
```

Output: `backend/dist/`

#### Build Frontend
```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

#### Build Both
```bash
npm run build
```

### Testing

#### Backend Tests
```bash
cd backend
npm test
```

#### Frontend Tests
```bash
cd frontend
npm test
```

#### All Tests
```bash
npm test
```

---

## Project Structure

```
guires-marketing-control-center/
├── api/                      # Vercel serverless functions
│   └── index.ts             # API entry point
├── backend/                 # Express.js API
│   ├── controllers/         # Route handlers
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── config/             # Configuration
│   ├── database/           # Database setup
│   ├── migrations/         # Database migrations
│   ├── app.ts              # Express app
│   ├── server.ts           # Server setup
│   ├── socket.ts           # Socket.io setup
│   └── package.json        # Backend dependencies
├── frontend/               # React + Vite
│   ├── src/               # Source code
│   ├── components/        # React components
│   ├── views/            # Page views
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utilities
│   ├── styles/           # CSS styles
│   ├── public/           # Static assets
│   ├── index.html        # HTML entry
│   ├── App.tsx           # Root component
│   └── package.json      # Frontend dependencies
├── scripts/              # Utility scripts
├── tools/                # Development tools
├── package.json          # Root package
├── vercel.json          # Vercel config
├── DEPLOYMENT.md        # Deployment guide
├── SETUP.md            # This file
└── README.md           # Project overview
```

---

## Common Commands

### Development
```bash
npm run dev              # Start both servers
npm run dev:frontend    # Start frontend only
npm run dev:backend     # Start backend only
```

### Building
```bash
npm run build           # Build both
npm run build:frontend  # Build frontend
npm run build:backend   # Build backend
```

### Testing
```bash
npm test               # Run all tests
npm run test:frontend  # Frontend tests
npm run test:backend   # Backend tests
```

### Installation
```bash
npm install:all        # Install all dependencies
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules backend/node_modules frontend/node_modules

# Reinstall
npm install:all
```

### Build Errors
```bash
# Check Node version
node --version  # Should be 20.x

# Clear build artifacts
rm -rf backend/dist frontend/dist

# Rebuild
npm run build
```

### Database Issues
- SQLite is used for development (auto-created)
- Check `backend/mcc_db.sqlite` exists
- For PostgreSQL, set `DB_CLIENT=pg` and provide connection string

### API Not Responding
```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Check logs in terminal
# Look for error messages
```

### Frontend Not Loading
```bash
# Check if frontend is running
curl http://localhost:5173

# Check browser console for errors
# Verify VITE_API_URL in .env.local
```

---

## Environment Variables Reference

### Backend (.env)
| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Environment mode |
| PORT | 3001 | Server port |
| ADMIN_EMAIL | admin@example.com | Admin email |
| ADMIN_PASSWORD | (hash) | Admin password hash |
| JWT_SECRET | (required) | JWT signing key |
| JWT_EXPIRES_IN | 7d | Token expiration |
| DB_CLIENT | sqlite | Database type |
| CORS_ORIGIN | http://localhost:5173 | CORS origin |
| LOG_LEVEL | debug | Logging level |

### Frontend (.env.local)
| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:3001/api/v1 | API endpoint |
| VITE_ENVIRONMENT | development | Environment |

---

## Next Steps

1. **Development**: Start with `npm run dev`
2. **Explore**: Check out the codebase structure
3. **Customize**: Modify components and features
4. **Test**: Run tests before committing
5. **Deploy**: Follow DEPLOYMENT.md for production

---

## Support

For issues:
1. Check this guide
2. Review error messages
3. Check GitHub issues
4. Contact development team

---

**Status**: ✅ Ready for Development
