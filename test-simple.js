#!/usr/bin/env node

/**
 * Simple End-to-End Test
 * Tests basic connectivity and mock data responses
 */

const http = require('http');

const BASE_URL = 'http://localhost:3003/api/v1';

function makeRequest(method, path) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
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
                        body: parsed
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        body: data
                    });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function runTests() {
    console.log('\n🚀 Simple End-to-End API Tests\n');

    let passed = 0;
    let failed = 0;

    const tests = [
        { name: 'Health Check', method: 'GET', path: '/health', expectedStatus: 200 },
        { name: 'System Stats', method: 'GET', path: '/system/stats', expectedStatus: 200 },
        { name: 'Get Campaigns', method: 'GET', path: '/campaigns', expectedStatus: 401 },
        { name: 'Get Projects', method: 'GET', path: '/projects', expectedStatus: 401 },
        { name: 'Get Tasks', method: 'GET', path: '/tasks', expectedStatus: 401 },
        { name: 'Get Assets', method: 'GET', path: '/assets', expectedStatus: 401 },
    ];

    for (const test of tests) {
        try {
            const response = await makeRequest(test.method, test.path);
            const passed_test = response.status === test.expectedStatus;

            if (passed_test) {
                console.log(`✅ ${test.name} - ${response.status}`);
                passed++;
            } else {
                console.log(`❌ ${test.name} - Expected ${test.expectedStatus}, got ${response.status}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} - ${error.message}`);
            failed++;
        }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
    console.error(`\n❌ Test error: ${error.message}`);
    process.exit(1);
});
