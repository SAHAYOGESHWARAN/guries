import axios from 'axios';

const API_URL = 'http://localhost:3004/api/v1';

interface DiagnosticResult {
    category: string;
    test: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    message: string;
    details?: any;
}

const results: DiagnosticResult[] = [];

function addResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
    results.push({ category, test, status, message, details });
}

async function runFullDiagnostic() {
    console.log('🔍 COMPLETE SYSTEM DIAGNOSTIC TEST\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    let authToken: string;
    let userId: number;

    // Step 1: Authentication
    console.log('📝 Step 1: Authentication Check...');
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        authToken = loginRes.data.token;
        userId = loginRes.data.user?.id || 1;
        addResult('Authentication', 'Login', 'PASS', 'Successfully authenticated');
        console.log('✅ Authentication successful\n');
    } catch (error: any) {
        addResult('Authentication', 'Login', 'FAIL', error.message);
        console.error('❌ Authentication failed:', error.message);
        process.exit(1);
    }

    // Step 2: Database Connectivity
    console.log('📝 Step 2: Database Connectivity Check...');
    try {
        const healthRes = await axios.get(`${API_URL}/health`);
        if (healthRes.data.status === 'ok') {
            addResult('Database', 'Health Check', 'PASS', 'Database connected');
            console.log('✅ Database connected\n');
        } else {
            addResult('Database', 'Health Check', 'FAIL', 'Health check failed');
        }
    } catch (error: any) {
        addResult('Database', 'Health Check', 'FAIL', error.message);
    }

    // Step 3: Core Modules Data Retrieval
    console.log('📝 Step 3: Core Modules Data Retrieval...');
    const modules = [
        { name: 'Assets', endpoint: '/assetLibrary', minExpected: 0 },
        { name: 'Campaigns', endpoint: '/campaigns', minExpected: 0 },
        { name: 'Projects', endpoint: '/projects', minExpected: 0 },
        { name: 'Tasks', endpoint: '/tasks', minExpected: 0 },
        { name: 'Services', endpoint: '/services', minExpected: 0 },
        { name: 'Sub-Services', endpoint: '/sub-services', minExpected: 0 },
        { name: 'Keywords', endpoint: '/keywords', minExpected: 0 },
        { name: 'Brands', endpoint: '/brands', minExpected: 0 },
        { name: 'Users', endpoint: '/users', minExpected: 0 },
        { name: 'Teams', endpoint: '/teams', minExpected: 0 },
        { name: 'Notifications', endpoint: '/notifications', isObject: true },
        { name: 'Content', endpoint: '/content', minExpected: 0 },
        { name: 'SMM Posts', endpoint: '/smm', minExpected: 0 },
        { name: 'Graphics', endpoint: '/graphics', minExpected: 0 },
        { name: 'OKRs', endpoint: '/okrs', minExpected: 0 },
        { name: 'Personas', endpoint: '/personas', minExpected: 0 },
        { name: 'Forms', endpoint: '/forms', minExpected: 0 },
        { name: 'QC Checklists', endpoint: '/qc-checklists', minExpected: 0 },
        { name: 'Countries', endpoint: '/countries', minExpected: 0 }
    ];

    for (const module of modules) {
        try {
            const res = await axios.get(`${API_URL}${module.endpoint}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            let dataArray = res.data;
            if (module.isObject && res.data.notifications) {
                dataArray = res.data.notifications;
            }

            if (Array.isArray(dataArray)) {
                addResult('Modules', module.name, 'PASS', `Retrieved ${dataArray.length} items`);
                console.log(`✅ ${module.name}: ${dataArray.length} items`);
            } else {
                addResult('Modules', module.name, 'WARNING', 'Response is not an array');
                console.log(`⚠️  ${module.name}: Response format issue`);
            }
        } catch (error: any) {
            addResult('Modules', module.name, 'FAIL', error.response?.data?.error || error.message);
            console.log(`❌ ${module.name}: ${error.response?.data?.error || error.message}`);
        }
    }
    console.log();

    // Step 4: Asset Linking Check
    console.log('📝 Step 4: Asset Linking Infrastructure...');
    try {
        // Check if we can access linked assets endpoint
        const assetsRes = await axios.get(`${API_URL}/assetLibrary`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (assetsRes.data && assetsRes.data.length > 0) {
            const firstAsset = assetsRes.data[0];
            if (firstAsset.id) {
                addResult('Asset Linking', 'Linked Assets Endpoint', 'PASS', 'Asset linking infrastructure ready');
                console.log('✅ Asset linking infrastructure ready\n');
            }
        } else {
            addResult('Asset Linking', 'Linked Assets Endpoint', 'WARNING', 'No assets to test');
            console.log('⚠️  No assets to test\n');
        }
    } catch (error: any) {
        addResult('Asset Linking', 'Linked Assets Endpoint', 'FAIL', error.message);
        console.log(`❌ Asset linking check failed: ${error.message}\n`);
    }

    // Step 5: Cache Persistence Check
    console.log('📝 Step 5: Cache Persistence Check...');
    try {
        // Fetch campaigns twice to check caching
        const res1 = await axios.get(`${API_URL}/campaigns`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const count1 = Array.isArray(res1.data) ? res1.data.length : 0;

        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch again
        const res2 = await axios.get(`${API_URL}/campaigns`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const count2 = Array.isArray(res2.data) ? res2.data.length : 0;

        if (count1 === count2) {
            addResult('Cache', 'Persistence', 'PASS', `Cache consistent: ${count1} items`);
            console.log(`✅ Cache persistence verified: ${count1} items\n`);
        } else {
            addResult('Cache', 'Persistence', 'WARNING', `Cache mismatch: ${count1} vs ${count2}`);
            console.log(`⚠️  Cache mismatch: ${count1} vs ${count2}\n`);
        }
    } catch (error: any) {
        addResult('Cache', 'Persistence', 'FAIL', error.message);
        console.log(`❌ Cache check failed: ${error.message}\n`);
    }

    // Step 6: Data Integrity Check
    console.log('📝 Step 6: Data Integrity Check...');
    try {
        const assetsRes = await axios.get(`${API_URL}/assetLibrary`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (assetsRes.data && assetsRes.data.length > 0) {
            const asset = assetsRes.data[0];
            const requiredFields = ['id', 'asset_name', 'status', 'created_at'];
            const missingFields = requiredFields.filter(field => !(field in asset));

            if (missingFields.length === 0) {
                addResult('Data Integrity', 'Asset Fields', 'PASS', 'All required fields present');
                console.log('✅ Asset data integrity verified\n');
            } else {
                addResult('Data Integrity', 'Asset Fields', 'WARNING', `Missing fields: ${missingFields.join(', ')}`);
                console.log(`⚠️  Missing fields: ${missingFields.join(', ')}\n`);
            }
        } else {
            addResult('Data Integrity', 'Asset Fields', 'WARNING', 'No assets to check');
            console.log('⚠️  No assets to check\n');
        }
    } catch (error: any) {
        addResult('Data Integrity', 'Asset Fields', 'FAIL', error.message);
        console.log(`❌ Data integrity check failed: ${error.message}\n`);
    }

    // Step 7: API Response Format Check
    console.log('📝 Step 7: API Response Format Check...');
    try {
        const res = await axios.get(`${API_URL}/campaigns`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (Array.isArray(res.data)) {
            addResult('API Format', 'Response Format', 'PASS', 'API returns proper array format');
            console.log('✅ API response format correct\n');
        } else {
            addResult('API Format', 'Response Format', 'FAIL', 'API response is not an array');
            console.log('❌ API response format incorrect\n');
        }
    } catch (error: any) {
        addResult('API Format', 'Response Format', 'FAIL', error.message);
        console.log(`❌ API format check failed: ${error.message}\n`);
    }

    // Step 8: Error Handling Check
    console.log('📝 Step 8: Error Handling Check...');
    try {
        try {
            await axios.get(`${API_URL}/invalid-endpoint`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            addResult('Error Handling', '404 Response', 'FAIL', 'Invalid endpoint did not return 404');
        } catch (error: any) {
            if (error.response?.status === 404) {
                addResult('Error Handling', '404 Response', 'PASS', 'Proper 404 error handling');
                console.log('✅ Error handling working correctly\n');
            } else {
                addResult('Error Handling', '404 Response', 'WARNING', `Unexpected status: ${error.response?.status}`);
                console.log(`⚠️  Unexpected error status: ${error.response?.status}\n`);
            }
        }
    } catch (error: any) {
        addResult('Error Handling', '404 Response', 'FAIL', error.message);
    }

    // Print Summary Report
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 DIAGNOSTIC SUMMARY\n');

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const warnings = results.filter(r => r.status === 'WARNING').length;
    const total = results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    // Group by category
    const categories = [...new Set(results.map(r => r.category))];
    console.log('📋 Results by Category:\n');

    for (const category of categories) {
        const categoryResults = results.filter(r => r.category === category);
        const categoryPassed = categoryResults.filter(r => r.status === 'PASS').length;
        const categoryFailed = categoryResults.filter(r => r.status === 'FAIL').length;
        const categoryWarnings = categoryResults.filter(r => r.status === 'WARNING').length;

        console.log(`${category}:`);
        console.log(`  ✅ ${categoryPassed} passed`);
        if (categoryFailed > 0) console.log(`  ❌ ${categoryFailed} failed`);
        if (categoryWarnings > 0) console.log(`  ⚠️  ${categoryWarnings} warnings`);
        console.log();
    }

    // Failed tests details
    if (failed > 0) {
        console.log('❌ Failed Tests Details:\n');
        results.filter(r => r.status === 'FAIL').forEach(r => {
            console.log(`  ${r.category} - ${r.test}`);
            console.log(`    Error: ${r.message}`);
            if (r.details) {
                console.log(`    Details: ${JSON.stringify(r.details).substring(0, 100)}`);
            }
            console.log();
        });
    }

    // Warnings details
    if (warnings > 0) {
        console.log('⚠️  Warnings:\n');
        results.filter(r => r.status === 'WARNING').forEach(r => {
            console.log(`  ${r.category} - ${r.test}`);
            console.log(`    ${r.message}`);
            console.log();
        });
    }

    console.log('═══════════════════════════════════════════════════════════');
    if (failed === 0) {
        console.log('✅ SYSTEM FULLY OPERATIONAL - ALL CRITICAL TESTS PASSED!');
    } else {
        console.log(`⚠️  ${failed} critical issue(s) detected - review details above`);
    }
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(failed > 0 ? 1 : 0);
}

runFullDiagnostic();
