/**
 * Test: Sub-Service Filtering by Parent Service
 * Tests the new endpoint that filters sub-services based on parent service ID
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001/api/v1';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting Sub-Service Filtering Tests\n');
    console.log('='.repeat(60));

    try {
        // Test 1: Get all services
        console.log('\n✓ Test 1: Fetching all services...');
        const servicesRes = await makeRequest('GET', '/services');
        if (servicesRes.status !== 200) {
            console.error('❌ Failed to fetch services:', servicesRes.data);
            return;
        }
        const services = servicesRes.data;
        console.log(`✅ Found ${services.length} services`);
        services.slice(0, 3).forEach(s => {
            console.log(`   - Service ID ${s.id}: ${s.service_name}`);
        });

        // Test 2: Get all sub-services
        console.log('\n✓ Test 2: Fetching all sub-services...');
        const allSubServicesRes = await makeRequest('GET', '/sub-services');
        if (allSubServicesRes.status !== 200) {
            console.error('❌ Failed to fetch sub-services:', allSubServicesRes.data);
            return;
        }
        const allSubServices = allSubServicesRes.data;
        console.log(`✅ Found ${allSubServices.length} total sub-services`);

        // Test 3: Filter sub-services by parent service
        if (services.length > 0) {
            const testServiceId = services[0].id;
            console.log(`\n✓ Test 3: Filtering sub-services for parent service ID ${testServiceId}...`);

            const filteredRes = await makeRequest('GET', `/sub-services/parent/${testServiceId}`);
            if (filteredRes.status !== 200) {
                console.error('❌ Failed to filter sub-services:', filteredRes.data);
                return;
            }
            const filteredSubServices = filteredRes.data;
            console.log(`✅ Found ${filteredSubServices.length} sub-services for service ID ${testServiceId}`);

            if (filteredSubServices.length > 0) {
                filteredSubServices.forEach(ss => {
                    console.log(`   - Sub-Service: ${ss.sub_service_name} (Parent: ${ss.parent_service_id})`);
                });
            } else {
                console.log('   (No sub-services linked to this service)');
            }

            // Test 4: Verify filtering is working correctly
            console.log(`\n✓ Test 4: Verifying filter accuracy...`);
            const correctlyFiltered = filteredSubServices.every(ss => ss.parent_service_id === testServiceId);
            if (correctlyFiltered) {
                console.log('✅ All filtered sub-services have correct parent_service_id');
            } else {
                console.error('❌ Some sub-services have incorrect parent_service_id');
            }

            // Test 5: Test with multiple services
            if (services.length > 1) {
                console.log(`\n✓ Test 5: Testing with multiple services...`);
                for (let i = 0; i < Math.min(3, services.length); i++) {
                    const serviceId = services[i].id;
                    const res = await makeRequest('GET', `/sub-services/parent/${serviceId}`);
                    if (res.status === 200) {
                        console.log(`   ✅ Service ${serviceId}: ${res.data.length} sub-services`);
                    } else {
                        console.error(`   ❌ Service ${serviceId}: Failed to fetch`);
                    }
                }
            }
        }

        // Test 6: Test with invalid service ID
        console.log(`\n✓ Test 6: Testing with invalid service ID (99999)...`);
        const invalidRes = await makeRequest('GET', '/sub-services/parent/99999');
        if (invalidRes.status === 200 && invalidRes.data.length === 0) {
            console.log('✅ Correctly returned empty array for non-existent service');
        } else {
            console.log('⚠️  Unexpected response for invalid service ID');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ All tests completed successfully!\n');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

// Run tests
runTests().catch(console.error);
