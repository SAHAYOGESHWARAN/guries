/**
 * Migration: Add Web Asset Upload Module Fields
 * This migration adds all required fields for the Web Asset Upload module
 * as per the functional requirements document.
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');

function runMigration() {
    console.log('Starting Web Asset Fields Migration...');
    console.log('Database path:', dbPath);

    const db = new Database(dbPath);

    try {
        // Get current table info
        const tableInfo = db.prepare("PRAGMA table_info(assets)").all();
        const existingColumns = tableInfo.map(col => col.name);
        console.log('Existing columns:', existingColumns.length);

        // Define columns to add
        const columnsToAdd = [
            { name: 'published_by', type: 'INTEGER', description: 'User who published the asset' },
            { name: 'verified_by', type: 'INTEGER', description: 'SEO verifier user' },
            { name: 'workflow_stage', type: 'TEXT', default: "'Add'", description: 'Workflow stage: Add, In Progress, Sent to QC, Published, In Rework, Moved to CW, Moved to GD, Moved to WD' },
            { name: 'qc_status', type: 'TEXT', description: 'QC Status: QC Pending, Rework, Approved, Reject' },
            { name: 'web_h3_tags', type: 'TEXT', description: 'JSON array of H3 tags' },
            { name: 'content_keywords', type: 'TEXT', description: 'JSON array of user-entered content keywords' },
            { name: 'seo_keywords', type: 'TEXT', description: 'JSON array of SEO keywords from Keyword Master' },
            { name: 'ai_plagiarism_score', type: 'INTEGER', description: 'AI/Plagiarism score (0-100)' },
            { name: 'resource_files', type: 'TEXT', description: 'JSON array of uploaded resource file URLs' },
            { name: 'content_type', type: 'TEXT', description: 'Content type classification' },
            { name: 'dimensions', type: 'TEXT', description: 'Asset dimensions from Asset Type Master' },
            { name: 'linked_page_ids', type: 'TEXT', description: 'JSON array of linked page IDs' },
            { name: 'published_at', type: 'DATETIME', description: 'Timestamp when asset was published' },
            { name: 'version_history', type: 'TEXT', description: 'JSON array of version history entries' }
        ];

        // Add missing columns
        for (const column of columnsToAdd) {
            if (!existingColumns.includes(column.name)) {
                let sql = `ALTER TABLE assets ADD COLUMN ${column.name} ${column.type}`;
                if (column.default) {
                    sql += ` DEFAULT ${column.default}`;
                }
                console.log(`Adding column: ${column.name} (${column.description})`);
                db.exec(sql);
                console.log(`✓ ${column.name} column added`);
            } else {
                console.log(`✓ ${column.name} column already exists`);
            }
        }

        // Create asset_versions table for version history
        console.log('\nCreating asset_versions table...');
        db.exec(`
            CREATE TABLE IF NOT EXISTS asset_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_id INTEGER NOT NULL,
                version_number TEXT NOT NULL,
                snapshot_data TEXT NOT NULL,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                action TEXT,
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ asset_versions table created/verified');

        // Create asset_resources table for uploaded files
        console.log('\nCreating asset_resources table...');
        db.exec(`
            CREATE TABLE IF NOT EXISTS asset_resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_id INTEGER NOT NULL,
                file_name TEXT NOT NULL,
                file_url TEXT NOT NULL,
                file_type TEXT,
                file_size INTEGER,
                uploaded_by INTEGER,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ asset_resources table created/verified');

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run migration
runMigration();
