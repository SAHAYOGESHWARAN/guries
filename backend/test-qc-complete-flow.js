#!/usr/bin/env node

/**
 * Complete QC Review Flow Test
 * Tests the entire QC review process end-to-end
 */

const http = require('http');
const https = require('https');

// Configuration
const API_BASE = process.env.API_URL || 'http://localhost:3000/api/v1';
const USE_HTTPS = API_BASE.startsWith('https');
const httpModule = USE_HTTPS ? https : http;

console.log('\n🧪 COMPLETE QC REVIEW FLOW TEST\n');
console.log('📋 Configuration:');
console.log(`   API Base: ${API_BASE}`);
console.log(`   Protocol: ${USE_HTTPS ? 'HTTPS' : 'HTTP'}\n`);

// Test data
const testAsset = {
    name: 'Test Asset for QC Review',
    type: 'Image',
    application_type: 'web',
    status: 'Pending QC Review',
    submitted_by: 2,
    seo_score: 85,
    grammar_score: 90
};

const qcReviewPayload = {
    qc_score: 88,
    qc_remarks: 'Good quality asset. Approved for linking.',
    qc_decision: 'approved',
    qc_reviewer_id: 1,
    user_role: 'admin',
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

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': '1',
                'X-User-Role': 'admin'
            }
        };

        const req = httpModule.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : null;
                    resolve({ status: res.statusCode, body: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, body, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Test flow
async function runTests() {
    let assetId = null;
    let testsPassed = 0;
    let testsFailed = 0;

    try {
        // Test 1: Create asset
        console.log('📝 TEST 1: Create Asset');
        console.log('   Endpoint: POST /assetLibrary');
        const createRes = await makeRequest('POST', '/assetLibrary', testAsset);

        if (createRes.status === 201 && createRes.body && createRes.body.id) {
            assetId = createRes.body.id;
            console.log(`   ✅ PASS - Asset created (ID: ${assetId})`);
            console.log(`   Response: ${JSON.stringify(createRes.body, null, 2)}\n`);
            testsPassed++;
        } else {
            console.log(`   ❌ FAIL - Status: ${createRes.status}`);
            console.log(`   Response: ${JSON.stringify(createRes.body)}\n`);
            testsFailed++;
            return;
        }

        // Test 2: Retrieve asset
        console.log('📝 TEST 2: Retrieve Asset');
        console.log(`   Endpoint: GET /assetLibrary/${assetId}`);
        const getRes = await makeRequest('GET', `/assetLibrary/${assetId}`);

        if (getRes.status === 200 && getRes.body && getRes.body.id === assetId) {
            console.log(`   ✅ PASS - Asset retrieved`);
            console.log(`   Status: ${getRes.body.status}`);
            console.log(`   Name: ${getRes.body.name}\n`);
            testsPassed++;
        } else {
            console.log(`   ❌ FAIL - Status: ${getRes.status}`);
            console.log(`   Response: ${JSON.stringify(getRes.body)}\n`);
            testsFailed++;
        }

        // Test 3: Submit QC Review (MAIN TEST)
        console.log('📝 TEST 3: Submit QC Review (MAIN TEST)');
        console.log(`   Endpoint: POST /assetLibrary/${assetId}/qc-review`);
        console.log(`   Payload: ${JSON.stringify(qcReviewPayload, null, 2)}`);

        const qcRes = await makeRequest('POST', `/assetLibrary/${assetId}/qc-review`, qcReviewPayload);

        if (qcRes.status === 200 && qcRes.body) {
            console.log(`   ✅ PASS - QC Review submitted successfully`);
            console.log(`   Response Status: ${qcRes.status}`);
            console.log(`   Asset Status: ${qcRes.body.status}`);
            console.log(`   QC Score: ${qcRes.body.qc_score}`);
            console.log(`   Linking Active: ${qcRes.body.linking_active}`);
            console.log(`   Rework Count: ${qcRes.body.rework_count}\n`);
            testsPassed++;
        } else {
            console.log(`   ❌ FAIL - Status: ${qcRes.status}`);
            console.log(`   Response: ${JSON.stringify(qcRes.body)}\n`);
            testsFailed++;
        }

        // Test 4: Verify asset status updated
        console.log('📝 TEST 4: Verify Asset Status Updated');
        console.log(`   Endpoint: GET /assetLibrary/${assetId}`);
        const verifyRes = await makeRequest('GET', `/assetLibrary/${assetId}`);

        if (verifyRes.status === 200 && verifyRes.body) {
            const expectedStatus = 'QC Approved';
            if (verifyRes.body.status === expectedStatus) {
                console.log(`   ✅ PASS - Asset status correctly updated`);
                console.log(`   Status: ${verifyRes.body.status}`);
                console.log(`   QC Score: ${verifyRes.body.qc_score}`);
                console.log(`   QC Remarks: ${verifyRes.body.qc_remarks}`);
                console.log(`   Linking Active: ${verifyRes.body.linking_active}\n`);
                testsPassed++;
            } else {
                console.log(`   ❌ FAIL - Status not updated correctly`);
                console.log(`   Expected: ${expectedStatus}, Got: ${verifyRes.body.status}\n`);
                testsFailed++;
            }
        } else {
            console.log(`   ❌ FAIL - Status: ${verifyRes.status}\n`);
            testsFailed++;
        }

        // Test 5: Test rejection flow
        console.log('📝 TEST 5: Test Rejection Flow');
        console.log('   Creating new asset for rejection test...');

        const asset2 = { ...testAsset, name: 'Asset for Rejection Test' };
        const create2Res = await makeRequest('POST', '/assetLibrary', asset2);

        if (create2Res.status === 201 && create2Res.body && create2Res.body.id) {
            const asset2Id = create2Res.body.id;
            console.log(`   ✅ Asset created (ID: ${asset2Id})`);

            const rejectPayload = {
                qc_score: 45,
                qc_remarks: 'Quality issues detected. Rejected.',
                qc_decision: 'rejected',
                qc_reviewer_id: 1,
                user_role: 'admin'
            };

            console.log(`   Submitting rejection...`);
            const rejectRes = await makeRequest('POST', `/assetLibrary/${asset2Id}/qc-review`, rejectPayload);

            if (rejectRes.status === 200 && rejectRes.body && rejectRes.body.status === 'QC Rejected') {
                console.log(`   ✅ PASS - Rejection processed correctly`);
                console.log(`   Status: ${rejectRes.body.status}`);
                console.log(`   Linking Active: ${rejectRes.body.linking_active}\n`);
                testsPassed++;
            } else {
                console.log(`   ❌ FAIL - Rejection not processed correctly`);
                console.log(`   Status: ${rejectRes.status}, Body: ${JSON.stringify(rejectRes.body)}\n`);
                testsFailed++;
            }
        } else {
            console.log(`   ❌ FAIL - Could not create test asset\n`);
            testsFailed++;
        }

        // Test 6: Test rework flow
        console.log('📝 TEST 6: Test Rework Flow');
        console.log('   Creating new asset for rework test...');

        const asset3 = { ...testAsset, name: 'Asset for Rework Test' };
        const create3Res = await makeRequest('POST', '/assetLibrary', asset3);

        if (create3Res.status === 201 && create3Res.body && create3Res.body.id) {
            const asset3Id = create3Res.body.id;
            console.log(`   ✅ Asset created (ID: ${asset3Id})`);

            const reworkPayload = {
                qc_score: 60,
                qc_remarks: 'Needs improvements. Please rework.',
                qc_decision: 'rework',
                qc_reviewer_id: 1,
                user_role: 'admin'
            };

            console.log(`   Submitting rework request...`);
            const reworkRes = await makeRequest('POST', `/assetLibrary/${asset3Id}/qc-review`, reworkPayload);

            if (reworkRes.status === 200 && reworkRes.body && reworkRes.body.status === 'Rework Required') {
                console.log(`   ✅ PASS - Rework request processed correctly`);
                console.log(`   Status: ${reworkRes.body.status}`);
                console.log(`   Rework Count: ${reworkRes.body.rework_count}`);
                console.log(`   Linking Active: ${reworkRes.body.linking_active}\n`);
                testsPassed++;
            } else {
                console.log(`   ❌ FAIL - Rework not processed correctly`);
                console.log(`   Status: ${reworkRes.status}, Body: ${JSON.stringify(reworkRes.body)}\n`);
                testsFailed++;
            }
        } else {
            console.log(`   ❌ FAIL - Could not create test asset\n`);
            testsFailed++;
        }

        // Test 7: Test admin role validation
        console.log('📝 TEST 7: Test Admin Role Validation');
        console.log('   Attempting QC review with non-admin role...');

        const nonAdminPayload = {
            ...qcReviewPayload,
            user_role: 'user'
        };

        const nonAdminRes = await makeRequest('POST', `/assetLibrary/${assetId}/qc-review`, nonAdminPayload);

        if (nonAdminRes.status === 403) {
            console.log(`   ✅ PASS - Non-admin access correctly denied`);
            console.log(`   Status: ${nonAdminRes.status}`);
            console.log(`   Error: ${nonAdminRes.body.error}\n`);
            testsPassed++;
        } else {
            console.log(`   ❌ FAIL - Non-admin access not properly validated`);
            console.log(`   Status: ${nonAdminRes.status}\n`);
            testsFailed++;
        }

        // Test 8: Test invalid QC decision
        console.log('📝 TEST 8: Test Invalid QC Decision Validation');
        console.log('   Attempting QC review with invalid decision...');

        const invalidPayload = {
            ...qcReviewPayload,
            qc_decision: 'invalid'
        };

        const invalidRes = await makeRequest('POST', `/assetLibrary/${assetId}/qc-review`, invalidPayload);

        if (invalidRes.status === 400) {
            console.log(`   ✅ PASS - Invalid decision correctly rejected`);
            console.log(`   Status: ${invalidRes.status}`);
            console.log(`   Error: ${invalidRes.body.error}\n`);
            testsPassed++;
        } else {
            console.log(`   ❌ FAIL - Invalid decision not properly validated`);
            console.log(`   Status: ${invalidRes.status}\n`);
            testsFailed++;
        }

        // Summary
        console.log('📊 TEST SUMMARY');
        console.log(`   ✅ Passed: ${testsPassed}`);
        console.log(`   ❌ Failed: ${testsFailed}`);
        console.log(`   Total: ${testsPassed + testsFailed}`);

        if (testsFailed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! QC Review is working correctly.\n');
        } else {
            console.log(`\n⚠️  ${testsFailed} test(s) failed. Please review the errors above.\n`);
        }

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        console.error('   Make sure the API server is running at:', API_BASE);
    }
}

// Run tests
runTests();
