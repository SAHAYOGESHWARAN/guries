const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

console.log('🧪 Testing Asset Categories Implementation\n');

try {
    // Test 1: Check if assets table exists
    console.log('Test 1: Checking assets table...');
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='assets'").get();
    if (tableCheck) {
        console.log('  ✅ Assets table exists\n');
    } else {
        console.log('  ❌ Assets table not found\n');
        process.exit(1);
    }

    // Test 2: Check application_type values
    console.log('Test 2: Checking application_type values...');
    const appTypes = db.prepare("SELECT DISTINCT application_type FROM assets WHERE application_type IS NOT NULL").all();
    console.log(`  Found ${appTypes.length} distinct application types:`);
    appTypes.forEach(row => {
        console.log(`    - ${row.application_type}`);
    });
    console.log('');

    // Test 3: Count assets by application_type
    console.log('Test 3: Counting assets by application_type...');
    const webCount = db.prepare("SELECT COUNT(*) as count FROM assets WHERE application_type = 'web'").get();
    const seoCount = db.prepare("SELECT COUNT(*) as count FROM assets WHERE application_type = 'seo'").get();
    const smmCount = db.prepare("SELECT COUNT(*) as count FROM assets WHERE application_type = 'smm'").get();

    console.log(`  Web assets: ${webCount.count}`);
    console.log(`  SEO assets: ${seoCount.count}`);
    console.log(`  SMM assets: ${smmCount.count}`);
    console.log('');

    // Test 4: Check asset status distribution
    console.log('Test 4: Checking asset status distribution...');
    const statuses = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM assets 
        WHERE application_type IN ('web', 'seo', 'smm')
        GROUP BY status
    `).all();

    if (statuses.length > 0) {
        statuses.forEach(row => {
            console.log(`  ${row.status}: ${row.count}`);
        });
    } else {
        console.log('  No assets found with Web, SEO, or SMM types');
    }
    console.log('');

    // Test 5: Check linked_service_ids field
    console.log('Test 5: Checking linked_service_ids field...');
    const linkedCheck = db.prepare("SELECT COUNT(*) as count FROM assets WHERE linked_service_ids IS NOT NULL").get();
    console.log(`  Assets with linked_service_ids: ${linkedCheck.count}\n`);

    // Test 6: Sample asset query (simulating API response)
    console.log('Test 6: Sample asset query (Web category)...');
    const sampleAssets = db.prepare(`
        SELECT 
            id, asset_name as name, asset_type as type,
            asset_category, asset_format, status,
            application_type, linking_active
        FROM assets
        WHERE application_type = 'web' AND status IN ('Draft', 'Pending QC Review', 'Published')
        LIMIT 3
    `).all();

    if (sampleAssets.length > 0) {
        console.log(`  Found ${sampleAssets.length} Web assets:`);
        sampleAssets.forEach((asset, idx) => {
            console.log(`    ${idx + 1}. ${asset.name} (${asset.type})`);
        });
    } else {
        console.log('  ⚠️  No Web assets found. Run: node seed-test-assets.js');
    }
    console.log('');

    // Test 7: Verify repositories query
    console.log('Test 7: Testing repositories query...');
    const repositories = db.prepare(`
        SELECT DISTINCT 
            CASE 
                WHEN application_type = 'web' THEN 'Web'
                WHEN application_type = 'seo' THEN 'SEO'
                WHEN application_type = 'smm' THEN 'SMM'
                ELSE application_type
            END as repository
        FROM assets
        WHERE application_type IS NOT NULL AND application_type != ''
        ORDER BY repository ASC
    `).all();

    console.log(`  Available repositories: ${repositories.map(r => r.repository).join(', ')}\n`);

    // Summary
    console.log('✅ All tests completed successfully!\n');
    console.log('Summary:');
    console.log(`  - Web assets: ${webCount.count}`);
    console.log(`  - SEO assets: ${seoCount.count}`);
    console.log(`  - SMM assets: ${smmCount.count}`);
    console.log(`  - Total: ${webCount.count + seoCount.count + smmCount.count}`);
    console.log('');

    if (webCount.count === 0 && seoCount.count === 0 && smmCount.count === 0) {
        console.log('⚠️  No assets found. To create test data, run:');
        console.log('   node backend/seed-test-assets.js');
    }

} catch (error) {
    console.error('❌ Error during testing:', error.message);
    process.exit(1);
} finally {
    db.close();
}
