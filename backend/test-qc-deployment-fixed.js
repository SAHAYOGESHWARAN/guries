#!/usr/bin/env node

/**
 * QC Review Deployment Test
 * Tests the fixed QC review endpoint with proper error handling
 */

const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_USER_ID = 1;

// Test data
const testAssets = [
    {
        id: 1,
        name: 'Oncology Treatment Guide',
        type: 'Article',
        application_type: 'web',
        status: 'Pending QC Review',
        seo_score: 85,
        grammar_score: 92,
        submitted_by: 2,
        asset_name: 'Oncology Treatment Guide'
    },
    {
        id: 2,
        name: 'Cardiology SEO Asset',
        type: 'Blog Post',
        application_type: 'seo',
        status: 'Pending QC Review',
        seo_score: 78,
        grammar_score: 88,
        submitted_by: 3,
        asset_name: 'Cardiology SEO Asset'
    }
];

const testCases = [
    {
        name: 'Approve Asset',
        assetId: 1,
        decision: 'approved',
        qcScore: 85,
        remarks: 'Excellent quality, ready for deployment'
    },
    {
        name: 'Reject Asset',
        assetId: 2,
        decision: 'rejected',
        qcScore: 45,
        remarks: 'Content needs significant revision'
    }
];

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
                'X-User-Id': String(ADMIN_USER_ID),
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

async function runTests() {
    console.log('\n========================================');
    console.log('QC Review Deployment Test');
    console.log('========================================\n');

    let passed = 0;
    let failed = 0;

    // Test 1: Verify endpoint exists
    console.log('Test 1: Verify QC Review Endpoint');
    console.log('-----------------------------------');
    try {
        const testData = {
            qc_score: 85,
            qc_remarks: 'Test review',
            qc_decision: 'approved',
            qc_reviewer_id: ADMIN_USER_ID,
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

        const response = await makeRequest('POST', `/api/v1/assetLibrary/1/qc-review`, testData);

        if (response.status === 200) {
            console.log('✓ Endpoint is accessible');
            console.log(`✓ Response status: ${response.status}`);
            console.log(`✓ Asset updated: ${response.data.name || response.data.asset_name}`);
            passed++;
        } else if (response.status === 404) {
            console.log('✗ Endpoint not found (404)');
            console.log('  Expected: POST /api/v1/assetLibrary/:id/qc-review');
            failed++;
        } else {
            console.log(`✗ Unexpected status: ${response.status}`);
            console.log(`  Response: ${JSON.stringify(response.data)}`);
            failed++;
        }
    } catch (error) {
        console.log(`✗ Request failed: ${error.message}`);
        failed++;
    }

    // Test 2: Test approval workflow
    console.log('\n\nTest 2: Approval Workflow');
    console.log('-----------------------------------');
    for (const testCase of testCases) {
        try {
            const testData = {
                qc_score: testCase.qcScore,
                qc_remarks: testCase.remarks,
                qc_decision: testCase.decision,
                qc_reviewer_id: ADMIN_USER_ID,
                user_role: 'Admin',
                checklist_items: {
                    'Brand Compliance': testCase.decision === 'approved',
                    'Technical Specs Met': testCase.decision === 'approved',
                    'Content Quality': testCase.decision === 'approved',
                    'SEO Optimization': testCase.decision === 'approved',
                    'Legal / Regulatory Check': testCase.decision === 'approved',
                    'Tone of Voice': testCase.decision === 'approved'
                },
                checklist_completion: testCase.decision === 'approved',
                linking_active: testCase.decision === 'approved'
            };

            const response = await makeRequest('POST', `/api/v1/assetLibrary/${testCase.assetId}/qc-review`, testData);

            if (response.status === 200) {
                console.log(`✓ ${testCase.name}: Success`);
                console.log(`  Decision: ${testCase.decision}`);
                console.log(`  Score: ${testCase.qcScore}`);
                passed++;
            } else {
                console.log(`✗ ${testCase.name}: Failed (${response.status})`);
                console.log(`  Error: ${response.data.error || JSON.stringify(response.data)}`);
                failed++;
            }
        } catch (error) {
            console.log(`✗ ${testCase.name}: Request failed`);
            console.log(`  Error: ${error.message}`);
            failed++;
        }
    }

    // Test 3: Verify error handling
    console.log('\n\nTest 3: Error Handling');
    console.log('-----------------------------------');

    // Test invalid decision
    try {
        const testData = {
            qc_score: 85,
            qc_remarks: 'Test',
            qc_decision: 'invalid_decision',
            qc_reviewer_id: ADMIN_USER_ID,
            user_role: 'Admin',
            checklist_items: {},
            checklist_completion: false
        };

        const response = await makeRequest('POST', `/api/v1/assetLibrary/1/qc-review`, testData);

        if (response.status === 400) {
            console.log('✓ Invalid decision rejected (400)');
            console.log(`  Error: ${response.data.error}`);
            passed++;
        } else {
            console.log(`✗ Invalid decision not rejected (${response.status})`);
            failed++;
        }
    } catch (error) {
        console.log(`✗ Error handling test failed: ${error.message}`);
        failed++;
    }

    // Test non-admin access
    try {
        const testData = {
            qc_score: 85,
            qc_remarks: 'Test',
            qc_decision: 'approved',
            qc_reviewer_id: 2,
            user_role: 'User',
            checklist_items: {},
            checklist_completion: false
        };

        const url = new URL(API_URL + `/api/v1/assetLibrary/1/qc-review`);
        const options = {
            hostname: url.hostname,
            port: url.port || 3001,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': '2',
                'X-User-Role': 'User'
            }
        };

        const response = await new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(responseData) });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: responseData });
                    }
                });
            });
            req.on('error', reject);
            req.write(JSON.stringify(testData));
            req.end();
        });

        if (response.status === 403) {
            console.log('✓ Non-admin access denied (403)');
            console.log(`  Error: ${response.data.error}`);
            passed++;
        } else {
            console.log(`✗ Non-admin access not denied (${response.status})`);
            failed++;
        }
    } catch (error) {
        console.log(`✗ Non-admin test failed: ${error.message}`);
        failed++;
    }

    // Summary
    console.log('\n\n========================================');
    console.log('Test Summary');
    console.log('========================================');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total:  ${passed + failed}`);
    console.log('========================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
});
