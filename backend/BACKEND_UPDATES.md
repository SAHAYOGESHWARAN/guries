# Backend Updates for ServiceMasterView and SubServiceMasterView

## Overview
This document describes the backend files created/updated to support the comprehensive ServiceMasterView and SubServiceMasterView frontend components.

## Files Created/Modified

### 1. Database Migration
**File:** `backend/db/migrations/add_extended_fields_to_sub_services.sql`

This migration adds all missing fields to the `sub_services` table to match the capabilities of the frontend SubServiceMasterView component.

**New Fields Added:**
- **Core:** `menu_heading`, `short_tagline`, `language`, `industry_ids`, `country_ids`
- **Content:** `h4_list`, `h5_list`, `word_count`, `reading_time_minutes`
- **SEO:** `secondary_keywords`, `seo_score`, `ranking_summary`
- **SMM:** `twitter_title`, `twitter_description`, `twitter_image_url`, `og_type`
- **Technical:** `robots_custom`, `hreflang_group_id`, `core_web_vitals_status`, `tech_seo_status`, `redirect_from_urls`, `faq_section_enabled`, `faq_content`
- **Governance:** `created_by`, `created_at`, `updated_by`, `version_number`, `change_log_link`

### 2. Updated Schema
**File:** `backend/db/schema.sql`

Updated the `sub_services` table definition to include all new fields for fresh database setups.

### 3. Enhanced Controller
**File:** `backend/controllers/serviceController.ts`

#### Changes Made:

1. **Added `parseSubServiceRow` helper function**
   - Parses JSON fields from database responses
   - Handles: `industry_ids`, `country_ids`, `h2_list`, `h3_list`, `h4_list`, `h5_list`, `focus_keywords`, `secondary_keywords`, `redirect_from_urls`, `faq_content`

2. **Enhanced `getSubServices`**
   - Now uses `parseSubServiceRow` to properly parse JSON fields

3. **Completely rewritten `createSubService`**
   - Handles all 58+ fields from frontend
   - Includes URL normalization based on parent service slug
   - Auto-updates parent service subservice count
   - Proper JSON serialization for array fields
   - Socket.IO real-time updates

4. **Completely rewritten `updateSubService`**
   - Handles all extended fields
   - URL normalization
   - Parent service count updates
   - Proper JSON handling
   - Socket.IO real-time updates

## API Endpoints

The following endpoints are already registered in `backend/routes/api.ts`:

### Services
- `GET /api/v1/services` - List all services
- `POST /api/v1/services` - Create service
- `PUT /api/v1/services/:id` - Update service
- `DELETE /api/v1/services/:id` - Delete service

### Sub-Services
- `GET /api/v1/sub-services` - List all sub-services (with JSON parsing)
- `POST /api/v1/sub-services` - Create sub-service (supports all extended fields)
- `PUT /api/v1/sub-services/:id` - Update sub-service (supports all extended fields)
- `DELETE /api/v1/sub-services/:id` - Delete sub-service

## Field Mapping

### Core Fields
- `sub_service_name` (required)
- `parent_service_id` (required)
- `slug` (auto-generated from name)
- `full_url` (auto-generated from parent slug + sub-service slug)
- `menu_heading`
- `short_tagline`
- `language` (default: 'en')
- `industry_ids` (JSON array)
- `country_ids` (JSON array)

### Content Fields
- `h1`, `h2_list`, `h3_list`, `h4_list`, `h5_list` (JSON arrays)
- `body_content`
- `word_count`, `reading_time_minutes`

### SEO Fields
- `meta_title`, `meta_description`
- `focus_keywords`, `secondary_keywords` (JSON arrays)
- `seo_score`, `ranking_summary`

### SMM Fields
- `og_title`, `og_description`, `og_image_url`, `og_type`
- `twitter_title`, `twitter_description`, `twitter_image_url`

### Technical SEO Fields
- `robots_index`, `robots_follow`, `robots_custom`
- `canonical_url`, `schema_type_id`
- `redirect_from_urls` (JSON array)
- `hreflang_group_id`
- `core_web_vitals_status`, `tech_seo_status`
- `faq_section_enabled`, `faq_content` (JSON array)

### Navigation Fields
- `menu_position`
- `breadcrumb_label`
- `include_in_xml_sitemap`
- `sitemap_priority`, `sitemap_changefreq`

### Strategic Fields
- `content_type`
- `buyer_journey_stage`
- `primary_cta_label`, `primary_cta_url`

### Governance Fields
- `brand_id`, `content_owner_id`
- `created_by`, `created_at`
- `updated_by`, `updated_at`
- `version_number`, `change_log_link`

## Real-time Updates

Both services and sub-services use Socket.IO for real-time updates:
- `service_created`, `service_updated`, `service_deleted`
- `sub_service_created`, `sub_service_updated`, `sub_service_deleted`

## Database Setup

### For Existing Databases
Run the migration:
```sql
\i backend/db/migrations/add_extended_fields_to_sub_services.sql
```

### For Fresh Databases
The updated `schema.sql` includes all fields, so no migration is needed.

## Testing

To test the endpoints:

1. **Create a sub-service:**
```bash
curl -X POST http://localhost:3001/api/v1/sub-services \
  -H "Content-Type: application/json" \
  -d '{
    "sub_service_name": "Test Sub-Service",
    "parent_service_id": 1,
    "description": "Test description",
    "status": "Draft",
    "language": "en",
    "industry_ids": ["Healthcare"],
    "country_ids": ["US"]
  }'
```

2. **Update a sub-service:**
```bash
curl -X PUT http://localhost:3001/api/v1/sub-services/1 \
  -H "Content-Type: application/json" \
  -d '{
    "menu_heading": "Updated Heading",
    "focus_keywords": ["keyword1", "keyword2"]
  }'
```

3. **Get all sub-services:**
```bash
curl http://localhost:3001/api/v1/sub-services
```

## Notes

- All JSON array fields are automatically serialized/deserialized
- URL normalization ensures sub-services follow the pattern: `/services/{parent-slug}/{sub-service-slug}`
- Parent service `subservice_count` and `has_subservices` are automatically updated
- Timestamps (`created_at`, `updated_at`) are handled automatically
- Socket.IO events are emitted for all CRUD operations

