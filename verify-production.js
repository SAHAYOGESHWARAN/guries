/**
 * Production Verification Script
 * Verifies all systems are working with real-time data
 * Usage: node verify-production.js
 */

const http = require('http');
const https = require('https');

const API_BASE = 'http://localhost:3001/api/v1';
const FRONTEND_URL = 'http://localhost:5173';

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test API endpoint
async function testEndpoint(method, endpoint, expectedStatus = 200) {
    return new Promise((resolve) => {
        const url = `${API_BASE}${endpoint}`;
        const urlObj = new URL(url);

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const success = res.statusCode === expectedStatus || res.statusCode === 200;
                resolve({
                    success,
                    status: res.statusCode,
                    endpoint,
                    data: data ? JSON.parse(data) : null
                });
            });
        });

        req.on('error', (err) => {
            resolve({
                success: false,
                status: 0,
                endpoint,
                error: err.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                success: false,
                status: 0,
                endpoint,
                error: 'Request timeout'
            });
        });

        req.end();
    });
}

// Main verification
async function verifyProduction() {
    log('\n🔍 PRODUCTION VERIFICATION STARTED\n', 'cyan');
    log('═'.repeat(60), 'blue');

    const results = {
        passed: 0,
        failed: 0,
        warnings: 0
    };

    // 1. Backend Health Check
    log('\n📡 BACKEND HEALTH CHECK', 'yellow');
    log('─'.repeat(60), 'blue');

    const healthCheck = await testEndpoint('GET', '/../health');
    if (healthCheck.success) {
        log('✓ Backend server is running', 'green');
        results.passed++;
    } else {
        log('✗ Backend server is NOT running', 'red');
        log('  Please start backend: cd backend && npm run dev', 'yellow');
        results.failed++;
        return results;
    }

    // 2. Core API Endpoints
    log('\n🔌 CORE API ENDPOINTS', 'yellow');
    log('─'.repeat(60), 'blue');

    const coreEndpoints = [
        { method: 'GET', path: '/dashboard/stats', name: 'Dashboard Stats' },
        { method: 'GET', path: '/projects', name: 'Projects' },
        { method: 'GET', path: '/campaigns', name: 'Campaigns' },
        { method: 'GET', path: '/tasks', name: 'Tasks' },
        { method: 'GET', path: '/assets', name: 'Assets' },
        { method: 'GET', path: '/users', name: 'Users' },
        { method: 'GET', path: '/content', name: 'Content Repository' },
        { method: 'GET', path: '/services', name: 'Services' },
        { method: 'GET', path: '/sub-services', name: 'Sub-Services' },
        { method: 'GET', path: '/keywords', name: 'Keywords' },
        { method: 'GET', path: '/backlinks', name: 'Backlinks' }
    ];

    for (const endpoint of coreEndpoints) {
        const result = await testEndpoint(endpoint.method, endpoint.path);
        if (result.success) {
            const count = Array.isArray(result.data) ? result.data.length : 'N/A';
            log(`✓ ${endpoint.name.padEnd(30)} [${count} records]`, 'green');
            results.passed++;
        } else {
            log(`✗ ${endpoint.name.padEnd(30)} [${result.error || 'Failed'}]`, 'red');
            results.failed++;
        }
    }

    // 3. Master Tables
    log('\n📋 MASTER TABLES', 'yellow');
    log('─'.repeat(60), 'blue');

    const masterEndpoints = [
        { method: 'GET', path: '/brands', name: 'Brands' },
        { method: 'GET', path: '/countries', name: 'Countries' },
        { method: 'GET', path: '/industry-sectors', name: 'Industry Sectors' },
        { method: 'GET', path: '/content-types', name: 'Content Types' },
        { method: 'GET', path: '/asset-types', name: 'Asset Types' },
        { method: 'GET', path: '/platforms', name: 'Platforms' },
        { method: 'GET', path: '/workflow-stages', name: 'Workflow Stages' },
        { method: 'GET', path: '/roles', name: 'User Roles' }
    ];

    for (const endpoint of masterEndpoints) {
        const result = await testEndpoint(endpoint.method, endpoint.path);
        if (result.success) {
            const count = Array.isArray(result.data) ? result.data.length : 'N/A';
            log(`✓ ${endpoint.name.padEnd(30)} [${count} records]`, 'green');
            results.passed++;
        } else {
            log(`✗ ${endpoint.name.padEnd(30)} [${result.error || 'Failed'}]`, 'red');
            results.failed++;
        }
    }

    // 4. Analytics & Reports
    log('\n📊 ANALYTICS & REPORTS', 'yellow');
    log('─'.repeat(60), 'blue');

    const analyticsEndpoints = [
        { method: 'GET', path: '/analytics/traffic', name: 'Traffic Analytics' },
        { method: 'GET', path: '/analytics/kpi', name: 'KPI Summary' },
        { method: 'GET', path: '/hr/workload', name: 'Workload Forecast' },
        { method: 'GET', path: '/hr/rankings', name: 'Employee Rankings' }
    ];

    for (const endpoint of analyticsEndpoints) {
        const result = await testEndpoint(endpoint.method, endpoint.path);
        if (result.success) {
            log(`✓ ${endpoint.name}`, 'green');
            results.passed++;
        } else {
            log(`✗ ${endpoint.name} [${result.error || 'Failed'}]`, 'red');
            results.failed++;
        }
    }

    // 5. Real-time Features
    log('\n⚡ REAL-TIME FEATURES', 'yellow');
    log('─'.repeat(60), 'blue');

    const realtimeEndpoints = [
        { method: 'GET', path: '/notifications', name: 'Notifications' },
        { method: 'GET', path: '/system/stats', name: 'System Stats' }
    ];

    for (const endpoint of realtimeEndpoints) {
        const result = await testEndpoint(endpoint.method, endpoint.path);
        if (result.success) {
            log(`✓ ${endpoint.name}`, 'green');
            results.passed++;
        } else {
            log(`✗ ${endpoint.name} [${result.error || 'Failed'}]`, 'red');
            results.failed++;
        }
    }

    // 6. Configuration & Settings
    log('\n⚙️  CONFIGURATION', 'yellow');
    log('─'.repeat(60), 'blue');

    const configEndpoints = [
        { method: 'GET', path: '/settings', name: 'Settings' },
        { method: 'GET', path: '/integrations', name: 'Integrations' }
    ];

    for (const endpoint of configEndpoints) {
        const result = await testEndpoint(endpoint.method, endpoint.path);
        if (result.success) {
            log(`✓ ${endpoint.name}`, 'green');
            results.passed++;
        } else {
            log(`✗ ${endpoint.name} [${result.error || 'Failed'}]`, 'red');
            results.failed++;
        }
    }

    // Summary
    log('\n═'.repeat(60), 'blue');
    log('\n📈 VERIFICATION SUMMARY', 'cyan');
    log('─'.repeat(60), 'blue');
    log(`✓ Passed:   ${results.passed}`, 'green');
    log(`✗ Failed:   ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    log(`⚠ Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green');

    const total = results.passed + results.failed;
    const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;

    log(`\n📊 Success Rate: ${percentage}%`, percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red');

    if (results.failed === 0) {
        log('\n✅ ALL SYSTEMS OPERATIONAL - PRODUCTION READY', 'green');
    } else if (results.failed <= 5) {
        log('\n⚠️  MINOR ISSUES DETECTED - REVIEW FAILED ENDPOINTS', 'yellow');
    } else {
        log('\n❌ CRITICAL ISSUES DETECTED - FIX BEFORE PRODUCTION', 'red');
    }

    log('\n═'.repeat(60), 'blue');
    log('\n📝 NEXT STEPS:', 'cyan');
    log('  1. Ensure backend is running: cd backend && npm run dev', 'blue');
    log('  2. Ensure frontend is running: npm run dev', 'blue');
    log('  3. Check database connection in backend/.env', 'blue');
    log('  4. Review any failed endpoints above', 'blue');
    log('  5. Test frontend at: http://localhost:5173\n', 'blue');

    return results;
}

// Run verification
verifyProduction().catch(err => {
    log(`\n❌ Verification failed: ${err.message}`, 'red');
    process.exit(1);
});
