const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(asset_category_master)", (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('asset_category_master structure:', JSON.stringify(rows, null, 2));
    }
    db.close();
});
