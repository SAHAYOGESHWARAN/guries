/**
 * Comprehensive Test Suite for Duplication Fix
 * Tests campaigns, tasks, and other collections for duplicates
 */

const API_BASE_URL = 'http://localhost:3003/api/v1';

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    message: string;
    details?: any;
}

const results: TestResult[] = [];

async function apiCall(method: string, endpoint: string, body?: any) {
    try {
        const options: RequestInit = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error: any) {
        return { status: 0, error: error.message };
    }
}

// Test 1: Check Campaigns Endpoint
async function test1CheckCampaignsEndpoint() {
    console.log('\n📝 Test 1: Check Campaigns Endpoint');
    try {
        const result = await apiCall('GET', '/campaigns');
        
        if (result.status === 200 && Array.isArray(result.data)) {
            const campaigns = result.data;
            const uniqueIds = new Set(campaigns.map((c: any) => c.id));
            
            if (campaigns.length === uniqueIds.size) {
                results.push({
                    name: 'Campaigns Endpoint - No Duplicates',
                    status: 'PASS',
                    message: `All ${campaigns.length} campaigns are unique`,
                    details: { totalCampaigns: campaigns.length, uniqueCount: uniqueIds.size }
                });
            } else {
                results.push({
                    name: 'Campa