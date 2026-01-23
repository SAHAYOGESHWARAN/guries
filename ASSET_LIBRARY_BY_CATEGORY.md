# Asset Library by Category Implementation

## Overview
Assets uploaded under Web, SEO, and SMM categories in the Assets module are now displayed as categories in the SubService Linking tab. When a category is selected, all assets associated with that category are listed and can be linked accordingly.

## Architecture

### Backend Implementation

#### New Endpoints (backend/controllers/assetCategoryController.ts)

**1. Get Repositories/Categories**
```
GET /api/v1/asset-categories/repositories
```
Returns all available asset repositories (Web, SEO, SMM)

Response:
```json
[
  { "repository": "Web" },
  { "repository": "SEO" },
  { "repository": "SMM" }
]
```

**2. Get Assets by Repository**
```
GET /api/v1/asset-categories/by-repository?repository=Web
```
Returns all assets for a specific repository

Response:
```json
[
  {
    "id": 1,
    "name": "Web Banner 2024",
    "type": "Banner",
    "asset_category": "Homepage",
    "asset_format": "image",
    "content_type": "Web UI Asset",
    "repository": "Web",
    "status": "Published",
    "thumbnail_url": "...",
    "url": "...",
    "created_at": "2024-01-23T10:00:00Z"
  }
]
```

#### Database Queries

The implementation queries the `assets` table:
- Filters by `tags` field (repository name)
- Filters by `asset_category` field
- Returns relevant asset information
- Ordered by creation date (newest first)

### Frontend Implementation

#### New Component (frontend/components/AssetLibraryByCategory.tsx)

**Features:**
- Category tabs (Web, SEO, SMM, All)
- Search functionality
- Asset grid display
- Link/Unlink toggle
- Asset count tracking
- Thumbnail preview
- Category badges

**Props:**
```typescript
interface AssetLibraryCategoryProps {
    linkedAssets: AssetLibraryItem[];
    onToggle: (asset: AssetLibraryItem) => Promise<void>;
    totalAssets: number;
}
```

**State Management:**
- `repositories`: Available categories
- `selectedRepository`: Currently selected category
- `assetsByRepository`: Assets grouped by category
- `searchQuery`: Search filter
- `loading`: Loading state

#### Integration in SubServiceMasterView

The component is integrated in the Linking tab:
```typescript
<AssetLibraryByCategory
    linkedAssets={linkedLibraryAssets}
    onToggle={handleToggleLibraryLink}
    totalAssets={libraryAssets.length}
/>
```

## User Workflow

### Viewing Assets by Category

1. Open SubService form
2. Navigate to "Linking" tab
3. View Asset Library by Category section
4. See category tabs: Web, SEO, SMM, All
5. Click category to filter assets
6. Search for specific assets
7. Click asset to link/unlink

### Linking Assets

1. Select category (e.g., "Web")
2. Browse available assets
3. Click "+ Link Asset" button
4. Asset is linked to sub-service
5. Button changes to "✓ Linked"
6. Linked count updates

### Unlinking Assets

1. Click "✓ Linked" button on linked asset
2. Asset is unlinked
3. Button changes back to "+ Link Asset"
4. Linked count decreases

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🏷️ ASSET LIBRARY BY CATEGORY                           │
│ Browse and link assets from Web, SEO, and SMM repos    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Search box]                                            │
│                                                         │
│ [📦 All] [🌐 Web] [🔍 SEO] [📢 SMM]                   │
│                                                         │
│ ┌──────────────┬──────────────┬──────────────┐         │
│ │ Asset 1      │ Asset 2      │ Asset 3      │         │
│ │ [Thumbnail]  │ [Thumbnail]  │ [Thumbnail]  │         │
│ │ Type: Banner │ Type: Graphic│ Type: Video  │         │
│ │ [+ Link]     │ [✓ Linked]   │ [+ Link]     │         │
│ └──────────────┴──────────────┴──────────────┘         │
│                                                         │
│ Total: 45 | Linked: 3 | Available: 42                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Category Icons & Colors

| Category | Icon | Color | Hex |
|----------|------|-------|-----|
| Web | 🌐 | Blue | #3B82F6 |
| SEO | 🔍 | Green | #10B981 |
| SMM | 📢 | Purple | #A855F7 |
| All | 📦 | Indigo | #4F46E5 |

## Data Flow

```
User selects category
    ↓
Frontend fetches repositories
    ↓
Backend queries assets table
    ↓
Filter by repository/category
    ↓
Return asset list
    ↓
Display in grid
    ↓
User clicks asset
    ↓
Toggle link status
    ↓
Update linked_service_ids
    ↓
Refresh display
```

## API Endpoints

### Get Repositories
```
GET /api/v1/asset-categories/repositories
```
**Response:** Array of repository objects

### Get Assets by Repository
```
GET /api/v1/asset-categories/by-repository?repository=Web
```
**Query Parameters:**
- `repository` (required): Category name (Web, SEO, SMM)

**Response:** Array of asset objects

## Database Schema

### Assets Table Fields Used
- `id`: Asset ID
- `asset_name`: Display name
- `asset_type`: Type (Banner, Graphic, Video, etc.)
- `asset_category`: Category within repository
- `asset_format`: Format (image, video, pdf)
- `content_type`: Content classification
- `tags`: Repository name (Web, SEO, SMM)
- `status`: Publication status
- `web_thumbnail`: Thumbnail URL
- `web_url`: Asset URL
- `created_at`: Creation timestamp
- `linked_service_ids`: Linked services

## Features

✅ **Category Filtering** - Filter assets by Web, SEO, SMM
✅ **Search** - Search across all assets
✅ **Thumbnails** - Visual preview of assets
✅ **Link/Unlink** - One-click asset linking
✅ **Count Tracking** - See total, linked, and available counts
✅ **Status Indicators** - Visual feedback for linked assets
✅ **Responsive Grid** - Works on all screen sizes
✅ **Loading States** - Smooth loading experience

## Error Handling

- **API Errors**: Logged to console, graceful fallback
- **No Assets**: Shows "No assets found" message
- **Network Issues**: Retry on component mount
- **Default Categories**: Falls back to Web, SEO, SMM if fetch fails

## Performance Considerations

- **Lazy Loading**: Assets loaded on category selection
- **Caching**: Assets cached in component state
- **Search Optimization**: Client-side filtering
- **Pagination**: Limited to 20 results per category (can be adjusted)

## Future Enhancements

- Bulk linking/unlinking
- Asset upload from linking tab
- Advanced filtering (by type, status, date)
- Asset preview modal
- Drag-and-drop linking
- Asset recommendations
- Recently used assets
- Favorite assets

## Testing Checklist

- [ ] Repositories load correctly
- [ ] Assets display for each category
- [ ] Search filters assets properly
- [ ] Link button works
- [ ] Unlink button works
- [ ] Counts update correctly
- [ ] Thumbnails display
- [ ] Responsive on mobile
- [ ] Error handling works
- [ ] Loading states display

## Files Modified

### Backend
- `backend/controllers/assetCategoryController.ts` - Added 2 new endpoints
- `backend/routes/assetCategoryRoutes.ts` - Registered new routes

### Frontend
- `frontend/components/AssetLibraryByCategory.tsx` - New component
- `frontend/views/SubServiceMasterView.tsx` - Integrated component

## No Breaking Changes

- Existing asset linking still works
- ServiceAssetLinker component still available
- All existing functionality preserved
- Backward compatible with existing data
