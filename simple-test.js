/**
 * Simple Module Testing Script (no external dependencies)
 * Tests core API endpoints for the Marketing Control Center
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3001/api/v1';
const DEPLOYED_URL = 'https://guries.vercel.app/api/v1';

// Core endpoints to test
const CORE_ENDPOINTS = [
  '/health',
  '/dashboard/stats',
  '/projects',
  '/campaigns',
  '/tasks',
  '/assets',
  '/assetLibrary',
  '/services',
  '/users',
  '/notifications'
];

// Repository endpoints
const REPOSITORY_ENDPOINTS = [
  '/content',
  '/service-pages',
  '/smm',
  '/graphics',
  '/backlinks',
  '/keywords',
  '/competitors'
];

// Configuration endpoints
const CONFIG_ENDPOINTS = [
  '/asset-categories',
  '/asset-types',
  '/platforms',
  '/country-master',
  '/industry-sectors'
];

function testEndpoint(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        resolve({
          url,
          status: response.statusCode,
          success: response.statusCode >= 200 && response.statusCode < 300,
          responseTime: Date.now()
        });
      });
    });

    request.on('error', (error) => {
      resolve({
        url,
        status: 0,
        success: false,
        error: error.message,
        responseTime: Date.now()
      });
    });

    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        url,
        status: 0,
        success: false,
        error: 'Timeout',
        responseTime: Date.now()
      });
    });
  });
}

async function testEndpoints(baseUrl, endpointList, categoryName) {
  console.log(`\n🔍 Testing ${categoryName}...`);
  
  const results = [];
  for (const endpoint of endpointList) {
    const fullUrl = `${baseUrl}${endpoint}`;
    const startTime = Date.now();
    const result = await testEndpoint(fullUrl);
    result.responseTime = Date.now() - startTime;
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ ${endpoint} - ${result.status} (${result.responseTime}ms)`);
    } else {
      console.log(`  ❌ ${endpoint} - ${result.error || `HTTP ${result.status}`} (${result.responseTime}ms)`);
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`  📊 ${categoryName}: ${successCount}/${totalCount} working (${((successCount/totalCount)*100).toFixed(1)}%)`);
  
  return {
    category: categoryName,
    successCount,
    totalCount,
    successRate: (successCount/totalCount) * 100,
    results
  };
}

async function runComprehensiveTest() {
  console.log('🧪 MARKETING CONTROL CENTER - MODULE TESTING');
  console.log('='.repeat(50));
  
  // Test Local Development
  console.log('\n🏠 TESTING LOCAL DEVELOPMENT SERVER');
  console.log('URL:', BASE_URL);
  console.log('-'.repeat(50));
  
  const localCore = await testEndpoints(BASE_URL, CORE_ENDPOINTS, 'Core Modules');
  const localRepos = await testEndpoints(BASE_URL, REPOSITORY_ENDPOINTS, 'Repository Modules');
  const localConfig = await testEndpoints(BASE_URL, CONFIG_ENDPOINTS, 'Configuration Modules');
  
  const localTotal = {
    successCount: localCore.successCount + localRepos.successCount + localConfig.successCount,
    totalCount: localCore.totalCount + localRepos.totalCount + localConfig.totalCount
  };
  
  console.log('\n📊 LOCAL SUMMARY');
  console.log(`Total: ${localTotal.successCount}/${localTotal.totalCount} working (${((localTotal.successCount/localTotal.totalCount)*100).toFixed(1)}%)`);
  
  // Test Deployed Version
  console.log('\n☁️  TESTING DEPLOYED VERSION');
  console.log('URL:', DEPLOYED_URL);
  console.log('-'.repeat(50));
  
  const deployedCore = await testEndpoints(DEPLOYED_URL, CORE_ENDPOINTS, 'Core Modules');
  const deployedRepos = await testEndpoints(DEPLOYED_URL, REPOSITORY_ENDPOINTS, 'Repository Modules');
  const deployedConfig = await testEndpoints(DEPLOYED_URL, CONFIG_ENDPOINTS, 'Configuration Modules');
  
  const deployedTotal = {
    successCount: deployedCore.successCount + deployedRepos.successCount + deployedConfig.successCount,
    totalCount: deployedCore.totalCount + deployedRepos.totalCount + deployedConfig.totalCount
  };
  
  console.log('\n📊 DEPLOYED SUMMARY');
  console.log(`Total: ${deployedTotal.successCount}/${deployedTotal.totalCount} working (${((deployedTotal.successCount/deployedTotal.totalCount)*100).toFixed(1)}%)`);
  
  // Final Comparison
  console.log('\n🎯 FINAL COMPARISON');
  console.log('='.repeat(50));
  console.log(`Local Server:     ${((localTotal.successCount/localTotal.totalCount)*100).toFixed(1)}% (${localTotal.successCount}/${localTotal.totalCount})`);
  console.log(`Deployed Version: ${((deployedTotal.successCount/deployedTotal.totalCount)*100).toFixed(1)}% (${deployedTotal.successCount}/${deployedTotal.totalCount})`);
  
  if (deployedTotal.successCount === deployedTotal.totalCount) {
    console.log('\n🎉 ALL MODULES WORKING IN DEPLOYMENT!');
  } else {
    console.log('\n⚠️  DEPLOYMENT ISSUES FOUND');
    console.log('Some endpoints are not working in the deployed version.');
    
    // Show failing endpoints
    const allDeployed = [...deployedCore.results, ...deployedRepos.results, ...deployedConfig.results];
    const failing = allDeployed.filter(r => !r.success);
    
    if (failing.length > 0) {
      console.log('\n❌ Failing endpoints:');
      failing.forEach(f => {
        console.log(`  ${f.url.replace(DEPLOYED_URL, '')}: ${f.error || `HTTP ${f.status}`}`);
      });
    }
  }
  
  return {
    local: localTotal,
    deployed: deployedTotal,
    details: {
      local: { core: localCore, repos: localRepos, config: localConfig },
      deployed: { core: deployedCore, repos: deployedRepos, config: deployedConfig }
    }
  };
}

// Run the test
runComprehensiveTest().catch(console.error);
