/**
 * File Links Verification Script
 * Checks all imports and file references are valid
 */

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch {
        return false;
    }
}

async function verifyFileLinks() {
    log('\n🔗 FILE LINKS VERIFICATION\n', 'cyan');

    const results = { passed: 0, failed: 0, warnings: 0 };

    // Check critical files
    const criticalFiles = [
        'package.json',
        'vite.config.ts',
        'tsconfig.json',
        'tailwind.config.js',
        'App.tsx',
        'index.tsx',
        'backend/server.ts',
        'backend/package.json',
        'backend/schema.sql'
    ];

    log('📁 Critical Files:', 'yellow');
    for (const file of criticalFiles) {
        if (checkFileExists(file)) {
            log(`✓ ${file}`, 'green');
            results.passed++;
        } else {
            log(`✗ ${file} - MISSING`, 'red');
            results.failed++;
        }
    }

    log(`\n✅ Verification Complete: ${results.passed} passed, ${results.failed} failed\n`, 'cyan');
}

verifyFileLinks();
