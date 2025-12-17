// Final comprehensive integration test for all 7 requirements
const https = require('http');

const BASE_URL = 'http://localhost:3003/api/v1';

async function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const result = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, data: result });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function finalIntegrationTest() {
    console.log('🎯 Final Integration Test - All 7 Requirements\n');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Test 1: Asset Categories Master Table (Requirement 6)
    console.log('1️⃣ Testing Asset Categories Master Table...');
    try {
        const response = await makeRequest(`${BASE_URL}/asset-categories`);
        if (response.status === 200 && Array.isArray(response.data) && response.data.length >= 10) {
            console.log('✅ PASS: Asset Categories API working with', response.data.length, 'categories');
            results.passed++;
            results.tests.push({ name: 'Asset Categories Master Table', status: 'PASS', details: `${response.data.length} categories found` });
        } else {
            console.log('❌ FAIL: Asset Categories API issue');
            results.failed++;
            results.tests.push({ name: 'Asset Categories Master Table', status: 'FAIL', details: 'API not working properly' });
        }
    } catch (error) {
        console.log('❌ FAIL: Asset Categories API error:', error.message);
        results.failed++;
        results.tests.push({ name: 'Asset Categories Master Table', status: 'FAIL', details: error.message });
    }

    // Test 2: Keywords Master Database Integration (Requirement 7)
    console.log('\n2️⃣ Testing Keywords Master Database Integration...');
    try {
        const response = await makeRequest(`${BASE_URL}/keywords`);
        if (response.status === 200 && Array.isArray(response.data) && response.data.length >= 16) {
            console.log('✅ PASS: Keywords API working with', response.data.length, 'keywords');
            results.passed++;
            results.tests.push({ name: 'Keywords Master Database', status: 'PASS', details: `${response.data.length} keywords found` });
        } else {
            console.log('❌ FAIL: Keywords API issue');
            results.failed++;
            results.tests.push({ name: 'Keywords Master Database', status: 'FAIL', details: 'API not working properly' });
        }
    } catch (error) {
        console.log('❌ FAIL: Keywords API error:', error.message);
        results.failed++;
        results.tests.push({ name: 'Keywords Master Database', status: 'FAIL', details: error.message });
    }

    // Test 3: Asset Creation Without Usage Status (Requirement 3)
    console.log('\n3️⃣ Testing Asset Creation Without Usage Status...');
    try {
        const testAsset = {
            name: 'Final Test Asset - ' + Date.now(),
            type: 'article',
            application_type: 'web',
            asset_category: 'best practices',
            asset_format: 'image',
            repository: 'Content Repository',
            status: 'Draft',
            web_description: 'Final integration test asset',
            keywords: ['digital marketing', 'SEO optimization']
        };

        const createResponse = await makeRequest(`${BASE_URL}/assetLibrary`, 'POST', testAsset);
        if (createResponse.status === 201) {
            console.log('✅ PASS: Asset creation working without usage_status');
            results.passed++;
            results.tests.push({ name: 'Asset Creation (No Usage Status)', status: 'PASS', details: 'Asset created successfully' });

            // Clean up
            if (createResponse.data.id) {
                await makeRequest(`${BASE_URL}/assetLibrary/${createResponse.data.id}`, 'DELETE');
            }
        } else {
            console.log('❌ FAIL: Asset creation failed');
            results.failed++;
            results.tests.push({ name: 'Asset Creation (No Usage Status)', status: 'FAIL', details: 'Asset creation failed' });
        }
    } catch (error) {
        console.log('❌ FAIL: Asset creation error:', error.message);
        results.failed++;
        results.tests.push({ name: 'Asset Creation (No Usage Status)', status: 'FAIL', details: error.message });
    }

    // Test 4: Asset Library API (General functionality)
    console.log('\n4️⃣ Testing Asset Library API...');
    try {
        const response = await makeRequest(`${BASE_URL}/assetLibrary`);
        if (response.status === 200) {
            console.log('✅ PASS: Asset Library API working');
            results.passed++;
            results.tests.push({ name: 'Asset Library API', status: 'PASS', details: 'API responding correctly' });
        } else {
            console.log('❌ FAIL: Asset Library API issue');
            results.failed++;
            results.tests.push({ name: 'Asset Library API', status: 'FAIL', details: 'API not responding' });
        }
    } catch (error) {
        console.log('❌ FAIL: Asset Library API error:', error.message);
        results.failed++;
        results.tests.push({ name: 'Asset Library API', status: 'FAIL', details: error.message });
    }

    // Test 5: Frontend Requirements (Manual verification needed)
    console.log('\n5️⃣ Frontend Requirements (Manual Verification Required)...');
    console.log('   📋 Requirements 1, 4, 5 need manual verification:');
    console.log('   1. SMM → Only one image upload (Frontend)');
    console.log('   4. "Service Linking" renamed to "Map Asset to Services" (Frontend)');
    console.log('   5. Content type static after choosing WEB (Frontend)');

    results.tests.push({ name: 'SMM Single Image Upload', status: 'MANUAL', details: 'Requires frontend testing' });
    results.tests.push({ name: 'Map Asset to Services Label', status: 'MANUAL', details: 'Requires frontend testing' });
    results.tests.push({ name: 'WEB Content Type Static', status: 'MANUAL', details: 'Requires frontend testing' });

    // Summary
    console.log('\n🎉 Final Integration Test Results:');
    console.log('=====================================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📋 Manual: 3`);
    console.log('=====================================');

    console.log('\n📊 Detailed Results:');
    results.tests.forEach((test, index) => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '📋';
        console.log(`${icon} ${test.name}: ${test.status} - ${test.details}`);
    });

    console.log('\n🚀 Overall Status:');
    if (results.failed === 0) {
        console.log('✅ ALL BACKEND TESTS PASSED - Ready for production!');
        console.log('📋 Manual frontend verification recommended');
    } else {
        console.log('❌ Some tests failed - Please review and fix issues');
    }

    console.log('\n📖 Next Steps:');
    console.log('1. Open http://localhost:5173 to verify frontend');
    console.log('2. Navigate to Assets → Create Asset');
    console.log('3. Verify all 7 requirements manually');
    console.log('4. Use frontend-verification.html for guided testing');
}

finalIntegrationTest();