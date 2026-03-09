/**
 * PRODUCTION DEPLOYMENT DIAGNOSTIC TEST
 * Identifies which API endpoints are actually available
 */

const BASE_URL = 'https://guries.vercel.app';
const results = { working: [], notFoundEndpoints: [], errorEndpoints: [] };
let authToken = null;

async function apiCall(method, endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, { method, headers });
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }
    return { status: response.status, data };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

async function testEndpoint(method, path, requiresAuth = false) {
  try {
    const result = await apiCall(method, path);
    const status = result.status;
    
    if (status === 404) {
      results.notFoundEndpoints.push({ method, path, status });
    } else if (status === 401 || status === 403) {
      if (requiresAuth) {
        results.working.push({ method, path, status, note: 'Requires auth' });
      } else {
        results.working.push({ method, path, status, note: 'Auth required' });
      }
    } else if (status < 500) {
      results.working.push({ method, path, status });
    } else {
      results.errorEndpoints.push({ method, path, status });
    }
  } catch (error) {
    results.errorEndpoints.push({ method: method, path, error: error.message });
  }
}

async function runDiagnostics() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 PRODUCTION DEPLOYMENT ENDPOINT DIAGNOSTIC');
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Started: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // First, authenticate
  console.log('📌 Step 1: Authenticating...\n');
  const loginResult = await apiCall('POST', '/api/v1/auth/login');
  
  if (loginResult.status === 200 && loginResult.data?.token) {
    authToken = loginResult.data.token;
    console.log('✅ Authentication successful\n');
  } else {
    // Try with credentials
    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });
    const data = await response.json();
    if (data.token) {
      authToken = data.token;
      console.log('✅ Authentication successful\n');
    }
  }

  // Test endpoints
  console.log('📌 Step 2: Testing Endpoints...\n');

  // Public endpoints (no auth required)
  console.log('Testing PUBLIC endpoints:');
  await testEndpoint('GET', '/health');
  await testEndpoint('GET', '/api/health');
  await testEndpoint('GET', '/api/v1/health');
  await testEndpoint('GET', '/api/v1/system/stats');

  console.log('\nTesting AUTHENTICATION endpoints:');
  await testEndpoint('POST', '/api/v1/auth/login');
  await testEndpoint('POST', '/api/v1/auth/send-otp');
  await testEndpoint('POST', '/api/v1/auth/verify-otp');

  console.log('\nTesting CAMPAIGN endpoints:');
  await testEndpoint('GET', '/api/v1/campaigns', true);
  await testEndpoint('POST', '/api/v1/campaigns', true);

  console.log('\nTesting PROJECT endpoints:');
  await testEndpoint('GET', '/api/v1/projects', true);
  await testEndpoint('POST', '/api/v1/projects', true);

  console.log('\nTesting TASK endpoints:');
  await testEndpoint('GET', '/api/v1/tasks', true);
  await testEndpoint('POST', '/api/v1/tasks', true);

  console.log('\nTesting ASSET/ASSET LIBRARY endpoints:');
  await testEndpoint('GET', '/api/v1/assets', true);
  await testEndpoint('GET', '/api/v1/assetLibrary', true);
  await testEndpoint('POST', '/api/v1/assetLibrary', true);
  await testEndpoint('GET', '/api/v1/asset-types', true);

  console.log('\nTesting CONTENT endpoints:');
  await testEndpoint('GET', '/api/v1/content', true);
  await testEndpoint('POST', '/api/v1/content', true);

  console.log('\nTesting SERVICE PAGES endpoints:');
  await testEndpoint('GET', '/api/v1/service-pages', true);
  await testEndpoint('POST', '/api/v1/service-pages', true);

  console.log('\nTesting DASHBOARD endpoints:');
  await testEndpoint('GET', '/api/v1/dashboard/stats', true);
  await testEndpoint('GET', '/api/v1/dashboard/upcoming-tasks', true);
  await testEndpoint('GET', '/api/v1/dashboard/recent-activity', true);

  console.log('\nTesting NOTIFICATIONS endpoints:');
  await testEndpoint('GET', '/api/v1/notifications', true);
  await testEndpoint('POST', '/api/v1/notifications', true);

  console.log('\nTesting GRAPHIC ASSETS endpoints:');
  await testEndpoint('GET', '/api/v1/graphics', true);
  await testEndpoint('POST', '/api/v1/graphics', true);

  console.log('\nTesting SMM endpoints:');
  await testEndpoint('GET', '/api/v1/smm', true);
  await testEndpoint('POST', '/api/v1/smm', true);

  console.log('\nTesting SEO ASSET endpoints:');
  await testEndpoint('GET', '/api/v1/seo-assets', true);
  await testEndpoint('GET', '/api/v1/seo-assets/master/sectors', true);

  console.log('\nTesting UPLOADS endpoints:');
  await testEndpoint('POST', '/api/v1/upload', true);

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 DIAGNOSTIC RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`✅ WORKING ENDPOINTS (${results.working.length}):`);
  console.log('─────────────────────────────────────────────────────────────');
  results.working.forEach(ep => {
    const authNote = ep.note ? ` [${ep.note}]` : '';
    console.log(`  ${ep.method.padEnd(6)} ${ep.path.padEnd(40)} (${ep.status})${authNote}`);
  });

  console.log(`\n❌ NOT FOUND (404) (${results.notFoundEndpoints.length}):`);
  console.log('─────────────────────────────────────────────────────────────');
  results.notFoundEndpoints.forEach(ep => {
    console.log(`  ${ep.method.padEnd(6)} ${ep.path.padEnd(40)} (${ep.status})`);
  });

  console.log(`\n⚠️  ERRORS (${results.errorEndpoints.length}):`);
  console.log('─────────────────────────────────────────────────────────────');
  results.errorEndpoints.forEach(ep => {
    console.log(`  ${ep.method.padEnd(6)} ${ep.path.padEnd(40)} (${ep.error || ep.status})`);
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📋 ENDPOINT FEATURES AVAILABLE:\n');

  const hasAuth = results.working.some(e => e.path.includes('/auth/'));
  const hasAssets = results.working.some(e => e.path.includes('/asset'));
  const hasDashboard = results.working.some(e => e.path.includes('/dashboard'));
  const hasCampaigns = results.working.some(e => e.path.includes('/campaign'));
  const hasProjects = results.working.some(e => e.path.includes('/project'));
  const hasTasks = results.working.some(e => e.path.includes('/task'));
  const hasContent = results.working.some(e => e.path.includes('/content'));
  const hasNotifications = results.working.some(e => e.path.includes('/notif'));

  console.log(`🔐 Authentication:       ${hasAuth ? '✅ Available' : '❌ Not Available'}`);
  console.log(`📦 Asset Management:     ${hasAssets ? '✅ Available' : '❌ Not Available'}`);
  console.log(`📊 Dashboard:             ${hasDashboard ? '✅ Available' : '❌ Not Available'}`);
  console.log(`📢 Campaigns:             ${hasCampaigns ? '✅ Available' : '❌ Not Available'}`);
  console.log(`📁 Projects:              ${hasProjects ? '✅ Available' : '❌ Not Available'}`);
  console.log(`✅ Tasks:                 ${hasTasks ? '✅ Available' : '❌ Not Available'}`);
  console.log(`📝 Content:               ${hasContent ? '✅ Available' : '❌ Not Available'}`);
  console.log(`🔔 Notifications:         ${hasNotifications ? '✅ Available' : '❌ Not Available'}`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📈 DEPLOYMENT STATUS ASSESSMENT:\n');

  const workingCount = results.working.length;
  const totalTested = results.working.length + results.notFoundEndpoints.length + results.errorEndpoints.length;
  const availability = ((workingCount / totalTested) * 100).toFixed(1);

  console.log(`Total Endpoints Tested: ${totalTested}`);
  console.log(`Working Endpoints: ${workingCount}`);
  console.log(`API Availability: ${availability}%`);

  if (availability >= 80) {
    console.log('\n🟢 DEPLOYMENT STATUS: HEALTHY');
    console.log('Most API endpoints are available and functional.');
  } else if (availability >= 50) {
    console.log('\n🟡 DEPLOYMENT STATUS: PARTIAL');
    console.log('Some API endpoints are available, but features may be incomplete.');
  } else {
    console.log('\n🔴 DEPLOYMENT STATUS: LIMITED');
    console.log('Most API endpoints are not available. Check deployment configuration.');
  }

  console.log(`\nCompleted: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  return results;
}

runDiagnostics().catch(error => {
  console.error('Diagnostic error:', error);
  process.exit(1);
});
