const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Testing usage_status column...');

try {
    // Try to select usage_status
    const result = db.prepare("SELECT id, usage_status FROM assets LIMIT 1").all();
    console.log('✅ usage_status column exists');
    console.log('Result:', result);
} catch (error) {
    console.error('❌ usage_status column issue:', error.message);

    // Try to add the column
    try {
        console.log('Attempting to add usage_status column...');
        db.prepare("ALTER TABLE assets ADD COLUMN usage_status TEXT DEFAULT 'Available'").run();
        console.log('✅ Added usage_status column');
    } catch (alterError) {
        console.error('❌ Failed to add column:', alterError.message);
    }
}

db.close();