# Asset-Service Static Linking - Integration Checklist

## Quick Start (30 minutes)

### Phase 1: Database Setup (5 minutes)

- [ ] Run migration: `add-static-service-linking.sql`
  ```bash
  sqlite3 backend/mcc_db.sqlite < backend/migrations/add-static-service-linking.sql
  ```
- [ ] Verify tables created:
  - [ ] `service_asset_links` table exists
  - [ ] `subservice_asset_links` table exists
  - [ ] `assets.static_service_links` column exists
- [ ] Verify indexes created:
  - [ ] `idx_service_asset_links_asset_id`
  - [ ] `idx_service_asset_links_service_id`
  - [ ] `idx_subservice_asset_links_asset_id`
  - [ ] `idx_subservice_asset_links_sub_service_id`

### Phase 2: Backend Setup (10 minutes)

- [ ] Copy files to backend:
  - [ ] `backend/controllers/assetServiceLinkingController.ts`
  - [ ] `backend/routes/assetServiceLinking.ts`

- [ ] Register routes in `backend/server.ts`:
  ```typescript
  import assetServiceLinkingRoutes from './routes/assetServiceLinking';
  app.use('/api/v1/asset-service-linking', assetServiceLinkingRoutes);
  ```

- [ ] Update `backend/controllers/assetController.ts`:
  - [ ] Import `linkAssetToServiceStatic` from assetServiceLinkingController
  - [ ] In `createAssetLibraryItem()`, after asset creation:
    ```typescript
    if (linked_service_id) {
      await linkAssetToServiceStatic({
        asset_id: result.lastID,
        service_id: linked_service_id,
        sub_service_id: linked_sub_service_ids
      });
    }
    ```

- [ ] Test backend endpoints:
  ```bash
  # Test link creation
  curl -X POST http://localhost:3003/api/v1/asset-service-linking/link-static \
    -H "Content-Type: application/json" \
    -d '{"asset_id": 1, "service_id": 1}'
  
  # Test fetch linked assets
  curl http://localhost:3003/api/v1/asset-service-linking/services/1/linked-assets
  ```

### Phase 3: Frontend Setup (10 minutes)

- [ ] Copy components to `frontend/components/`:
  - [ ] `AssetServiceLinker.tsx`
  - [ ] `EnhancedAssetUploadWithServiceLink.tsx`
  - [ ] `ServiceLinkedAssetsDisplay.tsx`

- [ ] Update asset upload view:
  - [ ] Replace old upload form with `EnhancedAssetUploadWithServiceLink`
  - [ ] Update import statements
  - [ ] Test file upload
  - [ ] Test service selection
  - [ ] Test form validation

- [ ] Update service detail view:
  - [ ] Add `ServiceLinkedAssetsDisplay` component
  - [ ] Pass serviceId prop
  - [ ] Test asset display
  - [ ] Verify static badge shows

- [ ] Test frontend:
  - [ ] Upload asset with service link
  - [ ] Verify asset appears on service page
  - [ ] Check static badge displays
  - [ ] Test error handling

### Phase 4: Integration Testing (5 minutes)

- [ ] End-to-end workflow:
  - [ ] Create new service
  - [ ] Upload asset linked to service
  - [ ] Verify asset appears on service page
  - [ ] Check static link indicator
  - [ ] Attempt to unlink (should fail)
  - [ ] Verify error message

- [ ] Edge cases:
  - [ ] Upload without service (should fail)
  - [ ] Upload with invalid service (should fail)
  - [ ] Upload with sub-services
  - [ ] Multiple assets to same service
  - [ ] Same asset to multiple services

## Detailed Integration Steps

### Step 1: Database Migration

**File:** `backend/migrations/add-static-service-linking.sql`

```sql
-- Already provided in migration file
-- Creates service_asset_links and subservice_asset_links tables
-- Adds static_service_links column to assets
-- Creates performance indexes
```

**Execute:**
```bash
cd backend
sqlite3 mcc_db.sqlite < migrations/add-static-service-linking.sql
```

**Verify:**
```sql
-- Check tables exist
SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%asset_link%';

-- Check columns
PRAGMA table_info(service_asset_links);
PRAGMA table_info(subservice_asset_links);

-- Check assets column
PRAGMA table_info(assets);
-- Should show: static_service_links column
```

### Step 2: Backend Controller

**File:** `backend/controllers/assetServiceLinkingController.ts`

**Key Functions:**
- `linkAssetToServiceStatic()` - Create static link
- `getServiceLinkedAssets()` - Fetch linked assets
- `getSubServiceLinkedAssets()` - Fetch sub-service assets
- `unlinkAssetFromService()` - Remove dynamic link (fails if static)
- `isAssetLinkStatic()` - Check if link is immutable
- `getAssetStaticLinks()` - Get all static links for asset
- `getServiceAssetCount()` - Count linked assets

**Integration Point:**
```typescript
// In assetController.ts createAssetLibraryItem()
import { linkAssetToServiceStatic } from './assetServiceLinkingController';

// After creating asset
if (linked_service_id) {
  await linkAssetToServiceStatic({
    asset_id: result.lastID,
    service_id: linked_service_id,
    sub_service_id: linked_sub_service_ids
  });
}
```

### Step 3: Backend Routes

**File:** `backend/routes/assetServiceLinking.ts`

**Endpoints:**
```
POST   /link-static                              - Create static link
GET    /services/:service_id/linked-assets       - Get service assets
GET    /sub-services/:sub_service_id/linked-assets - Get sub-service assets
GET    /is-static                                - Check if static
POST   /unlink                                   - Remove dynamic link
GET    /assets/:asset_id/static-links            - Get asset static links
GET    /services/:service_id/asset-count         - Get asset count
```

**Register in server.ts:**
```typescript
import assetServiceLinkingRoutes from './routes/assetServiceLinking';
app.use('/api/v1/asset-service-linking', assetServiceLinkingRoutes);
```

### Step 4: Frontend Components

**Component 1: AssetServiceLinker.tsx**
- Service dropdown
- Sub-service checkboxes
- Static link warning
- Validation

**Component 2: EnhancedAssetUploadWithServiceLink.tsx**
- File upload with drag-drop
- Asset details form
- Service linking
- Form validation
- Error handling

**Component 3: ServiceLinkedAssetsDisplay.tsx**
- Asset grid display
- Static link badge
- Asset details
- Keywords
- View asset link

### Step 5: Integration Points

**Asset Upload Flow:**
```typescript
// In your upload handler
const handleAssetUpload = async (asset: Partial<AssetLibraryItem>, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('asset', JSON.stringify(asset));
  
  // Include linked_service_id and linked_sub_service_ids
  // Backend will create static links automatically
  
  const response = await fetch('/api/v1/assetLibrary', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

**Service Page Display:**
```tsx
// In service detail view
<ServiceLinkedAssetsDisplay
  serviceId={serviceId}
  subServiceId={subServiceId}
  title="Web Repository"
  showStaticIndicator={true}
/>
```

## Testing Checklist

### Unit Tests

- [ ] Test static link creation
  ```typescript
  POST /link-static with valid data → 201 Created
  POST /link-static with invalid asset_id → 404 Not Found
  POST /link-static with invalid service_id → 404 Not Found
  ```

- [ ] Test fetching linked assets
  ```typescript
  GET /services/1/linked-assets → 200 OK with assets array
  GET /services/999/linked-assets → 200 OK with empty array
  ```

- [ ] Test static check
  ```typescript
  GET /is-static?asset_id=1&service_id=1 → { is_static: true }
  GET /is-static?asset_id=1&service_id=999 → { is_static: false }
  ```

- [ ] Test unlink
  ```typescript
  POST /unlink with static link → 403 Forbidden
  POST /unlink with dynamic link → 200 OK
  ```

### Integration Tests

- [ ] Upload asset with service link
  - [ ] Asset created in database
  - [ ] Static link created in service_asset_links
  - [ ] static_service_links JSON updated
  - [ ] Asset appears on service page

- [ ] Display linked assets
  - [ ] API returns correct assets
  - [ ] Component renders asset grid
  - [ ] Static badge displays
  - [ ] Asset details show correctly

- [ ] Attempt to unlink
  - [ ] Static link shows error
  - [ ] Dynamic link removes successfully
  - [ ] Asset disappears from service page

### UI/UX Tests

- [ ] Asset upload form
  - [ ] File upload works
  - [ ] Service selection works
  - [ ] Sub-service selection works
  - [ ] Form validation works
  - [ ] Error messages display

- [ ] Service page
  - [ ] Linked assets display
  - [ ] Static badge shows
  - [ ] Asset details visible
  - [ ] View asset link works

- [ ] Error handling
  - [ ] Upload without service fails
  - [ ] Invalid service shows error
  - [ ] Unlink static asset shows error
  - [ ] Network errors handled

## Deployment Checklist

- [ ] Database migration applied
- [ ] Backend code deployed
- [ ] Routes registered
- [ ] Frontend components deployed
- [ ] Environment variables set
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] Performance tested
- [ ] Security reviewed
- [ ] Documentation updated

## Rollback Plan

If issues occur:

1. **Database Rollback:**
   ```sql
   DROP TABLE IF EXISTS service_asset_links;
   DROP TABLE IF EXISTS subservice_asset_links;
   ALTER TABLE assets DROP COLUMN static_service_links;
   ```

2. **Code Rollback:**
   - Remove new controller and routes
   - Revert assetController.ts changes
   - Remove new components

3. **Verification:**
   - Test asset upload without service link
   - Verify existing assets still work
   - Check service pages display correctly

## Performance Optimization

- [ ] Indexes created on junction tables
- [ ] Query optimization for large datasets
- [ ] Caching for asset counts
- [ ] Pagination for asset lists
- [ ] Lazy loading for images

## Security Review

- [ ] Input validation on all endpoints
- [ ] Authorization checks
- [ ] SQL injection prevention
- [ ] XSS prevention in components
- [ ] CSRF protection
- [ ] Rate limiting on endpoints
- [ ] Audit logging for changes

## Documentation

- [ ] README updated
- [ ] API documentation updated
- [ ] Component documentation added
- [ ] Database schema documented
- [ ] Integration guide created
- [ ] Troubleshooting guide added

## Support & Maintenance

- [ ] Monitor error logs
- [ ] Track performance metrics
- [ ] Gather user feedback
- [ ] Plan enhancements
- [ ] Update documentation
- [ ] Security patches applied

## Sign-Off

- [ ] Development complete
- [ ] Testing complete
- [ ] Code review complete
- [ ] Documentation complete
- [ ] Ready for production

---

**Estimated Time:** 30 minutes for basic setup
**Estimated Time:** 2 hours for full integration and testing
**Estimated Time:** 4 hours for production deployment with monitoring
