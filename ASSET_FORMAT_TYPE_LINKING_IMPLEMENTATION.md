# Asset Format and Asset Type Linking Implementation

## Overview
This document describes the implementation of linking Asset Format with Asset Type Master table. The Asset Format dropdown now filters based on both the selected Application Type (WEB, SEO, SMM) and the selected Asset Type (Research Paper, Review Article, etc.).

## Changes Made

### 1. Database Schema Updates

#### Migration: `backend/migrations/add-asset-type-linking.js`
- Added `asset_type_ids` column to `asset_format_master` table
- Column stores a JSON array of asset type names that each format supports
- Default associations were set based on format type:
  - **Image formats** (JPEG, PNG, WebP, SVG, GIF): 14 asset types
  - **Video formats** (MP4, MOV, WebM, AVI): 6 asset types  
  - **Document formats** (PDF, DOCX, PPTX): 16 asset types
  - **Audio formats** (MP3, WAV): 3 asset types

### 2. Type Definitions

#### File: `types.ts`
Updated `AssetFormat` interface to include:
```typescript
export interface AssetFormat {
    id: number;
    format_name: string;
    format_type: 'image' | 'video' | 'document' | 'audio';
    file_extensions: string[];
    max_file_size_mb: number;
    description?: string;
    application_types: ('web' | 'seo' | 'smm')[];
    asset_type_ids?: string[]; // NEW: Array of asset type names
    status: string;
    created_at?: string;
    updated_at?: string;
}
```

### 3. Backend Controller Updates

#### File: `backend/controllers/assetFormatController.js`
Updated all CRUD operations to include `asset_type_ids`:

- **GET**: Returns `asset_type_ids` as parsed JSON array
- **CREATE**: Accepts and stores `asset_type_ids` as JSON string
- **UPDATE**: Allows updating `asset_type_ids`
- **DELETE**: Soft delete (no changes needed)

All queries use the correct table name: `asset_format_master`

### 4. Frontend Filtering Logic

#### File: `views/AssetsView.tsx`
Updated the `useEffect` hook that filters available formats:

```typescript
// Update available formats when application type or asset type changes
React.useEffect(() => {
    if (assetFormats.length > 0) {
        let filtered = assetFormats;

        // Filter by application type if selected
        if (newAsset.application_type) {
            filtered = filtered.filter((format: any) =>
                format.application_types && format.application_types.includes(newAsset.application_type)
            );
        }

        // Filter by asset type if selected
        if (newAsset.type) {
            filtered = filtered.filter((format: any) => {
                // If format has asset_type_ids, check if current asset type is included
                if (format.asset_type_ids && Array.isArray(format.asset_type_ids)) {
                    return format.asset_type_ids.includes(newAsset.type);
                }
                // If no asset_type_ids specified, include all formats (backward compatibility)
                return true;
            });
        }

        setAvailableFormats(filtered);

        // Reset asset format if current selection is not available for new filters
        if (newAsset.asset_format && !filtered.some((f: any) => f.format_name === newAsset.asset_format)) {
            setNewAsset(prev => ({ ...prev, asset_format: '' }));
        }
    } else {
        setAvailableFormats(assetFormats);
    }
}, [newAsset.application_type, newAsset.type, assetFormats]);
```

## How It Works

### User Flow:
1. User selects **Application Type** (WEB, SEO, or SMM)
   - Asset Format dropdown filters to show only formats that support the selected application type

2. User selects **Asset Type** (e.g., "Research Paper")
   - Asset Format dropdown further filters to show only formats that support both:
     - The selected application type
     - The selected asset type

3. User selects **Asset Format** from the filtered list
   - Only compatible formats are shown based on both filters

### Example:
- Application Type: **WEB**
- Asset Type: **Research Paper**
- Available Formats: JPEG, PNG, WebP, SVG, GIF, PDF, DOCX, PPTX (formats that support both WEB and Research Paper)

## Backward Compatibility

The implementation includes backward compatibility:
- If a format doesn't have `asset_type_ids` defined, it will be available for all asset types
- Existing formats without `asset_type_ids` will continue to work as before

## Database Migration

To apply the changes to your database, run:
```bash
node backend/migrations/add-asset-type-linking.js
```

Migration output:
```
🔄 Adding Asset Type Linking to Asset Formats...
✅ Added asset_type_ids column to asset_format_master table
✅ Updated asset formats for image types
✅ Updated asset formats for video types
✅ Updated asset formats for document types
✅ Updated asset formats for audio types
📊 Verification - Asset formats with asset type linking:
  - JPEG (image): 14 asset types
  - PNG (image): 14 asset types
  - WebP (image): 14 asset types
  - SVG (image): 14 asset types
  - GIF (image): 14 asset types
  - MP4 (video): 6 asset types
  - MOV (video): 6 asset types
  - WebM (video): 6 asset types
  - AVI (video): 6 asset types
  - PDF (document): 16 asset types
  - DOCX (document): 16 asset types
  - PPTX (document): 16 asset types
  - MP3 (audio): 3 asset types
  - WAV (audio): 3 asset types
🎉 Asset Type Linking migration completed successfully!
```

## Testing

To test the implementation:
1. Start the backend server
2. Open the Assets view
3. Click "Add New Asset"
4. Select an Application Type (WEB, SEO, or SMM)
5. Select an Asset Type (e.g., "Research Paper")
6. Verify that the Asset Format dropdown only shows compatible formats
7. Change the Asset Type and verify the format list updates accordingly

## Future Enhancements

Potential improvements:
1. Add a UI in the Asset Format Master view to manage asset type associations
2. Add validation to ensure at least one format is available for each asset type
3. Add analytics to track which format-type combinations are most used
4. Allow custom format-type associations per brand

## Files Modified

1. `types.ts` - Added `asset_type_ids` to AssetFormat interface
2. `views/AssetsView.tsx` - Updated filtering logic for asset formats
3. `backend/controllers/assetFormatController.js` - Updated CRUD operations
4. `backend/migrations/add-asset-type-linking.js` - New migration file
5. `backend/migrations/add-asset-type-linking-to-formats.sql` - SQL migration (reference)

## Summary

The Asset Format field now intelligently filters based on both the Application Type and Asset Type selections, ensuring users only see relevant format options for their specific use case. This improves the user experience and reduces errors by preventing incompatible format selections.