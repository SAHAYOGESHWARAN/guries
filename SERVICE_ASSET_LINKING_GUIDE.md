# Service Asset Linking Implementation Guide

## Overview

This implementation provides a comprehensive Service and Asset Linking system with the following key features:

1. **Service Creation**: Create Services and Sub-Services
2. **Asset Upload**: Upload assets with service selection during upload
3. **Static Linking**: Assets linked during upload cannot be unlinked (static links)
4. **Service Pages**: Display linked assets on service pages under Web Repository
5. **Asset Management**: Link/unlink assets with static link protection

## Architecture

### Database Schema

#### New Tables Added

1. **service_asset_links**
   - Tracks many-to-many relationships between assets and services
   - Includes `is_static` flag for static links
   - Prevents unlinking of static assets

2. **subservice_asset_links**
   - Tracks many-to-many relationships between assets and sub-services
   - Includes `is_static` flag for static links
   - Prevents unlinking of static assets

#### Modified Tables

1. **assets**
   - Added `static_service_links` JSON field to track static links
   - Stores which service/sub-service links are permanent

### Backend Implementation

#### New API Endpoints

1. `GET /api/v1/services/:serviceId/assets` - Get assets linked to a service
2. `GET /api/v1/sub-services/:subServiceId/assets` - Get assets linked to a sub-service
3. `POST /api/v1/assets/link-to-service` - Link asset to service (with static check)
4. `POST /api/v1/assets/unlink-from-service` - Unlink asset from service (with static check)

#### Enhanced Features

1. **Static Link Creation**: When assets are uploaded with service selection, automatic static links are created
2. **Static Link Protection**: API prevents unlinking of static assets with proper error messages
3. **Asset Library Updates**: Asset creation now handles static linking automatically

### Frontend Implementation

#### Components Enhanced

1. **ServiceAssetLinker**
   - Shows static badges (🔒 Static) for statically linked assets
   - Displays lock icon instead of unlink button for static assets
   - Prevents unlinking attempts on static assets

2. **WebAssetUploadView**
   - Already had service selection functionality
   - Assets uploaded with service selection automatically get static links

3. **ServiceMasterView**
   - Passes static link information to ServiceAssetLinker
   - Calculates which assets are statically linked

#### Type Definitions

1. **AssetLibraryItem**
   - Added `static_service_links` field to track static links
   - Proper TypeScript typing for static link data

## Key Features

### 1. Service Creation

- Users can create Services and Sub-Services through the existing ServiceMasterView
- Services support comprehensive metadata including SEO, social media, and content fields
- Hierarchical structure: Services → Sub-Services

### 2. Asset Upload with Service Selection

- During asset upload, users can select:
  - Linked Service (primary service)
  - Linked Sub-Services (multiple sub-services under the primary service)
- Selection is available in all asset upload forms (Web, SEO, SMM)

### 3. Static Linking (Cannot Be Removed)

**When assets are uploaded with service selection:**
- Automatic static links are created in the database
- `is_static = 1` flag is set in linking tables
- `static_service_links` field in assets table tracks these links

**Static Link Behavior:**
- Assets show "🔒 Static" badge in service asset list
- Unlink button is replaced with lock icon
- API returns 403 error when attempting to unlink static assets
- Clear error message: "Cannot remove static service link created during upload"

### 4. Service Pages Display

- Service pages show all linked assets under "Web Repository"
- Static and non-static assets are displayed together
- Static assets are clearly marked with badges
- Assets are organized by type and display thumbnails when available

### 5. Asset Management

- Users can still link additional assets to services after upload
- These additional links are non-static and can be unlinked
- Full search and filtering capabilities
- Repository-based filtering (Web, SEO, SMM)

## Migration

### Database Migration

Run the SQL migration in `backend/migrations/add-static-service-linking.sql`:

```sql
-- This migration adds:
-- 1. static_service_links column to assets table
-- 2. service_asset_links table with is_static flag
-- 3. subservice_asset_links table with is_static flag
-- 4. Proper indexes for performance
```

### Manual Migration Steps

1. Run the migration SQL file against your database
2. Restart the backend server
3. The frontend will automatically work with the new schema

## Testing

### Backend Tests

- `backend/__tests__/static-service-linking.test.ts`
- Tests static link creation, prevention, and retrieval
- Tests error handling and edge cases
- Tests both service and sub-service linking

### Frontend Tests

- `frontend/components/__tests__/ServiceAssetLinker.test.tsx`
- Tests UI rendering with static links
- Tests user interactions (unlink prevention)
- Tests search and filtering functionality
- Tests badge and icon display

## Usage Examples

### 1. Creating a Static Link

```typescript
// Upload asset with service selection
const assetData = {
  name: 'Company Logo',
  type: 'Image',
  application_type: 'web',
  linked_service_id: 123, // This creates a static link
  linked_sub_service_ids: [456, 457], // These also create static links
  created_by: userId
};

// Result: Asset cannot be unlinked from service 123 or sub-services 456, 457
```

### 2. Attempting to Unlink Static Asset

```typescript
// This will fail with 403 error
const response = await fetch('/api/v1/assets/unlink-from-service', {
  method: 'POST',
  body: JSON.stringify({
    assetId: asset.id,
    serviceId: 123 // Static link - will be rejected
  })
});

// Response: { error: "Cannot remove static service link created during upload" }
```

### 3. Getting Service Assets

```typescript
// Get all assets linked to a service (including static info)
const response = await fetch(`/api/v1/services/${serviceId}/assets`);
const assets = await response.json();

// Each asset includes:
// - link_is_static: boolean
// - linked_at: timestamp
// - static_service_links: array of static link info
```

## Error Handling

### Static Link Errors

1. **403 Forbidden**: When attempting to unlink a static asset
   - Error: "Cannot remove static service link created during upload"
   
2. **404 Not Found**: When asset or service doesn't exist
   - Error: "Asset not found" or "Service not found"

### Validation

1. **Asset Upload**: Validates service and sub-service existence
2. **Link Creation**: Prevents duplicate static links
3. **Link Removal**: Checks static status before allowing unlink

## Performance Considerations

1. **Database Indexes**: Added indexes on linking tables for fast queries
2. **Caching**: Static link information is cached in asset objects
3. **Lazy Loading**: Service assets are loaded on-demand
4. **Efficient Queries**: Uses JOIN queries with proper filtering

## Security

1. **Authorization**: All endpoints require proper authentication
2. **Input Validation**: Service and asset IDs are validated
3. **SQL Injection**: Uses parameterized queries throughout
4. **Permission Checks**: Users can only modify links they have permission for

## Future Enhancements

1. **Bulk Operations**: Support for linking/unlinking multiple assets
2. **Audit Trail**: Track who created static links and when
3. **Link Expiration**: Optional time-based static links
4. **Link Categories**: Different types of static links with different rules
5. **Advanced Filtering**: Filter assets by static/non-static status

## Troubleshooting

### Common Issues

1. **Migration Not Run**: Database tables missing
   - Solution: Run the migration SQL file
   
2. **Static Links Not Working**: Assets can still be unlinked
   - Solution: Check if `is_static` flag is set correctly
   - Verify `static_service_links` field is populated
   
3. **Frontend Not Showing Badges**: Static assets don't show "🔒 Static"
   - Solution: Check if `staticLinks` prop is passed to ServiceAssetLinker
   - Verify asset data includes `static_service_links`

### Debug Queries

```sql
-- Check static links for an asset
SELECT * FROM service_asset_links WHERE asset_id = ? AND is_static = 1;

-- Check asset static_service_links field
SELECT static_service_links FROM assets WHERE id = ?;

-- Get all assets for a service with static info
SELECT a.*, sal.is_static as link_is_static 
FROM assets a 
INNER JOIN service_asset_links sal ON a.id = sal.asset_id 
WHERE sal.service_id = ?;
```

## Conclusion

This implementation provides a robust, user-friendly Service Asset Linking system with the key requirement of static linking during upload. The system is well-tested, performant, and secure, with clear error messages and intuitive UI indicators for static links.
