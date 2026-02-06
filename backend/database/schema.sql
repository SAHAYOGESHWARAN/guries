-- PostgreSQL Database Schema for Marketing Control Center
-- Complete schema with all fields from codebase analysis
-- Compatible with Supabase and Vercel serverless

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  password_hash TEXT,
  department TEXT,
  country TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  code TEXT,
  industry TEXT,
  website TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  service_name TEXT NOT NULL,
  service_code TEXT,
  slug TEXT,
  status TEXT DEFAULT 'draft',
  meta_title TEXT,
  meta_description TEXT,
  h1 TEXT,
  h2_list TEXT,
  h3_list TEXT,
  h4_list TEXT,
  h5_list TEXT,
  body_content TEXT,
  internal_links TEXT,
  external_links TEXT,
  image_alt_texts TEXT,
  focus_keywords TEXT,
  secondary_keywords TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  robots_index TEXT,
  robots_follow TEXT,
  canonical_url TEXT,
  word_count INTEGER,
  reading_time_minutes INTEGER,
  version_number INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sub-Services table
CREATE TABLE IF NOT EXISTS sub_services (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  sub_service_name TEXT NOT NULL,
  sub_service_code TEXT,
  slug TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft',
  parent_service_id INTEGER REFERENCES services(id),
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
  robots_index TEXT,
  robots_follow TEXT,
  canonical_url TEXT,
  word_count INTEGER,
  reading_time_minutes INTEGER,
  version_number INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keywords table
CREATE TABLE IF NOT EXISTS keywords (
  id SERIAL PRIMARY KEY,
  keyword TEXT,
  keyword_name TEXT UNIQUE NOT NULL,
  keyword_code TEXT,
  keyword_id TEXT,
  keyword_intent TEXT,
  keyword_type TEXT,
  language TEXT,
  search_volume INTEGER,
  difficulty_score INTEGER,
  mapped_service_id INTEGER REFERENCES services(id),
  mapped_service TEXT,
  mapped_sub_service_id INTEGER REFERENCES sub_services(id),
  mapped_sub_service TEXT,
  keyword_category TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets table (comprehensive with all fields)
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
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
  submitted_by INTEGER REFERENCES users(id),
  submitted_at TIMESTAMP,
  qc_reviewer_id INTEGER REFERENCES users(id),
  qc_reviewed_at TIMESTAMP,
  qc_remarks TEXT,
  qc_checklist_completion INTEGER,
  linking_active INTEGER DEFAULT 0,
  rework_count INTEGER DEFAULT 0,
  workflow_log TEXT,
  workflow_stage TEXT DEFAULT 'draft',
  version_number INTEGER DEFAULT 1,
  version_history TEXT,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
  smm_platform TEXT,
  smm_title TEXT,
  smm_tag TEXT,
  smm_url TEXT,
  smm_description TEXT,
  smm_hashtags TEXT,
  smm_media_url TEXT,
  smm_media_type TEXT,
  seo_score INTEGER,
  grammar_score INTEGER,
  ai_plagiarism_score INTEGER,
  seo_primary_keyword_id INTEGER REFERENCES keywords(id),
  seo_lsi_keywords TEXT,
  seo_domain_type TEXT,
  seo_domains TEXT,
  seo_blog_content TEXT,
  seo_sector_id INTEGER,
  seo_industry_id INTEGER,
  linked_task_id INTEGER,
  linked_campaign_id INTEGER,
  linked_project_id INTEGER,
  linked_service_id INTEGER REFERENCES services(id),
  linked_sub_service_id INTEGER REFERENCES sub_services(id),
  linked_repository_item_id INTEGER,
  linked_service_ids TEXT,
  linked_sub_service_ids TEXT,
  designed_by INTEGER REFERENCES users(id),
  published_by INTEGER REFERENCES users(id),
  verified_by INTEGER REFERENCES users(id),
  published_at TIMESTAMP,
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
  asset_backlink_usage TEXT
);

-- Asset QC Reviews
CREATE TABLE IF NOT EXISTS asset_qc_reviews (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  qc_reviewer_id INTEGER REFERENCES users(id),
  qc_score INTEGER,
  checklist_completion INTEGER,
  qc_remarks TEXT,
  qc_decision TEXT,
  checklist_items TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QC Audit Log
CREATE TABLE IF NOT EXISTS qc_audit_log (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50),
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Status Log
CREATE TABLE IF NOT EXISTS asset_status_log (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  status TEXT,
  changed_by INTEGER REFERENCES users(id),
  change_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT,
  message TEXT,
  type TEXT,
  is_read INTEGER DEFAULT 0,
  link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Category Master
CREATE TABLE IF NOT EXISTS asset_category_master (
  id SERIAL PRIMARY KEY,
  category_name TEXT UNIQUE NOT NULL,
  category_code TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Type Master
CREATE TABLE IF NOT EXISTS asset_type_master (
  id SERIAL PRIMARY KEY,
  asset_type_name TEXT UNIQUE NOT NULL,
  type_name TEXT,
  type_code TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Formats
CREATE TABLE IF NOT EXISTS asset_formats (
  id SERIAL PRIMARY KEY,
  format_name TEXT UNIQUE NOT NULL,
  format_code TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service-Asset Linking
CREATE TABLE IF NOT EXISTS service_asset_links (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  link_type TEXT DEFAULT 'primary',
  is_static INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_id, asset_id)
);

-- Sub-Service-Asset Linking
CREATE TABLE IF NOT EXISTS subservice_asset_links (
  id SERIAL PRIMARY KEY,
  sub_service_id INTEGER NOT NULL REFERENCES sub_services(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  link_type TEXT DEFAULT 'primary',
  is_static INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sub_service_id, asset_id)
);

-- Keyword-Asset Linking
CREATE TABLE IF NOT EXISTS keyword_asset_links (
  id SERIAL PRIMARY KEY,
  keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  link_type TEXT DEFAULT 'primary',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(keyword_id, asset_id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  project_name TEXT NOT NULL,
  project_code TEXT UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'Planned',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  owner_id INTEGER REFERENCES users(id),
  brand_id INTEGER REFERENCES brands(id),
  linked_service_id INTEGER REFERENCES services(id),
  priority TEXT DEFAULT 'Medium',
  sub_services TEXT,
  outcome_kpis TEXT,
  expected_outcome TEXT,
  team_members TEXT,
  weekly_report INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT DEFAULT 'Content',
  status TEXT DEFAULT 'planning',
  description TEXT,
  campaign_start_date DATE,
  campaign_end_date DATE,
  campaign_owner_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  brand_id INTEGER REFERENCES brands(id),
  linked_service_ids TEXT,
  target_url TEXT,
  backlinks_planned INTEGER DEFAULT 0,
  backlinks_completed INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_total INTEGER DEFAULT 0,
  kpi_score INTEGER DEFAULT 0,
  sub_campaigns TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  task_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'Medium',
  assigned_to INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  campaign_id INTEGER REFERENCES campaigns(id),
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backlink Sources
CREATE TABLE IF NOT EXISTS backlink_sources (
  id SERIAL PRIMARY KEY,
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
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backlink Submissions
CREATE TABLE IF NOT EXISTS backlink_submissions (
  id SERIAL PRIMARY KEY,
  domain TEXT,
  opportunity_type TEXT,
  category TEXT,
  target_url TEXT,
  anchor_text TEXT,
  content_used TEXT,
  da_score INTEGER,
  spam_score INTEGER,
  country TEXT,
  service_id INTEGER REFERENCES services(id),
  sub_service_id INTEGER REFERENCES sub_services(id),
  seo_owner_id INTEGER REFERENCES users(id),
  is_paid INTEGER DEFAULT 0,
  submission_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Toxic Backlinks
CREATE TABLE IF NOT EXISTS toxic_backlinks (
  id SERIAL PRIMARY KEY,
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
  assigned_to_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competitor Backlinks
CREATE TABLE IF NOT EXISTS competitor_backlinks (
  id SERIAL PRIMARY KEY,
  competitor_domain TEXT,
  backlink_url TEXT,
  source_domain TEXT,
  anchor_text TEXT,
  domain_authority INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- On-Page SEO Audits
CREATE TABLE IF NOT EXISTS on_page_seo_audits (
  id SERIAL PRIMARY KEY,
  url TEXT,
  service_id INTEGER REFERENCES services(id),
  sub_service_id INTEGER REFERENCES sub_services(id),
  error_type TEXT NOT NULL,
  error_category TEXT,
  severity TEXT DEFAULT 'Medium',
  issue_description TEXT,
  current_value TEXT,
  recommended_value TEXT,
  linked_campaign_id INTEGER REFERENCES campaigns(id),
  status TEXT DEFAULT 'Open',
  assigned_to_id INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id),
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UX Issues
CREATE TABLE IF NOT EXISTS ux_issues (
  id SERIAL PRIMARY KEY,
  title TEXT,
  issue_title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  issue_type TEXT,
  device TEXT,
  severity TEXT DEFAULT 'Medium',
  source TEXT,
  screenshot_url TEXT,
  assigned_to_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id),
  status TEXT DEFAULT 'open',
  resolution_notes TEXT,
  priority_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- URL Errors
CREATE TABLE IF NOT EXISTS url_errors (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  error_type TEXT,
  severity TEXT,
  description TEXT,
  service_id INTEGER REFERENCES services(id),
  sub_service_id INTEGER REFERENCES sub_services(id),
  linked_campaign_id INTEGER REFERENCES campaigns(id),
  assigned_to_id INTEGER REFERENCES users(id),
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMM Posts
CREATE TABLE IF NOT EXISTS smm_posts (
  id SERIAL PRIMARY KEY,
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
  service_id INTEGER REFERENCES services(id),
  sub_service_id INTEGER REFERENCES sub_services(id),
  assigned_to_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Pages
CREATE TABLE IF NOT EXISTS service_pages (
  id SERIAL PRIMARY KEY,
  page_title TEXT NOT NULL,
  url TEXT,
  url_slug TEXT,
  page_type TEXT,
  service_id INTEGER REFERENCES services(id),
  sub_service_id INTEGER REFERENCES sub_services(id),
  industry TEXT,
  target_keyword TEXT,
  primary_keyword TEXT,
  seo_score INTEGER,
  audit_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Asset Domains
CREATE TABLE IF NOT EXISTS seo_asset_domains (
  id SERIAL PRIMARY KEY,
  seo_asset_id INTEGER REFERENCES assets(id),
  domain_name TEXT,
  domain_type TEXT,
  url_posted TEXT,
  seo_self_qc_status TEXT,
  qa_status TEXT,
  approval_status TEXT,
  display_status TEXT,
  backlink_source_id INTEGER REFERENCES backlink_sources(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QC Checklists
CREATE TABLE IF NOT EXISTS qc_checklists (
  id SERIAL PRIMARY KEY,
  checklist_name TEXT NOT NULL,
  checklist_type TEXT,
  category TEXT,
  number_of_items INTEGER,
  scoring_mode TEXT,
  pass_threshold REAL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QC Checklist Versions
CREATE TABLE IF NOT EXISTS qc_checklist_versions (
  id SERIAL PRIMARY KEY,
  checklist_id INTEGER REFERENCES qc_checklists(id),
  version_number INTEGER,
  items TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QC Runs
CREATE TABLE IF NOT EXISTS qc_runs (
  id SERIAL PRIMARY KEY,
  target_type TEXT,
  target_id INTEGER,
  qc_status TEXT,
  qc_owner_id INTEGER REFERENCES users(id),
  qc_checklist_version_id INTEGER REFERENCES qc_checklist_versions(id),
  final_score_percentage REAL,
  analysis_report TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QC Weightage Configs
CREATE TABLE IF NOT EXISTS qc_weightage_configs (
  id SERIAL PRIMARY KEY,
  name TEXT,
  type TEXT,
  weight REAL,
  mandatory INTEGER DEFAULT 0,
  stage TEXT,
  asset_type TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competitor Benchmarks
CREATE TABLE IF NOT EXISTS competitor_benchmarks (
  id SERIAL PRIMARY KEY,
  competitor_name TEXT NOT NULL,
  competitor_domain TEXT,
  monthly_traffic INTEGER,
  total_keywords INTEGER,
  backlinks INTEGER,
  ranking_coverage REAL,
  status TEXT DEFAULT 'active',
  updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gold Standards
CREATE TABLE IF NOT EXISTS gold_standards (
  id SERIAL PRIMARY KEY,
  metric_name TEXT NOT NULL,
  category TEXT,
  value REAL,
  range TEXT,
  unit TEXT,
  evidence TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Effort Targets
CREATE TABLE IF NOT EXISTS effort_targets (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  category TEXT,
  metric TEXT,
  monthly INTEGER,
  weekly INTEGER,
  daily INTEGER,
  weightage REAL,
  rules TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OKRs
CREATE TABLE IF NOT EXISTS okrs (
  id SERIAL PRIMARY KEY,
  objective TEXT NOT NULL,
  type TEXT,
  cycle TEXT,
  owner TEXT,
  alignment TEXT,
  progress REAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personas
CREATE TABLE IF NOT EXISTS personas (
  id SERIAL PRIMARY KEY,
  persona_name TEXT NOT NULL,
  description TEXT,
  demographics TEXT,
  goals TEXT,
  pain_points TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forms
CREATE TABLE IF NOT EXISTS forms (
  id SERIAL PRIMARY KEY,
  form_name TEXT NOT NULL,
  form_type TEXT,
  fields TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  lead_user_id INTEGER REFERENCES users(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  user_id INTEGER REFERENCES users(id),
  role_in_team TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Graphic Assets
CREATE TABLE IF NOT EXISTS graphic_assets (
  id SERIAL PRIMARY KEY,
  asset_name TEXT NOT NULL,
  asset_type TEXT,
  file_url TEXT,
  dimensions TEXT,
  file_format TEXT,
  file_size_kb INTEGER,
  tags TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Articles
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  tags TEXT,
  language TEXT,
  author_id INTEGER REFERENCES users(id),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Rules
CREATE TABLE IF NOT EXISTS compliance_rules (
  id SERIAL PRIMARY KEY,
  rule_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  severity TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Audits
CREATE TABLE IF NOT EXISTS compliance_audits (
  id SERIAL PRIMARY KEY,
  audit_name TEXT NOT NULL,
  audit_type TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'inactive',
  api_key TEXT,
  api_secret TEXT,
  config TEXT,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integration Logs
CREATE TABLE IF NOT EXISTS integration_logs (
  id SERIAL PRIMARY KEY,
  integration_id INTEGER REFERENCES integrations(id),
  event TEXT,
  status TEXT,
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Stages
CREATE TABLE IF NOT EXISTS workflow_stages (
  id SERIAL PRIMARY KEY,
  stage_name TEXT UNIQUE NOT NULL,
  stage_code TEXT,
  sequence INTEGER,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platforms (for SMM)
CREATE TABLE IF NOT EXISTS platforms (
  id SERIAL PRIMARY KEY,
  platform_name TEXT UNIQUE NOT NULL,
  platform_code TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Countries
CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  country_name TEXT UNIQUE NOT NULL,
  country_code TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Error Types
CREATE TABLE IF NOT EXISTS seo_error_types (
  id SERIAL PRIMARY KEY,
  error_type TEXT UNIQUE NOT NULL,
  error_code TEXT,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_qc_status ON assets(qc_status);
CREATE INDEX IF NOT EXISTS idx_assets_workflow_stage ON assets(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_assets_linked_service_id ON assets(linked_service_id);
CREATE INDEX IF NOT EXISTS idx_assets_linked_sub_service_id ON assets(linked_sub_service_id);
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON assets(created_by);
CREATE INDEX IF NOT EXISTS idx_assets_application_type ON assets(application_type);
CREATE INDEX IF NOT EXISTS idx_asset_qc_reviews_asset_id ON asset_qc_reviews(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_qc_reviews_qc_reviewer_id ON asset_qc_reviews(qc_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_qc_audit_log_asset_id ON qc_audit_log(asset_id);
CREATE INDEX IF NOT EXISTS idx_qc_audit_log_user_id ON qc_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_status_log_asset_id ON asset_status_log(asset_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_brand_id ON projects(brand_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_owner_id ON campaigns(campaign_owner_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_campaign_id ON tasks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_service_asset_links_service_id ON service_asset_links(service_id);
CREATE INDEX IF NOT EXISTS idx_service_asset_links_asset_id ON service_asset_links(asset_id);
CREATE INDEX IF NOT EXISTS idx_subservice_asset_links_sub_service_id ON subservice_asset_links(sub_service_id);
CREATE INDEX IF NOT EXISTS idx_subservice_asset_links_asset_id ON subservice_asset_links(asset_id);
CREATE INDEX IF NOT EXISTS idx_keyword_asset_links_keyword_id ON keyword_asset_links(keyword_id);
CREATE INDEX IF NOT EXISTS idx_keyword_asset_links_asset_id ON keyword_asset_links(asset_id);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_mapped_service_id ON keywords(mapped_service_id);
CREATE INDEX IF NOT EXISTS idx_keywords_mapped_sub_service_id ON keywords(mapped_sub_service_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_sub_services_service_id ON sub_services(service_id);
CREATE INDEX IF NOT EXISTS idx_sub_services_status ON sub_services(status);
CREATE INDEX IF NOT EXISTS idx_sub_services_slug ON sub_services(slug);
CREATE INDEX IF NOT EXISTS idx_backlink_sources_domain ON backlink_sources(domain);
CREATE INDEX IF NOT EXISTS idx_backlink_submissions_service_id ON backlink_submissions(service_id);
CREATE INDEX IF NOT EXISTS idx_backlink_submissions_status ON backlink_submissions(submission_status);
CREATE INDEX IF NOT EXISTS idx_toxic_backlinks_service_id ON toxic_backlinks(service_id);
CREATE INDEX IF NOT EXISTS idx_toxic_backlinks_status ON toxic_backlinks(status);
CREATE INDEX IF NOT EXISTS idx_on_page_seo_audits_service_id ON on_page_seo_audits(service_id);
CREATE INDEX IF NOT EXISTS idx_on_page_seo_audits_status ON on_page_seo_audits(status);
CREATE INDEX IF NOT EXISTS idx_ux_issues_service_id ON ux_issues(service_id);
CREATE INDEX IF NOT EXISTS idx_ux_issues_status ON ux_issues(status);
CREATE INDEX IF NOT EXISTS idx_url_errors_service_id ON url_errors(service_id);
CREATE INDEX IF NOT EXISTS idx_url_errors_status ON url_errors(status);
CREATE INDEX IF NOT EXISTS idx_smm_posts_service_id ON smm_posts(service_id);
CREATE INDEX IF NOT EXISTS idx_smm_posts_status ON smm_posts(smm_status);
CREATE INDEX IF NOT EXISTS idx_service_pages_service_id ON service_pages(service_id);
CREATE INDEX IF NOT EXISTS idx_seo_asset_domains_seo_asset_id ON seo_asset_domains(seo_asset_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status);
