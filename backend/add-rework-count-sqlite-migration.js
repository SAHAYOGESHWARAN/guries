const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

async function addReworkCountColumn() {
    try {
        console.log('Adding rework_count column to assets table...');

        // Check if column already exists
        const tableInfo = db.prepare("PRAGMA table_info(assets)").all();
        const columnExists = tableInfo.some(col => col.name === 'rework_count');

        if (columnExists) {
            console.log('rework_count column already exists');
            return;
        }

        // Add the rework_count column
        db.prepare(`
            ALTER TABLE assets 
            ADD COLUMN rework_count INTEGER DEFAULT 0
        `).run();

        console.log('Successfully added rework_count column to assets table');

        // Update existing assets to have rework_count = 0
        const updateResult = db.prepare(`
            UPDATE assets 
            SET rework_count = 0 
            WHERE rework_count IS NULL
        `).run();

        console.log(`Updated ${updateResult.changes} existing assets with rework_count = 0`);

        // Also add other missing workflow columns if they don't exist
        const workflowColumns = [
            { name: 'usage_status', type: 'TEXT DEFAULT "Available"' },
            { name: 'submitted_by', type: 'INTEGER' },
            { name: 'submitted_at', type: 'DATETIME' },
            { name: 'qc_reviewer_id', type: 'INTEGER' },
            { name: 'qc_reviewed_at', type: 'DATETIME' },
            { name: 'qc_score', type: 'INTEGER' },
            { name: 'qc_checklist_completion', type: 'INTEGER DEFAULT 0' },
            { name: 'qc_remarks', type: 'TEXT' },
            { name: 'seo_score', type: 'INTEGER' },
            { name: 'grammar_score', type: 'INTEGER' },
            { name: 'linking_active', type: 'INTEGER DEFAULT 0' },
            { name: 'workflow_log', type: 'TEXT' },
            { name: 'keywords', type: 'TEXT' }
        ];

        for (const column of workflowColumns) {
            const columnExists = tableInfo.some(col => col.name === column.name);
            if (!columnExists) {
                try {
                    db.prepare(`ALTER TABLE assets ADD COLUMN ${column.name} ${column.type}`).run();
                    console.log(`Added column: ${column.name}`);
                } catch (error) {
                    console.log(`Column ${column.name} might already exist or error:`, error.message);
                }
            }
        }

    } catch (error) {
        console.error('Error adding rework_count column:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the migration
addReworkCountColumn()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });