# Service Data Structure - Complete Reference

## Overview
This document describes the complete data structure for services in the system, showing all fields and their purposes.

## Service Object Structure

```typescript
interface Service {
  // Identity & Core Details
  id: number;
  service_name: string;              // "SEO Optimization"
  service_code: string;              // "SEO-001"
  slug: string;                      // "seo-optimization"
  full_url: string;                  // "/services/seo-optimization"
  status: string;                    // "Published", "Draft", "In Progress", etc.
  language: string;                  // "en"

  // Navigation & Menu
  menu_heading: string;              // "SEO Services"
  short_tagline: string;             // "Boost your online visibility"
  show_in_main_menu: number;         // 1 or 0
  show_in_footer_menu: number;       // 1 or 0
  menu_group: string;                // Optional menu grouping
  menu_position: number;             // Position in menu
  breadcrumb_label: string;          // Label for breadcrumbs
  parent_menu_section: string;       // Parent section if nested

  // Content & Description
  service_description: string;       // Full description
  h1: string;                        // Main heading
  h2_list: string[];                 // Subheadings
  h3_list: string[];                 // Sub-subheadings
  h4_list: string[];                 // Additional headings
  h5_list: string[];                 // Additional headings
  body_content: string;              // Main content

  // SEO & Metadata
  meta_title: string;                // "SEO Optimization Services | Expert Solutions"
  meta_description: string;          // "Improve your search rankings..."
  meta_keywords: string[];           // ["seo", "optimization", "ranking"]
  focus_keywords: string[];          // Primary keywords
  secondary_keywords: string[];      // Secondary keywords
  seo_score: number;                 // 0-100
  ranking_summary: string;           // Summary of rankings

  // Classification
  content_type: string;              // "Pillar", "Cluster", "Landing", etc.
  category: string;                  // Optional category
  buyer_journey_stage: string;       // "Awareness", "Consideration", "Decision", "Retention"
  industry_ids: string[];            // JSON array of industry IDs
  country_ids: string[];             // JSON array of country IDs

  // Social Media Metadata
  og_title: string;                  // Open Graph title
  og_description: string;            // Open Graph description
  og_image_url: string;              // Open Graph image
  og_type: string;                   // "website", "article", "product"
  twitter_title: string;             // Twitter card title
  twitter_description: string;       // Twitter card description
  twitter_image_url: string;         // Twitter card image
  linkedin_title: string;            // LinkedIn title
  linkedin_description: string;      // LinkedIn description
  linkedin_image_url: string;        // LinkedIn image
  facebook_title: string;            // Facebook title
  facebook_description: string;      // Facebook description
  facebook_image_url: string;        // Facebook image
  instagram_title: string;           // Instagram title
  instagram_description: string;     // Instagram description
  instagram_image_url: string;       // Instagram image
  social_meta: object;               // Structured social metadata

  // Technical SEO
  robots_index: string;              // "index" or "noindex"
  robots_follow: string;             // "follow" or "nofollow"
  robots_custom: string;             // Custom robots directives
  canonical_url: string;             // Canonical URL
  redirect_from_urls: string[];      // URLs that redirect here
  hreflang_group_id: number;         // Hreflang group ID
  core_web_vitals_status: string;    // "Good", "Needs Improvement", "Poor"
  tech_seo_status: string;           // "Ok", "Warning", "Critical"
  include_in_xml_sitemap: number;    // 1 or 0
  sitemap_priority: number;          // 0.0-1.0
  sitemap_changefreq: string;        // "daily", "weekly", "monthly", "yearly"

  // Content Structure
  faq_section_enabled: number;       // 1 or 0
  faq_content: object[];             // FAQ items
  internal_links: object[];          // Internal links
  external_links: object[];          // External links
  image_alt_texts: object[];         // Image alt text mappings
  word_count: number;                // Total word count
  reading_time_minutes: number;      // Estimated reading time

  // Linking & Relationships
  has_subservices: number;           // 1 or 0
  subservice_count: number;          // Count of sub-services
  primary_subservice_id: number;     // Primary sub-service
  featured_asset_id: number;         // Featured asset
  asset_count: number;               // Count of linked assets
  knowledge_topic_id: number;        // Linked knowledge topic
  linked_insights_ids: string[];     // JSON array of insight IDs
  linked_assets_ids: string[];       // JSON array of asset IDs

  // Governance & Ownership
  brand_id: number;                  // Associated brand
  business_unit: string;             // Business unit/sector
  content_owner_id: number;          // Content owner user ID
  created_by: number;                // Creator user ID
  updated_by: number;                // Last updater user ID
  version_number: number;            // Version number
  change_log_link: string;           // Link to change log

  // Strategic Mapping
  primary_persona_id: number;        // Primary target persona
  secondary_persona_ids: string[];   // JSON array of secondary personas
  target_segment_notes: string;      // Notes on target segment
  primary_cta_label: string;         // CTA button label
  primary_cta_url: string;           // CTA button URL
  form_id: number;                   // Associated form
  linked_campaign_ids: string[];     // JSON array of campaign IDs

  // Timestamps
  created_at: string;                // ISO 8601 timestamp
  updated_at: string;                // ISO 8601 timestamp
}
```

## Sample Service Data

### SEO Optimization Service
```json
{
  "id": 1,
  "service_name": "SEO Optimization",
  "service_code": "SEO-001",
  "slug": "seo-optimization",
  "full_url": "/services/seo-optimization",
  "menu_heading": "SEO Services",
  "short_tagline": "Boost your online visibility",
  "service_description": "Comprehensive SEO services to improve your search rankings",
  "status": "Published",
  "language": "en",
  "show_in_main_menu": 1,
  "show_in_footer_menu": 0,
  "include_in_xml_sitemap": 1,
  "h1": "Professional SEO Optimization Services",
  "meta_title": "SEO Optimization Services | Expert Solutions",
  "meta_description": "Improve your search rankings with our professional SEO services",
  "content_type": "Pillar",
  "buyer_journey_stage": "Awareness",
  "industry_ids": "[]",
  "country_ids": "[]",
  "linked_assets_ids": "[]",
  "linked_insights_ids": "[]",
  "created_at": "2026-02-03T10:00:00Z",
  "updated_at": "2026-02-03T10:00:00Z"
}
```

## Field Categories

### Display Fields (Shown in Table)
- service_name
- service_code
- status
- industry_ids
- business_unit
- content_type
- buyer_journey_stage
- updated_at

### Content Fields (Used in Forms)
- h1, h2_list, h3_list, h4_list, h5_list
- body_content
- meta_title, meta_description
- focus_keywords, secondary_keywords

### Navigation Fields (Menu Configuration)
- menu_heading
- show_in_main_menu
- show_in_footer_menu
- menu_group
- menu_position

### Social Fields (Social Media)
- og_title, og_description, og_image_url
- twitter_title, twitter_description, twitter_image_url
- linkedin_title, linkedin_description, linkedin_image_url
- facebook_title, facebook_description, facebook_image_url
- instagram_title, instagram_description, instagram_image_url

### Technical Fields (SEO & Performance)
- robots_index, robots_follow
- canonical_url
- core_web_vitals_status
- tech_seo_status
- sitemap_priority, sitemap_changefreq

### Relationship Fields (Linking)
- linked_assets_ids
- linked_insights_ids
- linked_campaign_ids
- subservice_count
- asset_count

## Data Types

| Type | Examples | Storage |
|------|----------|---------|
| String | service_name, slug, status | TEXT |
| Number | id, word_count, seo_score | INTEGER |
| Boolean | show_in_main_menu (1/0) | INTEGER |
| Array (JSON) | industry_ids, focus_keywords | TEXT (JSON string) |
| Object (JSON) | social_meta, faq_content | TEXT (JSON string) |
| Timestamp | created_at, updated_at | DATETIME |

## JSON Fields (Stored as Strings)

These fields are stored as JSON strings and parsed by the backend:

```typescript
// Array fields
industry_ids: "[]" or "[1, 2, 3]"
country_ids: "[]" or "[1, 2]"
focus_keywords: "[]" or "[\"seo\", \"optimization\"]"
linked_assets_ids: "[]" or "[1, 2, 3]"
linked_insights_ids: "[]" or "[1, 2]"

// Object fields
social_meta: "{}" or "{\"linkedin\": {...}, \"facebook\": {...}}"
faq_content: "[]" or "[{\"question\": \"...\", \"answer\": \"...\"}]"
```

## Default Values

When creating a new service, these fields have defaults:

```typescript
{
  language: "en",
  status: "Draft",
  show_in_main_menu: 0,
  show_in_footer_menu: 0,
  include_in_xml_sitemap: 1,
  sitemap_priority: 0.8,
  sitemap_changefreq: "monthly",
  og_type: "website",
  robots_index: "index",
  robots_follow: "follow",
  core_web_vitals_status: "Good",
  tech_seo_status: "Ok",
  content_type: "Pillar",
  buyer_journey_stage: "Awareness",
  version_number: 1,
  industry_ids: "[]",
  country_ids: "[]",
  focus_keywords: "[]",
  linked_assets_ids: "[]",
  linked_insights_ids: "[]",
  social_meta: "{}"
}
```

## API Response Format

When fetching services via `GET /api/v1/services`:

```json
[
  {
    "id": 1,
    "service_name": "SEO Optimization",
    "service_code": "SEO-001",
    // ... all other fields
  },
  {
    "id": 2,
    "service_name": "Content Marketing",
    "service_code": "CM-001",
    // ... all other fields
  }
]
```

## Validation Rules

| Field | Required | Validation |
|-------|----------|-----------|
| service_name | Yes | Non-empty string |
| service_code | No | Auto-generated if empty |
| slug | No | Auto-generated if empty |
| full_url | No | Auto-generated if empty |
| status | No | One of: Draft, In Progress, QC, Approved, Published, Archived |
| language | No | ISO 639-1 code (e.g., "en", "es") |
| content_type | No | One of: Pillar, Cluster, Landing, Blog, Case Study, Sales Page |
| buyer_journey_stage | No | One of: Awareness, Consideration, Decision, Retention |

## Usage in Frontend

### Accessing Service Data
```typescript
// In ServiceMasterView component
const { data: services } = useData<Service>('services');

// Display service name
services.map(service => (
  <div key={service.id}>
    {service.service_name} ({service.service_code})
  </div>
))
```

### Filtering Services
```typescript
// Filter by status
const publishedServices = services.filter(s => s.status === 'Published');

// Filter by content type
const pillarPages = services.filter(s => s.content_type === 'Pillar');

// Filter by journey stage
const awarenessServices = services.filter(s => s.buyer_journey_stage === 'Awareness');
```

### Calculating Metrics
```typescript
// Health score calculation
const healthScore = [
  service.service_name ? 15 : 0,
  service.service_code ? 10 : 0,
  service.slug ? 10 : 0,
  service.meta_title ? 15 : 0,
  service.meta_description ? 15 : 0,
  service.h1 ? 10 : 0,
  service.focus_keywords?.length ? 15 : 0,
  service.body_content ? 10 : 0
].reduce((a, b) => a + b, 0);
```
