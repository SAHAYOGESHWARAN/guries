# Service Master Updates - Implementation Plan
## Date: December 5, 2025

## 🎯 Priority Updates Required

### 1. UI Improvements ✅
- [x] Standardize font across platform (use system font stack)
- [x] Reduce font size for cleaner appearance
- [ ] Make description box larger and horizontal
- [ ] Remove pop-ups, use full-frame mode

### 2. Missing Fields by Tab

#### 💎 Core Tab
- [x] Service Name, Code, Slug, Full URL
- [x] Menu Heading, Short Tagline
- [ ] **Description box - Make LARGER and HORIZONTAL**
- [x] Status, Language
- [x] Industry IDs, Country IDs

#### 🧭 Navigation Tab
- [x] Show in Main Menu, Show in Footer Menu
- [x] Menu Group, Menu Position
- [x] Breadcrumb Label
- [ ] **MISSING: Parent Menu Section** ❌
- [x] Include in XML Sitemap
- [x] Sitemap Priority, Change Frequency

#### 🎯 Strategic Tab
- [ ] **MISSING: Content Type Dropdown** ❌
- [x] Buyer Journey Stage
- [x] Primary Persona ID
- [ ] **MISSING: Secondary Persona IDs** ❌
- [x] Target Segment Notes
- [x] Primary CTA Label, Primary CTA URL
- [x] Form ID
- [ ] **MISSING: Linked Campaign IDs** ❌

#### 📝 Content Tab
- [x] H1
- [x] H2 List
- [x] H3 List
- [ ] **MISSING: H4 List** ❌
- [ ] **MISSING: H5 List** ❌
- [ ] **MISSING: Body Content** ❌
- [ ] **MISSING: Internal Links** ❌
- [ ] **MISSING: External Links** ❌
- [ ] **MISSING: Image Alt Texts** ❌
- [ ] **MISSING: Word Count** ❌
- [ ] **MISSING: Reading Time Minutes** ❌

#### 🔍 SEO Tab
- [x] Meta Title, Meta Description
- [x] Focus Keywords
- [x] Secondary Keywords
- [ ] **MISSING: SEO Score** ❌
- [ ] **MISSING: Ranking Summary** ❌

#### 📢 SMM Tab
- [x] Open Graph (Title, Description, Image, Type)
- [x] Twitter (Title, Description, Image)
- [x] LinkedIn (Title, Description, Image)
- [x] Facebook (Title, Description, Image)
- [x] Instagram (Title, Description, Image)

#### ⚙️ Technical Tab
- [x] Robots Index, Robots Follow
- [x] Schema Type ID
- [x] Canonical URL
- [ ] **MISSING: Redirect From URLs** ❌
- [ ] **MISSING: Hreflang Group ID** ❌
- [ ] **MISSING: Include in Sitemap** ❌ (duplicate check)
- [ ] **MISSING: Core Web Vitals Status** ❌
- [ ] **MISSING: Tech SEO Status** ❌
- [ ] **MISSING: Sitemap Priority** ❌ (duplicate check)
- [x] FAQ Section Enabled, FAQ Content

#### 🔗 Linking Tab
- [x] Sub-Services List (read-only)
- [ ] **BROKEN: Asset Linking** ❌
- [ ] Need clear UI for adding/viewing linked assets

#### ⚖️ Governance Tab
- [ ] **MISSING: Brand Display** ❌
- [x] Content Owner ID
- [x] Business Unit
- [x] Change Log Link
- [ ] **MISSING: Created By** ❌
- [ ] **MISSING: Created At** ❌
- [ ] **MISSING: Updated By** ❌
- [ ] **MISSING: Updated At** ❌
- [ ] **MISSING: Version Number** ❌

### 3. Functionality Issues

#### Asset Linking
- [ ] Fix asset linking functionality
- [ ] Clear UI for "Add Asset" button
- [ ] Show linked assets with unlink option
- [ ] Display asset count

#### Usage Metrics
- [ ] Auto-populate keyword usage count
- [ ] Show how many times keyword is used
- [ ] Display asset count
- [ ] Show sub-service count

#### Master Table Integration
- [x] Industry IDs → Industry Master
- [x] Country IDs → Country Master
- [x] Persona IDs → Persona Master
- [x] Form IDs → Form Master
- [x] Brand ID → Brand Master
- [x] User IDs → User Master
- [ ] Campaign IDs → Campaign Master (need to add)

### 4. Data Consistency
- [ ] Ensure all fields save properly
- [ ] Test workflow end-to-end
- [ ] Verify database schema matches UI
- [ ] Check all dropdowns work

## 📋 Implementation Checklist

### Phase 1: Critical Missing Fields (Priority 1)
1. [ ] Add Parent Menu Section to Navigation tab
2. [ ] Add Content Type Dropdown to Strategic tab
3. [ ] Add Secondary Persona IDs to Strategic tab
4. [ ] Add Linked Campaign IDs to Strategic tab
5. [ ] Add H4 List to Content tab
6. [ ] Add H5 List to Content tab
7. [ ] Add Body Content to Content tab
8. [ ] Add Internal Links to Content tab
9. [ ] Add External Links to Content tab
10. [ ] Add Image Alt Texts to Content tab
11. [ ] Add Word Count to Content tab
12. [ ] Add Reading Time Minutes to Content tab

### Phase 2: SEO & Technical Fields (Priority 2)
13. [ ] Add SEO Score to SEO tab
14. [ ] Add Ranking Summary to SEO tab
15. [ ] Add Redirect From URLs to Technical tab
16. [ ] Add Hreflang Group ID to Technical tab
17. [ ] Add Core Web Vitals Status to Technical tab
18. [ ] Add Tech SEO Status to Technical tab

### Phase 3: Governance & Metadata (Priority 3)
19. [ ] Fix Brand Display in Governance tab
20. [ ] Add Created By to Governance tab
21. [ ] Add Created At to Governance tab
22. [ ] Add Updated By to Governance tab
23. [ ] Add Updated At to Governance tab
24. [ ] Add Version Number to Governance tab

### Phase 4: Asset Linking (Priority 4)
25. [ ] Fix asset linking functionality
26. [ ] Add clear "Link Asset" button
27. [ ] Show linked assets list
28. [ ] Add unlink functionality
29. [ ] Display asset count

### Phase 5: UI Improvements (Priority 5)
30. [ ] Make description box larger and horizontal
31. [ ] Standardize font sizes (reduce to 13px/14px)
32. [ ] Add tooltips to all fields
33. [ ] Improve spacing and layout
34. [ ] Remove pop-ups, use full-frame

### Phase 6: Usage Metrics (Priority 6)
35. [ ] Auto-populate keyword usage count
36. [ ] Show asset usage metrics
37. [ ] Display sub-service count
38. [ ] Add campaign usage count

## 🎨 UI Standards

### Font Sizes
- **Headers**: 14px bold
- **Labels**: 11px bold uppercase
- **Input Text**: 13px regular
- **Helper Text**: 11px regular
- **Buttons**: 13px bold

### Colors
- **Primary**: Indigo-600 (#4F46E5)
- **Text**: Slate-700 (#334155)
- **Labels**: Slate-600 (#475569)
- **Borders**: Slate-200 (#E2E8F0)
- **Background**: Slate-50 (#F8FAFC)

### Spacing
- **Section Padding**: 24px (p-6)
- **Field Gap**: 16px (gap-4)
- **Input Padding**: 12px (p-3)

## 🔧 Technical Implementation

### Form Data Structure
```typescript
const [formData, setFormData] = useState<Partial<Service>>({
  // Core
  service_name: '',
  service_code: '',
  slug: '',
  full_url: '',
  menu_heading: '',
  short_tagline: '',
  service_description: '', // Make larger
  status: 'Draft',
  language: 'en',
  industry_ids: [],
  country_ids: [],
  
  // Navigation
  show_in_main_menu: false,
  show_in_footer_menu: false,
  menu_group: '',
  menu_position: 0,
  breadcrumb_label: '',
  parent_menu_section: '', // ADD THIS
  include_in_xml_sitemap: true,
  sitemap_priority: 0.8,
  sitemap_changefreq: 'monthly',
  
  // Strategic
  content_type: 'Pillar', // ADD DROPDOWN
  buyer_journey_stage: 'Awareness',
  primary_persona_id: 0,
  secondary_persona_ids: [], // ADD THIS
  target_segment_notes: '',
  primary_cta_label: '',
  primary_cta_url: '',
  form_id: 0,
  linked_campaign_ids: [], // ADD THIS
  
  // Content
  h1: '',
  h2_list: [],
  h3_list: [],
  h4_list: [], // ADD THIS
  h5_list: [], // ADD THIS
  body_content: '', // ADD THIS
  internal_links: [], // ADD THIS
  external_links: [], // ADD THIS
  image_alt_texts: [], // ADD THIS
  word_count: 0, // ADD THIS
  reading_time_minutes: 0, // ADD THIS
  
  // SEO
  meta_title: '',
  meta_description: '',
  focus_keywords: [],
  secondary_keywords: [],
  seo_score: 0, // ADD THIS
  ranking_summary: '', // ADD THIS
  
  // SMM (all present)
  
  // Technical
  robots_index: 'index',
  robots_follow: 'follow',
  schema_type_id: 'Service',
  canonical_url: '',
  redirect_from_urls: [], // ADD THIS
  hreflang_group_id: 0, // ADD THIS
  core_web_vitals_status: '', // ADD THIS
  tech_seo_status: '', // ADD THIS
  faq_section_enabled: false,
  faq_content: [],
  
  // Linking (fix functionality)
  
  // Governance
  brand_id: 0, // FIX DISPLAY
  business_unit: '',
  content_owner_id: 0,
  created_by: 0, // ADD THIS
  created_at: '', // ADD THIS
  updated_by: 0, // ADD THIS
  updated_at: '', // ADD THIS
  version_number: 1, // ADD THIS
  change_log_link: ''
});
```

## 📊 Testing Plan

### Test Each Tab
1. **Core**: All fields save, description is large
2. **Navigation**: Parent menu section works
3. **Strategic**: All dropdowns work, multi-selects work
4. **Content**: All lists work, body content saves
5. **SEO**: Scores display, summary saves
6. **SMM**: All platforms save correctly
7. **Technical**: All status fields work
8. **Linking**: Assets link/unlink properly
9. **Governance**: All metadata displays

### Test Workflows
1. Create new service → All fields save
2. Edit existing service → All fields load
3. Link assets → Count updates
4. Add sub-services → Count updates
5. Use keywords → Usage count updates

## 🚀 Deployment Steps

1. Update database schema (if needed)
2. Update types.ts with new fields
3. Update ServiceMasterView.tsx
4. Update SubServiceMasterView.tsx
5. Update backend controller
6. Test all functionality
7. Deploy to production

---

**Status**: Planning Complete
**Next**: Begin Phase 1 Implementation
**Priority**: Critical Missing Fields First
