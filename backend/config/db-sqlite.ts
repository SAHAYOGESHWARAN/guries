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
            status TEXT,
            file_url TEXT,
            og_image_url TEXT,
            thumbnail_url TEXT,
            file_size TEXT,
            file_type TEXT,
            linked_service_ids TEXT,
            linked_sub_service_ids TEXT,
            application_type TEXT,
            web_title TEXT,
            web_description TEXT,
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
    `);

    console.log('✅ SQLite database initialized');
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
                    // Get the last inserted row
                    const lastId = result.lastInsertRowid;
                    const selectStmt = sqliteDb.prepare('SELECT * FROM assets WHERE id = ?');
                    const rows = [selectStmt.get(lastId)];
                    return { rows };
                }
                return { rows: [], rowCount: result.changes };
            } else if (text.trim().toUpperCase().startsWith('UPDATE')) {
                const result = stmt.run(...(params || []));
                if (hasReturning) {
                    // Get the updated row
                    const id = params?.[params.length - 1];
                    const selectStmt = sqliteDb.prepare('SELECT * FROM assets WHERE id = ?');
                    const rows = [selectStmt.get(id)];
                    return { rows };
                }
                return { rows: [], rowCount: result.changes };
            } else {
                const result = stmt.run(...(params || []));
                return { rows: [], rowCount: result.changes };
            }
        } catch (error: any) {
            console.error('Query error:', error.message);
            console.error('Query:', text);
            console.error('Params:', params);
            throw error;
        }
    },
    connect: async () => {
        return Promise.resolve();
    }
};

export const db = sqliteDb;
