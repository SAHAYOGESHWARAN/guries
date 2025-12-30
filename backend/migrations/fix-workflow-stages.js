/**
 * Migration: Fix workflow_stages table schema
 * Adds missing columns that the application expects
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Starting workflow_stages schema fix...');

const columnsToAdd = [
    { name: 'workflow_name', type: 'TEXT' },
    { name: 'total_stages', type: 'INTEGER DEFAULT 1' },
    { name: 'stage_label', type: 'TEXT' },
    { name: 'color_tag', type: 'TEXT DEFAULT "blue"' },
    { name: 'active_flag', type: 'TEXT DEFAULT "Active"' }
];

columnsToAdd.forEach(col => {
    try {
        db.exec(`ALTER TABLE workflow_stages ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✓ Added ${col.name} column`);
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log(`  ${col.name} column already exists`);
        } else {
            console.log(`  Error adding ${col.name}:`, e.message);
        }
    }
});

// Update existing rows to have workflow_name from stage_name if empty
try {
    db.exec(`UPDATE workflow_stages SET workflow_name = stage_name WHERE workflow_name IS NULL`);
    console.log('✓ Updated workflow_name from stage_name');
} catch (e) {
    console.log('  Could not update workflow_name:', e.message);
}

// Update stage_label from stage_name if empty
try {
    db.exec(`UPDATE workflow_stages SET stage_label = stage_name WHERE stage_label IS NULL`);
    console.log('✓ Updated stage_label from stage_name');
} catch (e) {
    console.log('  Could not update stage_label:', e.message);
}

// Update color_tag from color if empty
try {
    db.exec(`UPDATE workflow_stages SET color_tag = color WHERE color_tag IS NULL OR color_tag = 'blue'`);
    console.log('✓ Updated color_tag from color');
} catch (e) {
    console.log('  Could not update color_tag:', e.message);
}

console.log('Migration completed!');
db.close();
