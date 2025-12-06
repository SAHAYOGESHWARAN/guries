-- =====================================================
-- Add Assets Table to Database
-- Run this to fix the asset system
-- =====================================================

-- Create assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS assets (
	id SERIAL PRIMARY KEY,
	asset_name VARCHAR(500) NOT NULL,
	asset_type VARCHAR(100) DEFAULT 'Image',
	file_url TEXT,
	thumbnail_url TEXT,
	og_image_url TEXT,
	description TEXT,
	tags TEXT, -- Used for repository field
	file_size BIGINT,
	file_type VARCHAR(100),
	social_meta JSONB,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_created ON assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_name ON assets(asset_name);

-- Verify table was created
SELECT 
    'assets' as table_name,
    COUNT(*) as record_count,
    'Table created successfully!' as status
FROM assets;

-- Show table structure
\d assets
