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
            tags TEXT,
            description TEXT,
            status TEXT DEFAULT 'Draft',
            usage_status TEXT DEFAULT 'Available',
            file_url TEXT,
            og_image_url TEXT,
            thumbnail_url TEXT,
            file_size TEXT,
            file_type TEXT,
            linked_service_ids TEXT,
            linked_sub_service_ids TEXT,
            application_type TEXT,
            keywords TEXT,
            web_title TEXT,
            web_description TEXT,
            web_meta_description TEXT,
            web_keywords TEXT,
            web_url TEXT,
            web_h1 TEXT,
            web_h2_1 TEXT,
            web_h2_2 TEXT,
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
            qc_score INTEGER,
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
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS keywords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword TEXT NOT NULL,
            keyword_type TEXT,
            search_volume INTEGER DEFAULT 0,
            competition TEXT,
            mapped_service TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

        INSERT OR IGNORE INTO keywords (id, keyword, keyword_type, search_volume, competition) VALUES 
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

    // Add missing columns to users table for admin functionality
    addColumnIfNotExists('users', 'password_hash', 'TEXT');
    addColumnIfNotExists('users', 'department', 'TEXT');
    addColumnIfNotExists('users', 'country', 'TEXT');
    addColumnIfNotExists('users', 'last_login', 'DATETIME');

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

            if (text.trim().toUpperCase().startsWith('SELECT')) {
                const rows = stmt.all(...(params || []));
                return { rows };
            } else if (text.trim().toUpperCase().startsWith('INSERT')) {
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
            } else if (text.trim().toUpperCase().startsWith('UPDATE')) {
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
