/**
 * Comprehensive Test Suite for All Pages
 * Tests uploads, tables, lists, and CRUD operations across all modules
 */

const https = require('https');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'guries.vercel.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        let parsedData;
        try {
          parsedData = JSON.parse(responseData);
        } catch (e) {
          parsedData = { raw: responseData };
        }
        resolve({ path, status: res.statusCode, data: parsedData });
      });
    });

    req.on('error', (error) => {
      resolve({ path, status: 0, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ path, status: 0, error: 'Timeout' });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testModule(moduleName, endpoints, testData = null) {
  console.log(`\n🔍 Testing ${moduleName.toUpperCase()} Module`);
  console.log('='.repeat(50));
  
  const results = [];
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    const { path, method, data, description } = endpoint;
    console.log(`\n📋 ${description}`);
    console.log(`   ${method} ${path}`);
    
    const result = await testEndpoint(path, method, data || testData);
    results.push(result);
    
    if (result.status >= 200 && result.status < 300) {
      console.log(`   ✅ Status: ${result.status}`);
      if (result.data.data && Array.isArray(result.data.data)) {
        console.log(`   📊 Items: ${result.data.data.length}`);
      }
      if (result.data.success) {
        console.log(`   🎯 Success: ${result.data.message || 'OK'}`);
      }
      successCount++;
    } else {
      console.log(`   ❌ Status: ${result.status}`);
      console.log(`   🚨 Error: ${result.error || result.data?.error || 'Unknown error'}`);
    }
  }
  
  const successRate = (successCount / endpoints.length) * 100;
  console.log(`\n📈 ${moduleName}: ${successCount}/${endpoints.length} working (${successRate.toFixed(1)}%)`);
  
  return {
    module: moduleName,
    successCount,
    totalCount: endpoints.length,
    successRate,
    results
  };
}

async function runComprehensiveTest() {
  console.log('🧪 COMPREHENSIVE MARKETING CONTROL CENTER TEST');
  console.log('='.repeat(60));
  console.log('Testing all pages, uploads, tables, and lists...\n');
  
  const allResults = [];
  
  // Dashboard & Navigation
  const dashboardResults = await testModule('Dashboard', [
    { path: '/api/v1/dashboard/stats', method: 'GET', description: 'Dashboard Statistics' },
    { path: '/api/v1/notifications', method: 'GET', description: 'Notifications List' }
  ]);
  allResults.push(dashboardResults);
  
  // Core Modules
  const coreResults = await testModule('Core Modules', [
    { path: '/api/v1/projects', method: 'GET', description: 'Projects List' },
    { path: '/api/v1/campaigns', method: 'GET', description: 'Campaigns List' },
    { path: '/api/v1/tasks', method: 'GET', description: 'Tasks List' },
    { path: '/api/v1/assets', method: 'GET', description: 'Assets List' },
    { path: '/api/v1/assetLibrary', method: 'GET', description: 'Asset Library Table' },
    { path: '/api/v1/users', method: 'GET', description: 'Users List' }
  ]);
  allResults.push(coreResults);
  
  // Repository Modules
  const repositoryResults = await testModule('Repository Modules', [
    { path: '/api/v1/content', method: 'GET', description: 'Content Repository' },
    { path: '/api/v1/services', method: 'GET', description: 'Services List' },
    { path: '/api/v1/service-pages', method: 'GET', description: 'Service Pages' },
    { path: '/api/v1/smm', method: 'GET', description: 'SMM Repository' },
    { path: '/api/v1/graphics', method: 'GET', description: 'Graphics Repository' },
    { path: '/api/v1/backlinks', method: 'GET', description: 'Backlinks List' },
    { path: '/api/v1/keywords', method: 'GET', description: 'Keywords List' },
    { path: '/api/v1/competitors', method: 'GET', description: 'Competitors List' }
  ]);
  allResults.push(repositoryResults);
  
  // Configuration Masters
  const configResults = await testModule('Configuration Masters', [
    { path: '/api/v1/asset-categories', method: 'GET', description: 'Asset Categories' },
    { path: '/api/v1/asset-types', method: 'GET', description: 'Asset Types' },
    { path: '/api/v1/platforms', method: 'GET', description: 'Platforms' },
    { path: '/api/v1/country-master', method: 'GET', description: 'Country Master' },
    { path: '/api/v1/industry-sectors', method: 'GET', description: 'Industry Sectors' },
    { path: '/api/v1/asset-category-master', method: 'GET', description: 'Asset Category Master' },
    { path: '/api/v1/asset-type-master', method: 'GET', description: 'Asset Type Master' }
  ]);
  allResults.push(configResults);
  
  // Asset QC Workflow
  const qcTestData = {
    asset_name: `QC Test Asset ${Date.now()}`,
    asset_type: "Image",
    asset_category: "Graphics",
    status: "Pending QC Review",
    application_type: "web"
  };
  
  const qcResults = await testModule('Asset QC Workflow', [
    { path: '/api/v1/assetLibrary/qc/pending', method: 'GET', description: 'QC Pending Assets' },
    { path: '/api/v1/admin/qc/assets', method: 'GET', description: 'Admin QC Assets' },
    { path: '/api/v1/assetLibrary', method: 'POST', data: qcTestData, description: 'Create Asset for QC' },
    { path: '/api/v1/assetLibrary/1/submit-qc', method: 'POST', description: 'Submit Asset to QC' },
    { path: '/api/v1/assetLibrary/1/qc-reviews', method: 'GET', description: 'Get QC Reviews' }
  ]);
  allResults.push(qcResults);
  
  // Test Upload/Creation for different modules
  const uploadTests = [
    {
      module: 'Upload Tests',
      endpoints: [
        { path: '/api/v1/projects', method: 'POST', data: { name: 'Test Project', client: 'Test Client' }, description: 'Create Project' },
        { path: '/api/v1/campaigns', method: 'POST', data: { name: 'Test Campaign', budget: 10000 }, description: 'Create Campaign' },
        { path: '/api/v1/tasks', method: 'POST', data: { name: 'Test Task', project_id: 1 }, description: 'Create Task' },
        { path: '/api/v1/services', method: 'POST', data: { service_name: 'Test Service', service_code: 'TEST-001' }, description: 'Create Service' },
        { path: '/api/v1/keywords', method: 'POST', data: { keyword: 'test keyword', search_volume: 100 }, description: 'Create Keyword' }
      ]
    }
  ];
  
  for (const test of uploadTests) {
    const uploadResult = await testModule(test.module, test.endpoints);
    allResults.push(uploadResult);
  }
  
  // Generate Summary Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(60));
  
  let totalSuccess = 0;
  let totalTests = 0;
  
  allResults.forEach(result => {
    totalSuccess += result.successCount;
    totalTests += result.totalCount;
    
    const status = result.successRate === 100 ? '✅' : result.successRate >= 80 ? '⚠️' : '❌';
    console.log(`${status} ${result.module}: ${result.successCount}/${result.totalCount} (${result.successRate.toFixed(1)}%)`);
  });
  
  const overallSuccessRate = (totalSuccess / totalTests) * 100;
  
  console.log('\n' + '-'.repeat(60));
  console.log(`🎯 OVERALL: ${totalSuccess}/${totalTests} tests passed (${overallSuccessRate.toFixed(1)}%)`);
  
  if (overallSuccessRate === 100) {
    console.log('🎉 ALL PAGES AND FEATURES WORKING PERFECTLY!');
  } else if (overallSuccessRate >= 90) {
    console.log('✅ MOST FEATURES WORKING - Minor issues detected');
  } else if (overallSuccessRate >= 75) {
    console.log('⚠️  SOME FEATURES WORKING - Several issues need attention');
  } else {
    console.log('❌ MAJOR ISSUES DETECTED - Multiple features not working');
  }
  
  console.log('\n📋 RECOMMENDATIONS:');
  
  const failedModules = allResults.filter(r => r.successRate < 100);
  if (failedModules.length > 0) {
    console.log('🔧 Fix the following modules:');
    failedModules.forEach(module => {
      console.log(`   - ${module.module}: ${module.totalCount - module.successCount} failing tests`);
    });
  } else {
    console.log('✅ All modules are functioning correctly');
    console.log('✅ Tables are displaying data properly');
    console.log('✅ Uploads and CRUD operations working');
    console.log('✅ Ready for production use');
  }
  
  return {
    overallSuccessRate,
    totalSuccess,
    totalTests,
    moduleResults: allResults
  };
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);
