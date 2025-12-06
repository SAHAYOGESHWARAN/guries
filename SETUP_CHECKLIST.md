# Setup Checklist - Marketing Control Center

Use this checklist to ensure everything is properly set up.

## 📋 Pre-Setup Checklist

### Software Installation
- [ ] Node.js (v16+) installed
  - Check: `node --version`
- [ ] npm installed
  - Check: `npm --version`
- [ ] PostgreSQL (v12+) installed
  - Check: `psql --version`
- [ ] PostgreSQL service running
  - Windows: Check Services
  - Mac: `brew services list`
  - Linux: `sudo systemctl status postgresql`

## 🔧 Backend Setup Checklist

### Configuration
- [ ] Navigate to `backend/` directory
- [ ] `.env.example` file exists
- [ ] Created `.env` file from `.env.example`
- [ ] Updated `DB_PASSWORD` in `.env`
- [ ] Updated `DB_USER` in `.env` (if not using 'postgres')
- [ ] Updated `DB_NAME` in `.env` (if not using 'mcc_db')
- [ ] Updated `DB_HOST` in `.env` (if not using 'localhost')
- [ ] Updated `DB_PORT` in `.env` (if not using '5432')

### Dependencies
- [ ] Ran `npm install` in backend directory
- [ ] No errors during installation
- [ ] `node_modules/` folder created
- [ ] `package-lock.json` created

### Database Setup
- [ ] Ran `node setup-database.js`
- [ ] Database `mcc_db` created successfully
- [ ] All tables created (40+ tables)
- [ ] Sample data inserted
- [ ] No errors in console output

### Backend Server
- [ ] Ran `npm run dev`
- [ ] Server started on port 3001
- [ ] "Connected to PostgreSQL Database" message shown
- [ ] No connection errors
- [ ] Health endpoint accessible: http://localhost:3001/health

## 🎨 Frontend Setup Checklist

### Configuration
- [ ] Navigate to project root directory
- [ ] `package.json` exists
- [ ] `vite.config.ts` exists

### Dependencies
- [ ] Ran `npm install` in root directory
- [ ] No errors during installation
- [ ] `node_modules/` folder created
- [ ] `package-lock.json` created

### Frontend Server
- [ ] Ran `npm run dev`
- [ ] Server started on port 5173
- [ ] No compilation errors
- [ ] Browser opens automatically or manually open http://localhost:5173

## ✅ Verification Checklist

### Backend Verification
- [ ] Health check works: http://localhost:3001/health
  - Expected: `{"status":"OK","timestamp":"..."}`
- [ ] API endpoint works: http://localhost:3001/api/v1/countries
  - Expected: JSON array of countries
- [ ] No errors in backend terminal
- [ ] WebSocket connection established (check console logs)

### Frontend Verification
- [ ] Application loads in browser
- [ ] No errors in browser console
- [ ] Navigation menu visible
- [ ] Can navigate between pages

### Database Verification
- [ ] Can connect to database:
  ```bash
  psql -U postgres -d mcc_db
  ```
- [ ] Tables exist:
  ```sql
  \dt
  ```
- [ ] Sample data exists:
  ```sql
  SELECT * FROM countries;
  SELECT * FROM users;
  SELECT * FROM brands;
  ```

## 🧪 Functionality Testing Checklist

### Country Master Test
- [ ] Navigate to Configuration → Country Master
- [ ] Page loads without errors
- [ ] Sample countries visible (US, UK, CA, AU, IN)
- [ ] Click "Add Country" button
- [ ] Modal opens
- [ ] Fill in form:
  - Country Name: "Germany"
  - Code: "DE"
  - Region: "Europe"
  - Check "Backlinks", "Content", "SMM"
  - Status: "Active"
- [ ] Click "Submit"
- [ ] **New country appears immediately** (no refresh needed)
- [ ] Click "Edit" on Germany
- [ ] Change name to "Deutschland"
- [ ] Click "Save"
- [ ] **Name updates immediately**
- [ ] Click "Del" on Deutschland
- [ ] Confirm deletion
- [ ] **Country disappears immediately**

### Service Master Test
- [ ] Navigate to Services → Service Master
- [ ] Page loads without errors
- [ ] Click "Add Service"
- [ ] Full-screen form opens
- [ ] Fill in Core tab:
  - Service Name: "Test Service"
  - Service Code: "TEST-001"
- [ ] Click "Save Service"
- [ ] **Service appears in list immediately**
- [ ] Click "Edit" on Test Service
- [ ] Go to "Linking" tab
- [ ] **Available assets show immediately** (no search needed)
- [ ] Type in search box
- [ ] **Assets filter as you type**
- [ ] Click an asset
- [ ] **Asset moves to "Attached Assets" immediately**
- [ ] Click X on linked asset
- [ ] **Asset moves back to available immediately**

### Content Repository Test
- [ ] Navigate to Content → Content Repository
- [ ] Page loads without errors
- [ ] Click "Add Content"
- [ ] Fill in form:
  - Title: "Test Article"
  - Asset Type: "Blog"
  - Status: "Draft"
- [ ] Click "Save"
- [ ] **Content appears immediately**
- [ ] Edit content
- [ ] Change status to "Published"
- [ ] **Status updates immediately**

### Real-Time Update Test
- [ ] Open app in **two browser windows** side-by-side
- [ ] In Window 1: Add a new country
- [ ] In Window 2: **Country should appear automatically**
- [ ] In Window 2: Edit the country
- [ ] In Window 1: **Changes should appear automatically**
- [ ] In Window 1: Delete the country
- [ ] In Window 2: **Country should disappear automatically**

## 🔍 Troubleshooting Checklist

### If Backend Won't Start
- [ ] PostgreSQL is running
- [ ] Credentials in `.env` are correct
- [ ] Port 3001 is not in use
- [ ] Database `mcc_db` exists
- [ ] Ran `node setup-database.js`

### If Frontend Won't Start
- [ ] Node modules installed (`npm install`)
- [ ] Port 5173 is not in use
- [ ] No syntax errors in code
- [ ] Vite config is correct

### If Data Doesn't Update
- [ ] Backend is running
- [ ] Frontend is running
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] WebSocket connection established
- [ ] Check Network tab in browser DevTools

### If Assets Won't Link
- [ ] Service is saved (has an ID)
- [ ] Content assets exist in repository
- [ ] No errors in console
- [ ] Try refreshing the page
- [ ] Check `linked_service_ids` in database

## 📊 Performance Checklist

### Backend Performance
- [ ] API responses < 200ms
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] Connection pool working

### Frontend Performance
- [ ] Page loads < 2 seconds
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Bundle size reasonable

## 🔐 Security Checklist

### Configuration Security
- [ ] `.env` file not committed to git
- [ ] Strong database password used
- [ ] JWT secret changed from default
- [ ] CORS configured correctly

### Code Security
- [ ] No hardcoded credentials
- [ ] SQL queries parameterized
- [ ] Input validation in place
- [ ] Error messages don't expose sensitive info

## 📝 Documentation Checklist

### Files to Review
- [ ] Read `QUICK_START.md`
- [ ] Read `COMPLETE_SETUP_GUIDE.md`
- [ ] Read `BACKEND_SETUP_GUIDE.md`
- [ ] Review `ARCHITECTURE_DIAGRAM.md`
- [ ] Check `IMPLEMENTATION_SUMMARY.md`

### Understanding
- [ ] Understand project structure
- [ ] Know how to start backend
- [ ] Know how to start frontend
- [ ] Know how to reset database
- [ ] Know where to find API endpoints
- [ ] Understand data flow
- [ ] Know how real-time updates work

## 🚀 Production Readiness Checklist

### Before Deploying
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables configured for production
- [ ] Database backed up
- [ ] SSL certificates ready
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Logging configured
- [ ] Error tracking enabled

### Deployment
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Database migrated
- [ ] Environment variables set
- [ ] Health checks passing
- [ ] SSL working
- [ ] Domain resolving

## ✨ Final Verification

### Everything Works
- [ ] Backend running smoothly
- [ ] Frontend loading correctly
- [ ] Database connected
- [ ] Real-time updates working
- [ ] All CRUD operations working
- [ ] Asset linking working
- [ ] No errors in console
- [ ] No errors in terminal
- [ ] Performance acceptable
- [ ] Security measures in place

## 🎉 Success!

If all items are checked, congratulations! Your Marketing Control Center is fully operational! 🚀

### Next Steps:
1. Start building your services
2. Add content to repository
3. Create campaigns and projects
4. Invite team members
5. Track your marketing efforts

### Need Help?
- Review documentation files
- Check troubleshooting sections
- Verify all checklist items
- Check error messages carefully

**Happy marketing! 📈**
