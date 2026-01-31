#!/usr/bin/env node

/**
 * QC Review - Complete Diagnostic & Fix Script
 * Identifies and fixes all QC submission issues
 */

const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const DB_PATH = path.join(__dirname, 'mcc_db.sqlite');

let passed = 0;
let failed = 0;
const issues = [];

// Colors for console output
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

function section(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60));
}

function test(name, result, details = '') {
    if (result) {
        log(`✓ ${name}`, 'green');
        passed++;
    } else {
        log(`✗ ${name}`, 'red');
        if (details) log(`  ${details}`, 'yellow');
        failed++;
        issues.push({ test: name, details });
    }
}

// ============================================
// TEST 1: DATABASE CONNECTIVITY
// ============================================
section('TEST 1: DATABASE CONNECTIVITY');

try {
    const db = new Database(DB_PATH);
    test('Database file exists', fs.existsSync(DB_PATH), DB_PATH);
    test('Database is accessible', true);

    // Check tables
    const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('assets', 'asset_qc_reviews', 'users', 'notifications', 'qc_audit_log')
    `).all();

    const tableNames = tables.map(t => t.name);
    test('All required tables exist', tableNames.length === 5, `Found: ${tableNames.join(', ')}`);

    // Check data
    const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets').get();
    test('Assets exist in database', assetCount.count > 0, `Count: ${assetCount.count}`);

    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    test('Users exist in database', userCount.count > 0, `Count: ${userCount.count}`);

    // Check admin user
    const adminUser = db.prepare("SELECT id, name, role FROM users WHERE role = 'Admin' LIMIT 1").get();
    test('Admin user exists', !!adminUser, adminUser ? `ID: ${adminUser.id}, Name: ${adminUser.name}` : 'No admin found');

    db.close();
} catch (error) {
    test('Database check', false, error.message);
}

// ============================================
// TEST 2: DATABASE SCHEMA
// ============================================
section('TEST 2: DATABASE SCHEMA');

try {
    const db = new Database(DB_PATH);

    // Check asset_qc_reviews columns
    const qcColumns = db.prepare("PRAGMA table_info(asset_qc_reviews)").all();
    const requiredColumns = ['id', 'asset_id', 'qc_reviewer_id', 'qc_score', 'checklist_completion', 'qc_remarks', 'qc_decision', 'checklist_items', 'created_at'];
    const columnNames = qcColumns.map(c => c.name);
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

    test('asset_qc_reviews table schema', missingColumns.length === 0, missingColumns.length > 0 ? `Missing: ${missingColumns.join(', ')}` : 'All columns present');

    // Check assets QC columns
    const assetColumns = db.prepare("PRAGMA table_info(assets)").all();
    const assetColumnNames = assetColumns.map(c => c.name);
    const requiredAssetColumns = ['qc_score', 'qc_remarks', 'qc_reviewer_id', 'qc_reviewed_at', 'qc_status', 'linking_active'];
    const missingAssetColumns = requiredAssetColumns.filter(col => !assetColumnNames.includes(col));

    test('assets table QC columns', missingAssetColumns.length === 0, missingAssetColumns.length > 0 ? `Missing: ${missingAssetColumns.join(', ')}` : 'All columns present');

    db.close();
} catch (error) {
    test('Schema check', false, error.message);
}

// ============================================
// TEST 3: BACKEND CONNECTIVITY
// ============================================
section('TEST 3: BACKEND CONNECTIVITY');

function makeRequest(method, path, data) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port || 3001,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': '1',
                'X-User-Role': 'Admin'
            },
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

(async () => {
    try {
        const response = await makeRequest('GET', '/api/v1/health', null);
        test('Backend is running', response.status === 200, `Status: ${response.status}`);
    } catch (error) {
        test('Backend is running', false, `${error.message} - Make sure backend is running on port 3001`);
    }

    // ============================================
    // TEST 4: API ENDPOINT
    // ============================================
    section('TEST 4: API ENDPOINT');

    try {
        const testData = {
            qc_score: 85,
            qc_remarks: 'Test review',
            qc_decision: 'approved',
            qc_reviewer_id: 1,
            user_role: 'Admin',
            checklist_items: {
                'Brand Compliance': true,
                'Technical Specs Met': true,
                'Content Quality': true,
                'SEO Optimization': true,
                'Legal / Regulatory Check': true,
                'Tone of Voice': true
            },
            checklist_completion: true,
            linking_active: true
        };

        const response = await makeRequest('POST', '/api/v1/assetLibrary/1/qc-review', testData);

        if (response.status === 200) {
            test('QC review endpoint works', true, `Response: ${response.data.name || response.data.asset_name}`);
        } else if (response.status === 403) {
            test('QC review endpoint works', false, `Access denied - User may not be admin`);
        } else if (response.status === 404) {
            test('QC review endpoint works', false, `Endpoint not found - Check backend routes`);
        } else {
            test('QC review endpoint works', false, `Status: ${response.status}`);
        }
    } catch (error) {
        test('QC review endpoint works', false, error.message);
    }

    // ============================================
    // TEST 5: FRONTEND CONFIGURATION
    // ============================================
    section('TEST 5: FRONTEND CONFIGURATION');

    try {
        const envPath = path.join(__dirname, '../frontend/.env.development');

        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');

            test('Frontend .env.development exists', true);
            test('API URL set to localhost:3001', envContent.includes('VITE_API_URL=http://localhost:3001'), 'Check VITE_API_URL value');
            test('Socket URL set to localhost:3001', envContent.includes('VITE_SOCKET_URL=http://localhost:3001'), 'Check VITE_SOCKET_URL value');
        } else {
            test('Frontend .env.development exists', false, 'File not found');
        }
    } catch (error) {
        test('Frontend configuration', false, error.message);
    }

    // ============================================
    // TEST 6: BACKEND ROUTES
    // ============================================
    section('TEST 6: BACKEND ROUTES');

    try {
        const apiPath = path.join(__dirname, 'routes/api.ts');

        if (fs.existsSync(apiPath)) {
            const apiContent = fs.readFileSync(apiPath, 'utf8');

            test('Backend routes file exists', true);
            test('QC review route defined', apiContent.includes("router.post('/assetLibrary/:id/qc-review'"), 'Check api.ts for route definition');
        } else {
            test('Backend routes file exists', false, 'File not found');
        }
    } catch (error) {
        test('Backend routes check', false, error.message);
    }

    // ============================================
    // TEST 7: CONFIG FILES
    // ============================================
    section('TEST 7: CONFIG FILES');

    try {
        const tailwindPath = path.join(__dirname, '../frontend/tailwind.config.js');
        const postcssPath = path.join(__dirname, '../frontend/postcss.config.js');

        if (fs.existsSync(tailwindPath)) {
            const tailwindContent = fs.readFileSync(tailwindPath, 'utf8');
            test('Tailwind config uses CommonJS', tailwindContent.includes('module.exports'), 'Should use module.exports not export default');
        }

        if (fs.existsSync(postcssPath)) {
            const postcssContent = fs.readFileSync(postcssPath, 'utf8');
            test('PostCSS config uses CommonJS', postcssContent.includes('module.exports'), 'Should use module.exports not export default');
        }
    } catch (error) {
        test('Config files check', false, error.message);
    }

    // ============================================
    // SUMMARY
    // ============================================
    section('DIAGNOSTIC SUMMARY');

    log(`Passed: ${passed}`, 'green');
    log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`Total:  ${passed + failed}`, 'cyan');

    if (failed === 0) {
        log('\n✅ ALL CHECKS PASSED!', 'green');
        log('\nQC Review submission should work properly.', 'green');
        log('\nNext steps:', 'cyan');
        log('1. Start backend: npm start', 'blue');
        log('2. Start frontend: npm run dev', 'blue');
        log('3. Test QC review submission', 'blue');
    } else {
        log('\n❌ SOME CHECKS FAILED', 'red');
        log('\nIssues found:', 'yellow');
        issues.forEach((issue, i) => {
            log(`${i + 1}. ${issue.test}`, 'yellow');
            if (issue.details) log(`   ${issue.details}`, 'yellow');
        });

        log('\nFix steps:', 'cyan');
        log('1. Review issues above', 'blue');
        log('2. Check backend logs', 'blue');
        log('3. Verify database integrity', 'blue');
        log('4. Restart both servers', 'blue');
        log('5. Run this script again', 'blue');
    }

    console.log('\n' + '='.repeat(60) + '\n');
    process.exit(failed > 0 ? 1 : 0);
})();
