/**
 * Temporary script to fix QC weightage schema using existing db connection
 */

const { pool } = require('./dist/config/db');

async function fixQCWeightageSchema() {
    console.log('🔄 Fixing QC weightage tables schema...');
    
    try {
        // Check current tables
        console.log('Checking existing tables...');
        
        // Drop existing tables with wrong schema if they exist
        try {
            await pool.query('DROP TABLE IF EXISTS qc_weightage_items');
            console.log('  ✅ Dropped qc_weightage_items');
        } catch (err) {
            console.log('  ⚠️  qc_weightage_items did not exist or could not be dropped');
        }
        
        try {
            await pool.query('DROP TABLE IF EXISTS qc_weightage_configs');
            console.log('  ✅ Dropped qc_weightage_configs');
        } catch (err) {
            console.log('  ⚠️  qc_weightage_configs did not exist or could not be dropped');
        }
        
        // Create qc_weightage_configs with correct schema
        console.log('Creating qc_weightage_configs table...');
        await pool.query(`
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
        console.log('  ✅ Created qc_weightage_configs');

        // Create qc_weightage_items table
        console.log('Creating qc_weightage_items table...');
        await pool.query(`
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
        console.log('  ✅ Created qc_weightage_items');

        // Create audit_checklists table if it doesn't exist
        console.log('Creating audit_checklists table...');
        await pool.query(`
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
        console.log('  ✅ Created audit_checklists');

        // Insert sample audit checklists if table is empty
        const checklistResult = await pool.query('SELECT COUNT(*) as count FROM audit_checklists');
        if (checklistResult.rows[0].count === 0) {
            console.log('Inserting sample audit checklists...');
            await pool.query(`
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
        const configResult = await pool.query('SELECT COUNT(*) as count FROM qc_weightage_configs');
        if (configResult.rows[0].count === 0) {
            console.log('Inserting sample QC weightage config...');
            await pool.query(`
                INSERT INTO qc_weightage_configs (config_name, description, total_weight, is_valid, status) VALUES 
                ('Default Content QC', 'Default weightage configuration for content quality checks', 100, 1, 'active')
            `);
            
            const configIdResult = await pool.query('SELECT last_insert_rowid() as id');
            const configId = configIdResult.rows[0].id;
            
            // Insert sample weightage items
            await pool.query(`
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
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixQCWeightageSchema();
