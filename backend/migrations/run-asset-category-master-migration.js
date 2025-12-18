const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath);

const migrationSQL = `
-- Create Asset Category Master Table
CREATE TABLE IF NOT EXISTS asset_category_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    category_name TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_asset_category_brand ON asset_category_master(brand);
CREATE INDEX IF NOT EXISTS idx_asset_category_status ON asset_category_master(status);
`;

db.serialize(() => {
    console.log('🔄 Running Asset Category Master migration...');

    db.exec(migrationSQL, (err) => {
        if (err) {
            console.error('❌ Migration failed:', err.message);
            process.exit(1);
        }

        console.log('✅ Asset Category Master table created successfully!');

        // Verify table creation
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='asset_category_master'", (err, row) => {
            if (err) {
                console.error('❌ Verification failed:', err.message);
            } else if (row) {
                console.log('✅ Table verified:', row.name);
            } else {
                console.log('⚠️  Table not found after creation');
            }

            db.close();
        });
    });
});
