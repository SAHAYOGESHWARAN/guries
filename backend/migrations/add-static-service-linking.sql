-- Add static linking fields for assets
-- This migration adds fields to track which service links are static (cannot be removed)

-- Add static linking flag to assets table
ALTER TABLE assets ADD COLUMN static_service_links TEXT DEFAULT '[]';

-- Create service_asset_links table for proper many-to-many relationship with static flag
CREATE TABLE IF NOT EXISTS service_asset_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    sub_service_id INTEGER NULL,
    is_static INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_service_id) REFERENCES sub_services(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE(asset_id, service_id, sub_service_id)
);

-- Create subservice_asset_links table for sub-service specific links
CREATE TABLE IF NOT EXISTS subservice_asset_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    sub_service_id INTEGER NOT NULL,
    is_static INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_service_id) REFERENCES sub_services(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE(asset_id, sub_service_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_asset_links_asset_id ON service_asset_links(asset_id);
CREATE INDEX IF NOT EXISTS idx_service_asset_links_service_id ON service_asset_links(service_id);
CREATE INDEX IF NOT EXISTS idx_subservice_asset_links_asset_id ON subservice_asset_links(asset_id);
CREATE INDEX IF NOT EXISTS idx_subservice_asset_links_sub_service_id ON subservice_asset_links(sub_service_id);
