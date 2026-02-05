const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath, { readonly: true });

const rows = db.prepare('SELECT id, name, email, role, status, created_at FROM users ORDER BY id DESC LIMIT 20').all();
if (rows && rows.length) {
    console.log(`Found ${rows.length} user(s) (showing up to 20):`);
    console.table(rows);
} else {
    console.log('No users found in users table');
}
db.close();
