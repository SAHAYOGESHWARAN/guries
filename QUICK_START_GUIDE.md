# Asset-Service Static Linking - Quick Start Guide

## 🚀 Get Started in 30 Minutes

### What You're Building
A system where users upload assets and link them to services. Once linked, the asset:
- Automatically appears on the service page
- Shows a 🔒 "Static" badge
- Cannot be removed (permanent link)

### Prerequisites
- Node.js backend running
- React frontend running
- SQLite database
- Basic understanding of the codebase

---

## Step 1: Database Setup (5 minutes)

### Run Migration
```bash
cd backend
sqlite3 mcc_db.sqlite < migrations/add-static-service-linking.sql
```

### Verify Tables Created
```bash
sqlite3 mcc_db.sqlite
> .tables
# Should show: service_asset_links, subservice_asset_links

> PRAGMA table_info(service_asset_links);
# Should show columns: id, asset_id, service_id, sub_service_id, is_static, created_at, created_by
```

---

## Step 2: Backend Setup (10 minutes)

### 2.1 Copy Files
```bash
# Copy controller
cp assetServiceLinkingController.ts backend/controllers/

# Copy routes
cp assetServiceLinking.ts backend/routes/
```

### 2.2 Register Routes
Edit `backend/server.ts`:
```typescript
// Add import at top
import assetServiceLinkingRoutes from './routes/assetServiceLinking';

// Add route registration (after other routes)
app.use('/api/v1/asset-service-linking', assetServiceLinkingRoutes);
```

### 2.3 Test Backend
```bash
# Start backend
npm start

# Test endpoint
curl http://localhost:3003/api/v1/asset-service-linking/services/1/linked-assets
# Should return: []
```

---

## Step 3: Frontend Setup (10 minutes)

### 3.1 Copy Components
```bash
# Copy components
cp AssetServiceLinker.tsx frontend/components/
cp EnhancedAssetUploadWithServiceLink.tsx frontend/components/
cp ServiceLinkedAssetsDisplay.tsx frontend/components/
```

### 3.2 Update Upload View
Find your asset upload view and replace with:

```tsx
import EnhancedAssetUploadWithServiceLink from '../components/EnhancedAssetUploadWithServiceLink';

export const AssetUploadView = () => {
  const handleAssetUpload = async (asset, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asset', JSON.stringify(asset));
    
    const response = await fetch('/api/v1/assetLibrary', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      alert('Asset uploaded successfully!');
      // Refresh or navigate
    }
  };

  return (
    <EnhancedAssetUploadWithServiceLink
      onUpload={handleAssetUpload}
      onCancel={() => window.history.back()}
      isUploading={false}
    />
  );
};
```

### 3.3 Update Service Detail View
Find your service detail view and add:

```tsx
import ServiceLinkedAssetsDisplay from '../components/ServiceLinkedAssetsDisplay';

export const ServiceDetailView = ({ serviceId }) => {
  return (
    <div>
      {/* Other service details */}
      
      <ServiceLinkedAssetsDisplay
        serviceId={serviceId}
        title="Web Repository Assets"
        showStaticIndicator={true}
      />
    </div>
  );
};
```

### 3.4 Test Frontend
```bash
# Start frontend
npm start

# Navigate to upload page
# Should see new upload form with service selector
```

---

## Step 4: End-to-End Test (5 minutes)

### Test Workflow
1. **Open Upload Form**
   - Navigate to asset upload page
   - Should see new form with service selector

2. **Upload Asset**
   - Select a file (image or document)
   - Enter asset name
   - Select a service from dropdown
   - Optionally select sub-services
   - Click "Upload Asset"

3. **Verify Upload**
   - Check backend logs for success
   - Check database: `SELECT * FROM service_asset_links;`
   - Should see new entry with `is_static=1`

4. **View on Service Page**
   - Navigate to the service page
   - Should see asset card with 🔒 badge
   - Click "View Asset" to open file

5. **Test Static Link**
   - Try to unlink the asset (if UI has unlink button)
   - Should see error: "Cannot unlink static asset..."
   - Asset remains linked

---

## Common Issues & Fixes

### Issue: "Cannot find module 'assetServiceLinkingController'"
**Fix:** Verify file path in `backend/routes/assetServiceLinking.ts`
```typescript
import { linkAssetToServiceStatic } from '../controllers/assetServiceLinkingController';
```

### Issue: API returns 404 for linked assets
**Fix:** Verify route is registered in `server.ts`
```typescript
app.use('/api/v1/asset-service-linking', assetServiceLinkingRoutes);
```

### Issue: Upload form doesn't show service selector
**Fix:** Verify component is imported correctly
```tsx
import EnhancedAssetUploadWithServiceLink from '../components/EnhancedAssetUploadWithServiceLink';
```

### Issue: Assets don't appear on service page
**Fix:** Check if `linking_active=1` in database
```sql
SELECT id, asset_name, linking_active FROM assets WHERE id = 1;
```

### Issue: Static badge doesn't show
**Fix:** Verify `showStaticIndicator={true}` prop is set
```tsx
<ServiceLinkedAssetsDisplay
  serviceId={serviceId}
  showStaticIndicator={true}  // Must be true
/>
```

---

## API Quick Reference

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

### Get Linked Assets
```bash
curl http://localhost:3003/api/v1/asset-service-linking/services/5/linked-assets
```

### Check if Static
```bash
curl "http://localhost:3003/api/v1/asset-service-linking/is-static?asset_id=1&service_id=5"
```

### Try to Unlink (Will Fail)
```bash
curl -X POST http://localhost:3003/api/v1/asset-service-linking/unlink \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": 1,
    "service_id": 5
  }'
# Returns: 403 Forbidden
```

---

## File Structure

```
backend/
├── controllers/
│   └── assetServiceLinkingController.ts  ← NEW
├── routes/
│   └── assetServiceLinking.ts            ← NEW
└── server.ts                              ← MODIFIED

frontend/
├── components/
│   ├── AssetServiceLinker.tsx                      ← NEW
│   ├── EnhancedAssetUploadWithServiceLink.tsx      ← NEW
│   └── ServiceLinkedAssetsDisplay.tsx              ← NEW
└── views/
    ├── AssetUploadView.tsx                         ← MODIFIED
    └── ServiceDetailView.tsx                       ← MODIFIED
```

---

## Database Schema Quick View

```sql
-- New tables
service_asset_links
├── id (PK)
├── asset_id (FK)
├── service_id (FK)
├── sub_service_id (FK, nullable)
├── is_static (0=dynamic, 1=static)
├── created_at
└── created_by (FK)

subservice_asset_links
├── id (PK)
├── asset_id (FK)
├── sub_service_id (FK)
├── is_static (0=dynamic, 1=static)
├── created_at
└── created_by (FK)

-- New column in assets table
assets.static_service_links (JSON array)
```

---

## Component Props Cheat Sheet

### AssetServiceLinker
```tsx
<AssetServiceLinker
  onServiceSelect={(serviceId, subServiceIds) => {}}  // Required
  selectedServiceId={1}                                // Optional
  selectedSubServiceIds={[2, 3]}                       // Optional
  disabled={false}                                     // Optional
/>
```

### EnhancedAssetUploadWithServiceLink
```tsx
<EnhancedAssetUploadWithServiceLink
  onUpload={async (asset, file) => {}}  // Required
  onCancel={() => {}}                    // Required
  isUploading={false}                    // Optional
/>
```

### ServiceLinkedAssetsDisplay
```tsx
<ServiceLinkedAssetsDisplay
  serviceId={1}                    // Required
  subServiceId={5}                 // Optional
  title="Web Repository"           // Optional
  showStaticIndicator={true}       // Optional
/>
```

---

## Debugging Tips

### Check Database
```bash
# View all service-asset links
sqlite3 backend/mcc_db.sqlite
> SELECT * FROM service_asset_links;

# View static links for specific asset
> SELECT * FROM service_asset_links WHERE asset_id = 1 AND is_static = 1;

# View asset static_service_links JSON
> SELECT id, asset_name, static_service_links FROM assets WHERE id = 1;
```

### Check API Response
```bash
# Get linked assets with verbose output
curl -v http://localhost:3003/api/v1/asset-service-linking/services/1/linked-assets

# Check response headers and body
```

### Check Browser Console
```javascript
// In browser console
// Check if components are rendering
console.log('AssetServiceLinker loaded');

// Check API calls
fetch('/api/v1/asset-service-linking/services/1/linked-assets')
  .then(r => r.json())
  .then(data => console.log('Linked assets:', data));
```

### Check Server Logs
```bash
# Watch backend logs
tail -f backend/logs/server.log

# Look for errors in asset creation
grep -i "error" backend/logs/server.log
```

---

## Performance Checklist

- [ ] Database indexes created
- [ ] API responses < 200ms
- [ ] Images lazy loaded
- [ ] No console errors
- [ ] No memory leaks
- [ ] Pagination working for large datasets

---

## Security Checklist

- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Authorization checks
- [ ] Error messages don't leak info

---

## Next Steps

1. ✅ Complete all 4 steps above
2. ✅ Run end-to-end test
3. ✅ Fix any issues
4. ✅ Read full documentation
5. ✅ Deploy to staging
6. ✅ Test with real data
7. ✅ Deploy to production

---

## Need Help?

1. **Check Documentation**
   - `ASSET_SERVICE_LINKING_IMPLEMENTATION.md` - Full guide
   - `ASSET_SERVICE_LINKING_QUICK_REFERENCE.md` - API reference
   - `ASSET_SERVICE_LINKING_VISUAL_GUIDE.md` - Diagrams

2. **Check Code**
   - Review component files for inline comments
   - Check controller for endpoint logic
   - Review database schema

3. **Debug**
   - Check browser console for errors
   - Check server logs
   - Check database directly
   - Use curl to test API

4. **Common Issues**
   - See "Common Issues & Fixes" section above

---

## Success Indicators

✅ Upload form shows service selector
✅ Can select service and sub-services
✅ Asset uploads successfully
✅ Asset appears on service page
✅ Asset shows 🔒 Static badge
✅ Cannot unlink static asset
✅ Error message shows when trying to unlink
✅ No console errors
✅ No server errors

---

## Estimated Time

- Database setup: 5 minutes
- Backend setup: 10 minutes
- Frontend setup: 10 minutes
- Testing: 5 minutes
- **Total: 30 minutes**

---

**You're ready to go! Start with Step 1 and follow through. Good luck! 🚀**
