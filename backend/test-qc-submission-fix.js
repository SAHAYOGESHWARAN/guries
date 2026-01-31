#!/usr/bin/env node

/**
 * QC Review Submission Diagnostic & Fix
 * Tests and fixes QC review submission issues
 */

const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const DB_PATH = path.join(__dirname, 'mcc_db.sqlite');

let testsPassed = 0;
let testsFailed = 0;

console.log('\n========================================');
console.log('QC Review Submission Diagnostic');
console.log('========================================\n');

// Test 1: Check Database
console.log('Test 1: Database Check');
console.log('-----------------------------------');
try {
    const db = new Database(DB_PATH);

    // Check tables
    const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('assets', 'asset_qc_reviews', 'users')
    `).all();

    console.log(`✓ Database connected: ${DB_PATH}`);
    console.log(`✓ Tables found: ${tables.map(t => t.name).join(', ')}`);

    // Check assets
    const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets').get();
    console.log(`✓ Assets in database: ${assetCount.count}`);

    // Check users
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log(`✓ Users in database: ${userCount.count}`);

    // Check QC reviews
    const qcCount = db.prepare('SELECT COUNT(*) as count FROM asset_qc_reviews').get();
    console.log(`✓ QC reviews in database: ${qcCount.count}`);

    // Get sample asset
    const sampleAsset = db.prepare('SELECT id, asset_name, status FROM assets LIMIT 1').get();
    if (sampleAsset) {
        console.log(`✓ Sample asset: ID=${sampleAsset.id}, Name=${sampleAsset.asset_name}, Status=${sampleAsset.status}`);
    }

    // Get sample user
    const sampleUser = db.prepare('SELECT id, name, role FROM users LIMIT 1').get();
    if (sampleUser) {
        console.log(`✓ Sample user: ID=${sampleUser.id}, Name=${sampleUser.name}, Role=${sampleUser.role}`);
    }

    testsPassed++;
    db.close();
} catch (error) {
    console.error(`✗ Database check failed: ${error.message}`);
    testsFailed++;
}

// Test 2: Check API Endpoint
console.log('\n\nTest 2: API Endpoint Check');
console.log('-----------------------------------');

function makeRequest(method, path, data) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port || 3001,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': '1',
                'X-User-Role': 'Admin'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

(async () => {
    try {
        // Test endpoint exists
        const testData = {
            qc_score: 85,
            qc_remarks: 'Test review',
            qc_decision: 'approved',
            qc_reviewer_id: 1,
            user_role: 'Admin',
            checklist_items: {
                'Brand Compliance': true,
                'Technical Specs Met': true,
                'Content Quality': true,
                'SEO Optimization': true,
                'Legal / Regulatory Check': true,
                'Tone of Voice': true
            },
            checklist_completion: true,
            linking_active: true
        };

        const response = await makeRequest('POST', '/api/v1/assetLibrary/1/qc-review', testData);

        if (response.status === 200) {
            console.log('✓ Endpoint is accessible');
            console.log(`✓ Response status: ${response.status}`);
            console.log(`✓ Asset updated: ${response.data.name || response.data.asset_name}`);
            testsPassed++;
        } else if (response.status === 404) {
            console.log('✗ Endpoint not found (404)');
            console.log('  Expected: POST /api/v1/assetLibrary/:id/qc-review');
            testsFailed++;
        } else if (response.status === 403) {
            console.log('✗ Access denied (403)');
            console.log(`  Error: ${response.data.error}`);
            testsFailed++;
        } else {
            console.log(`✗ Unexpected status: ${response.status}`);
            console.log(`  Response: ${JSON.stringify(response.data)}`);
            testsFailed++;
        }
    } catch (error) {
        console.log(`✗ Request failed: ${error.message}`);
        testsFailed++;
    }

    // Test 3: Verify Database Schema
    console.log('\n\nTest 3: Database Schema Verification');
    console.log('-----------------------------------');
    try {
        const db = new Database(DB_PATH);

        // Check asset_qc_reviews columns
        const qcColumns = db.prepare("PRAGMA table_info(asset_qc_reviews)").all();
        const requiredColumns = ['id', 'asset_id', 'qc_reviewer_id', 'qc_score', 'checklist_completion', 'qc_remarks', 'qc_decision', 'checklist_items', 'created_at'];

        const columnNames = qcColumns.map(c => c.name);
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

        if (missingColumns.length === 0) {
            console.log('✓ All required columns exist in asset_qc_reviews');
            console.log(`  Columns: ${columnNames.join(', ')}`);
            testsPassed++;
        } else {
            console.log(`✗ Missing columns: ${missingColumns.join(', ')}`);
            testsFailed++;
        }

        // Check assets table QC columns
        const assetColumns = db.prepare("PRAGMA table_info(assets)").all();
        const assetColumnNames = assetColumns.map(c => c.name);
        const requiredAssetColumns = ['qc_score', 'qc_remarks', 'qc_reviewer_id', 'qc_reviewed_at', 'qc_status', 'linking_active'];

        const missingAssetColumns = requiredAssetColumns.filter(col => !assetColumnNames.includes(col));

        if (missingAssetColumns.length === 0) {
            console.log('✓ All required QC columns exist in assets table');
            testsPassed++;
        } else {
            console.log(`✗ Missing asset columns: ${missingAssetColumns.join(', ')}`);
            testsFailed++;
        }

        db.close();
    } catch (error) {
        console.log(`✗ Schema check failed: ${error.message}`);
        testsFailed++;
    }

    // Test 4: Check Frontend Configuration
    console.log('\n\nTest 4: Frontend Configuration Check');
    console.log('-----------------------------------');
    try {
        const fs = require('fs');
        const envPath = path.join(__dirname, '../frontend/.env.development');

        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');

            if (envContent.includes('VITE_API_URL=http://localhost:3001')) {
                console.log('✓ Frontend API URL correctly set to localhost:3001');
                testsPassed++;
            } else {
                console.log('✗ Frontend API URL not set to localhost:3001');
                console.log(`  Content: ${envContent.split('\n')[0]}`);
                testsFailed++;
            }
        } else {
            console.log('✗ .env.development file not found');
            testsFailed++;
        }
    } catch (error) {
        console.log(`✗ Frontend config check failed: ${error.message}`);
        testsFailed++;
    }

    // Test 5: Check Backend Routes
    console.log('\n\nTest 5: Backend Routes Check');
    console.log('-----------------------------------');
    try {
        const apiPath = path.join(__dirname, 'routes/api.ts');
        const fs = require('fs');

        if (fs.existsSync(apiPath)) {
            const apiContent = fs.readFileSync(apiPath, 'utf8');

            if (apiContent.includes("router.post('/assetLibrary/:id/qc-review'")) {
                console.log('✓ QC review route exists in backend');
                testsPassed++;
            } else {
                console.log('✗ QC review route not found in backend');
                testsFailed++;
            }
        } else {
            console.log('✗ API routes file not found');
            testsFailed++;
        }
    } catch (error) {
        console.log(`✗ Routes check failed: ${error.message}`);
        testsFailed++;
    }

    // Summary
    console.log('\n\n========================================');
    console.log('Diagnostic Summary');
    console.log('========================================');
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    console.log(`Total:  ${testsPassed + testsFailed}`);
    console.log('========================================\n');

    if (testsFailed === 0) {
        console.log('✅ All checks passed! QC review submission should work.');
        console.log('\nNext steps:');
        console.log('1. Start backend: npm start');
        console.log('2. Start frontend: npm run dev');
        console.log('3. Test QC review submission');
    } else {
        console.log('❌ Some checks failed. Please review the errors above.');
    }

    process.exit(testsFailed > 0 ? 1 : 0);
})();
