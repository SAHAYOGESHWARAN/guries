-- =====================================================
-- Verification Script for Asset Library Linking
-- =====================================================
-- Run this script to verify the migration was successful

\echo '========================================='
\echo 'Asset Library Linking - Verification'
\echo '========================================='
\echo ''

-- Check if columns exist
\echo 'Checking if new columns exist...'
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'assets' 
AND column_name IN ('linked_service_ids', 'linked_sub_service_ids');

\echo ''
\echo 'Checking if indexes exist...'
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'assets'
AND indexname IN ('idx_assets_linked_services', 'idx_assets_linked_sub_services');

\echo ''
\echo 'Checking sample data...'
SELECT 
    id,
    asset_name,
    asset_type,
    tags as repository,
    linked_service_ids,
    linked_sub_service_ids
FROM assets 
LIMIT 5;

\echo ''
\echo 'Counting total assets...'
SELECT COUNT(*) as total_assets FROM assets;

\echo ''
\echo 'Counting assets with service links...'
SELECT COUNT(*) as assets_with_links 
FROM assets 
WHERE linked_service_ids IS NOT NULL 
AND linked_service_ids != '[]';

\echo ''
\echo '========================================='
\echo 'Verification Complete!'
\echo '========================================='
