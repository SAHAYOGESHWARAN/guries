-- =====================================================
-- Marketing Control Center - PostgreSQL Database Schema
-- =====================================================
-- This file contains the complete database schema for the MCC application
-- Database: mcc_db (default)
-- =====================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE ENTITIES
-- =====================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE,
	phone_number VARCHAR(50),
	role VARCHAR(100),
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
	id SERIAL PRIMARY KEY,
	brand_id INTEGER,
	project_name VARCHAR(255) NOT NULL,
	project_type VARCHAR(100),
	project_status VARCHAR(50) DEFAULT 'planning',
	project_owner_id INTEGER REFERENCES users(id),
	project_start_date DATE,
	project_end_date DATE,
	objective TEXT,
	linked_services TEXT, -- JSON array stored as TEXT
	created_at TIMESTAMP DEFAULT NOW(),
	last_updated TIMESTAMP DEFAULT NOW()
);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
	id SERIAL PRIMARY KEY,
	project_id INTEGER REFERENCES projects(id),
	brand_id INTEGER,
	campaign_name VARCHAR(255) NOT NULL,
	campaign_type VARCHAR(100),
	target_url VARCHAR(500),
	backlinks_planned INTEGER DEFAULT 0,
	backlinks_completed INTEGER DEFAULT 0,
	campaign_start_date DATE,
	campaign_end_date DATE,
	campaign_owner_id INTEGER REFERENCES users(id),
	status VARCHAR(50) DEFAULT 'planning',
	linked_service_ids TEXT, -- JSON array
	tasks_completed INTEGER DEFAULT 0,
	tasks_total INTEGER DEFAULT 0,
	kpi_score DECIMAL(5,2) DEFAULT 0,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
	id SERIAL PRIMARY KEY,
	campaign_id INTEGER REFERENCES campaigns(id),
	task_type VARCHAR(100),
	name VARCHAR(255) NOT NULL,
	primary_owner_id INTEGER REFERENCES users(id),
	due_date DATE,
	status VARCHAR(50) DEFAULT 'pending',
	priority VARCHAR(50),
	sub_campaign VARCHAR(255),
	progress_stage VARCHAR(100),
	qc_stage VARCHAR(100),
	rework_count INTEGER DEFAULT 0,
	repo_link_count INTEGER DEFAULT 0,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Keywords Table
CREATE TABLE IF NOT EXISTS keywords (
	id SERIAL PRIMARY KEY,
	keyword VARCHAR(255) NOT NULL,
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CONTENT MANAGEMENT
-- =====================================================

-- Content Repository Table
CREATE TABLE IF NOT EXISTS content_repository (
	id SERIAL PRIMARY KEY,
	brand_id INTEGER,
	content_title_clean VARCHAR(500),
	asset_type VARCHAR(100),
	status VARCHAR(50),
	asset_category VARCHAR(100),
	asset_format VARCHAR(50),
	slug VARCHAR(500),
	full_url VARCHAR(1000),
	linked_service_ids TEXT, -- JSON array
	linked_sub_service_ids TEXT, -- JSON array
	h1 VARCHAR(500),
	h2_list TEXT, -- JSON array
	h3_list TEXT, -- JSON array
	body_content TEXT,
	meta_title VARCHAR(500),
	meta_description VARCHAR(500),
	focus_keywords TEXT, -- JSON array
	og_title VARCHAR(500),
	og_description VARCHAR(500),
	og_image_url VARCHAR(1000),
	social_meta JSONB,
	thumbnail_url VARCHAR(1000),
	context TEXT,
	linked_campaign_id INTEGER REFERENCES campaigns(id),
	promotion_channels TEXT, -- JSON array
	campaign_name VARCHAR(255),
	assigned_to_id INTEGER REFERENCES users(id),
	ai_qc_report TEXT, -- JSON object
	last_status_update_at TIMESTAMP DEFAULT NOW(),
	created_at TIMESTAMP DEFAULT NOW()
);

-- Services Table (Service Master)
CREATE TABLE IF NOT EXISTS services (
	id SERIAL PRIMARY KEY,
	
	-- A. Identity & Core Details
	service_code VARCHAR(100),
	service_name VARCHAR(255) NOT NULL,
	slug VARCHAR(500),
	full_url VARCHAR(1000),
	menu_heading VARCHAR(255),
	short_tagline VARCHAR(500),
	service_description TEXT,
	industry_ids TEXT, -- JSON array
	country_ids TEXT, -- JSON array
	language VARCHAR(10) DEFAULT 'en',
	status VARCHAR(50) DEFAULT 'Draft',
	
	-- B. Ownership & Governance
	brand_id INTEGER,
	business_unit VARCHAR(100),
	content_owner_id INTEGER REFERENCES users(id),
	created_by INTEGER REFERENCES users(id),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER REFERENCES users(id),
	updated_at TIMESTAMP DEFAULT NOW(),
	version_number INTEGER DEFAULT 1,
	change_log_link VARCHAR(1000),
	
	-- C. Navigation & Site Structure
	show_in_main_menu BOOLEAN DEFAULT false,
	show_in_footer_menu BOOLEAN DEFAULT false,
	menu_group VARCHAR(100),
	menu_position INTEGER DEFAULT 0,
	breadcrumb_label VARCHAR(255),
	parent_menu_section VARCHAR(255),
	include_in_xml_sitemap BOOLEAN DEFAULT true,
	sitemap_priority DECIMAL(2,1) DEFAULT 0.8,
	sitemap_changefreq VARCHAR(20) DEFAULT 'monthly',
	
	-- D. Strategic Mapping
	content_type VARCHAR(50) DEFAULT 'Pillar',
	buyer_journey_stage VARCHAR(50),
	primary_persona_id INTEGER,
	secondary_persona_ids TEXT, -- JSON array
	target_segment_notes TEXT,
	primary_cta_label VARCHAR(255),
	primary_cta_url VARCHAR(1000),
	form_id INTEGER,
	linked_campaign_ids TEXT, -- JSON array
	
	-- E. Technical SEO Block
	schema_type_id VARCHAR(100),
	robots_index VARCHAR(50) DEFAULT 'index',
	robots_follow VARCHAR(50) DEFAULT 'follow',
	robots_custom TEXT,
	canonical_url VARCHAR(1000),
	redirect_from_urls TEXT, -- JSON array
	hreflang_group_id INTEGER,
	core_web_vitals_status VARCHAR(50),
	tech_seo_status VARCHAR(50),
	faq_section_enabled BOOLEAN DEFAULT false,
	faq_content JSONB,
	
	-- F. Content Block
	h1 VARCHAR(500),
	h2_list TEXT, -- JSON array
	h3_list TEXT, -- JSON array
	h4_list TEXT, -- JSON array
	h5_list TEXT, -- JSON array
	body_content TEXT,
	internal_links TEXT, -- JSON array
	external_links TEXT, -- JSON array
	image_alt_texts TEXT, -- JSON array
	word_count INTEGER,
	reading_time_minutes INTEGER,
	
	-- G. SEO Metadata Block
	meta_title VARCHAR(500),
	meta_description TEXT,
	focus_keywords TEXT, -- JSON array
	secondary_keywords TEXT, -- JSON array
	seo_score INTEGER,
	ranking_summary TEXT,
	
	-- H. SMM / Social Meta (Default)
	og_title VARCHAR(500),
	og_description VARCHAR(500),
	og_image_url VARCHAR(1000),
	og_type VARCHAR(50) DEFAULT 'website',
	twitter_title VARCHAR(500),
	twitter_description TEXT,
	twitter_image_url VARCHAR(1000),
	linkedin_title VARCHAR(500),
	linkedin_description TEXT,
	linkedin_image_url VARCHAR(1000),
	facebook_title VARCHAR(500),
	facebook_description TEXT,
	facebook_image_url VARCHAR(1000),
	instagram_title VARCHAR(500),
	instagram_description VARCHAR(500),
	instagram_image_url VARCHAR(1000),
	social_meta JSONB,
	
	-- K. Linking to Sub-services, Assets & Other Modules
	has_subservices BOOLEAN DEFAULT false,
	subservice_count INTEGER DEFAULT 0,
	primary_subservice_id INTEGER,
	featured_asset_id INTEGER,
	asset_count INTEGER DEFAULT 0,
	knowledge_topic_id INTEGER
);

-- Sub Services Table (Inherits all SEO blocks from parent)
CREATE TABLE IF NOT EXISTS sub_services (
	id SERIAL PRIMARY KEY,
	
	-- Core Identity (inherits from parent service)
	sub_service_name VARCHAR(255) NOT NULL,
	parent_service_id INTEGER REFERENCES services(id),
	slug VARCHAR(500),
	full_url VARCHAR(1000),
	menu_heading VARCHAR(255),
	short_tagline VARCHAR(500),
	description TEXT,
	industry_ids TEXT, -- JSON array (inherited or overridden)
	country_ids TEXT, -- JSON array (inherited or overridden)
	language VARCHAR(10) DEFAULT 'en',
	status VARCHAR(50) DEFAULT 'Draft',
	
	-- Governance (inherits from parent)
	brand_id INTEGER,
	content_owner_id INTEGER REFERENCES users(id),
	created_by INTEGER REFERENCES users(id),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_by INTEGER REFERENCES users(id),
	updated_at TIMESTAMP DEFAULT NOW(),
	
	-- Navigation
	menu_position INTEGER DEFAULT 0,
	breadcrumb_label VARCHAR(255),
	include_in_xml_sitemap BOOLEAN DEFAULT true,
	sitemap_priority DECIMAL(2,1) DEFAULT 0.8,
	sitemap_changefreq VARCHAR(20) DEFAULT 'monthly',
	
	-- Strategic
	content_type VARCHAR(50) DEFAULT 'Cluster',
	buyer_journey_stage VARCHAR(50),
	primary_cta_label VARCHAR(255),
	primary_cta_url VARCHAR(1000),
	
	-- Technical SEO (inherits from parent)
	schema_type_id VARCHAR(100),
	robots_index VARCHAR(50) DEFAULT 'index',
	robots_follow VARCHAR(50) DEFAULT 'follow',
	canonical_url VARCHAR(1000),
	faq_section_enabled BOOLEAN DEFAULT false,
	faq_content JSONB,
	
	-- Content Block (inherits structure from parent)
	h1 VARCHAR(500),
	h2_list TEXT, -- JSON array
	h3_list TEXT, -- JSON array
	h4_list TEXT, -- JSON array
	h5_list TEXT, -- JSON array
	body_content TEXT,
	internal_links TEXT, -- JSON array
	external_links TEXT, -- JSON array
	image_alt_texts TEXT, -- JSON array
	word_count INTEGER,
	reading_time_minutes INTEGER,
	
	-- SEO Metadata (inherits from parent)
	meta_title VARCHAR(500),
	meta_description TEXT,
	focus_keywords TEXT, -- JSON array
	secondary_keywords TEXT, -- JSON array
	seo_score INTEGER,
	
	-- SMM / Social Meta (inherits from parent)
	og_title VARCHAR(500),
	og_description VARCHAR(500),
	og_image_url VARCHAR(1000),
	og_type VARCHAR(50) DEFAULT 'website',
	twitter_title VARCHAR(500),
	twitter_description TEXT,
	twitter_image_url VARCHAR(1000),
	linkedin_title VARCHAR(500),
	linkedin_description TEXT,
	linkedin_image_url VARCHAR(1000),
	facebook_title VARCHAR(500),
	facebook_description TEXT,
	facebook_image_url VARCHAR(1000),
	instagram_title VARCHAR(500),
	instagram_description VARCHAR(500),
	instagram_image_url VARCHAR(1000),
	social_meta JSONB,
	
	-- Linking
	assets_linked INTEGER DEFAULT 0
);

-- Service Pages Table
CREATE TABLE IF NOT EXISTS service_pages (
	id SERIAL PRIMARY KEY,
	page_title VARCHAR(500),
	url VARCHAR(1000),
	page_type VARCHAR(100),
	service_name VARCHAR(255),
	sub_service_name VARCHAR(255),
	seo_score DECIMAL(5,2),
	audit_score DECIMAL(5,2),
	primary_keyword VARCHAR(255),
	last_audit DATE,
	status VARCHAR(50),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- BACKLINKS
-- =====================================================

-- Backlink Sources Table
CREATE TABLE IF NOT EXISTS backlink_sources (
	id SERIAL PRIMARY KEY,
	source_name VARCHAR(255) NOT NULL,
	source_url VARCHAR(1000),
	domain_authority INTEGER,
	status VARCHAR(50),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

��0J2



-- =====================================================
-- ASSETS TABLE
-- =====================================================

-- Assets Table (Central Asset Library)
CREATE TABLE IF NOT EXISTS assets (
	id SERIAL PRIMARY KEY,
	asset_name VARCHAR(500) NOT NULL,
	asset_type VARCHAR(100) DEFAULT 'Image',
	file_url TEXT,
	thumbnail_url TEXT,
	og_image_url TEXT,
	description TEXT,
	tags TEXT, -- Used for repository field
	file_size BIGINT,
	file_type VARCHAR(100),
	social_meta JSONB,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_created ON assets(created_at DESC);
