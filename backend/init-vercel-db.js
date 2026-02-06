#!/usr/bin/env node

/**
 * Vercel PostgreSQL Database Initialization Script
 * Runs on deployment to ensure database schema is created
 */

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initializeDatabase = async () => {
    const client = await pool.connect();
    try {
        console.log('[DB Init] Starting database initialization...');

        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
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
            )
        `);
        console.log('[DB Init] ✓ users table created');

        // Create roles table
        await client.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                role_name TEXT UNIQUE NOT NULL,
                permissions TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('[DB Init] ✓ roles table created');

        // Create brands table
        await client.query(`
            CREATE TABLE IF NOT EXISTS brands (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                code TEXT,
                industry TEXT,
                website TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('[DB Init] ✓ brands table created');

        // Create services table
        await client.query(`
            CREATE TABLE IF NOT EXISTS services (
                id SERIAL PRIMARY KEY,
                service_name TEXT NOT NULL,
                service_code TEXT,
                slug TEXT,
                status TEXT DEFAULT 'draft',
                h1 TEXT,
                h2_list TEXT,
                h3_list TEXT,
                h4_list TEXT,
                h5_list TEXT,
                body_content TEXT,
                internal_links TEXT,
                external_links TEXT,
                image_alt_texts TEXT,
                meta_title TEXT,
                meta_description TEXT,
                focus_keywords TEXT,
                secondary_keywords TEXT,
                meta_keywords TEXT,
                og_title TEXT,
                og_description TEXT,
                og_image_url TEXT,
                twitter_title TEXT,
                twitter_description TEXT,
                twitter_image_url TEXT,
                schema_type_id INTEGER,
                robots_index TEXT,
                robots_follow TEXT,
                canonical_url TEXT,
                word_count INTEGER,
                reading_time_minutes INTEGER,
                version_number INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('[DB Init] ✓ services table created');

        // Create sub_services table
        await client.query(`
            CREATE TABLE IF NOT EXISTS sub_services (
                id SERIAL PRIMARY KEY,
                service_id INTEGER NOT NULL REFERENCES services(id),
                sub_service_name TEXT NOT NULL,
                sub_service_code TEXT,
                slug TEXT,
                description TEXT,
                status TEXT DEFAULT 'draft',
                parent_service_id INTEGER REFERENCES services(id),
                h1 TEXT,
                h2_list TEXT,
                h3_list TEXT,
                h4_list TEXT,
                h5_list TEXT,
                body_content TEXT,
                internal_links TEXT,
                external_links TEXT,
                image_alt_texts TEXT,
                meta_title TEXT,
                meta_description TEXT,
                focus_keywords TEXT,
                secondary_keywords TEXT,
                meta_keywords TEXT,
                og_title TEXT,
                og_description TEXT,
                og_image_url TEXT,
                twitter_title TEXT,
                twitter_description TEXT,
                twitter_image_url TEXT,
                schema_type_id INTEGER,
                robots_index TEXT,
                robots_follow TEXT,
                canonical_url TEXT,
                word_count INTEGER,
                reading_time_minutes INTEGER,
                version_number INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('[DB Init] ✓ sub_services table created');

        // Create assets table
        await client.query(`
            CREATE TABLE IF NOT EXISTS assets (
                id SERIAL PRIMARY KEY,
                asset_name TEXT NOT NULL,
                asset_type TEXT,
                asset_category TEXT,
                asset_format TEXT,
                status TEXT DEFAULT 'draft',
                qc_status TEXT,
                file_url TEXT,
                thumbnail_url TEXT,
                qc_score INTEGER,
                qc_checklist_items TEXT,
                submitted_by INTEGER REFERENCES users(id),
                submitted_at TIMESTAMP,
                qc_reviewer_id INTEGER REFERENCES users(id),
                qc_reviewed_at TIMESTAMP,
                qc_remarks TEXT,
                qc_checklist_completion INTEGER,
                linking_active INTEGER DEFAULT 0,
                rework_count INTEGER DEFAULT 0,
                workflow_log TEXT,
                workflow_stage TEXT DEFAULT 'draft',
                version_number INTEGER DEFAULT 1,
                version_history TEXT,
                created_by INTEGER REFERENCES users(id),
                updated_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
                seo_title TEXT,
                seo_meta_title TEXT,
                seo_description TEXT,
                seo_service_url TEXT,
                seo_blog_url TEXT,
                seo_anchor_text TEXT,
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
                seo_primary_keyword_id INTEGER,
                seo_lsi_keywords TEXT,
                seo_domain_type TEXT,
                seo_domains TEXT,
                seo_blog_content TEXT,
                seo_sector_id INTEGER,
                seo_industry_id INTEGER,
                linked_task_id INTEGER,
                linked_campaign_id INTEGER,
                linked_project_id INTEGER,
                linked_service_id INTEGER REFERENCES services(id),
                linked_sub_service_id INTEGER REFERENCES sub_services(id),
                linked_repository_item_id INTEGER,
                linked_service_ids TEXT,
                linked_sub_service_ids TEXT,
                designed_by INTEGER REFERENCES users(id),
                published_by INTEGER REFERENCES users(id),
                verified_by INTEGER REFERENCES users(id),
                published_at TIMESTAMP,
                og_image_url TEXT,
                file_size INTEGER,
                file_type TEXT,
                dimensions TEXT,
                keywords TEXT,
                content_keywords TEXT,
                seo_keywords TEXT,
                static_service_links TEXT,
                resource_files TEXT,
                content_type TEXT,
                usage_status TEXT,
                assigned_team_members TEXT,
                application_type TEXT,
                asset_website_usage TEXT,
                asset_social_media_usage TEXT,
                asset_backlink_usage TEXT
            )
        `);
        console.log('[DB Init] ✓ assets table created');

        // Create projects table
        await client.query(`
            CREATE TABLE IF NOT EXISTS projects (
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
            )
        `);
        console.log('[DB Init] ✓ projects table created');

        // Create campaigns table
        await client.query(`
            CREATE TABLE IF NOT EXISTS campaigns (
                id SERIAL PRIMARY KEY,
                campaign_name TEXT NOT NULL,
                campaign_type TEXT DEFAULT 'Content',
                status TEXT DEFAULT 'planning',
                description TEXT,
                campaign_start_date DATE,
                campaign_end_date DATE,
                campaign_owner_id INTEGER REFERENCES users(id),
                project_id INTEGER REFERENCES projects(id),
                brand_id INTEGER REFERENCES brands(id),
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
            )
        `);
        console.log('[DB Init] ✓ campaigns table created');

        // Create tasks table
        await client.query(`
            CREATE TABLE IF NOT EXISTS tasks (
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
            )
        `);
        console.log('[DB Init] ✓ tasks table created');

        // Create keywords table
        await client.query(`
            CREATE TABLE IF NOT EXISTS keywords (
                id SERIAL PRIMARY KEY,
                keyword TEXT,
                keyword_name TEXT UNIQUE NOT NULL,
                keyword_code TEXT,
                keyword_id TEXT,
                keyword_intent TEXT,
                keyword_type TEXT,
                language TEXT,
                search_volume INTEGER,
                difficulty_score INTEGER,
                mapped_service_id INTEGER REFERENCES services(id),
                mapped_service TEXT,
                mapped_sub_service_id INTEGER REFERENCES sub_services(id),
                mapped_sub_service TEXT,
                keyword_category TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('[DB Init] ✓ keywords table created');

        // Create asset_category_master table
        await client.query(`
            CREATE TABLE IF NOT EXISTS asset_category_master (
                id SERIAL PRIMARY KEY,
                category_name TEXT UNIQUE NOT NULL,
                category_code TEXT,
                description TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('[DB Init] ✓ asset_category_master table created');

        // Create asset_type_master table
        await client.query(`
            CREATE TABLE IF NOT EXISTS asset_type_master (
                id SERIAL PRIMARY KEY,
                asset_type_name TEXT UNIQUE NOT NULL,
                type_name TEXT,
                type_code TEXT,
                description TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('[DB Init] ✓ asset_type_master table created');

        // Create asset_formats table
        await client.query(`
            CREATE TABLE IF NOT EXISTS asset_formats (
                id SERIAL PRIMARY KEY,
                format_name TEXT UNIQUE NOT NULL,
                format_code TEXT,
                description TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('[DB Init] ✓ asset_formats table created');

        // Create service_asset_links table
        await client.query(`
            CREATE TABLE IF NOT EXISTS service_asset_links (
                id SERIAL PRIMARY KEY,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
                link_type TEXT DEFAULT 'primary',
                is_static INTEGER DEFAULT 0,
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(service_id, asset_id)
            )
        `);
        console.log('[DB Init] ✓ service_asset_links table created');

        // Create subservice_asset_links table
        await client.query(`
            CREATE TABLE IF NOT EXISTS subservice_asset_links (
                id SERIAL PRIMARY KEY,
                sub_service_id INTEGER NOT NULL REFERENCES sub_services(id) ON DELETE CASCADE,
                asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
                link_type TEXT DEFAULT 'primary',
                is_static INTEGER DEFAULT 0,
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(sub_service_id, asset_id)
            )
        `);
        console.log('[DB Init] ✓ subservice_asset_links table created');

        // Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_assets_qc_status ON assets(qc_status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_assets_workflow_stage ON assets(workflow_stage)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_services_status ON services(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
        console.log('[DB Init] ✓ Indexes created');

        console.log('[DB Init] ✅ Database initialization completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('[DB Init] ❌ Error initializing database:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

initializeDatabase();
