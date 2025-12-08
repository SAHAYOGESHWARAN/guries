-- Migration: Add Linking Fields to Services Table
-- Adds fields for managing relationships with sub-services, assets, and knowledge topics

DO $$ 
BEGIN
    -- Add subservice_count if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'subservice_count'
    ) THEN
        ALTER TABLE services ADD COLUMN subservice_count INTEGER DEFAULT 0;
        COMMENT ON COLUMN services.subservice_count IS 'Rollup count of sub-services under this service';
    END IF;

    -- Add primary_subservice_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'primary_subservice_id'
    ) THEN
        ALTER TABLE services ADD COLUMN primary_subservice_id INTEGER;
        COMMENT ON COLUMN services.primary_subservice_id IS 'Highlighted sub-service on service page (FK to sub_services.id)';
    END IF;

    -- Add featured_asset_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'featured_asset_id'
    ) THEN
        ALTER TABLE services ADD COLUMN featured_asset_id INTEGER;
        COMMENT ON COLUMN services.featured_asset_id IS 'Key article/video to feature on page (FK to assets.id)';
    END IF;

    -- Add asset_count if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'asset_count'
    ) THEN
        ALTER TABLE services ADD COLUMN asset_count INTEGER DEFAULT 0;
        COMMENT ON COLUMN services.asset_count IS 'Number of linked assets (rollup)';
    END IF;

    -- Add knowledge_topic_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'knowledge_topic_id'
    ) THEN
        ALTER TABLE services ADD COLUMN knowledge_topic_id INTEGER;
        COMMENT ON COLUMN services.knowledge_topic_id IS 'Link to Knowledge Hub / Topic Master';
    END IF;
END $$;

-- Update existing records to calculate asset_count from linked assets
-- This is a one-time update for existing data
UPDATE services s
SET asset_count = (
    SELECT COUNT(*)
    FROM assets a
    WHERE a.linked_service_ids::jsonb ? s.id::text
)
WHERE asset_count = 0 OR asset_count IS NULL;

-- Update existing records to calculate subservice_count
UPDATE services s
SET subservice_count = (
    SELECT COUNT(*)
    FROM sub_services ss
    WHERE ss.parent_service_id = s.id
)
WHERE subservice_count = 0 OR subservice_count IS NULL;

-- Update has_subservices based on actual sub-service count
UPDATE services
SET has_subservices = (subservice_count > 0)
WHERE has_subservices IS NULL OR has_subservices = false;
