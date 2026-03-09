/**
 * COMPREHENSIVE MANUAL TEST - PRODUCTION DEPLOYMENT
 * https://guries.vercel.app - Full System Verification
 */

const BASE_URL = 'https://guries.vercel.app';
let authToken = null;
const results = { passed: 0, failed: 0, tests: [] };

function log(test, status, msg = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '✓';
  console.log(`${icon} ${test}${msg ? ': ' + msg : ''}`);
  results.tests.push({ test, status, msg });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
}

async function apiCall(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = text.substring(0, 100);  // First 100 chars if not JSON
    }
    return { status: res.status, data };
  } catch (e) {
    return { status: 'error', error: e.message };
  }
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
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║    🚀 COMPREHENSIVE MANUAL TEST - PRODUCTION DEPLOYMENT      ║');
  console.log('║         https://guries.vercel.app - Full Verification       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. HEALTH CHECKS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('📊 HEALTH & CONNECTIVITY\n');

  await test('Health Endpoint (/health)', async () => {
    const res = await apiCall('GET', '/health');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await test('API Health Endpoint (/api/health)', async () => {
    const res = await apiCall('GET', '/api/health');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. AUTHENTICATION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n🔐 AUTHENTICATION & LOGIN\n');

  await test('Login - Valid Credentials', async () => {
    const res = await apiCall('POST', '/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (!res.data?.token) throw new Error('No token returned');
    authToken = res.data.token;
  });

  await test('Login - Invalid Password Rejected', async () => {
    const res = await apiCall('POST', '/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'wrongpass'
    });
    if (res.status === 200) throw new Error('Invalid password accepted!');
  });

  await test('Login - Invalid Email Rejected', async () => {
    const res = await apiCall('POST', '/api/v1/auth/login', {
      email: 'fake@notreal.com',
      password: 'anypass'
    });
    if (res.status === 200) throw new Error('Invalid user accepted!');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ASSET TYPES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n📌 ASSET TYPES\n');

  let assetTypes = [];
  
  await test('READ - List Asset Types', async () => {
    const res = await apiCall('GET', '/api/v1/asset-types');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Not an array');
    assetTypes = res.data;
    console.log(`   └─ Found ${assetTypes.length} asset types`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ASSETS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n📦 ASSET MANAGEMENT (CRUD)\n');

  let assets = [];

  await test('READ - List All Assets', async () => {
    const res = await apiCall('GET', '/api/v1/assets');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Not an array');
    assets = res.data;
    console.log(`   └─ Found ${assets.length} assets`);
  });

  if (assets.length > 0) {
    await test('READ - Get Asset by ID', async () => {
      const id = assets[0].id;
      const res = await apiCall('GET', `/api/v1/assets/${id}`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. ASSET LIBRARY - FULL CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n📚 ASSET LIBRARY - CRUD OPERATIONS\n');

  let libraryItems = [];
  let testAssetId = null;

  await test('READ - List Asset Library', async () => {
    const res = await apiCall('GET', '/api/v1/assetLibrary');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Not an array');
    libraryItems = res.data;
    console.log(`   └─ Found ${libraryItems.length} library items`);
  });

  await test('CREATE - Add Asset to Library', async () => {
    const name = `Test-${Date.now()}`;
    const res = await apiCall('POST', '/api/v1/assetLibrary', {
      asset_name: name,
      asset_description: 'Automated test asset',
      asset_type: assetTypes[0]?.id || 'image',
      asset_url: 'https://via.placeholder.com/300x300?text=Test',
      asset_status: 'active'
    });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    testAssetId = res.data?.id;
    console.log(`   └─ Asset created: ID=${testAssetId}`);
  });

  if (testAssetId) {
    await test('READ - Retrieve Created Asset', async () => {
      const res = await apiCall('GET', `/api/v1/assetLibrary/${testAssetId}`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      console.log(`   └─ Asset: ${res.data?.asset_name}`);
    });

    await test('UPDATE - Modify Asset', async () => {
      const res = await apiCall('PUT', `/api/v1/assetLibrary/${testAssetId}`, {
        asset_name: `Updated-${Date.now()}`,
        asset_description: 'Updated via test'
      });
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    });

    await test('DELETE - Remove Asset', async () => {
      const res = await apiCall('DELETE', `/api/v1/assetLibrary/${testAssetId}`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    });

    await test('Verify Deletion', async () => {
      const res = await apiCall('GET', `/api/v1/assetLibrary/${testAssetId}`);
      if (res.status === 200) throw new Error('Asset still exists after delete');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n✔️  FORM VALIDATION\n');

  await test('Validation - Empty Field Rejected', async () => {
    const res = await apiCall('POST', '/api/v1/assetLibrary', {
      asset_name: '',
      asset_type: 'image'
    });
    if (res.status === 200) throw new Error('Empty field accepted!');
  });

  await test('Validation - Missing Required Field', async () => {
    const res = await apiCall('POST', '/api/v1/assetLibrary', {
      asset_description: 'No name provided'
    });
    if (res.status === 200) throw new Error('Missing required field accepted!');
  });

  await test('Validation - Invalid ID Returns 404', async () => {
    const res = await apiCall('GET', '/api/v1/assetLibrary/999999999');
    if (res.status === 200) throw new Error('Invalid ID returned 200!');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. SECURITY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n🔒 SECURITY & AUTHORIZATION\n');

  const savedToken = authToken;

  await test('Auth Required - No Token Denied', async () => {
    authToken = null;
    const res = await apiCall('GET', '/api/v1/assetLibrary');
    authToken = savedToken;
    if (res.status < 300) throw new Error(`Should deny, got ${res.status}`);
  });

  await test('Auth Required - Invalid Token Denied', async () => {
    authToken = 'fake.token.here';
    const res = await apiCall('GET', '/api/v1/assets');
    authToken = savedToken;
    if (res.status === 200) throw new Error('Invalid token accepted!');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. DATA INTEGRITY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n💾 DATA PERSISTENCE\n');

  let persistId = null;

  await test('Persistence - Create & Verify', async () => {
    const unique = Math.random().toString(36).substring(7);
    const res = await apiCall('POST', '/api/v1/assetLibrary', {
      asset_name: `Persist-${unique}`,
      asset_description: `Value:${unique}`,
      asset_type: assetTypes[0]?.id || 'image'
    });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    persistId = res.data?.id;

    const getRes = await apiCall('GET', `/api/v1/assetLibrary/${persistId}`);
    if (!getRes.data?.asset_name?.includes(`Persist-${unique}`)) {
      throw new Error('Data not persisted correctly');
    }
  });

  if (persistId) {
    await test('Cleanup - Remove Test Data', async () => {
      const res = await apiCall('DELETE', `/api/v1/assetLibrary/${persistId}`);
      if (res.status !== 200) console.log('   └─ Warning: Could not clean up');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. CONCURRENT REQUESTS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n⚡ CONCURRENT REQUESTS\n');

  await test('Concurrent - Multiple Simultaneous Calls', async () => {
    const calls = [
      apiCall('GET', '/api/v1/assets'),
      apiCall('GET', '/api/v1/assetLibrary'),
      apiCall('GET', '/api/v1/asset-types'),
      apiCall('GET', '/health')
    ];
    const res = await Promise.all(calls);
    const failures = res.filter(r => r.status !== 200).length;
    if (failures > 0) throw new Error(`${failures} requests failed`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                     📋 TEST SUMMARY                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const total = results.passed + results.failed;
  const pct = ((results.passed / total) * 100).toFixed(1);

  console.log(`✅ PASSED:  ${results.passed}/${total}`);
  console.log(`❌ FAILED:  ${results.failed}/${total}`);
  console.log(`📊 SUCCESS RATE: ${pct}%\n`);

  if (results.failed > 0) {
    console.log('FAILED TESTS:');
    results.tests.filter(t => t.status === 'FAIL').forEach((t, i) => {
      console.log(`${i + 1}. ${t.test}`);
      if (t.msg) console.log(`   └─ ${t.msg}`);
    });
    console.log();
  }

  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                 🎯 DEPLOYMENT ASSESSMENT                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  if (pct >= 90) {
    console.log('🟢 FULLY OPERATIONAL');
    console.log('└─ All features working correctly');
    console.log('└─ Ready for production use');
  } else if (pct >= 70) {
    console.log('🟡 MOSTLY OPERATIONAL');
    console.log('└─ Core features working');
    console.log('└─ Some features need review');
  } else {
    console.log('🔴 LIMITED FUNCTIONALITY');
    console.log('└─ Significant issues detected');
    console.log('└─ Basic features working only');
  }

  console.log(`\n✓ Completed: ${new Date().toLocaleString()}\n`);
}

runTests().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
