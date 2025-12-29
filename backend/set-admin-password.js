/**
 * Set password for admin user
 */
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

const password = 'admin123';
const hash = crypto.createHash('sha256').update(password).digest('hex');

db.prepare("UPDATE users SET password_hash = ? WHERE email = 'admin@example.com'").run(hash);
console.log('✅ Password set for admin@example.com (password: admin123)');

db.close();
