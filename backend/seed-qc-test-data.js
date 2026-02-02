/**
 * Seed QC Test Data
 * Creates sample assets for testing QC review functionality
 * Run: node seed-qc-test-data.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

const testAssets = [
    {
        asset_name: 'QC Test - Web Asset 1',
        asset_type: 'web',
        status: 'Pending QC Review',
        created_by: 2,
        submitted_by: 2,
        seo_score: 85,
        grammar_score: 90,
        application_type: 'web',
        web_description: 'Test web asset for QC review - high quality content',
        web_url: '/test/web-asset-1',
        web_h1: 'Test Web Asset Title',
        web_meta_description: 'This is a test web asset for QC review'
    },
    {
        asset_name: 'QC Test - SEO Asset 1',
        asset_type: 'seo',
        status: 'Pending QC Review',
        created_by: 2,
        submitted_by: 2,
        seo_score: 92,
        grammar_score: 88,
        application_type: 'seo',
        seo_content_description: 'Test SEO asset for QC review - optimized content',
        seo_target_url: '/test/seo-asset-1',
        web_h1: 'SEO Optimized Title',
        web_meta_description: 'SEO optimized test asset'
    },
    {
        asset_name: 'QC Test - SMM Asset 1',
        asset_type: 'smm',
        status: 'Pending QC Review',
        created_by: 2,
        submitted_by: 2,
        seo_score: 78,
        grammar_score: 85,
        application_type: 'smm',
        smm_description: 'Test SMM asset for QC review - social media content',
        content_type: 'Social Media Post'
    },
    {
        asset_name: 'QC Test - Low Quality Asset',
        asset_type: 'web',
        status: 'Pending QC Review',
        created_by: 3,
        submitted_by: 3,
        seo_score: 45,
        grammar_score: 50,
        application_type: 'web',
        web_description: 'Low quality test asset - should be rejected',
        web_url: '/test/low-quality-asset',
        web_h1: 'Low Quality Title',
        web_meta_description: 'Low quality test asset'
    },
    {
        asset_name: 'QC Test - Needs Rework',
        asset_type: 'web',
        status: 'Pending QC Review',
        created_by: 3,
        submitted_by: 3,
        seo_score: 65,
        grammar_score: 70,
        application_type: 'web',
        web_description: 'Test asset that needs rework',
        web_url: '/test/needs-rework',
        web_h1: 'Needs Rework Title',
        web_meta_description: 'Asset that needs minor revisions'
    },
    {
        asset_name: 'QC Test - Already Approved',
        asset_type: 'web',
        status: 'QC Approved',
        created_by: 2,
        submitted_by: 2,
        seo_score: 95,
        grammar_score: 95,
        application_type: 'web',
        qc_score: 95,
        qc_status: 'Pass',
        qc_reviewer_id: 1,
        qc_reviewed_at: new Date().toISOString(),
        linking_active: 1,
        web_description: 'Already approved test asset',
        web_url: '/test/already-approved',
        web_h1: 'Already Approved Title',
        web_meta_description: 'This asset is already approved'
    }
];

function seedData() {
    db.serialize(() => {
        let count = 0;

        testAssets.forEach((asset) => {
            const columns = Object.keys(asset).join(', ');
            const placeholders = Object.keys(asset).map(() => '?').join(', ');
            const values = Object.values(asset);

            const sql = `INSERT INTO assets (${columns}) VALUES (${placeholders})`;

            db.run(sql, values, function (err) {
                if (err) {
                    console.error(`Error inserting asset "${asset.asset_name}":`, err);
                } else {
                    console.log(`✓ Created asset: ${asset.asset_name} (ID: ${this.lastID})`);
                    count++;
                }

                if (count === testAssets.length) {
                    console.log(`\n✓ Successfully seeded ${count} test assets for QC review`);
                    console.log('\nTest assets created:');
                    testAssets.forEach((asset, idx) => {
                        console.log(`  ${idx + 1}. ${asset.asset_name} - Status: ${asset.status}`);
                    });
                    console.log('\nYou can now test QC review functionality with these assets.');
                    db.close();
                }
            });
        });
    });
}

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='assets'", (err, rows) => {
    if (err) {
        console.error('Error checking tables:', err);
        db.close();
        process.exit(1);
    }

    if (!rows || rows.length === 0) {
        console.error('Assets table not found. Please run database setup first.');
        db.close();
        process.exit(1);
    }

    console.log('Starting QC test data seeding...\n');
    seedData();
});
