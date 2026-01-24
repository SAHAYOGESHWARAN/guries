const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🚀 Initializing SQLite database...\n');

try {
    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create assets table
    db.exec(`
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
            web_thumbnail TEXT,
            web_url TEXT,
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
            web_h1 TEXT,
            web_h2_1 TEXT,
            web_h2_2 TEXT,
            web_h3_tags TEXT,
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
    `);

    console.log('✅ Database initialized successfully');
    db.close();
} catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
}
