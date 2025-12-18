-- Test script for asset_category_master table
-- This script verifies the table exists and can be used

-- Check if table exists
SELECT name FROM sqlite_master WHERE type='table' AND name='asset_category_master';

-- Insert sample categories
INSERT INTO asset_category_master (category_name, description, status) 
VALUES 
    ('What Science Can Do', 'Articles about scientific capabilities and achievements', 'active'),
    ('How To', 'Step-by-step guides and tutorials', 'active'),
    ('Case Studies', 'Real-world examples and success stories', 'active'),
    ('Industry Insights', 'Analysis and trends in various industries', 'active'),
    ('Product Features', 'Detailed information about product capabilities', 'active')
ON CONFLICT(category_name) DO NOTHING;

-- Query all active categories
SELECT id, category_name, description, status, created_at 
FROM asset_category_master 
WHERE status = 'active'
ORDER BY category_name ASC;
