# Services and Asset Linking - Comprehensive Test Plan

## Test Environment Setup

Since Node.js is not available in this environment, here's a comprehensive test plan to verify the implementation:

## 1. Database Migration Test

### Test: Verify Static Linking Tables Exist
```sql
-- Check if tables were created
.tables
-- Should show: service_asset_links, subservice_asset_links

-- Check table structure
.schema service_asset_links
-- Should have: id, asset_id, service_id, is_static, created_at, created_by

.schema subservice_asset_links  
-- Should have: id, asset_id, sub_service_id, is_static, created_at, created_by

-- Check assets table has static_service_links column
.schema assets
-- Should include: static_service_links TEXT DEFAULT '[]'
```

## 2. Backend API Tests

### Test 2.1: Asset Creation with Static Links
```bash
# Create test service first
curl -X POST http://localhost:3003/api/v1/services \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "Test Service",
    "service_code": "TS-001",
    "status": "Draft",
    "created_by": 1
  }'

# Create asset with service selection (should create static links)
curl -X POST http://localhost:3003/api/v1/assetLibrary \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Static Asset",
    "type": "Image",
    "application_type": "web",
    "linked_service_id": 1,
    "linked_sub_service_ids": [1],
    "created_by": 1,
    "status": "Draft"
  }'

# Expected Response:
# {
#   "id": 1,
#   "name": "Test Static Asset",
#   "static_service_links": [
#     {"service_id": 1, "type": "service"},
#     {"sub_service_id": 1, "type": "subservice"}
#   ]
# }
```

### Test 2.2: Verify Static Links in Database
```sql
-- Check service_asset_links table
SELECT * FROM service_asset_links WHERE asset_id = 1;
-- Should show: is_static = 1

-- Check subservice_asset_links table  
SELECT * FROM subservice_asset_links WHERE asset_id = 1;
-- Should show: is_static = 1

-- Check assets table
SELECT static_service_links FROM assets WHERE id = 1;
-- Should show JSON array with static links
```

### Test 2.3: Attempt to Unlink Static Asset (Should Fail)
```bash
curl -X POST http://localhost:3003/api/v1/assets/unlink-from-service \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": 1,
    "serviceId": 1
  }'

# Expected Response: 403 Forbidden
# {
#   "error": "Cannot remove static service link created during upload"
# }
```

### Test 2.4: Get Service Assets
```bash
curl -X GET http://localhost:3003/api/v1/services/1/assets

# Expected Response:
# [
#   {
#     "id": 1,
#     "name": "Test Static Asset",
#     "link_is_static": 1,
#     "linked_at": "2024-01-01T00:00:00.000Z",
#     "static_service_links": [...]
#   }
# ]
```

## 3. Frontend Tests

### Test 3.1: Service Creation
1. Navigate to ServiceMasterView
2. Click "Create New Service"
3. Fill in service details:
   - Service Name: "Test Service"
   - Service Code: "TS-001"
   - Status: "Draft"
4. Save the service
5. **Expected**: Service appears in the service list

### Test 3.2: Asset Upload with Service Selection
1. Navigate to Web Asset Upload
2. Fill in asset details:
   - Name: "Test Asset"
   - Type: "Image"
3. In "Linked Service" dropdown:
   - Select "Test Service" (should appear in list)
4. Select sub-services if available
5. Upload the asset
6. **Expected**: Asset created and linked to service

### Test 3.3: Verify Static Link in UI
1. Navigate to the service page where asset was linked
2. Go to "Web Repository" section
3. **Expected**: 
   - Asset appears in the list
   - Shows "🔒 Static" badge
   - Shows lock icon instead of unlink button
   - Cannot click unlink (button disabled/locked)

### Test 3.4: Attempt to Unlink Static Asset
1. Try to click the unlink button on static asset
2. **Expected**: 
   - No unlink action occurs
   - Hover shows tooltip: "Static link - cannot be removed (created during upload)"
   - Console shows error if attempt made via API

## 4. Integration Tests

### Test 4.1: End-to-End Workflow
1. Create Service → Create Sub-Service
2. Upload Asset with Service and Sub-Service selection
3. Verify asset appears on both service and sub-service pages
4. Verify static badges appear on both pages
5. Attempt to unlink from both pages (should fail)
6. Verify asset still linked after refresh

### Test 4.2: Multiple Assets Testing
1. Upload multiple assets with same service selection
2. Verify all get static links
3. Verify some can be unlinked (non-static) and others cannot (static)
4. Test bulk operations if available

## 5. Edge Cases Testing

### Test 5.1: Invalid Service ID
```bash
curl -X POST http://localhost:3003/api/v1/assetLibrary \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Asset",
    "linked_service_id": 99999,
    "created_by": 1
  }'
# Expected: 404 or appropriate error
```

### Test 5.2: Asset Without Service Selection
```bash
curl -X POST http://localhost:3003/api/v1/assetLibrary \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Asset No Service",
    "type": "Image",
    "created_by": 1
  }'
# Expected: Asset created with empty static_service_links
```

### Test 5.3: Non-Static Link Creation and Unlinking
```bash
# Create asset without service selection
# Then manually link it (non-static)
curl -X POST http://localhost:3003/api/v1/assets/link-to-service \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": 2,
    "serviceId": 1
  }'

# Should succeed (non-static link)
# Then unlink should also succeed
curl -X POST http://localhost:3003/api/v1/assets/unlink-from-service \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": 2,
    "serviceId": 1
  }'
# Expected: 200 Success
```

## 6. Performance Tests

### Test 6.1: Large Number of Assets
1. Create service with 100+ linked assets
2. Test service page loading time
3. Test search and filtering performance
4. **Expected**: Page loads within acceptable time (< 3 seconds)

### Test 6.2: Concurrent Operations
1. Multiple users uploading assets simultaneously
2. Multiple users linking/unlinking assets
3. **Expected**: No race conditions, data integrity maintained

## 7. Security Tests

### Test 7.1: Unauthorized Access
```bash
# Try to unlink without authentication
curl -X POST http://localhost:3003/api/v1/assets/unlink-from-service \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": 1,
    "serviceId": 1
  }'
# Expected: 401 Unauthorized
```

### Test 7.2: SQL Injection Attempts
```bash
curl -X POST http://localhost:3003/api/v1/assets/unlink-from-service \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "1; DROP TABLE assets; --",
    "serviceId": 1
  }'
# Expected: 400 Bad Request or handled safely
```

## 8. Browser Compatibility Tests

### Test 8.1: Modern Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Test 8.2: Mobile Browsers
- Chrome Mobile
- Safari Mobile
- Samsung Internet

## 9. Manual Testing Checklist

### Service Management
- [ ] Create new service
- [ ] Edit existing service
- [ ] Create sub-service under service
- [ ] Delete service (with proper cleanup)

### Asset Upload
- [ ] Upload asset without service selection
- [ ] Upload asset with service selection
- [ ] Upload asset with multiple sub-service selection
- [ ] Verify static links created automatically

### Asset Linking
- [ ] Link additional assets to service (non-static)
- [ ] Unlink non-static assets
- [ ] Attempt to unlink static assets (should fail)
- [ ] Verify error messages are clear

### UI/UX
- [ ] Static badges display correctly
- [ ] Lock icons appear for static assets
- [ ] Tooltips are informative
- [ ] Responsive design works on mobile
- [ ] Loading states work properly

## 10. Automated Test Scripts

### Frontend Tests (Jest)
```bash
cd frontend
npm test ServiceAssetLinker.test.tsx
```

### Backend Tests (Jest)
```bash
cd backend  
npm test static-service-linking.test.ts
```

## Test Results Documentation

After running tests, document:

1. **Pass/Fail Status** for each test
2. **Performance Metrics** (load times, response times)
3. **Browser Compatibility** results
4. **Security Test** outcomes
5. **Bug Reports** with screenshots
6. **User Feedback** from manual testing

## Rollback Plan

If tests fail:
1. Database rollback: Remove static linking tables/columns
2. Code rollback: Revert to previous asset controller version
3. Frontend rollback: Remove static link UI components

## Success Criteria

✅ All tests pass
✅ Performance meets requirements  
✅ Security tests pass
✅ User acceptance testing complete
✅ Documentation updated

## Next Steps

1. Run database migration
2. Execute test plan
3. Fix any issues found
4. Deploy to staging
5. User acceptance testing
6. Production deployment
