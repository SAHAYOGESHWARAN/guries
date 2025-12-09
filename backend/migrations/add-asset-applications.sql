-- Migration: Add Asset Applications fields to assets table
-- Date: 2025-12-09

-- Add missing base fields if they don't exist
ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_category VARCHAR(100);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_format VARCHAR(50);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(1000);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS linked_service_ids TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS linked_sub_service_ids TEXT;

-- Add application type column
ALTER TABLE assets ADD COLUMN IF NOT EXISTS application_type VARCHAR(50);

-- Add Web Application fields
ALTER TABLE assets ADD COLUMN IF NOT EXISTS web_title VARCHAR(500);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS web_description TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS web_keywords TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS web_url VARCHAR(1000);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS web_h1 VARCHAR(500);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS web_h2_1 VARCHAR(500);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS web_h2_2 VARCHAR(500);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS web_thumbnail VARCHAR(1000);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS web_body_content TEXT;

-- Add SMM Application fields
ALTER TABLE assets ADD COLUMN IF NOT EXISTS smm_platform VARCHAR(100);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS smm_title VARCHAR(500);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS smm_tag VARCHAR(500);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS smm_url VARCHAR(1000);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS smm_description TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS smm_hashtags TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS smm_media_url VARCHAR(1000);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS smm_media_type VARCHAR(50);

-- Add comment
COMMENT ON COLUMN assets.application_type IS 'Asset application type: web, seo, or smm';
COMMENT ON COLUMN assets.smm_platform IS 'Social media platform: facebook_instagram, twitter, or linkedin';
