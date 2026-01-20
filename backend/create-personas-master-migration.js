const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Personas Master table...');

try {
    // Personas Master Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS personas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      persona_name VARCHAR(255) NOT NULL,
      segment VARCHAR(255),
      role VARCHAR(255),
      funnel_stage VARCHAR(100),
      description TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('✅ Personas Master table created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Personas Master table:', error);
    db.close();
    process.exit(1);
}
