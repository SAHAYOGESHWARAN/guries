-- Migration: Add extended fields to sub_services table
-- This migration adds all fields that are used in SubServiceMasterView frontend

-- Core fields
ALTER TABLE sub_services 
ADD COLUMN IF NOT EXISTS menu_heading VARCHAR(255),
ADD COLUMN IF NOT EXISTS short_tagline VARCHAR(500),
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS industry_ids TEXT, -- JSON array
ADD COLUMN IF NOT EXISTS country_ids TEXT; -- JSON array

-- Content fields
ALTER TABLE sub_services 
ADD COLUMN IF NOT EXISTS h4_list TEXT, -- JSON array
ADD COLUMN IF NOT EXISTS h5_list TEXT, -- JSON array
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 0;

-- SEO fields
ALTER TABLE sub_services 
ADD COLUMN IF NOT EXISTS secondary_keywords TEXT, -- JSON array
ADD COLUMN IF NOT EXISTS seo_score DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ranking_summary TEXT;

-- SMM fields
ALTER TABLE sub_services 
ADD COLUMN IF NOT EXISTS twitter_title VARCHAR(500),
ADD COLUMN IF NOT EXISTS twitter_description TEXT,
ADD COLUMN IF NOT EXISTS twitter_image_url VARCHAR(1000),
ADD COLUMN IF NOT EXISTS og_type VARCHAR(100) DEFAULT 'website';

-- Technical SEO fields
ALTER TABLE sub_services 
ADD COLUMN IF NOT EXISTS robots_custom TEXT,
ADD COLUMN IF NOT EXISTS hreflang_group_id INTEGER,
ADD COLUMN IF NOT EXISTS core_web_vitals_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS tech_seo_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS redirect_from_urls TEXT, -- JSON array
ADD COLUMN IF NOT EXISTS faq_section_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS faq_content TEXT; -- JSON array

-- Governance fields
ALTER TABLE sub_services 
ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS change_log_link VARCHAR(1000);

-- Add comment
COMMENT ON TABLE sub_services IS 'Sub-services table with extended fields matching ServiceMasterView capabilities';

