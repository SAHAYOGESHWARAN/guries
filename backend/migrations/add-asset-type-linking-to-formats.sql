-- Add asset type linking to asset formats table
-- This migration adds support for linking asset formats with specific asset types

-- Add asset_type_ids column to asset_formats table
ALTER TABLE asset_formats ADD COLUMN asset_type_ids TEXT; -- JSON array of asset type IDs

-- Update existing asset formats with default asset type associations
-- These are example associations - you can modify based on your business logic

-- Image formats - typically for visual content types
UPDATE asset_formats 
SET asset_type_ids = '["Research Paper", "Review Article", "Case Study", "Technical Report", "Analysis Report", "Data Summary", "Test Report", "Safety Analysis", "Quality Certificate", "Thesis Chapter", "Literature Review", "Research Proposal", "Study Material", "Tutorial Guide"]'
WHERE format_type = 'image';

-- Video formats - for multimedia content
UPDATE asset_formats 
SET asset_type_ids = '["Technical Report", "Analysis Report", "Statistical Guide", "Tutorial Guide", "Study Material", "Practice Questions"]'
WHERE format_type = 'video';

-- Document formats - for text-based content
UPDATE asset_formats 
SET asset_type_ids = '["Research Paper", "Review Article", "Case Study", "Technical Report", "Analysis Report", "Data Summary", "Statistical Guide", "Test Report", "Safety Analysis", "Quality Certificate", "Thesis Chapter", "Literature Review", "Research Proposal", "Study Material", "Practice Questions", "Tutorial Guide"]'
WHERE format_type = 'document';

-- Audio formats - for audio content
UPDATE asset_formats 
SET asset_type_ids = '["Tutorial Guide", "Study Material", "Statistical Guide"]'
WHERE format_type = 'audio';

-- If no asset_type_ids are set, default to empty array
UPDATE asset_formats 
SET asset_type_ids = '[]'
WHERE asset_type_ids IS NULL;