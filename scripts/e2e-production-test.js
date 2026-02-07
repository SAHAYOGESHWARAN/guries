#!/usr/bin/env node
/**
 * End-to-End Production Test Suite
 * Tests https://guires-nu.vercel.app (or BASE_URL) for API and frontend integration.
 *
 * Usage:
 *   node scripts/e2e-production-test.js
 *   BASE_URL=https://guires-nu.vercel.app ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword node scripts/e2e-production-test.js
 *
 * Requires: Node 18+ (for global fetch). On Node 16 use: node --experimental-fetch scripts/e2e-production-test.js
 */

const BASE_URL = process.env.BASE_URL || 'https://guires-nu.vercel.app';
const API_BASE = `${BASE_URL}/api/v1`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

let authToken = null;

async function makeRequest(method, path, body = null, useAuth = true) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(useAuth && authToken && { Authorization: `Bearer ${authToken}` }),
  };
  const options = { method, headers };
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data, headers: Object.fromEntries(res.headers.entries()) };
}

// expectedStatus: number or array of numbers (e.g. [200, 204])
async function test(name, method, path, body, expectedStatus = 200) {
  const allowed = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  try {
    const r = await makeRequest(method, path, body);
    const pass = allowed.includes(r.status);
    if (pass) {
      log(`  ✅ ${name}`, 'green');
      return { name, pass: true, status: r.status };
    } else {
      log(`  ❌ ${name} (expected ${allowed.join(' or ')}, got ${r.status})`, 'red');
      return { name, pass: false, status: r.status, detail: r.data };
    }
  } catch (e) {
    log(`  ❌ ${name} - ${e.message}`, 'red');
    return { name, pass: false, error: e.message };
  }
}

async function testPageLoad(name, path, expectedInBody = 'Guires') {
  try {
    const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    const pass = res.ok && (typeof expectedInBody === 'string' ? text.includes(expectedInBody) : true);
    if (pass) {
      log(`  ✅ ${name}`, 'green');
      return { name, pass: true, status: res.status };
    } else {
      log(`  ❌ ${name} (status ${res.status} or body missing "${expectedInBody}")`, 'red');
      return { name, pass: false, status: res.status };
    }
  } catch (e) {
    log(`  ❌ ${name} - ${e.message}`, 'red');
    return { name, pass: false, error: e.message };
  }
}

async function runTests() {
  const results = [];
  log('\n' + '='.repeat(60), 'cyan');
  log('  E2E Production Test: ' + BASE_URL, 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  // ---- 1. Health (no auth) ----
  log('1. Health & system (no auth)', 'blue');
  results.push(await test('GET /health', 'GET', '/health', null, 200));
  results.push(await test('GET /system/stats', 'GET', '/system/stats', null, 200));

  // ---- 2. Auth ----
  log('\n2. Authentication', 'blue');
  const loginRes = await makeRequest('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  }, false);
  if (loginRes.status === 200 && loginRes.data && (loginRes.data.token || loginRes.data.success)) {
    authToken = loginRes.data.token || (loginRes.data.data && loginRes.data.data.token);
    if (!authToken && loginRes.data.token) authToken = loginRes.data.token;
    log('  ✅ Login', 'green');
    results.push({ name: 'Login', pass: true });
  } else {
    log('  ❌ Login failed (status ' + loginRes.status + ')', 'red');
    results.push({ name: 'Login', pass: false, status: loginRes.status, detail: loginRes.data });
    log('\n  Skipping authenticated tests (no token).', 'yellow');
    const summary = results.filter((r) => r.pass).length;
    const total = results.length;
    log('\n' + '='.repeat(60), 'cyan');
    log(`Result: ${summary}/${total} passed`, summary === total ? 'green' : 'red');
    log('='.repeat(60) + '\n', 'cyan');
    return { results, passed: summary, total };
  }

  // ---- 3. Frontend page load ----
  log('\n3. Frontend delivery', 'blue');
  results.push(await testPageLoad('GET / (HTML)', '/', 'Guires'));
  results.push(await testPageLoad('GET / (has root div)', '/', 'id="root"'));

  // ---- 4. Dashboard & core ----
  log('\n4. Dashboard & notifications', 'blue');
  results.push(await test('Dashboard stats', 'GET', '/dashboard/stats'));
  results.push(await test('Upcoming tasks', 'GET', '/dashboard/upcoming-tasks'));
  results.push(await test('Recent activity', 'GET', '/dashboard/recent-activity'));
  results.push(await test('Notifications', 'GET', '/notifications'));

  // ---- 5. Core entities (GET list) ----
  log('\n5. Core entities (lists)', 'blue');
  results.push(await test('Campaigns', 'GET', '/campaigns'));
  results.push(await test('Projects', 'GET', '/projects'));
  results.push(await test('Tasks', 'GET', '/tasks'));
  results.push(await test('Assets', 'GET', '/assets'));
  results.push(await test('Asset library', 'GET', '/assetLibrary'));
  results.push(await test('Users', 'GET', '/users'));
  results.push(await test('Services', 'GET', '/services'));
  results.push(await test('Sub-services', 'GET', '/sub-services'));
  results.push(await test('Teams', 'GET', '/teams'));
  results.push(await test('Roles', 'GET', '/roles'));
  results.push(await test('Personas', 'GET', '/personas'));
  results.push(await test('Forms', 'GET', '/forms'));
  results.push(await test('Submissions', 'GET', '/submissions'));
  results.push(await test('Performance targets', 'GET', '/performance-targets'));

  // ---- 6. Repositories & content ----
  log('\n6. Repositories & content', 'blue');
  results.push(await test('Content', 'GET', '/content'));
  results.push(await test('Service pages', 'GET', '/service-pages'));
  results.push(await test('SMM posts', 'GET', '/smm'));
  results.push(await test('Graphics', 'GET', '/graphics'));
  results.push(await test('Promotion items', 'GET', '/promotion-items'));
  results.push(await test('Keywords', 'GET', '/keywords'));
  results.push(await test('Backlinks', 'GET', '/backlinks'));
  results.push(await test('Backlink sources', 'GET', '/backlink-sources'));

  // ---- 7. Masters & config ----
  log('\n7. Masters & configuration', 'blue');
  results.push(await test('Asset categories', 'GET', '/asset-categories'));
  results.push(await test('Asset formats', 'GET', '/asset-formats'));
  results.push(await test('Platforms', 'GET', '/platforms'));
  results.push(await test('Countries', 'GET', '/countries'));
  results.push(await test('Country master', 'GET', '/country-master'));
  results.push(await test('Workflow stages', 'GET', '/workflow-stages'));
  results.push(await test('QC weightage', 'GET', '/qc-weightage'));
  results.push(await test('QC weightage configs', 'GET', '/qc-weightage-configs'));
  results.push(await test('QC versions', 'GET', '/qc-versions'));
  results.push(await test('Brands', 'GET', '/brands'));
  results.push(await test('Content types', 'GET', '/content-types'));
  results.push(await test('Asset types', 'GET', '/asset-types'));
  results.push(await test('Settings', 'GET', '/settings'));
  results.push(await test('Integrations', 'GET', '/integrations'));
  results.push(await test('Industry sectors', 'GET', '/industry-sectors'));
  results.push(await test('SEO errors', 'GET', '/seo-errors'));
  results.push(await test('Logs', 'GET', '/logs'));

  // ---- 8. Analytics & dashboards ----
  log('\n8. Analytics & dashboards', 'blue');
  results.push(await test('Analytics dashboard', 'GET', '/analytics-dashboard'));
  results.push(await test('Analytics traffic', 'GET', '/analytics/traffic'));
  results.push(await test('Analytics KPI', 'GET', '/analytics/kpi'));
  results.push(await test('Analytics dashboard metrics', 'GET', '/analytics/dashboard-metrics'));
  results.push(await test('Employee scorecard', 'GET', '/employee-scorecard'));
  results.push(await test('Employee comparison', 'GET', '/employee-comparison'));
  results.push(await test('Performance dashboard', 'GET', '/dashboards/performance'));
  results.push(await test('Effort dashboard', 'GET', '/dashboards/effort'));
  results.push(await test('Dashboards employees', 'GET', '/dashboards/employees'));
  results.push(await test('Team leader dashboard', 'GET', '/dashboards/team-leader'));
  results.push(await test('Team performance stats', 'GET', '/dashboards/team-performance-stats'));
  results.push(await test('AI evaluation dashboard', 'GET', '/dashboards/ai-evaluation'));
  results.push(await test('AI evaluation history', 'GET', '/dashboards/ai-evaluation/history'));
  results.push(await test('Rewards penalties dashboard', 'GET', '/dashboards/rewards-penalties'));
  results.push(await test('Workload prediction', 'GET', '/dashboards/workload-prediction'));
  results.push(await test('Capacity forecast', 'GET', '/dashboards/workload-prediction/capacity-forecast'));
  results.push(await test('OKRs', 'GET', '/okrs'));
  results.push(await test('Competitors', 'GET', '/competitors'));
  results.push(await test('Gold standards', 'GET', '/gold-standards'));
  results.push(await test('Effort targets', 'GET', '/effort-targets'));
  results.push(await test('HR workload', 'GET', '/hr/workload'));
  results.push(await test('HR rewards', 'GET', '/hr/rewards'));
  results.push(await test('HR rankings', 'GET', '/hr/rankings'));
  results.push(await test('HR skills', 'GET', '/hr/skills'));
  results.push(await test('HR achievements', 'GET', '/hr/achievements'));

  // ---- 9. SEO, errors, UX ----
  log('\n9. SEO, errors & UX', 'blue');
  results.push(await test('SEO assets', 'GET', '/seo-assets'));
  results.push(await test('SEO assets master sectors', 'GET', '/seo-assets/master/sectors'));
  results.push(await test('SEO assets master industries', 'GET', '/seo-assets/master/industries'));
  results.push(await test('SEO assets master domain types', 'GET', '/seo-assets/master/domain-types'));
  results.push(await test('SEO assets master asset types', 'GET', '/seo-assets/master/asset-types'));
  results.push(await test('URL errors', 'GET', '/url-errors'));
  results.push(await test('On-page SEO audits', 'GET', '/on-page-seo-audits'));
  results.push(await test('Toxic backlinks', 'GET', '/toxic-backlinks'));
  results.push(await test('UX issues', 'GET', '/ux-issues'));
  results.push(await test('Competitor backlinks', 'GET', '/competitor-backlinks'));

  // ---- 10. Communication & knowledge ----
  log('\n10. Communication & knowledge', 'blue');
  results.push(await test('Communication emails', 'GET', '/communication/emails'));
  results.push(await test('Communication voice profiles', 'GET', '/communication/voice-profiles'));
  results.push(await test('Communication calls', 'GET', '/communication/calls'));
  results.push(await test('Knowledge articles', 'GET', '/knowledge/articles'));
  results.push(await test('Compliance rules', 'GET', '/compliance/rules'));
  results.push(await test('Compliance audits', 'GET', '/compliance/audits'));

  // ---- 11. Reports & QC ----
  log('\n11. Reports & QC', 'blue');
  results.push(await test('Report today', 'GET', '/reports/today'));
  results.push(await test('QC runs', 'GET', '/qc-runs'));
  results.push(await test('QC checklists', 'GET', '/qc-checklists'));

  // ---- 12. Error handling ----
  log('\n12. Error handling', 'blue');
  results.push(await test('Invalid route → 404', 'GET', '/invalid-route-xyz', null, 404));

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  const rate = total ? ((passed / total) * 100).toFixed(1) : 0;

  log('\n' + '='.repeat(60), 'cyan');
  log(`  Result: ${passed}/${total} passed (${rate}%)`, passed === total ? 'green' : passed > 0 ? 'yellow' : 'red');
  log('='.repeat(60) + '\n', 'cyan');

  return { results, passed, total };
}

function writeReport(result) {
  const path = require('path');
  const fs = require('fs');
  const outPath = path.join(__dirname, '..', 'E2E_PRODUCTION_REPORT.md');
  const lines = [
    '# E2E Production Test Report',
    '',
    `**Base URL:** ${BASE_URL}`,
    `**Run:** ${new Date().toISOString()}`,
    `**Result:** ${result.passed}/${result.total} passed`,
    '',
    '## Summary by category',
    '',
    '| Category | Passed | Total |',
    '|----------|--------|-------|',
  ];
  const categories = {};
  for (const r of result.results) {
    const cat = r.category || 'Other';
    if (!categories[cat]) categories[cat] = { pass: 0, total: 0 };
    categories[cat].total++;
    if (r.pass) categories[cat].pass++;
  }
  for (const [cat, c] of Object.entries(categories)) {
    lines.push(`| ${cat} | ${c.pass} | ${c.total} |`);
  }
  lines.push('', '## All tests', '');
  for (const r of result.results) {
    lines.push(`- ${r.pass ? '✅' : '❌'} ${r.name}${r.status ? ` (${r.status})` : ''}`);
  }
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  log('Report written to E2E_PRODUCTION_REPORT.md', 'dim');
}

// Assign categories for report (by test order: each block of tests gets a category)
function assignCategories(results) {
  const categories = [
    'Health & system',
    'Authentication',
    'Frontend delivery',
    'Dashboard & notifications',
    'Core entities',
    'Repositories & content',
    'Masters & configuration',
    'Analytics & dashboards',
    'SEO, errors & UX',
    'Communication & knowledge',
    'Reports & QC',
    'Error handling',
  ];
  let i = 0;
  for (const r of results) {
    if (r.name === 'GET /health') i = 0;
    else if (r.name === 'Login') i = 1;
    else if (r.name === 'GET / (HTML)') i = 2;
    else if (r.name === 'Dashboard stats') i = 3;
    else if (r.name === 'Campaigns') i = 4;
    else if (r.name === 'Content') i = 5;
    else if (r.name === 'Asset categories') i = 6;
    else if (r.name === 'Analytics dashboard') i = 7;
    else if (r.name === 'SEO assets') i = 8;
    else if (r.name === 'Communication emails') i = 9;
    else if (r.name === 'Report today') i = 10;
    else if (r.name === 'Invalid route → 404') i = 11;
    r.category = categories[i] || 'Other';
  }
  return results;
}

runTests()
  .then((result) => {
    assignCategories(result.results);
    writeReport(result);
    process.exit(result.total > 0 && result.passed === result.total ? 0 : 1);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
