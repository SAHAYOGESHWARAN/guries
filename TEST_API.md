# API Testing Guide

## Test the Health Endpoint
```bash
curl https://guries.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-06T...",
  "environment": "production"
}
```

## Test Asset Creation
```bash
curl -X POST https://guries.vercel.app/api/v1/assetLibrary \
  -H "Content-Type: application/json" \
  -d '{
    "asset_name": "Test Asset",
    "asset_type": "article",
    "asset_category": "content",
    "status": "draft"
  }'
```

## Test Asset Retrieval
```bash
curl https://guries.vercel.app/api/v1/assetLibrary
```

## Test Asset Update
```bash
curl -X PUT https://guries.vercel.app/api/v1/assetLibrary/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}'
```

## Test Asset Deletion
```bash
curl -X DELETE https://guries.vercel.app/api/v1/assetLibrary/1
```

## Key Fixes Applied

1. **Removed catch-all route handler** - Was intercepting API requests
2. **Global pool pattern** - Proper serverless database connection
3. **Fixed frontend API URLs** - Using API_BASE_URL constant
4. **Added health check endpoint** - Verify database connectivity
5. **DATABASE_URL in vercel.json** - Environment variable available at build time
6. **Improved body parsing** - Handles multiple request formats

## Expected Behavior

- Assets are stored in PostgreSQL (Supabase)
- Data persists across deployments
- All CRUD operations work correctly
- Frontend properly communicates with API
