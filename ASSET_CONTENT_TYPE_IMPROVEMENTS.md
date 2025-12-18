# Asset Content Type & Category Improvements

## Implementation Summary

### Changes Made

#### 1. Content Type Default & Locking Behavior
- **Default Value**: Content Type now defaults to 'WEB' when creating a new asset
- **Locking Mechanism**: 
  - When a user selects **SEO** or **SMM**, the content type becomes **locked**
  - A lock icon (🔒) appears next to the selected type
  - The dropdown is replaced with a read-only display showing the locked type
  - Users cannot change the content type once locked (must create a new asset to change)
  - **WEB** remains unlocked and can be changed freely

#### 2. Asset Category Master Table Integration
- **Database Table**: Created `asset_category_master` table in schema.sql
  ```sql
  CREATE TABLE IF NOT EXISTS asset_category_master (
      id SERIAL PRIMARY KEY,
      category_name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
  );
  ```
- **Backend Integration**: Asset categories are fetched from the master table via API endpoint `/asset-categories`
- **Frontend Integration**: The Asset Category dropdown in AssetsView.tsx now populates from the master table
- **Dynamic Updates**: When categories are added to the master table, they automatically appear in the asset upload form

### Technical Details

#### State Management
```typescript
// New state variable to track content type lock
const [isContentTypeLocked, setIsContentTypeLocked] = useState(false);

// Default application_type to 'web'
const [newAsset, setNewAsset] = useState<Partial<AssetLibraryItem>>({
    application_type: 'web', // Default to WEB
    asset_category: '', // Linked to asset_category_master
    // ... other fields
});
```

#### Locking Logic
```typescript
onChange={(e) => {
    const selectedType = e.target.value as any;
    setNewAsset({
        ...newAsset,
        application_type: selectedType,
        smm_platform: undefined
    });
    // Lock the content type if SEO or SMM is selected
    if (selectedType === 'seo' || selectedType === 'smm') {
        setIsContentTypeLocked(true);
    }
}}
```

### User Experience

#### Before Upload
1. User opens asset upload form
2. Content Type defaults to "WEB (Default)"
3. User can select SEO or SMM from dropdown

#### After Selecting SEO/SMM
1. Content Type field shows locked state with icon
2. Displays: "🔍 SEO 🔒 Locked" or "📱 SMM 🔒 Locked"
3. Helper text: "⚠️ Content type is locked. Create a new asset to change it."
4. User cannot modify the content type

#### Asset Category Selection
1. Dropdown shows all active categories from `asset_category_master` table
2. Categories are sorted alphabetically
3. Only active categories (status = 'active') are displayed
4. When admin adds new category to master table, it appears immediately in the dropdown

### Files Modified

1. **schema.sql**
   - Added `asset_category_master` table definition

2. **views/AssetsView.tsx**
   - Added `isContentTypeLocked` state variable
   - Modified default `application_type` to 'web'
   - Updated content type selection UI with locking behavior
   - Integrated asset categories from master table
   - Updated reset logic to unlock content type on new asset creation
   - Updated edit logic to set lock state based on existing asset type

### Benefits

1. **Consistency**: All assets default to WEB, ensuring consistent data entry
2. **Data Integrity**: Once SEO or SMM is selected, it cannot be accidentally changed
3. **Centralized Management**: Asset categories are managed in a master table
4. **Scalability**: Easy to add new categories without code changes
5. **User Guidance**: Clear visual feedback about locked state

### Future Enhancements

- Add ability to unlock content type with admin privileges
- Add category management UI for admins
- Add category descriptions/tooltips in the dropdown
- Track category usage statistics
