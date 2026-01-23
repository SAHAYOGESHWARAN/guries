# Asset Library by Category - Quick Start

## What's New

Assets from Web, SEO, and SMM repositories now display as categories in the SubService Linking tab with a modern category-based interface.

## How It Works

### User View
1. Open SubService form
2. Go to "Linking" tab
3. See "Asset Library by Category" section
4. Select category: Web 🌐 | SEO 🔍 | SMM 📢 | All 📦
5. Browse assets in grid
6. Click "+ Link Asset" to link
7. Click "✓ Linked" to unlink

### Backend
- New endpoint: `/api/v1/asset-categories/repositories`
- New endpoint: `/api/v1/asset-categories/by-repository?repository=Web`
- Queries assets table filtered by repository

### Frontend
- New component: `AssetLibraryByCategory.tsx`
- Integrated in SubServiceMasterView Linking tab
- Replaces old ServiceAssetLinker component

## Key Features

| Feature | Description |
|---------|-------------|
| **Categories** | Web, SEO, SMM tabs |
| **Search** | Find assets by name, type, category |
| **Thumbnails** | Visual preview of each asset |
| **Link/Unlink** | One-click asset linking |
| **Counts** | Total, Linked, Available tracking |
| **Status** | Visual indicators for linked assets |
| **Responsive** | Works on all screen sizes |

## API Endpoints

### Get Categories
```bash
GET /api/v1/asset-categories/repositories
```

### Get Assets by Category
```bash
GET /api/v1/asset-categories/by-repository?repository=Web
```

## Component Props

```typescript
<AssetLibraryByCategory
    linkedAssets={linkedLibraryAssets}      // Currently linked assets
    onToggle={handleToggleLibraryLink}      // Link/unlink handler
    totalAssets={libraryAssets.length}      // Total asset count
/>
```

## Visual Layout

```
Category Tabs:
[📦 All (45)] [🌐 Web (20)] [🔍 SEO (15)] [📢 SMM (10)]

Asset Grid:
┌─────────────┬─────────────┬─────────────┐
│ Asset 1     │ Asset 2     │ Asset 3     │
│ [Thumbnail] │ [Thumbnail] │ [Thumbnail] │
│ Type: Banner│ Type: Video │ Type: Graphic
│ [+ Link]    │ [✓ Linked]  │ [+ Link]    │
└─────────────┴─────────────┴─────────────┘

Summary:
Total: 45 | Linked: 3 | Available: 42
```

## Database Query

```sql
SELECT * FROM assets
WHERE tags = ? OR asset_category = ?
ORDER BY created_at DESC
```

## File Structure

```
Backend:
├── controllers/assetCategoryController.ts (new endpoints)
└── routes/assetCategoryRoutes.ts (route registration)

Frontend:
├── components/AssetLibraryByCategory.tsx (new component)
└── views/SubServiceMasterView.tsx (integration)
```

## Usage Example

### Linking an Asset
```typescript
// User clicks "+ Link Asset" button
await handleToggleLibraryLink(asset);

// Asset is added to linked_service_ids
// Button changes to "✓ Linked"
// Linked count increases
```

### Unlinking an Asset
```typescript
// User clicks "✓ Linked" button
await handleToggleLibraryLink(asset);

// Asset is removed from linked_service_ids
// Button changes to "+ Link Asset"
// Linked count decreases
```

## Category Mapping

| Repository | Icon | Color | Use Case |
|-----------|------|-------|----------|
| Web | 🌐 | Blue | Website assets, UI elements |
| SEO | 🔍 | Green | SEO content, optimization assets |
| SMM | 📢 | Purple | Social media, promotional assets |

## Search Functionality

Search filters by:
- Asset name
- Asset type (Banner, Video, Graphic, etc.)
- Asset category
- Real-time filtering

## Error Handling

- **No assets**: Shows "No assets found in this category"
- **API error**: Falls back to default categories (Web, SEO, SMM)
- **Network error**: Graceful error logging

## Performance

- Assets loaded on category selection
- Client-side search filtering
- Cached in component state
- Responsive grid layout

## Testing

Quick test:
1. Open SubService form
2. Go to Linking tab
3. Click "Web" category
4. See Web assets
5. Click "+ Link Asset"
6. Verify "✓ Linked" appears
7. Click "✓ Linked"
8. Verify "+ Link Asset" appears

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No categories showing | Check API endpoint `/asset-categories/repositories` |
| No assets in category | Verify assets have correct `tags` field in database |
| Link button not working | Check `handleToggleLibraryLink` function |
| Thumbnails not showing | Verify `web_thumbnail` field in assets table |

## No Breaking Changes

✅ Existing asset linking still works
✅ ServiceAssetLinker component still available
✅ All existing functionality preserved
✅ Backward compatible

## Next Steps

1. Test asset linking in Linking tab
2. Verify categories display correctly
3. Test search functionality
4. Verify link/unlink operations
5. Check responsive design on mobile
