# Service Master - Visual Architecture Diagram

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│                                                                     │
│  ┌──────────────────────┐         ┌──────────────────────┐        │
│  │  Service Master View │         │ Sub-Service Master   │        │
│  │                      │         │      View            │        │
│  │  • List View         │         │  • List View         │        │
│  │  • Form View (9 tabs)│         │  • Form View (9 tabs)│        │
│  │  • Search & Filter   │         │  • Parent Selection  │        │
│  │  • AI Suggest        │         │  • AI Suggest        │        │
│  │  • Asset Linking     │         │  • Asset Linking     │        │
│  └──────────────────────┘         └──────────────────────┘        │
│           │                                  │                      │
└───────────┼──────────────────────────────────┼──────────────────────┘
            │                                  │
            ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Express)                         │
│                                                                     │
│  GET    /api/v1/services              GET    /api/v1/sub-services  │
│  POST   /api/v1/services              POST   /api/v1/sub-services  │
│  PUT    /api/v1/services/:id          PUT    /api/v1/sub-services/:id│
│  DELETE /api/v1/services/:id          DELETE /api/v1/sub-services/:id│
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │         Service Controller (serviceController.ts)            │ │
│  │                                                              │ │
│  │  • JSON Parsing Helpers                                     │ │
│  │  • URL Normalization                                        │ │
│  │  • Version Auto-increment                                   │ │
│  │  • Parent Count Auto-update                                 │ │
│  │  • Socket.io Real-time Events                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (PostgreSQL)                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                      SERVICES TABLE                          │ │
│  │                                                              │ │
│  │  A. Identity & Core (9 fields)                              │ │
│  │     • service_id, service_code, service_name                │ │
│  │     • slug, full_url, menu_heading, short_tagline           │ │
│  │     • service_description, industry_ids, country_ids        │ │
│  │     • language, status                                      │ │
│  │                                                              │ │
│  │  B. Ownership & Governance (9 fields)                       │ │
│  │     • brand_id, business_unit, content_owner_id             │ │
│  │     • created_by, created_at, updated_by, updated_at        │ │
│  │     • version_number, change_log_link                       │ │
│  │                                                              │ │
│  │  C. Navigation & Site Structure (9 fields)                  │ │
│  │     • show_in_main_menu, show_in_footer_menu                │ │
│  │     • menu_group, menu_position, breadcrumb_label           │ │
│  │     • parent_menu_section, include_in_xml_sitemap           │ │
│  │     • sitemap_priority, sitemap_changefreq                  │ │
│  │                                                              │ │
│  │  D. Strategic Mapping (9 fields)                            │ │
│  │     • content_type, buyer_journey_stage                     │ │
│  │     • primary_persona_id, secondary_persona_ids             │ │
│  │     • target_segment_notes, primary_cta_label               │ │
│  │     • primary_cta_url, form_id, linked_campaign_ids         │ │
│  │                                                              │ │
│  │  E. Technical SEO Block (11 fields)                         │ │
│  │     • schema_type_id, robots_index, robots_follow           │ │
│  │     • robots_custom, canonical_url, redirect_from_urls      │ │
│  │     • hreflang_group_id, core_web_vitals_status             │ │
│  │     • tech_seo_status, faq_section_enabled, faq_content     │ │
│  │                                                              │ │
│  │  F. Content Block (11 fields)                               │ │
│  │     • h1, h2_list, h3_list, h4_list, h5_list                │ │
│  │     • body_content, internal_links, external_links          │ │
│  │     • image_alt_texts, word_count, reading_time_minutes     │ │
│  │                                                              │ │
│  │  G. SEO Metadata Block (6 fields)                           │ │
│  │     • meta_title, meta_description                          │ │
│  │     • focus_keywords, secondary_keywords                    │ │
│  │     • seo_score, ranking_summary                            │ │
│  │                                                              │ │
│  │  H. SMM / Social Meta (16 fields + JSONB)                   │ │
│  │     • og_title, og_description, og_image_url, og_type       │ │
│  │     • twitter_title, twitter_description, twitter_image_url │ │
│  │     • linkedin_title, linkedin_description, linkedin_image  │ │
│  │     • facebook_title, facebook_description, facebook_image  │ │
│  │     • instagram_title, instagram_description, instagram_img │ │
│  │     • social_meta (JSONB for flexible platforms)            │ │
│  │                                                              │ │
│  │  K. Linking (6 fields)                                      │ │
│  │     • has_subservices, subservice_count                     │ │
│  │     • primary_subservice_id, featured_asset_id              │ │
│  │     • asset_count, knowledge_topic_id                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                   SUB_SERVICES TABLE                         │ │
│  │                                                              │ │
│  │  • Inherits all blocks from Services                        │ │
│  │  • parent_service_id (FK → services.id)                     │ │
│  │  • Simpler structure (no sub-sub-services)                  │ │
│  │  • assets_linked count                                      │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔗 Relationship Diagram

```
┌─────────────────────┐
│   SERVICES TABLE    │
│   (Master/Parent)   │
│                     │
│  • service_id (PK)  │
│  • service_name     │
│  • slug             │
│  • 95+ fields       │
└──────────┬──────────┘
           │
           │ One-to-Many
           │
           ▼
┌─────────────────────┐
│ SUB_SERVICES TABLE  │
│   (Children)        │
│                     │
│  • id (PK)          │
│  • parent_service_id│────┐
│  • sub_service_name │    │ Foreign Key
│  • 80+ fields       │    │
└──────────┬──────────┘    │
           │               │
           └───────────────┘
           
           
┌─────────────────────┐         ┌─────────────────────┐
│   SERVICES TABLE    │         │  CONTENT_REPOSITORY │
│                     │◄────────┤     (Assets)        │
│  • asset_count      │  Many   │                     │
│                     │   to    │  • linked_service   │
└─────────────────────┘  Many   │    _ids (JSON)      │
                                │                     │
┌─────────────────────┐         │  • linked_sub       │
│ SUB_SERVICES TABLE  │◄────────┤    _service_ids     │
│                     │  Many   │    (JSON)           │
│  • assets_linked    │   to    │                     │
│                     │  Many   └─────────────────────┘
└─────────────────────┘


┌─────────────────────┐         ┌─────────────────────┐
│   SERVICES TABLE    │         │   CAMPAIGNS TABLE   │
│                     │◄────────┤                     │
│  • linked_campaign  │  Many   │  • linked_service   │
│    _ids (JSON)      │   to    │    _ids (JSON)      │
│                     │  Many   │                     │
└─────────────────────┘         └─────────────────────┘
```

## 📊 Data Flow Diagram

### Creating a Service
```
User Input
    │
    ▼
Frontend Form (9 tabs)
    │
    ├─ Core Tab → service_name, slug, description, industries, countries
    ├─ Navigation Tab → menu settings, sitemap config
    ├─ Strategic Tab → content type, buyer journey, personas
    ├─ Content Tab → H1-H5, body content
    ├─ SEO Tab → meta title/description, keywords
    ├─ SMM Tab → social meta for all platforms
    ├─ Technical Tab → robots, schema, FAQ
    ├─ Linking Tab → (empty for new service)
    └─ Governance Tab → brand, owner, business unit
    │
    ▼
POST /api/v1/services
    │
    ▼
Service Controller
    │
    ├─ Validate required fields
    ├─ Auto-generate slug from name
    ├─ Auto-generate full_url from slug
    ├─ Parse JSON arrays (industries, countries, keywords, etc.)
    ├─ Set created_at, created_by, version_number
    ├─ Normalize URL format
    │
    ▼
INSERT INTO services
    │
    ▼
Database stores record
    │
    ▼
RETURNING * (with parsed JSON)
    │
    ▼
Socket.io emits 'service_created'
    │
    ▼
Frontend receives new service
    │
    ▼
List view updates in real-time
```

### Creating a Sub-Service
```
User Input
    │
    ▼
Frontend Form
    │
    ├─ Select Parent Service (required)
    ├─ Fill sub-service details
    └─ URL auto-generates: /services/{parent-slug}/{sub-slug}
    │
    ▼
POST /api/v1/sub-services
    │
    ▼
Service Controller
    │
    ├─ Validate parent_service_id
    ├─ Fetch parent service slug
    ├─ Auto-generate full_url
    ├─ Parse JSON fields
    │
    ▼
INSERT INTO sub_services
    │
    ▼
UPDATE services SET subservice_count = subservice_count + 1
                WHERE id = parent_service_id
    │
    ▼
Socket.io emits 'sub_service_created' + 'service_updated'
    │
    ▼
Frontend updates both views
```

### Linking Assets
```
User Action: Click "Link" on asset
    │
    ▼
Frontend updates asset.linked_service_ids
    │
    ▼
PUT /api/v1/content/:id
    │
    ▼
Content Controller
    │
    ├─ Add service_id to linked_service_ids array
    ├─ Update asset record
    │
    ▼
UPDATE content_repository
    │
    ▼
Frontend updates service.asset_count
    │
    ▼
PUT /api/v1/services/:id
    │
    ▼
UPDATE services SET asset_count = (SELECT COUNT(*) FROM content_repository 
                                    WHERE service_id IN linked_service_ids)
    │
    ▼
Socket.io emits updates
    │
    ▼
Both views refresh
```

### AI Suggestions Flow
```
User clicks "AI Suggest"
    │
    ▼
Frontend sends request to Gemini API
    │
    ├─ Prompt: "Generate content for service: {service_name}"
    ├─ Context: Parent service, industry, description
    │
    ▼
Gemini AI processes
    │
    ▼
Returns JSON:
    {
      "h1": "...",
      "h2s": ["...", "..."],
      "h3s": ["...", "..."],
      "meta_title": "...",
      "meta_description": "...",
      "focus_keywords": ["...", "..."],
      "faqs": [{"question": "...", "answer": "..."}]
    }
    │
    ▼
Frontend populates form fields
    │
    ▼
User reviews and edits
    │
    ▼
User clicks "Save Changes"
    │
    ▼
Normal save flow (POST/PUT)
```

## 🎨 UI Component Hierarchy

```
ServiceMasterView
│
├─ Header
│  ├─ Title & Description
│  ├─ Export CSV Button
│  └─ Create Service Button
│
├─ Filters
│  ├─ Search Input
│  └─ Status Dropdown
│
├─ Table Component
│  ├─ Column Headers (sortable)
│  ├─ Data Rows
│  │  ├─ Service Name (with tagline)
│  │  ├─ Service Code
│  │  ├─ Slug
│  │  ├─ Status Badge
│  │  ├─ Sub-Service Count
│  │  ├─ Asset Count
│  │  └─ Updated Date
│  └─ Action Buttons (Edit, Delete)
│
└─ Form Overlay (when editing/creating)
   │
   ├─ Header
   │  ├─ Close Button
   │  ├─ Title (Edit/Create)
   │  ├─ Discard Button
   │  └─ Save Button
   │
   ├─ Tab Navigation (9 tabs)
   │  ├─ 💎 Core
   │  ├─ 🧭 Navigation
   │  ├─ 🎯 Strategic
   │  ├─ 📝 Content
   │  ├─ 🔍 SEO
   │  ├─ 📢 SMM
   │  ├─ ⚙️ Technical
   │  ├─ 🔗 Linking
   │  └─ ⚖️ Governance
   │
   └─ Tab Content (scrollable)
      │
      ├─ Core Tab
      │  ├─ Section: Core Identification
      │  │  ├─ Service Name Input (required)
      │  │  ├─ Service Code Input
      │  │  ├─ Slug Input (auto-generated)
      │  │  ├─ Full URL Display (with Copy button)
      │  │  ├─ Menu Heading Input
      │  │  ├─ Short Tagline Input
      │  │  ├─ Description Textarea
      │  │  ├─ Status Dropdown
      │  │  ├─ Language Dropdown
      │  │  └─ AI Suggest Button
      │  └─ Section: Master Integrations
      │     ├─ Industry Checkboxes (scrollable)
      │     └─ Country Checkboxes (scrollable)
      │
      ├─ Navigation Tab
      │  ├─ Menu Settings
      │  │  ├─ Show in Main Menu Checkbox
      │  │  ├─ Show in Footer Menu Checkbox
      │  │  ├─ Menu Group Input
      │  │  ├─ Menu Position Input
      │  │  └─ Breadcrumb Label Input
      │  └─ Sitemap Settings
      │     ├─ Include in Sitemap Checkbox
      │     ├─ Priority Input (0.0-1.0)
      │     └─ Change Frequency Dropdown
      │
      ├─ Strategic Tab
      │  ├─ Content Type Dropdown
      │  ├─ Buyer Journey Dropdown
      │  ├─ Primary Persona Dropdown
      │  ├─ Form Dropdown
      │  ├─ Primary CTA Label Input
      │  ├─ Primary CTA URL Input
      │  └─ Target Segment Notes Textarea
      │
      ├─ Content Tab
      │  ├─ H1 Input
      │  ├─ H2 List (add/remove)
      │  ├─ H3 List (add/remove)
      │  └─ Body Content Textarea
      │
      ├─ SEO Tab
      │  ├─ Meta Title Input (with char count)
      │  ├─ Meta Description Textarea (with char count)
      │  ├─ Focus Keywords List (with metrics)
      │  └─ Secondary Keywords List
      │
      ├─ SMM Tab
      │  ├─ Open Graph Section
      │  ├─ Twitter Section
      │  ├─ LinkedIn Section
      │  ├─ Facebook Section
      │  └─ Instagram Section
      │
      ├─ Technical Tab
      │  ├─ Robots Index Dropdown
      │  ├─ Robots Follow Dropdown
      │  ├─ Schema Type Dropdown
      │  ├─ Canonical URL Input
      │  └─ FAQ Section (enable/add/remove)
      │
      ├─ Linking Tab
      │  ├─ Sub-Services List (read-only)
      │  └─ Assets Section
      │     ├─ Linked Assets List (with unlink)
      │     ├─ Asset Search Input
      │     └─ Available Assets List (with link)
      │
      └─ Governance Tab
         ├─ Brand Dropdown
         ├─ Content Owner Dropdown
         ├─ Business Unit Input
         ├─ Change Log Link Input
         └─ Metadata Display (read-only)
            ├─ Created Date/Time
            ├─ Updated Date/Time
            └─ Version Number
```

## 🔄 State Management Flow

```
Component State (useState)
│
├─ viewMode: 'list' | 'form'
├─ searchQuery: string
├─ statusFilter: string
├─ activeTab: 'Core' | 'Navigation' | ... (9 tabs)
├─ editingItem: Service | null
├─ isAiSuggesting: boolean
├─ copiedUrl: boolean
├─ assetSearch: string
├─ formData: Partial<Service>
└─ temp fields for lists (tempH2, tempKeyword, etc.)
│
▼
useData Hook (custom)
│
├─ data: Service[]
├─ create: (item) => Promise<void>
├─ update: (id, item) => Promise<void>
└─ remove: (id) => Promise<void>
│
▼
API Calls (fetch)
│
├─ GET /api/v1/services
├─ POST /api/v1/services
├─ PUT /api/v1/services/:id
└─ DELETE /api/v1/services/:id
│
▼
Socket.io Events
│
├─ 'service_created' → Update list
├─ 'service_updated' → Update list
└─ 'service_deleted' → Remove from list
│
▼
UI Re-renders
```

## 📦 File Structure

```
project-root/
│
├─ backend/
│  ├─ schema.sql                    ✅ Database schema
│  ├─ controllers/
│  │  └─ serviceController.ts       ✅ Service CRUD logic
│  ├─ routes/
│  │  └─ api.ts                     ✅ API endpoints
│  └─ config/
│     └─ db.ts                      ✅ Database connection
│
├─ views/
│  ├─ ServiceMasterView.tsx         ✅ Service Master UI
│  └─ SubServiceMasterView.tsx      ✅ Sub-Service Master UI
│
├─ types.ts                         ✅ TypeScript interfaces
│
├─ App.tsx                          ✅ Route registration
│
└─ Documentation/
   ├─ SERVICE_MASTER_ARCHITECTURE.md      ✅ Architecture guide
   ├─ SERVICE_MASTER_UI_GUIDE.md          ✅ UI specifications
   ├─ SERVICE_MASTER_TEST_GUIDE.md        ✅ Testing scenarios
   ├─ SERVICE_MASTER_SUMMARY.md           ✅ Implementation summary
   ├─ QUICK_START_SERVICE_MASTER.md       ✅ Quick start guide
   └─ SERVICE_MASTER_VISUAL_DIAGRAM.md    ✅ This file
```

---

**Visual Diagram Complete!** 🎨

This diagram shows:
- ✅ Complete system architecture
- ✅ Database relationships
- ✅ Data flow for all operations
- ✅ UI component hierarchy
- ✅ State management flow
- ✅ File structure

**Use this for:** Understanding the big picture, onboarding new developers, system documentation
