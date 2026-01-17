const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Team Leader Dashboard tables...');

try {
    // Team Workload Distribution Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS team_workload_distribution (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id VARCHAR(100) NOT NULL,
      team_name VARCHAR(255) NOT NULL,
      member_id VARCHAR(100) NOT NULL,
      member_name VARCHAR(255) NOT NULL,
      total_tasks INTEGER DEFAULT 0,
      completed_tasks INTEGER DEFAULT 0,
      pending_tasks INTEGER DEFAULT 0,
      overdue_tasks INTEGER DEFAULT 0,
      workload_percentage DECIMAL(5,2) DEFAULT 0,
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, member_id)
    )
  `);

    // Team Capacity Analysis Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS team_capacity_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id VARCHAR(100) NOT NULL UNIQUE,
      team_name VARCHAR(255) NOT NULL,
      total_capacity INTEGER DEFAULT 0,
      utilized_capacity INTEGER DEFAULT 0,
      available_capacity INTEGER DEFAULT 0,
      capacity_utilization_percentage DECIMAL(5,2) DEFAULT 0,
      team_members_count INTEGER DEFAULT 0,
      avg_workload DECIMAL(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Campaign Overview Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS campaign_overview (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id VARCHAR(100) NOT NULL,
      campaign_id VARCHAR(100) NOT NULL,
      campaign_name VARCHAR(255) NOT NULL,
      campaign_type VARCHAR(100),
      status VARCHAR(50),
      progress_percentage DECIMAL(5,2) DEFAULT 0,
      start_date DATE,
      end_date DATE,
      assigned_members INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, campaign_id)
    )
  `);

    // Task Status Distribution Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS task_status_distribution (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL,
      task_count INTEGER DEFAULT 0,
      percentage DECIMAL(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, status)
    )
  `);

    // Team Performance Trend Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS team_performance_trend (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id VARCHAR(100) NOT NULL,
      team_name VARCHAR(255) NOT NULL,
      date_recorded DATE NOT NULL,
      completion_rate DECIMAL(5,2) DEFAULT 0,
      quality_score DECIMAL(5,2) DEFAULT 0,
      efficiency_score DECIMAL(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, date_recorded)
    )
  `);

    // Team Member Performance Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS team_member_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id VARCHAR(100) NOT NULL,
      member_id VARCHAR(100) NOT NULL,
      member_name VARCHAR(255) NOT NULL,
      role VARCHAR(100),
      tasks_assigned INTEGER DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      completion_rate DECIMAL(5,2) DEFAULT 0,
      quality_score DECIMAL(5,2) DEFAULT 0,
      efficiency_score DECIMAL(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, member_id)
    )
  `);

    // Task Assignment History Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS task_assignment_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id VARCHAR(100) NOT NULL,
      task_id VARCHAR(100) NOT NULL,
      task_name VARCHAR(255) NOT NULL,
      assigned_to VARCHAR(100) NOT NULL,
      assigned_by VARCHAR(100),
      assigned_date TIMESTAMP,
      due_date DATE,
      status VARCHAR(50),
      priority VARCHAR(50),
      estimated_hours DECIMAL(8,2),
      actual_hours DECIMAL(8,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Team Capacity Forecast Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS team_capacity_forecast (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id VARCHAR(100) NOT NULL,
      team_name VARCHAR(255) NOT NULL,
      forecast_date DATE NOT NULL,
      forecasted_capacity INTEGER DEFAULT 0,
      forecasted_utilization DECIMAL(5,2) DEFAULT 0,
      confidence_level VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, forecast_date)
    )
  `);

    console.log('✅ Team Leader Dashboard tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Team Leader Dashboard tables:', error);
    db.close();
    process.exit(1);
}
