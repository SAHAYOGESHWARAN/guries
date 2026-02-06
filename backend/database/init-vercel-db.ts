import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize Vercel PostgreSQL Database
 * Runs on first deployment to create schema and tables
 */

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

const initializeVercelDatabase = async () => {
    const client = await pool.connect();

    try {
        console.log('🔄 Starting Vercel PostgreSQL database initialization...');

        // Test connection
        const result = await client.query('SELECT NOW()');
        console.log('✅ Connected to PostgreSQL:', result.rows[0]);

        // Create all tables
        console.log('📋 Creating database tables...');

        // Users table
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
      );
    `);
        console.log('✅ Users table created');

        // Brands table
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
      );
    `);
        console.log('✅ Brands table created');

        // Services table
        await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        service_name TEXT NOT NULL,
        service_code TEXT,
        slug TEXT,
        status TEXT DEFAULT 'draft',
        meta_title TEXT,
        meta_description TEXT,
        h1 TEXT,
        h2_list TEXT,
        h3_list TEXT,
        body_content TEXT,
        internal_links TEXT,
        external_links TEXT,
        meta_keywords TEXT,
        og_title TEXT,
        og_description TEXT,
        og_image_url TEXT,
        canonical_url TEXT,
        word_count INTEGER,
        reading_time_minutes INTEGER,
        version_number INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Services table created');

        // Sub-Services table
        await client.query(`
      CREATE TABLE IF NOT EXISTS sub_services (
        id SERIAL PRIMARY KEY,
        service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        sub_service_name TEXT NOT NULL,
        sub_service_code TEXT,
        slug TEXT,
        description TEXT,
        status TEXT DEFAULT 'draft',
        meta_title TEXT,
        meta_description TEXT,
        body_content TEXT,
        version_number INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Sub-Services table created');

        // Keywords table
        await client.query(`
      CREATE TABLE IF NOT EXISTS keywords (
        id SERIAL PRIMARY KEY,
        keyword TEXT,
        keyword_name TEXT UNIQUE NOT NULL,
        keyword_code TEXT,
        keyword_intent TEXT,
        keyword_type TEXT,
        language TEXT,
        search_volume INTEGER,
        difficulty_score INTEGER,
        mapped_service_id INTEGER REFERENCES services(id),
        mapped_sub_service_id INTEGER REFERENCES sub_services(id),
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Keywords table created');

        // Assets table
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
        submitted_by INTEGER REFERENCES users(id),
        submitted_at TIMESTAMP,
        qc_reviewer_id INTEGER REFERENCES users(id),
        qc_reviewed_at TIMESTAMP,
        qc_remarks TEXT,
        linking_active INTEGER DEFAULT 0,
        rework_count INTEGER DEFAULT 0,
        workflow_stage TEXT DEFAULT 'draft',
        version_number INTEGER DEFAULT 1,
        created_by INTEGER REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        web_title TEXT,
        web_description TEXT,
        web_url TEXT,
        web_h1 TEXT,
        seo_title TEXT,
        seo_description TEXT,
        smm_platform TEXT,
        smm_title TEXT,
        smm_url TEXT,
        smm_description TEXT,
        seo_score INTEGER,
        grammar_score INTEGER,
        ai_plagiarism_score INTEGER,
        linked_campaign_id INTEGER,
        linked_project_id INTEGER,
        linked_service_id INTEGER REFERENCES services(id),
        linked_sub_service_id INTEGER REFERENCES sub_services(id),
        designed_by INTEGER REFERENCES users(id),
        published_by INTEGER REFERENCES users(id),
        verified_by INTEGER REFERENCES users(id),
        published_at TIMESTAMP,
        file_size INTEGER,
        file_type TEXT,
        keywords TEXT,
        content_type TEXT,
        usage_status TEXT,
        application_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Assets table created');

        // Asset QC Reviews
        await client.query(`
      CREATE TABLE IF NOT EXISTS asset_qc_reviews (
        id SERIAL PRIMARY KEY,
        asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
        qc_reviewer_id INTEGER REFERENCES users(id),
        qc_score INTEGER,
        checklist_completion INTEGER,
        qc_remarks TEXT,
        qc_decision TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Asset QC Reviews table created');

        // QC Audit Log
        await client.query(`
      CREATE TABLE IF NOT EXISTS qc_audit_log (
        id SERIAL PRIMARY KEY,
        asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(50),
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ QC Audit Log table created');

        // Projects table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Projects table created');

        // Campaigns table
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
        target_url TEXT,
        backlinks_planned INTEGER DEFAULT 0,
        backlinks_completed INTEGER DEFAULT 0,
        tasks_completed INTEGER DEFAULT 0,
        tasks_total INTEGER DEFAULT 0,
        kpi_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Campaigns table created');

        // Tasks table
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
        progress_stage TEXT DEFAULT 'Not Started',
        qc_stage TEXT DEFAULT 'Pending',
        estimated_hours DECIMAL(5,2),
        tags TEXT,
        rework_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Tasks table created');

        // Backlink Sources
        await client.query(`
      CREATE TABLE IF NOT EXISTS backlink_sources (
        id SERIAL PRIMARY KEY,
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
        status TEXT DEFAULT 'active',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Backlink Sources table created');

        // Backlink Submissions
        await client.query(`
      CREATE TABLE IF NOT EXISTS backlink_submissions (
        id SERIAL PRIMARY KEY,
        domain TEXT,
        opportunity_type TEXT,
        category TEXT,
        target_url TEXT,
        anchor_text TEXT,
        content_used TEXT,
        da_score INTEGER,
        spam_score INTEGER,
        country TEXT,
        service_id INTEGER REFERENCES services(id),
        sub_service_id INTEGER REFERENCES sub_services(id),
        seo_owner_id INTEGER REFERENCES users(id),
        is_paid INTEGER DEFAULT 0,
        submission_status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Backlink Submissions table created');

        // Toxic Backlinks
        await client.query(`
      CREATE TABLE IF NOT EXISTS toxic_backlinks (
        id SERIAL PRIMARY KEY,
        domain TEXT,
        toxic_url TEXT,
        backlink_url TEXT NOT NULL,
        landing_page TEXT,
        anchor_text TEXT,
        spam_score REAL,
        dr INTEGER,
        severity TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'Pending',
        assigned_to_id INTEGER REFERENCES users(id),
        service_id INTEGER REFERENCES services(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Toxic Backlinks table created');

        // Competitor Backlinks
        await client.query(`
      CREATE TABLE IF NOT EXISTS competitor_backlinks (
        id SERIAL PRIMARY KEY,
        competitor_domain TEXT,
        backlink_url TEXT,
        source_domain TEXT,
        anchor_text TEXT,
        domain_authority INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Competitor Backlinks table created');

        // On-Page SEO Audits
        await client.query(`
      CREATE TABLE IF NOT EXISTS on_page_seo_audits (
        id SERIAL PRIMARY KEY,
        url TEXT,
        service_id INTEGER REFERENCES services(id),
        sub_service_id INTEGER REFERENCES sub_services(id),
        error_type TEXT NOT NULL,
        error_category TEXT,
        severity TEXT DEFAULT 'Medium',
        issue_description TEXT,
        current_value TEXT,
        recommended_value TEXT,
        linked_campaign_id INTEGER REFERENCES campaigns(id),
        status TEXT DEFAULT 'Open',
        assigned_to_id INTEGER REFERENCES users(id),
        created_by INTEGER REFERENCES users(id),
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        resolution_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ On-Page SEO Audits table created');

        // UX Issues
        await client.query(`
      CREATE TABLE IF NOT EXISTS ux_issues (
        id SERIAL PRIMARY KEY,
        title TEXT,
        issue_title TEXT NOT NULL,
        description TEXT,
        url TEXT,
        issue_type TEXT,
        device TEXT,
        severity TEXT DEFAULT 'Medium',
        source TEXT,
        screenshot_url TEXT,
        assigned_to_id INTEGER REFERENCES users(id),
        service_id INTEGER REFERENCES services(id),
        status TEXT DEFAULT 'open',
        resolution_notes TEXT,
        priority_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ UX Issues table created');

        // URL Errors
        await client.query(`
      CREATE TABLE IF NOT EXISTS url_errors (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        error_type TEXT,
        severity TEXT,
        description TEXT,
        service_id INTEGER REFERENCES services(id),
        sub_service_id INTEGER REFERENCES sub_services(id),
        linked_campaign_id INTEGER REFERENCES campaigns(id),
        assigned_to_id INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ URL Errors table created');

        // SMM Posts
        await client.query(`
      CREATE TABLE IF NOT EXISTS smm_posts (
        id SERIAL PRIMARY KEY,
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
        service_id INTEGER REFERENCES services(id),
        sub_service_id INTEGER REFERENCES sub_services(id),
        assigned_to_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ SMM Posts table created');

        // Service Pages
        await client.query(`
      CREATE TABLE IF NOT EXISTS service_pages (
        id SERIAL PRIMARY KEY,
        page_title TEXT NOT NULL,
        url TEXT,
        url_slug TEXT,
        page_type TEXT,
        service_id INTEGER REFERENCES services(id),
        sub_service_id INTEGER REFERENCES sub_services(id),
        industry TEXT,
        target_keyword TEXT,
        primary_keyword TEXT,
        seo_score INTEGER,
        audit_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Service Pages table created');

        // SEO Asset Domains
        await client.query(`
      CREATE TABLE IF NOT EXISTS seo_asset_domains (
        id SERIAL PRIMARY KEY,
        seo_asset_id INTEGER REFERENCES assets(id),
        domain_name TEXT,
        domain_type TEXT,
        url_posted TEXT,
        seo_self_qc_status TEXT,
        qa_status TEXT,
        approval_status TEXT,
        display_status TEXT,
        backlink_source_id INTEGER REFERENCES backlink_sources(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ SEO Asset Domains table created');

        // QC Checklists
        await client.query(`
      CREATE TABLE IF NOT EXISTS qc_checklists (
        id SERIAL PRIMARY KEY,
        checklist_name TEXT NOT NULL,
        checklist_type TEXT,
        category TEXT,
        number_of_items INTEGER,
        scoring_mode TEXT,
        pass_threshold REAL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ QC Checklists table created');

        // QC Checklist Versions
        await client.query(`
      CREATE TABLE IF NOT EXISTS qc_checklist_versions (
        id SERIAL PRIMARY KEY,
        checklist_id INTEGER REFERENCES qc_checklists(id),
        version_number INTEGER,
        items TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ QC Checklist Versions table created');

        // QC Runs
        await client.query(`
      CREATE TABLE IF NOT EXISTS qc_runs (
        id SERIAL PRIMARY KEY,
        target_type TEXT,
        target_id INTEGER,
        qc_status TEXT,
        qc_owner_id INTEGER REFERENCES users(id),
        qc_checklist_version_id INTEGER REFERENCES qc_checklist_versions(id),
        final_score_percentage REAL,
        analysis_report TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ QC Runs table created');

        // Competitor Benchmarks
        await client.query(`
      CREATE TABLE IF NOT EXISTS competitor_benchmarks (
        id SERIAL PRIMARY KEY,
        competitor_name TEXT NOT NULL,
        competitor_domain TEXT,
        monthly_traffic INTEGER,
        total_keywords INTEGER,
        backlinks INTEGER,
        ranking_coverage REAL,
        status TEXT DEFAULT 'active',
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Competitor Benchmarks table created');

        // Effort Targets
        await client.query(`
      CREATE TABLE IF NOT EXISTS effort_targets (
        id SERIAL PRIMARY KEY,
        role TEXT NOT NULL,
        category TEXT,
        metric TEXT,
        monthly INTEGER,
        weekly INTEGER,
        daily INTEGER,
        weightage REAL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Effort Targets table created');

        // Teams
        await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        lead_user_id INTEGER REFERENCES users(id),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Teams table created');

        // Team Members
        await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id),
        user_id INTEGER REFERENCES users(id),
        role_in_team TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Team Members table created');

        // Notifications
        await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT,
        message TEXT,
        type TEXT,
        is_read INTEGER DEFAULT 0,
        link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Notifications table created');

        // Integrations
        await client.query(`
      CREATE TABLE IF NOT EXISTS integrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT,
        status TEXT DEFAULT 'inactive',
        api_key TEXT,
        api_secret TEXT,
        config TEXT,
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Integrations table created');

        // Integration Logs
        await client.query(`
      CREATE TABLE IF NOT EXISTS integration_logs (
        id SERIAL PRIMARY KEY,
        integration_id INTEGER REFERENCES integrations(id),
        event TEXT,
        status TEXT,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Integration Logs table created');

        // Create indexes
        console.log('📊 Creating performance indexes...');

        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status)',
            'CREATE INDEX IF NOT EXISTS idx_assets_qc_status ON assets(qc_status)',
            'CREATE INDEX IF NOT EXISTS idx_assets_workflow_stage ON assets(workflow_stage)',
            'CREATE INDEX IF NOT EXISTS idx_assets_linked_service_id ON assets(linked_service_id)',
            'CREATE INDEX IF NOT EXISTS idx_assets_linked_sub_service_id ON assets(linked_sub_service_id)',
            'CREATE INDEX IF NOT EXISTS idx_asset_qc_reviews_asset_id ON asset_qc_reviews(asset_id)',
            'CREATE INDEX IF NOT EXISTS idx_qc_audit_log_asset_id ON qc_audit_log(asset_id)',
            'CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id)',
            'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)',
            'CREATE INDEX IF NOT EXISTS idx_campaigns_owner_id ON campaigns(campaign_owner_id)',
            'CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON campaigns(project_id)',
            'CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_campaign_id ON tasks(campaign_id)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
            'CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword)',
            'CREATE INDEX IF NOT EXISTS idx_keywords_mapped_service_id ON keywords(mapped_service_id)',
            'CREATE INDEX IF NOT EXISTS idx_services_status ON services(status)',
            'CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug)',
            'CREATE INDEX IF NOT EXISTS idx_sub_services_service_id ON sub_services(service_id)',
            'CREATE INDEX IF NOT EXISTS idx_sub_services_status ON sub_services(status)',
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
        ];

        for (const index of indexes) {
            await client.query(index);
        }
        console.log('✅ All indexes created');

        console.log('\n✅ Database initialization completed successfully!');
        console.log('📊 All tables and indexes are ready for production use.');

        return true;
    } catch (error: any) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

// Run initialization
if (require.main === module) {
    initializeVercelDatabase()
        .then(() => {
            console.log('\n🎉 Database ready for Vercel deployment!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Initialization error:', error);
            process.exit(1);
        });
}

export { initializeVercelDatabase };
