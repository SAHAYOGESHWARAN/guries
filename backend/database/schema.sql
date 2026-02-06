-- Complete Database Schema for Marketing Control Center
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

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name TEXT UNIQUE NOT NULL,
  permissions TEXT,
  status TEXT DEFAULT 'active',
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
  h1 TEXT,
  h2_list TEXT,
  h3_list TEXT,
  h4_list TEXT,
  h5_list TEXT,
  body_content TEXT,
  internal_links TEXT,
  external_links TEXT,
  image_alt_texts TEXT,
  meta_title TEXT,
  meta_description TEXT,
  focus_keywords TEXT,
  secondary_keywords TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  schema_type_id INTEGER,
  robots_index TEXT,
  robots_follow TEXT,
  canonical_url TEXT,
  word_count INTEGER,
  reading_time_minutes INTEGER,
  version_number INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sub-Services (referenced by asset linking)
CREATE TABLE IF NOT EXISTS sub_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  sub_service_name TEXT NOT NULL,
  sub_service_code TEXT,
  slug TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft',
  parent_service_id INTEGER,
  h1 TEXT,
  h2_list TEXT,
  h3_list TEXT,
  h4_list TEXT,
  h5_list TEXT,
  body_content TEXT,
  internal_links TEXT,
  external_links TEXT,
  image_alt_texts TEXT,
  meta_title TEXT,
  meta_description TEXT,
  focus_keywords TEXT,
  secondary_keywords TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  schema_type_id INTEGER,
  robots_index TEXT,
  robots_follow TEXT,
  canonical_url TEXT,
  word_count INTEGER,
  reading_time_minutes INTEGER,
  version_number INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (parent_service_id) REFERENCES services(id)
);

-- Assets (comprehensive with all fields)
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_name TEXT NOT NULL,
  asset_type TEXT,
  asset_category TEXT,
  asset_format TEXT,
  status TEXT DEFAULT 'draft',
  qc_status TEXT,
  file_url TEXT,
  thumbnail_url TEXT,
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
  workflow_stage TEXT DEFAULT 'draft',
  version_number INTEGER DEFAULT 1,
  version_history TEXT,
  created_by INTEGER,
  updated_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- Web Asset Fields
  web_title TEXT,
  web_description TEXT,
  web_meta_description TEXT,
  web_keywords TEXT,
  web_url TEXT,
  web_h1 TEXT,
  web_h2_1 TEXT,
  web_h2_2 TEXT,
  web_h3_tags TEXT,
  web_thumbnail TEXT,
  web_body_content TEXT,
  seo_title TEXT,
  seo_meta_title TEXT,
  seo_description TEXT,
  seo_service_url TEXT,
  seo_blog_url TEXT,
  seo_anchor_text TEXT,
  -- SMM Fields
  smm_platform TEXT,
  smm_title TEXT,
  smm_tag TEXT,
  smm_url TEXT,
  smm_description TEXT,
  smm_hashtags TEXT,
  smm_media_url TEXT,
  smm_media_type TEXT,
  -- SEO Scores
  seo_score INTEGER,
  grammar_score INTEGER,
  ai_plagiarism_score INTEGER,
  -- SEO Asset Fields
  seo_primary_keyword_id INTEGER,
  seo_lsi_keywords TEXT,
  seo_domain_type TEXT,
  seo_domains TEXT,
  seo_blog_content TEXT,
  seo_sector_id INTEGER,
  seo_industry_id INTEGER,
  -- Linking Fields
  linked_task_id INTEGER,
  linked_campaign_id INTEGER,
  linked_project_id INTEGER,
  linked_service_id INTEGER,
  linked_sub_service_id INTEGER,
  linked_repository_item_id INTEGER,
  linked_service_ids TEXT,
  linked_sub_service_ids TEXT,
  -- Additional Fields
  designed_by INTEGER,
  published_by INTEGER,
  verified_by INTEGER,
  published_at DATETIME,
  og_image_url TEXT,
  file_size INTEGER,
  file_type TEXT,
  dimensions TEXT,
  keywords TEXT,
  content_keywords TEXT,
  seo_keywords TEXT,
  static_service_links TEXT,
  resource_files TEXT,
  content_type TEXT,
  usage_status TEXT,
  assigned_team_members TEXT,
  application_type TEXT,
  asset_website_usage TEXT,
  asset_social_media_usage TEXT,
  asset_backlink_usage TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  FOREIGN KEY (qc_reviewer_id) REFERENCES users(id),
  FOREIGN KEY (submitted_by) REFERENCES users(id),
  FOREIGN KEY (designed_by) REFERENCES users(id),
  FOREIGN KEY (published_by) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id),
  FOREIGN KEY (linked_campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY (linked_project_id) REFERENCES projects(id),
  FOREIGN KEY (linked_service_id) REFERENCES services(id),
  FOREIGN KEY (linked_sub_service_id) REFERENCES sub_services(id)
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

-- Asset Category Master
CREATE TABLE IF NOT EXISTS asset_category_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT UNIQUE NOT NULL,
  category_code TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Asset Type Master
CREATE TABLE IF NOT EXISTS asset_type_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_type_name TEXT UNIQUE NOT NULL,
  type_name TEXT,
  type_code TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Asset Format Master
CREATE TABLE IF NOT EXISTS asset_formats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  format_name TEXT UNIQUE NOT NULL,
  format_code TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service-Asset Linking
CREATE TABLE IF NOT EXISTS service_asset_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  asset_id INTEGER NOT NULL,
  link_type TEXT DEFAULT 'primary',
  is_static INTEGER DEFAULT 0,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(service_id, asset_id)
);

-- Sub-Service-Asset Linking
CREATE TABLE IF NOT EXISTS subservice_asset_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sub_service_id INTEGER NOT NULL,
  asset_id INTEGER NOT NULL,
  link_type TEXT DEFAULT 'primary',
  is_static INTEGER DEFAULT 0,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sub_service_id) REFERENCES sub_services(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(sub_service_id, asset_id)
);

-- Keyword-Asset Linking
CREATE TABLE IF NOT EXISTS keyword_asset_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword_id INTEGER NOT NULL,
  asset_id INTEGER NOT NULL,
  link_type TEXT DEFAULT 'primary',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  UNIQUE(keyword_id, asset_id)
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

-- Keywords table (referenced by keyword-asset linking)
CREATE TABLE IF NOT EXISTS keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT,
  keyword_name TEXT UNIQUE NOT NULL,
  keyword_code TEXT,
  keyword_id TEXT,
  keyword_intent TEXT,
  keyword_type TEXT,
  language TEXT,
  search_volume INTEGER,
  difficulty_score INTEGER,
  mapped_service_id INTEGER,
  mapped_service TEXT,
  mapped_sub_service_id INTEGER,
  mapped_sub_service TEXT,
  keyword_category TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mapped_service_id) REFERENCES services(id),
  FOREIGN KEY (mapped_sub_service_id) REFERENCES sub_services(id)
);

-- Workflow Stages
CREATE TABLE IF NOT EXISTS workflow_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stage_name TEXT UNIQUE NOT NULL,
  stage_code TEXT,
  sequence INTEGER,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Platforms (for SMM)
CREATE TABLE IF NOT EXISTS platforms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_name TEXT UNIQUE NOT NULL,
  platform_code TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Countries
CREATE TABLE IF NOT EXISTS countries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  country_name TEXT UNIQUE NOT NULL,
  country_code TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SEO Error Types
CREATE TABLE IF NOT EXISTS seo_error_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_type TEXT UNIQUE NOT NULL,
  error_code TEXT,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

-- Indexes for Asset Linking Tables
CREATE INDEX IF NOT EXISTS idx_service_asset_links_service_id ON service_asset_links(service_id);
CREATE INDEX IF NOT EXISTS idx_service_asset_links_asset_id ON service_asset_links(asset_id);
CREATE INDEX IF NOT EXISTS idx_subservice_asset_links_sub_service_id ON subservice_asset_links(sub_service_id);
CREATE INDEX IF NOT EXISTS idx_subservice_asset_links_asset_id ON subservice_asset_links(asset_id);
CREATE INDEX IF NOT EXISTS idx_keyword_asset_links_keyword_id ON keyword_asset_links(keyword_id);
CREATE INDEX IF NOT EXISTS idx_keyword_asset_links_asset_id ON keyword_asset_links(asset_id);
CREATE INDEX IF NOT EXISTS idx_sub_services_service_id ON sub_services(service_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_qc_status ON assets(qc_status);
CREATE INDEX IF NOT EXISTS idx_assets_workflow_stage ON assets(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_assets_linked_service_id ON assets(linked_service_id);
CREATE INDEX IF NOT EXISTS idx_assets_linked_sub_service_id ON assets(linked_sub_service_id);
CREATE INDEX IF NOT EXISTS idx_assets_application_type ON assets(application_type);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_mapped_service_id ON keywords(mapped_service_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_sub_services_status ON sub_services(status);
CREATE INDEX IF NOT EXISTS idx_sub_services_slug ON sub_services(slug);


-- Backlink Sources
CREATE TABLE IF NOT EXISTS backlink_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL,
  backlink_url TEXT,
  backlink_category TEXT,
  niche_industry TEXT,
  da_score INTEGER DEFAULT 0,
  spam_score INTEGER DEFAULT 0,
  pricing TEXT DEFAULT 'Free',
  country TEXT,
  username TEXT,
  password TEXT,
  credentials_notes TEXT,
  status TEXT DEFAULT 'active',
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Backlink Submissions
CREATE TABLE IF NOT EXISTS backlink_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT,
  opportunity_type TEXT,
  category TEXT,
  target_url TEXT,
  anchor_text TEXT,
  content_used TEXT,
  da_score INTEGER,
  spam_score INTEGER,
  country TEXT,
  service_id INTEGER,
  sub_service_id INTEGER,
  seo_owner_id INTEGER,
  is_paid INTEGER DEFAULT 0,
  submission_status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (sub_service_id) REFERENCES sub_services(id),
  FOREIGN KEY (seo_owner_id) REFERENCES users(id)
);

-- Toxic Backlinks
CREATE TABLE IF NOT EXISTS toxic_backlinks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT,
  toxic_url TEXT,
  backlink_url TEXT NOT NULL,
  landing_page TEXT,
  anchor_text TEXT,
  spam_score REAL,
  dr INTEGER,
  dr_type TEXT,
  severity TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Pending',
  assigned_to_id INTEGER,
  service_id INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Competitor Backlinks
CREATE TABLE IF NOT EXISTS competitor_backlinks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competitor_domain TEXT,
  backlink_url TEXT,
  source_domain TEXT,
  anchor_text TEXT,
  domain_authority INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- On-Page SEO Audits
CREATE TABLE IF NOT EXISTS on_page_seo_audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT,
  service_id INTEGER,
  sub_service_id INTEGER,
  error_type TEXT NOT NULL,
  error_category TEXT,
  severity TEXT DEFAULT 'Medium',
  issue_description TEXT,
  current_value TEXT,
  recommended_value TEXT,
  linked_campaign_id INTEGER,
  status TEXT DEFAULT 'Open',
  assigned_to_id INTEGER,
  created_by INTEGER,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  resolution_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (sub_service_id) REFERENCES sub_services(id),
  FOREIGN KEY (linked_campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY (assigned_to_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- UX Issues
CREATE TABLE IF NOT EXISTS ux_issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  issue_title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  issue_type TEXT,
  device TEXT,
  severity TEXT DEFAULT 'Medium',
  source TEXT,
  screenshot_url TEXT,
  assigned_to_id INTEGER,
  service_id INTEGER,
  status TEXT DEFAULT 'open',
  resolution_notes TEXT,
  priority_score INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- URL Errors
CREATE TABLE IF NOT EXISTS url_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  error_type TEXT,
  severity TEXT,
  description TEXT,
  service_id INTEGER,
  sub_service_id INTEGER,
  linked_campaign_id INTEGER,
  assigned_to_id INTEGER,
  status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (sub_service_id) REFERENCES sub_services(id),
  FOREIGN KEY (linked_campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY (assigned_to_id) REFERENCES users(id)
);

-- SMM Posts
CREATE TABLE IF NOT EXISTS smm_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  smm_type TEXT,
  content_type TEXT,
  primary_platform TEXT,
  smm_status TEXT DEFAULT 'draft',
  schedule_date DATE,
  schedule_time TIME,
  caption TEXT,
  hashtags TEXT,
  asset_url TEXT,
  asset_count INTEGER,
  service_id INTEGER,
  sub_service_id INTEGER,
  assigned_to_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (sub_service_id) REFERENCES sub_services(id),
  FOREIGN KEY (assigned_to_id) REFERENCES users(id)
);

-- Service Pages
CREATE TABLE IF NOT EXISTS service_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_title TEXT NOT NULL,
  url TEXT,
  url_slug TEXT,
  page_type TEXT,
  service_id INTEGER,
  sub_service_id INTEGER,
  industry TEXT,
  target_keyword TEXT,
  primary_keyword TEXT,
  seo_score INTEGER,
  audit_score INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
);

-- SEO Asset Domains
CREATE TABLE IF NOT EXISTS seo_asset_domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seo_asset_id INTEGER,
  domain_name TEXT,
  domain_type TEXT,
  url_posted TEXT,
  seo_self_qc_status TEXT,
  qa_status TEXT,
  approval_status TEXT,
  display_status TEXT,
  backlink_source_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seo_asset_id) REFERENCES assets(id),
  FOREIGN KEY (backlink_source_id) REFERENCES backlink_sources(id)
);

-- QC Runs
CREATE TABLE IF NOT EXISTS qc_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT,
  target_id INTEGER,
  qc_status TEXT,
  qc_owner_id INTEGER,
  qc_checklist_version_id INTEGER,
  final_score_percentage REAL,
  analysis_report TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (qc_owner_id) REFERENCES users(id),
  FOREIGN KEY (qc_checklist_version_id) REFERENCES qc_checklist_versions(id)
);

-- QC Checklists
CREATE TABLE IF NOT EXISTS qc_checklists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checklist_name TEXT NOT NULL,
  checklist_type TEXT,
  category TEXT,
  number_of_items INTEGER,
  scoring_mode TEXT,
  pass_threshold REAL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- QC Checklist Versions
CREATE TABLE IF NOT EXISTS qc_checklist_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checklist_id INTEGER,
  version_number INTEGER,
  items TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (checklist_id) REFERENCES qc_checklists(id)
);

-- QC Weightage Configs
CREATE TABLE IF NOT EXISTS qc_weightage_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  type TEXT,
  weight REAL,
  mandatory INTEGER DEFAULT 0,
  stage TEXT,
  asset_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- OKRs
CREATE TABLE IF NOT EXISTS okrs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objective TEXT NOT NULL,
  type TEXT,
  cycle TEXT,
  owner TEXT,
  alignment TEXT,
  progress REAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Competitor Benchmarks
CREATE TABLE IF NOT EXISTS competitor_benchmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competitor_name TEXT NOT NULL,
  competitor_domain TEXT,
  monthly_traffic INTEGER,
  total_keywords INTEGER,
  backlinks INTEGER,
  ranking_coverage REAL,
  status TEXT DEFAULT 'active',
  updated_on DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gold Standards
CREATE TABLE IF NOT EXISTS gold_standards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  category TEXT,
  value REAL,
  range TEXT,
  unit TEXT,
  evidence TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Effort Targets
CREATE TABLE IF NOT EXISTS effort_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  category TEXT,
  metric TEXT,
  monthly INTEGER,
  weekly INTEGER,
  daily INTEGER,
  weightage REAL,
  rules TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Personas
CREATE TABLE IF NOT EXISTS personas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  persona_name TEXT NOT NULL,
  description TEXT,
  demographics TEXT,
  goals TEXT,
  pain_points TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Forms
CREATE TABLE IF NOT EXISTS forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_name TEXT NOT NULL,
  form_type TEXT,
  fields TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'inactive',
  api_key TEXT,
  api_secret TEXT,
  config TEXT,
  last_sync_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Integration Logs
CREATE TABLE IF NOT EXISTS integration_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  integration_id INTEGER,
  event TEXT,
  status TEXT,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (integration_id) REFERENCES integrations(id)
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lead_user_id INTEGER,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_user_id) REFERENCES users(id)
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER,
  user_id INTEGER,
  role_in_team TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Graphic Assets
CREATE TABLE IF NOT EXISTS graphic_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_name TEXT NOT NULL,
  asset_type TEXT,
  file_url TEXT,
  dimensions TEXT,
  file_format TEXT,
  file_size_kb INTEGER,
  tags TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Articles
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  tags TEXT,
  language TEXT,
  author_id INTEGER,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Compliance Rules
CREATE TABLE IF NOT EXISTS compliance_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  severity TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Audits
CREATE TABLE IF NOT EXISTS compliance_audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT,
  target_id INTEGER,
  score REAL,
  violations TEXT,
  audited_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Employee Evaluations
CREATE TABLE IF NOT EXISTS employee_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  evaluation_period TEXT,
  overall_score REAL,
  performance_metrics TEXT,
  ai_analysis TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Employee Skills
CREATE TABLE IF NOT EXISTS employee_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  skill_name TEXT,
  skill_category TEXT,
  score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Employee Achievements
CREATE TABLE IF NOT EXISTS employee_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  achievement_title TEXT,
  achievement_description TEXT,
  date_awarded DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Reward Recommendations
CREATE TABLE IF NOT EXISTS reward_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  recommendation_type TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Voice Profiles
CREATE TABLE IF NOT EXISTS voice_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  voice_id TEXT,
  language TEXT,
  gender TEXT,
  provider TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Call Logs
CREATE TABLE IF NOT EXISTS call_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER,
  customer_phone TEXT,
  duration INTEGER,
  sentiment TEXT,
  recording_url TEXT,
  summary TEXT,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES users(id)
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  is_enabled INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Missing Indexes for New Tables
CREATE INDEX IF NOT EXISTS idx_backlink_sources_status ON backlink_sources(status);
CREATE INDEX IF NOT EXISTS idx_backlink_sources_created_by ON backlink_sources(created_by);
CREATE INDEX IF NOT EXISTS idx_backlink_submissions_service_id ON backlink_submissions(service_id);
CREATE INDEX IF NOT EXISTS idx_backlink_submissions_sub_service_id ON backlink_submissions(sub_service_id);
CREATE INDEX IF NOT EXISTS idx_backlink_submissions_seo_owner_id ON backlink_submissions(seo_owner_id);
CREATE INDEX IF NOT EXISTS idx_toxic_backlinks_service_id ON toxic_backlinks(service_id);
CREATE INDEX IF NOT EXISTS idx_toxic_backlinks_assigned_to_id ON toxic_backlinks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_on_page_seo_audits_service_id ON on_page_seo_audits(service_id);
CREATE INDEX IF NOT EXISTS idx_on_page_seo_audits_severity ON on_page_seo_audits(severity);
CREATE INDEX IF NOT EXISTS idx_on_page_seo_audits_assigned_to_id ON on_page_seo_audits(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_ux_issues_service_id ON ux_issues(service_id);
CREATE INDEX IF NOT EXISTS idx_ux_issues_assigned_to_id ON ux_issues(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_url_errors_service_id ON url_errors(service_id);
CREATE INDEX IF NOT EXISTS idx_url_errors_assigned_to_id ON url_errors(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_smm_posts_service_id ON smm_posts(service_id);
CREATE INDEX IF NOT EXISTS idx_smm_posts_assigned_to_id ON smm_posts(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_service_pages_service_id ON service_pages(service_id);
CREATE INDEX IF NOT EXISTS idx_seo_asset_domains_seo_asset_id ON seo_asset_domains(seo_asset_id);
CREATE INDEX IF NOT EXISTS idx_qc_runs_target_type ON qc_runs(target_type);
CREATE INDEX IF NOT EXISTS idx_qc_runs_qc_owner_id ON qc_runs(qc_owner_id);
CREATE INDEX IF NOT EXISTS idx_qc_checklist_versions_checklist_id ON qc_checklist_versions(checklist_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_evaluations_employee_id ON employee_evaluations(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_employee_id ON employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_achievements_employee_id ON employee_achievements(employee_id);
CREATE INDEX IF NOT EXISTS idx_reward_recommendations_employee_id ON reward_recommendations(employee_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_agent_id ON call_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON integration_logs(integration_id);
