#!/usr/bin/env node

/**
 * Deployment Test Script for Guries Marketing Control Center
 * Tests API endpoints and deployment readiness
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://guries.vercel.app';
const API_BASE = `${BASE_URL}/api/v1`;

// Test data
const testAssetId = '2';
const testData = {
    qc_score: 85,
    qc_remarks: 'Automated deployment test QC review',
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

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

async function testEndpoint(name, url, options = {}) {
    console.log(`\n🧪 Testing ${name}...`);
    console.log(`   URL: ${url}`);
    
    try {
        const response = await makeRequest(url, options);
        console.log(`   ✅ Status: ${response.status}`);
        
        if (response.body) {
            try {
                const jsonData = JSON.parse(response.body);
                console.log(`   📄 Response: ${JSON.stringify(jsonData, null, 2).substring(0, 200)}...`);
                
                if (jsonData.success || jsonData.data) {
                    console.log(`   ✅ ${name} - SUCCESS`);
                    return true;
                } else {
                    console.log(`   ❌ ${name} - FAILED: Invalid response format`);
                    return false;
                }
            } catch (e) {
                console.log(`   ❌ ${name} - FAILED: Invalid JSON`);
                console.log(`   Raw response: ${response.body.substring(0, 200)}...`);
                return false;
            }
        }
        
        return response.status < 400;
    } catch (error) {
        console.log(`   ❌ ${name} - ERROR: ${error.message}`);
        return false;
    }
}

async function runDeploymentTests() {
    console.log('🚀 Starting Deployment Tests for Guries Marketing Control Center');
    console.log(`🌐 Testing against: ${BASE_URL}`);
    console.log('=' .repeat(80));

    const tests = [
        {
            name: 'Health Check',
            url: `${BASE_URL}/api/health`,
            method: 'GET'
        },
        {
            name: 'QC Reviews GET',
            url: `${API_BASE}/qc-reviews?id=${testAssetId}`,
            method: 'GET'
        },
        {
            name: 'QC Review POST (Approve)',
            url: `${API_BASE}/assetLibrary/${testAssetId}/qc-review`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': '1',
                'X-User-Role': 'admin'
            },
            body: JSON.stringify(testData)
        },
        {
            name: 'QC Review POST (Reject)',
            url: `${API_BASE}/assetLibrary/${testAssetId}/qc-review`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': '1',
                'X-User-Role': 'admin'
            },
            body: JSON.stringify({
                ...testData,
                qc_decision: 'rejected',
                qc_remarks: 'Automated test - rejection'
            })
        },
        {
            name: 'QC Review POST (Rework)',
            url: `${API_BASE}/assetLibrary/${testAssetId}/qc-review`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': '1',
                'X-User-Role': 'admin'
            },
            body: JSON.stringify({
                ...testData,
                qc_decision: 'rework',
                qc_remarks: 'Automated test - needs rework'
            })
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const success = await testEndpoint(test.name, test.url, {
            method: test.method,
            headers: test.headers,
            body: test.body
        });
        
        if (success) {
            passed++;
        } else {
            failed++;
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST RESULTS');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Deployment is ready.');
        console.log('✨ QC Review functionality is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the deployment.');
        console.log('🔧 Review the failed tests above and fix any issues.');
    }

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Check Vercel dashboard for deployment logs');
    console.log('2. Monitor the application in production');
    console.log('3. Test QC review functionality in the browser');
    console.log('4. Verify asset status updates are working');
}

// Run the tests
runDeploymentTests().catch(console.error);
