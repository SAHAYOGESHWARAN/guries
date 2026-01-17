# API Reference

**Marketing Control Center - Complete API Documentation**

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Dashboard Endpoints](#dashboard-endpoints)
6. [Project Endpoints](#project-endpoints)
7. [Campaign Endpoints](#campaign-endpoints)
8. [Content Endpoints](#content-endpoints)
9. [User Endpoints](#user-endpoints)
10. [Master Data Endpoints](#master-data-endpoints)
11. [Rate Limiting](#rate-limiting)

---

## Overview

**Base URL**: `http://localhost:3001/api/v1`

**Production URL**: `https://yourdomain.com/api/v1`

**API Version**: v1

**Response Format**: JSON

---

## Authentication

### JWT Token

All endpoints (except login) require authentication via JWT token.

**Header Format:**
```
Authorization: Bearer <token>
```

### Login Endpoint

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin"
    }
  },
  "message": "Login successful"
}
```

### Token Refresh

```http
POST /auth/refresh
Authorization: Bearer <token>
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Project Name",
    "description": "Project description",
    "status": "active",
    "created_at": "2026-01-17T10:30:00Z",
    "updated_at": "2026-01-17T10:30:00Z"
  },
  "message": "Operation successful",
  "timestamp": "2026-01-17T10:30:00Z"
}
```

### List Response

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Project 1"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Project 2"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "timestamp": "2026-01-17T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Resource not found",
  "code": "NOT_FOUND",
  "details": "Project with ID 123 does not exist",
  "timestamp": "2026-01-17T10:30:00Z"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_REQUEST | 400 | Invalid request format |
| UNAUTHORIZED | 401 | Authentication failed |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| VALIDATION_ERROR | 422 | Validation failed |
| RATE_LIMIT | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Dashboard Endpoints

### Get Dashboard Statistics

```http
GET /dashboard/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_projects": 25,
    "active_campaigns": 12,
    "pending_tasks": 45,
    "team_members": 15,
    "content_in_progress": 8,
    "completed_content": 120
  }
}
```

### Get KPIs

```http
GET /dashboard/kpis
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "project_completion_rate": 85.5,
    "campaign_roi": 245.3,
    "content_approval_rate": 92.1,
    "team_utilization": 78.9,
    "quality_score": 88.5
  }
}
```

### Get Recent Activity

```http
GET /dashboard/activity
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of records (default: 10)
- `offset` (optional): Pagination offset (default: 0)

---

## Project Endpoints

### List Projects

```http
GET /projects
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (active, completed, archived)
- `owner_id` (optional): Filter by owner
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Q1 Marketing Campaign",
      "description": "Q1 marketing initiatives",
      "status": "active",
      "owner": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "first_name": "John",
        "last_name": "Doe"
      },
      "start_date": "2026-01-01",
      "end_date": "2026-03-31",
      "budget": 50000,
      "created_at": "2026-01-17T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25
  }
}
```

### Get Project Details

```http
GET /projects/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Q1 Marketing Campaign",
    "description": "Q1 marketing initiatives",
    "status": "active",
    "owner": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "start_date": "2026-01-01",
    "end_date": "2026-03-31",
    "budget": 50000,
    "campaigns": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "Social Media Campaign",
        "status": "active"
      }
    ],
    "team_members": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "first_name": "Jane",
        "last_name": "Smith",
        "role": "manager"
      }
    ],
    "created_at": "2026-01-17T10:30:00Z",
    "updated_at": "2026-01-17T10:30:00Z"
  }
}
```

### Create Project

```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Q1 Marketing Campaign",
  "description": "Q1 marketing initiatives",
  "status": "active",
  "start_date": "2026-01-01",
  "end_date": "2026-03-31",
  "budget": 50000
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Q1 Marketing Campaign",
    "description": "Q1 marketing initiatives",
    "status": "active",
    "owner_id": "550e8400-e29b-41d4-a716-446655440001",
    "start_date": "2026-01-01",
    "end_date": "2026-03-31",
    "budget": 50000,
    "created_at": "2026-01-17T10:30:00Z"
  },
  "message": "Project created successfully"
}
```

### Update Project

```http
PUT /projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Q1 Marketing Campaign - Updated",
  "description": "Updated description",
  "status": "active",
  "budget": 55000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Q1 Marketing Campaign - Updated",
    "description": "Updated description",
    "status": "active",
    "budget": 55000,
    "updated_at": "2026-01-17T11:00:00Z"
  },
  "message": "Project updated successfully"
}
```

### Delete Project

```http
DELETE /projects/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Campaign Endpoints

### List Campaigns

```http
GET /campaigns
Authorization: Bearer <token>
```

**Query Parameters:**
- `project_id` (optional): Filter by project
- `status` (optional): Filter by status
- `page` (optional): Page number
- `limit` (optional): Records per page

### Get Campaign Details

```http
GET /campaigns/:id
Authorization: Bearer <token>
```

### Create Campaign

```http
POST /campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Social Media Campaign",
  "description": "Q1 social media initiatives",
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "active",
  "start_date": "2026-01-01",
  "end_date": "2026-03-31",
  "budget": 10000
}
```

### Update Campaign

```http
PUT /campaigns/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Social Media Campaign - Updated",
  "status": "active",
  "budget": 12000
}
```

### Delete Campaign

```http
DELETE /campaigns/:id
Authorization: Bearer <token>
```

---

## Content Endpoints

### List Content

```http
GET /content
Authorization: Bearer <token>
```

**Query Parameters:**
- `campaign_id` (optional): Filter by campaign
- `status` (optional): Filter by status (draft, pending, approved, published)
- `type` (optional): Filter by content type
- `page` (optional): Page number
- `limit` (optional): Records per page

### Get Content Details

```http
GET /content/:id
Authorization: Bearer <token>
```

### Create Content

```http
POST /content
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Blog Post: Marketing Trends 2026",
  "description": "An in-depth look at marketing trends",
  "type": "blog",
  "campaign_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "draft"
}
```

### Update Content

```http
PUT /content/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Blog Post: Marketing Trends 2026 - Updated",
  "status": "pending"
}
```

### Approve Content

```http
PUT /content/:id/approve
Authorization: Bearer <token>
```

### Publish Content

```http
PUT /content/:id/publish
Authorization: Bearer <token>
```

### Delete Content

```http
DELETE /content/:id
Authorization: Bearer <token>
```

---

## User Endpoints

### List Users

```http
GET /users
Authorization: Bearer <token>
```

**Query Parameters:**
- `role` (optional): Filter by role
- `department` (optional): Filter by department
- `status` (optional): Filter by status
- `page` (optional): Page number
- `limit` (optional): Records per page

### Get User Details

```http
GET /users/:id
Authorization: Bearer <token>
```

### Create User

```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "department": "Marketing"
}
```

### Update User

```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "department": "Marketing",
  "role": "manager"
}
```

### Delete User

```http
DELETE /users/:id
Authorization: Bearer <token>
```

---

## Master Data Endpoints

### Asset Types

```http
GET /masters/asset-types
POST /masters/asset-types
PUT /masters/asset-types/:id
DELETE /masters/asset-types/:id
```

### Asset Categories

```http
GET /masters/asset-categories
POST /masters/asset-categories
PUT /masters/asset-categories/:id
DELETE /masters/asset-categories/:id
```

### Platforms

```http
GET /masters/platforms
POST /masters/platforms
PUT /masters/platforms/:id
DELETE /masters/platforms/:id
```

### Countries

```http
GET /masters/countries
POST /masters/countries
PUT /masters/countries/:id
DELETE /masters/countries/:id
```

### Industry Sectors

```http
GET /masters/industry-sectors
POST /masters/industry-sectors
PUT /masters/industry-sectors/:id
DELETE /masters/industry-sectors/:id
```

### Workflow Stages

```http
GET /masters/workflow-stages
POST /masters/workflow-stages
PUT /masters/workflow-stages/:id
DELETE /masters/workflow-stages/:id
```

---

## Rate Limiting

### Rate Limit Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642425600
```

### Limits

- **Default**: 1000 requests per hour
- **Authenticated**: 5000 requests per hour
- **Admin**: Unlimited

### Rate Limit Error

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "retry_after": 3600,
  "timestamp": "2026-01-17T10:30:00Z"
}
```

---

## Pagination

### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Records per page (default: 20, max: 100)

### Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Filtering

### Query Parameters

```http
GET /projects?status=active&owner_id=550e8400-e29b-41d4-a716-446655440000
```

### Supported Operators

- `eq`: Equal
- `ne`: Not equal
- `gt`: Greater than
- `gte`: Greater than or equal
- `lt`: Less than
- `lte`: Less than or equal
- `in`: In array
- `contains`: Contains string

---

## Sorting

### Query Parameters

```http
GET /projects?sort=name&order=asc
GET /projects?sort=created_at&order=desc
```

### Supported Fields

- `name`
- `status`
- `created_at`
- `updated_at`
- `budget`

---

## Resources

- [REST API Best Practices](https://restfulapi.net)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html#status.codes)
- [JWT Authentication](https://jwt.io)
