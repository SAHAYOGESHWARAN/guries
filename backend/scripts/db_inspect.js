const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath, { readonly: true });

function listTables() {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    return tables.map(t => t.name);
}

const tables = listTables();
console.log('Tables in DB:', tables.join(', '));

for (const t of tables) {
    try {
        const row = db.prepare(`SELECT COUNT(*) as count FROM ${t}`).get();
        console.log(`${t}: ${row.count}`);
    } catch (err) {
        console.log(`${t}: (error counting rows) ${err.message}`);
    }
}

db.close();
