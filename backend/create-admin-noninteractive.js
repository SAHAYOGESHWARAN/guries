const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const name = process.env.ADMIN_NAME || 'Admin User';
const role = 'admin';
const status = 'active';

try {
  db.pragma('foreign_keys = ON');
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    db.prepare('UPDATE users SET name = ?, role = ?, status = ?, updated_at = datetime(\'now\') WHERE email = ?').run(name, role, status, email);
    console.log(`Updated existing admin user: ${email}`);
  } else {
    db.prepare('INSERT INTO users (name, email, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))').run(name, email, role, status);
    console.log(`Created admin user: ${email}`);
  }
  db.close();
  process.exit(0);
} catch (err) {
  console.error('Failed to create admin user:', err.message);
  process.exit(1);
}
