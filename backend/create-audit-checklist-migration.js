const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Audit Checklist tables...');

try {
    // Audit Checklists Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS audit_checklists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checklist_name VARCHAR(255) NOT NULL UNIQUE,
      checklist_type VARCHAR(100) NOT NULL,
      checklist_category VARCHAR(100) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'active',
      scoring_mode VARCHAR(50) NOT NULL DEFAULT 'weighted',
      pass_threshold INTEGER DEFAULT 85,
      rework_threshold INTEGER DEFAULT 70,
      auto_fail_required BOOLEAN DEFAULT 1,
      auto_fail_critical BOOLEAN DEFAULT 1,
      qc_output_type VARCHAR(50) DEFAULT 'percentage',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Checklist Items Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS audit_checklist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checklist_id INTEGER NOT NULL REFERENCES audit_checklists(id) ON DELETE CASCADE,
      item_order INTEGER NOT NULL,
      item_name VARCHAR(255) NOT NULL,
      severity VARCHAR(50) NOT NULL,
      is_required BOOLEAN DEFAULT 0,
      default_score INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(checklist_id, item_order)
    )
  `);

    // Checklist Module Links Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS audit_checklist_modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checklist_id INTEGER NOT NULL REFERENCES audit_checklists(id) ON DELETE CASCADE,
      module_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(checklist_id, module_name)
    )
  `);

    // QC Score Logs Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS audit_qc_score_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checklist_id INTEGER NOT NULL REFERENCES audit_checklists(id) ON DELETE CASCADE,
      asset_id VARCHAR(100) NOT NULL,
      reviewed_by VARCHAR(255) NOT NULL,
      score DECIMAL(5,2) NOT NULL,
      outcome VARCHAR(50) NOT NULL,
      review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Linked Campaigns Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS audit_linked_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checklist_id INTEGER NOT NULL REFERENCES audit_checklists(id) ON DELETE CASCADE,
      campaign_name VARCHAR(255) NOT NULL,
      campaign_type VARCHAR(100),
      usage_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(checklist_id, campaign_name)
    )
  `);

    console.log('✅ Audit Checklist tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Audit Checklist tables:', error);
    db.close();
    process.exit(1);
}
