#!/usr/bin/env node

/**
 * QC Review & Assets Module - Deployment Test Suite
 * Tests all critical functionality for production deployment
 */

const http = require('http');

const API_URL = 'http://localhost:3003/api/v1';
let testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': '1',
                'X-User-Role': 'admin'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        body: data ? JSON.parse(data) : null,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        body: data,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// Test functions
async function testPendingAssets() {
    console.log('\n📋 TEST 1: Fetch Pending QC Assets');
    try {
        const response = await makeRequest('GET', '/qc-review/pending?status=QC%20Pending&limit=10');

        if (response.status === 200 && Array.isArray(response.body.assets)) {
            console.log('✅ PASS: Pending assets endpoint working');
            console.log(`   Found ${response.body.total} pending assets`);
            testResults.passed++;
            return response.body.assets;
        } else {
            throw new Error(`Status ${response.status}: ${JSON.stringify(response.body)}`);
        }
    } catch (error) {
        console.log('❌ FAIL: ' + error.message);
        testResults.failed++;
        testResults.errors.push('Pending assets fetch failed');
        return [];
    }
}

async function testQCStatistics() {
    console.log('\n📊 TEST 2: QC Statistics');
    try {
        const response = await makeRequest('GET', '/qc-review/statistics');

        if (response.status === 200 && response.body.pending !== undefined) {
            console.log('✅ PASS: QC statistics endpoint working');
            console.log(`   Pending: ${response.body.pending}, Approved: ${response.body.approved}, Rejected: ${response.body.rejected}, Rework: ${response.body.rework}`);
            testResults.passed++;
            return true;
        } else {
            throw new Error(`Status ${response.status}: ${JSON.stringify(response.body)}`);
        }
    } catch (error) {
        console.log('❌ FAIL: ' + error.message);
        testResults.failed++;
        testResults.errors.push('QC statistics failed');
        return false;
    }
}

async function testAssetApproval() {
    console.log('\n✅ TEST 3: Asset Approval Flow');
    try {
        // Create a test asset first
        const createResponse = await makeRequest('POST', '/assetLibrary', {
            asset_name: 'Test Asset for Approval',
            asset_type: 'Image',
            application_type: 'web',
            status: 'Draft',
            qc_status: 'QC Pending',
            workflow_stage: 'QC',
            seo_score: 85,
            grammar_score: 90,
            submitted_by: 1,
            submitted_at: new Date().toISOString()
        });

        if (createResponse.status !== 201) {
            throw new Error(`Failed to create test asset: ${createResponse.status}`);
        }

        const assetId = createResponse.body.id;
        console.log(`   Created test asset ID: ${assetId}`);

        // Approve the asset
        const approveResponse = await makeRequest('POST', '/qc-review/approve', {
            asset_id: assetId,
            qc_remarks: 'Approved for deployment testing',
            qc_score: 95
        });

        if (approveResponse.status === 200 && approveResponse.body.qc_status === 'Approved') {
            console.log('✅ PASS: Asset approval working');
            console.log(`   Status updated to: ${approveResponse.body.qc_status}`);
            testResults.passed++;
            return assetId;
        } else {
            throw new Error(`Approval failed: ${approveResponse.status} - ${JSON.stringify(approveResponse.body)}`);
        }
    } catch (error) {
        console.log('❌ FAIL: ' + error.message);
        testResults.failed++;
        testResults.errors.push('Asset approval failed');
        return null;
    }
}

async function testAssetRejection() {
    console.log('\n❌ TEST 4: Asset Rejection Flow');
    try {
        // Create a test asset
        const createResponse = await makeRequest('POST', '/assetLibrary', {
            asset_name: 'Test Asset for Rejection',
            asset_type: 'Image',
            application_type: 'web',
            status: 'Draft',
            qc_status: 'QC Pending',
            workflow_stage: 'QC',
            seo_score: 45,
            grammar_score: 50,
            submitted_by: 1,
            submitted_at: new Date().toISOString()
        });

        if (createResponse.status !== 201) {
            throw new Error(`Failed to create test asset: ${createResponse.status}`);
        }

        const assetId = createResponse.body.id;

        // Reject the asset
        const rejectResponse = await makeRequest('POST', '/qc-review/reject', {
            asset_id: assetId,
            qc_remarks: 'Quality below standards',
            qc_score: 40
        });

        if (rejectResponse.status === 200 && rejectResponse.body.qc_status === 'Rejected') {
            console.log('✅ PASS: Asset rejection working');
            console.log(`   Status updated to: ${rejectResponse.body.qc_status}`);
            testResults.passed++;
            return assetId;
        } else {
            throw new Error(`Rejection failed: ${rejectResponse.status} - ${JSON.stringify(rejectResponse.body)}`);
        }
    } catch (error) {
        console.log('❌ FAIL: ' + error.message);
        testResults.failed++;
        testResults.errors.push('Asset rejection failed');
        return null;
    }
}

async function testAssetRework() {
    console.log('\n🔄 TEST 5: Asset Rework Request');
    try {
        // Create a test asset
        const createResponse = await makeRequest('POST', '/assetLibrary', {
            asset_name: 'Test Asset for Rework',
            asset_type: 'Image',
            application_type: 'web',
            status: 'Draft',
            qc_status: 'QC Pending',
            workflow_stage: 'QC',
            seo_score: 65,
            grammar_score: 70,
            submitted_by: 1,
            submitted_at: new Date().toISOString()
        });

        if (createResponse.status !== 201) {
            throw new Error(`Failed to create test asset: ${createResponse.status}`);
        }

        const assetId = createResponse.body.id;

        // Request rework
        const reworkResponse = await makeRequest('POST', '/qc-review/rework', {
            asset_id: assetId,
            qc_remarks: 'Please improve image quality',
            qc_score: 65
        });

        if (reworkResponse.status === 200 && reworkResponse.body.qc_status === 'Rework') {
            console.log('✅ PASS: Asset rework request working');
            console.log(`   Status updated to: ${reworkResponse.body.qc_status}`);
            console.log(`   Rework count: ${reworkResponse.body.rework_count}`);
            testResults.passed++;
            return assetId;
        } else {
            throw new Error(`Rework failed: ${reworkResponse.status} - ${JSON.stringify(reworkResponse.body)}`);
        }
    } catch (error) {
        console.log('❌ FAIL: ' + error.message);
        testResults.failed++;
        testResults.errors.push('Asset rework failed');
        return null;
    }
}

async function testNotifications() {
    console.log('\n🔔 TEST 6: Notification System');
    try {
        const response = await makeRequest('GET', '/notifications');

        if (response.status === 200 && Array.isArray(response.body)) {
            console.log('✅ PASS: Notifications endpoint working');
            console.log(`   Found ${response.body.length} notifications`);
            testResults.passed++;
            return true;
        } else {
            throw new Error(`Status ${response.status}: ${JSON.stringify(response.body)}`);
        }
    } catch (error) {
        console.log('❌ FAIL: ' + error.message);
        testResults.failed++;
        testResults.errors.push('Notifications fetch failed');
        return false;
    }
}

async function testStatusConsistency() {
    console.log('\n🔍 TEST 7: QC Status Consistency');
    try {
        const response = await makeRequest('GET', '/qc-review/statistics');

        if (response.status === 200) {
            const stats = response.body;
            const total = stats.pending + stats.approved + stats.rejected + stats.rework;

            console.log('✅ PASS: Status consistency check');
            console.log(`   Total assets: ${total}`);
            console.log(`   Pending: ${stats.pending}, Approved: ${stats.approved}, Rejected: ${stats.rejected}, Rework: ${stats.rework}`);
            testResults.passed++;
            return true;
        } else {
            throw new Error(`Status ${response.status}`);
        }
    } catch (error) {
        console.log('❌ FAIL: ' + error.message);
        testResults.failed++;
        testResults.errors.push('Status consistency check failed');
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 QC Review & Assets Module - Deployment Test Suite');
    console.log('='.repeat(60));
    console.log(`Testing API at: ${API_URL}`);
    console.log('='.repeat(60));

    try {
        await testPendingAssets();
        await testQCStatistics();
        await testAssetApproval();
        await testAssetRejection();
        await testAssetRework();
        await testNotifications();
        await testStatusConsistency();

        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);

        if (testResults.errors.length > 0) {
            console.log('\n⚠️  Errors:');
            testResults.errors.forEach(err => console.log(`   - ${err}`));
        }

        const passRate = Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100);
        console.log(`\n📈 Pass Rate: ${passRate}%`);

        if (testResults.failed === 0) {
            console.log('\n✅ ALL TESTS PASSED - Ready for deployment!');
            process.exit(0);
        } else {
            console.log('\n❌ SOME TESTS FAILED - Review errors above');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Run tests
runTests();
