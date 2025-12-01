/**
 * Comprehensive Test Script for Marketing Control Center
 * Tests all API endpoints, pages, and realtime functionality
 */

import http from 'node:http';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:3001/api/v1';
const SOCKET_URL = 'http://localhost:3001';

// Test Results
const results = {
    passed: [],
    failed: [],
    warnings: []
};

// Helper function to make API requests
async function testEndpoint(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}${endpoint}`;
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Test Categories
async function testSystemEndpoints() {
    console.log('\n🔧 Testing System Endpoints...');
    
    try {
        const health = await testEndpoint('GET', '/health');
        if (health.status === 200) {
            results.passed.push('Health Check');
        } else {
            results.failed.push('Health Check');
        }
    } catch (e) {
        results.failed.push('Health Check - Connection failed');
    }

    try {
        const stats = await testEndpoint('GET', '/system/stats');
        if (stats.status === 200) {
            results.passed.push('System Stats');
        } else {
            results.failed.push('System Stats');
        }
    } catch (e) {
        results.failed.push('System Stats - Connection failed');
    }
}

async function testDashboardEndpoints() {
    console.log('\n📊 Testing Dashboard Endpoints...');
    
    const endpoints = [
        '/dashboard/stats',
        '/notifications',
        '/analytics/traffic',
        '/analytics/kpi',
        '/analytics/dashboard-metrics'
    ];

    for (const endpoint of endpoints) {
        try {
            const res = await testEndpoint('GET', endpoint);
            if (res.status === 200) {
                results.passed.push(`Dashboard: ${endpoint}`);
            } else {
                results.failed.push(`Dashboard: ${endpoint} (${res.status})`);
            }
        } catch (e) {
            results.failed.push(`Dashboard: ${endpoint} - ${e.message}`);
        }
    }
}

async function testCRUDEndpoints() {
    console.log('\n📝 Testing CRUD Endpoints...');
    
    const crudTests = [
        { name: 'Projects', endpoint: '/projects' },
        { name: 'Campaigns', endpoint: '/campaigns' },
        { name: 'Tasks', endpoint: '/tasks' },
        { name: 'Users', endpoint: '/users' },
        { name: 'Content', endpoint: '/content' },
        { name: 'Services', endpoint: '/services' },
        { name: 'Sub-Services', endpoint: '/sub-services' },
        { name: 'Assets', endpoint: '/assets' },
        { name: 'SMM Posts', endpoint: '/smm' },
        { name: 'Graphics', endpoint: '/graphics' },
        { name: 'Keywords', endpoint: '/keywords' },
        { name: 'Backlinks', endpoint: '/backlinks' },
        { name: 'Submissions', endpoint: '/submissions' },
        { name: 'URL Errors', endpoint: '/url-errors' },
        { name: 'Toxic Backlinks', endpoint: '/toxic-backlinks' },
        { name: 'UX Issues', endpoint: '/ux-issues' },
        { name: 'QC Runs', endpoint: '/qc-runs' },
        { name: 'QC Checklists', endpoint: '/qc-checklists' },
        { name: 'Teams', endpoint: '/teams' },
        { name: 'Competitors', endpoint: '/competitors' },
        { name: 'OKRs', endpoint: '/okrs' },
        { name: 'Gold Standards', endpoint: '/gold-standards' },
        { name: 'Effort Targets', endpoint: '/effort-targets' }
    ];

    for (const test of crudTests) {
        try {
            // Test GET
            const getRes = await testEndpoint('GET', test.endpoint);
            if (getRes.status === 200) {
                results.passed.push(`${test.name} - GET`);
            } else {
                results.failed.push(`${test.name} - GET (${getRes.status})`);
            }
        } catch (e) {
            results.failed.push(`${test.name} - GET: ${e.message}`);
        }
    }
}

async function testMasterTables() {
    console.log('\n⚙️ Testing Master Tables...');
    
    const masters = [
        '/industry-sectors',
        '/content-types',
        '/asset-types',
        '/platforms',
        '/countries',
        '/seo-errors',
        '/workflow-stages',
        '/roles',
        '/qc-weightage-configs'
    ];

    for (const endpoint of masters) {
        try {
            const res = await testEndpoint('GET', endpoint);
            if (res.status === 200) {
                results.passed.push(`Master: ${endpoint}`);
            } else {
                results.failed.push(`Master: ${endpoint} (${res.status})`);
            }
        } catch (e) {
            results.failed.push(`Master: ${endpoint}: ${e.message}`);
        }
    }
}

async function testHREndpoints() {
    console.log('\n👥 Testing HR Endpoints...');
    
    const hrEndpoints = [
        '/hr/workload',
        '/hr/rewards',
        '/hr/rankings',
        '/hr/skills',
        '/hr/achievements'
    ];

    for (const endpoint of hrEndpoints) {
        try {
            const res = await testEndpoint('GET', endpoint);
            if (res.status === 200) {
                results.passed.push(`HR: ${endpoint}`);
            } else {
                results.failed.push(`HR: ${endpoint} (${res.status})`);
            }
        } catch (e) {
            results.failed.push(`HR: ${endpoint}: ${e.message}`);
        }
    }
}

async function testCommunicationEndpoints() {
    console.log('\n💬 Testing Communication Endpoints...');
    
    const commEndpoints = [
        '/communication/emails',
        '/communication/voice-profiles',
        '/communication/calls',
        '/knowledge/articles',
        '/compliance/rules',
        '/compliance/audits'
    ];

    for (const endpoint of commEndpoints) {
        try {
            const res = await testEndpoint('GET', endpoint);
            if (res.status === 200) {
                results.passed.push(`Communication: ${endpoint}`);
            } else {
                results.failed.push(`Communication: ${endpoint} (${res.status})`);
            }
        } catch (e) {
            results.failed.push(`Communication: ${endpoint}: ${e.message}`);
        }
    }
}

async function testIntegrationsEndpoints() {
    console.log('\n🔌 Testing Integration Endpoints...');
    
    const intEndpoints = [
        '/integrations',
        '/logs',
        '/settings'
    ];

    for (const endpoint of intEndpoints) {
        try {
            const res = await testEndpoint('GET', endpoint);
            if (res.status === 200) {
                results.passed.push(`Integration: ${endpoint}`);
            } else {
                results.failed.push(`Integration: ${endpoint} (${res.status})`);
            }
        } catch (e) {
            results.failed.push(`Integration: ${endpoint}: ${e.message}`);
        }
    }
}

async function testSocketIO() {
    console.log('\n🔌 Testing Socket.IO Realtime...');
    
    return new Promise((resolve) => {
        const socket = io(SOCKET_URL, {
            reconnectionAttempts: 3,
            timeout: 5000
        });

        let connected = false;
        let eventsReceived = [];

        socket.on('connect', () => {
            connected = true;
            results.passed.push('Socket.IO - Connection');
            console.log('  ✓ Socket.IO connected');
            
            // Test room joining
            socket.emit('join_room', 'test-room');
            
            // Wait a bit for events
            setTimeout(() => {
                socket.disconnect();
                resolve();
            }, 2000);
        });

        socket.on('connect_error', (error) => {
            results.failed.push(`Socket.IO - Connection failed: ${error.message}`);
            resolve();
        });

        socket.on('disconnect', () => {
            if (connected) {
                results.passed.push('Socket.IO - Disconnection');
            }
        });

        // Listen for realtime events
        ['task_created', 'campaign_updated', 'content_created'].forEach(event => {
            socket.on(event, (data) => {
                eventsReceived.push(event);
                results.passed.push(`Socket.IO - Event: ${event}`);
            });
        });

        // Timeout after 5 seconds
        setTimeout(() => {
            if (!connected) {
                results.failed.push('Socket.IO - Connection timeout');
            }
            socket.disconnect();
            resolve();
        }, 5000);
    });
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Comprehensive Project Tests...\n');
    console.log('='.repeat(60));

    try {
        await testSystemEndpoints();
        await testDashboardEndpoints();
        await testCRUDEndpoints();
        await testMasterTables();
        await testHREndpoints();
        await testCommunicationEndpoints();
        await testIntegrationsEndpoints();
        await testSocketIO();
    } catch (error) {
        console.error('Test execution error:', error);
    }

    // Print Results
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 TEST RESULTS SUMMARY\n');
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⚠️  Warnings: ${results.warnings.length}`);

    if (results.failed.length > 0) {
        console.log('\n❌ FAILED TESTS:');
        results.failed.forEach(test => console.log(`   - ${test}`));
    }

    if (results.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        results.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\nTest Coverage: ${((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1)}%`);
}

// Run tests
runAllTests().catch(console.error);

