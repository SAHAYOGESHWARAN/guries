const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

// Check assets table columns
const columns = db.pragma('table_info(assets)');
console.log('Assets table columns:');
columns.forEach(col => {
    if (col.name.includes('qc') || col.name.includes('status')) {
        console.log('  -', col.name, '(' + col.type + ')');
    }
});

// Check if qc_status column exists
const hasQcStatus = columns.some(c => c.name === 'qc_status');
console.log('\nHas qc_status column:', hasQcStatus);

// Check a sample asset
const asset = db.prepare('SELECT id, asset_name, status, qc_status, qc_score FROM assets LIMIT 1').get();
console.log('\nSample asset:', asset);

db.close();
