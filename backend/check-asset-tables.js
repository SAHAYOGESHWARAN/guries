const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%asset%'", (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Asset-related tables:', JSON.stringify(rows, null, 2));
    }
    db.close();
});
