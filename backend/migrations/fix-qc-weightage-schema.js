/**
 * Migration: Fix QC weightage tables schema
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🔄 Fixing QC weightage tables schema...\n');

try {
    // Drop existing tables with wrong schema
    console.log('Dropping existing tables...');
    db.exec('DROP TABLE IF EXISTS qc_weightage_configs');
    db.exec('DROP TABLE IF EXISTS qc_weightage_items');
    db.exec('DROP TABLE IF EXISTS qc_checklist_usage');
    
    // Create qc_weightage_configs with correct schema
    console.log('Creating qc_weightage_configs table...');
    db.exec(`
        CREATE TABLE qc_weightage_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            config_name TEXT NOT NULL UNIQUE,
            description TEXT,
            total_weight REAL DEFAULT 0,
            is_valid INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create qc_weightage_items table
    console.log('Creating qc_weightage_items table...');
    db.exec(`
        CREATE TABLE qc_weightage_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            config_id INTEGER NOT NULL,
            checklist_id INTEGER NOT NULL,
            checklist_type TEXT,
            weight_percentage REAL NOT NULL,
            is_mandatory INTEGER DEFAULT 0,
            applies_to_stage TEXT,
            item_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (config_id) REFERENCES qc_weightage_configs(id) ON DELETE CASCADE
        )
    `);

    // Create qc_checklist_usage table
    console.log('Creating qc_checklist_usage table...');
    db.exec(`
        CREATE TABLE qc_checklist_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            checklist_id INTEGER NOT NULL,
            asset_type TEXT,
            usage_context TEXT,
            usage_count INTEGER DEFAULT 0,
            last_used DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create audit_checklists table if it doesn't exist
    console.log('Creating audit_checklists table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS audit_checklists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            checklist_name TEXT NOT NULL,
            checklist_type TEXT,
            checklist_category TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Insert sample audit checklists if table is empty
    const existingChecklists = db.prepare('SELECT COUNT(*) as count FROM audit_checklists').get();
    if (existingChecklists.count === 0) {
        console.log('Inserting sample audit checklists...');
        db.exec(`
            INSERT INTO audit_checklists (checklist_name, checklist_type, checklist_category, status) VALUES 
            ('Content Quality Check', 'Content', 'Quality', 'active'),
            ('SEO Compliance', 'SEO', 'Technical', 'active'),
            ('Design Review', 'Design', 'Visual', 'active'),
            ('Grammar & Spelling', 'Content', 'Quality', 'active'),
            ('Brand Guidelines', 'Brand', 'Compliance', 'active'),
            ('Mobile Responsiveness', 'Technical', 'UX', 'active'),
            ('Page Load Speed', 'Technical', 'Performance', 'active'),
            ('Accessibility Check', 'Technical', 'UX', 'active')
        `);
        console.log('  ✅ Inserted sample audit checklists');
    }

    // Insert sample QC weightage config if table is empty
    const existingConfigs = db.prepare('SELECT COUNT(*) as count FROM qc_weightage_configs').get();
    if (existingConfigs.count === 0) {
        console.log('Inserting sample QC weightage config...');
        db.exec(`
            INSERT INTO qc_weightage_configs (config_name, description, total_weight, is_valid, status) VALUES 
            ('Default Content QC', 'Default weightage configuration for content quality checks', 100, 1, 'active')
        `);
        
        const configId = db.lastInsertRowid();
        
        // Insert sample weightage items
        db.exec(`
            INSERT INTO qc_weightage_items (config_id, checklist_id, checklist_type, weight_percentage, is_mandatory, item_order) VALUES 
            (${configId}, 1, 'Content', 25, 1, 1),
            (${configId}, 2, 'SEO', 20, 1, 2),
            (${configId}, 3, 'Design', 15, 0, 3),
            (${configId}, 4, 'Content', 15, 1, 4),
            (${configId}, 5, 'Brand', 10, 1, 5),
            (${configId}, 6, 'Technical', 10, 0, 6),
            (${configId}, 7, 'Technical', 5, 0, 7)
        `);
        console.log('  ✅ Inserted sample QC weightage configuration');
    }

    console.log('\n✅ QC weightage tables schema fixed successfully!');
} catch (error) {
    console.error('❌ Error:', error.message);
} finally {
    db.close();
}
