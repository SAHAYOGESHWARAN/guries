const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Workload Prediction & Allocation Engine tables...');

try {
    // Task Allocation Suggestions Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS task_allocation_suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id VARCHAR(100) NOT NULL,
      task_name VARCHAR(255) NOT NULL,
      task_type VARCHAR(100),
      priority VARCHAR(50),
      estimated_hours DECIMAL(8,2),
      suggested_assignee_id VARCHAR(100),
      suggested_assignee_name VARCHAR(255),
      allocation_reason TEXT,
      confidence_score DECIMAL(5,2),
      status VARCHAR(50) DEFAULT 'Suggested',
      assigned_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Workload Forecast Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS workload_forecast (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      forecast_period VARCHAR(50),
      current_workload DECIMAL(8,2),
      forecasted_workload DECIMAL(8,2),
      capacity_hours DECIMAL(8,2),
      utilization_percentage DECIMAL(5,2),
      trend VARCHAR(50),
      risk_level VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Team Capacity Utilization Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS team_capacity_utilization (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id VARCHAR(100) NOT NULL,
      team_name VARCHAR(255) NOT NULL,
      total_capacity DECIMAL(10,2),
      allocated_capacity DECIMAL(10,2),
      available_capacity DECIMAL(10,2),
      utilization_percentage DECIMAL(5,2),
      team_members INTEGER,
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Predicted Overload Cases Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS predicted_overload_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      current_load DECIMAL(8,2),
      predicted_load DECIMAL(8,2),
      capacity DECIMAL(8,2),
      overload_percentage DECIMAL(5,2),
      overload_date TIMESTAMP,
      reason TEXT,
      suggested_action TEXT,
      severity VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Predicted',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Resource Capacity Analysis Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS resource_capacity_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_type VARCHAR(100),
      resource_name VARCHAR(255),
      total_available DECIMAL(10,2),
      currently_used DECIMAL(10,2),
      available_for_allocation DECIMAL(10,2),
      utilization_rate DECIMAL(5,2),
      bottleneck_status VARCHAR(50),
      recommendations TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Allocation History Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS allocation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id VARCHAR(100) NOT NULL,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255),
      allocation_date TIMESTAMP,
      hours_allocated DECIMAL(8,2),
      completion_status VARCHAR(50),
      actual_hours_spent DECIMAL(8,2),
      efficiency_percentage DECIMAL(5,2),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Workload Trend Analysis Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS workload_trend_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(255),
      period VARCHAR(50),
      average_workload DECIMAL(8,2),
      peak_workload DECIMAL(8,2),
      low_workload DECIMAL(8,2),
      trend_direction VARCHAR(50),
      volatility_score DECIMAL(5,2),
      predictability_score DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Allocation Optimization Rules Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS allocation_optimization_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_name VARCHAR(255) NOT NULL,
      rule_type VARCHAR(100),
      condition TEXT,
      action TEXT,
      priority INTEGER,
      enabled BOOLEAN DEFAULT 1,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Skill-Based Allocation Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS skill_based_allocation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id VARCHAR(100) NOT NULL,
      required_skill VARCHAR(100),
      skill_level VARCHAR(50),
      employee_id VARCHAR(100),
      employee_name VARCHAR(255),
      skill_match_percentage DECIMAL(5,2),
      experience_years DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Allocation Performance Metrics Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS allocation_performance_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period VARCHAR(50),
      total_tasks_allocated INTEGER,
      successful_allocations INTEGER,
      failed_allocations INTEGER,
      success_rate DECIMAL(5,2),
      average_allocation_time DECIMAL(8,2),
      average_task_completion_time DECIMAL(8,2),
      resource_utilization_efficiency DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('✅ Workload Prediction & Allocation Engine tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Workload Prediction & Allocation Engine tables:', error);
    db.close();
    process.exit(1);
}
