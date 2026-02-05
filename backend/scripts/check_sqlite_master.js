const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath, { readonly: true });

try {
    const row = db.prepare("SELECT count(*) as c FROM sqlite_master").get();
    console.log('sqlite_master count:', row.c);
    const tables = db.prepare("SELECT name, type FROM sqlite_master ORDER BY name").all();
    console.log('sqlite_master entries:');
    console.table(tables);
} catch (err) {
    console.error('Error querying sqlite_master:', err.message);
}

db.close();
