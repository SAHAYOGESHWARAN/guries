# Marketing Control Center - Comprehensive Testing Documentation

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Test Categories](#test-categories)
4. [API Endpoint Testing](#api-endpoint-testing)
5. [Frontend Page Testing](#frontend-page-testing)
6. [Realtime Functionality Testing](#realtime-functionality-testing)
7. [Database Testing](#database-testing)
8. [Test Execution](#test-execution)
9. [Known Issues & Resolutions](#known-issues--resolutions)
10. [Test Results](#test-results)

---

## Overview

This document provides comprehensive testing procedures for the Marketing Control Center (MCC) application. The system consists of:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Realtime**: Socket.IO
- **Ports**: Frontend (5173), Backend (3001)

---

## Prerequisites

### Required Software
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Environment Setup
1. **Database Setup**:
   ```bash
   # Create database
   createdb mcc_db
   
   # Run schema
   psql -U postgres -d mcc_db -f backend/db/schema.sql
   ```

2. **Environment Variables** (create `.env` in backend folder):
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=mcc_db
   DB_PASSWORD=your_password
   DB_PORT=5432
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

3. **Install Dependencies**:
   ```bash
   # Root
   npm install
   
   # Backend
   cd backend
   npm install
   ```

---

## Test Categories

### 1. System Health Tests
- Health check endpoint
- System statistics
- Database connectivity

### 2. API Endpoint Tests
- CRUD operations for all entities
- Master table endpoints
- Analytics endpoints
- HR endpoints
- Communication endpoints
- Integration endpoints

### 3. Frontend Page Tests
- All 60+ views/pages
- Navigation flow
- Component rendering
- Form submissions

### 4. Realtime Tests
- Socket.IO connection
- Event broadcasting
- Real-time updates

### 5. Database Tests
- Schema validation
- Foreign key constraints
- Index performance

---

## API Endpoint Testing

### Test Script
Run the automated test script:
```bash
node test-project.js
```

### Manual Testing Checklist

#### System Endpoints
- [ ] `GET /health` - Health check
- [ ] `GET /api/v1/system/stats` - System statistics

#### Dashboard Endpoints
- [ ] `GET /api/v1/dashboard/stats` - Dashboard statistics
- [ ] `GET /api/v1/notifications` - Notifications list
- [ ] `GET /api/v1/analytics/traffic` - Traffic data
- [ ] `GET /api/v1/analytics/kpi` - KPI summary
- [ ] `GET /api/v1/analytics/dashboard-metrics` - Dashboard metrics

#### Core CRUD Endpoints

**Projects**
- [ ] `GET /api/v1/projects` - List projects
- [ ] `POST /api/v1/projects` - Create project
- [ ] `GET /api/v1/projects/:id` - Get project
- [ ] `PUT /api/v1/projects/:id` - Update project
- [ ] `DELETE /api/v1/projects/:id` - Delete project

**Campaigns**
- [ ] `GET /api/v1/campaigns` - List campaigns
- [ ] `POST /api/v1/campaigns` - Create campaign
- [ ] `GET /api/v1/campaigns/:id` - Get campaign
- [ ] `PUT /api/v1/campaigns/:id` - Update campaign
- [ ] `DELETE /api/v1/campaigns/:id` - Delete campaign

**Tasks**
- [ ] `GET /api/v1/tasks` - List tasks
- [ ] `POST /api/v1/tasks` - Create task
- [ ] `PUT /api/v1/tasks/:id` - Update task
- [ ] `DELETE /api/v1/tasks/:id` - Delete task

**Content Repository**
- [ ] `GET /api/v1/content` - List content
- [ ] `POST /api/v1/content` - Create content
- [ ] `PUT /api/v1/content/:id` - Update content
- [ ] `DELETE /api/v1/content/:id` - Delete content
- [ ] `POST /api/v1/content/draft-from-service` - Create draft from service
- [ ] `POST /api/v1/content/publish-to-service/:id` - Publish to service

**Services**
- [ ] `GET /api/v1/services` - List services
- [ ] `POST /api/v1/services` - Create service
- [ ] `PUT /api/v1/services/:id` - Update service
- [ ] `DELETE /api/v1/services/:id` - Delete service

**Sub-Services**
- [ ] `GET /api/v1/sub-services` - List sub-services
- [ ] `POST /api/v1/sub-services` - Create sub-service
- [ ] `PUT /api/v1/sub-services/:id` - Update sub-service
- [ ] `DELETE /api/v1/sub-services/:id` - Delete sub-service

#### Master Tables
- [ ] `GET /api/v1/industry-sectors` - Industry sectors
- [ ] `GET /api/v1/content-types` - Content types
- [ ] `GET /api/v1/asset-types` - Asset types
- [ ] `GET /api/v1/platforms` - Platforms
- [ ] `GET /api/v1/countries` - Countries
- [ ] `GET /api/v1/seo-errors` - SEO errors
- [ ] `GET /api/v1/workflow-stages` - Workflow stages
- [ ] `GET /api/v1/roles` - User roles
- [ ] `GET /api/v1/qc-weightage-configs` - QC weightage configs

#### HR Endpoints
- [ ] `GET /api/v1/hr/workload` - Workload forecast
- [ ] `GET /api/v1/hr/rewards` - Reward recommendations
- [ ] `PUT /api/v1/hr/rewards/:id` - Update reward status
- [ ] `GET /api/v1/hr/rankings` - Employee rankings
- [ ] `GET /api/v1/hr/skills` - Employee skills
- [ ] `GET /api/v1/hr/achievements` - Employee achievements

#### Communication Endpoints
- [ ] `GET /api/v1/communication/emails` - Emails
- [ ] `POST /api/v1/communication/emails` - Create email
- [ ] `GET /api/v1/communication/voice-profiles` - Voice profiles
- [ ] `POST /api/v1/communication/voice-profiles` - Create voice profile
- [ ] `GET /api/v1/communication/calls` - Call logs
- [ ] `POST /api/v1/communication/calls` - Log call

#### Knowledge Base
- [ ] `GET /api/v1/knowledge/articles` - Articles
- [ ] `POST /api/v1/knowledge/articles` - Create article
- [ ] `PUT /api/v1/knowledge/articles/:id` - Update article
- [ ] `DELETE /api/v1/knowledge/articles/:id` - Delete article

#### Compliance
- [ ] `GET /api/v1/compliance/rules` - Compliance rules
- [ ] `POST /api/v1/compliance/rules` - Create rule
- [ ] `GET /api/v1/compliance/audits` - Compliance audits
- [ ] `POST /api/v1/compliance/audits` - Log audit

#### Integrations
- [ ] `GET /api/v1/integrations` - Integrations list
- [ ] `PUT /api/v1/integrations/:id` - Update integration
- [ ] `GET /api/v1/logs` - Integration logs
- [ ] `POST /api/v1/logs` - Create log

#### Settings
- [ ] `GET /api/v1/settings` - System settings
- [ ] `PUT /api/v1/settings/:key` - Update setting

---

## Frontend Page Testing

### All Pages/Views (60+)

#### Main Navigation
- [ ] **Dashboard** (`/dashboard`) - Main dashboard view
- [ ] **Projects** (`/projects`) - Projects list
- [ ] **Project Detail** (`/project-detail/:id`) - Project details
- [ ] **Campaigns** (`/campaigns`) - Campaigns list
- [ ] **Campaign Detail** (`/campaign-detail/:id`) - Campaign details
- [ ] **Tasks** (`/tasks`) - Tasks management
- [ ] **Assets** (`/assets`) - Assets library

#### Repositories
- [ ] **Content Repository** (`/content-repository`) - Content management
- [ ] **Service Pages** (`/service-pages`) - Service pages
- [ ] **SMM Posting** (`/smm-posting`) - Social media posts
- [ ] **Graphics Plan** (`/graphics-plan`) - Graphics planning
- [ ] **On-Page Errors** (`/on-page-errors`) - URL errors
- [ ] **Backlink Submission** (`/backlink-submission`) - Backlink submissions
- [ ] **Toxic Backlinks** (`/toxic-backlinks`) - Toxic backlinks
- [ ] **UX Issues** (`/ux-issues`) - UX issues tracking
- [ ] **Promotion Repository** (`/promotion-repository`) - Promotion items
- [ ] **Competitor Repository** (`/competitor-repository`) - Competitor data
- [ ] **Competitor Backlinks** (`/competitor-backlinks`) - Competitor backlinks

#### Configuration & Masters
- [ ] **Admin Console** (`/admin-console`) - Admin settings
- [ ] **Integrations** (`/integrations`) - Integration management
- [ ] **Performance Benchmark** (`/performance-benchmark`) - Performance benchmarks
- [ ] **Competitor Benchmark Master** (`/competitor-benchmark-master`) - Competitor benchmarks
- [ ] **Gold Standard Benchmark** (`/gold-standard-benchmark`) - Gold standards
- [ ] **Effort Target Config** (`/effort-target-config`) - Effort targets
- [ ] **Service & Sub-Service Master** (`/service-sub-service-master`) - Services master
- [ ] **Sub-Service Master** (`/sub-service-master`) - Sub-services master
- [ ] **Keyword Master** (`/keyword-master`) - Keywords management
- [ ] **Backlink Master** (`/backlink-master`) - Backlinks master
- [ ] **Industry Sector Master** (`/industry-sector-master`) - Industry sectors
- [ ] **Content Type Master** (`/content-type-master`) - Content types
- [ ] **Asset Type Master** (`/asset-type-master`) - Asset types
- [ ] **Platform Master** (`/platform-master`) - Platforms
- [ ] **Country Master** (`/country-master`) - Countries
- [ ] **SEO Error Type Master** (`/seo-error-type-master`) - SEO errors
- [ ] **Workflow Stage Master** (`/workflow-stage-master`) - Workflow stages
- [ ] **User Role Master** (`/user-role-master`) - User roles
- [ ] **Audit Checklists** (`/audit-checklists`) - Audit checklists
- [ ] **QC Weightage Config** (`/qc-weightage-config`) - QC weightage

#### Analytics & HR
- [ ] **Performance Dashboard** (`/performance-dashboard`) - Performance analytics
- [ ] **KPI Tracking** (`/kpi-tracking`) - KPI tracking
- [ ] **Traffic Ranking** (`/traffic-ranking`) - Traffic rankings
- [ ] **OKR Dashboard** (`/okr-dashboard`) - OKRs dashboard
- [ ] **Effort Dashboard** (`/effort-dashboard`) - Effort analytics
- [ ] **Employee Scorecard** (`/employee-scorecard`) - Employee performance
- [ ] **Individual Performance** (`/individual-performance`) - Individual metrics
- [ ] **Employee Comparison** (`/employee-comparison`) - Employee comparison
- [ ] **Team Leader Dashboard** (`/team-leader-dashboard`) - Team leader view
- [ ] **AI Evaluation Engine** (`/ai-evaluation-engine`) - AI evaluations
- [ ] **Workload Prediction** (`/workload-prediction`) - Workload forecasting
- [ ] **Reward Penalty** (`/reward-penalty`) - Rewards & penalties
- [ ] **Users** (`/users`) - User management

#### Communication & Knowledge
- [ ] **Communication Hub** (`/communication-hub`) - Communication center
- [ ] **Knowledge Base** (`/knowledge-base`) - Knowledge articles
- [ ] **Quality Compliance** (`/quality-compliance`) - Quality compliance

#### Quality Control
- [ ] **QC Dashboard** (`/qc-dashboard`) - QC management

#### Settings
- [ ] **Settings** (`/settings`) - System settings
- [ ] **Backend Source** (`/backend-source`) - Developer notes

### Page Testing Checklist

For each page, verify:
- [ ] Page loads without errors
- [ ] Navigation works correctly
- [ ] Data displays correctly (or shows empty state)
- [ ] Forms can be submitted
- [ ] Modals open/close correctly
- [ ] Filters/search work
- [ ] Pagination works (if applicable)
- [ ] Real-time updates work (Socket.IO)
- [ ] Responsive design works

---

## Realtime Functionality Testing

### Socket.IO Connection Test

1. **Connection Test**:
   ```javascript
   const socket = io('http://localhost:3001');
   socket.on('connect', () => console.log('Connected'));
   socket.on('connect_error', (err) => console.error('Connection error:', err));
   ```

2. **Event Listening Test**:
   - Listen for `task_created`, `task_updated`, `task_deleted`
   - Listen for `campaign_created`, `campaign_updated`, `campaign_deleted`
   - Listen for `content_created`, `content_updated`, `content_deleted`
   - Listen for `notification_updated`

3. **Room Joining Test**:
   ```javascript
   socket.emit('join_room', 'test-room');
   ```

### Realtime Update Scenarios

1. **Create Operation**:
   - Create a task via API
   - Verify Socket.IO event is emitted
   - Verify frontend receives update

2. **Update Operation**:
   - Update a campaign via API
   - Verify Socket.IO event is emitted
   - Verify frontend receives update

3. **Delete Operation**:
   - Delete content via API
   - Verify Socket.IO event is emitted
   - Verify frontend receives update

### Test Commands

```bash
# Test Socket.IO connection
node -e "const io = require('socket.io-client'); const s = io('http://localhost:3001'); s.on('connect', () => { console.log('Connected'); s.disconnect(); });"
```

---

## Database Testing

### Schema Validation

1. **Check All Tables Exist**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. **Check Foreign Keys**:
   ```sql
   SELECT 
       tc.table_name, 
       kcu.column_name, 
       ccu.table_name AS foreign_table_name
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY';
   ```

3. **Check Indexes**:
   ```sql
   SELECT indexname, tablename 
   FROM pg_indexes 
   WHERE schemaname = 'public' 
   ORDER BY tablename, indexname;
   ```

### Data Integrity Tests

1. **Insert Test Data**:
   ```sql
   -- Test user creation
   INSERT INTO users (name, email, role, status) 
   VALUES ('Test User', 'test@example.com', 'admin', 'active');
   
   -- Test project creation
   INSERT INTO projects (project_name, project_type, project_status) 
   VALUES ('Test Project', 'seo', 'active');
   ```

2. **Test Foreign Key Constraints**:
   ```sql
   -- This should fail (invalid user_id)
   INSERT INTO projects (project_name, project_owner_id) 
   VALUES ('Test', 99999);
   ```

---

## Test Execution

### Automated Testing

1. **Run Test Script**:
   ```bash
   node test-project.js
   ```

2. **Expected Output**:
   - List of passed tests
   - List of failed tests
   - Test coverage percentage

### Manual Testing Workflow

1. **Start Services**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev:client
   ```

2. **Verify Services Running**:
   - Backend: http://localhost:3001/health
   - Frontend: http://localhost:5173

3. **Test Each Category**:
   - System endpoints
   - Dashboard
   - CRUD operations
   - Master tables
   - HR endpoints
   - Communication
   - Integrations

4. **Test Frontend Pages**:
   - Navigate through all pages
   - Test forms and interactions
   - Verify realtime updates

---

## Known Issues & Resolutions

### Common Issues

1. **Database Connection Failed**
   - **Issue**: Cannot connect to PostgreSQL
   - **Resolution**: 
     - Check PostgreSQL is running
     - Verify `.env` configuration
     - Check database exists: `psql -U postgres -l`

2. **Socket.IO Connection Failed**
   - **Issue**: Frontend cannot connect to Socket.IO
   - **Resolution**:
     - Verify backend is running on port 3001
     - Check CORS configuration
     - Verify `FRONTEND_URL` in `.env`

3. **Missing Tables**
   - **Issue**: API returns table doesn't exist error
   - **Resolution**:
     - Run schema: `psql -U postgres -d mcc_db -f backend/db/schema.sql`
     - Check table names match controller queries

4. **CORS Errors**
   - **Issue**: CORS policy blocking requests
   - **Resolution**:
     - Update `FRONTEND_URL` in backend `.env`
     - Check `cors` middleware configuration

5. **Port Already in Use**
   - **Issue**: Port 3001 or 5173 already in use
   - **Resolution**:
     - Kill process: `lsof -ti:3001 | xargs kill`
     - Or change port in `.env`

---

## Test Results

### Test Coverage Goals
- ✅ API Endpoints: 100%
- ✅ Frontend Pages: 100%
- ✅ Realtime Events: 100%
- ✅ Database Schema: 100%

### Test Execution Log

**Date**: [Current Date]
**Tester**: [Your Name]
**Environment**: Development

#### System Tests
- [ ] Health Check: ✅/❌
- [ ] System Stats: ✅/❌

#### API Tests
- [ ] Dashboard Endpoints: ✅/❌
- [ ] CRUD Endpoints: ✅/❌
- [ ] Master Tables: ✅/❌
- [ ] HR Endpoints: ✅/❌
- [ ] Communication: ✅/❌
- [ ] Integrations: ✅/❌

#### Frontend Tests
- [ ] All Pages Load: ✅/❌
- [ ] Navigation Works: ✅/❌
- [ ] Forms Submit: ✅/❌
- [ ] Realtime Updates: ✅/❌

#### Database Tests
- [ ] Schema Valid: ✅/❌
- [ ] Foreign Keys: ✅/❌
- [ ] Indexes: ✅/❌

### Issues Found
[List any issues found during testing]

### Recommendations
[List recommendations for improvements]

---

## Additional Resources

- **API Documentation**: See `backend/routes/api.ts`
- **Database Schema**: See `backend/db/schema.sql`
- **Frontend Components**: See `components/` directory
- **Views**: See `views/` directory

---

**Last Updated**: [Current Date]
**Version**: 2.5.0

