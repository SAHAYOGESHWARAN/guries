/**
 * Create or update the admin user in the local SQLite database.
 * Usage: node scripts/create_admin.js [email] [password]
 * Defaults: admin@example.com admin123
 */

const path = require('path');
const Database = require('better-sqlite3');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '..', 'mcc_db.sqlite');
const db = new Database(dbPath);

const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || 'admin123';

function hashPassword(pw) {
    return crypto.createHash('sha256').update(pw).digest('hex');
}

try {
    // Ensure users table exists - create if missing
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (!table) {
        db.prepare(`
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
            )
        `).run();
        console.log('Created users table');
    }

    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    const password_hash = hashPassword(password);
    const now = new Date().toISOString();

    if (existing) {
        db.prepare(`UPDATE users SET password_hash = ?, role = ?, status = ?, department = ?, updated_at = ? WHERE email = ?`).run(
            password_hash,
            'admin',
            'active',
            'Administration',
            now,
            email
        );
        console.log(`Updated admin user: ${email}`);
    } else {
        db.prepare(`INSERT INTO users (name, email, role, status, password_hash, department, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
            .run('Admin User', email, 'admin', 'active', password_hash, 'Administration', now, now);
        console.log(`Created admin user: ${email}`);
    }

    console.log('Done. You can now login with the admin credentials.');
} catch (err) {
    console.error('Error creating/updating admin user:', err.message);
    process.exit(1);
} finally {
    db.close();
}
