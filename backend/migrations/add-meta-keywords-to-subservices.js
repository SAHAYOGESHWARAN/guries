/**
 * Migration: Add meta_keywords column to sub_services table
 * Purpose: Enable meta keywords management for sub-services linked to master keyword database
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

try {
    console.log('Starting migration: add-meta-keywords-to-subservices');

    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(sub_services)").all();
    const hasMetaKeywords = tableInfo.some(col => col.name === 'meta_keywords');

    if (hasMetaKeywords) {
        console.log('✓ meta_keywords column already exists in sub_services table');
    } else {
        // Add the column
        db.exec(`
            ALTER TABLE sub_services 
            ADD COLUMN meta_keywords TEXT;
        `);
        console.log('✓ Added meta_keywords column to sub_services table');
    }

    console.log('✓ Migration completed successfully');
    db.close();
} catch (error) {
    console.error('✗ Migration failed:', error.message);
    db.close();
    process.exit(1);
}
