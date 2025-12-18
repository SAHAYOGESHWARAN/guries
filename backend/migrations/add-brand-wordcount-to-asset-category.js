const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath);

const migrationSQL = `
-- Add brand column to asset_category_master
ALTER TABLE asset_category_master ADD COLUMN brand TEXT NOT NULL DEFAULT 'Pubrica';

-- Add word_count column to asset_category_master
ALTER TABLE asset_category_master ADD COLUMN word_count INTEGER DEFAULT 0;
`;

db.serialize(() => {
    console.log('🔄 Adding brand and word_count columns to asset_category_master...');

    // Check if columns already exist
    db.all("PRAGMA table_info(asset_category_master)", (err, columns) => {
        if (err) {
            console.error('❌ Failed to check table structure:', err.message);
            db.close();
            process.exit(1);
        }

        const hasBrand = columns.some(col => col.name === 'brand');
        const hasWordCount = columns.some(col => col.name === 'word_count');

        if (hasBrand && hasWordCount) {
            console.log('✅ Columns already exist. No migration needed.');
            db.close();
            return;
        }

        // Add brand column if it doesn't exist
        if (!hasBrand) {
            db.run("ALTER TABLE asset_category_master ADD COLUMN brand TEXT NOT NULL DEFAULT 'Pubrica'", (err) => {
                if (err) {
                    console.error('❌ Failed to add brand column:', err.message);
                    db.close();
                    process.exit(1);
                }
                console.log('✅ Added brand column');
            });
        }

        // Add word_count column if it doesn't exist
        if (!hasWordCount) {
            db.run("ALTER TABLE asset_category_master ADD COLUMN word_count INTEGER DEFAULT 0", (err) => {
                if (err) {
                    console.error('❌ Failed to add word_count column:', err.message);
                    db.close();
                    process.exit(1);
                }
                console.log('✅ Added word_count column');

                // Verify the changes
                db.all("PRAGMA table_info(asset_category_master)", (err, updatedColumns) => {
                    if (err) {
                        console.error('❌ Verification failed:', err.message);
                    } else {
                        console.log('✅ Migration completed successfully!');
                        console.log('Updated columns:', updatedColumns.map(c => c.name).join(', '));
                    }
                    db.close();
                });
            });
        } else {
            db.close();
        }
    });
});
