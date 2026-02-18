const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
console.log('Database path:', dbPath);

// Remove old db
const fs = require('fs');
try {
    fs.unlinkSync(dbPath);
    console.log('Removed old database');
} catch (e) { }

const db = new Database(dbPath);

console.log('Creating table...');
db.prepare(`
  CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_name TEXT NOT NULL
  )
`).run();

console.log('Inserting data...');
const res = db.prepare('INSERT INTO assets (asset_name) VALUES (?)').run('Test Asset');
console.log('Insert result:', res);

console.log('Querying data...');
const rows = db.prepare('SELECT * FROM assets').all();
console.log('Rows:', rows);

db.close();
console.log('Done');
