const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

async function updateQcReviewsTable() {
    try {
        console.log('Creating/updating asset_qc_reviews table...');

        // Create the asset_qc_reviews table if it doesn't exist
        db.prepare(`
            CREATE TABLE IF NOT EXISTS asset_qc_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_id INTEGER,
                qc_reviewer_id INTEGER,
                qc_score INTEGER,
                checklist_completion INTEGER DEFAULT 0,
                qc_remarks TEXT,
                qc_decision TEXT,
                checklist_items TEXT,
                reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (asset_id) REFERENCES assets(id),
                FOREIGN KEY (qc_reviewer_id) REFERENCES users(id)
            )
        `).run();

        console.log('Successfully created/updated asset_qc_reviews table');

        // Check if checklist_items column exists
        const tableInfo = db.prepare("PRAGMA table_info(asset_qc_reviews)").all();
        const columnExists = tableInfo.some(col => col.name === 'checklist_items');

        if (!columnExists) {
            db.prepare(`
                ALTER TABLE asset_qc_reviews 
                ADD COLUMN checklist_items TEXT
            `).run();
            console.log('Added checklist_items column to asset_qc_reviews table');
        }

        // Also create users table if it doesn't exist (for foreign key reference)
        db.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                role TEXT,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // Insert a default QC reviewer if none exists
        const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
        if (userCount.count === 0) {
            db.prepare(`
                INSERT INTO users (name, email, role, status) 
                VALUES ('QC Reviewer', 'qc@example.com', 'QC Manager', 'active')
            `).run();
            console.log('Added default QC reviewer user');
        }

    } catch (error) {
        console.error('Error updating QC reviews table:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the migration
updateQcReviewsTable()
    .then(() => {
        console.log('QC Reviews table migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('QC Reviews table migration failed:', error);
        process.exit(1);
    });