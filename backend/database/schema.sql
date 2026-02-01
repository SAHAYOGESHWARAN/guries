-- ============================================================================
-- Marketing Control Center - PostgreSQL Database Schema
-- ============================================================================
-- Complete production-ready schema for all modules
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    department VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website_url VARCHAR(255),
    industry VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lead_user_id INTEGER REFERENCES users(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_team VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- ============================================================================
-- PROJECTS & CAMPAIGNS
-- ============================================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_code VARCHAR(50) UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Planned',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15, 2),
    owner_id INTEGER REFERENCES users(id),
    brand_id INTEGER REFERENCES brands(id),
    linked_service_id INTEGER,
    priority VARCHAR(50) DEFAULT 'Medium',
    sub_services TEXT,
    outcome_kpis TEXT,
    expected_outcome TEXT,
    team_members TEXT,
    weekly_report BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'planning',
    description TEXT,
    campaign_start_date DATE,
    campaign_end_date DATE,
    campaign_owner_id INTEGER REFERENCES users(id),
    sub_campaigns TEXT,
    linked_service_ids TEXT,
    target_url VARCHAR(255),
    project_id INTEGER REFERENCES projects(id),
    brand_id INTEGER REFERENCES brands(id),
    backlinks_planned INTEGER DEFAULT 0,
    backlinks_completed INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_total INTEGER DEFAULT 0,
    kpi_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SERVICES & SUB-SERVICES
-- ============================================================================

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    service_code VARCHAR(50) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sub-services table
CREATE TABLE IF NOT EXISTS sub_services (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    sub_service_name VARCHAR(255) NOT NULL,
    description TEXT,
    meta_keywords TEXT,
    meta_description TEXT,
    content_sections TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service pages table
CREATE TABLE IF NOT EXISTS service_pages (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id),
    sub_service_id INTEGER REFERENCES sub_services(id),
    page_title VARCHAR(255),
    page_url VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    content TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ASSETS
-- ============================================================================

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100),
    asset_category VARCHAR(100),
    asset_format VARCHAR(50),
    content_type VARCHAR(50),
    tags TEXT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Draft',
    usage_status VARCHAR(50) DEFAULT 'Available',
    workflow_stage VARCHAR(50) DEFAULT 'Add',
    qc_status VARCHAR(50),
    file_url TEXT,
    thumbnail_url TEXT,
    file_size_kb INTEGER,
    application_type VARCHAR(50),
    social_meta JSONB,
    linking_active BOOLEAN DEFAULT true,
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset category master table
CREATE TABLE IF NOT EXISTS asset_category_master (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(255) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    word_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand, category_name)
);

-- Asset type master table
CREATE TABLE IF NOT EXISTS asset_type_master (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(255) NOT NULL,
    asset_type_name VARCHAR(255) NOT NULL,
    word_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand, asset_type_name)
);

-- Asset format master table
CREATE TABLE IF NOT EXISTS asset_format_master (
    id SERIAL PRIMARY KEY,
    format_name VARCHAR(100) NOT NULL UNIQUE,
    file_extension VARCHAR(20),
    mime_type VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset usage table
CREATE TABLE IF NOT EXISTS asset_usage (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    used_in_type VARCHAR(50),
    used_in_id INTEGER,
    used_by_user_id INTEGER REFERENCES users(id),
    usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset linking table
CREATE TABLE IF NOT EXISTS asset_linking (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    linked_to_type VARCHAR(50),
    linked_to_id INTEGER,
    link_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Assets table
CREATE TABLE IF NOT EXISTS seo_assets (
    id SERIAL PRIMARY KEY,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100),
    file_url TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    canonical_url VARCHAR(255),
    schema_markup JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Graphic assets table
CREATE TABLE IF NOT EXISTS graphic_assets (
    id SERIAL PRIMARY KEY,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100),
    file_url TEXT,
    dimensions VARCHAR(50),
    file_format VARCHAR(20),
    file_size_kb INTEGER,
    tags TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TASKS & WORKFLOW
-- ============================================================================

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT,
    project_id INTEGER REFERENCES projects(id),
    campaign_id INTEGER REFERENCES campaigns(id),
    assigned_to_id INTEGER REFERENCES users(id),
    created_by_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'Medium',
    due_date DATE,
    start_date DATE,
    estimated_hours DECIMAL(8, 2),
    actual_hours DECIMAL(8, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow stages table
CREATE TABLE IF NOT EXISTS workflow_stages (
    id SERIAL PRIMARY KEY,
    stage_name VARCHAR(100) NOT NULL UNIQUE,
    stage_order INTEGER DEFAULT 0,
    description TEXT,
    color VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow stage master table
CREATE TABLE IF NOT EXISTS workflow_stage_master (
    id SERIAL PRIMARY KEY,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER,
    description TEXT,
    color VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- QUALITY CONTROL (QC)
-- ============================================================================

-- QC checklists table
CREATE TABLE IF NOT EXISTS qc_checklists (
    id SERIAL PRIMARY KEY,
    checklist_name VARCHAR(255) NOT NULL,
    checklist_type VARCHAR(100),
    category VARCHAR(100),
    number_of_items INTEGER,
    scoring_mode VARCHAR(50),
    pass_threshold DECIMAL(5, 2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QC checklist versions table
CREATE TABLE IF NOT EXISTS qc_checklist_versions (
    id SERIAL PRIMARY KEY,
    checklist_id INTEGER NOT NULL REFERENCES qc_checklists(id) ON DELETE CASCADE,
    version_number INTEGER,
    items JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QC runs table
CREATE TABLE IF NOT EXISTS qc_runs (
    id SERIAL PRIMARY KEY,
    target_type VARCHAR(50),
    target_id INTEGER,
    qc_status VARCHAR(50),
    qc_owner_id INTEGER REFERENCES users(id),
    qc_checklist_version_id INTEGER REFERENCES qc_checklist_versions(id),
    final_score_percentage DECIMAL(5, 2),
    analysis_report TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QC audit log table
CREATE TABLE IF NOT EXISTS qc_audit_log (
    id SERIAL PRIMARY KEY,
    qc_run_id INTEGER REFERENCES qc_runs(id),
    action VARCHAR(100),
    details JSONB,
    performed_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QC weightage configs table
CREATE TABLE IF NOT EXISTS qc_weightage_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(100),
    weight DECIMAL(5, 2),
    mandatory BOOLEAN DEFAULT false,
    stage VARCHAR(100),
    asset_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- BACKLINKS & SEO
-- ============================================================================

-- Backlink sources table
CREATE TABLE IF NOT EXISTS backlink_sources (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    source_url VARCHAR(255),
    domain_authority INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backlink submissions table
CREATE TABLE IF NOT EXISTS backlink_submissions (
    id SERIAL PRIMARY KEY,
    backlink_source_id INTEGER REFERENCES backlink_sources(id),
    target_url VARCHAR(255),
    anchor_text_used TEXT,
    content_used TEXT,
    owner_id INTEGER REFERENCES users(id),
    submission_status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Toxic backlinks table
CREATE TABLE IF NOT EXISTS toxic_backlinks (
    id SERIAL PRIMARY KEY,
    backlink_url VARCHAR(255) NOT NULL,
    source_domain VARCHAR(255),
    target_url VARCHAR(255),
    anchor_text TEXT,
    toxicity_score DECIMAL(5, 2),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competitor backlinks table
CREATE TABLE IF NOT EXISTS competitor_backlinks (
    id SERIAL PRIMARY KEY,
    competitor_domain VARCHAR(255),
    backlink_url VARCHAR(255),
    source_domain VARCHAR(255),
    anchor_text TEXT,
    domain_authority INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO error types table
CREATE TABLE IF NOT EXISTS seo_error_types (
    id SERIAL PRIMARY KEY,
    error_type VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    severity VARCHAR(50) DEFAULT 'Medium',
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- On-page SEO audits table
CREATE TABLE IF NOT EXISTS on_page_seo_audits (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id),
    sub_service_id INTEGER REFERENCES sub_services(id),
    error_type VARCHAR(100),
    error_category VARCHAR(100),
    severity VARCHAR(50) DEFAULT 'Medium',
    issue_description TEXT,
    current_value TEXT,
    recommended_value TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    linked_campaign_id INTEGER REFERENCES campaigns(id),
    status VARCHAR(50) DEFAULT 'open',
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- KEYWORDS & LINKING
-- ============================================================================

-- Keywords table
CREATE TABLE IF NOT EXISTS keywords (
    id SERIAL PRIMARY KEY,
    keyword_text VARCHAR(255) NOT NULL,
    search_volume INTEGER,
    difficulty_score DECIMAL(5, 2),
    intent VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keyword linking table
CREATE TABLE IF NOT EXISTS keyword_linking (
    id SERIAL PRIMARY KEY,
    keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    linked_to_type VARCHAR(50),
    linked_to_id INTEGER,
    link_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONTENT & COMMUNICATIONS
-- ============================================================================

-- Content table
CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    content_title VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    content_body TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMM posts table
CREATE TABLE IF NOT EXISTS smm_posts (
    id SERIAL PRIMARY KEY,
    post_title VARCHAR(255),
    platform VARCHAR(100),
    content TEXT,
    media_url TEXT,
    scheduled_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft',
    engagement_metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255),
    recipient VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    template_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge articles table
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(100),
    tags TEXT,
    language VARCHAR(20),
    author_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ANALYTICS & PERFORMANCE
-- ============================================================================

-- Performance targets table
CREATE TABLE IF NOT EXISTS performance_targets (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(255) NOT NULL,
    target_value DECIMAL(15, 2),
    current_value DECIMAL(15, 2),
    unit VARCHAR(50),
    period VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Effort targets table
CREATE TABLE IF NOT EXISTS effort_targets (
    id SERIAL PRIMARY KEY,
    role VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    metric VARCHAR(100),
    monthly INTEGER,
    weekly INTEGER,
    daily INTEGER,
    weightage DECIMAL(5, 2),
    rules TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee scorecards table
CREATE TABLE IF NOT EXISTS employee_scorecards (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    evaluation_period VARCHAR(50),
    overall_score DECIMAL(5, 2),
    performance_metrics JSONB,
    ai_analysis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee skills table
CREATE TABLE IF NOT EXISTS employee_skills (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100),
    skill_category VARCHAR(100),
    score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee achievements table
CREATE TABLE IF NOT EXISTS employee_achievements (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_title VARCHAR(255),
    achievement_description TEXT,
    date_awarded DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- COMPLIANCE & GOVERNANCE
-- ============================================================================

-- Compliance rules table
CREATE TABLE IF NOT EXISTS compliance_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    severity VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance audits table
CREATE TABLE IF NOT EXISTS compliance_audits (
    id SERIAL PRIMARY KEY,
    target_type VARCHAR(50),
    target_id INTEGER,
    score DECIMAL(5, 2),
    violations TEXT,
    audited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SYSTEM & CONFIGURATION
-- ============================================================================

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    is_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'inactive',
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    config JSONB,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integration logs table
CREATE TABLE IF NOT EXISTS integration_logs (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER REFERENCES integrations(id),
    event VARCHAR(100),
    status VARCHAR(50),
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_owner ON assets(owner_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_campaigns_project ON campaigns(project_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_qc_runs_target ON qc_runs(target_type, target_id);
CREATE INDEX idx_qc_runs_status ON qc_runs(qc_status);
CREATE INDEX idx_backlink_source ON backlink_submissions(backlink_source_id);
CREATE INDEX idx_backlink_status ON backlink_submissions(submission_status);
CREATE INDEX idx_keywords_text ON keywords(keyword_text);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_asset_usage_asset ON asset_usage(asset_id);
CREATE INDEX idx_asset_linking_asset ON asset_linking(asset_id);
CREATE INDEX idx_keyword_linking_keyword ON keyword_linking(keyword_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qc_runs_updated_at BEFORE UPDATE ON qc_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
