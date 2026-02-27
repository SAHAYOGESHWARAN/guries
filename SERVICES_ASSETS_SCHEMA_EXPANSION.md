# Services & Assets Module - Comprehensive Schema Expansion

## Overview
This document outlines the comprehensive database schema expansion to ensure all variables from the Figma design are properly stored in the database and correctly linked with each other.

## Problem Statement
The Services and Assets modules were not properly storing all fields from the frontend interfaces. The database schema was missing ~70 columns for services and ~40 columns for assets, causing data loss when users submitted forms.

## Solution Implemented

### 1. Services Table Expansion
**File**: `backend/database/schema.sql`, `backend/config/db.ts`, `backend/database/init.ts`

Added the following field categories to the services table:

#### A. Identity & Core Details
- `full_url` - Complete URL path for the service
- `menu_heading` - Menu display heading
- `short_tagline` - Brief service tagline
- `service_description` - Detailed service description
- `industry_ids` - JSON array of industry IDs
- `country_ids` - JSON array of country IDs
- `language` - Service language (default: 'en')

#### B. Navigation Fields
- `show_in_main_menu` - Boolean flag for main menu visibility
- `show_in_footer_menu` - Boolean flag for footer menu visibility
- `menu_group` - Menu grouping/category
- `menu_position` - Position in menu (integer)
- `breadcrumb_label` - Custom breadcrumb label
- `parent_menu_section` - Parent menu section reference
- `include_in_xml_sitemap` - Sitemap inclusion flag
- `sitemap_priority` - Sitemap priority (0.0-1.0)
- `sitemap_changefreq` - Change frequency (daily, weekly, monthly, yearly)

#### C. Strategic Mapping
- `content_type` - Content classification (Pillar, Cluster, Landing, Blog, Case Study, Sales Page)
- `category` - Service category
- `buyer_journey_stage` - Buyer journey stage (Awareness, Consideration, Decision, Retention)
- `primary_persona_id` - Primary target persona ID
- `secondary_persona_ids` - JSON array of secondary persona IDs
- `target_segment_notes` - Target segment notes
- `primary_cta_label` - Primary call-to-action label
- `primary_cta_url` - Primary CTA URL
- `form_id` - Associated form ID
- `linked_campaign_ids` - JSON array of linked campaign IDs

#### D. Technical SEO
- `schema_type_id` - Schema.org type ID
- `robots_index` - Robots index directive (index/noindex)
- `robots_follow` - Robots follow directive (follow/nofollow)
- `robots_custom` - Custom robots meta tags
- `canonical_url` - Canonical URL
- `redirect_from_urls` - JSON array of redirect source URLs
- `hreflang_group_id` - Hreflang group ID
- `core_web_vitals_status` - Core Web Vitals status (Good, Needs Improvement, Poor)
- `tech_seo_status` - Technical SEO status (Ok, Warning, Critical)
- `faq_section_enabled` - FAQ section flag
- `faq_content` - JSON array of FAQ items

#### E. Content Block
- `h1` - H1 heading
- `h2_list` - JSON array of H2 headings
- `h3_list` - JSON array of H3 headings
- `h4_list` - JSON array of H4 headings
- `h5_list` - JSON array of H5 headings
- `body_content` - Main body content
- `internal_links` - JSON array of internal links
- `external_links` - JSON array of external links
- `image_alt_texts` - JSON array of image alt texts
- `word_count` - Content word count
- `reading_time_minutes` - Estimated reading time

#### F. SEO Metadata
- `meta_keywords` - JSON array of meta keywords
- `focus_keywords` - JSON array of focus keywords
- `secondary_keywords` - JSON array of secondary keywords
- `seo_score` - SEO score (0-100)
- `ranking_summary` - Ranking summary text

#### G. SMM / Social Meta
- `og_title` - Open Graph title
- `og_description` - Open Graph description
- `og_image_url` - Open Graph image URL
- `og_type` - Open Graph type (article, website, product)
- `twitter_title` - Twitter card title
- `twitter_description` - Twitter card description
- `twitter_image_url` - Twitter card image URL
- `linkedin_title` - LinkedIn title
- `linkedin_description` - LinkedIn description
- `linkedin_image_url` - LinkedIn image URL
- `facebook_title` - Facebook title
- `facebook_description` - Facebook description
- `facebook_image_url` - Facebook image URL
- `instagram_title` - Instagram title
- `instagram_description` - Instagram description
- `instagram_image_url` - Instagram image URL
- `social_meta` - JSON object with per-channel social metadata

#### H. Linking
- `has_subservices` - Boolean flag for subservices
- `subservice_count` - Count of subservices
- `primary_subservice_id` - Primary subservice ID
- `featured_asset_id` - Featured asset ID
- `asset_count` - Count of linked assets
- `knowledge_topic_id` - Knowledge topic ID
- `linked_insights_ids` - JSON array of insight IDs
- `linked_assets_ids` - JSON array of asset IDs

#### I. Ownership & Governance
- `brand_id` - Associated brand ID
- `business_unit` - Business unit
- `content_owner_id` - Content owner user ID
- `created_by` - Creator user ID
- `updated_by` - Last updater user ID
- `version_number` - Version number
- `change_log_link` - Change log link

### 2. Sub-Services Table Expansion
**File**: `backend/database/schema.sql`, `backend/database/init.ts`

Applied the same comprehensive field expansion to sub_services table with all categories A-I listed above, plus:
- `assets_linked` - Count of linked assets
- `working_on_by` - User currently working on this sub-service

### 3. Assets Table Expansion
**File**: `backend/database/schema.sql`, `backend/config/db.ts`, `backend/database/init.ts`

Added comprehensive fields for asset management:

#### Core Asset Fields
- `name` - Asset name (alternative field)
- `type` - Asset type (alternative field)
- `content_type` - Content classification
- `repository` - Repository name
- `workflow_stage` - Workflow stage (Add, In Progress, Sent to QC, Published, In Rework, Moved to CW, Moved to GD, Moved to WD)

#### QC & Scoring
- `qc_checklist_items` - JSON array of QC checklist items
- `seo_score` - SEO score (0-100)
- `grammar_score` - Grammar score (0-100)
- `ai_plagiarism_score` - AI plagiarism score (0-100)

#### Workflow & Versioning
- `date` - Asset date
- `linked_task` - Linked task ID
- `owner_id` - Asset owner ID
- `version_number` - Version number (text format)
- `published_at` - Publication timestamp

#### Linking & Mapping
- `linked_page_ids` - JSON array of linked page IDs
- `mapped_to` - Display string for mapping
- `usage_count` - Number of times asset has been used

#### Web Application Fields
- `web_body_attachment` - Base64 or URL for attached file
- `web_body_attachment_name` - Original filename for attachment

#### SMM Application Fields
- `smm_additional_pages` - JSON array for carousel posts
- `smm_post_type` - Type of post (image, video, carousel, story, reel)
- `smm_campaign_type` - Campaign type (awareness, engagement, traffic, conversions, lead-generation)
- `smm_cta` - Call to action text
- `smm_target_audience` - Target audience description
- `smm_content_type` - SMM content type
- `smm_caption` - SMM post caption
- `smm_scheduled_date` - Scheduled post date

#### SEO Application Fields
- `seo_target_url` - Target URL for SEO
- `seo_focus_keyword` - Primary focus keyword
- `seo_content_type` - Content type (blog-post, landing-page, product-page, etc.)
- `seo_content_description` - Content description
- `seo_h1` - H1 heading
- `seo_h2_1` - First H2 heading
- `seo_h2_2` - Second H2 heading
- `seo_content_body` - Content body

### 4. Migration Script
**File**: `backend/migrations/add-comprehensive-service-fields.sql`

Created a comprehensive SQL migration script that uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for all new fields. This allows safe application to existing databases without data loss.

## Database Initialization Files Updated

1. **backend/config/db.ts** - PostgreSQL initialization for new deployments
   - Updated services table with all 90+ columns
   - Updated assets table with all 100+ columns

2. **backend/database/init.ts** - SQLite initialization for development
   - Updated services table with all 90+ columns
   - Updated sub_services table with all 90+ columns
   - Updated assets table with all 100+ columns

3. **backend/database/schema.sql** - PostgreSQL schema reference
   - Updated services table with all 90+ columns
   - Updated sub_services table with all 90+ columns
   - Updated assets table with all 100+ columns

## Data Persistence Verification

The `createService()` and `createSubService()` functions in `backend/controllers/serviceController.ts` already handle all these fields correctly:
- They extract all fields from the request body
- They insert all fields into the database
- They use JSON serialization for array fields (industry_ids, country_ids, h2_list, etc.)
- They use proper defaults for optional fields

## Asset-Service Linking

The existing linking tables ensure proper relationships:
- `service_asset_links` - Links assets to services
- `subservice_asset_links` - Links assets to sub-services
- `keyword_asset_links` - Links assets to keywords

These tables have proper foreign key constraints and unique constraints to prevent duplicate links.

## Next Steps for Testing

1. **Database Migration**: Run the migration script on existing databases
   ```bash
   psql -U user -d database -f backend/migrations/add-comprehensive-service-fields.sql
   ```

2. **Create Service Test**: Submit a service with all fields and verify all are saved
3. **Create Asset Test**: Submit an asset with all fields and verify all are saved
4. **Link Asset Test**: Link an asset to a service and verify it displays correctly
5. **Update Test**: Update a service/asset and verify all fields are persisted

## Files Modified

1. `backend/database/schema.sql` - Services, sub_services, and assets tables
2. `backend/config/db.ts` - PostgreSQL initialization
3. `backend/database/init.ts` - SQLite initialization
4. `backend/migrations/add-comprehensive-service-fields.sql` - Migration script (new)

## Backward Compatibility

All changes are backward compatible:
- New columns have default values
- Existing data is not modified
- The migration script uses `IF NOT EXISTS` to prevent errors on re-runs
- All new columns are optional in the application logic
