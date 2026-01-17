const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating AI Automatic Evaluation Engine tables...');

try {
    // AI Evaluation Reports Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_evaluation_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id VARCHAR(100) NOT NULL UNIQUE,
      evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      evaluation_period VARCHAR(50),
      total_records INTEGER,
      status VARCHAR(50) DEFAULT 'Completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Input Data Sources Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_input_data_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id VARCHAR(100) NOT NULL,
      source_name VARCHAR(255) NOT NULL,
      record_count INTEGER,
      data_type VARCHAR(100),
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES ai_evaluation_reports(report_id)
    )
  `);

    // AI Performance Scores Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_performance_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id VARCHAR(100) NOT NULL,
      metric_name VARCHAR(255) NOT NULL,
      score DECIMAL(5,2),
      trend VARCHAR(50),
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES ai_evaluation_reports(report_id)
    )
  `);

    // Risk Factors Detected Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_risk_factors_detected (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id VARCHAR(100) NOT NULL,
      risk_factor VARCHAR(255) NOT NULL,
      severity VARCHAR(50),
      impact_percentage DECIMAL(5,2),
      description TEXT,
      recommendation TEXT,
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES ai_evaluation_reports(report_id)
    )
  `);

    // Improvement Opportunities Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_improvement_opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id VARCHAR(100) NOT NULL,
      opportunity_name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      potential_impact DECIMAL(5,2),
      priority VARCHAR(50),
      implementation_effort VARCHAR(50),
      description TEXT,
      action_items TEXT,
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES ai_evaluation_reports(report_id)
    )
  `);

    // AI Recommendations Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id VARCHAR(100) NOT NULL,
      recommendation_text TEXT NOT NULL,
      category VARCHAR(100),
      priority VARCHAR(50),
      estimated_impact DECIMAL(5,2),
      implementation_timeline VARCHAR(100),
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES ai_evaluation_reports(report_id)
    )
  `);

    // AI Evaluation Reasoning Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_evaluation_reasoning (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id VARCHAR(100) NOT NULL,
      reasoning_section VARCHAR(255),
      reasoning_text TEXT,
      key_findings TEXT,
      methodology TEXT,
      confidence_score DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES ai_evaluation_reports(report_id)
    )
  `);

    // AI Evaluation History Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_evaluation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id VARCHAR(100) NOT NULL,
      evaluation_date TIMESTAMP,
      overall_score DECIMAL(5,2),
      trend VARCHAR(50),
      key_metrics TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES ai_evaluation_reports(report_id)
    )
  `);

    console.log('✅ AI Automatic Evaluation Engine tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating AI Automatic Evaluation Engine tables:', error);
    db.close();
    process.exit(1);
}
