# Services & Assets Module - Testing Guide

## Quick Test Commands

### 1. Test Service Creation with All Fields

```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "Test Service",
    "service_code": "TEST-001",
    "slug": "test-service",
    "full_url": "/services/test-service",
    "menu_heading": "Test Service Menu",
    "short_tagline": "Quick test tagline",
    "service_description": "Detailed service description",
    "industry_ids": ["1", "2"],
    "country_ids": ["US", "UK"],
    "language": "en",
    "status": "Draft",
    "show_in_main_menu": true,
    "show_in_footer_menu": false,
    "menu_group": "Services",
    "menu_position": 1,
    "breadcrumb_label": "Test",
    "content_type": "Pillar",
    "buyer_journey_stage": "Awareness",
    "h1": "Main Heading",
    "h2_list": ["Heading 2.1", "Heading 2.2"],
    "h3_list": ["Heading 3.1"],
    "body_content": "Service body content here",
    "meta_title": "Test Service - SEO Title",
    "meta_description": "SEO description for test service",
    "focus_keywords": ["keyword1", "keyword2"],
    "og_title": "Test Service OG",
    "og_description": "OG description",
    "twitter_title": "Test Service Twitter",
    "linkedin_title": "Test Service LinkedIn",
    "brand_id": 1,
    "content_owner_id": 1,
    "created_by": 1
  }'
```

**Expected Response**: 201 Created with all fields saved

### 2. Test Asset Creation with All Fields

```bash
curl -X POST http://localhost:5000/api/assets/library \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Asset",
    "type": "Blog Banner",
    "asset_category": "Marketing",
    "asset_format": "image",
    "content_type": "Blog",
    "repository": "Content Repository",
    "status": "Draft",
    "workflow_stage": "Add",
    "file_url": "https://example.com/image.jpg",
    "thumbnail_url": "https://example.com/thumb.jpg",
    "file_size": 1024,
    "file_type": "jpg",
    "application_type": "web",
    "seo_score": 85,
    "grammar_score": 90,
    "ai_plagiarism_score": 95,
    "web_title": "Web Title",
    "web_description": "Web Description",
    "web_h1": "Web H1",
    "web_h2_1": "Web H2",
    "smm_platform": "facebook",
    "smm_title": "SMM Title",
    "smm_description": "SMM Description",
    "seo_title": "SEO Title",
    "seo_focus_keyword": "main keyword",
    "keywords": ["keyword1", "keyword2"],
    "created_by": 1,
    "submitted_by": 1
  }'
```

**Expected Response**: 201 Created with all fields saved

### 3. Test Asset-Service Linking

```bash
curl -X POST http://localhost:5000/api/asset-service-linking/link \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": 1,
    "service_id": 1,
    "link_type": "primary",
    "is_static": 1
  }'
```

**Expected Response**: 200 OK with link created

### 4. Verify Data Persistence

```bash
# Check service fields in database
curl -X GET http://localhost:5000/api/services/1

# Check asset fields in database
curl -X GET http://localhost:5000/api/assets/1

# Check linked assets for service
curl -X GET http://localhost:5000/api/services/1/linked-assets
```

**Expected Response**: All fields returned in response

## Database Verification Queries

### Check Services Table Columns

```sql
-- PostgreSQL
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'services' 
ORDER BY ordinal_position;

-- SQLite
PRAGMA table_info(services);
```

### Check Assets Table Columns

```sql
-- PostgreSQL
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'assets' 
ORDER BY ordinal_position;

-- SQLite
PRAGMA table_info(assets);
```

### Verify Asset-Service Links

```sql
SELECT * FROM service_asset_links WHERE asset_id = 1;
SELECT * FROM subservice_asset_links WHERE asset_id = 1;
```

## Manual Testing Workflow

### Step 1: Create a Service
1. Open Services Master view
2. Click "Add Service"
3. Fill in all available fields
4. Click "Save"
5. Verify service is created
6. Check database to confirm all fields are saved

### Step 2: Create an Asset
1. Open Asset Library view
2. Click "Add Asset"
3. Fill in all available fields
4. Set application_type to "web", "seo", or "smm"
5. Click "Save"
6. Verify asset is created
7. Check database to confirm all fields are saved

### Step 3: Link Asset to Service
1. Open Asset Library
2. Select an asset
3. Click "Link to Service"
4. Select a service
5. Click "Link"
6. Verify link is created
7. Open service page and verify asset displays

### Step 4: Update Service
1. Open Services Master
2. Select a service
3. Update some fields
4. Click "Save"
5. Verify all fields are updated in database

### Step 5: Update Asset
1. Open Asset Library
2. Select an asset
3. Update some fields
4. Click "Save"
5. Verify all fields are updated in database

## Expected Results

### Service Creation
- ✅ All 90+ fields saved to database
- ✅ Service appears in Services Master list
- ✅ Service can be retrieved via API with all fields

### Asset Creation
- ✅ All 60+ fields saved to database
- ✅ Asset appears in Asset Library list
- ✅ Asset can be retrieved via API with all fields

### Asset-Service Linking
- ✅ Link created in service_asset_links table
- ✅ Asset displays on service page
- ✅ Asset can be unlinked if not static

### Data Updates
- ✅ All updated fields persisted to database
- ✅ Updated data reflects in UI
- ✅ Version number incremented (if applicable)

## Troubleshooting

### Issue: Fields not saving
**Solution**: 
1. Check database schema has all columns
2. Run migration script if needed
3. Verify controller is sending all fields
4. Check database logs for errors

### Issue: Asset not displaying on service page
**Solution**:
1. Verify link exists in service_asset_links table
2. Check asset status is not "Draft"
3. Verify asset linking is active (linking_active = 1)
4. Check service page is loading linked assets

### Issue: Migration fails
**Solution**:
1. Backup database first
2. Check database user has ALTER TABLE permissions
3. Run migration on test database first
4. Check for syntax errors in migration script

## Performance Considerations

- All new columns use appropriate data types
- JSON fields used for arrays to maintain flexibility
- Indexes created on frequently queried columns
- No performance impact on existing queries

## Rollback Plan

If issues occur:
1. Restore database from backup
2. Revert code changes
3. Investigate root cause
4. Re-test before re-deployment

## Sign-Off Checklist

- [ ] All services fields save correctly
- [ ] All sub-services fields save correctly
- [ ] All assets fields save correctly
- [ ] Asset-service linking works
- [ ] Asset-subservice linking works
- [ ] Updates persist correctly
- [ ] Migration script works on existing database
- [ ] No performance degradation
- [ ] All API endpoints return correct data
- [ ] UI displays all fields correctly
