// Ensure users table exists using sqlite3 (callback-based)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

const createUsersSQL = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT,
    status TEXT DEFAULT 'active',
    password_hash TEXT,
    department TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

db.serialize(() => {
    db.run(createUsersSQL, (err) => {
        if (err) {
            console.error('Failed to create users table:', err.message);
            process.exit(1);
        }
        console.log('✅ Ensured users table exists');
        db.close();
    });
});
