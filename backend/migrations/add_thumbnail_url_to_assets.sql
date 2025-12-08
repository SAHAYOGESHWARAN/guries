-- Migration: Add thumbnail_url column to assets table if it doesn't exist
-- This ensures proper image preview support in the Asset Library

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' AND column_name = 'thumbnail_url'
    ) THEN
        ALTER TABLE assets ADD COLUMN thumbnail_url TEXT;
        COMMENT ON COLUMN assets.thumbnail_url IS 'Thumbnail/preview URL for the asset';
    END IF;
END $$;

-- Update existing records to use og_image_url as thumbnail if thumbnail_url is null
UPDATE assets 
SET thumbnail_url = COALESCE(og_image_url, file_url) 
WHERE thumbnail_url IS NULL;
