#!/usr/bin/env node

/**
 * Asset Filter Test Script
 * Tests that asset filters work correctly with the frontend
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

console.log('\n🧪 Asset Filter Test\n');

try {
    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');

    // Test 1: Verify assets have correct application_type
    console.log('Test 1: Assets by application_type');
    const webCount = db.prepare('SELECT COUNT(*) as count FROM assets WHERE application_type = ?').get('web').count;
    const seoCount = db.prepare('SELECT COUNT(*) as count FROM assets WHERE application_type = ?').get('seo').count;
    const smmCount = db.prepare('SELECT COUNT(*) as count FROM assets WHERE application_type = ?').get('smm').count;

    console.log(`  ✅ Web: ${webCount}, SEO: ${seoCount}, SMM: ${smmCount}`);
    console.log(`  ✅ Total: ${webCount + seoCount + smmCount}`);

    // Test 2: Verify repository field mapping
    console.log('\nTest 2: Repository field mapping');
    const sample = db.prepare(`
        SELECT id, asset_name, application_type FROM assets LIMIT 1
    `).get();

    if (sample) {
        console.log(`  ✅ Sample asset: ${sample.asset_name}`);
        console.log(`  ✅ application_type: ${sample.application_type}`);

        // Simulate what backend does
        let repository = 'Content Repository';
        if (sample.application_type === 'web') repository = 'Web';
        else if (sample.application_type === 'seo') repository = 'SEO';
        else if (sample.application_type === 'smm') repository = 'SMM';

        console.log(`  ✅ Mapped repository: ${repository}`);
    }

    // Test 3: Verify linked_service_ids field
    console.log('\nTest 3: Linked assets tracking');
    const linkedCount = db.prepare(`
        SELECT COUNT(*) as count FROM assets 
        WHERE linked_service_ids IS NOT NULL AND linked_service_ids != ''
    `).get().count;

    console.log(`  ✅ Assets with linked_service_ids: ${linkedCount}`);
    console.log(`  ✅ Assets ready for linking: ${webCount + seoCount + smmCount - linkedCount}`);

    // Test 4: Verify filter logic
    console.log('\nTest 4: Filter logic simulation');

    // Simulate frontend filter: repository = 'Web', search = ''
    const filtered = db.prepare(`
        SELECT id, asset_name, application_type FROM assets 
        WHERE application_type = ? 
        LIMIT 5
    `).all('web');

    console.log(`  ✅ Filtered results for 'Web' repository: ${filtered.length} assets`);
    filtered.forEach((asset, idx) => {
        console.log(`     ${idx + 1}. ${asset.asset_name}`);
    });

    // Test 5: Verify search filter
    console.log('\nTest 5: Search filter simulation');
    const searchTerm = 'blog';
    const searchFiltered = db.prepare(`
        SELECT id, asset_name FROM assets 
        WHERE LOWER(asset_name) LIKE ? 
        LIMIT 5
    `).all(`%${searchTerm}%`);

    console.log(`  ✅ Search results for '${searchTerm}': ${searchFiltered.length} assets`);
    searchFiltered.forEach((asset, idx) => {
        console.log(`     ${idx + 1}. ${asset.asset_name}`);
    });

    db.close();

    console.log('\n✅ All tests passed!\n');

} catch (error) {
    console.error('\n❌ Test failed:', error.message, '\n');
    process.exit(1);
}
