-- Comprehensive migration to add all missing fields to services table
-- This migration adds all fields from the Service interface that are missing from the current schema

-- Add missing columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS full_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS menu_heading TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_tagline TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS industry_ids TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS country_ids TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Navigation fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS show_in_main_menu INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS show_in_footer_menu INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS menu_group TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS menu_position INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS breadcrumb_label TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS parent_menu_section TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS include_in_xml_sitemap INTEGER DEFAULT 1;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sitemap_priority DECIMAL(3,2) DEFAULT 0.8;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sitemap_changefreq TEXT DEFAULT 'monthly';

-- Strategic Mapping fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS content_type TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS buyer_journey_stage TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS primary_persona_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS secondary_persona_ids TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS target_segment_notes TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS primary_cta_label TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS primary_cta_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS form_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS linked_campaign_ids TEXT;

-- Technical SEO fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS schema_type_id TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS robots_index TEXT DEFAULT 'index';
ALTER TABLE services ADD COLUMN IF NOT EXISTS robots_follow TEXT DEFAULT 'follow';
ALTER TABLE services ADD COLUMN IF NOT EXISTS robots_custom TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS redirect_from_urls TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS hreflang_group_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS core_web_vitals_status TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS tech_seo_status TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS faq_section_enabled INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS faq_content TEXT;

-- Content Block fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS h1 TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS h2_list TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS h3_list TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS h4_list TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS h5_list TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS body_content TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS internal_links TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS external_links TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_alt_texts TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 0;

-- SEO Metadata fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS focus_keywords TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS secondary_keywords TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS ranking_summary TEXT;

-- SMM / Social Meta fields
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
ALTER TABLE services ADD COLUMN IF NOT EXISTS social_meta TEXT;

-- Linking fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS has_subservices INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS subservice_count INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS primary_subservice_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS featured_asset_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS asset_count INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS knowledge_topic_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS linked_insights_ids TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS linked_assets_ids TEXT;

-- Ownership & Governance fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS brand_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS business_unit TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS content_owner_id INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_by INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;
ALTER TABLE services ADD COLUMN IF NOT EXISTS change_log_link TEXT;

-- Add missing columns to sub_services table
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS full_url TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS menu_heading TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS short_tagline TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS industry_ids TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS country_ids TEXT;

-- Navigation fields for sub_services
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS show_in_main_menu INTEGER DEFAULT 0;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS show_in_footer_menu INTEGER DEFAULT 0;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS menu_group TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS menu_position INTEGER DEFAULT 0;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS breadcrumb_label TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS parent_menu_section TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS include_in_xml_sitemap INTEGER DEFAULT 1;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS sitemap_priority DECIMAL(3,2) DEFAULT 0.8;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS sitemap_changefreq TEXT DEFAULT 'monthly';

-- Strategic Mapping fields for sub_services
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS content_type TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS buyer_journey_stage TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS primary_persona_id INTEGER;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS secondary_persona_ids TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS target_segment_notes TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS strategic_notes TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS primary_cta_label TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS primary_cta_url TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS form_id INTEGER;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS linked_campaign_ids TEXT;

-- Technical SEO fields for sub_services
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS schema_type_id TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS robots_index TEXT DEFAULT 'index';
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS robots_follow TEXT DEFAULT 'follow';
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS robots_custom TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS redirect_from_urls TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS hreflang_group_id INTEGER;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS core_web_vitals_status TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS tech_seo_status TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS faq_section_enabled INTEGER DEFAULT 0;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS faq_content TEXT;

-- Content Block fields for sub_services
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS h1 TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS h2_list TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS h3_list TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS h4_list TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS h5_list TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS body_content TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS internal_links TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS external_links TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS image_alt_texts TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 0;

-- SEO Metadata fields for sub_services
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS focus_keywords TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS secondary_keywords TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS ranking_summary TEXT;

-- SMM / Social Meta fields for sub_services
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS og_image_url TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'website';
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS twitter_title TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS twitter_description TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS twitter_image_url TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS linkedin_title TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS linkedin_description TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS linkedin_image_url TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS facebook_title TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS facebook_description TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS facebook_image_url TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS instagram_title TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS instagram_description TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS instagram_image_url TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS social_meta TEXT;

-- Linking fields for sub_services
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS has_subservices INTEGER DEFAULT 0;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS subservice_count INTEGER DEFAULT 0;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS featured_asset_id INTEGER;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS asset_count INTEGER DEFAULT 0;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS knowledge_topic_id INTEGER;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS linked_insights_ids TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS linked_assets_ids TEXT;

-- Ownership & Governance fields for sub_services
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS brand_id INTEGER;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS business_unit TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS content_owner_id INTEGER;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS updated_by INTEGER;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS change_log_link TEXT;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS assets_linked INTEGER DEFAULT 0;
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS working_on_by TEXT;
