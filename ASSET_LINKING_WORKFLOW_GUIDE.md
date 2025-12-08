# Asset Linking Workflow Guide

## Complete Asset Management & Linking System

Your Marketing Control Center now has a complete, professional asset management and linking system. Here's how it works:

---

## 📋 Workflow Overview

### Step 1: Upload Assets to Asset Module
**Location:** Assets View (Main Navigation → Assets)

1. Click **"Upload New Asset"** or **"+ Create Asset"**
2. Upload your file (images, videos, PDFs, documents)
3. Fill in asset details:
   - **Asset Name** - Descriptive name for the asset
   - **Asset Type** - article, video, graphic, guide, etc.
   - **Asset Category** - e.g., "what science can do"
   - **Asset Format** - image, video, pdf, etc.
   - **Repository** - Content Repository, SMM Repository, SEO Repository, Design Repository
   - **Status** - Draft, In Progress, QC, Approved, Published, Archived
   - **Usage Status** - Available, In Use, Archived

4. **Optional:** Link to Service/Sub-Service immediately:
   - Select a parent service from dropdown
   - Check sub-services to link (multiple selections allowed)
   - See preview of your selections

5. Click **"Confirm Upload"** or **"Save Changes"**

**Result:** Asset is now in the Asset Library and ready to be linked to services

---

### Step 2: Link Assets to Services
**Location:** Services View → Edit Service → Linking Tab

#### Method A: From Service Linking Tab

1. Navigate to **Services** view
2. Click **"Edit"** on any service
3. Go to the **"Linking"** tab
4. You'll see the **Asset Library Management** interface with two panels:

   **Left Panel - Linked Assets:**
   - Shows all assets currently linked to this service
   - Click the ❌ button to unlink an asset
   - Displays asset preview, name, type, and repository

   **Right Panel - Asset Library:**
   - Shows ALL available assets from the Asset Module
   - Search by name, type, or repository
   - Filter by repository (Content, SMM, SEO, Design)
   - Click on any asset card to link it
   - Shows asset preview, name, type, and repository

5. **To Link:** Click on any asset in the right panel
6. **To Unlink:** Click the ❌ button on any asset in the left panel

#### Method B: From Asset Edit Form

1. Navigate to **Assets** view
2. Click **"Edit"** on any asset
3. Scroll to **"Link to Service"** section
4. Select a service from the dropdown
5. Check the sub-services you want to link
6. Click **"Save Changes"**

---

### Step 3: Link Assets to Sub-Services
**Location:** Sub-Service Registry → Edit Sub-Service → Linking Tab

1. Navigate to **Sub-Service Registry** view
2. Click **"Edit"** on any sub-service
3. Go to the **"Linking"** tab
4. Use the same Asset Library Management interface:
   - Browse all assets from the Asset Module
   - Search and filter assets
   - Click to link/unlink assets

---

## 🎯 Key Features

### Asset Library Management Interface

The professional asset linking interface provides:

#### Visual Asset Browser
- **Thumbnail Previews** - See images and icons for each asset
- **Asset Cards** - Clean, organized display with all key information
- **Type Badges** - Color-coded badges for Image, Video, Document, Archive
- **Repository Tags** - Shows which repository the asset belongs to
- **Asset IDs** - Quick reference for tracking

#### Smart Search & Filtering
- **Search Bar** - Search by name, type, or repository
- **Repository Filter** - Filter by Content, SMM, SEO, or Design repository
- **Real-time Results** - Instant filtering as you type
- **Clear Button** - Quick reset of search

#### Two-Panel Layout
- **Left Panel (Linked)** - Shows currently connected assets
- **Right Panel (Available)** - Shows all assets ready to link
- **Live Counts** - See how many assets are linked vs available
- **Drag-free Linking** - Simple click to link/unlink

#### Status Indicators
- **Linked Count** - Shows total linked assets
- **Available Count** - Shows assets ready to link
- **Empty States** - Helpful messages when no assets found
- **Tips Section** - Best practices for asset management

---

## 📊 Viewing Linked Assets

### In Service Master View
- **Linked Assets Count** - Auto-calculated in the table
- **Includes:** Assets from both Content Repository AND Asset Library
- **Tooltip:** Hover to see breakdown by source

### In Sub-Service Registry
- **Linked Assets Column** - Shows total count
- **Tooltip:** "X from Asset Library + Y from Content Repository"
- **Real-time Updates** - Count updates immediately after linking

### In Assets View
- **Linked To Column** - Shows which services/sub-services the asset is linked to
- **Service Names** - Displays actual service names, not just IDs
- **Sub-service Names** - Shows linked sub-services below service name
- **Visual Indicator** - Blue badge with link icon

---

## 🔄 Bidirectional Linking

The system supports linking from both directions:

### From Service → Asset
1. Edit Service → Linking Tab
2. Browse Asset Library
3. Click to link assets

### From Asset → Service
1. Edit Asset → Link to Service section
2. Select service and sub-services
3. Save to create links

**Both methods update the same database relationships!**

---

## 💾 Database Structure

### Assets Table
```sql
linked_service_ids      TEXT (JSON array)  -- [1, 2, 3]
linked_sub_service_ids  TEXT (JSON array)  -- [10, 11, 12]
mapped_to               TEXT               -- "Service Name / Sub-service 1, Sub-service 2"
```

### Content Repository Table
```sql
linked_service_ids      TEXT (JSON array)
linked_sub_service_ids  TEXT (JSON array)
```

---

## ✅ Best Practices

### 1. Upload First, Link Later
- Upload all assets to the Asset Module first
- Fill in complete metadata (type, category, format, repository)
- Then link them to services as needed

### 2. Use Descriptive Names
- Give assets clear, descriptive names
- Include context in the name (e.g., "Product Hero Image - Homepage")
- Makes searching and linking easier

### 3. Organize by Repository
- Use repository tags consistently
- Content Repository - Blog posts, articles
- SMM Repository - Social media graphics
- SEO Repository - SEO-optimized images
- Design Repository - Brand assets, templates

### 4. Link Strategically
- Link assets to relevant services only
- One asset can be linked to multiple services/sub-services
- Review and update links regularly

### 5. Keep Metadata Updated
- Update asset status as it progresses (Draft → QC → Published)
- Update usage status (Available → In Use → Archived)
- Add quality scores when available

---

## 🎨 UI Components

### ServiceAssetLinker Component
**Location:** `components/ServiceAssetLinker.tsx`

**Features:**
- Professional two-panel layout
- Real-time search and filtering
- Visual asset previews
- Click-to-link interaction
- Repository filtering
- Empty state messages
- Tips and best practices section

**Used In:**
- ServiceMasterView (Linking tab)
- SubServiceMasterView (Linking tab)

---

## 🔧 Technical Implementation

### Asset Linking Logic

#### Services
```typescript
// Get linked assets
const linkedLibraryAssets = libraryAssets.filter(a => {
    const links = Array.isArray(a.linked_service_ids) ? a.linked_service_ids : [];
    return links.map(String).includes(String(serviceId));
});

// Get available assets (not yet linked)
const availableLibraryAssets = libraryAssets.filter(a => {
    const links = Array.isArray(a.linked_service_ids) ? a.linked_service_ids : [];
    return !links.map(String).includes(String(serviceId));
});
```

#### Sub-Services
```typescript
// Get linked assets
const linkedLibraryAssets = libraryAssets.filter(a => {
    const links = Array.isArray(a.linked_sub_service_ids) ? a.linked_sub_service_ids : [];
    return links.map(String).includes(String(subServiceId));
});
```

#### Toggle Link
```typescript
const handleToggleLibraryLink = async (asset: AssetLibraryItem) => {
    const currentLinks = Array.isArray(asset.linked_service_ids) 
        ? asset.linked_service_ids 
        : [];
    
    const isLinked = currentLinks.map(String).includes(String(serviceId));
    
    const newLinks = isLinked
        ? currentLinks.filter(id => String(id) !== String(serviceId))
        : [...currentLinks, serviceId];
    
    await updateLibraryAsset(asset.id, { 
        linked_service_ids: newLinks 
    });
};
```

---

## 📈 Benefits

### For Content Managers
- ✅ Easy asset discovery and linking
- ✅ Visual interface with previews
- ✅ Quick search and filtering
- ✅ See all linked assets at a glance

### For SEO Teams
- ✅ Track which assets are used where
- ✅ Ensure proper asset distribution
- ✅ Identify unused assets
- ✅ Optimize asset usage

### For Developers
- ✅ Clean, maintainable code
- ✅ Reusable components
- ✅ Proper database relationships
- ✅ Type-safe TypeScript

---

## 🚀 Quick Start

### To Link Your First Asset:

1. **Upload an asset:**
   - Go to Assets → Upload New Asset
   - Fill in details and upload file
   - Click "Confirm Upload"

2. **Link to a service:**
   - Go to Services → Edit any service
   - Click "Linking" tab
   - Find your asset in the right panel
   - Click on it to link

3. **Verify:**
   - Check the left panel - your asset should appear
   - Go back to Services list
   - See the "Linked Assets" count updated

**That's it! Your asset is now linked and ready to use.**

---

## 📞 Support

If you encounter any issues:
1. Check that assets are uploaded in the Assets module first
2. Verify the asset has proper metadata (type, repository)
3. Ensure you're in the Linking tab of the service/sub-service
4. Try refreshing the page to reload asset data

---

## 🎉 Summary

Your Marketing Control Center now has a complete, professional asset management system:

✅ **Upload assets** in the Asset Module with full metadata  
✅ **Link assets** to services/sub-services from either direction  
✅ **Browse assets** with visual previews and smart search  
✅ **Track usage** with accurate linked asset counts  
✅ **Manage relationships** with simple click-to-link interface  

The system is production-ready and follows industry best practices for asset management!
