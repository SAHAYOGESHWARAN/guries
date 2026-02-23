# Data Persistence Issues - Fixes Applied

## Summary
Fixed critical data persistence issues where newly created entries (Assets, Campaigns, Projects) were disappearing after navigation or module switching, and linked assets were not displaying in services.

## Root Causes Identified & Fixed

### 1. **Cache TTL Expiration (PRIMARY ISSUE)**
**File**: `frontend/hooks/useDataCache.ts`
- **Problem**: Cache TTL was too long (1 hour for campaigns/projects, 30 minutes for others)
- **Fix**: Reduced TTL to 5 minutes across all collections
- **Impact**: Data now refreshes more frequently, preventing stale data from appearing

### 2. **Socket Event Handlers Not Updating Global Cache**
**File**: `frontend/hooks/useData.ts`
- **Problem**: Socket listeners (`handleCreate`, `handleUpdate`, `handleDelete`) only updated component state, not global cache
- **Fix**: Updated all socket handlers to call `dataCache.set()` after state updates
- **Impact**: Real-time updates now persist across navigation and module switching

### 3. **API ID Return Issues (PostgreSQL vs SQLite)**
**Files**: 
- `backend/controllers/campaignController.ts`
- `backend/controllers/projectController.ts`
- `backend/controllers/assetController.ts`

- **Problem**: PostgreSQL doesn't return inserted rows by default; code was trying to extract ID from empty result
- **Fix**: 
  - Added conditional logic to use `RETURNING *` clause for PostgreSQL
  - Kept standard INSERT for SQLite
  - Simplified result extraction to use `result.rows[0]` directly
- **Impact**: New entries now have proper IDs and persist correctly

### 4. **No Data Refresh on Route Change**
**File**: `frontend/hooks/useData.ts`
- **Problem**: Views didn't refresh data when user navigated back to them
- **Fix**: Changed initialization to always fetch fresh data on component mount (soft refresh)
- **Impact**: Users see current data when returning to a view

### 5. **Linked Assets Not Displaying in Services**
**Files**:
- `backend/controllers/assetServiceLinkingController.ts`
- `frontend/components/ServiceLinkedAssetsDisplay.tsx`

- **Problem**: 
  - Backend query used INNER JOIN requiring explicit `service_asset_links` records
  - Frontend component didn't cache linked assets
- **Fix**:
  - Added fallback query to check asset's `static_service_links` JSON field
  - Integrated global cache into ServiceLinkedAssetsDisplay component
  - Added 5-minute TTL for linked assets cache
- **Impact**: Linked assets now display correctly and persist across navigation

## Files Modified

### Backend
1. **campaignController.ts**
   - Added PostgreSQL RETURNING clause
   - Simplified ID extraction logic
   - Removed unnecessary SELECT query after INSERT

2. **projectController.ts**
   - Added PostgreSQL RETURNING clause
   - Simplified ID extraction logic
   - Removed unnecessary SELECT query after INSERT

3. **assetController.ts**
   - Added PostgreSQL RETURNING clause for createAssetLibraryItem
   - Improved ID extraction

4. **assetServiceLinkingController.ts**
   - Added fallback query using static_service_links JSON field
   - Improved error handling and logging

### Frontend
1. **hooks/useDataCache.ts**
   - Reduced TTL from 30-60 minutes to 5 minutes
   - Added assetLibrary to collection-specific TTL

2. **hooks/useData.ts**
   - Updated socket handlers to update global cache
   - Changed initialization to always fetch fresh data on mount
   - Improved logging for debugging

3. **components/ServiceLinkedAssetsDisplay.tsx**
   - Integrated global cache for linked assets
   - Added cache-first strategy with background refresh
   - Improved performance and persistence

## Testing Recommendations

1. **Assets Module**
   - Create new asset with service selection
   - Navigate away and back
   - Verify asset appears in list
   - Check linked assets display in service detail

2. **Campaigns Module**
   - Create new campaign
   - Navigate to another module
   - Return to campaigns
   - Verify campaign persists

3. **Projects Module**
   - Create new project
   - Navigate away
   - Return to projects
   - Verify project appears and "Project Not Found" error doesn't occur

4. **Linked Assets**
   - Create asset linked to "Website Design" service
   - Open service detail
   - Verify linked assets display
   - Navigate away and back
   - Verify assets still display

## Performance Impact
- Slightly increased API calls due to always fetching on mount
- Reduced cache TTL means more frequent refreshes
- Fallback query for linked assets adds minimal overhead
- Overall: Better data consistency with acceptable performance trade-off

## Deployment Notes
- No database schema changes required
- Backward compatible with existing data
- Works with both PostgreSQL (production) and SQLite (development)
- No breaking changes to API contracts
