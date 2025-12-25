/**
 * Migration: Add content_type column to assets table
 * This column stores the content classification type:
 * Blog, Service Page, Sub-Service Page, SMM Post, Backlink Asset, Web UI Asset
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

async function runMigration() {
    console.log('Starting content_type column migration...');
    console.log('Database path:', dbPath);

    try {
        const db = new Database(dbPath);

        // Check if column already exists
        const tableInfo = db.pragma('table_info(assets)');
        const columnExists = tableInfo.some(col => col.name === 'content_type');

        if (columnExists) {
            console.log('Column content_type already exists in assets table. Skipping migration.');
            db.close();
            return;
        }

        // Add the content_type column
        db.exec(`ALTER TABLE assets ADD COLUMN content_type VARCHAR(100)`);

        console.log('Successfully added content_type column to assets table.');

        // Also add web_meta_description if it doesn't exist
        const hasWebMetaDesc = tableInfo.some(col => col.name === 'web_meta_description');
        if (!hasWebMetaDesc) {
            db.exec(`ALTER TABLE assets ADD COLUMN web_meta_description TEXT`);
            console.log('Successfully added web_meta_description column to assets table.');
        }

        db.close();

    } catch (error) {
        console.error('Migration failed:', error.message);
        throw error;
    }
}

runMigration()
    .then(() => {
        console.log('Migration completed successfully.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Migration failed:', err);
        process.exit(1);
    });
