#!/usr/bin/env node

/**
 * QC Review Deployment Test Script
 * Tests the complete QC review workflow on deployment
 * Usage: node test-qc-deployment.js
 */

const http = require('http');

const API_BASE = 'http://localhost:3003/api/v1';

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            const bodyStr = JSON.stringify(body);
            options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    log('\n🚀 QC Review Deployment Test Suite\n', 'blue');

    try {
        // Test 1: Health check
        log('Test 1: Health Check', 'yellow');
        const health = await makeRequest('GET', '/health');
        if (health.status === 200) {
            log('✅ Backend is running', 'green');
        } else {
            log('❌ Backend health check failed', 'red');
            return;
        }

        // Test 2: Get assets for QC
        log('\nTest 2: Get Assets for QC', 'yellow');
        const assetsRes = await makeRequest('GET', '/assetLibrary/qc/pending');
        if (assetsRes.status === 200) {
            log(`✅ Retrieved ${assetsRes.data.length || 0} assets for QC`, 'green');
        } else {
            log('❌ Failed to get assets for QC', 'red');
            return;
        }

        // Test 3: Get asset library
        log('\nTest 3: Get Asset Library', 'yellow');
        const libRes = await makeRequest('GET', '/assetLibrary');
        if (libRes.status === 200 && Array.isArray(libRes.data)) {
            log(`✅ Retrieved ${libRes.data.length} assets from library`, 'green');

            if (libRes.data.length > 0) {
                const asset = libRes.data[0];
                log(`   First asset: ${asset.asset_name || asset.name} (ID: ${asset.id})`, 'blue');

                // Test 4: Submit QC Review
                log('\nTest 4: Submit QC Review', 'yellow');
                const qcPayload = {
                    qc_score: 85,
                    qc_remarks: 'Deployment test - Asset approved',
                    qc_decision: 'approved',
                    qc_reviewer_id: 1,
                    user_role: 'admin',
                    checklist_completion: true,
                    checklist_items: {
                        'Brand Compliance': true,
                        'Technical Specs Met': true,
                        'Content Quality': true,
                        'SEO Optimization': true,
                        'Legal / Regulatory Check': true,
                        'Tone of Voice': true
                    }
                };

                const qcRes = await makeRequest('POST', `/assetLibrary/${asset.id}/qc-review`, qcPayload);
                if (qcRes.status === 200) {
                    log('✅ QC Review submitted successfully', 'green');
                    log(`   Asset Status: ${qcRes.data.status}`, 'blue');
                    log(`   QC Score: ${qcRes.data.qc_score}`, 'blue');
                    log(`   Linking Active: ${qcRes.data.linking_active}`, 'blue');
                } else {
                    log(`❌ QC Review failed with status ${qcRes.status}`, 'red');
                    log(`   Error: ${qcRes.data.error || JSON.stringify(qcRes.data)}`, 'red');
                }

                // Test 5: Get QC Reviews for asset
                log('\nTest 5: Get QC Reviews for Asset', 'yellow');
                const reviewsRes = await makeRequest('GET', `/assetLibrary/${asset.id}/qc-reviews`);
                if (reviewsRes.status === 200) {
                    log(`✅ Retrieved ${reviewsRes.data.length || 0} QC reviews`, 'green');
                } else {
                    log('❌ Failed to get QC reviews', 'red');
                }
            }
        } else {
            log('❌ Failed to get asset library', 'red');
        }

        // Test 6: Database verification
        log('\nTest 6: Database Verification', 'yellow');
        const db = require('better-sqlite3')('./mcc_db.sqlite');
        const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets').get();
        const qcCount = db.prepare('SELECT COUNT(*) as count FROM asset_qc_reviews').get();
        const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

        log(`✅ Database Status:`, 'green');
        log(`   Assets: ${assetCount.count}`, 'blue');
        log(`   QC Reviews: ${qcCount.count}`, 'blue');
        log(`   Users: ${usersCount.count}`, 'blue');
        db.close();

        log('\n✅ All tests completed successfully!\n', 'green');

    } catch (error) {
        log(`\n❌ Test failed with error: ${error.message}\n`, 'red');
        process.exit(1);
    }
}

// Run tests
runTests().catch(err => {
    log(`\n❌ Fatal error: ${err.message}\n`, 'red');
    process.exit(1);
});
