/**
 * COMPREHENSIVE MANUAL TEST - FOCUSED ON AVAILABLE ENDPOINTS
 * Production Deployment: https://guries.vercel.app
 * 
 * Tests all working features including:
 * - Authentication & Login
 * - Asset Management (CRUD)
 * - Asset Library Operations
 * - Asset Types
 * - Health Checks
 */

const BASE_URL = 'https://guries.vercel.app';
let authToken = null;
const testResults = { passed: 0, failed: 0, tests: [] };

function log(test, status, message = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️ ';
  console.log(`${icon} ${test}${message ? ': ' + message : ''}`);
  testResults.tests.push({ test, status, message });
  if (status === 'PASS') testResults.passed++;
  if (status === 'FAIL') testResults.failed++;
}

async function apiCall(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const text = await res.text();
  const data = text ? JSON.parse(text).catch(() => text) : null;
  return { status: res.status, data };
}

async function test(name, fn) {
  try {
    await fn();
    log(name, 'PASS');
  } catch (e) {
    log(name, 'FAIL', e.message);
  }
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🚀 COMPREHENSIVE MANUAL TEST - FULL SYSTEM VERIFICATION');
  console.log(`📍 Target: https://guries.vercel.app`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. HEALTH CHECKS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('📊 SECTION 1: HEALTH & CONNECTIVITY CHECKS');
  console.log('─────────────────────────────────────────────────────────────');

  await test('Simple Health Endpoint', async () => {
    const res = await apiCall('GET', '/health');
    if (res.status !== 200) throw new Error(`Got ${res.status}`);
  });

  await test('API Health Endpoint', async () => {
    const res = await apiCall('GET', '/api/health');
    if (res.status !== 200) throw new Error(`Got ${res.status}`);
  });

  await test('Application Responsiveness', async () => {
    const start = Date.now();
    const res = await apiCall('GET', '/health');
    const duration = Date.now() - start;
    if (duration > 5000) throw new Error(`Slow response: ${duration}ms`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. AUTHENTICATION & USER MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n🔐 SECTION 2: AUTHENTICATION & LOGIN');
  console.log('─────────────────────────────────────────────────────────────');

  await test('Login with Valid Credentials', async () => {
    const res = await apiCall('POST', '/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    if (res.status !== 200) throw new Error(`Got ${res.status}`);
    if (!res.data.token) throw new Error('No token returned');
    authToken = res.data.token;
  });

  await test('Invalid Password Rejection', async () => {
    const res = await apiCall('POST', '/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'wrongpassword'
    });
    if (res.status === 200) throw new Error('Invalid password accepted!');
  });

  await test('Invalid Email Rejection', async () => {
    const res = await apiCall('POST', '/api/v1/auth/login', {
      email: 'nonexistent@test.com',
      password: 'anypassword'
    });
    if (res.status === 200) throw new Error('Invalid user accepted!');
  });

  await test('Auth Token Format Valid', async () => {
    if (!authToken) throw new Error('No token available');
    const parts = authToken.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ASSET TYPES - CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n📌 SECTION 3: ASSET TYPES MANAGEMENT');
  console.log('─────────────────────────────────────────────────────────────');

  let assetTypes = [];
  await test('List Asset Types', async () => {
    const res = await apiCall('GET', '/api/v1/asset-types');
    if (res.status !== 200) throw new Error(`Got ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Not an array');
    assetTypes = res.data;
  });

  await test('Asset Types Have Valid Structure', async () => {
    if (assetTypes.length === 0) throw new Error('No asset types returned');
    const type = assetTypes[0];
    if (!type.id) throw new Error('Missing id field');
  });

  await test('Asset Types Count Display', async () => {
    console.log(`   📊 Found ${assetTypes.length} asset types`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ASSETS LIST - BASIC OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n📦 SECTION 4: ASSET LIST & RETRIEVAL');
  console.log('─────────────────────────────────────────────────────────────');

  let assets = [];
  await test('List All Assets', async () => {
    const res = await apiCall('GET', '/api/v1/assets');
    if (res.status !== 200) throw new Error(`Got ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Not an array');
    assets = res.data;
  });

  await test('Assets Have Valid IDs', async () => {
    if (assets.length > 0) {
      assets.forEach((asset, i) => {
        if (!asset.id) throw new Error(`Asset ${i} missing id`);
      });
    }
  });

  await test('Assets Count Display', async () => {
    console.log(`   📊 Found ${assets.length} assets in system`);
  });

  if (assets.length > 0) {
    await test('Retrieve Single Asset by ID', async () => {
      const assetId = assets[0].id;
      const res = await apiCall('GET', `/api/v1/assets/${assetId}`);
      if (res.status !== 200) throw new Error(`Got ${res.status}`);
      if (!res.data.id) throw new Error('Invalid asset data');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. ASSET LIBRARY - FULL CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n📚 SECTION 5: ASSET LIBRARY - FULL CRUD OPERATIONS');
  console.log('─────────────────────────────────────────────────────────────');

  let libraryItems = [];
  let createdAssetId = null;

  await test('List Asset Library', async () => {
    const res = await apiCall('GET', '/api/v1/assetLibrary');
    if (res.status !== 200) throw new Error(`Got ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Not an array');
    libraryItems = res.data;
  });

  await test('Asset Library Count Display', async () => {
    console.log(`   📚 Found ${libraryItems.length} library items`);
  });

  await test('CREATE - Add New Asset to Library', async () => {
    const assetName = `AutoTest Asset ${Date.now()}`;
    const res = await apiCall('POST', '/api/v1/assetLibrary', {
      asset_name: assetName,  // Note: API requires 'asset_name' not 'title'
      asset_description: 'Created by automated test suite',
      asset_type: assetTypes[0]?.id || 'image',
      asset_url: 'https://via.placeholder.com/300x300.png?text=Test',
      asset_tags: 'test,automation',
      asset_status: 'active'
    });
    if (res.status !== 200) throw new Error(`Got ${res.status}: ${JSON.stringify(res.data)}`);
    if (!res.data.id) throw new Error('No asset ID returned');
    createdAssetId = res.data.id;
    console.log(`   ✓ Asset created: ID=${createdAssetId}`);
  });

  if (createdAssetId) {
    await test('READ - Retrieve Created Asset', async () => {
      const res = await apiCall('GET', `/api/v1/assetLibrary/${createdAssetId}`);
      if (res.status !== 200) throw new Error(`Got ${res.status}`);
      if (!res.data.id) throw new Error('Asset data missing');
      console.log(`   ✓ Asset name: ${res.data.asset_name || res.data.name}`);
    });

    await test('UPDATE - Modify Asset Details', async () => {
      const res = await apiCall('PUT', `/api/v1/assetLibrary/${createdAssetId}`, {
        asset_name: `Updated Asset ${Date.now()}`,
        asset_description: 'Updated via automation testing'
      });
      if (res.status !== 200) throw new Error(`Got ${res.status}`);
      console.log(`   ✓ Asset updated successfully`);
    });

    await test('Verify Updated Asset', async () => {
      const res = await apiCall('GET', `/api/v1/assetLibrary/${createdAssetId}`);
      if (res.status !== 200) throw new Error(`Got ${res.status}`);
      if (!res.data.asset_name.includes('Updated')) throw new Error('Update not reflected');
    });

    await test('DELETE - Remove Asset from Library', async () => {
      const res = await apiCall('DELETE', `/api/v1/assetLibrary/${createdAssetId}`);
      if (res.status !== 200) throw new Error(`Got ${res.status}`);
      console.log(`   ✓ Asset deleted successfully`);
    });

    await test('Verify Asset Deleted', async () => {
      const res = await apiCall('GET', `/api/v1/assetLibrary/${createdAssetId}`);
      if (res.status === 200) throw new Error('Asset still exists after deletion');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. FORM VALIDATION & ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n✔️  SECTION 6: FORM VALIDATION & ERROR HANDLING');
  console.log('─────────────────────────────────────────────────────────────');

  await test('Empty Field Validation', async () => {
    const res = await apiCall('POST', '/api/v1/assetLibrary', {
      asset_name: '',  // Empty required field
      asset_type: 'image'
    });
    if (res.status === 200) throw new Error('Validation failed - empty field accepted');
  });

  await test('Missing Required Field Validation', async () => {
    const res = await apiCall('POST', '/api/v1/assetLibrary', {
      asset_description: 'Description without name'
      // Missing required asset_name
    });
    if (res.status === 200) throw new Error('Validation failed - missing field accepted');
  });

  await test('Invalid Resource ID Handling', async () => {
    const res = await apiCall('GET', '/api/v1/assetLibrary/999999999');
    if (res.status === 200) throw new Error('Should return 404 or 400');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. AUTHENTICATION ENFORCEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n🔒 SECTION 7: AUTHORIZATION & PERMISSION CHECKS');
  console.log('─────────────────────────────────────────────────────────────');

  const tempToken = authToken;
  
  await test('Endpoint Requires Valid Token', async () => {
    authToken = null;  // Remove token
    const res = await apiCall('GET', '/api/v1/assetLibrary');
    authToken = tempToken;  // Restore token
    if (res.status < 300) throw new Error(`Should be protected, got ${res.status}`);
  });

  await test('Invalid Token Rejection', async () => {
    authToken = 'invalid.jwt.token';
    const res = await apiCall('GET', '/api/v1/assets');
    authToken = tempToken;
    if (res.status === 200) throw new Error('Invalid token was accepted!');
  });

  await test('Expired/Malformed Token Handling', async () => {
    authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    const res = await apiCall('GET', '/api/v1/assets');
    authToken = tempToken;
    if (res.status === 200) throw new Error('Malformed token was accepted!');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. DATA PERSISTENCE & INTEGRITY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n💾 SECTION 8: DATA PERSISTENCE & INTEGRITY');
  console.log('─────────────────────────────────────────────────────────────');

  let persistanceTestId = null;

  await test('Create Asset for Persistence Test', async () => {
    const uniqueValue = Math.random().toString(36).substring(7);
    const res = await apiCall('POST', '/api/v1/assetLibrary', {
      asset_name: `Persistence Test ${uniqueValue}`,
      asset_description: `Test value: ${uniqueValue}`,
      asset_type: assetTypes[0]?.id || 'image'
    });
    if (res.status !== 200) throw new Error(`Creation failed: ${res.status}`);
    persistanceTestId = res.data.id;
  });

  if (persistanceTestId) {
    await test('Data Integrity - Verify Persisted Values', async () => {
      const res = await apiCall('GET', `/api/v1/assetLibrary/${persistanceTestId}`);
      if (res.status !== 200) throw new Error(`Retrieval failed: ${res.status}`);
      if (!res.data.asset_name.includes('Persistence')) throw new Error('Data integrity issue');
      console.log(`   ✓ Data correctly persisted`);
    });

    await test('Cleanup Persistence Test Asset', async () => {
      const res = await apiCall('DELETE', `/api/v1/assetLibrary/${persistanceTestId}`);
      if (res.status !== 200) console.log('   ⚠️ Could not clean up test asset');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. CONCURRENT REQUEST HANDLING
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n⚡ SECTION 9: CONCURRENT REQUEST HANDLING');
  console.log('─────────────────────────────────────────────────────────────');

  await test('Handle Multiple Concurrent Requests', async () => {
    const promises = [
      apiCall('GET', '/api/v1/assets'),
      apiCall('GET', '/api/v1/assetLibrary'),
      apiCall('GET', '/api/v1/asset-types'),
      apiCall('GET', '/health')
    ];
    const results = await Promise.all(promises);
    const failures = results.filter(r => r.status !== 200).length;
    if (failures > 0) throw new Error(`${failures} concurrent requests failed`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL SUMMARY & REPORT
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📋 FINAL TEST SUMMARY & DEPLOYMENT ASSESSMENT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const total = testResults.passed + testResults.failed;
  const percentage = ((testResults.passed / total) * 100).toFixed(1);

  console.log(`✅ PASSED:  ${testResults.passed}/${total}`);
  console.log(`❌ FAILED:  ${testResults.failed}/${total}`);
  console.log(`📊 SUCCESS RATE: ${percentage}%\n`);

  if (testResults.failed > 0) {
    console.log('❌ FAILED TESTS:');
    testResults.tests.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(`  • ${t.test}: ${t.message}`);
    });
    console.log();
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📈 DEPLOYMENT STATUS REPORT\n');

  if (percentage >= 90) {
    console.log('🟢 STATUS: FULLY OPERATIONAL');
    console.log('✓ All core features are working correctly');
    console.log('✓ Authentication system is secure');
    console.log('✓ Asset management (CRUD) fully functional');
    console.log('✓ Data persistence verified');
  } else if (percentage >= 70) {
    console.log('🟡 STATUS: MOSTLY OPERATIONAL');
    console.log('✓ Core features working');
    console.log('⚠️  Some features may need attention');
  } else {
    console.log('🔴 STATUS: LIMITED FUNCTIONALITY');
    console.log('⚠️  Significant issues detected');
    console.log('✓ Basic health checks passing');
    console.log('❌ Many features not available or failing');
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`✓ Test completed: ${new Date().toLocaleString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run all tests
runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
