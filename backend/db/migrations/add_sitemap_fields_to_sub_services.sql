-- Migration: Add sitemap_priority and sitemap_changefreq to sub_services table
-- Date: 2024
-- Description: Adds sitemap configuration fields to sub_services table for better SEO control

-- Add sitemap_priority column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sub_services' 
        AND column_name = 'sitemap_priority'
    ) THEN
        ALTER TABLE sub_services 
        ADD COLUMN sitemap_priority DECIMAL(3,2) DEFAULT 0.8;
    END IF;
END $$;

-- Add sitemap_changefreq column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sub_services' 
        AND column_name = 'sitemap_changefreq'
    ) THEN
        ALTER TABLE sub_services 
        ADD COLUMN sitemap_changefreq VARCHAR(50) DEFAULT 'monthly';
    END IF;
END $$;

-- Update existing records to have default values if they are NULL
UPDATE sub_services 
SET sitemap_priority = 0.8 
WHERE sitemap_priority IS NULL;

UPDATE sub_services 
SET sitemap_changefreq = 'monthly' 
WHERE sitemap_changefreq IS NULL;

