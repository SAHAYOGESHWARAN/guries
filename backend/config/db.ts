import path from 'path';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

// FORCE PostgreSQL in production - SQLite doesn't persist on Vercel
const usePostgres = process.env.NODE_ENV === 'production' || process.env.USE_PG === 'true' || process.env.DB_CLIENT === 'pg';

let pool: any;
let dbInitialized = false;

if (usePostgres) {
    // PostgreSQL Configuration (for production on Vercel)
    console.log('[DB] Initializing PostgreSQL connection...');

    const { Pool } = require('pg');

    const connectionString = process.env.DATABASE_URL ||
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err: any) => {
        console.error('[DB] Unexpected error on idle client:', err);
    });

    // Wrap pool.query to ensure schema is initialized
    const originalQuery = pool.query.bind(pool);
    pool.query = async (sql: string, params?: any[]) => {
        // Initialize schema on first query if not already done
        if (!dbInitialized && usePostgres) {
            try {
                dbInitialized = true;
                console.log('[DB] Running schema initialization on first query...');

                const client = await pool.connect();
                try {
                    // Create all essential tables
                    const tables = [
                        `CREATE TABLE IF NOT EXISTS users (
                            id SERIAL PRIMARY KEY,
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
                        `CREATE TABLE IF NOT EXISTS industry_sectors (
                            id SERIAL PRIMARY KEY,
                            sector VARCHAR(255) NOT NULL,
                            industry VARCHAR(255) NOT NULL,
                            application VARCHAR(255),
                            country VARCHAR(100),
                            description TEXT,
                            status VARCHAR(50) DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS brands (
                            id SERIAL PRIMARY KEY,
                            name TEXT UNIQUE NOT NULL,
                            code TEXT,
                            industry TEXT,
                            website TEXT,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS services (
                            id SERIAL PRIMARY KEY,
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
                            menu_position INTEGER DEFAULT 0,
                            breadcrumb_label TEXT,
                            parent_menu_section TEXT,
                            include_in_xml_sitemap INTEGER DEFAULT 1,
                            sitemap_priority DECIMAL(3,2) DEFAULT 0.8,
                            sitemap_changefreq TEXT DEFAULT 'monthly',
                            content_type TEXT,
                            category TEXT,
                            buyer_journey_stage TEXT,
                            primary_persona_id INTEGER,
                            secondary_persona_ids TEXT,
                            target_segment_notes TEXT,
                            primary_cta_label TEXT,
                            primary_cta_url TEXT,
                            form_id INTEGER,
                            linked_campaign_ids TEXT,
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
                            seo_score INTEGER DEFAULT 0,
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
                            has_subservices INTEGER DEFAULT 0,
                            subservice_count INTEGER DEFAULT 0,
                            primary_subservice_id INTEGER,
                            featured_asset_id INTEGER,
                            asset_count INTEGER DEFAULT 0,
                            knowledge_topic_id INTEGER,
                            linked_insights_ids TEXT,
                            linked_assets_ids TEXT,
                            brand_id INTEGER,
                            business_unit TEXT,
                            content_owner_id INTEGER,
                            created_by INTEGER,
                            updated_by INTEGER,
                            version_number INTEGER DEFAULT 1,
                            change_log_link TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS assets (
                            id SERIAL PRIMARY KEY,
                            asset_name TEXT NOT NULL,
                            name TEXT,
                            type TEXT,
                            asset_type TEXT,
                            asset_category TEXT,
                            asset_format TEXT,
                            content_type TEXT,
                            repository TEXT,
                            status TEXT DEFAULT 'draft',
                            workflow_stage TEXT DEFAULT 'Add',
                            qc_status TEXT,
                            submitted_by INTEGER,
                            submitted_at TIMESTAMP,
                            qc_reviewer_id INTEGER,
                            qc_reviewed_at TIMESTAMP,
                            qc_score INTEGER,
                            qc_remarks TEXT,
                            qc_checklist_items TEXT,
                            rework_count INTEGER DEFAULT 0,
                            linking_active INTEGER DEFAULT 0,
                            seo_score INTEGER,
                            grammar_score INTEGER,
                            ai_plagiarism_score INTEGER,
                            date TEXT,
                            linked_task INTEGER,
                            owner_id INTEGER,
                            linked_task_id INTEGER,
                            linked_campaign_id INTEGER,
                            linked_project_id INTEGER,
                            linked_service_id INTEGER,
                            linked_sub_service_id INTEGER,
                            linked_repository_item_id INTEGER,
                            created_by INTEGER,
                            updated_by INTEGER,
                            designed_by INTEGER,
                            published_by INTEGER,
                            verified_by INTEGER,
                            published_at TIMESTAMP,
                            version_number TEXT,
                            version_history TEXT,
                            file_url TEXT,
                            thumbnail_url TEXT,
                            file_size INTEGER,
                            file_type TEXT,
                            dimensions TEXT,
                            linked_service_ids TEXT,
                            linked_sub_service_ids TEXT,
                            linked_page_ids TEXT,
                            mapped_to TEXT,
                            application_type TEXT,
                            keywords TEXT,
                            content_keywords TEXT,
                            seo_keywords TEXT,
                            resource_files TEXT,
                            usage_count INTEGER,
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
                            web_body_attachment TEXT,
                            web_body_attachment_name TEXT,
                            smm_platform TEXT,
                            smm_title TEXT,
                            smm_tag TEXT,
                            smm_url TEXT,
                            smm_description TEXT,
                            smm_hashtags TEXT,
                            smm_media_url TEXT,
                            smm_media_type TEXT,
                            smm_additional_pages TEXT,
                            smm_post_type TEXT,
                            smm_campaign_type TEXT,
                            smm_cta TEXT,
                            smm_target_audience TEXT,
                            smm_content_type TEXT,
                            smm_caption TEXT,
                            smm_scheduled_date TEXT,
                            seo_title TEXT,
                            seo_target_url TEXT,
                            seo_focus_keyword TEXT,
                            seo_content_type TEXT,
                            seo_meta_description TEXT,
                            seo_content_description TEXT,
                            seo_h1 TEXT,
                            seo_h2_1 TEXT,
                            seo_h2_2 TEXT,
                            seo_content_body TEXT,
                            static_service_links TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS projects (
                            id SERIAL PRIMARY KEY,
                            project_name TEXT NOT NULL,
                            project_code TEXT UNIQUE,
                            description TEXT,
                            status TEXT DEFAULT 'Planned',
                            start_date DATE,
                            end_date DATE,
                            budget DECIMAL(10,2),
                            owner_id INTEGER REFERENCES users(id),
                            brand_id INTEGER REFERENCES brands(id),
                            linked_service_id INTEGER REFERENCES services(id),
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
                            id SERIAL PRIMARY KEY,
                            campaign_name TEXT NOT NULL,
                            campaign_type TEXT DEFAULT 'Content',
                            status TEXT DEFAULT 'planning',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS tasks (
                            id SERIAL PRIMARY KEY,
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
                            id SERIAL PRIMARY KEY,
                            user_id INTEGER NOT NULL REFERENCES users(id),
                            title TEXT,
                            message TEXT,
                            type TEXT,
                            is_read INTEGER DEFAULT 0,
                            link TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS content_types (
                            id SERIAL PRIMARY KEY,
                            name TEXT UNIQUE NOT NULL,
                            description TEXT,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS asset_types (
                            id SERIAL PRIMARY KEY,
                            name TEXT UNIQUE NOT NULL,
                            description TEXT,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS asset_categories (
                            id SERIAL PRIMARY KEY,
                            name TEXT UNIQUE NOT NULL,
                            description TEXT,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS asset_formats (
                            id SERIAL PRIMARY KEY,
                            name TEXT UNIQUE NOT NULL,
                            description TEXT,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS platforms (
                            id SERIAL PRIMARY KEY,
                            name TEXT UNIQUE NOT NULL,
                            description TEXT,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS countries (
                            id SERIAL PRIMARY KEY,
                            name TEXT UNIQUE NOT NULL,
                            code TEXT,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS country_master (
                            id SERIAL PRIMARY KEY,
                            country_name TEXT UNIQUE NOT NULL,
                            iso_code TEXT UNIQUE NOT NULL,
                            region TEXT NOT NULL,
                            default_language TEXT,
                            allowed_for_backlinks BOOLEAN DEFAULT false,
                            allowed_for_content_targeting BOOLEAN DEFAULT false,
                            allowed_for_smm_targeting BOOLEAN DEFAULT false,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS keywords (
                            id SERIAL PRIMARY KEY,
                            keyword TEXT NOT NULL,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS backlink_sources (
                            id SERIAL PRIMARY KEY,
                            source_name TEXT NOT NULL,
                            url TEXT,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS personas (
                            id SERIAL PRIMARY KEY,
                            name TEXT NOT NULL,
                            description TEXT,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`,
                        `CREATE TABLE IF NOT EXISTS forms (
                            id SERIAL PRIMARY KEY,
                            name TEXT NOT NULL,
                            description TEXT,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`
                    ];

                    for (const tableSQL of tables) {
                        try {
                            await client.query(tableSQL);
                        } catch (e: any) {
                            if (!e.message.includes('already exists')) {
                                console.warn('[DB] Table creation warning:', e.message.substring(0, 80));
                            }
                        }
                    }
                    console.log('[DB] ✅ Schema initialized successfully');

                    // Seed data after schema creation
                    try {
                        const { seedVercelDatabase } = require('./seed-vercel-db');
                        await seedVercelDatabase();
                    } catch (seedErr: any) {
                        console.warn('[DB] Seeding warning:', seedErr.message.substring(0, 80));
                    }
                } finally {
                    client.release();
                }
            } catch (err: any) {
                console.error('[DB] Schema initialization error:', err.message);
                dbInitialized = false; // Reset flag to retry
            }
        }

        // Execute the actual query
        return originalQuery(sql, params);
    };

    console.log('[DB] ✅ PostgreSQL connection pool created for production');
} else {
    // SQLite Configuration (for local development)
    console.log('[DB] Initializing SQLite connection...');

    // Ensure database directory exists
    const dbDir = path.join(__dirname, '..', '..');
    if (!require('fs').existsSync(dbDir)) {
        require('fs').mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'mcc_db.sqlite');
    console.log(`[DB] SQLite database path: ${dbPath}`);

    // Open database with explicit read-write flags
    const db = new Database(dbPath, { fileMustExist: false, readonly: false, timeout: 5000 });
    db.pragma('journal_mode = DELETE');
    db.pragma('synchronous = FULL');
    db.pragma('foreign_keys = ON');

    // Create tables synchronously at initialization time
    // Tables are created by init.ts, not here
    const tables: string[] = [];

    console.log('[DB] Creating tables at module initialization...');
    for (const tableSQL of tables) {
        try {
            console.log(`[DB] Creating table: ${tableSQL.substring(0, 50)}...`);
            db.prepare(tableSQL).run();
            console.log('[DB] ✅ Table created');
        } catch (e: any) {
            console.error('[DB] ❌ Table creation error:', e.message);
            if (!e.message.includes('already exists')) {
                console.warn('[DB] Table creation warning:', e.message.substring(0, 80));
            }
        }
    }

    // Force a checkpoint to flush changes to disk
    try {
        db.pragma('wal_checkpoint(RESTART)');
        console.log('[DB] ✅ Checkpoint completed');
    } catch (e) {
        console.log('[DB] Checkpoint not needed (not using WAL mode)');
    }

    console.log(`[DB] Database opened successfully at ${dbPath}`);

    pool = {
        query: async (sql: string, params?: any[]) => {
            try {
                const trimmedSql = sql.trim().toUpperCase();

                if (trimmedSql.startsWith('SELECT')) {
                    const stmt = db.prepare(sql);
                    const rows = params ? stmt.all(...params) : stmt.all();
                    return { rows, rowCount: rows.length };
                }

                if (trimmedSql.startsWith('INSERT')) {
                    const stmt = db.prepare(sql);
                    const result = params ? stmt.run(...params) : stmt.run();
                    const insertedId = Number(result.lastInsertRowid);

                    return {
                        rows: [{ id: insertedId }],
                        lastID: insertedId,
                        changes: result.changes,
                        rowCount: result.changes
                    };
                }

                if (trimmedSql.startsWith('UPDATE')) {
                    const stmt = db.prepare(sql);
                    const result = params ? stmt.run(...params) : stmt.run();
                    return { rows: [], changes: result.changes, rowCount: result.changes };
                }

                if (trimmedSql.startsWith('DELETE')) {
                    const stmt = db.prepare(sql);
                    const result = params ? stmt.run(...params) : stmt.run();
                    return { rows: [], changes: result.changes, rowCount: result.changes };
                }

                // Handle CREATE/DROP/ALTER statements
                if (trimmedSql.startsWith('CREATE') || trimmedSql.startsWith('DROP') || trimmedSql.startsWith('ALTER')) {
                    try {
                        const statements = sql.split(';').filter(s => s.trim());
                        for (const stmt of statements) {
                            if (stmt.trim()) {
                                try {
                                    db.prepare(stmt).run();
                                } catch (stmtErr: any) {
                                    if (!stmtErr.message.includes('already exists')) {
                                        throw stmtErr;
                                    }
                                }
                            }
                        }
                        return { rows: [], rowCount: 0 };
                    } catch (e: any) {
                        if (!e.message.includes('already exists')) {
                            throw e;
                        }
                        return { rows: [], rowCount: 0 };
                    }
                }

                const stmt = db.prepare(sql);
                const rows = params ? stmt.all(...params) : stmt.all();
                return { rows, rowCount: rows.length };
            } catch (error: any) {
                console.error('[DB] Database error:', error.message);
                throw error;
            }
        },
        end: async () => {
            db.close();
        }
    };

    console.log('[DB] ✅ SQLite connection created for local development');
}

export { pool };
