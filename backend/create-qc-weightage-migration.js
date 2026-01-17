const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating QC Weightage Configuration tables...');

try {
    // QC Weightage Configuration Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS qc_weightage_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      total_weight INTEGER DEFAULT 100,
      is_valid BOOLEAN DEFAULT 1,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // QC Weightage Items Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS qc_weightage_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_id INTEGER NOT NULL REFERENCES qc_weightage_configs(id) ON DELETE CASCADE,
      checklist_id INTEGER NOT NULL REFERENCES audit_checklists(id) ON DELETE CASCADE,
      checklist_type VARCHAR(100) NOT NULL,
      weight_percentage INTEGER NOT NULL,
      is_mandatory BOOLEAN DEFAULT 1,
      applies_to_stage VARCHAR(100),
      item_order INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(config_id, checklist_id)
    )
  `);

    // QC Checklist Versions Table (for version history)
    db.exec(`
    CREATE TABLE IF NOT EXISTS qc_checklist_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checklist_id INTEGER NOT NULL REFERENCES audit_checklists(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      version_name VARCHAR(255),
      description TEXT,
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(checklist_id, version_number)
    )
  `);

    // QC Checklist Usage Table (tracks which checklists are used where)
    db.exec(`
    CREATE TABLE IF NOT EXISTS qc_checklist_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checklist_id INTEGER NOT NULL REFERENCES audit_checklists(id) ON DELETE CASCADE,
      asset_type VARCHAR(100) NOT NULL,
      usage_context VARCHAR(255),
      usage_count INTEGER DEFAULT 0,
      last_used TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(checklist_id, asset_type, usage_context)
    )
  `);

    console.log('✅ QC Weightage Configuration tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating QC Weightage Configuration tables:', error);
    db.close();
    process.exit(1);
}
