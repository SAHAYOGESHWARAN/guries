const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Platform Master tables...');

try {
    // Platform Master Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS platform_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_name VARCHAR(255) NOT NULL UNIQUE,
      platform_code VARCHAR(100),
      description TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Platform Content Types Junction Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS platform_content_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id INTEGER NOT NULL REFERENCES platform_master(id),
      content_type_id INTEGER NOT NULL REFERENCES content_types(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(platform_id, content_type_id)
    )
  `);

    // Platform Asset Types Junction Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS platform_asset_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id INTEGER NOT NULL REFERENCES platform_master(id),
      asset_type_id INTEGER NOT NULL REFERENCES asset_types(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(platform_id, asset_type_id)
    )
  `);

    // Platform Recommended Sizes Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS platform_recommended_sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id INTEGER NOT NULL REFERENCES platform_master(id),
      asset_type_id INTEGER NOT NULL REFERENCES asset_types(id),
      recommended_dimension VARCHAR(100) NOT NULL,
      file_format VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(platform_id, asset_type_id)
    )
  `);

    // Platform Scheduling Options Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS platform_scheduling_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id INTEGER NOT NULL REFERENCES platform_master(id),
      scheduling_type VARCHAR(50) NOT NULL,
      is_enabled BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('✅ Platform Master tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Platform Master tables:', error);
    db.close();
    process.exit(1);
}
