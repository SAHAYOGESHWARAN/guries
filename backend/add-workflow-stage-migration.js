/**
 * Migration: Add workflow_stage column to assets table
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Adding workflow_stage column to assets table...');

try {
    const tableInfo = db.prepare('PRAGMA table_info(assets)').all();
    const columnExists = tableInfo.some(col => col.name === 'workflow_stage');

    if (!columnExists) {
        db.exec('ALTER TABLE assets ADD COLUMN workflow_stage TEXT DEFAULT "Add"');
        console.log('✓ Added workflow_stage column to assets table');
    } else {
        console.log('  workflow_stage column already exists');
    }

    // Update existing assets that have NULL workflow_stage to 'Add'
    const result = db.prepare("UPDATE assets SET workflow_stage = 'Add' WHERE workflow_stage IS NULL").run();
    console.log(`✓ Updated ${result.changes} assets with default workflow_stage value`);

} catch (e) {
    console.error('Error:', e.message);
}

db.close();
console.log('Migration completed!');
