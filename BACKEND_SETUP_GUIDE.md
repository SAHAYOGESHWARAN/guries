# Backend Setup Guide - Marketing Control Center

Complete guide to set up and run the backend server with PostgreSQL database.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

## 🚀 Quick Start (5 Minutes)

### Step 1: Install PostgreSQL

#### Windows:
1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432`

#### Mac (using Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Configure Environment Variables

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the example environment file:
```bash
copy .env.example .env
```

3. Edit `.env` file with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mcc_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js (web framework)
- PostgreSQL driver (pg)
- Socket.io (real-time communication)
- TypeScript and development tools

### Step 4: Setup Database

Run the automated database setup script:

```bash
node setup-database.js
```

This script will:
- ✅ Create the `mcc_db` database
- ✅ Create all tables from `schema.sql`
- ✅ Insert sample data (users, brands, countries, etc.)
- ✅ Verify the setup

**Expected Output:**
```
🚀 Starting database setup...
📋 Checking if database "mcc_db" exists...
📦 Creating database "mcc_db"...
✅ Database "mcc_db" created successfully!
🔌 Connecting to database "mcc_db"...
📄 Reading schema.sql file...
🔨 Executing schema SQL...
✅ Database schema created successfully!
📊 Inserting sample data...
   ✓ Sample users inserted
   ✓ Sample brands inserted
   ✓ Sample countries inserted
✅ Sample data inserted successfully!
🎉 Database setup completed successfully!
```

### Step 5: Start the Backend Server

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm run build
npm start
```

**Expected Output:**
```
✅ Connected to PostgreSQL Database
🚀 Server running on port 3001
```

### Step 6: Verify Installation

Open your browser or use curl to test:

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-12-06T10:30:00.000Z"
}
```

## 📁 Project Structure

```
backend/
├── config/
│   └── db.ts                 # Database connection configuration
├── controllers/              # Business logic for each module
│   ├── serviceController.ts  # Service Master CRUD
│   ├── contentController.ts  # Content Repository CRUD
│   ├── configurationController.ts  # Master data (countries, etc.)
│   └── ... (40+ controllers)
├── routes/
│   └── api.ts               # API route definitions
├── db/                      # Database utilities
├── public/
│   └── uploads/             # File upload directory
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Example environment file
├── schema.sql               # Database schema
├── setup-database.js        # Database setup script
├── server.ts                # Main server file
├── socket.ts                # WebSocket configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
```

## 🗄️ Database Schema

The database includes the following main tables:

### Core Tables:
- **users** - User accounts and roles
- **projects** - Marketing projects
- **campaigns** - Marketing campaigns
- **tasks** - Task management

### Content Tables:
- **services** - Service Master (main services)
- **sub_services** - Sub-Service Master
- **content_repository** - Content assets
- **service_pages** - Service page tracking

### Master Data Tables:
- **countries** - Country Master
- **brands** - Brand Master
- **content_types** - Content Type Master
- **asset_types** - Asset Type Master
- **platforms** - Platform Master (social media)
- **industry_sectors** - Industry Sector Master
- **personas** - Persona Master
- **forms** - Form Master

### SEO & Analytics:
- **keywords** - Keyword tracking
- **backlinks** - Backlink management
- **competitors** - Competitor tracking
- **url_errors** - URL error tracking
- **on_page_seo_audits** - SEO audit results

### QC & Workflow:
- **qc_runs** - Quality control runs
- **qc_checklists** - QC checklists
- **workflow_stages** - Workflow stage definitions

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Services
```
GET    /api/v1/services          # Get all services
POST   /api/v1/services          # Create service
PUT    /api/v1/services/:id      # Update service
DELETE /api/v1/services/:id      # Delete service

GET    /api/v1/sub-services      # Get all sub-services
POST   /api/v1/sub-services      # Create sub-service
PUT    /api/v1/sub-services/:id  # Update sub-service
DELETE /api/v1/sub-services/:id  # Delete sub-service
```

### Content Repository
```
GET    /api/v1/content           # Get all content
POST   /api/v1/content           # Create content
PUT    /api/v1/content/:id       # Update content
DELETE /api/v1/content/:id       # Delete content
```

### Master Data
```
GET    /api/v1/countries         # Get all countries
POST   /api/v1/countries         # Create country
PUT    /api/v1/countries/:id     # Update country
DELETE /api/v1/countries/:id     # Delete country

GET    /api/v1/brands            # Get all brands
GET    /api/v1/content-types     # Get all content types
GET    /api/v1/asset-types       # Get all asset types
GET    /api/v1/platforms         # Get all platforms
GET    /api/v1/industry-sectors  # Get all industries
GET    /api/v1/personas          # Get all personas
GET    /api/v1/forms             # Get all forms
```

### Users & Teams
```
GET    /api/v1/users             # Get all users
POST   /api/v1/users             # Create user
PUT    /api/v1/users/:id         # Update user
DELETE /api/v1/users/:id         # Delete user

GET    /api/v1/teams             # Get all teams
```

### Campaigns & Projects
```
GET    /api/v1/campaigns         # Get all campaigns
GET    /api/v1/projects          # Get all projects
GET    /api/v1/tasks             # Get all tasks
```

**Full API documentation:** See `backend/routes/api.ts` for complete endpoint list.

## 🔄 Real-Time Updates (WebSocket)

The backend uses Socket.io for real-time updates. When data changes, events are emitted:

### Event Format:
```javascript
// Create event
socket.emit('country_created', newCountry);

// Update event
socket.emit('country_updated', updatedCountry);

// Delete event
socket.emit('country_deleted', { id: countryId });
```

### Supported Events:
- `service_created`, `service_updated`, `service_deleted`
- `sub_service_created`, `sub_service_updated`, `sub_service_deleted`
- `content_created`, `content_updated`, `content_deleted`
- `country_created`, `country_updated`, `country_deleted`
- And many more...

## 🛠️ Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   # Windows
   services.msc  # Look for PostgreSQL service
   
   # Mac
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Check credentials in `.env` file
3. Test connection manually:
   ```bash
   psql -U postgres -h localhost
   ```

### Issue: "Port 3001 already in use"

**Solution:**
1. Change PORT in `.env` file:
   ```env
   PORT=3002
   ```
2. Or kill the process using port 3001:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:3001 | xargs kill -9
   ```

### Issue: "Cannot find module 'express'"

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Schema.sql execution failed"

**Solution:**
1. Drop and recreate database:
   ```sql
   DROP DATABASE IF EXISTS mcc_db;
   CREATE DATABASE mcc_db;
   ```
2. Run setup script again:
   ```bash
   node setup-database.js
   ```

### Issue: "CORS error from frontend"

**Solution:**
Update `FRONTEND_URL` in `.env`:
```env
FRONTEND_URL=http://localhost:5173
```

## 📊 Database Management

### View Database Tables:
```bash
psql -U postgres -d mcc_db
\dt  # List all tables
\d services  # Describe services table
```

### Backup Database:
```bash
pg_dump -U postgres mcc_db > backup.sql
```

### Restore Database:
```bash
psql -U postgres mcc_db < backup.sql
```

### Reset Database:
```bash
psql -U postgres
DROP DATABASE mcc_db;
CREATE DATABASE mcc_db;
\q
node setup-database.js
```

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use strong passwords** for database
3. **Change JWT_SECRET** in production
4. **Enable SSL** for PostgreSQL in production
5. **Use environment-specific configs** for dev/staging/prod

## 📝 Development Workflow

1. **Make changes** to controllers or routes
2. **Server auto-reloads** (if using `npm run dev`)
3. **Test endpoints** using Postman or curl
4. **Check logs** in terminal for errors
5. **Commit changes** to version control

## 🚀 Deployment

### Production Checklist:
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong passwords and secrets
- [ ] Enable SSL for database connection
- [ ] Set up proper logging
- [ ] Configure firewall rules
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Enable HTTPS
- [ ] Set up automated backups

### Deploy with PM2:
```bash
npm install -g pm2
npm run build
pm2 start dist/server.js --name mcc-backend
pm2 save
pm2 startup
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs in terminal
3. Check PostgreSQL logs
4. Verify all environment variables are set correctly

## 🎉 Success!

Your backend is now running! You can:
- ✅ Access API at `http://localhost:3001`
- ✅ View health status at `http://localhost:3001/health`
- ✅ Connect frontend to backend
- ✅ Start building features

**Next Steps:**
1. Start the frontend: `npm run dev` (in root directory)
2. Open browser: `http://localhost:5173`
3. Test the Country Master feature
4. Verify real-time updates work

Happy coding! 🚀
