/**
 * Comprehensive Module Testing Script
 * Tests all API endpoints for the Marketing Control Center
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001/api/v1';
const DEPLOYED_URL = 'https://guries.vercel.app/api/v1';

// Test endpoints for each module
const MODULE_ENDPOINTS = {
  // Dashboard & Main Navigation
  dashboard: ['/dashboard/stats', '/dashboard/upcoming-tasks', '/dashboard/recent-activity'],
  
  // Core Modules
  projects: ['/projects'],
  campaigns: ['/campaigns'],
  tasks: ['/tasks'],
  assets: ['/assets', '/assetLibrary'],
  
  // Repository Modules
  content: ['/content'],
  services: ['/services', '/sub-services'],
  servicePages: ['/service-pages'],
  smm: ['/smm'],
  graphics: ['/graphics'],
  onPageErrors: ['/url-errors'],
  backlinks: ['/backlinks', '/backlink-sources'],
  toxicBacklinks: ['/toxic-backlinks'],
  uxIssues: ['/ux-issues'],
  promotionItems: ['/promotion-items'],
  competitors: ['/competitors', '/competitor-backlinks'],
  
  // Configuration Masters
  assetCategories: ['/asset-categories', '/asset-category-master'],
  assetTypes: ['/asset-types', '/asset-type-master'],
  contentTypes: ['/content-types'],
  platforms: ['/platforms', '/platform-master'],
  countries: ['/country-master'],
  seoErrorTypes: ['/seo-error-type-master'],
  workflowStages: ['/workflow-stage-master'],
  users: ['/users', '/user-management'],
  keywords: ['/keywords'],
  industrySectors: ['/industry-sectors'],
  
  // Analytics & Dashboards
  kpi: ['/kpi-tracking'],
  performance: ['/performance-targets'],
  okrs: ['/okrs'],
  analytics: ['/analytics-dashboard'],
  employeeScorecard: ['/employee-scorecard'],
  employeeComparison: ['/employee-comparison'],
  teamLeader: ['/team-leader-dashboard'],
  aiEvaluation: ['/ai-evaluation-engine'],
  rewardPenalty: ['/reward-penalty-automation'],
  workloadPrediction: ['/workload-prediction'],
  aiTaskAllocation: ['/ai-task-allocation'],
  
  // System
  notifications: ['/notifications'],
  system: ['/system/stats'],
  auth: ['/auth/login'],
  
  // Quality Control
  qc: ['/qc-runs', '/qc-weightage', '/audit-checklist'],
  assetQC: ['/assetLibrary/qc/pending'],
  
  // Settings & Configuration
  effortTargets: ['/effort-targets'],
  goldStandards: ['/gold-standards'],
  performanceBenchmark: ['/performance-benchmark'],
  competitorBenchmark: ['/competitor-benchmark'],
  integrations: ['/integrations']
};

async function testEndpoint(url, endpoint) {
  try {
    const response = await fetch(`${url}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    const status = response.status;
    const success = status >= 200 && status < 300;
    
    return {
      endpoint,
      status,
      success,
      error: success ? null : `HTTP ${status}`
    };
  } catch (error) {
    return {
      endpoint,
      status: 0,
      success: false,
      error: error.message
    };
  }
}

async function testModule(baseUrl, moduleName, endpoints) {
  console.log(`\n🔍 Testing ${moduleName.toUpperCase()} module...`);
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(baseUrl, endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ ${endpoint} - ${result.status}`);
    } else {
      console.log(`  ❌ ${endpoint} - ${result.error || 'Failed'}`);
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`  📊 ${moduleName}: ${successCount}/${totalCount} endpoints working`);
  
  return {
    module: moduleName,
    successCount,
    totalCount,
    successRate: (successCount / totalCount) * 100,
    results
  };
}

async function testAllModules(baseUrl) {
  console.log(`🚀 Testing all modules at: ${baseUrl}`);
  console.log('=' .repeat(60));
  
  const moduleResults = [];
  let totalSuccess = 0;
  let totalEndpoints = 0;
  
  for (const [moduleName, endpoints] of Object.entries(MODULE_ENDPOINTS)) {
    const result = await testModule(baseUrl, moduleName, endpoints);
    moduleResults.push(result);
    totalSuccess += result.successCount;
    totalEndpoints += result.totalCount;
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📈 OVERALL SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total Endpoints Tested: ${totalEndpoints}`);
  console.log(`Total Working: ${totalSuccess}`);
  console.log(`Overall Success Rate: ${((totalSuccess / totalEndpoints) * 100).toFixed(1)}%`);
  
  // Failed modules
  const failedModules = moduleResults.filter(m => m.successRate < 100);
  if (failedModules.length > 0) {
    console.log('\n❌ MODULES WITH ISSUES:');
    failedModules.forEach(module => {
      console.log(`  ${module.module}: ${module.successRate.toFixed(1)}% (${module.successCount}/${module.totalCount})`);
      module.results.filter(r => !r.success).forEach(r => {
        console.log(`    - ${r.endpoint}: ${r.error}`);
      });
    });
  }
  
  // Perfect modules
  const perfectModules = moduleResults.filter(m => m.successRate === 100);
  if (perfectModules.length > 0) {
    console.log('\n✅ MODULES WORKING PERFECTLY:');
    perfectModules.forEach(module => {
      console.log(`  ${module.module}: ${module.successCount}/${module.totalCount} endpoints`);
    });
  }
  
  return {
    baseUrl,
    totalEndpoints,
    totalSuccess,
    successRate: (totalSuccess / totalEndpoints) * 100,
    moduleResults
  };
}

async function main() {
  console.log('🧪 MARKETING CONTROL CENTER - COMPREHENSIVE MODULE TESTING');
  console.log('================================================================');
  
  // Test local development
  console.log('\n🏠 Testing LOCAL Development Server...');
  const localResults = await testAllModules(BASE_URL);
  
  // Test deployed version
  console.log('\n☁️  Testing DEPLOYED Version...');
  const deployedResults = await testAllModules(DEPLOYED_URL);
  
  // Comparison
  console.log('\n📊 COMPARISON SUMMARY');
  console.log('========================');
  console.log(`Local: ${localResults.successRate.toFixed(1)}% (${localResults.totalSuccess}/${localResults.totalEndpoints})`);
  console.log(`Deployed: ${deployedResults.successRate.toFixed(1)}% (${deployedResults.totalSuccess}/${deployedResults.totalEndpoints})`);
  
  if (deployedResults.successRate < 100) {
    console.log('\n⚠️  DEPLOYMENT ISSUES FOUND!');
    console.log('Some endpoints are not working in the deployed version.');
    console.log('Check the failed modules above for details.');
  } else {
    console.log('\n🎉 ALL MODULES WORKING IN DEPLOYMENT!');
  }
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAllModules, testEndpoint, MODULE_ENDPOINTS };
