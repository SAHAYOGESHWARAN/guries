-- =====================================================
-- Marketing Control Center - CONSOLIDATED DATABASE SCHEMA
-- =====================================================
-- This is the SINGLE source of truth for the MCC database
-- All duplicate schema files have been merged into this file
-- Database: mcc_db
-- Version: 3.0 (Fully Consolidated)
-- Last Updated: 2025-12-08
-- =====================================================

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
	linked_page_ids TEXT, -- JSON array for mapping to specific pages
	mapped_to VARCHAR(500), -- Display string: "Service / Sub-service / Page"
	qc_score INTEGER, -- Quality control score (0-100)
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
	service_name VARCHAR(255) NOT NULL,
	service_code VARCHAR(100),
	slug VARCHAR(500),
	full_url VARCHAR(1000),
	service_description TEXT,
	industry_ids TEXT, -- JSON array
	country_ids TEXT, -- JSON array
	-- Content block
	h1 VARCHAR(500),
	h2_list TEXT, -- JSON array
	h3_list TEXT, -- JSON array
	h4_list TEXT, -- JSON array
	h5_list TEXT, -- JSON array
	body_content TEXT,
	internal_links TEXT, -- JSON array
	external_links TEXT, -- JSON array
	image_alt_texts TEXT, -- JSON array
	-- SEO meta
	meta_title VARCHAR(500),
	meta_description TEXT,
	canonical_url VARCHAR(1000),
	schema_type_id VARCHAR(100),
	robots_index VARCHAR(50),
	robots_follow VARCHAR(50),
	robots_custom TEXT,
	-- Social meta
	og_title VARCHAR(500),
	og_description TEXT,
	og_image_url VARCHAR(1000),
	og_type VARCHAR(50),
	twitter_title VARCHAR(500),
	twitter_description TEXT,
	twitter_image_url VARCHAR(1000),
	-- LinkedIn
	linkedin_title VARCHAR(500),
	linkedin_description TEXT,
	linkedin_image_url VARCHAR(1000),
	-- Facebook
	facebook_title VARCHAR(500),
	facebook_description TEXT,
	facebook_image_url VARCHAR(1000),
	-- Instagram
	instagram_title VARCHAR(500),
	instagram_description TEXT,
	instagram_image_url VARCHAR(1000),
	-- Flexible social meta storage (JSONB for future platforms)
	social_meta JSONB,
	-- Navigation
	show_in_main_menu BOOLEAN DEFAULT false,
	menu_position INTEGER DEFAULT 0,
	breadcrumb_label VARCHAR(255),
	-- Linking
	has_subservices BOOLEAN DEFAULT false,
	subservice_count INTEGER DEFAULT 0,
	primary_subservice_id INTEGER,
	featured_asset_id INTEGER,
	asset_count INTEGER DEFAULT 0,
	knowledge_topic_id INTEGER,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Sub Services Table
CREATE TABLE IF NOT EXISTS sub_services (
	id SERIAL PRIMARY KEY,
	sub_service_name VARCHAR(255) NOT NULL,
	parent_service_id INTEGER REFERENCES services(id),
	slug VARCHAR(500),
	full_url VARCHAR(1000),
	description TEXT,
	-- Content block
	h1 VARCHAR(500),
	h2_list TEXT, -- JSON array
	h3_list TEXT, -- JSON array
	h4_list TEXT, -- JSON array
	h5_list TEXT, -- JSON array
	body_content TEXT,
	internal_links TEXT, -- JSON array
	external_links TEXT, -- JSON array
	image_alt_texts TEXT, -- JSON array
	-- SEO meta
	meta_title VARCHAR(500),
	meta_description TEXT,
	canonical_url VARCHAR(1000),
	schema_type_id VARCHAR(100),
	robots_index VARCHAR(50),
	robots_follow VARCHAR(50),
	robots_custom TEXT,
	-- Social meta
	og_title VARCHAR(500),
	og_description TEXT,
	og_image_url VARCHAR(1000),
	og_type VARCHAR(50),
	twitter_title VARCHAR(500),
	twitter_description TEXT,
	twitter_image_url VARCHAR(1000),
	-- LinkedIn
	linkedin_title VARCHAR(500),
	linkedin_description TEXT,
	linkedin_image_url VARCHAR(1000),
	-- Facebook
	facebook_title VARCHAR(500),
	facebook_description TEXT,
	facebook_image_url VARCHAR(1000),
	-- Instagram
	instagram_title VARCHAR(500),
	instagram_description TEXT,
	instagram_image_url VARCHAR(1000),
	-- Flexible social meta storage (JSONB for future platforms)
	social_meta JSONB,
	-- Navigation
	menu_position INTEGER DEFAULT 0,
	breadcrumb_label VARCHAR(255),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
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

-- Backlink Submissions Table
CREATE TABLE IF NOT EXISTS backlink_submissions (
	id SERIAL PRIMARY KEY,
	backlink_source_id INTEGER REFERENCES backlink_sources(id),
	target_url VARCHAR(1000),
	anchor_text_used VARCHAR(500),
	content_used TEXT,
	owner_id INTEGER REFERENCES users(id),
	submission_status VARCHAR(50),
	submitted_at TIMESTAMP DEFAULT NOW(),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Toxic Backlinks Table
CREATE TABLE IF NOT EXISTS toxic_backlinks (
	id SERIAL PRIMARY KEY,
	backlink_url VARCHAR(1000) NOT NULL,
	source_domain VARCHAR(500),
	target_url VARCHAR(1000),
	anchor_text VARCHAR(500),
	toxicity_score DECIMAL(5,2),
	reason TEXT,
	status VARCHAR(50) DEFAULT 'Pending',
	action_taken VARCHAR(255),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Competitor Backlinks Table
CREATE TABLE IF NOT EXISTS competitor_backlinks (
	id SERIAL PRIMARY KEY,
	competitor_domain VARCHAR(500),
	backlink_url VARCHAR(1000),
	source_domain VARCHAR(500),
	anchor_text VARCHAR(500),
	domain_authority INTEGER,
	created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SOCIAL MEDIA & ASSETS
-- =====================================================

-- SMM Posts Table
CREATE TABLE IF NOT EXISTS smm_posts (
	id SERIAL PRIMARY KEY,
	post_title VARCHAR(500),
	platform VARCHAR(100),
	content TEXT,
	media_url VARCHAR(1000),
	scheduled_at TIMESTAMP,
	status VARCHAR(50),
	engagement_metrics TEXT, -- JSON object
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Graphic Assets Table
CREATE TABLE IF NOT EXISTS graphic_assets (
	id SERIAL PRIMARY KEY,
	asset_name VARCHAR(255) NOT NULL,
	asset_type VARCHAR(100),
	file_url VARCHAR(1000),
	dimensions VARCHAR(100),
	file_format VARCHAR(50),
	file_size_kb INTEGER,
	tags TEXT, -- JSON array
	status VARCHAR(50),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
	id SERIAL PRIMARY KEY,
	asset_name VARCHAR(255) NOT NULL,
	asset_type VARCHAR(100),
	asset_category VARCHAR(100),
	asset_format VARCHAR(50),
	file_url VARCHAR(1000),
	description TEXT,
	tags TEXT, -- JSON array (repository)
	status VARCHAR(50) DEFAULT 'Draft', -- Draft, Pending QC Review, QC Approved, QC Rejected, Rework Required, Published
	usage_status VARCHAR(50) DEFAULT 'Available', -- Available, In Use, Archived
	thumbnail_url VARCHAR(1000),
	file_size INTEGER,
	file_type VARCHAR(100),
	linked_service_ids TEXT, -- JSON array
	linked_sub_service_ids TEXT, -- JSON array
	-- Workflow fields
	submitted_by INTEGER REFERENCES users(id),
	submitted_at TIMESTAMP,
	qc_reviewer_id INTEGER REFERENCES users(id),
	qc_reviewed_at TIMESTAMP,
	qc_score INTEGER, -- 0-100
	qc_checklist_completion BOOLEAN DEFAULT false,
	qc_remarks TEXT,
	rework_count INTEGER DEFAULT 0, -- Number of times sent for rework
	-- SEO and Grammar AI scores (mandatory before submission)
	seo_score INTEGER, -- 0-100, AI generated
	grammar_score INTEGER, -- 0-100, AI generated
	-- Content block
	h1 VARCHAR(500),
	h2_list TEXT, -- JSON array
	h3_list TEXT, -- JSON array
	body_content TEXT,
	-- SEO meta
	meta_title VARCHAR(500),
	meta_description TEXT,
	canonical_url VARCHAR(1000),
	schema_type_id VARCHAR(100),
	robots_index VARCHAR(50),
	robots_follow VARCHAR(50),
	robots_custom TEXT,
	-- Social meta
	og_title VARCHAR(500),
	og_description TEXT,
	og_image_url VARCHAR(1000),
	-- Asset Applications (in order as specified)
	application_type VARCHAR(50), -- WEB, SEO, SMM
	-- Service/Sub-Service Linking (keywords should link with keyword master table)
	keywords TEXT, -- JSON array - should link with keyword master table
	-- Web Application fields
	web_title VARCHAR(500),
	web_description TEXT,
	web_keywords TEXT,
	web_url VARCHAR(1000),
	web_h1 VARCHAR(500),
	web_h2_1 VARCHAR(500),
	web_h2_2 VARCHAR(500),
	web_thumbnail VARCHAR(1000),
	web_body_content TEXT,
	-- SMM Application fields
	smm_platform VARCHAR(100),
	smm_title VARCHAR(500),
	smm_tag VARCHAR(500),
	smm_url VARCHAR(1000),
	smm_description TEXT,
	smm_hashtags TEXT,
	smm_media_url VARCHAR(1000),
	smm_media_type VARCHAR(50),
	-- Linking becomes active only after QC approval
	linking_active BOOLEAN DEFAULT false,
	-- Workflow log
	workflow_log TEXT, -- JSON array of workflow events
	-- Linking
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Service ↔ Asset linking table
CREATE TABLE IF NOT EXISTS service_asset_links (
	id SERIAL PRIMARY KEY,
	service_id INTEGER REFERENCES services(id),
	asset_id INTEGER REFERENCES assets(id),
	created_at TIMESTAMP DEFAULT NOW()
);

-- Sub-service ↔ Asset linking table
CREATE TABLE IF NOT EXISTS subservice_asset_links (
	id SERIAL PRIMARY KEY,
	sub_service_id INTEGER REFERENCES sub_services(id),
	asset_id INTEGER REFERENCES assets(id),
	created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- QUALITY CONTROL
-- =====================================================

-- QC Runs Table
CREATE TABLE IF NOT EXISTS qc_runs (
	id SERIAL PRIMARY KEY,
	target_type VARCHAR(100), -- 'content', 'service', 'task', 'asset', etc.
	target_id INTEGER,
	qc_status VARCHAR(50),
	qc_owner_id INTEGER REFERENCES users(id),
	qc_checklist_version_id INTEGER,
	final_score_percentage DECIMAL(5,2),
	analysis_report TEXT, -- JSON object
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Asset QC Reviews Table (dedicated for asset workflow)
CREATE TABLE IF NOT EXISTS asset_qc_reviews (
	id SERIAL PRIMARY KEY,
	asset_id INTEGER REFERENCES assets(id),
	qc_reviewer_id INTEGER REFERENCES users(id),
	qc_score INTEGER, -- 0-100
	checklist_completion BOOLEAN DEFAULT false,
	qc_remarks TEXT,
	qc_decision VARCHAR(50), -- 'approved', 'rejected', 'rework'
	checklist_items TEXT, -- JSON object storing checklist completion status
	reviewed_at TIMESTAMP DEFAULT NOW(),
	created_at TIMESTAMP DEFAULT NOW()
);

-- QC Checklists Table
CREATE TABLE IF NOT EXISTS qc_checklists (
	id SERIAL PRIMARY KEY,
	checklist_name VARCHAR(255) NOT NULL,
	checklist_type VARCHAR(100),
	category VARCHAR(100),
	number_of_items INTEGER,
	scoring_mode VARCHAR(50),
	pass_threshold DECIMAL(5,2),
	status VARCHAR(50),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- QC Checklist Versions Table
CREATE TABLE IF NOT EXISTS qc_checklist_versions (
	id SERIAL PRIMARY KEY,
	checklist_id INTEGER REFERENCES qc_checklists(id),
	version_number INTEGER,
	items TEXT, -- JSON array
	created_at TIMESTAMP DEFAULT NOW()
);

-- QC Weightage Configs Table
CREATE TABLE IF NOT EXISTS qc_weightage_configs (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255),
	type VARCHAR(100),
	weight DECIMAL(5,2),
	mandatory BOOLEAN DEFAULT false,
	stage VARCHAR(100),
	asset_type VARCHAR(100),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ERRORS & ISSUES
-- =====================================================

-- URL Errors Table
CREATE TABLE IF NOT EXISTS url_errors (
	id SERIAL PRIMARY KEY,
	url VARCHAR(1000) NOT NULL,
	error_type VARCHAR(100),
	error_code INTEGER,
	error_message TEXT,
	detected_at TIMESTAMP DEFAULT NOW(),
	assigned_to_id INTEGER REFERENCES users(id),
	status VARCHAR(50) DEFAULT 'open',
	resolution_notes TEXT,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- UX Issues Table
CREATE TABLE IF NOT EXISTS ux_issues (
	id SERIAL PRIMARY KEY,
	issue_title VARCHAR(255) NOT NULL,
	issue_type VARCHAR(100),
	severity VARCHAR(50),
	url VARCHAR(1000),
	description TEXT,
	screenshots TEXT, -- JSON array of URLs
	assigned_to_id INTEGER REFERENCES users(id),
	status VARCHAR(50) DEFAULT 'open',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- SEO Errors Table (Master)
CREATE TABLE IF NOT EXISTS seo_errors (
	id SERIAL PRIMARY KEY,
	error_type VARCHAR(255) NOT NULL,
	category VARCHAR(100),
	severity VARCHAR(50),
	description TEXT,
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- On-page SEO Audit/Errors Table (Links to Services/Sub-services)
CREATE TABLE IF NOT EXISTS on_page_seo_audits (
	id SERIAL PRIMARY KEY,
	service_id INTEGER REFERENCES services(id),
	sub_service_id INTEGER REFERENCES sub_services(id),
	error_type VARCHAR(255) NOT NULL,
	error_category VARCHAR(100), -- 'Content', 'Technical', 'Meta', 'Links', 'Images', 'Schema'
	severity VARCHAR(50) DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
	issue_description TEXT,
	current_value TEXT, -- What is currently there
	recommended_value TEXT, -- What it should be
	detected_at TIMESTAMP DEFAULT NOW(),
	linked_campaign_id INTEGER REFERENCES campaigns(id), -- Campaign where this will be fixed
	status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'ignored'
	resolved_at TIMESTAMP,
	resolution_notes TEXT,
	created_by INTEGER REFERENCES users(id),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS & TRACKING
-- =====================================================

-- Analytics Daily Traffic Table
CREATE TABLE IF NOT EXISTS analytics_daily_traffic (
	id SERIAL PRIMARY KEY,
	date DATE NOT NULL,
	value INTEGER DEFAULT 0,
	created_at TIMESTAMP DEFAULT NOW(),
	UNIQUE(date)
);

-- KPI Snapshots Table
CREATE TABLE IF NOT EXISTS kpi_snapshots (
	id SERIAL PRIMARY KEY,
	snapshot_date DATE NOT NULL,
	metric_name VARCHAR(255),
	metric_value DECIMAL(10,2),
	created_at TIMESTAMP DEFAULT NOW()
);

-- Competitor Benchmarks Table
CREATE TABLE IF NOT EXISTS competitor_benchmarks (
	id SERIAL PRIMARY KEY,
	competitor_name VARCHAR(255) NOT NULL,
	competitor_domain VARCHAR(500),
	monthly_traffic INTEGER,
	total_keywords INTEGER,
	backlinks INTEGER,
	ranking_coverage DECIMAL(5,2),
	status VARCHAR(50),
	updated_on TIMESTAMP DEFAULT NOW(),
	created_at TIMESTAMP DEFAULT NOW()
);

-- OKRs Table (Objectives and Key Results)
CREATE TABLE IF NOT EXISTS okrs (
	id SERIAL PRIMARY KEY,
	objective VARCHAR(500) NOT NULL,
	type VARCHAR(100),
	cycle VARCHAR(100),
	owner VARCHAR(255),
	alignment TEXT,
	progress DECIMAL(5,2) DEFAULT 0,
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Gold Standards Table
CREATE TABLE IF NOT EXISTS gold_standards (
	id SERIAL PRIMARY KEY,
	metric_name VARCHAR(255) NOT NULL,
	category VARCHAR(100),
	value DECIMAL(10,2),
	range VARCHAR(100),
	unit VARCHAR(50),
	evidence TEXT,
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Effort Targets Table
CREATE TABLE IF NOT EXISTS effort_targets (
	id SERIAL PRIMARY KEY,
	role VARCHAR(255) NOT NULL,
	category VARCHAR(100),
	metric VARCHAR(255),
	monthly INTEGER,
	weekly INTEGER,
	daily INTEGER,
	weightage DECIMAL(5,2),
	rules TEXT, -- JSON object
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- HR & EMPLOYEE MANAGEMENT
-- =====================================================

-- Employee Evaluations Table
CREATE TABLE IF NOT EXISTS employee_evaluations (
	id SERIAL PRIMARY KEY,
	employee_id INTEGER REFERENCES users(id),
	evaluation_period VARCHAR(100),
	overall_score DECIMAL(5,2),
	performance_metrics TEXT, -- JSON object
	ai_analysis TEXT, -- JSON object
	created_at TIMESTAMP DEFAULT NOW()
);

-- Employee Skills Table
CREATE TABLE IF NOT EXISTS employee_skills (
	id SERIAL PRIMARY KEY,
	employee_id INTEGER REFERENCES users(id),
	skill_name VARCHAR(255),
	skill_category VARCHAR(100),
	score DECIMAL(5,2),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Employee Achievements Table
CREATE TABLE IF NOT EXISTS employee_achievements (
	id SERIAL PRIMARY KEY,
	employee_id INTEGER REFERENCES users(id),
	achievement_title VARCHAR(255),
	achievement_description TEXT,
	date_awarded DATE,
	created_at TIMESTAMP DEFAULT NOW()
);

-- Reward Recommendations Table
CREATE TABLE IF NOT EXISTS reward_recommendations (
	id SERIAL PRIMARY KEY,
	employee_id INTEGER REFERENCES users(id),
	recommendation_type VARCHAR(100),
	reason TEXT,
	status VARCHAR(50) DEFAULT 'pending',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- COMMUNICATION & NOTIFICATIONS
-- =====================================================

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
	id SERIAL PRIMARY KEY,
	text TEXT NOT NULL,
	type VARCHAR(100),
	read BOOLEAN DEFAULT false,
	created_at TIMESTAMP DEFAULT NOW()
);

-- Emails Table
CREATE TABLE IF NOT EXISTS emails (
	id SERIAL PRIMARY KEY,
	subject VARCHAR(500),
	recipient VARCHAR(255),
	status VARCHAR(50),
	scheduled_at TIMESTAMP,
	template_id INTEGER,
	created_at TIMESTAMP DEFAULT NOW()
);

-- Voice Profiles Table
CREATE TABLE IF NOT EXISTS voice_profiles (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	voice_id VARCHAR(255),
	language VARCHAR(50),
	gender VARCHAR(50),
	provider VARCHAR(100),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Call Logs Table
CREATE TABLE IF NOT EXISTS call_logs (
	id SERIAL PRIMARY KEY,
	agent_id INTEGER REFERENCES users(id),
	customer_phone VARCHAR(50),
	duration INTEGER, -- in seconds
	sentiment VARCHAR(50),
	recording_url VARCHAR(1000),
	summary TEXT,
	start_time TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- KNOWLEDGE BASE
-- =====================================================

-- Knowledge Articles Table
CREATE TABLE IF NOT EXISTS knowledge_articles (
	id SERIAL PRIMARY KEY,
	title VARCHAR(500) NOT NULL,
	content TEXT,
	category VARCHAR(100),
	tags TEXT, -- JSON array
	language VARCHAR(50),
	author_id INTEGER REFERENCES users(id),
	status VARCHAR(50),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- COMPLIANCE & AUDIT
-- =====================================================

-- Compliance Rules Table
CREATE TABLE IF NOT EXISTS compliance_rules (
	id SERIAL PRIMARY KEY,
	rule_name VARCHAR(255) NOT NULL,
	description TEXT,
	category VARCHAR(100),
	severity VARCHAR(50),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Compliance Audits Table
CREATE TABLE IF NOT EXISTS compliance_audits (
	id SERIAL PRIMARY KEY,
	target_type VARCHAR(100), -- 'content', 'service', etc.
	target_id INTEGER,
	score DECIMAL(5,2),
	violations TEXT, -- JSON array
	audited_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INTEGRATIONS
-- =====================================================

-- Integrations Table
CREATE TABLE IF NOT EXISTS integrations (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	type VARCHAR(100),
	status VARCHAR(50),
	api_key VARCHAR(500),
	api_secret VARCHAR(500),
	config TEXT, -- JSON object
	last_sync_at TIMESTAMP,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Integration Logs Table
CREATE TABLE IF NOT EXISTS integration_logs (
	id SERIAL PRIMARY KEY,
	integration_id INTEGER REFERENCES integrations(id),
	event VARCHAR(255),
	status VARCHAR(50),
	timestamp TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SYSTEM & CONFIGURATION
-- =====================================================

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
	id SERIAL PRIMARY KEY,
	setting_key VARCHAR(255) UNIQUE NOT NULL,
	setting_value TEXT,
	is_enabled BOOLEAN DEFAULT true,
	updated_at TIMESTAMP DEFAULT NOW()
);

-- OTP Codes Table (for authentication)
CREATE TABLE IF NOT EXISTS otp_codes (
	id SERIAL PRIMARY KEY,
	phone_number VARCHAR(50) NOT NULL,
	code VARCHAR(10) NOT NULL,
	expires_at TIMESTAMP NOT NULL,
	created_at TIMESTAMP DEFAULT NOW()
);

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	lead_user_id INTEGER REFERENCES users(id),
	description TEXT,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MASTER TABLES (Configuration)
-- =====================================================

-- Industry Sectors Table
CREATE TABLE IF NOT EXISTS industry_sectors (
	id SERIAL PRIMARY KEY,
	industry VARCHAR(255),
	sector VARCHAR(255),
	application VARCHAR(255),
	country VARCHAR(100),
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Content Types Table
CREATE TABLE IF NOT EXISTS content_types (
	id SERIAL PRIMARY KEY,
	content_type VARCHAR(255) NOT NULL,
	category VARCHAR(100),
	description TEXT,
	default_attributes TEXT, -- JSON object
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Asset Types Table
CREATE TABLE IF NOT EXISTS asset_types (
	id SERIAL PRIMARY KEY,
	asset_type VARCHAR(255) NOT NULL,
	dimension VARCHAR(100),
	file_formats VARCHAR(255),
	description TEXT,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Asset Category Master Table
CREATE TABLE IF NOT EXISTS asset_category_master (
	id SERIAL PRIMARY KEY,
	brand VARCHAR(255) NOT NULL,
	category_name VARCHAR(255) NOT NULL,
	word_count INTEGER NOT NULL DEFAULT 0,
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW(),
	UNIQUE(brand, category_name)
);

-- Asset Type Master Table
CREATE TABLE IF NOT EXISTS asset_type_master (
	id SERIAL PRIMARY KEY,
	brand VARCHAR(255) NOT NULL,
	asset_type_name VARCHAR(255) NOT NULL,
	word_count INTEGER NOT NULL DEFAULT 0,
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW(),
	UNIQUE(brand, asset_type_name)
);

-- Asset Format Master Table
CREATE TABLE IF NOT EXISTS asset_formats (
	id SERIAL PRIMARY KEY,
	format_name VARCHAR(255) NOT NULL,
	format_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'document', 'audio'
	file_extensions TEXT, -- JSON array of file extensions
	max_file_size_mb INTEGER DEFAULT 10,
	description TEXT,
	application_types TEXT, -- JSON array: ['web', 'seo', 'smm']
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Platforms Table
CREATE TABLE IF NOT EXISTS platforms (
	id SERIAL PRIMARY KEY,
	platform_name VARCHAR(255) NOT NULL,
	recommended_size VARCHAR(100),
	scheduling VARCHAR(100),
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Countries Table
CREATE TABLE IF NOT EXISTS countries (
	id SERIAL PRIMARY KEY,
	country_name VARCHAR(255) NOT NULL,
	code VARCHAR(10),
	region VARCHAR(100),
	has_backlinks BOOLEAN DEFAULT false,
	has_content BOOLEAN DEFAULT false,
	has_smm BOOLEAN DEFAULT false,
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Personas Table
CREATE TABLE IF NOT EXISTS personas (
	id SERIAL PRIMARY KEY,
	persona_name VARCHAR(255) NOT NULL,
	segment VARCHAR(255),
	role VARCHAR(255),
	funnel_stage VARCHAR(100),
	description TEXT,
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Forms Table
CREATE TABLE IF NOT EXISTS forms (
	id SERIAL PRIMARY KEY,
	form_name VARCHAR(255) NOT NULL,
	form_type VARCHAR(100),
	data_source VARCHAR(255),
	target_url VARCHAR(1000),
	status VARCHAR(50) DEFAULT 'active',
	owner_id INTEGER REFERENCES users(id),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow Stages Table
CREATE TABLE IF NOT EXISTS workflow_stages (
	id SERIAL PRIMARY KEY,
	workflow_name VARCHAR(255),
	stage_order INTEGER,
	stage_label VARCHAR(255),
	color_tag VARCHAR(50),
	active_flag BOOLEAN DEFAULT true,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- User Roles Table (Master)
CREATE TABLE IF NOT EXISTS user_roles (
	id SERIAL PRIMARY KEY,
	role_name VARCHAR(255) NOT NULL,
	role_description TEXT,
	permissions TEXT, -- JSON array
	status VARCHAR(50) DEFAULT 'active',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_brand_id ON projects(brand_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(project_owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(project_status);

-- Campaigns indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON campaigns(campaign_owner_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_campaign_id ON tasks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(primary_owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Content Repository indexes
CREATE INDEX IF NOT EXISTS idx_content_repository_status ON content_repository(status);
CREATE INDEX IF NOT EXISTS idx_content_repository_campaign ON content_repository(linked_campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_repository_assigned ON content_repository(assigned_to_id);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- Backlink Submissions indexes
CREATE INDEX IF NOT EXISTS idx_backlink_submissions_source ON backlink_submissions(backlink_source_id);
CREATE INDEX IF NOT EXISTS idx_backlink_submissions_status ON backlink_submissions(submission_status);

-- QC Runs indexes
CREATE INDEX IF NOT EXISTS idx_qc_runs_target ON qc_runs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_qc_runs_owner ON qc_runs(qc_owner_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_daily_traffic_date ON analytics_daily_traffic(date);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'User accounts and authentication';
COMMENT ON TABLE projects IS 'Marketing projects';
COMMENT ON TABLE campaigns IS 'Marketing campaigns within projects';
COMMENT ON TABLE tasks IS 'Individual tasks within campaigns';
COMMENT ON TABLE content_repository IS 'Content assets repository';
COMMENT ON TABLE services IS 'Service master pages';
COMMENT ON TABLE sub_services IS 'Sub-service pages';
COMMENT ON TABLE backlink_submissions IS 'Backlink submission tracking';
COMMENT ON TABLE toxic_backlinks IS 'Toxic backlink monitoring';
COMMENT ON TABLE qc_runs IS 'Quality control runs';
COMMENT ON TABLE analytics_daily_traffic IS 'Daily traffic analytics';
COMMENT ON TABLE notifications IS 'System notifications';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
