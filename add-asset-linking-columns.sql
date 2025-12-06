-- =====================================================
-- Add Asset Linking Columns to Assets Table
-- =====================================================
-- This migration adds columns to link assets to services and sub-services

-- Add linked_service_ids column (stores array of service IDs)
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS linked_service_ids TEXT DEFAULT '[]';

-- Add linked_sub_service_ids column (stores array of sub-service IDs)
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS linked_sub_service_ids TEXT DEFAULT '[]';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_linked_services ON assets USING gin ((linked_service_ids::jsonb));
CREATE INDEX IF NOT EXISTS idx_assets_linked_sub_services ON assets USING gin ((linked_sub_service_ids::jsonb));

-- Update existing rows to have empty arrays if NULL
UPDATE assets SET linked_service_ids = '[]' WHERE linked_service_ids IS NULL;
UPDATE assets SET linked_sub_service_ids = '[]' WHERE linked_sub_service_ids IS NULL;

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'assets' 
AND column_name IN ('linked_service_ids', 'linked_sub_service_ids');
