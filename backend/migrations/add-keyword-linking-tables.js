/**
 * Migration: Add Keyword Linking Tables
 * Purpose: Create proper junction tables for keyword-asset relationships
 * Date: 2026-01-24
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../mcc_db.sqlite');
const db = new Database(dbPath);

try {
    console.log('Starting keyword linking migration...');

    // Create asset_keyword_links junction table
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_keyword_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
            keyword_type VARCHAR(50) DEFAULT 'seo', -- 'seo', 'content', 'lsi', 'focus', 'secondary'
            is_primary BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(asset_id, keyword_id, keyword_type)
        );
        
        CREATE INDEX IF NOT EXISTS idx_asset_keyword_asset ON asset_keyword_links(asset_id);
        CREATE INDEX IF NOT EXISTS idx_asset_keyword_keyword ON asset_keyword_links(keyword_id);
        CREATE INDEX IF NOT EXISTS idx_asset_keyword_type ON asset_keyword_links(keyword_type);
    `);

    // Create service_keyword_links junction table
    db.exec(`
        CREATE TABLE IF NOT EXISTS service_keyword_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
            keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
            keyword_type VARCHAR(50) DEFAULT 'focus', -- 'focus', 'secondary', 'meta'
            is_primary BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(service_id, keyword_id, keyword_type)
        );
        
        CREATE INDEX IF NOT EXISTS idx_service_keyword_service ON service_keyword_links(service_id);
        CREATE INDEX IF NOT EXISTS idx_service_keyword_keyword ON service_keyword_links(keyword_id);
        CREATE INDEX IF NOT EXISTS idx_service_keyword_type ON service_keyword_links(keyword_type);
    `);

    // Create sub_service_keyword_links junction table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sub_service_keyword_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sub_service_id INTEGER NOT NULL REFERENCES sub_services(id) ON DELETE CASCADE,
            keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
            keyword_type VARCHAR(50) DEFAULT 'focus', -- 'focus', 'secondary', 'meta'
            is_primary BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(sub_service_id, keyword_id, keyword_type)
        );
        
        CREATE INDEX IF NOT EXISTS idx_sub_service_keyword_sub_service ON sub_service_keyword_links(sub_service_id);
        CREATE INDEX IF NOT EXISTS idx_sub_service_keyword_keyword ON sub_service_keyword_links(keyword_id);
        CREATE INDEX IF NOT EXISTS idx_sub_service_keyword_type ON sub_service_keyword_links(keyword_type);
    `);

    // Create keyword_usage_stats table for analytics
    db.exec(`
        CREATE TABLE IF NOT EXISTS keyword_usage_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword_id INTEGER NOT NULL UNIQUE REFERENCES keywords(id) ON DELETE CASCADE,
            total_usage_count INTEGER DEFAULT 0,
            asset_usage_count INTEGER DEFAULT 0,
            service_usage_count INTEGER DEFAULT 0,
            sub_service_usage_count INTEGER DEFAULT 0,
            last_used_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_keyword_usage_keyword ON keyword_usage_stats(keyword_id);
    `);

    // Add keyword_id column to keywords table if not exists
    const tableInfo = db.prepare("PRAGMA table_info(keywords)").all();
    const hasKeywordId = tableInfo.some(col => col.name === 'keyword_id');

    if (!hasKeywordId) {
        db.exec(`
            ALTER TABLE keywords ADD COLUMN keyword_id VARCHAR(50) UNIQUE;
        `);
        console.log('Added keyword_id column to keywords table');
    }

    // Add keyword_category column if not exists
    const hasCategory = tableInfo.some(col => col.name === 'keyword_category');
    if (!hasCategory) {
        db.exec(`
            ALTER TABLE keywords ADD COLUMN keyword_category VARCHAR(100);
        `);
        console.log('Added keyword_category column to keywords table');
    }

    console.log('✅ Keyword linking migration completed successfully');
    process.exit(0);
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}
