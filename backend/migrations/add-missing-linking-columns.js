/**
 * Migration: Add missing columns to service/subservice asset linking tables
 * Adds: is_static, created_by columns
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
});

const migrations = [
    // Add is_static and created_by to service_asset_links
    `ALTER TABLE service_asset_links ADD COLUMN is_static INTEGER DEFAULT 0`,
    `ALTER TABLE service_asset_links ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE SET NULL`,

    // Add is_static and created_by to subservice_asset_links
    `ALTER TABLE subservice_asset_links ADD COLUMN is_static INTEGER DEFAULT 0`,
    `ALTER TABLE subservice_asset_links ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE SET NULL`,

    // Add asset_type_name to asset_type_master (keep type_name for backward compatibility)
    `ALTER TABLE asset_type_master ADD COLUMN asset_type_name TEXT UNIQUE`,
];

let completed = 0;

migrations.forEach((migration, index) => {
    db.run(migration, (err) => {
        if (err) {
            // Column might already exist, which is fine
            if (err.message.includes('duplicate column name') || err.message.includes('already exists')) {
                console.log(`✓ Column already exists (migration ${index + 1})`);
            } else {
                console.error(`✗ Migration ${index + 1} failed:`, err.message);
            }
        } else {
            console.log(`✓ Migration ${index + 1} completed`);
        }

        completed++;
        if (completed === migrations.length) {
            console.log('\n✓ All migrations completed');
            db.close();
            process.exit(0);
        }
    });
});
