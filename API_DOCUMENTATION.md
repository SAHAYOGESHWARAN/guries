# Marketing Control Center - API Documentation

**Version**: 2.5.0  
**Base URL**: `http://localhost:3003/api/v1` (Development)  
**Base URL**: `https://your-domain.com/api/v1` (Production)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Handling](#error-handling)
4. [Dashboard Endpoints](#dashboard-endpoints)
5. [Project Endpoints](#project-endpoints)
6. [Campaign Endpoints](#campaign-endpoints)
7. [Task Endpoints](#task-endpoints)
8. [Content Endpoints](#content-endpoints)
9. [Asset Endpoints](#asset-endpoints)
10. [SEO & Backlinks](#seo--backlinks)
11. [Social Media](#social-media)
12. [Quality Control](#quality-control)
13. [Analytics](#analytics)
14. [HR & Employee](#hr--employee)
15. [Reward & Penalty](#reward--penalty)
16. [AI Features](#ai-features)
17. [Master Tables](#master-tables)
18. [User Management](#user-management)

---

## Authentication

### Headers

All requests require the following headers:

```
Content-Type: application/json
Authorization: Bearer <token>
```

### Get Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Example"
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful, no response body |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal error |

### Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Input validation failed |
| UNAUTHORIZED | Authentication required |
| FORBIDDEN | Permission denied |
| NOT_FOUND | Resource not found |
| CONFLICT | Resource already exists |
| SERVER_ERROR | Internal server error |

---

## Dashboard Endpoints

### Get Dashboard Statistics

```http
GET /api/v1/dashboard/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalProjects": 15,
    "activeCampaigns": 8,
    "completedTasks": 245,
    "pendingTasks": 32,
    "totalUsers": 25,
    "activeUsers": 18,
    "kpiScore": 87.5,
    "efficiency": 92.3
  }
}
```

### Get Dashboard KPIs

```http
GET /api/v1/dashboard/kpis
```

Response:
```json
{
  "success": true,
  "data": {
    "kpis": [
      {
        "name": "Project Completion Rate",
        "value": 87.5,
        "target": 90,
        "status": "on-track"
      },
      {
        "name": "Team Efficiency",
        "value": 92.3,
        "target": 85,
        "status": "exceeding"
      }
    ]
  }
}
```

---

## Project Endpoints

### List Projects

```http
GET /api/v1/projects?page=1&limit=10&status=active
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (active, completed, archived)
- `search` (optional): Search by name

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Q1 Marketing Campaign",
      "status": "active",
      "owner": "John Doe",
      "startDate": "2026-01-01",
      "endDate": "2026-03-31",
      "progress": 65,
      "campaigns": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

### Create Project

```http
POST /api/v1/projects
Content-Type: application/json

{
  "name": "Q1 Marketing Campaign",
  "description": "Q1 2026 marketing initiatives",
  "ownerId": 1,
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "objective": "Increase brand awareness by 25%"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Q1 Marketing Campaign",
    "status": "planning",
    "createdAt": "2026-01-17T10:30:00Z"
  }
}
```

### Get Project Details

```http
GET /api/v1/projects/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Q1 Marketing Campaign",
    "description": "Q1 2026 marketing initiatives",
    "status": "active",
    "owner": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "startDate": "2026-01-01",
    "endDate": "2026-03-31",
    "progress": 65,
    "campaigns": [
      {
        "id": 1,
        "name": "Social Media Campaign",
        "status": "active"
      }
    ],
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-17T10:30:00Z"
  }
}
```

### Update Project

```http
PUT /api/v1/projects/:id
Content-Type: application/json

{
  "name": "Q1 Marketing Campaign - Updated",
  "status": "active",
  "progress": 75
}
```

### Delete Project

```http
DELETE /api/v1/projects/:id
```

---

## Campaign Endpoints

### List Campaigns

```http
GET /api/v1/campaigns?projectId=1&status=active
```

### Create Campaign

```http
POST /api/v1/campaigns
Content-Type: application/json

{
  "projectId": 1,
  "name": "Social Media Campaign",
  "type": "social",
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "ownerId": 1
}
```

### Get Campaign Details

```http
GET /api/v1/campaigns/:id
```

### Update Campaign

```http
PUT /api/v1/campaigns/:id
Content-Type: application/json

{
  "status": "active",
  "progress": 50
}
```

### Delete Campaign

```http
DELETE /api/v1/campaigns/:id
```

---

## Task Endpoints

### List Tasks

```http
GET /api/v1/tasks?campaignId=1&status=pending
```

### Create Task

```http
POST /api/v1/tasks
Content-Type: application/json

{
  "campaignId": 1,
  "name": "Create social media content",
  "type": "content",
  "ownerId": 1,
  "dueDate": "2026-01-31",
  "priority": "high"
}
```

### Get Task Details

```http
GET /api/v1/tasks/:id
```

### Update Task

```http
PUT /api/v1/tasks/:id
Content-Type: application/json

{
  "status": "in-progress",
  "progress": 50
}
```

### Update Task Status

```http
PUT /api/v1/tasks/:id/status
Content-Type: application/json

{
  "status": "completed"
}
```

### Delete Task

```http
DELETE /api/v1/tasks/:id
```

---

## Content Endpoints

### List Content

```http
GET /api/v1/content?status=draft&type=blog
```

### Create Content

```http
POST /api/v1/content
Content-Type: application/json

{
  "title": "Blog Post Title",
  "type": "blog",
  "status": "draft",
  "content": "Content body...",
  "authorId": 1
}
```

### Get Content Details

```http
GET /api/v1/content/:id
```

### Update Content

```http
PUT /api/v1/content/:id
Content-Type: application/json

{
  "status": "published",
  "content": "Updated content..."
}
```

### Delete Content

```http
DELETE /api/v1/content/:id
```

---

## Asset Endpoints

### List Assets

```http
GET /api/v1/assets?type=image&status=active
```

### Create Asset

```http
POST /api/v1/assets
Content-Type: multipart/form-data

file: <binary>
name: "Asset Name"
type: "image"
```

### Get Asset Details

```http
GET /api/v1/assets/:id
```

### Update Asset

```http
PUT /api/v1/assets/:id
Content-Type: application/json

{
  "name": "Updated Asset Name",
  "status": "active"
}
```

### Delete Asset

```http
DELETE /api/v1/assets/:id
```

---

## SEO & Backlinks

### List Keywords

```http
GET /api/v1/keywords?status=active
```

### Create Keyword

```http
POST /api/v1/keywords
Content-Type: application/json

{
  "keyword": "digital marketing",
  "searchVolume": 5000,
  "difficulty": 45
}
```

### List Backlinks

```http
GET /api/v1/backlinks?status=active
```

### Create Backlink

```http
POST /api/v1/backlinks
Content-Type: application/json

{
  "sourceUrl": "https://example.com",
  "targetUrl": "https://your-site.com",
  "anchorText": "digital marketing",
  "status": "pending"
}
```

### List SEO Audits

```http
GET /api/v1/seo-audits
```

### Create SEO Audit

```http
POST /api/v1/seo-audits
Content-Type: application/json

{
  "url": "https://your-site.com/page",
  "type": "on-page"
}
```

---

## Social Media

### List SMM Posts

```http
GET /api/v1/smm-posts?platform=instagram&status=scheduled
```

### Create SMM Post

```http
POST /api/v1/smm-posts
Content-Type: application/json

{
  "content": "Post content",
  "platform": "instagram",
  "scheduledDate": "2026-01-20T10:00:00Z",
  "mediaIds": [1, 2, 3]
}
```

### Update SMM Post

```http
PUT /api/v1/smm-posts/:id
Content-Type: application/json

{
  "status": "published"
}
```

---

## Quality Control

### List QC Runs

```http
GET /api/v1/qc-runs?status=pending
```

### Create QC Run

```http
POST /api/v1/qc-runs
Content-Type: application/json

{
  "assetId": 1,
  "checklistId": 1,
  "reviewerId": 1
}
```

### List QC Checklists

```http
GET /api/v1/qc-checklists
```

### Create QC Checklist

```http
POST /api/v1/qc-checklists
Content-Type: application/json

{
  "name": "Content QC Checklist",
  "items": [
    {
      "name": "Grammar check",
      "required": true
    },
    {
      "name": "SEO optimization",
      "required": true
    }
  ]
}
```

---

## Analytics

### Get Daily Traffic

```http
GET /api/v1/analytics/daily-traffic?startDate=2026-01-01&endDate=2026-01-31
```

### Get KPI Snapshots

```http
GET /api/v1/analytics/kpi-snapshots
```

### Get Competitor Benchmarks

```http
GET /api/v1/analytics/competitor-benchmarks
```

### Get OKRs

```http
GET /api/v1/analytics/okrs
```

---

## HR & Employee

### List Employees

```http
GET /api/v1/employees?department=marketing&status=active
```

### Create Employee

```http
POST /api/v1/employees
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "department": "marketing",
  "position": "Marketing Manager",
  "reportingManager": 1
}
```

### Get Employee Details

```http
GET /api/v1/employees/:id
```

### Get Employee Evaluations

```http
GET /api/v1/employees/:id/evaluations
```

### Get Employee Scorecard

```http
GET /api/v1/employees/:id/scorecard
```

### Get Employee Comparison

```http
GET /api/v1/employees/:id/comparison
```

---

## Reward & Penalty

### List Bonus Tiers

```http
GET /api/v1/reward-penalty-automation/bonus-tiers
```

### Create Bonus Tier

```http
POST /api/v1/reward-penalty-automation/bonus-tiers
Content-Type: application/json

{
  "name": "Performance Bonus",
  "minSalary": 30000,
  "maxSalary": 50000,
  "bonusPercentage": 10
}
```

### List Reward Recommendations

```http
GET /api/v1/reward-penalty-automation/reward-recommendations
```

### List Penalty Rules

```http
GET /api/v1/reward-penalty-automation/penalty-rules
```

### List Penalty Records

```http
GET /api/v1/reward-penalty-automation/penalty-records
```

### Get Reward History

```http
GET /api/v1/reward-penalty-automation/reward-history
```

### Get Penalty History

```http
GET /api/v1/reward-penalty-automation/penalty-history
```

---

## AI Features

### AI Evaluation Engine

#### List Evaluation Reports

```http
GET /api/v1/ai-evaluation-engine/reports
```

#### Create Evaluation Report

```http
POST /api/v1/ai-evaluation-engine/reports
Content-Type: application/json

{
  "employeeId": 1,
  "period": "Q1 2026",
  "dataSourceIds": [1, 2, 3]
}
```

#### Get Report Details

```http
GET /api/v1/ai-evaluation-engine/reports/:id
```

#### Get Performance Scores

```http
GET /api/v1/ai-evaluation-engine/reports/:id/performance-scores
```

#### Get Risk Factors

```http
GET /api/v1/ai-evaluation-engine/reports/:id/risk-factors
```

### AI Task Allocation

#### Get Task Suggestions

```http
GET /api/v1/workload-allocation/suggestions
```

#### Get Workload Forecast

```http
GET /api/v1/workload-allocation/workload-forecast
```

#### Get Team Capacity

```http
GET /api/v1/workload-allocation/team-capacity
```

#### Get Predicted Overloads

```http
GET /api/v1/workload-allocation/predicted-overloads
```

---

## Master Tables

### Industry Sectors

```http
GET /api/v1/master/industry-sectors
POST /api/v1/master/industry-sectors
PUT /api/v1/master/industry-sectors/:id
DELETE /api/v1/master/industry-sectors/:id
```

### Content Types

```http
GET /api/v1/master/content-types
POST /api/v1/master/content-types
PUT /api/v1/master/content-types/:id
DELETE /api/v1/master/content-types/:id
```

### Asset Types

```http
GET /api/v1/master/asset-types
POST /api/v1/master/asset-types
PUT /api/v1/master/asset-types/:id
DELETE /api/v1/master/asset-types/:id
```

### Platforms

```http
GET /api/v1/master/platforms
POST /api/v1/master/platforms
PUT /api/v1/master/platforms/:id
DELETE /api/v1/master/platforms/:id
```

### Workflow Stages

```http
GET /api/v1/master/workflow-stages
POST /api/v1/master/workflow-stages
PUT /api/v1/master/workflow-stages/:id
DELETE /api/v1/master/workflow-stages/:id
```

### Countries

```http
GET /api/v1/master/countries
POST /api/v1/master/countries
PUT /api/v1/master/countries/:id
DELETE /api/v1/master/countries/:id
```

---

## User Management

### List Users

```http
GET /api/v1/users?role=admin&status=active
```

### Create User

```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "department": "management"
}
```

### Get User Details

```http
GET /api/v1/users/:id
```

### Update User

```http
PUT /api/v1/users/:id
Content-Type: application/json

{
  "name": "John Doe Updated",
  "role": "manager"
}
```

### Delete User

```http
DELETE /api/v1/users/:id
```

### Get User Permissions

```http
GET /api/v1/users/:id/permissions
```

### List Roles

```http
GET /api/v1/roles
```

### List Departments

```http
GET /api/v1/departments
```

---

**Version**: 2.5.0  
**Last Updated**: January 17, 2026
