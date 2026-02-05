#!/usr/bin/env node

/**
 * Industry/Sector Master - Comprehensive Test Suite
 * Tests all CRUD operations and field persistence
 */

const http = require('http');

const API_URL = 'http://localhost:3003/api/v1';
let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  testData: {}
};

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': '1',
        'X-User-Role': 'admin'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test 1: Fetch all industry sectors
async function testFetchAll() {
  console.log('\n📋 TEST 1: Fetch All Industry Sectors');
  try {
    const response = await makeRequest('GET', '/industry-sectors');
    
    if (response.status === 200 && Array.isArray(response.body)) {
      console.log('✅ PASS: Fetch all working');
      console.log(`   Found ${response.body.length} records`);
      testResults.passed++;
      return response.body;
    } else {
      throw new Error(`Status ${response.status}: ${JSON.stringify(response.body)}`);
    }
  } catch (error) {
    console.log('❌ FAIL: ' + error.message);
    testResults.failed++;
    testResults.errors.push('Fetch all failed');
    return [];
  }
}

// Test 2: Create industry sector with all fields
async function testCreate() {
  console.log('\n➕ TEST 2: Create Industry Sector with All Fields');