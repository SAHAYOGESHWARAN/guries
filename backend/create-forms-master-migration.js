const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Forms Master table...');

try {
    // Forms Master Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_name VARCHAR(255) NOT NULL,
      form_type VARCHAR(100),
      data_source VARCHAR(255),
      target_url VARCHAR(1000),
      status VARCHAR(50) DEFAULT 'active',
      owner_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('✅ Forms Master table created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Forms Master table:', error);
    db.close();
    process.exit(1);
}
