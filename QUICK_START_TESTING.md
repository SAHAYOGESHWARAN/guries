# Quick Start Testing Guide

## 5-Minute Quick Test

### Setup (1 minute)
```bash
# Terminal 1: Start Backend
cd backend
npm install
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev

# Open browser: http://localhost:5173
```

### Test Campaign (2 minutes)
1. Navigate to **Campaigns** module
2. Click **New Campaign**
3. Fill in:
   - Name: "Test Campaign"
   - Type: "Content"
   - Status: "planning"
4. Click **Submit**
5. ✅ Campaign appears immediately
6. Navigate to **Projects** module
7. Navigate back to **Campaigns**
8. ✅ Campaign still appears

### Test Project (1 minute)
1. Navigate to **Projects** module
2. Click **New Project**
3. Fill in:
   - Name: "Test Project"
   - Code: "PRJ-001"
   - Status: "Planned"
4. Click **Submit**
5. ✅ Project appears immediately
6. Click on project to open detail
7. ✅ No "Project Not Found" error

### Test Asset (1 minute)
1. Navigate to **Assets** module
2. Click **New Asset**
3. Fill in:
   - Name: "Test Asset"
   - Type: "Image"
   - Category: "Graphics"
   - Format: "PNG"
   - Application Type: "web"
4. Click **Submit**
5. ✅ Asset appears immediately
6. Navigate away and back
7. ✅ Asset still appears

---

## 15-Minute Comprehensive Test

### Part 1: Data Persistence (5 minutes)

#### Campaign Persistence
```
1. Create campaign "Campaign A"
2. Navigate to Projects
3. Navigate back to Campaigns
4. ✅ Campaign A appears
5. Refresh page (F5)
6. ✅ Campaign A still appears
```

#### Project Persistence
```
1. Create project "Project A"
2. Navigate to Assets
3. Navigate back to Projects
4. ✅ Project A appears
5. Click on project detail
6. ✅ No "Project Not Found" error
7. Refresh page (F5)
8. ✅ Project A still appears
```

#### Asset Persistence
```
1. Create asset "Asset A"
2. Navigate to Campaigns
3. Navigate back to Assets
4. ✅ Asset A appears
5. Refresh page (F5)
6. ✅ Asset A still appears
```

### Part 2: Linked Assets (5 minutes)

#### Create Asset with Service Link
```
1. Navigate to Assets
2. Create asset "Asset B"
3. Select Service: "Website Design"
4. Click Submit
5. ✅ Asset B appears in list
```

#### View Linked Assets
```
1. Navigate to Services
2. Open "Website Design" service
3. Scroll to "Linked Assets"
4. ✅ Asset B appears in linked assets
5. Navigate away and back
6. ✅ Asset B still appears
```

### Part 3: Real-time Updates (5 minutes)

#### Socket Events
```
1. Open two browser windows
2. In Window 1: Create campaign "Campaign B"
3. In Window 2: Watch Campaigns module
4. ✅ Campaign B appears in Window 2 without refresh
5. In Window 1: Navigate to Projects
6. In Window 2: Campaign B still appears
```

---

## Browser Console Testing

### Check Cache Status
```javascript
// In browser console
dataCache.getStats()
// Output: { keys: ['campaigns', 'projects', 'assets'], size: 3 }
```

### Check Specific Cache
```javascript
// Get campaigns from cache
dataCache.get('campaigns')
// Output: [{ id: 1, campaign_name: 'Test Campaign', ... }]
```

### Monitor Socket Events
```javascript
// In browser console
socket.on('campaign_created', (data) => {
    console.log('Campaign created:', data);
});

socket.on('campaign_updated', (data) => {
    console.log('Campaign updated:', data);
});

socket.on('campaign_deleted', (data) => {
    console.log('Campaign deleted:', data);
});
```

### Check API Response
```javascript
// Fetch campaigns from API
fetch('/api/v1/campaigns')
    .then(r => r.json())
    .then(d => console.log('Campaigns:', d))
```

---

## Network Tab Testing

### Monitor API Calls
1. Open DevTools → Network tab
2. Create a campaign
3. ✅ See POST /api/v1/campaigns
4. ✅ Response includes campaign with ID
5. Navigate to Projects
6. Navigate back to Campaigns
7. ✅ See GET /api/v1/campaigns (soft refresh)
8. ✅ Response includes all campaigns

### Check Response Format
1. Click on API call in Network tab
2. Go to Response tab
3. ✅ Verify response includes:
   - `id` field (not null)
   - `campaign_name` field
   - `status` field
   - `created_at` field

---

## Offline Mode Testing

### Test Offline Fallback
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Navigate to Campaigns
4. ✅ Campaigns still display (from cache)
5. Navigate to Projects
6. ✅ Projects still display (from cache)
7. Restore network connection
8. ✅ Data syncs correctly

---

## Error Testing

### Test Error Handling
1. Open DevTools → Network tab
2. Create a campaign
3. Simulate error: DevTools → Network → Offline
4. Try to create another campaign
5. ✅ Error message displayed
6. Restore network
7. ✅ First campaign still persists
8. Try creating again
9. ✅ Creation succeeds

---

## Performance Testing

### Measure Response Times
```javascript
// In browser console
console.time('campaign-fetch');
fetch('/api/v1/campaigns').then(r => r.json());
console.timeEnd('campaign-fetch');
// Output: campaign-fetch: 45ms (or similar)
```

### Check Cache Hit Rate
```javascript
// Create a campaign
// Fetch campaigns (API call)
// Fetch campaigns again (should be from cache)
// Check Network tab - second fetch should be instant
```

---

## Troubleshooting Quick Fixes

### If Campaign Disappears
```javascript
// In browser console
1. Check cache: dataCache.get('campaigns')
2. Check localStorage: localStorage.getItem('campaigns')
3. Check API: fetch('/api/v1/campaigns').then(r => r.json())
4. Clear cache: dataCache.clear()
5. Refresh page
```

### If "Project Not Found" Error
```javascript
// In browser console
1. Check project ID: dataCache.get('projects')[0].id
2. Check API response: fetch('/api/v1/projects/1').then(r => r.json())
3. Check backend logs for errors
4. Verify project exists in database
```

### If Linked Assets Don't Show
```javascript
// In browser console
1. Check API: fetch('/api/v1/asset-service-linking/services/5/linked-assets').then(r => r.json())
2. Check if response is empty
3. Check backend logs for fallback query execution
4. Verify service_asset_links table has records
```

---

## Test Checklist

### Quick Test (5 minutes)
- [ ] Campaign created and persists
- [ ] Project created and persists
- [ ] Asset created and persists
- [ ] No errors in console

### Comprehensive Test (15 minutes)
- [ ] Campaign persists across navigation
- [ ] Campaign persists after refresh
- [ ] Project persists across navigation
- [ ] Project detail loads without error
- [ ] Asset persists across navigation
- [ ] Linked assets display in service
- [ ] Linked assets persist across navigation
- [ ] Real-time updates work (socket events)

### Advanced Test (30 minutes)
- [ ] Offline mode works
- [ ] Error handling works
- [ ] Performance is acceptable
- [ ] No data loss
- [ ] No duplicate entries
- [ ] All browsers work
- [ ] Mobile responsive

---

## Success Criteria

### ✅ All Tests Pass If:
1. Campaign appears immediately after creation
2. Campaign persists after navigation
3. Campaign persists after page refresh
4. Project appears immediately after creation
5. Project detail loads without "Project Not Found" error
6. Project persists after navigation
7. Asset appears immediately after creation
8. Asset persists after navigation
9. Linked assets display in service
10. Linked assets persist after navigation
11. No console errors
12. No API errors
13. Cache is being used (Network tab shows fewer calls)
14. Socket events are received (Console shows events)

### ❌ Tests Fail If:
1. Data disappears after navigation
2. Data disappears after page refresh
3. "Project Not Found" error appears
4. Linked assets don't display
5. Console shows errors
6. API returns errors
7. Cache is not being used
8. Socket events are not received

---

## Next Steps

### If All Tests Pass
1. ✅ Fixes are working correctly
2. ✅ Ready for production deployment
3. ✅ Monitor for issues in production

### If Tests Fail
1. ❌ Check browser console for errors
2. ❌ Check Network tab for API errors
3. ❌ Check backend logs for errors
4. ❌ Review code changes
5. ❌ Run unit tests: `npm test`
6. ❌ Fix issues and re-test

---

## Support

### Need Help?
1. Check browser console for errors
2. Check Network tab for API errors
3. Check backend logs
4. Review troubleshooting section above
5. Contact development team

### Report Issues
1. Document the issue
2. Include browser console errors
3. Include Network tab screenshots
4. Include backend logs
5. Include steps to reproduce
6. Submit to development team

---

## Quick Reference

### Key Files Modified
- Backend: `campaignController.ts`, `projectController.ts`, `assetController.ts`, `assetServiceLinkingController.ts`
- Frontend: `useDataCache.ts`, `useData.ts`, `ServiceLinkedAssetsDisplay.tsx`

### Key Changes
- Cache TTL reduced to 5 minutes
- Socket handlers update global cache
- API uses RETURNING clause for PostgreSQL
- Linked assets fallback query added
- Component refresh on mount

### Key Metrics
- Cache hit rate: > 90%
- API calls reduced: 100% (for cached data)
- Response time: < 500ms (cached)
- Error rate: < 0.1%

---

## Testing Complete! 🎉

If all tests pass, the data persistence fixes are working correctly and the application is ready for production deployment.
