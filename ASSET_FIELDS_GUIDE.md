# Asset Upload Fields - Complete Guide

## ✅ What Was Added

New fields have been added to the Asset upload form to match the requirements for proper asset management and linking.

### Fields Added to Asset Upload Form:

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| **Asset Type** | Dropdown | article/video/graphic/guide/listicle/how-to | "article", "guide", "listicles" |
| **Asset Category** | Text Input | Content category or theme | "what science can do", "how to" |
| **Asset Format** | Dropdown | File format type | "image", "video", "pdf" |
| **Asset Name** | Text Input | Name of the asset | (existing field) |
| **Asset ID** | Auto | Auto-generated ID | (auto) |
| **URL / File Path** | Auto | File URL or path | (auto from upload) |
| **Mapped To** | Text Input | Service / Sub-service / Page | "SEO Services / Local SEO / Landing Page" |
| **Status** | Dropdown | Content status | "Draft", "Published", "QC", etc. |
| **Usage Status** | Dropdown | Availability status | "Available", "In Use", "Archived" |
| **QC Score** | Number Input | Quality control score (0-100) | 85 |

## 📁 Files Modified

### 1. Frontend
- ✅ `views/AssetsView.tsx` - Enhanced upload form with all new fields
- ✅ `types.ts` - Updated AssetLibraryItem interface

### 2. Database
- ✅ `schema.sql` - Added fields to content_repository table
- ✅ `backend/migrations/add_asset_fields.sql` - Migration script
- ✅ `backend/run-asset-fields-migration.js` - Migration runner

## 🎨 Upload Form Layout

The new upload form is organized in a clean, logical flow:

```
┌─────────────────────────────────────────────────────┐
│  📤 Upload New Asset                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [File Upload Area - Drag & Drop]                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Asset Name                                  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────────┐ ┌──────────────────────┐    │
│  │ Asset Type       │ │ Asset Category       │    │
│  │ (dropdown)       │ │ (text input)         │    │
│  └──────────────────┘ └──────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Asset Format (dropdown)                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Repository (dropdown)                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Mapped To (Service / Sub-service / Page)    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────────┐ ┌──────────────────────┐    │
│  │ Status           │ │ Usage Status         │    │
│  │ (dropdown)       │ │ (dropdown)           │    │
│  └──────────────────┘ └──────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ QC Score (0-100)                            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Cancel]  [Confirm Upload]                        │
└─────────────────────────────────────────────────────┘
```

## 📊 Field Details

### 1. Asset Type (Dropdown)
**Options:**
- article
- video
- graphic
- guide
- listicle
- how-to
- Image (legacy)
- Document (legacy)
- Archive (legacy)

**Purpose:** Categorize the type of content asset

### 2. Asset Category (Text Input)
**Examples:**
- "what science can do"
- "how to guides"
- "industry insights"
- "case studies"

**Purpose:** Thematic categorization for content organization

### 3. Asset Format (Dropdown)
**Options:**
- image
- video
- pdf
- doc (Document)
- ppt (Presentation)
- infographic
- ebook

**Purpose:** Specify the file format type

### 4. Mapped To (Text Input)
**Format:** `Service Name / Sub-service Name / Page Title`

**Examples:**
- "SEO Services / Local SEO / Landing Page"
- "Content Marketing / Blog Strategy"
- "Web Design / Portfolio"

**Purpose:** Show which service/sub-service/page this asset is mapped to

**Note:** You can also link assets to services from the Services → Linking tab

### 5. Status (Dropdown)
**Options:**
- Draft
- In Progress
- QC
- Approved
- Published
- Archived

**Purpose:** Track the content lifecycle status

### 6. Usage Status (Dropdown)
**Options:**
- Available
- In Use
- Archived

**Purpose:** Track availability for use in campaigns

### 7. QC Score (Number Input)
**Range:** 0-100

**Purpose:** Quality control score assigned after review

**Note:** Can be left empty initially and updated after QC review

## 🚀 How to Apply

### Step 1: Run the Migration
```bash
cd backend
node run-asset-fields-migration.js
```

This will:
- Add `linked_page_ids` column
- Add `mapped_to` column
- Add `qc_score` column
- Add constraint to ensure QC score is 0-100

### Step 2: Restart Backend
```bash
cd backend
npm run dev
```

### Step 3: Test in Frontend
1. Go to Assets page
2. Click "Upload Asset"
3. You'll see all the new fields in the upload form

## 🔄 Data Flow

### When Uploading an Asset:

1. **User fills form** with all fields
2. **File is selected** (drag & drop or click)
3. **Preview is generated** (for images)
4. **Click "Confirm Upload"**
5. **Data is sent to backend** with all fields
6. **Asset is created** in content_repository table
7. **User is redirected** to asset list
8. **Asset appears** in the list with all metadata

### Linking to Services:

**Method 1: During Upload**
- Fill in "Mapped To" field with service/sub-service/page info
- This is stored as a display string

**Method 2: From Services Page**
- Go to Services → Edit → Linking tab
- Use the Asset Linker to link/unlink assets
- This updates `linked_service_ids` in the database

## 📝 Database Schema

### Content Repository Table (Updated):

```sql
CREATE TABLE content_repository (
    id SERIAL PRIMARY KEY,
    content_title_clean VARCHAR(500),
    asset_type VARCHAR(100),
    asset_category VARCHAR(100),        -- NEW
    asset_format VARCHAR(50),           -- NEW
    status VARCHAR(50),
    linked_service_ids TEXT,
    linked_sub_service_ids TEXT,
    linked_page_ids TEXT,               -- NEW
    mapped_to VARCHAR(500),             -- NEW
    qc_score INTEGER,                   -- NEW (0-100)
    -- ... other fields
);
```

## ✅ Verification

After applying the migration, verify:

```bash
# Check if columns exist
psql -U postgres -d mcc_db -c "\d content_repository"

# Check sample data
psql -U postgres -d mcc_db -c "SELECT id, content_title_clean, asset_type, asset_category, asset_format, qc_score FROM content_repository LIMIT 5;"
```

## 🎯 Benefits

1. **Complete Asset Metadata**: All required fields captured during upload
2. **Better Organization**: Assets categorized by type, category, and format
3. **Quality Tracking**: QC scores tracked for quality assurance
4. **Clear Mapping**: Visual indication of which services use which assets
5. **Flexible Linking**: Can link during upload or later from Services page
6. **Status Tracking**: Both content status and usage status tracked

## 💡 Tips

### For Content Creators:
- Fill in Asset Category to help with content organization
- Set Status to "Draft" initially, update to "Published" when ready
- Leave QC Score empty until after review

### For QC Team:
- Update QC Score after reviewing the asset
- Change Status from "QC" to "Approved" or "Rework"

### For Managers:
- Use "Mapped To" field to see asset distribution across services
- Filter by Status to see assets in different stages
- Track QC Scores to identify quality trends

## 🔮 Future Enhancements

### Recommended Improvements:

1. **Service Selector**: Replace "Mapped To" text input with dropdown
   - Auto-populate from services table
   - Multi-select for multiple services

2. **Auto-QC**: Integrate AI for automatic QC scoring
   - Check grammar, readability, SEO
   - Suggest improvements

3. **Asset Preview**: Show preview in list view
   - Thumbnail for images
   - First frame for videos
   - Icon for documents

4. **Bulk Upload**: Allow multiple file uploads
   - Drag & drop multiple files
   - Apply same metadata to all

5. **Version Control**: Track asset versions
   - Keep history of changes
   - Rollback capability

---

**Status**: ✅ Complete  
**Version**: 1.0  
**Date**: 2025-12-08
