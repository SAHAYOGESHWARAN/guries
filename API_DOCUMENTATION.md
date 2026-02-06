# API Documentation - Guries Marketing Control Center

## Base URL
```
https://guries.vercel.app/api/v1
```

## Authentication
Currently no authentication required. Add JWT tokens in future versions.

## Asset Library API

### 1. Get All Assets
**Endpoint**: `GET /assetLibrary`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "asset_name": "Blog Post",
      "asset_type": "article",
      "asset_category": "content",
      "asset_format": "text",
      "status": "draft",
      "repository": "Content Repository",
      "application_type": "web",
      "created_at": "2026-02-07T12:00:00.000Z",
      "updated_at": "2026-02-07T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Status Codes**:
- `200` - Success
- `500` - Server error

---

### 2. Create Asset
**Endpoint**: `POST /assetLibrary`

**Request Body**:
```json
{
  "asset_name": "My New Asset",
  "asset_type": "article",
  "asset_category": "content",
  "asset_format": "text",
  "status": "draft",
  "repository": "Content Repository",
  "application_type": "web"
}
```

**Required Fields**:
- `asset_name` - Name of the asset

**Optional Fields**:
- `asset_type` - Type of asset (article, image, video, etc.)
- `asset_category` - Category classification
- `asset_format` - Format (text, html, markdown, etc.)
- `status` - Status (draft, published, archived)
- `repository` - Repository name
- `application_type` - Application type (web, mobile, etc.)

**Response**:
```json
{
  "success": true,
  "asset": {
    "id": 1,
    "asset_name": "My New Asset",
    "asset_type": "article",
    "asset_category": "content",
    "asset_format": "text",
    "status": "draft",
    "repository": "Content Repository",
    "application_type": "web",
    "created_at": "2026-02-07T12:00:00.000Z",
    "updated_at": "2026-02-07T12:00:00.000Z"
  },
  "data": { ... },
  "message": "Asset created successfully"
}
```

**Status Codes**:
- `201` - Created
- `400` - Bad request (missing required fields)
- `500` - Server error

---

### 3. Update Asset
**Endpoint**: `PUT /assetLibrary/:id`

**URL Parameters**:
- `id` - Asset ID (required)

**Request Body**:
```json
{
  "asset_name": "Updated Asset Name",
  "status": "published"
}
```

**Response**:
```json
{
  "success": true,
  "asset": {
    "id": 1,
    "asset_name": "Updated Asset Name",
    "status": "published",
    "updated_at": "2026-02-07T13:00:00.000Z"
  },
  "data": { ... },
  "message": "Asset updated successfully"
}
```

**Status Codes**:
- `200` - Success
- `400` - Bad request
- `404` - Asset not found
- `500` - Server error

---

### 4. Delete Asset
**Endpoint**: `DELETE /assetLibrary/:id`

**URL Parameters**:
- `id` - Asset ID (required)

**Response**:
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

**Status Codes**:
- `200` - Success
- `400` - Bad request
- `404` - Asset not found
- `500` - Server error

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common Errors

**Missing Required Field**
```json
{
  "success": false,
  "error": "asset_name or name is required"
}
```

**Database Connection Error**
```json
{
  "success": false,
  "error": "Database connection not available",
  "message": "DATABASE_URL environment variable is not set"
}
```

**Not Found**
```json
{
  "success": false,
  "error": "Asset not found"
}
```

---

## CORS Headers

All endpoints include CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Rate Limiting

Currently no rate limiting. Implement in production.

---

## Pagination

Currently returns all assets (max 100). Implement pagination in future versions.

---

## Filtering & Sorting

Currently not supported. Implement in future versions.

---

## Examples

### Using cURL

**Get all assets**:
```bash
curl https://guries.vercel.app/api/v1/assetLibrary
```

**Create asset**:
```bash
curl -X POST https://guries.vercel.app/api/v1/assetLibrary \
  -H "Content-Type: application/json" \
  -d '{
    "asset_name": "My Asset",
    "asset_type": "article",
    "status": "draft"
  }'
```

**Update asset**:
```bash
curl -X PUT https://guries.vercel.app/api/v1/assetLibrary/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published"
  }'
```

**Delete asset**:
```bash
curl -X DELETE https://guries.vercel.app/api/v1/assetLibrary/1
```

### Using JavaScript/Fetch

**Get all assets**:
```javascript
const response = await fetch('/api/v1/assetLibrary');
const data = await response.json();
console.log(data.data);
```

**Create asset**:
```javascript
const response = await fetch('/api/v1/assetLibrary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    asset_name: 'My Asset',
    asset_type: 'article',
    status: 'draft'
  })
});
const data = await response.json();
console.log(data.asset);
```

---

## Changelog

### v1.0.0 (2026-02-07)
- Initial API release
- Asset CRUD operations
- PostgreSQL database integration
- Vercel serverless deployment
