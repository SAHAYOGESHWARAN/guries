const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Employee Performance Scorecard tables...');

try {
    // Employee Scorecard Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS employee_scorecards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL UNIQUE,
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      position VARCHAR(100),
      reporting_manager VARCHAR(255),
      effort_score DECIMAL(5,2),
      qc_score DECIMAL(5,2),
      contribution_score DECIMAL(5,2),
      performance_rating VARCHAR(50),
      performance_rating_percentage DECIMAL(5,2),
      self_rating_score DECIMAL(5,2),
      uniformity_score DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // KPI Contribution Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS kpi_contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL REFERENCES employee_scorecards(employee_id) ON DELETE CASCADE,
      tasks_completed INTEGER,
      error_rate DECIMAL(5,2),
      rework_percentage DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // QC Performance History Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS qc_performance_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL REFERENCES employee_scorecards(employee_id) ON DELETE CASCADE,
      date_recorded TIMESTAMP,
      task_name VARCHAR(255),
      score DECIMAL(5,2),
      status VARCHAR(50),
      feedback TEXT,
      result VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Attendance & Discipline Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_discipline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL REFERENCES employee_scorecards(employee_id) ON DELETE CASCADE,
      present_days INTEGER,
      absent_days INTEGER,
      warnings INTEGER DEFAULT 0,
      disciplinary_actions INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Monthly Contribution Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL REFERENCES employee_scorecards(employee_id) ON DELETE CASCADE,
      month_year VARCHAR(20),
      contribution_percentage DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, month_year)
    )
  `);

    // AI Performance Analysis Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_performance_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL REFERENCES employee_scorecards(employee_id) ON DELETE CASCADE,
      analysis_text TEXT,
      strengths TEXT,
      areas_for_improvement TEXT,
      recommendations TEXT,
      generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Performance Goals Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS performance_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL REFERENCES employee_scorecards(employee_id) ON DELETE CASCADE,
      goal_name VARCHAR(255) NOT NULL,
      goal_description TEXT,
      target_value DECIMAL(5,2),
      current_value DECIMAL(5,2),
      status VARCHAR(50),
      due_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('✅ Employee Performance Scorecard tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Employee Performance Scorecard tables:', error);
    db.close();
    process.exit(1);
}
