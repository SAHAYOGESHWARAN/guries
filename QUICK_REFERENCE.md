# Quick Reference Guide - Asset Content Type & Category

## What Changed?

### 1. Content Type Now Defaults to 'WEB'
- **Before**: Empty dropdown, user must select
- **After**: Pre-filled with "WEB (Default)"

### 2. SEO and SMM Types Lock Automatically
- **Before**: Could be changed anytime
- **After**: Locks immediately when selected, shows 🔒 icon

### 3. Asset Category from Database
- **Before**: Hardcoded options
- **After**: Dynamic list from `asset_category_master` table

## How to Use

### Creating a WEB Asset
```
1. Open upload form → Content Type already set to WEB ✓
2. Fill in other fields
3. Select category from dropdown
4. Save or submit
```

### Creating an SEO Asset
```
1. Open upload form
2. Change Content Type to SEO → Locks immediately 🔒
3. Fill in other fields
4. Select category from dropdown
5. Save or submit
```

### Creating an SMM Asset
```
1. Open upload form
2. Change Content Type to SMM → Locks immediately 🔒
3. Fill in other fields
4. Select category from dropdown
5. Save or submit
```

## Adding New Categories

### Via Database
```sql
INSERT INTO asset_category_master (category_name, description, status)
VALUES ('New Category', 'Description here', 'active');
```

### Via API (if available)
```javascript
POST /api/asset-categories
{
  "category_name": "New Category",
  "description": "Description here"
}
```

## Visual Indicators

| State | Icon | Color | Meaning |
|-------|------|-------|---------|
| WEB (Default) | 🌐 | Blue | Unlocked, can be changed |
| SEO (Locked) | 🔍 🔒 | Indigo | Locked, cannot be changed |
| SMM (Locked) | 📱 🔒 | Indigo | Locked, cannot be changed |

## Common Questions

**Q: Can I change the content type after selecting SEO?**
A: No, once SEO or SMM is selected, it locks automatically. Create a new asset to use a different type.

**Q: Why does WEB not lock?**
A: WEB is the default type and remains flexible. Only SEO and SMM lock to prevent accidental changes.

**Q: How do I add new categories?**
A: Add them to the `asset_category_master` table. They will appear automatically in the dropdown.

**Q: Can I unlock a content type?**
A: Not currently. This is a future enhancement for admin users.

**Q: What happens when editing an existing asset?**
A: If the asset is SEO or SMM, the content type will show as locked. WEB assets remain editable.

## Database Schema

```sql
-- Asset Category Master Table
CREATE TABLE asset_category_master (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/asset-categories` | Get all active categories |
| POST | `/api/asset-categories` | Create new category |
| PUT | `/api/asset-categories/:id` | Update category |
| DELETE | `/api/asset-categories/:id` | Soft delete category |

## Troubleshooting

**Problem**: Categories not showing in dropdown
**Solution**: 
1. Check database connection
2. Verify categories have `status = 'active'`
3. Refresh the page

**Problem**: Content type not locking
**Solution**:
1. Clear browser cache
2. Verify you selected SEO or SMM (not WEB)
3. Check browser console for errors

**Problem**: Cannot change content type
**Solution**:
- This is expected behavior for SEO/SMM
- Create a new asset if you need a different type

## Support

For issues or questions:
1. Check this guide first
2. Review IMPLEMENTATION_SUMMARY.md
3. Check ASSET_UI_CHANGES_GUIDE.md for visual examples
4. Contact development team
