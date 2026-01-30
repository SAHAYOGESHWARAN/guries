import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const sqliteDb = new Database(dbPath);

// Enable foreign keys
sqliteDb.pragma('foreign_keys = ON');

// Initialize tables
export const initDatabase = () => {
    // Create comprehensive tables
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_name TEXT,
            asset_type TEXT,
            asset_category TEXT,
            asset_format TEXT,
            content_type TEXT,
            tags TEXT,
            description TEXT,
            status TEXT DEFAULT 'Draft',
            usage_status TEXT DEFAULT 'Available',
            workflow_stage TEXT DEFAULT 'Add',
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
            linking_active INTEGER DEFAULT 0,
            mapped_to TEXT,
            rework_count INTEGER DEFAULT 0,
            workflow_log TEXT,
            qc_checklist_completion INTEGER DEFAULT 0,
            social_meta TEXT,
            resource_files TEXT,
            created_by INTEGER,
            designed_by INTEGER,
            published_by INTEGER,
            verified_by INTEGER,
            published_at DATETIME,
            version_number TEXT DEFAULT 'v1.0',
            version_history TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

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
            language TEXT,
            status TEXT,
            show_in_main_menu INTEGER DEFAULT 0,
            show_in_footer_menu INTEGER DEFAULT 0,
            menu_group TEXT,
            menu_position INTEGER DEFAULT 0,
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
            word_count INTEGER DEFAULT 0,
            reading_time_minutes INTEGER DEFAULT 0,
            meta_title TEXT,
            meta_description TEXT,
            focus_keywords TEXT,
            secondary_keywords TEXT,
            seo_score REAL DEFAULT 0,
            ranking_summary TEXT,
            og_title TEXT,
            og_description TEXT,
            og_image_url TEXT,
            og_type TEXT,
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
            robots_index TEXT,
            robots_follow TEXT,
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
            change_log_link TEXT
        );

        CREATE TABLE IF NOT EXISTS sub_services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sub_service_name TEXT NOT NULL,
            sub_service_code TEXT,
            parent_service_id INTEGER,
            slug TEXT,
            full_url TEXT,
            description TEXT,
            status TEXT,
            language TEXT,
            menu_position INTEGER DEFAULT 0,
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
            word_count INTEGER DEFAULT 0,
            reading_time_minutes INTEGER DEFAULT 0,
            meta_title TEXT,
            meta_description TEXT,
            meta_keywords TEXT,
            focus_keywords TEXT,
            secondary_keywords TEXT,
            seo_score REAL DEFAULT 0,
            ranking_summary TEXT,
            og_title TEXT,
            og_description TEXT,
            og_image_url TEXT,
            og_type TEXT,
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
            robots_index TEXT,
            robots_follow TEXT,
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
            FOREIGN KEY (parent_service_id) REFERENCES services(id)
        );

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
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_name TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            assigned_to INTEGER,
            project_id INTEGER,
            due_date DATE,
            completed_at DATETIME,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS analytics_daily_traffic (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            value INTEGER DEFAULT 0,
            source TEXT,
            page_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Insert sample data if tables are empty
        INSERT OR IGNORE INTO campaigns (id, campaign_name, campaign_type, status, description) VALUES 
        (1, 'Sample Campaign', 'Digital Marketing', 'active', 'Sample campaign for testing');

        INSERT OR IGNORE INTO tasks (id, task_name, description, status, priority, due_date) VALUES 
        (1, 'Sample Task', 'Sample task for testing', 'pending', 'medium', date('now', '+7 days'));

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
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS content_repository (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand_id INTEGER,
            content_title_clean TEXT,
            asset_type TEXT,
            status TEXT DEFAULT 'draft',
            asset_category TEXT,
            asset_format TEXT,
            slug TEXT,
            full_url TEXT,
            linked_service_ids TEXT,
            linked_sub_service_ids TEXT,
            h1 TEXT,
            h2_list TEXT,
            h3_list TEXT,
            body_content TEXT,
            meta_title TEXT,
            meta_description TEXT,
            focus_keywords TEXT,
            og_title TEXT,
            og_description TEXT,
            og_image_url TEXT,
            social_meta TEXT,
            thumbnail_url TEXT,
            context TEXT,
            linked_campaign_id INTEGER,
            promotion_channels TEXT,
            campaign_name TEXT,
            assigned_to_id INTEGER,
            ai_qc_report TEXT,
            last_status_update_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS brands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT,
            industry TEXT,
            website TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            role TEXT,
            status TEXT DEFAULT 'active',
            password_hash TEXT,
            department TEXT,
            country TEXT,
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS content_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_type TEXT NOT NULL,
            category TEXT DEFAULT 'Long-form',
            description TEXT,
            default_attributes TEXT,
            use_in_campaigns INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS keywords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword TEXT NOT NULL,
            keyword_intent TEXT NOT NULL,
            keyword_type TEXT NOT NULL,
            language TEXT DEFAULT 'English',
            search_volume INTEGER DEFAULT 0,
            competition_score TEXT DEFAULT 'Medium',
            mapped_service_id INTEGER,
            mapped_service TEXT,
            mapped_sub_service_id INTEGER,
            mapped_sub_service TEXT,
            status TEXT DEFAULT 'active',
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS backlink_sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            domain TEXT NOT NULL,
            backlink_url TEXT NOT NULL,
            backlink_category TEXT NOT NULL,
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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS graphic_assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand_id INTEGER,
            graphic_type TEXT,
            platform TEXT,
            status TEXT DEFAULT 'requested',
            due_at DATETIME,
            designer_owner_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (brand_id) REFERENCES brands(id),
            FOREIGN KEY (designer_owner_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS integrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT,
            status TEXT DEFAULT 'active',
            config TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS integration_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            integration_id INTEGER,
            action TEXT,
            status TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (integration_id) REFERENCES integrations(id)
        );

        CREATE TABLE IF NOT EXISTS personas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            target_audience TEXT,
            characteristics TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS forms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            fields TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS backlinks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_url TEXT NOT NULL,
            target_url TEXT NOT NULL,
            anchor_text TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS asset_type_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_type_name TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS asset_category_master (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        INSERT OR IGNORE INTO analytics_daily_traffic (id, date, value, source) VALUES 
        (1, date('now'), 100, 'organic'),
        (2, date('now', '-1 day'), 95, 'organic'),
        (3, date('now', '-2 days'), 110, 'organic');

        -- Insert sample data for other tables
        INSERT OR IGNORE INTO brands (id, name, code, industry, website) VALUES 
        (1, 'Sample Brand', 'SB', 'Technology', 'https://example.com');

        -- Admin user with password 'admin123' (SHA256 hash)
        INSERT OR IGNORE INTO users (id, name, email, role, status, password_hash, department) VALUES 
        (1, 'Admin User', 'admin@example.com', 'admin', 'active', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administration');

        INSERT OR IGNORE INTO content_types (id, content_type, description) VALUES 
        (1, 'Pillar', 'Pillar content type'),
        (2, 'Cluster', 'Cluster content type'),
        (3, 'Landing', 'Landing page content type'),
        (4, 'Blog', 'Blog content type');

        INSERT OR IGNORE INTO keywords (id, keyword, keyword_type, search_volume, competition_score) VALUES 
        (1, 'sample keyword', 'primary', 1000, 'medium');

        CREATE TABLE IF NOT EXISTS asset_qc_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER,
            qc_reviewer_id INTEGER,
            qc_score INTEGER,
            checklist_completion INTEGER DEFAULT 0,
            qc_remarks TEXT,
            qc_decision TEXT,
            checklist_items TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id)
        );

        -- Service Asset Links Table
        CREATE TABLE IF NOT EXISTS service_asset_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id INTEGER NOT NULL,
            asset_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(service_id, asset_id)
        );

        -- Sub-service Asset Links Table
        CREATE TABLE IF NOT EXISTS subservice_asset_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sub_service_id INTEGER NOT NULL,
            asset_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(sub_service_id, asset_id)
        );

        CREATE TABLE IF NOT EXISTS industry_sectors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            industry TEXT NOT NULL,
            sector TEXT,
            application TEXT,
            country TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        INSERT OR IGNORE INTO industry_sectors (id, industry, sector, application, country, status) VALUES 
        (1, 'Technology', 'Software Development', 'Web Services', 'Global', 'active'),
        (2, 'Healthcare', 'Medical Services', 'Patient Care', 'US', 'active'),
        (3, 'Finance', 'Banking', 'Digital Banking', 'Global', 'active'),
        (4, 'E-commerce', 'Retail', 'Online Shopping', 'Global', 'active');

        -- Workflow Stages Table
        CREATE TABLE IF NOT EXISTS workflow_stages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workflow_name TEXT NOT NULL,
            stage_order INTEGER DEFAULT 1,
            total_stages INTEGER DEFAULT 1,
            stage_label TEXT,
            color_tag TEXT DEFAULT 'blue',
            active_flag TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        INSERT OR IGNORE INTO workflow_stages (id, workflow_name, stage_order, total_stages, stage_label, color_tag, active_flag) VALUES 
        (1, 'Content Production', 1, 4, 'Draft', 'blue', 'Active'),
        (2, 'Content Production', 2, 4, 'Review', 'amber', 'Active'),
        (3, 'Content Production', 3, 4, 'QC', 'purple', 'Active'),
        (4, 'Content Production', 4, 4, 'Published', 'green', 'Active');

        -- Platforms Table
        CREATE TABLE IF NOT EXISTS platforms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform_name TEXT NOT NULL,
            content_types_count INTEGER DEFAULT 0,
            asset_types_count INTEGER DEFAULT 0,
            recommended_size TEXT,
            scheduling TEXT DEFAULT 'Manual',
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        INSERT OR IGNORE INTO platforms (id, platform_name, content_types_count, asset_types_count, recommended_size, scheduling, status) VALUES 
        (1, 'Facebook', 5, 4, '1200x630', 'Both', 'Active'),
        (2, 'Instagram', 4, 3, '1080x1080', 'Auto', 'Active'),
        (3, 'LinkedIn', 3, 2, '1200x627', 'Manual', 'Active');

        -- Countries Table
        CREATE TABLE IF NOT EXISTS countries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            country_name TEXT NOT NULL,
            code TEXT,
            region TEXT,
            has_backlinks INTEGER DEFAULT 0,
            has_content INTEGER DEFAULT 0,
            has_smm INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        INSERT OR IGNORE INTO countries (id, country_name, code, region, has_backlinks, has_content, has_smm, status) VALUES 
        (1, 'United States', 'US', 'North America', 1, 1, 1, 'Active'),
        (2, 'United Kingdom', 'UK', 'Europe', 1, 1, 1, 'Active'),
        (3, 'Canada', 'CA', 'North America', 1, 1, 0, 'Active'),
        (4, 'Australia', 'AU', 'Oceania', 1, 0, 1, 'Active');

        -- SEO Errors Table
        CREATE TABLE IF NOT EXISTS seo_errors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            error_type TEXT NOT NULL,
            category TEXT,
            severity TEXT DEFAULT 'Medium',
            description TEXT,
            status TEXT DEFAULT 'Published',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        INSERT OR IGNORE INTO seo_errors (id, error_type, category, severity, description, status) VALUES 
        (1, 'Missing Meta Title', 'On-page', 'High', 'Page is missing meta title tag', 'Published'),
        (2, 'Missing Meta Description', 'On-page', 'High', 'Page is missing meta description', 'Published'),
        (3, 'Broken Links', 'Technical SEO', 'High', 'Page contains broken links', 'Published');

        -- Roles Table
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role_name TEXT NOT NULL UNIQUE,
            permissions TEXT,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        INSERT OR IGNORE INTO roles (id, role_name, permissions, status) VALUES 
        (1, 'Admin', '{"read": true, "write": true, "delete": true}', 'Active'),
        (2, 'SEO', '{"read": true, "write": true, "delete": false}', 'Active'),
        (3, 'Content', '{"read": true, "write": true, "delete": false}', 'Active'),
        (4, 'Developer', '{"read": true, "write": true, "delete": true}', 'Active');

        -- Asset Website Usage Table
        CREATE TABLE IF NOT EXISTS asset_website_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            website_url TEXT NOT NULL,
            page_title TEXT,
            added_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
        );

        -- Asset Social Media Usage Table
        CREATE TABLE IF NOT EXISTS asset_social_media_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            platform_name TEXT NOT NULL,
            post_url TEXT,
            post_id TEXT,
            status TEXT DEFAULT 'Published',
            engagement_impressions INTEGER DEFAULT 0,
            engagement_clicks INTEGER DEFAULT 0,
            engagement_shares INTEGER DEFAULT 0,
            engagement_likes INTEGER DEFAULT 0,
            engagement_comments INTEGER DEFAULT 0,
            posted_at DATETIME,
            added_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
        );

        -- Asset Backlink Usage Table
        CREATE TABLE IF NOT EXISTS asset_backlink_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            domain_name TEXT NOT NULL,
            backlink_url TEXT,
            anchor_text TEXT,
            approval_status TEXT DEFAULT 'Pending',
            da_score INTEGER,
            submitted_at DATETIME,
            approved_at DATETIME,
            added_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
        );

        -- Asset Engagement Metrics Table (aggregated metrics)
        CREATE TABLE IF NOT EXISTS asset_engagement_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL UNIQUE,
            total_impressions INTEGER DEFAULT 0,
            total_clicks INTEGER DEFAULT 0,
            total_shares INTEGER DEFAULT 0,
            total_likes INTEGER DEFAULT 0,
            total_comments INTEGER DEFAULT 0,
            ctr_percentage REAL DEFAULT 0,
            performance_summary TEXT,
            last_calculated_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
        );

        -- Indexes for asset usage tables
        CREATE INDEX IF NOT EXISTS idx_website_usage_asset ON asset_website_usage(asset_id);
        CREATE INDEX IF NOT EXISTS idx_social_usage_asset ON asset_social_media_usage(asset_id);
        CREATE INDEX IF NOT EXISTS idx_backlink_usage_asset ON asset_backlink_usage(asset_id);
        CREATE INDEX IF NOT EXISTS idx_engagement_asset ON asset_engagement_metrics(asset_id);

        -- Projects table
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name TEXT NOT NULL,
            project_code TEXT,
            description TEXT,
            status TEXT DEFAULT 'Active',
            start_date DATE,
            end_date DATE,
            budget REAL,
            owner_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Notifications table
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            message TEXT,
            type TEXT DEFAULT 'info',
            is_read INTEGER DEFAULT 0,
            link TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    console.log('✅ SQLite database initialized');

    // Add missing columns to assets table (migrations)
    const addColumnIfNotExists = (table: string, column: string, type: string) => {
        try {
            const tableInfo = sqliteDb.prepare(`PRAGMA table_info(${table})`).all() as any[];
            const columnExists = tableInfo.some((col: any) => col.name === column);
            if (!columnExists) {
                sqliteDb.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
                console.log(`  Added column ${column} to ${table}`);
            }
        } catch (e) {
            // Column might already exist or table doesn't exist
        }
    };

    // Add missing columns to projects table
    addColumnIfNotExists('projects', 'brand_id', 'INTEGER');
    addColumnIfNotExists('projects', 'linked_service_id', 'INTEGER');
    addColumnIfNotExists('projects', 'priority', 'TEXT DEFAULT "Medium"');
    addColumnIfNotExists('projects', 'sub_services', 'TEXT');
    addColumnIfNotExists('projects', 'outcome_kpis', 'TEXT');
    addColumnIfNotExists('projects', 'expected_outcome', 'TEXT');
    addColumnIfNotExists('projects', 'team_members', 'TEXT');
    addColumnIfNotExists('projects', 'weekly_report', 'INTEGER DEFAULT 1');
    addColumnIfNotExists('projects', 'progress', 'INTEGER DEFAULT 0');

    // Add missing columns to campaigns table
    addColumnIfNotExists('campaigns', 'project_id', 'INTEGER');
    addColumnIfNotExists('campaigns', 'brand_id', 'INTEGER');
    addColumnIfNotExists('campaigns', 'target_url', 'TEXT');
    addColumnIfNotExists('campaigns', 'backlinks_planned', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('campaigns', 'backlinks_completed', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('campaigns', 'sub_campaigns', 'TEXT');
    addColumnIfNotExists('campaigns', 'linked_service_ids', 'TEXT');
    addColumnIfNotExists('campaigns', 'progress', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('campaigns', 'campaign_start_date', 'DATE');
    addColumnIfNotExists('campaigns', 'campaign_end_date', 'DATE');
    addColumnIfNotExists('campaigns', 'campaign_owner_id', 'INTEGER');
    addColumnIfNotExists('campaigns', 'tasks_total', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('campaigns', 'tasks_completed', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('campaigns', 'kpi_score', 'INTEGER DEFAULT 0');

    // Add missing columns to tasks table
    addColumnIfNotExists('tasks', 'campaign_id', 'INTEGER');
    addColumnIfNotExists('tasks', 'campaign_type', 'TEXT');
    addColumnIfNotExists('tasks', 'sub_campaign', 'TEXT');
    addColumnIfNotExists('tasks', 'progress_stage', 'TEXT DEFAULT "Not Started"');
    addColumnIfNotExists('tasks', 'qc_stage', 'TEXT DEFAULT "Pending"');
    addColumnIfNotExists('tasks', 'rework_count', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('tasks', 'repo_link_count', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('tasks', 'repo_links', 'TEXT');
    addColumnIfNotExists('tasks', 'estimated_hours', 'INTEGER');
    addColumnIfNotExists('tasks', 'tags', 'TEXT');
    addColumnIfNotExists('tasks', 'primary_owner_id', 'INTEGER');

    // Add missing columns to content_repository table
    addColumnIfNotExists('content_repository', 'content_type', 'TEXT');
    addColumnIfNotExists('content_repository', 'linked_service_id', 'INTEGER');
    addColumnIfNotExists('content_repository', 'linked_sub_service_id', 'INTEGER');
    addColumnIfNotExists('content_repository', 'industry', 'TEXT');
    addColumnIfNotExists('content_repository', 'keywords', 'TEXT');
    addColumnIfNotExists('content_repository', 'word_count', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('content_repository', 'qc_score', 'INTEGER');

    // Create service_pages table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS service_pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page_title TEXT NOT NULL,
            url TEXT,
            url_slug TEXT,
            page_type TEXT DEFAULT 'Service Page',
            service_id INTEGER,
            sub_service_id INTEGER,
            industry TEXT,
            target_keyword TEXT,
            primary_keyword TEXT,
            seo_score INTEGER DEFAULT 0,
            audit_score INTEGER DEFAULT 0,
            last_audit TEXT,
            status TEXT DEFAULT 'Draft',
            meta_description TEXT,
            writer_id INTEGER,
            seo_id INTEGER,
            developer_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create smm_posts table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS smm_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            smm_type TEXT DEFAULT 'Image Post',
            content_type TEXT,
            primary_platform TEXT DEFAULT 'LinkedIn',
            smm_status TEXT DEFAULT 'Draft',
            schedule_date DATE,
            schedule_time TEXT,
            caption TEXT,
            hashtags TEXT,
            asset_url TEXT,
            asset_count INTEGER DEFAULT 0,
            brand_id INTEGER,
            service_id INTEGER,
            sub_service_id INTEGER,
            campaign_id INTEGER,
            keywords TEXT,
            assigned_to_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Add missing columns to smm_posts table
    addColumnIfNotExists('smm_posts', 'title', 'TEXT');
    addColumnIfNotExists('smm_posts', 'smm_type', 'TEXT DEFAULT "Image Post"');
    addColumnIfNotExists('smm_posts', 'content_type', 'TEXT');
    addColumnIfNotExists('smm_posts', 'primary_platform', 'TEXT DEFAULT "LinkedIn"');
    addColumnIfNotExists('smm_posts', 'smm_status', 'TEXT DEFAULT "Draft"');
    addColumnIfNotExists('smm_posts', 'schedule_date', 'DATE');
    addColumnIfNotExists('smm_posts', 'schedule_time', 'TEXT');
    addColumnIfNotExists('smm_posts', 'caption', 'TEXT');
    addColumnIfNotExists('smm_posts', 'hashtags', 'TEXT');
    addColumnIfNotExists('smm_posts', 'asset_url', 'TEXT');
    addColumnIfNotExists('smm_posts', 'asset_count', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('smm_posts', 'brand_id', 'INTEGER');
    addColumnIfNotExists('smm_posts', 'service_id', 'INTEGER');
    addColumnIfNotExists('smm_posts', 'sub_service_id', 'INTEGER');
    addColumnIfNotExists('smm_posts', 'campaign_id', 'INTEGER');
    addColumnIfNotExists('smm_posts', 'keywords', 'TEXT');
    addColumnIfNotExists('smm_posts', 'assigned_to_id', 'INTEGER');

    // Add missing columns to assets table
    addColumnIfNotExists('assets', 'content_type', 'TEXT');
    addColumnIfNotExists('assets', 'dimensions', 'TEXT');
    addColumnIfNotExists('assets', 'linked_task_id', 'INTEGER');
    addColumnIfNotExists('assets', 'linked_campaign_id', 'INTEGER');
    addColumnIfNotExists('assets', 'linked_project_id', 'INTEGER');
    addColumnIfNotExists('assets', 'linked_service_id', 'INTEGER');
    addColumnIfNotExists('assets', 'linked_sub_service_id', 'INTEGER');
    addColumnIfNotExists('assets', 'linked_repository_item_id', 'INTEGER');
    addColumnIfNotExists('assets', 'qc_status', 'TEXT');
    addColumnIfNotExists('assets', 'qc_checklist_items', 'TEXT');
    addColumnIfNotExists('assets', 'version_number', 'TEXT DEFAULT "v1.0"');
    addColumnIfNotExists('assets', 'designed_by', 'INTEGER');
    addColumnIfNotExists('assets', 'created_by', 'INTEGER');
    addColumnIfNotExists('assets', 'updated_by', 'INTEGER');
    addColumnIfNotExists('assets', 'workflow_stage', 'TEXT DEFAULT "Add"');

    // Add missing columns to users table for admin functionality
    addColumnIfNotExists('users', 'password_hash', 'TEXT');
    addColumnIfNotExists('users', 'department', 'TEXT');
    addColumnIfNotExists('users', 'country', 'TEXT');
    addColumnIfNotExists('users', 'last_login', 'DATETIME');

    // Create backlink_submissions table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS backlink_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            domain TEXT,
            opportunity_type TEXT DEFAULT 'Guest Post',
            category TEXT,
            target_url TEXT,
            anchor_text TEXT,
            content_used TEXT,
            da_score INTEGER,
            spam_score INTEGER,
            country TEXT,
            service_id INTEGER,
            sub_service_id INTEGER,
            seo_owner_id INTEGER,
            is_paid INTEGER DEFAULT 0,
            submission_status TEXT DEFAULT 'Pending',
            backlink_source_id INTEGER,
            anchor_text_used TEXT,
            owner_id INTEGER,
            submitted_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Add missing columns to backlink_submissions table
    addColumnIfNotExists('backlink_submissions', 'domain', 'TEXT');
    addColumnIfNotExists('backlink_submissions', 'opportunity_type', 'TEXT DEFAULT "Guest Post"');
    addColumnIfNotExists('backlink_submissions', 'category', 'TEXT');
    addColumnIfNotExists('backlink_submissions', 'anchor_text', 'TEXT');
    addColumnIfNotExists('backlink_submissions', 'da_score', 'INTEGER');
    addColumnIfNotExists('backlink_submissions', 'spam_score', 'INTEGER');
    addColumnIfNotExists('backlink_submissions', 'country', 'TEXT');
    addColumnIfNotExists('backlink_submissions', 'service_id', 'INTEGER');
    addColumnIfNotExists('backlink_submissions', 'sub_service_id', 'INTEGER');
    addColumnIfNotExists('backlink_submissions', 'seo_owner_id', 'INTEGER');
    addColumnIfNotExists('backlink_submissions', 'is_paid', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('backlink_submissions', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('backlink_submissions', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Create toxic_backlinks table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS toxic_backlinks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            domain TEXT NOT NULL,
            toxic_url TEXT,
            landing_page TEXT,
            anchor_text TEXT,
            spam_score INTEGER DEFAULT 0,
            dr INTEGER,
            dr_type TEXT,
            severity TEXT DEFAULT 'Medium',
            status TEXT DEFAULT 'Pending',
            assigned_to_id INTEGER,
            service_id INTEGER,
            notes TEXT,
            disavow_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Add missing columns to toxic_backlinks table
    addColumnIfNotExists('toxic_backlinks', 'domain', 'TEXT');
    addColumnIfNotExists('toxic_backlinks', 'toxic_url', 'TEXT');
    addColumnIfNotExists('toxic_backlinks', 'landing_page', 'TEXT');
    addColumnIfNotExists('toxic_backlinks', 'anchor_text', 'TEXT');
    addColumnIfNotExists('toxic_backlinks', 'spam_score', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('toxic_backlinks', 'dr', 'INTEGER');
    addColumnIfNotExists('toxic_backlinks', 'dr_type', 'TEXT');
    addColumnIfNotExists('toxic_backlinks', 'severity', 'TEXT DEFAULT "Medium"');
    addColumnIfNotExists('toxic_backlinks', 'status', 'TEXT DEFAULT "Pending"');
    addColumnIfNotExists('toxic_backlinks', 'assigned_to_id', 'INTEGER');
    addColumnIfNotExists('toxic_backlinks', 'service_id', 'INTEGER');
    addColumnIfNotExists('toxic_backlinks', 'notes', 'TEXT');
    addColumnIfNotExists('toxic_backlinks', 'disavow_date', 'DATETIME');
    addColumnIfNotExists('toxic_backlinks', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('toxic_backlinks', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Create ux_issues table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS ux_issues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            url TEXT,
            issue_type TEXT DEFAULT 'Manual Report',
            device TEXT DEFAULT 'Desktop',
            severity TEXT DEFAULT 'Medium',
            source TEXT DEFAULT 'Manual Report',
            screenshot_url TEXT,
            assigned_to_id INTEGER,
            service_id INTEGER,
            status TEXT DEFAULT 'Pending',
            resolution_notes TEXT,
            priority_score INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Add missing columns to ux_issues table
    addColumnIfNotExists('ux_issues', 'title', 'TEXT');
    addColumnIfNotExists('ux_issues', 'description', 'TEXT');
    addColumnIfNotExists('ux_issues', 'url', 'TEXT');
    addColumnIfNotExists('ux_issues', 'issue_type', 'TEXT DEFAULT "Manual Report"');
    addColumnIfNotExists('ux_issues', 'device', 'TEXT DEFAULT "Desktop"');
    addColumnIfNotExists('ux_issues', 'severity', 'TEXT DEFAULT "Medium"');
    addColumnIfNotExists('ux_issues', 'source', 'TEXT DEFAULT "Manual Report"');
    addColumnIfNotExists('ux_issues', 'screenshot_url', 'TEXT');
    addColumnIfNotExists('ux_issues', 'assigned_to_id', 'INTEGER');
    addColumnIfNotExists('ux_issues', 'service_id', 'INTEGER');
    addColumnIfNotExists('ux_issues', 'status', 'TEXT DEFAULT "Pending"');
    addColumnIfNotExists('ux_issues', 'resolution_notes', 'TEXT');
    addColumnIfNotExists('ux_issues', 'priority_score', 'INTEGER');
    addColumnIfNotExists('ux_issues', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('ux_issues', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Create promotion_items table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS promotion_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subtitle TEXT,
            content_type TEXT DEFAULT 'Blog',
            promotion_types TEXT,
            campaign_id INTEGER,
            service_id INTEGER,
            keywords TEXT,
            thumbnail_url TEXT,
            full_url TEXT,
            qc_status TEXT DEFAULT 'QC Pending',
            published_date DATETIME,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create on_page_seo_audits table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS on_page_seo_audits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT,
            service_id INTEGER,
            sub_service_id INTEGER,
            error_type TEXT NOT NULL,
            error_category TEXT DEFAULT 'Technical',
            severity TEXT DEFAULT 'Medium',
            issue_description TEXT,
            current_value TEXT,
            recommended_value TEXT,
            detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            linked_campaign_id INTEGER,
            status TEXT DEFAULT 'Open',
            resolved_at DATETIME,
            resolution_notes TEXT,
            assigned_to_id INTEGER,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (service_id) REFERENCES services(id),
            FOREIGN KEY (sub_service_id) REFERENCES sub_services(id),
            FOREIGN KEY (assigned_to_id) REFERENCES users(id)
        )
    `);

    // Create competitor_benchmarks table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS competitor_benchmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            competitor_name TEXT NOT NULL,
            website_url TEXT,
            domain TEXT,
            primary_country TEXT,
            industry TEXT,
            sector TEXT,
            services_offered TEXT,
            notes TEXT,
            status TEXT DEFAULT 'Active',
            da INTEGER DEFAULT 0,
            spam_score INTEGER DEFAULT 0,
            estimated_monthly_traffic INTEGER DEFAULT 0,
            total_keywords_ranked INTEGER DEFAULT 0,
            total_backlinks INTEGER DEFAULT 0,
            primary_traffic_sources TEXT,
            attachments TEXT,
            region TEXT,
            dr INTEGER DEFAULT 0,
            monthly_traffic INTEGER DEFAULT 0,
            total_keywords INTEGER DEFAULT 0,
            backlinks INTEGER DEFAULT 0,
            ranking_coverage INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_on DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Add missing columns to competitor_benchmarks table
    addColumnIfNotExists('competitor_benchmarks', 'website_url', 'TEXT');
    addColumnIfNotExists('competitor_benchmarks', 'domain', 'TEXT');
    addColumnIfNotExists('competitor_benchmarks', 'primary_country', 'TEXT');
    addColumnIfNotExists('competitor_benchmarks', 'industry', 'TEXT');
    addColumnIfNotExists('competitor_benchmarks', 'sector', 'TEXT');
    addColumnIfNotExists('competitor_benchmarks', 'services_offered', 'TEXT');
    addColumnIfNotExists('competitor_benchmarks', 'notes', 'TEXT');
    addColumnIfNotExists('competitor_benchmarks', 'da', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('competitor_benchmarks', 'spam_score', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('competitor_benchmarks', 'estimated_monthly_traffic', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('competitor_benchmarks', 'total_keywords_ranked', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('competitor_benchmarks', 'total_backlinks', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('competitor_benchmarks', 'primary_traffic_sources', 'TEXT');
    addColumnIfNotExists('competitor_benchmarks', 'attachments', 'TEXT');
    addColumnIfNotExists('competitor_benchmarks', 'region', 'TEXT');
    addColumnIfNotExists('competitor_benchmarks', 'dr', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('competitor_benchmarks', 'ranking_coverage', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('competitor_benchmarks', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('competitor_benchmarks', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Add missing columns to on_page_seo_audits table
    addColumnIfNotExists('on_page_seo_audits', 'url', 'TEXT');
    addColumnIfNotExists('on_page_seo_audits', 'assigned_to_id', 'INTEGER');
    addColumnIfNotExists('on_page_seo_audits', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Create okrs table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS okrs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            objective_title TEXT NOT NULL,
            objective_type TEXT DEFAULT 'Department',
            department TEXT,
            owner_id INTEGER,
            cycle TEXT DEFAULT 'Q1',
            objective_description TEXT,
            why_this_matters TEXT,
            expected_outcome TEXT,
            target_date DATE,
            alignment TEXT,
            parent_okr_id INTEGER,
            key_results TEXT,
            reviewer_id INTEGER,
            review_notes TEXT,
            evidence_links TEXT,
            status TEXT DEFAULT 'Draft',
            progress INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id),
            FOREIGN KEY (reviewer_id) REFERENCES users(id),
            FOREIGN KEY (parent_okr_id) REFERENCES okrs(id)
        )
    `);

    // Create gold_standards table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS gold_standards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            why_matters TEXT,
            gold_standard_value TEXT NOT NULL,
            acceptable_range_min TEXT,
            acceptable_range_max TEXT,
            unit TEXT,
            source TEXT,
            evidence_link TEXT,
            file_upload TEXT,
            additional_notes TEXT,
            owner_id INTEGER,
            reviewer_id INTEGER,
            review_frequency TEXT DEFAULT 'Quarterly',
            status TEXT DEFAULT 'Active',
            next_review_date DATE,
            governance_notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id),
            FOREIGN KEY (reviewer_id) REFERENCES users(id)
        )
    `);

    // Create effort_targets table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS effort_targets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department TEXT NOT NULL,
            role TEXT NOT NULL,
            kpi_category TEXT NOT NULL,
            effort_metric TEXT NOT NULL,
            effective_date DATE,
            status TEXT DEFAULT 'Draft',
            monthly_target INTEGER DEFAULT 0,
            weekly_target INTEGER DEFAULT 0,
            daily_target INTEGER DEFAULT 0,
            max_capacity INTEGER DEFAULT 0,
            min_completion_percent INTEGER DEFAULT 90,
            weightage_percent REAL DEFAULT 0,
            enable_ai_assignment INTEGER DEFAULT 0,
            enable_load_balancing INTEGER DEFAULT 0,
            enable_complexity_scoring INTEGER DEFAULT 0,
            prevent_overload INTEGER DEFAULT 0,
            reassign_if_target_not_met INTEGER DEFAULT 0,
            max_tasks_per_day INTEGER DEFAULT 5,
            max_tasks_per_campaign INTEGER DEFAULT 20,
            allowed_rework_percent REAL DEFAULT 10,
            delay_tolerance_percent REAL DEFAULT 15,
            auto_assign_rules_summary TEXT,
            validation_rules TEXT,
            owner_id INTEGER,
            reviewer_id INTEGER,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id),
            FOREIGN KEY (reviewer_id) REFERENCES users(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Create performance_targets table if not exists
    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS performance_targets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_level TEXT NOT NULL,
            brand_id INTEGER,
            brand_name TEXT,
            tutorials_india TEXT,
            department_function TEXT NOT NULL,
            applies_to TEXT,
            kpi_name TEXT NOT NULL,
            metric_type TEXT NOT NULL,
            unit TEXT NOT NULL,
            direction TEXT NOT NULL,
            examples TEXT,
            baseline_value TEXT NOT NULL,
            current_performance TEXT,
            target_value TEXT NOT NULL,
            desired_performance TEXT,
            cycle_type TEXT DEFAULT 'Monthly',
            period_from DATE,
            period_to DATE,
            tolerance_min TEXT,
            tolerance_max TEXT,
            gold_standard_metric_id INTEGER,
            gold_standard_value TEXT,
            competitor_benchmark TEXT,
            your_target TEXT,
            your_current TEXT,
            competitor_current TEXT,
            review_frequency TEXT DEFAULT 'Monthly',
            auto_evaluate INTEGER DEFAULT 0,
            data_source TEXT,
            validation_rules TEXT,
            auto_calculate_score INTEGER DEFAULT 0,
            trigger_alert_70_percent INTEGER DEFAULT 0,
            trigger_alert_110_percent INTEGER DEFAULT 0,
            trigger_alert_downward_trend INTEGER DEFAULT 0,
            use_in_okr_evaluation INTEGER DEFAULT 0,
            use_in_employee_scorecards INTEGER DEFAULT 0,
            use_in_project_health_score INTEGER DEFAULT 0,
            use_in_dashboard_highlights INTEGER DEFAULT 0,
            performance_scoring_logic TEXT,
            achievement_calculation TEXT,
            score_capping_logic TEXT,
            status_achieved_green TEXT,
            status_on_track_yellow TEXT,
            status_off_track_red TEXT,
            owner_id INTEGER,
            owner_name TEXT,
            reviewer_id INTEGER,
            reviewer_name TEXT,
            responsible_roles TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id),
            FOREIGN KEY (reviewer_id) REFERENCES users(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Add missing columns to okrs table
    addColumnIfNotExists('okrs', 'objective_title', 'TEXT NOT NULL');
    addColumnIfNotExists('okrs', 'objective_type', 'TEXT DEFAULT "Department"');
    addColumnIfNotExists('okrs', 'department', 'TEXT');
    addColumnIfNotExists('okrs', 'owner_id', 'INTEGER');
    addColumnIfNotExists('okrs', 'cycle', 'TEXT DEFAULT "Q1"');
    addColumnIfNotExists('okrs', 'objective_description', 'TEXT');
    addColumnIfNotExists('okrs', 'why_this_matters', 'TEXT');
    addColumnIfNotExists('okrs', 'expected_outcome', 'TEXT');
    addColumnIfNotExists('okrs', 'target_date', 'DATE');
    addColumnIfNotExists('okrs', 'alignment', 'TEXT');
    addColumnIfNotExists('okrs', 'parent_okr_id', 'INTEGER');
    addColumnIfNotExists('okrs', 'key_results', 'TEXT');
    addColumnIfNotExists('okrs', 'reviewer_id', 'INTEGER');
    addColumnIfNotExists('okrs', 'review_notes', 'TEXT');
    addColumnIfNotExists('okrs', 'evidence_links', 'TEXT');
    addColumnIfNotExists('okrs', 'status', 'TEXT DEFAULT "Draft"');
    addColumnIfNotExists('okrs', 'progress', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('okrs', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('okrs', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('on_page_seo_audits', 'assigned_to_id', 'INTEGER');
    addColumnIfNotExists('on_page_seo_audits', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Add missing columns to gold_standards table
    addColumnIfNotExists('gold_standards', 'metric_name', 'TEXT NOT NULL');
    addColumnIfNotExists('gold_standards', 'category', 'TEXT NOT NULL');
    addColumnIfNotExists('gold_standards', 'description', 'TEXT');
    addColumnIfNotExists('gold_standards', 'why_matters', 'TEXT');
    addColumnIfNotExists('gold_standards', 'gold_standard_value', 'TEXT NOT NULL');
    addColumnIfNotExists('gold_standards', 'acceptable_range_min', 'TEXT');
    addColumnIfNotExists('gold_standards', 'acceptable_range_max', 'TEXT');
    addColumnIfNotExists('gold_standards', 'unit', 'TEXT');
    addColumnIfNotExists('gold_standards', 'source', 'TEXT');
    addColumnIfNotExists('gold_standards', 'evidence_link', 'TEXT');
    addColumnIfNotExists('gold_standards', 'file_upload', 'TEXT');
    addColumnIfNotExists('gold_standards', 'additional_notes', 'TEXT');
    addColumnIfNotExists('gold_standards', 'owner_id', 'INTEGER');
    addColumnIfNotExists('gold_standards', 'reviewer_id', 'INTEGER');
    addColumnIfNotExists('gold_standards', 'review_frequency', 'TEXT DEFAULT "Quarterly"');
    addColumnIfNotExists('gold_standards', 'status', 'TEXT DEFAULT "Active"');
    addColumnIfNotExists('gold_standards', 'next_review_date', 'DATE');
    addColumnIfNotExists('gold_standards', 'governance_notes', 'TEXT');
    addColumnIfNotExists('gold_standards', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('gold_standards', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Add missing columns to effort_targets table
    addColumnIfNotExists('effort_targets', 'department', 'TEXT NOT NULL');
    addColumnIfNotExists('effort_targets', 'role', 'TEXT NOT NULL');
    addColumnIfNotExists('effort_targets', 'kpi_category', 'TEXT NOT NULL');
    addColumnIfNotExists('effort_targets', 'effort_metric', 'TEXT NOT NULL');
    addColumnIfNotExists('effort_targets', 'effective_date', 'DATE');
    addColumnIfNotExists('effort_targets', 'status', 'TEXT DEFAULT "Draft"');
    addColumnIfNotExists('effort_targets', 'monthly_target', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('effort_targets', 'weekly_target', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('effort_targets', 'daily_target', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('effort_targets', 'max_capacity', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('effort_targets', 'min_completion_percent', 'INTEGER DEFAULT 90');
    addColumnIfNotExists('effort_targets', 'weightage_percent', 'REAL DEFAULT 0');
    addColumnIfNotExists('effort_targets', 'enable_ai_assignment', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('effort_targets', 'enable_load_balancing', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('effort_targets', 'enable_complexity_scoring', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('effort_targets', 'prevent_overload', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('effort_targets', 'reassign_if_target_not_met', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('effort_targets', 'max_tasks_per_day', 'INTEGER DEFAULT 5');
    addColumnIfNotExists('effort_targets', 'max_tasks_per_campaign', 'INTEGER DEFAULT 20');
    addColumnIfNotExists('effort_targets', 'allowed_rework_percent', 'REAL DEFAULT 10');
    addColumnIfNotExists('effort_targets', 'delay_tolerance_percent', 'REAL DEFAULT 15');
    addColumnIfNotExists('effort_targets', 'auto_assign_rules_summary', 'TEXT');
    addColumnIfNotExists('effort_targets', 'validation_rules', 'TEXT');
    addColumnIfNotExists('effort_targets', 'owner_id', 'INTEGER');
    addColumnIfNotExists('effort_targets', 'reviewer_id', 'INTEGER');
    addColumnIfNotExists('effort_targets', 'created_by', 'INTEGER');
    addColumnIfNotExists('effort_targets', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('effort_targets', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Add missing columns to performance_targets table
    addColumnIfNotExists('performance_targets', 'target_level', 'TEXT NOT NULL');
    addColumnIfNotExists('performance_targets', 'brand_id', 'INTEGER');
    addColumnIfNotExists('performance_targets', 'brand_name', 'TEXT');
    addColumnIfNotExists('performance_targets', 'tutorials_india', 'TEXT');
    addColumnIfNotExists('performance_targets', 'department_function', 'TEXT NOT NULL');
    addColumnIfNotExists('performance_targets', 'applies_to', 'TEXT');
    addColumnIfNotExists('performance_targets', 'kpi_name', 'TEXT NOT NULL');
    addColumnIfNotExists('performance_targets', 'metric_type', 'TEXT NOT NULL');
    addColumnIfNotExists('performance_targets', 'unit', 'TEXT NOT NULL');
    addColumnIfNotExists('performance_targets', 'direction', 'TEXT NOT NULL');
    addColumnIfNotExists('performance_targets', 'examples', 'TEXT');
    addColumnIfNotExists('performance_targets', 'baseline_value', 'TEXT NOT NULL');
    addColumnIfNotExists('performance_targets', 'current_performance', 'TEXT');
    addColumnIfNotExists('performance_targets', 'target_value', 'TEXT NOT NULL');
    addColumnIfNotExists('performance_targets', 'desired_performance', 'TEXT');
    addColumnIfNotExists('performance_targets', 'cycle_type', 'TEXT DEFAULT "Monthly"');
    addColumnIfNotExists('performance_targets', 'period_from', 'DATE');
    addColumnIfNotExists('performance_targets', 'period_to', 'DATE');
    addColumnIfNotExists('performance_targets', 'tolerance_min', 'TEXT');
    addColumnIfNotExists('performance_targets', 'tolerance_max', 'TEXT');
    addColumnIfNotExists('performance_targets', 'gold_standard_metric_id', 'INTEGER');
    addColumnIfNotExists('performance_targets', 'gold_standard_value', 'TEXT');
    addColumnIfNotExists('performance_targets', 'competitor_benchmark', 'TEXT');
    addColumnIfNotExists('performance_targets', 'your_target', 'TEXT');
    addColumnIfNotExists('performance_targets', 'your_current', 'TEXT');
    addColumnIfNotExists('performance_targets', 'competitor_current', 'TEXT');
    addColumnIfNotExists('performance_targets', 'review_frequency', 'TEXT DEFAULT "Monthly"');
    addColumnIfNotExists('performance_targets', 'auto_evaluate', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('performance_targets', 'data_source', 'TEXT');
    addColumnIfNotExists('performance_targets', 'validation_rules', 'TEXT');
    addColumnIfNotExists('performance_targets', 'auto_calculate_score', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('performance_targets', 'trigger_alert_70_percent', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('performance_targets', 'trigger_alert_110_percent', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('performance_targets', 'trigger_alert_downward_trend', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('performance_targets', 'use_in_okr_evaluation', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('performance_targets', 'use_in_employee_scorecards', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('performance_targets', 'use_in_project_health_score', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('performance_targets', 'use_in_dashboard_highlights', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('performance_targets', 'performance_scoring_logic', 'TEXT');
    addColumnIfNotExists('performance_targets', 'achievement_calculation', 'TEXT');
    addColumnIfNotExists('performance_targets', 'score_capping_logic', 'TEXT');
    addColumnIfNotExists('performance_targets', 'status_achieved_green', 'TEXT');
    addColumnIfNotExists('performance_targets', 'status_on_track_yellow', 'TEXT');
    addColumnIfNotExists('performance_targets', 'status_off_track_red', 'TEXT');
    addColumnIfNotExists('performance_targets', 'owner_id', 'INTEGER');
    addColumnIfNotExists('performance_targets', 'owner_name', 'TEXT');
    addColumnIfNotExists('performance_targets', 'reviewer_id', 'INTEGER');
    addColumnIfNotExists('performance_targets', 'reviewer_name', 'TEXT');
    addColumnIfNotExists('performance_targets', 'responsible_roles', 'TEXT');
    addColumnIfNotExists('performance_targets', 'created_by', 'INTEGER');
    addColumnIfNotExists('performance_targets', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('performance_targets', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Add missing columns to keywords table
    addColumnIfNotExists('keywords', 'keyword_intent', 'TEXT NOT NULL');
    addColumnIfNotExists('keywords', 'keyword_type', 'TEXT NOT NULL');
    addColumnIfNotExists('keywords', 'language', 'TEXT DEFAULT "English"');
    addColumnIfNotExists('keywords', 'search_volume', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('keywords', 'competition_score', 'TEXT DEFAULT "Medium"');
    addColumnIfNotExists('keywords', 'mapped_service_id', 'INTEGER');
    addColumnIfNotExists('keywords', 'mapped_service', 'TEXT');
    addColumnIfNotExists('keywords', 'mapped_sub_service_id', 'INTEGER');
    addColumnIfNotExists('keywords', 'mapped_sub_service', 'TEXT');
    addColumnIfNotExists('keywords', 'status', 'TEXT DEFAULT "active"');
    addColumnIfNotExists('keywords', 'created_by', 'INTEGER');
    addColumnIfNotExists('keywords', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('keywords', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('performance_targets', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('performance_targets', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Add missing columns to backlink_sources table
    addColumnIfNotExists('backlink_sources', 'domain', 'TEXT NOT NULL');
    addColumnIfNotExists('backlink_sources', 'backlink_url', 'TEXT NOT NULL');
    addColumnIfNotExists('backlink_sources', 'backlink_category', 'TEXT NOT NULL');
    addColumnIfNotExists('backlink_sources', 'niche_industry', 'TEXT');
    addColumnIfNotExists('backlink_sources', 'da_score', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('backlink_sources', 'spam_score', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('backlink_sources', 'pricing', 'TEXT DEFAULT "Free"');
    addColumnIfNotExists('backlink_sources', 'country', 'TEXT');
    addColumnIfNotExists('backlink_sources', 'username', 'TEXT');
    addColumnIfNotExists('backlink_sources', 'password', 'TEXT');
    addColumnIfNotExists('backlink_sources', 'credentials_notes', 'TEXT');
    addColumnIfNotExists('backlink_sources', 'status', 'TEXT DEFAULT "active"');
    addColumnIfNotExists('backlink_sources', 'created_by', 'INTEGER');
    addColumnIfNotExists('backlink_sources', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    addColumnIfNotExists('backlink_sources', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    // Ensure admin user has password set (SHA256 hash of 'admin123')
    const adminPasswordHash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
    try {
        const adminUser = sqliteDb.prepare("SELECT * FROM users WHERE email = 'admin@example.com'").get() as any;
        if (adminUser && !adminUser.password_hash) {
            sqliteDb.prepare("UPDATE users SET password_hash = ?, role = 'admin', status = 'active', department = 'Administration' WHERE email = 'admin@example.com'")
                .run(adminPasswordHash);
            console.log('  Updated admin user with password');
        } else if (!adminUser) {
            sqliteDb.prepare("INSERT INTO users (name, email, role, status, password_hash, department) VALUES (?, ?, ?, ?, ?, ?)")
                .run('Admin User', 'admin@example.com', 'admin', 'active', adminPasswordHash, 'Administration');
            console.log('  Created admin user');
        }
    } catch (e) {
        console.log('  Admin user setup skipped');
    }

    console.log('✅ All database migrations completed');
};

// PostgreSQL-compatible pool interface
export const pool = {
    query: async (text: string, params?: any[]) => {
        try {
            // Convert PostgreSQL $1, $2 placeholders to SQLite ?
            let sqliteQuery = text;
            if (params && params.length > 0) {
                for (let i = params.length; i >= 1; i--) {
                    sqliteQuery = sqliteQuery.replace(new RegExp(`\\$${i}`, 'g'), '?');
                }
            }

            // Replace NOW() with CURRENT_TIMESTAMP
            sqliteQuery = sqliteQuery.replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP');

            // Replace RETURNING * with just the query (SQLite doesn't support RETURNING)
            const hasReturning = /RETURNING\s+.+$/i.test(sqliteQuery);
            sqliteQuery = sqliteQuery.replace(/RETURNING\s+.+$/i, '');

            const stmt = sqliteDb.prepare(sqliteQuery);

            const queryType = text.trim().toUpperCase().split(/\s+/)[0];

            if (queryType === 'SELECT') {
                const rows = stmt.all(...(params || []));
                return { rows };
            } else if (queryType === 'INSERT') {
                const result = stmt.run(...(params || []));
                if (hasReturning) {
                    // Get the last inserted row from the correct table
                    const lastId = result.lastInsertRowid;
                    // Extract table name from INSERT INTO table_name
                    const tableMatch = text.match(/INSERT\s+INTO\s+(\w+)/i);
                    const tableName = tableMatch ? tableMatch[1] : 'assets';
                    const selectStmt = sqliteDb.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
                    const row = selectStmt.get(lastId);
                    const rows = row ? [row] : [];
                    return { rows };
                }
                return { rows: [], rowCount: result.changes };
            } else if (queryType === 'UPDATE') {
                const result = stmt.run(...(params || []));
                if (hasReturning) {
                    // Get the updated row from the correct table
                    const id = params?.[params.length - 1];
                    // Extract table name from UPDATE table_name SET
                    const tableMatch = text.match(/UPDATE\s+(\w+)\s+SET/i);
                    const tableName = tableMatch ? tableMatch[1] : 'assets';
                    const selectStmt = sqliteDb.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
                    const rows = [selectStmt.get(id)];
                    return { rows };
                }
                return { rows: [], rowCount: result.changes };
            } else {
                const result = stmt.run(...(params || []));
                return { rows: [], rowCount: result.changes };
            }
        } catch (error: any) {
            console.error('SQLite Query Error:', error.message);
            console.error('Original Query:', text);
            console.error('Params:', params);
            console.error('Stack:', error.stack);
            throw error;
        }
    },
    connect: async () => {
        return Promise.resolve();
    }
};

export const db = sqliteDb;
