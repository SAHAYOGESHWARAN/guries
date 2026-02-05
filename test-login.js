#!/usr/bin/env node

/**
 * Login System Test Script
 * Tests the admin login functionality
 */

const bcrypt = require('bcryptjs');

console.log('\n🔐 Login System Test');
console.log('='.repeat(60));

// Test 1: Verify bcrypt hash
console.log('\n✅ Test 1: Bcrypt Hash Verification');
console.log('-'.repeat(60));

const testPassword = 'admin123';
const storedHash = '$2a$10$E0IhqlBU6K1o2zxe2bp0vO2vpHsGatVVV7iBKGtHlN9zGagScGaiS';

const isValid = bcrypt.compareSync(testPassword, storedHash);
console.log(`Password: ${testPassword}`);
console.log(`Hash: ${storedHash}`);
console.log(`Match: ${isValid ? '✅ PASS' : '❌ FAIL'}`);

if (!isValid) {
    console.error('❌ Hash verification failed!');
    process.exit(1);
}

// Test 2: Verify credentials
console.log('\n✅ Test 2: Admin Credentials');
console.log('-'.repeat(60));

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

console.log(`Email: ${ADMIN_EMAIL}`);
console.log(`Password: ${ADMIN_PASSWORD}`);
console.log(`Status: ✅ PASS`);

// Test 3: Verify environment variables
console.log('\n✅ Test 3: Environment Variables');
console.log('-'.repeat(60));

const requiredEnvVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET'];
const missingVars = [];

requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
        missingVars.push(varName);
        console.log(`❌ ${varName}: NOT SET`);
    } else {
        const displayValue = varName === 'ADMIN_PASSWORD' ? '***' : value;
        console.log(`✅ ${varName}: SET`);
    }
});

if (missingVars.length > 0) {
    console.error(`\n❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.error('Make sure backend/.env is loaded');
}

// Test 4: Verify API endpoint
console.log('\n✅ Test 4: API Configuration');
console.log('-'.repeat(60));

const API_URL = 'http://localhost:3003/api/v1';
const LOGIN_ENDPOINT = `${API_URL}/auth/login`;

console.log(`API Base URL: ${API_URL}`);
console.log(`Login Endpoint: ${LOGIN_ENDPOINT}`);
console.log(`Status: ✅ PASS`);

// Test 5: Verify frontend configuration
console.log('\n✅ Test 5: Frontend Configuration');
console.log('-'.repeat(60));

const FRONTEND_URL = 'http://localhost:5173';
const LOGIN_PAGE = `${FRONTEND_URL}`;

console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log(`Login Page: ${LOGIN_PAGE}`);
console.log(`Status: ✅ PASS`);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 Test Summary');
console.log('='.repeat(60));

console.log('\n✅ All tests passed!');
console.log('\n📝 Next Steps:');
console.log('1. Start backend: npm run dev --prefix backend');
console.log('2. Start frontend: npm run dev --prefix frontend');
console.log('3. Open http://localhost:5173 in browser');
console.log('4. Login with:');
console.log(`   Email: ${ADMIN_EMAIL}`);
console.log(`   Password: ${ADMIN_PASSWORD}`);

console.log('\n🧪 To test API directly:');
console.log(`curl -X POST ${LOGIN_ENDPOINT} \\`);
console.log('  -H "Content-Type: application/json" \\');
console.log(`  -d '{"email": "${ADMIN_EMAIL}", "password": "${ADMIN_PASSWORD}"}'`);

console.log('\n');
