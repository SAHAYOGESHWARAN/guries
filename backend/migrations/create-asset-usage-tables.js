/**
 * Migration: Create Asset Usage Tracking Tables
 * 
 * Creates tables for tracking asset usage across:
 * - Website URLs
 * - Social Media Posts
 * - Backlink Submissions
 * - Engagement Metrics
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

async function createAssetUsageTables() {
    console.log('Creating asset usage tracking tables...');
    console.log('Database path:', dbPath);

    try {
        // Asset Website Usage Table
        db.exec(`
            CREATE TABLE IF NOT EXISTS asset_website_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_id INTEGER NOT NULL,
                website_url TEXT NOT NULL,
                page_title TEXT,
                status TEXT DEFAULT 'active',
                added_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
                FOREIGN KEY (added_by) REFERENCES users(id)
            )
        `);
        console.log('✓ Created asset_website_usage table');

        // Asset Social Media Usage Table
        db.exec(`
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
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
                FOREIGN KEY (added_by) REFERENCES users(id)
            )
        `);
        console.log('✓ Created asset_social_media_usage table');

        // Asset Backlink Submissions Table
        db.exec(`
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
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
                FOREIGN KEY (added_by) REFERENCES users(id)
            )
        `);
        console.log('✓ Created asset_backlink_usage table');

        // Asset Engagement Metrics Table (aggregated metrics)
        db.exec(`
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
                last_calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Created asset_engagement_metrics table');

        // Create indexes for better query performance
        db.exec(`CREATE INDEX IF NOT EXISTS idx_website_usage_asset ON asset_website_usage(asset_id)`);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_social_usage_asset ON asset_social_media_usage(asset_id)`);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_backlink_usage_asset ON asset_backlink_usage(asset_id)`);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_engagement_asset ON asset_engagement_metrics(asset_id)`);
        console.log('✓ Created indexes');

        console.log('\n✅ All asset usage tables created successfully!');
    } catch (error) {
        console.error('Error creating asset usage tables:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run migration
createAssetUsageTables()
    .then(() => {
        console.log('Migration completed.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });

module.exports = { createAssetUsageTables };
