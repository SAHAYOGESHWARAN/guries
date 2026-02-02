# Asset-Service Static Linking - Quick Reference

## What This Does

Creates **permanent, immutable links** between assets and services during upload. Once linked, assets:
- ✅ Automatically appear on service pages
- ✅ Show in Web Repository
- ✅ Cannot be removed (static link)
- ✅ Display with 🔒 badge

## Files Created

### Backend
```
backend/controllers/assetServiceLinkingController.ts  (7 endpoints)
backend/routes/assetServiceLinking.ts                (Route registration)
```

### Frontend
```
frontend/components/AssetServiceLinker.tsx                      (Service selector)
frontend/components/EnhancedAssetUploadWithServiceLink.tsx      (Upload form)
frontend/components/ServiceLinkedAssetsDisplay.tsx             (Asset display)
```

### Documentation
```
ASSET_SERVICE_LINKING_IMPLEMENTATION.md  (Full guide)
ASSET_SERVICE_LINKING_CHECKLIST.md       (Integration steps)
ASSET_SERVICE_LINKING_QUICK_REFERENCE.md (This file)
```

## 5-Minute Setup

### 1. Database (1 min)
```bash
sqlite3 backend/mcc_db.sqlite < backend/migrations/add-static-service-linking.sql
```

### 2. Backend (2 min)
```typescript
// In backend/server.ts
import assetServiceLinkingRoutes from './routes/assetServiceLinking';
app.use('/api/v1/asset-service-linking', assetServiceLinkingRoutes);
```

### 3. Frontend (2 min)
```tsx
// In your upload view
import EnhancedAssetUploadWithServiceLink from '../components/EnhancedAssetUploadWithServiceLink';

<EnhancedAssetUploadWithServiceLink
  onUpload={handleAssetUpload}
  onCancel={handleCancel}
/>

// In service detail view
import ServiceLinkedAssetsDisplay from '../components/ServiceLinkedAssetsDisplay';

<ServiceLinkedAssetsDisplay serviceId={serviceId} />
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/link-static` | Create static link |
| GET | `/services/:id/linked-assets` | Get service assets |
| GET | `/sub-services/:id/linked-assets` | Get sub-service assets |
| GET | `/is-static?asset_id=1&service_id=1` | Check if static |
| POST | `/unlink` | Remove dynamic link (fails if static) |
| GET | `/assets/:id/static-links` | Get asset static links |
| GET | `/services/:id/asset-count` | Count linked assets |

## Component Props

### AssetServiceLinker
```tsx
<AssetServiceLinker
  onServiceSelect={(serviceId, subServiceIds) => {}}
  selectedServiceId={1}
  selectedSubServiceIds={[2, 3]}
  disabled={false}
/>
```

### EnhancedAssetUploadWithServiceLink
```tsx
<EnhancedAssetUploadWithServiceLink
  onUpload={async (asset, file) => {}}
  onCancel={() => {}}
  isUploading={false}
/>
```

### ServiceLinkedAssetsDisplay
```tsx
<ServiceLinkedAssetsDisplay
  serviceId={1}
  subServiceId={5}
  title="Web Repository"
  showStaticIndicator={true}
/>
```

## Data Flow

```
User Upload
    ↓
Select Service + Sub-Services
    ↓
Submit Form
    ↓
Backend Creates:
  - Asset record
  - service_asset_links (is_static=1)
  - subservice_asset_links (is_static=1)
  - static_service_links JSON
    ↓
Asset Appears on Service Page
    ↓
Shows 🔒 Static Badge
    ↓
Cannot Be Unlinked
```

## Database Schema

### service_asset_links
```sql
id              INTEGER PRIMARY KEY
asset_id        INTEGER (FK → assets)
service_id      INTEGER (FK → services)
sub_service_id  INTEGER (FK → sub_services, nullable)
is_static       INTEGER (0=dynamic, 1=static)
created_at      DATETIME
created_by      INTEGER (FK → users)
```

### subservice_asset_links
```sql
id              INTEGER PRIMARY KEY
asset_id        INTEGER (FK → assets)
sub_service_id  INTEGER (FK → sub_services)
is_static       INTEGER (0=dynamic, 1=static)
created_at      DATETIME
created_by      INTEGER (FK → users)
```

### assets (new column)
```sql
static_service_links TEXT (JSON array)
```

## Common Tasks

### Upload Asset with Service Link
```tsx
const handleUpload = async (asset, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('asset', JSON.stringify({
    ...asset,
    linked_service_id: 1,
    linked_sub_service_ids: [2, 3]
  }));
  
  await fetch('/api/v1/assetLibrary', {
    method: 'POST',
    body: formData
  });
};
```

### Display Linked Assets
```tsx
<ServiceLinkedAssetsDisplay
  serviceId={serviceId}
  title="Web Repository Assets"
/>
```

### Check if Link is Static
```typescript
const response = await fetch(
  `/api/v1/asset-service-linking/is-static?asset_id=1&service_id=1`
);
const { is_static } = await response.json();
```

### Attempt to Unlink (Fails if Static)
```typescript
const response = await fetch(
  '/api/v1/asset-service-linking/unlink',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      asset_id: 1,
      service_id: 1
    })
  }
);

if (response.status === 403) {
  // Static link - cannot remove
  console.log('This asset is permanently linked');
}
```

## Error Handling

### Upload Without Service
```
Error: "Please select a service to link this asset to"
Status: 400
```

### Unlink Static Asset
```
Error: "Cannot unlink static asset. This asset was linked during upload and cannot be removed."
Status: 403
```

### Asset Not Found
```
Error: "Asset not found"
Status: 404
```

### Service Not Found
```
Error: "Service not found"
Status: 404
```

## Testing

### Manual Test Workflow
1. Open asset upload form
2. Select file
3. Enter asset name
4. Select service from dropdown
5. Select sub-services (optional)
6. Click "Upload Asset"
7. Navigate to service page
8. Verify asset appears with 🔒 badge
9. Try to unlink (should fail with error)

### API Test
```bash
# Create static link
curl -X POST http://localhost:3003/api/v1/asset-service-linking/link-static \
  -H "Content-Type: application/json" \
  -d '{"asset_id": 1, "service_id": 1}'

# Get linked assets
curl http://localhost:3003/api/v1/asset-service-linking/services/1/linked-assets

# Check if static
curl "http://localhost:3003/api/v1/asset-service-linking/is-static?asset_id=1&service_id=1"

# Try to unlink (should fail)
curl -X POST http://localhost:3003/api/v1/asset-service-linking/unlink \
  -H "Content-Type: application/json" \
  -d '{"asset_id": 1, "service_id": 1}'
```

## Key Features

| Feature | Details |
|---------|---------|
| **Static Links** | Immutable, created during upload, cannot be removed |
| **Dynamic Links** | Mutable, created after upload, can be removed |
| **Auto Display** | Assets appear on service page after QC approval |
| **Visual Indicator** | 🔒 badge shows static links |
| **Sub-Services** | Link to both service and sub-services |
| **Validation** | Form validates all required fields |
| **Error Handling** | Clear error messages for all failures |
| **Performance** | Indexed queries for fast retrieval |

## Troubleshooting

### Assets Not Showing
- [ ] Check asset status is "Published"
- [ ] Verify linking_active = 1
- [ ] Check service_asset_links table
- [ ] Verify API returns data

### Static Badge Not Showing
- [ ] Check is_static = 1 in database
- [ ] Verify showStaticIndicator={true}
- [ ] Check CSS for badge styling

### Upload Fails
- [ ] Check service is selected
- [ ] Verify file is valid
- [ ] Check file size < 50MB
- [ ] Review console errors

### Unlink Button Doesn't Work
- [ ] Check if link is static (should fail)
- [ ] Verify user permissions
- [ ] Check API response
- [ ] Review console errors

## Performance Tips

- Indexes created on all foreign keys
- Use pagination for large asset lists
- Cache asset counts
- Lazy load asset images
- Optimize queries with DISTINCT

## Security

- Input validation on all endpoints
- Authorization checks
- SQL injection prevention
- XSS prevention in components
- CSRF protection
- Audit logging

## Next Steps

1. ✅ Run database migration
2. ✅ Copy backend files
3. ✅ Register routes
4. ✅ Copy frontend components
5. ✅ Update upload view
6. ✅ Update service view
7. ✅ Test end-to-end
8. ✅ Deploy to production

## Support

- See `ASSET_SERVICE_LINKING_IMPLEMENTATION.md` for full details
- See `ASSET_SERVICE_LINKING_CHECKLIST.md` for integration steps
- Check component files for inline documentation
- Review API examples in implementation guide

## Summary

This implementation provides:
- ✅ Complete asset-service linking system
- ✅ Static (immutable) links that cannot be removed
- ✅ Automatic display on service pages
- ✅ Visual indicators for static links
- ✅ Proper error handling
- ✅ Full frontend and backend integration
- ✅ Comprehensive documentation

**Time to integrate:** 30 minutes
**Time to test:** 1 hour
**Time to deploy:** 2 hours
