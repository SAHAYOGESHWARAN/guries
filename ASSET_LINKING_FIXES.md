# Asset Linking System - Fixed and Enhanced

## Issues Resolved

### 1. **Sub-Service Linked Assets Count**
**Problem:** The "Linked Assets" column in the Sub-Service Registry was only counting assets from the Content Repository, not from the Asset Library.

**Solution:** Updated `SubServiceMasterView.tsx` to count assets from both sources:
- Content Repository assets (via `contentAssets`)
- Asset Library assets (via `libraryAssets`)
- The tooltip now shows the breakdown: "X from Asset Library + Y from Content Repository"

### 2. **Asset to Sub-Service Linking**
**Problem:** When editing an asset in the Asset Library, the "Mapped To" field was just a text input with no actual linking functionality. Typing "product" didn't create any database relationships.

**Solution:** Replaced the text input with proper service/sub-service selectors:
- Added a dropdown to select a parent service
- Added checkboxes to select multiple sub-services (only shows sub-services for the selected parent service)
- The selections are saved to `linked_service_ids` and `linked_sub_service_ids` arrays in the database
- The `mapped_to` field is auto-generated as a display string (e.g., "Service Name / Sub-service 1, Sub-service 2")

### 3. **Linking Metadata Display**
**Problem:** The "Mapped To" column in the Assets table showed only text, not the actual linked relationships.

**Solution:** Updated the column to display actual linked services and sub-services:
- Shows service names from `linked_service_ids`
- Shows sub-service names from `linked_sub_service_ids`
- Visual indicator with proper styling to distinguish linked vs unlinked assets

## Technical Changes

### Files Modified

#### 1. `views/SubServiceMasterView.tsx`
- **Line ~1166:** Updated the "Linked Assets" count calculation to include both Content Repository and Asset Library assets
- Added tooltip showing the breakdown of asset sources

#### 2. `views/AssetsView.tsx`
- **Imports:** Added `Service` and `SubServiceItem` types, and imported service/sub-service data using `useData` hooks
- **State:** Added `selectedServiceId` and `selectedSubServiceIds` state variables to track user selections
- **Form:** Replaced the "Mapped To" text input with:
  - Service dropdown selector
  - Sub-service multi-select checkboxes (conditional on service selection)
  - Visual preview of selected links
- **Save Logic:** Updated `handleUpload` to:
  - Build `linked_service_ids` and `linked_sub_service_ids` arrays from selections
  - Auto-generate `mapped_to` display string
  - Save the linking data to the database
- **Table Column:** Updated "Mapped To" column to "Linked To" and display actual service/sub-service names from the database

## How It Works Now

### Linking an Asset to a Sub-Service

1. Go to **Assets** view
2. Click **Upload New Asset** or **Edit** an existing asset
3. Scroll to the **"Link to Service"** section
4. Select a parent service from the dropdown
5. Check the sub-services you want to link (multiple selections allowed)
6. See a preview of your selections in the blue info box
7. Click **Save Changes** or **Confirm Upload**

### Viewing Linked Assets in Sub-Service Registry

1. Go to **Sub-Service Registry**
2. The **"Linked Assets"** column now shows the total count from both:
   - Asset Library (assets table with `linked_sub_service_ids`)
   - Content Repository (content_repository table with `linked_sub_service_ids`)
3. Hover over the count to see the breakdown

### Database Structure

The linking uses these fields in the `assets` table:
- `linked_service_ids` (TEXT/JSON array) - Array of service IDs
- `linked_sub_service_ids` (TEXT/JSON array) - Array of sub-service IDs
- `mapped_to` (TEXT) - Human-readable display string (auto-generated)

## Benefits

1. **Accurate Counts:** Sub-services now show the correct total number of linked assets
2. **Proper Linking:** Assets are properly linked via database relationships, not just text
3. **Easy Management:** Simple UI to link/unlink assets to services and sub-services
4. **Multi-linking:** One asset can be linked to multiple sub-services
5. **Bidirectional:** You can link from the Asset view OR from the Service/Sub-service view (via the Linking tab)

## Testing Checklist

- [x] Sub-Service Registry shows correct linked asset count
- [x] Asset edit form has service/sub-service selectors
- [x] Selecting a service shows its sub-services
- [x] Multiple sub-services can be selected
- [x] Saving creates proper database links
- [x] "Linked To" column displays actual service/sub-service names
- [x] No TypeScript errors
- [x] Backward compatible with existing data
