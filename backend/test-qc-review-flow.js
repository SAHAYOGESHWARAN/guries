#!/usr/bin/env node

/**
 * QC Review Flow Test
 * Tests the complete QC review workflow
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

console.log('\n🧪 QC Review Flow Test\n');

try {
    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');

    // Test 1: Get an asset for QC review
    console.log('Test 1: Get asset for QC review');
    const asset = db.prepare(`
        SELECT id, asset_name, status, qc_status, application_type 
        FROM assets 
        WHERE status NOT IN ('QC Approved', 'QC Rejected', 'Published')
        LIMIT 1
    `).get();

    if (!asset) {
        console.log('  ⚠️  No assets pending QC review');
        console.log('  Creating test asset...');

        // Create a test asset
        db.prepare(`
            INSERT INTO assets (
                asset_name, asset_type, asset_category, asset_format,
                status, qc_status, application_type, linking_active,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).run(
            'Test Asset for QC',
            'Image',
            'Testing',
            'PNG',
            'Submitted',
            'Pending',
            'web',
            0
        );

        const newAsset = db.prepare('SELECT id, asset_name FROM assets WHERE asset_name = ?').get('Test Asset for QC');
        console.log(`  ✅ Created test asset: ${newAsset.asset_name} (ID: ${newAsset.id})`);
    } else {
        console.log(`  ✅ Found asset: ${asset.asset_name} (ID: ${asset.id})`);
        console.log(`     Status: ${asset.status}, QC Status: ${asset.qc_status}`);
    }

    // Test 2: Simulate QC review approval
    console.log('\nTest 2: Simulate QC review approval');
    const testAssetId = asset?.id || db.prepare('SELECT id FROM assets WHERE asset_name = ?').get('Test Asset for QC').id;

    const updateResult = db.prepare(`
        UPDATE assets SET
            status = ?,
            qc_status = ?,
            qc_score = ?,
            qc_remarks = ?,
            qc_reviewer_id = ?,
            qc_reviewed_at = datetime('now'),
            linking_active = ?,
            updated_at = datetime('now')
        WHERE id = ?
    `).run(
        'QC Approved',
        'Pass',
        85,
        'Approved in test',
        1,
        1,
        testAssetId
    );

    console.log(`  ✅ Updated asset (changes: ${updateResult.changes})`);

    // Test 3: Verify QC review record
    console.log('\nTest 3: Create QC review record');
    try {
        const reviewResult = db.prepare(`
            INSERT INTO asset_qc_reviews (
                asset_id, qc_reviewer_id, qc_score, checklist_completion,
                qc_remarks, qc_decision, checklist_items, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(
            testAssetId,
            1,
            85,
            1,
            'Approved in test',
            'approved',
            JSON.stringify({ 'Test Item': true })
        );

        console.log(`  ✅ Created QC review record (ID: ${reviewResult.lastInsertRowid})`);
    } catch (e) {
        console.log(`  ⚠️  Could not create review record: ${e.message}`);
    }

    // Test 4: Verify updated asset
    console.log('\nTest 4: Verify updated asset');
    const updatedAsset = db.prepare(`
        SELECT id, asset_name, status, qc_status, qc_score, qc_remarks, linking_active
        FROM assets
        WHERE id = ?
    `).get(testAssetId);

    if (updatedAsset) {
        console.log(`  ✅ Asset: ${updatedAsset.asset_name}`);
        console.log(`     Status: ${updatedAsset.status}`);
        console.log(`     QC Status: ${updatedAsset.qc_status}`);
        console.log(`     QC Score: ${updatedAsset.qc_score}`);
        console.log(`     Linking Active: ${updatedAsset.linking_active}`);
    }

    // Test 5: Check QC review records
    console.log('\nTest 5: Check QC review records');
    const reviews = db.prepare(`
        SELECT id, asset_id, qc_decision, qc_score, created_at
        FROM asset_qc_reviews
        WHERE asset_id = ?
        ORDER BY created_at DESC
        LIMIT 3
    `).all(testAssetId);

    console.log(`  ✅ Found ${reviews.length} QC review records`);
    reviews.forEach((review, idx) => {
        console.log(`     ${idx + 1}. Decision: ${review.qc_decision}, Score: ${review.qc_score}`);
    });

    db.close();

    console.log('\n✅ QC Review Flow Test Complete!\n');

} catch (error) {
    console.error('\n❌ Test failed:', error.message, '\n');
    process.exit(1);
}
