const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    db.all('SELECT id, name, email, role, status, created_at FROM users ORDER BY id DESC LIMIT 20', (err, rows) => {
        if (err) {
            console.error('Error querying users:', err.message);
            db.close();
            process.exit(1);
        }
        if (!rows || rows.length === 0) {
            console.log('No users found');
        } else {
            console.table(rows);
        }
        db.close();
    });
});
