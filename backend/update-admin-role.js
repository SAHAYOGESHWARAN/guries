const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);
try {
  const info = db.prepare("UPDATE users SET role = 'Admin' WHERE email = ?").run('admin@example.com');
  console.log('updated rows:', info.changes);
} catch (e) {
  console.error('error', e.message);
} finally {
  db.close();
}
