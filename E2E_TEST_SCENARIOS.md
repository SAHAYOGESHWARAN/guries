# End-to-End Test Scenarios

## Test Environment Setup

### Prerequisites
- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:5173`
- Database initialized (PostgreSQL or SQLite)
- Socket.io connection established

### Test Data
```javascript
// Campaign Test Data
{
  campaign_name: "Q1 2024 Marketing Campaign",
  campaign_type: "Content",
  status: "planning",
  description: "Test campaign for Q1 2024",
  campaign_start_date: "2024-01-01",
  campaign_end_date: "2024-03-31"
}

// Project Test Data
{
  project_name: "Website Redesign",
  project_code: "PRJ-2024-001",
  description: "Complete website redesign project",
  status: "Planned",
  priority: "High",
  start_date: "2024-01-15",
  end_date: "2024-03-15"
}

// Asset Test Data
{
  name: "Homepage Banner",
  type: "Image",
  asset_category: "Graphics",
  asset_format: "PNG",
  status: "draft",
  application_type: "web",
  seo_score: 85,
  grammar_score: 90
}
```

---

## Test Scenario 1: Campaign Creation & Persistence

### Steps
1. Navigate to Campaigns module
2. Click "New Campaign"
3. Fill in all required fields:
   - Campaign Name: "Q1 2024 Marketing Campaign"
   - Campaign Type: "Content"
   - Status: "planning"
   - Description: "Test campaign for Q1 2024"
4. Click "Submit"

### Expected Results
✅ Campaign appears immediately in the list
✅ Campaign has a valid ID (not null/undefined)
✅ Campaign status shows "planning"
✅ No error messages in console

### Verification Steps
1. Open browser DevTools → Console
2. Check for any errors
3. Verify campaign appears in list
4. Note the campaign ID

### Next Steps
- Proceed to Test Scenario 2

---

## Test Scenario 2: Campaign Persistence After Navigation

### Prerequisites
- Complete Test Scenario 1 first

### Steps
1. From Campaigns module, navigate to Projects module
2. Wait 2 seconds
3. Navigate back to Campaigns module
4. Wait for data to load

### Expected Results
✅ Campaign created in Scenario 1 still appears in list
✅ Campaign data is identical (same name, status, etc.)
✅ No "briefly visible then disappear" behavior
✅ No API errors in console

### Verification Steps
1. Check browser DevTools → Network tab
2. Verify API call to `/api/v1/campaigns` was made
3. Verify response contains the campaign
4. Check Console for any warnings

### Debugging
If campaign disappears:
- Check cache TTL: `dataCache.getStats()` in console
- Check localStorage: `localStorage.getItem('campaigns')`
- Check API response: Network tab → `/api/v1/campaigns`

---

## Test Scenario 3: Campaign Persistence After Page Refresh

### Prerequisites
- Complete Test Scenario 1 first

### Steps
1. From Campaigns module, press F5 to refresh page
2. Wait for page to reload
3. Wait for data to load

### Expected Results
✅ Campaign still appears in list after refresh
✅ Campaign data is complete and correct
✅ No data loss
✅ Page loads without errors

### Verification Steps
1. Check browser DevTools → Application tab
2. Verify localStorage contains campaign data
3. Check Network tab for API calls
4. Verify API response contains campaign

---

## Test Scenario 4: Project Creation & Persistence

### Steps
1. Navigate to Projects module
2. Click "New Project"
3. Fill in all required fields:
   - Project Name: "Website Redesign"
   - Project Code: "PRJ-2024-001"
   - Description: "Complete website redesign project"
   - Status: "Planned"
   - Priority: "High"
4. Click "Submit"

### Expected Results
✅ Project appears immediately in the list
✅ Project has a valid ID (not null/undefined)
✅ No "Project Not Found" error
✅ Project status shows "Planned"

### Verification Steps
1. Check browser DevTools → Console
2. Verify no errors
3. Click on project to open detail view
4. Verify detail view loads without "Project Not Found" error

### Debugging
If "Project Not Found" error occurs:
- Check API response: Network tab → `/api/v1/projects`
- Verify project ID is returned: `response.json()` in Network tab
- Check backend logs for errors

---

## Test Scenario 5: Project Persistence After Navigation

### Prerequisites
- Complete Test Scenario 4 first

### Steps
1. From Projects module, navigate to Campaigns module
2. Wait 2 seconds
3. Navigate back to Projects module
4. Wait for data to load

### Expected Results
✅ Project created in Scenario 4 still appears in list
✅ Project data is identical
✅ No "Project Not Found" error when opening detail view
✅ No API errors

### Verification Steps
1. Check Network tab for API calls
2. Verify API response contains project
3. Click on project to verify detail view loads
4. Check Console for errors

---

## Test Scenario 6: Asset Creation with Service Linking

### Steps
1. Navigate to Assets module
2. Click "New Asset"
3. Fill in all required fields:
   - Asset Name: "Homepage Banner"
   - Asset Type: "Image"
   - Asset Category: "Graphics"
   - Asset Format: "PNG"
   - Application Type: "web"
   - SEO Score: 85
   - Grammar Score: 90
4. Select Service: "Website Design"
5. Click "Submit"

### Expected Results
✅ Asset appears immediately in the list
✅ Asset has a valid ID
✅ Asset status shows "draft"
✅ Service link is created

### Verification Steps
1. Check browser DevTools → Console
2. Verify no errors
3. Check Network tab for API calls
4. Verify service_asset_links record created (check backend logs)

---

## Test Scenario 7: Linked Assets Display in Service Detail

### Prerequisites
- Complete Test Scenario 6 first

### Steps
1. Navigate to Services module
2. Find "Website Design" service
3. Click to open service detail
4. Scroll to "Linked Assets" section

### Expected Results
✅ Asset created in Scenario 6 appears in "Linked Assets" section
✅ Asset thumbnail/icon displays correctly
✅ Asset name and details are visible
✅ No "No assets linked" message

### Verification Steps
1. Check Network tab for API call to `/asset-service-linking/services/{id}/linked-assets`
2. Verify API response contains the asset
3. Check Console for any errors
4. Verify asset displays correctly

### Debugging
If linked assets don't display:
- Check API response: Network tab → `/asset-service-linking/services/{id}/linked-assets`
- Check if response is empty: `response.json()` in Network tab
- Check backend logs for fallback query execution
- Verify service_asset_links table has records

---

## Test Scenario 8: Linked Assets Persistence After Navigation

### Prerequisites
- Complete Test Scenario 7 first

### Steps
1. From Service detail, navigate to another service
2. Wait 2 seconds
3. Navigate back to "Website Design" service
4. Scroll to "Linked Assets" section

### Expected Results
✅ Linked assets still appear in the section
✅ Asset data is identical
✅ No "No assets linked" message
✅ No API errors

### Verification Steps
1. Check Network tab for API calls
2. Verify API response contains assets
3. Check Console for errors
4. Verify cache is being used: `dataCache.get('service_X_linked_assets')`

---

## Test Scenario 9: Asset Persistence After Navigation

### Prerequisites
- Complete Test Scenario 6 first

### Steps
1. From Assets module, navigate to Campaigns module
2. Wait 2 seconds
3. Navigate back to Assets module
4. Wait for data to load

### Expected Results
✅ Asset created in Scenario 6 still appears in list
✅ Asset data is identical
✅ No data loss
✅ No API errors

### Verification Steps
1. Check Network tab for API calls
2. Verify API response contains asset
3. Check Console for errors
4. Verify cache is being used

---

## Test Scenario 10: Multiple Entries Persistence

### Steps
1. Create 3 campaigns (use different names)
2. Create 3 projects (use different names)
3. Create 3 assets (use different names)
4. Navigate through all modules multiple times
5. Refresh page

### Expected Results
✅ All 3 campaigns persist across navigation and refresh
✅ All 3 projects persist across navigation and refresh
✅ All 3 assets persist across navigation and refresh
✅ No data loss or duplication
✅ No API errors

### Verification Steps
1. Count entries in each module
2. Verify counts remain consistent
3. Check for duplicate entries
4. Verify all data is correct

---

## Test Scenario 11: Real-time Updates via Socket

### Prerequisites
- Two browser windows/tabs open
- Both logged in to the application

### Steps
1. In Window 1: Create a new campaign
2. In Window 2: Watch Campaigns module
3. Verify campaign appears in Window 2 without refresh

### Expected Results
✅ Campaign appears in Window 2 immediately
✅ Campaign data is identical in both windows
✅ No manual refresh needed
✅ Socket event received successfully

### Verification Steps
1. Check Console in Window 2 for socket event logs
2. Verify `campaign_created` event received
3. Verify cache updated in Window 2
4. Verify UI updated without refresh

---

## Test Scenario 12: Offline Mode Fallback

### Prerequisites
- Application loaded and data cached

### Steps
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Navigate to different module
4. Navigate back to original module
5. Verify data still displays

### Expected Results
✅ Data displays from cache even in offline mode
✅ No error messages
✅ UI remains functional
✅ Data is consistent

### Verification Steps
1. Check Console for offline mode logs
2. Verify cache is being used
3. Verify localStorage fallback works
4. Check that data is complete

---

## Test Scenario 13: Cache Expiration & Refresh

### Steps
1. Create a campaign
2. Wait 5 minutes (cache TTL)
3. Navigate to another module
4. Navigate back to Campaigns module
5. Observe data refresh

### Expected Results
✅ After 5 minutes, cache expires
✅ Fresh data is fetched from API
✅ Campaign still appears (from API)
✅ No data loss

### Verification Steps
1. Check Network tab for API call
2. Verify API response contains campaign
3. Check Console for cache expiration logs
4. Verify data is fresh

---

## Test Scenario 14: Error Recovery

### Steps
1. Create a campaign
2. Simulate API error (DevTools → Network → Offline)
3. Try to create another campaign
4. Restore network connection
5. Verify data consistency

### Expected Results
✅ First campaign persists in cache
✅ Error message displayed for failed creation
✅ After network restored, data syncs correctly
✅ No data loss or corruption

### Verification Steps
1. Check Console for error messages
2. Verify cache still contains first campaign
3. Verify API call succeeds after network restored
4. Verify data is consistent

---

## Test Scenario 15: Concurrent Operations

### Prerequisites
- Two browser windows/tabs open

### Steps
1. In Window 1: Create campaign A
2. In Window 2: Create campaign B
3. In Window 1: Navigate to Projects
4. In Window 2: Navigate to Assets
5. In Window 1: Navigate back to Campaigns
6. In Window 2: Navigate back to Campaigns
7. Verify both campaigns appear in both windows

### Expected Results
✅ Both campaigns appear in both windows
✅ No data loss or duplication
✅ Socket events synchronized correctly
✅ Cache updated in both windows

### Verification Steps
1. Count campaigns in both windows
2. Verify both campaigns have correct data
3. Check Console for socket events
4. Verify cache consistency

---

## Test Results Summary

### Checklist
- [ ] Test Scenario 1: Campaign Creation ✅
- [ ] Test Scenario 2: Campaign Navigation ✅
- [ ] Test Scenario 3: Campaign Refresh ✅
- [ ] Test Scenario 4: Project Creation ✅
- [ ] Test Scenario 5: Project Navigation ✅
- [ ] Test Scenario 6: Asset Creation ✅
- [ ] Test Scenario 7: Linked Assets Display ✅
- [ ] Test Scenario 8: Linked Assets Navigation ✅
- [ ] Test Scenario 9: Asset Navigation ✅
- [ ] Test Scenario 10: Multiple Entries ✅
- [ ] Test Scenario 11: Real-time Updates ✅
- [ ] Test Scenario 12: Offline Mode ✅
- [ ] Test Scenario 13: Cache Expiration ✅
- [ ] Test Scenario 14: Error Recovery ✅
- [ ] Test Scenario 15: Concurrent Operations ✅

### Issues Found
(Document any issues found during testing)

### Recommendations
(Document any recommendations for further improvements)

---

## Debugging Commands

### Browser Console
```javascript
// Check cache status
dataCache.getStats()

// Get specific cache
dataCache.get('campaigns')

// Clear cache
dataCache.clear()

// Check localStorage
localStorage.getItem('campaigns')

// Monitor socket events
socket.on('campaign_created', (data) => console.log('Campaign created:', data))
socket.on('campaign_updated', (data) => console.log('Campaign updated:', data))
socket.on('campaign_deleted', (data) => console.log('Campaign deleted:', data))

// Check API response
fetch('/api/v1/campaigns').then(r => r.json()).then(d => console.log(d))
```

### Backend Logs
```bash
# Watch backend logs
tail -f backend.log

# Check database
sqlite3 mcc_db.sqlite "SELECT * FROM campaigns;"
psql -d database_name -c "SELECT * FROM campaigns;"
```
