const Database = require('better-sqlite3');
const path = require('path');

async function addAssetQCWorkflow() {
    try {
        console.log('🔄 Adding Asset QC Workflow columns...');

        const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
        const db = new Database(dbPath);

        // Add new columns to assets table (SQLite syntax)
        const alterQueries = [
            // Workflow fields
            `ALTER TABLE assets ADD COLUMN submitted_by INTEGER`,
            `ALTER TABLE assets ADD COLUMN submitted_at TEXT`,
            `ALTER TABLE assets ADD COLUMN qc_reviewer_id INTEGER`,
            `ALTER TABLE assets ADD COLUMN qc_reviewed_at TEXT`,
            `ALTER TABLE assets ADD COLUMN qc_checklist_completion INTEGER DEFAULT 0`,
            `ALTER TABLE assets ADD COLUMN qc_remarks TEXT`,
            `ALTER TABLE assets ADD COLUMN qc_score INTEGER`,

            // AI Scores (mandatory before submission)
            `ALTER TABLE assets ADD COLUMN seo_score INTEGER`,
            `ALTER TABLE assets ADD COLUMN grammar_score INTEGER`,

            // Keywords (should link with keyword master table)
            `ALTER TABLE assets ADD COLUMN keywords TEXT`, // JSON array

            // Linking becomes active only after QC approval
            `ALTER TABLE assets ADD COLUMN linking_active INTEGER DEFAULT 0`,

            // Workflow log
            `ALTER TABLE assets ADD COLUMN workflow_log TEXT`, // JSON array of workflow events

            // Update status column to support new workflow statuses
            `ALTER TABLE assets ADD COLUMN usage_status TEXT DEFAULT 'Available'`
        ];

        for (const query of alterQueries) {
            try {
                db.exec(query);
                console.log(`✅ Executed: ${query.substring(0, 50)}...`);
            } catch (error) {
                if (error.message.includes('duplicate column') || error.message.includes('already exists')) {
                    console.log(`⚠️  Column already exists: ${query.substring(0, 50)}...`);
                } else {
                    throw error;
                }
            }
        }

        // Create asset QC reviews table (SQLite syntax)
        const createQCTable = `
            CREATE TABLE IF NOT EXISTS asset_qc_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_id INTEGER,
                qc_reviewer_id INTEGER,
                qc_score INTEGER,
                checklist_completion INTEGER DEFAULT 0,
                qc_remarks TEXT,
                qc_decision TEXT,
                reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (asset_id) REFERENCES assets(id),
                FOREIGN KEY (qc_reviewer_id) REFERENCES users(id)
            )
        `;

        db.exec(createQCTable);
        console.log('✅ Created asset_qc_reviews table');

        // Create users table if it doesn't exist (for foreign key references)
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                role TEXT,
                status TEXT DEFAULT 'active',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `;

        db.exec(createUsersTable);
        console.log('✅ Ensured users table exists');

        // Update existing assets to have proper default values
        const updateDefaults = `
            UPDATE assets 
            SET 
                status = COALESCE(status, 'Draft'),
                usage_status = COALESCE(usage_status, 'Available'),
                linking_active = COALESCE(linking_active, 0)
            WHERE status IS NULL OR usage_status IS NULL OR linking_active IS NULL
        `;

        db.exec(updateDefaults);
        console.log('✅ Updated default values for existing assets');

        db.close();
        console.log('🎉 Asset QC Workflow migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration if called directly
if (require.main === module) {
    addAssetQCWorkflow()
        .then(() => {
            console.log('Migration completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { addAssetQCWorkflow };