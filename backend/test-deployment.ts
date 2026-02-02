/**
 * Deployment Test Script
 * Tests all new endpoints and functionality
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL';
    error?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
    try {
        await fn();
        results.push({ name, status: 'PASS' });
        console.log(`✅ ${name}`);
    } catch (error: any) {
        results.push({ name, status: 'FAIL', error: error.message });
        console.log(`❌ ${name}: ${error.message}`);
    }
}

async function runTests() {
    console.log('🧪 Starting Deployment Tests...\n');

    // Test 1: Health Check
    await test('Health Check', async () => {
        const response = await axios.get(`${BASE_URL}/health`);
        if (response.status !== 200) throw new Error('Health check failed');
    });

    // Test 2: Get Services
    await test('Get Services', async () => {
        const response = await axios.get(`${BASE_URL}/services`);
        if (!Array.isArray(response.data)) throw new Error('Services not an array');
    });

    // Test 3: Get Pending QC Assets
    await test('Get Pending QC Assets', async () => {
        const response = await axios.get(`${BASE_URL}/qc-review/pending`);
        if (!response.data.assets) throw new Error('No assets in response');
    });

    // Test 4: Create Asset with Service Link (Mock)
    await test('Asset Upload Endpoint Exists', async () => {
        try {
            await axios.post(`${BASE_URL}/assets/upload-with-service`, {
                name: 'Test Asset',
                application_type: 'WEB',
                created_by: 1
            });
        } catch (error: any) {
            // Expected to fail without proper data, but endpoint should exist
            if (error.response?.status === 400 || error.response?.status === 201) {
                return; // Endpoint exists
            }
            throw error;
        }
    });

    // Test 5: QC Review Routes
    await test('QC Review Routes Registered', async () => {
        try {
            await axios.get(`${BASE_URL}/qc-review/pending`);
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('QC Review routes not found');
            }
        }
    });

    // Print Summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    console.log(`Passed: ${passed}/${results.length}`);
    console.log(`Failed: ${failed}/${results.length}`);

    if (failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.filter(r => r.status === 'FAIL').forEach(r => {
            console.log(`  - ${r.name}: ${r.error}`);
        });
    }

    process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
});
