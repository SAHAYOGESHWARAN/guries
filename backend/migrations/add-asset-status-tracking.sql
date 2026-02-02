-- Asset Status Tracking Migration
-- Adds tables and columns for tracking QC Status, Linking Status, and Workflow Stage

-- Create asset_status_log table for tracking status changes
CREATE TABLE IF NOT EXISTS asset_status_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    changed_by INTEGER,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Add status columns to assets table if they don't exist
ALTER TABLE assets ADD COLUMN qc_status TEXT DEFAULT 'Pending';
ALTER TABLE assets ADD COLUMN workflow_stage TEXT DEFAULT 'Add';
ALTER TABLE assets ADD COLUMN linking_active INTEGER DEFAULT 0;
ALTER TABLE assets ADD COLUMN qc_remarks TEXT;
ALTER TABLE assets ADD COLUMN qc_reviewed_at DATETIME;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_asset_status_log_asset_id ON asset_status_log(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_status_log_changed_at ON asset_status_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_assets_qc_status ON assets(qc_status);
CREATE INDEX IF NOT EXISTS idx_assets_workflow_stage ON assets(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_assets_linking_active ON assets(linking_active);

-- Create view for asset status summary
CREATE VIEW IF NOT EXISTS asset_status_summary AS
SELECT 
    a.id,
    a.asset_name,
    a.qc_status,
    a.workflow_stage,
    a.linking_active,
    COUNT(DISTINCT sal.service_id) as linked_services,
    COUNT(DISTINCT sal.id) as total_links,
    SUM(CASE WHEN sal.is_static = 1 THEN 1 ELSE 0 END) as static_links,
    a.created_at,
    a.qc_reviewed_at
FROM assets a
LEFT JOIN service_asset_links sal ON a.id = sal.asset_id
GROUP BY a.id;
