# Asset-Service Static Linking Implementation Guide

## Overview

This implementation provides a complete solution for linking assets to services with **static (immutable) links** that cannot be removed after creation. Assets linked during upload are permanently associated with services and automatically appear on service pages.

## Architecture

### Database Schema

#### Junction Tables

**service_asset_links** - Many-to-many relationship between assets and services
```sql
- id (PK)
- asset_id (FK → assets)
- service_id (FK → services)
- sub_service_id (FK → sub_services, nullable)
- is_static (0/1) - 1 = immutable, 0 = mutable
- created_at
- created_by (FK → users)
- UNIQUE(asset_id, service_id, sub_service_id)
```

**subservice_asset_links** - Many-to-many relationship between assets and sub-services
```sql
- id (PK)
- asset_id (FK → assets)
- sub_service_id (FK → sub_services)
- is_static (0/1)
- created_at
- created_by (FK → users)
- UNIQUE(asset_id, sub_service_id)
```

#### Asset Table Additions

```sql
ALTER TABLE assets ADD COLUMN static_service_links TEXT DEFAULT '[]';
```

Stores JSON array of static links created during upload:
```json
[
  {
    "service_id": 1,
    "sub_service_id": null,
    "created_at": "2024-02-02T10:30:00Z"
  },
  {
    "service_id": 1,
    "sub_service_id": 5,
    "created_at": "2024-02-02T10:30:00Z"
  }
]
```

## Backend Implementation

### Controller: assetServiceLinkingController.ts

**Endpoints:**

1. **POST /link-static** - Create static asset-service link
   ```typescript
   Body: {
     asset_id: number,
     service_id: number,
     sub_service_id?: number
   }
   Response: { message, link }
   ```

2. **GET /services/:service_id/linked-assets** - Get all assets linked to service
   ```typescript
   Query: ?sub_service_id=5 (optional)
   Response: AssetLibraryItem[]
   ```

3. **GET /sub-services/:sub_service_id/linked-assets** - Get assets linked to sub-service
   ```typescript
   Response: AssetLibraryItem[]
   ```

4. **GET /is-static** - Check if link is static
   ```typescript
   Query: ?asset_id=1&service_id=1&sub_service_id=5
   Response: { is_static: boolean }
   ```

5. **POST /unlink** - Remove dynamic link (fails if static)
   ```typescript
   Body: {
     asset_id: number,
     service_id: number,
     sub_service_id?: number
   }
   Response: { message } or 403 error if static
   ```

6. **GET /assets/:asset_id/static-links** - Get all static links for asset
   ```typescript
   Response: Array of static links with service/sub-service names
   ```

7. **GET /services/:service_id/asset-count** - Get count of linked assets
   ```typescript
   Response: { service_id, asset_count }
   ```

### Routes: assetServiceLinking.ts

Register routes in main server file:
```typescript
import assetServiceLinkingRoutes from './routes/assetServiceLinking';
app.use('/api/v1/asset-service-linking', assetServiceLinkingRoutes);
```

## Frontend Implementation

### Component 1: AssetServiceLinker.tsx

**Purpose:** Service selection component for asset upload form

**Props:**
```typescript
interface AssetServiceLinkerProps {
  onServiceSelect: (serviceId: number, subServiceIds: number[]) => void;
  selectedServiceId?: number;
  selectedSubServiceIds?: number[];
  disabled?: boolean;
}
```

**Features:**
- Service dropdown with all available services
- Sub-service checkboxes (filtered by selected service)
- Static link warning notice
- Validation feedback

**Usage:**
```tsx
<AssetServiceLinker
  onServiceSelect={(serviceId, subServiceIds) => {
    setFormData(prev => ({
      ...prev,
      linked_service_id: serviceId,
      linked_sub_service_ids: subServiceIds
    }));
  }}
  selectedServiceId={formData.linked_service_id}
  selectedSubServiceIds={formData.linked_sub_service_ids}
/>
```

### Component 2: EnhancedAssetUploadWithServiceLink.tsx

**Purpose:** Complete asset upload form with service linking

**Props:**
```typescript
interface EnhancedAssetUploadWithServiceLinkProps {
  onUpload: (asset: Partial<AssetLibraryItem>, file: File) => Promise<void>;
  onCancel: () => void;
  isUploading?: boolean;
}
```

**Features:**
- Drag-and-drop file upload
- Asset details form (name, type, application type)
- Service linking via AssetServiceLinker
- Form validation
- Error handling
- File preview for images

**Workflow:**
1. User drags/selects file
2. Enters asset details
3. Selects service and sub-services
4. Submits form
5. Backend creates static links
6. Asset appears on service page

### Component 3: ServiceLinkedAssetsDisplay.tsx

**Purpose:** Display assets linked to a service on service page

**Props:**
```typescript
interface ServiceLinkedAssetsDisplayProps {
  serviceId: number;
  subServiceId?: number;
  title?: string;
  showStaticIndicator?: boolean;
}
```

**Features:**
- Fetches linked assets from API
- Grid layout with asset cards
- Static link indicator (🔒 badge)
- Asset details (type, category, SEO score)
- Keywords display
- Status badges
- View asset link
- Loading and error states

**Usage:**
```tsx
<ServiceLinkedAssetsDisplay
  serviceId={serviceId}
  subServiceId={subServiceId}
  title="Web Repository Assets"
  showStaticIndicator={true}
/>
```

## Data Flow

### Asset Upload with Service Linking

```
1. User opens EnhancedAssetUploadWithServiceLink
   ↓
2. Selects file, enters details, chooses service
   ↓
3. Form validates all required fields
   ↓
4. Submits to backend with:
   - File data
   - Asset details
   - linked_service_id
   - linked_sub_service_ids
   ↓
5. Backend createAssetLibraryItem():
   - Saves asset to assets table
   - Creates entries in service_asset_links (is_static=1)
   - Creates entries in subservice_asset_links (is_static=1)
   - Updates assets.static_service_links JSON
   ↓
6. Asset stored with linking_active=0 (inactive until QC)
   ↓
7. Admin reviews in QC, approves asset
   ↓
8. linking_active set to 1
   ↓
9. ServiceLinkedAssetsDisplay fetches and renders asset
   ↓
10. Asset appears on service page with 🔒 Static badge
```

### Viewing Linked Assets

```
1. User navigates to service page
   ↓
2. ServiceLinkedAssetsDisplay component mounts
   ↓
3. Fetches from GET /services/{serviceId}/linked-assets
   ↓
4. Backend queries service_asset_links join with assets
   ↓
5. Returns parsed asset data with JSON fields
   ↓
6. Component renders asset grid with cards
   ↓
7. Static links show 🔒 badge
   ↓
8. User can click "View Asset" to open file
```

### Attempting to Unlink Static Asset

```
1. User clicks unlink button on asset
   ↓
2. Frontend calls POST /unlink with asset_id, service_id
   ↓
3. Backend checks is_static flag
   ↓
4. If is_static=1:
   - Returns 403 error
   - Message: "Cannot unlink static asset..."
   ↓
5. Frontend shows error message
   ↓
6. Asset remains linked
```

## Integration Steps

### 1. Database Setup

Run migration to create junction tables:
```bash
# Execute add-static-service-linking.sql
sqlite3 backend/mcc_db.sqlite < backend/migrations/add-static-service-linking.sql
```

### 2. Backend Setup

1. Copy `assetServiceLinkingController.ts` to `backend/controllers/`
2. Copy `assetServiceLinking.ts` to `backend/routes/`
3. Register routes in `backend/server.ts`:
   ```typescript
   import assetServiceLinkingRoutes from './routes/assetServiceLinking';
   app.use('/api/v1/asset-service-linking', assetServiceLinkingRoutes);
   ```

### 3. Frontend Setup

1. Copy components to `frontend/components/`:
   - `AssetServiceLinker.tsx`
   - `EnhancedAssetUploadWithServiceLink.tsx`
   - `ServiceLinkedAssetsDisplay.tsx`

2. Update asset upload view to use `EnhancedAssetUploadWithServiceLink`:
   ```tsx
   import EnhancedAssetUploadWithServiceLink from '../components/EnhancedAssetUploadWithServiceLink';

   // In your upload modal/view
   <EnhancedAssetUploadWithServiceLink
     onUpload={handleAssetUpload}
     onCancel={handleCancel}
     isUploading={isUploading}
   />
   ```

3. Update service page to display linked assets:
   ```tsx
   import ServiceLinkedAssetsDisplay from '../components/ServiceLinkedAssetsDisplay';

   // In your service detail view
   <ServiceLinkedAssetsDisplay
     serviceId={serviceId}
     title="Web Repository"
   />
   ```

### 4. Update Asset Creation Logic

Modify `backend/controllers/assetController.ts` `createAssetLibraryItem()`:

```typescript
// After asset is created, create static links if provided
if (linked_service_id) {
  await linkAssetToServiceStatic({
    asset_id: result.lastID,
    service_id: linked_service_id,
    sub_service_ids: linked_sub_service_ids || []
  });
}
```

## Key Features

### ✅ Static Links (Immutable)

- Created during asset upload
- Stored with `is_static=1` flag
- Cannot be removed via unlink endpoint
- Tracked in `assets.static_service_links` JSON
- Show 🔒 badge on service page

### ✅ Dynamic Links (Mutable)

- Created after upload via linking UI
- Stored with `is_static=0` flag
- Can be removed via unlink endpoint
- Managed in service editing interface

### ✅ Automatic Display

- Assets appear on service page after QC approval
- Visible in Web Repository
- Linked to both service and sub-services
- Searchable and filterable

### ✅ User Experience

- Clear indication of static links
- Warning during upload
- Prevents accidental unlinking
- Intuitive service selection
- Visual feedback on all actions

## API Examples

### Create Static Link

```bash
curl -X POST http://localhost:3003/api/v1/asset-service-linking/link-static \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": 1,
    "service_id": 5,
    "sub_service_id": 12
  }'
```

### Get Service Linked Assets

```bash
curl http://localhost:3003/api/v1/asset-service-linking/services/5/linked-assets
```

### Check if Link is Static

```bash
curl "http://localhost:3003/api/v1/asset-service-linking/is-static?asset_id=1&service_id=5"
```

### Attempt to Unlink Static Asset

```bash
curl -X POST http://localhost:3003/api/v1/asset-service-linking/unlink \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": 1,
    "service_id": 5
  }'
# Returns 403: "Cannot unlink static asset..."
```

## Error Handling

### Common Errors

1. **Asset not found** (404)
   - Asset ID doesn't exist
   - Check asset_id parameter

2. **Service not found** (404)
   - Service ID doesn't exist
   - Check service_id parameter

3. **Cannot unlink static asset** (403)
   - Attempting to remove immutable link
   - Link was created during upload
   - User must contact admin to remove

4. **Validation errors** (400)
   - Missing required fields
   - Invalid data types
   - Check request body

## Testing

### Manual Testing Checklist

- [ ] Upload asset with service link
- [ ] Verify asset appears on service page
- [ ] Check 🔒 badge shows on linked asset
- [ ] Attempt to unlink static asset (should fail)
- [ ] Verify error message displays
- [ ] Create dynamic link (should succeed)
- [ ] Unlink dynamic asset (should succeed)
- [ ] Verify asset removed from service page
- [ ] Test with sub-services
- [ ] Test with multiple services

### API Testing

```bash
# Test static link creation
POST /asset-service-linking/link-static

# Test fetching linked assets
GET /asset-service-linking/services/1/linked-assets

# Test static check
GET /asset-service-linking/is-static?asset_id=1&service_id=1

# Test unlink (should fail for static)
POST /asset-service-linking/unlink
```

## Performance Considerations

### Indexes

Indexes are created on:
- `service_asset_links.asset_id`
- `service_asset_links.service_id`
- `subservice_asset_links.asset_id`
- `subservice_asset_links.sub_service_id`

### Query Optimization

- Use DISTINCT in queries to avoid duplicates
- Filter by is_static flag when needed
- Limit results for large datasets
- Cache asset counts

## Security

### Authorization

- Verify user has permission to link assets
- Check user owns the service
- Validate asset ownership
- Log all linking actions

### Data Validation

- Validate asset_id exists
- Validate service_id exists
- Validate sub_service_id exists
- Sanitize JSON fields

### Immutability

- Static links cannot be modified
- Only admins can override static links
- Audit trail of all changes
- Prevent unauthorized unlinking

## Future Enhancements

1. **Bulk Linking** - Link multiple assets to service at once
2. **Link History** - Track all linking/unlinking actions
3. **Permissions** - Role-based linking permissions
4. **Notifications** - Alert when asset linked to service
5. **Analytics** - Track asset usage across services
6. **Versioning** - Track asset versions linked to service
7. **Scheduling** - Schedule asset linking for future date
8. **Automation** - Auto-link based on rules/tags

## Troubleshooting

### Assets not appearing on service page

1. Check asset status is "Published" or "Approved"
2. Verify linking_active flag is 1
3. Check service_asset_links table for entries
4. Verify API endpoint returns data
5. Check browser console for errors

### Static link indicator not showing

1. Verify is_static flag is 1 in database
2. Check component prop showStaticIndicator={true}
3. Verify asset data includes is_static field
4. Check CSS for badge styling

### Unlink button not working

1. Check if link is static (should fail)
2. Verify user has permission
3. Check API endpoint response
4. Look for error messages in console

## Support

For issues or questions:
1. Check this documentation
2. Review API examples
3. Check database schema
4. Review component props
5. Check browser console for errors
6. Review server logs for API errors
