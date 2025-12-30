const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'mcc_db.sqlite'));
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();

console.log('Existing tables in database:');
tables.forEach(t => console.log('  -', t.name));
console.log(`\nTotal: ${tables.length} tables`);

db.close();
