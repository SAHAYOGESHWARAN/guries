# Service Master Architecture - Implementation Guide

## 🎯 Core Principle
**Service Master = Clean Source of Truth**
- No QC fields
- No workflow stages
- No assignments
- Only final "live" content + metadata

## 🏗️ Architecture Overview

```
Service Master (Clean Storage)
    ↓
    ├── Sub-Services (Children)
    │   └── Linked Assets
    └── Linked Assets (Articles, Videos, PDFs, etc.)
    
Projects → Campaigns (Work Layer)
    ↓
    ├── Working Copies of Services
    ├── Working Copies of Assets
    ├── QC Process
    ├── AI Editing
    └── SEO Fixes
    
After Approval → Push back to Service Master
```

## 📊 Database Structure

### Services Table (Master)
**A. Identity & Core Details**
- `service_id`, `service_code`, `service_name`
- `slug`, `full_url`, `menu_heading`, `short_tagline`
- `service_description`
- `industry_ids`, `country_ids` (JSON arrays)
- `language`, `status`

**B. Ownership & Governance**
- `brand_id`, `business_unit`
- `content_owner_id`, `created_by`, `updated_by`
- `created_at`, `updated_at`
- `version_number`, `change_log_link`

**C. Navigation & Site Structure**
- `show_in_main_menu`, `show_in_footer_menu`
- `menu_group`, `menu_position`, `breadcrumb_label`
- `parent_menu_section`
- `include_in_xml_sitemap`, `sitemap_priority`, `sitemap_changefreq`

**D. Strategic Mapping**
- `content_type` (Pillar/Cluster/Landing/Blog/Case Study/Sales Page)
- `buyer_journey_stage` (Awareness/Consideration/Decision/Retention)
- `primary_persona_id`, `secondary_persona_ids`
- `target_segment_notes`
- `primary_cta_label`, `primary_cta_url`
- `form_id`, `linked_campaign_ids`

**E. Technical SEO Block**
- `schema_type_id`, `robots_index`, `robots_follow`, `robots_custom`
- `canonical_url`, `redirect_from_urls`
- `hreflang_group_id`
- `core_web_vitals_status`, `tech_seo_status`
- `faq_section_enabled`, `faq_content` (JSONB)

**F. Content Block**
- `h1`, `h2_list`, `h3_list`, `h4_list`, `h5_list`
- `body_content`
- `internal_links`, `external_links`, `image_alt_texts`
- `word_count`, `reading_time_minutes`

**G. SEO Metadata Block**
- `meta_title`, `meta_description`
- `focus_keywords`, `secondary_keywords`
- `seo_score`, `ranking_summary`

**H. SMM / Social Meta (Default)**
- Open Graph: `og_title`, `og_description`, `og_image_url`, `og_type`
- Twitter: `twitter_title`, `twitter_description`, `twitter_image_url`
- LinkedIn: `linkedin_title`, `linkedin_description`, `linkedin_image_url`
- Facebook: `facebook_title`, `facebook_description`, `facebook_image_url`
- Instagram: `instagram_title`, `instagram_description`, `instagram_image_url`
- `social_meta` (JSONB for flexible platform storage)

**K. Linking to Sub-services, Assets & Other Modules**
- `has_subservices`, `subservice_count`, `primary_subservice_id`
- `featured_asset_id`, `asset_count`
- `knowledge_topic_id`

### Sub-Services Table
**Inherits all blocks from parent Service:**
- Core Identity (with parent_service_id reference)
- Navigation
- Strategic
- Technical SEO
- Content Block
- SEO Metadata
- SMM / Social Meta
- Governance

**Key Difference:**
- `assets_linked` count
- Simpler structure (no sub-sub-services)

## 🔄 Workflow Architecture

### 1. Service Master (Read-Only for Work)
```
Service Master
    ↓ (Read Only)
Campaign Working Copy
    ↓ (Edit, QC, AI)
Approved Changes
    ↓ (Push Back)
Service Master Updated
```

### 2. When to Create/Edit Service Master
✅ **Direct Edit Allowed:**
- Initial service creation
- Basic info updates (name, description, tagline)
- Navigation settings
- Strategic mapping
- Governance updates

❌ **No Direct Edit (Use Campaigns):**
- Content optimization
- SEO fixes
- Meta updates based on audits
- Bulk content changes

### 3. Campaign-Based Workflow
```
1. Create Project → Campaign
2. Campaign pulls Service/Asset working copies
3. Work happens in Campaign:
   - Content editing
   - SEO optimization
   - AI suggestions & edits
   - QC process
4. After QC approval:
   - Push changes back to Service Master
   - Update Asset Master
   - Mark errors as resolved
```

## 🤖 AI Integration Rules

### In Service Master UI (Assistive Only)
✅ **AI Can:**
- Suggest better H1/H2/H3 structure
- Suggest FAQ pairs from description
- Suggest meta-title & meta-description
- Suggest internal links to other services
- Suggest schema types
- Suggest focus/secondary keywords

❌ **AI Cannot:**
- Auto-save to Service Master
- Modify content without user confirmation
- Change approved content directly

### In Campaign UI (Full AI Playground)
✅ **AI Can:**
- Generate first draft content
- Rewrite sections (tone, simplify, adapt)
- Generate SEO elements
- Generate SMM copy for all platforms
- Run AI QC checks
- Propose QC scores
- Modify working copies freely

✅ **Approval Required:**
- Final push to Service Master
- Asset Master updates

## 🔗 Linking Architecture

### Service ↔ Sub-Service
- **Relationship:** One-to-Many
- **Parent Service** tracks: `has_subservices`, `subservice_count`
- **Sub-Service** references: `parent_service_id`
- **Auto-update:** When sub-service created/deleted, parent count updates

### Service/Sub-Service ↔ Assets
- **Relationship:** Many-to-Many
- **Asset Table** has: `linked_service_ids`, `linked_sub_service_ids` (JSON arrays)
- **Service Table** tracks: `asset_count` (rollup)
- **Linking happens in:** Service Master UI or Campaign UI

### Service ↔ Campaigns
- **Relationship:** Many-to-Many
- **Campaign Table** has: `linked_service_ids` (JSON array)
- **Service Table** has: `linked_campaign_ids` (JSON array)
- **Purpose:** Track which campaigns are working on which services

## 🛠️ Frontend Implementation

### ServiceMasterView.tsx
**9 Tabs:**
1. **Core** - Identity, description, industries, countries
2. **Navigation** - Menu settings, sitemap configuration
3. **Strategic** - Content type, buyer journey, personas, CTAs
4. **Content** - H1-H5 headings, body content
5. **SEO** - Meta title/description, keywords
6. **SMM** - Social meta for all platforms
7. **Technical** - Robots, schema, canonical, FAQ
8. **Linking** - Sub-services, assets
9. **Governance** - Brand, owner, business unit

**Key Features:**
- AI Suggest button (assistive only)
- Auto-slug generation
- Full URL preview with copy
- Industry/Country multi-select from masters
- Keyword metrics from Keyword Master
- Asset linking interface
- Sub-service count display

### SubServiceMasterView.tsx
**Same structure as ServiceMasterView** but:
- Requires parent service selection
- Auto-generates URL based on parent slug
- Inherits settings from parent (optional)
- Simpler linking (no sub-sub-services)

## 📡 API Endpoints

### Services
```
GET    /api/v1/services
POST   /api/v1/services
PUT    /api/v1/services/:id
DELETE /api/v1/services/:id
```

### Sub-Services
```
GET    /api/v1/sub-services
POST   /api/v1/sub-services
PUT    /api/v1/sub-services/:id
DELETE /api/v1/sub-services/:id
```

### Backend Controller Features
- JSON field parsing (arrays & objects)
- Auto-increment version numbers
- URL normalization
- Parent service count auto-update
- Socket.io real-time updates

## ✅ Implementation Checklist

### Database ✅
- [x] Services table with all 9 blocks
- [x] Sub-services table with inheritance
- [x] Proper foreign keys and references
- [x] JSON/JSONB fields for arrays and objects

### Backend ✅
- [x] Service controller with full CRUD
- [x] Sub-service controller with full CRUD
- [x] JSON parsing helpers
- [x] Auto-update parent counts
- [x] URL normalization
- [x] API routes registered

### Frontend ✅
- [x] ServiceMasterView with 9 tabs
- [x] SubServiceMasterView with 9 tabs
- [x] AI suggest integration (assistive)
- [x] Asset linking interface
- [x] Industry/Country master integration
- [x] Keyword master integration
- [x] Form/Persona master integration
- [x] Real-time updates via Socket.io

### Integration Points ✅
- [x] Registered in App.tsx
- [x] useData hook integration
- [x] Table component for list view
- [x] Tooltip component for help text
- [x] CSV export functionality

## 🚀 Next Steps

### Phase 2: Campaign Working Copies
1. Create Campaign Service Copy table
2. Create Campaign Asset Copy table
3. Build "Pull to Campaign" functionality
4. Build "Approve & Push to Master" functionality

### Phase 3: On-Page SEO Audit
1. Create On-Page Error table (already exists)
2. Link errors to Services/Sub-services
3. Link errors to Campaigns for resolution
4. Build error resolution workflow

### Phase 4: AI Enhancement
1. Build AI suggestion API endpoints
2. Integrate AI content generation in Campaigns
3. Build AI QC scoring system
4. Create AI-powered internal linking suggestions

## 📝 Usage Examples

### Creating a New Service
```typescript
// 1. Fill Core tab (required)
service_name: "Technical SEO Audit"
slug: "technical-seo-audit" (auto-generated)
full_url: "/services/technical-seo-audit" (auto-generated)
service_description: "Comprehensive technical SEO analysis..."
status: "Draft"

// 2. Select industries & countries
industry_ids: ["Food", "Nutraceutical"]
country_ids: ["IN", "US"]

// 3. Click "AI Suggest" for content structure
// AI suggests H1, H2s, meta, FAQs

// 4. Configure other tabs as needed

// 5. Save → Service Master record created
```

### Linking Assets to Service
```typescript
// In Linking tab:
// 1. Search for assets
// 2. Click "Link" button
// 3. Asset's linked_service_ids updated
// 4. Service's asset_count incremented
```

### Creating Sub-Service
```typescript
// 1. Select parent service (required)
parent_service_id: 5 // Technical SEO Audit

// 2. Fill sub-service details
sub_service_name: "Core Web Vitals Optimization"
slug: "core-web-vitals" (auto-generated)
full_url: "/services/technical-seo-audit/core-web-vitals" (auto-generated)

// 3. Inherits or overrides parent settings
// 4. Save → Parent's subservice_count incremented
```

## 🎨 UI/UX Highlights

- **Clean tabbed interface** - 9 organized sections
- **Auto-generation** - Slugs, URLs, counts
- **Real-time validation** - Character counts, required fields
- **Master integrations** - Dropdowns from Industry, Country, Persona, Form masters
- **Keyword metrics** - Shows search volume & competition from Keyword Master
- **Asset preview** - Shows linked assets with status badges
- **AI assistance** - Sparkle icon for AI suggestions
- **Copy to clipboard** - Quick URL copying
- **Responsive design** - Works on all screen sizes

## 🔒 Data Integrity Rules

1. **Service deletion** - Warns about linked sub-services and assets
2. **Sub-service deletion** - Auto-decrements parent count
3. **URL uniqueness** - Enforced at application level
4. **Required fields** - service_name, parent_service_id (for sub-services)
5. **JSON validation** - Arrays and objects properly parsed
6. **Version tracking** - Auto-increments on updates
7. **Timestamp tracking** - created_at, updated_at auto-managed

---

**Status:** ✅ Fully Implemented
**Last Updated:** December 5, 2025
**Architecture:** Clean Master + Campaign Working Copies
