const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

try {
    console.log('Adding asset linking fields to sub_services table...');

    const tableInfo = db.prepare("PRAGMA table_info(sub_services)").all();
    const existingColumns = tableInfo.map(col => col.name);

    const fieldsToAdd = [
        { name: 'featured_asset_id', type: 'INTEGER' },
        { name: 'knowledge_topic_id', type: 'INTEGER' }
    ];

    fieldsToAdd.forEach(field => {
        if (!existingColumns.includes(field.name)) {
            db.exec(`ALTER TABLE sub_services ADD COLUMN ${field.name} ${field.type};`);
            console.log(`✓ Added column: ${field.name}`);
        } else {
            console.log(`✓ Column already exists: ${field.name}`);
        }
    });

    console.log('✓ Migration completed successfully');
    db.close();
} catch (error) {
    console.error('✗ Migration failed:', error.message);
    db.close();
    process.exit(1);
}
