const Database = require('better-sqlite3');
const db = new Database('../mcc_db.sqlite');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('\n✅ Total tables:', tables.length);
console.log('\nTables:');
tables.forEach(t => {
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM ${t.name}`).get();
    console.log(`  - ${t.name} (${count.cnt} rows)`);
});

db.close();
