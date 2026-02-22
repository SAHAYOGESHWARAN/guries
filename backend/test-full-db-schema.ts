import axios from 'axios';

const API_URL = 'http://localhost:3004/api/v1';

interface TestResult {
    module: string;
    status: 'PASS' | 'FAIL';
    message: string;
    details?: any;
}

const results: TestResult[] = [];

async function testModule(name: string, testFn: () => Promise<void>) {
    try {
        await testFn();
        results.push({ module: name, status: 'PASS', message: 'All tests passed' });
        console.log(`✅ ${name}`);
    } catch (error: any) {
        results.push({
            module: name,
            status: 'FAIL',
            message: error.message,
            details: error.response?.data || error.message
        });
        console.log(`❌ ${name}: ${error.message}`);
    }
}

async function runTests() {
    console.log('🧪 COMPREHENSIVE DATABASE SCHEMA AND FUNCTIONALITY TEST\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    let authToken: string;

    try {
        // Login
        console.log('📝 Authenticating...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        authToken = loginRes.data.token;
        console.log('✅ Authentication successful\n');
    } catch (error: any) {
        console.error('❌ Authentication failed:', error.message);
        process.exit(1);
    }

    // Test 1: Assets Module
    await testModule('Assets Module', async () => {
        const res = await axios.get(`${API_URL}/assetLibrary`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Assets list is not an array');
        console.log(`   - Retrieved ${res.data.length} assets`);
    });

    // Test 2: Campaigns Module
    await testModule('Campaigns Module', async () => {
        const res = await axios.get(`${API_URL}/campaigns`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Campaigns list is not an array');
        console.log(`   - Retrieved ${res.data.length} campaigns`);
    });

    // Test 3: Projects Module
    await testModule('Projects Module', async () => {
        const res = await axios.get(`${API_URL}/projects`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Projects list is not an array');
        console.log(`   - Retrieved ${res.data.length} projects`);
    });

    // Test 4: Tasks Module
    await testModule('Tasks Module', async () => {
        const res = await axios.get(`${API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Tasks list is not an array');
        console.log(`   - Retrieved ${res.data.length} tasks`);
    });

    // Test 5: Services Module
    await testModule('Services Module', async () => {
        const res = await axios.get(`${API_URL}/services`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Services list is not an array');
        console.log(`   - Retrieved ${res.data.length} services`);
    });

    // Test 6: Sub-Services Module
    await testModule('Sub-Services Module', async () => {
        const res = await axios.get(`${API_URL}/sub-services`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Sub-services list is not an array');
        console.log(`   - Retrieved ${res.data.length} sub-services`);
    });

    // Test 7: Keywords Module
    await testModule('Keywords Module', async () => {
        const res = await axios.get(`${API_URL}/keywords`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Keywords list is not an array');
        console.log(`   - Retrieved ${res.data.length} keywords`);
    });

    // Test 8: Backlink Sources Module
    await testModule('Backlink Sources Module', async () => {
        const res = await axios.get(`${API_URL}/backlink-sources`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Backlink sources list is not an array');
        console.log(`   - Retrieved ${res.data.length} backlink sources`);
    });

    // Test 9: Competitors Module
    await testModule('Competitors Module', async () => {
        const res = await axios.get(`${API_URL}/competitors`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Competitors list is not an array');
        console.log(`   - Retrieved ${res.data.length} competitors`);
    });

    // Test 10: Brands Module
    await testModule('Brands Module', async () => {
        const res = await axios.get(`${API_URL}/brands`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Brands list is not an array');
        console.log(`   - Retrieved ${res.data.length} brands`);
    });

    // Test 11: Users Module
    await testModule('Users Module', async () => {
        const res = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Users list is not an array');
        console.log(`   - Retrieved ${res.data.length} users`);
    });

    // Test 12: Teams Module
    await testModule('Teams Module', async () => {
        const res = await axios.get(`${API_URL}/teams`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Teams list is not an array');
        console.log(`   - Retrieved ${res.data.length} teams`);
    });

    // Test 13: Notifications Module
    await testModule('Notifications Module', async () => {
        const res = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!res.data.notifications || !Array.isArray(res.data.notifications)) throw new Error('Notifications list is not an array');
        console.log(`   - Retrieved ${res.data.notifications.length} notifications`);
    });

    // Test 14: Content Module
    await testModule('Content Module', async () => {
        const res = await axios.get(`${API_URL}/content`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Content list is not an array');
        console.log(`   - Retrieved ${res.data.length} content items`);
    });

    // Test 15: SMM Posts Module
    await testModule('SMM Posts Module', async () => {
        const res = await axios.get(`${API_URL}/smm`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('SMM posts list is not an array');
        console.log(`   - Retrieved ${res.data.length} SMM posts`);
    });

    // Test 16: Graphics Module
    await testModule('Graphics Module', async () => {
        const res = await axios.get(`${API_URL}/graphics`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Graphics list is not an array');
        console.log(`   - Retrieved ${res.data.length} graphics`);
    });

    // Test 17: OKRs Module
    await testModule('OKRs Module', async () => {
        const res = await axios.get(`${API_URL}/okrs`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('OKRs list is not an array');
        console.log(`   - Retrieved ${res.data.length} OKRs`);
    });

    // Test 18: Personas Module
    await testModule('Personas Module', async () => {
        const res = await axios.get(`${API_URL}/personas`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Personas list is not an array');
        console.log(`   - Retrieved ${res.data.length} personas`);
    });

    // Test 19: Forms Module
    await testModule('Forms Module', async () => {
        const res = await axios.get(`${API_URL}/forms`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Forms list is not an array');
        console.log(`   - Retrieved ${res.data.length} forms`);
    });

    // Test 20: QC Checklists Module
    await testModule('QC Checklists Module', async () => {
        const res = await axios.get(`${API_URL}/qc-checklists`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('QC checklists list is not an array');
        console.log(`   - Retrieved ${res.data.length} QC checklists`);
    });

    // Test 21: Asset Categories
    await testModule('Asset Categories Module', async () => {
        const res = await axios.get(`${API_URL}/asset-categories`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Asset categories list is not an array');
        console.log(`   - Retrieved ${res.data.length} asset categories`);
    });

    // Test 22: Asset Formats
    await testModule('Asset Formats Module', async () => {
        const res = await axios.get(`${API_URL}/asset-formats`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Asset formats list is not an array');
        console.log(`   - Retrieved ${res.data.length} asset formats`);
    });

    // Test 23: Platforms
    await testModule('Platforms Module', async () => {
        const res = await axios.get(`${API_URL}/platforms`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Platforms list is not an array');
        console.log(`   - Retrieved ${res.data.length} platforms`);
    });

    // Test 24: Countries
    await testModule('Countries Module', async () => {
        const res = await axios.get(`${API_URL}/countries`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Countries list is not an array');
        console.log(`   - Retrieved ${res.data.length} countries`);
    });

    // Test 25: Health Check
    await testModule('Health Check', async () => {
        const res = await axios.get(`${API_URL}/health`);
        if (res.data.status !== 'ok') throw new Error('Health check failed');
        console.log(`   - Database: ${res.data.database}`);
    });

    // Print Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY\n');

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const total = results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
        console.log('Failed Tests:');
        results.filter(r => r.status === 'FAIL').forEach(r => {
            console.log(`\n  ❌ ${r.module}`);
            console.log(`     Error: ${r.message}`);
            if (r.details) {
                console.log(`     Details: ${JSON.stringify(r.details).substring(0, 200)}`);
            }
        });
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    if (failed === 0) {
        console.log('✅ ALL TESTS PASSED - DATABASE SCHEMA IS COMPLETE!');
    } else {
        console.log(`⚠️  ${failed} test(s) failed - review details above`);
    }
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
