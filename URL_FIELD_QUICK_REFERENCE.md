# URL Field Reorganization - Quick Reference

## What Changed

The Web Presence section in SubService form now displays:

**Before:**
```
[URL Slug] [Full URL]
```

**After:**
```
[Full URL with Copy Button]
[URL Slug (Auto-Generated)]
```

## Key Features

### Full URL Field (First)
- **Position:** Top of Web Presence section
- **Width:** Full width
- **Editable:** Yes
- **Copy Button:** Yes (📋)
- **Example:** `https://publica.com/services/publication-support/`

### URL Slug Field (Second)
- **Position:** Below Full URL
- **Width:** Full width
- **Auto-Generated:** Yes (from sub-service name)
- **Editable:** Yes (manual override)
- **Example:** `publication-support`

## Auto-Generation Rules

| Input | Output |
|-------|--------|
| "Publication Support" | "publication-support" |
| "Enterprise Marketing" | "enterprise-marketing" |
| "SEO Content Optimization" | "seo-content-optimization" |
| "Q4 Campaign 2024!" | "q4-campaign-2024" |

**Rules:**
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Keep only alphanumeric and hyphens

## User Workflow

### New Sub-Service
1. Enter Sub-Service Name
2. Slug auto-generates
3. Full URL auto-updates
4. User can edit either field

### Edit Existing
1. Full URL shows current value
2. Slug shows current value
3. Edit either field as needed
4. Changes save normally

## Code Location

**File:** `frontend/views/SubServiceMasterView.tsx`

**Function:** `handleSlugChange()`
```typescript
const handleSlugChange = (val: string) => {
    const slug = val.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ 
        ...prev, 
        slug, 
        full_url: `/services/${slug}` 
    }));
};
```

## Visual Comparison

### Old Layout
```
┌─────────────────────┬─────────────────────┐
│ URL Slug            │ Full URL            │
│ auto-generated-slug │ /services/slug      │
└─────────────────────┴─────────────────────┘
```

### New Layout
```
┌─────────────────────────────────────────┐
│ Full URL                                │
│ https://publica.com/services/slug/  📋 │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ URL Slug                                │
│ auto-generated-slug                     │
└─────────────────────────────────────────┘
```

## Testing

Quick test:
1. Create new sub-service: "Test Service"
2. Verify slug becomes: "test-service"
3. Verify full URL becomes: `/services/test-service`
4. Edit slug to: "custom-slug"
5. Verify full URL updates to: `/services/custom-slug`
6. Click copy button on Full URL
7. Verify success state shows

## No Backend Changes Required

- All changes are frontend only
- Database schema unchanged
- API endpoints unchanged
- Existing data compatible
- No migrations needed
