const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Adding missing columns to assets table...');

try {
    // Add missing columns to assets table
    const columnsToAdd = [
        'usage_status TEXT DEFAULT "Available"',
        'keywords TEXT',
        'web_meta_description TEXT',
        'seo_score INTEGER',
        'grammar_score INTEGER',
        'qc_score INTEGER',
        'submitted_by INTEGER',
        'submitted_at DATETIME',
        'qc_reviewer_id INTEGER',
        'qc_reviewed_at DATETIME',
        'qc_remarks TEXT',
        'linking_active INTEGER DEFAULT 0',
        'mapped_to TEXT',
        'rework_count INTEGER DEFAULT 0',
        'workflow_log TEXT',
        'qc_checklist_completion INTEGER DEFAULT 0'
    ];

    // Check which columns already exist
    const tableInfo = db.prepare("PRAGMA table_info(assets)").all();
    const existingColumns = tableInfo.map(col => col.name);

    console.log('Existing columns:', existingColumns);

    // Add missing columns
    for (const columnDef of columnsToAdd) {
        const columnName = columnDef.split(' ')[0];
        if (!existingColumns.includes(columnName)) {
            try {
                db.exec(`ALTER TABLE assets ADD COLUMN ${columnDef}`);
                console.log(`✅ Added column: ${columnName}`);
            } catch (error) {
                console.log(`⚠️  Column ${columnName} might already exist or error: ${error.message}`);
            }
        } else {
            console.log(`⏭️  Column ${columnName} already exists`);
        }
    }

    // Create asset_qc_reviews table if it doesn't exist
    db.exec(`
        CREATE TABLE IF NOT EXISTS asset_qc_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER,
            qc_reviewer_id INTEGER,
            qc_score INTEGER,
            checklist_completion INTEGER DEFAULT 0,
            qc_remarks TEXT,
            qc_decision TEXT,
            checklist_items TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets(id)
        )
    `);
    console.log('✅ Created asset_qc_reviews table');

    console.log('✅ Migration completed successfully!');
} catch (error) {
    console.error('❌ Migration failed:', error);
} finally {
    db.close();
}