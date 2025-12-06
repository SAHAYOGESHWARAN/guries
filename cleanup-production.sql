-- =====================================================
-- Production Cleanup Script
-- Removes all test/demo/sample data from database
-- Run this ONLY if you want to start with a clean database
-- =====================================================

-- WARNING: This will delete ALL data from your database
-- Make sure you have a backup before running this script

-- =====================================================
-- OPTION 1: Remove only sample/test data (RECOMMENDED)
-- =====================================================

-- Remove sample users (keep real users)
DELETE FROM users WHERE email LIKE '%@example.com';

-- Remove sample brands
DELETE FROM brands WHERE brand_code IN ('ACME', 'GLBL');

-- Remove test/demo status items
DELETE FROM backlink_sources WHERE status = 'test';
DELETE FROM toxic_backlinks WHERE status = 'test';

-- =====================================================
-- OPTION 2: Complete database reset (USE WITH CAUTION)
-- =====================================================

-- Uncomment the following lines ONLY if you want to delete ALL data

-- Core entities
-- DELETE FROM tasks;
-- DELETE FROM campaigns;
-- DELETE FROM projects;

-- Content
-- DELETE FROM content_repository;
-- DELETE FROM service_pages;
-- DELETE FROM smm_posts;
-- DELETE FROM graphic_assets;

-- Services
-- DELETE FROM sub_services;
-- DELETE FROM services;

-- Backlinks & SEO
-- DELETE FROM backlink_submissions;
-- DELETE FROM toxic_backlinks;
-- DELETE FROM competitor_backlinks;
-- DELETE FROM on_page_seo_audits;
-- DELETE FROM url_errors;
-- DELETE FROM ux_issues;

-- Analytics & HR
-- DELETE FROM analytics_daily_traffic;
-- DELETE FROM employee_achievements;
-- DELETE FROM reward_recommendations;

-- QC & Compliance
-- DELETE FROM qc_runs;
-- DELETE FROM compliance_audits;

-- Communication
-- DELETE FROM emails;
-- DELETE FROM call_logs;
-- DELETE FROM knowledge_articles;

-- Competitors & Benchmarks
-- DELETE FROM competitors;
-- DELETE FROM competitor_benchmarks;
-- DELETE FROM gold_standards;
-- DELETE FROM effort_targets;
-- DELETE FROM okrs;

-- Resources
-- DELETE FROM keywords;
-- DELETE FROM backlink_sources;
-- DELETE FROM assets;
-- DELETE FROM asset_library;
-- DELETE FROM promotion_items;

-- Users & Teams
-- DELETE FROM users;
-- DELETE FROM teams;

-- Notifications
-- DELETE FROM notifications;

-- =====================================================
-- OPTION 3: Reset auto-increment sequences
-- =====================================================

-- Uncomment to reset ID sequences to 1
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE projects_id_seq RESTART WITH 1;
-- ALTER SEQUENCE campaigns_id_seq RESTART WITH 1;
-- ALTER SEQUENCE tasks_id_seq RESTART WITH 1;
-- ALTER SEQUENCE content_repository_id_seq RESTART WITH 1;
-- ALTER SEQUENCE services_id_seq RESTART WITH 1;
-- ALTER SEQUENCE sub_services_id_seq RESTART WITH 1;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check remaining data counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'campaigns', COUNT(*) FROM campaigns
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'content_repository', COUNT(*) FROM content_repository
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'sub_services', COUNT(*) FROM sub_services
UNION ALL
SELECT 'keywords', COUNT(*) FROM keywords
UNION ALL
SELECT 'backlink_sources', COUNT(*) FROM backlink_sources
ORDER BY table_name;

-- =====================================================
-- Production Data Validation
-- =====================================================

-- Check for any remaining test/demo data
SELECT 'Test Users' as check_type, COUNT(*) as count 
FROM users WHERE email LIKE '%@example.com' OR email LIKE '%test%'
UNION ALL
SELECT 'Test Brands', COUNT(*) 
FROM brands WHERE brand_code IN ('ACME', 'GLBL', 'TEST')
UNION ALL
SELECT 'Test Status Items', COUNT(*) 
FROM backlink_sources WHERE status = 'test';
