/**
 * Migration: Create QC Audit Log Table
 * 
 * This table stores all QC actions for audit trail and compliance.
 * All QC actions are logged with timestamp and user identity.
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');

async function runMigration() {
    console.log('Starting QC Audit Log migration...');

    const db = new Database(dbPath);

    try {
        // Create QC audit log table
        db.exec(`
            CREATE TABLE IF NOT EXISTS qc_audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asset_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                action VARCHAR(50) NOT NULL,
                details TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        console.log('✓ Created qc_audit_log table');

        // Create indexes for faster queries
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_qc_audit_asset_id ON qc_audit_log(asset_id);
            CREATE INDEX IF NOT EXISTS idx_qc_audit_user_id ON qc_audit_log(user_id);
            CREATE INDEX IF NOT EXISTS idx_qc_audit_action ON qc_audit_log(action);
            CREATE INDEX IF NOT EXISTS idx_qc_audit_created_at ON qc_audit_log(created_at);
        `);

        console.log('✓ Created indexes on qc_audit_log');

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        db.close();
    }
}

runMigration().catch(console.error);
