const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Checking assets table schema...');

try {
    const result = db.prepare("PRAGMA table_info(assets)").all();
    console.log('Assets table columns:');
    result.forEach(col => {
        console.log(`- ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
} catch (error) {
    console.error('Error checking schema:', error.message);
}

db.close();