-- Minimal schema for local dev to support QC flow
PRAGMA foreign_keys = ON;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  password_hash TEXT,
  department TEXT,
  country TEXT,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Brands (referenced by assets)
CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  code TEXT,
  industry TEXT,
  website TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Services (referenced by asset linking)
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_name TEXT NOT NULL,
  service_code TEXT,
  slug TEXT,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Assets (simplified to include QC fields used by the app)
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_name TEXT NOT NULL,
  asset_type TEXT,
  asset_category TEXT,
  asset_format TEXT,
  status TEXT DEFAULT 'draft',
  qc_status TEXT,
  file_url TEXT,
  qc_score INTEGER,
  qc_checklist_items TEXT,
  submitted_by INTEGER,
  submitted_at DATETIME,
  qc_reviewer_id INTEGER,
  qc_reviewed_at DATETIME,
  qc_remarks TEXT,
  qc_checklist_completion INTEGER,
  linking_active INTEGER DEFAULT 0,
  rework_count INTEGER DEFAULT 0,
  workflow_log TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (qc_reviewer_id) REFERENCES users(id),
  FOREIGN KEY (submitted_by) REFERENCES users(id)
);

-- Asset QC reviews
CREATE TABLE IF NOT EXISTS asset_qc_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  qc_reviewer_id INTEGER,
  qc_score INTEGER,
  checklist_completion INTEGER,
  qc_remarks TEXT,
  qc_decision TEXT,
  checklist_items TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (qc_reviewer_id) REFERENCES users(id)
);

-- QC audit log
CREATE TABLE IF NOT EXISTS qc_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER,
  user_id INTEGER,
  action VARCHAR(50),
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications (basic)
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT,
  message TEXT,
  type TEXT,
  is_read INTEGER DEFAULT 0,
  link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name TEXT NOT NULL,
  project_code TEXT UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'Planned',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  owner_id INTEGER,
  brand_id INTEGER,
  linked_service_id INTEGER,
  priority TEXT DEFAULT 'Medium',
  sub_services TEXT,
  outcome_kpis TEXT,
  expected_outcome TEXT,
  team_members TEXT,
  weekly_report INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (brand_id) REFERENCES brands(id),
  FOREIGN KEY (linked_service_id) REFERENCES services(id)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT DEFAULT 'Content',
  status TEXT DEFAULT 'planning',
  description TEXT,
  campaign_start_date DATE,
  campaign_end_date DATE,
  campaign_owner_id INTEGER,
  project_id INTEGER,
  brand_id INTEGER,
  linked_service_ids TEXT,
  target_url TEXT,
  backlinks_planned INTEGER DEFAULT 0,
  backlinks_completed INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_total INTEGER DEFAULT 0,
  kpi_score INTEGER DEFAULT 0,
  sub_campaigns TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_owner_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (brand_id) REFERENCES brands(id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'Medium',
  assigned_to INTEGER,
  project_id INTEGER,
  campaign_id INTEGER,
  due_date DATE,
  campaign_type TEXT,
  sub_campaign TEXT,
  progress_stage TEXT DEFAULT 'Not Started',
  qc_stage TEXT DEFAULT 'Pending',
  estimated_hours DECIMAL(5,2),
  tags TEXT,
  repo_links TEXT,
  rework_count INTEGER DEFAULT 0,
  repo_link_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Indexes commonly used by QC queries
CREATE INDEX IF NOT EXISTS idx_asset_qc_asset_id ON asset_qc_reviews(asset_id);
CREATE INDEX IF NOT EXISTS idx_qc_audit_asset_id ON qc_audit_log(asset_id);
CREATE INDEX IF NOT EXISTS idx_qc_audit_user_id ON qc_audit_log(user_id);

-- Additional indexes for Projects, Campaigns, Tasks
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_brand_id ON projects(brand_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_owner_id ON campaigns(campaign_owner_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_campaign_id ON tasks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
