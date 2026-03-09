-- PostgreSQL Complete Schema Migration for Marketing Control Center
-- This migration creates all required tables for Supabase deployment
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (optional, for fresh setup)
DROP TABLE IF EXISTS asset_qc_log CASCADE;
DROP TABLE IF EXISTS qc_audit_log CASCADE;
DROP TABLE IF EXISTS user_role_mapping CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS asset_linking CASCADE;
DROP TABLE IF EXISTS asset_category_master CASCADE;
DROP TABLE IF EXISTS asset_type_master CASCADE;
DROP TABLE IF EXISTS content_types CASCADE;
DROP TABLE IF EXISTS asset_types CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS keywords CASCADE;
DROP TABLE IF EXISTS keyword_master CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS backlinks CASCADE;
DROP TABLE IF EXISTS country_master CASCADE;
DROP TABLE IF EXISTS industry_sectors CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS subservices CASCADE;
DROP TABLE IF EXISTS workflow_stages CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Role Permissions
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

CREATE TABLE user_role_mapping (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- Campaigns Table
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_code VARCHAR(50) UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2) DEFAULT 0.00,
    roi DECIMAL(8, 2) DEFAULT 0.00,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_code VARCHAR(50) UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    campaign_id INTEGER REFERENCES campaigns(id),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2) DEFAULT 0.00,
    progress DECIMAL(5, 2) DEFAULT 0.00,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    project_id INTEGER REFERENCES projects(id),
    assigned_to INTEGER REFERENCES users(id),
    due_date DATE,
    completed_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Asset Categories Master
CREATE TABLE asset_category_master (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    color_code VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Types Master
CREATE TABLE asset_type_master (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Types (for API compatibility)
CREATE TABLE asset_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Types
CREATE TABLE content_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets Table
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_name VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    asset_type VARCHAR(100),
    asset_category INTEGER REFERENCES asset_category_master(id),
    content_type VARCHAR(100),
    file_url TEXT,
    thumbnail_url TEXT,
    file_size INTEGER,
    dimensions VARCHAR(20),
    duration INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    repository VARCHAR(100),
    description TEXT,
    tags TEXT DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Asset Linking Table
CREATE TABLE asset_linking (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    linked_entity_type VARCHAR(50),
    linked_entity_id INTEGER,
    link_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asset_id, linked_entity_type, linked_entity_id, link_type)
);

-- Keywords Table
CREATE TABLE keywords (
    id SERIAL PRIMARY KEY,
    keyword_text VARCHAR(255) NOT NULL,
    search_volume INTEGER DEFAULT 0,
    competition_level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    primary_service_id INTEGER,
    related_assets TEXT DEFAULT '[]',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Keyword Master
CREATE TABLE keyword_master (
    id SERIAL PRIMARY KEY,
    keyword_text VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    service_code VARCHAR(50) UNIQUE,
    slug VARCHAR(255) UNIQUE,
    full_url TEXT,
    menu_heading VARCHAR(255),
    short_tagline TEXT,
    service_description TEXT,
    status VARCHAR(50) DEFAULT 'Published',
    h1 TEXT,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT DEFAULT '[]',
    content_type VARCHAR(100),
    buyer_journey_stage VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    show_in_main_menu BOOLEAN DEFAULT false,
    include_in_xml_sitemap BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Subservices Table
CREATE TABLE subservices (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    subservice_name VARCHAR(255) NOT NULL,
    subservice_code VARCHAR(50),
    slug VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Backlinks Table
CREATE TABLE backlinks (
    id SERIAL PRIMARY KEY,
    source_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    anchor_text TEXT,
    domain_authority DECIMAL(5, 2),
    status VARCHAR(50) DEFAULT 'pending',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Country Master
CREATE TABLE country_master (
    id SERIAL PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL UNIQUE,
    country_code VARCHAR(3),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Industry Sectors
CREATE TABLE industry_sectors (
    id SERIAL PRIMARY KEY,
    sector_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Stages
CREATE TABLE workflow_stages (
    id SERIAL PRIMARY KEY,
    stage_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sequence_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QC Audit Log
CREATE TABLE qc_audit_log (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    action VARCHAR(50),
    old_values JSONB,
    new_values JSONB,
    reviewed_by INTEGER REFERENCES users(id),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset QC Log
CREATE TABLE asset_qc_log (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    qc_status VARCHAR(50),
    reviewer_id INTEGER REFERENCES users(id),
    review_comments TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fixes_required TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Better Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_projects_campaign_id ON projects(campaign_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_assets_category ON assets(asset_category);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_created_by ON assets(created_by);
CREATE INDEX idx_keywords_status ON keywords(status);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_backlinks_status ON backlinks(status);

-- Insert Default Roles
INSERT INTO roles (role_name, description) VALUES
    ('admin', 'Administrator with full access'),
    ('editor', 'Content editor'),
    ('viewer', 'View-only access'),
    ('manager', 'Manager role')
ON CONFLICT DO NOTHING;

-- Insert Default Asset Categories
INSERT INTO asset_category_master (category_name, description) VALUES
    ('Marketing', 'Marketing and promotional assets'),
    ('Design', 'Design and visual assets'),
    ('Blog', 'Blog and content assets'),
    ('Video', 'Video and multimedia assets'),
    ('Analytics', 'Analytics and reporting assets')
ON CONFLICT DO NOTHING;

-- Insert Default Asset Types
INSERT INTO asset_types (type_name, description) VALUES
    ('Image', 'Image files'),
    ('Video', 'Video files'),
    ('Document', 'Document files'),
    ('Audio', 'Audio files'),
    ('Web', 'Web assets'),
    ('Banner', 'Banner images'),
    ('Infographic', 'Infographic assets'),
    ('Ebook', 'Ebook files')
ON CONFLICT DO NOTHING;

-- Insert Default Content Types
INSERT INTO content_types (type_name, description) VALUES
    ('Blog Post', 'Blog post content'),
    ('Landing Page', 'Landing page content'),
    ('Product Page', 'Product page content'),
    ('Case Study', 'Case study content'),
    ('Whitepaper', 'Whitepaper content'),
    ('Webinar', 'Webinar content'),
    ('Infographic', 'Infographic content'),
    ('Video', 'Video content')
ON CONFLICT DO NOTHING;

-- Insert Default Admin User
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES
    ('admin@example.com', '$2b$10$YourHashedPasswordHere', 'Admin', 'User', 'admin', true)
ON CONFLICT DO NOTHING;

-- Insert Workflow Stages
INSERT INTO workflow_stages (stage_name, sequence_order) VALUES
    ('Draft', 1),
    ('Review', 2),
    ('Approved', 3),
    ('Published', 4),
    ('Archived', 5)
ON CONFLICT DO NOTHING;

-- Create Required Trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_campaigns_timestamp BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_projects_timestamp BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_tasks_timestamp BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_assets_timestamp BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_keywords_timestamp BEFORE UPDATE ON keywords FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_services_timestamp BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_backlinks_timestamp BEFORE UPDATE ON backlinks FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Insert Sample Industries
INSERT INTO industry_sectors (sector_name, description) VALUES
    ('Technology', 'Technology and Software'),
    ('Healthcare', 'Healthcare and Medical'),
    ('Finance', 'Financial Services'),
    ('Retail', 'Retail and E-commerce'),
    ('Manufacturing', 'Manufacturing and Industrial')
ON CONFLICT DO NOTHING;

-- Insert Sample Countries
INSERT INTO country_master (country_name, country_code) VALUES
    ('United States', 'US'),
    ('Canada', 'CA'),
    ('United Kingdom', 'UK'),
    ('Australia', 'AU'),
    ('India', 'IN'),
    ('Germany', 'DE'),
    ('France', 'FR'),
    ('Japan', 'JP')
ON CONFLICT DO NOTHING;

COMMIT;
