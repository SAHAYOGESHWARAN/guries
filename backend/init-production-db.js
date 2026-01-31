/**
 * Production Database Initialization Script
 * Complete setup for deployment with all tables and proper schema
 * Usage: node init-production-db.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

console.log('🚀 Starting production database initialization...\n');

try {
    // Backup existing database if it exists
    if (fs.existsSync(dbPath)) {
        const backupPath = path.join(__dirname, `mcc_db.sqlite.backup.${Date.now()}`);
        fs.copyFileSync(dbPath, backupPath);
        console.log(`📦 Backed up existing database to ${backupPath}`);
    }

    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');

    console.log('📋 Creating all required tables...\n');

    // ==================== CORE TABLES ====================

    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'user',
            status TEXT DEFAULT 'active',
            password_hash TEXT,
            department TEXT,
            country TEXT,
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Brands table
    db.exec(`
        CREATE TABLE IF NOT EXISTS brands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            code TEXT,
            industry TEXT,
            website TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Services table
    db.exec(`
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_name TEXT NOT NULL,
            service_code TEXT,
            slug TEXT,
            full_url TEXT,
            menu_heading TEXT,
            short_tagline TEXT,
            service_description TEXT,
            industry_ids TEXT,
            country_ids TEXT,
            language TEXT DEFAULT 'en',
            status TEXT DEFAULT 'draft',
            show_in_main_menu INTEGER DEFAULT 0,
            show_in_footer_menu INTEGER DEFAULT 0,
            menu_group TEXT,
            menu_position INTEGER,
            breadcrumb_label TEXT,
            parent_menu_section TEXT,
            include_in_xml_sitemap INTEGER DEFAULT 1,
            sitemap_priority REAL DEFAULT 0.8,
            sitemap_changefreq TEXT DEFAULT 'monthly',
            content_type TEXT,
            buyer_journey_stage TEXT,
            primary_persona_id INTEGER,
            secondary_persona_ids TEXT,
            target_segment_notes TEXT,
            primary_cta_label TEXT,
            primary_cta_url TEXT,
            form_id INTEGER,
            linked_campaign_ids TEXT,
            h1 TEXT,
            h2_list TEXT,
            h3_list TEXT,
            h4_list TEXT,
            h5_list TEXT,
            body_content TEXT,
            internal_links TEXT,
            external_links TEXT,
            image_alt_texts TEXT,
            word_count INTEGER,
            reading_time_minutes INTEGER,
            meta_title TEXT,
            meta_description TEXT,
            meta_keywords TEXT,
            focus_keywords TEXT,
            secondary_keywords TEXT,
            seo_score REAL,
            ranking_summary TEXT,
            og_title TEXT,
            og_description TEXT,
            og_image_url TEXT,
            og_type TEXT DEFAULT 'website',
            twitter_title TEXT,
            twitter_description TEXT,
            twitter_image_url TEXT,
            linkedin_title TEXT,
            linkedin_description TEXT,
            linkedin_image_url TEXT,
            facebook_title TEXT,
            facebook_description TEXT,
            facebook_image_url TEXT,
            instagram_title TEXT,
            instagram_description TEXT,
            instagram_image_url TEXT,
            social_meta TEXT,
            schema_type_id TEXT,
            robots_index TEXT DEFAULT 'index',
            robots_follow TEXT DEFAULT 'follow',
            robots_custom TEXT,
            canonical_url TEXT,
            redirect_from_urls TEXT,
            hreflang_group_id INTEGER,
            core_web_vitals_status TEXT,
            tech_seo_status TEXT,
            faq_section_enabled INTEGER DEFAULT 0,
            faq_content TEXT,
            has_subservices INTEGER DEFAULT 0,
            subservice_count INTEGER DEFAULT 0,
            primary_subservice_id INTEGER,
            featured_asset_id INTEGER,
            asset_count INTEGER DEFAULT 0,
            knowledge_topic_id INTEGER,
            brand_id INTEGER,
            business_unit TEXT,
            content_owner_id INTEGER,
            linked_insights_ids TEXT,
            linked_assets_ids TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_by INTEGER,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            version_number INTEGER DEFAULT 1,
            change_log_link TEXT,
            FOREIGN KEY (brand_id) REFERENCES brands(id),
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)
        )
    `);

    // Sub-services table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sub_services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sub_service_name TEXT NOT NULL,
            sub_service_code TEXT,
            parent_service_id INTEGER NOT NULL,
            slug TEXT,
            full_url TEXT,
            description TEXT,
            status TEXT DEFAULT 'draft',
            language TEXT DEFAULT 'en',
            menu_position INTEGER,
            breadcrumb_label TEXT,
            include_in_xml_sitemap INTEGER DEFAULT 1,
            sitemap_priority REAL DEFAULT 0.8,
            sitemap_changefreq TEXT DEFAULT 'monthly',
            content_type TEXT,
            buyer_journey_stage TEXT,
            primary_cta_label TEXT,
            primary_cta_url TEXT,
            h1 TEXT,
            h2_list TEXT,
            h3_list TEXT,
            h4_list TEXT,
            h5_list TEXT,
            body_content TEXT,
            internal_links TEXT,
            external_links TEXT,
            image_alt_texts TEXT,
            word_count INTEGER,
            reading_time_minutes INTEGER,
            meta_title TEXT,
            meta_description TEXT,
            meta_keywords TEXT,
            focus_keywords TEXT,
            secondary_keywords TEXT,
            seo_score REAL,
            ranking_summary TEXT,
            og_title TEXT,
            og_description TEXT,
            og_image_url TEXT,
            og_type TEXT DEFAULT 'website',
            twitter_title TEXT,
            twitter_description TEXT,
            twitter_image_url TEXT,
            linkedin_title TEXT,
            linkedin_description TEXT,
            linkedin_image_url TEXT,
            facebook_title TEXT,
            facebook_description TEXT,
            facebook_image_url TEXT,
            instagram_title TEXT,
            instagram_description TEXT,
            instagram_image_url TEXT,
            social_meta TEXT,
            schema_type_id TEXT,
            robots_index TEXT DEFAULT 'index',
            robots_follow TEXT DEFAULT 'follow',
            robots_custom TEXT,
            canonical_url TEXT,
            redirect_from_urls TEXT,
            hreflang_group_id INTEGER,
            core_web_vitals_status TEXT,
            tech_seo_status TEXT,
            faq_section_enabled INTEGER DEFAULT 0,
            faq_content TEXT,
            brand_id INTEGER,
            content_owner_id INTEGER,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_by INTEGER,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            version_number INTEGER DEFAULT 1,
            change_log_link TEXT,
            assets_linked INTEGER DEFAULT 0,
            linked_insights_ids TEXT,
            working_on_by TEXT,
            linked_assets_ids TEXT,
            industry_ids TEXT,
            menu_heading TEXT,
            short_tagline TEXT,
            country_ids TEXT,
            featured_asset_id INTEGER,
            knowledge_topic_id INTEGER,
            has_subservices INTEGER DEFAULT 0,
            FOREIGN KEY (parent_service_id) REFERENCES services(id),
            FOREIGN KEY (brand_id) REFERENCES brands(id),
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)
        )
    `);

    // ==================== ASSET TABLES ====================

    // Asset category master
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_category_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL UNIQUE,
            description TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Asset type master
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_type_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_type_name TEXT NOT NULL UNIQUE,
            description TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Asset format master
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_format_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            format_name VARCHAR(255) NOT NULL UNIQUE,
            file_extension VARCHAR(50),
            mime_type VARCHAR(100),
            status VARCHAR(50) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Assets table
    db.exec(`
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_name TEXT NOT NULL,
            asset_type TEXT,
            asset_category TEXT,
            asset_format TEXT,
            content_type TEXT,
            tags TEXT,
            description TEXT,
            status TEXT DEFAULT 'draft',
            usage_status TEXT,
            workflow_stage TEXT,
            qc_status TEXT,
            file_url TEXT,
            og_image_url TEXT,
            thumbnail_url TEXT,
            file_size TEXT,
            file_type TEXT,
            dimensions TEXT,
            linked_service_ids TEXT,
            linked_sub_service_ids TEXT,
            linked_task_id INTEGER,
            linked_campaign_id INTEGER,
            linked_project_id INTEGER,
            linked_service_id INTEGER,
            linked_sub_service_id INTEGER,
            linked_repository_item_id INTEGER,
            linked_page_ids TEXT,
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
            qc_score INTEGER,
            qc_checklist_items TEXT,
            submitted_by INTEGER,
            submitted_at DATETIME,
            qc_reviewer_id INTEGER,
            qc_reviewed_at DATETIME,
            qc_remarks TEXT,
            qc_checklist_completion INTEGER,
            linking_active INTEGER DEFAULT 0,
            mapped_to TEXT,
            rework_count INTEGER DEFAULT 0,
            workflow_log TEXT,
            social_meta TEXT,
            resource_files TEXT,
            created_by INTEGER,
            designed_by INTEGER,
            published_by INTEGER,
            verified_by INTEGER,
            published_at DATETIME,
            version_number TEXT,
            version_history TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (qc_reviewer_id) REFERENCES users(id),
            FOREIGN KEY (submitted_by) REFERENCES users(id)
        )
    `);

    // Asset QC reviews
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_qc_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            qc_reviewer_id INTEGER,
            qc_score INTEGER,
            checklist_completion INTEGER,
            qc_remarks TEXT,
            qc_decision TEXT,
            checklist_items TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id),
            FOREIGN KEY (qc_reviewer_id) REFERENCES users(id)
        )
    `);

    // Asset linking
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_linking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            service_id INTEGER,
            sub_service_id INTEGER,
            link_type VARCHAR(50),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id),
            FOREIGN KEY (service_id) REFERENCES services(id),
            FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
        )
    `);

    // Service-asset links
    db.exec(`
        CREATE TABLE IF NOT EXISTS service_asset_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id INTEGER NOT NULL,
            asset_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (service_id) REFERENCES services(id),
            FOREIGN KEY (asset_id) REFERENCES assets(id)
        )
    `);

    // Sub-service-asset links
    db.exec(`
        CREATE TABLE IF NOT EXISTS subservice_asset_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sub_service_id INTEGER NOT NULL,
            asset_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sub_service_id) REFERENCES sub_services(id),
            FOREIGN KEY (asset_id) REFERENCES assets(id)
        )
    `);

    // ==================== KEYWORD TABLES ====================

    // Keywords
    db.exec(`
        CREATE TABLE IF NOT EXISTS keywords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword TEXT NOT NULL UNIQUE,
            keyword_intent TEXT,
            keyword_type TEXT,
            language TEXT,
            search_volume INTEGER,
            competition_score TEXT,
            mapped_service_id INTEGER,
            mapped_service TEXT,
            mapped_sub_service_id INTEGER,
            mapped_sub_service TEXT,
            status TEXT DEFAULT 'active',
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Keyword linking
    db.exec(`
        CREATE TABLE IF NOT EXISTS keyword_linking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword_id INTEGER NOT NULL,
            service_id INTEGER,
            sub_service_id INTEGER,
            link_type VARCHAR(50),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (keyword_id) REFERENCES keywords(id),
            FOREIGN KEY (service_id) REFERENCES services(id),
            FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
        )
    `);

    // ==================== BACKLINK TABLES ====================

    // Backlink sources
    db.exec(`
        CREATE TABLE IF NOT EXISTS backlink_sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            domain TEXT,
            backlink_url TEXT,
            backlink_category TEXT,
            niche_industry TEXT,
            da_score INTEGER,
            spam_score INTEGER,
            pricing TEXT,
            country TEXT,
            username TEXT,
            password TEXT,
            credentials_notes TEXT,
            status TEXT DEFAULT 'active',
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Backlinks
    db.exec(`
        CREATE TABLE IF NOT EXISTS backlinks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_url TEXT,
            target_url TEXT,
            anchor_text TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ==================== CONTENT TABLES ====================

    // Content types
    db.exec(`
        CREATE TABLE IF NOT EXISTS content_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_type TEXT NOT NULL UNIQUE,
            category TEXT,
            description TEXT,
            default_attributes TEXT,
            use_in_campaigns INTEGER,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Content
    db.exec(`
        CREATE TABLE IF NOT EXISTS content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content_type TEXT,
            status TEXT DEFAULT 'draft',
            body_content TEXT,
            meta_title TEXT,
            meta_description TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // ==================== PROJECT & TASK TABLES ====================

    // Projects
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name TEXT NOT NULL,
            project_code TEXT,
            description TEXT,
            status TEXT DEFAULT 'active',
            start_date DATE,
            end_date DATE,
            budget REAL,
            owner_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            brand_id INTEGER,
            linked_service_id INTEGER,
            priority TEXT,
            sub_services TEXT,
            outcome_kpis TEXT,
            expected_outcome TEXT,
            team_members TEXT,
            weekly_report INTEGER,
            progress INTEGER,
            FOREIGN KEY (owner_id) REFERENCES users(id),
            FOREIGN KEY (brand_id) REFERENCES brands(id)
        )
    `);

    // Tasks
    db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_name TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'todo',
            priority TEXT DEFAULT 'medium',
            assigned_to INTEGER,
            project_id INTEGER,
            due_date DATE,
            completed_at DATETIME,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            campaign_id INTEGER,
            campaign_type TEXT,
            sub_campaign TEXT,
            progress_stage TEXT,
            qc_stage TEXT,
            rework_count INTEGER,
            repo_link_count INTEGER,
            repo_links TEXT,
            estimated_hours INTEGER,
            tags TEXT,
            primary_owner_id INTEGER,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (assigned_to) REFERENCES users(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // ==================== CAMPAIGN TABLES ====================

    // Campaigns
    db.exec(`
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_name TEXT NOT NULL,
            campaign_type TEXT,
            status TEXT DEFAULT 'draft',
            start_date DATE,
            end_date DATE,
            budget REAL,
            description TEXT,
            target_audience TEXT,
            goals TEXT,
            kpis TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            project_id INTEGER,
            brand_id INTEGER,
            target_url TEXT,
            backlinks_planned INTEGER,
            backlinks_completed INTEGER,
            sub_campaigns TEXT,
            linked_service_ids TEXT,
            progress INTEGER,
            campaign_start_date DATE,
            campaign_end_date DATE,
            campaign_owner_id INTEGER,
            tasks_total INTEGER,
            tasks_completed INTEGER,
            kpi_score INTEGER,
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (brand_id) REFERENCES brands(id)
        )
    `);

    // ==================== PLATFORM TABLES ====================

    // Platforms
    db.exec(`
        CREATE TABLE IF NOT EXISTS platforms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform_name TEXT NOT NULL UNIQUE,
            content_types_count INTEGER,
            asset_types_count INTEGER,
            recommended_size TEXT,
            scheduling TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ==================== QC TABLES ====================

    // QC audit log
    db.exec(`
        CREATE TABLE IF NOT EXISTS qc_audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER,
            content_id INTEGER,
            qc_status VARCHAR(50),
            reviewer_id INTEGER,
            comments TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id),
            FOREIGN KEY (reviewer_id) REFERENCES users(id)
        )
    `);

    // ==================== NOTIFICATION TABLES ====================

    // Notifications
    db.exec(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT,
            message TEXT,
            type TEXT,
            is_read INTEGER DEFAULT 0,
            link TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    console.log('✅ All tables created successfully!\n');

    // ==================== VERIFICATION ====================
    console.log('🔍 Verifying database...\n');

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log(`📊 Total tables created: ${tables.length}`);
    tables.forEach(table => {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        console.log(`   ✓ ${table.name}: ${count.count} records`);
    });

    db.close();

    console.log('\n🎉 Production database initialization completed successfully!');
    console.log(`📁 Database location: ${dbPath}`);
    console.log('\n✨ Your application is ready for deployment!\n');

} catch (error) {
    console.error('❌ Error during database initialization:', error.message);
    process.exit(1);
}
