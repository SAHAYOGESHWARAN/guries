# Manual Data Persistence Test Guide

## Overview
This guide provides step-by-step instructions to manually test that data persists across route changes on the live deployment at https://guries.vercel.app

## Prerequisites
- Open https://guries.vercel.app in a browser
- Open browser DevTools (F12 or Right-click → Inspect)
- Go to Console tab to see debug logs

## Test Scenario 1: Projects Data Persistence

### Steps:
1. **Navigate to Projects page**
   - Click on "Projects" in the sidebar
   - Wait for data to load
   - You should see 4 sample projects:
     - Website Redesign (65% progress)
     - SEO Optimization (45% progress)
     - Content Marketing Campaign (20% progress)
     - Social Media Strategy (100% progress)

2. **Verify cache is populated**
   - Open browser Console (F12)
   - Look for logs like: `[DataCache] Cache hit for projects (XXms old, 4 items)`
   - This confirms data is cached

3. **Navigate away from Projects**
   - Click on "Tasks" in the sidebar
   - Wait for Tasks page to load
   - You should see 5 sample tasks

4. **Navigate back to Projects**
   - Click on "Projects" in the sidebar again
   - **EXPECTED**: Projects data should appear immediately WITHOUT flickering
   - **EXPECTED**: Console should show: `[DataCache] Cache hit for projects`
   - **EXPECTED**: All 4 projects should still be visible

5. **Verify data integrity**
   - Check that all project names are correct
   - Check that progress percentages are unchanged
   - Check that status values are correct

### Success Criteria:
- ✅ Data appears immediately when returning to Projects
- ✅ No "No projects found" message appears
- ✅ All 4 projects are visible
- ✅ Console shows cache hit logs
- ✅ Data values are unchanged

---

## Test Scenario 2: Tasks Data Persistence

### Steps:
1. **Navigate to Tasks page**
   - Click on "Tasks" in the sidebar
   - Wait for data to load
   - You should see 5 sample tasks

2. **Verify cache is populated**
   - Open browser Console
   - Look for: `[DataCache] Cache hit for tasks`

3. **Navigate to Projects**
   - Click on "Projects" in the sidebar
   - Wait for Projects page to load

4. **Navigate back to Tasks**
   - Click on "Tasks" in the sidebar again
   - **EXPECTED**: Tasks data should appear immediately
   - **EXPECTED**: Console should show cache hit
   - **EXPECTED**: All 5 tasks should be visible

5. **Verify data integrity**
   - Check task names are correct
   - Check status values are unchanged
   - Check priority levels are correct

### Success Criteria:
- ✅ Data appears immediately when returning to Tasks
- ✅ No "No tasks found" message appears
- ✅ All 5 tasks are visible
- ✅ Console shows cache hit logs

---

## Test Scenario 3: Multiple Collections Persistence

### Steps:
1. **Load Projects**
   - Navigate to Projects page
   - Wait for data to load
   - Console should show: `[DataCache] Caching projects with 4 items`

2. **Load Tasks**
   - Navigate to Tasks page
   - Wait for data to load
   - Console should show: `[DataCache] Caching tasks with 5 items`

3. **Navigate between pages multiple times**
   - Projects → Tasks → Projects → Tasks
   - Each time, data should appear immediately from cache

4. **Check cache statistics**
   - In Console, type: `dataCache.getStats()`
   - You should see both projects and tasks cached

### Success Criteria:
- ✅ Both collections remain cached
- ✅ No data loss when switching between pages
- ✅ Cache statistics show both collections

---

## Test Scenario 4: Cache Invalidation on Create

### Steps:
1. **Navigate to Projects page**
   - Wait for data to load
   - Console shows: `[DataCache] Cache hit for projects (XXms old, 4 items)`

2. **Create a new project**
   - Click "Create Project" button
   - Fill in project details
   - Click "Create"
   - Wait for success message

3. **Verify cache was invalidated**
   - Console should show: `[DataCache] Invalidating cache for projects`
   - This forces a fresh fetch on next navigation

4. **Navigate away and back**
   - Click on Tasks
   - Click back on Projects
   - New project should appear in the list

### Success Criteria:
- ✅ Cache is invalidated after create
- ✅ New data is fetched on next navigation
- ✅ New project appears in the list

---

## Test Scenario 5: Stale Cache Detection

### Steps:
1. **Load Projects page**
   - Wait for data to load
   - Note the timestamp in console

2. **Wait 5+ minutes**
   - Keep the page open
   - Don't navigate away

3. **Navigate to another page and back**
   - Click Tasks
   - Click back on Projects
   - Console should show: `[DataCache] Cache for projects is stale`
   - Data should still display (stale data returned)
   - Fresh data should be fetched in background

### Success Criteria:
- ✅ Stale cache is detected after 5 minutes
- ✅ Stale data is still displayed
- ✅ Fresh data is fetched in background

---

## Console Debug Commands

### Check cache status:
```javascript
dataCache.getStats()
```
Returns array of cached collections with item counts and age.

### Clear cache manually:
```javascript
dataCache.invalidateAll()
```
Clears all cached data (useful for testing).

### Check specific collection:
```javascript
dataCache.get('projects')
```
Returns cached projects data or null if not cached.

---

## Expected Console Output

### On first load:
```
[useData] Initializing data for projects
[useData] Backend available: true
[useData] Fetching projects from /api/v1/projects
[useData] Received projects: 4 items
[DataCache] Caching projects with 4 items
```

### On navigation back:
```
[useData] Initializing data for projects
[DataCache] Cache hit for projects (2345ms old, 4 items)
[useData] Initializing projects from cache with 4 items
```

### On cache invalidation:
```
[DataCache] Invalidating cache for projects
```

---

## Troubleshooting

### Issue: Data still disappears on route change
**Solution**: 
- Check browser console for errors
- Verify cache is being populated: `dataCache.getStats()`
- Check that useData hook is calling `dataCache.set()`

### Issue: Cache hit not showing in console
**Solution**:
- Verify you're looking at the right console logs
- Filter for `[DataCache]` in console
- Check that data was cached: `dataCache.get('projects')`

### Issue: Data shows but is stale
**Solution**:
- This is expected after 5 minutes
- Fresh data should be fetched in background
- Wait a moment for fresh data to appear

### Issue: New data not appearing after create
**Solution**:
- Verify cache was invalidated: look for `[DataCache] Invalidating`
- Navigate away and back to force fresh fetch
- Check API response in Network tab

---

## Performance Metrics

### Expected behavior:
- **First load**: 1-2 seconds (API call)
- **Cached load**: <100ms (instant from cache)
- **Cache age**: Shown in console (e.g., "2345ms old")
- **Cache TTL**: 5 minutes before marked stale

### Measuring improvement:
1. Note time on first load
2. Navigate away and back
3. Compare load time (should be much faster)
4. Check console for cache hit confirmation

---

## Test Completion Checklist

- [ ] Test Scenario 1: Projects persistence ✓
- [ ] Test Scenario 2: Tasks persistence ✓
- [ ] Test Scenario 3: Multiple collections ✓
- [ ] Test Scenario 4: Cache invalidation ✓
- [ ] Test Scenario 5: Stale cache detection ✓
- [ ] Console logs show cache hits
- [ ] No data loss on route changes
- [ ] New data appears after create
- [ ] Performance is improved (cached loads are fast)

---

## Summary

The data persistence fix is working correctly when:
1. ✅ Data appears immediately when returning to a page
2. ✅ Console shows `[DataCache] Cache hit` logs
3. ✅ No "No data found" messages appear
4. ✅ Multiple collections can be cached simultaneously
5. ✅ Cache is invalidated on create/update/delete
6. ✅ Stale cache is detected after 5 minutes
7. ✅ Performance is significantly improved for cached loads

If all criteria are met, the data persistence issue is **RESOLVED**.
