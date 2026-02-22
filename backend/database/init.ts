import { pool } from '../config/db';
import fs from 'fs';
import path from 'path';

export const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing database schema...');

        // Use PostgreSQL schema for production
        const isPostgres = process.env.NODE_ENV === 'production' || process.env.USE_PG === 'true';

        if (!isPostgres) {
            // SQLite: Create essential tables directly
            console.log('[DB] Creating SQLite tables...');

            const tables = [
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    role TEXT DEFAULT 'user',
                    status TEXT DEFAULT 'active',
                    password_hash TEXT,
                    department TEXT,
                    country TEXT,
                    last_login TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS brands (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    code TEXT,
                    industry TEXT,
                    website TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS projects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_name TEXT NOT NULL,
                    project_code TEXT UNIQUE,
                    description TEXT,
                    status TEXT DEFAULT 'Planned',
                    start_date DATE,
                    end_date DATE,
                    budget DECIMAL(10,2),
                    owner_id INTEGER REFERENCES users(id),
                    brand_id INTEGER REFERENCES brands(id),
                    linked_service_id INTEGER,
                    priority TEXT DEFAULT 'Medium',
                    sub_services TEXT,
                    outcome_kpis TEXT,
                    expected_outcome TEXT,
                    team_members TEXT,
                    weekly_report INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS campaigns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    campaign_name TEXT NOT NULL,
                    campaign_type TEXT DEFAULT 'Content',
                    status TEXT DEFAULT 'planning',
                    description TEXT,
                    campaign_start_date DATE,
                    campaign_end_date DATE,
                    campaign_owner_id INTEGER,
                    project_id INTEGER,
                    brand_id INTEGER,
                    linked_service_ids TEXT,
                    target_url TEXT,
                    backlinks_planned INTEGER DEFAULT 0,
                    backlinks_completed INTEGER DEFAULT 0,
                    tasks_completed INTEGER DEFAULT 0,
                    tasks_total INTEGER DEFAULT 0,
                    kpi_score INTEGER DEFAULT 0,
                    sub_campaigns TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_name TEXT NOT NULL,
                    description TEXT,
                    status TEXT DEFAULT 'pending',
                    priority TEXT DEFAULT 'Medium',
                    assigned_to INTEGER REFERENCES users(id),
                    project_id INTEGER REFERENCES projects(id),
                    campaign_id INTEGER REFERENCES campaigns(id),
                    due_date DATE,
                    campaign_type TEXT,
                    sub_campaign TEXT,
                    progress_stage TEXT DEFAULT 'Not Started',
                    qc_stage TEXT DEFAULT 'Pending',
                    estimated_hours DECIMAL(5,2),
                    tags TEXT,
                    repo_links TEXT,
                    rework_count INTEGER DEFAULT 0,
                    repo_link_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    title TEXT,
                    message TEXT,
                    type TEXT,
                    is_read INTEGER DEFAULT 0,
                    link TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS assets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    asset_name TEXT NOT NULL,
                    asset_type TEXT,
                    asset_category TEXT,
                    asset_format TEXT,
                    status TEXT DEFAULT 'draft',
                    qc_status TEXT,
                    file_url TEXT,
                    thumbnail_url TEXT,
                    og_image_url TEXT,
                    file_size INTEGER,
                    file_type TEXT,
                    application_type TEXT,
                    keywords TEXT,
                    content_keywords TEXT,
                    seo_keywords TEXT,
                    web_title TEXT,
                    web_description TEXT,
                    web_meta_description TEXT,
                    web_keywords TEXT,
                    web_url TEXT,
                    web_h1 TEXT,
                    web_h2_1 TEXT,
                    web_h2_2 TEXT,
                    web_h3_tags TEXT,
                    web_thumbnail TEXT,
                    web_body_content TEXT,
                    smm_platform TEXT,
                    smm_title TEXT,
                    smm_tag TEXT,
                    smm_url TEXT,
                    smm_description TEXT,
                    smm_hashtags TEXT,
                    smm_media_url TEXT,
                    smm_media_type TEXT,
                    seo_score INTEGER,
                    grammar_score INTEGER,
                    ai_plagiarism_score INTEGER,
                    linked_service_ids TEXT,
                    linked_sub_service_ids TEXT,
                    linked_task_id INTEGER,
                    linked_campaign_id INTEGER,
                    linked_project_id INTEGER,
                    linked_service_id INTEGER,
                    linked_sub_service_id INTEGER,
                    linked_repository_item_id INTEGER,
                    designed_by INTEGER,
                    published_by INTEGER,
                    verified_by INTEGER,
                    version_number TEXT,
                    submitted_by INTEGER,
                    submitted_at TIMESTAMP,
                    workflow_stage TEXT,
                    resource_files TEXT,
                    workflow_log TEXT,
                    version_history TEXT,
                    linking_active INTEGER DEFAULT 0,
                    usage_status TEXT DEFAULT 'Available',
                    rework_count INTEGER DEFAULT 0,
                    qc_score INTEGER,
                    qc_remarks TEXT,
                    qc_reviewer_id INTEGER,
                    qc_reviewed_at TIMESTAMP,
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS industry_sectors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sector VARCHAR(255) NOT NULL,
                    industry VARCHAR(255) NOT NULL,
                    application VARCHAR(255),
                    country VARCHAR(100),
                    description TEXT,
                    status VARCHAR(50) DEFAULT 'active',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS services (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    service_name TEXT NOT NULL,
                    service_code TEXT,
                    slug TEXT UNIQUE,
                    full_url TEXT,
                    description TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS sub_services (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sub_service_name TEXT NOT NULL,
                    parent_service_id INTEGER REFERENCES services(id),
                    slug TEXT,
                    full_url TEXT,
                    description TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS service_asset_links (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    asset_id INTEGER NOT NULL REFERENCES assets(id),
                    service_id INTEGER NOT NULL REFERENCES services(id),
                    sub_service_id INTEGER REFERENCES sub_services(id),
                    is_static INTEGER DEFAULT 0,
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(asset_id, service_id, sub_service_id)
                )`,
                `CREATE TABLE IF NOT EXISTS subservice_asset_links (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    asset_id INTEGER NOT NULL REFERENCES assets(id),
                    sub_service_id INTEGER NOT NULL REFERENCES sub_services(id),
                    is_static INTEGER DEFAULT 0,
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(asset_id, sub_service_id)
                )`,
                `CREATE TABLE IF NOT EXISTS keywords (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    keyword TEXT,
                    keyword_name TEXT UNIQUE,
                    keyword_code TEXT,
                    keyword_intent TEXT,
                    keyword_type TEXT,
                    language TEXT,
                    search_volume INTEGER,
                    difficulty_score INTEGER,
                    mapped_service_id INTEGER,
                    mapped_service TEXT,
                    mapped_sub_service_id INTEGER,
                    mapped_sub_service TEXT,
                    keyword_category TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS backlink_sources (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT NOT NULL,
                    backlink_url TEXT,
                    backlink_category TEXT,
                    niche_industry TEXT,
                    da_score INTEGER DEFAULT 0,
                    spam_score INTEGER DEFAULT 0,
                    pricing TEXT DEFAULT 'Free',
                    country TEXT,
                    username TEXT,
                    password TEXT,
                    credentials_notes TEXT,
                    status TEXT DEFAULT 'active',
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS competitor_benchmarks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    competitor_name TEXT NOT NULL,
                    competitor_domain TEXT,
                    monthly_traffic INTEGER,
                    total_keywords INTEGER,
                    backlinks INTEGER,
                    ranking_coverage REAL,
                    status TEXT DEFAULT 'active',
                    updated_on TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS teams (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    lead_user_id INTEGER,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS content_repository (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content_type TEXT,
                    content TEXT,
                    status TEXT DEFAULT 'draft',
                    linked_service_id INTEGER,
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS smm_posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT,
                    smm_type TEXT,
                    content_type TEXT,
                    primary_platform TEXT,
                    smm_status TEXT DEFAULT 'draft',
                    schedule_date DATE,
                    schedule_time TIME,
                    caption TEXT,
                    hashtags TEXT,
                    asset_url TEXT,
                    asset_count INTEGER,
                    service_id INTEGER,
                    sub_service_id INTEGER,
                    campaign_id INTEGER,
                    assigned_to_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS graphic_assets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    asset_name TEXT NOT NULL,
                    asset_type TEXT,
                    file_url TEXT,
                    dimensions TEXT,
                    file_format TEXT,
                    file_size_kb INTEGER,
                    tags TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS okrs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    objective TEXT NOT NULL,
                    type TEXT,
                    cycle TEXT,
                    owner_id INTEGER,
                    owner TEXT,
                    alignment TEXT,
                    progress REAL DEFAULT 0,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS personas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    persona_name TEXT NOT NULL,
                    description TEXT,
                    demographics TEXT,
                    goals TEXT,
                    pain_points TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS forms (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    form_name TEXT NOT NULL,
                    form_type TEXT,
                    fields TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS qc_checklists (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    checklist_name TEXT NOT NULL,
                    checklist_type TEXT,
                    category TEXT,
                    number_of_items INTEGER,
                    scoring_mode TEXT,
                    pass_threshold REAL,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS asset_category_master (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category_name TEXT UNIQUE NOT NULL,
                    category_code TEXT,
                    description TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS asset_formats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    format_name TEXT UNIQUE NOT NULL,
                    format_code TEXT,
                    description TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS asset_format_master (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    format_name TEXT UNIQUE NOT NULL,
                    format_type TEXT,
                    file_extensions TEXT,
                    max_file_size_mb INTEGER DEFAULT 50,
                    description TEXT,
                    application_types TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS platforms (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    platform_name TEXT UNIQUE NOT NULL,
                    platform_code TEXT,
                    recommended_size TEXT,
                    scheduling TEXT,
                    description TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS countries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    country_name TEXT UNIQUE NOT NULL,
                    country_code TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            ];

            for (const tableSQL of tables) {
                try {
                    await pool.query(tableSQL);
                } catch (e: any) {
                    if (!e.message.includes('already exists')) {
                        console.warn('[DB] Table creation warning:', e.message.substring(0, 80));
                    }
                }
            }

            // Add missing columns to assets table if they don't exist
            const columnsToAdd = [
                { name: 'application_type', type: 'TEXT' },
                { name: 'seo_score', type: 'INTEGER' },
                { name: 'grammar_score', type: 'INTEGER' },
                { name: 'submitted_by', type: 'INTEGER' },
                { name: 'submitted_at', type: 'TIMESTAMP' },
                { name: 'qc_status', type: 'TEXT' },
                { name: 'thumbnail_url', type: 'TEXT' },
                { name: 'workflow_log', type: 'TEXT' },
                { name: 'usage_status', type: 'TEXT' },
                { name: 'rework_count', type: 'INTEGER' },
                { name: 'qc_score', type: 'INTEGER' },
                { name: 'qc_remarks', type: 'TEXT' },
                { name: 'qc_reviewer_id', type: 'INTEGER' },
                { name: 'qc_reviewed_at', type: 'TIMESTAMP' },
                { name: 'linked_service_ids', type: 'TEXT' },
                { name: 'linked_sub_service_ids', type: 'TEXT' },
                { name: 'static_service_links', type: 'TEXT' },
                { name: 'file_size', type: 'INTEGER' },
                { name: 'file_type', type: 'TEXT' },
                { name: 'web_title', type: 'TEXT' },
                { name: 'web_description', type: 'TEXT' },
                { name: 'web_meta_description', type: 'TEXT' },
                { name: 'web_keywords', type: 'TEXT' },
                { name: 'web_url', type: 'TEXT' },
                { name: 'web_h1', type: 'TEXT' },
                { name: 'web_h2_1', type: 'TEXT' },
                { name: 'web_h2_2', type: 'TEXT' },
                { name: 'web_h3_tags', type: 'TEXT' },
                { name: 'web_thumbnail', type: 'TEXT' },
                { name: 'web_body_content', type: 'TEXT' },
                { name: 'smm_platform', type: 'TEXT' },
                { name: 'smm_title', type: 'TEXT' },
                { name: 'smm_tag', type: 'TEXT' },
                { name: 'smm_url', type: 'TEXT' },
                { name: 'smm_description', type: 'TEXT' },
                { name: 'smm_hashtags', type: 'TEXT' },
                { name: 'smm_media_url', type: 'TEXT' },
                { name: 'smm_media_type', type: 'TEXT' },
                { name: 'keywords', type: 'TEXT' },
                { name: 'content_keywords', type: 'TEXT' },
                { name: 'seo_keywords', type: 'TEXT' },
                { name: 'ai_plagiarism_score', type: 'INTEGER' },
                { name: 'linked_task_id', type: 'INTEGER' },
                { name: 'linked_campaign_id', type: 'INTEGER' },
                { name: 'linked_project_id', type: 'INTEGER' },
                { name: 'linked_service_id', type: 'INTEGER' },
                { name: 'linked_sub_service_id', type: 'INTEGER' },
                { name: 'linked_repository_item_id', type: 'INTEGER' },
                { name: 'designed_by', type: 'INTEGER' },
                { name: 'published_by', type: 'INTEGER' },
                { name: 'verified_by', type: 'INTEGER' },
                { name: 'version_number', type: 'TEXT' },
                { name: 'resource_files', type: 'TEXT' },
                { name: 'version_history', type: 'TEXT' },
                { name: 'linking_active', type: 'INTEGER' },
                { name: 'og_image_url', type: 'TEXT' }
            ];

            for (const column of columnsToAdd) {
                try {
                    // Try to select the column to see if it exists
                    await pool.query(`SELECT ${column.name} FROM assets LIMIT 1`);
                } catch (e: any) {
                    if (e.message.includes('no such column')) {
                        try {
                            console.log(`[DB] Adding missing column: ${column.name}`);
                            await pool.query(`ALTER TABLE assets ADD COLUMN ${column.name} ${column.type}`);
                            console.log(`[DB] ✅ Column added: ${column.name}`);
                        } catch (alterErr: any) {
                            console.warn(`[DB] Could not add column ${column.name}:`, alterErr.message.substring(0, 80));
                        }
                    }
                }
            }

            // Add missing columns to services table
            const serviceColumnsToAdd = [
                { name: 'slug', type: 'TEXT' },
                { name: 'full_url', type: 'TEXT' },
                { name: 'service_code', type: 'TEXT' },
                { name: 'menu_heading', type: 'TEXT' },
                { name: 'short_tagline', type: 'TEXT' },
                { name: 'service_description', type: 'TEXT' },
                { name: 'industry_ids', type: 'TEXT' },
                { name: 'country_ids', type: 'TEXT' },
                { name: 'language', type: 'TEXT' },
                { name: 'show_in_main_menu', type: 'INTEGER' },
                { name: 'show_in_footer_menu', type: 'INTEGER' },
                { name: 'menu_group', type: 'TEXT' },
                { name: 'menu_position', type: 'INTEGER' },
                { name: 'breadcrumb_label', type: 'TEXT' },
                { name: 'parent_menu_section', type: 'TEXT' },
                { name: 'include_in_xml_sitemap', type: 'INTEGER' },
                { name: 'sitemap_priority', type: 'REAL' },
                { name: 'sitemap_changefreq', type: 'TEXT' },
                { name: 'content_type', type: 'TEXT' },
                { name: 'buyer_journey_stage', type: 'TEXT' },
                { name: 'primary_persona_id', type: 'INTEGER' },
                { name: 'secondary_persona_ids', type: 'TEXT' },
                { name: 'target_segment_notes', type: 'TEXT' },
                { name: 'primary_cta_label', type: 'TEXT' },
                { name: 'primary_cta_url', type: 'TEXT' },
                { name: 'form_id', type: 'INTEGER' },
                { name: 'linked_campaign_ids', type: 'TEXT' },
                { name: 'h1', type: 'TEXT' },
                { name: 'h2_list', type: 'TEXT' },
                { name: 'h3_list', type: 'TEXT' },
                { name: 'h4_list', type: 'TEXT' },
                { name: 'h5_list', type: 'TEXT' },
                { name: 'body_content', type: 'TEXT' },
                { name: 'internal_links', type: 'TEXT' },
                { name: 'external_links', type: 'TEXT' },
                { name: 'image_alt_texts', type: 'TEXT' },
                { name: 'word_count', type: 'INTEGER' },
                { name: 'reading_time_minutes', type: 'INTEGER' },
                { name: 'meta_title', type: 'TEXT' },
                { name: 'meta_description', type: 'TEXT' },
                { name: 'meta_keywords', type: 'TEXT' },
                { name: 'focus_keywords', type: 'TEXT' },
                { name: 'secondary_keywords', type: 'TEXT' },
                { name: 'seo_score', type: 'INTEGER' },
                { name: 'ranking_summary', type: 'TEXT' },
                { name: 'og_title', type: 'TEXT' },
                { name: 'og_description', type: 'TEXT' },
                { name: 'og_image_url', type: 'TEXT' },
                { name: 'og_type', type: 'TEXT' },
                { name: 'twitter_title', type: 'TEXT' },
                { name: 'twitter_description', type: 'TEXT' },
                { name: 'twitter_image_url', type: 'TEXT' },
                { name: 'linkedin_title', type: 'TEXT' },
                { name: 'linkedin_description', type: 'TEXT' },
                { name: 'linkedin_image_url', type: 'TEXT' },
                { name: 'facebook_title', type: 'TEXT' },
                { name: 'facebook_description', type: 'TEXT' },
                { name: 'facebook_image_url', type: 'TEXT' },
                { name: 'instagram_title', type: 'TEXT' },
                { name: 'instagram_description', type: 'TEXT' },
                { name: 'instagram_image_url', type: 'TEXT' },
                { name: 'social_meta', type: 'TEXT' },
                { name: 'schema_type_id', type: 'INTEGER' },
                { name: 'robots_index', type: 'TEXT' },
                { name: 'robots_follow', type: 'TEXT' },
                { name: 'robots_custom', type: 'TEXT' },
                { name: 'canonical_url', type: 'TEXT' },
                { name: 'redirect_from_urls', type: 'TEXT' },
                { name: 'hreflang_group_id', type: 'INTEGER' },
                { name: 'core_web_vitals_status', type: 'TEXT' },
                { name: 'tech_seo_status', type: 'TEXT' },
                { name: 'faq_section_enabled', type: 'INTEGER' },
                { name: 'faq_content', type: 'TEXT' },
                { name: 'has_subservices', type: 'INTEGER' },
                { name: 'subservice_count', type: 'INTEGER' },
                { name: 'primary_subservice_id', type: 'INTEGER' },
                { name: 'featured_asset_id', type: 'INTEGER' },
                { name: 'asset_count', type: 'INTEGER' },
                { name: 'knowledge_topic_id', type: 'INTEGER' },
                { name: 'linked_insights_ids', type: 'TEXT' },
                { name: 'linked_assets_ids', type: 'TEXT' },
                { name: 'brand_id', type: 'INTEGER' },
                { name: 'business_unit', type: 'TEXT' },
                { name: 'content_owner_id', type: 'INTEGER' },
                { name: 'created_by', type: 'INTEGER' },
                { name: 'updated_by', type: 'INTEGER' },
                { name: 'version_number', type: 'TEXT' },
                { name: 'change_log_link', type: 'TEXT' }
            ];

            for (const column of serviceColumnsToAdd) {
                try {
                    await pool.query(`SELECT ${column.name} FROM services LIMIT 1`);
                } catch (e: any) {
                    if (e.message.includes('no such column')) {
                        try {
                            console.log(`[DB] Adding missing column to services: ${column.name}`);
                            await pool.query(`ALTER TABLE services ADD COLUMN ${column.name} ${column.type}`);
                            console.log(`[DB] ✅ Column added to services: ${column.name}`);
                        } catch (alterErr: any) {
                            console.warn(`[DB] Could not add column to services ${column.name}:`, alterErr.message.substring(0, 80));
                        }
                    }
                }
            }

            // Add missing columns to sub_services table
            const subServiceColumnsToAdd = [
                { name: 'slug', type: 'TEXT' },
                { name: 'full_url', type: 'TEXT' },
                { name: 'sub_service_code', type: 'TEXT' },
                { name: 'menu_heading', type: 'TEXT' },
                { name: 'short_tagline', type: 'TEXT' },
                { name: 'language', type: 'TEXT' },
                { name: 'industry_ids', type: 'TEXT' },
                { name: 'country_ids', type: 'TEXT' },
                { name: 'h1', type: 'TEXT' },
                { name: 'h2_list', type: 'TEXT' },
                { name: 'h3_list', type: 'TEXT' },
                { name: 'h4_list', type: 'TEXT' },
                { name: 'h5_list', type: 'TEXT' },
                { name: 'body_content', type: 'TEXT' },
                { name: 'word_count', type: 'INTEGER' },
                { name: 'reading_time_minutes', type: 'INTEGER' },
                { name: 'meta_title', type: 'TEXT' },
                { name: 'meta_description', type: 'TEXT' },
                { name: 'meta_keywords', type: 'TEXT' },
                { name: 'focus_keywords', type: 'TEXT' },
                { name: 'secondary_keywords', type: 'TEXT' },
                { name: 'seo_score', type: 'INTEGER' },
                { name: 'ranking_summary', type: 'TEXT' },
                { name: 'og_title', type: 'TEXT' },
                { name: 'og_description', type: 'TEXT' },
                { name: 'og_image_url', type: 'TEXT' },
                { name: 'og_type', type: 'TEXT' },
                { name: 'twitter_title', type: 'TEXT' },
                { name: 'twitter_description', type: 'TEXT' },
                { name: 'twitter_image_url', type: 'TEXT' },
                { name: 'linkedin_title', type: 'TEXT' },
                { name: 'linkedin_description', type: 'TEXT' },
                { name: 'linkedin_image_url', type: 'TEXT' },
                { name: 'facebook_title', type: 'TEXT' },
                { name: 'facebook_description', type: 'TEXT' },
                { name: 'facebook_image_url', type: 'TEXT' },
                { name: 'instagram_title', type: 'TEXT' },
                { name: 'instagram_description', type: 'TEXT' },
                { name: 'instagram_image_url', type: 'TEXT' },
                { name: 'menu_position', type: 'INTEGER' },
                { name: 'breadcrumb_label', type: 'TEXT' },
                { name: 'include_in_xml_sitemap', type: 'INTEGER' },
                { name: 'sitemap_priority', type: 'REAL' },
                { name: 'sitemap_changefreq', type: 'TEXT' },
                { name: 'content_type', type: 'TEXT' },
                { name: 'buyer_journey_stage', type: 'TEXT' },
                { name: 'primary_cta_label', type: 'TEXT' },
                { name: 'primary_cta_url', type: 'TEXT' },
                { name: 'robots_index', type: 'TEXT' },
                { name: 'robots_follow', type: 'TEXT' },
                { name: 'robots_custom', type: 'TEXT' },
                { name: 'canonical_url', type: 'TEXT' },
                { name: 'schema_type_id', type: 'TEXT' },
                { name: 'redirect_from_urls', type: 'TEXT' },
                { name: 'hreflang_group_id', type: 'INTEGER' },
                { name: 'core_web_vitals_status', type: 'TEXT' },
                { name: 'tech_seo_status', type: 'TEXT' },
                { name: 'faq_section_enabled', type: 'INTEGER' },
                { name: 'faq_content', type: 'TEXT' },
                { name: 'linked_insights_ids', type: 'TEXT' },
                { name: 'linked_assets_ids', type: 'TEXT' },
                { name: 'brand_id', type: 'INTEGER' },
                { name: 'content_owner_id', type: 'INTEGER' },
                { name: 'created_by', type: 'INTEGER' },
                { name: 'updated_by', type: 'INTEGER' },
                { name: 'version_number', type: 'TEXT' },
                { name: 'change_log_link', type: 'TEXT' },
                { name: 'social_meta', type: 'TEXT' },
                { name: 'assets_linked', type: 'INTEGER' },
                { name: 'working_on_by', type: 'INTEGER' },
                { name: 'internal_links', type: 'TEXT' },
                { name: 'external_links', type: 'TEXT' },
                { name: 'image_alt_texts', type: 'TEXT' }
            ];

            for (const column of subServiceColumnsToAdd) {
                try {
                    await pool.query(`SELECT ${column.name} FROM sub_services LIMIT 1`);
                } catch (e: any) {
                    if (e.message.includes('no such column')) {
                        try {
                            console.log(`[DB] Adding missing column to sub_services: ${column.name}`);
                            await pool.query(`ALTER TABLE sub_services ADD COLUMN ${column.name} ${column.type}`);
                            console.log(`[DB] ✅ Column added to sub_services: ${column.name}`);
                        } catch (alterErr: any) {
                            console.warn(`[DB] Could not add column to sub_services ${column.name}:`, alterErr.message.substring(0, 80));
                        }
                    }
                }
            }

            // Add missing columns to content_repository table
            const contentColumnsToAdd = [
                { name: 'linked_service_id', type: 'INTEGER' },
                { name: 'linked_sub_service_id', type: 'INTEGER' },
                { name: 'assigned_to_id', type: 'INTEGER' },
                { name: 'last_status_update_at', type: 'TIMESTAMP' }
            ];

            for (const column of contentColumnsToAdd) {
                try {
                    await pool.query(`SELECT ${column.name} FROM content_repository LIMIT 1`);
                } catch (e: any) {
                    if (e.message.includes('no such column')) {
                        try {
                            console.log(`[DB] Adding missing column to content_repository: ${column.name}`);
                            await pool.query(`ALTER TABLE content_repository ADD COLUMN ${column.name} ${column.type}`);
                            console.log(`[DB] ✅ Column added to content_repository: ${column.name}`);
                        } catch (alterErr: any) {
                            console.warn(`[DB] Could not add column to content_repository ${column.name}:`, alterErr.message.substring(0, 80));
                        }
                    }
                }
            }

            // Add missing columns to smm_posts table
            const smmColumnsToAdd = [
                { name: 'campaign_id', type: 'INTEGER' }
            ];

            for (const column of smmColumnsToAdd) {
                try {
                    await pool.query(`SELECT ${column.name} FROM smm_posts LIMIT 1`);
                } catch (e: any) {
                    if (e.message.includes('no such column')) {
                        try {
                            console.log(`[DB] Adding missing column to smm_posts: ${column.name}`);
                            await pool.query(`ALTER TABLE smm_posts ADD COLUMN ${column.name} ${column.type}`);
                            console.log(`[DB] ✅ Column added to smm_posts: ${column.name}`);
                        } catch (alterErr: any) {
                            console.warn(`[DB] Could not add column to smm_posts ${column.name}:`, alterErr.message.substring(0, 80));
                        }
                    }
                }
            }

            // Add missing columns to okrs table
            const okrsColumnsToAdd = [
                { name: 'owner_id', type: 'INTEGER' },
                { name: 'reviewer_id', type: 'INTEGER' }
            ];

            for (const column of okrsColumnsToAdd) {
                try {
                    await pool.query(`SELECT ${column.name} FROM okrs LIMIT 1`);
                } catch (e: any) {
                    if (e.message.includes('no such column')) {
                        try {
                            console.log(`[DB] Adding missing column to okrs: ${column.name}`);
                            await pool.query(`ALTER TABLE okrs ADD COLUMN ${column.name} ${column.type}`);
                            console.log(`[DB] ✅ Column added to okrs: ${column.name}`);
                        } catch (alterErr: any) {
                            console.warn(`[DB] Could not add column to okrs ${column.name}:`, alterErr.message.substring(0, 80));
                        }
                    }
                }
            }
        }

        console.log('✅ Database schema initialized successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
};

export const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database with initial data...');

        // Create admin user if it doesn't exist
        try {
            const adminCheck = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
            if (!adminCheck.rows || adminCheck.rows.length === 0) {
                // Create admin user
                try {
                    await pool.query(
                        'INSERT INTO users (id, name, email, role, status, department, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [1, 'Admin User', 'admin@example.com', 'admin', 'active', 'Administration', new Date().toISOString()]
                    );
                    console.log('✅ Admin user created');
                } catch (insertErr: any) {
                    console.error('❌ Error creating admin user:', insertErr.message);
                }
            } else {
                console.log('✅ Admin user already exists');
            }
        } catch (e: any) {
            console.warn('⚠️  Could not check/create admin user:', (e as any).message);
        }

        // Seed industry_sectors if empty
        try {
            const sectorCheck = await pool.query('SELECT COUNT(*) as count FROM industry_sectors');
            const count = sectorCheck.rows?.[0]?.count || 0;

            if (count === 0) {
                console.log('🌱 Seeding industry_sectors...');
                const sampleData = [
                    // Healthcare Sector
                    { sector: 'Healthcare', industry: 'Pharmaceuticals', application: 'Medical Research', country: 'Global' },
                    { sector: 'Healthcare', industry: 'Medical Devices', application: 'Clinical Trials', country: 'Global' },
                    { sector: 'Healthcare', industry: 'Biotechnology', application: 'Drug Development', country: 'Global' },
                    { sector: 'Healthcare', industry: 'Hospitals', application: 'Patient Care', country: 'Global' },
                    { sector: 'Healthcare', industry: 'Telemedicine', application: 'Remote Healthcare', country: 'Global' },

                    // Finance Sector
                    { sector: 'Finance', industry: 'Banking', application: 'Financial Services', country: 'Global' },
                    { sector: 'Finance', industry: 'Insurance', application: 'Risk Management', country: 'Global' },
                    { sector: 'Finance', industry: 'Investment', application: 'Asset Management', country: 'Global' },
                    { sector: 'Finance', industry: 'Fintech', application: 'Digital Payments', country: 'Global' },

                    // Technology Sector
                    { sector: 'Technology', industry: 'Software', application: 'Enterprise Solutions', country: 'Global' },
                    { sector: 'Technology', industry: 'Hardware', application: 'Computing Devices', country: 'Global' },
                    { sector: 'Technology', industry: 'Cloud Services', application: 'Infrastructure', country: 'Global' },
                    { sector: 'Technology', industry: 'Cybersecurity', application: 'Data Protection', country: 'Global' },
                    { sector: 'Technology', industry: 'AI/ML', application: 'Automation', country: 'Global' },

                    // Education Sector
                    { sector: 'Education', industry: 'Higher Education', application: 'Academic Research', country: 'Global' },
                    { sector: 'Education', industry: 'E-Learning', application: 'Online Courses', country: 'Global' },
                    { sector: 'Education', industry: 'EdTech', application: 'Learning Platforms', country: 'Global' },

                    // Manufacturing Sector
                    { sector: 'Manufacturing', industry: 'Automotive', application: 'Vehicle Production', country: 'Global' },
                    { sector: 'Manufacturing', industry: 'Electronics', application: 'Consumer Electronics', country: 'Global' },
                    { sector: 'Manufacturing', industry: 'Aerospace', application: 'Aviation', country: 'Global' },

                    // Retail Sector
                    { sector: 'Retail', industry: 'E-commerce', application: 'Online Shopping', country: 'Global' },
                    { sector: 'Retail', industry: 'Fashion', application: 'Apparel', country: 'Global' },
                    { sector: 'Retail', industry: 'Consumer Goods', application: 'FMCG', country: 'Global' },

                    // Energy Sector
                    { sector: 'Energy', industry: 'Oil & Gas', application: 'Exploration', country: 'Global' },
                    { sector: 'Energy', industry: 'Renewable Energy', application: 'Solar/Wind', country: 'Global' },
                    { sector: 'Energy', industry: 'Utilities', application: 'Power Distribution', country: 'Global' }
                ];

                for (const data of sampleData) {
                    try {
                        await pool.query(
                            'INSERT INTO industry_sectors (sector, industry, application, country, status) VALUES (?, ?, ?, ?, ?)',
                            [data.sector, data.industry, data.application, data.country, 'active']
                        );
                    } catch (e: any) {
                        // Ignore duplicate errors
                        if (!e.message.includes('UNIQUE') && !e.message.includes('duplicate')) {
                            console.warn('⚠️  Error seeding sector:', e.message.substring(0, 80));
                        }
                    }
                }
                console.log('✅ Industry sectors seeded');
            } else {
                console.log('✅ Industry sectors already exist');
            }
        } catch (e: any) {
            console.warn('⚠️  Could not seed industry_sectors:', (e as any).message);
        }

        console.log('✅ Database seeding completed successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Database seeding failed:', error.message);
        throw error;
    }
};

/**
 * Reset database (drop and reinitialize)
 */
export const resetDatabase = async () => {
    try {
        console.log('🔄 Resetting database...');
        await initializeDatabase();
        await seedDatabase();
        console.log('✅ Database reset completed successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Database reset failed:', error.message);
        throw error;
    }
};
