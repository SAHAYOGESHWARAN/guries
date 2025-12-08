-- Migration: Add Asset Fields to Content Repository
-- Adds fields for QC score, page mapping, and mapped_to display

DO $$ 
BEGIN
    -- Add linked_page_ids if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_repository' AND column_name = 'linked_page_ids'
    ) THEN
        ALTER TABLE content_repository ADD COLUMN linked_page_ids TEXT DEFAULT '[]';
        COMMENT ON COLUMN content_repository.linked_page_ids IS 'JSON array for mapping to specific pages';
    END IF;

    -- Add mapped_to if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_repository' AND column_name = 'mapped_to'
    ) THEN
        ALTER TABLE content_repository ADD COLUMN mapped_to VARCHAR(500);
        COMMENT ON COLUMN content_repository.mapped_to IS 'Display string: Service / Sub-service / Page';
    END IF;

    -- Add qc_score if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_repository' AND column_name = 'qc_score'
    ) THEN
        ALTER TABLE content_repository ADD COLUMN qc_score INTEGER;
        COMMENT ON COLUMN content_repository.qc_score IS 'Quality control score (0-100)';
    END IF;

    -- Add constraint to ensure qc_score is between 0 and 100
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'content_repository' AND constraint_name = 'content_repository_qc_score_check'
    ) THEN
        ALTER TABLE content_repository ADD CONSTRAINT content_repository_qc_score_check 
        CHECK (qc_score IS NULL OR (qc_score >= 0 AND qc_score <= 100));
    END IF;
END $$;

-- Update existing records to set default values
UPDATE content_repository 
SET linked_page_ids = '[]' 
WHERE linked_page_ids IS NULL;

COMMENT ON TABLE content_repository IS 'Central content repository with asset management and QC tracking';
