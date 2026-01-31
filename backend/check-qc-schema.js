#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

console.log('\n🔍 Checking QC Schema\n');

try {
    const db = new Database(dbPath);

    // Check assets table columns
    console.log('Assets table columns:');
    const assetsCols = db.prepare("PRAGMA table_info(assets)").all();
    const requiredCols = ['qc_status', 'qc_score', 'qc_remarks', 'qc_reviewer_id', 'qc_reviewed_at', 'qc_checklist_completion'];

    requiredCols.forEach(col => {
        const exists = assetsCols.find(c => c.name === col);
        console.log(`  ${exists ? '✅' : '❌'} ${col}`);
    });

    // Check asset_qc_reviews table
    console.log('\nChecking asset_qc_reviews table:');
    try {
        const reviewsCols = db.prepare("PRAGMA table_info(asset_qc_reviews)").all();
        if (reviewsCols.length > 0) {
            console.log('  ✅ Table exists');
            console.log(`  Columns: ${reviewsCols.map(c => c.name).join(', ')}`);
        } else {
            console.log('  ❌ Table does not exist');
        }
    } catch (e) {
        console.log('  ❌ Table does not exist');
    }

    // Check sample asset
    console.log('\nSample asset QC data:');
    const sample = db.prepare('SELECT id, asset_name, status, qc_status, qc_score, qc_remarks FROM assets LIMIT 1').get();
    if (sample) {
        console.log(`  Asset: ${sample.asset_name}`);
        console.log(`  Status: ${sample.status}`);
        console.log(`  QC Status: ${sample.qc_status}`);
        console.log(`  QC Score: ${sample.qc_score}`);
        console.log(`  QC Remarks: ${sample.qc_remarks}`);
    }

    db.close();
    console.log('\n✅ Schema check complete\n');

} catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
    process.exit(1);
}
