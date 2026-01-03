/**
 * Migration: Add workflow_stage column to assets table
 * This supports the Web Asset Upload module workflow requirements
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Starting workflow_stage migration...');

try {
    // Check if workflow_stage column exists
    const tableInfo = db.prepare("PRAGMA table_info(assets)").all();
    const hasWorkflowStage = tableInfo.some(col => col.name === 'workflow_stage');
    const hasPublishedBy = tableInfo.some(col => col.name === 'published_by');
    const hasVerifiedBy = tableInfo.some(col => col.name === 'verified_by');

    if (!hasWorkflowStage) {
        console.log('Adding workflow_stage column...');
        db.exec(`ALTER TABLE assets ADD COLUMN workflow_stage VARCHAR(50) DEFAULT 'Add'`);
        console.log('✓ workflow_stage column added');
    } else {
        console.log('✓ workflow_stage column already exists');
    }

    if (!hasPublishedBy) {
        console.log('Adding published_by column...');
        db.exec(`ALTER TABLE assets ADD COLUMN published_by INTEGER`);
        console.log('✓ published_by column added');
    } else {
        console.log('✓ published_by column already exists');
    }

    if (!hasVerifiedBy) {
        console.log('Adding verified_by column...');
        db.exec(`ALTER TABLE assets ADD COLUMN verified_by INTEGER`);
        console.log('✓ verified_by column added');
    } else {
        console.log('✓ verified_by column already exists');
    }

    // Update existing assets to have proper workflow_stage based on status
    console.log('Updating existing assets workflow_stage...');
    db.exec(`
        UPDATE assets SET workflow_stage = 
            CASE 
                WHEN status = 'Draft' THEN 'Add'
                WHEN status = 'Pending QC Review' THEN 'Sent to QC'
                WHEN status = 'QC Approved' THEN 'Sent to QC'
                WHEN status = 'QC Rejected' THEN 'In Rework'
                WHEN status = 'Rework Required' THEN 'In Rework'
                WHEN status = 'Published' THEN 'Published'
                ELSE 'In Progress'
            END
        WHERE workflow_stage IS NULL OR workflow_stage = ''
    `);
    console.log('✓ Existing assets updated');

    console.log('\n✅ Migration completed successfully!');
} catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}
