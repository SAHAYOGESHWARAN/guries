-- Complete Services Table Schema Migration
-- This adds all missing columns to the services table

-- Add missing columns if they don't exist
ALTER TABLE services ADD COLUMN IF NOT EXISTS full_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS menu_heading TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_tagline TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS industry_ids TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS country_ids TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE services ADD COLUMN IF NOT EXISTS show_in_main_menu INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS show_in_footer_menu INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS menu_group TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS menu_position INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS breadcrumb_label TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS parent_menu_section TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS include_in_xml_sitemap INTEGER DEFAULT 1;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sitemap_priority REAL DEFAULT 0.8;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sitemap_changefreq TEXT DEFAULT 'monthly';
ALTER TABLE services ADD COLUMN IF NOT EXISTS content_type TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS buyer_journey_stage TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS primary_persona_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS secondary_persona_ids TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS target_segment_notes TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS primary_cta_label TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS primary_cta_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS form_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS linked_campaign_ids TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS h1 TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS h2_list TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS h3_list TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS h4_list TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS h5_list TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS body_content TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS internal_links TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS external_links TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_alt_texts TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_keywords TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS focus_keywords TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS secondary_keywords TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS ranking_summary TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS og_image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'website';
ALTER TABLE services ADD COLUMN IF NOT EXISTS twitter_title TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS twitter_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS twitter_image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS linkedin_title TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS linkedin_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS linkedin_image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS facebook_title TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS facebook_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS facebook_image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS instagram_title TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS instagram_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS instagram_image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS social_meta TEXT DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS schema_type_id TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS robots_index TEXT DEFAULT 'index';
ALTER TABLE services ADD COLUMN IF NOT EXISTS robots_follow TEXT DEFAULT 'follow';
ALTER TABLE services ADD COLUMN IF NOT EXISTS robots_custom TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS redirect_from_urls TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS hreflang_group_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS core_web_vitals_status TEXT DEFAULT 'Good';
ALTER TABLE services ADD COLUMN IF NOT EXISTS tech_seo_status TEXT DEFAULT 'Ok';
ALTER TABLE services ADD COLUMN IF NOT EXISTS faq_section_enabled INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS faq_content TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS has_subservices INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS subservice_count INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS primary_subservice_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS featured_asset_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS asset_count INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS knowledge_topic_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS linked_insights_ids TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS linked_assets_ids TEXT DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS brand_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS business_unit TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS content_owner_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_by INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;
ALTER TABLE services ADD COLUMN IF NOT EXISTS change_log_link TEXT;

-- Insert sample services if table is empty
INSERT OR IGNORE INTO services (
    id, service_name, service_code, slug, full_url, menu_heading, short_tagline,
    service_description, status, h1, meta_title, meta_description,
    content_type, buyer_journey_stage, language, show_in_main_menu,
    include_in_xml_sitemap, created_at, updated_at
) VALUES
(1, 'SEO Optimization', 'SEO-001', 'seo-optimization', '/services/seo-optimization', 'SEO Services', 'Boost your online visibility', 'Comprehensive SEO services to improve your search rankings', 'Published', 'Professional SEO Optimization Services', 'SEO Optimization Services | Expert Solutions', 'Improve your search rankings with our professional SEO services', 'Pillar', 'Awareness', 'en', 1, 1, datetime('now'), datetime('now')),
(2, 'Content Marketing', 'CM-001', 'content-marketing', '/services/content-marketing', 'Content Services', 'Engage your audience with quality content', 'Strategic content creation and distribution services', 'Published', 'Content Marketing Solutions', 'Content Marketing Services | Professional Writers', 'High-quality content creation for your brand', 'Pillar', 'Consideration', 'en', 1, 1, datetime('now'), datetime('now')),
(3, 'Social Media Management', 'SMM-001', 'social-media-management', '/services/social-media-management', 'Social Media', 'Grow your social presence', 'Complete social media management and strategy services', 'Published', 'Social Media Management Services', 'Social Media Management | Expert Strategy', 'Grow your brand on social media with expert management', 'Pillar', 'Awareness', 'en', 1, 1, datetime('now'), datetime('now')),
(4, 'PPC Advertising', 'PPC-001', 'ppc-advertising', '/services/ppc-advertising', 'Paid Advertising', 'Maximize your ad ROI', 'Strategic PPC campaigns for Google Ads and social platforms', 'Published', 'PPC Advertising Services', 'PPC Advertising Services | Google Ads Experts', 'Maximize your advertising ROI with expert PPC management', 'Pillar', 'Decision', 'en', 1, 1, datetime('now'), datetime('now')),
(5, 'Email Marketing', 'EM-001', 'email-marketing', '/services/email-marketing', 'Email Services', 'Connect with your customers', 'Effective email marketing campaigns and automation', 'Published', 'Email Marketing Services', 'Email Marketing Services | Campaign Experts', 'Effective email marketing campaigns for your business', 'Cluster', 'Retention', 'en', 1, 1, datetime('now'), datetime('now'));
