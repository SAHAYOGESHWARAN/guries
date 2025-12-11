-- Migration: Add web_meta_description field to assets table
-- Date: 2025-12-11

-- Add web_meta_description field for SEO meta descriptions
ALTER TABLE assets ADD COLUMN IF NOT EXISTS web_meta_description VARCHAR(160);

-- Add comment
COMMENT ON COLUMN assets.web_meta_description IS 'SEO meta description for web assets (max 160 characters)';