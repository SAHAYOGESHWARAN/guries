/**
 * Migration: Add SEO Asset Module Fields
 * This migration adds new columns to the assets table for the 12-step SEO Asset workflow
 * and creates the seo_asset_domains table for domain management (Step 6 & 7)
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Starting SEO Asset Module migration...');

try {
    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Add new SEO-specific columns to assets table
    const seoColumns = [
        { name: 'seo_title', type: 'TEXT' },
        { name: 'seo_meta_title', type: 'TEXT' },
        { name: 'seo_description', type: 'TEXT' },
        { name: 'seo_service_url', type: 'TEXT' },
        { name: 'seo_blog_url', type: 'TEXT' },
        { name: 'seo_anchor_text', type: 'TEXT' },
        { name: 'seo_primary_keyword_id', type: 'INTEGER' },
        { name: 'seo_lsi_keywords', type: 'TEXT' }, // JSON array
        { name: 'seo_domain_type', type: 'TEXT' },
        { name: 'seo_domains', type: 'TEXT' }, // JSON array
        { name: 'seo_blog_content', type: 'TEXT' }, // Rich text content for Blog Posting
        { name: 'seo_sector_id', type: 'INTEGER' },
        { name: 'seo_industry_id', type: 'INTEGER' },
        { name: 'assigned_team_members', type: 'TEXT' }, // JSON array of user IDs
        { name: 'updated_by', type: 'INTEGER' }
    ];

    // Check existing columns
    const tableInfo = db.prepare("PRAGMA table_info(assets)").all();
    const existingColumns = tableInfo.map(col => col.name);

    // Add missing columns
    for (const col of seoColumns) {
        if (!existingColumns.includes(col.name)) {
            console.log(`Adding column: ${col.name}`);
            db.exec(`ALTER TABLE assets ADD COLUMN ${col.name} ${col.type}`);
        } else {
            console.log(`Column ${col.name} already exists, skipping...`);
        }
    }

    // Create SEO Asset Domains table for Step 6 & 7
    console.log('Creating seo_asset_domains table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS seo_asset_domains (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seo_asset_id INTEGER NOT NULL,
            domain_name TEXT NOT NULL,
            domain_type TEXT,
            url_posted TEXT,
            seo_self_qc_status TEXT DEFAULT 'Waiting',
            qa_status TEXT DEFAULT 'Pending',
            display_status TEXT DEFAULT 'Pending',
            backlink_source_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (seo_asset_id) REFERENCES assets(id) ON DELETE CASCADE,
            FOREIGN KEY (backlink_source_id) REFERENCES backlink_sources(id)
        )
    `);

    // Create indexes for performance
    console.log('Creating indexes...');
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_seo_asset_domains_asset ON seo_asset_domains(seo_asset_id);
        CREATE INDEX IF NOT EXISTS idx_seo_asset_domains_status ON seo_asset_domains(display_status);
        CREATE INDEX IF NOT EXISTS idx_assets_application_type ON assets(application_type);
        CREATE INDEX IF NOT EXISTS idx_assets_seo_primary_keyword ON assets(seo_primary_keyword_id);
    `);

    console.log('SEO Asset Module migration completed successfully!');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
} finally {
    db.close();
}
