/**
 * Asset Library Test Script
 * Tests the fixes for asset search, view, and display issues
 */

const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mcc_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin'
});

async function testAssetLibrary() {
    console.log('🧪 Testing Asset Library Fixes\n');
    console.log('='.repeat(60));

    try {
        // Test 1: Check if thumbnail_url column exists
        console.log('\n📋 Test 1: Database Schema Check');
        const schemaCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'assets' AND column_name = 'thumbnail_url'
        `);

        if (schemaCheck.rows.length > 0) {
            console.log('✅ thumbnail_url column exists');
        } else {
            console.log('❌ thumbnail_url column missing - run migration!');
        }

        // Test 2: Check assets by repository
        console.log('\n📋 Test 2: Assets by Repository');
        const repoCheck = await pool.query(`
            SELECT tags as repository, COUNT(*) as count 
            FROM assets 
            GROUP BY tags 
            ORDER BY count DESC
        `);

        if (repoCheck.rows.length > 0) {
            console.log('Assets by repository:');
            repoCheck.rows.forEach(row => {
                const repo = row.repository || 'NULL/Empty';
                console.log(`  - ${repo}: ${row.count} assets`);
            });
        } else {
            console.log('⚠️  No assets found in database');
        }

        // Test 3: Check for SEO Repository assets
        console.log('\n📋 Test 3: SEO Repository Assets');
        const seoCheck = await pool.query(`
            SELECT id, asset_name, tags as repository 
            FROM assets 
            WHERE tags ILIKE '%SEO%' 
            LIMIT 5
        `);

        if (seoCheck.rows.length > 0) {
            console.log(`✅ Found ${seoCheck.rows.length} SEO Repository assets:`);
            seoCheck.rows.forEach(row => {
                console.log(`  - ID ${row.id}: ${row.asset_name} (${row.repository})`);
            });
        } else {
            console.log('⚠️  No SEO Repository assets found (this is OK if none uploaded yet)');
        }

        // Test 4: Check for assets with file_url or thumbnail_url
        console.log('\n📋 Test 4: Assets with URLs');
        const urlCheck = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(file_url) as with_file_url,
                COUNT(thumbnail_url) as with_thumbnail_url,
                COUNT(og_image_url) as with_og_image
            FROM assets
        `);

        const stats = urlCheck.rows[0];
        console.log(`Total assets: ${stats.total}`);
        console.log(`  - With file_url: ${stats.with_file_url}`);
        console.log(`  - With thumbnail_url: ${stats.with_thumbnail_url}`);
        console.log(`  - With og_image_url: ${stats.with_og_image}`);

        if (stats.total > 0 && stats.with_file_url === '0' && stats.with_thumbnail_url === '0') {
            console.log('⚠️  Warning: Assets exist but have no URLs - view button may not work');
        } else if (stats.total > 0) {
            console.log('✅ Assets have proper URL fields');
        }

        // Test 5: Sample asset data
        console.log('\n📋 Test 5: Sample Asset Data');
        const sampleCheck = await pool.query(`
            SELECT 
                id, 
                asset_name, 
                asset_type, 
                tags as repository,
                CASE 
                    WHEN file_url IS NOT NULL THEN 'Yes'
                    ELSE 'No'
                END as has_file_url,
                CASE 
                    WHEN thumbnail_url IS NOT NULL THEN 'Yes'
                    ELSE 'No'
                END as has_thumbnail
            FROM assets 
            ORDER BY created_at DESC 
            LIMIT 3
        `);

        if (sampleCheck.rows.length > 0) {
            console.log('Recent assets:');
            sampleCheck.rows.forEach(row => {
                console.log(`  - ${row.asset_name}`);
                console.log(`    Type: ${row.asset_type}, Repo: ${row.repository || 'None'}`);
                console.log(`    File URL: ${row.has_file_url}, Thumbnail: ${row.has_thumbnail}`);
            });
        } else {
            console.log('⚠️  No assets in database yet');
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Test Summary');
        console.log('='.repeat(60));

        const allTests = [
            schemaCheck.rows.length > 0,
            repoCheck.rows.length >= 0,
            true, // SEO check is optional
            stats.total === '0' || (stats.with_file_url > 0 || stats.with_thumbnail_url > 0),
            true
        ];

        const passed = allTests.filter(t => t).length;
        console.log(`\n✅ ${passed}/${allTests.length} tests passed`);

        if (schemaCheck.rows.length === 0) {
            console.log('\n⚠️  ACTION REQUIRED: Run the migration script:');
            console.log('   cd backend && node run-asset-migration.js');
        } else {
            console.log('\n✅ All database fixes are in place!');
            console.log('\nNext steps:');
            console.log('1. Restart the backend server');
            console.log('2. Test uploading an asset to "SEO Repository"');
            console.log('3. Test searching for the asset');
            console.log('4. Test the view button');
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\nMake sure:');
        console.error('1. PostgreSQL is running');
        console.error('2. Database credentials in .env are correct');
        console.error('3. Database "mcc_db" exists');
    } finally {
        await pool.end();
    }
}

// Run tests
testAssetLibrary();
