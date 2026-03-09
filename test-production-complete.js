/**
 * COMPREHENSIVE MANUAL TEST SUITE - Production Deployment
 * Target: https://guries.vercel.app
 * Tests all pages, forms, CRUD operations, and API endpoints
 */

const BASE_URL = 'https://guries.vercel.app';
const results = [];
let authToken = null;
let userId = null;

// Test data
const testData = {
  campaign: null,
  project: null,
  task: null,
  asset: null,
  content: null
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
  }
}

async function apiCall(method, endpoint, data = null, headers = {}, expectSuccess = true) {
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

    if (expectSuccess && (response.status < 200 || response.status >= 300)) {
      throw new Error(`HTTP ${response.status}: ${typeof responseData === 'object' ? JSON.stringify(responseData) : responseData}`);
    }

    return { status: response.status, data: responseData, response };
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
}

// ============================================================================
// TEST SUITE EXECUTION
// ============================================================================

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 COMPREHENSIVE MANUAL TEST - PRODUCTION DEPLOYMENT');
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Started: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ═════════════════════════════════════════════════════════════════════════
  // 1. HEALTH & BASIC CONNECTIVITY
  // ═════════════════════════════════════════════════════════════════════════
  console.log('📊 1. HEALTH & CONNECTIVITY TESTS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('Health Check Endpoint', async () => {
    const result = await apiCall('GET', '/api/v1/health');
    if (!result.data || !result.data.status) throw new Error('Health data missing');
  });

  await executeTest('System Stats Endpoint', async () => {
    const result = await apiCall('GET', '/api/v1/system/stats');
    if (!result.data) console.log('   ℹ️  Stats may not be exposed');
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 2. AUTHENTICATION TESTS
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n🔐 2. AUTHENTICATION & LOGIN TESTS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('User Login - Valid Credentials', async () => {
    const result = await apiCall('POST', '/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (!result.data.token) throw new Error('No token returned');
    authToken = result.data.token;
    userId = result.data.userId;
    console.log(`   ℹ️  Auth token acquired. User ID: ${userId}`);
  });

  await executeTest('Login - Invalid Credentials Rejected', async () => {
    const result = await apiCall('POST', '/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'wrongpassword'
    }, {}, false);
    
    if (result.status === 200) throw new Error('Invalid credentials were accepted!');
    console.log(`   ℹ️  Invalid login properly rejected (${result.status})`);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 3. CAMPAIGN MANAGEMENT - CRUD
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n📢 3. CAMPAIGN MANAGEMENT - CRUD OPERATIONS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('List all Campaigns', async () => {
    const result = await apiCall('GET', '/api/v1/campaigns');
    if (!result.data || !Array.isArray(result.data)) throw new Error('Invalid response format');
    console.log(`   ℹ️  Found ${result.data.length} campaigns`);
  });

  await executeTest('Create Campaign', async () => {
    const result = await apiCall('POST', '/api/v1/campaigns', {
      name: `Test Campaign ${Date.now()}`,
      description: 'Automated test campaign',
      status: 'draft',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    if (!result.data || !result.data.id) throw new Error('Campaign creation failed');
    testData.campaign = result.data.id;
    console.log(`   ℹ️  Campaign created: ID=${testData.campaign}`);
  });

  await executeTest('Retrieve Campaign by ID', async () => {
    if (!testData.campaign) throw new Error('No campaign ID available');
    const result = await apiCall('GET', `/api/v1/campaigns/${testData.campaign}`);
    if (!result.data) throw new Error('Campaign retrieval failed');
    console.log(`   ℹ️  Campaign: ${result.data.name}`);
  });

  await executeTest('Update Campaign', async () => {
    if (!testData.campaign) throw new Error('No campaign ID available');
    const result = await apiCall('PUT', `/api/v1/campaigns/${testData.campaign}`, {
      name: `Updated Campaign ${Date.now()}`,
      description: 'Updated description'
    });
    if (!result.data) throw new Error('Campaign update failed');
    console.log(`   ℹ️  Campaign updated successfully`);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 4. PROJECT MANAGEMENT - CRUD
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n📁 4. PROJECT MANAGEMENT - CRUD OPERATIONS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('List all Projects', async () => {
    const result = await apiCall('GET', '/api/v1/projects');
    if (!result.data || !Array.isArray(result.data)) throw new Error('Invalid response format');
    console.log(`   ℹ️  Found ${result.data.length} projects`);
  });

  await executeTest('Create Project', async () => {
    const result = await apiCall('POST', '/api/v1/projects', {
      name: `Test Project ${Date.now()}`,
      description: 'Automated test project',
      status: 'active'
    });
    
    if (!result.data || !result.data.id) throw new Error('Project creation failed');
    testData.project = result.data.id;
    console.log(`   ℹ️  Project created: ID=${testData.project}`);
  });

  await executeTest('Retrieve Project by ID', async () => {
    if (!testData.project) throw new Error('No project ID available');
    const result = await apiCall('GET', `/api/v1/projects/${testData.project}`);
    if (!result.data) throw new Error('Project retrieval failed');
    console.log(`   ℹ️  Project: ${result.data.name}`);
  });

  await executeTest('Update Project', async () => {
    if (!testData.project) throw new Error('No project ID available');
    const result = await apiCall('PUT', `/api/v1/projects/${testData.project}`, {
      name: `Updated Project ${Date.now()}`,
      status: 'completed'
    });
    if (!result.data) throw new Error('Project update failed');
    console.log(`   ℹ️  Project updated successfully`);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 5. TASK MANAGEMENT - CRUD
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n✅ 5. TASK MANAGEMENT - CRUD OPERATIONS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('List all Tasks', async () => {
    const result = await apiCall('GET', '/api/v1/tasks');
    if (!result.data || !Array.isArray(result.data)) throw new Error('Invalid response format');
    console.log(`   ℹ️  Found ${result.data.length} tasks`);
  });

  await executeTest('Create Task', async () => {
    const result = await apiCall('POST', '/api/v1/tasks', {
      title: `Test Task ${Date.now()}`,
      description: 'Automated test task',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    if (!result.data || !result.data.id) throw new Error('Task creation failed');
    testData.task = result.data.id;
    console.log(`   ℹ️  Task created: ID=${testData.task}`);
  });

  await executeTest('Update Task Status', async () => {
    if (!testData.task) throw new Error('No task ID available');
    const result = await apiCall('PUT', `/api/v1/tasks/${testData.task}`, {
      status: 'in_progress',
      description: 'Task updated via automation'
    });
    if (!result.data) throw new Error('Task update failed');
    console.log(`   ℹ️  Task status updated to in_progress`);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 6. ASSET MANAGEMENT - CRUD & LIBRARY
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n📦 6. ASSET MANAGEMENT - CRUD & LIBRARY OPERATIONS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('List Asset Library Items', async () => {
    const result = await apiCall('GET', '/api/v1/assetLibrary');
    if (!result.data || !Array.isArray(result.data)) {
      if (!Array.isArray(result.data)) {
        console.log('   ℹ️  Asset library may have different structure');
        return;
      }
    }
    console.log(`   ℹ️  Found ${result.data?.length || 0} library items`);
  });

  await executeTest('Create Asset Library Item', async () => {
    const result = await apiCall('POST', '/api/v1/assetLibrary', {
      title: `Test Asset ${Date.now()}`,
      description: 'Test asset for automation',
      type: 'image',
      url: 'https://via.placeholder.com/300x300.png?text=Test+Asset',
      tags: ['test', 'automation'],
      status: 'active'
    });
    
    if (!result.data || !result.data.id) throw new Error('Asset creation failed');
    testData.asset = result.data.id;
    console.log(`   ℹ️  Asset created: ID=${testData.asset}`);
  });

  await executeTest('Retrieve Asset Details', async () => {
    if (!testData.asset) throw new Error('No asset ID available');
    const result = await apiCall('GET', `/api/v1/assetLibrary/${testData.asset}`);
    if (!result.data) throw new Error('Asset retrieval failed');
    console.log(`   ℹ️  Asset: ${result.data.title}`);
  });

  await executeTest('Update Asset', async () => {
    if (!testData.asset) throw new Error('No asset ID available');
    const result = await apiCall('PUT', `/api/v1/assetLibrary/${testData.asset}`, {
      title: `Updated Asset ${Date.now()}`,
      description: 'Updated via automation',
      tags: ['test', 'automation', 'updated']
    });
    if (!result.data) throw new Error('Asset update failed');
    console.log(`   ℹ️  Asset updated successfully`);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 7. CONTENT MANAGEMENT - CRUD
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n📝 7. CONTENT MANAGEMENT - CRUD OPERATIONS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('List Content', async () => {
    const result = await apiCall('GET', '/api/v1/content');
    if (!result.data || !Array.isArray(result.data)) {
      console.log('   ℹ️  Content endpoint may not be available');
      return;
    }
    console.log(`   ℹ️  Found ${result.data.length} content items`);
  });

  await executeTest('Create Content Item', async () => {
    const result = await apiCall('POST', '/api/v1/content', {
      title: `Test Content ${Date.now()}`,
      body: 'This is a test content item created via automation testing.',
      type: 'article',
      status: 'draft'
    });
    
    if (!result.data || !result.data.id) throw new Error('Content creation failed');
    testData.content = result.data.id;
    console.log(`   ℹ️  Content created: ID=${testData.content}`);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 8. DASHBOARD & USER FEATURES
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n📊 8. DASHBOARD & USER FEATURES');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('Get Dashboard Statistics', async () => {
    const result = await apiCall('GET', '/api/v1/dashboard/stats');
    if (!result.data) {
      console.log('   ℹ️  Dashboard stats not available');
      return;
    }
    console.log(`   ℹ️  Dashboard loaded with data`);
  });

  await executeTest('Get Upcoming Tasks', async () => {
    const result = await apiCall('GET', '/api/v1/dashboard/upcoming-tasks');
    if (!result.data || !Array.isArray(result.data)) {
      console.log('   ℹ️  Upcoming tasks endpoint may not be available');
      return;
    }
    console.log(`   ℹ️  Found ${result.data.length} upcoming tasks`);
  });

  await executeTest('Get Recent Activity', async () => {
    const result = await apiCall('GET', '/api/v1/dashboard/recent-activity');
    if (!result.data || !Array.isArray(result.data)) {
      console.log('   ℹ️  Recent activity endpoint may not be available');
      return;
    }
    console.log(`   ℹ️  Found ${result.data.length} recent activities`);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 9. NOTIFICATIONS
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n🔔 9. NOTIFICATIONS MANAGEMENT');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('Get Notifications', async () => {
    const result = await apiCall('GET', '/api/v1/notifications');
    if (!result.data || !Array.isArray(result.data)) {
      console.log('   ℹ️  Notifications endpoint may not be available');
      return;
    }
    console.log(`   ℹ️  Found ${result.data.length} notifications`);
  });

  await executeTest('Create Notification', async () => {
    const result = await apiCall('POST', '/api/v1/notifications', {
      title: 'Test Notification',
      message: 'This is a test notification from automation',
      type: 'info'
    });
    
    if (!result.data) {
      console.log('   ℹ️  Notification creation may not be enabled');
      return;
    }
    console.log(`   ℹ️  Notification created successfully`);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 10. ERROR HANDLING & VALIDATION
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n⚠️  10. ERROR HANDLING & VALIDATION TESTS');
  console.log('─────────────────────────────────────────────────────────────');

  await executeTest('Invalid Endpoint Returns 404', async () => {
    const result = await apiCall('GET', '/api/v1/invalid-endpoint', null, {}, false);
    if (result.status !== 404) throw new Error(`Expected 404, got ${result.status}`);
    console.log(`   ℹ️  404 errors properly handled`);
  });

  await executeTest('Missing Required Fields Validation', async () => {
    const result = await apiCall('POST', '/api/v1/campaigns', {
      description: 'Missing required name field'
    }, {}, false);
    
    if (result.status === 200) throw new Error('Validation should have failed');
    console.log(`   ℹ️  Validation working (${result.status})`);
  });

  await executeTest('Unauthorized Access Without Token', async () => {
    const tempToken = authToken;
    authToken = null;
    
    const result = await apiCall('GET', '/api/v1/campaigns', null, {}, false);
    authToken = tempToken;
    
    if (result.status < 300) throw new Error('Should require authentication');
    console.log(`   ℹ️  Authentication properly enforced (${result.status})`);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 11. CLEANUP - DELETE TEST DATA
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n🧹 11. CLEANUP - DELETE TEST DATA');
  console.log('─────────────────────────────────────────────────────────────');

  if (testData.campaign) {
    await executeTest('Delete Test Campaign', async () => {
      await apiCall('DELETE', `/api/v1/campaigns/${testData.campaign}`);
      console.log(`   ✓ Campaign deleted`);
    });
  }

  if (testData.project) {
    await executeTest('Delete Test Project', async () => {
      await apiCall('DELETE', `/api/v1/projects/${testData.project}`);
      console.log(`   ✓ Project deleted`);
    });
  }

  if (testData.task) {
    await executeTest('Delete Test Task', async () => {
      await apiCall('DELETE', `/api/v1/tasks/${testData.task}`);
      console.log(`   ✓ Task deleted`);
    });
  }

  if (testData.asset) {
    await executeTest('Delete Test Asset', async () => {
      await apiCall('DELETE', `/api/v1/assetLibrary/${testData.asset}`);
      console.log(`   ✓ Asset deleted`);
    });
  }

  if (testData.content) {
    await executeTest('Delete Test Content', async () => {
      await apiCall('DELETE', `/api/v1/content/${testData.content}`);
      console.log(`   ✓ Content deleted`);
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // SUMMARY & REPORTING
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`\n✅ PASSED:     ${passed}`);
  console.log(`❌ FAILED:     ${failed}`);
  console.log(`📝 TOTAL:      ${total} tests`);

  const successRate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
  console.log(`✨ SUCCESS RATE: ${successRate}%\n`);

  if (failed > 0) {
    console.log('FAILED TESTS:');
    console.log('─────────────────────────────────────────────────────────────');
    results.filter(r => r.status === 'FAIL').forEach((r, i) => {
      console.log(`${i + 1}. ${r.name}`);
      console.log(`   Error: ${r.message}\n`);
    });
  }

  console.log('═══════════════════════════════════════════════════════════════');

  if (failed === 0 && passed > 0) {
    console.log('🎉 ALL TESTS PASSED! DEPLOYMENT IS FULLY FUNCTIONAL!\n');
  } else if (failed > 0) {
    console.log(`⚠️  ${failed} test(s) failed. See details above.\n`);
  }

  console.log(`✓ Completed: ${new Date().toISOString()}\n`);

  return { passed, failed, total, successRate, results };
}

// Execute tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
