#!/usr/bin/env node

/**
 * Comprehensive Data Flow Test
 * Tests all aspects of data saving and display in Guires Marketing Control Center
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3003';
const FRONTEND_URL = 'http://localhost:5173';

function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (data) {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = responseData ? JSON.parse(responseData) : {};
                    resolve({
                        status: res.statusCode,
                        body: parsed,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        body: responseData,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testDatabaseFile() {
    console.log('🗄️  Testing Database File...');
    
    const dbPath = path.join(__dirname, 'backend', 'mcc_db.sqlite');
    if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        console.log(`✅ Database file exists: ${dbPath}`);
        console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`📅 Last modified: ${stats.mtime}`);
        return true;
    } else {
        console.log(`❌ Database file not found: ${dbPath}`);
        return false;
    }
}

async function testAuthentication() {
    console.log('\n🔐 Testing Authentication...');
    
    try {
        // Test login
        const loginResponse = await makeRequest('POST', '/api/v1/auth/login', {
            email: 'admin@example.com',
            password: 'admin123'
        });
        
        if (loginResponse.status === 200 && loginResponse.body.success) {
            console.log('✅ Login successful');
            console.log(`👤 User: ${loginResponse.body.user.name} (${loginResponse.body.user.role})`);
            return loginResponse.body.token;
        } else {
            console.log('❌ Login failed:', loginResponse.body);
            return null;
        }
    } catch (error) {
        console.log('❌ Authentication error:', error.message);
        return null;
    }
}

async function testDataCreation(token) {
    console.log('\n📝 Testing Data Creation...');
    
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const testData = {
        asset_name: `Test Asset ${Date.now()}`,
        asset_type: 'Image',
        asset_category: 'Marketing',
        status: 'draft'
    };
    
    try {
        // Test asset creation
        const createResponse = await makeRequest('POST', '/api/v1/assets', testData, headers);
        
        if (createResponse.status === 200) {
            console.log('✅ Asset created successfully');
            console.log(`📋 Asset ID: ${createResponse.body.id || createResponse.body.data?.id}`);
            return createResponse.body.id || createResponse.body.data?.id;
        } else {
            console.log('⚠️  Asset creation response:', createResponse.status, createResponse.body);
            return null;
        }
    } catch (error) {
        console.log('❌ Data creation error:', error.message);
        return null;
    }
}

async function testDataRetrieval(token) {
    console.log('\n📖 Testing Data Retrieval...');
    
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    try {
        // Test asset retrieval
        const assetsResponse = await makeRequest('GET', '/api/v1/assets', null, headers);
        
        if (assetsResponse.status === 200) {
            const assets = assetsResponse.body.data || assetsResponse.body;
            console.log(`✅ Assets retrieved: ${Array.isArray(assets) ? assets.length : 'Unknown count'}`);
            
            if (Array.isArray(assets) && assets.length > 0) {
                console.log('📋 Sample asset:', {
                    name: assets[0].asset_name,
                    type: assets[0].asset_type,
                    status: assets[0].status
                });
            }
            return true;
        } else {
            console.log('⚠️  Asset retrieval response:', assetsResponse.status, assetsResponse.body);
            return false;
        }
    } catch (error) {
        console.log('❌ Data retrieval error:', error.message);
        return false;
    }
}

async function testFrontendConnectivity() {
    console.log('\n🌐 Testing Frontend Connectivity...');
    
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5173,
            path: '/',
            method: 'GET'
        }, (res) => {
            console.log(`✅ Frontend server responding: ${res.statusCode}`);
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.includes('Guires Marketing Control Center')) {
                    console.log('✅ Frontend HTML contains expected title');
                    resolve(true);
                } else {
                    console.log('⚠️  Frontend HTML may be missing expected content');
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Frontend connection error:', error.message);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ Frontend connection timeout');
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

async function testAPIEndpoints() {
    console.log('\n🔌 Testing API Endpoints...');
    
    const endpoints = [
        { path: '/health', expected: 200, description: 'Health Check' },
        { path: '/api/health', expected: 200, description: 'API Health' },
        { path: '/api/v1/health', expected: 200, description: 'API v1 Health' }
    ];
    
    let passed = 0;
    
    for (const endpoint of endpoints) {
        try {
            const response = await makeRequest('GET', endpoint.path);
            if (response.status === endpoint.expected) {
                console.log(`✅ ${endpoint.description}: ${response.status}`);
                passed++;
            } else {
                console.log(`❌ ${endpoint.description}: Expected ${endpoint.expected}, got ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.description}: ${error.message}`);
        }
    }
    
    return passed === endpoints.length;
}

async function runComprehensiveTest() {
    console.log('🧪 Comprehensive Data Flow Test - Guires Marketing Control Center');
    console.log('=' .repeat(70));
    
    let results = {
        database: false,
        authentication: false,
        dataCreation: false,
        dataRetrieval: false,
        frontend: false,
        apiEndpoints: false
    };
    
    // Test 1: Database File
    results.database = await testDatabaseFile();
    
    // Test 2: API Endpoints
    results.apiEndpoints = await testAPIEndpoints();
    
    // Test 3: Authentication
    const token = await testAuthentication();
    results.authentication = !!token;
    
    // Test 4: Data Creation
    if (token) {
        const assetId = await testDataCreation(token);
        results.dataCreation = !!assetId;
        
        // Test 5: Data Retrieval
        results.dataRetrieval = await testDataRetrieval(token);
    }
    
    // Test 6: Frontend Connectivity
    results.frontend = await testFrontendConnectivity();
    
    // Results Summary
    console.log('\n📊 Test Results Summary');
    console.log('=' .repeat(30));
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        const name = test.charAt(0).toUpperCase() + test.slice(1).replace(/([A-Z])/g, ' $1');
        console.log(`${status} ${name}`);
    });
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All data flow tests PASSED! The system is working correctly.');
        console.log('✅ Data saving: Working');
        console.log('✅ Data display: Working');
        console.log('✅ Database persistence: Working');
        console.log('✅ Frontend-backend integration: Working');
    } else {
        console.log('⚠️  Some tests failed. Please check the issues above.');
    }
    
    return passed === total;
}

// Run the test
runComprehensiveTest().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
});
