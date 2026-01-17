const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Reward & Penalty Automation tables...');

try {
    // Bonus Criteria & Tiers Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS bonus_criteria_tiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tier_name VARCHAR(100) NOT NULL,
      tier_level INTEGER,
      min_salary DECIMAL(12,2),
      max_salary DECIMAL(12,2),
      bonus_percentage DECIMAL(5,2),
      criteria_description TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Reward Recommendations Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS reward_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      performance_score DECIMAL(5,2),
      recommendation_type VARCHAR(100),
      reward_amount DECIMAL(12,2),
      reward_reason TEXT,
      tier_applicable VARCHAR(100),
      approval_status VARCHAR(50) DEFAULT 'Pending',
      approved_by VARCHAR(255),
      approved_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Penalty Rules Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS penalty_automation_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_name VARCHAR(255) NOT NULL,
      rule_type VARCHAR(100),
      violation_category VARCHAR(100),
      severity_level VARCHAR(50),
      penalty_amount DECIMAL(12,2),
      penalty_percentage DECIMAL(5,2),
      description TEXT,
      conditions TEXT,
      auto_apply BOOLEAN DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Penalty Records Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS penalty_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      violation_type VARCHAR(100),
      violation_date TIMESTAMP,
      penalty_amount DECIMAL(12,2),
      penalty_reason TEXT,
      rule_applied VARCHAR(255),
      severity VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Applied',
      appeal_status VARCHAR(50),
      appeal_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Reward History Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS reward_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      reward_type VARCHAR(100),
      reward_amount DECIMAL(12,2),
      reward_date TIMESTAMP,
      reason TEXT,
      period VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Penalty History Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS penalty_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      penalty_type VARCHAR(100),
      penalty_amount DECIMAL(12,2),
      penalty_date TIMESTAMP,
      reason TEXT,
      period VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Automation Rules Configuration Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS automation_rules_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_name VARCHAR(255) NOT NULL,
      rule_type VARCHAR(100),
      trigger_condition TEXT,
      action_type VARCHAR(100),
      action_value DECIMAL(12,2),
      frequency VARCHAR(50),
      enabled BOOLEAN DEFAULT 1,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Reward & Penalty Analytics Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS reward_penalty_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period VARCHAR(50),
      total_rewards DECIMAL(12,2),
      total_penalties DECIMAL(12,2),
      total_employees_rewarded INTEGER,
      total_employees_penalized INTEGER,
      average_reward DECIMAL(12,2),
      average_penalty DECIMAL(12,2),
      top_reward_reason VARCHAR(255),
      top_penalty_reason VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Appeal Management Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS appeal_management (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      appeal_type VARCHAR(100),
      penalty_record_id INTEGER,
      appeal_reason TEXT,
      appeal_date TIMESTAMP,
      appeal_status VARCHAR(50) DEFAULT 'Pending',
      reviewed_by VARCHAR(255),
      review_date TIMESTAMP,
      review_comments TEXT,
      decision VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (penalty_record_id) REFERENCES penalty_records(id)
    )
  `);

    console.log('✅ Reward & Penalty Automation tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Reward & Penalty Automation tables:', error);
    db.close();
    process.exit(1);
}
