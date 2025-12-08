-- Migration: Add Platform-Specific Social Media Columns
-- Date: 2024-12-04
-- Description: Add explicit columns for LinkedIn, Facebook, and Instagram metadata to services and sub_services tables
--              This complements the existing social_meta JSONB column for better queryability

BEGIN;

-- Add columns to services table
ALTER TABLE services
ADD COLUMN IF NOT EXISTS og_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS twitter_title VARCHAR(500),
ADD COLUMN IF NOT EXISTS twitter_description TEXT,
ADD COLUMN IF NOT EXISTS twitter_image_url VARCHAR(1000),
ADD COLUMN IF NOT EXISTS linkedin_title VARCHAR(500),
ADD COLUMN IF NOT EXISTS linkedin_description TEXT,
ADD COLUMN IF NOT EXISTS linkedin_image_url VARCHAR(1000),
ADD COLUMN IF NOT EXISTS facebook_title VARCHAR(500),
ADD COLUMN IF NOT EXISTS facebook_description TEXT,
ADD COLUMN IF NOT EXISTS facebook_image_url VARCHAR(1000),
ADD COLUMN IF NOT EXISTS instagram_title VARCHAR(500),
ADD COLUMN IF NOT EXISTS instagram_description TEXT,
ADD COLUMN IF NOT EXISTS instagram_image_url VARCHAR(1000);

-- Add columns to sub_services table
ALTER TABLE sub_services
ADD COLUMN IF NOT EXISTS og_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS twitter_title VARCHAR(500),
ADD COLUMN IF NOT EXISTS twitter_description TEXT,
ADD COLUMN IF NOT EXISTS twitter_image_url VARCHAR(1000),
ADD COLUMN IF NOT EXISTS linkedin_title VARCHAR(500),
ADD COLUMN IF NOT EXISTS linkedin_description TEXT,
ADD COLUMN IF NOT EXISTS linkedin_image_url VARCHAR(1000),
ADD COLUMN IF NOT EXISTS facebook_title VARCHAR(500),
ADD COLUMN IF NOT EXISTS facebook_description TEXT,
ADD COLUMN IF NOT EXISTS facebook_image_url VARCHAR(1000),
ADD COLUMN IF NOT EXISTS instagram_title VARCHAR(500),
ADD COLUMN IF NOT EXISTS instagram_description TEXT,
ADD COLUMN IF NOT EXISTS instagram_image_url VARCHAR(1000);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_linkedin_title ON services(linkedin_title);
CREATE INDEX IF NOT EXISTS idx_services_facebook_title ON services(facebook_title);
CREATE INDEX IF NOT EXISTS idx_services_instagram_title ON services(instagram_title);

CREATE INDEX IF NOT EXISTS idx_sub_services_linkedin_title ON sub_services(linkedin_title);
CREATE INDEX IF NOT EXISTS idx_sub_services_facebook_title ON sub_services(facebook_title);
CREATE INDEX IF NOT EXISTS idx_sub_services_instagram_title ON sub_services(instagram_title);

COMMIT;
