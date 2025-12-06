# Complete Setup Guide - Marketing Control Center

Full-stack application setup guide for both frontend and backend.

## 🎯 Overview

Marketing Control Center (MCC) is a comprehensive enterprise application for managing:
- Services & Sub-Services
- Content Repository & Assets
- Campaigns & Projects
- SEO & Analytics
- Team Management
- Quality Control

**Tech Stack:**
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL
- **Real-time:** Socket.io

## 📋 Prerequisites

Install these before starting:

1. **Node.js** (v16+) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12+) - [Download](https://www.postgresql.org/download/)
3. **Git** (optional) - [Download](https://git-scm.com/)

## 🚀 Complete Setup (10 Minutes)

### Step 1: Install PostgreSQL

#### Windows:
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer, remember the `postgres` password
3. Default port: `5432`

#### Mac:
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Linux:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Copy environment file
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux

# Edit .env and update these values:
# DB_PASSWORD=your_postgres_password
# DB_NAME=mcc_db
# DB_USER=postgres

# Install dependencies
npm install

# Setup database (creates tables and sample data)
node setup-database.js

# Start backend server
npm run dev
```

**Expected Output:**
```
✅ Connected to PostgreSQL Database
🚀 Server running on port 3001
```

### Step 3: Setup Frontend

Open a **new terminal** window:

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Access Application

Open your browser and go to:
```
http://localhost:5173
```

You should see the Marketing Control Center dashboard!

## 📁 Project Structure

```
marketing-control-center/
├── backend/                      # Backend API server
│   ├── config/
│   │   └── db.ts                # Database configuration
│   ├── controllers/             # Business logic (40+ controllers)
│   │   ├── serviceController.ts
│   │   ├── contentController.ts
│   │   ├── configurationController.ts
│   │   └── ...
│   ├── routes/
│   │   └── api.ts              # API routes
│   ├── .env                    # Environment variables (create this)
│   ├── .env.example            # Example environment file
│   ├── schema.sql              # Database schema
│   ├── setup-database.js       # Database setup script
│   ├── server.ts               # Main server file
│   ├── socket.ts               # WebSocket configuration
│   └── package.json
│
├── views/                       # React views/pages
│   ├── ServiceMasterView.tsx   # Service Master page
│   ├── SubServiceMasterView.tsx
│   ├── CountryMasterView.tsx
│   ├── ContentRepositoryView.tsx
│   └── ...
│
├── components/                  # Reusable React components
│   ├── Table.tsx
│   ├── Modal.tsx
│   ├── AssetLinker.tsx
│   └── ...
│
├── hooks/                       # Custom React hooks
│   └── useData.ts              # Data fetching hook
│
├── utils/                       # Utility functions
│   ├── storage.ts              # Local storage management
│   └── csvHelper.ts            # CSV export
│
├── App.tsx                      # Main React app
├── index.tsx                    # React entry point
├── types.ts                     # TypeScript types
├── constants.tsx                # App constants
├── package.json                 # Frontend dependencies
└── vite.config.ts              # Vite configuration
```

## 🔧 Configuration Files

### Backend `.env` File

Create `backend/.env` from `backend/.env.example`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mcc_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# JWT (optional for now)
JWT_SECRET=your_secret_key_here
```

### Frontend Environment

The frontend automatically connects to `http://localhost:3001` for the backend API.

## 🗄️ Database Tables

The setup script creates these tables:

### Master Data:
- `countries` - Country Master
- `brands` - Brand Master
- `content_types` - Content Type Master
- `asset_types` - Asset Type Master
- `platforms` - Social Media Platforms
- `industry_sectors` - Industry Sectors
- `personas` - Buyer Personas
- `forms` - Form Master

### Core Entities:
- `services` - Service Master
- `sub_services` - Sub-Service Master
- `content_repository` - Content Assets
- `service_pages` - Service Pages
- `users` - User Management
- `teams` - Team Management
- `projects` - Projects
- `campaigns` - Campaigns
- `tasks` - Task Management

### SEO & Analytics:
- `keywords` - Keyword Tracking
- `backlinks` - Backlink Management
- `competitors` - Competitor Analysis
- `url_errors` - URL Error Tracking
- `on_page_seo_audits` - SEO Audits

## ✅ Testing the Setup

### 1. Test Backend Health

Open browser or use curl:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-12-06T10:30:00.000Z"
}
```

### 2. Test Country Master

1. Open `http://localhost:5173`
2. Navigate to **Configuration** → **Country Master**
3. Click **Add Country**
4. Fill in:
   - Country Name: "Germany"
   - Code: "DE"
   - Region: "Europe"
5. Click **Submit**
6. **New country should appear immediately** (no refresh needed!)

### 3. Test Service Master

1. Navigate to **Services** → **Service Master**
2. Click **Add Service**
3. Fill in service details
4. Go to **Linking** tab
5. Search for assets and link them
6. **Assets should link immediately**

### 4. Test Real-Time Updates

1. Open the app in **two browser windows**
2. In window 1: Add a new country
3. In window 2: **Country should appear automatically** (via WebSocket)

## 🔄 Common Workflows

### Adding a New Service

1. **Service Master** → **Add Service**
2. Fill in **Core** tab (name, code, description)
3. Fill in **SEO** tab (meta title, keywords)
4. Fill in **SMM** tab (social media metadata)
5. Go to **Linking** tab
6. Search and link content assets
7. Click **Save**

### Linking Assets to Services

1. Edit a service
2. Go to **Linking** tab
3. All available assets show automatically
4. Type in search box to filter
5. Click asset to link
6. Asset moves to "Linked Assets" immediately

### Managing Content Repository

1. **Content** → **Content Repository**
2. Add new content asset
3. Fill in metadata (title, type, status)
4. Asset is now available for linking to services

## 🛠️ Troubleshooting

### Backend won't start

**Error:** "Database connection failed"

**Solution:**
1. Check PostgreSQL is running
2. Verify credentials in `backend/.env`
3. Test connection:
   ```bash
   psql -U postgres -h localhost
   ```

### Frontend can't connect to backend

**Error:** "Network Error" or "Failed to fetch"

**Solution:**
1. Verify backend is running on port 3001
2. Check `FRONTEND_URL` in `backend/.env`
3. Check browser console for CORS errors

### Assets not showing in linking

**Solution:**
1. Make sure you've saved the service first
2. Check that content assets exist in Content Repository
3. Verify `linked_service_ids` field in database

### Changes not appearing immediately

**Solution:**
1. Check browser console for errors
2. Verify WebSocket connection (look for Socket.io logs)
3. Hard refresh browser (Ctrl+Shift+R)

### Port already in use

**Error:** "Port 3001 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

## 📊 Database Management

### View all tables:
```bash
psql -U postgres -d mcc_db
\dt
```

### View table structure:
```sql
\d services
\d countries
```

### Query data:
```sql
SELECT * FROM countries;
SELECT * FROM services;
SELECT * FROM content_repository;
```

### Reset database:
```bash
psql -U postgres
DROP DATABASE mcc_db;
CREATE DATABASE mcc_db;
\q
cd backend
node setup-database.js
```

## 🚀 Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend:** Changes auto-refresh in browser
- **Backend:** Server auto-restarts (using nodemon)

### Debugging

**Frontend:**
- Use React DevTools browser extension
- Check browser console for errors
- Use `console.log()` for debugging

**Backend:**
- Check terminal for server logs
- Add `console.log()` in controllers
- Use Postman to test API endpoints

### Code Organization

- **Views** = Full pages (ServiceMasterView, CountryMasterView)
- **Components** = Reusable UI pieces (Table, Modal, AssetLinker)
- **Hooks** = Custom React hooks (useData for API calls)
- **Controllers** = Backend business logic
- **Routes** = API endpoint definitions

## 📝 API Endpoints Reference

### Services
```
GET    /api/v1/services
POST   /api/v1/services
PUT    /api/v1/services/:id
DELETE /api/v1/services/:id
```

### Content
```
GET    /api/v1/content
POST   /api/v1/content
PUT    /api/v1/content/:id
DELETE /api/v1/content/:id
```

### Countries
```
GET    /api/v1/countries
POST   /api/v1/countries
PUT    /api/v1/countries/:id
DELETE /api/v1/countries/:id
```

**Full API list:** See `backend/routes/api.ts`

## 🎉 Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Backend `.env` file configured
- [ ] Database created with `setup-database.js`
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can access app at `http://localhost:5173`
- [ ] Can add/edit/delete countries
- [ ] Can link assets to services
- [ ] Changes appear immediately (no refresh needed)
- [ ] Real-time updates work across browser windows

## 📚 Additional Resources

- **Backend Setup:** See `BACKEND_SETUP_GUIDE.md`
- **Asset Linking Fix:** See `ASSET_LINKING_FIX.md`
- **Database Schema:** See `backend/schema.sql`
- **API Routes:** See `backend/routes/api.ts`

## 🆘 Getting Help

If you're stuck:
1. Check the troubleshooting section above
2. Review the error messages in terminal/console
3. Verify all prerequisites are installed
4. Make sure both frontend and backend are running
5. Check that database is accessible

## 🎊 You're All Set!

Your Marketing Control Center is now fully operational!

**What you can do now:**
- ✅ Manage services and sub-services
- ✅ Create and organize content assets
- ✅ Link assets to services dynamically
- ✅ Track campaigns and projects
- ✅ Manage master data (countries, brands, etc.)
- ✅ Monitor SEO and analytics
- ✅ Collaborate with team members

**Happy building! 🚀**
