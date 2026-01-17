const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Country Master tables...');

try {
    // Country Master Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS country_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_name VARCHAR(255) NOT NULL UNIQUE,
      iso_code VARCHAR(10) NOT NULL UNIQUE,
      region VARCHAR(100) NOT NULL,
      default_language VARCHAR(50),
      allowed_for_backlinks BOOLEAN DEFAULT 0,
      allowed_for_content_targeting BOOLEAN DEFAULT 0,
      allowed_for_smm_targeting BOOLEAN DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('✅ Country Master table created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Country Master table:', error);
    db.close();
    process.exit(1);
}
