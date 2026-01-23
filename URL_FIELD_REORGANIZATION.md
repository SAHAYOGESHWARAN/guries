# URL Field Reorganization - SubService Form

## Overview
The Web Presence section in the SubService form has been reorganized to display the Full URL field first, followed by the URL Slug field below it. Both fields are now full-width for better visibility.

## Changes Made

### Frontend (frontend/views/SubServiceMasterView.tsx)

#### Web Presence Card Layout

**Previous Order:**
1. Row 1 (2 columns): URL Slug (left) | Full URL (right)
2. Row 2 (2 columns): Language | Status

**New Order:**
1. Row 1 (Full Width): Full URL with copy button
2. Row 2 (Full Width): URL Slug (auto-generated)
3. Row 3 (2 columns): Language | Status

#### Field Details

**Full URL Field**
- **Position:** First (top)
- **Width:** Full width
- **Icon:** 🔗
- **Color:** Cyan
- **Placeholder:** `https://publica.com/services/publication-support/`
- **Features:**
  - Editable text input
  - Copy to clipboard button
  - Shows success state when copied
  - Tooltip: "Canonical URL path used on Guires Marketing OS. This is the complete URL for this sub-service."

**URL Slug Field**
- **Position:** Second (below Full URL)
- **Width:** Full width
- **Icon:** 🔤
- **Color:** Blue
- **Placeholder:** `auto-generated-slug`
- **Features:**
  - Auto-generates from sub-service name
  - Converts to lowercase
  - Replaces spaces with hyphens
  - Removes special characters
  - Tooltip: "URL-friendly identifier. Auto-generated from sub-service name if empty."

## Auto-Generation Logic

### Slug Generation Function
```typescript
const handleSlugChange = (val: string) => {
    const slug = val.toLowerCase()
        .replace(/ /g, '-')           // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '');  // Remove special characters
    setFormData(prev => ({ 
        ...prev, 
        slug, 
        full_url: `/services/${slug}` 
    }));
};
```

### When Auto-Generation Occurs
1. **On Sub-Service Name Change** (when creating new record)
   - User enters sub-service name
   - Slug auto-generates if not already set
   - Full URL updates automatically

2. **On Slug Manual Edit**
   - User can manually edit slug
   - Full URL updates based on new slug
   - Format: `/services/{slug}`

### Example
- Sub-Service Name: "Publication Support"
- Auto-Generated Slug: "publication-support"
- Full URL: `/services/publication-support`

## User Experience Flow

### Creating New Sub-Service
1. User enters Sub-Service Name (e.g., "Enterprise Marketing")
2. Service Code auto-generates (e.g., "EM-1234")
3. Parent Service is selected
4. User navigates to Web Presence section
5. Full URL field is displayed first (empty initially)
6. URL Slug auto-generates from name (e.g., "enterprise-marketing")
7. Full URL auto-updates (e.g., `/services/enterprise-marketing`)
8. User can manually edit Full URL if needed
9. User can manually edit Slug if needed

### Editing Existing Sub-Service
1. All fields pre-populate with existing data
2. Full URL shows current complete URL
3. Slug shows current slug
4. User can edit either field
5. Changes update in real-time

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🌐 WEB PRESENCE                                         │
│ URL, accessibility, and status management              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🔗 FULL URL                                             │
│ ┌─────────────────────────────────────────────────┐   │
│ │ https://publica.com/services/publication-support/ │📋│
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 🔤 URL SLUG                                             │
│ ┌─────────────────────────────────────────────────┐   │
│ │ auto-generated-slug                             │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 🌍 LANGUAGE          │ 📊 STATUS                       │
│ ┌──────────────────┐ │ ┌──────────────────┐           │
│ │ English          │ │ │ Draft            │           │
│ └──────────────────┘ │ └──────────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Benefits

✅ **Better Visibility** - Full URL is now the primary focus
✅ **Logical Flow** - Complete URL first, then slug
✅ **Auto-Generation** - Slug automatically generates from name
✅ **Full Width** - Both URL fields are easier to read and edit
✅ **Copy Functionality** - Easy copy-to-clipboard for Full URL
✅ **Consistent** - Matches Figma design specifications

## No Breaking Changes

- All existing functionality preserved
- Auto-generation logic unchanged
- Form data structure unchanged
- Backend compatibility maintained
- Backward compatible with existing records

## Testing Checklist

- [ ] Create new sub-service and verify slug auto-generates
- [ ] Edit sub-service name and verify slug updates
- [ ] Manually edit slug and verify full URL updates
- [ ] Copy full URL button works correctly
- [ ] Language and Status fields still function
- [ ] Form saves correctly with new layout
- [ ] Existing sub-services load correctly
- [ ] Mobile responsive layout works
