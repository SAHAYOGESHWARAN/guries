const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('Creating Analytics Dashboard tables...');

try {
    // Effort Analytics Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS effort_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      department VARCHAR(100),
      effort_completion_percentage DECIMAL(5,2),
      effort_pass_percentage DECIMAL(5,2),
      total_tasks_completed INTEGER,
      qc_compliance_percentage DECIMAL(5,2),
      rework_percentage DECIMAL(5,2),
      workload_prediction VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Performance Analytics Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS performance_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      department VARCHAR(100),
      kpi_achievement_percentage DECIMAL(5,2),
      ranking_improvement INTEGER,
      performance_score_percentage DECIMAL(5,2),
      engagement_score DECIMAL(5,2),
      traffic_growth_percentage DECIMAL(5,2),
      conversion_score DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // KPI Metrics Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS kpi_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_name VARCHAR(255) NOT NULL,
      metric_type VARCHAR(100),
      benchmark INTEGER,
      current_value INTEGER,
      target_value INTEGER,
      delta INTEGER,
      percentage_changed DECIMAL(5,2),
      gold_standard INTEGER,
      competitor_avg INTEGER,
      trend VARCHAR(50),
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Target vs Actual Performance Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS target_vs_actual (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      target_value INTEGER,
      actual_value INTEGER,
      percentage_completion DECIMAL(5,2),
      status VARCHAR(50),
      week_number INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Team Performance Heatmap Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS team_performance_heatmap (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_name VARCHAR(100) NOT NULL,
      week_number INTEGER NOT NULL,
      performance_percentage DECIMAL(5,2),
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_name, week_number)
    )
  `);

    // QC Performance by Stage Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS qc_performance_by_stage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stage_name VARCHAR(100) NOT NULL,
      score_percentage DECIMAL(5,2),
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // SLA Misses/Delays Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS sla_misses_delays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_name VARCHAR(100) NOT NULL,
      missed_count INTEGER DEFAULT 0,
      delay_days INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Effort Trends Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS effort_trends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_number INTEGER NOT NULL,
      effort_percentage DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(week_number)
    )
  `);

    // Keyword Analytics Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS keyword_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword VARCHAR(255) NOT NULL,
      rank_position INTEGER,
      search_volume INTEGER,
      traffic_count INTEGER,
      conversion_count INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('✅ Analytics Dashboard tables created successfully');
    db.close();
} catch (error) {
    console.error('❌ Error creating Analytics Dashboard tables:', error);
    db.close();
    process.exit(1);
}
