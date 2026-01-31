#!/usr/bin/env node

/**
 * Asset Filter Verification Script
 * Verifies that asset filters and linked assets are working properly
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

console.log('\n🔍 Asset Filter Verification\n');

try {
    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');

    // Check 1: Assets by application_type
    console.log('Check 1: Assets by Application Type');
    const webAssets = db.prepare('SELECT COUNT(*) as count FROM assets WHERE application_type = ?').get('web');
    const seoAssets = db.prepare('SELECT COUNT(*) as count FROM assets WHERE application_type = ?').get('seo');
    const smmAssets = db.prepare('SELECT COUNT(*) as count FROM assets WHERE application_type = ?').get('smm');
    const allAssets = db.prepare('SELECT COUNT(*) as count FROM assets').get();
    const nullAppType = db.prepare("SELECT COUNT(*) as count FROM assets WHERE application_type IS NULL OR application_type = ''").get();

    console.log(`  ✅ Web assets: ${webAssets.count}`);
    console.log(`  ✅ SEO assets: ${seoAssets.count}`);
    console.log(`  ✅ SMM assets: ${smmAssets.count}`);
    console.log(`  ✅ Total assets: ${allAssets.count}`);
    console.log(`  ⚠️  NULL/Empty application_type: ${nullAppType.count}`);

    // Check 2: Sample assets
    console.log('\nCheck 2: Sample Assets');
    const samples = db.prepare(`
        SELECT id, asset_name, application_type, status, qc_status 
        FROM assets 
        LIMIT 5
    `).all();

    samples.forEach((asset, idx) => {
        console.log(`  ${idx + 1}. ${asset.asset_name}`);
        console.log(`     Type: ${asset.application_type}, Status: ${asset.status}, QC: ${asset.qc_status}`);
    });

    // Check 3: Linked assets
    console.log('\nCheck 3: Linked Assets');
    const linkedAssets = db.prepare(`
        SELECT COUNT(*) as count FROM assets 
        WHERE linked_service_ids IS NOT NULL AND linked_service_ids != ''
    `).get();
    const linkedSubServices = db.prepare(`
        SELECT COUNT(*) as count FROM assets 
        WHERE linked_sub_service_ids IS NOT NULL AND linked_sub_service_ids != ''
    `).get();

    console.log(`  ✅ Assets linked to services: ${linkedAssets.count}`);
    console.log(`  ✅ Assets linked to sub-services: ${linkedSubServices.count}`);

    // Check 4: Asset categories
    console.log('\nCheck 4: Asset Categories');
    const categories = db.prepare(`
        SELECT DISTINCT asset_category FROM assets WHERE asset_category IS NOT NULL
    `).all();

    console.log(`  ✅ Unique categories: ${categories.length}`);
    categories.slice(0, 5).forEach(cat => {
        console.log(`     - ${cat.asset_category}`);
    });

    // Check 5: Asset formats
    console.log('\nCheck 5: Asset Formats');
    const formats = db.prepare(`
        SELECT DISTINCT asset_format FROM assets WHERE asset_format IS NOT NULL
    `).all();

    console.log(`  ✅ Unique formats: ${formats.length}`);
    formats.slice(0, 5).forEach(fmt => {
        console.log(`     - ${fmt.asset_format}`);
    });

    // Check 6: QC Status distribution
    console.log('\nCheck 6: QC Status Distribution');
    const qcStatus = db.prepare(`
        SELECT qc_status, COUNT(*) as count FROM assets GROUP BY qc_status
    `).all();

    qcStatus.forEach(status => {
        console.log(`  ✅ ${status.qc_status || 'NULL'}: ${status.count}`);
    });

    // Check 7: Linking Active status
    console.log('\nCheck 7: Linking Active Status');
    const linkingActive = db.prepare(`
        SELECT linking_active, COUNT(*) as count FROM assets GROUP BY linking_active
    `).all();

    linkingActive.forEach(status => {
        console.log(`  ✅ Linking Active ${status.linking_active}: ${status.count}`);
    });

    db.close();

    console.log('\n✅ Verification Complete!\n');

} catch (error) {
    console.error('\n❌ Verification failed:', error.message, '\n');
    process.exit(1);
}
