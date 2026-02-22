/**
 * Real-time Test Script for Asset Creation Fix - Version 2
 * Tests the complete asset creation and QC submission workflow
 */

const API_BASE_URL = 'http://localhost:3004/api/v1';

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL';
    message: string;
    details?: any;
}

const results: TestResult[] = [];
let authToken: string | null = null;

// Helper function to make API calls
async function apiCall(method: string, endpoint: string, body?: any) {
    try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json();
        return { status: response.status, data };
    } catch (error: any) {
        return { status: 0, error: error.message };
    }
}

// Get authentication token
async function getAuthToken() {
    console.log('🔐 Attempting authentication...');

    const result = await apiCall('POST', '/auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
    });

    if (result.status === 200 && result.data?.token) {
        authToken = result.data.token;
        console.log('✅ Authentication successful\n');
        return true;
    } else {
        console.log('⚠️  Authentication failed, proceeding without token\n');
        return false;
    }
}

// Test 1: Create asset with valid application_type
async function test1CreateAssetWithValidType() {
    console.log('\n📝 Test 1: Create asset with valid application_type (WEB)');

    const payload = {
        name: 'Test Web Asset - ' + Date.now(),
        type: 'article',
        application_type: 'WEB',
        asset_category: 'Blog',
        status: 'Draft',
        created_by: 1,
        keywords: ['test', 'web']
    };

    const result = await apiCall('POST', '/assetLibrary', payload);

    if (result.status === 201 && result.data?.asset?.id) {
        results.push({
            name: 'Create Asset with Valid Type',
            status: 'PASS',
            message: 'Asset created successfully',
            details: {
                assetId: result.data.asset.id,
                name: result.data.asset.name,
                application_type: result.data.asset.application_type,
                status: result.data.asset.status
            }
        });
        return result.data.asset.id;
    } else {
        results.push({
            name: 'Create Asset with Valid Type',
            status: 'FAIL',
            message: `Expected 201, got ${result.status}`,
            details: result.data || result.error
        });
        return null;
    }
}

// Test 2: Create asset with lowercase application_type
async function test2CreateAssetWithLowercaseType() {
    console.log('\n📝 Test 2: Create asset with lowercase application_type (seo)');

    const payload = {
        name: 'Test SEO Asset - ' + Date.now(),
        type: 'article',
        application_type: 'seo',
        asset_category: 'SEO',
        status: 'Draft',
        created_by: 1
    };

    const result = await apiCall('POST', '/assetLibrary', payload);

    if (result.status === 201 && result.data?.asset?.id) {
        results.push({
            name: 'Create Asset with Lowercase Type',
            status: 'PASS',
            message: 'Asset created successfully with normalized type',
            details: {
                assetId: result.data.asset.id,
                application_type: result.data.asset.application_type
            }
        });
        return result.data.asset.id;
    } else {
        results.push({
            name: 'Create Asset with Lowercase Type',
            status: 'FAIL',
            message: `Expected 201, got ${result.status}`,
            details: result.data || result.error
        });
        return null;
    }
}

// Test 3: Create asset without application_type (should fail)
async function test3CreateAssetWithoutType() {
    console.log('\n📝 Test 3: Create asset WITHOUT application_type (should fail)');

    const payload = {
        name: 'Test Asset No Type - ' + Date.now(),
        type: 'article',
        status: 'Draft',
        created_by: 1
    };

    const result = await apiCall('POST', '/assetLibrary', payload);

    if (result.status === 400 && result.data?.error) {
        results.push({
            name: 'Create Asset Without Type (Validation)',
            status: 'PASS',
            message: 'Correctly rejected asset without application_type',
            details: { error: result.data.error }
        });
    } else {
        results.push({
            name: 'Create Asset Without Type (Validation)',
            status: 'FAIL',
            message: `Expected 400 error, got ${result.status}`,
            details: result.data || result.error
        });
    }
}

// Test 4: Create asset with invalid application_type (should fail)
async function test4CreateAssetWithInvalidType() {
    console.log('\n📝 Test 4: Create asset with INVALID application_type (should fail)');

    const payload = {
        name: 'Test Asset Invalid Type - ' + Date.now(),
        type: 'article',
        application_type: 'INVALID_TYPE',
        status: 'Draft',
        created_by: 1
    };

    const result = await apiCall('POST', '/assetLibrary', payload);

    if (result.status === 400 && result.data?.error) {
        results.push({
            name: 'Create Asset with Invalid Type (Validation)',
            status: 'PASS',
            message: 'Correctly rejected asset with invalid application_type',
            details: { error: result.data.error }
        });
    } else {
        results.push({
            name: 'Create Asset with Invalid Type (Validation)',
            status: 'FAIL',
            message: `Expected 400 error, got ${result.status}`,
            details: result.data || result.error
        });
    }
}

// Test 5: Verify asset appears in list
async function test5AssetAppearsInList(assetId: number) {
    console.log('\n📝 Test 5: Verify asset appears in asset list');

    const result = await apiCall('GET', '/assetLibrary', undefined);

    if (result.status === 200 && Array.isArray(result.data)) {
        const asset = result.data.find((a: any) => a.id === assetId);
        if (asset && asset.application_type) {
            results.push({
                name: 'Asset Appears in List',
                status: 'PASS',
                message: 'Asset found in list with application_type',
                details: {
                    assetId: asset.id,
                    name: asset.name,
                    application_type: asset.application_type,
                    totalAssets: result.data.length
                }
            });
        } else {
            results.push({
                name: 'Asset Appears in List',
                status: 'FAIL',
                message: 'Asset not found in list or missing application_type',
                details: { totalAssets: result.data.length }
            });
        }
    } else {
        results.push({
            name: 'Asset Appears in List',
            status: 'FAIL',
            message: `Expected 200, got ${result.status}`,
            details: result.data || result.error
        });
    }
}

// Test 6: Submit asset for QC
async function test6SubmitAssetForQC(assetId: number) {
    console.log('\n📝 Test 6: Submit asset for QC review');

    const payload = {
        seo_score: 85,
        grammar_score: 90,
        submitted_by: 1
    };

    const result = await apiCall('POST', `/assetLibrary/${assetId}/submit-qc`, payload);

    if (result.status === 200 && result.data?.status === 'Pending QC Review') {
        results.push({
            name: 'Submit Asset for QC',
            status: 'PASS',
            message: 'Asset submitted for QC successfully',
            details: {
                assetId: result.data.id,
                status: result.data.status,
                seo_score: result.data.seo_score,
                grammar_score: result.data.grammar_score
            }
        });
    } else {
        results.push({
            name: 'Submit Asset for QC',
            status: 'FAIL',
            message: `Expected 200 with Pending QC Review status, got ${result.status}`,
            details: result.data || result.error
        });
    }
}

// Test 7: Verify asset appears in QC pending list
async function test7AssetAppearsInQCList(assetId: number) {
    console.log('\n📝 Test 7: Verify asset appears in Pending QC Review list');

    const result = await apiCall('GET', '/assetLibrary/qc/pending', undefined);

    if (result.status === 200 && Array.isArray(result.data)) {
        const asset = result.data.find((a: any) => a.id === assetId);
        if (asset && asset.status === 'Pending QC Review') {
            results.push({
                name: 'Asset Appears in QC List',
                status: 'PASS',
                message: 'Asset found in Pending QC Review list',
                details: {
                    assetId: asset.id,
                    name: asset.name,
                    status: asset.status,
                    totalPending: result.data.length
                }
            });
        } else {
            results.push({
                name: 'Asset Appears in QC List',
                status: 'FAIL',
                message: 'Asset not found in QC list or wrong status',
                details: { totalPending: result.data.length }
            });
        }
    } else {
        results.push({
            name: 'Asset Appears in QC List',
            status: 'FAIL',
            message: `Expected 200, got ${result.status}`,
            details: result.data || result.error
        });
    }
}

// Test 8: Submit without scores (should fail)
async function test8SubmitAssetWithoutScores(assetId: number) {
    console.log('\n📝 Test 8: Submit asset WITHOUT scores (should fail)');

    const payload = {
        submitted_by: 1
    };

    const result = await apiCall('POST', `/assetLibrary/${assetId}/submit-qc`, payload);

    if (result.status === 400 && result.data?.error) {
        results.push({
            name: 'Submit Without Scores (Validation)',
            status: 'PASS',
            message: 'Correctly rejected submission without scores',
            details: { error: result.data.error }
        });
    } else {
        results.push({
            name: 'Submit Without Scores (Validation)',
            status: 'FAIL',
            message: `Expected 400 error, got ${result.status}`,
            details: result.data || result.error
        });
    }
}

// Main test runner
async function runTests() {
    console.log('🧪 Starting Real-time Asset Creation Tests');
    console.log('==========================================');
    console.log(`API Base URL: ${API_BASE_URL}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    try {
        // Get authentication
        await getAuthToken();

        // Test validation
        await test3CreateAssetWithoutType();
        await test4CreateAssetWithInvalidType();

        // Test creation with valid types
        const assetId1 = await test1CreateAssetWithValidType();
        const assetId2 = await test2CreateAssetWithLowercaseType();

        // Test asset appears in list
        if (assetId1) {
            await test5AssetAppearsInList(assetId1);
        }

        // Test QC submission
        if (assetId1) {
            await test6SubmitAssetForQC(assetId1);
            await test7AssetAppearsInQCList(assetId1);
        }

        // Test validation on submission
        if (assetId2) {
            await test8SubmitAssetWithoutScores(assetId2);
        }

        // Print results
        console.log('\n\n📊 TEST RESULTS');
        console.log('==========================================');

        const passed = results.filter(r => r.status === 'PASS').length;
        const failed = results.filter(r => r.status === 'FAIL').length;

        results.forEach((result, index) => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            console.log(`\n${icon} Test ${index + 1}: ${result.name}`);
            console.log(`   Status: ${result.status}`);
            console.log(`   Message: ${result.message}`);
            if (result.details) {
                console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
            }
        });

        console.log('\n==========================================');
        console.log(`📈 Summary: ${passed} PASSED, ${failed} FAILED out of ${results.length} tests`);
        console.log('==========================================\n');

        if (failed === 0) {
            console.log('🎉 All tests passed! Asset creation fix is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please review the details above.');
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error);
    }
}

// Run tests
runTests();
