const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating SEO Error Type Master table...');

try {
    // SEO Error Type Master Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS seo_error_type_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      error_type VARCHAR(255) NOT NULL UNIQUE,
      category VARCHAR(100) NOT NULL,
      severity_level VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('✅ SEO Error Type Master table created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating SEO Error Type Master table:', error);
    db.close();
    process.exit(1);
}
