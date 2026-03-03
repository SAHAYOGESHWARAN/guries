# API Testing Script
## Guires Marketing Control Center
**Date**: March 3, 2026

---

## API Base URL
```
Production: https://guries.vercel.app/api/v1
Development: http://localhost:3003/api/v1
```

---

## Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Test Cases

### 1. Asset Category Master - CRUD Operations

#### 1.1 GET - Fetch All Asset Categories
```
GET /api/v1/asset-category-master
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "category_name": "Web Assets",
    "description": "Assets for web pages",
    "status": "active",
    "created_at": "2026-03-01T10:00:00Z",
    "updated_at": "2026-03-01T10:00:00Z"
  }
]
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 1.2 POST - Create Asset Category
```
POST /api/v1/asset-category-master
Content-Type: application/json

{
  "category_name": "Test Category",
  "description": "Test Description"
}
```

**Expected Response:**
```json
{
  "id": 999,
  "category_name": "Test Category",
  "description": "Test Description",
  "status": "active",
  "created_at": "2026-03-03T12:00:00Z",
  "updated_at": "2026-03-03T12:00:00Z"
}
```

**Status Code:** 201  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 1.3 PUT - Update Asset Category
```
PUT /api/v1/asset-category-master/999
Content-Type: application/json

{
  "category_name": "Updated Category",
  "description": "Updated Description",
  "status": "active"
}
```

**Expected Response:**
```json
{
  "id": 999,
  "category_name": "Updated Category",
  "description": "Updated Description",
  "status": "active",
  "created_at": "2026-03-03T12:00:00Z",
  "updated_at": "2026-03-03T12:30:00Z"
}
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 1.4 DELETE - Delete Asset Category
```
DELETE /api/v1/asset-category-master/999
```

**Expected Response:**
```json
{
  "message": "Asset category deleted successfully"
}
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

### 2. Assets - CRUD Operations

#### 2.1 GET - Fetch All Assets
```
GET /api/v1/assets
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Homepage Banner",
    "type": "image",
    "category": "Web Assets",
    "format": "PNG",
    "repository": "Web",
    "status": "active",
    "thumbnail_url": "https://...",
    "created_at": "2026-03-01T10:00:00Z"
  }
]
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 2.2 GET - Fetch Single Asset
```
GET /api/v1/assets/1
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Homepage Banner",
  "type": "image",
  "category": "Web Assets",
  "format": "PNG",
  "repository": "Web",
  "status": "active",
  "thumbnail_url": "https://...",
  "created_at": "2026-03-01T10:00:00Z"
}
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 2.3 POST - Create Asset
```
POST /api/v1/assets
Content-Type: application/json

{
  "asset_name": "Test Asset",
  "asset_type": "image",
  "asset_category": "Web Assets",
  "asset_format": "PNG",
  "content_type": "image/png",
  "tags": "Web",
  "status": "active"
}
```

**Expected Response:**
```json
{
  "id": 999,
  "asset_name": "Test Asset",
  "asset_type": "image",
  "asset_category": "Web Assets",
  "asset_format": "PNG",
  "status": "active",
  "created_at": "2026-03-03T12:00:00Z"
}
```

**Status Code:** 201  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 2.4 PUT - Update Asset
```
PUT /api/v1/assets/999
Content-Type: application/json

{
  "asset_name": "Updated Asset",
  "status": "inactive"
}
```

**Expected Response:**
```json
{
  "id": 999,
  "asset_name": "Updated Asset",
  "status": "inactive",
  "updated_at": "2026-03-03T12:30:00Z"
}
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 2.5 DELETE - Delete Asset
```
DELETE /api/v1/assets/999
```

**Expected Response:**
```json
{
  "message": "Asset deleted successfully"
}
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

### 3. Asset Library - CRUD Operations

#### 3.1 GET - Fetch Asset Library
```
GET /api/v1/assetLibrary
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "asset_name": "Homepage Banner",
    "asset_type": "image",
    "asset_category": "Web Assets",
    "status": "active",
    "workflow_stage": "published",
    "qc_status": "approved"
  }
]
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 3.2 POST - Create Asset Library Item
```
POST /api/v1/assetLibrary
Content-Type: application/json

{
  "asset_name": "New Library Asset",
  "asset_type": "image",
  "asset_category": "Web Assets",
  "asset_format": "PNG",
  "content_type": "image/png",
  "status": "draft"
}
```

**Expected Response:**
```json
{
  "id": 999,
  "asset_name": "New Library Asset",
  "status": "draft",
  "workflow_stage": "draft",
  "created_at": "2026-03-03T12:00:00Z"
}
```

**Status Code:** 201  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 3.3 PUT - Update Asset Library Item
```
PUT /api/v1/assetLibrary/999
Content-Type: application/json

{
  "asset_name": "Updated Library Asset",
  "status": "published"
}
```

**Expected Response:**
```json
{
  "id": 999,
  "asset_name": "Updated Library Asset",
  "status": "published",
  "updated_at": "2026-03-03T12:30:00Z"
}
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 3.4 DELETE - Delete Asset Library Item
```
DELETE /api/v1/assetLibrary/999
```

**Expected Response:**
```json
{
  "message": "Asset deleted successfully"
}
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

### 4. Services - CRUD Operations

#### 4.1 GET - Fetch All Services
```
GET /api/v1/services
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "service_name": "SEO Optimization",
    "description": "Search engine optimization services",
    "status": "active"
  }
]
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 4.2 POST - Create Service
```
POST /api/v1/services
Content-Type: application/json

{
  "service_name": "Test Service",
  "description": "Test Service Description",
  "status": "active"
}
```

**Expected Response:**
```json
{
  "id": 999,
  "service_name": "Test Service",
  "description": "Test Service Description",
  "status": "active",
  "created_at": "2026-03-03T12:00:00Z"
}
```

**Status Code:** 201  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 4.3 PUT - Update Service
```
PUT /api/v1/services/999
Content-Type: application/json

{
  "service_name": "Updated Service",
  "status": "inactive"
}
```

**Expected Response:**
```json
{
  "id": 999,
  "service_name": "Updated Service",
  "status": "inactive",
  "updated_at": "2026-03-03T12:30:00Z"
}
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 4.4 DELETE - Delete Service
```
DELETE /api/v1/services/999
```

**Expected Response:**
```json
{
  "message": "Service deleted successfully"
}
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

### 5. Keywords - CRUD Operations

#### 5.1 GET - Fetch All Keywords
```
GET /api/v1/keywords
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "keyword": "digital marketing",
    "status": "active"
  }
]
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 5.2 POST - Create Keyword
```
POST /api/v1/keywords
Content-Type: application/json

{
  "keyword": "test keyword",
  "status": "active"
}
```

**Expected Response:**
```json
{
  "id": 999,
  "keyword": "test keyword",
  "status": "active",
  "created_at": "2026-03-03T12:00:00Z"
}
```

**Status Code:** 201  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 5.3 PUT - Update Keyword
```
PUT /api/v1/keywords/999
Content-Type: application/json

{
  "keyword": "updated keyword",
  "status": "inactive"
}
```

**Expected Response:**
```json
{
  "id": 999,
  "keyword": "updated keyword",
  "status": "inactive",
  "updated_at": "2026-03-03T12:30:00Z"
}
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

#### 5.4 DELETE - Delete Keyword
```
DELETE /api/v1/keywords/999
```

**Expected Response:**
```json
{
  "message": "Keyword deleted successfully"
}
```

**Status Code:** 200  
**Test Result:** [ ] PASS [ ] FAIL

---

## Error Handling Tests

### 6.1 Invalid Request - Missing Required Field
```
POST /api/v1/asset-category-master
Content-Type: application/json

{
  "description": "Missing category name"
}
```

**Expected Response:**
```json
{
  "error": "Category name is required"
}
```

**Status Code:** 400  
**Test Result:** [ ] PASS [ ] FAIL

---

### 6.2 Not Found - Invalid ID
```
GET /api/v1/assets/99999
```

**Expected Response:**
```json
{
  "error": "Asset not found"
}
```

**Status Code:** 404  
**Test Result:** [ ] PASS [ ] FAIL

---

### 6.3 Server Error - Database Connection Issue
**Expected Response:**
```json
{
  "error": "Failed to fetch assets"
}
```

**Status Code:** 500  
**Test Result:** [ ] PASS [ ] FAIL

---

## Performance Tests

### 7.1 Response Time - Asset List
- **Endpoint:** GET /api/v1/assets
- **Expected Response Time:** < 500ms
- **Actual Response Time:** _____ ms
- **Test Result:** [ ] PASS [ ] FAIL

---

### 7.2 Response Time - Create Asset
- **Endpoint:** POST /api/v1/assets
- **Expected Response Time:** < 1000ms
- **Actual Response Time:** _____ ms
- **Test Result:** [ ] PASS [ ] FAIL

---

## Summary

**Total Tests:** 30+  
**Passed:** _____  
**Failed:** _____  
**Skipped:** _____  

**Overall Status:** [ ] PASS [ ] FAIL

---

## Notes

[TO BE FILLED]

