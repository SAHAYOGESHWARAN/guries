const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Workflow Master tables...');

try {
    // Workflow Master Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS workflow_master_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workflow_name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Workflow Stages Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS workflow_stage_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workflow_id INTEGER NOT NULL REFERENCES workflow_master_new(id),
      stage_order INTEGER NOT NULL,
      stage_title VARCHAR(255) NOT NULL,
      stage_label VARCHAR(100),
      color_tag VARCHAR(50) NOT NULL,
      mandatory_qc BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(workflow_id, stage_order)
    )
  `);

    console.log('✅ Workflow Master tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Workflow Master tables:', error);
    db.close();
    process.exit(1);
}
