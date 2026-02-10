# Backend Testing Guide

## Quick Test (Local)

### Terminal 1: Start Backend
```bash
cd backend
npm install --legacy-peer-deps
npm run build
npm start
```

Wait for: `🚀 Server running on port 3003`

### Terminal 2: Test Endpoints

#### 1. Health Check
```bash
curl http://localhost:3003/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T14:00:00.000Z"
}
```

#### 2. Get Projects
```bash
curl http://localhost:3003/api/v1/projects
```

Expected response:
```json
{
  "success": true,
  "data": [],
  "message": "Projects retrieved successfully"
}
```

#### 3. Create Project
```bash
curl -X POST http://localhost:3003/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Test Project",
    "project_code": "TEST-001",
    "description": "Test project description",
    "status": "Planned"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_name": "Test Project",
    "project_code": "TEST-001",
    ...
  },
  "message": "Project created successfully"
}
```

#### 4. Get Tasks
```bash
curl http://localhost:3003/api/v1/tasks
```

Expected response:
```json
{
  "success": true,
  "data": [],
  "message": "Tasks retrieved successfully"
}
```

#### 5. Create Task
```bash
curl -X POST http://localhost:3003/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "task_name": "Test Task",
    "description": "Test task description",
    "status": "pending",
    "priority": "Medium"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "task_name": "Test Task",
    ...
  },
  "message": "Task created successfully"
}
```

## Full Test Suite

### 1. Database Tests
- ✅ SQLite database initializes
- ✅ Tables created automatically
- ✅ Data persists after restart

### 2. API Tests
- ✅ Health endpoint responds
- ✅ Projects CRUD works
- ✅ Tasks CRUD works
- ✅ Proper error handling

### 3. CORS Tests
- ✅ Requests from localhost:5173 allowed
- ✅ Requests from Vercel domain allowed
- ✅ Invalid origins rejected

### 4. Performance Tests
- ✅ Response time < 100ms
- ✅ Handles concurrent requests
- ✅ Memory usage stable

## Automated Testing

```bash
cd backend
npm test
```

## Production Testing

After deploying to Railway:

```bash
# Health check
curl https://your-backend.up.railway.app/api/health

# Get projects
curl https://your-backend.up.railway.app/api/v1/projects

# Create project
curl -X POST https://your-backend.up.railway.app/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"project_name":"Test","project_code":"TEST-001"}'
```

## Debugging

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm start
```

### Check Database
```bash
# SQLite
sqlite3 backend/data.db ".tables"
sqlite3 backend/data.db "SELECT * FROM projects;"
```

### Monitor Network
```bash
# Watch requests
curl -v http://localhost:3003/api/v1/projects
```

## Success Criteria

✅ Backend builds without errors
✅ Backend starts successfully
✅ Health endpoint responds
✅ Projects endpoint returns data
✅ Tasks endpoint returns data
✅ Create operations work
✅ Update operations work
✅ Delete operations work
✅ CORS headers present
✅ Error handling works
