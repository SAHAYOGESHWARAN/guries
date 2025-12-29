/**
 * Migration: Add missing tables to SQLite database
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🔄 Adding missing tables to database...\n');

const tables = [
    {
        name: 'workflow_stages',
        sql: `CREATE TABLE IF NOT EXISTS workflow_stages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stage_name TEXT NOT NULL,
            stage_order INTEGER DEFAULT 0,
            description TEXT,
            color TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'seo_errors',
        sql: `CREATE TABLE IF NOT EXISTS seo_errors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            error_type TEXT NOT NULL,
            category TEXT,
            severity TEXT DEFAULT 'Medium',
            description TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'platforms',
        sql: `CREATE TABLE IF NOT EXISTS platforms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform_name TEXT NOT NULL,
            platform_type TEXT,
            recommended_size TEXT,
            scheduling TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'countries',
        sql: `CREATE TABLE IF NOT EXISTS countries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            country_name TEXT NOT NULL,
            code TEXT,
            region TEXT,
            has_backlinks INTEGER DEFAULT 0,
            has_content INTEGER DEFAULT 0,
            has_smm INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'asset_types',
        sql: `CREATE TABLE IF NOT EXISTS asset_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_type TEXT NOT NULL,
            dimension TEXT,
            file_formats TEXT,
            description TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'backlink_sources',
        sql: `CREATE TABLE IF NOT EXISTS backlink_sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_name TEXT NOT NULL,
            source_url TEXT,
            domain_authority INTEGER,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'backlink_submissions',
        sql: `CREATE TABLE IF NOT EXISTS backlink_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            backlink_source_id INTEGER,
            target_url TEXT,
            anchor_text_used TEXT,
            content_used TEXT,
            owner_id INTEGER,
            submission_status TEXT DEFAULT 'pending',
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'toxic_backlinks',
        sql: `CREATE TABLE IF NOT EXISTS toxic_backlinks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            backlink_url TEXT NOT NULL,
            source_domain TEXT,
            target_url TEXT,
            anchor_text TEXT,
            toxicity_score REAL,
            reason TEXT,
            status TEXT DEFAULT 'Pending',
            action_taken TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'competitor_backlinks',
        sql: `CREATE TABLE IF NOT EXISTS competitor_backlinks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            competitor_domain TEXT,
            backlink_url TEXT,
            source_domain TEXT,
            anchor_text TEXT,
            domain_authority INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'ux_issues',
        sql: `CREATE TABLE IF NOT EXISTS ux_issues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            issue_title TEXT NOT NULL,
            issue_type TEXT,
            severity TEXT DEFAULT 'Medium',
            url TEXT,
            description TEXT,
            screenshots TEXT,
            assigned_to_id INTEGER,
            status TEXT DEFAULT 'open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'url_errors',
        sql: `CREATE TABLE IF NOT EXISTS url_errors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            error_type TEXT,
            error_code INTEGER,
            error_message TEXT,
            detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            assigned_to_id INTEGER,
            status TEXT DEFAULT 'open',
            resolution_notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'on_page_seo_audits',
        sql: `CREATE TABLE IF NOT EXISTS on_page_seo_audits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id INTEGER,
            sub_service_id INTEGER,
            error_type TEXT NOT NULL,
            error_category TEXT,
            severity TEXT DEFAULT 'Medium',
            issue_description TEXT,
            current_value TEXT,
            recommended_value TEXT,
            detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            linked_campaign_id INTEGER,
            status TEXT DEFAULT 'open',
            resolved_at DATETIME,
            resolution_notes TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'qc_runs',
        sql: `CREATE TABLE IF NOT EXISTS qc_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_type TEXT,
            target_id INTEGER,
            qc_status TEXT,
            qc_owner_id INTEGER,
            qc_checklist_version_id INTEGER,
            final_score_percentage REAL,
            analysis_report TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'qc_checklists',
        sql: `CREATE TABLE IF NOT EXISTS qc_checklists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            checklist_name TEXT NOT NULL,
            checklist_type TEXT,
            category TEXT,
            number_of_items INTEGER,
            scoring_mode TEXT,
            pass_threshold REAL,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'qc_checklist_versions',
        sql: `CREATE TABLE IF NOT EXISTS qc_checklist_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            checklist_id INTEGER,
            version_number INTEGER,
            items TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'qc_weightage_configs',
        sql: `CREATE TABLE IF NOT EXISTS qc_weightage_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            type TEXT,
            weight REAL,
            mandatory INTEGER DEFAULT 0,
            stage TEXT,
            asset_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'okrs',
        sql: `CREATE TABLE IF NOT EXISTS okrs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            objective TEXT NOT NULL,
            type TEXT,
            cycle TEXT,
            owner TEXT,
            alignment TEXT,
            progress REAL DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'competitor_benchmarks',
        sql: `CREATE TABLE IF NOT EXISTS competitor_benchmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            competitor_name TEXT NOT NULL,
            competitor_domain TEXT,
            monthly_traffic INTEGER,
            total_keywords INTEGER,
            backlinks INTEGER,
            ranking_coverage REAL,
            status TEXT DEFAULT 'active',
            updated_on DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'gold_standards',
        sql: `CREATE TABLE IF NOT EXISTS gold_standards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_name TEXT NOT NULL,
            category TEXT,
            value REAL,
            range TEXT,
            unit TEXT,
            evidence TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'effort_targets',
        sql: `CREATE TABLE IF NOT EXISTS effort_targets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            category TEXT,
            metric TEXT,
            monthly INTEGER,
            weekly INTEGER,
            daily INTEGER,
            weightage REAL,
            rules TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'personas',
        sql: `CREATE TABLE IF NOT EXISTS personas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            persona_name TEXT NOT NULL,
            description TEXT,
            demographics TEXT,
            goals TEXT,
            pain_points TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'forms',
        sql: `CREATE TABLE IF NOT EXISTS forms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            form_name TEXT NOT NULL,
            form_type TEXT,
            fields TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'integrations',
        sql: `CREATE TABLE IF NOT EXISTS integrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT,
            status TEXT DEFAULT 'inactive',
            api_key TEXT,
            api_secret TEXT,
            config TEXT,
            last_sync_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'integration_logs',
        sql: `CREATE TABLE IF NOT EXISTS integration_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            integration_id INTEGER,
            event TEXT,
            status TEXT,
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'system_settings',
        sql: `CREATE TABLE IF NOT EXISTS system_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_key TEXT UNIQUE NOT NULL,
            setting_value TEXT,
            is_enabled INTEGER DEFAULT 1,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'teams',
        sql: `CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            lead_user_id INTEGER,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'team_members',
        sql: `CREATE TABLE IF NOT EXISTS team_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_id INTEGER,
            user_id INTEGER,
            role_in_team TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'smm_posts',
        sql: `CREATE TABLE IF NOT EXISTS smm_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_title TEXT,
            platform TEXT,
            content TEXT,
            media_url TEXT,
            scheduled_at DATETIME,
            status TEXT DEFAULT 'draft',
            engagement_metrics TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'graphic_assets',
        sql: `CREATE TABLE IF NOT EXISTS graphic_assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_name TEXT NOT NULL,
            asset_type TEXT,
            file_url TEXT,
            dimensions TEXT,
            file_format TEXT,
            file_size_kb INTEGER,
            tags TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'emails',
        sql: `CREATE TABLE IF NOT EXISTS emails (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT,
            recipient TEXT,
            status TEXT DEFAULT 'draft',
            scheduled_at DATETIME,
            template_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'voice_profiles',
        sql: `CREATE TABLE IF NOT EXISTS voice_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            voice_id TEXT,
            language TEXT,
            gender TEXT,
            provider TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'call_logs',
        sql: `CREATE TABLE IF NOT EXISTS call_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id INTEGER,
            customer_phone TEXT,
            duration INTEGER,
            sentiment TEXT,
            recording_url TEXT,
            summary TEXT,
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'knowledge_articles',
        sql: `CREATE TABLE IF NOT EXISTS knowledge_articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            category TEXT,
            tags TEXT,
            language TEXT,
            author_id INTEGER,
            status TEXT DEFAULT 'draft',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'compliance_rules',
        sql: `CREATE TABLE IF NOT EXISTS compliance_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rule_name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            severity TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'compliance_audits',
        sql: `CREATE TABLE IF NOT EXISTS compliance_audits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_type TEXT,
            target_id INTEGER,
            score REAL,
            violations TEXT,
            audited_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'employee_evaluations',
        sql: `CREATE TABLE IF NOT EXISTS employee_evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            evaluation_period TEXT,
            overall_score REAL,
            performance_metrics TEXT,
            ai_analysis TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'employee_skills',
        sql: `CREATE TABLE IF NOT EXISTS employee_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            skill_name TEXT,
            skill_category TEXT,
            score REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'employee_achievements',
        sql: `CREATE TABLE IF NOT EXISTS employee_achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            achievement_title TEXT,
            achievement_description TEXT,
            date_awarded DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'reward_recommendations',
        sql: `CREATE TABLE IF NOT EXISTS reward_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            recommendation_type TEXT,
            reason TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    }
];

try {
    for (const table of tables) {
        db.exec(table.sql);
        console.log(`  ✅ ${table.name}`);
    }

    // Insert sample data for workflow_stages
    const existingStages = db.prepare('SELECT COUNT(*) as count FROM workflow_stages').get();
    if (existingStages.count === 0) {
        db.exec(`
            INSERT INTO workflow_stages (stage_name, stage_order, description, color, status) VALUES 
            ('Draft', 1, 'Initial draft stage', '#6B7280', 'active'),
            ('In Review', 2, 'Under review', '#F59E0B', 'active'),
            ('Approved', 3, 'Approved and ready', '#10B981', 'active'),
            ('Published', 4, 'Published and live', '#3B82F6', 'active'),
            ('Archived', 5, 'Archived content', '#9CA3AF', 'active')
        `);
        console.log('  ✅ Inserted default workflow stages');
    }

    // Insert sample platforms
    const existingPlatforms = db.prepare('SELECT COUNT(*) as count FROM platforms').get();
    if (existingPlatforms.count === 0) {
        db.exec(`
            INSERT INTO platforms (platform_name, platform_type, recommended_size, status) VALUES 
            ('Facebook', 'Social Media', '1200x630', 'active'),
            ('Instagram', 'Social Media', '1080x1080', 'active'),
            ('Twitter', 'Social Media', '1200x675', 'active'),
            ('LinkedIn', 'Social Media', '1200x627', 'active'),
            ('YouTube', 'Video', '1280x720', 'active')
        `);
        console.log('  ✅ Inserted default platforms');
    }

    console.log('\n✅ All missing tables created successfully!');
} catch (error) {
    console.error('❌ Error:', error.message);
} finally {
    db.close();
}
