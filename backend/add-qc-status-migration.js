/**
 * Migration: Add qc_status and qc_checklist_items columns to assets table
 * qc_status: Pass / Fail / Rework
 * qc_checklist_items: JSON array of checklist item results
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

async function runMigration() {
    console.log('Starting QC status and checklist items migration...');
    console.log('Database path:', dbPath);

    try {
        const db = new Database(dbPath);

        // Check if qc_status column already exists
        const tableInfo = db.pragma('table_info(assets)');
        const hasQcStatus = tableInfo.some(col => col.name === 'qc_status');
        const hasQcChecklistItems = tableInfo.some(col => col.name === 'qc_checklist_items');

        if (!hasQcStatus) {
            db.exec(`ALTER TABLE assets ADD COLUMN qc_status VARCHAR(50)`);
            console.log('Successfully added qc_status column to assets table.');
        } else {
            console.log('Column qc_status already exists. Skipping.');
        }

        if (!hasQcChecklistItems) {
            db.exec(`ALTER TABLE assets ADD COLUMN qc_checklist_items TEXT`);
            console.log('Successfully added qc_checklist_items column to assets table.');
        } else {
            console.log('Column qc_checklist_items already exists. Skipping.');
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
