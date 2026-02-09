const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Ensuring campaigns table has all required columns...');

const requiredColumns = {
    campaign_name: 'TEXT NOT NULL',
    campaign_type: "TEXT DEFAULT 'Content'",
    status: "TEXT DEFAULT 'planning'",
    description: 'TEXT',
    campaign_start_date: 'DATE',
    campaign_end_date: 'DATE',
    campaign_owner_id: 'INTEGER',
    project_id: 'INTEGER',
    brand_id: 'INTEGER',
    linked_service_ids: 'TEXT',
    target_url: 'TEXT',
    backlinks_planned: 'INTEGER DEFAULT 0',
    backlinks_completed: 'INTEGER DEFAULT 0',
    tasks_completed: 'INTEGER DEFAULT 0',
    tasks_total: 'INTEGER DEFAULT 0',
    kpi_score: 'INTEGER DEFAULT 0',
    sub_campaigns: 'TEXT',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};

try {
    // Check if campaigns table exists
    const tableExists = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='campaigns'"
    ).get();

    if (!tableExists) {
        console.log('Creating campaigns table...');
        db.exec(`
            CREATE TABLE campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                campaign_name TEXT NOT NULL,
                campaign_type TEXT DEFAULT 'Content',
                status TEXT DEFAULT 'planning',
                description TEXT,
                campaign_start_date DATE,
                campaign_end_date DATE,
                campaign_owner_id INTEGER,
                project_id INTEGER,
                brand_id INTEGER,
                linked_service_ids TEXT,
                target_url TEXT,
                backlinks_planned INTEGER DEFAULT 0,
                backlinks_completed INTEGER DEFAULT 0,
                tasks_completed INTEGER DEFAULT 0,
                tasks_total INTEGER DEFAULT 0,
                kpi_score INTEGER DEFAULT 0,
                sub_campaigns TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Campaigns table created');
    } else {
        console.log('Campaigns table exists, checking columns...');

        // Get existing columns
        const existingColumns = db.prepare('PRAGMA table_info(campaigns)').all();
        const existingColumnNames = existingColumns.map(col => col.name);

        // Add missing columns
        for (const [columnName, columnDef] of Object.entries(requiredColumns)) {
            if (!existingColumnNames.includes(columnName)) {
                console.log(`Adding missing column: ${columnName}`);
                try {
                    db.exec(`ALTER TABLE campaigns ADD COLUMN ${columnName} ${columnDef}`);
                    console.log(`✅ Added column: ${columnName}`);
                } catch (e) {
                    if (!e.message.includes('already exists')) {
                        console.warn(`⚠️  Could not add column ${columnName}:`, e.message);
                    }
                }
            }
        }

        console.log('✅ Campaigns table schema verified');
    }
} catch (error) {
    console.error('Error ensuring campaigns schema:', error.message);
}

db.close();
