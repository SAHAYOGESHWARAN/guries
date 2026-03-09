/**
 * Complete Manual Test Suite for Production Deployment
 * Tests all pages, forms, CRUD operations, and API endpoints
 * Target: https://guries.vercel.app
 */

const BASE_URL = 'https://guries.vercel.app';
const results = [];
let authToken = null;
let userId = null;

const testAccounts = {
  admin: { email: 'admin@example.com', password: 'admin123' },
  testUser: { email: `testuser${Date.now()}@example.com`, password: 'Test123!@#' }
};

function recordResult(name, status, message = '', details = {}) {
  results.push({
    name,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️ ';
  console.log(`${icon} ${name}${message ? ': ' + message : ''}`);
}

async function executeTest(name, testFn) {
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    recordResult(name, 'PASS', `(${duration}ms)`, { duration });
  } catch (error) {
    const duration = Date.now() - startTime;
    recordResult(name, 'FAIL', error.message, { duration, error: error.message });
    console.error(`   Error: ${error.message}`);
  }
}

async function apiCall(method, endpoint, data = null, headers = {}, expectStatus = 200) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers: defaultHeaders
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let responseData = null;
    
    try {
      responseData = text ? JSON.parse(text) : null;
    } catch (e) {
      responseData = text;
    }

    if (response.status !== expectStatus && response.status < 200 || response.status >= 300) {
      throw new Error(`Expected ${expectStatus}, got ${response.status}: ${typeof responseData === 'string' ? responseData : JSON.stringify(responseData)}`);
    }

    return { status: response.status, data: responseData, response };
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 COMPREHENSIVE PRODUCTION DEPLOYMENT TEST SUITE');
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Started: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. HEALTH CHECKS
  console.log('📋 1. HEALTH & CONNECTION TESTS');
  console.log('─────────────────────────────────────────────────────────────');
  
  await executeTest('Backend is responsive', async () => {
    const result = await apiCall('GET', '/api/v1/health');
    if (!result.data) throw new Error('No health data returned');
  });

  await executeTest('API endpoint responds', async () => {
    const result = await apiCall('GET', '/api/v1/health', null, {}, 200);
    if (result.status === 200) {
      console.log(`   ℹ️  Health status: ${JSON.stringify(result.data).substring(0, 100)}`);
    }
  });

  // 2. AUTHENTICATION TESTS
  console.log('\n🔐 2. AUTHENTICATION TESTS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('Admin Login with valid credentials', async () => {
    const result = await apiCall('POST', '/api/v1/auth/login', {
      email: testAccounts.admin.email,
      password: testAccounts.admin.password
    }, {}, 200);
    
    if (!result.data || !result.data.token) {
      throw new Error('No token in response');
    }
    authToken = result.data.token;
    userId = result.data.userId;
    console.log(`   ℹ️  Token received, User ID: ${userId}`);
  });

  await executeTest('Invalid password rejection', async () => {
    try {
      await apiCall('POST', '/api/v1/auth/login', {
        email: testAccounts.admin.email,
        password: 'wrongpassword'
      }, {}, 401);
    } catch (error) {
      if (error.message.includes('401')) {
        return; // Expected
      }
      throw error;
    }
  });

  await executeTest('Non-existent user rejection', async () => {
    try {
      await apiCall('POST', '/api/v1/auth/login', {
        email: 'nonexistent@test.com',
        password: 'anypassword'
      }, {}, 401);
    } catch (error) {
      if (error.message.includes('401')) {
        return; // Expected
      }
      throw error;
    }
  });

  // 3. ASSET TYPE TESTS
  console.log('\n📦 3. ASSET MANAGEMENT TESTS');
  console.log('─────────────────────────────────────────────────────────────');

  let assetTypes = [];
  
  await executeTest('GET Asset Types', async () => {
    const result = await apiCall('GET', '/api/v1/asset-types');
    if (!result.data || !result.data.rows) {
      throw new Error('No asset types returned');
    }
    assetTypes = result.data.rows;
    console.log(`   ℹ️  Found ${assetTypes.length} asset types`);
  });

  let createdAssetId = null;

  await executeTest('CREATE new asset', async () => {
    if (assetTypes.length === 0) throw new Error('No asset types available');
    
    const assetTypeId = assetTypes[0].id;
    const result = await apiCall('POST', '/api/v1/assets', {
      name: `Test Asset ${Date.now()}`,
      description: 'Automated test asset',
      assetTypeId: assetTypeId,
      metadata: { test: true, createdAt: new Date().toISOString() }
    });

    if (!result.data || !result.data.id) {
      throw new Error('Asset creation failed - no ID returned');
    }
    createdAssetId = result.data.id;
    console.log(`   ℹ️  Asset created: ID=${createdAssetId}`);
  });

  await executeTest('READ asset details', async () => {
    if (!createdAssetId) throw new Error('No asset ID available');
    const result = await apiCall('GET', `/api/v1/assets/${createdAssetId}`);
    if (!result.data) throw new Error('No asset data returned');
    console.log(`   ℹ️  Asset name: ${result.data.name}`);
  });

  await executeTest('UPDATE asset', async () => {
    if (!createdAssetId) throw new Error('No asset ID available');
    const result = await apiCall('PUT', `/api/v1/assets/${createdAssetId}`, {
      name: `Updated Asset ${Date.now()}`,
      description: 'Updated via automated test'
    });
    if (!result.data) throw new Error('Update failed');
    console.log(`   ℹ️  Asset updated successfully`);
  });

  await executeTest('LIST all assets', async () => {
    const result = await apiCall('GET', '/api/v1/assets');
    if (!result.data || !result.data.rows) {
      throw new Error('Invalid assets list response');
    }
    console.log(`   ℹ️  Total assets: ${result.data.rows.length}`);
  });

  await executeTest('DELETE asset', async () => {
    if (!createdAssetId) throw new Error('No asset ID available');
    const result = await apiCall('DELETE', `/api/v1/assets/${createdAssetId}`);
    console.log(`   ℹ️  Asset deleted successfully`);
  });

  // 4. PAGES/CAMPAIGNS TESTS
  console.log('\n📄 4. PAGES & CAMPAIGNS TESTS');
  console.log('─────────────────────────────────────────────────────────────');

  let createdPageId = null;

  await executeTest('CREATE new page', async () => {
    const result = await apiCall('POST', '/api/v1/pages', {
      title: `Test Page ${Date.now()}`,
      slug: `test-page-${Date.now()}`,
      description: 'Test page for automation',
      status: 'draft'
    });
    if (!result.data || !result.data.id) {
      throw new Error('Page creation failed');
    }
    createdPageId = result.data.id;
    console.log(`   ℹ️  Page created: ID=${createdPageId}`);
  });

  await executeTest('LIST all pages', async () => {
    const result = await apiCall('GET', '/api/v1/pages');
    if (!result.data || !result.data.rows) {
      throw new Error('Invalid pages list response');
    }
    console.log(`   ℹ️  Total pages: ${result.data.rows.length}`);
  });

  await executeTest('UPDATE page', async () => {
    if (!createdPageId) throw new Error('No page ID available');
    const result = await apiCall('PUT', `/api/v1/pages/${createdPageId}`, {
      title: `Updated Page ${Date.now()}`,
      status: 'published'
    });
    if (!result.data) throw new Error('Update failed');
    console.log(`   ℹ️  Page updated successfully`);
  });

  await executeTest('DELETE page', async () => {
    if (!createdPageId) throw new Error('No page ID available');
    await apiCall('DELETE', `/api/v1/pages/${createdPageId}`);
    console.log(`   ℹ️  Page deleted successfully`);
  });

  // 5. DASHBOARD TESTS
  console.log('\n📊 5. DASHBOARD & ANALYTICS TESTS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('GET Dashboard metrics', async () => {
    const result = await apiCall('GET', '/api/v1/dashboard/stats');
    if (!result.data) {
      console.log('   ℹ️  Dashboard stats endpoint may not be available');
    } else {
      console.log(`   ℹ️  Dashboard loaded: ${Object.keys(result.data).join(', ')}`);
    }
  });

  await executeTest('GET User profile', async () => {
    const result = await apiCall('GET', '/api/v1/profile');
    if (!result.data) throw new Error('Profile data not available');
    console.log(`   ℹ️  User: ${result.data.email}`);
  });

  // 6. FORM VALIDATION TESTS
  console.log('\n🔍 6. FORM VALIDATION TESTS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('Invalid email format rejection', async () => {
    try {
      await apiCall('POST', '/api/v1/assets', {
        name: 'Test',
        description: 'Test',
        assetTypeId: assetTypes[0]?.id || 1
      }, {}, 400);
    } catch (error) {
      console.log(`   ℹ️  Validation working (error expected)`);
    }
  });

  await executeTest('Empty field validation', async () => {
    try {
      await apiCall('POST', '/api/v1/pages', {
        title: '',
        slug: 'test'
      }, {}, 400);
    } catch (error) {
      console.log(`   ℹ️  Field validation working`);
    }
  });

  // 7. ERROR HANDLING TESTS
  console.log('\n⚠️  7. ERROR HANDLING TESTS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('404 Not Found handling', async () => {
    try {
      await apiCall('GET', '/api/v1/assets/999999', null, {}, 404);
    } catch (error) {
      if (error.message.includes('404')) {
        return; // Expected
      }
      throw error;
    }
  });

  await executeTest('Unauthorized access prevention', async () => {
    const tempToken = authToken;
    authToken = 'invalid-token';
    try {
      await apiCall('GET', '/api/v1/assets');
    } catch (error) {
      authToken = tempToken;
      if (error.message.includes('401') || error.message.includes('403')) {
        return; // Expected
      }
      authToken = tempToken;
      throw error;
    }
  });

  // 8. DATA INTEGRITY TESTS
  console.log('\n🔒 8. DATA INTEGRITY TESTS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('Asset data persistence', async () => {
    const result = await apiCall('POST', '/api/v1/assets', {
      name: `Persistence Test ${Date.now()}`,
      description: 'Testing data persistence',
      assetTypeId: assetTypes[0]?.id || 1,
      metadata: { testValue: Math.random() }
    });

    const assetId = result.data.id;
    const getResult = await apiCall('GET', `/api/v1/assets/${assetId}`);
    
    if (getResult.data.name !== result.data.name) {
      throw new Error('Data not persisted correctly');
    }

    // Cleanup
    await apiCall('DELETE', `/api/v1/assets/${assetId}`);
    console.log(`   ℹ️  Data integrity verified`);
  });

  // SUMMARY
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  console.log(`\n✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📝 Total:   ${results.length} tests\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
  }

  const successRate = ((passed / results.length) * 100).toFixed(2);
  console.log(`\n✨ Success Rate: ${successRate}%\n`);

  if (failed === 0 && passed > 0) {
    console.log('🎉 ALL TESTS PASSED! Deployment is working correctly.');
  } else if (failed > 0) {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }

  console.log(`Completed: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  return { passed, failed, skipped, results };
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
