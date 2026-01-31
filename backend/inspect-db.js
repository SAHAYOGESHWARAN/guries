const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();

console.log('Existing tables and columns:\n');
tables.forEach(t => {
    const columns = db.pragma('table_info(' + t.name + ')');
    console.log(t.name + ':');
    columns.forEach(col => console.log('  - ' + col.name + ' (' + col.type + ')'));
    console.log('');
});

db.close();
