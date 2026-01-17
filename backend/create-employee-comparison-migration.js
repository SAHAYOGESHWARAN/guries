const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Employee Comparison Dashboard tables...');

try {
    // Employee Performance Ranking Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS employee_performance_ranking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL UNIQUE,
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      rank_position INTEGER,
      completion_score DECIMAL(5,2),
      qc_score DECIMAL(5,2),
      contribution_score DECIMAL(5,2),
      performance_rating VARCHAR(50),
      trend VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Best Performer Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS best_performers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      performance_score DECIMAL(5,2),
      achievement_percentage DECIMAL(5,2),
      period VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Weekly Performance Heatmap Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_performance_heatmap (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      week_number INTEGER,
      performance_percentage DECIMAL(5,2),
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, week_number)
    )
  `);

    // Underperforming Employees Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS underperforming_employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL UNIQUE,
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      current_score DECIMAL(5,2),
      target_score DECIMAL(5,2),
      gap DECIMAL(5,2),
      reason TEXT,
      detection_date TIMESTAMP,
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Performance Comparison Matrix Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS performance_comparison_matrix (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id_1 VARCHAR(100) NOT NULL,
      employee_id_2 VARCHAR(100) NOT NULL,
      employee_name_1 VARCHAR(255),
      employee_name_2 VARCHAR(255),
      metric_name VARCHAR(100),
      value_1 DECIMAL(5,2),
      value_2 DECIMAL(5,2),
      difference DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Top Performers Radar Data Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS top_performers_radar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      metric_name VARCHAR(100),
      metric_value DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, metric_name)
    )
  `);

    // Department Performance Summary Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS department_performance_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department VARCHAR(100) NOT NULL UNIQUE,
      average_performance DECIMAL(5,2),
      top_performer_name VARCHAR(255),
      underperformer_count INTEGER,
      total_employees INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('✅ Employee Comparison Dashboard tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Employee Comparison Dashboard tables:', error);
    db.close();
    process.exit(1);
}
