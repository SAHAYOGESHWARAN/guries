import Database from 'better-sqlite3';
import path from 'path';

/**
 * Test setup - Initialize database before tests run
 */

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

export function setupTestDatabase() {
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    // Create essential tables for testing
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'user',
            status TEXT DEFAULT 'active',
            password_hash TEXT,
            department TEXT,
            country TEXT,
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_name TEXT NOT NULL,
            service_code TEXT,
            slug TEXT,
            status TEXT DEFAULT 'draft',
            meta_title TEXT,
            meta_description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_name TEXT NOT NULL,
            asset_type TEXT,
            asset_category TEXT,
            asset_format TEXT,
            status TEXT DEFAULT 'draft',
            qc_status TEXT,
            file_url TEXT,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            workflow_stage TEXT,
            qc_remarks TEXT,
            qc_score INTEGER,
            rework_count INTEGER DEFAULT 0,
            linking_active INTEGER DEFAULT 0,
            application_type TEXT,
            submitted_by INTEGER,
            seo_score INTEGER,
            grammar_score INTEGER
        )`,
        `CREATE TABLE IF NOT EXISTS service_asset_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            service_id INTEGER NOT NULL,
            is_static INTEGER DEFAULT 0,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(asset_id, service_id),
            FOREIGN KEY(asset_id) REFERENCES assets(id),
            FOREIGN KEY(service_id) REFERENCES services(id)
        )`,
        `CREATE TABLE IF NOT EXISTS subservice_asset_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            sub_service_id INTEGER NOT NULL,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(asset_id, sub_service_id),
            FOREIGN KEY(asset_id) REFERENCES assets(id)
        )`,
        `CREATE TABLE IF NOT EXISTS asset_qc_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            qc_reviewer_id INTEGER,
            qc_score INTEGER,
            qc_remarks TEXT,
            qc_decision TEXT,
            checklist_completion INTEGER,
            checklist_items TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(asset_id) REFERENCES assets(id),
            FOREIGN KEY(qc_reviewer_id) REFERENCES users(id)
        )`
    ];

    for (const table of tables) {
        try {
            db.exec(table);
        } catch (e: any) {
            if (!e.message.includes('already exists')) {
                console.warn('Table creation warning:', e.message);
            }
        }
    }

    db.close();
}

// Initialize database when this module is imported
setupTestDatabase();
