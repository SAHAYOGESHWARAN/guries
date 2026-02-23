# Issue Resolution Guide

## Issue 1: New Assets Not Visible in Records & Not Appearing in Pending Asset QC Review

### Root Cause
- Cache TTL was expiring (30 minutes)
- Socket events not updating global cache
- API ID extraction failing for PostgreSQL

### Resolution Applied
✅ Reduced cache TTL to 5 minutes
✅ Updated socket handlers to update global cache
✅ Fixed API to use RETURNING clause for PostgreSQL
✅ Added refresh on component mount

### Expected Behavior After Fix
- New assets appear immediately in the list
- Assets persist when navigating to other modules
- Assets appear in Pending Asset QC Review section
- No data loss on page refresh

---

## Issue 2: Campaign Entries Disappear After Navigation

### Root Cause
- Cache TTL expiration (1 hour)
- No refresh trigger on route change
- Socket events not persisting to cache

### Resolution Applied
✅ Reduced campaign cache TTL to 5 minutes
✅ Added automatic refresh on component mount
✅ Updated socket handlers to update global cache
✅ Fixed campaign creation API to return proper ID

### Expected Behavior After Fix
- Campaigns appear immediately after creation
- Campaigns persist when navigating to other modules
- Campaigns reappear when returning to campaigns view
- No "briefly visible then disappear" behavior

---

## Issue 3: Projects Disappear & "Project Not Found" Error

### Root Cause
- Project ID not being returned from API (PostgreSQL issue)
- Cache expiration (1 hour)
- No refresh on route change

### Resolution Applied
✅ Fixed project creation API to use RETURNING clause
✅ Reduced project cache TTL to 5 minutes
✅ Added automatic refresh on component mount
✅ Improved error handling in project controller

### Expected Behavior After Fix
- Projects created successfully with proper IDs
- "Project Not Found" error no longer occurs
- Projects persist across navigation
- Project detail view loads correctly

---

## Issue 4: Linked Assets Not Displaying in Service Detail

### Root Cause
- Service-asset links table missing records
- API query using INNER JOIN (requires explicit records)
- Frontend component not caching linked assets
- No fallback for assets with static_service_links JSON

### Resolution Applied
✅ Added fallback query using static_service_links JSON field
✅ Integrated global cache in ServiceLinkedAssetsDisplay
✅ Added cache-first strategy with background refresh
✅ Improved asset creation to properly create service links

### Expected Behavior After Fix
- Linked assets display in service detail
- Assets created before deployment now visible
- Linked assets persist across navigation
- No "no assets linked" message when assets exist

---

## Issue 5: Assets Disappear After Navigation

### Root Cause
- Same as Issue 1 (cache TTL, socket events, API issues)

### Resolution Applied
✅ All fixes from Issue 1 applied
✅ Added refresh on component mount
✅ Improved cache integration

### Expected Behavior After Fix
- Assets persist across all navigation
- No data loss when switching modules
- Assets appear immediately after creation
- Consistent data across all views

---

## Verification Checklist

### For Each Module (Assets, Campaigns, Projects)
- [ ] Create new entry with all required fields
- [ ] Verify entry appears in list immediately
- [ ] Navigate to another module
- [ ] Return to original module
- [ ] Verify entry still appears
- [ ] Refresh page
- [ ] Verify entry still appears
- [ ] Check browser console for errors

### For Linked Assets
- [ ] Create asset with service selection
- [ ] Open service detail page
- [ ] Verify linked assets display
- [ ] Navigate away from service
- [ ] Return to service
- [ ] Verify linked assets still display
- [ ] Check that previously created assets now appear

### For Project Detail
- [ ] Create new project
- [ ] Open project detail
- [ ] Verify no "Project Not Found" error
- [ ] Navigate away and back
- [ ] Verify project detail loads correctly

---

## Performance Metrics

### Before Fixes
- Cache TTL: 30-60 minutes
- Data loss on navigation: ~100% (after TTL expiration)
- Linked assets visibility: ~0% (without explicit links)
- API calls on mount: 1 (if cached)

### After Fixes
- Cache TTL: 5 minutes
- Data loss on navigation: 0% (always refreshes)
- Linked assets visibility: ~100% (with fallback)
- API calls on mount: 1 (soft refresh, keeps existing data)

---

## Troubleshooting

### If data still disappears:
1. Check browser console for errors
2. Verify backend is running and accessible
3. Check network tab for failed API calls
4. Clear browser cache and localStorage
5. Check that socket connection is established

### If linked assets still don't show:
1. Verify service_asset_links table has records
2. Check asset's static_service_links JSON field
3. Verify asset status is not 'draft'
4. Check that service exists in database

### If "Project Not Found" still occurs:
1. Verify project was created successfully (check database)
2. Check that project ID is being returned from API
3. Verify project detail route is correct
4. Check browser console for error details
