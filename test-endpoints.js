#!/usr/bin/env node

/**
 * End-to-End API Testing Script
 * Tests all major endpoints and features
 */

const http = require('http');

const BASE_URL = 'http://localhost:3003/api/v1/';  // Trailing slash needed for relative path resolution
let authToken = null;

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        // Ensure relative paths resolve against BASE_URL (strip leading slash)
        if (typeof path === 'string' && path.startsWith('/')) {
            path = path.slice(1);
        }
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: parsed
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testEndpoint(name, method, path, body = null, expectedStatus = 200) {
    try {
        const response = await makeRequest(method, path, body);
        const passed = response.status === expectedStatus;

        if (passed) {
            log(`✅ ${name}`, 'green');
            return true;
        } else {
            log(`❌ ${name} - Expected ${expectedStatus}, got ${response.status}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ ${name} - ${error.message}`, 'red');
        return false;
    }
}

async function runTests() {
    log('\n🚀 Starting End-to-End API Tests\n', 'cyan');

    let passed = 0;
    let failed = 0;

    // Test 1: System Stats (No Auth Required)
    log('\n📊 System & Health Checks', 'blue');
    if (await testEndpoint('System Stats', 'GET', '/system/stats', null, 200)) passed++; else failed++;

    // Test 2: Authentication
    log('\n🔐 Authentication Tests', 'blue');

    // Login (use relative path - /auth/login resolves to wrong URL with new URL())
    const loginResponse = await makeRequest('POST', 'auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
    });

    if (loginResponse.status === 200 && loginResponse.body.token) {
        authToken = loginResponse.body.token;
        log('✅ Login successful', 'green');
        passed++;
    } else {
        log(`❌ Login failed - Status: ${loginResponse.status}`, 'red');
        failed++;
    }

    // Test 3: Protected Routes (Dashboard)
    log('\n📈 Dashboard Tests', 'blue');
    if (await testEndpoint('Dashboard Stats', 'GET', '/dashboard/stats', null, 200)) passed++; else failed++;
    if (await testEndpoint('Upcoming Tasks', 'GET', '/dashboard/upcoming-tasks', null, 200)) passed++; else failed++;
    if (await testEndpoint('Recent Activity', 'GET', '/dashboard/recent-activity', null, 200)) passed++; else failed++;

    // Test 4: Notifications
    log('\n🔔 Notification Tests', 'blue');
    if (await testEndpoint('Get Notifications', 'GET', '/notifications', null, 200)) passed++; else failed++;

    // Test 5: Campaigns
    log('\n📢 Campaign Tests', 'blue');
    if (await testEndpoint('Get Campaigns', 'GET', '/campaigns', null, 200)) passed++; else failed++;

    // Test 6: Projects
    log('\n📁 Project Tests', 'blue');
    if (await testEndpoint('Get Projects', 'GET', '/projects', null, 200)) passed++; else failed++;

    // Test 7: Tasks
    log('\n✅ Task Tests', 'blue');
    if (await testEndpoint('Get Tasks', 'GET', '/tasks', null, 200)) passed++; else failed++;

    // Test 8: Assets
    log('\n🎨 Asset Tests', 'blue');
    if (await testEndpoint('Get Assets', 'GET', '/assets', null, 200)) passed++; else failed++;
    if (await testEndpoint('Get Asset Library', 'GET', '/assetLibrary', null, 200)) passed++; else failed++;

    // Test 9: Masters
    log('\n⚙️  Master Data Tests', 'blue');
    if (await testEndpoint('Get Asset Categories', 'GET', '/asset-categories', null, 200)) passed++; else failed++;
    if (await testEndpoint('Get Asset Formats', 'GET', '/asset-formats', null, 200)) passed++; else failed++;
    if (await testEndpoint('Get Platforms', 'GET', '/platforms', null, 200)) passed++; else failed++;
    if (await testEndpoint('Get Countries', 'GET', '/country-master', null, 200)) passed++; else failed++;

    // Test 10: Analytics
    log('\n📊 Analytics Tests', 'blue');
    if (await testEndpoint('Get Analytics Dashboard', 'GET', '/analytics-dashboard', null, 200)) passed++; else failed++;

    // Test 11: Employee Management
    log('\n👥 Employee Tests', 'blue');
    if (await testEndpoint('Get Employee Scorecard', 'GET', '/employee-scorecard', null, 200)) passed++; else failed++;
    if (await testEndpoint('Get Employee Comparison', 'GET', '/employee-comparison', null, 200)) passed++; else failed++;

    // Test 12: QC & Quality
    log('\n✔️  QC Tests', 'blue');
    if (await testEndpoint('Get QC Weightage', 'GET', '/qc-weightage', null, 200)) passed++; else failed++;

    // Test 13: SEO Assets
    log('\n🔍 SEO Asset Tests', 'blue');
    if (await testEndpoint('Get SEO Assets', 'GET', '/seo-assets', null, 200)) passed++; else failed++;
    if (await testEndpoint('Get SEO Asset Master Data', 'GET', '/seo-assets/master/sectors', null, 200)) passed++; else failed++;

    // Test 14: Error Handling
    log('\n⚠️  Error Handling Tests', 'blue');
    if (await testEndpoint('Invalid Route', 'GET', '/invalid-route', null, 404)) passed++; else failed++;
    if (await testEndpoint('Unauthorized Access', 'GET', '/admin/qc/assets', null, 401)) passed++; else failed++;

    // Summary
    log('\n' + '='.repeat(50), 'cyan');
    log(`\n📊 Test Summary`, 'cyan');
    log(`✅ Passed: ${passed}`, 'green');
    log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%\n`, 'blue');

    process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    process.exit(1);
});
